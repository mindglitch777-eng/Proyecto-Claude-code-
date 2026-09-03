#!/usr/bin/env python3
"""
R7-31 (prompt "que la fabrica piense la edicion"): detecta pausas
REALES de voz dentro de un clip de audio individual, usando la MISMA
tecnica ya probada en fabrica/qa/checks_duros.py (_detectar_silencios,
ffmpeg silencedetect) -- pero con un umbral distinto, tuneado para
encontrar micro-pausas de habla (no "silencio sospechoso" de todo un
video). Motivo real: las unidades de UN solo clip de audio (ej.
"aceleracion", "pausa", "desarrollo2" en el guion de demo_07/08) no
tenian NINGUN punto interno donde anclar un microevento -- la regla
dura del proyecto es no inventar timings, asi que la unica salida
honesta es medir un punto real, no calcular una fraccion arbitraria de
la duracion total.

Uso:
    python3 fabrica/composicion/detectar_pausas.py audio.wav

Devuelve JSON por stdout: {"pausas": [{"inicio":.., "fin":.., "duracion":..}]}
Lista vacia si no se detecto ninguna pausa real (nunca inventa una).
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

UMBRAL_DB = "-30dB"  # mas sensible que el -35dB de checks_duros.py: acá buscamos
                      # micro-pausas de respiracion/puntuacion, no silencio sospechoso.
DURACION_MIN_SEG = 0.12  # una coma/respiracion real suele durar >=120ms


def detectar_pausas(archivo: Path, umbral_db: str = UMBRAL_DB, duracion_min: float = DURACION_MIN_SEG) -> list[dict]:
    if not archivo.exists():
        return []
    r = subprocess.run(
        ["ffmpeg", "-i", str(archivo), "-af",
         f"silencedetect=noise={umbral_db}:d={duracion_min}", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    salida = r.stderr
    inicios = [float(m) for m in re.findall(r"silence_start:\s*([\d.]+)", salida)]
    fines_dur = re.findall(r"silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)", salida)
    pausas = []
    for i, (fin, dur) in enumerate(fines_dur):
        inicio = inicios[i] if i < len(inicios) else float(fin) - float(dur)
        pausas.append({"inicio": round(inicio, 3), "fin": round(float(fin), 3), "duracion": round(float(dur), 3)})
    return pausas


def main() -> int:
    if len(sys.argv) != 2:
        print(json.dumps({"pausas": [], "error": "uso: detectar_pausas.py <archivo.wav>"}))
        return 1
    archivo = Path(sys.argv[1])
    pausas = detectar_pausas(archivo)
    print(json.dumps({"pausas": pausas}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
