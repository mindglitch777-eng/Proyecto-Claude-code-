#!/usr/bin/env python3
"""
Baja UNA foto real de una persona publica desde Wikimedia Commons, para
los videos documentales (caso real con nombre y apellido, a diferencia
de los guiones ilustrativos que usan metraje generico de Pexels).

Wikimedia Commons y no Pexels/Google Images a proposito: son fotos con
licencia libre verificable (CC-BY / CC-BY-SA / dominio publico), no
"la primera que aparece" -- para una persona real con nombre hace falta
saber que la foto se puede volver a usar.

Corre en un runner de GitHub Actions por el mismo motivo que
descargar_metraje.py: este entorno de Claude Code tiene bloqueado el
acceso general a internet (se probo con Wikipedia y da EGRESS_BLOCKED),
el runner no.

Uso:
    python3 descargar_foto_persona.py "Pieter Levels" pieter-levels

Deja el archivo en assets/personas/<slug>/00.jpg y un CREDITOS.md con
autor, licencia y enlace, como pide Wikimedia Commons.
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "assets" / "personas"
API = "https://commons.wikimedia.org/w/api.php"
AGENTE = "Mozilla/5.0 (compatible; FabricaContenido/1.0; +https://github.com)"


def buscar_archivo(nombre):
    """Busca en Commons y devuelve el primer archivo de imagen que
    matchee el nombre de la persona."""
    parametros = {
        "action": "query",
        "generator": "search",
        "gsrsearch": f"{nombre} filetype:bitmap",
        "gsrnamespace": "6",  # namespace File:
        "gsrlimit": "8",
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size",
        "iiurlwidth": "1200",
        "format": "json",
    }
    url = f"{API}?{urllib.parse.urlencode(parametros)}"
    pedido = urllib.request.Request(url, headers={"User-Agent": AGENTE})
    with urllib.request.urlopen(pedido, timeout=30) as r:
        datos = json.loads(r.read().decode("utf-8"))
    # Las palabras del nombre (mas de 2 letras) tienen que estar TODAS
    # en el titulo del archivo. Sin esto, buscar "Pieter Levels" puede
    # traer un cuadro de "Pieter Bruegel" -- paso de verdad, la busqueda
    # trajo eso primero antes de este chequeo.
    palabras = [w.lower() for w in re.findall(r"\w+", nombre) if len(w) > 2]

    paginas = (datos.get("query") or {}).get("pages") or {}
    candidatos = []
    for p in paginas.values():
        info = (p.get("imageinfo") or [None])[0]
        if not info:
            continue
        titulo = p.get("title", "")
        titulo_norm = titulo.lower()
        if not all(w in titulo_norm for w in palabras):
            continue
        # Preferir fotos, no logos/diagramas: al menos 400px de ancho.
        if (info.get("width") or 0) < 400:
            continue
        candidatos.append((titulo, info))
    return candidatos


def bajar(nombre, slug):
    carpeta = DESTINO / slug
    candidatos = buscar_archivo(nombre)
    if not candidatos:
        print(f"Sin resultados en Wikimedia Commons para '{nombre}'.")
        print("No se baja nada -- mejor sin foto que con la persona equivocada.")
        return False
    print(f"[{slug}] candidatos encontrados: " + ", ".join(t for t, _ in candidatos[:5]))

    titulo, info = candidatos[0]
    src = info.get("thumburl") or info.get("url")
    carpeta.mkdir(parents=True, exist_ok=True)
    destino = carpeta / "00.jpg"
    pedido = urllib.request.Request(src, headers={"User-Agent": AGENTE})
    with urllib.request.urlopen(pedido, timeout=60) as r, open(destino, "wb") as out:
        out.write(r.read())

    meta = info.get("extmetadata") or {}
    licencia = (meta.get("LicenseShortName") or {}).get("value", "sin dato")
    autor = re.sub(r"<[^>]+>", "", (meta.get("Artist") or {}).get("value", "sin dato"))
    (carpeta / "CREDITOS.md").write_text(
        f"# Credito -- {nombre}\n\n"
        f"- Archivo: {titulo}\n"
        f"- Licencia: {licencia}\n"
        f"- Autor: {autor}\n"
        f"- Fuente: {info.get('descriptionurl', info.get('url', ''))}\n",
        encoding="utf-8",
    )
    print(f"[{slug}] OK -- {titulo} ({licencia}) -> {destino}")
    return True


def main():
    if len(sys.argv) < 3:
        print("Uso: python3 descargar_foto_persona.py \"Nombre Apellido\" slug")
        return 1
    nombre, slug = sys.argv[1], sys.argv[2]
    DESTINO.mkdir(parents=True, exist_ok=True)
    return 0 if bajar(nombre, slug) else 2


if __name__ == "__main__":
    sys.exit(main())
