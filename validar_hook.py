#!/usr/bin/env python3
"""
Validador de retencion - CERO TOKENS.

Revisa un guion de video contra las reglas de HOOKS.md ANTES de
renderizar. Atrapa fugas de retencion que cuestan alcance real.

Logica determinista. Ningun LLM.

Uso:
    python3 validar_hook.py guion.json
"""

import json
import re
import sys
from pathlib import Path

MAX_BLOQUE_SIN_CAMBIO = 5.0   # regla de los 5 segundos
MAX_SEG_HOOK = 2.5            # el hook tiene que resolverse rapido
MAX_PALABRAS_HOOK = 14        # ~3 segundos hablados

GENERICOS = [
    "no vas a creer", "increible", "mira esto", "esto te va a sorprender",
    "lo que paso despues", "atencion", "mira hasta el final",
]

try:
    # Solo se reusa la normalizacion de tildes de hooks.py, para que
    # las dos herramientas comparen texto igual.
    from hooks import normalizar
except ImportError:
    def normalizar(s):
        return s


def revisar(path):
    p = Path(path)
    if not p.exists():
        print(f"ERROR: no existe '{path}'.")
        return 1
    try:
        cfg = json.loads(p.read_text())
    except json.JSONDecodeError as e:
        print(f"ERROR: JSON invalido -> {e}")
        return 1

    segs = cfg.get("segmentos")
    if not segs:
        print("ERROR: el guion no tiene 'segmentos'.")
        return 1

    problemas, avisos = [], []
    primero = segs[0]
    # El texto visible del hook puede vivir en 'texto' o, en formatos
    # como 'pregunta', en 'pregunta' (lo que se lee primero en pantalla).
    texto1 = primero.get("texto") or primero.get("pregunta", "")
    palabras1 = len(texto1.split())

    # --- Reglas del hook (primer segmento) ---
    fuertes_v9 = ("declaracion", "dato_duro", "alerta", "pregunta", "titular")
    if (primero.get("estilo") not in ("hook", "impacto")
            and primero.get("formato") not in fuertes_v9
            and not primero.get("hook")):
        problemas.append(
            "El primer segmento no usa estilo 'hook'. El frame 1 tiene que "
            "pegar visualmente.")
    if palabras1 > MAX_PALABRAS_HOOK:
        problemas.append(
            f"Hook de {palabras1} palabras (max {MAX_PALABRAS_HOOK}). "
            "No entra en los 3 segundos.")
    if primero.get("duracion", 0) > MAX_SEG_HOOK:
        avisos.append(
            f"El hook dura {primero['duracion']}s. En TikTok el enganche "
            "se decide en 1.3s -- considera acortarlo.")

    bajo = normalizar(texto1.lower())
    for g in GENERICOS:
        if normalizar(g) in bajo:
            problemas.append(
                f"Hook generico detectado: '{g}'. La curiosidad generica se "
                "lee como clickbait; usa curiosidad ESPECIFICA (numeros, "
                "detalles concretos).")
            break

    # Pregunta facil de responder = mata la tension
    if texto1.strip().endswith("?"):
        if re.match(r"^\s*(te gustaria|quieres|sabias|alguna vez)", bajo):
            avisos.append(
                "El hook es una pregunta que el espectador responde mental "
                "al instante. Eso elimina la tension.")

    # Especificidad: numeros o datos concretos ayudan mucho
    if not re.search(r"\d", texto1):
        avisos.append(
            "El hook no tiene ningun numero ni dato especifico. La "
            "especificidad crea autoridad implicita y sube retencion.")

    # --- Regla de los 5 segundos ---
    for i, s in enumerate(segs):
        d = s.get("duracion", 0)
        if d > MAX_BLOQUE_SIN_CAMBIO:
            problemas.append(
                f"Segmento {i+1} dura {d}s sin cambio de escena. "
                "Fuga de retencion: partilo o agrega un pattern interrupt.")

    # --- Transiciones: sin variedad, el cerebro predice y se aburre ---
    trans = [s.get("transicion", "fade") for s in segs[1:]]
    if trans and len(set(trans)) == 1 and len(trans) >= 3:
        avisos.append(
            f"Todas las transiciones son '{trans[0]}'. Variar rompe la "
            "prediccion del cerebro (pattern interrupt).")

    # --- Sin sonido: tiene que funcionar en mute ---
    if not any(s.get("texto") for s in segs):
        problemas.append("Hay segmentos sin texto en pantalla. El video "
                         "tiene que entenderse con el sonido apagado.")

    # --- Vocabulario clinico en CUALQUIER texto visible del video ---
    # No es solo problema del hook: si aparece a mitad de video igual
    # rompe el tono ("herramienta, no consultorio") y la linea etica
    # de no vender un diagnostico.
    def _textos_visibles(s):
        out = [s.get("texto", ""), s.get("pregunta", ""), s.get("respuesta", "")]
        for lado in ("izquierda", "derecha"):
            b = s.get(lado) or {}
            out += [b.get("titulo", ""), b.get("texto", "")]
        for k in ("items", "pasos", "hitos"):
            out += [str(x) for x in s.get(k, [])]
        return normalizar(" ".join(out).lower())

    # NOTA: aca vivia un bloqueo de vocabulario. Se saco por decision
    # del operador: el validador revisa RETENCION (ritmo, duracion,
    # estructura), no decide que se puede decir. Que una palabra
    # convenga o no es criterio editorial, y ese criterio es humano.

    # --- CTA al final ---
    # 'pie' es donde vive el cierre en el formato 'editorial'; 'texto'
    # en todos los demas.
    ultimo_seg = segs[-1]
    ultimo = (ultimo_seg.get("texto", "") + " " + ultimo_seg.get("pie", "")).lower()
    if not any(k in ultimo for k in
               ["segui", "sigue", "guarda", "comenta", "link", "mira", "proba"]):
        avisos.append("El ultimo segmento no tiene llamada a la accion.")

    # --- RITMO DE CORTE (TikTok: 1.5-3s por cambio visual) ---
    lentos = [i + 1 for i, s in enumerate(segs) if s.get("duracion", 0) > 3.2]
    if lentos:
        avisos.append(
            f"Segmentos {lentos} superan 3.2s. El benchmark 2026 es un "
            "cambio visual cada 1.5-3s; mas lento baja la retencion.")

    # --- RITMO VARIADO (el ritmo constante aburre) ---
    durs = [s.get("duracion", 0) for s in segs]
    if len(durs) >= 4 and max(durs) - min(durs) < 0.5:
        avisos.append(
            "Todos los segmentos duran casi lo mismo. El ritmo predecible "
            "genera baja activacion; alterna cortes rapidos y lentos.")

    # --- DURACION TOTAL (bajo 25s = mayor tasa de completado) ---
    dur_tot = sum(durs)
    if dur_tot > 25:
        avisos.append(
            f"Dura {dur_tot:.0f}s. Los videos bajo 20-25s tienen la mayor "
            "tasa de completado y son los mas faciles de loopear.")

    # --- LOOP (cada replay = vista adicional en YouTube) ---
    if not cfg.get("loop"):
        avisos.append(
            "Sin 'loop': true. Un cierre que vuelve al inicio genera "
            "rewatch, y YouTube cuenta cada loop como vista adicional.")
    else:
        prim = segs[0].get("texto", "").lower()[:18]
        ult = segs[-1].get("texto", "").lower()
        if prim and prim.split()[0] not in ult:
            avisos.append(
                "Loop activado pero el ultimo texto no conecta con el "
                "primero. El loop se siente invisible si cierran el mismo "
                "circulo tematico.")

    # --- PAYOFF ADELANTADO ---
    mitad = len(segs) // 2
    payoff_v9 = ("dato_duro", "lista", "division", "ranking", "panel",
                 "cronologia", "galeria", "comparar",
                 "mensajes", "camino", "escalada", "collage")
    if not any(s.get("estilo") in ("contador", "lista") or s.get("grafico")
               or s.get("formato") in payoff_v9
               for s in segs[:max(1, mitad)]):
        avisos.append(
            "No hay payoff visual (grafico, contador o lista) en la primera "
            "mitad. La curva 'meseta' exige valor adelantado.")

    # --- Reporte ---
    dur = sum(s.get("duracion", 0) for s in segs)
    print(f"=== VALIDACION DE RETENCION ===")
    print(f"Duracion total: {dur:.1f}s | Segmentos: {len(segs)}\n")

    if problemas:
        print("PROBLEMAS (arreglar antes de renderizar):")
        for x in problemas:
            print(f"  ✗ {x}")
        print()
    if avisos:
        print("AVISOS (mejorables):")
        for x in avisos:
            print(f"  ! {x}")
        print()
    if not problemas and not avisos:
        print("✓ El guion cumple todas las reglas de retencion.")
        return 0
    return 1 if problemas else 0


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    sys.exit(revisar(sys.argv[1]))


if __name__ == "__main__":
    main()
