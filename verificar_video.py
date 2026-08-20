#!/usr/bin/env python3
"""
Control de calidad del VIDEO YA RENDERIZADO - CERO TOKENS, CERO IA.

Tercera capa de la fabrica de contenido. Las otras dos revisan
intenciones (lo que el guion DICE que va a pasar); esta revisa el
archivo .mp4 final, midiendo los pixeles y el audio que realmente
salieron:

  Capa 1  validar_hook.py          reglas de retencion sobre el guion
  Capa 2  dividir_voz_completo.py  alineacion de la voz con el texto
  Capa 3  verificar_video.py       <- ESTE: el resultado real
  Capa 4  producir_lote.py         corre la 3 sobre todo el lote

Chequeos (cada uno con su umbral explicito, ninguno "a ojo"):

  1. SINCRONIA A/V. La pista de audio y la de video tienen que durar
     casi lo mismo. Una diferencia grande = voz cortada al final o
     pantalla muda colgada.

  2. VOZ COMPLETA. Cada archivo de voz enganchado en el guion tiene
     que entrar en la duracion de su segmento. Si un clip dura mas que
     su segmento, esa frase se escucha cortada.

  3. PANTALLA MUERTA (el chequeo "anti-caida-de-dopamina"). Muestrea
     el video y mide cuanto cambia la imagen entre cuadros. Si pasan
     mas de MAX_QUIETO segundos sin cambio perceptible, el espectador
     desliza y se va. Este es el chequeo que atrapo el bug de la
     linea de tiempo que se completaba al 70% del segmento y dejaba
     2.3s de imagen congelada.

  4. PESO DEL ARCHIVO. Un video que se ve bien pero pesa 145 MB no se
     puede subir. Atrapo exactamente ese caso: modular el grano de
     fondo multiplicaba por 13 el tamano sin que se notara mirando
     los cuadros sueltos.

  5. FORMATO DE SALIDA. Vertical 9:16 y duracion razonable para el
     feed.

Uso:
    python3 verificar_video.py videos/01-no-dormir.mp4
    python3 verificar_video.py videos/01-no-dormir.mp4 guiones/01-no-dormir-con-voz.json
    python3 verificar_video.py --lote          (todos los de videos/)

Devuelve 1 si algun video tiene PROBLEMAS bloqueantes, 0 si no.
"""
import json
import subprocess
import sys
from pathlib import Path

# --- Umbrales (todos medidos, no inventados) ---
MAX_DESFASE_AV = 0.35     # segundos de diferencia entre pista de audio y video
MAX_QUIETO = 2.0          # segundos maximos de imagen sin cambio perceptible
UMBRAL_CAMBIO = 0.5       # diferencia media de pixel (0-255) que cuenta como
                           # "algo se movio". CALIBRADO sobre un video real
                           # midiendo toda la linea de tiempo: los tramos
                           # realmente congelados dan 0.03-0.35, y el cambio
                           # mas debil que existe (una linea de texto que
                           # aparece en un cuadro casi todo oscuro) ya da
                           # 0.72. 0.5 cae en el medio del hueco entre las
                           # dos poblaciones.
VENTANA_CAMBIO = 1.0      # contra cuanto tiempo atras se compara cada cuadro.
                           # Comparar contra el cuadro anterior (0.2s) daba
                           # FALSOS POSITIVOS: un revelado lento cambia poco
                           # entre cuadros vecinos pero el ojo igual lo ve.
FPS_MUESTREO = 5          # cuadros por segundo que se analizan
ANCHO_MUESTRA = 90        # se achica el cuadro para comparar rapido
MAX_MB = 60               # tope de peso razonable para subir a TikTok
MAX_DURACION = 60         # segundos
MIN_DURACION = 5


def ffprobe(args):
    r = subprocess.run(["ffprobe", "-v", "error"] + args,
                       capture_output=True, text=True)
    return r.stdout.strip()


def datos_video(path):
    dur_v = ffprobe(["-select_streams", "v:0", "-show_entries",
                     "stream=duration,width,height", "-of",
                     "default=noprint_wrappers=1:nokey=1", str(path)])
    dur_a = ffprobe(["-select_streams", "a:0", "-show_entries",
                     "stream=duration", "-of",
                     "default=noprint_wrappers=1:nokey=1", str(path)])
    partes = [x for x in dur_v.splitlines() if x]
    ancho = alto = dur_video = None
    for p in partes:
        try:
            v = float(p)
        except ValueError:
            continue
        if v > 1000:              # es una dimension, no una duracion
            if ancho is None:
                ancho = int(v)
            elif alto is None:
                alto = int(v)
        elif dur_video is None:
            dur_video = v
    if ancho is None or alto is None:
        wh = ffprobe(["-select_streams", "v:0", "-show_entries",
                      "stream=width,height", "-of", "csv=p=0", str(path)])
        try:
            ancho, alto = [int(x) for x in wh.split(",")[:2]]
        except ValueError:
            ancho = alto = 0
    try:
        dur_audio = float(dur_a)
    except ValueError:
        dur_audio = None
    if dur_video is None:
        f = ffprobe(["-show_entries", "format=duration", "-of", "csv=p=0",
                     str(path)])
        dur_video = float(f) if f else 0.0
    return dur_video, dur_audio, ancho, alto


def tramos_quietos(path, alto_muestra):
    """Devuelve los tramos (inicio, fin) donde la imagen no cambio mas
    que UMBRAL_CAMBIO durante mas de MAX_QUIETO segundos.

    Trabaja sobre bytes crudos en escala de grises que entrega ffmpeg
    (sin Pillow): asi el chequeo corre igual en un runner pelado."""
    cmd = ["ffmpeg", "-v", "error", "-i", str(path),
           "-vf", f"fps={FPS_MUESTREO},scale={ANCHO_MUESTRA}:{alto_muestra}",
           "-f", "image2pipe", "-pix_fmt", "gray", "-vcodec", "rawvideo", "-"]
    r = subprocess.run(cmd, capture_output=True)
    bruto = r.stdout
    tam = ANCHO_MUESTRA * alto_muestra
    n = len(bruto) // tam
    if n < 2:
        return [], 0

    cuadros = [bruto[i * tam:(i + 1) * tam] for i in range(n)]
    k = max(1, int(VENTANA_CAMBIO * FPS_MUESTREO))
    if n <= k:
        return [], n

    # estatico[i] = el cuadro i es (casi) igual al de VENTANA_CAMBIO
    # segundos antes, o sea que hace por lo menos ese rato que no pasa
    # nada perceptible en pantalla.
    estatico = []
    for i in range(k, n):
        a, b = cuadros[i - k], cuadros[i]
        # diferencia media absoluta byte a byte (gris 0-255), submuestreada
        dif = sum(abs(a[j] - b[j]) for j in range(0, tam, 3)) / (tam / 3)
        estatico.append((i / FPS_MUESTREO, dif < UMBRAL_CAMBIO))

    quietos = []
    ini = None
    for t, quieto in estatico + [(n / FPS_MUESTREO, False)]:
        if quieto and ini is None:
            ini = t
        elif not quieto and ini is not None:
            # el tramo muerto arranca VENTANA_CAMBIO antes del primer
            # cuadro marcado como estatico
            largo = (t - ini) + VENTANA_CAMBIO
            if largo > MAX_QUIETO:
                quietos.append((ini - VENTANA_CAMBIO, t))
            ini = None
    return quietos, n


def revisar(video_path, guion_path=None):
    video_path = Path(video_path)
    problemas, avisos = [], []
    if not video_path.exists():
        return [f"No existe {video_path}"], []

    dur_v, dur_a, ancho, alto = datos_video(video_path)
    mb = video_path.stat().st_size / (1024 * 1024)

    # 1. Sincronia A/V
    if dur_a is None:
        problemas.append("El video no tiene pista de audio.")
    else:
        desfase = abs(dur_v - dur_a)
        if desfase > MAX_DESFASE_AV:
            problemas.append(
                f"Audio y video no duran lo mismo: video {dur_v:.2f}s vs "
                f"audio {dur_a:.2f}s (desfase {desfase:.2f}s, maximo "
                f"{MAX_DESFASE_AV}s). Se corta la voz o queda pantalla muda.")

    # 2. Cada voz entra en su segmento
    if guion_path and Path(guion_path).exists():
        cfg = json.loads(Path(guion_path).read_text(encoding="utf-8"))
        for i, seg in enumerate(cfg.get("segmentos", [])):
            va = seg.get("voz_archivo")
            if not va or not Path(va).exists():
                continue
            d_voz = ffprobe(["-show_entries", "format=duration", "-of",
                             "csv=p=0", va])
            try:
                d_voz = float(d_voz)
            except ValueError:
                continue
            d_seg = seg.get("duracion", 0)
            if d_voz > d_seg + 0.05:
                problemas.append(
                    f"Segmento {i}: la voz dura {d_voz:.2f}s pero el segmento "
                    f"{d_seg:.2f}s -- la frase se escucha cortada.")

    # 3. Pantalla muerta
    alto_muestra = int(ANCHO_MUESTRA * (alto / ancho)) if ancho else 160
    alto_muestra += alto_muestra % 2
    quietos, n_cuadros = tramos_quietos(video_path, alto_muestra)
    for ini, fin in quietos:
        problemas.append(
            f"Pantalla quieta {fin - ini:.1f}s (de {ini:.1f}s a {fin:.1f}s). "
            f"El maximo sin que pase nada es {MAX_QUIETO}s -- mas que eso y "
            f"el espectador desliza.")

    # 4. Peso
    if mb > MAX_MB:
        problemas.append(
            f"El archivo pesa {mb:.0f} MB (maximo {MAX_MB} MB). Revisar si "
            f"alguna capa de ruido/grano esta disparando el bitrate.")

    # 5. Formato
    if ancho and alto:
        proporcion = alto / ancho
        if abs(proporcion - 16 / 9) > 0.05:
            avisos.append(
                f"Proporcion {ancho}x{alto} (no es 9:16 vertical).")
    if dur_v > MAX_DURACION:
        avisos.append(f"Dura {dur_v:.0f}s (mas de {MAX_DURACION}s).")
    elif dur_v < MIN_DURACION:
        avisos.append(f"Dura solo {dur_v:.0f}s.")

    return problemas, avisos


def informe(video_path, guion_path=None):
    problemas, avisos = revisar(video_path, guion_path)
    nombre = Path(video_path).name
    if problemas:
        print(f"\n[X] {nombre}")
        for p in problemas:
            print(f"    PROBLEMA: {p}")
    elif avisos:
        print(f"\n[!] {nombre}")
    else:
        print(f"[OK] {nombre}")
    for a in avisos:
        print(f"    aviso: {a}")
    return len(problemas)


def main():
    args = [a for a in sys.argv[1:]]
    if not args:
        print(__doc__)
        return 1

    if args[0] == "--lote":
        raiz = Path(__file__).parent
        videos = sorted((raiz / "videos").glob("*.mp4"))
        if not videos:
            print("No hay videos en videos/")
            return 1
        fallidos = 0
        for v in videos:
            stem = v.stem
            guion = raiz / "guiones" / f"{stem}.json"
            if not guion.exists():
                guion = raiz / "guiones" / f"{stem}-con-voz.json"
            fallidos += 1 if informe(v, guion if guion.exists() else None) else 0
        print(f"\n=== {len(videos) - fallidos}/{len(videos)} videos limpios ===")
        return 1 if fallidos else 0

    guion = args[1] if len(args) > 1 else None
    return 1 if informe(args[0], guion) else 0


if __name__ == "__main__":
    sys.exit(main())
