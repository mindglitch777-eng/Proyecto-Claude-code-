#!/usr/bin/env python3
"""Tests reales del Critico v2 -- contra el arbol/mp4 ya renderizados
de fabrica-demo-08 (mismo patron que test_checks_duros.py: fixture
real, no de juguete)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from critico_v2_metricas import calcular_metricas  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
ARBOL_REAL = RAIZ / "remotion-spike" / "src" / "fabrica_bridge" / "demo_08.json"
MP4_REAL = RAIZ / "fabrica" / "salidas" / "fabrica-demo-08.mp4"
ARBOL_09 = RAIZ / "remotion-spike" / "src" / "fabrica_bridge" / "demo_09.json"
MP4_09 = RAIZ / "fabrica" / "salidas" / "fabrica-demo-09.mp4"
ARBOL_10 = RAIZ / "remotion-spike" / "src" / "fabrica_bridge" / "demo_10.json"
MP4_10 = RAIZ / "fabrica" / "salidas" / "fabrica-demo-10.mp4"

FALLOS = []


def check(desc, cond):
    if not cond:
        FALLOS.append(f"FALLO: {desc}")


def main() -> int:
    if not ARBOL_REAL.exists():
        print("SALTEADO: no existe demo_08.json en este checkout todavia.")
        return 0

    m = calcular_metricas(str(ARBOL_REAL))
    check("arbol_id correcto", m.arbol_id == "fabrica-demo-08")
    check("duracion_total_seg > 0", m.duracion_total_seg > 0)
    check("cantidad_escenas == 7 (guion real conocido)", m.cantidad_escenas == 7)
    check("cantidad_eventos_de_cambio > 0 (hubo golpes/microeventos reales)", m.cantidad_eventos_de_cambio > 0)
    check("timestamps ordenados ascendente", m.timestamps_eventos_de_cambio_seg == sorted(m.timestamps_eventos_de_cambio_seg))
    check("todos los timestamps caen dentro de la duracion total", all(0 <= t <= m.duracion_total_seg for t in m.timestamps_eventos_de_cambio_seg))
    check("variedad_componentes entre 0 y 1", 0 <= m.variedad_componentes <= 1)
    check("componentes_distintos <= cantidad_escenas", m.componentes_distintos <= m.cantidad_escenas)
    check("duracion_media_bloque_visual_seg >= 0", m.duracion_media_bloque_visual_seg >= 0)
    check("no inventa metricas de audio sin --mp4 (quedan en None)", m.silencios_sospechosos is None and m.volumen_medio_db is None)
    check("cada lectura heuristica esta marcada explicitamente como HEURISTICO (regla de honestidad)",
          all(l.startswith("HEURISTICO:") for l in m.lectura_heuristica))

    if MP4_REAL.exists():
        m2 = calcular_metricas(str(ARBOL_REAL), str(MP4_REAL))
        check("con --mp4 real: silencios_sospechosos es un numero real, no None", m2.silencios_sospechosos is not None)
        check("con --mp4 real: volumen_medio_db es un numero real", m2.volumen_medio_db is not None)

    # R7-31: comparacion objetiva real demo_08 (baseline) vs demo_09
    # (Rhythm Engine + cambia_encuadre real anclado a pausas medidas) --
    # el propio prompt pide "no me digas solamente mejoro", asi que esto
    # deja la comparacion MEDIDA como test repetible, no como afirmacion
    # suelta en un informe.
    if ARBOL_09.exists():
        m3 = calcular_metricas(str(ARBOL_09), str(MP4_09) if MP4_09.exists() else None)
        check("demo_09 tiene mas eventos de cambio reales que demo_08 (nuevo mecanismo de pausas)",
              m3.cantidad_eventos_de_cambio > m.cantidad_eventos_de_cambio)
        check("demo_09 tiene al menos 2 microeventos cambia_encuadre reales (aceleracion + desarrollo2)",
              m3.cantidad_microeventos_cambia_encuadre >= 2)
        check("demo_08 (baseline) tiene 0 cambia_encuadre -- el mecanismo no existia todavia",
              m.cantidad_microeventos_cambia_encuadre == 0)
        check("demo_09 reduce (o iguala) la duracion media de bloque visual respecto de demo_08",
              m3.duracion_media_bloque_visual_seg <= m.duracion_media_bloque_visual_seg)

    # R7-32 ("Benchmark audiovisual agresivo"): guion y estructura
    # COMPLETAMENTE distintos de demo_08/09 (14 unidades cortas en vez
    # de 7 mas largas) -- una comparacion "mejor/peor" 1:1 de conteos
    # crudos seria enganosa (mas escenas != mas rapido por definicion).
    # Se testea que demo_10 es objetivamente MAS VARIADO en catalogo
    # (mas componentes distintos, densidad visual que realmente varia)
    # sin afirmar una mejora de retencion que ningun dato respalda.
    if ARBOL_10.exists():
        m4 = calcular_metricas(str(ARBOL_10), str(MP4_10) if MP4_10.exists() else None)
        check("demo_10 tiene 14 escenas (una por linea de guion, guion nuevo)", m4.cantidad_escenas == 14)
        check("demo_10 usa mas componentes DISTINTOS del catalogo que demo_08 (11 vs 6)",
              m4.componentes_distintos > m.componentes_distintos)
        check("demo_10: la densidad visual SI varia en el tiempo (a diferencia de demo_09)",
              m4.densidad_visual_varia is True)
        check("demo_10: todos los timestamps caen dentro de la duracion total",
              all(0 <= t <= m4.duracion_total_seg for t in m4.timestamps_eventos_de_cambio_seg))

    if FALLOS:
        print(f"{len(FALLOS)} FALLO(S):")
        for f in FALLOS:
            print(" " + f)
        return 1
    print("Todos los tests del Critico v2 (fabrica/qa/critico_v2_metricas.py) pasaron OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
