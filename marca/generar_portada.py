#!/usr/bin/env python3
"""
Imagen de portada para la ficha de Hotmart -- CERO TOKENS, CERO
DERECHOS (generada por codigo, misma identidad de marca.generar_logo).

Formato apaisado 1280x720 que pide Hotmart. Reusa el icono/paleta
oficial de MARCA.md.

Uso:
    python3 marca/generar_portada.py
    -> marca/portada-hotmart.png (1280x720)
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, str(Path(__file__).parent))
from generar_logo import NEGRO, HUESO, VERDE, APAGADO, FUENTE_BOLD, FUENTE_REG

W, H = 1280, 720


def fnt(path, size):
    return ImageFont.truetype(str(path), size)


def icono_transparente(tam=460):
    """Mismo icono que generar_logo.icono() pero sobre fondo alpha 0,
    para pegarlo sin dejar un cuadrado negro visible sobre un fondo
    con degrade (a diferencia de icono(), pensada para avatar solido)."""
    escala = tam / 1024
    img = Image.new("RGBA", (tam, tam), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = tam / 2, tam / 2
    r = 340 * escala
    grosor = int(26 * escala)
    d.arc([cx - r, cy - r, cx + r, cy + r], start=18, end=270,
          fill=HUESO, width=grosor)
    largo = r * 1.55
    ang = math.radians(-45)
    dx, dy = math.cos(ang) * largo, math.sin(ang) * largo
    grosor_corte = int(46 * escala)
    perp = (-dy, dx)
    norma = math.hypot(*perp)
    perp = (perp[0] / norma * grosor_corte / 2, perp[1] / norma * grosor_corte / 2)
    p1 = (cx - dx / 2 + perp[0], cy - dy / 2 + perp[1])
    p2 = (cx + dx / 2 + perp[0], cy + dy / 2 + perp[1])
    p3 = (cx + dx / 2 - perp[0], cy + dy / 2 - perp[1])
    p4 = (cx - dx / 2 - perp[0], cy - dy / 2 - perp[1])
    d.polygon([p1, p2, p3, p4], fill=VERDE)
    r_punta = grosor_corte / 2
    for cxp, cyp in [(cx - dx / 2, cy - dy / 2), (cx + dx / 2, cy + dy / 2)]:
        d.ellipse([cxp - r_punta, cyp - r_punta, cxp + r_punta, cyp + r_punta],
                   fill=VERDE)
    return img


def portada():
    img = Image.new("RGB", (W, H), NEGRO)
    d = ImageDraw.Draw(img, "RGBA")

    # Resplandor sutil detras del icono (glow, no imagen bajada de
    # ningun lado -- circulo desenfocado en el verde de acento).
    glow = Image.new("RGB", (W, H), NEGRO)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W * 0.62, H * 0.10, W * 0.62 + 520, H * 0.10 + 520], fill=VERDE)
    glow = glow.filter(ImageFilter.GaussianBlur(140))
    img = Image.blend(img, glow, 0.22)
    d = ImageDraw.Draw(img, "RGBA")

    # Icono grande a la derecha (transparente, sin cuadrado visible)
    ic = icono_transparente(460)
    img.paste(ic, (W - 460 - 90, int(H / 2 - 230)), ic)

    # Wordmark + tagline a la izquierda
    x0 = 90
    f_marca = fnt(FUENTE_BOLD, 96)
    y = H * 0.30
    x = x0
    for ch in "EL CORTE":
        d.text((x, y), ch, font=f_marca, fill=HUESO)
        w = d.textbbox((0, 0), ch, font=f_marca)[2]
        x += w + 7

    f_tag = fnt(FUENTE_REG, 34)
    d.text((x0, y + 118), "No te inspiramos. Te sacamos del bucle.",
           font=f_tag, fill=APAGADO)

    f_val = fnt(FUENTE_REG, 26)
    d.text((x0, y + 190), "Pago único · Sin cuenta · Comunidad exclusiva en Hotmart",
           font=f_val, fill=VERDE)

    # Linea de acento minima (mismo lenguaje que los videos: barra
    # verde en la esquina)
    d.rectangle([x0, 70, x0 + 90, 78], fill=VERDE)

    return img


def main():
    out = Path(__file__).parent / "portada-hotmart.png"
    portada().save(out)
    print(f"OK: {out}")


if __name__ == "__main__":
    sys.exit(main())
