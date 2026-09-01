#!/usr/bin/env python3
"""Genera un wav con Chatterbox Multilingual. Corre DENTRO de su propio
venv (ver probar-motores-voz.yml) porque sus dependencias (librosa,
numpy, transformers) chocan en versiones con las de melotts/kokoro si
comparten entorno -- aislar por venv es mas robusto que pelearse con
el resolver de pip para que las tres convivan en un solo entorno.

Uso: python3 _generar_chatterbox.py "texto" salida.wav [exageracion]
"""
import sys

import torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

texto, salida = sys.argv[1], sys.argv[2]
exageracion = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5

modelo = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
wav = modelo.generate(texto, language_id="es", exaggeration=exageracion)
ta.save(salida, wav, modelo.sr)
