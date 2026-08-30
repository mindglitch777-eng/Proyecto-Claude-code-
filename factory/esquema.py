#!/usr/bin/env python3
"""
Product Factory — esquema de la base de oportunidades.

RESEARCH MODE. Aca no se construye ningun producto ni se decide ningun
ganador: se reciben, cruzan, puntuan y descartan oportunidades que
llegan de TRES fuentes distintas.

    SOURCE_A = CLAUDE_CODE      (lo que puedo medir yo)
    SOURCE_B = CHATGPT          (lo que trae otra IA con otro acceso)
    SOURCE_C = HUMAN_RESEARCH   (lo que mira el operador a mano)

LA REGLA QUE EL ESQUEMA HACE CUMPLIR POR CODIGO
    Nunca mezclar una hipotesis con un hecho. Cada dato guarda su
    evidence_type y, si dice ser observacion directa, tiene que traer
    URL: sin fuente a la que volver, no es una observacion, es una
    suposicion, y se guarda como tal.

        DIRECT      lo vi yo mismo en la fuente, con URL
        INDIRECT    alguien confiable lo reporta, con URL
        INFERENCE   deduccion a partir de datos que si tenemos
        HYPOTHESIS  suposicion sin verificar

TABLAS
    opportunities     el problema y a quien le duele
    market_signals    señales medibles sueltas (trends, precios, conteos)
    competitors       quien ya lo resuelve, en ingles y en español
    evidence          afirmacion + prueba + tipo + confianza
    seller_analysis   sellerability + contentability, con sus factores
    factory_analysis  que tan barato nos sale fabricarlo y repetirlo
    economics         precio, comision, margen
    scores            los 9 puntajes ponderados + family_potential
    access_log        lo que se intento consultar y NO se pudo

    access_log existe porque "no encontramos competencia" y "no
    pudimos mirar" son cosas distintas, y confundirlas fabrica
    conclusiones falsas. Cada bloqueo queda registrado como
    ACCESS_UNAVAILABLE con el motivo.
"""
import json
import sqlite3
import time
import unicodedata
import re
from pathlib import Path

RAIZ = Path(__file__).parent.parent
DB = RAIZ / "factory" / "oportunidades.db"

FUENTES = ("CLAUDE_CODE", "CHATGPT", "HUMAN_RESEARCH")

# Ordenados de mas fuerte a mas debil. El orden importa: se usa para
# decidir cual gana cuando dos fuentes afirman lo mismo con distinta
# calidad de prueba.
TIPOS_EVIDENCIA = ("DIRECT", "INDIRECT", "INFERENCE", "HYPOTHESIS")
FUERZA_EVIDENCIA = {"DIRECT": 4, "INDIRECT": 3, "INFERENCE": 2, "HYPOTHESIS": 1}

# Solo estos dos afirman haber MIRADO algo. Por eso son los unicos que
# exigen URL.
EXIGEN_URL = ("DIRECT", "INDIRECT")

ESTADOS = [
    "DISCOVERED",     # entro al sistema, sin verificar nada
    "RESEARCHING",    # se le esta buscando evidencia
    "VALIDATED",      # tiene evidencia DIRECT/INDIRECT de demanda
    "SHORTLIST",      # entre las mejores por puntaje
    "DEEP_RESEARCH",  # investigacion profunda en curso
    "PREVALIDATION",  # probando la oferta antes de construir
    "BUILD",
    "LAUNCH",
    "WINNER",
]
RECHAZADA = "REJECTED"

# Cruce demanda x competencia. NO se asume que poca competencia sea
# buena: puede significar que nadie quiere el producto. Por eso
# LOW_DEMAND_LOW_COMPETITION es una alerta, no un premio, y todo lo que
# no tenga evidencia de demanda cae en UNKNOWN_DEMAND.
CUADRANTES = (
    "HIGH_DEMAND_HIGH_COMPETITION",   # hay mercado, hay que diferenciarse
    "HIGH_DEMAND_WEAK_COMPETITION",   # el mejor caso
    "LOW_DEMAND_HIGH_COMPETITION",    # peor caso: pelea por migajas
    "LOW_DEMAND_LOW_COMPETITION",     # probable ausencia de mercado
    "UNKNOWN_DEMAND",                 # sin evidencia: no se puede juzgar
)

ESQUEMA = """
CREATE TABLE IF NOT EXISTS opportunities (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    niche              TEXT NOT NULL,
    subniche           TEXT,
    hypersubniche      TEXT,
    problem            TEXT NOT NULL,
    target_buyer       TEXT,
    buyer_context      TEXT,      -- cuando y donde aparece el problema
    pain               TEXT,
    frequency          TEXT,      -- diaria / semanal / puntual / estacional
    current_solution   TEXT,      -- que hace hoy sin nosotros
    potential_product  TEXT,
    product_format     TEXT,      -- herramienta / calculadora / kit / curso...
    target_country     TEXT,
    source             TEXT,      -- fuente que la descubrio primero
    status             TEXT NOT NULL DEFAULT 'DISCOVERED',
    -- clave normalizada de deduplicacion: problema + comprador + mercado
    dedupe_key         TEXT,
    -- 1 = fila de demostracion, NO es investigacion real. Existe para
    -- poder mostrar el sistema andando sin contaminar los datos: los
    -- reportes la marcan y purgar_demo() la borra.
    is_demo            INTEGER NOT NULL DEFAULT 0,
    notes              TEXT,
    date_collected     TEXT,
    created            REAL,
    updated            REAL
);

CREATE TABLE IF NOT EXISTS market_signals (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id  INTEGER NOT NULL,
    signal_type     TEXT NOT NULL,   -- google_trends, price, competitor_count...
    value           TEXT,
    source          TEXT NOT NULL,
    source_url      TEXT,
    date_collected  TEXT,
    confidence      REAL,            -- 0.0 a 1.0
    evidence_type   TEXT,
    notes           TEXT,
    created         REAL,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS competitors (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id       INTEGER NOT NULL,
    name                 TEXT NOT NULL,
    country              TEXT,
    language             TEXT,
    url                  TEXT,
    product_type         TEXT,
    price                REAL,
    features             TEXT,   -- JSON lista
    reviews              TEXT,
    visible_sales_signal TEXT,   -- lo unico parecido a ventas que se puede ver
    strengths            TEXT,   -- JSON lista
    weaknesses           TEXT,   -- JSON lista
    source               TEXT NOT NULL,
    source_url           TEXT,
    date_collected       TEXT,
    confidence           REAL,
    created              REAL,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evidence (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id  INTEGER NOT NULL,
    dimension       TEXT,          -- demand / pain / competition / price / gap
    claim           TEXT NOT NULL, -- que se afirma
    evidence        TEXT,          -- que lo respalda (cita, numero, extracto)
    source          TEXT NOT NULL,
    url             TEXT,
    date_collected  TEXT,
    evidence_type   TEXT NOT NULL
        CHECK (evidence_type IN ('DIRECT','INDIRECT','INFERENCE','HYPOTHESIS')),
    confidence      REAL,
    notes           TEXT,
    created         REAL,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seller_analysis (
    opportunity_id            INTEGER PRIMARY KEY,
    -- SELLERABILITY: cuanto le cuesta a una persona normal venderlo.
    -- Todos 0-10 donde 10 = MAS DIFICIL, salvo los *_score finales.
    authority_required        REAL,
    technical_knowledge       REAL,
    learning_curve            REAL,
    content_creation_difficulty REAL,
    sales_difficulty          REAL,
    buyer_explanation_difficulty REAL,
    sellerability_score       REAL,   -- 0-10, 10 = facilisimo de vender
    -- CONTENTABILITY: los 10 angulos. 0-10 cada uno segun cuanto
    -- material real da ese angulo.
    problem_hook              REAL,
    demonstration_angle       REAL,
    before_after              REAL,
    mistake_angle             REAL,
    tutorial_angle            REAL,
    comparison_angle          REAL,
    story_angle               REAL,
    question_angle            REAL,
    controversy_angle         REAL,
    case_study_angle          REAL,
    contentability_score      REAL,   -- 0-10
    organic_distribution_notes TEXT,
    source                    TEXT,
    updated                   REAL,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS factory_analysis (
    opportunity_id               INTEGER PRIMARY KEY,
    -- 0-10 donde 10 = MAS COMPLEJO (peor), salvo las tres ultimas
    development_complexity       REAL,
    content_production_complexity REAL,
    maintenance_complexity       REAL,
    localization_complexity      REAL,
    ai_automation_potential      REAL,   -- 10 = se automatiza casi entero
    reusability                  REAL,   -- 10 = sirve para otros productos
    family_product_potential     REAL,   -- 10 = da para una familia entera
    factory_score                REAL,   -- 0-10, 10 = barato y repetible
    notes                        TEXT,
    source                       TEXT,
    updated                      REAL,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS economics (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id          INTEGER NOT NULL,
    price                   REAL,
    seller_commission_percent REAL,
    our_revenue_percent     REAL,
    platform_cost           REAL,
    variable_cost           REAL,
    estimated_margin        REAL,
    notes                   TEXT,
    created                 REAL,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scores (
    opportunity_id   INTEGER PRIMARY KEY,
    demand           REAL,
    pain             REAL,
    market_size      REAL,
    competition      REAL,
    spanish_gap      REAL,
    factory_score    REAL,
    economics        REAL,
    contentability   REAL,
    sellerability    REAL,
    -- se guarda y se reporta, pero NO entra en total_score todavia
    -- (peso 0 en pesos.json): es una metrica de observacion, no de
    -- decision, hasta que haya datos que digan cuanto pesa de verdad.
    family_potential REAL,
    total_score      REAL,
    quadrant         TEXT,
    confidence       REAL,   -- que tan sostenido esta el puntaje por evidencia
    computed         REAL,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS access_log (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER,
    target         TEXT NOT NULL,   -- que se quiso consultar
    reason         TEXT,            -- por que no se pudo
    source         TEXT,
    date_collected TEXT,
    created        REAL,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS duplicate_candidates (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    id_a        INTEGER NOT NULL,
    id_b        INTEGER NOT NULL,
    similarity  REAL,
    resolved    INTEGER NOT NULL DEFAULT 0,
    created     REAL,
    UNIQUE(id_a, id_b),
    FOREIGN KEY (id_a) REFERENCES opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY (id_b) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_op_status  ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_op_dedupe  ON opportunities(dedupe_key);
CREATE INDEX IF NOT EXISTS idx_op_demo    ON opportunities(is_demo);
CREATE INDEX IF NOT EXISTS idx_ev_op      ON evidence(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_ev_tipo    ON evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_sig_op     ON market_signals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_comp_op    ON competitors(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_sc_total   ON scores(total_score DESC);
"""

CAMPOS_JSON = ("features", "strengths", "weaknesses")


# ------------------------------------------------------------------ #
# conexion
# ------------------------------------------------------------------ #

def conectar(ruta=None):
    con = sqlite3.connect(str(ruta or DB))
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript(ESQUEMA)
    return con


def _ahora():
    return time.time()


def _hoy():
    return time.strftime("%Y-%m-%d")


# ------------------------------------------------------------------ #
# deduplicacion
# ------------------------------------------------------------------ #

_PALABRAS_VACIAS = {
    "de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas",
    "que", "no", "se", "su", "sus", "para", "por", "con", "sin", "en",
    "a", "y", "o", "al", "lo", "es", "son", "como", "mas", "muy", "le",
    "les", "me", "te", "the", "of", "to", "for", "and", "in", "on",
}


def normalizar(texto):
    """Baja a minuscula, saca tildes, puntuacion y palabras vacias.

    Sin esto, "El dueño no sabe cuánto cobrar" y "el dueno no sabe
    cuanto cobrar" serian dos oportunidades distintas, y el sistema se
    llenaria de duplicados apenas dos fuentes describan lo mismo con
    otras palabras.
    """
    if not texto:
        return ""
    t = unicodedata.normalize("NFKD", texto.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    palabras = [p for p in t.split() if p and p not in _PALABRAS_VACIAS]
    return " ".join(sorted(set(palabras)))


def clave_dedupe(problem, target_buyer, niche):
    """Problema + comprador + mercado, normalizados. Dos fuentes que
    encuentran lo mismo tienen que colisionar aca."""
    return "|".join(normalizar(x) for x in (problem, target_buyer, niche))


def similitud(a, b):
    """Jaccard sobre palabras normalizadas: 0.0 a 1.0."""
    sa, sb = set(normalizar(a).split()), set(normalizar(b).split())
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def _trigramas(texto, n=3):
    t = " " + normalizar(texto) + " "
    return {t[i:i + n] for i in range(len(t) - n + 1)}


def similitud_trigramas(a, b):
    """Jaccard sobre trigramas de caracteres.

    Existe porque el español flexiona todo: "fotografo"/"fotografos",
    "cobrar"/"cobran"/"cobrando" son la misma idea y para Jaccard de
    palabras son términos completamente distintos. Los trigramas
    comparten casi todo entre variantes de la misma raiz.
    """
    A, B = _trigramas(a), _trigramas(b)
    return len(A & B) / len(A | B) if A and B else 0.0


def similitud_oportunidad(prob_a, comp_a, prob_b, comp_b):
    """Similitud combinada entre dos oportunidades.

    MEDIDA CON CASOS REALES: ninguna combinacion de estas señales
    separa de forma confiable un duplicado verdadero de dos problemas
    distintos que suenan parecido. Ejemplo real medido:

        "fotografo no sabe cuanto cobrar"  vs
        "fotografos no saben que precio poner"   -> 0.182  (ES duplicado)
        "manicurista no sabe cuanto cobrar"      -> 0.164  (NO lo es)

    Por eso este numero NO se usa para fusionar sola: se usa para
    MARCAR pares sospechosos y que los mire una persona. Fusionar mal
    es un error invisible que mezcla la evidencia de dos oportunidades
    distintas y borra una; marcar de mas solo cuesta una revision.
    """
    return (0.45 * similitud_trigramas(prob_a, prob_b)
            + 0.20 * similitud(prob_a, prob_b)
            + 0.35 * similitud_trigramas(comp_a or "", comp_b or ""))


# ------------------------------------------------------------------ #
# altas
# ------------------------------------------------------------------ #

def _empaquetar(datos):
    d = dict(datos)
    for c in CAMPOS_JSON:
        if c in d and not isinstance(d[c], str):
            d[c] = json.dumps(d[c] or [], ensure_ascii=False)
    return d


def desempaquetar(fila):
    d = dict(fila)
    for c in CAMPOS_JSON:
        if d.get(c):
            try:
                d[c] = json.loads(d[c])
            except (json.JSONDecodeError, TypeError):
                pass
    return d


def agregar_oportunidad(con, **datos):
    """Alta. Calcula la clave de dedupe sola. NO fusiona: de eso se
    encarga importar.py, que sabe que hacer con la evidencia de las dos
    versiones."""
    d = _empaquetar(datos)
    d["dedupe_key"] = clave_dedupe(d.get("problem", ""),
                                   d.get("target_buyer", ""),
                                   d.get("niche", ""))
    d.setdefault("date_collected", _hoy())
    d.setdefault("created", _ahora())
    d["updated"] = _ahora()
    cols = ", ".join(d)
    marcas = ", ".join("?" * len(d))
    cur = con.execute(f"INSERT INTO opportunities ({cols}) VALUES ({marcas})",
                      list(d.values()))
    return cur.lastrowid


def buscar_exacto(con, problem, target_buyer, niche):
    """Coincidencia EXACTA de clave normalizada. Es el unico caso en el
    que se fusiona sin preguntar: si el problema, el comprador y el
    nicho normalizan igual, son la misma oportunidad."""
    clave = clave_dedupe(problem, target_buyer, niche)
    fila = con.execute("SELECT id FROM opportunities WHERE dedupe_key=?",
                       (clave,)).fetchone()
    return fila["id"] if fila else None


def candidatos_duplicado(con, oid, problem, target_buyer, niche, umbral=0.12):
    """Pares sospechosos para revisar A MANO. Devuelve [(id, sim)].

    El umbral es bajo a proposito: preferimos marcar de mas y que una
    persona descarte, antes que fusionar mal en silencio. Solo compara
    dentro del mismo nicho.
    """
    out = []
    for f in con.execute(
            "SELECT id, problem, target_buyer FROM opportunities "
            "WHERE niche=? AND id!=?", (niche, oid)):
        s = similitud_oportunidad(problem, target_buyer,
                                  f["problem"], f["target_buyer"])
        if s >= umbral:
            out.append((f["id"], round(s, 3)))
    return sorted(out, key=lambda x: -x[1])


def marcar_duplicado(con, id_a, id_b, similarity):
    a, b = sorted((int(id_a), int(id_b)))
    con.execute(
        "INSERT OR IGNORE INTO duplicate_candidates (id_a, id_b, similarity, "
        "created) VALUES (?,?,?,?)", (a, b, similarity, _ahora()))


def duplicados_pendientes(con):
    return [dict(f) for f in con.execute(
        "SELECT d.*, a.problem AS problem_a, b.problem AS problem_b "
        "FROM duplicate_candidates d "
        "JOIN opportunities a ON a.id=d.id_a "
        "JOIN opportunities b ON b.id=d.id_b "
        "WHERE d.resolved=0 ORDER BY d.similarity DESC")]


def fusionar(con, id_origen, id_destino):
    """Mueve TODO de origen a destino y borra origen.

    No se pierde nada: evidencia, señales, competidores y bloqueos se
    reasignan; los campos vacios del destino se completan con los del
    origen, pero NUNCA se pisa un campo que ya tenia contenido. Las
    notas de los dos quedan concatenadas con su procedencia.
    """
    if id_origen == id_destino:
        return False, "son la misma oportunidad"
    o = con.execute("SELECT * FROM opportunities WHERE id=?", (id_origen,)).fetchone()
    d = con.execute("SELECT * FROM opportunities WHERE id=?", (id_destino,)).fetchone()
    if not o or not d:
        return False, "alguna de las dos no existe"
    for tabla in ("evidence", "market_signals", "competitors", "access_log"):
        con.execute(f"UPDATE {tabla} SET opportunity_id=? WHERE opportunity_id=?",
                    (id_destino, id_origen))
    completar = {}
    for k in o.keys():
        if k in ("id", "dedupe_key", "created", "updated", "notes", "is_demo"):
            continue
        if o[k] and not d[k]:
            completar[k] = o[k]
    notas = [x for x in (d["notes"], o["notes"]) if x]
    if notas:
        completar["notes"] = "\n--- fusionado ---\n".join(notas)
    if completar:
        actualizar_oportunidad(con, id_destino, **completar)
    con.execute("DELETE FROM opportunities WHERE id=?", (id_origen,))
    con.execute("UPDATE duplicate_candidates SET resolved=1 "
                "WHERE id_a IN (?,?) OR id_b IN (?,?)",
                (id_origen, id_destino, id_origen, id_destino))
    return True, f"#{id_origen} fusionada en #{id_destino}"


def actualizar_oportunidad(con, oid, **datos):
    d = _empaquetar(datos)
    d["updated"] = _ahora()
    sets = ", ".join(f"{k}=?" for k in d)
    con.execute(f"UPDATE opportunities SET {sets} WHERE id=?",
                list(d.values()) + [oid])


# ------------------------------------------------------------------ #
# evidencia y señales
# ------------------------------------------------------------------ #

def agregar_evidencia(con, oid, claim, evidence_type, source,
                      evidence=None, url=None, dimension=None,
                      confidence=None, notes=None, date_collected=None):
    """DIRECT e INDIRECT exigen URL. Los dos afirman que ALGUIEN MIRO
    algo; sin la direccion de eso que se miro, la afirmacion no se
    puede auditar y entonces no es observacion, es hipotesis."""
    et = (evidence_type or "").upper()
    if et not in TIPOS_EVIDENCIA:
        raise ValueError(f"evidence_type invalido: {evidence_type}. "
                         f"Debe ser uno de {TIPOS_EVIDENCIA}")
    if et in EXIGEN_URL and not url:
        raise ValueError(
            f"{et} necesita url: afirma que se observo algo y sin la fuente "
            f"no se puede verificar. Si no la tenes, guardalo como INFERENCE "
            f"o HYPOTHESIS.")
    if (source or "").upper() not in FUENTES:
        raise ValueError(f"source invalido: {source}. Debe ser uno de {FUENTES}")
    con.execute(
        "INSERT INTO evidence (opportunity_id, dimension, claim, evidence, "
        "source, url, date_collected, evidence_type, confidence, notes, created) "
        "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (oid, dimension, claim, evidence, source.upper(), url,
         date_collected or _hoy(), et, confidence, notes, _ahora()))


def agregar_senal(con, oid, signal_type, value, source, source_url=None,
                  confidence=None, evidence_type=None, notes=None,
                  date_collected=None):
    con.execute(
        "INSERT INTO market_signals (opportunity_id, signal_type, value, source, "
        "source_url, date_collected, confidence, evidence_type, notes, created) "
        "VALUES (?,?,?,?,?,?,?,?,?,?)",
        (oid, signal_type, str(value), (source or "").upper(), source_url,
         date_collected or _hoy(), confidence, evidence_type, notes, _ahora()))


def agregar_competidor(con, oid, name, source, **datos):
    d = _empaquetar(datos)
    d.update({"opportunity_id": oid, "name": name,
              "source": (source or "").upper(),
              "date_collected": d.get("date_collected") or _hoy(),
              "created": _ahora()})
    cols = ", ".join(d)
    marcas = ", ".join("?" * len(d))
    con.execute(f"INSERT INTO competitors ({cols}) VALUES ({marcas})",
                list(d.values()))


def registrar_bloqueo(con, target, reason, source="CLAUDE_CODE", oid=None):
    """ACCESS_UNAVAILABLE. Se llama cuando no se pudo consultar algo.

    Es tan importante como la evidencia: sin esto, 'no encontramos
    competidores en Hotmart' parece un hallazgo cuando en realidad
    nunca pudimos abrir Hotmart.
    """
    con.execute(
        "INSERT INTO access_log (opportunity_id, target, reason, source, "
        "date_collected, created) VALUES (?,?,?,?,?,?)",
        (oid, target, reason, (source or "").upper(), _hoy(), _ahora()))


def guardar_analisis(con, tabla, oid, **datos):
    """UPSERT para las tablas de 1 fila por oportunidad
    (seller_analysis, factory_analysis, scores)."""
    if tabla not in ("seller_analysis", "factory_analysis", "scores"):
        raise ValueError(f"tabla no soportada por guardar_analisis: {tabla}")
    d = dict(datos)
    d["opportunity_id"] = oid
    d["updated" if tabla != "scores" else "computed"] = _ahora()
    cols = ", ".join(d)
    marcas = ", ".join("?" * len(d))
    actualizaciones = ", ".join(f"{k}=excluded.{k}" for k in d
                                if k != "opportunity_id")
    con.execute(
        f"INSERT INTO {tabla} ({cols}) VALUES ({marcas}) "
        f"ON CONFLICT(opportunity_id) DO UPDATE SET {actualizaciones}",
        list(d.values()))


# ------------------------------------------------------------------ #
# consultas
# ------------------------------------------------------------------ #

def evidencia_de(con, oid, tipo=None):
    q = "SELECT * FROM evidence WHERE opportunity_id=?"
    p = [oid]
    if tipo:
        q += " AND evidence_type=?"
        p.append(tipo.upper())
    return [dict(f) for f in con.execute(q + " ORDER BY id", p)]


def tiene_observacion(con, oid):
    """Al menos una evidencia DIRECT o INDIRECT (o sea: con URL)."""
    return con.execute(
        "SELECT COUNT(*) c FROM evidence WHERE opportunity_id=? "
        "AND evidence_type IN ('DIRECT','INDIRECT')", (oid,)).fetchone()["c"] > 0


def fuentes_de(con, oid):
    """Que fuentes aportaron a esta oportunidad. Se usa para mostrar
    cuando dos investigaciones independientes coinciden -- eso vale
    mucho mas que una sola fuente insistiendo."""
    fs = set()
    for tabla, col in (("evidence", "source"), ("market_signals", "source"),
                       ("competitors", "source")):
        for f in con.execute(
                f"SELECT DISTINCT {col} s FROM {tabla} WHERE opportunity_id=?",
                (oid,)):
            if f["s"]:
                fs.add(f["s"])
    fila = con.execute("SELECT source FROM opportunities WHERE id=?",
                       (oid,)).fetchone()
    if fila and fila["source"]:
        fs.add(fila["source"])
    return sorted(fs)


def promover(con, oid, nuevo_estado):
    """Cambia de estado con dos candados: no saltear etapas hacia
    adelante, y no salir de DISCOVERED sin una observacion con URL."""
    fila = con.execute("SELECT status FROM opportunities WHERE id=?",
                       (oid,)).fetchone()
    if not fila:
        raise ValueError(f"no existe la oportunidad {oid}")
    actual = fila["status"]
    if nuevo_estado == RECHAZADA:
        actualizar_oportunidad(con, oid, status=RECHAZADA)
        return True, "rechazada"
    if nuevo_estado not in ESTADOS:
        raise ValueError(f"estado invalido: {nuevo_estado}")
    if actual == RECHAZADA:
        return False, "esta rechazada; reactivarla es manual y a conciencia"
    i_act = ESTADOS.index(actual) if actual in ESTADOS else -1
    i_new = ESTADOS.index(nuevo_estado)
    if i_new > i_act + 1:
        return False, (f"salto invalido {actual} -> {nuevo_estado}: "
                       f"hay que pasar por {ESTADOS[i_act + 1]}")
    if i_new <= i_act:
        actualizar_oportunidad(con, oid, status=nuevo_estado)
        return True, f"vuelve atras a {nuevo_estado}"
    if actual == "DISCOVERED" and not tiene_observacion(con, oid):
        return False, ("sin evidencia DIRECT/INDIRECT con URL no puede salir "
                       "de DISCOVERED")
    actualizar_oportunidad(con, oid, status=nuevo_estado)
    return True, f"{actual} -> {nuevo_estado}"


def listar(con, status=None, niche=None, limite=None, incluir_demo=True,
           orden="s.total_score DESC NULLS LAST"):
    q = ("SELECT o.*, s.total_score, s.quadrant, s.confidence AS score_confidence "
         "FROM opportunities o LEFT JOIN scores s ON s.opportunity_id = o.id "
         "WHERE 1=1")
    p = []
    if status:
        q += " AND o.status=?"
        p.append(status)
    if niche:
        q += " AND o.niche=?"
        p.append(niche)
    if not incluir_demo:
        q += " AND o.is_demo=0"
    q += f" ORDER BY {orden}"
    if limite:
        q += f" LIMIT {int(limite)}"
    return [desempaquetar(f) for f in con.execute(q, p)]


def purgar_demo(con):
    """Borra TODA fila de demostracion. Se corre antes de cargar
    investigacion real para que no quede nada inventado mezclado."""
    n = con.execute("SELECT COUNT(*) c FROM opportunities WHERE is_demo=1"
                    ).fetchone()["c"]
    con.execute("DELETE FROM opportunities WHERE is_demo=1")
    return n


def resumen(con):
    por_estado = {f["status"]: f["c"] for f in con.execute(
        "SELECT status, COUNT(*) c FROM opportunities GROUP BY status")}
    con_obs = con.execute(
        "SELECT COUNT(DISTINCT opportunity_id) c FROM evidence "
        "WHERE evidence_type IN ('DIRECT','INDIRECT')").fetchone()["c"]
    por_fuente = {f["source"]: f["c"] for f in con.execute(
        "SELECT source, COUNT(*) c FROM evidence GROUP BY source")}
    return {
        "total": sum(por_estado.values()),
        "demo": con.execute("SELECT COUNT(*) c FROM opportunities WHERE is_demo=1"
                            ).fetchone()["c"],
        "reales": con.execute("SELECT COUNT(*) c FROM opportunities WHERE is_demo=0"
                              ).fetchone()["c"],
        "por_estado": por_estado,
        "con_observacion": con_obs,
        "evidencia_por_fuente": por_fuente,
        "bloqueos": con.execute("SELECT COUNT(*) c FROM access_log").fetchone()["c"],
        "nichos": con.execute("SELECT COUNT(DISTINCT niche) c FROM opportunities"
                              ).fetchone()["c"],
    }
