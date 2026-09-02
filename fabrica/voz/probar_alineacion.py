#!/usr/bin/env python3
"""
Prototipo de forced-alignment con faster-whisper (PENDIENTES.md item 1:
Qwen3-TTS no expone timestamps, esta es la alternativa gratis/local
identificada -- word_timestamps=True, sin GPU, sin token de Hugging
Face). Corre sobre un audio YA GENERADO por Qwen3-TTS (no un audio de
prueba aparte) para que la comparacion sea real: si el forced-aligner
encuentra las palabras esperadas en tiempos razonables, la tecnica
sirve para sincronizar palabra por palabra dentro de la fabrica.

Necesita el paquete `faster-whisper` instalado (no esta en este
sandbox por el mismo bloqueo de red que Qwen3-TTS -- corre en GitHub
Actions, ver .github/workflows/probar-alineacion-faster-whisper.yml).

Uso:
    python3 fabrica/voz/probar_alineacion.py <audio.wav> "<texto esperado>"
"""
from __future__ import annotations

import json
import sys


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    audio_path, texto_esperado = sys.argv[1], sys.argv[2]

    from faster_whisper import WhisperModel

    # "small" multilingue: balance razonable de precision/velocidad en
    # CPU (un runner de GitHub Actions no tiene GPU). Espanol
    # soportado nativamente por Whisper.
    modelo = WhisperModel("small", device="cpu", compute_type="int8")
    segmentos, info = modelo.transcribe(audio_path, language="es", word_timestamps=True)

    palabras = []
    texto_transcripto = []
    for seg in segmentos:
        texto_transcripto.append(seg.text.strip())
        for w in (seg.words or []):
            palabras.append({"palabra": w.word.strip(), "inicio": round(w.start, 3), "fin": round(w.end, 3)})

    resultado = {
        "audio": audio_path,
        "texto_esperado": texto_esperado,
        "texto_transcripto": " ".join(texto_transcripto),
        "idioma_detectado": info.language,
        "probabilidad_idioma": round(info.language_probability, 3),
        "duracion_audio_seg": round(info.duration, 3),
        "palabras_con_timestamp": palabras,
        "cantidad_palabras_alineadas": len(palabras),
    }
    print(json.dumps(resultado, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
