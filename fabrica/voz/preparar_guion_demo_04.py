#!/usr/bin/env python3
"""
Guion de la Ronda 3 (calidad audiovisual): video de prueba nuevo, NO
reciclado de fabrica-demo-03, diseñado especificamente para ejercitar
las mejoras de esta ronda:

  - Arco de ritmo real: calma (hook) -> desarrollo -> aceleracion
    (cifra) -> PAUSA real (silencio antes de la revelacion, tecnica
    narrativa deliberada) -> impacto/revelacion -> nuevo desarrollo ->
    cierre con anticipo.
  - Un valor ($47, dinero) se establece en el hook y se vuelve a
    mencionar en el impacto -- ahi se ejercita
    fabrica/composicion/repeticion_datos.ts: en vez de repetir "$47"
    como cifra protagonista, se muestra la consecuencia real derivada
    (47 clientes x $47 = $2.209).
  - 7 categorias de componente distintas, ninguna repetida
    consecutiva (texto, timeline, cifra, texto/pausa, comparacion,
    lista, texto/cierre).
  - El golpe final del cierre es "fuerte" (fogonazo/negro/sacudon) y
    la escena anterior debe preparar ese impacto con el nuevo
    Anticipo.

Uso:
    python3 fabrica/voz/preparar_guion_demo_04.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from normalizador import texto_con_narracion_normalizada  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
MANIFEST_SALIDA = RAIZ / "capturas_voz/manifest_demo_04.json"

GUION = [
    ("hook", 0, "Jai Rodríguez cobra $47."),
    ("hook", 1, "Por algo que armó en dos tardes."),
    ("desarrollo", 0, "Las primeras 3 ventas fueron casi por error."),
    ("desarrollo", 1, "Para el mes 4, ya eran 19 clientes en una semana."),
    ("desarrollo", 2, "Al mes 9, cerró 47 clientes en una sola semana."),
    ("aceleracion", 0, "De 3 a 47 clientes por semana... la curva no subió despacio."),
    ("pausa", 0, "El precio nunca cambió."),
    ("impacto", 0, "Sigue costando $47."),
    ("impacto", 1, "47 clientes en una semana, a $47 cada uno, son casi 2.209 dólares."),
    ("desarrollo2", 0, "Lo único que cambió fue dónde lo mostraba, y a quién."),
    ("cierre", 0, "El archivo es el mismo."),
    ("cierre", 1, "El resultado, no."),
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
