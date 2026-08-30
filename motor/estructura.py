#!/usr/bin/env python3
"""
Estructura (§5 y §6) y el puente a lo visual (§12).

§5 da una estructura recomendada y aclara enseguida que NO se usa
siempre la misma. §6 da nueve desarrollos con su propio esqueleto. Aca
viven los nueve, cada beat con:

    - que tiene que pasar en ese beat
    - cuanto peso lleva del video (para repartir los segundos)
    - que maquetas de animador_v9 sirven para mostrarlo

Ese ultimo campo es §12 hecho programa: el guion no se escribe y
despues se le buscan imagenes, nace sabiendo que se ve en cada beat.
"""

# (beat, que pasa, peso, maquetas sugeridas)
ESQUELETOS = {
    "A": [  # descubrimiento
        ("hook", "el conflicto de entrada, sin contexto", 1.2, ["pleno", "declaracion"]),
        ("que_encontramos", "el hallazgo, nombrado concreto", 1.4, ["pleno", "tarjeta"]),
        ("por_que_importa", "por que no es una curiosidad mas", 1.3, ["lista"]),
        ("evidencia", "la prueba, con fuente a la vista", 1.6, ["prueba", "dato_duro"]),
        ("descubrimiento", "lo que el dato dice y no se ve solo", 1.5, ["comparacion", "revelacion"]),
        ("oportunidad", "donde queda el hueco", 1.4, ["flujo", "lista"]),
        ("cta", "la accion que sigue", 0.9, ["cta", "pleno"]),
    ],
    "B": [  # caso real
        ("hook", "el resultado antes que la historia", 1.2, ["pleno", "dato_duro"]),
        ("situacion", "donde estaba antes", 1.2, ["pleno", "retrato"]),
        ("que_hizo", "la accion concreta", 1.5, ["pasos", "flujo"]),
        ("como_funciona", "el mecanismo", 1.6, ["flujo", "division"]),
        ("evidencia", "lo que se puede verificar, y lo que solo AFIRMA", 1.5, ["prueba"]),
        ("aprendizaje", "que se lleva el que mira", 1.3, ["declaracion", "lista"]),
        ("cta", "la accion que sigue", 0.9, ["cta"]),
    ],
    "C": [  # desarmar un negocio
        ("hook", "el numero o la rareza del negocio", 1.2, ["pleno", "dato_duro"]),
        ("que_vende", "el producto, sin adornos", 1.1, ["tarjeta", "pleno"]),
        ("quien_compra", "el cliente real", 1.1, ["ruleta", "lista"]),
        ("cuanto_cuesta", "el precio y el margen", 1.3, ["dato_duro", "comparacion"]),
        ("como_consigue", "el canal de clientes", 1.4, ["flujo"]),
        ("que_resuelve", "el problema de fondo", 1.3, ["declaracion"]),
        ("aprendizaje", "que se copia y que no", 1.3, ["lista"]),
        ("oportunidad", "donde queda el hueco", 1.2, ["flujo"]),
    ],
    "D": [  # experimento
        ("hook", "la apuesta", 1.2, ["pleno"]),
        ("hipotesis", "que creemos que va a pasar", 1.2, ["tarjeta", "pregunta"]),
        ("que_vamos_a_hacer", "el plan, corto", 1.2, ["pasos", "flujo"]),
        ("ejecucion", "haciendolo", 1.5, ["collage", "prueba"]),
        ("problema", "lo que salio mal", 1.4, ["alerta", "pleno"]),
        ("resultado", "el numero crudo", 1.5, ["dato_duro", "prueba"]),
        ("analisis", "que significa", 1.3, ["comparacion"]),
        ("conclusion", "y si todavia no sabemos, se dice", 1.1, ["declaracion", "cta"]),
    ],
    "E": [  # contrarian
        ("hook", "todo el mundo dice X", 1.2, ["pleno", "declaracion"]),
        ("evidencia", "el dato que no encaja", 1.7, ["prueba", "dato_duro"]),
        ("explicacion", "por que pasa", 1.6, ["flujo", "division"]),
        ("contraargumento", "lo que el otro lado dice bien", 1.3, ["comparacion"]),
        ("conclusion", "donde queda la cosa", 1.3, ["declaracion"]),
        ("cta", "la accion que sigue", 0.9, ["cta"]),
    ],
    "F": [  # lista / ranking -- con criterio, conflicto y veredicto
        ("hook", "el criterio y el conflicto juntos", 1.3, ["pleno"]),
        ("criterio", "con que vara se mide", 1.2, ["tarjeta", "lista"]),
        ("items", "los candidatos, rapido", 2.4, ["ruleta", "lista", "conteo"]),
        ("veredicto", "cuales quedan y cuales no", 1.6, ["comparacion", "ranking"]),
        ("por_que", "la razon del veredicto", 1.3, ["declaracion"]),
        ("cta", "la accion que sigue", 0.9, ["cta"]),
    ],
    "G": [  # historia
        ("situacion", "donde arranca", 1.2, ["pleno", "retrato"]),
        ("problema", "que se rompe", 1.4, ["lista", "alerta"]),
        ("decision", "que eligio hacer", 1.2, ["declaracion"]),
        ("dificultad", "lo que costo", 1.4, ["escalada"]),
        ("descubrimiento", "lo que encontro", 1.5, ["revelacion", "prueba"]),
        ("resultado", "como termino", 1.3, ["dato_duro"]),
        ("aprendizaje", "que deja", 1.1, ["declaracion", "cta"]),
    ],
    "H": [  # oportunidad
        ("problema", "el dolor, nombrado", 1.4, ["pleno", "lista"]),
        ("mercado", "quienes lo tienen y cuantos son", 1.4, ["prueba", "dato_duro"]),
        ("solucion", "que lo resolveria", 1.4, ["flujo"]),
        ("producto", "en que se convierte", 1.3, ["tarjeta", "flujo"]),
        ("monetizacion", "donde esta la plata, sin prometer que es facil", 1.5,
         ["comparacion", "dato_duro"]),
        ("cta", "la accion que sigue", 1.0, ["cta"]),
    ],
    "I": [  # error / fracaso
        ("hook", "parece buena idea, hasta que", 1.3, ["pleno"]),
        ("que_salio_mal", "el hecho", 1.5, ["alerta", "lista"]),
        ("por_que", "la causa real", 1.6, ["flujo", "division"]),
        ("aprendizaje", "que sabemos ahora", 1.4, ["declaracion"]),
        ("como_evitarlo", "la regla que queda", 1.3, ["pasos", "lista"]),
        ("cta", "la accion que sigue", 0.9, ["cta"]),
    ],
}

# §5. La estructura recomendada, para cuando la idea no encaja limpio
# en ninguno de los nueve.
BASE = [
    ("hook", "el conflicto de entrada", 1.2, ["pleno"]),
    ("promesa", "que se va a ver", 1.0, ["pregunta", "tarjeta"]),
    ("contexto", "lo minimo indispensable", 0.9, ["pleno"]),
    ("tension", "por que no cierra", 1.3, ["lista", "alerta"]),
    ("descubrimiento", "lo que encontramos", 1.4, ["revelacion"]),
    ("evidencia", "la prueba con fuente", 1.5, ["prueba"]),
    ("giro", "lo que cambia de sentido", 1.4, ["comparacion"]),
    ("payoff", "el punto al que llega", 1.3, ["declaracion", "dato_duro"]),
    ("cta", "la accion que sigue", 0.9, ["cta"]),
]


def plan(letra, duracion=32.0):
    """Reparte 'duracion' entre los beats del esqueleto segun su peso.
    Devuelve [(beat, que_pasa, segundos, maquetas)]."""
    esq = ESQUELETOS.get((letra or "").upper(), BASE)
    peso = sum(b[2] for b in esq) or 1
    return [(b[0], b[1], round(duracion * b[2] / peso, 1), b[3]) for b in esq]


def esqueleto_guion(letra, duracion=32.0, paleta=None, flash_ritmo=None):
    """Guion JSON a medio armar: los planos ya vienen con su maqueta y
    su duracion; falta escribir la narracion. Es §12 al reves de como
    se hace normalmente -- primero que se ve, despues que se dice."""
    segs = []
    for i, (beat, que, seg, maquetas) in enumerate(plan(letra, duracion)):
        s = {
            "formato": maquetas[0],
            "_beat": beat,
            "_que_pasa": que,
            "_maquetas_alternativas": maquetas[1:],
            "narracion": "",
            "necesita": "",
            "duracion": seg,
            "transicion": "corte_duro" if i else None,
        }
        if maquetas[0] == "pleno":
            s["captions_cascada"] = True
            s["velo"] = 0.46
        if beat == "hook":
            s["hook"] = "impacto"
            s["flash"] = True
        s = {k: v for k, v in s.items() if v is not None}
        segs.append(s)
    g = {
        "tema": "",
        "nota": f"Esqueleto {letra.upper()} generado por motor.py. "
                f"Cada plano trae su beat y que tiene que pasar ahi. "
                f"Falta narracion y consulta de imagen.",
        "fps": 30, "camara": 1.0, "loop": False,
        "paleta": paleta or {"fondo": [10, 10, 12], "texto": [246, 246, 244],
                             "destacado": [255, 78, 36]},
        "segmentos": segs,
    }
    if flash_ritmo:
        g["flash_ritmo"] = flash_ritmo
        g["flash_ritmo_largo"] = 0.08
    return g
