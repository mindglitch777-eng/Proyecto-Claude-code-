#!/usr/bin/env python3
"""Tests de critico_audiovisual.py -- fixtures armados a mano
(arbol chico con analisisRetencion incluido) + una corrida contra el
arbol real de fabrica-demo-05 (sin analisisRetencion, por ser de una
ronda anterior) para confirmar que no rompe con arboles viejos."""
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from critico_audiovisual import criticar  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
FALLOS = []


def check(desc, cond):
    if not cond:
        FALLOS.append(f"FALLO: {desc}")


ARBOL_FIXTURE = {
    "id": "fixture-critico",
    "fps": 30,
    "duracionTotalSeg": 20,
    "escenas": [
        {"unidadId": "a", "duracionSeg": 5, "componenteId": "punch", "golpe": "fogonazo", "props": {}},
        {"unidadId": "b", "duracionSeg": 5, "componenteId": "punch", "golpe": "fogonazo", "props": {}},
        {"unidadId": "c", "duracionSeg": 10, "componenteId": "contador", "golpe": "corte", "props": {}},
    ],
    "analisisRetencion": {
        "mapa": [],
        "alertas": [
            {"tipo": "hook_debil", "severidad": "alta",
             "descripcion": "la primera unidad no esta clasificada como hook",
             "razon": "unidad 'a' tiene fase 'sin_clasificar'"},
        ],
    },
}


def test_criticar_combina_las_tres_fuentes():
    with tempfile.TemporaryDirectory() as tmp:
        arbol_path = Path(tmp) / "arbol.json"
        arbol_path.write_text(json.dumps(ARBOL_FIXTURE), encoding="utf-8")
        reporte = criticar(str(arbol_path))
        check("el reporte tiene hallazgos", len(reporte.hallazgos) > 0)
        check("hay un hallazgo de tipo Retención (viene de analisisRetencion)",
              any(h.tipo == "Retención" for h in reporte.hallazgos))
        check("hay un hallazgo de golpe repetido (viene de critica_editorial, categoria repeticion)",
              any("mismo golpe de transicion" in h.problema for h in reporte.hallazgos))
        check("hay un hallazgo de categoria repetida (viene de critica_editorial)",
              any("misma categoria de componente" in h.problema for h in reporte.hallazgos))


def test_cada_hallazgo_tiene_los_5_campos():
    with tempfile.TemporaryDirectory() as tmp:
        arbol_path = Path(tmp) / "arbol.json"
        arbol_path.write_text(json.dumps(ARBOL_FIXTURE), encoding="utf-8")
        reporte = criticar(str(arbol_path))
        for h in reporte.hallazgos:
            check(f"hallazgo '{h.problema[:30]}...' tiene evidencia no vacia", len(h.evidencia) > 0)
            check(f"hallazgo '{h.problema[:30]}...' tiene severidad valida", h.severidad in ("baja", "media", "alta"))
            check(f"hallazgo '{h.problema[:30]}...' tiene tipo valido",
                  h.tipo in ("Narrativa", "Retención", "Edición", "Visual", "Audio", "Técnica"))
            check(f"hallazgo '{h.problema[:30]}...' tiene propuesta no vacia", len(h.propuesta) > 0)


def test_hallazgos_ordenados_por_severidad():
    with tempfile.TemporaryDirectory() as tmp:
        arbol_path = Path(tmp) / "arbol.json"
        arbol_path.write_text(json.dumps(ARBOL_FIXTURE), encoding="utf-8")
        reporte = criticar(str(arbol_path))
        orden = {"alta": 0, "media": 1, "baja": 2}
        severidades = [orden[h.severidad] for h in reporte.hallazgos]
        check("los hallazgos vienen ordenados de mayor a menor severidad", severidades == sorted(severidades))


def test_sin_analisis_retencion_no_rompe():
    arbol_sin_retencion = {k: v for k, v in ARBOL_FIXTURE.items() if k != "analisisRetencion"}
    with tempfile.TemporaryDirectory() as tmp:
        arbol_path = Path(tmp) / "arbol.json"
        arbol_path.write_text(json.dumps(arbol_sin_retencion), encoding="utf-8")
        reporte = criticar(str(arbol_path))
        check("sin analisisRetencion, no hay hallazgos de tipo Retención", not any(h.tipo == "Retención" for h in reporte.hallazgos))
        check("el resto de hallazgos sigue funcionando igual", len(reporte.hallazgos) > 0)


def test_propuesta_generica_cuando_no_hay_coincidencia_especifica():
    arbol_alerta_desconocida = {
        "id": "x", "fps": 30, "duracionTotalSeg": 5,
        "escenas": [{"unidadId": "a", "duracionSeg": 5, "componenteId": "punch", "golpe": "ninguno", "props": {}}],
        "analisisRetencion": {"mapa": [], "alertas": [
            {"tipo": "algo_nuevo_no_mapeado", "severidad": "baja", "descripcion": "un hallazgo sin propuesta especifica conocida", "razon": "x"},
        ]},
    }
    with tempfile.TemporaryDirectory() as tmp:
        arbol_path = Path(tmp) / "arbol.json"
        arbol_path.write_text(json.dumps(arbol_alerta_desconocida), encoding="utf-8")
        reporte = criticar(str(arbol_path))
        hallazgo = next(h for h in reporte.hallazgos if h.tipo == "Retención")
        check("una alerta sin propuesta especifica conocida devuelve el fallback honesto, no una inventada",
              "revisar manualmente" in hallazgo.propuesta)


def test_contra_arbol_real_de_demo_05():
    arbol_path = RAIZ / "remotion-spike/src/fabrica_bridge/demo_05.json"
    if not arbol_path.exists():
        return
    reporte = criticar(str(arbol_path))
    check("arbol real de demo_05 (sin analisisRetencion) no rompe el critico", len(reporte.hallazgos) >= 0)
    check("sin analisisRetencion en demo_05, no hay hallazgos de tipo Retención",
          not any(h.tipo == "Retención" for h in reporte.hallazgos))


def main():
    for nombre, fn in list(globals().items()):
        if nombre.startswith("test_") and callable(fn):
            fn()
    if FALLOS:
        print(f"\n{len(FALLOS)} FALLO(S):\n")
        for f in FALLOS:
            print(f)
        return 1
    print("Todos los tests del Critico Audiovisual pasaron OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
