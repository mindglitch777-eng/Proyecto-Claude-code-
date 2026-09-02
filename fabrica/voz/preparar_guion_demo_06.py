#!/usr/bin/env python3
"""
Guion de la Ronda 5 (laboratorio audiovisual inteligente): video de
prueba nuevo, NO reciclado de demo_04/05 -- persona, numeros y topico
distintos (Tomás, curso online, $89).

Mismo arco de forma comparable a propósito (hook -> desarrollo ->
aceleracion -> pausa -> impacto/revelacion -> nuevo desarrollo ->
cierre) para poder comparar directamente contra demo_05 y aislar la
variable real de esta ronda: el Director de Retencion 2.0 + el Critico
Audiovisual analizando el video completo.

Un valor ($89, dinero) se establece en el hook y se repite en el
impacto -- ejercita composicion/repeticion_datos.ts (deriva
$3.560 = 89 x 40 en vez de repetir la cifra).

Uso:
    python3 fabrica/voz/preparar_guion_demo_06.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from normalizador import texto_con_narracion_normalizada  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
MANIFEST_SALIDA = RAIZ / "capturas_voz/manifest_demo_06.json"

GUION = [
    ("hook", 0, "Tomás vende su curso a 89 dólares."),
    ("hook", 1, "El primer mes, vendió apenas seis."),
    ("desarrollo", 0, "Los primeros meses, mandaba mensajes uno por uno."),
    ("desarrollo", 1, "Al mes cinco, armó un embudo automático."),
    ("desarrollo", 2, "Al mes ocho, vendió cuarenta cursos en una semana."),
    ("aceleracion", 0, "De seis a cuarenta ventas por semana... la curva no fue pareja."),
    ("pausa", 0, "El curso nunca cambió de precio."),
    ("impacto", 0, "Sigue costando 89 dólares."),
    ("impacto", 1, "Cuarenta ventas esa semana, a 89 dólares cada una, son más de tres mil quinientos dólares."),
    ("desarrollo2", 0, "Lo único que cambió fue quién mandaba el mensaje: un sistema, no él."),
    ("cierre", 0, "El curso es el mismo archivo."),
    ("cierre", 1, "El alcance, no."),
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
