#!/usr/bin/env python3
"""
Prepara la prueba real de Qwen3-TTS pedida explicitamente por el
operador (item 6 de la ronda de trabajo autonoma): un lote de frases
que cubre numeros, dolares, porcentajes, fechas, cantidades grandes,
nombres propios, pausas y distintas intensidades -- para poder
escuchar despues (persona humana, no este script) como suena la
PRONUNCIACION real y medir la DURACION real contra lo esperado.

Este script NO genera audio (Qwen3-TTS no corre en este sandbox, ver
PENDIENTES.md item 1/3). Lo que hace es:
  1. Tomar frases crudas (texto tal como las escribiria un guion).
  2. Pasarlas por el normalizador real de la fabrica
     (fabrica/voz/normalizador.py) para obtener el texto_hablado --
     EXACTAMENTE lo que se le manda al motor de voz, nunca la frase
     cruda con simbolos.
  3. Calcular una duracion ESPERADA aproximada (heuristica de palabras
     por minuto en espanol, documentada abajo) para poder comparar
     contra la duracion REAL del wav una vez generado.
  4. Escribir todo en un manifest JSON, mismo formato que
     capturas_voz/manifest_voz_documental.json, listo para que el
     workflow de GitHub Actions
     `.github/workflows/prueba-normalizacion-qwen3-tts.yml` lo consuma
     y genere audio real con el motor C, la voz clonada real
     (librivox-11) y los mismos parametros de produccion
     (instruct + rate 1.25) que ya usa generar_voz_documental_qwen.py.

Uso:
    python3 fabrica/voz/preparar_prueba_qwen.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from normalizador import texto_con_narracion_normalizada  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
MANIFEST_SALIDA = RAIZ / "capturas_voz/manifest_prueba_normalizacion.json"

# Heuristica documentada, NO medida (no hay forma de medirla sin correr
# el motor real): ritmo de habla en espanol "serio, articulado" ronda
# las 150-160 palabras por minuto a velocidad normal. La produccion usa
# --rate 1.25 (25% mas rapido), asi que se ajusta proporcionalmente.
# Esto da un ESTIMADO para comparar contra la duracion REAL del wav
# generado -- si difieren mucho, es señal de que el motor esta
# pausando distinto de lo esperado (relevante para el item de
# timestamps/alineacion, PENDIENTES.md item 1).
PALABRAS_POR_MINUTO_BASE = 155
RATE_PRODUCCION = 1.25


def duracion_estimada_seg(texto_hablado: str) -> float:
    palabras = len(texto_hablado.split())
    palabras_por_seg = (PALABRAS_POR_MINUTO_BASE * RATE_PRODUCCION) / 60
    return round(palabras / palabras_por_seg, 1)


# Cada item cubre explicitamente una o mas de las categorias pedidas:
# numeros, dolares, porcentajes, fechas, cantidades grandes, nombres
# propios, pausas (via puntuacion real, "..." y ";" -- no hay sintaxis
# de pausa confirmada en el motor, ver nota en el workflow), e
# intensidades distintas (variando --instruct/--rate en el workflow,
# no en el texto). Los nombres propios son personas REALES ya
# documentadas en assets/personas/ (no se inventan nombres nuevos).
CASOS_DE_PRUEBA = [
    {
        "id": "dinero_porcentaje",
        "categorias": ["dinero", "porcentaje"],
        "texto_crudo": "Facturó $12.450 el primer mes, un 68% más que en su mejor mes anterior.",
    },
    {
        "id": "fecha_cantidad_grande",
        "categorias": ["fecha", "cantidad_grande", "nombre_propio"],
        "texto_crudo": "El 3 de noviembre de 2024, Taylor Posada superó los 2.300.000 pesos en ventas.",
    },
    {
        "id": "nombre_propio_pausas_porcentaje",
        "categorias": ["nombre_propio", "pausas", "porcentaje"],
        "texto_crudo": "Pieter Levels lo intentó durante meses... y recién en el mes doce, un 40% de sus clientes volvió a comprar.",
    },
    {
        "id": "abreviatura_anio_porcentaje",
        "categorias": ["abreviatura", "anio", "porcentaje"],
        "texto_crudo": "Según el Dr. Guzmán, desde 2018 EE.UU. lidera ese mercado, aprox. un 15% del total.",
    },
    {
        "id": "decimal_cantidad_grande",
        "categorias": ["decimal", "dinero", "cantidad_grande"],
        "texto_crudo": "La cifra llegó a $1.250.000,75, un salto de 3,5 veces respecto al año anterior.",
    },
    {
        "id": "nombre_propio_con_tilde_ene",
        "categorias": ["nombre_propio"],
        "texto_crudo": "Isabella Kotsias y Nicolás Gómez coincidieron en la misma conclusión, año tras año.",
    },
    {
        "id": "numero_suelto_dias",
        "categorias": ["numero"],
        "texto_crudo": "Publicó 3 videos por semana durante 15 semanas seguidas, sin faltar un solo día.",
    },
    {
        "id": "frase_corta_intensidad",
        "categorias": ["intensidad (usar con --instruct/--rate distintos en el workflow)"],
        "texto_crudo": "Esto cambia todo.",
    },
]


def main() -> int:
    manifest = []
    for i, caso in enumerate(CASOS_DE_PRUEBA):
        texto_hablado = texto_con_narracion_normalizada(caso["texto_crudo"])
        manifest.append({
            "index": i,
            "id": caso["id"],
            "categorias": caso["categorias"],
            "texto_crudo": caso["texto_crudo"],
            "texto": texto_hablado,
            "duracion_estimada_seg": duracion_estimada_seg(texto_hablado),
        })

    MANIFEST_SALIDA.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_SALIDA.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Manifest escrito en {MANIFEST_SALIDA} ({len(manifest)} frases de prueba)\n")
    for item in manifest:
        print(f"[{item['id']}] ({', '.join(item['categorias'])})")
        print(f"  crudo:    {item['texto_crudo']}")
        print(f"  hablado:  {item['texto']}")
        print(f"  duracion esperada: ~{item['duracion_estimada_seg']}s\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
