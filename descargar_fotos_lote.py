#!/usr/bin/env python3
"""
Baja fotos reales para TODA una lista de personas de una sola corrida
-- para no depender de un pedido manual por persona cada vez que se
arma una tanda nueva de videos.

Lee assets/personas/pedido-lote.json, una lista de:
    {"nombre": "Nombre Apellido", "slug": "nombre-apellido",
     "consulta": "contexto opcional", "pista": "blogger/youtuber/..."}

Para cada entrada que TODAVIA no tenga assets/personas/<slug>/00.jpg,
busca (Wikidata -> Commons -> Openverse, ver buscar_foto.py) y baja el
mejor candidato. Si ninguna fuente da un resultado confiable, la deja
sin foto -- el video para esa persona sale con B-roll generico o fondo
limpio en vez de con la cara equivocada.

Al final escribe assets/personas/RESUMEN.md con que se encontro y que
no, para no tener que abrir cada carpeta a mano.

Corre en GitHub Actions (foto-persona.yml), no en la sesion de Claude
Code: este entorno tiene el acceso a internet bloqueado salvo GitHub,
npm y PyPI.
"""
import json
import sys
from pathlib import Path

from buscar_foto import descargar, mejor_candidato, pausa

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "assets" / "personas"
PEDIDO = DESTINO / "pedido-lote.json"


def main():
    if not PEDIDO.exists():
        print(f"No existe {PEDIDO}. Nada que hacer.")
        return 0

    lote = json.loads(PEDIDO.read_text(encoding="utf-8"))
    resumen = ["# Resultado del ultimo lote\n"]
    encontradas, sin_resultado, ya_existian = [], [], []

    for entrada in lote:
        nombre, slug = entrada["nombre"], entrada["slug"]
        carpeta = DESTINO / slug
        if (carpeta / "00.jpg").exists():
            print(f"[{slug}] ya tiene foto, se salta.")
            ya_existian.append((nombre, slug))
            continue

        print(f"[{slug}] buscando '{nombre}'...")
        candidato, fuente = mejor_candidato(nombre, entrada.get("consulta"), entrada.get("pista"))
        if not candidato:
            print(f"[{slug}] sin resultado confiable -- queda sin foto.")
            sin_resultado.append((nombre, slug))
            pausa()
            continue

        carpeta.mkdir(parents=True, exist_ok=True)
        try:
            descargar(candidato, carpeta / "00.jpg")
        except Exception as e:
            print(f"[{slug}] encontro candidato pero fallo la descarga: {e}")
            sin_resultado.append((nombre, slug))
            pausa()
            continue

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
        encontradas.append((nombre, slug, fuente, candidato["confianza"]))
        pausa()

    resumen.append(f"\n## Encontradas ({len(encontradas)})\n")
    for nombre, slug, fuente, confianza in encontradas:
        resumen.append(f"- **{nombre}** (`{slug}`) -- {fuente}, {confianza}\n")
    resumen.append(f"\n## Sin resultado -- el video sale sin foto ({len(sin_resultado)})\n")
    for nombre, slug in sin_resultado:
        resumen.append(f"- **{nombre}** (`{slug}`)\n")
    if ya_existian:
        resumen.append(f"\n## Ya tenian foto, no se tocaron ({len(ya_existian)})\n")
        for nombre, slug in ya_existian:
            resumen.append(f"- **{nombre}** (`{slug}`)\n")

    (DESTINO / "RESUMEN.md").write_text("".join(resumen), encoding="utf-8")
    print(f"\nListo: {len(encontradas)} encontradas, {len(sin_resultado)} sin resultado, {len(ya_existian)} ya existian.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
