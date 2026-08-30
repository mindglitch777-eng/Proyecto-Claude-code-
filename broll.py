#!/usr/bin/env python3
"""
Reglas semanticas del B-roll (§12) y escalera de fallback (§13).

EL PROBLEMA QUE RESUELVE
    Al renderizar la idea "Él contesta en 2 minutos, ya tiene el
    número", los cuatro planos que salieron fueron: un cuaderno con
    texto en ingles, un flatlay de cafe, una mano metiendo algo en una
    persiana y un menu de restaurante con cubiertos dibujados. Nada que
    ver con la frase.

    No fue mala suerte: el sistema pedia una foto por plano y usaba lo
    que Pexels devolviera. §2 lo prohibe -- un plano que solo existe
    para que el video se mueva hay que eliminarlo -- y §13 dice que el
    B-roll generico es el ULTIMO recurso, no el primero.

LO QUE ESTE MODULO SI PUEDE HACER
    Decidir, ANTES de bajar nada, si este plano deberia llevar B-roll o
    alguna otra cosa. Esa decision no necesita ver la foto: se toma
    mirando QUE FUNCION cumple el plano y QUE MATERIAL declara la idea.

    - Un plano cuya funcion es "cifra" no se resuelve con una foto: se
      resuelve con un numero grande o un grafico.
    - Un plano cuya funcion es "evidencia" pide una captura, y si no
      hay captura NO se reemplaza por B-roll: se dice que falta.
    - Un plano que muestra una relacion ("esto lleva a esto") se
      resuelve con una silueta o un flujo, no con una foto de alguien
      tecleando.
    - El B-roll queda para lo que si es: contexto y refuerzo emocional.

LO QUE ESTE MODULO NO PUEDE HACER, Y HAY QUE DECIRLO
    No puede juzgar si UNA FOTO CONCRETA corresponde a una frase. Eso
    es comprension de imagen y necesita un modelo de vision, que este
    pipeline no tiene. Lo que hace es reducir mucho la cantidad de
    planos que dependen de esa comprension, y marcar los que quedan
    para que una persona los revise (ver 'revisar').
"""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent

# §12. Que funcion cumple el plano. Es obligatoria: sin funcion
# declarada el plano no deberia existir (§2).
FUNCIONES = {
    "cifra":        "mostrar un numero y que se lea",
    "evidencia":    "probar una afirmacion con material verificable",
    "relacion":     "mostrar que una cosa lleva a otra",
    "comparacion":  "poner dos cosas al lado",
    "proceso":      "mostrar los pasos de algo",
    "contexto":     "situar donde pasa",
    "refuerzo":     "acompañar emocionalmente lo que dice la voz",
    "sostener":     "mantener la atencion durante una explicacion larga",
}

# §13. La escalera. Para cada funcion, en que orden se intenta
# resolver el plano. 'broll' aparece ULTIMO donde aparece.
ESCALERA = {
    "cifra":       ["numero", "grafico", "tipografia", "silueta"],
    "evidencia":   ["captura", "grafico", "tipografia"],
    "relacion":    ["silueta", "flujo", "tipografia"],
    "comparacion": ["comparacion", "grafico", "tipografia"],
    "proceso":     ["flujo", "silueta", "tipografia"],
    "contexto":    ["captura", "broll", "silueta", "tipografia"],
    "refuerzo":    ["broll", "tipografia", "silueta"],
    "sostener":    ["broll", "parallax", "tipografia"],
}

# Como se traduce cada recurso a una maqueta del animador.
MAQUETA = {
    "numero": "dato_duro", "grafico": "grafico", "tipografia": "cascada",
    "silueta": "silueta", "captura": "prueba", "flujo": "flujo",
    "comparacion": "comparacion", "broll": None,   # None = plano con foto
    "parallax": "parallax",
}

# Que material tiene que traer la idea para que ese recurso sea posible.
NECESITA_MATERIAL = {
    # Un numero solo sirve cuando hay UNA cifra. Si el plano declara
    # varias filas de datos, el numero suelto pierde la comparacion,
    # que es justamente lo que hay que mostrar: ahi manda el grafico.
    "numero": lambda g: (bool((g.get("cifra") or {}).get("valor"))
                         and len(g.get("datos") or []) < 2),
    "grafico": lambda g: bool(g.get("datos")),
    "captura": lambda g: bool((g.get("evidencia") or {}).get("imagen")),
    "comparacion": lambda g: len(g.get("texto") or g.get("lineas") or []) >= 2,
    "flujo": lambda g: len(g.get("texto") or g.get("lineas") or []) >= 2,
    "silueta": lambda g: bool(g.get("figuras")),
    "tipografia": lambda g: bool(g.get("texto") or g.get("lineas")),
    "broll": lambda g: bool(g.get("necesita")),
    "parallax": lambda g: bool(g.get("necesita")),
}


def resolver(plano, idea, preferencias=None, prohibidos=()):
    """(recurso, maqueta, motivo). Baja la escalera de la funcion del
    plano hasta encontrar un recurso que el material declarado permita.

    'idea' es el golpe/idea al que pertenece el plano: de ahi salen la
    cifra, la evidencia, las figuras y las consultas de metraje.

    'preferencias' es {funcion: recurso} del LENGUAJE visual: DATA
    prefiere resolver un contexto con tipografia antes que con una
    foto; CINEMATIC prefiere sostener con parallax. Sin esto los seis
    lenguajes producian exactamente el mismo guion, porque la escalera
    sola no sabe nada de estilo.

    'prohibidos' son recursos que ese lenguaje no usa nunca -- BRUTAL
    no lleva fotos, asi que 'broll' no entra en su escalera."""
    funcion = plano.get("funcion")
    if not funcion:
        return None, None, ("§2: el plano no declara funcion. Un plano que "
                            "solo existe para que el video se mueva se elimina.")
    if funcion not in FUNCIONES:
        return None, None, (f"funcion '{funcion}' desconocida. Validas: "
                            f"{', '.join(FUNCIONES)}")
    fuente = dict(idea or {})
    fuente.update({k: v for k, v in plano.items() if v is not None})
    orden = [r for r in ESCALERA[funcion] if r not in prohibidos]
    # La preferencia del lenguaje se pone PRIMERA, no reemplaza la
    # escalera: si el material no la permite, se sigue bajando igual.
    pref = (preferencias or {}).get(funcion)
    if pref and pref in orden:
        orden = [pref] + [r for r in orden if r != pref]
    for recurso in orden:
        prueba = NECESITA_MATERIAL.get(recurso)
        if prueba and prueba(fuente):
            return recurso, MAQUETA[recurso], (
                f"funcion '{funcion}' -> {recurso}"
                + (" (ultimo recurso de la escalera)"
                   if recurso == orden[-1] else ""))
    return None, None, (
        f"funcion '{funcion}': ningun recurso de la escalera "
        f"({' -> '.join(orden)}) tiene material declarado. "
        f"Falta cifra, datos, captura, figuras o texto.")


def auditar(guion):
    """Revisa un guion compilado y devuelve los problemas de §12/§13.
    No modifica nada: informa."""
    problemas, avisos, resumen = [], [], {"planos": 0, "broll": 0,
                                          "sin_funcion": 0, "revisar": 0}
    for i, seg in enumerate(guion.get("segmentos", [])):
        # Un segmento PROMOVIDO ya salio de la escena porque su funcion
        # no se resolvia con B-roll: cuenta como un recurso propio, no
        # como cero. Sin esto el porcentaje de B-roll salia inflado --
        # decia 100% cuando dos de siete recursos ya eran grafico y
        # silueta.
        if seg.get("_recurso") and seg.get("_recurso") not in ("broll", "parallax"):
            resumen["planos"] += 1
            continue
        planos = seg.get("planos") or ([seg] if seg.get("necesita") else [])
        for k, p in enumerate(planos):
            resumen["planos"] += 1
            fn = p.get("funcion")
            if not fn:
                resumen["sin_funcion"] += 1
                avisos.append(f"idea {i} plano {k}: sin funcion declarada (§12)")
                continue
            recurso, _, motivo = resolver(p, seg)
            if recurso is None:
                problemas.append(f"idea {i} plano {k}: {motivo}")
            elif recurso in ("broll", "parallax"):
                resumen["broll"] += 1
                if fn in ("cifra", "evidencia", "relacion", "comparacion"):
                    problemas.append(
                        f"idea {i} plano {k}: funcion '{fn}' resuelta con "
                        f"B-roll. §13 lo pone de ULTIMO recurso.")
                else:
                    resumen["revisar"] += 1
    # El porcentaje crudo de B-roll no es la medida correcta: para
    # 'contexto', 'refuerzo' y 'sostener' el B-roll ES la respuesta de
    # la escalera, no una falla. Lo que §2 pregunta es otra cosa:
    # cuantos planos APORTAN INFORMACION PROPIA. Un video donde ningun
    # plano muestra una cifra, una prueba o una relacion es un video de
    # puro ambiente, por mas que cada plano este bien resuelto.
    if resumen["planos"]:
        aporta = resumen["planos"] - resumen["broll"]
        resumen["aportan_informacion"] = aporta
        if aporta == 0:
            avisos.append(
                "Ningun plano aporta informacion propia: son todos "
                "contexto, refuerzo o sostener. §2 pide que cada plano "
                "cumpla una funcion; si ninguno muestra una cifra, una "
                "prueba o una relacion, el video es puro ambiente.")
        elif aporta / resumen["planos"] < 0.25:
            avisos.append(
                f"Solo {aporta} de {resumen['planos']} recursos aportan "
                f"informacion propia. El resto es ambiente. No es un error, "
                f"pero conviene mirarlo (§2).")
    return problemas, avisos, resumen


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\nUso: python3 broll.py guiones/x.json")
        print("\nFUNCIONES y su escalera (§13):")
        for f, desc in FUNCIONES.items():
            print(f"  {f:12} {desc}")
            print(f"  {'':12} -> {' -> '.join(ESCALERA[f])}")
        return 0
    g = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    problemas, avisos, r = auditar(g)
    print(f"{r['planos']} planos | {r['broll']} con B-roll "
          f"({100*r['broll']/max(1,r['planos']):.0f}%) | "
          f"{r['sin_funcion']} sin funcion | {r['revisar']} a revisar a ojo\n")
    for p in problemas:
        print(f"  X {p}")
    for a in avisos:
        print(f"  ! {a}")
    if not problemas and not avisos:
        print("  Sin problemas de §12/§13.")
    return 1 if problemas else 0


if __name__ == "__main__":
    sys.exit(main())
