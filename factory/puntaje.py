#!/usr/bin/env python3
"""
Scoring del Product Factory.

DOS COSAS SEPARADAS QUE NO HAY QUE CONFUNDIR
    total_score   que tan buena parece la oportunidad
    confidence    cuanto de ese puntaje esta sostenido por evidencia real

    Una oportunidad con 85 de puntaje y 0.15 de confianza NO es mejor
    que una con 60 y 0.9: la primera es una corazonada bien redactada.
    Por eso el ranking exige un minimo de confianza para entrar al
    shortlist, y los reportes muestran siempre los dos numeros juntos.

FACTORES QUE SE INVIERTEN
    Varios subfactores estan definidos como "cuanto mas alto, PEOR"
    (authority_required, development_complexity...). Se invierten con
    10-x antes de promediar. Sumarlos directo daria vuelta el sentido
    del puntaje y premiaria justo lo que queremos evitar.

COMPETENCIA
    No se penaliza automaticamente. Competencia alta con demanda alta
    es una señal BUENA: alguien ya probo que el mercado paga. Lo que
    se penaliza es competencia alta con demanda baja (pelear por
    migajas) y, sobre todo, se marca como UNKNOWN_DEMAND todo lo que
    no tenga evidencia -- sin datos no hay cuadrante que valga.
"""
import json
import time
from pathlib import Path

from . import esquema as E

RAIZ = Path(__file__).parent
PESOS_JSON = RAIZ / "pesos.json"

# Los pesos del brief. Suman 100. family_potential entra con 0: se
# calcula y se reporta, pero todavia no mueve la decision -- no hay
# datos que digan cuanto deberia pesar, y ponerle un numero inventado
# seria contaminar el ranking con una opinion disfrazada de formula.
PESOS_POR_DEFECTO = {
    "demand": 15,
    "pain": 15,
    "market_size": 10,
    "competition": 10,
    "spanish_gap": 10,
    "factory_score": 10,
    "economics": 10,
    "contentability": 10,
    "sellerability": 10,
    "family_potential": 0,
}

DIMENSIONES = tuple(PESOS_POR_DEFECTO)

# Subfactores donde MAS ALTO = PEOR. Se invierten antes de promediar.
SELLER_INVERSOS = ("authority_required", "technical_knowledge", "learning_curve",
                   "content_creation_difficulty", "sales_difficulty",
                   "buyer_explanation_difficulty")
FACTORY_INVERSOS = ("development_complexity", "content_production_complexity",
                    "maintenance_complexity", "localization_complexity")
FACTORY_DIRECTOS = ("ai_automation_potential", "reusability",
                    "family_product_potential")

ANGULOS = ("problem_hook", "demonstration_angle", "before_after",
           "mistake_angle", "tutorial_angle", "comparison_angle",
           "story_angle", "question_angle", "controversy_angle",
           "case_study_angle")

# Un angulo cuenta como "utilizable" si llega a esto. Debajo de 5 el
# angulo existe en teoria pero no da material para producir de verdad.
UMBRAL_ANGULO = 5.0


def cargar_pesos(ruta=None):
    ruta = Path(ruta or PESOS_JSON)
    if ruta.exists():
        pesos = dict(PESOS_POR_DEFECTO)
        pesos.update(json.loads(ruta.read_text(encoding="utf-8")))
        return pesos
    return dict(PESOS_POR_DEFECTO)


def guardar_pesos(pesos, ruta=None):
    Path(ruta or PESOS_JSON).write_text(
        json.dumps(pesos, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _prom(valores):
    vs = [v for v in valores if v is not None]
    return sum(vs) / len(vs) if vs else None


def sellerability(fila):
    """0-10, 10 = cualquiera puede venderlo sin ser experto.

    Los seis factores miden DIFICULTAD, asi que se invierten. Se usa el
    PEOR factor con peso extra: si vender el producto exige autoridad
    previa, no importa que todo lo demas sea facil -- ese solo factor
    ya lo hace invendible para un principiante, que es exactamente la
    persona que queremos que pueda venderlo.
    """
    if not fila:
        return None
    invertidos = [10 - fila[c] for c in SELLER_INVERSOS if fila[c] is not None]
    if not invertidos:
        return None
    promedio = sum(invertidos) / len(invertidos)
    peor = min(invertidos)
    return round(promedio * 0.7 + peor * 0.3, 2)


def contentability(fila):
    """0-10 segun CUANTOS angulos dan material de verdad.

    Se cuenta angulos utilizables, no se promedia: diez angulos
    flojitos de 4 no sostienen una cuenta, y tres angulos de 9 si.
    Producir contenido sin parar necesita variedad real, no un
    promedio decente.
    """
    if not fila:
        return None
    valores = [fila[a] for a in ANGULOS if fila[a] is not None]
    if not valores:
        return None
    utilizables = sum(1 for v in valores if v >= UMBRAL_ANGULO)
    # cobertura (cuantos angulos sirven) + intensidad (que tan fuertes)
    cobertura = utilizables / len(ANGULOS) * 10
    intensidad = sum(v for v in valores if v >= UMBRAL_ANGULO) / max(utilizables, 1)
    return round(cobertura * 0.6 + intensidad * 0.4, 2)


def factory(fila):
    """0-10, 10 = barato de fabricar y reutilizable."""
    if not fila:
        return None
    inv = [10 - fila[c] for c in FACTORY_INVERSOS if fila[c] is not None]
    dir_ = [fila[c] for c in FACTORY_DIRECTOS if fila[c] is not None]
    partes = []
    if inv:
        partes.append(sum(inv) / len(inv))
    if dir_:
        partes.append(sum(dir_) / len(dir_))
    return round(sum(partes) / len(partes), 2) if partes else None


def economia(filas):
    """0-10 a partir de los escenarios de precio/comision cargados.

    Mide margen absoluto Y si queda plata suficiente para pagarle al
    vendedor. Un producto de margen enorme que no puede pagar comision
    atractiva no sirve para este modelo: sin vendedores no hay
    distribucion.
    """
    if not filas:
        return None
    mejor = 0.0
    for f in filas:
        precio = f["price"] or 0
        if precio <= 0:
            continue
        margen = f["estimated_margin"]
        if margen is None:
            costos = (f["platform_cost"] or 0) + (f["variable_cost"] or 0)
            comision = precio * ((f["seller_commission_percent"] or 0) / 100)
            margen = precio - costos - comision
        # nuestro margen sobre el precio, 0-10
        ratio = max(0.0, min(1.0, margen / precio)) * 10
        # cuanto se lleva el vendedor: por debajo del 30% cuesta
        # conseguir quien lo venda, y eso hunde el modelo entero
        com = f["seller_commission_percent"] or 0
        atractivo = min(1.0, com / 40.0) * 10
        mejor = max(mejor, ratio * 0.55 + atractivo * 0.45)
    return round(mejor, 2) if mejor else None


def cuadrante(demand, competition_count, hay_evidencia_demanda):
    """Cruce demanda x competencia. Sin evidencia de demanda no se
    clasifica: UNKNOWN_DEMAND es una respuesta honesta y util."""
    if not hay_evidencia_demanda or demand is None:
        return "UNKNOWN_DEMAND"
    alta_demanda = demand >= 6.0
    alta_competencia = (competition_count or 0) >= 4
    if alta_demanda and alta_competencia:
        return "HIGH_DEMAND_HIGH_COMPETITION"
    if alta_demanda and not alta_competencia:
        return "HIGH_DEMAND_WEAK_COMPETITION"
    if not alta_demanda and alta_competencia:
        return "LOW_DEMAND_HIGH_COMPETITION"
    return "LOW_DEMAND_LOW_COMPETITION"


def puntaje_competencia(cuad, n_competidores):
    """Competencia -> 0-10. NO es "menos competencia, mas puntaje".

    HIGH_DEMAND_HIGH_COMPETITION saca buen puntaje: la competencia
    valida que hay mercado. Lo peor es demanda baja, con o sin
    competencia. Y sin datos se devuelve un valor medio-bajo, no un
    premio: no saber no es lo mismo que estar despejado.
    """
    return {
        "HIGH_DEMAND_WEAK_COMPETITION": 9.5,
        "HIGH_DEMAND_HIGH_COMPETITION": 7.0,
        "LOW_DEMAND_LOW_COMPETITION": 3.0,
        "LOW_DEMAND_HIGH_COMPETITION": 1.5,
        "UNKNOWN_DEMAND": 4.0,
    }.get(cuad, 4.0)


# Las dimensiones que la evidencia puede cubrir. Es el denominador
# FIJO de la confianza: si se dividiera por "las dimensiones que
# resultaron puntuadas", una oportunidad con un solo puntaje y una sola
# evidencia daria 1/1 = confianza total, que es justo la mentira que
# esta metrica existe para evitar.
DIMENSIONES_EVIDENCIA = ("demand", "pain", "competition", "price", "gap")


def confianza(con, oid, dimensiones_puntuadas):
    """0.0-1.0: cuanto del puntaje se apoya en algo verificable.

    Mezcla dos coberturas, porque las dos pueden fallar por separado:

      - de EVIDENCIA: cuantas de las 5 dimensiones que la evidencia
        puede cubrir (demand, pain, competition, price, gap) tienen al
        menos una observacion DIRECT/INDIRECT con URL. No cuenta
        cantidad: diez pruebas de demanda y nada mas no dan una
        oportunidad confiable, dan una medida de un solo lado.

      - de PUNTAJES: cuantas de las 9 dimensiones del score tienen
        valor. Una oportunidad con 8 de 9 sin calcular no puede
        reclamar confianza alta aunque la unica que tenga este bien
        documentada.

    Y multiplica por la corroboracion entre fuentes INDEPENDIENTES: que
    CHATGPT y HUMAN_RESEARCH lleguen a lo mismo por separado vale mas
    que una sola fuente repitiendolo.
    """
    dims = {f["dimension"] for f in con.execute(
        "SELECT DISTINCT dimension FROM evidence WHERE opportunity_id=? "
        "AND evidence_type IN ('DIRECT','INDIRECT') AND dimension IS NOT NULL",
        (oid,))}
    cob_ev = len(dims & set(DIMENSIONES_EVIDENCIA)) / len(DIMENSIONES_EVIDENCIA)
    puntuables = [d for d in DIMENSIONES if d != "family_potential"]
    cob_sc = len(dimensiones_puntuadas or []) / len(puntuables)
    fuentes = len(E.fuentes_de(con, oid))
    # 1 fuente = x1.0, 2 = x1.15, 3 = x1.3
    factor = 1.0 + 0.15 * max(0, min(2, fuentes - 1))
    return round(min(1.0, (cob_ev * 0.6 + cob_sc * 0.4) * factor), 3)


def calcular(con, oid, pesos=None, guardar=True):
    """Calcula los 9 puntajes + family_potential + total + cuadrante.

    Las dimensiones que NO tienen dato quedan en None y se EXCLUYEN del
    promedio ponderado, re-normalizando los pesos de las que si estan.
    La alternativa (tratar el faltante como 0) castigaria a una
    oportunidad recien cargada por no haber sido investigada todavia,
    que es exactamente lo que el laboratorio deberia querer investigar.
    """
    pesos = pesos or cargar_pesos()

    sa = con.execute("SELECT * FROM seller_analysis WHERE opportunity_id=?",
                     (oid,)).fetchone()
    fa = con.execute("SELECT * FROM factory_analysis WHERE opportunity_id=?",
                     (oid,)).fetchone()
    eco = [dict(f) for f in con.execute(
        "SELECT * FROM economics WHERE opportunity_id=?", (oid,))]
    n_comp = con.execute(
        "SELECT COUNT(*) c FROM competitors WHERE opportunity_id=?",
        (oid,)).fetchone()["c"]

    prev = con.execute("SELECT * FROM scores WHERE opportunity_id=?",
                       (oid,)).fetchone()
    prev = dict(prev) if prev else {}

    # demand / pain / market_size / spanish_gap se cargan a mano o via
    # importacion: son juicios sobre la evidencia, no derivables de
    # ella automaticamente sin inventar.
    demand = prev.get("demand")
    pain = prev.get("pain")
    market_size = prev.get("market_size")
    spanish_gap = prev.get("spanish_gap")

    hay_dem = con.execute(
        "SELECT COUNT(*) c FROM evidence WHERE opportunity_id=? AND dimension='demand' "
        "AND evidence_type IN ('DIRECT','INDIRECT')", (oid,)).fetchone()["c"] > 0
    cuad = cuadrante(demand, n_comp, hay_dem)

    valores = {
        "demand": demand,
        "pain": pain,
        "market_size": market_size,
        "competition": puntaje_competencia(cuad, n_comp),
        "spanish_gap": spanish_gap,
        "factory_score": factory(fa),
        "economics": economia(eco),
        "contentability": contentability(sa),
        "sellerability": sellerability(sa),
        "family_potential": (fa["family_product_potential"] if fa else None),
    }

    presentes = {k: v for k, v in valores.items()
                 if v is not None and pesos.get(k, 0) > 0}
    total = None
    if presentes:
        suma_pesos = sum(pesos[k] for k in presentes)
        if suma_pesos > 0:
            total = round(
                sum(valores[k] * pesos[k] for k in presentes) / suma_pesos * 10, 2)

    conf = confianza(con, oid, [k for k, v in valores.items()
                                if v is not None and k != "family_potential"])

    if guardar:
        E.guardar_analisis(con, "scores", oid, quadrant=cuad,
                           total_score=total, confidence=conf,
                           **{k: v for k, v in valores.items() if v is not None})
    return {**valores, "total_score": total, "quadrant": cuad,
            "confidence": conf, "competitors": n_comp}


def recalcular_todo(con, pesos=None):
    pesos = pesos or cargar_pesos()
    ids = [f["id"] for f in con.execute("SELECT id FROM opportunities")]
    for oid in ids:
        calcular(con, oid, pesos)
    return len(ids)
