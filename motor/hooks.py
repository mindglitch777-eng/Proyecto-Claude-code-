#!/usr/bin/env python3
"""
Hooks: generacion (§9), filtro de agresividad (§2 y §3) y score (§10).

QUE HACE Y QUE NO
    GENERA muchas variantes por idea, no tres, combinando las doce
    familias de §9 con los datos concretos que la idea trae. Una
    plantilla a la que le falta un dato NO se usa: si la idea no tiene
    cifra, no hay hook de cifra. Preferimos veinte hooks que se apoyan
    en algo a ochenta rellenos con "X".

    RECHAZA de entrada lo que §2 llama mal agresivo y lo que §3
    prohibe en los primeros segundos. Eso si es decidible por programa:
    "ganá 10.000 dólares garantizado" es mal agresivo siempre, no
    segun el gusto.

    PUNTUA con proxies medibles, no con juicio. El programa puede
    contar palabras, detectar una cifra, ver si la frase abre un bucle
    o lo cierra, si nombra algo mostrable, si repite una formula
    gastada. NO puede saber si algo va a funcionar. Por eso el puntaje
    se guarda marcado como SUGERIDO y §10 lo dice explicito: no se
    elige el mas alto automaticamente. El programa ordena; elige una
    persona, y esa eleccion se marca aparte (hooks.elegido).
"""
import re
import unicodedata

from motor.base import CATEGORIAS_HOOK

# §10. Suman 100. Se pueden cambiar sin tocar el resto del motor.
PESOS = {"viral": 18, "curiosidad": 18, "comercial": 14, "claridad": 14,
         "credibilidad": 14, "diferenciacion": 12, "visual": 10}


def _norm(t):
    t = unicodedata.normalize("NFD", (t or "").lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


# ---------------------------------------------------------------- §2 y §3
# Cada patron viene con el motivo, para que el rechazo se pueda leer y
# discutir en vez de ser un "no" del programa.

PROHIBIDO = [
    (r"\bgarantiz\w*", "§2 promesa garantizada"),
    (r"(gana|ganas|ganaras|vas a ganar|hace|haces)\s+\$?\s*\d[\d.,]*",
     "§2 promesa de dinero con cifra"),
    (r"\bdinero facil\b|\bplata facil\b|\bsin esfuerzo\b|\bsin hacer nada\b",
     "§2 promesa de dinero facil"),
    (r"cambiar\w*\s+tu\s+vida|te\s+va\s+a\s+cambiar\s+la\s+vida|"
     r"esto\s+lo\s+cambia\s+todo", "§2 'esto cambiara tu vida'"),
    (r"\bno\s+vas\s+a\s+creer\b|\bte\s+va\s+a\s+explotar\s+la\s+cabeza\b",
     "§2 clickbait vacio"),
    (r"^\s*(hola|buenas|que tal|bienvenid)", "§3 saludo de apertura"),
    (r"^\s*(hoy\s+(vamos|te\s+voy)|en\s+este\s+video|te\s+voy\s+a\s+ensenar|"
     r"si\s+estas\s+interesad)", "§3 introduccion en vez de conflicto"),
]

# No se rechazan, pero bajan diferenciacion: son formulas que ya vio
# todo el mundo. §22 pide poder distinguir que variable movio la aguja,
# y una formula gastada no distingue nada.
GASTADAS = [
    "el secreto que nadie", "nadie te cuenta", "lo que no te dicen",
    "esto es oro", "guarda esto", "el metodo que uso", "paso a paso",
    "herramientas de ia que", "que debes conocer", "en 2026 vas a",
    "la formula", "hack", "truco definitivo",
]

EMOJI = re.compile("[\U0001F000-\U0001FAFF☀-➿]")


def rechazo(texto):
    """Motivo por el que el hook no puede usarse, o None si pasa."""
    t = _norm(texto).strip()
    for patron, motivo in PROHIBIDO:
        if re.search(patron, t):
            return motivo
    if len(EMOJI.findall(texto)) > 1:
        return "§2 exceso de emojis"
    if texto.count("!") >= 2:
        return "§2 gritos"
    letras = [c for c in texto if c.isalpha()]
    if len(letras) > 12 and sum(c.isupper() for c in letras) / len(letras) > 0.6:
        return "§2 gritos (mayuscula sostenida)"
    if len(texto.split()) < 3:
        return "hook de menos de 3 palabras: no alcanza a plantear nada"
    return None


# ---------------------------------------------------------------- §10
# Proxies. Cada uno dice explicito que mide, porque un numero sin saber
# de donde sale es peor que no tenerlo.

ABRE_BUCLE = ("hasta que", "pero ", "el problema", "lo raro", "lo que no",
              "y ahi", "resulta que", "salvo que", "menos", "excepto")
CIERRA = ("porque asi", "en resumen", "conclusion", "moraleja")
MOSTRABLE = ("pantalla", "captura", "app", "web", "pagina", "producto",
             "grafico", "planilla", "excel", "factura", "precio", "local",
             "taller", "cartel", "mensaje", "whatsapp", "perfil", "tienda",
             "anuncio", "video", "foto", "lista", "menu", "ticket")
COMERCIAL = ("cobra", "cobrar", "precio", "vende", "vender", "vendio",
             "factura", "dolar", "dolares", "peso", "pesos", "plata",
             "dinero", "margen", "costo", "cliente", "mercado", "paga",
             "pagar", "ingreso", "gana", "negocio", "suscripcion")
ATRIBUCION = ("afirma", "dice", "publico", "declaro", "segun", "muestra",
              "medimos", "encontramos", "probamos")
ABSOLUTOS = ("siempre", "nunca falla", "el mejor", "el unico", "todos los",
             "cualquiera puede")
CONFLICTO = ("pero", "sin embargo", "aunque", "y sin embargo", "no es",
             "en realidad", "al reves", "contra", "hasta que", "resulta")


def _c(v):
    return max(1, min(10, int(round(v))))


def puntuar(texto, idea_slots=None, objetivo=None):
    """Devuelve las siete dimensiones de §10, cada una 1..10, con una
    explicacion de que se midio. Son proxies: cuentan rasgos de la
    frase, no adivinan el resultado."""
    idea_slots = idea_slots or {}
    t = _norm(texto)
    palabras = texto.split()
    n = len(palabras)
    tiene_cifra = bool(re.search(r"\d", texto))
    largas = sum(1 for p in palabras if len(p) > 10)
    gastadas = sum(1 for g in GASTADAS if g in t)
    abre = sum(1 for m in ABRE_BUCLE if m in t)
    pregunta = texto.strip().endswith("?")
    mostrable = sum(1 for m in MOSTRABLE if m in t)
    comercial = sum(1 for m in COMERCIAL if m in t)
    atrib = sum(1 for m in ATRIBUCION if m in t)
    absol = sum(1 for m in ABSOLUTOS if m in t)
    confl = sum(1 for m in CONFLICTO if m in t)
    propio = sum(1 for p in palabras[1:] if p[:1].isupper())

    # CLARIDAD: pocas palabras, pocas palabras largas, sin subordinadas
    # encadenadas. El punto dulce de un hook hablado son 6-14 palabras.
    if n <= 5:
        cl = 7
    elif n <= 14:
        cl = 10
    elif n <= 20:
        cl = 7
    else:
        cl = 4
    cl -= min(3, largas)
    cl -= min(2, t.count(",") // 2)

    # CURIOSIDAD: abre un bucle y no lo cierra en la misma frase.
    cu = 3 + 2.2 * abre + (2 if pregunta else 0) + (1 if tiene_cifra else 0)
    if any(c in t for c in CIERRA):
        cu -= 3

    # CREDIBILIDAD: una cifra atribuida suma; un absoluto resta. Sin
    # cifra queda en el medio: no miente, pero tampoco prueba nada.
    cr = 6 + (2 if tiene_cifra else 0) + 1.5 * atrib - 2.0 * absol
    if tiene_cifra and not (idea_slots.get("etiqueta_cifra") or atrib):
        # §17: una cifra suelta, sin de donde salio, es un pasivo.
        cr -= 3

    # COMERCIAL: habla de plata o de mercado, y la pieza apunta a eso.
    co = 3 + 1.6 * comercial + (2 if objetivo in
                                ("conversion", "producto", "oportunidad") else 0)

    # DIFERENCIACION: castigo por formula gastada, premio por concreto
    # (nombre propio, cifra, nicho nombrado).
    di = 6 - 2.5 * gastadas + (1.5 if tiene_cifra else 0) + min(2, propio)

    # VISUAL: nombra algo que se puede poner en pantalla.
    vi = 3 + 2.0 * mostrable + (2 if tiene_cifra else 0)

    # VIRAL: conflicto + concreto + breve + no gastado. Es el proxy mas
    # flojo de los siete y conviene tratarlo como tal.
    vr = (2 + 1.6 * confl + (1.5 if tiene_cifra else 0)
          + (2 if 6 <= n <= 14 else 0) - 2.0 * gastadas)

    return {
        "claridad": _c(cl), "curiosidad": _c(cu), "credibilidad": _c(cr),
        "comercial": _c(co), "diferenciacion": _c(di), "visual": _c(vi),
        "viral": _c(vr),
    }


def total(dims):
    """Puntaje 0..100 con los pesos de PESOS. Re-normaliza por si los
    pesos no suman 100."""
    s = sum(PESOS.values()) or 1
    return round(sum(dims[k] * PESOS[k] for k in PESOS) / s * 10, 1)


# ---------------------------------------------------------------- §9
# Plantillas por familia. {llave} se llena con los slots de la idea; si
# falta una llave, la plantilla se saltea.

PLANTILLAS = {
    "dinero": [
        "{sujeto} cobra {precio} por {cosa}.",
        "{precio} por algo que lleva {tiempo}.",
        "Lo que {sujeto} factura con {cosa} no es lo raro. Lo raro es cuanto le cuesta.",
        "Alguien esta cobrando {precio} por {cosa} y no para de conseguir clientes.",
    ],
    "descubrimiento": [
        "Encontramos un mercado que {problema} y casi nadie lo esta mirando.",
        "Hay {cifra} personas buscando {cosa} y nadie se los esta vendiendo.",
        "Buscando otra cosa aparecio {cosa}. Y el numero no cerraba.",
        "{mercado} tiene un hueco que se ve a simple vista una vez que sabes donde mirar.",
    ],
    "contradiccion": [
        "Todo el mundo dice que {creencia}. Los numeros dicen otra cosa.",
        "Todos estan haciendo {cosa}. Por eso mismo ya no funciona.",
        "{creencia}. Salvo que mires {mercado}, donde pasa exactamente al reves.",
    ],
    "curiosidad": [
        "Hay algo raro en como {sujeto} consigue clientes.",
        "{cosa} no deberia funcionar. Funciona igual.",
        "Nadie explica por que {problema}. Nosotros fuimos a mirar.",
    ],
    "shock": [
        "{cosa} parece una estupidez. Y sin embargo alguien lo vende.",
        "El producto es {cosa}. El precio es {precio}. No es un error.",
        "Esto que ves aca lo hace una IA en minutos. Alguien lo cobra igual.",
    ],
    "oportunidad": [
        "Si empezara de cero hoy, iria por {mercado}.",
        "{mercado} tiene demanda y no tiene quien la atienda.",
        "Lo mas facil de vender ahora mismo es {cosa}. Y casi nadie lo hace.",
    ],
    "conflicto": [
        "{cosa} funciona. Pero hay un problema que nadie menciona.",
        "El modelo cierra. Hasta que mirás {problema}.",
        "{sujeto} la tiene resuelta. Salvo por una cosa.",
    ],
    "comparacion": [
        "Esto cuesta {precio}. Hacer algo parecido cuesta bastante menos.",
        "{sujeto} y vos hacen lo mismo. Uno cobra {precio}, el otro no.",
        "Misma herramienta, dos usos. Uno paga las cuentas, el otro no.",
    ],
    "historia": [
        "Todo empezo cuando {sujeto} dejo de {error}.",
        "{sujeto} hacia {cosa} a mano. Hasta que se dio cuenta de una cosa.",
    ],
    "desafio": [
        "Vamos a probar si {cosa} realmente funciona.",
        "Nos dimos {tiempo} para ver si {cosa} vende. Esto paso.",
        "Dijeron que {creencia}. Lo probamos.",
    ],
    "fomo": [
        "Mientras todos miran {cosa}, {mercado} se esta llenando.",
        "Esto ya lo esta haciendo alguien en {lugar}. Aca todavia no.",
    ],
    "autoridad": [
        "Encontramos {cifra} casos que muestran lo mismo.",
        "Medimos {mercado} y el numero fue {cifra}.",
        "{sujeto} afirma haber hecho {cifra}. Fuimos a ver si cerraba.",
    ],
    "secreto": [
        "{sujeto} no explica de donde saca los clientes. Lo miramos igual.",
        "Lo que hace {sujeto} con {cosa} no esta en ningun curso.",
    ],
    "error": [
        "Cotizar a ojo te esta costando mas que {precio} por mes.",
        "El error no es {error}. Es lo que pasa despues.",
        "{error} parece gratis. Tiene un precio y es {precio}.",
    ],
    "advertencia": [
        "Si seguis con {error}, {mercado} te pasa por arriba este año.",
        "{cosa} funciona hoy. Dentro de seis meses no.",
    ],
    "transformacion": [
        "{sujeto} hacia {error}. Hoy cobra {precio} por lo mismo.",
        "Mismo laburo, misma persona, {precio} de diferencia.",
    ],
}

# §17: si el hook trae una cifra, la idea tiene que decir de donde sale.
LLAVES = ("sujeto", "cosa", "cifra", "precio", "mercado", "creencia",
          "error", "resultado", "tiempo", "lugar", "problema")


def generar(slots, categorias=None):
    """Todos los hooks que los datos de la idea permiten sostener.
    Devuelve [(categoria, texto, motivo_de_rechazo_o_None)]."""
    salida = []
    for cat in (categorias or CATEGORIAS_HOOK):
        for plantilla in PLANTILLAS.get(cat, []):
            faltan = [ll for ll in LLAVES
                      if "{" + ll + "}" in plantilla and not slots.get(ll)]
            if faltan:
                continue
            txt = plantilla.format(**{k: slots.get(k, "") for k in LLAVES})
            txt = re.sub(r"\s+", " ", txt).strip()
            salida.append((cat, txt, rechazo(txt)))
    return salida
