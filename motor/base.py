#!/usr/bin/env python3
"""
Base del motor de contenido (MOTOR.md).

Guarda ideas, hooks, briefs y resultados publicados. Existe para que
el bucle de aprendizaje de §23 tenga donde vivir: sin memoria de que
se publico y como midio, "el sistema aprende" es una frase.

TODO ES DETERMINISTA. Ningun LLM, ninguna API paga. Lo que el programa
no puede medir no lo inventa: lo deja en None y lo pide.
"""
import json
import sqlite3
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DB = RAIZ / "motor" / "contenido.db"

# §6 -- los nueve esqueletos. La letra es la del documento.
DESARROLLOS = {
    "A": "descubrimiento",
    "B": "caso_real",
    "C": "desarmar_negocio",
    "D": "experimento",
    "E": "contrarian",
    "F": "lista_ranking",
    "G": "historia",
    "H": "oportunidad",
    "I": "error_fracaso",
}

# §19 -- objetivo declarado de la pieza. Una y solo una por video.
OBJETIVOS = ("descubrimiento", "educacion", "autoridad", "comunidad",
             "conversion", "producto", "experimento", "entretenimiento")

# §20 -- en que escalon del funnel cae
ESCALONES = ("viral", "problema", "oportunidad", "educacion", "evidencia",
             "cta", "oferta")

# §17 -- de donde sale cada cifra. Sin esto una cifra es una opinion
# con tipografia grande.
ETIQUETAS_CIFRA = ("VERIFICADO", "DECLARADO", "ESTIMADO", "RUMOR", "HIPOTESIS")

# §9 -- las doce familias de hook
# §9 del brief nombra dieciseis familias. 'shock' cubre "esto parece
# imposible" y 'secreto' cubre "nadie te cuenta".
CATEGORIAS_HOOK = ("dinero", "descubrimiento", "contradiccion", "curiosidad",
                   "shock", "oportunidad", "conflicto", "comparacion",
                   "historia", "desafio", "fomo", "autoridad",
                   "secreto", "error", "advertencia", "transformacion")

# §22 -- que variable prueba esta pieza. 180 videos son 180 experimentos.
VARIABLES = ("hook", "formato", "tema", "narrativa", "duracion", "cta",
             "estilo", "visual", "audiencia", "angulo")

ESTADOS = ("BORRADOR", "EVALUADA", "RECHAZADA", "CON_HOOKS", "CON_BRIEF",
           "PRODUCIDA", "PUBLICADA")

ESQUEMA = """
CREATE TABLE IF NOT EXISTS ideas (
    id            INTEGER PRIMARY KEY,
    titulo        TEXT NOT NULL,
    -- §4: sin conflicto la idea se rechaza o se reformula. No es un
    -- campo opcional: es la condicion de existencia de la idea.
    conflicto     TEXT,
    desarrollo    TEXT,          -- letra A..I (§6)
    objetivo      TEXT,          -- §19
    escalon       TEXT,          -- §20
    variable      TEXT,          -- §22, que prueba esta pieza
    slots         TEXT,          -- JSON con los datos concretos
    notas         TEXT,
    estado        TEXT NOT NULL DEFAULT 'BORRADOR',
    creada        TEXT NOT NULL DEFAULT (datetime('now')),
    serie         TEXT,          -- §21, a que serie pertenece
    UNIQUE(titulo)
);

-- §11. Las cinco primeras son la prioridad declarada; las otras cinco
-- entran despues. Cada una 1..10, o NULL si todavia no se puntuo.
CREATE TABLE IF NOT EXISTS idea_scores (
    idea_id        INTEGER PRIMARY KEY REFERENCES ideas(id) ON DELETE CASCADE,
    comercial      INTEGER, viral         INTEGER, curiosidad  INTEGER,
    produccion     INTEGER, demostrable   INTEGER, diferenciacion INTEGER,
    credibilidad   INTEGER, serie         INTEGER, cta         INTEGER,
    evidencia      INTEGER,
    total          REAL, cobertura REAL
);

CREATE TABLE IF NOT EXISTS hooks (
    id         INTEGER PRIMARY KEY,
    idea_id    INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    texto      TEXT NOT NULL,
    categoria  TEXT NOT NULL,
    origen     TEXT NOT NULL DEFAULT 'PLANTILLA',  -- PLANTILLA | HUMANO
    -- §2/§3: motivo por el que el hook queda descartado de entrada.
    -- NULL = pasa el filtro.
    rechazo    TEXT,
    -- §10, 1..10 cada una. 'sugerido' lo calcula el programa con lo que
    -- SI puede medir; el humano lo pisa cuando quiere.
    viral INTEGER, curiosidad INTEGER, comercial INTEGER, claridad INTEGER,
    credibilidad INTEGER, diferenciacion INTEGER, visual INTEGER,
    total      REAL,
    sugerido   INTEGER NOT NULL DEFAULT 1,
    -- §10: "no elegir automaticamente el de mayor puntaje". Esto lo
    -- marca una persona cuando decide que el hook encaja con el
    -- desarrollo. Sin esta marca ningun hook se usa.
    elegido    INTEGER NOT NULL DEFAULT 0,
    UNIQUE(idea_id, texto)
);

-- §24. Las diez preguntas. Sin las diez respondidas no se produce.
CREATE TABLE IF NOT EXISTS briefs (
    idea_id   INTEGER PRIMARY KEY REFERENCES ideas(id) ON DELETE CASCADE,
    hook_id   INTEGER REFERENCES hooks(id),
    q1_siente TEXT, q2_piensa TEXT, q3_descubre TEXT, q4_conflicto TEXT,
    q5_hook   TEXT, q6_payoff TEXT, q7_evidencia TEXT, q8_ve TEXT,
    q9_queda  TEXT, q10_accion TEXT,
    cta       TEXT,
    guion     TEXT
);

-- §17. Toda cifra que aparezca en pantalla, con su etiqueta y fuente.
CREATE TABLE IF NOT EXISTS cifras (
    id       INTEGER PRIMARY KEY,
    idea_id  INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    cifra    TEXT NOT NULL,
    etiqueta TEXT NOT NULL,
    fuente   TEXT,
    UNIQUE(idea_id, cifra)
);

-- §23. El bucle: resultado -> analisis -> hipotesis -> variacion.
CREATE TABLE IF NOT EXISTS publicaciones (
    id          INTEGER PRIMARY KEY,
    idea_id     INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    plataforma  TEXT, publicada TEXT,
    vistas      INTEGER, ret_3s REAL, guardados INTEGER,
    clics_perfil INTEGER, leads INTEGER, ventas INTEGER,
    analisis    TEXT, hipotesis TEXT, siguiente_idea INTEGER
);
"""


def conectar(ruta=None):
    p = Path(ruta) if ruta else DB
    p.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(p)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript(ESQUEMA)
    return con


def slots(fila):
    try:
        return json.loads(fila["slots"] or "{}")
    except (TypeError, ValueError):
        return {}


def resumen(con):
    def uno(q, *a):
        return con.execute(q, a).fetchone()[0]
    return {
        "ideas": uno("SELECT COUNT(*) FROM ideas"),
        "sin_conflicto": uno("SELECT COUNT(*) FROM ideas WHERE "
                             "conflicto IS NULL OR TRIM(conflicto)=''"),
        "evaluadas": uno("SELECT COUNT(*) FROM idea_scores WHERE total IS NOT NULL"),
        "hooks": uno("SELECT COUNT(*) FROM hooks"),
        "hooks_rechazados": uno("SELECT COUNT(*) FROM hooks WHERE rechazo IS NOT NULL"),
        "hooks_elegidos": uno("SELECT COUNT(*) FROM hooks WHERE elegido=1"),
        "briefs_completos": uno(
            "SELECT COUNT(*) FROM briefs WHERE q1_siente IS NOT NULL AND "
            "q2_piensa IS NOT NULL AND q3_descubre IS NOT NULL AND "
            "q4_conflicto IS NOT NULL AND q5_hook IS NOT NULL AND "
            "q6_payoff IS NOT NULL AND q7_evidencia IS NOT NULL AND "
            "q8_ve IS NOT NULL AND q9_queda IS NOT NULL AND q10_accion IS NOT NULL"),
        "publicadas": uno("SELECT COUNT(*) FROM publicaciones"),
    }
