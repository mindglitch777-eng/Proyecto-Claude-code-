#!/usr/bin/env python3
"""
Base de datos de oportunidades del Product Factory.

POR QUE SQLITE Y NO UN JSON
    Van a ser cientos de oportunidades con evidencia adjunta, filtradas
    y reordenadas todo el tiempo por puntaje, estado y mercado. Un JSON
    obliga a cargar y reescribir todo entero en cada cambio, y no
    permite consultar "dame las 20 mejores de VALIDATED que tengan al
    menos 3 evidencias". SQLite viene con Python, es un solo archivo
    que se puede commitear, y no agrega ninguna dependencia.

LA REGLA QUE HACE CUMPLIR ESTE ESQUEMA
    La evidencia vive en su PROPIA tabla, con URL obligatoria y con el
    tipo declarado (FACT / INFERENCE / HYPOTHESIS). Eso hace imposible
    escribir "este nicho tiene mucha demanda" sin dejar registrado de
    donde salio. Una oportunidad sin evidencia de tipo FACT no puede
    pasar de DISCOVERED: lo verifica promover().
"""
import json
import sqlite3
import time
from pathlib import Path

RAIZ = Path(__file__).parent.parent
DB = RAIZ / "factory" / "oportunidades.db"

# El embudo. El orden importa: promover() solo deja avanzar de a un
# paso y exige evidencia real para salir de DISCOVERED.
ESTADOS = [
    "DISCOVERED",     # sembrada como hipotesis, sin nada verificado
    "RESEARCHING",    # se le esta buscando evidencia ahora
    "VALIDATED",      # tiene evidencia FACT de demanda real
    "SHORTLIST",      # entre las 100 mejores por puntaje
    "DEEP_RESEARCH",  # entre las 20 que se investigan a fondo
    "PREVALIDATION",  # se esta probando la oferta antes de construir
    "BUILD",          # se esta fabricando el producto
    "LAUNCH",         # publicado, con vendedores
    "WINNER",         # vende de verdad
]
RECHAZADA = "REJECTED"   # puede llegar desde cualquier estado

TIPOS_EVIDENCIA = ("FACT", "INFERENCE", "HYPOTHESIS")

ESQUEMA = """
CREATE TABLE IF NOT EXISTS oportunidades (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    -- identidad y ubicacion en el mapa de mercados
    mercado             TEXT NOT NULL,
    subnicho            TEXT NOT NULL,
    hipersubnicho       TEXT,
    pais                TEXT,

    -- el problema, que es lo que de verdad se investiga
    problema            TEXT NOT NULL,
    comprador           TEXT,
    frecuencia          TEXT,     -- diaria / semanal / puntual / estacional
    dolor               TEXT,     -- descripcion cualitativa
    solucion_actual     TEXT,     -- que hace hoy la gente sin nuestro producto

    -- panorama competitivo, separado por idioma a proposito
    productos_ingles    TEXT,     -- JSON: lista
    competidores_ingles TEXT,     -- JSON: lista
    productos_espanol   TEXT,     -- JSON: lista
    competidores_esp    TEXT,     -- JSON: lista
    precios             TEXT,     -- JSON: lista de precios observados
    hueco_espanol       TEXT,     -- A..G segun la taxonomia del brief

    -- el producto que haríamos nosotros
    concepto_producto   TEXT,
    formato_producto    TEXT,
    precio_estimado     REAL,

    -- puntajes 0-10 (los pone puntaje.py, no se escriben a mano)
    demanda             REAL,
    dolor_score         REAL,
    tamano_mercado      REAL,
    competencia         REAL,
    hueco_score         REAL,
    factory_score       REAL,
    economia            REAL,
    contentability      REAL,
    sellerability       REAL,
    puntaje             REAL,     -- el ponderado final 0-100

    -- lo que puede matar la oportunidad
    riesgos             TEXT,     -- JSON: lista

    veredicto           TEXT,
    estado              TEXT NOT NULL DEFAULT 'DISCOVERED',
    creada              REAL,
    actualizada         REAL,
    UNIQUE(mercado, subnicho, problema)
);

CREATE TABLE IF NOT EXISTS evidencia (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    oportunidad_id  INTEGER NOT NULL,
    -- FACT: verificable en la fuente. INFERENCE: deduccion a partir de
    -- hechos, marcada como tal. HYPOTHESIS: suposicion sin verificar.
    -- Mezclar los tres sin distinguirlos es exactamente lo que este
    -- esquema existe para impedir.
    tipo            TEXT NOT NULL CHECK (tipo IN ('FACT','INFERENCE','HYPOTHESIS')),
    dimension       TEXT,        -- demanda / dolor / competencia / precio / hueco
    afirmacion      TEXT NOT NULL,
    url             TEXT,        -- obligatoria para FACT (lo valida agregar_evidencia)
    fuente          TEXT,        -- de donde salio: serpapi, reddit, trends...
    extracto        TEXT,        -- cita textual, para poder auditar despues
    creada          REAL,
    FOREIGN KEY (oportunidad_id) REFERENCES oportunidades(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_op_estado  ON oportunidades(estado);
CREATE INDEX IF NOT EXISTS idx_op_puntaje ON oportunidades(puntaje DESC);
CREATE INDEX IF NOT EXISTS idx_ev_op      ON evidencia(oportunidad_id);
CREATE INDEX IF NOT EXISTS idx_ev_tipo    ON evidencia(tipo);
"""

CAMPOS_JSON = ("productos_ingles", "competidores_ingles", "productos_espanol",
               "competidores_esp", "precios", "riesgos")


def conectar(ruta=None):
    con = sqlite3.connect(str(ruta or DB))
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript(ESQUEMA)
    return con


def _empaquetar(datos):
    """Los campos de lista viajan como JSON en columnas de texto."""
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


def agregar(con, **datos):
    """Alta de una oportunidad. Si ya existe (mismo mercado+subnicho+
    problema) devuelve el id existente en vez de duplicarla: la semilla
    se puede correr muchas veces sin ensuciar la base."""
    d = _empaquetar(datos)
    d.setdefault("creada", time.time())
    d["actualizada"] = time.time()
    columnas = ", ".join(d)
    marcas = ", ".join("?" * len(d))
    try:
        cur = con.execute(
            f"INSERT INTO oportunidades ({columnas}) VALUES ({marcas})",
            list(d.values()))
        return cur.lastrowid
    except sqlite3.IntegrityError:
        fila = con.execute(
            "SELECT id FROM oportunidades WHERE mercado=? AND subnicho=? AND problema=?",
            (d["mercado"], d["subnicho"], d["problema"])).fetchone()
        return fila["id"] if fila else None


def actualizar(con, oid, **datos):
    d = _empaquetar(datos)
    d["actualizada"] = time.time()
    sets = ", ".join(f"{k}=?" for k in d)
    con.execute(f"UPDATE oportunidades SET {sets} WHERE id=?",
                list(d.values()) + [oid])


def agregar_evidencia(con, oid, tipo, afirmacion, url=None, dimension=None,
                      fuente=None, extracto=None):
    """Guarda una pieza de evidencia.

    Un FACT SIN URL se rechaza. Es la unica forma de que "es un hecho"
    signifique algo: si no se puede volver a la fuente y verificarlo,
    no es un hecho, es una hipotesis y se guarda como tal.
    """
    tipo = tipo.upper()
    if tipo not in TIPOS_EVIDENCIA:
        raise ValueError(f"tipo invalido: {tipo}. Debe ser uno de {TIPOS_EVIDENCIA}")
    if tipo == "FACT" and not url:
        raise ValueError(
            "un FACT necesita URL. Sin fuente verificable no es un hecho: "
            "guardalo como HYPOTHESIS.")
    con.execute(
        "INSERT INTO evidencia (oportunidad_id, tipo, dimension, afirmacion, "
        "url, fuente, extracto, creada) VALUES (?,?,?,?,?,?,?,?)",
        (oid, tipo, dimension, afirmacion, url, fuente, extracto, time.time()))


def evidencia_de(con, oid, tipo=None):
    q = "SELECT * FROM evidencia WHERE oportunidad_id=?"
    p = [oid]
    if tipo:
        q += " AND tipo=?"
        p.append(tipo.upper())
    return [dict(f) for f in con.execute(q + " ORDER BY id", p)]


def contar_hechos(con, oid):
    return con.execute(
        "SELECT COUNT(*) c FROM evidencia WHERE oportunidad_id=? AND tipo='FACT'",
        (oid,)).fetchone()["c"]


def promover(con, oid, nuevo_estado):
    """Mueve una oportunidad de estado, con dos candados:

    1. No se puede saltar etapas hacia adelante. Pasar de DISCOVERED
       directo a SHORTLIST significaria que nadie la investigo.
    2. No se puede salir de DISCOVERED sin al menos un FACT con URL.
       Este es el candado que hace que el laboratorio no se llene de
       corazonadas disfrazadas de oportunidades.

    REJECTED se acepta siempre y desde cualquier estado: descartar algo
    nunca deberia requerir tramite.
    """
    fila = con.execute("SELECT estado FROM oportunidades WHERE id=?",
                       (oid,)).fetchone()
    if not fila:
        raise ValueError(f"no existe la oportunidad {oid}")
    actual = fila["estado"]
    if nuevo_estado == RECHAZADA:
        actualizar(con, oid, estado=RECHAZADA)
        return True, "rechazada"
    if nuevo_estado not in ESTADOS:
        raise ValueError(f"estado invalido: {nuevo_estado}")
    if actual == RECHAZADA:
        return False, "esta rechazada; reactivar es manual y a conciencia"
    i_actual = ESTADOS.index(actual) if actual in ESTADOS else -1
    i_nuevo = ESTADOS.index(nuevo_estado)
    if i_nuevo > i_actual + 1:
        return False, (f"salto invalido {actual} -> {nuevo_estado}: "
                       f"hay que pasar por {ESTADOS[i_actual + 1]}")
    if i_nuevo <= i_actual:
        actualizar(con, oid, estado=nuevo_estado)
        return True, f"vuelve atras a {nuevo_estado}"
    if actual == "DISCOVERED" and contar_hechos(con, oid) == 0:
        return False, ("no tiene ni una evidencia FACT con URL: no puede "
                       "salir de DISCOVERED")
    actualizar(con, oid, estado=nuevo_estado)
    return True, f"{actual} -> {nuevo_estado}"


def listar(con, estado=None, limite=None, orden="puntaje DESC", mercado=None):
    q = "SELECT * FROM oportunidades WHERE 1=1"
    p = []
    if estado:
        q += " AND estado=?"
        p.append(estado)
    if mercado:
        q += " AND mercado=?"
        p.append(mercado)
    q += f" ORDER BY {orden}"
    if limite:
        q += f" LIMIT {int(limite)}"
    return [desempaquetar(f) for f in con.execute(q, p)]


def resumen(con):
    """Conteo por estado + cuantas tienen evidencia real. El segundo
    numero es el que importa: sin el, 'tenemos 500 oportunidades' no
    dice nada."""
    por_estado = {f["estado"]: f["c"] for f in con.execute(
        "SELECT estado, COUNT(*) c FROM oportunidades GROUP BY estado")}
    con_hechos = con.execute(
        "SELECT COUNT(DISTINCT oportunidad_id) c FROM evidencia WHERE tipo='FACT'"
    ).fetchone()["c"]
    return {
        "total": sum(por_estado.values()),
        "por_estado": por_estado,
        "con_evidencia_fact": con_hechos,
        "mercados": con.execute(
            "SELECT COUNT(DISTINCT mercado) c FROM oportunidades").fetchone()["c"],
        "subnichos": con.execute(
            "SELECT COUNT(DISTINCT mercado || '|' || subnicho) c FROM oportunidades"
        ).fetchone()["c"],
    }
