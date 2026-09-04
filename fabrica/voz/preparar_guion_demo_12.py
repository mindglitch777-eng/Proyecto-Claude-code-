#!/usr/bin/env python3
"""Guion exacto del operador para fabrica-demo-12 ("El 98% pierde
dinero porque no vende productos digitales con IA"). 14 lineas, sin
cambios -- los numeros ($60.000.000.000, 98%, $5.000/$10.000/$50.000)
vienen dados por el propio guion del operador, no son inventados."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from normalizador import texto_con_narracion_normalizada  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
MANIFEST_SALIDA = RAIZ / "capturas_voz/manifest_demo_12.json"

GUION = [
    ("hook", 0, "El 98% de las personas pierde dinero todos los días."),
    ("hook", 1, "Y no vas a querer saber por qué."),
    ("desarrollo", 0, "Porque no venden productos digitales."),
    ("desarrollo", 1, "Un negocio digital que mueve más de 60 mil millones de dólares al año."),
    ("desarrollo", 2, "Y la inteligencia artificial lo está multiplicando."),
    ("casos", 0, "Hay casos documentados de creadores que pasaron de 0 a 5.000, 10.000 y hasta 50.000 dólares al mes."),
    ("critica", 0, "Pero el 98% sigue usando la IA para jugar."),
    ("critica", 1, "Cuando deberían usarla para construir activos."),
    ("sistema", 0, "El sistema es simple: idea, producto digital, contenido, venta automatizada."),
    ("sistema", 1, "Y no necesitas cámara, no necesitas edición, necesitas sistema."),
    ("prueba", 0, "Por eso estoy documentando el proceso completo."),
    ("prueba", 1, "Con casos reales, cifras exactas y errores que aprendí."),
    ("payoff", 0, "Para que dejes de perder plata y empieces a generar activos."),
    ("cierre", 0, "Seguime. Esta semana te muestro el sistema aplicado."),
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
