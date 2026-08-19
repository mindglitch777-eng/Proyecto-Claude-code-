#!/usr/bin/env python3
"""
Descargador de imagenes libres — para correr en Claude Code o GitHub Actions.

NO funciona en el sandbox del chat de Claude (red restringida a GitHub,
npm y PyPI). SI funciona donde la red esta abierta.

Fuentes:
  - Wikimedia Commons: bustos, figuras historicas, obras antiguas.
  - Openverse (WordPress): agrega Flickr, museos y bancos CC. Fotos
    modernas de situaciones cotidianas.

Ambas devuelven la licencia de cada archivo, y el script la registra
en assets/LICENCIAS.txt. Sin ese registro no hay defensa ante un reclamo.

Uso:
    python3 descargar_imagenes.py commons "Marcus Aurelius bust" marco-aurelio
    python3 descargar_imagenes.py openverse "person looking phone night" mensaje
    python3 descargar_imagenes.py --lote lista.json

Formato de lista.json:
{
  "salida": "assets/imagenes",
  "buscar": [
    {"fuente":"commons","q":"Seneca bust","nombre":"seneca"},
    {"fuente":"openverse","q":"woman awake bed night","nombre":"insomnio"}
  ]
}
"""

import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

UA = "ElCorte/1.0 (proyecto educativo; contacto via repo)"
LIC_OK = ("cc0", "pdm", "publicdomain", "cc-by", "by", "by-sa")
LIC_EVITAR = ("nc", "nd")   # no comercial / sin derivadas: no sirven


def pedir(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.loads(r.read())


def bajar(url, destino):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as r:
        datos = r.read()
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_bytes(datos)
    return len(datos)


def registrar(nombre, fuente, url, licencia, salida):
    p = Path(salida).parent / "LICENCIAS.txt"
    p.parent.mkdir(parents=True, exist_ok=True)
    from datetime import date
    linea = f"{nombre} | {fuente} | {url} | {licencia} | {date.today()}\n"
    with open(p, "a", encoding="utf-8") as f:
        f.write(linea)


def commons(q, nombre, salida="assets/imagenes"):
    """Wikimedia Commons. Ideal para figuras historicas y obras antiguas."""
    base = "https://commons.wikimedia.org/w/api.php"
    url = (f"{base}?action=query&generator=search&gsrsearch="
           f"{urllib.parse.quote(q)}&gsrnamespace=6&gsrlimit=8"
           f"&prop=imageinfo&iiprop=url|extmetadata|size"
           f"&iiurlwidth=1600&format=json")
    try:
        d = pedir(url)
    except Exception as e:
        print(f"  ERROR de red: {e}")
        return 1
    paginas = (d.get("query") or {}).get("pages")
    if not paginas:
        print(f"  Sin resultados para '{q}'.")
        return 1

    for _, pg in sorted(paginas.items()):
        ii = (pg.get("imageinfo") or [{}])[0]
        meta = ii.get("extmetadata", {})
        lic = (meta.get("LicenseShortName", {}).get("value", "") or "").lower()
        # Filtro: solo dominio publico o CC permisiva. Evitamos NC/ND.
        if any(x in lic for x in LIC_EVITAR):
            continue
        if not any(x in lic.replace(" ", "") for x in
                   ("publicdomain", "cc0", "cc-by", "pd-")):
            continue
        # Preferimos que tenga buen tamaño
        if ii.get("width", 0) < 900:
            continue
        u = ii.get("thumburl") or ii.get("url")
        if not u:
            continue
        ext = Path(urllib.parse.urlparse(u).path).suffix or ".jpg"
        dest = Path(salida) / f"{nombre}{ext}"
        try:
            kb = bajar(u, dest) / 1024
        except Exception as e:
            print(f"  no se pudo bajar ({e}), pruebo otra...")
            continue
        registrar(dest.name, "wikimedia", ii.get("descriptionurl", u),
                  meta.get("LicenseShortName", {}).get("value", "?"), salida)
        print(f"  OK: {dest} ({kb:.0f} KB) · {lic}")
        return 0
    print(f"  Ninguno de los resultados tenia licencia usable.")
    return 1


def openverse(q, nombre, salida="assets/imagenes"):
    """Openverse: fotos modernas con licencia CC. Para situaciones."""
    url = ("https://api.openverse.org/v1/images/?q=" + urllib.parse.quote(q) +
           "&license_type=commercial,modification&page_size=8")
    try:
        d = pedir(url)
    except Exception as e:
        print(f"  ERROR de red: {e}")
        return 1
    for r in d.get("results", []):
        u = r.get("url")
        if not u:
            continue
        if (r.get("width") or 0) < 900:
            continue
        ext = Path(urllib.parse.urlparse(u).path).suffix or ".jpg"
        dest = Path(salida) / f"{nombre}{ext}"
        try:
            kb = bajar(u, dest) / 1024
        except Exception:
            continue
        registrar(dest.name, "openverse", r.get("foreign_landing_url", u),
                  r.get("license", "?") + " " + str(r.get("license_version", "")),
                  salida)
        print(f"  OK: {dest} ({kb:.0f} KB) · {r.get('license')}")
        return 0
    print(f"  Sin resultados usables para '{q}'.")
    return 1


def lote(path):
    p = Path(path)
    if not p.exists():
        print(f"ERROR: no existe '{path}'.")
        return 1
    cfg = json.loads(p.read_text())
    salida = cfg.get("salida", "assets/imagenes")
    items = cfg.get("buscar", [])
    fallos = 0
    for i, it in enumerate(items, 1):
        print(f"[{i}/{len(items)}] {it.get('nombre')} ← {it.get('q')}")
        f = it.get("fuente", "openverse")
        r = commons(it["q"], it["nombre"], salida) if f == "commons" \
            else openverse(it["q"], it["nombre"], salida)
        fallos += r
    print(f"\n{len(items)-fallos}/{len(items)} descargadas en {salida}")
    print(f"Licencias registradas en {Path(salida).parent/'LICENCIAS.txt'}")
    return 1 if fallos else 0


def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        return
    if a[0] == "--lote":
        sys.exit(lote(a[1]) if len(a) > 1 else 1)
    if len(a) < 3:
        print("Uso: python3 descargar_imagenes.py <commons|openverse> \"busqueda\" nombre")
        sys.exit(1)
    sys.exit(commons(a[1], a[2]) if a[0] == "commons" else openverse(a[1], a[2]))


if __name__ == "__main__":
    main()
