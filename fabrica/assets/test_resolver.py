#!/usr/bin/env python3
"""Tests reales del resolver de assets, contra las carpetas de verdad
del repo (no un fixture inventado)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from resolver import resolver, resolver_biblioteca, resolver_metraje, resolver_persona  # noqa: E402

FALLOS = []


def check(desc, cond):
    if not cond:
        FALLOS.append(f"FALLO: {desc}")


def test_persona_real_existente():
    # taylor-posada es uno de los 19 casos documentales reales, con
    # foto ya curada en el repo.
    r = resolver_persona("taylor-posada")
    check("taylor-posada: encontrado", r.encontrado is True)
    check("taylor-posada: tipo foto", r.tipo == "foto")
    check("taylor-posada: la ruta existe de verdad", Path(r.ruta).exists())


def test_persona_inexistente_devuelve_faltante():
    r = resolver_persona("persona-que-no-existe-nunca-123")
    check("persona inexistente: NO encontrado (nunca inventa una ruta)", r.encontrado is False)
    check("persona inexistente: razon explica el porque", "no existe" in r.razon)


def test_biblioteca_match_relevante():
    # "empty-wallet-hands-close-up" esta tageada con "sin plata",
    # "pobreza", "dinero" -- una descripcion con esas palabras debe
    # matchear.
    r = resolver_biblioteca("una persona sin plata, en la pobreza")
    check("biblioteca (sin plata): encontrado", r.encontrado is True)
    check("biblioteca (sin plata): la ruta existe de verdad", r.encontrado and Path(r.ruta).exists())


def test_biblioteca_sin_match_devuelve_faltante():
    # una descripcion sin ninguna palabra clave real del repo (evitar
    # cualquier palabra que aparezca en tags.json a proposito)
    r = resolver_biblioteca("un dragon volando sobre un volcan alienigena")
    check("biblioteca (sin relacion): FALTANTE, no inventa un match falso", r.encontrado is False)


def test_metraje_match_relevante():
    r = resolver_metraje("alguien entrenando en el gimnasio")
    check("metraje (gimnasio): encontrado", r.encontrado is True)
    check("metraje (gimnasio): tipo video", r.encontrado and r.tipo == "video")
    check("metraje (gimnasio): la ruta existe de verdad", r.encontrado and Path(r.ruta).exists())


def test_resolver_general_prioriza_persona():
    # si se pasa persona_slug, ignora la descripcion y va directo al
    # caso puntual (no busca "parecidos" en biblioteca).
    r = resolver("un emprendedor cualquiera", persona_slug="taylor-posada")
    check("resolver(): con persona_slug usa resolver_persona", r.tipo == "foto" and r.carpeta == "taylor-posada")


def test_palabra_generica_no_produce_match_falso():
    # Regresion de un bug real: "trabajo" aparece en los tags de varias
    # carpetas (barberia, freelance, oficina...) -- antes del fix de
    # frecuencia de documento, una consulta sobre freelance matcheaba
    # por error con 'barber-shop-haircut-man-working' (ambas carpetas
    # comparten SOLO la palabra "trabajo", nada especifico).
    r = resolver_metraje("alguien probando un modelo de negocio, trabajo freelance")
    check("no matchea con barberia solo por la palabra generica 'trabajo'",
          r.carpeta != "barberia")
    check("matchea con freelance (comparte 'trabajo' Y 'freelance', señal real)",
          r.encontrado and r.carpeta == "freelance")


def test_resolver_general_prioriza_mejor_score_no_el_primero():
    # Si tipo=None, resolver() debe comparar biblioteca Y metraje y
    # devolver el de MEJOR score, no "el primero que pasa el umbral".
    r = resolver("alguien entrenando en el gimnasio")
    check("resolver() sin tipo: encuentra el gimnasio en metraje", r.encontrado and r.tipo == "video")


def test_resolver_general_respeta_tipo_pedido():
    r = resolver("alguien entrenando en el gimnasio", tipo="foto")
    check("resolver(tipo=foto): no devuelve un video aunque exista un match mejor ahi",
          not r.encontrado or r.tipo == "foto")


def test_resolver_general_faltante_no_rompe():
    r = resolver("un dragon volando sobre un volcan alienigena")
    check("resolver(): FALTANTE general no explota, devuelve objeto valido", r.encontrado is False)
    check("resolver(): razon menciona ambas busquedas", "biblioteca" in r.razon and "metraje" in r.razon)


def main():
    for nombre, fn in list(globals().items()):
        if nombre.startswith("test_") and callable(fn):
            fn()
    if FALLOS:
        print(f"\n{len(FALLOS)} FALLO(S):\n")
        for f in FALLOS:
            print(f)
        return 1
    print("Todos los tests del resolver de assets pasaron OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
