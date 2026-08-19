#!/usr/bin/env python3
"""
Generador de graficos ilustrativos - CERO TOKENS, CERO DERECHOS.

Crea imagenes de apoyo para los videos por codigo: graficos de barras,
lineas de tendencia, mockups de pantalla, iconos grandes, comparativas.
Al generarse por codigo NO tienen problema de copyright -- son propias.

Uso:
    python3 graficos.py barras salida.png "3,7,12,45" "Ene,Feb,Mar,Abr"
    python3 graficos.py linea salida.png "5,8,6,14,22,40"
    python3 graficos.py comparar salida.png "SIN plan|12" "CON plan|340"
    python3 graficos.py mockup salida.png "Tu producto" "0 ventas"
    python3 graficos.py icono salida.png "!"
    python3 graficos.py antes-despues s.png "47 productos" "3 productos"
    python3 graficos.py proceso s.png "Investigar|Crear|Publicar|Medir"
    python3 graficos.py checklist s.png "Un canal fijo+|Saltar de canal-"
    python3 graficos.py dato s.png "89%" "mas abandono si fallas los 3s"
"""

import math
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("ERROR: falta Pillow.")
    sys.exit(1)

W, H = 1080, 1080
FONDO = (14, 14, 20)
TEXTO = (240, 240, 245)
ACENTO = (255, 84, 48)
SEC = (90, 190, 255)
GRIS = (70, 70, 82)


def fuente(t):
    for c in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"]:
        if Path(c).exists():
            try:
                return ImageFont.truetype(c, t)
            except Exception:
                pass
    return ImageFont.load_default(size=t)


def base():
    img = Image.new("RGB", (W, H), FONDO)
    d = ImageDraw.Draw(img)
    for y in range(0, H, 4):
        f = y / H
        d.rectangle([0, y, W, y + 4],
                    fill=tuple(min(255, c + int(16 * (1 - f))) for c in FONDO))
    return img, d


def centrar(d, texto, f, y, color=TEXTO):
    w = d.textbbox((0, 0), texto, font=f)[2]
    d.text(((W - w) // 2, y), texto, font=f, fill=color)


def antes_despues(salida, antes, despues):
    """Comparacion visual lado a lado con flecha. El formato que mejor
    explica una transformacion de un vistazo."""
    img, d = base()
    fl, fv = fuente(38), fuente(56)
    for i, (lab, txt, col, bg) in enumerate([
            ("ANTES", antes, (150, 150, 165), (26, 26, 34)),
            ("DESPUES", despues, ACENTO, (34, 22, 20))]):
        x0 = 60 + i * (W // 2 - 20)
        d.rounded_rectangle([x0, 250, x0 + W // 2 - 100, H - 250],
                            radius=24, fill=bg)
        cx = x0 + (W // 2 - 100) // 2
        wl = d.textbbox((0, 0), lab, font=fl)[2]
        d.text((cx - wl // 2, 300), lab, font=fl, fill=col)
        # Texto envuelto
        palabras, lineas, act = txt.split(), [], []
        for p in palabras:
            if d.textbbox((0, 0), " ".join(act + [p]), font=fv)[2] < W // 2 - 160 or not act:
                act.append(p)
            else:
                lineas.append(" ".join(act)); act = [p]
        if act:
            lineas.append(" ".join(act))
        y = 440
        for ln in lineas:
            wt = d.textbbox((0, 0), ln, font=fv)[2]
            d.text((cx - wt // 2, y), ln, font=fv, fill=TEXTO)
            y += 70
    # Flecha central
    cy = H // 2
    d.polygon([(W // 2 - 26, cy - 26), (W // 2 + 26, cy),
               (W // 2 - 26, cy + 26)], fill=ACENTO)
    img.save(salida)
    print(f"OK: {salida}")


def proceso(salida, pasos):
    """Diagrama de flujo vertical. Explica una secuencia sin texto largo."""
    img, d = base()
    items = pasos.split("|")
    f = fuente(46)
    n = len(items)
    alto = (H - 340) // max(1, n)
    for i, p in enumerate(items):
        y = 210 + i * alto
        activo = (i == n - 1)
        col = ACENTO if activo else (48, 48, 60)
        d.rounded_rectangle([130, y, W - 130, y + alto - 44],
                            radius=20, fill=(26, 26, 34), outline=col, width=4)
        # Numero
        d.ellipse([165, y + 22, 165 + 56, y + 78],
                  fill=col if activo else GRIS)
        fn = fuente(36)
        nb = d.textbbox((0, 0), str(i + 1), font=fn)
        d.text((165 + (56 - (nb[2] - nb[0])) // 2 - nb[0],
                y + 22 + (56 - (nb[3] - nb[1])) // 2 - nb[1]),
               str(i + 1), font=fn, fill=(12, 12, 18))
        d.text((250, y + 30), p.strip(), font=f,
               fill=TEXTO if activo else (185, 185, 200))
        if i < n - 1:
            fy = y + alto - 40
            d.polygon([(W // 2 - 16, fy), (W // 2 + 16, fy),
                       (W // 2, fy + 26)], fill=GRIS)
    img.save(salida)
    print(f"OK: {salida}")


def checklist(salida, items):
    """Lista de si/no. Formato 'esto si, esto no' -- muy claro visualmente.
    Prefija cada item con + o - : 'nada+|esto-'"""
    img, d = base()
    f = fuente(48)
    lst = items.split("|")
    alto = 118
    y0 = (H - len(lst) * alto) // 2
    for i, raw in enumerate(lst):
        txt = raw.strip()
        bueno = not txt.endswith("-")
        txt = txt.rstrip("+-").strip()
        y = y0 + i * alto
        col = (60, 200, 120) if bueno else (240, 70, 70)
        d.rounded_rectangle([110, y, W - 110, y + alto - 24],
                            radius=18, fill=(24, 24, 32))
        cx, cy = 175, y + (alto - 24) // 2
        d.ellipse([cx - 28, cy - 28, cx + 28, cy + 28], fill=col)
        if bueno:
            d.line([(cx - 13, cy), (cx - 3, cy + 11), (cx + 14, cy - 12)],
                   fill=(12, 12, 18), width=7)
        else:
            d.line([(cx - 12, cy - 12), (cx + 12, cy + 12)],
                   fill=(12, 12, 18), width=7)
            d.line([(cx + 12, cy - 12), (cx - 12, cy + 12)],
                   fill=(12, 12, 18), width=7)
        d.text((240, cy - 26), txt, font=f, fill=TEXTO)
    img.save(salida)
    print(f"OK: {salida}")


def dato(salida, numero, contexto):
    """Estadistica grande. La especificidad crea autoridad implicita."""
    img, d = base()
    fn, fc = fuente(240), fuente(46)
    wn = d.textbbox((0, 0), numero, font=fn)[2]
    d.text(((W - wn) // 2 + 6, H // 2 - 200 + 6), numero, font=fn, fill=(0, 0, 0))
    d.text(((W - wn) // 2, H // 2 - 200), numero, font=fn, fill=ACENTO)
    # Contexto envuelto
    palabras, lineas, act = contexto.split(), [], []
    for p in palabras:
        if d.textbbox((0, 0), " ".join(act + [p]), font=fc)[2] < W - 220 or not act:
            act.append(p)
        else:
            lineas.append(" ".join(act)); act = [p]
    if act:
        lineas.append(" ".join(act))
    y = H // 2 + 90
    for ln in lineas:
        centrar(d, ln, fc, y, (190, 190, 205))
        y += 62
    d.rectangle([W // 2 - 70, H // 2 + 50, W // 2 + 70, H // 2 + 56], fill=ACENTO)
    img.save(salida)
    print(f"OK: {salida}")


def barras(salida, valores, etiquetas=None):
    img, d = base()
    vals = [float(v) for v in valores.split(",")]
    labs = etiquetas.split(",") if etiquetas else [""] * len(vals)
    mx = max(vals) or 1
    n = len(vals)
    ancho = int(W * 0.62 / n)
    hueco = int(W * 0.10 / max(1, n - 1)) if n > 1 else 0
    total = n * ancho + (n - 1) * hueco
    x0 = (W - total) // 2
    base_y, alto_max = H - 190, H - 420

    for i, v in enumerate(vals):
        h = int(alto_max * (v / mx))
        x = x0 + i * (ancho + hueco)
        color = ACENTO if v == mx else GRIS
        # Barra con esquinas redondeadas
        d.rounded_rectangle([x, base_y - h, x + ancho, base_y],
                            radius=14, fill=color)
        f1 = fuente(46)
        vt = f"{v:g}"
        wv = d.textbbox((0, 0), vt, font=f1)[2]
        d.text((x + (ancho - wv) // 2, base_y - h - 62), vt,
               font=f1, fill=TEXTO)
        if labs[i]:
            f2 = fuente(34)
            wl = d.textbbox((0, 0), labs[i], font=f2)[2]
            d.text((x + (ancho - wl) // 2, base_y + 22), labs[i],
                   font=f2, fill=(150, 150, 165))
    d.rectangle([x0 - 30, base_y + 2, x0 + total + 30, base_y + 6], fill=GRIS)
    img.save(salida)
    print(f"OK: {salida}")


def linea(salida, valores):
    img, d = base()
    vals = [float(v) for v in valores.split(",")]
    mx, mn = max(vals), min(vals)
    rango = (mx - mn) or 1
    n = len(vals)
    x0, x1 = 140, W - 140
    y0, y1 = 260, H - 260
    pts = []
    for i, v in enumerate(vals):
        x = x0 + (x1 - x0) * i / max(1, n - 1)
        y = y1 - (y1 - y0) * (v - mn) / rango
        pts.append((x, y))

    # Area bajo la curva (glow suave)
    capa = Image.new("RGB", (W, H), (0, 0, 0))
    dc = ImageDraw.Draw(capa)
    dc.polygon(pts + [(x1, y1), (x0, y1)], fill=(60, 22, 14))
    capa = capa.filter(ImageFilter.GaussianBlur(18))
    img = Image.blend(img, capa, 0.55)
    d = ImageDraw.Draw(img)

    d.line(pts, fill=ACENTO, width=9, joint="curve")
    for p in pts:
        d.ellipse([p[0] - 11, p[1] - 11, p[0] + 11, p[1] + 11], fill=FONDO)
        d.ellipse([p[0] - 8, p[1] - 8, p[0] + 8, p[1] + 8], fill=ACENTO)
    # Marca el ultimo punto
    d.ellipse([pts[-1][0] - 22, pts[-1][1] - 22,
               pts[-1][0] + 22, pts[-1][1] + 22], outline=ACENTO, width=4)
    img.save(salida)
    print(f"OK: {salida}")


def comparar(salida, a, b):
    img, d = base()
    la, va = a.split("|")
    lb, vb = b.split("|")
    fv, fl = fuente(92), fuente(38)

    for i, (lab, val, col) in enumerate([(la, va, GRIS), (lb, vb, ACENTO)]):
        cx = W // 4 + i * W // 2
        y = 330
        d.rounded_rectangle([cx - 210, y - 60, cx + 210, y + 250],
                            radius=26, fill=(26, 26, 34))
        wl = d.textbbox((0, 0), lab, font=fl)[2]
        d.text((cx - wl // 2, y - 18), lab, font=fl, fill=(160, 160, 175))
        wv = d.textbbox((0, 0), val, font=fv)[2]
        d.text((cx - wv // 2, y + 60), val, font=fv, fill=col)

    fx = fuente(56)
    centrar(d, "vs", fx, 380, (110, 110, 125))
    img.save(salida)
    print(f"OK: {salida}")


def mockup(salida, titulo, estado):
    img, d = base()
    # Ventana estilo navegador
    x0, y0, x1, y1 = 130, 240, W - 130, H - 240
    d.rounded_rectangle([x0, y0, x1, y1], radius=22, fill=(26, 26, 34))
    d.rounded_rectangle([x0, y0, x1, y0 + 74], radius=22, fill=(38, 38, 48))
    d.rectangle([x0, y0 + 52, x1, y0 + 74], fill=(38, 38, 48))
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse([x0 + 32 + i * 40, y0 + 26, x0 + 50 + i * 40, y0 + 44], fill=c)

    ft, fe = fuente(58), fuente(96)
    wt = d.textbbox((0, 0), titulo, font=ft)[2]
    d.text(((W - wt) // 2, y0 + 170), titulo, font=ft, fill=TEXTO)
    # Placeholder de contenido
    for i in range(3):
        d.rounded_rectangle([x0 + 90, y0 + 280 + i * 46,
                             x1 - 90 - i * 120, y0 + 310 + i * 46],
                            radius=8, fill=(48, 48, 60))
    we = d.textbbox((0, 0), estado, font=fe)[2]
    d.text(((W - we) // 2, y1 - 260), estado, font=fe, fill=ACENTO)
    img.save(salida)
    print(f"OK: {salida}")


def icono(salida, simbolo):
    img, d = base()
    cx, cy, r = W // 2, H // 2, 260
    # Halo
    capa = Image.new("RGB", (W, H), (0, 0, 0))
    ImageDraw.Draw(capa).ellipse([cx - r, cy - r, cx + r, cy + r],
                                 fill=(80, 26, 15))
    capa = capa.filter(ImageFilter.GaussianBlur(60))
    img = Image.blend(img, capa, 0.8)
    d = ImageDraw.Draw(img)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=ACENTO, width=10)
    f = fuente(300)
    bb = d.textbbox((0, 0), simbolo, font=f)
    d.text((cx - (bb[2] - bb[0]) // 2 - bb[0],
            cy - (bb[3] - bb[1]) // 2 - bb[1]), simbolo, font=f, fill=ACENTO)
    img.save(salida)
    print(f"OK: {salida}")


def main():
    a = sys.argv[1:]
    if len(a) < 2:
        print(__doc__)
        return
    tipo, salida = a[0], a[1]
    try:
        if tipo == "barras":
            barras(salida, a[2], a[3] if len(a) > 3 else None)
        elif tipo == "linea":
            linea(salida, a[2])
        elif tipo == "comparar":
            comparar(salida, a[2], a[3])
        elif tipo == "mockup":
            mockup(salida, a[2], a[3] if len(a) > 3 else "")
        elif tipo == "icono":
            icono(salida, a[2])
        elif tipo == "antes-despues":
            antes_despues(salida, a[2], a[3])
        elif tipo == "proceso":
            proceso(salida, a[2])
        elif tipo == "checklist":
            checklist(salida, a[2])
        elif tipo == "dato":
            dato(salida, a[2], a[3])
        else:
            print(f"Tipo desconocido: {tipo}")
            print(__doc__)
    except IndexError:
        print("ERROR: faltan argumentos para ese tipo.")
        print(__doc__)


if __name__ == "__main__":
    main()
