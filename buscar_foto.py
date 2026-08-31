#!/usr/bin/env python3
"""
Busqueda de fotos reales con licencia libre, compartida por
descargar_foto_persona.py (un pedido suelto) y descargar_fotos_lote.py
(una lista entera, para que una tanda de videos nueva no dependa de
pedir foto por foto).

Tres fuentes, en orden de confianza:
  1. Wikidata: si la persona tiene una ficha (Q-item), su propiedad
     P18 apunta a UNA foto elegida por Wikidata para ESA persona
     puntual -- mucha mas precision que adivinar por palabras en un
     titulo de archivo.
  2. Wikimedia Commons: busqueda por palabras clave, filtrando a que
     esten TODAS las palabras del nombre en el titulo del archivo.
  3. Openverse: mismo filtro, agrega Flickr y otros bancos CC -- mas
     chance con gente actual (charlas, conferencias) que Commons.

Filosofia (la misma de siempre en este proyecto): mejor sin foto que
con la persona equivocada. Ninguna de las tres fuentes tiene cobertura
real de "creadores de internet" que no son figuras publicas notables
-- para esos casos el resultado esperado y correcto es NO encontrar
nada, y el video sigue sin foto (ya soportado: CasoConfig.foto es
opcional).
"""
import json
import re
import time
import urllib.parse
import urllib.request

AGENTE = "Mozilla/5.0 (compatible; FabricaContenido/1.0; +https://github.com)"


def _get(url, timeout=30):
    pedido = urllib.request.Request(url, headers={"User-Agent": AGENTE})
    with urllib.request.urlopen(pedido, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def _palabras(nombre):
    return [w.lower() for w in re.findall(r"\w+", nombre) if len(w) > 2]


def buscar_wikidata(nombre, pista=None):
    """Devuelve un candidato {titulo, src, licencia, autor, enlace,
    confianza} si encuentra una ficha de Wikidata con foto (P18) para
    'nombre', o None. 'pista' (ej. 'blogger', 'youtuber') desempata
    cuando hay varias personas con el mismo nombre."""
    parametros = {
        "action": "wbsearchentities", "search": nombre, "language": "es",
        "type": "item", "limit": "5", "format": "json",
    }
    datos = _get(f"https://www.wikidata.org/w/api.php?{urllib.parse.urlencode(parametros)}")
    candidatos = datos.get("search") or []
    if not candidatos:
        return None

    if pista:
        pista_baja = pista.lower()
        candidatos.sort(key=lambda c: 0 if pista_baja in (c.get("description") or "").lower() else 1)

    for c in candidatos:
        qid = c["id"]
        claims = _get(f"https://www.wikidata.org/w/api.php?action=wbgetclaims&entity={qid}&property=P18&format=json")
        p18 = (claims.get("claims") or {}).get("P18") or []
        if not p18:
            continue
        archivo = p18[0]["mainsnak"]["datavalue"]["value"]
        info = _info_commons(archivo)
        if not info:
            continue
        return {
            "titulo": archivo, "src": info["src"], "licencia": info["licencia"],
            "autor": info["autor"], "enlace": info["enlace"],
            "confianza": "alta (Wikidata P18 para esta persona puntual)",
        }
    return None


def _info_commons(nombre_archivo):
    """Resuelve un nombre de archivo de Commons (ej. 'Foo.jpg') a su
    URL descargable + metadatos de licencia."""
    parametros = {
        "action": "query", "titles": f"File:{nombre_archivo}", "prop": "imageinfo",
        "iiprop": "url|extmetadata", "iiurlwidth": "1200", "format": "json",
    }
    datos = _get(f"https://commons.wikimedia.org/w/api.php?{urllib.parse.urlencode(parametros)}")
    paginas = (datos.get("query") or {}).get("pages") or {}
    for p in paginas.values():
        info = (p.get("imageinfo") or [None])[0]
        if not info:
            continue
        meta = info.get("extmetadata") or {}
        return {
            "src": info.get("thumburl") or info.get("url"),
            "licencia": (meta.get("LicenseShortName") or {}).get("value", "sin dato"),
            "autor": re.sub(r"<[^>]+>", "", (meta.get("Artist") or {}).get("value", "sin dato")),
            "enlace": info.get("descriptionurl", info.get("url", "")),
        }
    return None


def buscar_commons(nombre, consulta=None):
    parametros = {
        "action": "query", "generator": "search",
        "gsrsearch": f"{consulta or nombre} filetype:bitmap", "gsrnamespace": "6",
        "gsrlimit": "8", "prop": "imageinfo", "iiprop": "url|extmetadata|size",
        "iiurlwidth": "1200", "format": "json",
    }
    datos = _get(f"https://commons.wikimedia.org/w/api.php?{urllib.parse.urlencode(parametros)}")
    palabras = _palabras(nombre)
    resultado = []
    for p in (datos.get("query") or {}).get("pages", {}).values():
        info = (p.get("imageinfo") or [None])[0]
        if not info:
            continue
        titulo = p.get("title", "")
        if not all(w in titulo.lower() for w in palabras):
            continue
        if (info.get("width") or 0) < 600:
            continue
        meta = info.get("extmetadata") or {}
        resultado.append({
            "titulo": titulo, "src": info.get("thumburl") or info.get("url"),
            "licencia": (meta.get("LicenseShortName") or {}).get("value", "sin dato"),
            "autor": re.sub(r"<[^>]+>", "", (meta.get("Artist") or {}).get("value", "sin dato")),
            "enlace": info.get("descriptionurl", info.get("url", "")),
            "confianza": "media (coincide el nombre en el titulo del archivo)",
        })
    return resultado


def buscar_openverse(nombre, consulta=None):
    parametros = {"q": consulta or nombre, "license_type": "commercial,modification", "page_size": "20"}
    datos = _get(f"https://api.openverse.org/v1/images/?{urllib.parse.urlencode(parametros)}")
    palabras = _palabras(nombre)
    resultado = []
    for r in datos.get("results", []):
        titulo = r.get("title") or ""
        if not all(w in titulo.lower() for w in palabras):
            continue
        if (r.get("width") or 0) < 600:
            continue
        resultado.append({
            "titulo": titulo, "src": r.get("url"),
            "licencia": f"{r.get('license', '?')} {r.get('license_version', '')}".strip(),
            "autor": r.get("creator", "sin dato"), "enlace": r.get("foreign_landing_url", r.get("url")),
            "confianza": "media (coincide el nombre en el titulo)",
        })
    return resultado


def mejor_candidato(nombre, consulta=None, pista=None):
    """Intenta las tres fuentes en orden de confianza y devuelve el
    primer candidato que aparezca, o None. No junta ni compara varios:
    en cuanto una fuente de mas confianza contesta, se usa esa."""
    try:
        wd = buscar_wikidata(nombre, pista)
        if wd:
            return wd, "wikidata"
    except Exception as e:
        print(f"  wikidata fallo para '{nombre}': {e}")

    try:
        cm = buscar_commons(nombre, consulta)
        if cm:
            return cm[0], "commons"
    except Exception as e:
        print(f"  commons fallo para '{nombre}': {e}")

    try:
        ov = buscar_openverse(nombre, consulta)
        if ov:
            return ov[0], "openverse"
    except Exception as e:
        print(f"  openverse fallo para '{nombre}': {e}")

    return None, None


def descargar(candidato, destino):
    pedido = urllib.request.Request(candidato["src"], headers={"User-Agent": AGENTE})
    with urllib.request.urlopen(pedido, timeout=60) as r, open(destino, "wb") as out:
        out.write(r.read())


def pausa():
    time.sleep(0.5)
