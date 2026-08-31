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


def buscar_archivo(nombre, consulta=None):
    """Busca en Commons y devuelve el primer archivo de imagen que
    matchee el nombre de la persona. 'consulta' es lo que se le manda
    al buscador (puede llevar contexto extra para desambiguar, ej.
    "Becky Beach blogger"); el filtro de titulo sigue exigiendo el
    nombre solo, no el contexto -- si no, nunca matchea nada."""
    parametros = {
        "action": "query",
        "generator": "search",
        "gsrsearch": f"{consulta or nombre} filetype:bitmap",
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


def buscar_openverse(nombre, consulta=None):
    """Segunda fuente si Commons no tiene nada: Openverse agrega Flickr
    y otros bancos CC -- mas chance con gente moderna (charlas, fotos
    de conferencias) que Commons, que es mas de figuras historicas."""
    parametros = {
        "q": consulta or nombre,
        "license_type": "commercial,modification",
        "page_size": "20",
    }
    url = f"https://api.openverse.org/v1/images/?{urllib.parse.urlencode(parametros)}"
    pedido = urllib.request.Request(url, headers={"User-Agent": AGENTE})
    with urllib.request.urlopen(pedido, timeout=30) as r:
        datos = json.loads(r.read().decode("utf-8"))
    palabras = [w.lower() for w in re.findall(r"\w+", nombre) if len(w) > 2]
    candidatos = []
    for r in datos.get("results", []):
        titulo = (r.get("title") or "")
        if not all(w in titulo.lower() for w in palabras):
            continue
        if (r.get("width") or 0) < 400:
            continue
        candidatos.append((titulo, r))
    return candidatos


def bajar(nombre, slug, consulta=None, cuantos=3):
    """Baja hasta 'cuantos' candidatos, NO solo el primero. Un nombre
    comun (una persona que se llama igual que una playa de verdad, como
    paso con 'Becky Beach') puede traer basura en el primer resultado
    y algo bueno en el tercero -- bajar varios y mirarlos es mas
    confiable que confiar a ciegas en el orden del buscador."""
    carpeta = DESTINO / slug

    candidatos = buscar_archivo(nombre, consulta)
    fuente = "commons"
    if not candidatos:
        print(f"Sin resultados en Wikimedia Commons para '{nombre}', probando Openverse.")
        candidatos = buscar_openverse(nombre, consulta)
        fuente = "openverse"
    if not candidatos:
        print(f"Sin resultados en ninguna fuente para '{nombre}'.")
        print("No se baja nada -- mejor sin foto que con la persona equivocada.")
        return False
    print(f"[{slug}] candidatos en {fuente}: " + ", ".join(t for t, _ in candidatos[:5]))

    carpeta.mkdir(parents=True, exist_ok=True)
    creditos = [f"# Candidatos -- {nombre}\n\nRevisar cada uno ANTES de usarlo: un nombre comun puede\ntraer una persona o lugar equivocado.\n"]
    n = 0
    for titulo, info in candidatos[:cuantos]:
        if fuente == "commons":
            src = info.get("thumburl") or info.get("url")
            meta = info.get("extmetadata") or {}
            licencia = (meta.get("LicenseShortName") or {}).get("value", "sin dato")
            autor = re.sub(r"<[^>]+>", "", (meta.get("Artist") or {}).get("value", "sin dato"))
            enlace = info.get("descriptionurl", info.get("url", ""))
        else:
            src = info.get("url")
            licencia = f"{info.get('license', '?')} {info.get('license_version', '')}".strip()
            autor = info.get("creator", "sin dato")
            enlace = info.get("foreign_landing_url", src)

        destino = carpeta / f"candidato-{n:02d}.jpg"
        try:
            pedido = urllib.request.Request(src, headers={"User-Agent": AGENTE})
            with urllib.request.urlopen(pedido, timeout=60) as r, open(destino, "wb") as out:
                out.write(r.read())
        except Exception as e:
            print(f"  fallo bajando candidato {n}: {e}")
            continue
        creditos.append(f"## candidato-{n:02d}.jpg\n- Titulo: {titulo}\n- Licencia: {licencia}\n- Autor: {autor}\n- Enlace: {enlace}\n")
        print(f"[{slug}] candidato-{n:02d}.jpg <- {titulo} ({licencia}, via {fuente})")
        n += 1

    (carpeta / "CREDITOS.md").write_text("\n".join(creditos), encoding="utf-8")
    return n > 0


def main():
    if len(sys.argv) < 3:
        print("Uso: python3 descargar_foto_persona.py \"Nombre Apellido\" slug [\"consulta de busqueda\"]")
        return 1
    nombre, slug = sys.argv[1], sys.argv[2]
    consulta = sys.argv[3] if len(sys.argv) > 3 else None
    DESTINO.mkdir(parents=True, exist_ok=True)
    return 0 if bajar(nombre, slug, consulta) else 2


if __name__ == "__main__":
    sys.exit(main())
