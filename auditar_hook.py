#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Auditoria del HOOK — punto de control 1 (§3) de la mejora controlada.

Puntua SOLO el hook. Es a proposito: la fase 2 toca unicamente los
primeros dos segundos, y una nota global que mezcle trece dimensiones
no deja ver si el cambio del hook sirvio o no. Las otras doce
dimensiones de §18 son la fase 11.

La nota tiene dos mitades, y no valen lo mismo:

  ESTRUCTURA (0-10)  se verifica. Sale del segmento ya compilado y, si
                     se le pasa un mp4, de los cuadros reales. "Hay
                     texto en el cuadro cero" es un hecho, no una
                     opinion.

  TEXTO (0-10)       son proxies lexicos, igual que motor/hooks.py:
                     cuentan rasgos de la frase, no adivinan el
                     resultado. Se informan, no se creen del todo.

Uso:
    python3 auditar_hook.py contenido/nombre-por-pais.json
    python3 auditar_hook.py contenido/nombre-por-pais.json --video v.mp4
    python3 auditar_hook.py contenido/*.json --json
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import estilos                                    # noqa: E402
from motor import hooks as HK                     # noqa: E402

# Consecuencia: que le pasa al que mira si esto es cierto. Sin esto el
# hook es una curiosidad, no un motivo para quedarse.
CONSECUENCIA = (
    "no te", "no vende", "no exist", "no lo encuentr", "no te encuentr",
    "perdes", "pierde", "te cuesta", "cuesta", "termina", "queda afuera",
    "se va", "no compra", "no llega", "por eso", "y aun asi", "igual",
    "sin que", "y no ",
)
# B-roll que no dice nada: si el hook abre con esto, §3 lo prohibe.
GENERICO = (
    "typing", "laptop", "keyboard", "office", "working", "business",
    "meeting", "handshake", "coffee", "desk", "computer screen",
    "entrepreneur", "person walking", "city street",
)


def _n(t):
    t = t.lower()
    for a, b in zip("áéíóúüñ", "aeiouun"):
        t = t.replace(a, b)
    return t


def _c(v, tope=2.0):
    return max(0.0, min(tope, round(float(v), 2)))


# --------------------------------------------------------------- texto
def puntuar_texto(lineas, narracion=""):
    """Los cuatro elementos de §3, 0-2 cada uno. Proxies lexicos."""
    crudo = " ".join(lineas) + " " + (narracion or "")
    t = _n(crudo)
    palabras = crudo.split()

    confl = sum(1 for m in HK.CONFLICTO if m in t)
    abre = sum(1 for m in HK.ABRE_BUCLE if m in t)
    cierra = any(c in t for c in HK.CIERRA)
    cifra = bool(re.search(r"\d", crudo))
    # nombre propio: mayuscula que no arranca linea
    propio = 0
    for ln in lineas + [narracion or ""]:
        propio += sum(1 for p in ln.split()[1:] if p[:1].isupper())
    cons = sum(1 for m in CONSECUENCIA if m in t)

    d = {
        "conflicto": _c(1.1 * confl),
        # una pregunta explicita tambien abre bucle, pero vale menos que
        # una afirmacion que deja el hueco solo
        "curiosidad": _c(1.0 * abre + (0.8 if crudo.strip().endswith("?") else 0)
                         - (1.5 if cierra else 0)),
        "especificidad": _c(1.0 * cifra + 0.7 * min(2, propio)),
        "consecuencia": _c(1.0 * cons),
    }
    d["_total"] = round(sum(d.values()) / 8 * 10, 1)
    d["_detalle"] = {
        "marcas_conflicto": confl, "abre_bucle": abre, "cierra_bucle": cierra,
        "tiene_cifra": cifra, "nombres_propios": propio,
        "marcas_consecuencia": cons,
    }
    return d


# ---------------------------------------------------------- estructura
def puntuar_estructura(seg, lineas):
    """§3 VISUAL DEL HOOK y REGLA DE 0-2 SEGUNDOS. Verificable."""
    entra = seg.get("entra") or []
    planos = seg.get("planos") or []
    micro = bool(seg.get("hook_microestados"))
    hay_t0 = bool(entra) and entra[0] <= 1e-3

    # 1. El primer cuadro es legible sin audio (0-3)
    #    Un flash o un zoom grande lo borran igual que no tener texto.
    hk = seg.get("hook")
    lava = bool(seg.get("flash")) or hk == "impacto"
    primer = 3.0
    if not (hay_t0 and micro):
        primer -= 2.0
    if lava:
        primer -= 1.5

    # 2. No abre con B-roll generico (0-2)
    consulta = _n(str(planos[0].get("necesita", ""))) if planos else ""
    generico = any(g in consulta for g in GENERICO)
    if not planos:
        broll = 2.0                     # cuadro plano: composicion simple
    elif generico:
        broll = 0.0
    else:
        broll = 1.2

    # 3. Microestados 0-2s (0-3)
    dentro = [e for e in entra if e <= 2.0]
    if not micro:
        estados = 0.5
    elif len(entra) == 1:
        estados = 2.5                   # una sola linea: todo es impacto
    else:
        estados = 1.0 + 1.0 * (len(dentro) >= 2) + 1.0 * (len(dentro) == len(entra))

    # 4. Legibilidad movil (0-2)
    largo = max((len(l) for l in lineas), default=0)
    tam = int(seg.get("cascada_tam", 78))
    movil = 2.0
    if largo > 20:
        movil -= 1.0
    if largo > 26:
        movil -= 0.5
    if tam < 78:
        movil -= 0.5

    d = {"primer_cuadro": round(max(0.0, primer), 2),
         "sin_broll_generico": round(broll, 2),
         "microestados": round(estados, 2),
         "legibilidad_movil": round(max(0.0, movil), 2)}
    d["_total"] = round(sum(d.values()) / 10 * 10, 1)
    d["_detalle"] = {
        "linea_en_t0": hay_t0, "microestados": micro, "lava_primer_cuadro": lava,
        "entra": entra, "planos_hook": len(planos),
        "consulta_broll": consulta or None, "broll_generico": generico,
        "linea_mas_larga": largo, "cascada_tam": tam,
        "duracion_hook": seg.get("duracion"),
    }
    return d


# ------------------------------------------------------- cuadros reales
def medir_video(path, hasta=2.0, fps=30):
    """Tinta clara por cuadro en los primeros segundos de un mp4 ya
    renderizado. Es la unica medicion que no depende de lo que yo crea
    que el motor hace."""
    try:
        from PIL import Image
    except ImportError:
        return None
    n = int(hasta * fps)
    with tempfile.TemporaryDirectory() as tmp:
        r = subprocess.run(
            ["ffmpeg", "-v", "error", "-i", path,
             "-vf", f"select='lt(n,{n})'", "-vsync", "0",
             os.path.join(tmp, "f%03d.png")],
            capture_output=True)
        if r.returncode != 0:
            return None
        filas = []
        for i, f in enumerate(sorted(Path(tmp).glob("*.png"))):
            im = Image.open(f).convert("L")
            w, h = im.size
            px = im.load()
            tot = claro = suma = 0
            for y in range(int(h * 0.08), int(h * 0.80), 3):
                for x in range(0, w, 3):
                    v = px[x, y]
                    tot += 1
                    suma += v
                    if v >= 200:
                        claro += 1
            filas.append({"cuadro": i + 1, "t": round(i / fps, 3),
                          "luz": round(suma / tot, 1),
                          "tinta": round(100 * claro / tot, 2)})
    return filas


def auditar(path_contenido, lenguaje=None, video=None):
    c = json.load(open(path_contenido, encoding="utf-8"))
    g = estilos.aplicar_ideas(c, lenguaje or c.get("lenguaje"))
    seg = g["segmentos"][0]
    idea = (c.get("ideas") or [{}])[0]
    lineas = idea.get("lineas") or seg.get("lineas") or []

    txt = puntuar_texto(lineas, idea.get("narracion", ""))
    est = puntuar_estructura(seg, lineas)
    # La estructura pesa mas porque se verifica; el texto es proxy.
    hook = round(est["_total"] * 0.6 + txt["_total"] * 0.4, 1)

    out = {
        "guion": os.path.basename(path_contenido),
        "lenguaje": (lenguaje or c.get("lenguaje") or "").upper(),
        "hook_texto": lineas,
        "HOOK": hook,
        "estructura": est,
        "texto": txt,
        # §18, solo los contadores que dependen del hook
        "contadores": {
            "GENERIC_BROLL_COUNT_hook": int(est["_detalle"]["broll_generico"]),
            "TEXT_CHANGES_0_2s": len([e for e in (seg.get("entra") or [])
                                      if e <= 2.0]),
            "VISUAL_CHANGES_0_2s": len(seg.get("planos") or []),
            "IDEA_COUNT": len(c.get("ideas") or []),
        },
        # §10 de motor/hooks.py, que no se elimina (§2)
        "motor_hooks": HK.puntuar(" ".join(lineas)),
    }
    out["motor_hooks_total"] = HK.total(out["motor_hooks"])
    if video:
        out["cuadros"] = medir_video(video)
    # §19 REGLA DE NO PASAR
    revisar = []
    if hook < 8:
        revisar.append("HOOK < 8")
    if est["legibilidad_movil"] < 1.6:
        revisar.append("MOBILE_READABILITY baja")
    if est["_detalle"]["broll_generico"]:
        revisar.append("el hook abre con B-roll generico")
    if est["primer_cuadro"] < 3:
        revisar.append("el primer cuadro no es legible sin audio")
    out["revisar"] = revisar
    return out


def imprimir(o):
    print(f"\n=== HOOK — {o['guion']} ({o['lenguaje']}) ===")
    print("  " + " / ".join(o["hook_texto"]))
    print(f"\n  HOOK  {o['HOOK']}/10"
          f"   (estructura {o['estructura']['_total']} · "
          f"texto {o['texto']['_total']})")
    print("\n  estructura (verificada)")
    for k in ("primer_cuadro", "sin_broll_generico", "microestados",
              "legibilidad_movil"):
        print(f"    {k:22} {o['estructura'][k]}")
    print("  texto (proxy lexico)")
    for k in ("conflicto", "curiosidad", "especificidad", "consecuencia"):
        print(f"    {k:22} {o['texto'][k]}")
    print("  contadores")
    for k, v in o["contadores"].items():
        print(f"    {k:22} {v}")
    print(f"  motor/hooks.py total  {o['motor_hooks_total']}")
    if o.get("cuadros"):
        print("\n  cuadros reales del render")
        for f in o["cuadros"][:8]:
            print(f"    {f['cuadro']:2d}  t={f['t']:5.3f}s  "
                  f"luz={f['luz']:6.1f}  tinta={f['tinta']:5.2f}%")
    if o["revisar"]:
        print("\n  §19 NO PASAR:")
        for r in o["revisar"]:
            print(f"    - {r}")
    else:
        print("\n  §19: pasa")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("guiones", nargs="+")
    ap.add_argument("--lenguaje")
    ap.add_argument("--video")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    res = [auditar(g, a.lenguaje, a.video) for g in a.guiones]
    if a.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
    else:
        for o in res:
            imprimir(o)


if __name__ == "__main__":
    main()
