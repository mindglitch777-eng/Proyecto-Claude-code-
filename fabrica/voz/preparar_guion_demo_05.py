#!/usr/bin/env python3
"""
Guion de la Ronda 4 (Director de Edicion): video de prueba nuevo, NO
reciclado de demo_03/demo_04 -- guion, persona, numeros y voz distintos.

Arco DELIBERADAMENTE de forma comparable a fabrica-demo-04 (hook ->
desarrollo -> aceleracion -> pausa -> impacto/revelacion -> nuevo
desarrollo -> cierre): es un experimento controlado, no una
coincidencia -- para que la comparacion demo_04 vs demo_05 aisle UNA
variable real (el Director de Edicion activo, decidiendo intencion/
energia/estilos/microeventos/golpe-motivado por su cuenta) en vez de
comparar dos guiones de estructura distinta. Ver MEJORAS_RONDA4.md.

Diferencia real respecto de demo_04 (no solo cosmetica): la escena de
"pausa" ya NO fuerza `golpe: 'ninguno'` a mano en el generador -- se
deja que DirectorAudio.decidirParaUnidad() decida de verdad (nivel
'calma' -> 'fundido'/'iris'), corrigiendo una excepcion manual real que
tenia generar_demo_04.ts (documentada en su momento, ahora resuelta).

Un valor ($340, dinero) se establece en el hook y se repite en el
impacto -- ejercita composicion/repeticion_datos.ts: en vez de repetir
"$340", se muestra la consecuencia derivada real (18 videos x $340 =
$6.120).

Uso:
    python3 fabrica/voz/preparar_guion_demo_05.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from normalizador import texto_con_narracion_normalizada  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
MANIFEST_SALIDA = RAIZ / "capturas_voz/manifest_demo_05.json"

GUION = [
    ("hook", 0, "Mica cobra 340 dólares por video editado a mano."),
    ("hook", 1, "Le llevaba tres horas terminar cada uno."),
    ("desarrollo", 0, "El primer mes, grababa y editaba todo ella sola."),
    ("desarrollo", 1, "Para el mes cinco, empezó a automatizar el corte."),
    ("desarrollo", 2, "Al mes diez, entrega dieciocho videos por semana."),
    ("aceleracion", 0, "De tres a dieciocho videos por semana... el salto no fue gradual."),
    ("pausa", 0, "El precio nunca bajó."),
    ("impacto", 0, "Sigue cobrando 340 dólares por video."),
    ("impacto", 1, "Dieciocho videos por semana, a 340 dólares cada uno, son más de seis mil dólares."),
    ("desarrollo2", 0, "Lo único que cambió fue cuánto tiempo le costaba cada uno."),
    ("cierre", 0, "El video es el mismo trabajo."),
    ("cierre", 1, "El tiempo, no."),
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
