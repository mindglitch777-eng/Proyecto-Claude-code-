#!/usr/bin/env python3
"""
Captura real (screenshot + icono) de TODA una lista de sitios de una
sola corrida -- mismo patron que descargar_fotos_lote.py/
descargar_logos_lote.py, aplicado a capturas de pantalla reales.

Lee assets/capturas_sitio/pedido-lote.json:
    [{"url": "https://...", "slug": "nombre-slug", "ancho": 1280, "alto": 800}]

Corre en GitHub Actions (capturar-sitio.yml), no en la sesion de Claude
Code (acceso a internet general bloqueado).
"""
import json
import sys
from pathlib import Path

from capturar_sitio_real import capturar

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "assets" / "capturas_sitio"
PEDIDO = DESTINO / "pedido-lote.json"


def main() -> int:
    if not PEDIDO.exists():
        print(f"No existe {PEDIDO}. Nada que hacer.")
        return 0

    lote = json.loads(PEDIDO.read_text(encoding="utf-8"))
    ok, fallidos = [], []

    for entrada in lote:
        url, slug = entrada["url"], entrada["slug"]
        if (DESTINO / slug / "captura.png").exists():
            print(f"[{slug}] ya tiene captura, se salta.")
            ok.append(slug)
            continue
        print(f"[{slug}] capturando {url}...")
        try:
            exito = capturar(url, slug, entrada.get("ancho", 1280), entrada.get("alto", 800))
        except Exception as e:
            print(f"[{slug}] fallo: {e}")
            exito = False
        (ok if exito else fallidos).append(slug)

    print(f"\nListo: {len(ok)} con captura, {len(fallidos)} sin captura ({', '.join(fallidos) or 'ninguno'}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
