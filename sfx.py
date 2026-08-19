#!/usr/bin/env python3
"""
Generador de efectos de sonido - CERO TOKENS, CERO DERECHOS.

Sintetiza los SFX con ffmpeg en vez de descargarlos. Ventajas reales:
- No hay problema de licencia: son ondas generadas, no grabaciones.
- No dependen de ninguna descarga ni de una web que puede caerse.
- Se afinan por parametro (mas grave, mas largo) sin buscar otro archivo.

Uso:
    python3 sfx.py todos          # genera la biblioteca completa
    python3 sfx.py whoosh out.wav
    python3 sfx.py impacto out.wav
    python3 sfx.py riser out.wav
    python3 sfx.py campana out.wav
    python3 sfx.py tick out.wav
    python3 sfx.py sub out.wav
"""

import shutil
import subprocess
import sys
from pathlib import Path

# Cada efecto es una cadena de filtros de ffmpeg (lavfi).
EFECTOS = {
    # Barrido de aire: para transiciones whip/slide
    "whoosh": (
        "anoisesrc=d=0.55:c=pink:a=0.6,"
        "highpass=f=380,lowpass=f=5200,"
        "afade=t=in:st=0:d=0.14:curve=exp,"
        "afade=t=out:st=0.22:d=0.33:curve=exp,"
        "volume=1.3"
    ),
    # Golpe grave: para el hook y los cortes duros
    "impacto": (
        "sine=frequency=140:duration=0.5,"
        "asubboost,"
        "afade=t=out:st=0.03:d=0.45:curve=exp,"
        "volume=1.6"
    ),
    # Tension ascendente: antes de una revelacion
    "riser": (
        "anoisesrc=d=1.6:c=white:a=0.35,"
        "highpass=f=200,"
        "afade=t=in:st=0:d=1.4:curve=exp,"
        "afade=t=out:st=1.45:d=0.15,"
        "volume=1.1"
    ),
    # Campana clara: para revelar un dato o cerrar una idea
    "campana": (
        "sine=frequency=880:duration=1.2,"
        "afade=t=out:st=0.05:d=1.15:curve=exp,"
        "aecho=0.8:0.7:60:0.35,"
        "volume=0.8"
    ),
    # Clic seco: para items de lista que aparecen
    "tick": (
        "sine=frequency=1400:duration=0.08,"
        "afade=t=out:st=0.01:d=0.07:curve=exp,"
        "volume=0.7"
    ),
    # Sub grave largo: base de tension bajo el hook
    "sub": (
        "sine=frequency=55:duration=1.8,"
        "afade=t=in:st=0:d=0.3,"
        "afade=t=out:st=1.2:d=0.6,"
        "volume=1.2"
    ),
}


def generar(nombre, salida):
    if nombre not in EFECTOS:
        print(f"ERROR: efecto '{nombre}' no existe.")
        print(f"Validos: {', '.join(EFECTOS)}")
        return 1
    if not shutil.which("ffmpeg"):
        print("ERROR: falta ffmpeg.")
        return 1
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
           "-i", EFECTOS[nombre], "-ar", "44100", "-ac", "1", str(salida)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"ERROR generando '{nombre}': {r.stderr[:300]}")
        return 1
    kb = Path(salida).stat().st_size / 1024
    print(f"OK: {salida} ({kb:.0f} KB)")
    return 0


def todos():
    d = Path("assets/sfx")
    d.mkdir(parents=True, exist_ok=True)
    fallos = 0
    for n in EFECTOS:
        if generar(n, d / f"{n}.wav") != 0:
            fallos += 1
    print(f"\nBiblioteca en {d.resolve()}")
    return 1 if fallos else 0


def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        return
    if a[0] == "todos":
        sys.exit(todos())
    if len(a) < 2:
        print("Uso: python3 sfx.py <efecto> <salida.wav>")
        sys.exit(1)
    sys.exit(generar(a[0], a[1]))


if __name__ == "__main__":
    main()
