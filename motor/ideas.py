#!/usr/bin/env python3
"""
IDEA SCORE (§11) y la puerta del conflicto (§4).

    "Una idea mediocre con un hook espectacular sigue siendo una idea
    mediocre."

Por eso la idea se puntua ANTES que el hook, y sin conflicto declarado
no se puntua nada: §4 dice rechazar o reformular, no seguir igual.

El puntaje se ajusta por COBERTURA. Diez dimensiones puntuadas y dos
puntuadas no pueden dar el mismo numero: una idea con dos casilleros
llenos no esta evaluada, esta empezada.
"""
import json

# §11. El orden de prioridad del documento se traduce en peso. Suman 100.
PESOS = {
    # las cinco de prioridad declarada
    "comercial": 20, "viral": 17, "curiosidad": 14, "produccion": 11,
    "demostrable": 10,
    # las que entran despues
    "diferenciacion": 7, "credibilidad": 7, "serie": 5, "cta": 5,
    "evidencia": 4,
}

DIMENSIONES = tuple(PESOS)

DESCRIPCION = {
    "comercial": "que tan cerca esta de algo por lo que alguien paga",
    "viral": "que tan compartible es el concepto, no el hook",
    "curiosidad": "cuanto hueco deja abierto",
    "produccion": "que tan facil es hacerlo con lo que tenemos",
    "demostrable": "se puede MOSTRAR, o solo contar",
    "diferenciacion": "cuanta gente esta diciendo lo mismo",
    "credibilidad": "se sostiene si alguien lo revisa",
    "serie": "da para mas de un video (§21)",
    "cta": "hay una accion siguiente natural (§8)",
    "evidencia": "tenemos la prueba a mano, no la conseguiriamos",
}


def tiene_conflicto(idea):
    """§4. Sin tension declarada la idea no entra."""
    return bool((idea.get("conflicto") or "").strip())


def calcular(dims):
    """(total 0..100, cobertura 0..1, ajustado). 'dims' es {dimension:
    1..10}; lo que falta no se inventa: baja la cobertura."""
    puestas = {k: v for k, v in (dims or {}).items()
               if k in PESOS and v is not None}
    if not puestas:
        return 0.0, 0.0, 0.0
    # Denominador FIJO: dividir por "las que se puntuaron" haria que
    # una sola dimension en 10 diera 100.
    peso_total = sum(PESOS.values())
    total = sum(min(10, max(1, int(v))) * PESOS[k]
                for k, v in puestas.items()) / peso_total * 10
    cobertura = len(puestas) / len(PESOS)
    ajustado = total * (0.4 + 0.6 * cobertura)
    return round(total, 1), round(cobertura, 3), round(ajustado, 1)


def guardar(con, idea_id, dims):
    total, cob, _ = calcular(dims)
    cols = ", ".join(DIMENSIONES)
    marcas = ", ".join("?" * len(DIMENSIONES))
    con.execute(
        f"INSERT INTO idea_scores (idea_id, {cols}, total, cobertura) "
        f"VALUES (?, {marcas}, ?, ?) "
        f"ON CONFLICT(idea_id) DO UPDATE SET "
        + ", ".join(f"{d}=excluded.{d}" for d in DIMENSIONES)
        + ", total=excluded.total, cobertura=excluded.cobertura",
        [idea_id] + [dims.get(d) for d in DIMENSIONES] + [total, cob])
    return total, cob


def crear(con, titulo, conflicto=None, desarrollo=None, objetivo=None,
          escalon=None, variable=None, slots=None, notas=None, serie=None):
    """Alta de idea. Si no trae conflicto queda en BORRADOR y no se
    puede evaluar hasta que lo tenga (§4)."""
    estado = "BORRADOR" if not (conflicto or "").strip() else "EVALUADA"
    cur = con.execute(
        "INSERT INTO ideas (titulo, conflicto, desarrollo, objetivo, escalon,"
        " variable, slots, notas, serie, estado) "
        "VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(titulo) DO NOTHING",
        (titulo, conflicto, desarrollo, objetivo, escalon, variable,
         json.dumps(slots or {}, ensure_ascii=False), notas, serie, estado))
    if cur.lastrowid:
        return cur.lastrowid, True
    fila = con.execute("SELECT id FROM ideas WHERE titulo=?", (titulo,)).fetchone()
    return fila["id"], False
