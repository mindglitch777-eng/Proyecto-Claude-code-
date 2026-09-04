#!/usr/bin/env python3
"""Guion exacto del operador para fabrica-demo-11 ("La mayoria esta
usando la IA mal"). 12 lineas, sin cambios."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from normalizador import texto_con_narracion_normalizada  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
MANIFEST_SALIDA = RAIZ / "capturas_voz/manifest_demo_11.json"

GUION = [
    ("hook", 0, "La mayoría usa la IA mal."),
    ("desarrollo", 0, "Abren ChatGPT, prueban otra herramienta, guardan veinte prompts..."),
    ("desarrollo", 1, "...y al final no construyen nada."),
    ("desarrollo", 2, "Porque tener herramientas no es tener un negocio."),
    ("giro", 0, "El juego cambia cuando conectás todo."),
    ("giro", 1, "Una idea se convierte en producto. El producto genera contenido. El contenido atrae personas."),
    ("pausa", 0, "Y ahí dejás de usar la IA para jugar..."),
    ("giro", 2, "...y empezás a usarla para construir."),
    ("desarrollo", 3, "Porque la ventaja no está en conocer cien herramientas."),
    ("payoff", 0, "Está en saber qué hacer con ellas."),
    ("payoff", 1, "Y estoy construyendo ese sistema desde cero."),
    ("cierre", 0, "Seguime y mirá cómo lo hago."),
]


def main() -> int:
    manifest = []
    for i, (unidad, idx, texto_crudo) in enumerate(GUION):
        texto_hablado = texto_con_narracion_normalizada(texto_crudo)
        manifest.append({
            "index": i, "unidad": unidad, "idx_en_unidad": idx,
            "id": f"{unidad}_{idx}", "texto_crudo": texto_crudo, "texto": texto_hablado,
        })
    MANIFEST_SALIDA.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_SALIDA.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Manifest escrito en {MANIFEST_SALIDA} ({len(manifest)} lineas)")
    for item in manifest:
        print(f"[{item['id']}] {item['texto']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
