#!/usr/bin/env python3
"""
Guion EXACTO entregado por el operador para el "Benchmark audiovisual
agresivo" (R7-32, docs/PROMPT_BENCHMARK_AGRESIVO.md): 14 lineas,
NINGUNA cambiada, sin estadisticas ni datos agregados por la fabrica --
el operador fue explicito: "NO cambies las frases. NO agregues
estadisticas. NO inventes datos."

Cada linea de guion es una unidad propia (a diferencia de demo_06/07/08/09
donde algunas unidades agrupaban 2-3 clips) -- el propio brief define
12 "escenas" con lenguaje visual DISTINTO cada una, y la escena 8
("triada" problema->oferta->IA) pide explicitamente que cada etapa
tenga "una identidad visual distinta", asi que se modela como 3
unidades separadas (giro_1/2/3) en vez de una unidad con 3 clips
compartiendo un solo componente.

Regla de voz (explicita del operador): EXACTAMENTE la misma Qwen3-TTS
que veniamos usando -- mismo modelo, misma voz clonada (librivox-11),
mismo instruct, mismo rate (1.25). La variable de esta prueba es
guion+direccion+edicion, NO el motor de voz. Ver
.github/workflows/generar-voz-demo-10.yml (mismo patron exacto que
generar-voz-demo-06.yml, misma referencia de voz).

Uso:
    python3 fabrica/voz/preparar_guion_demo_10.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from normalizador import texto_con_narracion_normalizada  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
MANIFEST_SALIDA = RAIZ / "capturas_voz/manifest_demo_10.json"

GUION = [
    ("hook", 0, "La inteligencia artificial no te va a hacer ganar plata."),
    ("hook", 1, "Y cuanto antes entiendas esto, mejor."),
    ("desarrollo", 0, "Porque hoy cualquiera puede generar cien videos, cien imágenes y cien productos en una tarde."),
    ("desarrollo", 1, "El problema es que producir más no significa vender más."),
    ("desarrollo", 2, "Podés automatizar absolutamente todo..."),
    ("desarrollo", 3, "...y seguir automatizando una idea que nadie quiere."),
    ("giro", 0, "Los que están aprovechando la IA de verdad hacen algo distinto."),
    ("giro", 1, "Primero encuentran un problema."),
    ("giro", 2, "Después encuentran una oferta."),
    ("giro", 3, "Y recién ahí utilizan IA para multiplicar lo que funciona."),
    ("revelacion", 0, "La máquina no decide qué quiere comprar la gente."),
    ("revelacion", 1, "Te ayuda a ejecutar."),
    ("payoff", 0, "La ventaja está en saber qué ejecutar."),
    ("payoff", 1, "Y eso cambia completamente el juego."),
]


def main() -> int:
    manifest = []
    for i, (unidad, idx, texto_crudo) in enumerate(GUION):
        texto_hablado = texto_con_narracion_normalizada(texto_crudo)
        manifest.append({
            "index": i,
            "unidad": unidad,
            "idx_en_unidad": idx,
            "id": f"{unidad}_{idx}",
            "texto_crudo": texto_crudo,
            "texto": texto_hablado,
        })

    MANIFEST_SALIDA.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_SALIDA.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Manifest escrito en {MANIFEST_SALIDA} ({len(manifest)} lineas)\n")
    for item in manifest:
        print(f"[{item['id']}]")
        print(f"  crudo:   {item['texto_crudo']}")
        print(f"  hablado: {item['texto']}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
