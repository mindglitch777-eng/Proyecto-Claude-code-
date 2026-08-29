#!/usr/bin/env python3
"""
Baja metraje de banco desde Pexels para las maquetas 'pleno' y
'tarjeta' -- CERO TOKENS.

La clave NUNCA se escribe en el repo: se lee de la variable de entorno
PEXELS_API_KEY, que en GitHub Actions viene del secreto del mismo
nombre. Si falta, el script corta y explica como cargarla.

Este script corre en un runner de GitHub Actions porque el entorno de
Claude Code tiene bloqueado el acceso a pexels.com (verificado: el
proxy responde 403 a la conexion). El runner si tiene internet abierto,
igual que ya haciamos para bajar imagenes de Openverse.

Uso:
    python3 descargar_metraje.py barberia "barber shop" 12
    python3 descargar_metraje.py --lote          (todos los nichos de NICHOS)

Deja los archivos en assets/metraje/<nicho>/ y escribe un CREDITOS.md
con autor y enlace de cada foto, como pide la licencia de Pexels.
"""
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "assets" / "metraje"
API = "https://api.pexels.com/v1/search"

# Terminos en INGLES a proposito: el banco esta indexado en ingles y
# devuelve mucho mas material que buscando en castellano.
NICHOS = {
    "barberia": "barber shop haircut man",
    "unias": "nail salon manicure hands",
    "gimnasio": "personal trainer gym coaching",
    "nutricion": "nutritionist healthy food consultation",
    "veterinaria": "veterinarian clinic dog",
    "dinero": "money cash entrepreneur laptop",
}


ARCHIVO_CLAVE = RAIZ / "pexels_key.txt"


def clave():
    """Clave de Pexels. Primero la variable de entorno (si algun dia se
    carga como secreto del repo, manda esa); si no, el archivo
    pexels_key.txt.

    Decision del operador: la clave va en el archivo para que la
    descarga funcione sin ningun paso manual. Es una clave de SOLO
    LECTURA del banco de fotos gratuito -- no permite gastar dinero,
    no da acceso a ninguna cuenta y su unico limite es 200 descargas
    por hora. Si alguna vez se filtra, se regenera desde pexels.com/api
    y se reemplaza este archivo."""
    k = os.environ.get("PEXELS_API_KEY", "").strip()
    if k:
        return k
    if ARCHIVO_CLAVE.exists():
        k = ARCHIVO_CLAVE.read_text(encoding="utf-8").strip()
        if k:
            return k
    print(f"ERROR: no hay clave. Escribila en {ARCHIVO_CLAVE.name} o "
          f"cargala como variable PEXELS_API_KEY.")
    sys.exit(1)


def buscar(consulta, cantidad, k):
    url = (f"{API}?{urllib.parse.urlencode({'query': consulta, 'per_page': cantidad, 'orientation': 'portrait', 'size': 'large'})}")
    # User-Agent explicito: con el de urllib por defecto
    # ("Python-urllib/3.11") la API responde 403. Pexels espera la clave
    # cruda en Authorization, sin "Bearer".
    pedido = urllib.request.Request(url, headers={
        "Authorization": k,
        "User-Agent": "Mozilla/5.0 (compatible; FabricaContenido/1.0)",
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(pedido, timeout=45) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        cuerpo = e.read().decode("utf-8", "ignore")[:300]
        if e.code in (401, 403):
            print(f"ERROR {e.code}: Pexels rechazo la clave.\n"
                  f"Respuesta: {cuerpo}\n"
                  f"Revisa que la clave este completa y activa en "
                  f"pexels.com/api.")
        else:
            print(f"ERROR {e.code} al consultar Pexels: {cuerpo}")
        raise


def bajar_nicho(nicho, consulta, cantidad, k):
    carpeta = DESTINO / nicho
    carpeta.mkdir(parents=True, exist_ok=True)
    datos = buscar(consulta, cantidad, k)
    fotos = datos.get("photos", [])
    if not fotos:
        print(f"  [{nicho}] sin resultados para '{consulta}'")
        return 0
    creditos = []
    n = 0
    for i, f in enumerate(fotos):
        # 'portrait' ya viene recortado 800x1200, buena base para 1080x1920
        src = f["src"].get("portrait") or f["src"].get("large")
        destino = carpeta / f"{nicho}-{i:02d}.jpg"
        try:
            with urllib.request.urlopen(src, timeout=60) as r, open(destino, "wb") as out:
                out.write(r.read())
        except Exception as e:
            print(f"  [{nicho}] fallo {i}: {e}")
            continue
        creditos.append(f"- `{destino.name}` — foto de {f['photographer']} "
                        f"({f['photographer_url']}) — {f['url']}")
        n += 1
    (carpeta / "CREDITOS.md").write_text(
        f"# Creditos — {nicho}\n\nFotos de Pexels, licencia libre para uso "
        f"comercial. Atribucion no obligatoria pero incluida.\n\n"
        + "\n".join(creditos) + "\n", encoding="utf-8")
    print(f"  [{nicho}] {n} fotos -> {carpeta}")
    return n


def main():
    a = sys.argv[1:]
    k = clave()
    DESTINO.mkdir(parents=True, exist_ok=True)
    if not a or a[0] == "--lote":
        total = sum(bajar_nicho(n, c, 12, k) for n, c in NICHOS.items())
        print(f"\nTotal: {total} fotos en {len(NICHOS)} nichos.")
        return 0
    # Un solo nicho. Si el nombre esta en NICHOS se usa su consulta; si
    # no, se toma el texto tal cual como busqueda. Asi el workflow solo
    # necesita pasar el nombre y no tiene que resolver la consulta.
    nicho = a[0]
    consulta = NICHOS.get(nicho, a[1] if len(a) > 1 else nicho)
    cantidad = int(a[-1]) if a[-1].isdigit() else 12
    bajar_nicho(nicho, consulta, cantidad, k)
    return 0


if __name__ == "__main__":
    sys.exit(main())
