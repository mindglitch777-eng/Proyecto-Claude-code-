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
    verificar_categoria_repetida_consecutiva,
    verificar_cifra_repetida_en_texto,
    verificar_duracion_esperada_vs_real,
    verificar_golpe_repetido_consecutivo,
    verificar_intensidad_plana,
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


def test_categoria_repetida_consecutiva_alerta():
    registro = [{"id": "a", "categoria": "cifra"}, {"id": "b", "categoria": "cifra"}, {"id": "c", "categoria": "texto"}]
    arbol = {"escenas": [
        {"unidadId": "u1", "componenteId": "a"},
        {"unidadId": "u2", "componenteId": "b"},
        {"unidadId": "u3", "componenteId": "c"},
    ]}
    alertas = verificar_categoria_repetida_consecutiva(arbol, registro)
    check("dos 'cifra' seguidas alertan", len(alertas) == 1)
    check("cifra seguida de texto no alerta de mas", "u2" in alertas[0] and "u3" not in alertas[0])


def test_categoria_variada_no_alerta():
    registro = [{"id": "a", "categoria": "cifra"}, {"id": "b", "categoria": "texto"}]
    arbol = {"escenas": [{"unidadId": "u1", "componenteId": "a"}, {"unidadId": "u2", "componenteId": "b"}]}
    check("categorias distintas seguidas: sin alerta", len(verificar_categoria_repetida_consecutiva(arbol, registro)) == 0)


def test_golpe_repetido_consecutivo_alerta():
    arbol = {"escenas": [
        {"unidadId": "u1", "golpe": "fogonazo"},
        {"unidadId": "u2", "golpe": "fogonazo"},
        {"unidadId": "u3", "golpe": "negro"},
    ]}
    alertas = verificar_golpe_repetido_consecutivo(arbol)
    check("dos fogonazo seguidos alertan", len(alertas) == 1)


def test_golpe_ninguno_repetido_no_alerta():
    # 'ninguno' es el golpe de la primera escena (sin corte que
    # marcar) -- no tiene sentido alertar si aparece "repetido".
    arbol = {"escenas": [{"unidadId": "u1", "golpe": "ninguno"}, {"unidadId": "u2", "golpe": "ninguno"}]}
    check("golpe 'ninguno' repetido no alerta", len(verificar_golpe_repetido_consecutivo(arbol)) == 0)


def test_intensidad_plana_alerta_con_un_solo_golpe_en_todo_el_video():
    arbol = {"escenas": [
        {"unidadId": "u1", "golpe": "ninguno"},
        {"unidadId": "u2", "golpe": "corte"},
        {"unidadId": "u3", "golpe": "corte"},
        {"unidadId": "u4", "golpe": "corte"},
    ]}
    alertas = verificar_intensidad_plana(arbol)
    check("4 escenas, mismo golpe salvo la primera: alerta de intensidad plana", len(alertas) == 1)


def test_intensidad_variada_no_alerta():
    arbol = {"escenas": [
        {"unidadId": "u1", "golpe": "ninguno"},
        {"unidadId": "u2", "golpe": "corte"},
        {"unidadId": "u3", "golpe": "fogonazo"},
        {"unidadId": "u4", "golpe": "negro"},
    ]}
    check("golpes variados: sin alerta de intensidad plana", len(verificar_intensidad_plana(arbol)) == 0)


def test_cifra_repetida_en_texto_alerta():
    arbol = {"escenas": [
        {"unidadId": "hook", "props": {"lineas": ["Vendió lo mismo 2.847 veces."]}},
        {"unidadId": "payoff", "props": {"lineas": ["Se vende solo, 2.847 veces si hace falta."]}},
    ]}
    alertas = verificar_cifra_repetida_en_texto(arbol)
    check("2.847 repetido en 2 escenas: alerta", len(alertas) == 1)
    check("la alerta nombra ambas escenas", "hook" in alertas[0] and "payoff" in alertas[0])


def test_cifra_unica_no_alerta():
    arbol = {"escenas": [
        {"unidadId": "hook", "props": {"lineas": ["Vendió lo mismo 2.847 veces."]}},
        {"unidadId": "desarrollo", "props": {"hitos": [{"que": "10 ventas por semana"}]}},
    ]}
    check("cifras distintas en cada escena: sin alerta", len(verificar_cifra_repetida_en_texto(arbol)) == 0)


def test_numeros_sueltos_de_un_digito_no_generan_ruido():
    # "un", "2 pasos" -- no queremos que un digito solo (parte de
    # lenguaje corriente) dispare la alerta de cifra repetida.
    arbol = {"escenas": [
        {"unidadId": "u1", "props": {"texto": "Paso 1 del proceso"}},
        {"unidadId": "u2", "props": {"texto": "Paso 1, otra vez explicado"}},
    ]}
    # OJO: esto SI compartiria "1" -- pero un digito solo es una señal
    # muy debil (podria ser "paso 1" en dos contextos distintos, no
    # necesariamente una cifra protagonista repetida). Se documenta la
    # limitacion: el check no distingue "cifra protagonista" de
    # "numero de paso/referencia", es heuristico por diseño.
    alertas = verificar_cifra_repetida_en_texto(arbol)
    check("digito de 1 solo caracter no cuenta (requiere 2+)", not any("'1'" in a for a in alertas))


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
