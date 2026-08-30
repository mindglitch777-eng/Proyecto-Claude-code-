#!/usr/bin/env python3
"""
La puerta de produccion (§24), el CTA que sigue al contenido (§8) y
el registro de cifras (§17).

§24 es una puerta, no una lista de deseos: "si no podemos responderlas,
NO PRODUCIR TODAVIA". Aca esta implementado como tal -- listo() dice
que falta y produce False hasta que este todo.
"""
PREGUNTAS = [
    ("q1_siente",    "1. Que quiero que SIENTA"),
    ("q2_piensa",    "2. Que quiero que PIENSE"),
    ("q3_descubre",  "3. Que quiero que DESCUBRA"),
    ("q4_conflicto", "4. Cual es el CONFLICTO"),
    ("q5_hook",      "5. Cual es el HOOK"),
    ("q6_payoff",    "6. Cual es el PAYOFF"),
    ("q7_evidencia", "7. Que EVIDENCIA tengo"),
    ("q8_ve",        "8. Que esta VIENDO mientras escucha"),
    ("q9_queda",     "9. Por que deberia QUEDARSE"),
    ("q10_accion",   "10. Que ACCION quiero que tome"),
]

# §8. El CTA corresponde al objetivo de la pieza. "Seguime para mas"
# no es la respuesta a todo: es una de once.
CTA_POR_OBJETIVO = {
    "descubrimiento": ["Encontramos {n} mas. La investigacion completa esta en {donde}.",
                       "Manana sale el siguiente."],
    "educacion":      ["Si queres aprender a hacerlo desde cero, {donde}.",
                       "Guardalo para cuando te toque."],
    "autoridad":      ["Tengo el detalle de como lo medimos. Preguntame.",
                       "Seguime, esto lo hacemos todas las semanas."],
    "comunidad":      ["Contame en que rubro estas y lo miro.",
                       "Si te pasa lo mismo, escribilo abajo."],
    "conversion":     ["La herramienta esta en {donde}. Gratis.",
                       "Te la paso por {donde}."],
    "producto":       ["Esta hecho. {donde}.",
                       "Lo probas y me decis."],
    "experimento":    ["Manana probamos si esto funciona de verdad.",
                       "Parte 2 cuando tengamos el numero."],
    "entretenimiento": ["Seguime.", "Hay mas de estos."],
}


def faltantes(fila):
    """Que preguntas de §24 quedan sin responder."""
    if fila is None:
        return [t for _, t in PREGUNTAS]
    return [t for k, t in PREGUNTAS
            if not (fila[k] if k in fila.keys() else None or "").strip()]


def listo(con, idea_id):
    """(puede_producirse, motivos). Aplica §24, §4, §10 y §17 juntos."""
    motivos = []
    idea = con.execute("SELECT * FROM ideas WHERE id=?", (idea_id,)).fetchone()
    if idea is None:
        return False, ["la idea no existe"]

    if not (idea["conflicto"] or "").strip():
        motivos.append("§4: la idea no declara conflicto")
    if not idea["objetivo"]:
        motivos.append("§19: la pieza no declara objetivo")
    if not idea["variable"]:
        motivos.append("§22: no declara que variable prueba")

    sc = con.execute("SELECT * FROM idea_scores WHERE idea_id=?",
                     (idea_id,)).fetchone()
    if sc is None or sc["total"] is None:
        motivos.append("§11: la idea no fue puntuada")
    elif (sc["cobertura"] or 0) < 0.6:
        motivos.append(f"§11: solo {int((sc['cobertura'] or 0)*100)}% de las "
                       f"dimensiones puntuadas -- la idea esta empezada, "
                       f"no evaluada")

    eleg = con.execute("SELECT COUNT(*) FROM hooks WHERE idea_id=? AND elegido=1",
                       (idea_id,)).fetchone()[0]
    if not eleg:
        motivos.append("§10: ningun hook marcado como elegido (el puntaje "
                       "ordena, la eleccion es humana)")

    br = con.execute("SELECT * FROM briefs WHERE idea_id=?", (idea_id,)).fetchone()
    for t in faltantes(br):
        motivos.append(f"§24 sin responder: {t}")

    # §17: toda cifra registrada tiene que tener etiqueta, y las que
    # dicen VERIFICADO tienen que tener fuente.
    for c in con.execute("SELECT * FROM cifras WHERE idea_id=?", (idea_id,)):
        if c["etiqueta"] == "VERIFICADO" and not (c["fuente"] or "").strip():
            motivos.append(f"§17: '{c['cifra']}' dice VERIFICADO y no tiene fuente")

    return (not motivos), motivos


def sugerir_cta(objetivo, donde="el link de la bio", n="17"):
    return [t.format(donde=donde, n=n)
            for t in CTA_POR_OBJETIVO.get(objetivo or "", ["Seguime."])]
