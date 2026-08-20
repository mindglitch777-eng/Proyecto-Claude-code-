#!/usr/bin/env python3
"""
Genera el lote 2 de guiones (topicos 3,7,8,10,11,12,13,14,15 de MARCA.md)
con campo 'narracion' listo para pegar en ElevenLabs por segmento.

Reusa las 5 capturas reales ya grabadas (capturar_producto.py) mapeadas
al flujo tematicamente mas cercano -- no se grabaron capturas nuevas.

Uso:
    python3 guiones/generar_lote2.py
"""
import json
from pathlib import Path

PALETA = {"fondo": [15, 15, 16], "texto": [242, 239, 233], "destacado": [74, 222, 128]}

# (archivo, topico_marca, tema, flujo_real,
#  hook_texto, hook_hook_fx, hook_karaoke,
#  error_formato_y_campos,
#  mecanismo_formato_y_campos,
#  captura_archivo, cap_a_rango, cap_a_texto, cap_b_rango, cap_b_texto,
#  loop_texto, loop_hook_fx)
VIDEOS = [
    dict(
        archivo="07-acordas-hace-anios.json", topico=3,
        tema="Te acordas de algo que dijiste hace anios",
        flujo_real="dx('pasado') -> 'Si, hay algo concreto' -> sesion 'accion' (misma que topico 2).",
        hook_texto="Hace 3 años dijiste algo raro. Todavía te perseguís por eso.",
        hook_fx="glitch",
        error=dict(formato="dato_duro", numero=3, texto="años y todavía te lo repetís",
                    duracion=2.3, transicion="punch"),
        mecanismo=dict(formato="cronologia", texto="Así se guarda un recuerdo incómodo",
                        hitos=["Ese día", "1 mes", "1 año", "Hoy"],
                        valores=["100%", "60%", "20%", "0%"],
                        duracion=3.8, transicion="barrido"),
        captura="capturas/captura-persona.mp4",
        cap_a=(0.0, 3.0, "No es que lo sigas pagando."),
        cap_b=(3.0, 6.0, "Es que nunca lo etiquetaste. Un verbo, listo."),
        loop_texto="Hace 3 años. Hoy lo etiquetás y sigue. Seguime.",
        loop_fx="zoom_golpe",
    ),
    dict(
        archivo="08-alguien-dijo-hace-dias.json", topico=7,
        tema="Alguien te dijo algo hace dias y sigue dando vueltas",
        flujo_real="dx('difuso') -> 'Hace semanas, se repite' -> sesion 'cita' (horario fijo para pensarlo).",
        hook_texto="Te dijo algo hace 4 días y no lo soltás.",
        hook_fx="flash",
        error=dict(formato="dato_duro", numero=4, texto="días repitiendo la misma frase",
                    duracion=2.3, transicion="whip"),
        mecanismo=dict(formato="panel", texto="No es la frase. Es el horario libre que le diste",
                        datos=[["Sin horario", "24/7"], ["Con horario", "20 min"],
                               ["Ahorro", "23h 40m"], ["Costo", "0"]],
                        duracion=4.0, transicion="slide"),
        captura="capturas/captura-respirar.mp4",
        cap_a=(0.0, 2.2, "Le das un horario fijo."),
        cap_b=(2.2, 5.2, "Fuera de ese horario, no se piensa. Se corta."),
        loop_texto="4 días dándole vueltas. Le pusiste horario. Seguime.",
        loop_fx="sacudida",
    ),
    dict(
        archivo="09-celular-pareja.json", topico="nuevo-A",
        tema="Le revisaste el celular a tu pareja a las 3 AM",
        flujo_real="dx('difuso') -> 'La cabeza no para y no se por que' -> sesion 'interrump' (cortar el circuito).",
        hook_texto="Le revisaste el celular a las 3 AM. Otra vez.",
        hook_fx="glitch",
        error=dict(formato="dato_duro", numero=3, texto="AM. La tercera vez esta semana",
                    duracion=2.3, transicion="punch"),
        mecanismo=dict(formato="division", texto="",
                        izquierda={"titulo": "LO QUE VISTE", "texto": "Nada raro, en realidad", "valor": "0"},
                        derecha={"titulo": "LO QUE ARMASTE", "texto": "Una historia completa", "valor": "1"},
                        duracion=4.0, transicion="barrido"),
        captura="capturas/captura-noche.mp4",
        cap_a=(0.0, 3.0, "Primero cortás el circuito."),
        cap_b=(3.0, 6.0, "Cambiás de lugar. Ahora, no a las 3 AM."),
        loop_texto="El celular, guardado. Vos, tranquilo. Seguime.",
        loop_fx="sacudida",
    ),
    dict(
        archivo="10-carga-para-otros.json", topico="nuevo-B",
        tema="Sentis que sos una carga para la gente que queres",
        flujo_real="ver('meditar') -> observar el pensamiento sin perseguirlo, sin pelearlo.",
        hook_texto="Cancelaste un plan. Pensaste: se van a cansar de mí.",
        hook_fx="flash",
        error=dict(formato="dato_duro", numero=1, texto="plan cancelado no es una carga. Es un dato",
                    duracion=2.6, transicion="whip"),
        mecanismo=dict(formato="pregunta",
                        pregunta="Eso lo penso la otra persona o lo pensas vos por ella?",
                        respuesta="Nunca lo preguntaste. Solo lo diste por hecho.",
                        texto="", duracion=4.2, transicion="dip"),
        captura="capturas/captura-respirar.mp4",
        cap_a=(0.0, 2.2, "No se trata de pelear el pensamiento."),
        cap_b=(2.2, 5.0, "Se trata de mirarlo pasar, sin subirte."),
        loop_texto="Cancelaste un plan. Eso es todo. Seguime.",
        loop_fx="persiana",
    ),
    dict(
        archivo="11-obsesion-error-trabajo.json", topico=11,
        tema="Te obsesionaste con un error del trabajo",
        flujo_real="dx('pasado') -> 'Si, hay algo concreto' -> sesion 'accion'.",
        hook_texto="Un error del laburo, hace 2 semanas. Seguís ahí.",
        hook_fx="glitch",
        error=dict(formato="dato_duro", numero=2, texto="semanas por un error que ya pasó",
                    duracion=2.3, transicion="punch"),
        mecanismo=dict(formato="alerta",
                        texto="Repasarlo mil veces no lo corrige. Solo lo revive",
                        duracion=3.8, transicion="dip"),
        captura="capturas/captura-persona.mp4",
        cap_a=(0.0, 3.0, "Un verbo. Un cuando."),
        cap_b=(3.0, 6.0, "Si toma menos de 10 minutos, se hace ya."),
        loop_texto="El error, 2 semanas atrás. Vos, hoy. Seguime.",
        loop_fx="sacudida",
    ),
    dict(
        archivo="11b-no-dijiste-antes.json", topico="nuevo-C",
        tema="No le dijiste algo antes de que se fuera de tu vida",
        flujo_real="ver('expresar') -> 4 preguntas -> arma el mensaje real (aunque no se pueda mandar).",
        hook_texto="No se lo dijiste. Y ya no está para escucharlo.",
        hook_fx="flash",
        error=dict(formato="dato_duro", numero=1, texto="cosa que no dijiste. La única que importaba",
                    duracion=2.6, transicion="dip"),
        mecanismo=dict(formato="cita",
                        texto="Sufrimos mas en la imaginacion que en la realidad",
                        autor="Seneca", duracion=3.6, transicion="fade"),
        captura="capturas/captura-antes.mp4",
        cap_a=(0.0, 2.6, "Se escribe igual. No para mandarlo."),
        cap_b=(2.6, 4.8, "Para que quede dicho en algún lado, no solo en tu cabeza."),
        loop_texto="No se lo dijiste. Ahora sí, aunque sea acá. Seguime.",
        loop_fx="persiana",
    ),
    dict(
        archivo="13-te-comparas.json", topico=13,
        tema="Te comparas con alguien y no podes parar",
        flujo_real="ver('meditar') -> observar los pensamientos sin perseguirlos.",
        hook_texto="Mirás su perfil y te comparás. Van 20 minutos.",
        hook_fx="glitch",
        error=dict(formato="dato_duro", numero=20, texto="minutos mirando una vida editada",
                    duracion=2.4, transicion="punch"),
        mecanismo=dict(formato="division", texto="",
                        izquierda={"titulo": "SU PERFIL", "texto": "Lo que elige mostrar", "valor": "5%"},
                        derecha={"titulo": "SU VIDA", "texto": "Lo que no ves nunca", "valor": "95%"},
                        duracion=4.0, transicion="slide"),
        captura="capturas/captura-respirar.mp4",
        cap_a=(0.0, 2.2, "No se trata de dejar la mente en blanco."),
        cap_b=(2.2, 5.0, "Se trata de mirar el pensamiento pasar, sin subirte."),
        loop_texto="20 minutos comparando. Ya los cortaste. Seguime.",
        loop_fx="persiana",
    ),
    dict(
        archivo="14-dijiste-si-querias-no.json", topico=14,
        tema="Dijiste que si y querias decir que no",
        flujo_real="ver('decidir') -> escribís la decisión -> 'decido ahora'.",
        hook_texto="Dijiste que sí. Querías decir que no. Ya pasaron 2 días.",
        hook_fx="sacudida",
        error=dict(formato="dato_duro", numero=2, texto="días de sí, cuando era no",
                    duracion=2.3, transicion="whip"),
        mecanismo=dict(formato="pregunta",
                        pregunta="Te falta un dato para volver atras o te falta animarte?",
                        respuesta="Si no falta un dato, ya podes decirlo.",
                        texto="", duracion=4.2, transicion="dip"),
        captura="capturas/captura-decidir.mp4",
        cap_a=(0.0, 2.6, "Escribís lo que pasó. Un toque."),
        cap_b=(2.6, 5.3, "Otro toque. Queda cerrado, sin reabrirlo."),
        loop_texto="Dijiste que sí. Ahora decís lo que es. Seguime.",
        loop_fx="flash",
    ),
    dict(
        archivo="15-enteraste-por-terceros.json", topico=15,
        tema="Te enteraste de algo por terceros",
        flujo_real="dx('noche') o dx('difuso') -> sesion 'nocturno'/'interrump' segun el momento.",
        hook_texto="Te enteraste por otra persona, no por él. Van 3 días dándole vueltas.",
        hook_fx="glitch",
        error=dict(formato="dato_duro", numero=3, texto="días dándole vueltas a algo que no viste",
                    duracion=2.4, transicion="punch"),
        mecanismo=dict(formato="cronologia", texto="Lo que sabés vs. lo que armaste solo",
                        hitos=["Lo que dijo el tercero", "Lo que imaginaste", "Lo que sabés real", "Hoy"],
                        valores=["1 dato", "9 versiones", "1 dato", "0 nuevos"],
                        duracion=4.2, transicion="barrido"),
        captura="capturas/captura-noche.mp4",
        cap_a=(0.0, 3.0, "A esta hora no se decide nada."),
        cap_b=(3.0, 6.0, "Anotalo. Mañana, con un dato real, se resuelve."),
        loop_texto="Te enteraste por un tercero. Mañana hablás vos. Seguime.",
        loop_fx="sacudida",
    ),
]


def narracion_de(seg):
    """Lo que se dice en voz alta -- por defecto el texto visible, salvo
    en formatos donde el texto vive en otro campo (pregunta, division)."""
    fmt = seg.get("formato")
    if fmt == "pregunta":
        return (seg.get("pregunta", "") + " ... " + seg.get("respuesta", "")).strip()
    if fmt == "division":
        izq, der = seg.get("izquierda", {}), seg.get("derecha", {})
        return (f"{izq.get('titulo', '')}: {izq.get('texto', '')}. "
                f"{der.get('titulo', '')}: {der.get('texto', '')}.").strip()
    return seg.get("texto", "")


def construir(v):
    segs = []

    hook = {"formato": "declaracion", "texto": v["hook_texto"], "duracion": 2.0,
            "hook": v["hook_fx"], "karaoke": True}
    hook["narracion"] = v["hook_texto"]
    segs.append(hook)

    err = dict(v["error"])
    err["narracion"] = narracion_de(err)
    segs.append(err)

    mec = dict(v["mecanismo"])
    mec["narracion"] = narracion_de(mec)
    segs.append(mec)

    t0, t1, texto_a = v["cap_a"]
    segs.append({"captura": v["captura"], "recorte": [t0, t1], "texto": texto_a,
                 "duracion": round(t1 - t0, 2), "transicion": "corte_duro"})
    t0b, t1b, texto_b = v["cap_b"]
    segs.append({"captura": v["captura"], "recorte": [t0b, t1b], "texto": texto_b,
                 "duracion": round(t1b - t0b, 2), "transicion": "punch"})

    loop = {"formato": "declaracion", "texto": v["loop_texto"], "duracion": 2.3,
            "transicion": "fade", "hook": v["loop_fx"], "narracion": v["loop_texto"]}
    segs.append(loop)

    return {
        "tema": v["tema"], "topico_marca": v["topico"],
        "captura_fuente": v["captura"], "flujo_real": v["flujo_real"],
        "fps": 30, "camara": 1.0, "loop": True, "paleta": PALETA,
        "segmentos": segs,
        "elevenlabs": {
            "instrucciones": (
                "4 lineas de narracion por video (hook, error, mecanismo, "
                "loop -- los 2 segmentos de captura real van sin voz, el "
                "producto se muestra sin explicarse encima). Generar 4 "
                "audios separados en ElevenLabs con estas lineas, en este "
                "orden, y guardarlos como "
                f"{Path(v['archivo']).stem}-voz0.mp3 (hook), -voz1.mp3 "
                "(error), -voz2.mp3 (mecanismo), -voz5.mp3 (loop) en "
                "capturas_voz/. Correr sincronizar_voz.py despues."
            ),
            "lineas": [hook["narracion"], err["narracion"], mec["narracion"],
                       loop["narracion"]],
        },
    }


def main():
    out_dir = Path(__file__).parent
    for v in VIDEOS:
        cfg = construir(v)
        path = out_dir / v["archivo"]
        path.write_text(json.dumps(cfg, indent=2, ensure_ascii=False) + "\n",
                          encoding="utf-8")
        print("escrito:", path)


if __name__ == "__main__":
    main()
