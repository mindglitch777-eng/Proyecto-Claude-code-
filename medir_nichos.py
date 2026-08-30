#!/usr/bin/env python3
"""
Mide demanda de busqueda REAL de los nichos candidatos, por pais.

Corre en el runner: pytrends contra un IP de datacenter es rechazado
seguido, asi que cada consulta lleva reintentos con espera larga y las
consultas van bien separadas entre si.

QUE MIDE Y QUE NO
    Google Trends da demanda RELATIVA (0-100 dentro de cada consulta),
    no volumen absoluto. Sirve para comparar terminos ENTRE SI en la
    misma consulta, no para decir "X tiene N busquedas". Por eso los
    terminos se agrupan de a 5 y cada grupo se compara internamente.

    Tampoco mide intencion de COMPRA: que alguien busque "cuanto cobrar
    por reparar un celular" prueba que tiene el problema, no que vaya a
    pagar por una herramienta. Eso hay que validarlo por otro lado.

Escribe MEDICION_NICHOS.md
"""
import time
from pathlib import Path

PAISES = [("AR", "Argentina"), ("MX", "México"), ("ES", "España"),
          ("CO", "Colombia")]

# Grupos de <=5 terminos. Dentro de cada grupo los numeros son
# comparables entre si; entre grupos NO.
GRUPOS = [
    ("Pregunta de precio, generica", [
        "cuanto cobrar", "cuanto cobrar por hora", "calcular precio",
        "calcular rentabilidad", "cuanto ganar"]),
    ("Oficios candidatos", [
        "reparacion de celulares", "paseador de perros", "detailing",
        "fotografo de eventos", "limpieza por hora"]),
    ("Reparacion, especifico", [
        "cambiar modulo celular", "reparar celular precio",
        "curso reparacion celulares", "repuestos celulares",
        "taller de celulares"]),
    ("Mascotas, especifico", [
        "cuidador de perros", "guarderia canina", "paseo de perros precio",
        "pet sitting", "cuidar mascotas trabajo"]),
    ("Herramientas de gestion", [
        "calculadora de costos", "plantilla excel costos",
        "software para taller", "presupuesto online", "cotizador"]),
]


def medir(terminos, geo, intentos=3):
    from pytrends.request import TrendReq
    ultimo = None
    for i in range(intentos):
        try:
            py = TrendReq(hl="es", tz=180, timeout=(10, 30))
            py.build_payload(terminos, timeframe="today 12-m", geo=geo)
            df = py.interest_over_time()
            if df is None or df.empty:
                return None, "sin datos para esos terminos en esa region"
            return ({t: {"promedio": round(float(df[t].mean()), 1),
                         "pico": int(df[t].max())}
                     for t in terminos if t in df.columns}, None)
        except Exception as e:
            ultimo = str(e)[:120]
            espera = 30 * (i + 1)
            print(f"    reintento en {espera}s ({ultimo})")
            time.sleep(espera)
    return None, ultimo


def main():
    md = ["# Medición de demanda por nicho — Google Trends\n",
          f"_Generado desde el runner el "
          f"{time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}._\n",
          "\n## Cómo leer esto\n",
          "Los números son **demanda relativa (0-100) dentro de cada grupo**, "
          "no volumen de búsquedas. Comparables ENTRE TÉRMINOS DEL MISMO "
          "GRUPO y del mismo país; **no** comparables entre grupos.\n",
          "\nY miden que la gente **busca** el tema — no que vaya a **pagar** "
          "por una herramienta. Eso es otra pregunta y hay que validarla "
          "aparte.\n"]

    for titulo, terminos in GRUPOS:
        md.append(f"\n## {titulo}\n")
        for geo, nombre in PAISES:
            print(f"[{titulo}] {nombre}...")
            datos, err = medir(terminos, geo)
            md.append(f"\n### {nombre}\n")
            if err:
                md.append(f"_No se pudo medir: {err}_\n")
            else:
                md.append("| Término | Promedio | Pico |")
                md.append("|---|---|---|")
                for t in terminos:
                    d = datos.get(t)
                    md.append(f"| {t} | {d['promedio'] if d else '—'} | "
                              f"{d['pico'] if d else '—'} |")
            time.sleep(20)

    Path("MEDICION_NICHOS.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print("Escrito MEDICION_NICHOS.md")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
