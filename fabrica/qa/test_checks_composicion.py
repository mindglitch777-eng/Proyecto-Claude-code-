#!/usr/bin/env python3
"""Tests reales de checks_composicion.py. Usa fixtures armados a mano
(un arbol chico, un registro chico) en vez de inventar archivos reales
en el repo -- pero TAMBIEN corre contra el arbol real de
fabrica-demo-02 para probar que funciona con datos de produccion de
verdad, no solo con el fixture."""
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from checks_composicion import (  # noqa: E402
    correr_qa_composicion,
    verificar_assets_arbol,
    verificar_duracion_esperada_vs_real,
    verificar_texto_capacidad,
)

RAIZ = Path(__file__).resolve().parents[2]
FALLOS = []


def check(desc, cond):
    if not cond:
        FALLOS.append(f"FALLO: {desc}")


def test_assets_faltantes_detecta_audio_inexistente():
    arbol = {"id": "t", "escenas": [
        {"unidadId": "u1", "audios": [{"archivo": "fabrica_demo/no-existe-esto.mp3", "desdeSegRelativo": 0, "duracionSeg": 1}]},
    ]}
    with tempfile.TemporaryDirectory() as tmp:
        problemas = verificar_assets_arbol(arbol, Path(tmp))
        check("detecta el audio faltante", len(problemas) == 1)
        check("menciona el archivo y la escena", "u1" in problemas[0] and "no-existe-esto.mp3" in problemas[0])


def test_assets_presentes_no_generan_problema():
    with tempfile.TemporaryDirectory() as tmp:
        (Path(tmp) / "fabrica_demo").mkdir()
        (Path(tmp) / "fabrica_demo" / "si-existe.mp3").write_bytes(b"")
        arbol = {"id": "t", "escenas": [
            {"unidadId": "u1", "audios": [{"archivo": "fabrica_demo/si-existe.mp3", "desdeSegRelativo": 0, "duracionSeg": 1}]},
        ]}
        problemas = verificar_assets_arbol(arbol, Path(tmp))
        check("no reporta nada si el archivo existe", len(problemas) == 0)


def test_texto_dentro_de_presupuesto_no_alerta():
    registro = [{"id": "comp-corta", "capacidadTexto": "corta"}]
    arbol = {"id": "t", "escenas": [
        {"unidadId": "u1", "componenteId": "comp-corta", "props": {"texto": "Corto"}},
    ]}
    alertas = verificar_texto_capacidad(arbol, registro)
    check("texto corto dentro de presupuesto no genera alerta", len(alertas) == 0)


def test_texto_fuera_de_presupuesto_alerta():
    registro = [{"id": "comp-corta", "capacidadTexto": "corta"}]
    texto_largo = "Esta es una oracion bastante larga que claramente excede el presupuesto de una capacidad de texto corta"
    arbol = {"id": "t", "escenas": [
        {"unidadId": "u1", "componenteId": "comp-corta", "props": {"texto": texto_largo}},
    ]}
    alertas = verificar_texto_capacidad(arbol, registro)
    check("texto largo en componente 'corta' genera alerta", len(alertas) == 1)
    check("la alerta identifica la escena", "u1" in alertas[0])


def test_texto_cuenta_todos_los_strings_anidados():
    # props como los reales (listas de strings, dicts anidados) -- el
    # conteo tiene que sumar TODO el texto, no solo el primer nivel.
    registro = [{"id": "cronologia-fake", "capacidadTexto": "corta"}]
    arbol = {"id": "t", "escenas": [
        {"unidadId": "u1", "componenteId": "cronologia-fake", "props": {
            "hitos": [{"cuando": "MES 1", "que": "x" * 50}, {"cuando": "MES 2", "que": "y" * 50}],
        }},
    ]}
    alertas = verificar_texto_capacidad(arbol, registro)
    check("suma texto de listas de dicts anidados", len(alertas) == 1)


def test_duracion_dentro_de_tolerancia_no_reporta_problema():
    check("diferencia chica (0.3s) no es problema", verificar_duracion_esperada_vs_real(30.0, 30.3) is None)


def test_duracion_fuera_de_tolerancia_reporta_problema():
    problema = verificar_duracion_esperada_vs_real(30.0, 35.0)
    check("diferencia grande (5s) SI es problema", problema is not None)
    check("el problema menciona ambas duraciones", "30.00" in problema and "35.00" in problema)


def test_contra_arbol_real_de_fabrica_demo_02():
    # No un fixture -- el arbol y registro REALES que ya se generaron y
    # renderizaron esta sesion.
    arbol_path = RAIZ / "remotion-spike/src/fabrica_bridge/demo_02.json"
    if not arbol_path.exists():
        return  # el demo puede no estar generado en otro entorno; no falla el suite por eso
    reporte = correr_qa_composicion(str(arbol_path))
    check("arbol real de demo_02: sin PROBLEMAS duros (todos los audios existen de verdad)",
          reporte.ok is True)
    check("arbol real de demo_02: id correcto", reporte.arbol_id == "fabrica-demo-02")


def main():
    for nombre, fn in list(globals().items()):
        if nombre.startswith("test_") and callable(fn):
            fn()
    if FALLOS:
        print(f"\n{len(FALLOS)} FALLO(S):\n")
        for f in FALLOS:
            print(f)
        return 1
    print("Todos los tests de QA de composicion pasaron OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
