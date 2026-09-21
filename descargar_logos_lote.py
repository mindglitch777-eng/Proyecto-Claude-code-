#!/usr/bin/env python3
"""
Baja logos reales para TODA una lista de marcas/herramientas de una
sola corrida -- mismo patron que descargar_fotos_lote.py (Regla de
logos reales, CLAUDE.md, 2026-09-21), aplicado a marcas en vez de
personas.

Lee assets/logos/pedido-lote.json, una lista de:
    {"nombre": "Nombre real de la marca", "slug": "slug-carpeta",
     "pista": "contexto opcional para desambiguar (ej. 'empresa de IA')"}

Para cada entrada que TODAVIA no tenga assets/logos/<slug>/logo.*, busca
en Wikidata (P154 -- logo image) y baja el logo oficial. Si no hay un
resultado confiable, la deja sin logo -- mejor sin logo que con el logo
equivocado (mismo criterio que buscar_foto.py/descargar_logo_empresa.py).

Al final escribe assets/logos/RESUMEN.md con que se encontro y que no.

Corre en GitHub Actions (logo-empresa.yml), no en la sesion de Claude
Code: este entorno tiene el acceso a Wikidata/Commons bloqueado.
"""
import json
import sys
from pathlib import Path

from buscar_foto import descargar, pausa
from descargar_logo_empresa import buscar_logo_wikidata

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "assets" / "logos"
PEDIDO = DESTINO / "pedido-lote.json"


def ya_tiene_logo(carpeta: Path) -> bool:
    return any((carpeta / f"logo.{ext}").exists() for ext in ("svg", "png", "jpg", "jpeg"))


def main():
    if not PEDIDO.exists():
        print(f"No existe {PEDIDO}. Nada que hacer.")
        return 0

    lote = json.loads(PEDIDO.read_text(encoding="utf-8"))
    resumen = ["# Resultado del ultimo lote de logos\n"]
    encontrados, sin_resultado, ya_existian = [], [], []

    for entrada in lote:
        nombre, slug = entrada["nombre"], entrada["slug"]
        carpeta = DESTINO / slug
        if ya_tiene_logo(carpeta):
            print(f"[{slug}] ya tiene logo, se salta.")
            ya_existian.append((nombre, slug))
            continue

        print(f"[{slug}] buscando logo de '{nombre}'...")
        candidato = buscar_logo_wikidata(nombre, entrada.get("pista"))
        if not candidato:
            print(f"[{slug}] sin logo confiable en Wikidata (P154) -- queda sin logo.")
            sin_resultado.append((nombre, slug))
            pausa()
            continue

        carpeta.mkdir(parents=True, exist_ok=True)
        ext = candidato["src"].rsplit(".", 1)[-1].split("?")[0].lower()
        ext = ext if ext in ("svg", "png", "jpg", "jpeg") else "png"
        try:
            descargar(candidato, carpeta / f"logo.{ext}")
        except Exception as e:
            print(f"[{slug}] encontro el logo pero fallo la descarga: {e}")
            sin_resultado.append((nombre, slug))
            pausa()
            continue

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
        encontrados.append((nombre, slug, candidato["confianza"]))
        pausa()

    resumen.append(f"\n## Encontrados ({len(encontrados)})\n")
    for nombre, slug, confianza in encontrados:
        resumen.append(f"- **{nombre}** (`{slug}`) -- {confianza}\n")
    resumen.append(f"\n## Sin resultado -- el video sale sin logo, solo texto ({len(sin_resultado)})\n")
    for nombre, slug in sin_resultado:
        resumen.append(f"- **{nombre}** (`{slug}`)\n")
    if ya_existian:
        resumen.append(f"\n## Ya tenian logo, no se tocaron ({len(ya_existian)})\n")
        for nombre, slug in ya_existian:
            resumen.append(f"- **{nombre}** (`{slug}`)\n")

    (DESTINO / "RESUMEN.md").write_text("".join(resumen), encoding="utf-8")
    print(f"\nListo: {len(encontrados)} encontrados, {len(sin_resultado)} sin resultado, {len(ya_existian)} ya existian.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
