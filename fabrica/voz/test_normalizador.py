#!/usr/bin/env python3
"""Tests reales del normalizador -- corren con `python3 -m pytest
fabrica/voz/test_normalizador.py -v` o directo con `python3
fabrica/voz/test_normalizador.py` (usa asserts simples, sin pytest
como dependencia obligatoria: $0, sin instalar nada nuevo)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from normalizador import (  # noqa: E402
    detectar_y_normalizar,
    normalizar_abreviatura,
    normalizar_anio,
    normalizar_dinero,
    normalizar_fecha,
    normalizar_numero,
    normalizar_porcentaje,
    numero_a_palabras,
    texto_con_narracion_normalizada,
)

FALLOS = []


def check(desc, real, esperado):
    if real != esperado:
        FALLOS.append(f"FALLO: {desc}\n  esperado: {esperado!r}\n  obtenido: {real!r}")


def test_numeros_basicos():
    check("0", numero_a_palabras(0), "cero")
    check("1", numero_a_palabras(1), "uno")
    check("15", numero_a_palabras(15), "quince")
    check("21", numero_a_palabras(21), "veintiuno")
    check("21 apocope", numero_a_palabras(21, apocope_final=True), "veintiún")
    check("30", numero_a_palabras(30), "treinta")
    check("31", numero_a_palabras(31), "treinta y uno")
    check("31 apocope", numero_a_palabras(31, apocope_final=True), "treinta y un")
    check("99", numero_a_palabras(99), "noventa y nueve")
    check("100", numero_a_palabras(100), "cien")
    check("101", numero_a_palabras(101), "ciento uno")
    check("200", numero_a_palabras(200), "doscientos")
    check("999", numero_a_palabras(999), "novecientos noventa y nueve")


def test_numeros_miles_millones():
    check("1000", numero_a_palabras(1000), "mil")
    check("1500", numero_a_palabras(1500), "mil quinientos")
    check("1629", numero_a_palabras(1629), "mil seiscientos veintinueve")
    check("20000", numero_a_palabras(20000), "veinte mil")
    check("21000", numero_a_palabras(21000), "veintiún mil")
    check("100000", numero_a_palabras(100000), "cien mil")
    check("1000000", numero_a_palabras(1_000_000), "un millón")
    check("2000000", numero_a_palabras(2_000_000), "dos millones")
    check("1000000000", numero_a_palabras(1_000_000_000), "mil millones")


def test_ejemplo_del_prompt_maestro():
    # "Generó 1.629 dólares" -> narracion "mil seiscientos veintinueve
    # dolares", visual "$1.629" -- el ejemplo EXACTO de la seccion 10.
    u = normalizar_dinero(1629, "USD")
    check("1629 USD hablado", u.texto_hablado, "mil seiscientos veintinueve dólares")
    check("1629 USD visual", u.texto_visual, "$1.629")


def test_dinero_casos_reales_de_la_serie_documental():
    # caso-03: "$4.699" y "$6.116 a los 30 dias"
    check("4699 hablado", normalizar_dinero(4699).texto_hablado,
          "cuatro mil seiscientos noventa y nueve dólares")
    check("4699 visual", normalizar_dinero(4699).texto_visual, "$4.699")
    check("6116 visual", normalizar_dinero(6116).texto_visual, "$6.116")
    # caso-05: contador hasta 1000000 -- "millón" siempre lleva "de"
    # antes del sustantivo (un millón DE dólares).
    check("1000000 dinero hablado", normalizar_dinero(1_000_000).texto_hablado,
          "un millón de dólares")
    check("7000000 dinero hablado (millones, plural)", normalizar_dinero(7_000_000).texto_hablado,
          "siete millones de dólares")
    check("1200000 dinero hablado (millón + mas grupos, sin 'de')",
          normalizar_dinero(1_200_000).texto_hablado,
          "un millón doscientos mil dólares")
    check("20000 dinero visual", normalizar_dinero(20000).texto_visual, "$20.000")
    # rebecca-beach: "$20.000" / "Por mes."
    check("1 dolar singular", normalizar_dinero(1).texto_hablado, "un dólar")
    check("21 dolares apocope", normalizar_dinero(21).texto_hablado, "veintiún dólares")


def test_decimales_dinero():
    u = normalizar_dinero(1234.56, "USD")
    check("1234.56 hablado", u.texto_hablado,
          "mil doscientos treinta y cuatro dólares con cincuenta y seis centavos")
    check("1234.56 visual", u.texto_visual, "$1.234,56")


def test_porcentaje():
    check("35% visual", normalizar_porcentaje(35).texto_visual, "35%")
    check("35% hablado", normalizar_porcentaje(35).texto_hablado, "treinta y cinco por ciento")
    check("21% hablado (apocope)", normalizar_porcentaje(21).texto_hablado,
          "veintiún por ciento")


def test_anio():
    check("2018 hablado", normalizar_anio(2018).texto_hablado, "dos mil dieciocho")
    check("2018 visual", normalizar_anio(2018).texto_visual, "2018")
    check("2026 hablado", normalizar_anio(2026).texto_hablado, "dos mil veintiséis")


def test_fecha_completa():
    u = normalizar_fecha(15, 3, 2024)
    check("15/03/2024 hablado", u.texto_hablado, "quince de marzo de dos mil veinticuatro")
    check("15/03/2024 visual", u.texto_visual, "15/03/2024")
    u1 = normalizar_fecha(1, 1, 2026)
    check("dia 1 usa ordinal 'primero', no 'uno'", u1.texto_hablado, "primero de enero de dos mil veintiséis")


def test_fecha_detectada_con_barras_y_guiones():
    unidades = detectar_y_normalizar("El lanzamiento fue el 15/03/2024 en la ciudad")
    check("cantidad detectada (fecha con barras)", len(unidades), 1)
    check("tipo detectado", unidades[0].tipo, "fecha")
    check("no confunde el anio de la fecha con un anio suelto aparte",
          len([u for u in unidades if u.tipo == "anio"]), 0)

    unidades = detectar_y_normalizar("Firmado el 1-12-2025")
    check("fecha con guiones detectada", len(unidades), 1)
    check("tipo detectado (guiones)", unidades[0].tipo, "fecha")


def test_fecha_escrita_en_palabras_sin_parser_dedicado():
    # "15 de marzo de 2024": no hay un parser de fechas dedicado para
    # este formato -- la deteccion de anio (2024) y la de numero suelto
    # con contexto "de <mes>" (15 -> "quince") se combinan solas.
    salida = texto_con_narracion_normalizada("El evento fue el 15 de marzo de 2024")
    check("dia+mes+anio en palabras arma la fecha completa hablada",
          "quince de marzo de dos mil veinticuatro" in salida, True)

    salida_dia_1 = texto_con_narracion_normalizada("Fue el 1 de enero de 2026")
    check("dia 1 en formato palabras tambien usa 'primero'",
          "primero de enero de dos mil veintiséis" in salida_dia_1, True)


def test_abreviaturas():
    check("Dr. hablado", normalizar_abreviatura("Dr.").texto_hablado, "doctor")
    check("Dr. visual (se conserva la abreviatura)", normalizar_abreviatura("Dr.").texto_visual, "Dr.")
    check("EE.UU. hablado", normalizar_abreviatura("EE.UU.").texto_hablado, "Estados Unidos")

    unidades = detectar_y_normalizar("La Dra. Gomez atendio en EE.UU. hace 3 años, aprox.")
    tipos = [u.tipo for u in unidades]
    check("detecta Dra., EE.UU. y aprox. como abreviaturas", tipos.count("abreviatura"), 3)
    salida = texto_con_narracion_normalizada("La Dra. Gomez vive en EE.UU.")
    check("Dra. expandido en el texto hablado", "doctora" in salida, True)
    check("EE.UU. expandido en el texto hablado", "Estados Unidos" in salida, True)
    check("no quedan puntos de abreviatura sueltos en el texto hablado", "Dra." in salida, False)


def test_numero_suelto_sin_separador_de_miles():
    # Gap real: antes de esta ronda, un numero de 1-3 digitos sin punto
    # de miles (ej. "15 productos") no se detectaba en absoluto.
    unidades = detectar_y_normalizar("Vendio 15 productos en 3 dias")
    check("cantidad detectada (dos numeros sueltos)", len(unidades), 2)
    check("tipos detectados", [u.tipo for u in unidades], ["numero", "numero"])
    check("15 hablado", unidades[0].texto_hablado, "quince")
    check("3 hablado", unidades[1].texto_hablado, "tres")


def test_numero_suelto_no_rompe_numeros_ya_manejados():
    # "1.500" no debe partirse en "1" + "500" sueltos -- el span ya
    # ocupado por el numero-con-miles debe ganar.
    unidades = detectar_y_normalizar("Más de 1.500 productos, con un 35% de crecimiento")
    check("sigue detectando solo 2 unidades (no se rompe 1.500)", len(unidades), 2)
    tipos = sorted(u.tipo for u in unidades)
    check("tipos detectados (sin numeros sueltos espurios)", tipos, ["numero", "porcentaje"])

    unidades2 = detectar_y_normalizar("Generó $7.000 el mismo año, 2018")
    tipos2 = sorted(u.tipo for u in unidades2)
    check("dinero y anio no se rompen por el detector de numero suelto",
          tipos2, ["anio", "dinero"])


def test_deteccion_automatica_sobre_texto_real():
    # linea real de caso-13 (rebecca-beach / becky beach usa lo mismo):
    # "2018: Empieza a vender productos digitales"
    unidades = detectar_y_normalizar("2018: Empieza a vender productos digitales")
    check("cantidad detectada (anio)", len(unidades), 1)
    check("tipo detectado", unidades[0].tipo, "anio")

    unidades = detectar_y_normalizar("Beneficio en un solo mes: $7.000")
    check("cantidad detectada (dinero)", len(unidades), 1)
    check("tipo detectado", unidades[0].tipo, "dinero")
    check("valor detectado", unidades[0].valor, 7000)

    unidades = detectar_y_normalizar("Más de 1.500 productos, con un 35% de crecimiento")
    check("cantidad detectada (numero+pct)", len(unidades), 2)
    tipos = sorted(u.tipo for u in unidades)
    check("tipos detectados", tipos, ["numero", "porcentaje"])


def test_texto_con_narracion_normalizada():
    entrada = "Generó $1.629 en 2018, un 35% mas que el año anterior"
    salida = texto_con_narracion_normalizada(entrada)
    check("no debe quedar ningun $ en el texto para TTS", "$" in salida, False)
    check("no debe quedar ningun % en el texto para TTS", "%" in salida, False)
    check("debe contener la cifra hablada", "mil seiscientos veintinueve dólares" in salida, True)
    check("debe contener el año hablado", "dos mil dieciocho" in salida, True)
    check("debe contener el porcentaje hablado", "treinta y cinco por ciento" in salida, True)


def main():
    for nombre, fn in list(globals().items()):
        if nombre.startswith("test_") and callable(fn):
            fn()
    if FALLOS:
        print(f"\n{len(FALLOS)} FALLO(S):\n")
        for f in FALLOS:
            print(f)
            print()
        return 1
    print("Todos los tests del normalizador pasaron OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
