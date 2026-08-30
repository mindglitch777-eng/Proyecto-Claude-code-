#!/usr/bin/env python3
"""
Capa de ESTILO: lo que le faltaba a la fabrica.

EL DIAGNOSTICO QUE LA HIZO NECESARIA
    Medido sobre los 32 guiones que ya existian, 246 planos: 3 paletas
    distintas (28 guiones comparten una), 66 planos sin formato
    declarado, mediana de plano 2.3s con solo 3 planos de 246 por
    debajo de 0.8s, y 32 de 32 CTA que dicen "Seguime".

    No es falta de ganas del autor. Es que hoy un "estilo" es lo que
    alguien tipeo a mano en unos noventa campos por segmento, quince
    veces por video. Nadie sostiene eso variando: se copia el guion
    anterior y se cambia el texto. Por eso 32 guiones son un guion
    repetido 32 veces.

QUE HACE ESTA CAPA
    Da vuelta la responsabilidad. El guion pasa a declarar CONTENIDO
    -- que se dice, que se muestra, que evidencia hay -- y el estilo
    decide COMO se ve: maqueta por rol narrativo, paleta, tipografia,
    camara, transiciones, densidad, ritmo y tratamiento de captions.

    El mismo contenido rendido con seis estilos da seis videos que se
    ven distintos y siguen siendo del mismo canal.

    Las 30 maquetas de animador_v9 no se tocan: pasan a ser las
    PIEZAS que el estilo elige, en vez de la decision del autor.

COMO SE USA
    python3 estilos.py listar
    python3 estilos.py aplicar contenido/x.json --estilo VS --salida guiones/x-vs.json
    python3 estilos.py preview --estilos          un plano de cada estilo
    python3 estilos.py preview --combinaciones    estilo x narrativa
"""
import argparse
import copy
import json
import random
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent

# ---------------------------------------------------------------- RITMO
# Medido en la referencia (ESTILO.md): su cadencia NO es pareja. Cortes
# de 0.03s conviviendo con planos sostenidos de hasta 10.7s. Los cuatro
# registros de abajo son ese rango partido en tramos usables.
RITMOS = {
    "BURST":     (0.35, 0.80),
    "FAST":      (0.80, 1.50),
    "NORMAL":    (1.50, 3.00),
    "SUSTAINED": (3.00, 8.00),
}

# Secuencias de registros. El ritmo responde a la narrativa: la rafaga
# va donde se acumula, el sostenido donde hay que leer algo.
PERFILES_RITMO = {
    "irregular_a": ["BURST", "FAST", "FAST", "SUSTAINED", "BURST", "NORMAL",
                    "SUSTAINED", "BURST", "NORMAL"],
    "irregular_b": ["FAST", "SUSTAINED", "BURST", "BURST", "NORMAL",
                    "SUSTAINED", "FAST", "NORMAL"],
    "creciente":   ["SUSTAINED", "NORMAL", "NORMAL", "FAST", "FAST",
                    "BURST", "BURST", "FAST"],
    "decreciente": ["BURST", "BURST", "FAST", "NORMAL", "NORMAL",
                    "SUSTAINED", "SUSTAINED"],
    "parejo":      ["NORMAL"],          # el de antes, para comparar
}

# Cuanto texto y cuantos elementos por plano. Cambia DURANTE el video:
# hook denso, explicacion aireada, evidencia densa, cierre limpio.
DENSIDADES = {"LOW": 0.55, "MEDIUM": 1.0, "HIGH": 1.35, "EXTREME": 1.7}

# ---------------------------------------------------------------- ROLES
# Vocabulario compartido entre narrativas y estilos. Una narrativa es
# una secuencia de roles; un estilo dice con que maqueta se dibuja cada
# rol. Asi las dos cosas se combinan sin conocerse.
ROLES = ("hook", "afirmacion", "contradiccion", "duda", "descubrimiento",
         "evidencia", "metodo", "prueba", "giro", "resultado", "leccion",
         "conclusion", "oportunidad", "porque_ahora", "ejemplo", "accion",
         "hipotesis", "construccion", "problema", "decision", "persona",
         "aprendizaje", "cta")

NARRATIVAS = {
    "money_story": ["hook", "resultado", "contradiccion", "descubrimiento",
                    "metodo", "prueba", "giro", "conclusion", "cta"],
    "investigation": ["hook", "afirmacion", "duda", "evidencia",
                      "descubrimiento", "conclusion", "cta"],
    "experiment": ["hook", "hipotesis", "construccion", "prueba",
                   "resultado", "aprendizaje", "cta"],
    "case_study": ["hook", "persona", "problema", "decision", "metodo",
                   "resultado", "leccion", "cta"],
    "opportunity": ["hook", "problema", "oportunidad", "porque_ahora",
                    "ejemplo", "metodo", "accion", "cta"],
}


# ---------------------------------------------------------------- ESTILOS
# Los seis comparten familia tipografica y color de acento -- eso es lo
# que los hace del mismo canal. Se diferencian en fondo, maqueta por
# rol, camara, densidad y tratamiento del texto.
#
# Cada estilo declara:
#   paleta        fondo / texto / destacado
#   maquetas      rol -> (formato, campos extra). El primero de la lista
#                 es el preferido; los demas rotan para no repetir.
#   camara        0 = fija; 1 = la deriva de siempre
#   transicion    la que usa por defecto entre planos
#   flash_ritmo   pulso de flashes, o None
#   captions      tratamiento del subtitulo palabra por palabra
#   ritmo         perfil por defecto
#   densidad      por rol; lo que no este listado va MEDIUM
#   alterna_claro cada cuantos carteles planos da vuelta a fondo claro

ACENTO = [255, 78, 36]          # el naranja de marca, comun a los seis

ESTILOS = {
    # ---------------------------------------------------------------
    "VS": {
        "nombre": "Venta Silenciosa — editorial",
        "descripcion": "Baseline. Bloques escalonados sobre negro y blanco "
                       "plenos, serif display contra sans pesada, cortes "
                       "secos. El salto de fondo ES la transicion.",
        "paleta": {"fondo": [10, 10, 12], "texto": [246, 246, 244],
                   "destacado": ACENTO},
        "camara": 0.35, "transicion": "corte_duro", "acentos": ["punch", "corte_duro", "whip"], "flash_ritmo": None,
        "captions": {"captions_estilo": "chico", "captions_y": 0.60},
        "ritmo": "irregular_a", "alterna_claro": 3,
        "densidad": {"hook": "HIGH", "evidencia": "HIGH",
                     "conclusion": "LOW", "cta": "MEDIUM"},
        "maquetas": {
            "hook":        [("cascada", {"encuadre": "plano"})],
            "afirmacion":  [("cascada", {"encuadre": "sangre", "velo": 0.36}),
                            ("cascada", {"encuadre": "plano"})],
            "contradiccion": [("cascada", {"encuadre": "plano"}),
                              ("comparacion", {})],
            "evidencia":   [("prueba", {})],
            "prueba":      [("prueba", {})],
            "metodo":      [("flujo", {}), ("menu", {})],
            "resultado":   [("cascada", {"encuadre": "plano"}),
                            ("dato_duro", {})],
            "giro":        [("cascada", {"encuadre": "tarjeta", "velo": 0.15})],
            "conclusion":  [("cascada", {"encuadre": "plano"})],
            "cta":         [("cta", {"mayus": True})],
        },
    },
    # ---------------------------------------------------------------
    "MONEY": {
        "nombre": "Money Story — la cifra manda",
        "descripcion": "Todo gira alrededor del numero. Cifras enormes, "
                       "comparaciones lado a lado, pulso de flashes y "
                       "camara viva. El plano existe para sostener un dato.",
        "paleta": {"fondo": [8, 9, 11], "texto": [248, 248, 245],
                   "destacado": ACENTO},
        "camara": 1.15, "transicion": "punch", "acentos": ["whip", "corte_duro", "punch"],
        "flash_ritmo": [1.5, 0.7, 2.5],
        "captions": {"captions_estilo": "chico", "captions_y": 0.78},
        "ritmo": "creciente", "alterna_claro": 5,
        "densidad": {"hook": "EXTREME", "resultado": "HIGH",
                     "prueba": "HIGH", "conclusion": "LOW", "cta": "MEDIUM"},
        "maquetas": {
            "hook":        [("dato_duro", {}), ("pleno", {"velo": 0.5})],
            "resultado":   [("dato_duro", {}), ("comparacion", {})],
            "contradiccion": [("comparacion", {})],
            "descubrimiento": [("cascada", {"encuadre": "plano"})],
            "metodo":      [("flujo", {}), ("lista", {})],
            "prueba":      [("prueba", {})],
            "evidencia":   [("prueba", {})],
            "giro":        [("pleno", {"velo": 0.52, "hook": "impacto"})],
            "conclusion":  [("cascada", {"encuadre": "plano"})],
            "cta":         [("cta", {"mayus": True})],
        },
    },
    # ---------------------------------------------------------------
    "INVEST": {
        "nombre": "Investigation — la evidencia primero",
        "descripcion": "Frio y sostenido. Grafito azulado, planos largos, "
                       "camara que apenas deriva. Cada afirmacion viene "
                       "seguida de la captura que la sostiene.",
        "paleta": {"fondo": [12, 14, 20], "texto": [232, 236, 242],
                   "destacado": ACENTO},
        "camara": 0.55, "transicion": "dip", "acentos": ["corte_duro", "dip", "barrido"], "flash_ritmo": None,
        "captions": {"captions_estilo": "chico", "captions_y": 0.66},
        "ritmo": "decreciente", "alterna_claro": 0,
        "densidad": {"hook": "HIGH", "evidencia": "HIGH", "duda": "LOW",
                     "conclusion": "LOW", "cta": "LOW"},
        "maquetas": {
            "hook":        [("cascada", {"encuadre": "plano"})],
            "afirmacion":  [("cascada", {"encuadre": "sangre", "velo": 0.44})],
            "duda":        [("pregunta", {}), ("cascada", {"encuadre": "plano"})],
            "evidencia":   [("prueba", {})],
            "prueba":      [("prueba", {})],
            "descubrimiento": [("prueba", {}), ("comparacion", {})],
            "conclusion":  [("cascada", {"encuadre": "plano"})],
            "cta":         [("cta", {})],
        },
    },
    # ---------------------------------------------------------------
    "SCREEN": {
        "nombre": "Screen Proof — la captura es el video",
        "descripcion": "Casi sin tipografia propia: manda la captura, "
                       "enmarcada y con el recuadro que late sobre lo que "
                       "importa. Camara fija. La fuente siempre a la vista.",
        "paleta": {"fondo": [14, 14, 15], "texto": [244, 244, 242],
                   "destacado": ACENTO},
        "camara": 0.0, "transicion": "corte_duro", "acentos": ["punch", "corte_duro", "whip"], "flash_ritmo": None,
        "captions": {"captions_estilo": "chico", "captions_y": 0.88},
        "ritmo": "irregular_b", "alterna_claro": 0,
        "densidad": {"hook": "MEDIUM", "evidencia": "EXTREME",
                     "prueba": "EXTREME", "cta": "LOW"},
        "maquetas": {
            "hook":        [("prueba", {}), ("cascada", {"encuadre": "plano"})],
            "afirmacion":  [("cascada", {"encuadre": "tarjeta", "velo": 0.12})],
            "evidencia":   [("prueba", {})],
            "prueba":      [("prueba", {})],
            "descubrimiento": [("prueba", {})],
            "metodo":      [("menu", {}), ("flujo", {})],
            "resultado":   [("prueba", {}), ("dato_duro", {})],
            "conclusion":  [("cascada", {"encuadre": "plano"})],
            "cta":         [("cta", {})],
        },
    },
    # ---------------------------------------------------------------
    "BRUTAL": {
        "nombre": "Minimal Brutal — solo tipografia",
        "descripcion": "Cero fotos. Negro y blanco plenos, texto enorme, "
                       "camara quieta y rafagas. Es el estilo mas barato de "
                       "producir y el que no se parece a nada del feed.",
        "paleta": {"fondo": [0, 0, 0], "texto": [255, 255, 255],
                   "destacado": ACENTO},
        "camara": 0.0, "transicion": "corte_duro", "acentos": ["punch", "corte_duro"], "flash_ritmo": None,
        "captions": {},                       # no lleva subtitulo aparte
        "ritmo": "irregular_a", "alterna_claro": 2,
        "densidad": {"hook": "EXTREME", "conclusion": "LOW", "cta": "LOW"},
        "sin_metraje": True,
        "maquetas": {
            "hook":        [("cascada", {"encuadre": "plano"})],
            "afirmacion":  [("cascada", {"encuadre": "plano"}),
                            ("declaracion", {})],
            "contradiccion": [("comparacion", {})],
            "evidencia":   [("prueba", {})],
            "prueba":      [("prueba", {})],
            "metodo":      [("lista", {}), ("flujo", {})],
            "resultado":   [("dato_duro", {})],
            "conclusion":  [("declaracion", {})],
            "cta":         [("cta", {"mayus": True})],
        },
    },
    # ---------------------------------------------------------------
    "DOC": {
        "nombre": "Cinematic Documentary — metraje a sangre",
        "descripcion": "El metraje ocupa todo el cuadro, oscurecido, con "
                       "camara que deriva lento y planos largos. El texto "
                       "es minimo y va abajo. Se parece a un documental, "
                       "no a un TikTok.",
        "paleta": {"fondo": [11, 11, 13], "texto": [240, 238, 232],
                   "destacado": ACENTO},
        "camara": 1.35, "transicion": "fade", "acentos": ["corte_duro", "dip", "fade"], "flash_ritmo": None,
        "captions": {"captions_estilo": "chico", "captions_y": 0.84},
        "ritmo": "decreciente", "alterna_claro": 0,
        "densidad": {"hook": "MEDIUM", "conclusion": "LOW", "cta": "LOW"},
        "maquetas": {
            "hook":        [("pleno", {"velo": 0.46})],
            "afirmacion":  [("pleno", {"velo": 0.44}),
                            ("cascada", {"encuadre": "sangre", "velo": 0.5})],
            "descubrimiento": [("cascada", {"encuadre": "sangre", "velo": 0.46})],
            "evidencia":   [("prueba", {})],
            "prueba":      [("prueba", {})],
            "metodo":      [("flujo", {})],
            "resultado":   [("pleno", {"velo": 0.5}), ("dato_duro", {})],
            "giro":        [("pleno", {"velo": 0.55, "hook": "impacto"})],
            "conclusion":  [("pleno", {"velo": 0.42})],
            "cta":         [("cta", {})],
        },
    },
}

# Maqueta de ultimo recurso cuando el estilo no declara nada para ese rol.
FALLBACK = ("cascada", {"encuadre": "plano"})


# ---------------------------------------------------------------- APLICAR
# El contenido declara QUE se dice y QUE evidencia hay. El estilo decide
# COMO se ve. Aca se juntan.
#
# Formato del archivo de contenido:
#
#   {"tema": "...",
#    "estilo": "VS", "narrativa": "money_story", "ritmo": "irregular_a",
#    "golpes": [
#      {"rol": "hook",
#       "texto": ["El que te ganó el laburo", "no cobra menos"],
#       "narracion": "El que te ganó el laburo no cobra menos.",
#       "necesita": "serious tradesman portrait workshop"},
#      {"rol": "evidencia",
#       "texto": ["67 contra 0.1"],
#       "cifra": {"valor": "67", "etiqueta": "VERIFICADO",
#                 "fuente": "Google Trends AR, 12 meses, 28/08/2026"},
#       "necesita": "..."},
#      ...
#    ]}


# Maquetas donde entra contenido nuevo a lo largo del plano. Ahi un
# plano largo no es pantalla muerta: es el tiempo que tarda en armarse
# lo que se muestra. La lista tiene que coincidir con la de
# validar_hook.py o el compilador escribe guiones que el validador
# rechaza.
CONSTRUYEN = {"cascada", "menu", "lista", "escalada", "conteo", "cronologia",
              "collage", "mensajes", "ranking", "pasos", "camino",
              "comparacion", "flujo", "prueba", "ruleta", "galeria",
              "terminal"}
TECHO_ESTATICO = 4.8
TECHO_QUE_CONSTRUYE = 8.5


def _duracion(registro, rnd, densidad=1.0, formato=None):
    """Duracion del plano dentro del registro de ritmo que le toca.

    La densidad estira -- mas texto necesita mas tiempo o no se llega a
    leer -- pero con techo, y el techo depende de la maqueta. Sin esto,
    SUSTAINED por densidad EXTREME daba planos de 9 segundos, y en un
    'pleno' eso es pantalla muerta: el validador los rechazaba."""
    a, b = RITMOS[registro]
    d = rnd.uniform(a, b) * (0.85 + 0.35 * densidad)
    techo = TECHO_QUE_CONSTRUYE if formato in CONSTRUYEN else TECHO_ESTATICO
    return round(min(techo, d), 2)


def _transicion(estilo, i, rnd):
    """Mayormente la transicion propia del estilo, con un acento cada
    tanto. Un video entero con el mismo corte es justo lo que §33
    prohibe: el cerebro lo predice y afloja."""
    acentos = estilo.get("acentos") or []
    if acentos and i % 4 == 3:
        return acentos[(i // 4) % len(acentos)]
    return estilo["transicion"]


# Lo que cada maqueta NECESITA para no mentir ni salir vacia. Sin esto
# el estilo elegia 'dato_duro' para un golpe sin cifra y el animador
# dibujaba su numero por defecto: un 47 INVENTADO en pantalla. Es
# exactamente lo que §17 prohibe, y lo encontro el preview.
def _puede(fmt, golpe):
    txt = [t for t in (golpe.get("texto") or []) if str(t).strip()]
    ev = golpe.get("evidencia") or {}
    cifra = golpe.get("cifra") or {}
    if fmt == "dato_duro":
        return bool(cifra.get("valor"))
    if fmt == "prueba":
        return bool(ev.get("imagen") or ev.get("fuente") or cifra.get("fuente"))
    if fmt in ("comparacion", "flujo", "menu", "lista"):
        return len(txt) >= 2
    if fmt == "cascada":
        return bool(txt)
    return True


def _maqueta(estilo, rol, usadas, rnd, golpe):
    """Maqueta para este rol, rotando entre las candidatas del estilo
    para que dos planos del mismo rol no se vean iguales (§29), y
    saltando las que este golpe no puede sostener."""
    cands = estilo["maquetas"].get(rol)
    if not cands:
        cands = estilo["maquetas"].get("afirmacion") or [FALLBACK]
    i = usadas.get(rol, 0)
    usadas[rol] = i + 1
    n = len(cands)
    # Se prueba desde la que le tocaba y se sigue rotando; si ninguna
    # de las del estilo sirve, cae al fallback, que solo pide texto.
    for k in range(n):
        fmt, extra = cands[(i + k) % n]
        if _puede(fmt, golpe):
            return fmt, dict(extra)
    fmt, extra = FALLBACK
    return (fmt, dict(extra)) if _puede(fmt, golpe) else ("declaracion", {})


def _texto_a_maqueta(fmt, textos, seg, densidad):
    """Mete el texto del golpe en los campos que esa maqueta espera.
    Cada maqueta pide el texto con otro nombre; esto es el traductor."""
    textos = [t for t in (textos or []) if str(t).strip()]
    if not textos:
        return
    if fmt == "cascada":
        seg["lineas"] = textos
    elif fmt in ("lista", "menu"):
        seg["titulo"] = textos[0]
        if fmt == "lista":
            seg["items"] = textos[1:] or [textos[0]]
        else:
            seg["filas"] = [{"texto": t} for t in (textos[1:] or textos)]
    elif fmt == "flujo":
        seg["texto"] = textos[0] if len(textos) > 1 else ""
        seg["nodos"] = textos[1:] if len(textos) > 1 else textos
    elif fmt == "comparacion":
        mitad = max(1, len(textos) // 2)
        seg["izq"], seg["der"] = textos[:mitad], textos[mitad:] or textos[:1]
        seg.setdefault("izq_titulo", "Antes")
        seg.setdefault("der_titulo", "Ahora")
    elif fmt == "prueba":
        seg["texto"] = " ".join(textos)
    elif fmt == "dato_duro":
        seg["texto"] = " ".join(textos[1:]) or textos[0]
    else:                      # pleno, declaracion, tarjeta, cta, pregunta
        seg["texto"] = textos[0] if fmt in ("tarjeta", "cta") else " ".join(textos)


def aplicar(contenido, estilo_id=None, narrativa_id=None, ritmo_id=None,
            semilla=None):
    """Compila contenido + estilo -> guion que animador_v9 sabe rendir."""
    c = copy.deepcopy(contenido)
    eid = (estilo_id or c.get("estilo") or "VS").upper()
    if eid not in ESTILOS:
        raise ValueError(f"estilo '{eid}' no existe. Hay: "
                         f"{', '.join(ESTILOS)}")
    est = ESTILOS[eid]
    perfil = ritmo_id or c.get("ritmo") or est["ritmo"]
    if perfil not in PERFILES_RITMO:
        raise ValueError(f"ritmo '{perfil}' no existe. Hay: "
                         f"{', '.join(PERFILES_RITMO)}")
    secuencia = PERFILES_RITMO[perfil]
    # Semilla derivada del tema: el mismo contenido con el mismo estilo
    # da SIEMPRE el mismo video, pero dos contenidos distintos no caen
    # en el mismo reparto de ritmo.
    rnd = random.Random(semilla if semilla is not None
                        else hash((c.get("tema", ""), eid, perfil)) & 0xFFFF)

    golpes = c.get("golpes") or []
    if not golpes and narrativa_id:
        golpes = [{"rol": r, "texto": [], "narracion": ""}
                  for r in NARRATIVAS[narrativa_id]]

    segs, usadas, n_claro = [], {}, 0
    for i, g in enumerate(golpes):
        rol = g.get("rol", "afirmacion")
        fmt, seg = _maqueta(est, rol, usadas, rnd, g)
        seg["formato"] = fmt
        seg["_rol"] = rol

        dens_nombre = g.get("densidad") or est["densidad"].get(rol, "MEDIUM")
        seg["_densidad"] = dens_nombre
        registro = g.get("ritmo") or secuencia[i % len(secuencia)]
        seg["_ritmo"] = registro
        seg["duracion"] = g.get("duracion") or _duracion(
            registro, rnd, DENSIDADES[dens_nombre], fmt)

        _texto_a_maqueta(fmt, g.get("texto"), seg, dens_nombre)
        if g.get("narracion"):
            seg["narracion"] = g["narracion"]
            # El subtitulo suelto no va sobre maquetas que YA muestran
            # el texto: repetiria la misma frase con otra palabra
            # activa, dos textos de la misma oracion peleandose el
            # cuadro. Va sobre metraje, que es donde lo usa la
            # referencia.
            if est.get("captions") and fmt in ("pleno", "tarjeta", "retrato"):
                seg.update(est["captions"])
                seg["captions_palabra_por_palabra"] = True

        # Metraje: el estilo puede prohibirlo (BRUTAL no lleva fotos).
        if g.get("necesita") and not est.get("sin_metraje"):
            seg["necesita"] = g["necesita"]
        if g.get("imagen") and not est.get("sin_metraje"):
            seg["imagen"] = g["imagen"]

        # §8 y §28: si hay evidencia real, se muestra. No se reemplaza
        # una prueba por B-roll generico.
        ev = g.get("evidencia") or {}
        cifra = g.get("cifra") or {}
        if ev or cifra:
            if fmt != "prueba" and _puede("prueba", g):
                seg["formato"] = fmt = "prueba"
                _texto_a_maqueta(fmt, g.get("texto"), seg, dens_nombre)
            if ev.get("imagen"):
                seg["imagen"] = ev["imagen"]
            if ev.get("resaltado"):
                seg["resaltado"] = ev["resaltado"]
            fuente = ev.get("fuente") or cifra.get("fuente")
            if fuente:
                seg["fuente"] = fuente
            if cifra.get("etiqueta"):
                seg["kicker"] = cifra["etiqueta"]
            if cifra.get("valor") and fmt == "dato_duro":
                seg["numero"] = cifra["valor"]

        # Carteles planos alternando fondo claro: el salto negro/blanco
        # ES la transicion en este lenguaje (ver ESTILO.md).
        if seg.get("encuadre") == "plano" and est.get("alterna_claro"):
            n_claro += 1
            if n_claro % est["alterna_claro"] == 0:
                seg["claro"] = True

        if i:
            seg["transicion"] = g.get("transicion") or _transicion(est, i, rnd)
        else:
            seg["hook"] = seg.get("hook") or "impacto"
            seg["flash"] = True
        for k, v in (g.get("extra") or {}).items():
            seg[k] = v
        segs.append(seg)

    guion = {
        "tema": c.get("tema", ""),
        "nota": f"Compilado por estilos.py — estilo {eid} "
                f"({est['nombre']}), ritmo {perfil}. NO editar a mano: "
                f"editar el contenido y recompilar.",
        "_estilo": eid, "_narrativa": narrativa_id or c.get("narrativa"),
        "_ritmo": perfil,
        "fps": 30, "camara": est["camara"], "loop": c.get("loop", False),
        "paleta": est["paleta"], "segmentos": segs,
    }
    if est.get("flash_ritmo"):
        guion["flash_ritmo"] = est["flash_ritmo"]
        guion["flash_ritmo_largo"] = 0.08
    return guion


# ---------------------------------------------------------------- CLI
def cmd_listar(a):
    print(f"{len(ESTILOS)} ESTILOS\n")
    for k, v in ESTILOS.items():
        print(f"  {k:8} {v['nombre']}")
        print(f"  {'':8} {v['descripcion']}")
        print(f"  {'':8} camara {v['camara']} | {v['transicion']} | "
              f"ritmo {v['ritmo']} | "
              f"{'sin metraje' if v.get('sin_metraje') else 'con metraje'}")
        print()
    print(f"{len(NARRATIVAS)} NARRATIVAS\n")
    for k, v in NARRATIVAS.items():
        print(f"  {k:14} {' -> '.join(v)}")
    print(f"\n{len(PERFILES_RITMO)} PERFILES DE RITMO\n")
    for k, v in PERFILES_RITMO.items():
        seg = [f"{RITMOS[r][0]}-{RITMOS[r][1]}s" for r in v[:4]]
        print(f"  {k:14} {' '.join(v)}")
        print(f"  {'':14} ({', '.join(seg)}...)")


def cmd_aplicar(a):
    contenido = json.loads(Path(a.contenido).read_text(encoding="utf-8"))
    g = aplicar(contenido, a.estilo, a.narrativa, a.ritmo)
    salida = Path(a.salida or f"guiones/{Path(a.contenido).stem}-"
                              f"{(a.estilo or g['_estilo']).lower()}.json")
    salida.parent.mkdir(parents=True, exist_ok=True)
    salida.write_text(json.dumps(g, ensure_ascii=False, indent=2) + "\n",
                      encoding="utf-8")
    dur = sum(s["duracion"] for s in g["segmentos"])
    regs = [s["_ritmo"] for s in g["segmentos"]]
    print(f"Escrito {salida}")
    print(f"  estilo {g['_estilo']} | ritmo {g['_ritmo']} | "
          f"{len(g['segmentos'])} planos | {dur:.1f}s")
    print(f"  maquetas: {', '.join(dict.fromkeys(s['formato'] for s in g['segmentos']))}")
    print(f"  registros: {' '.join(regs)}")
    d = sorted(s["duracion"] for s in g["segmentos"])
    print(f"  planos: min {d[0]}s | mediana {d[len(d)//2]}s | max {d[-1]}s")


def cmd_todos(a):
    """El mismo contenido en los seis estilos (§31). Mismo texto, misma
    narracion, misma informacion: cambia SOLO el lenguaje visual."""
    contenido = json.loads(Path(a.contenido).read_text(encoding="utf-8"))
    stem = Path(a.contenido).stem
    hechos = []
    for eid in (a.estilos.split(",") if a.estilos else list(ESTILOS)):
        eid = eid.strip().upper()
        g = aplicar(contenido, eid)
        p = Path(f"guiones/{stem}-{eid.lower()}.json")
        p.write_text(json.dumps(g, ensure_ascii=False, indent=2) + "\n",
                     encoding="utf-8")
        dur = sum(s["duracion"] for s in g["segmentos"])
        maq = list(dict.fromkeys(s["formato"] for s in g["segmentos"]))
        hechos.append((eid, p, dur, maq, g))
        print(f"{eid:8} {dur:5.1f}s  {len(g['segmentos'])} planos  "
              f"{', '.join(maq)}")
    print(f"\n{len(hechos)} guiones escritos. Mismo contenido, "
          f"seis lenguajes visuales.")
    return hechos


def main():
    ap = argparse.ArgumentParser(
        description="Capa de estilo de la fabrica (ver ESTILOS.md)")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("listar", help="estilos, narrativas y ritmos disponibles")

    p = sub.add_parser("aplicar", help="compilar contenido + estilo -> guion")
    p.add_argument("contenido")
    p.add_argument("--estilo")
    p.add_argument("--narrativa")
    p.add_argument("--ritmo")
    p.add_argument("--salida")

    p = sub.add_parser("todos", help="el mismo contenido en los seis estilos")
    p.add_argument("contenido")
    p.add_argument("--estilos", help="lista separada por comas")

    a = ap.parse_args()
    return {"listar": cmd_listar, "aplicar": cmd_aplicar,
            "todos": cmd_todos}[a.cmd](a) and 0 or 0


if __name__ == "__main__":
    sys.exit(main())


# ================= IDEAS: una idea, varios planos =================
# §1 de la especificacion, y el error que no puede volver a aparecer.
#
#     IDEA
#     ├── plano A
#     ├── plano B
#     └── plano C
#
# no
#
#     idea -> plano
#     idea -> plano
#
# La narracion sigue hablando de LA MISMA idea mientras la imagen
# corta. Lo que se movia antes era todo junto, y por eso nueve ideas
# entraban en veinte segundos.

# §10. Cuantos planos y como se mueven, segun la intensidad de ESA idea
# (no del video entero: §10 pide que cambie a lo largo).
#   (n_planos, movimientos, reparto)  -- reparto en fracciones de la idea
INTENSIDAD = {
    "LOW":    (1, ["STATIC"],                         [1.0]),
    "MEDIUM": (2, ["SUBTLE", "STATIC"],               [0.55, 0.45]),
    "HIGH":   (4, ["SUBTLE", "ACTIVE", "SUBTLE", "STATIC"],
               [0.34, 0.22, 0.18, 0.26]),
    # §14: la rafaga es corta y despues se vuelve a la calma. No es un
    # estado sostenido.
    "BURST":  (5, ["BURST", "BURST", "BURST", "BURST", "STATIC"],
               [0.08, 0.07, 0.08, 0.07, 0.70]),
}

# §3. Los seis lenguajes de la especificacion. Cuatro ya existian con
# otro nombre; DATA y CINEMATIC NO estan implementados todavia y no los
# voy a mapear a otra cosa para que parezca que si.
LENGUAJES = {
    "EDITORIAL":     "VS",
    "AGGRESSIVE":    "MONEY",
    "DOCUMENTARY":   "DOC",
    "INVESTIGATION": "INVEST",
    # "DATA":      falta
    # "CINEMATIC": falta
}
LENGUAJES_FALTAN = ("DATA", "CINEMATIC")

# §2. Un plano solo existe si cumple una funcion. El guion la declara y
# el compilador la conserva para que la auditoria de §21 pueda leerla.
FUNCIONES_PLANO = (
    "informacion", "evidencia", "contexto", "demostracion", "cifra",
    "perspectiva", "contraste", "preparar_reveal", "refuerzo", "sostener",
)


def _planos_de(idea, dur, rnd):
    """Los planos de esta idea. Si el guion los declara, manda el
    guion. Si no, se derivan de la intensidad."""
    dados = idea.get("planos")
    if dados:
        return [dict(p) for p in dados]
    inten = str(idea.get("intensidad", "MEDIUM")).upper()
    n, movs, reparto = INTENSIDAD.get(inten, INTENSIDAD["MEDIUM"])
    # Las consultas de metraje que la idea traiga; si trae menos que
    # planos, se repiten -- pero cada repeticion cambia de movimiento,
    # asi que no se lee como el mismo plano dos veces (§23 de la
    # biblia visual anterior).
    consultas = idea.get("necesita")
    if isinstance(consultas, str):
        consultas = [consultas]
    consultas = consultas or []
    salida = []
    for i in range(n):
        p = {"dur": round(dur * reparto[i], 2), "mov": movs[i]}
        if consultas:
            p["necesita"] = consultas[i % len(consultas)]
        salida.append(p)
    return salida


def aplicar_ideas(contenido, lenguaje=None, semilla=None):
    """Compila un contenido escrito por IDEAS (no por golpes).

    Cada idea se vuelve UN segmento 'escena': el bloque de texto se
    sostiene toda la idea y los planos cortan debajo.

    Formato del contenido:
        {"tema": "...", "lenguaje": "EDITORIAL",
         "ideas": [
           {"rol": "hook", "duracion": 3.2, "intensidad": "BURST",
            "lineas": ["Te escribieron", "a las diez"],
            "narracion": "...",
            "necesita": ["man reading phone at night", "old clock"],
            "planos": [ ... ]        opcional, pisa la intensidad
           }, ...]}
    """
    c = copy.deepcopy(contenido)
    nombre = (lenguaje or c.get("lenguaje") or "EDITORIAL").upper()
    if nombre in LENGUAJES_FALTAN:
        raise ValueError(
            f"el lenguaje {nombre} todavia no esta implementado. "
            f"Hay: {', '.join(LENGUAJES)}")
    eid = LENGUAJES.get(nombre, nombre)
    if eid not in ESTILOS:
        raise ValueError(f"lenguaje/estilo '{nombre}' no existe. Hay: "
                         f"{', '.join(LENGUAJES)} (o los ids "
                         f"{', '.join(ESTILOS)})")
    est = ESTILOS[eid]
    rnd = random.Random(semilla if semilla is not None
                        else hash((c.get("tema", ""), eid)) & 0xFFFF)

    ideas = c.get("ideas") or []
    segs = []
    for i, idea in enumerate(ideas):
        dur = float(idea.get("duracion") or 6.0)
        planos = _planos_de(idea, dur, rnd)
        lineas = idea.get("lineas") or []
        # §4: las lineas entran repartidas en el primer 55% de la idea;
        # el resto es tiempo de leer el bloque entero.
        entra = idea.get("entra") or [
            round(dur * 0.55 * k / max(1, len(lineas)), 2)
            for k in range(len(lineas))]

        seg = {
            "formato": "escena",
            "_rol": idea.get("rol", "idea"),
            "_intensidad": str(idea.get("intensidad", "MEDIUM")).upper(),
            "duracion": round(dur, 2),
            "lineas": lineas,
            "entra": entra,
            "planos": planos,
            "velo": idea.get("velo", 0.44),
        }
        if idea.get("narracion"):
            seg["narracion"] = idea["narracion"]
        if idea.get("cascada_tam"):
            seg["cascada_tam"] = idea["cascada_tam"]
        if i:
            seg["transicion"] = idea.get("transicion") or _transicion(est, i, rnd)
        else:
            seg["hook"] = "impacto"
            seg["flash"] = True
        for k, v in (idea.get("extra") or {}).items():
            seg[k] = v
        segs.append(seg)

    n_planos = sum(len(s["planos"]) for s in segs)
    dur_total = sum(s["duracion"] for s in segs)
    guion = {
        "tema": c.get("tema", ""),
        "nota": f"Compilado por estilos.py (ideas) — lenguaje {nombre} "
                f"({est['nombre']}). {len(segs)} ideas, {n_planos} planos. "
                f"NO editar a mano: editar el contenido y recompilar.",
        "_lenguaje": nombre, "_estilo": eid,
        # §22: metadata para poder cruzar formato con resultado despues.
        "_metadata": {
            "lenguaje": nombre,
            "ideas": len(segs),
            "planos": n_planos,
            "duracion": round(dur_total, 2),
            "cambios_de_texto": sum(len(s["lineas"]) for s in segs),
            "rafagas": sum(1 for s in segs if s["_intensidad"] == "BURST"),
            "intensidades": [s["_intensidad"] for s in segs],
            "seg_por_idea": round(dur_total / max(1, len(segs)), 2),
        },
        "fps": 30, "camara": est["camara"], "loop": c.get("loop", False),
        "paleta": est["paleta"], "segmentos": segs,
    }
    if est.get("flash_ritmo"):
        guion["flash_ritmo"] = est["flash_ritmo"]
        guion["flash_ritmo_largo"] = 0.08
    return guion
