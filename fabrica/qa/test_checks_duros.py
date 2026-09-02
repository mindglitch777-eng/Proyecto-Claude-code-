#!/usr/bin/env python3
"""Tests reales del QA duro -- contra un video de verdad ya renderizado
(no un fixture de juguete) y contra un archivo corrupto de verdad."""
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from checks_duros import _detectar_negros, correr_qa  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
VIDEO_REAL = RAIZ / "videos" / "documental" / "caso-05.mp4"

FALLOS = []


def check(desc, cond):
    if not cond:
        FALLOS.append(f"FALLO: {desc}")


def test_video_real_ya_renderizado():
    if not VIDEO_REAL.exists():
        FALLOS.append(f"FALLO: no existe {VIDEO_REAL} -- correr esto en un checkout con los 20 videos ya renderizados")
        return
    r = correr_qa(str(VIDEO_REAL))
    check("video real: ok=True (sin problemas duros)", r.ok is True)
    check("video real: tiene video", r.tiene_video is True)
    check("video real: tiene audio", r.tiene_audio is True)
    check("video real: resolucion vertical 1080x1920", r.ancho == 1080 and r.alto == 1920)
    check("video real: 30 fps", r.fps == 30.0)
    check("video real: duracion > 0", r.duracion_seg is not None and r.duracion_seg > 0)
    check("video real: no tira excepcion, siempre problemas es una lista", isinstance(r.problemas, list))


def test_archivo_inexistente():
    r = correr_qa("/no/existe/este/archivo.mp4")
    check("archivo inexistente: ok=False", r.ok is False)
    check("archivo inexistente: problema explica por que", any("no existe" in p for p in r.problemas))


def test_archivo_corrupto():
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        f.write(b"esto no es un mp4 de verdad, son bytes cualquiera" * 20)
        ruta = f.name
    try:
        r = correr_qa(ruta)
        check("archivo corrupto: ok=False", r.ok is False)
        check("archivo corrupto: hay al menos un problema reportado", len(r.problemas) > 0)
    finally:
        Path(ruta).unlink(missing_ok=True)


def test_video_sin_audio():
    # genera un mp4 real, valido, pero SIN pista de audio -- para
    # probar que el check "tiene_audio" detecta esto de verdad y no
    # solo en el caso trivial de archivo corrupto.
    with tempfile.TemporaryDirectory() as tmp:
        ruta = str(Path(tmp) / "sin_audio.mp4")
        r = subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", "color=c=black:s=320x240:d=1",
             "-c:v", "libx264", "-t", "1", ruta],
            capture_output=True, text=True,
        )
        if r.returncode != 0:
            FALLOS.append(f"FALLO (setup): no se pudo generar el video de prueba: {r.stderr[:200]}")
            return
        reporte = correr_qa(ruta)
        check("video sin audio: ok=False", reporte.ok is False)
        check("video sin audio: problema menciona audio", any("audio" in p for p in reporte.problemas))
        check("video sin audio: tiene_video sigue siendo True", reporte.tiene_video is True)


def test_fondo_de_marca_no_es_falso_positivo_de_negro():
    # Regresion del bug real encontrado renderizando fabrica-demo-01:
    # el fondo de marca de la serie (identidad.ts PALETA.fondo =
    # #0A0A0C, casi negro) disparaba blackdetect con el pix_th por
    # defecto -- CUALQUIER escena vacia (sin texto/elementos todavia)
    # se marcaba como "pantalla negra sospechosa" por error.
    with tempfile.TemporaryDirectory() as tmp:
        casi_negro = str(Path(tmp) / "fondo_marca.mp4")
        r = subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", "color=c=0x0A0A0C:s=320x240:d=1",
             "-c:v", "libx264", "-t", "1", casi_negro],
            capture_output=True, text=True,
        )
        if r.returncode != 0:
            FALLOS.append(f"FALLO (setup): no se pudo generar el video de prueba: {r.stderr[:200]}")
            return
        negros = _detectar_negros(Path(casi_negro))
        check("fondo de marca (#0A0A0C) NO se detecta como pantalla negra", len(negros) == 0)

        # pero el negro PURO (#000, el mismo que usa CifraBeat con
        # dinero=true) debe seguir detectandose -- si esto tambien
        # diera 0, el fix seria demasiado permisivo.
        negro_puro = str(Path(tmp) / "negro_puro.mp4")
        subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", "color=c=black:s=320x240:d=1",
             "-c:v", "libx264", "-t", "1", negro_puro],
            capture_output=True, text=True, check=True,
        )
        negros_puro = _detectar_negros(Path(negro_puro))
        check("negro puro (#000) SI se sigue detectando (el fix no es demasiado permisivo)", len(negros_puro) > 0)


def main():
    for nombre, fn in list(globals().items()):
        if nombre.startswith("test_") and callable(fn):
            fn()
    if FALLOS:
        print(f"\n{len(FALLOS)} FALLO(S):\n")
        for f in FALLOS:
            print(f)
        return 1
    print("Todos los tests de QA duro pasaron OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
