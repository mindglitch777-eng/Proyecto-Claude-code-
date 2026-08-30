#!/usr/bin/env python3
"""
Busca musica de fondo libre de derechos, estilo motivacional/corrido,
DESDE EL RUNNER (internet completo) -- no desde la sesion de Claude
Code, por el mismo motivo que investigar_tts.py: pixabay.com y
freesound.org estan bloqueados desde ahi, y cada busqueda gasta tiempo
de sesion sin necesidad.

OJO CON EL GENERO PEDIDO
    Un corrido real (Peso Pluma, Fuerza Regida, etc.) tiene copyright
    comercial normal: usarlo en un video que vende algo es la forma
    mas rapida de perder la cuenta de TikTok por reclamo de derechos.
    Lo que este script busca es musica libre de derechos con ESE estilo
    (corrido/regional mexicano/motivacional), no las canciones famosas
    en si. Se anota bien la licencia de cada resultado para no usar
    nada por error.

FUENTES (todas con API o feed publico, sin login)
    - Pixabay Music: licencia propia, uso comercial libre, sin
      atribucion obligatoria. Tiene categoria por genero/mood.
    - Free Music Archive: mezcla de licencias (CC-BY, CC-BY-SA,
      dominio publico); hay que filtrar por licencia en cada resultado.
    - Jamendo: catalogo grande, licencia por track (algunos exigen
      atribucion, otros no) -- API publica.

Escribe MUSICA.md con los resultados y sus licencias.

Uso:
    python3 investigar_musica.py
"""
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).parent
UA = {"User-Agent": "Mozilla/5.0 (compatible; FabricaContenido-Investigacion/1.0)"}


def _get_json(url, headers=None):
    h = dict(UA)
    if headers:
        h.update(headers)
    pedido = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(pedido, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def buscar_pixabay(query, clave, limite=15):
    if not clave:
        return [], "sin clave (PIXABAY_API_KEY)"
    url = ("https://pixabay.com/api/videos/music/?"  # fallback generico
           if False else
           f"https://pixabay.com/api/?key={urllib.parse.quote(clave)}&"
           + urllib.parse.urlencode({"q": query}))
    # Pixabay no tiene endpoint publico de MUSICA en su API principal
    # (solo imagenes/video); su libreria de audio es solo web. Se deja
    # el intento por si acaso, pero lo esperable es que falle o venga
    # vacio -- Jamendo y FMA son la fuente real de audio con API.
    try:
        datos = _get_json(url)
    except Exception as e:
        return [], str(e)
    return [], "Pixabay no expone musica via API (solo la web); ver nota."


def buscar_jamendo(query, cliente_id, limite=15, tags=None):
    if not cliente_id:
        return [], "sin client_id (JAMENDO_CLIENT_ID) -- registrarse gratis en developer.jamendo.com"
    params = {"client_id": cliente_id, "format": "json", "limit": limite,
              "search": query, "include": "musicinfo",
              "audioformat": "mp32", "order": "popularity_total"}
    if tags:
        params["tags"] = tags
    url = "https://api.jamendo.com/v3.0/tracks/?" + urllib.parse.urlencode(params)
    try:
        datos = _get_json(url)
    except Exception as e:
        return [], str(e)
    items = []
    for t in datos.get("results", []):
        items.append({
            "titulo": t.get("name", "?"), "artista": t.get("artist_name", "?"),
            "duracion_s": t.get("duration", 0),
            "licencia": t.get("license_ccurl", "ver pagina"),
            "url": t.get("shareurl", ""), "descarga": t.get("audiodownload", ""),
            "tags": ", ".join((t.get("musicinfo") or {}).get("tags", {}).get("genres", []) or []),
        })
    return items, None


def buscar_fma(query, limite=15):
    """Free Music Archive: API v2 publica y de solo lectura, sin clave."""
    url = ("https://freemusicarchive.org/api/get/tracks.json?"
           + urllib.parse.urlencode({"q": query, "limit": limite}))
    try:
        datos = _get_json(url)
    except Exception as e:
        return [], str(e)
    items = []
    for t in (datos.get("dataset") or datos.get("aTracks") or []):
        if not isinstance(t, dict):
            continue
        items.append({
            "titulo": t.get("track_title", "?"),
            "artista": t.get("artist_name", "?"),
            "licencia": t.get("license_title", "?"),
            "url": t.get("track_url", ""),
        })
    return items, None


def main():
    import os
    jamendo_id = os.environ.get("JAMENDO_CLIENT_ID", "")
    pixabay_key = os.environ.get("PIXABAY_API_KEY", "")

    secciones = []

    for query, tags in (
            ("motivational corrido mexican regional", "world"),
            ("mexican banda motivational uplifting", None),
            ("motivational trap corrido inspiring", None),
            ("motivational english anthem inspiring hustle", None),
    ):
        items, err = buscar_jamendo(query, jamendo_id, tags=tags)
        secciones.append((f"Jamendo — \"{query}\"", items, err))
        time.sleep(1)

    for query in ("corrido instrumental royalty free",
                 "motivational hustle anthem instrumental"):
        items, err = buscar_fma(query)
        secciones.append((f"Free Music Archive — \"{query}\"", items, err))
        time.sleep(1)

    px_items, px_err = buscar_pixabay("motivational corrido", pixabay_key)
    secciones.append(("Pixabay Music", px_items, px_err))

    md = ["# Música de fondo — investigación con fuentes\n",
          f"_Generado desde el runner el {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}._\n",
          "\n**Ojo:** esto busca música LIBRE DE DERECHOS con el estilo pedido "
          "(corrido/regional mexicano/motivacional), no las canciones famosas "
          "en si -- esas tienen copyright comercial normal y usarlas en un "
          "video que vende algo es la forma mas rapida de perder la cuenta "
          "por reclamo de derechos.\n"]
    for titulo, items, err in secciones:
        md.append(f"\n## {titulo}\n")
        if err:
            md.append(f"_No se pudo consultar: {err}_\n")
        elif not items:
            md.append("_Sin resultados._\n")
        else:
            for it in items[:10]:
                partes = [f"**{it.get('titulo','?')}**"]
                if it.get("artista"):
                    partes.append(f"— {it['artista']}")
                if it.get("duracion_s"):
                    partes.append(f"({it['duracion_s']}s)")
                linea = " ".join(partes)
                if it.get("url"):
                    linea = f"[{linea}]({it['url']})"
                linea += f" — licencia: {it.get('licencia','?')}"
                md.append(f"- {linea}")

    Path("MUSICA.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"Escrito MUSICA.md")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
