#!/usr/bin/env python3
"""
Voz con Piper (libre, gratis, ilimitada) + cadena de realce para que
suene a persona y no a GPS.

POR QUE ESTO Y NO ELEVENLABS
    ElevenLabs suena mejor, pero el plan gratis se agota enseguida y
    rotar cuentas para esquivar la cuota va contra sus terminos y
    termina en baneo -- justo cuando ya tenes el flujo armado encima.
    Piper corre dentro del runner, no tiene cuenta ni cuota, y con la
    cadena de realce de abajo queda bastante mas cerca de lo que uno
    espera. Cuando entre plata se paga el plan y se cambia el motor
    sin tocar el resto del sistema.

POR QUE SUENA A ROBOT PIPER CRUDO (y como se arregla)
    1. Va demasiado rapido. Un tipo seguro habla lento. Se baja la
       velocidad con --length-scale.
    2. Le falta cuerpo. La voz sintetica sale fina y plana, sin la
       compresion ni el tono de pecho que tiene cualquier voz grabada
       cerca de un microfono. Eso lo arregla la cadena de ffmpeg:
       bajar el tono, comprimir, levantar pecho y presencia, sacar el
       barro de los 250 Hz.

LOS MODELOS NO SE COMMITEAN. Pesan ~60 MB cada uno y el proyecto
prohibe meter .onnx en el repo: se bajan al vuelo en el runner.

Uso:
    python3 voz_piper.py probar "Frase de prueba"
    python3 voz_piper.py decir es_MX-ald-medium "Texto" salida.wav
"""
import subprocess
import sys
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).parent
MODELOS = RAIZ / "modelos_voz"
BASE_HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main"

# Solo voces MASCULINAS de calidad 'medium'. Las 'low' (mls_*) suenan
# claramente peor y no vale la pena probarlas. Decision del operador:
# una voz grave de tipo que sabe de plata convierte distinto que una
# voz femenina -- por eso se saca es_AR-daniela-high, que era la que
# venia por defecto.
VOCES = {
    # neutro latinoamericano: le habla a toda LatAm sin sonar de España
    "es_MX-ald-medium": "es/es_MX/ald/medium",
    # el mas usado como voz principal en español
    "es_ES-davefx-medium": "es/es_ES/davefx/medium",
    "es_ES-sharvard-medium": "es/es_ES/sharvard/medium",
}

VOZ_POR_DEFECTO = "es_MX-ald-medium"

# >1 = mas lento. 1.12 es como un 11% mas pausado: deja de sonar
# apurado y empieza a sonar deliberado.
VELOCIDAD = 1.12

# Cadena de realce "empresario". Cada eslabon esta por una razon:
#   asetrate+atempo  bajar 2 semitonos sin cambiar la duracion
#                    (asetrate baja tono Y velocidad; atempo devuelve
#                     la velocidad y deja el tono abajo)
#   highpass         saca el retumbe inaudible que solo come bitrate
#   250 Hz  -3       el "barro" que emborrona las consonantes
#   110 Hz  +2.5     pecho: es lo que da autoridad
#   4 kHz   +3       presencia: es lo que hace que se entienda en un
#                    celular con el audio bajo
#   7 kHz   -2       de-esser pobre, contra las eses silbadas
#   acompressor      la voz "pegada al microfono" de podcast
#   loudnorm         -14 LUFS, que es lo que piden las redes
SEMITONOS = -2
_F = 2 ** (SEMITONOS / 12)
CADENA = (
    f"asetrate=22050*{_F:.5f},aresample=22050,atempo={1/_F:.5f},"
    "highpass=f=70,"
    "equalizer=f=250:width_type=q:w=1:g=-3,"
    "equalizer=f=110:width_type=q:w=1:g=2.5,"
    "equalizer=f=4000:width_type=q:w=1.2:g=3,"
    "equalizer=f=7000:width_type=q:w=1.5:g=-2,"
    "acompressor=threshold=-18dB:ratio=3:attack=8:release=180:makeup=2,"
    "loudnorm=I=-14:TP=-1.5:LRA=11"
)


def asegurar_modelo(nombre):
    """Baja el .onnx y su .json si no estan. Devuelve la ruta al onnx."""
    if nombre not in VOCES:
        raise SystemExit(f"Voz desconocida: {nombre}. Hay: {list(VOCES)}")
    MODELOS.mkdir(exist_ok=True)
    onnx = MODELOS / f"{nombre}.onnx"
    meta = MODELOS / f"{nombre}.onnx.json"
    carpeta = VOCES[nombre]
    for destino, sufijo in ((onnx, ".onnx"), (meta, ".onnx.json")):
        if destino.exists() and destino.stat().st_size > 1000:
            continue
        url = f"{BASE_HF}/{carpeta}/{nombre}{sufijo}"
        print(f"  bajando {destino.name}...")
        pedido = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (compatible; FabricaContenido/1.0)"})
        with urllib.request.urlopen(pedido, timeout=300) as r, open(destino, "wb") as f:
            f.write(r.read())
    return onnx


def sintetizar(texto, nombre, destino, velocidad=VELOCIDAD):
    """Voz cruda de Piper, sin realce. Devuelve True si salio."""
    onnx = asegurar_modelo(nombre)
    base = [sys.executable, "-m", "piper", "-m", str(onnx), "-f", str(destino)]
    # La bandera de velocidad cambio de nombre entre versiones de
    # piper; si la rechaza se reintenta sin ella antes de darse por
    # vencido (mejor una voz apurada que ninguna voz).
    for extra in (["--length-scale", str(velocidad)], []):
        r = subprocess.run(base + extra, input=texto, capture_output=True,
                           text=True, timeout=300)
        if r.returncode == 0 and Path(destino).exists():
            return True
    print(f"  ERROR piper ({nombre}): {r.stderr[:200]}")
    return False


def realzar(entrada, salida):
    """Aplica la cadena de realce. Devuelve True si salio."""
    r = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(entrada),
         "-af", CADENA, "-ar", "44100", str(salida)],
        capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  ERROR realce: {r.stderr[:200]}")
        return False
    return True


def decir(texto, nombre=VOZ_POR_DEFECTO, salida=None, realce=True):
    """Voz lista para usar: sintetiza y realza. Devuelve la ruta."""
    salida = Path(salida or "voz.wav")
    crudo = salida.with_name(salida.stem + "_crudo.wav")
    if not sintetizar(texto, nombre, crudo):
        return None
    if not realce:
        crudo.replace(salida)
        return salida
    if not realzar(crudo, salida):
        crudo.replace(salida)
        return salida
    crudo.unlink(missing_ok=True)
    return salida


def probar(texto):
    """Rinde la misma frase con las tres voces, cruda y realzada, para
    poder comparar de oido cual suena a empresario."""
    destino = RAIZ / "muestras_voz"
    destino.mkdir(exist_ok=True)
    hechos = []
    for nombre in VOCES:
        print(f"[{nombre}]")
        crudo = destino / f"{nombre}-CRUDO.wav"
        if not sintetizar(texto, nombre, crudo):
            continue
        realzada = destino / f"{nombre}-REALZADA.wav"
        realzar(crudo, realzada)
        # a mp3 para poder escucharlas desde el celular sin bajar wavs
        for w in (crudo, realzada):
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(w),
                            "-b:a", "128k", str(w.with_suffix(".mp3"))],
                           capture_output=True)
            w.unlink(missing_ok=True)
            hechos.append(w.with_suffix(".mp3").name)
    (destino / "LEEME.md").write_text(
        "# Muestras de voz\n\nMisma frase con las tres voces masculinas de "
        "Piper.\n\n- `-CRUDO` = Piper tal cual sale.\n- `-REALZADA` = con la "
        "cadena de voz_piper.py (tono -2 semitonos, compresion, pecho y "
        "presencia).\n\nFrase:\n\n> " + texto + "\n\nArchivos:\n\n"
        + "\n".join(f"- `{h}`" for h in sorted(hechos)) + "\n",
        encoding="utf-8")
    print(f"\n{len(hechos)} muestras en {destino}")


def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        return 0
    if a[0] == "probar":
        probar(a[1] if len(a) > 1 else
               "El barbero que más gana de tu barrio no corta mejor que vos. "
               "Cobra distinto.")
        return 0
    if a[0] == "decir":
        decir(a[2], a[1], a[3] if len(a) > 3 else "voz.wav")
        return 0
    print(__doc__)
    return 0


if __name__ == "__main__":
    sys.exit(main())
