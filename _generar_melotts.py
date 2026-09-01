#!/usr/bin/env python3
"""Genera un wav con MeloTTS-Spanish. Corre DENTRO de su propio venv
(ver probar-motores-voz.yml y el comentario en _generar_chatterbox.py
sobre por que el aislamiento es necesario).

Uso: python3 _generar_melotts.py "texto" salida.wav
"""
import sys

from melo.api import TTS

texto, salida = sys.argv[1], sys.argv[2]

modelo = TTS(language="ES", device="cpu")
hablante = list(modelo.hps.data.spk2id.keys())[0]
modelo.tts_to_file(texto, modelo.hps.data.spk2id[hablante], salida, speed=0.95)
