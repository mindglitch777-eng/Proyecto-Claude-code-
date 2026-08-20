#!/usr/bin/env python3
"""Genera el lote 3 (11 guiones, topicos 17-27) con la gramatica de 6
beats aprobada por el operador: hook de impacto -> dato duro o
contenido real (mensajes/camino/escalada) -> escalada -> quiebre de
capitulo -> 3 capturas reales cortadas rapido -> cta de venta.

Data-driven (no a mano archivo por archivo) para poder iterar rapido
y mantener consistencia de estructura. Corre validar_hook.py sobre
cada uno al final.
"""
import json
from pathlib import Path

RAIZ = Path(__file__).parent
CAPTURAS = {
    "persona": "capturas/captura-persona.mp4",
    "decidir": "capturas/captura-decidir.mp4",
    "noche": "capturas/captura-noche.mp4",
    "antes": "capturas/captura-antes.mp4",
    "respirar": "capturas/captura-respirar.mp4",
}
PALETA = {"fondo": [15, 15, 16], "texto": [242, 239, 233], "destacado": [74, 222, 128]}


def cap_segmentos(fuente, textos, dur=(1.6, 1.5, 1.7)):
    out, t0 = [], 0.0
    for texto, d in zip(textos, dur):
        out.append({
            "captura": CAPTURAS[fuente], "recorte": [round(t0, 1), round(t0 + d, 1)],
            "texto": texto, "duracion": d, "transicion": "corte_duro", "sfx": "tick",
        })
        t0 += d
    return out


GUIONES = [
    # 17
    {
        "nombre": "17-discutiste-pareja", "fuente": "decidir",
        "hook": "Discutiste con tu pareja hace 3 horas. Ya no sabés por qué.",
        "dato": {"numero": 3, "sufijo": " horas", "texto": "Dándole vueltas a quién tenía razón."},
        "mecanismo": {"tipo": "escalada", "titulo": "Así se pierde el punto",
                       "pasos": ["Primero: yo tenía razón",
                                 "Después: bueno, un poco los dos",
                                 "Ahora ni sabés por qué empezó"]},
        "capturas": ["Nombrás lo que realmente te dolió", "Lo separás de quién ganó",
                     "Le escribís eso, no el resto"],
        "cierre": "Discutiste por el punto. No importa quién ganó. Seguime.",
    },
    # 18
    {
        "nombre": "18-pareja-frase-rara", "fuente": "persona",
        "hook": "Te dijo una frase rara hace 2 días y la seguís repitiendo.",
        "mensajes": {"contacto": "Él", "textos": [
            "Después hablamos, ahora no puedo",
            "No es nada, dejalo",
            "¿Por qué le das tantas vueltas?"]},
        "mecanismo": {"tipo": "escalada", "titulo": "Así se arma la historia",
                       "pasos": ["Primero pensás: raro que diga eso",
                                 "Después: seguro me está ocultando algo",
                                 "Ya armaste toda una novela en tu cabeza"]},
        "capturas": ["Nombrás lo que armaste en tu cabeza", "Lo separás de lo que dijo",
                     "Le preguntás directo, no en tu cabeza"],
        "cierre": "La frase no cambió. La historia la armaste vos. Seguime.",
    },
    # 19
    {
        "nombre": "19-discutiste-padre", "fuente": "antes",
        "hook": "Le colgaste el teléfono a tu viejo. Van 6 horas de silencio.",
        "dato": {"numero": 6, "sufijo": " horas", "texto": "Y los dos esperando que llame el otro."},
        "mecanismo": {"tipo": "escalada", "titulo": "Así se estira el silencio",
                       "pasos": ["Primero: que llame él",
                                 "Después: yo tampoco tengo por qué ceder",
                                 "Ya pasaron horas y ninguno afloja"]},
        "capturas": ["Nombrás lo que te dolió de verdad", "Lo separás del orgullo",
                     "Lo llamás vos primero"],
        "cierre": "Un llamado no te hace perder. Te devuelve a tu viejo. Seguime.",
    },
    # 20
    {
        "nombre": "20-nota-mala", "fuente": "decidir",
        "hook": "Te sacaste un 4 y ya sentís que fallaste en todo.",
        "dato": {"numero": 4, "sufijo": "", "texto": "Un número. No un veredicto sobre vos."},
        "mecanismo": {"tipo": "escalada", "titulo": "Así se infla un número",
                       "pasos": ["Primero: me fue mal en un examen",
                                 "Después: soy malo para esto",
                                 "Ya decidiste que sos un fracaso"]},
        "capturas": ["Nombrás qué salió mal, concreto", "Lo separás de quién sos",
                     "Anotás qué hacer distinto"],
        "cierre": "Un 4 se corrige. No te define. Seguime.",
    },
    # 21
    {
        "nombre": "21-jefe-reunion", "fuente": "antes",
        "hook": "Tu jefe dijo una frase hace 2 horas y la seguís repasando.",
        "mecanismo": {"tipo": "camino", "titulo": "Así se arma el bucle",
                       "pasos": ["Dijo algo ambiguo", "Vos lo interpretaste como crítica",
                                 "Lo repasaste toda la tarde",
                                 "Nunca preguntaste qué quiso decir"]},
        "capturas": ["Nombrás la frase exacta, sin agregar nada", "Separás el hecho de tu interpretación",
                     "Le preguntás qué quiso decir"],
        "cierre": "Una frase ambigua no es un veredicto. Preguntá. Seguime.",
    },
    # 22
    {
        "nombre": "22-cancelaron-plan", "fuente": "noche",
        "hook": "Te cancelaron el plan hace 10 minutos y ya te lo tomaste personal.",
        "mensajes": {"contacto": "Ella", "textos": [
            "Che, al final no puedo hoy",
            "Surgió algo, perdón",
            "En serio, no es por vos"]},
        "mecanismo": {"tipo": "escalada", "titulo": "Así se arma el rechazo",
                       "pasos": ["Primero: bueno, tendrá algo",
                                 "Después: seguro no le importa verme",
                                 "Ya decidiste que te está evitando"]},
        "capturas": ["Nombrás lo que sentiste, no lo que inventaste", "Lo separás de la excusa real",
                     "Proponés otra fecha, sin drama"],
        "cierre": "Un plan cancelado no es un rechazo. Es un plan cancelado. Seguime.",
    },
    # 23
    {
        "nombre": "23-cancelaste-ansiedad", "fuente": "respirar",
        "hook": "Cancelaste el plan por ansiedad. Es la 2da vez esta semana.",
        "dato": {"numero": 2, "sufijo": "da vez", "texto": "Esta semana que cancelás algo así."},
        "mecanismo": {"tipo": "escalada", "titulo": "Así se achica tu semana",
                       "pasos": ["Primero: hoy no tengo ganas",
                                 "Después: mejor cancelo, así no arriesgo",
                                 "Ya cancelaste dos planes esta semana"]},
        "capturas": ["Nombrás qué te dio miedo, concreto", "Bajás el cuerpo antes de decidir",
                     "Confirmás el próximo plan, aunque cueste"],
        "cierre": "Cancelaste hoy. Te alivia ahora, te achica la semana. Seguime.",
    },
    # 24
    {
        "nombre": "24-mentira-boludez", "fuente": "persona",
        "hook": "Le mentiste por una boludez hace 3 días y no lo podés soltar.",
        "mensajes": {"contacto": "Vos", "textos": [
            "Estaba en el gimnasio jaja",
            "Sí sí, todo bien",
            "Nada raro, ¿por?"]},
        "mecanismo": {"tipo": "escalada", "titulo": "Así pesa una mentira chica",
                       "pasos": ["Primero: fue una boludez, no importa",
                                 "Después: ¿y si se entera y piensa que soy un mentiroso?",
                                 "Ya armaste un escándalo por una frase de nada"]},
        "capturas": ["Nombrás la mentira, tal cual fue", "La separás de lo grave que la sentís",
                     "Decidís si corregirla o soltarla"],
        "cierre": "Una mentira chica no te hace mentiroso. Cortala en la cabeza. Seguime.",
    },
    # 25
    {
        "nombre": "25-confianza-amigo", "fuente": "decidir",
        "hook": "Un amigo te falló 1 vez. Y ya no le creés nada.",
        "mecanismo": {"tipo": "camino", "titulo": "Así se cae la confianza",
                       "pasos": ["Te falló una vez", "Vos generalizaste: es así siempre",
                                 "Empezaste a esperar que falle de nuevo",
                                 "Ahora desconfiás hasta de lo que no pasó"]},
        "capturas": ["Nombrás lo que pasó, un hecho", "Lo separás de lo que temés que pase",
                     "Hablás con él, no con tu cabeza"],
        "cierre": "Una falla no es un patrón. Hablalo antes de decidir. Seguime.",
    },
    # 26
    {
        "nombre": "26-celos-sin-motivo", "fuente": "noche",
        "hook": "Te pusiste celoso por algo que no pasó. Van 3 veces este mes.",
        "dato": {"numero": 0, "sufijo": "", "texto": "Pruebas reales que tenés. Cero."},
        "mecanismo": {"tipo": "escalada", "titulo": "Así se infla el celos",
                       "pasos": ["Primero: tardó en contestar",
                                 "Después: seguro está con alguien",
                                 "Ya armaste una escena que no pasó"]},
        "capturas": ["Nombrás qué disparó esto, concreto", "Lo separás de lo que imaginaste",
                     "Le contás lo que sentís, sin acusar"],
        "cierre": "Sin pruebas, es tu cabeza. Nombralo y soltalo. Seguime.",
    },
    # 27
    {
        "nombre": "27-oportunidad-miedo", "fuente": "respirar",
        "hook": "Dejaste pasar la oportunidad hace 1 semana y seguís pensando en eso.",
        "mecanismo": {"tipo": "camino", "titulo": "Así se pierde una oportunidad",
                       "pasos": ["Apareció la chance", "Pensaste en todo lo que podía salir mal",
                                 "No hiciste nada hasta que se cerró",
                                 "Ahora la repasás como si volviera"]},
        "capturas": ["Nombrás qué es lo que más temías", "Lo separás de lo que realmente pasó",
                     "Preparás la próxima, no la que ya pasó"],
        "cierre": "Dejaste pasar esa. La próxima no tiene por qué. Seguime.",
    },
]


def narracion_mecanismo(m):
    if m["tipo"] in ("escalada", "camino"):
        return " ".join(m["pasos"])
    return ""


def armar(g):
    segs = []
    hook_dur = 1.8
    segs.append({
        "formato": "declaracion", "texto": g["hook"], "duracion": hook_dur,
        "hook": "impacto", "sfx": "impacto", "narracion": g["hook"],
    })

    if "dato" in g:
        d = g["dato"]
        segs.append({
            "formato": "dato_duro", "numero": d["numero"], "sufijo": d["sufijo"],
            "texto": d["texto"], "duracion": 1.6, "transicion": "punch",
            "narracion": f"{d['numero']}{d['sufijo']}. {d['texto']}",
        })

    if "mensajes" in g:
        mm = g["mensajes"]
        msjs = [{"texto": t, "emisor": "otro"} for t in mm["textos"]]
        segs.append({
            "formato": "mensajes", "contacto": mm["contacto"], "mensajes": msjs,
            "duracion": 3.0, "transicion": "corte_duro",
        })

    m = g["mecanismo"]
    dur_mec = 3.1 if m["tipo"] == "escalada" else 3.3
    seg_mec = {
        "formato": m["tipo"], "texto": m["titulo"], "pasos": m["pasos"],
        "duracion": dur_mec, "transicion": "whip", "narracion": narracion_mecanismo(m),
    }
    segs.append(seg_mec)

    segs.append({
        "formato": "declaracion", "texto": "Así se corta", "mayus": False,
        "duracion": 1.5, "quiebre_capitulo": True, "transicion": "quiebre",
    })

    segs.extend(cap_segmentos(g["fuente"], g["capturas"]))

    segs.append({
        "formato": "cta", "texto": g["cierre"], "mayus": True, "duracion": 2.4,
        "hook": "impacto", "sfx": "impacto", "transicion": "corte_duro",
        "narracion": g["cierre"],
    })

    lineas = [g["hook"]]
    if "dato" in g:
        d = g["dato"]
        lineas.append(f"{d['numero']}{d['sufijo']}. {d['texto']}")
    if "mensajes" not in g:
        lineas.append(narracion_mecanismo(m))
    lineas.append(g["cierre"])

    cfg = {
        "tema": g["hook"], "topico_marca": "nuevo-C",
        "captura_fuente": CAPTURAS[g["fuente"]],
        "fps": 30, "camara": 1.0, "loop": True, "paleta": PALETA,
        "segmentos": segs,
        "elevenlabs": {
            "instrucciones": (
                f"Lineas de narracion para {g['nombre']} (hook, dato/mensajes, "
                "mecanismo, cierre -- las capturas van sin voz). Generar audios "
                f"en ElevenLabs, guardarlos como {g['nombre']}-vozN.mp3 en "
                "capturas_voz/ segun el indice del segmento, correr "
                "sincronizar_voz.py despues."),
            "lineas": lineas,
        },
    }
    return cfg


def main():
    for g in GUIONES:
        cfg = armar(g)
        out = RAIZ / f"{g['nombre']}.json"
        out.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Escrito {out.name}")


if __name__ == "__main__":
    main()
