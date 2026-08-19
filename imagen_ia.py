#!/usr/bin/env python3
"""
Generador de imagenes con IA — via Cloudflare Workers AI (cuota gratis).

NO se puede probar en el sandbox de Claude (la red esta restringida a
GitHub/npm/PyPI). SI funciona en GitHub Actions o en cualquier maquina
con red abierta. Por eso queda construido pero sin verificar aca.

Modelo: FLUX.1 [schnell] — licencia Apache 2.0, la mas permisiva que
existe para uso comercial. Genera en 1-4 pasos, rapido y barato.

Requisitos:
  1. Cuenta gratis en Cloudflare
  2. Account ID + API Token de Workers AI
  3. Guardarlos como variables de entorno / secrets del repo:
       CF_ACCOUNT_ID
       CF_API_TOKEN

Uso:
    python3 imagen_ia.py "busto de marmol clasico, fondo oscuro" salida.png
    python3 imagen_ia.py --lote prompts.json

Formato de prompts.json:
{
  "salida_dir": "assets/imagenes",
  "estilo": "fotografia de museo, iluminacion lateral suave, fondo oscuro neutro",
  "imagenes": [
    {"nombre": "marmol-textura", "prompt": "textura de marmol blanco veteado"},
    {"nombre": "columna", "prompt": "columna corintia antigua, ruina"}
  ]
}
"""

import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

MODELO = "@cf/black-forest-labs/flux-1-schnell"


def generar(prompt, salida, estilo=""):
    cuenta = os.environ.get("CF_ACCOUNT_ID")
    token = os.environ.get("CF_API_TOKEN")
    if not cuenta or not token:
        print("ERROR: faltan CF_ACCOUNT_ID y/o CF_API_TOKEN en el entorno.")
        print("Configuralos como secrets del repo (ver IMAGENES.md).")
        return 1

    completo = f"{prompt}. {estilo}".strip().rstrip(".")
    url = (f"https://api.cloudflare.com/client/v4/accounts/{cuenta}"
           f"/ai/run/{MODELO}")
    datos = json.dumps({"prompt": completo, "steps": 4}).encode()
    req = urllib.request.Request(
        url, data=datos,
        headers={"Authorization": f"Bearer {token}",
                 "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            resp = json.loads(r.read())
    except urllib.error.HTTPError as e:
        cuerpo = e.read().decode()[:300]
        print(f"ERROR HTTP {e.code}: {cuerpo}")
        return 1
    except Exception as e:
        print(f"ERROR de red: {e}")
        return 1

    img_b64 = (resp.get("result") or {}).get("image")
    if not img_b64:
        print(f"ERROR: respuesta sin imagen -> {str(resp)[:250]}")
        return 1

    p = Path(salida)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(base64.b64decode(img_b64))
    print(f"OK: {salida} ({p.stat().st_size/1024:.0f} KB)")
    return 0


def lote(path):
    p = Path(path)
    if not p.exists():
        print(f"ERROR: no existe '{path}'.")
        return 1
    try:
        cfg = json.loads(p.read_text())
    except json.JSONDecodeError as e:
        print(f"ERROR: JSON invalido -> {e}")
        return 1
    d = Path(cfg.get("salida_dir", "assets/imagenes"))
    estilo = cfg.get("estilo", "")
    imgs = cfg.get("imagenes", [])
    if not imgs:
        print("ERROR: el lote no tiene 'imagenes'.")
        return 1
    fallos = 0
    for i, it in enumerate(imgs, 1):
        nombre = it.get("nombre", f"img-{i:02d}")
        print(f"[{i}/{len(imgs)}] {nombre}")
        if generar(it.get("prompt", ""), d / f"{nombre}.png", estilo) != 0:
            fallos += 1
    print(f"\n{len(imgs)-fallos}/{len(imgs)} generadas en {d}")
    return 1 if fallos else 0


# ---- LIMITE QUE NO SE CRUZA ----
# No generar imagenes que imiten a una persona real identificable, un
# logo, una marca registrada o un personaje con derechos. Para figuras
# historicas antiguas conviene usar fotos reales de museos (ver
# DESCARGA-IMAGENES.md): la IA inventa rasgos y se nota.
# Esta herramienta es para TEXTURAS, FONDOS y ESCENAS ABSTRACTAS.

def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        return
    if a[0] == "--lote":
        if len(a) < 2:
            print("Uso: python3 imagen_ia.py --lote prompts.json")
            sys.exit(1)
        sys.exit(lote(a[1]))
    if len(a) < 2:
        print("Uso: python3 imagen_ia.py \"prompt\" salida.png")
        sys.exit(1)
    sys.exit(generar(a[0], a[1]))


if __name__ == "__main__":
    main()
