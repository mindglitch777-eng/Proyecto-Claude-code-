#!/usr/bin/env python3
"""
Preview: ver los estilos SIN renderizar seis videos.

POR QUE
    Renderizar los seis estilos completos son seis minutos de runner y
    seis archivos que hay que abrir de a uno. Para decidir "este estilo
    va, este no" alcanza con ver UN cuadro representativo de cada uno,
    todos en la misma imagen y al lado.

    Esto es lo que permite revisar calidad ANTES de producir 180 videos.

QUE HACE
    preview estilos       un cuadro de cada estilo, lado a lado
    preview combinaciones estilo x narrativa
    preview hooks         el mismo hook tratado por cada estilo
    preview guion X       la tira de contactos de un guion sin renderizar

Todo sale a previews/ como JPG. Cero video, cero audio, cero ffmpeg.
"""
import argparse
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
SALIDA = RAIZ / "previews"
sys.path.insert(0, str(RAIZ))

import animador_v9 as A          # noqa: E402
import estilos as E              # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402


def _cuadro(seg, cfg, t=1.0, prog=0.5):
    """Un cuadro suelto, sin pasar por el pipeline de video."""
    return A.render(dict(seg), t, prog, dict(cfg))


def _rotular(img, texto, sub=""):
    """Etiqueta arriba del cuadro. Sin esto una grilla de seis cuadros
    parecidos no dice cual es cual."""
    alto = 74 if sub else 52
    tira = Image.new("RGB", (img.width, img.height + alto), (18, 18, 20))
    d = ImageDraw.Draw(tira)
    d.text((16, 12), texto, font=A.fnt(30), fill=(246, 246, 244))
    if sub:
        d.text((16, 46), sub, font=A.fnt(22, ligera=True), fill=(150, 150, 162))
    tira.paste(img, (0, alto))
    return tira


def _grilla(imgs, cols=3, ancho=340):
    esc = ancho / A.W
    alto = 0
    escaladas = []
    for im in imgs:
        e = im.resize((ancho, int(im.height * esc)), Image.LANCZOS)
        escaladas.append(e)
        alto = max(alto, e.height)
    filas = (len(escaladas) + cols - 1) // cols
    m = Image.new("RGB", (cols * (ancho + 8) + 8, filas * (alto + 8) + 8),
                  (10, 10, 12))
    for i, e in enumerate(escaladas):
        m.paste(e, (8 + (i % cols) * (ancho + 8), 8 + (i // cols) * (alto + 8)))
    return m


def _contenido_demo():
    p = RAIZ / "contenido" / "cotizar-tarde.json"
    if p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    return {"tema": "demo", "golpes": [
        {"rol": "hook", "texto": ["El que cobra el doble", "no labura más"],
         "narracion": "El que cobra el doble no labura mas"},
        {"rol": "prueba", "texto": ["67 contra 0.1"],
         "cifra": {"valor": "67", "etiqueta": "VERIFICADO", "fuente": "demo"}},
    ]}


def cmd_estilos(a):
    """Un cuadro de cada estilo, con el MISMO contenido. Es la unica
    forma honesta de compararlos: si cambia el texto no se sabe si la
    diferencia es del estilo o del contenido."""
    contenido = _contenido_demo()
    idx = a.golpe
    imgs = []
    for eid in E.ESTILOS:
        g = E.aplicar(contenido, eid)
        i = min(idx, len(g["segmentos"]) - 1)
        seg = g["segmentos"][i]
        cfg = {"paleta": g["paleta"], "camara": g.get("camara", 0),
               "fps": 30, "flash_ritmo": g.get("flash_ritmo")}
        im = _cuadro(seg, cfg)
        imgs.append(_rotular(im, f"{eid}  ·  {seg['formato']}",
                             f"{E.ESTILOS[eid]['nombre']} · {seg['duracion']}s "
                             f"· {seg.get('_ritmo','')} · {seg.get('_densidad','')}"))
    SALIDA.mkdir(exist_ok=True)
    out = SALIDA / f"estilos-golpe{idx}.jpg"
    _grilla(imgs, cols=3).save(out, quality=88)
    print(f"Escrito {out}  ({len(imgs)} estilos, golpe {idx}: "
          f"'{contenido['golpes'][min(idx, len(contenido['golpes'])-1)]['rol']}')")


def cmd_combinaciones(a):
    """Estilo x narrativa: como cambia la secuencia de maquetas."""
    print(f"{'estilo':8} {'narrativa':14} maquetas por rol")
    print("-" * 78)
    contenido = _contenido_demo()
    for eid in E.ESTILOS:
        for nid, roles in E.NARRATIVAS.items():
            c = dict(contenido, golpes=[{"rol": r, "texto": ["x"],
                                         "narracion": "x"} for r in roles])
            g = E.aplicar(c, eid)
            maq = [s["formato"] for s in g["segmentos"]]
            print(f"{eid:8} {nid:14} {' '.join(maq)}")
        print()


def cmd_hooks(a):
    """El mismo hook tratado por cada estilo. §16: el hook no es solo
    texto -- el primer segundo tiene una decision visual, y cada estilo
    la toma distinta."""
    texto = a.texto or ["El que te ganó el laburo", "no cobra menos"]
    contenido = {"tema": "hook", "golpes": [
        {"rol": "hook", "texto": texto, "narracion": " ".join(texto),
         "necesita": "serious tradesman portrait workshop"}]}
    imgs = []
    for eid in E.ESTILOS:
        g = E.aplicar(contenido, eid)
        seg = g["segmentos"][0]
        cfg = {"paleta": g["paleta"], "camara": g.get("camara", 0), "fps": 30}
        imgs.append(_rotular(_cuadro(seg, cfg), f"{eid} · {seg['formato']}",
                             f"{seg['duracion']}s"))
    SALIDA.mkdir(exist_ok=True)
    out = SALIDA / "hooks.jpg"
    _grilla(imgs, cols=3).save(out, quality=88)
    print(f"Escrito {out}")


def cmd_guion(a):
    """Tira de contactos de un guion YA compilado, sin renderizar el
    video: un cuadro por plano."""
    g = json.loads(Path(a.guion).read_text(encoding="utf-8"))
    cfg = {"paleta": g["paleta"], "camara": g.get("camara", 0),
           "fps": g.get("fps", 30), "flash_ritmo": g.get("flash_ritmo")}
    imgs = []
    for i, seg in enumerate(g["segmentos"]):
        im = _cuadro(seg, cfg, prog=(i + 1) / len(g["segmentos"]))
        imgs.append(_rotular(im, f"{i}. {seg['formato']}",
                             f"{seg['duracion']}s · {seg.get('_ritmo','')}"))
    SALIDA.mkdir(exist_ok=True)
    out = SALIDA / f"{Path(a.guion).stem}.jpg"
    _grilla(imgs, cols=a.cols).save(out, quality=88)
    print(f"Escrito {out}  ({len(imgs)} planos)")


def main():
    ap = argparse.ArgumentParser(description="Preview de estilos sin renderizar")
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("estilos"); p.add_argument("--golpe", type=int, default=0)
    sub.add_parser("combinaciones")
    p = sub.add_parser("hooks"); p.add_argument("--texto", nargs="+")
    p = sub.add_parser("guion"); p.add_argument("guion")
    p.add_argument("--cols", type=int, default=5)
    a = ap.parse_args()
    return {"estilos": cmd_estilos, "combinaciones": cmd_combinaciones,
            "hooks": cmd_hooks, "guion": cmd_guion}[a.cmd](a) or 0


if __name__ == "__main__":
    sys.exit(main())
