#!/usr/bin/env python3
"""
Guion real de la Ronda 2 (fortalecimiento + prueba integral): un video
de prueba nuevo, NO reciclado de fabrica-demo-02, pensado para
ejercitar en un solo video todo lo que el operador pidio: hook,
desarrollo, escalada, payoff y cierre; numeros chicos y grandes,
dinero, porcentaje, fecha completa, nombre propio con tilde/ñ, pausas,
frases cortas y largas -- y, sobre todo, voz NUEVA generada de verdad
por Qwen3-TTS (no audio reciclado de la serie documental).

Cada "unidad" abajo puede tener VARIAS lineas de audio (multi-audio
real, generalizado en armar.ts) -- cada linea es un item separado del
manifest que este script produce, ya pasado por el normalizador real
de la fabrica.

Uso:
    python3 fabrica/voz/preparar_guion_demo_03.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from normalizador import texto_con_narracion_normalizada  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
MANIFEST_SALIDA = RAIZ / "capturas_voz/manifest_demo_03.json"

# (unidad, indice_dentro_de_la_unidad, texto_crudo)
GUION = [
    ("hook", 0, "Nicolás Gómez vendió lo mismo 2.847 veces."),
    ("hook", 1, "A $9 cada uno."),
    ("desarrollo", 0, "El 15 de marzo de 2024 subió su primer archivo. Cero ventas esa primera semana."),
    ("desarrollo", 1, "Para el mes 3 ya aparecía en las búsquedas: diez ventas por semana."),
    ("desarrollo", 2, "Al mes 8, cien ventas por semana... sin gastar un peso en anuncios."),
    ("escalada", 0, "En 8 meses, la curva no se movió despacio: se multiplicó por diez cada vez."),
    ("payoff", 0, "Un trabajo full-time cambia tu tiempo por plata, siempre en la misma proporción."),
    ("payoff", 1, "Un archivo de $9 se vende mientras dormís, 2.847 veces si hace falta."),
    ("cierre", 0, "El tiempo no escala. El archivo, sí."),
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
