#!/usr/bin/env python3
"""
Captura real de pantalla del producto (El Corte) - CERO TOKENS.

Abre producto/el-corte-v7.html en un navegador real (Chromium via
Playwright) y ejecuta un flujo de uso real dentro de la app -- toques
reales sobre botones reales, no una animacion simulada. Graba la
sesion en video.

Esto es lo que permite el Formato 1 de FOCO-VENTA.md ("demostracion de
producto"): la salida de cada video de la serie "Que hacer cuando..."
(MARCA.md) puede ser metraje genuino del producto resolviendo el
problema, no una recreacion.

Flujos disponibles (ver FLUJOS abajo). Cada uno mapea a una situacion
real de la serie de 15 videos de MARCA.md.

Uso:
    python3 capturar_producto.py <flujo> [salida.mp4]
    python3 capturar_producto.py --listar
"""

import shutil
import subprocess
import sys
import time
from pathlib import Path

PRODUCTO = Path(__file__).parent / "producto" / "el-corte-v7.html"
VIEWPORT = {"width": 390, "height": 844}  # proporcion de telefono real


def paso_click(page, selector, espera=0.55):
    page.click(selector, timeout=8000)
    time.sleep(espera)


def paso_fill(page, selector, texto, espera=0.4):
    page.fill(selector, texto)
    time.sleep(espera)


# Cada flujo es una funcion que recibe la `page` ya cargada (splash
# ya removido) y ejecuta toques reales. Devuelve una descripcion
# corta para el nombre de archivo si no se especifico salida.
def flujo_decidir(page):
    """Topico 4 de MARCA.md: 'Tenes que decidir y no podes'."""
    paso_click(page, "button[onclick=\"ver('decidir')\"]", 0.9)
    paso_fill(page, "#dQue", "Si acepto el trabajo nuevo", 0.5)
    paso_click(page, "button[onclick=\"decidirRuta(0)\"]", 1.1)
    paso_click(page, "button[onclick=\"cerrarDecision(2)\"]", 1.6)
    return "decidir"


def flujo_noche(page):
    """Topico 1 de MARCA.md: 'Discutiste y no podes dormir'."""
    paso_click(page, "button[onclick=\"dx('noche')\"]", 0.9)
    paso_click(page, "#cSi", 1.0)  # "Algo puntual que no me suelta"
    # Sesion guiada: avanzar un par de pasos reales
    for _ in range(2):
        paso_click(page, "#sBtn", 1.4)
    return "noche"

def flujo_persona(page):
    """Topico 2 de MARCA.md: 'Mandaste un mensaje y no responden'."""
    paso_click(page, "button[onclick=\"dx('persona')\"]", 0.9)
    paso_click(page, "#cSi", 1.0)  # "Si, en algun momento"
    for _ in range(2):
        paso_click(page, "#sBtn", 1.4)
    return "persona"


def flujo_antes(page):
    """Topico 6 de MARCA.md: 'Manana tenes algo importante'."""
    paso_click(page, "button[onclick=\"ver('antes')\"]", 0.9)
    paso_fill(page, "#a1", "Que quede claro el plan", 0.35)
    paso_fill(page, "#a2", "Como lo explico y cuando", 0.35)
    paso_fill(page, "#a3", "Que no le guste la propuesta", 0.35)
    paso_fill(page, "#a4", "Pido otra reunion para ajustar", 0.35)
    paso_click(page, "button[onclick=\"prepararCharla()\"]", 1.6)
    return "antes"


def flujo_respirar(page):
    """Topico 9 de MARCA.md: 'Te despertas ya acelerado'."""
    paso_click(page, "button[onclick=\"ver('respirar')\"]", 0.9)
    paso_click(page, "#rBtn", 3.2)  # deja correr un ciclo de respiracion
    return "respirar"


FLUJOS = {
    "decidir": flujo_decidir,
    "noche": flujo_noche,
    "persona": flujo_persona,
    "antes": flujo_antes,
    "respirar": flujo_respirar,
}


def capturar(nombre_flujo, salida=None):
    if nombre_flujo not in FLUJOS:
        print(f"ERROR: flujo '{nombre_flujo}' no existe. "
              f"Validos: {', '.join(FLUJOS)}")
        return 1
    if not PRODUCTO.exists():
        print(f"ERROR: no existe '{PRODUCTO}'.")
        return 1
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("ERROR: falta playwright (pip install playwright).")
        return 1

    tmp_dir = Path("_captura_tmp")
    tmp_dir.mkdir(exist_ok=True)

    with sync_playwright() as p:
        chromio = Path("/opt/pw-browsers/chromium")
        kw = {"executable_path": str(chromio)} if chromio.exists() else {}
        browser = p.chromium.launch(**kw)
        ctx = browser.new_context(
            viewport=VIEWPORT,
            record_video_dir=str(tmp_dir),
            record_video_size=VIEWPORT,
            device_scale_factor=2,
        )
        page = ctx.new_page()
        t0 = time.monotonic()
        page.goto(f"file://{PRODUCTO.resolve()}")
        # Espera a que el splash de marca termine (animacion propia del producto)
        try:
            page.wait_for_selector("#splash", state="detached", timeout=6000)
        except Exception:
            pass
        offset_splash = time.monotonic() - t0
        time.sleep(0.3)
        offset_splash += 0.3

        etiqueta = FLUJOS[nombre_flujo](page)
        time.sleep(1.0)  # frame final quieto, mas facil de cortar despues

        video_path = page.video.path()
        ctx.close()
        browser.close()

    dest = Path(salida) if salida else Path(f"captura-{etiqueta}.mp4")
    if not shutil.which("ffmpeg"):
        Path(video_path).replace(dest.with_suffix(".webm"))
        print(f"AVISO: falta ffmpeg, se dejo el .webm crudo: "
              f"{dest.with_suffix('.webm')}")
    else:
        # Recorta el splash: el clip queda arrancando en la interaccion real
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{offset_splash:.2f}",
               "-i", str(video_path),
               "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium",
               "-crf", "18", str(dest)]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"ERROR al convertir a mp4: {r.stderr[:300]}")
            return 1
        print(f"(splash recortado: {offset_splash:.2f}s)")
    shutil.rmtree(tmp_dir, ignore_errors=True)
    print(f"LISTO: {dest} ({dest.stat().st_size/1024:.0f} KB)")
    return 0


def main():
    a = sys.argv[1:]
    if not a or a[0] == "--listar":
        print("Flujos disponibles (mapeados a MARCA.md):")
        for k, f in FLUJOS.items():
            print(f"  {k:10s} {(f.__doc__ or '').strip()}")
        return
    sys.exit(capturar(a[0], a[1] if len(a) > 1 else None))


if __name__ == "__main__":
    main()
