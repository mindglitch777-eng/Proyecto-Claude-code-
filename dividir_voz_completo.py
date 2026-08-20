#!/usr/bin/env python3
"""
Corta UN audio combinado (todas las lineas de narracion de todos los
guiones, generado de una sola vez en ElevenLabs a partir de
capturas_voz/texto_voz_completo.txt) en los archivos individuales
<stem>-vozN.mp3 que sincronizar_voz.py espera -- CERO TOKENS.

POR QUE NO ALCANZA UN CORTE POR SILENCIO SIMPLE
-----------------------------------------------
Habla real (no sintetica) mete pausas en comas, puntos internos y
respiraciones, no solo entre lineas. Medido sobre el audio real: 300
silencios detectados para 105 lineas (se necesitan 104 cortes), y NO
existe un umbral de duracion que los separe -- 0.50s deja 81 (pocos),
0.45s deja 124 (demasiados). El silencio solo es ambiguo.

COMO SE RESUELVE
----------------
Alineacion optima por programacion dinamica. Elige los 104 cortes de
entre TODOS los silencios candidatos minimizando el costo global:

  costo = suma[(duracion_real - duracion_esperada)^2] - BONUS*(largo_silencio)

donde 'duracion_esperada' viene de la proporcion de caracteres de cada
linea sobre el total (misma voz = ritmo de habla parejo), y el BONUS
premia cortar en las pausas mas largas. Garantiza cortes en ORDEN
ESTRICTO (una busqueda voraz no lo garantiza) y el optimo global, no
una decision local.

El peso BONUS=2.0 salio de un barrido medido contra el audio real:
valores mas altos hacen que el corte caiga en la pausa de un punto
interno de la linea (ej. "Una cosa que no dijiste. | La unica que
importaba") en vez del final real; valores mas bajos ignoran las
pausas verdaderas. 2.0 fue el unico rango con CERO lineas fuera de
ritmo.

AUTOVERIFICACION
----------------
Al terminar reporta la consistencia de chars/segundo por linea: si un
corte quedara mal puesto, esa linea aparece con un ritmo de habla
imposible (muy rapido o muy lento) y se marca como sospechosa. Todos
los cortes caen SIEMPRE dentro de un silencio detectado, asi que nunca
se parte una palabra al medio.

Uso:
    python3 dividir_voz_completo.py capturas_voz/voz_completa.mp3 \
        capturas_voz/manifest_voz_completo.json capturas_voz/

    (despues, por cada guion: python3 sincronizar_voz.py guiones/X.json capturas_voz/)
"""
import json
import re
import subprocess
import sys
from pathlib import Path

RUIDO_DB = "-30dB"
DURACION_MIN = 0.12   # umbral bajo a proposito: junta TODOS los
                       # silencios como candidatos; la DP elige cuales
                       # son separadores de linea de verdad
BONUS_SILENCIO = 2.0  # peso de preferir pausas largas (ver docstring)
REF_SILENCIO = 0.45   # largo de referencia de una pausa entre lineas
DUR_MINIMA = 0.15     # ningun segmento puede durar menos que esto
PADDING = 0.06        # margen que se deja pegado a cada lado del corte
INF = float("inf")


UMBRAL_MUDO = -60.0  # dB. Un clip con voz real ronda -20 dB; el
                      # silencio digital da -91 dB.


def volumen_medio(path):
    """Volumen medio en dB del archivo. Sirve para detectar un clip que
    salio MUDO: un corte mal hecho dura lo mismo que uno bueno, asi que
    medir la duracion no alcanza -- hay que medir el sonido."""
    r = subprocess.run(
        ["ffmpeg", "-i", str(path), "-af", "volumedetect", "-f", "null",
         "/dev/null"], capture_output=True, text=True)
    m = re.search(r"mean_volume:\s*(-?[\d.]+) dB", r.stderr)
    return float(m.group(1)) if m else -999.0


def detectar_silencios(audio_path):
    cmd = [
        "ffmpeg", "-i", str(audio_path),
        "-af", f"silencedetect=noise={RUIDO_DB}:d={DURACION_MIN}",
        "-f", "null", "-",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    salida = r.stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", salida)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", salida)]
    dur_match = re.search(r"Duration: (\d+):(\d+):([\d.]+)", salida)
    if not dur_match:
        raise RuntimeError("No pude leer la duracion del audio:\n" + salida[-2000:])
    h, m, s = dur_match.groups()
    duracion_total = int(h) * 3600 + int(m) * 60 + float(s)
    # (punto de corte = medio del silencio, largo del silencio)
    candidatos = [((a + b) / 2.0, b - a) for a, b in zip(starts, ends)]
    return candidatos, duracion_total


def alinear(candidatos, esperado, duracion_total):
    """Programacion dinamica: elige len(esperado)-1 cortes en orden
    estricto minimizando el costo descripto en el docstring."""
    n = len(esperado)
    m = len(candidatos)
    if m < n - 1:
        raise RuntimeError(
            f"Solo {m} silencios candidatos para {n} lineas: hacen falta al "
            f"menos {n - 1}. Bajar DURACION_MIN o revisar que el audio "
            f"corresponda a este manifest.")

    dp_prev = [INF] * m
    back = [[-1] * m for _ in range(n)]
    for j, (pj, sj) in enumerate(candidatos):
        if pj <= DUR_MINIMA:
            continue
        dp_prev[j] = (pj - esperado[0]) ** 2 - BONUS_SILENCIO * (sj - REF_SILENCIO)

    for i in range(1, n - 1):
        dp_cur = [INF] * m
        for j in range(m):
            pj, sj = candidatos[j]
            mejor, bk = INF, -1
            for k in range(j):
                if dp_prev[k] == INF:
                    continue
                d = pj - candidatos[k][0]
                if d <= DUR_MINIMA:
                    continue
                c = dp_prev[k] + (d - esperado[i]) ** 2
                if c < mejor:
                    mejor, bk = c, k
            if bk >= 0:
                dp_cur[j] = mejor - BONUS_SILENCIO * (sj - REF_SILENCIO)
                back[i][j] = bk
        dp_prev = dp_cur

    mejor, bj = INF, -1
    for j, (pj, _) in enumerate(candidatos):
        if dp_prev[j] == INF:
            continue
        d = duracion_total - pj
        if d <= DUR_MINIMA:
            continue
        c = dp_prev[j] + (d - esperado[n - 1]) ** 2
        if c < mejor:
            mejor, bj = c, j
    if bj < 0:
        raise RuntimeError("No se encontro ninguna alineacion valida.")

    j, idxs = bj, []
    for i in range(n - 2, 0, -1):
        idxs.append(j)
        j = back[i][j]
    idxs.append(j)
    idxs.reverse()
    return [candidatos[x][0] for x in idxs]


def verificar(manifest, durs):
    """Chequeo de cordura: con una sola voz, chars/segundo tiene que ser
    parejo. Una linea muy fuera de rango delata un corte mal puesto."""
    tasas = [len(m["texto"]) / d for m, d in zip(manifest, durs)]
    prom = sum(tasas) / len(tasas)
    sospechosas = [(i, t) for i, t in enumerate(tasas)
                   if t < prom * 0.55 or t > prom * 1.6]
    return tasas, prom, sospechosas


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        return 1
    audio_path = Path(sys.argv[1])
    manifest_path = Path(sys.argv[2])
    carpeta_salida = Path(sys.argv[3])
    carpeta_salida.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    candidatos, duracion_total = detectar_silencios(audio_path)
    chars = [max(1, len(m["texto"])) for m in manifest]
    total_chars = sum(chars)
    esperado = [c / total_chars * duracion_total for c in chars]

    print(f"Lineas en el manifest: {len(manifest)}")
    print(f"Silencios candidatos: {len(candidatos)}")
    print(f"Duracion del audio: {duracion_total:.2f}s")

    cortes = alinear(candidatos, esperado, duracion_total)
    if not all(cortes[i] < cortes[i + 1] for i in range(len(cortes) - 1)):
        print("ERROR: los cortes no quedaron en orden. No se escribio nada.")
        return 1

    puntos = [0.0] + cortes + [duracion_total]
    segmentos = list(zip(puntos, puntos[1:]))
    durs = [b - a for a, b in segmentos]

    tasas, prom, sospechosas = verificar(manifest, durs)
    print(f"\nRitmo de habla: {prom:.1f} chars/seg "
          f"(min {min(tasas):.1f} / max {max(tasas):.1f})")
    if sospechosas:
        print(f"AVISO: {len(sospechosas)} linea(s) con ritmo fuera de lo "
              f"normal -- revisar estos cortes a oido antes de renderizar:")
        for i, t in sospechosas:
            m = manifest[i]
            print(f"  [{i}] {t:.1f} ch/s ({durs[i]:.2f}s) "
                  f"{m['stem']}-voz{m['index']}: {m['texto'][:60]!r}")
    else:
        print("OK: ninguna linea con ritmo sospechoso "
              "(todos los cortes caen donde corresponde).")

    mudos = []
    for (ini, fin), m in zip(segmentos, manifest):
        ini_pad = max(0.0, ini - PADDING)
        fin_pad = min(duracion_total, fin + PADDING)
        largo = fin_pad - ini_pad
        destino = carpeta_salida / f"{m['stem']}-voz{m['index']}.mp3"
        # -ss ANTES de -i (busqueda de entrada): reinicia los tiempos a
        # cero en el clip resultante. Con -ss DESPUES de -i los tiempos
        # originales se conservan, y entonces 'afade=t=out:st=3' se
        # disparaba de entrada en un clip que empieza en el segundo 190
        # -> el clip entero salia EN SILENCIO. Solo el primer corte (que
        # arranca en 0) sonaba. Este bug hizo que 27 videos se
        # renderizaran mudos sin que nada avisara.
        cmd = [
            "ffmpeg", "-y", "-ss", f"{ini_pad:.3f}", "-i", str(audio_path),
            "-t", f"{largo:.3f}",
            "-af", f"afade=t=in:d=0.03,afade=t=out:st={largo - 0.03:.3f}:d=0.03",
            "-ar", "44100", "-ac", "1", "-b:a", "128k",
            str(destino),
        ]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"ERROR cortando {destino}:\n{r.stderr[-800:]}")
            return 1
        if volumen_medio(destino) < UMBRAL_MUDO:
            mudos.append(destino.name)

    if mudos:
        print(f"\nERROR: {len(mudos)} de {len(manifest)} clips salieron MUDOS.")
        for x in mudos[:8]:
            print(f"  - {x}")
        print("No uses estos audios: revisa el corte antes de renderizar.")
        return 1

    print(f"\nOK: {len(manifest)} archivos escritos en {carpeta_salida}/")
    print(f"Todos con sonido real (ninguno por debajo de {UMBRAL_MUDO} dB).")
    print("Ahora correr sincronizar_voz.py para cada guion.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
