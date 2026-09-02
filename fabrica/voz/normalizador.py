#!/usr/bin/env python3
"""
Normalizador de narración (Fase 3 de la nueva fábrica).

Resuelve la sección 10/11 del prompt maestro: un número/cifra/moneda/
fecha/porcentaje NUNCA se manda tal cual a un TTS ni se muestra tal
cual en pantalla -- se normaliza UNA vez a una estructura con
`texto_hablado` (lo que dice la voz) y `texto_visual` (lo que aparece
en pantalla), calculados por reglas explícitas, no a criterio del
motor de voz.

Cubre: enteros, decimales, dinero (con moneda), porcentajes y años
(1900-2099, heurística documentada abajo). No inventa reglas para
casos no confirmados: lo que no puede resolverse con certeza queda
señalado en PENDIENTES.md, no se adivina en este archivo.

Uso como CLI (para probar rápido):
    python3 fabrica/voz/normalizador.py "Generó $1.629 en un 35% menos"

Uso como módulo:
    from normalizador import normalizar_texto
    normalizar_texto("Generó $1.629 en 2018")
"""
from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from typing import Literal

TipoUnidad = Literal["numero", "dinero", "porcentaje", "anio", "fecha", "abreviatura"]

# ============================================================
# NUMERO -> PALABRAS (espanol, escala corta: mil / millon / mil
# millones -- la que se usa en LatAm; "billon" ambiguo no se usa).
# ============================================================

_UNIDADES = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"]
_ESPECIALES_10_19 = {
    10: "diez", 11: "once", 12: "doce", 13: "trece", 14: "catorce",
    15: "quince", 16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve",
}
_DECENAS = {
    20: "veinte", 30: "treinta", 40: "cuarenta", 50: "cincuenta",
    60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa",
}
_CENTENAS = {
    100: "cien", 200: "doscientos", 300: "trescientos", 400: "cuatrocientos",
    500: "quinientos", 600: "seiscientos", 700: "setecientos",
    800: "ochocientos", 900: "novecientos",
}


def _decenas_a_palabras(n: int, apocope: bool) -> str:
    """n entre 0 y 99."""
    if n == 0:
        return ""
    if n < 10:
        u = _UNIDADES[n]
        return "un" if (n == 1 and apocope) else u
    if n in _ESPECIALES_10_19:
        return _ESPECIALES_10_19[n]
    if n < 30:
        # 21-29 se escriben pegados: veintiuno, veintidos...
        resto = n - 20
        if resto == 0:
            return "veinte"
        if resto == 1:
            return "veintiún" if apocope else "veintiuno"
        mapa = {2: "veintidós", 3: "veintitrés", 4: "veinticuatro", 5: "veinticinco",
                6: "veintiséis", 7: "veintisiete", 8: "veintiocho", 9: "veintinueve"}
        return mapa[resto]
    decena = (n // 10) * 10
    resto = n % 10
    base = _DECENAS[decena]
    if resto == 0:
        return base
    return f"{base} y {_decenas_a_palabras(resto, apocope)}"


def _centenas_a_palabras(n: int, apocope: bool) -> str:
    """n entre 0 y 999."""
    if n == 0:
        return ""
    if n == 100:
        return "cien"
    centena = (n // 100) * 100
    resto = n % 100
    if centena == 0:
        return _decenas_a_palabras(resto, apocope)
    # "cien" solo es la forma exacta de 100; con resto (101, 150...)
    # la forma correcta es "ciento" (ciento uno, ciento cincuenta).
    base = "ciento" if centena == 100 else _CENTENAS[centena]
    if resto == 0:
        return base
    return f"{base} {_decenas_a_palabras(resto, apocope)}"


def numero_a_palabras(n: int, apocope_final: bool = False) -> str:
    """Convierte un entero (0 a 999.999.999.999) a palabras en español.

    apocope_final: si el número va seguido de un sustantivo (ej.
    "dólares"), el último grupo aplica la apócope uno->un,
    veintiuno->veintiún (ej. 21 dólares = "veintiún dólares", no
    "veintiuno dólares"). Se aplica solo al último tramo del número,
    que es la regla real del idioma.
    """
    if n < 0:
        return f"menos {numero_a_palabras(-n, apocope_final)}"
    if n == 0:
        return "cero"

    miles_millones, resto = divmod(n, 1_000_000_000)
    millones, resto = divmod(resto, 1_000_000)
    miles, unidades = divmod(resto, 1000)

    # La apocope uno->un (y veintiuno->veintiún) antes de "mil" o
    # "millón/millones" es una regla FIJA del idioma -- pasa siempre
    # que ese grupo termine justo antes de esa palabra, sin importar
    # que venga despues. Ese "un/veintiún" NO depende de
    # `apocope_final`: ese parametro solo decide la apocope del ULTIMO
    # tramo (unidades), que es el que queda pegado a un sustantivo
    # externo (ej. "...un dólares" -> "...un dólar" cuando el llamador
    # pide apocope_final=True).
    partes: list[str] = []
    if miles_millones:
        if miles_millones == 1:
            partes.append("mil millones")
        else:
            partes.append(f"{_centenas_a_palabras(miles_millones, True)} mil millones")
    if millones:
        if millones == 1:
            partes.append("un millón")
        else:
            partes.append(f"{_centenas_a_palabras(millones, True)} millones")
    if miles:
        if miles == 1:
            partes.append("mil")
        else:
            partes.append(f"{_centenas_a_palabras(miles, True)} mil")
    if unidades:
        partes.append(_centenas_a_palabras(unidades, apocope_final))

    return " ".join(partes)


# ============================================================
# UNIDADES NORMALIZADAS (contrato de datos, seccion 10 del prompt)
# ============================================================

@dataclass
class UnidadNormalizada:
    tipo: TipoUnidad
    valor: float
    texto_hablado: str
    texto_visual: str
    moneda: str | None = None
    span: tuple[int, int] = field(default=(0, 0))  # posicion en el texto original

    def to_dict(self) -> dict:
        d = {"tipo": self.tipo, "valor": self.valor, "texto_hablado": self.texto_hablado,
             "texto_visual": self.texto_visual}
        if self.moneda:
            d["moneda"] = self.moneda
        return d


MONEDAS = {
    "USD": {"simbolo": "$", "singular": "dólar", "plural": "dólares"},
    "ARS": {"simbolo": "$", "singular": "peso", "plural": "pesos"},
    "EUR": {"simbolo": "€", "singular": "euro", "plural": "euros"},
}


def _formatear_visual_miles(n: int) -> str:
    """1629 -> '1.629' (separador de miles con punto, convencion es-AR/es-LatAm)."""
    return f"{n:,}".replace(",", ".")


def normalizar_numero(valor: float) -> UnidadNormalizada:
    entero = int(valor)
    if valor == entero:
        hablado = numero_a_palabras(entero)
        visual = _formatear_visual_miles(entero)
    else:
        parte_entera = int(valor)
        parte_decimal = round((valor - parte_entera) * 100)
        hablado = f"{numero_a_palabras(parte_entera)} coma {numero_a_palabras(parte_decimal)}"
        visual = f"{_formatear_visual_miles(parte_entera)},{parte_decimal:02d}"
    return UnidadNormalizada(tipo="numero", valor=valor, texto_hablado=hablado, texto_visual=visual)


def normalizar_dinero(valor: float, moneda: str = "USD") -> UnidadNormalizada:
    if moneda not in MONEDAS:
        raise ValueError(f"Moneda no soportada: {moneda!r} (soportadas: {list(MONEDAS)})")
    info = MONEDAS[moneda]
    entero = int(valor)
    centavos = round((valor - entero) * 100)

    palabra_moneda = info["singular"] if entero == 1 and centavos == 0 else info["plural"]
    numero_hablado = numero_a_palabras(entero, apocope_final=True)
    # "millón"/"millones" siempre lleva "de" antes del sustantivo que
    # sigue inmediatamente (un millón DE dólares, no "un millón dólares").
    # Si el número sigue con mas grupos despues (ej. "un millón
    # doscientos mil"), no aplica -- por eso se chequea que la frase
    # TERMINE en millón/millones, no que lo contenga.
    conector = " de" if re.search(r"\bmill(?:ón|ones)$", numero_hablado) else ""
    hablado = f"{numero_hablado}{conector} {palabra_moneda}"
    if centavos:
        hablado += f" con {numero_a_palabras(centavos, apocope_final=True)} centavos"

    visual = f"{info['simbolo']}{_formatear_visual_miles(entero)}"
    if centavos:
        visual += f",{centavos:02d}"

    return UnidadNormalizada(tipo="dinero", valor=valor, moneda=moneda,
                              texto_hablado=hablado, texto_visual=visual)


def normalizar_porcentaje(valor: float) -> UnidadNormalizada:
    entero = int(valor)
    if valor == entero:
        hablado = f"{numero_a_palabras(entero, apocope_final=True)} por ciento"
        visual = f"{entero}%"
    else:
        parte_decimal = round((valor - entero) * 100)
        hablado = (f"{numero_a_palabras(entero)} coma {numero_a_palabras(parte_decimal)} "
                   "por ciento")
        visual = f"{valor}%".replace(".", ",")
    return UnidadNormalizada(tipo="porcentaje", valor=valor, texto_hablado=hablado, texto_visual=visual)


def normalizar_anio(anio: int) -> UnidadNormalizada:
    """Los años en español se leen como número completo ('dos mil
    dieciocho'), no partido en dos como en inglés ('twenty eighteen").
    """
    return UnidadNormalizada(tipo="anio", valor=anio, texto_hablado=numero_a_palabras(anio),
                              texto_visual=str(anio))


MESES = {1: "enero", 2: "febrero", 3: "marzo", 4: "abril", 5: "mayo", 6: "junio",
          7: "julio", 8: "agosto", 9: "septiembre", 10: "octubre", 11: "noviembre", 12: "diciembre"}


def normalizar_fecha(dia: int, mes: int, anio: int) -> UnidadNormalizada:
    """Fecha completa (dia + mes + anio). Regla real del español: el
    dia 1 de un mes se lee como ordinal ("primero de enero"), el resto
    de los dias se lee como cardinal ("dos de enero", "quince de
    marzo") -- NO como ordinal (nadie dice "el quinceavo de marzo").
    El anio se lee siempre como numero completo (ver normalizar_anio).
    """
    dia_hablado = "primero" if dia == 1 else numero_a_palabras(dia)
    hablado = f"{dia_hablado} de {MESES[mes]} de {numero_a_palabras(anio)}"
    visual = f"{dia:02d}/{mes:02d}/{anio}"
    return UnidadNormalizada(tipo="fecha", valor=float(anio), texto_hablado=hablado, texto_visual=visual)


# ============================================================
# ABREVIATURAS (seccion 10/11): lo que se ve en pantalla puede quedar
# abreviado (asi se lee mas rapido), pero un TTS que "lee" "Dr." tal
# cual suena mal o directamente deletrea las letras -- se expande SOLO
# en texto_hablado, texto_visual conserva la abreviatura tal como la
# escribio el guionista.
# ============================================================
ABREVIATURAS = {
    "EE.UU.": "Estados Unidos",
    "Dra.": "doctora",
    "Dr.": "doctor",
    "Sra.": "señora",
    "Srta.": "señorita",
    "Sr.": "señor",
    "Uds.": "ustedes",
    "Ud.": "usted",
    "aprox.": "aproximadamente",
    "p.ej.": "por ejemplo",
    "etc.": "etcétera",
    "núm.": "número",
    "vs.": "contra",
}
_ABREVIATURAS_LOWER = {k.lower(): v for k, v in ABREVIATURAS.items()}
_RE_ABREVIATURA = re.compile(
    "|".join(re.escape(k) for k in sorted(ABREVIATURAS, key=len, reverse=True)),
    re.IGNORECASE,
)


def normalizar_abreviatura(texto_original: str) -> UnidadNormalizada:
    hablado = _ABREVIATURAS_LOWER[texto_original.lower()]
    return UnidadNormalizada(tipo="abreviatura", valor=0.0, texto_hablado=hablado, texto_visual=texto_original)


# ============================================================
# DETECCION AUTOMATICA SOBRE UN TEXTO LIBRE
# ============================================================
# Heuristica documentada (no es NLP real, son regex sobre patrones de
# escritura ya usados en los guiones de la serie documental):
#   $1.234[,56]         -> dinero (USD por defecto; ver `moneda_por_defecto`)
#   1.234 / 1234 + %    -> porcentaje
#   15/03/2024 o 15-03-2024      -> fecha completa
#   1900-2099 aislado    -> anio (falso positivo posible con montos sin
#                            "$" que casualmente caen en ese rango --
#                            aceptado como limitacion conocida, no se
#                            resuelve con mas heuristica fragil)
#   1.234 (con puntos de miles, sin $ ni %)  -> numero
#   Dr. / Sr. / EE.UU. / etc.    -> abreviatura (diccionario cerrado,
#                            ver ABREVIATURAS -- no se adivinan nuevas)
#   numero suelto de 1 a 3 digitos (sin separador de miles, sin ya
#   haber sido consumido por otra regla) -> numero. Si va seguido de
#   "de <mes>" se trata como el dia de una fecha escrita en palabras
#   (ej. "15 de marzo de 2024" -> el "2024" ya lo agarra _RE_ANIO, el
#   "15" lo agarra esta regla con la forma especial del dia 1 = "primero").

_RE_DINERO = re.compile(r"\$\s?(\d{1,3}(?:\.\d{3})*)(?:,(\d{2}))?")
_RE_PORCENTAJE = re.compile(r"(\d+(?:,\d+)?)\s?%")
_RE_FECHA_BARRA = re.compile(r"\b([0-3]?\d)[/-](0?[1-9]|1[0-2])[/-](\d{4})\b")
_RE_ANIO = re.compile(r"\b(19|20)\d{2}\b")
_RE_NUMERO_MILES = re.compile(r"\b\d{1,3}(?:\.\d{3})+\b")
_RE_NUMERO_SIMPLE = re.compile(r"\b\d{1,3}\b")
_RE_SEGUIDO_DE_MES = re.compile(r"^\s+de\s+(" + "|".join(MESES.values()) + r")\b", re.IGNORECASE)


def detectar_y_normalizar(texto: str, moneda_por_defecto: str = "USD") -> list[UnidadNormalizada]:
    encontrados: list[UnidadNormalizada] = []
    ocupado: list[tuple[int, int]] = []  # spans ya tomados, para no reprocesar

    def _libre(a: int, b: int) -> bool:
        return not any(a < oe and b > os for os, oe in ocupado)

    for m in _RE_DINERO.finditer(texto):
        entero = int(m.group(1).replace(".", ""))
        centavos = int(m.group(2)) if m.group(2) else 0
        valor = entero + centavos / 100
        u = normalizar_dinero(valor, moneda_por_defecto)
        u.span = m.span()
        encontrados.append(u)
        ocupado.append(m.span())

    # Fechas dd/mm/yyyy o dd-mm-yyyy ANTES que anio/numero-miles: una
    # fecha completa "consume" su yyyy entero para que no se procese
    # de nuevo por separado como si fuera un anio suelto.
    for m in _RE_FECHA_BARRA.finditer(texto):
        if not _libre(*m.span()):
            continue
        dia, mes, anio = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if not (1 <= dia <= 31):
            continue
        u = normalizar_fecha(dia, mes, anio)
        u.span = m.span()
        encontrados.append(u)
        ocupado.append(m.span())

    for m in _RE_PORCENTAJE.finditer(texto):
        if not _libre(*m.span()):
            continue
        valor = float(m.group(1).replace(",", "."))
        u = normalizar_porcentaje(valor)
        u.span = m.span()
        encontrados.append(u)
        ocupado.append(m.span())

    for m in _RE_ANIO.finditer(texto):
        if not _libre(*m.span()):
            continue
        u = normalizar_anio(int(m.group(0)))
        u.span = m.span()
        encontrados.append(u)
        ocupado.append(m.span())

    for m in _RE_NUMERO_MILES.finditer(texto):
        if not _libre(*m.span()):
            continue
        valor = int(m.group(0).replace(".", ""))
        u = normalizar_numero(valor)
        u.span = m.span()
        encontrados.append(u)
        ocupado.append(m.span())

    for m in _RE_ABREVIATURA.finditer(texto):
        if not _libre(*m.span()):
            continue
        u = normalizar_abreviatura(m.group(0))
        u.span = m.span()
        encontrados.append(u)
        ocupado.append(m.span())

    # Numero suelto (1-3 digitos, sin separador de miles): ultimo
    # porque cualquier digito ya consumido por dinero/fecha/anio/miles
    # cae DENTRO de un span ocupado y se salta -- solo llegan aca los
    # numeros que ninguna regla mas especifica reclamo.
    for m in _RE_NUMERO_SIMPLE.finditer(texto):
        if not _libre(*m.span()):
            continue
        valor = int(m.group(0))
        resto = texto[m.end():m.end() + 30]
        if _RE_SEGUIDO_DE_MES.match(resto):
            hablado = "primero" if valor == 1 else numero_a_palabras(valor)
            u = UnidadNormalizada(tipo="numero", valor=valor, texto_hablado=hablado,
                                   texto_visual=str(valor))
        else:
            u = normalizar_numero(valor)
        u.span = m.span()
        encontrados.append(u)
        ocupado.append(m.span())

    encontrados.sort(key=lambda u: u.span[0])
    return encontrados


def texto_con_narracion_normalizada(texto: str, moneda_por_defecto: str = "USD") -> str:
    """Devuelve el texto listo para mandar al TTS: cada cifra detectada
    se reemplaza por su forma hablada. Lo que NO se detecta como cifra
    queda intacto."""
    unidades = detectar_y_normalizar(texto, moneda_por_defecto)
    resultado = []
    cursor = 0
    for u in unidades:
        a, b = u.span
        resultado.append(texto[cursor:a])
        resultado.append(u.texto_hablado)
        cursor = b
    resultado.append(texto[cursor:])
    return "".join(resultado)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 0
    texto = " ".join(sys.argv[1:])
    unidades = detectar_y_normalizar(texto)
    print(f"Texto original:  {texto}")
    print(f"Texto para TTS:  {texto_con_narracion_normalizada(texto)}")
    print("Unidades detectadas:")
    for u in unidades:
        print(f"  {u.to_dict()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
