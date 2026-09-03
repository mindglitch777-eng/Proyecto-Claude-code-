#!/usr/bin/env python3
"""Tests reales del QA de contraste WCAG -- valores verificados a mano
contra la formula oficial (no solo contra la propia implementacion:
blanco/negro puro tiene que dar exactamente 21:1, el maximo posible)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from contraste import (  # noqa: E402
    cumple_wcag_aa,
    escanear_tsx_hex_literal,
    luminancia_relativa,
    ratio_contraste,
    validar_paleta_base,
)

FALLOS = []


def check(desc, cond):
    if not cond:
        FALLOS.append(f"FALLO: {desc}")


def test_luminancia_extremos():
    check("negro puro: luminancia 0.0", abs(luminancia_relativa("#000000") - 0.0) < 1e-6)
    check("blanco puro: luminancia 1.0", abs(luminancia_relativa("#FFFFFF") - 1.0) < 1e-6)


def test_ratio_maximo_blanco_negro():
    # El maximo teorico de WCAG es exactamente 21:1 (blanco puro vs negro puro).
    r = ratio_contraste("#FFFFFF", "#000000")
    check(f"blanco sobre negro = 21:1 exacto (dio {r:.2f})", abs(r - 21.0) < 0.01)


def test_ratio_es_simetrico():
    r1 = ratio_contraste("#FFFFFF", "#000000")
    r2 = ratio_contraste("#000000", "#FFFFFF")
    check("el orden de los colores no cambia el ratio", abs(r1 - r2) < 1e-9)


def test_shorthand_hex_3_digitos():
    # #fff debe dar lo mismo que #ffffff.
    r_corto = ratio_contraste("#fff", "#000")
    r_largo = ratio_contraste("#ffffff", "#000000")
    check("hex de 3 digitos se expande igual que el de 6", abs(r_corto - r_largo) < 1e-9)


def test_cumple_wcag_aa_umbrales():
    check("4.5 cumple AA normal (limite exacto)", cumple_wcag_aa(4.5, texto_grande=False) is True)
    check("4.49 NO cumple AA normal", cumple_wcag_aa(4.49, texto_grande=False) is False)
    check("3.0 cumple AA grande (limite exacto)", cumple_wcag_aa(3.0, texto_grande=True) is True)
    check("2.99 NO cumple AA grande", cumple_wcag_aa(2.99, texto_grande=True) is False)


def test_paleta_real_de_la_fabrica():
    """Valores reales calculados a mano contra identidad.ts (R7-29):
    fondo=#0A0A0C, texto=#F6F6F4, acento=#FF4E24."""
    reporte = validar_paleta_base()
    por_nombre = {c.nombre: c for c in reporte.combinaciones}

    check("hay 3 combinaciones evaluadas", len(reporte.combinaciones) == 3)

    tf = por_nombre.get("texto sobre fondo")
    check("texto sobre fondo existe", tf is not None)
    if tf:
        check(f"texto sobre fondo ~18.28:1 (dio {tf.ratio})", abs(tf.ratio - 18.28) < 0.1)
        check("texto sobre fondo cumple AA normal", tf.cumple_normal is True)

    af = por_nombre.get("acento sobre fondo")
    check("acento sobre fondo existe", af is not None)
    if af:
        check(f"acento sobre fondo ~6.0:1 (dio {af.ratio})", abs(af.ratio - 6.0) < 0.15)
        check("acento sobre fondo cumple AA normal", af.cumple_normal is True)

    ta = por_nombre.get("texto sobre acento")
    check("texto sobre acento existe", ta is not None)
    if ta:
        check(f"texto sobre acento ~3.05:1 (dio {ta.ratio}) -- FALLA para texto normal, hallazgo real", abs(ta.ratio - 3.05) < 0.1)
        check("texto sobre acento NO cumple AA normal (hallazgo real, no un bug del check)", ta.cumple_normal is False)
        check("texto sobre acento SI cumple AA grande", ta.cumple_grande is True)

    # ok=False es el resultado CORRECTO hoy: la combinacion "texto sobre
    # acento" no pasa el umbral de texto normal -- el check debe
    # reportarlo, no ocultarlo. Esto no es una falla del sistema, es
    # informacion real que antes no existia en ningun lado.
    check("el reporte marca ok=False porque hay una combinacion que no cumple para texto normal", reporte.ok is False)
    check("el problema queda explicado en texto, no solo un booleano", any("texto sobre acento" in p for p in reporte.problemas))


def test_escaneo_tsx_no_rompe_si_no_hay_directorio():
    from pathlib import Path as P
    r = escanear_tsx_hex_literal(P("/no/existe/este/directorio"))
    check("directorio inexistente: no_analizable no vacio, no excepcion", len(r.no_analizable) == 1)


def test_escaneo_tsx_real_no_tira_excepcion():
    # No se afirma nada sobre el CONTENIDO (best-effort, ver docstring
    # de contraste.py) -- solo que correr sobre el codigo real de
    # verdad no rompe.
    r = escanear_tsx_hex_literal()
    check("escanear el codigo real de remotion-spike/src no tira excepcion", isinstance(r.combinaciones, list))


if __name__ == "__main__":
    test_luminancia_extremos()
    test_ratio_maximo_blanco_negro()
    test_ratio_es_simetrico()
    test_shorthand_hex_3_digitos()
    test_cumple_wcag_aa_umbrales()
    test_paleta_real_de_la_fabrica()
    test_escaneo_tsx_no_rompe_si_no_hay_directorio()
    test_escaneo_tsx_real_no_tira_excepcion()

    if FALLOS:
        print(f"{len(FALLOS)} FALLO(S):")
        for f in FALLOS:
            print(" " + f)
        sys.exit(1)
    print("Todos los tests del QA de contraste (fabrica/qa/contraste.py) pasaron OK.")
