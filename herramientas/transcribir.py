#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Transcribe un audio con marcas de tiempo. Corre en el runner, NO aca:
el proxy del entorno de Claude Code bloquea huggingface.co (403), que es
de donde sale el modelo.

    python3 herramientas/transcribir.py capturas_voz/diez-miguel.mp3
"""
import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel


def main():
    if len(sys.argv) < 2:
        print("Uso: transcribir.py <audio> [modelo]")
        return 1
    audio = Path(sys.argv[1])
    modelo = sys.argv[2] if len(sys.argv) > 2 else "small"
    m = WhisperModel(modelo, device="cpu", compute_type="int8")
    segs, info = m.transcribe(str(audio), language="es", vad_filter=False,
                              word_timestamps=True)
    salida = []
    for s in segs:
        salida.append({
            "i": round(s.start, 2),
            "f": round(s.end, 2),
            "t": s.text.strip(),
        })
        print(f"[{s.start:7.2f} -> {s.end:7.2f}] {s.text.strip()}")
    destino = audio.with_suffix(".transcripcion.json")
    destino.write_text(json.dumps(salida, ensure_ascii=False, indent=1),
                       encoding="utf-8")
    print(f"\n{len(salida)} segmentos -> {destino}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
