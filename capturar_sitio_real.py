#!/usr/bin/env python3
"""
Captura real de un sitio publico (screenshot + icono real de la app) --
para el componente "vidriera" (fabrica, 2026-09-21): en vez de una
tarjeta de texto con un dato, mostrar de verdad como se ve la
herramienta, igual al formato de las capturas de Instagram que el
operador mando de referencia (icono grande + captura real de pantalla).

Usa Playwright real (Chromium headless) -- corre en un runner de GitHub
Actions, no en la sesion de Claude Code (ese entorno tiene el acceso a
internet general bloqueado, mismo motivo que foto-persona.yml/
logo-empresa.yml).

Limitacion real, no oculta: sin login (misma politica que scraper.py --
nunca usar una cuenta real para esto), asi que la captura es de la
pagina publica/de marketing, no de la herramienta ya autenticada. Si
Google Flow (por ejemplo) redirige a un login antes de mostrar nada
util, la captura sale de lo que SI se alcanza a ver antes del redirect
-- no se inventa una pantalla de producto que no se vio de verdad.

Uso:
    python3 capturar_sitio_real.py <url> <slug> [ancho] [alto]
"""
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "assets" / "capturas_sitio"


def capturar(url: str, slug: str, ancho: int = 1280, alto: int = 800) -> bool:
    """Captura real + icono real de `url`, guardados en
    assets/capturas_sitio/<slug>/. Devuelve True si al menos la
    captura de pantalla salio bien (el icono es opcional)."""
    from playwright.sync_api import sync_playwright

    carpeta = DESTINO / slug
    carpeta.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        navegador = p.chromium.launch()
        pagina = navegador.new_page(viewport={"width": ancho, "height": alto})
        try:
            pagina.goto(url, wait_until="networkidle", timeout=30000)
        except Exception as e:
            print(f"[{slug}] aviso: networkidle no se alcanzo a tiempo ({e}), sigo con lo que cargo.")
        pagina.wait_for_timeout(1500)  # deja asentar animaciones/fuentes

        destino_captura = carpeta / "captura.png"
        pagina.screenshot(path=str(destino_captura))
        print(f"[{slug}] captura real guardada <- {url}")

        # Icono real: preferir apple-touch-icon (suele ser mas grande y
        # limpio) sobre favicon.ico (a veces 16x16, se ve horrible
        # agrandado). Nunca se inventa un icono -- si no hay ninguno
        # declarado, se prueba /favicon.ico como ultimo recurso real.
        icono_url = pagina.evaluate(
            """() => {
                const candidatos = [...document.querySelectorAll('link[rel~="icon"]')]
                    .map(l => ({href: l.href, rel: l.getAttribute('rel') || '', sizes: l.getAttribute('sizes') || ''}));
                const apple = candidatos.find(c => c.rel.includes('apple-touch-icon'));
                if (apple) return apple.href;
                candidatos.sort((a, b) => {
                    const sa = parseInt((a.sizes.split('x')[0]) || '0', 10);
                    const sb = parseInt((b.sizes.split('x')[0]) || '0', 10);
                    return sb - sa;
                });
                return candidatos[0] ? candidatos[0].href : null;
            }"""
        )
        if not icono_url:
            icono_url = url.rstrip('/') + '/favicon.ico'

        try:
            resp = pagina.request.get(icono_url)
            if resp.ok:
                ext = icono_url.rsplit('.', 1)[-1].split('?')[0].lower()
                ext = ext if ext in ('png', 'svg', 'ico', 'jpg', 'jpeg') else 'png'
                (carpeta / f"icono.{ext}").write_bytes(resp.body())
                print(f"[{slug}] icono real guardado <- {icono_url}")
            else:
                print(f"[{slug}] icono: {icono_url} respondio {resp.status}, no se guarda nada.")
        except Exception as e:
            print(f"[{slug}] icono: fallo bajarlo ({e}), no se guarda nada.")

        navegador.close()

    return destino_captura.exists()


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    url, slug = sys.argv[1], sys.argv[2]
    ancho = int(sys.argv[3]) if len(sys.argv) > 3 else 1280
    alto = int(sys.argv[4]) if len(sys.argv) > 4 else 800
    return 0 if capturar(url, slug, ancho, alto) else 2


if __name__ == "__main__":
    sys.exit(main())
