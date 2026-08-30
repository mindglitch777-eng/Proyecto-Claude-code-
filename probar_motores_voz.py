#!/usr/bin/env python3
"""
Banco de pruebas de motores de voz libres.

POR QUE
    Piper suena a robot y eso no vende. Este script rinde LA MISMA
    frase con varios motores libres para elegir de oido, que es la
    unica forma honesta de decidir esto.

CANDIDATOS (los tres se pueden usar comercialmente)
    kokoro   82M parametros, Apache-2.0, pensado para correr en CPU.
             Voz masculina en español: em_alex. La queja mas comun en
             su repo es que las voces en español estan "muy entrenadas
             en voces latinoamericanas" -- para nosotros eso es
             exactamente lo que queremos, no un defecto.
    pocket   Pocket TTS de Kyutai, MIT, CPU-first ("un TTS que te
             entra en la CPU"). Trae voces propias y ademas CLONA una
             voz desde un wav de referencia. Es el camino a una voz
             que no suene sintetica: la del propio operador.
    piper    el que ya teniamos, como piso de comparacion.

Cada motor va en su propio try: si uno no instala o cambia de API, se
anota el error y el banco sigue con los demas. Ademas imprime lo que
descubre de la API de pocket-tts, para no tener que adivinar dos veces.

Uso:
    python3 probar_motores_voz.py "Frase de prueba"
"""
import subprocess
import sys
import traceback
from pathlib import Path

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "muestras_voz"

FRASE = ("La mitad de lo que venden los latinos no se vende acá. "
         "Se cobra en dólares, afuera. El problema no es el mercado: "
         "es que no sabés qué vender.")


def _a_mp3(wav, nombre):
    """wav -> mp3 (para escuchar desde el celular) y wav realzado."""
    from voz_piper import realzar
    hechos = []
    mp3 = DESTINO / f"{nombre}-CRUDO.mp3"
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav),
                        "-b:a", "128k", str(mp3)], capture_output=True, text=True)
    if r.returncode == 0:
        hechos.append(mp3.name)
    realzado = DESTINO / f"{nombre}-realzado.wav"
    if realzar(wav, realzado):
        mp3r = DESTINO / f"{nombre}-REALZADA.mp3"
        r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(realzado),
                            "-b:a", "128k", str(mp3r)], capture_output=True, text=True)
        if r.returncode == 0:
            hechos.append(mp3r.name)
        realzado.unlink(missing_ok=True)
    return hechos


def probar_kokoro(texto):
    """Kokoro-82M. lang_code 'e' es español; em_alex es la voz
    masculina. Devuelve 24 kHz."""
    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline

    hechos = []
    for voz in ("em_alex", "em_santa"):
        try:
            pipe = KPipeline(lang_code="e")
            trozos = [a for _, _, a in pipe(texto, voice=voz, speed=0.95)]
            if not trozos:
                print(f"  [kokoro/{voz}] no devolvio audio")
                continue
            wav = DESTINO / f"tmp-kokoro-{voz}.wav"
            sf.write(str(wav), np.concatenate(trozos), 24000)
            hechos += _a_mp3(wav, f"kokoro-{voz}")
            wav.unlink(missing_ok=True)
            print(f"  [kokoro/{voz}] ok")
        except Exception as e:
            print(f"  [kokoro/{voz}] fallo: {e}")
    return hechos


def probar_pocket(texto):
    """Pocket TTS. La API todavia se mueve entre versiones, asi que
    primero se imprime lo que expone el modulo y la ayuda del CLI: con
    eso se corrige en una sola vuelta en vez de adivinar."""
    hechos = []
    try:
        import pocket_tts
        print("  [pocket] modulo:", [n for n in dir(pocket_tts)
                                     if not n.startswith("_")][:25])
    except Exception as e:
        print(f"  [pocket] no importa: {e}")
    r = subprocess.run(["pocket-tts", "generate", "--help"],
                       capture_output=True, text=True)
    print("  [pocket] --help:\n" + (r.stdout or r.stderr)[:1400])

    wav = DESTINO / "tmp-pocket.wav"
    # Varias formas de invocarlo; la primera que produzca audio gana.
    intentos = [
        ["pocket-tts", "generate", "--text", texto, "--out", str(wav)],
        ["pocket-tts", "generate", "--text", texto, "--output", str(wav)],
        ["pocket-tts", "generate", texto, "--out", str(wav)],
        ["pocket-tts", "generate", "--text", texto, "-o", str(wav)],
    ]
    for cmd in intentos:
        wav.unlink(missing_ok=True)
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
        if wav.exists() and wav.stat().st_size > 2000:
            print(f"  [pocket] ok con: {' '.join(cmd[:3])}...")
            hechos += _a_mp3(wav, "pocket")
            wav.unlink(missing_ok=True)
            return hechos
        print(f"  [pocket] no anduvo {' '.join(cmd[1:4])}: "
              f"{(r.stderr or r.stdout)[:200]}")
    # El CLI por defecto escribe tts_output.wav en el directorio actual
    salida_def = Path("tts_output.wav")
    salida_def.unlink(missing_ok=True)
    r = subprocess.run(["pocket-tts", "generate", "--text", texto],
                       capture_output=True, text=True, timeout=900)
    if salida_def.exists():
        print("  [pocket] ok via tts_output.wav")
        hechos += _a_mp3(salida_def, "pocket")
        salida_def.unlink(missing_ok=True)
    else:
        print(f"  [pocket] sin salida: {(r.stderr or r.stdout)[:300]}")
    return hechos


def probar_piper(texto):
    from voz_piper import sintetizar
    hechos = []
    wav = DESTINO / "tmp-piper.wav"
    if sintetizar(texto, "es_MX-ald-medium", wav):
        hechos += _a_mp3(wav, "piper-es_MX-ald")
        wav.unlink(missing_ok=True)
        print("  [piper] ok")
    return hechos


def main():
    texto = sys.argv[1] if len(sys.argv) > 1 else FRASE
    DESTINO.mkdir(exist_ok=True)
    todo = []
    for nombre, fn in (("kokoro", probar_kokoro),
                       ("pocket", probar_pocket),
                       ("piper", probar_piper)):
        print(f"\n=== {nombre} ===")
        try:
            todo += fn(texto)
        except Exception:
            print(f"  [{nombre}] excepcion:\n{traceback.format_exc()[:900]}")
    (DESTINO / "LEEME.md").write_text(
        "# Comparacion de motores de voz\n\nMisma frase en todos los "
        "motores, cruda y con la cadena de realce de `voz_piper.py`.\n\n"
        "Frase:\n\n> " + texto + "\n\n## Archivos\n\n"
        + "\n".join(f"- `{h}`" for h in sorted(todo))
        + "\n\n## Licencias\n\n"
        "- kokoro — Apache-2.0, uso comercial libre\n"
        "- pocket-tts (Kyutai) — MIT, uso comercial libre, ademas clona voz\n"
        "- piper — MIT, uso comercial libre\n",
        encoding="utf-8")
    print(f"\n{len(todo)} muestras en {DESTINO}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
