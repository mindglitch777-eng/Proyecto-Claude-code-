#!/usr/bin/env python3
"""
Genera el audio de narracion de los 20 casos documentales con Qwen3-TTS
(motor C, gabriele-mastrapasqua/qwen3-tts), clonando la voz elegida
(librivox-11, variante "energico2": tono serio/elegante + rate 1.25) y
generando UN ARCHIVO POR LINEA del manifest -- no un audio continuo a
cortar despues. Evita el problema de alineacion que tuvimos con
ElevenLabs (deteccion de silencio no confiable en habla real): acá cada
linea nace ya separada, sin ambiguedad de donde corta una y empieza la
siguiente.

Corre en GitHub Actions (necesita compilar el motor C y bajar el
modelo desde huggingface.co, bloqueado en el entorno de Claude Code).

Uso:
    python3 generar_voz_documental_qwen.py \
        --motor /tmp/qwen3-tts/qwen_tts \
        --modelo /tmp/qwen3-tts-modelo \
        --referencia /tmp/referencia.wav \
        --manifest capturas_voz/manifest_voz_documental.json \
        --destino capturas_voz/audio_documental
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).parent

INSTRUCT = ("Speak in a serious, elegant, composed and confident tone, "
            "clear and articulate -- not aggressive, not menacing, not overly deep")
RATE = 1.25


def generar_linea(motor, modelo, referencia, texto, salida, timeout=180):
    r = subprocess.run(
        [motor, "-d", modelo, "--ref-audio", referencia, "--text", texto,
         "--language", "Spanish", "--instruct", INSTRUCT, "--rate", str(RATE),
         "-o", str(salida)],
        capture_output=True, text=True, timeout=timeout)
    if r.returncode != 0 or not salida.exists():
        print(f"  ERROR: {(r.stderr or r.stdout)[-500:]}")
        return False
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--motor", required=True)
    ap.add_argument("--modelo", required=True)
    ap.add_argument("--referencia", required=True)
    ap.add_argument("--manifest", default=str(RAIZ / "capturas_voz/manifest_voz_documental.json"))
    ap.add_argument("--destino", default=str(RAIZ / "capturas_voz/audio_documental"))
    args = ap.parse_args()

    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    destino = Path(args.destino)
    destino.mkdir(parents=True, exist_ok=True)

    ok, fallidas, desde_ultimo_commit = 0, [], 0
    for item in manifest:
        nombre = f"{item['slug']}_{item['index']:02d}"
        wav = destino / f"{nombre}.wav"
        if wav.exists() and wav.stat().st_size > 1000:
            ok += 1
            continue  # ya generada (permite reanudar si el job se corta)
        print(f"[{nombre}] {item['texto'][:60]!r}")
        if generar_linea(args.motor, args.modelo, args.referencia, item["texto"], wav):
            ok += 1
            desde_ultimo_commit += 1
        else:
            fallidas.append(nombre)

        # checkpoint cada 20 lineas: si el job se corta por timeout no
        # se pierde el trabajo ya hecho (un timeout de job mata el job
        # entero sin correr los steps de "guardar" que van al final)
        if desde_ultimo_commit >= 20:
            _checkpoint(destino)
            desde_ultimo_commit = 0

    if desde_ultimo_commit:
        _checkpoint(destino)

    print(f"\n{ok}/{len(manifest)} lineas generadas.")
    if fallidas:
        print(f"Fallidas: {fallidas}")
        sys.exit(1)


def _checkpoint(destino):
    subprocess.run(["git", "add", str(destino)], cwd=RAIZ)
    r = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=RAIZ)
    if r.returncode == 0:
        return  # nada nuevo desde el ultimo checkpoint
    subprocess.run(["git", "commit", "-m", "Checkpoint: audio documental (Qwen3-TTS)"], cwd=RAIZ)
    subprocess.run(["git", "pull", "--rebase", "--autostash"], cwd=RAIZ)
    subprocess.run(["git", "push"], cwd=RAIZ)
    print("  [checkpoint guardado]")


if __name__ == "__main__":
    main()
