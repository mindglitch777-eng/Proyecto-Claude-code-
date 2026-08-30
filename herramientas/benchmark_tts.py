#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BLOQUE 2 — Prueba de motores de voz.

No elige por opinion: instala cada motor, le hace decir EXACTAMENTE el
mismo guion, y mide. Lo que no se pueda instalar o falle, queda anotado
como fallo, no se disimula.

Candidatos pedidos por el operador:
    NeuTTS Nano · NeuTTS Air · Qwen3-TTS 0.6B
Descartados por el operador: Kokoro (fuera) y Chatterbox (muy lento
para produccion).

Corre en el runner de GitHub, no en el entorno de Claude Code: los
modelos salen de huggingface.co, que el proxy de aca bloquea con 403.

    python3 herramientas/benchmark_tts.py
"""
import json
import os
import subprocess
import sys
import time
import traceback
import wave
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "capturas_voz" / "benchmark"
SALIDA.mkdir(parents=True, exist_ok=True)

# El mismo guion para todos. Es uno de los diez reales, no un texto de
# prueba: tiene que sonar bien EN LO QUE VAMOS A PUBLICAR.
GUION = (
    "Si cobrás por hora, tenés un problema y todavía no lo viste. "
    "La inteligencia artificial no te bajó el precio. Te bajó las horas. "
    "Lo que antes te llevaba una tarde, ahora sale en veinte minutos. "
    "Cobrás por hora: acabás de cobrar cuatro veces menos por el mismo trabajo. "
    "Al cliente no le importa cuánto tardaste. Le importa que esté resuelto. "
    "Dejá de vender tiempo. Vendé el problema resuelto."
)


def ram_mb():
    """Pico de memoria del proceso, en MB."""
    try:
        import resource
        pico = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        # en Linux viene en KB
        return round(pico / 1024, 1)
    except Exception:
        return None


def pip(*args):
    r = subprocess.run([sys.executable, "-m", "pip", "install", "-q", *args],
                       capture_output=True, text=True, timeout=1800)
    return r.returncode == 0, (r.stderr or "")[-800:]


def dur_wav(p):
    try:
        with wave.open(str(p)) as w:
            return round(w.getnframes() / w.getframerate(), 2)
    except Exception:
        try:
            out = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "csv=p=0", str(p)], capture_output=True, text=True)
            return round(float(out.stdout.strip()), 2)
        except Exception:
            return None


def peso_modelo_mb():
    """Cuanto ocupa lo que se bajo al cache de modelos."""
    total = 0
    for base in (Path.home() / ".cache" / "huggingface",
                 Path.home() / ".cache" / "torch"):
        if base.exists():
            for f in base.rglob("*"):
                if f.is_file():
                    total += f.stat().st_size
    return round(total / 1e6, 1)


# ---------------------------------------------------------------- motores

def motor_neutts(variante):
    """NeuTTS (Nano / Air), de Neuphonic."""
    ok, err = pip("neuttsair")
    if not ok:
        raise RuntimeError(f"no se pudo instalar neuttsair: {err}")
    from neuttsair.neutts import NeuTTSAir  # type: ignore
    repo = {
        "nano": "neuphonic/neutts-air-q4-gguf",
        "air": "neuphonic/neutts-air",
    }[variante]
    tts = NeuTTSAir(backbone_repo=repo, backbone_device="cpu",
                    codec_repo="neuphonic/neucodec", codec_device="cpu")
    destino = SALIDA / f"neutts-{variante}.wav"
    t0 = time.time()
    wav = tts.infer(GUION, None, None)
    tardo = time.time() - t0
    import soundfile as sf  # type: ignore
    sf.write(str(destino), wav, 24000)
    return destino, tardo


def motor_qwen3():
    """Qwen3-TTS 0.6B."""
    ok, err = pip("transformers>=4.45", "torch", "soundfile", "accelerate")
    if not ok:
        raise RuntimeError(f"no se pudieron instalar dependencias: {err}")
    import soundfile as sf  # type: ignore
    import torch  # type: ignore
    from transformers import AutoModel, AutoProcessor  # type: ignore

    repo = "Qwen/Qwen3-TTS-0.6B"
    proc = AutoProcessor.from_pretrained(repo, trust_remote_code=True)
    modelo = AutoModel.from_pretrained(repo, trust_remote_code=True,
                                       torch_dtype=torch.float32)
    modelo.eval()
    destino = SALIDA / "qwen3-tts-06b.wav"
    t0 = time.time()
    entradas = proc(text=GUION, return_tensors="pt")
    with torch.no_grad():
        salida = modelo.generate(**entradas)
    tardo = time.time() - t0
    audio = salida.cpu().numpy().squeeze()
    sf.write(str(destino), audio, 24000)
    return destino, tardo


CANDIDATOS = [
    ("NeuTTS Nano", lambda: motor_neutts("nano")),
    ("NeuTTS Air", lambda: motor_neutts("air")),
    ("Qwen3-TTS 0.6B", motor_qwen3),
]


def postproceso(entrada):
    """La MISMA cadena de audio que usa la fabrica, para comparar peras
    con peras: normalizado a -14 LUFS con techo en -2 dBTP."""
    salida = entrada.with_name(entrada.stem + "-post.mp3")
    r = subprocess.run([
        "ffmpeg", "-y", "-v", "error", "-i", str(entrada),
        "-af", "loudnorm=I=-14:TP=-2:LRA=7",
        "-ar", "44100", "-b:a", "128k", str(salida),
    ], capture_output=True, text=True)
    return salida if r.returncode == 0 else None


def main():
    palabras = len(GUION.split())
    filas = []
    for nombre, fn in CANDIDATOS:
        print(f"\n=== {nombre} ===", flush=True)
        fila = {"motor": nombre, "ok": False}
        antes = peso_modelo_mb()
        try:
            wav, tardo = fn()
            dur = dur_wav(wav)
            fila.update({
                "ok": True,
                "segundos_en_generar": round(tardo, 2),
                "segundos_de_audio": dur,
                # RTF: cuantos segundos tarda por segundo de audio.
                # Menor que 1 = mas rapido que tiempo real.
                "rtf": round(tardo / dur, 3) if dur else None,
                "ram_pico_mb": ram_mb(),
                "peso_modelo_mb": round(peso_modelo_mb() - antes, 1),
                "wav_mb": round(wav.stat().st_size / 1e6, 2),
                "archivo": wav.name,
            })
            post = postproceso(wav)
            if post:
                fila["archivo_post"] = post.name
                fila["post_mb"] = round(post.stat().st_size / 1e6, 2)
            print(json.dumps(fila, ensure_ascii=False, indent=1))
        except Exception as e:
            fila["error"] = f"{type(e).__name__}: {e}"
            fila["detalle"] = traceback.format_exc()[-1200:]
            print("FALLO:", fila["error"], flush=True)
        filas.append(fila)

    informe = {
        "guion": GUION,
        "palabras": palabras,
        "maquina": "GitHub Actions ubuntu-latest, CPU",
        "resultados": filas,
    }
    (SALIDA / "benchmark.json").write_text(
        json.dumps(informe, ensure_ascii=False, indent=1), encoding="utf-8")

    # informe en castellano, sin jerga
    L = ["# Prueba de motores de voz", "",
         f"Guion de prueba ({palabras} palabras), el mismo para los tres:", "",
         f"> {GUION}", "",
         "Todo corrido en una maquina de GitHub, sin placa de video.", "",
         "| Motor | Anduvo | Tardo | Dura el audio | Por segundo de audio | RAM | Peso del modelo |",
         "|---|---|---|---|---|---|---|"]
    for f in filas:
        if f["ok"]:
            L.append(
                f"| {f['motor']} | si | {f['segundos_en_generar']}s | "
                f"{f['segundos_de_audio']}s | {f['rtf']}x | "
                f"{f['ram_pico_mb']} MB | {f['peso_modelo_mb']} MB |")
        else:
            L.append(f"| {f['motor']} | **NO** | — | — | — | — | — |")
    L += ["", "## Los que no anduvieron", ""]
    fallos = [f for f in filas if not f["ok"]]
    if not fallos:
        L.append("Ninguno: los tres generaron audio.")
    for f in fallos:
        L += [f"**{f['motor']}**", "", "```", f.get("error", ""), "```", ""]
    L += ["", "## Como se lee esto", "",
          "- **Tardo**: lo que demoro en fabricar el audio.",
          "- **Por segundo de audio**: si dice 2x, tarda 2 segundos en "
          "hacer 1 segundo de voz. Menos es mejor. Abajo de 1 es mas "
          "rapido que escucharlo.",
          "- **Peso del modelo**: lo que hay que bajar la primera vez.",
          "", "## Falta escucharlos", "",
          "La calidad no la puede medir un numero. Los audios quedan en "
          "`capturas_voz/benchmark/`, ya pasados por la misma cadena de "
          "sonido que usa la fabrica, para poder compararlos parejos.",
          "", "**No se integro ninguno todavia.**"]
    (SALIDA / "INFORME.md").write_text("\n".join(L), encoding="utf-8")
    print("\n".join(L))
    return 0


if __name__ == "__main__":
    sys.exit(main())
