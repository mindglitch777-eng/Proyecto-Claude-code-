#!/usr/bin/env python3
"""
Logo de "El Corte" - CERO TOKENS, CERO DERECHOS (generado por codigo).

Sigue la identidad ya decidida en MARCA.md: verde señal sobre negro,
sans-serif, editorial no mistico ("descarto el oro sobre negro con
marmol -- es lo que usa TODO el nicho"). El icono es un circulo (el
bucle) cortado por una barra diagonal (el corte): la marca ES el
concepto del producto.

Uso:
    python3 marca/generar_logo.py
    -> marca/icono.png       (1024x1024, avatar/perfil)
    -> marca/lockup.png      (1600x500, marca+wordmark horizontal)
    -> marca/lockup-claro.png (version sobre hueso, para fondos claros)
"""

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAIZ = Path(__file__).parent.parent
FUENTE_BOLD = RAIZ / "assets/fuentes/SpaceGrotesk-Bold.ttf"
FUENTE_REG = RAIZ / "assets/fuentes/SpaceGrotesk-Regular.ttf"

# Paleta de MARCA.md
NEGRO = (15, 15, 16)
HUESO = (242, 239, 233)
VERDE = (74, 222, 128)
APAGADO = (107, 107, 112)


def fnt(path, size):
    return ImageFont.truetype(str(path), size)


def icono(tam=1024, fondo=NEGRO, marca_col=HUESO):
    """El circulo es el bucle. La barra diagonal es el corte."""
    escala = tam / 1024
    img = Image.new("RGB", (tam, tam), fondo)
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = tam / 2, tam / 2
    r = 340 * escala

    # Bucle: circulo con un quiebre (no cerrado del todo -- el corte
    # ya empezo). Dibujado como arco, no circulo perfecto.
    grosor = int(26 * escala)
    d.arc([cx - r, cy - r, cx + r, cy + r], start=18, end=270,
          fill=marca_col, width=grosor)

    # El corte: barra diagonal gruesa que atraviesa el hueco del arco,
    # en el verde de acento -- el unico elemento de color de la marca.
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
    # Puntas redondeadas
    r_punta = grosor_corte / 2
    for cxp, cyp in [(cx - dx / 2, cy - dy / 2), (cx + dx / 2, cy + dy / 2)]:
        d.ellipse([cxp - r_punta, cyp - r_punta, cxp + r_punta, cyp + r_punta],
                   fill=VERDE)

    return img


def lockup(ancho=1600, alto=500, fondo=NEGRO, texto_col=HUESO, invertido=False):
    img = Image.new("RGB", (ancho, alto), fondo)
    ic = icono(alto, fondo=fondo, marca_col=(APAGADO if not invertido else (80, 80, 86)))
    ic = ic.resize((int(alto * 0.86), int(alto * 0.86)), Image.LANCZOS)
    img.paste(ic, (int(alto * 0.07), int(alto * 0.07)))

    d = ImageDraw.Draw(img)
    x0 = int(alto * 1.05)
    f_marca = fnt(FUENTE_BOLD, int(alto * 0.24))
    texto = "EL CORTE"
    # Letter-spacing manual (Space Grotesk no trae tracking negativo raro)
    x = x0
    y = alto * 0.28
    espaciado = int(alto * 0.018)
    for ch in texto:
        d.text((x, y), ch, font=f_marca, fill=texto_col)
        w = d.textbbox((0, 0), ch, font=f_marca)[2]
        x += w + espaciado

    f_tag = fnt(FUENTE_REG, int(alto * 0.075))
    d.text((x0, alto * 0.60), "No te inspiramos. Te sacamos del bucle.",
           font=f_tag, fill=APAGADO)
    return img


def main():
    marca_dir = Path(__file__).parent
    icono(1024).save(marca_dir / "icono.png")
    lockup().save(marca_dir / "lockup.png")
    lockup(fondo=HUESO, texto_col=NEGRO, invertido=True).save(
        marca_dir / "lockup-claro.png")
    print("OK: marca/icono.png, marca/lockup.png, marca/lockup-claro.png")


if __name__ == "__main__":
    sys.exit(main())
