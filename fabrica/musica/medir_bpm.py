#!/usr/bin/env python3
"""
R7-26: mide el BPM real de cada track de biblioteca.json con librosa
(beat tracking por onset-strength + programacion dinamica, metodo
estandar de la libreria, no un numero tipeado a mano). Motivado por la
skill real `beat-sync-editing` de iart-ai/motion-design-skills (MIT,
ver fabrica/skills/registro.ts): cortar/transicionar sincronizado al
BPM real de la musica de fondo es una tecnica real que hoy la fabrica
no usa (bpm quedaba en null desde R7-22).

Limitacion real y conocida de la deteccion automatica de tempo: puede
confundir el doble o la mitad del tempo real ("octave error") --
`aceleracion-planificando` midio 178.2 BPM, un valor alto pero
plausible para un track "en movimiento"; no se pudo verificar contra
el tempo real de oido (el operador puede confirmar escuchando si
alguna vez se usa BPM para algo audible).

Uso:
    python3 fabrica/musica/medir_bpm.py            (mide todo, no escribe nada)
    python3 fabrica/musica/medir_bpm.py --escribir  (actualiza biblioteca.json)
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
BIBLIOTECA_JSON = RAIZ / "biblioteca.json"
BIBLIOTECA_DIR = RAIZ / "biblioteca"


def medir_bpm(ruta_mp3: Path) -> float:
    import librosa  # import perezoso: no todo el proyecto necesita esta dependencia

    y, sr = librosa.load(str(ruta_mp3), sr=None, mono=True)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    # Versiones recientes de librosa devuelven un array de 1 elemento
    # en vez de un escalar -- tomar el primer valor real, no asumir.
    valor = tempo[0] if hasattr(tempo, '__len__') else tempo
    return round(float(valor), 1)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--escribir", action="store_true", help="actualiza biblioteca.json con los BPM medidos")
    args = ap.parse_args()

    biblioteca = json.loads(BIBLIOTECA_JSON.read_text(encoding="utf-8"))
    for track in biblioteca:
        ruta = RAIZ / track["archivo"]
        if not ruta.exists():
            print(f"FALTANTE: {track['id']} -- {ruta} no existe")
            continue
        bpm = medir_bpm(ruta)
        print(f"{track['id']}: {bpm} BPM (guardado: {track.get('bpm')})")
        if args.escribir:
            track["bpm"] = bpm

    if args.escribir:
        BIBLIOTECA_JSON.write_text(json.dumps(biblioteca, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"\nEscrito {BIBLIOTECA_JSON}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
