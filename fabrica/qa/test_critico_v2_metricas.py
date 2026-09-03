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

    if FALLOS:
        print(f"{len(FALLOS)} FALLO(S):")
        for f in FALLOS:
            print(" " + f)
        return 1
    print("Todos los tests del Critico v2 (fabrica/qa/critico_v2_metricas.py) pasaron OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
