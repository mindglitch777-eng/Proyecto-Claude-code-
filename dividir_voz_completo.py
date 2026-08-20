#!/usr/bin/env python3
"""
Corta UN audio combinado (todas las lineas de narracion de todos los
guiones, generado de una sola vez en ElevenLabs a partir de
capturas_voz/texto_voz_completo.txt) en los archivos individuales
<stem>-vozN.mp3 que sincronizar_voz.py espera -- CERO TOKENS.

Detecta los cortes por silencio (cada linea del texto combinado esta
separada por un parrafo en blanco, que ElevenLabs convierte en una
pausa audible). La cantidad de segmentos de habla encontrados tiene
que coincidir exactamente con las entradas de manifest_voz_completo.json;
si no coincide, no escribe nada y muestra el detalle para poder ajustar
los parametros de silencio y reintentar.

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
DURACION_MIN = 0.35  # segundos de silencio para contar como corte
PADDING = 0.06  # margen que se deja pegado a cada lado del corte


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
    return list(zip(starts, ends)), duracion_total


def segmentos_de_habla(silencios, duracion_total):
    puntos = [0.0]
    for s_ini, s_fin in silencios:
        puntos.append(s_ini)
        puntos.append(s_fin)
    puntos.append(duracion_total)
    segmentos = []
    for i in range(0, len(puntos), 2):
        ini, fin = puntos[i], puntos[i + 1]
        if fin - ini > 0.08:  # descarta huecos vacios (silencio pegado a silencio)
            segmentos.append((ini, fin))
    return segmentos


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        return 1
    audio_path = Path(sys.argv[1])
    manifest_path = Path(sys.argv[2])
    carpeta_salida = Path(sys.argv[3])
    carpeta_salida.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    silencios, duracion_total = detectar_silencios(audio_path)
    segmentos = segmentos_de_habla(silencios, duracion_total)

    print(f"Lineas esperadas (manifest): {len(manifest)}")
    print(f"Segmentos de habla detectados: {len(segmentos)}")

    if len(segmentos) != len(manifest):
        print("\nNO COINCIDE. No se escribio ningun archivo.")
        print("Duraciones de cada segmento detectado (revisa si alguno es "
              "sospechosamente corto/largo -- puede ser una linea partida al "
              "medio por una pausa de coma, o dos lineas pegadas):")
        for i, (ini, fin) in enumerate(segmentos):
            print(f"  [{i}] {ini:.2f}s -> {fin:.2f}s  (dur {fin - ini:.2f}s)")
        print(f"\nProba ajustar RUIDO_DB (actual {RUIDO_DB}) o DURACION_MIN "
              f"(actual {DURACION_MIN}) arriba en este script y correlo de nuevo.")
        return 1

    for (ini, fin), m in zip(segmentos, manifest):
        ini_pad = max(0.0, ini - PADDING)
        fin_pad = min(duracion_total, fin + PADDING)
        destino = carpeta_salida / f"{m['stem']}-voz{m['index']}.mp3"
        cmd = [
            "ffmpeg", "-y", "-i", str(audio_path),
            "-ss", f"{ini_pad:.3f}", "-to", f"{fin_pad:.3f}",
            "-af", "afade=t=in:d=0.03,afade=t=out:st=" + f"{fin_pad - ini_pad - 0.03:.3f}" + ":d=0.03",
            "-ar", "44100", "-ac", "1", "-b:a", "128k",
            str(destino),
        ]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"ERROR cortando {destino}:\n{r.stderr[-800:]}")
            return 1

    print(f"\nOK: {len(manifest)} archivos escritos en {carpeta_salida}/")
    print("Ahora correr sincronizar_voz.py para cada guion.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
