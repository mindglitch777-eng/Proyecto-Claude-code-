#!/usr/bin/env python3
"""
Generador de hooks — CERO TOKENS.

Por que un generador y no una lista fija: la vida util de un formato
de hook cayo de 8 semanas (2023) a 3,5 semanas (2025). Una lista de
hooks queda vieja en un mes. Un sistema que ROTA patrones no.

Los 9 patrones que mejor puntuan en retencion 2026, adaptados al
nicho de psicologia/filosofia aplicada.

Reglas duras del formato (datos 2026):
- 8 a 15 palabras. Los mejores caen bajo 2 segundos.
- La ESPECIFICIDAD es la palanca: "si sos creador" es debil,
  una situacion nombrada es fuerte.
- TikTok mide retencion al segundo 1 y al 3. Ahi se decide todo.

Uso:
    python3 hooks.py                 # 9 hooks, uno por patron
    python3 hooks.py 20              # 20 hooks rotando patrones
    python3 hooks.py --patrones      # explica cada patron
    python3 hooks.py --auditar "texto del hook"
"""

import random
import re
import sys

# Cada patron: (nombre, por que funciona, plantillas)
PATRONES = {
    "llamado_identidad": (
        "Nombra a quien mira. Su cerebro se detiene porque lo reconoce.",
        [
            "Si te quedas pensando discusiones de hace {d} dias, esto es para vos",
            "A los que no pueden dormir por algo que dijeron: esto",
            "Si respondes rapido y despues te arrepentis, mira esto",
            "Para el que siente que todo lo saca de quicio",
        ]),
    "contrarian": (
        "Ataca una creencia establecida. Genera comentarios de ambos bandos.",
        [
            "El estoicismo no es aguantarse todo. Es lo contrario",
            "Tener autocontrol no es reprimirse. Nadie lo explica bien",
            "La calma no se logra pensando mas. Se logra pensando menos veces",
            "Marco Aurelio no era frio. Escribio {g} paginas sobre su miedo",
        ]),
    "advertencia_error": (
        "Aversion a la perdida: reaccionamos mas fuerte a evitar dolor.",
        [
            "El {p}% usa mal el estoicismo y por eso no les funciona",
            "Estas confundiendo dominar tus emociones con ignorarlas",
            "Este error hace que la filosofia te vuelva mas duro, no mas libre",
            "Si practicas esto mal, terminas peor que antes",
        ]),
    "bucle_abierto": (
        "Deja informacion incompleta. El cerebro necesita cerrarla.",
        [
            "Hay una pregunta que Marco Aurelio se hacia cada noche...",
            "Epicteto era esclavo. Lo que dijo sobre la libertad cambia todo",
            "Seneca era el hombre mas rico de Roma. Y escribio esto",
            "Existe una sola pregunta que corta cualquier discusion",
        ]),
    "amplificacion_problema": (
        "Nombra una frustracion que sienten pero no supieron poner en palabras.",
        [
            "Sabes que no deberia importarte y te importa igual. Eso tiene nombre",
            "Pensas la respuesta perfecta {h} horas despues. Hay una razon",
            "Te calmas y a los {mi} minutos volves a lo mismo",
            "No es que no sepas que hacer. Es que sabes y no podes",
        ]),
    "resultado_primero": (
        "Muestra el final antes que el proceso. Elimina la duda de si vale la pena.",
        [
            "Deje de discutir en {d} dias con una sola regla",
            "Esto baja la ansiedad antes de terminar el video",
            "En {seg} segundos vas a saber por que reaccionas asi",
        ]),
    "confesion": (
        "Vulnerabilidad especifica. Genera confianza inmediata.",
        [
            "Perdi {a} anios enojado por algo que no controlaba",
            "Lei Meditaciones {v} veces y recien ahora entendi la primera linea",
            "Me creia una persona tranquila hasta que conte cuantas veces reaccione",
        ]),
    "tease_lista": (
        "Promete cantidad concreta. El formato lista tiene la mejor curva.",
        [
            "{n} preguntas que desarman cualquier discusion. La {m} duele",
            "{n} cosas que Marco Aurelio hacia cada manana. La {m} es rara",
            "{n} emociones que los estoicos SI aceptaban",
        ]),
    "pregunta_directa": (
        "Obliga a responder mentalmente. Pero NO debe ser facil de responder.",
        [
            "Cuanto de lo que te arruino el dia dependia de vos?",
            "Que dirias si supieras que no te pueden ofender sin tu permiso?",
            "Por que te duele mas la opinion de alguien que no respetas?",
        ]),
    "accion_real": (
        "Nombra la situacion con vocabulario de la calle (no clinico) y "
        "la resuelve con una accion concreta y contable. No diagnostica, "
        "muestra. Es el unico patron que ancla al producto real.",
        [
            "Te comes la cabeza por un mensaje que no responden. {t} toques y sabes que hacer",
            "Son las 3 AM y no lo podes soltar. {t} toques, listo",
            "Le das mil vueltas a la misma decision hace {d} dias. Se corta en {t} toques",
            "Se te queda pegado lo que dijiste hace {a} anios. {t} toques lo bajan",
        ]),
}

# Cada marcador tiene su rango realista. Un numero fuera de escala
# rompe la credibilidad del hook mas rapido que cualquier otra cosa.
POOLS = {
    "{n}": [3, 4, 5, 7],          # cantidad de items en lista
    "{m}": [2, 3, 4],             # cual item del tease
    "{d}": [3, 5, 7, 10],         # dias
    "{p}": [80, 87, 90, 93],      # porcentaje
    "{h}": [2, 3, 6],             # horas
    "{mi}": [5, 10, 20],          # minutos
    "{seg}": [30, 40, 45],        # segundos
    "{a}": [2, 3, 4, 6],          # anios
    "{v}": [2, 3, 4],             # veces
    "{g}": [12, 300],             # paginas
    "{t}": [2, 3],                # toques reales en la app (no inventar mas)
}

# Frases que MATAN el hook (datos 2026)
PROHIBIDAS = [
    "hola", "hey", "en este video", "hoy quiero", "les voy a contar",
    "bienvenidos", "no vas a creer", "mira hasta el final", "increible",
]

# Vocabulario clinico: se lee como un profesional hablandole a un
# paciente, no como alguien que te entiende. Ademas cruza la linea
# etica del proyecto (MARCA.md: "no somos psicologia oscura... sin
# promesas de curacion, si promesas de accion concreta"). No vendemos
# un diagnostico, mostramos que reconocemos la situacion.
VOCABULARIO_CLINICO = [
    "rumiar", "rumiacion", "rumiando", "trastorno", "patologia",
    "sintoma", "diagnostico", "terapia", "paciente", "cuadro clinico",
    "tenes ansiedad", "sufris de", "padeces", "padecés",
]

# Lo que la gente realmente escribe (validado 2026: busqueda en TikTok
# hispanohablante de contenido de "overthinking" real). "Rumiar" es
# termino de paper de psicologia; esto es como se dice en la calle.
VOCABULARIO_FUERTE = [
    "te comes la cabeza", "le das mil vueltas", "no lo podes soltar",
    "se te queda pegado", "no parás de darle vueltas", "el bucle",
    "te vuela la cabeza", "no lo podes cortar",
]


def generar(n=9, semilla=None):
    rnd = random.Random(semilla)
    nombres = list(PATRONES)
    salida = []
    # Rota patrones: nunca dos iguales seguidos, cubre todos antes de repetir
    bolsa = []
    for i in range(n):
        if not bolsa:
            bolsa = nombres[:]
            rnd.shuffle(bolsa)
        pat = bolsa.pop()
        _, plantillas = PATRONES[pat]
        t = rnd.choice(plantillas)
        txt = t
        for marca, pool in POOLS.items():
            if marca in txt:
                txt = txt.replace(marca, str(rnd.choice(pool)))
        salida.append((pat, txt))
    return salida


def auditar(texto):
    """Chequea el hook contra las reglas duras de 2026."""
    problemas, avisos = [], []
    palabras = len(texto.split())
    bajo = texto.lower()

    if palabras > 15:
        problemas.append(f"{palabras} palabras (max 15). No entra en 3s.")
    elif palabras < 5:
        avisos.append(f"{palabras} palabras. Muy corto puede quedar vacio.")

    for f in PROHIBIDAS:
        if f in bajo:
            problemas.append(f"Frase de calentamiento: '{f}'. "
                             "El algoritmo la trata como relleno.")
            break

    for c in VOCABULARIO_CLINICO:
        if c in bajo:
            sugerido = VOCABULARIO_FUERTE[hash(c) % len(VOCABULARIO_FUERTE)]
            problemas.append(
                f"'{c}' es vocabulario clinico: nadie lo dice en la calle "
                f"y ademas cruza la linea etica del proyecto (no vendemos "
                f"un diagnostico). Probar con algo como '{sugerido}'.")
            break

    if not re.search(r"\d", texto):
        avisos.append("Sin numero. La especificidad es LA palanca de 2026.")

    # Pregunta demasiado facil de responder mata la tension
    if texto.strip().endswith("?") and re.match(
            r"^\s*(te gustaria|queres|sabias|alguna vez|te paso)", bajo):
        problemas.append("Pregunta que se responde al instante. "
                         "Elimina la tension en vez de crearla.")

    # Generico vs especifico
    genericos = ["la gente", "las personas", "todos", "muchos"]
    if any(g in bajo for g in genericos) and not re.search(r"\d", texto):
        avisos.append("Sujeto generico sin dato. Nombra una situacion "
                      "concreta: 'si te quedas pensando discusiones' pega "
                      "mas que 'la gente piensa mucho'.")

    print(f'HOOK: "{texto}"')
    print(f"Palabras: {palabras}")
    if problemas:
        print("\nPROBLEMAS:")
        for p in problemas:
            print(f"  X {p}")
    if avisos:
        print("\nAVISOS:")
        for a in avisos:
            print(f"  ! {a}")
    if not problemas and not avisos:
        print("\nOK - cumple las reglas de 2026.")
    return 1 if problemas else 0


def explicar():
    print("=== LOS 9 PATRONES (2026) ===\n")
    for nombre, (por_que, plantillas) in PATRONES.items():
        print(f"{nombre.upper().replace('_', ' ')}")
        print(f"  {por_que}")
        print(f"  Ej: {plantillas[0]}\n")
    print("REGLA ANTI-FATIGA: rota patrones. Un formato de hook dura")
    print("~3,5 semanas antes de que la audiencia lo reconozca y saltee.")
    print("Nunca uses el mismo patron dos videos seguidos.")


def main():
    a = sys.argv[1:]
    if a and a[0] == "--patrones":
        explicar(); return
    if a and a[0] == "--auditar":
        if len(a) < 2:
            print('Uso: python3 hooks.py --auditar "tu hook"'); sys.exit(1)
        sys.exit(auditar(" ".join(a[1:])))
    n = int(a[0]) if a and a[0].isdigit() else 9
    print(f"=== {n} HOOKS (patrones rotados) ===\n")
    for pat, txt in generar(n):
        print(f"[{pat}]")
        print(f"  {txt}\n")


if __name__ == "__main__":
    main()
