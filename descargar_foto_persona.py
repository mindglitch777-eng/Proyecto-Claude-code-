#!/usr/bin/env python3
"""
Baja UNA foto real de una persona publica, para un pedido suelto.
Para una tanda entera de personas (una serie de videos nueva), usar
descargar_fotos_lote.py en cambio -- este script sigue existiendo para
pedidos puntuales via GitHub Actions (workflow_dispatch con un nombre).

Busca en Wikidata / Wikimedia Commons / Openverse, en ese orden de
confianza (ver buscar_foto.py). Corre en un runner de GitHub Actions y
no en la sesion de Claude Code: este entorno tiene bloqueado el acceso
general a internet (se probo con Wikipedia y dio EGRESS_BLOCKED), el
runner no.

Uso:
    python3 descargar_foto_persona.py "Pieter Levels" pieter-levels
    python3 descargar_foto_persona.py "Becky Beach" becky-beach "Becky Beach blogger"
"""
import sys
from pathlib import Path

from buscar_foto import descargar, mejor_candidato

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "assets" / "personas"


def bajar(nombre, slug, consulta=None, pista=None):
    candidato, fuente = mejor_candidato(nombre, consulta, pista)
    if not candidato:
        print(f"[{slug}] sin resultado confiable para '{nombre}' en ninguna fuente.")
        print("No se baja nada -- mejor sin foto que con la persona equivocada.")
        return False

    carpeta = DESTINO / slug
    carpeta.mkdir(parents=True, exist_ok=True)
    try:
        descargar(candidato, carpeta / "00.jpg")
    except Exception as e:
        print(f"[{slug}] encontro un candidato pero fallo la descarga: {e}")
        return False

    (carpeta / "CREDITOS.md").write_text(
        f"# Credito -- {nombre}\n\n"
        f"- Fuente: {fuente}\n"
        f"- Titulo/archivo: {candidato['titulo']}\n"
        f"- Confianza: {candidato['confianza']}\n"
        f"- Licencia: {candidato['licencia']}\n"
        f"- Autor: {candidato['autor']}\n"
        f"- Enlace: {candidato['enlace']}\n",
        encoding="utf-8",
    )
    print(f"[{slug}] OK <- {candidato['titulo']} (via {fuente}, {candidato['confianza']})")
    return True


def main():
    if len(sys.argv) < 3:
        print('Uso: python3 descargar_foto_persona.py "Nombre Apellido" slug ["consulta de busqueda"] ["pista"]')
        return 1
    nombre, slug = sys.argv[1], sys.argv[2]
    consulta = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else None
    pista = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] else None
    DESTINO.mkdir(parents=True, exist_ok=True)
    return 0 if bajar(nombre, slug, consulta, pista) else 2


if __name__ == "__main__":
    sys.exit(main())
