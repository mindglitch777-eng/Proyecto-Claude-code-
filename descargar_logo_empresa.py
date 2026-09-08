#!/usr/bin/env python3
"""
Baja el logo real de una empresa/marca publica desde Wikidata (P154 --
"logo image", la propiedad que Wikidata usa especificamente para
logos, no P18 que es para fotos de personas) + Wikimedia Commons.
Mismo patron de confianza que buscar_foto.py: mejor sin logo que con
el logo equivocado.

Uso, se usa SOLO desde un runner de GitHub Actions (este entorno tiene
bloqueado el acceso a Wikidata/Commons, igual que con las fotos de
personas):
    python3 descargar_logo_empresa.py "SpaceX" spacex
"""
import sys
import urllib.parse
from pathlib import Path

from buscar_foto import _get, _info_commons, descargar

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "assets" / "logos"


def buscar_logo_wikidata(nombre, pista=None):
    parametros = {
        "action": "wbsearchentities", "search": nombre, "language": "en",
        "type": "item", "limit": "5", "format": "json",
    }
    datos = _get(f"https://www.wikidata.org/w/api.php?{urllib.parse.urlencode(parametros)}")
    candidatos = datos.get("search") or []
    if pista:
        # Desambigua nombres ambiguos (ej. "Amazon" rio vs empresa,
        # "Apple" fruta vs empresa) -- mismo criterio que buscar_wikidata
        # de buscar_foto.py para personas.
        pista_baja = pista.lower()
        candidatos.sort(key=lambda c: 0 if pista_baja in (c.get("description") or "").lower() else 1)
    for c in candidatos:
        qid = c["id"]
        claims = _get(f"https://www.wikidata.org/w/api.php?action=wbgetclaims&entity={qid}&property=P154&format=json")
        p154 = (claims.get("claims") or {}).get("P154") or []
        if not p154:
            continue
        archivo = p154[0]["mainsnak"]["datavalue"]["value"]
        info = _info_commons(archivo)
        if not info:
            continue
        return {
            "titulo": archivo, "src": info["src"], "licencia": info["licencia"],
            "autor": info["autor"], "enlace": info["enlace"],
            "confianza": "alta (Wikidata P154 -- logo oficial de la ficha)",
        }
    return None


def main():
    if len(sys.argv) < 3:
        print('Uso: python3 descargar_logo_empresa.py "Nombre de la empresa" slug ["pista para desambiguar"]')
        return 1
    nombre, slug = sys.argv[1], sys.argv[2]
    pista = sys.argv[3] if len(sys.argv) > 3 else None

    candidato = buscar_logo_wikidata(nombre, pista)
    if not candidato:
        print(f"[{slug}] sin logo confiable en Wikidata (P154) para '{nombre}'. No se baja nada.")
        return 2

    carpeta = DESTINO / slug
    carpeta.mkdir(parents=True, exist_ok=True)
    ext = candidato["src"].rsplit(".", 1)[-1].split("?")[0].lower()
    ext = ext if ext in ("svg", "png", "jpg", "jpeg") else "png"
    destino_archivo = carpeta / f"logo.{ext}"
    try:
        descargar(candidato, destino_archivo)
    except Exception as e:
        print(f"[{slug}] encontro el logo pero fallo la descarga: {e}")
        return 2

    (carpeta / "CREDITOS.md").write_text(
        f"# Credito -- logo de {nombre}\n\n"
        f"- Fuente: Wikidata (P154) / Wikimedia Commons\n"
        f"- Titulo/archivo: {candidato['titulo']}\n"
        f"- Confianza: {candidato['confianza']}\n"
        f"- Licencia: {candidato['licencia']}\n"
        f"- Autor: {candidato['autor']}\n"
        f"- Enlace: {candidato['enlace']}\n\n"
        f"Nota: es una marca registrada de {nombre}, usada aca solo para "
        f"identificacion editorial (referenciar/citar a la empresa en un "
        f"contenido que habla de ella), nunca como si {nombre} auspiciara "
        f"o estuviera asociada a Taller de Activos.\n",
        encoding="utf-8",
    )
    print(f"[{slug}] OK <- {candidato['titulo']} ({candidato['licencia']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
