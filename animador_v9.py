#!/usr/bin/env python3
"""
Animador v9 — FORMATOS (arquetipos de video). Cero tokens.

El salto respecto de v8: v8 variaba color, layout y transicion, pero
todos los videos eran el MISMO arquetipo (texto sobre fondo + elemento).
v9 introduce FORMATOS estructuralmente distintos entre si. Dos videos
con formatos distintos no se parecen en nada, aunque compartan paleta.

FORMATOS (campo "formato" por segmento):

  declaracion   Tipografia enorme a sangre, sin adornos. Silencio visual.
                Para frases que pegan solas.
  dato_duro     Jerarquia tipografica extrema: numero gigante + linea
                fina de contexto. Estilo reporte editorial.
  division      Pantalla partida REAL en dos mitades con colores y
                contenidos opuestos. Para comparaciones.
  revelacion    Estado A que se transforma en estado B con mascara
                animada. Para antes/despues.
  cronologia    Linea de tiempo horizontal con hitos que se encienden.
  conteo        Cuenta regresiva 5..1 con item destacado por vez.
  pregunta      Pregunta arriba, pausa deliberada, respuesta que entra
                de golpe. Usa el silencio como recurso.
  editorial     Composicion tipo revista: grilla asimetrica, numero de
                pagina, kicker, mucho espacio negativo.
  camino        Ruta tipo mapa: curva sinuosa con 3-5 paradas numeradas
                que se van revelando una por una (json: "pasos": [str,...]).
  collage       2-4 fotos que entran una tras otra en rapida sucesion,
                cada una con su propio leve zoom/parallax y un corte
                tipo whip al entrar (json: "imagenes": [{"ruta":...,
                "texto": "..."}, ...]). "Pattern interrupt" barato:
                stills reales cortados adentro del video.
  mensajes      Mockup de chat oscuro (iMessage/WhatsApp) en la paleta
                de marca: 2-4 mensajes que se acumulan en sucesion
                rapida, cada uno con su propio golpe de sonido y
                microshake de camara (json: "mensajes": [{"texto":...,
                "emisor": "otro"|"yo"}, ...], "contacto" opcional).
                Para mostrar LITERALMENTE lo que dijo/hizo la otra
                persona, en vez de iconos abstractos.
  prueba        Evidencia CON la fuente en el mismo plano: captura
                (imagen o video) enmarcada, recuadro que late sobre la
                parte que importa ("resaltado": [x0,y0,x1,y1] en
                fracciones 0..1 de la caja), la afirmacion abajo y la
                fuente al pie (json: "fuente", "kicker", "resaltado").
                Sin "imagen" queda como ficha de cita. Si falta
                "fuente" el plano escribe "SIN FUENTE": la omision se
                ve, no se disimula.
  flujo         Cadena A -> B -> C: cajas apiladas unidas por flechas,
                reveladas una por una, con la ultima en el color de
                acento porque es el resultado y no un paso mas (json:
                "nodos": [str,...] hasta 4, "notas": [str,...],
                "texto" como titulo). Para explicar un flujo o una
                automatizacion, que 'camino' (mapa sinuoso) y 'pasos'
                (lista numerada) no dibujan.
  escalada      La escalada del pensamiento como CONTENIDO REAL: una
                lista de frases que se apilan con cortes cada vez MAS
                rapidos (aceleracion real) y tension sonora que sube
                (json: "pasos": [str,...]). No es un contador numerico
                abstracto -- cada frase es la idea completa de ese
                paso de la escalada.

Gramatica de 6 beats (ver CLAUDE.md de esta ronda para el brief
completo; demos/_demo_gramatica_v2.json es el caso de estudio armado
con todo lo de abajo): hook de golpe -> "mensajes" -> "escalada" ->
quiebre de capitulo -> capturas rapidas -> golpe de cierre.

Quiebre de capitulo ("quiebre_capitulo": true en un segmento): freeze
frame del ultimo frame del segmento anterior + silencio total de
audio (~0.5s, el "aire muerto" antes del golpe) + glitch/VHS fuerte
(separacion RGB, scanlines, bandas, dip a negro, light-leak en el
verde de marca) hacia el segmento nuevo. "quiebre_freeze" y
"quiebre_glitch" (segundos) ajustan la duracion de cada mitad; el
segmento tiene que durar al menos esa suma. Pensado para marcar un
cambio real de capitulo/tratamiento (ej. antes de mostrar la app),
no una transicion mas.

Camara mas agresiva por segmento (encima de la deriva sutil de
"camara" en cfg, que sigue igual por defecto):
  "camara_intensidad": multiplica la deriva base (>1 = mas paneo/zoom).
  "camara_shake": 0..1+, shake continuo con ruido real (no solo seno).
  "camara_golpes": lista de fracciones 0..1 del segmento donde cae un
                   pico de shake puntual (mensajes/escalada lo generan
                   solas si no se declara a mano).

Hook "impacto" (HOOKS): punch-zoom + shake + flash, todo en ~0.26s,
para que el golpe de sonido caiga exactamente cuando el texto pega en
pantalla. Pensado para el hook (0-2s) y el cierre (misma tecnica,
rima visual).

Captions kinetic opcionales (cualquier formato, cualquier segmento
narrado): agregar "captions_palabra_por_palabra": true al segmento
muestra el texto narrado UNA PALABRA A LA VEZ, grande y centrada, con
pop de entrada y la palabra clave de cada frase en el verde de acento.

Uso:
    python3 animador_v9.py guion.json
    python3 animador_v9.py --demo        # muestra los 8 formatos
    python3 animador_v9.py --catalogo    # 1 frame de cada formato
"""

import json
import math
import multiprocessing
import os
import random
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
except ImportError:
    print("ERROR: falta Pillow.")
    sys.exit(1)

W, H = 1080, 1920


def eo_cubic(t): return 1 - pow(1 - t, 3)
def eo_expo(t): return 1 if t >= 1 else 1 - pow(2, -10 * t)
def eio(t): return 0.5 * (1 - math.cos(math.pi * max(0.0, min(1.0, t))))
def eo_back(t, f=2.0):
    c3 = f + 1
    return 1 + c3 * pow(t - 1, 3) + f * pow(t - 1, 2)


def _factor_estiro(seg, referencia, techo=2.6):
    """Cuanto se alargo este segmento respecto a su duracion tipica de
    diseno (>=1.0, nunca reduce nada). La voz real puede estirar un
    segmento bastante mas de lo que el formato asumia (ej. un
    'cronologia' pensado para 2.5s que termina durando 7s porque la
    frase es larga) -- sin esto, el contenido termina de revelarse
    temprano (ej. al 70% del segmento) y el resto queda quieto en
    pantalla. Multiplicando las ventanas de revelado por este factor,
    el contenido sigue apareciendo hasta mas tarde en vez de congelarse.
    'techo' evita que un segmento extremadamente largo estire el
    revelado a un ritmo demasiado lento."""
    d = seg.get("duracion", referencia)
    if not referencia:
        return 1.0
    return max(1.0, min(techo, d / referencia))


# Variable font propia (ver assets/LICENCIAS.txt): reemplaza a DejaVu
# Sans Bold, que se lee generica/vieja en pantallas de telefono. Una
# sola fuente cubre Light/Regular/Bold via ejes de variacion, en vez
# de necesitar un .ttf por peso.
FUENTE_MODERNA = Path(__file__).parent / "assets/fuentes/SpaceGrotesk-Variable.ttf"
# Serif italica para la palabra suelta de las maquetas 'pleno'/'tarjeta'.
# Si se agrega una fuente propia mas elegante a assets/fuentes/, se usa
# esa; si no, Liberation Serif Italic, que viene con el sistema.
FUENTE_SERIF_ITALICA = Path(__file__).parent / "assets/fuentes/SerifItalica.ttf"
if not FUENTE_SERIF_ITALICA.exists():
    FUENTE_SERIF_ITALICA = Path(
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf")


def fnt(t, ligera=False, serif=False, italica=False):
    if serif:
        cands = ([FUENTE_SERIF_ITALICA,
                  "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
                  "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"]
                 if italica else [])
        for c in cands:
            c = str(c)
            if Path(c).exists():
                try:
                    return ImageFont.truetype(c, max(8, int(t)))
                except Exception:
                    pass
        for c in ["/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
                  "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"]:
            if Path(c).exists():
                try:
                    return ImageFont.truetype(c, max(8, int(t)))
                except Exception:
                    pass
    if FUENTE_MODERNA.exists():
        try:
            f = ImageFont.truetype(str(FUENTE_MODERNA), max(8, int(t)))
            f.set_variation_by_name("Regular" if ligera else "Bold")
            return f
        except Exception:
            pass
    cands = ([ "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
               "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"]
             if ligera else
             ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"])
    for c in cands:
        if Path(c).exists():
            try:
                return ImageFont.truetype(c, max(8, int(t)))
            except Exception:
                pass
    return ImageFont.load_default(size=max(8, int(t)))


def envolver(d, txt, f, ancho):
    ps, ls, act = txt.split(), [], []
    for p in ps:
        if d.textbbox((0, 0), " ".join(act + [p]), font=f)[2] <= ancho or not act:
            act.append(p)
        else:
            ls.append(" ".join(act)); act = [p]
    if act:
        ls.append(" ".join(act))
    return ls


def auto_tam(d, txt, ancho, alto, tam_max, ligera=False):
    """Ajusta el cuerpo tipografico para llenar la caja sin desbordar.
    Verifica ALTO y ANCHO: una palabra sola mas ancha que la caja
    tambien fuerza a bajar el tamaño."""
    t = tam_max
    while t > 22:
        f = fnt(t, ligera)
        ls = envolver(d, txt, f, ancho)
        alto_ok = len(ls) * (f.size + t * 0.18) <= alto
        ancho_ok = all(d.textbbox((0, 0), l, font=f)[2] <= ancho for l in ls)
        if alto_ok and ancho_ok:
            return f, ls
        t -= 4
    f = fnt(t, ligera)
    return f, envolver(d, txt, f, ancho)


def sombra_t(d, xy, txt, f, col, off=5):
    d.text((xy[0] + off, xy[1] + off), txt, font=f, fill=(0, 0, 0))
    d.text(xy, txt, font=f, fill=col)


def base_fondo(pal, t, seg):
    img = Image.new("RGB", (W, H), tuple(pal["fondo"]))
    d = ImageDraw.Draw(img)
    grano = seg.get("textura", "suave")
    if grano == "grilla":
        paso = 74
        off = int((t * 20) % paso)
        col = tuple(min(255, c + 12) for c in pal["fondo"])
        for x in range(-paso, W + paso, paso):
            d.line([(x + off, 0), (x + off, H)], fill=col, width=1)
        for y in range(-paso, H + paso, paso):
            d.line([(0, y + off), (W, y + off)], fill=col, width=1)
    else:
        for i in range(0, H, 6):
            f = i / H
            d.rectangle([0, i, W, i + 6],
                        fill=tuple(min(255, c + int(14 * (1 - f)))
                                   for c in pal["fondo"]))
    return img


# ==================== FORMATOS ====================


def karaoke(d, texto, f, caja, pal, t, align="centro"):
    """Resaltado palabra por palabra sincronizado con la narracion.
    Es la tecnica que mas sube retencion: el ojo vuelve a la pantalla
    cada vez que una palabra cambia de color.

    t = 0..1 dentro del segmento. Como la duracion del segmento ya se
    ajusto a la voz, el resaltado queda cuadrado con lo que se escucha.
    """
    x0, y0, x1, y1 = caja
    lineas = envolver(d, texto, f, x1 - x0)
    total = sum(len(l.split()) for l in lineas)
    if total == 0:
        return y0
    # La narracion ocupa ~88% del segmento (el resto es el respiro)
    avance = min(1.0, t / 0.88)
    actual = avance * total
    alto_l = f.size + 22
    y = y0 + max(0, ((y1 - y0) - len(lineas) * alto_l) / 2)
    idx = 0
    for ln in lineas:
        w = d.textbbox((0, 0), ln, font=f)[2]
        x = x0 if align == "izq" else x0 + ((x1 - x0) - w) / 2
        for pw in ln.split():
            idx += 1
            ancho = d.textbbox((0, 0), pw + " ", font=f)[2]
            if idx <= actual - 0.5:
                col = tuple(pal["texto"])            # ya dicha
            elif idx <= actual + 0.5:
                col = tuple(pal["destacado"])        # se esta diciendo
                # micro-escala en la palabra activa
                fu = fnt(int(f.size * 1.06))
                d.text((x + 4, y + 4), pw, font=fu, fill=(0, 0, 0))
                d.text((x, y), pw, font=fu, fill=col)
                x += ancho
                continue
            else:
                col = tuple(int(fo + (c - fo) * 0.28)
                            for fo, c in zip(pal["fondo"], pal["texto"]))
            d.text((x + 4, y + 4), pw, font=f, fill=(0, 0, 0))
            d.text((x, y), pw, font=f, fill=col)
            x += ancho
        y += alto_l
    return y


# ============ CAPTIONS KINETIC "PALABRA POR PALABRA" ============
# Overlay OPCIONAL, independiente del formato del segmento. Distinto
# de karaoke(): karaoke() ya muestra todo el texto y solo recolorea
# lo dicho; esto muestra UNA palabra a la vez, grande y centrada,
# apareciendo con un "pop" -- la tecnica de retencion 2026 que pidio
# el operador (kinetic typography). No requiere Whisper: reparte el
# tiempo del segmento en partes iguales entre palabras, igual que
# karaoke() reparte el 88% del segmento (el resto es el respiro).
# Se activa por segmento con "captions_palabra_por_palabra": true.

def _palabras_captions(texto):
    """Separa el texto narrado en palabras para el caption kinetic,
    marcando cuales son 'palabra clave' (se resaltan en el acento).

    Dos formas de marcar una clave:
      - explicita: envolver la palabra en asteriscos en el guion,
        ej. "Se te *complica* dormir." (los asteriscos no se dibujan).
      - automatica (si no hay ninguna marca explicita en el segmento):
        se resalta la ultima palabra de cada frase, antes de . ! ?
    """
    crudo = texto.split()
    hay_marca = any('*' in p for p in crudo)
    palabras = []
    for p in crudo:
        clave = '*' in p
        limpio = p.replace('*', '')
        if limpio:
            palabras.append([limpio, clave])
    if not hay_marca:
        for i, (w, _) in enumerate(palabras):
            if w and w[-1] in '.!?':
                palabras[i][1] = True
        if palabras and not any(c for _, c in palabras):
            palabras[-1][1] = True  # sin puntuacion: al menos la ultima
    return [(w, c) for w, c in palabras]


def dibujar_captions_kinetic(img, d, seg, t, pal):
    """Dibuja la palabra activa del segmento, grande y centrada, con
    'pop' de entrada. t = 0..1 dentro del segmento (mismo contrato que
    el resto del renderizador). Campo opcional 'captions_texto' para
    usar un texto distinto al narrado por defecto (texto_hablado)."""
    texto = seg.get("captions_texto") or texto_hablado(seg)
    if not texto or not texto.strip():
        return
    palabras = _palabras_captions(texto)
    n = len(palabras)
    if n == 0:
        return
    avance = min(1.0, t / 0.88)  # el ultimo 12% del segmento es respiro
    idx = min(n - 1, int(avance * n))
    lt = max(0.0, min(1.0, avance * n - idx))
    palabra, clave = palabras[idx]
    if not palabra:
        return

    # "chico": la segunda capa de texto de la referencia. Corre AL
    # MISMO TIEMPO que el bloque escalonado y no compite con el: es
    # una palabra sola, chica, fina y baja, que solo confirma lo que
    # la voz acaba de decir. Medido sobre los videos: ~4% del ancho,
    # centrada, a media altura baja, sin franja oscura y sin rebote.
    # El modo "grande" es el que ya existia y se deja por defecto para
    # no re-pintar los guiones ya escritos.
    if seg.get("captions_estilo", "grande") == "chico":
        f = fnt(int(seg.get("captions_tam", W * 0.043)), ligera=True)
        while d.textbbox((0, 0), palabra, font=f)[2] > W - 200 and f.size > 20:
            f = fnt(f.size - 3, ligera=True)
        a = int(255 * min(1.0, lt / 0.18))
        x0b, y0b, x1b, y1b = d.textbbox((0, 0), palabra, font=f)
        capa = Image.new("RGBA", (x1b - x0b + 60, y1b - y0b + 60), (0, 0, 0, 0))
        _sombra_suave(capa, palabra, f, 30 - x0b, 30 - y0b, a, 0,
                       tuple(pal["texto"]))
        col = tuple(pal["destacado"]) if clave else tuple(pal["texto"])
        ImageDraw.Draw(capa).text((30 - x0b, 30 - y0b), palabra, font=f,
                                  fill=col + (a,))
        img.paste(capa, (int((W - capa.width) / 2),
                         int(H * float(seg.get("captions_y", 0.60))
                             - capa.height / 2)), capa)
        return

    tam = 128
    f = fnt(tam)
    while d.textbbox((0, 0), palabra, font=f)[2] > W - 140 and tam > 40:
        tam -= 8
        f = fnt(tam)
    e = eo_back(min(1.0, lt / 0.34))
    esc = 0.72 + 0.28 * e
    fu = fnt(max(24, int(f.size * esc)))
    wb = d.textbbox((0, 0), palabra, font=fu)[2]
    dy = int(16 * (1 - max(0.0, min(1.0, e))))
    y = H * 0.78 - fu.size / 2 + dy
    x = (W - wb) / 2
    # Scrim: oscurece una franja detras del texto para que se lea
    # sin importar que haya debajo (foto, otro formato, lo que sea).
    pad = 30
    y0, y1 = max(0, int(y - pad)), min(H, int(y + fu.size + pad))
    if y1 > y0:
        franja = img.crop((0, y0, W, y1))
        oscuro = Image.new("RGB", franja.size, tuple(pal["fondo"]))
        img.paste(Image.blend(franja, oscuro, 0.72), (0, y0))
    col = tuple(pal["destacado"]) if clave else tuple(pal["texto"])
    sombra_t(d, (x, y), palabra, fu, col, 6)


def _palabra_activa(seg, t, campo="narracion"):
    """(palabra, es_clave, avance_local) de la palabra que corresponde a
    este instante. Reparte las palabras parejo a lo largo del segmento:
    como la duracion del segmento la fija la voz real, el reparto queda
    sincronizado con el habla sin necesidad de marcas de tiempo."""
    texto = seg.get("captions_texto") or seg.get(campo) or texto_hablado(seg)
    if not texto or not texto.strip():
        return None, False, 0.0
    palabras = _palabras_captions(texto)
    if not palabras:
        return None, False, 0.0
    n = len(palabras)
    avance = min(1.0, t / 0.94)
    idx = min(n - 1, int(avance * n))
    lt = max(0.0, min(1.0, avance * n - idx))
    palabra, clave = palabras[idx]
    return palabra, clave, lt, idx


def _semilla_seg(seg):
    """Numero estable derivado del texto del segmento. Sirve para que el
    ciclo de estilos/direcciones NO arranque igual en cada segmento (si
    no, la primera palabra de todos los planos entra siempre desde
    abajo y con la misma letra). Es deterministico a proposito: el
    mismo guion rinde identico dos veces, que es de lo que depende el
    cache de render."""
    txt = seg.get("captions_texto") or seg.get("narracion") or seg.get("texto") or ""
    return sum(ord(c) for c in txt[:24])


# --- Caption cinetico: cada palabra entra por un lado distinto y con
# --- un tratamiento tipografico distinto ---------------------------
#
# En la referencia las palabras no aparecen siempre en el mismo lugar
# ni con la misma letra: cada una entra volando desde un borde o una
# esquina y cambia de tratamiento (serif italica elegante / sans negra
# en mayuscula / sans fina / palabra con caja de acento detras). Eso es
# lo que da la sensacion de que nunca se queda quieto.
#
# Estilo y direccion se eligen por INDICE de palabra, nunca al azar: el
# mismo guion tiene que rendir siempre igual.
# Como entra la palabra. Se cicla por indice con un paso distinto al
# de estilos y direcciones (5, contra 6 y 3) para que las tres cosas no
# vuelvan a coincidir hasta muy adelante.
TIPOS_ENTRADA = ["desliza", "escala", "desliza", "giro", "escala"]

DIRECCIONES_PALABRA = [
    (0.0, 1.0), (0.0, -1.0), (-1.0, 0.0), (1.0, 0.0),
    (-1.0, -1.0), (1.0, 1.0), (1.0, -1.0), (-1.0, 1.0),
]

# esc = cuerpo relativo. La variedad de TAMAÑO es la mitad del efecto:
# una palabra chiquita seguida de una enorme se lee como un golpe.
ESTILOS_PALABRA = [
    {"serif": True,  "italica": True,  "ligera": False, "mayus": False, "caja": False, "esc": 1.00},
    {"serif": False, "italica": False, "ligera": False, "mayus": True,  "caja": False, "esc": 0.82},
    {"serif": True,  "italica": True,  "ligera": False, "mayus": False, "caja": False, "esc": 1.20},
    {"serif": False, "italica": False, "ligera": True,  "mayus": False, "caja": False, "esc": 0.90},
    {"serif": False, "italica": False, "ligera": False, "mayus": True,  "caja": True,  "esc": 0.70},
    {"serif": True,  "italica": True,  "ligera": False, "mayus": False, "caja": False, "esc": 0.92},
]


# ============ CAPTIONS EN CASCADA (arriba -> abajo) ============
# Pedido explicito del operador, y distinto de todo lo que habia:
# 'captions_palabra_por_palabra' muestra UNA palabra quieta a media
# altura, y dibujar_palabra_cinetica() la hace entrar volando desde un
# borde. Ninguno de los dos hace lo que se pidio: que la palabra
# APAREZCA ARRIBA y VAYA BAJANDO hasta el fondo mientras la siguiente
# entra atras, cada una con una tipografia distinta.
#
# El resultado se lee como una columna viva: lo ultimo que se dijo esta
# arriba, grande y nitido; lo dicho hace un segundo va cayendo, se
# achica y se apaga; lo de hace tres se va por abajo del cuadro. La
# frase entera esta en pantalla todo el tiempo, pero la jerarquia dice
# cual es el AHORA.
#
# Se activa por segmento con "captions_cascada": true.

# ============ RITMO DE FLASHES ============
# 'flash' es por segmento y solo lava la ENTRADA del plano. El operador
# pidio otra cosa: un pulso de flashes que corre a lo largo de TODO el
# video, cada 0.7 / 1.5 / 2.5 segundos, independiente de donde caigan
# los cortes. Eso es lo que hace que el video respire a un ritmo propio
# en vez de solo marcar los cambios de plano.
#
# En el guion (nivel raiz, no por segmento):
#     "flash_ritmo": 1.5              -> uno cada 1.5s
#     "flash_ritmo": [0.7, 2.5, 1.5]  -> cicla los intervalos
#     "flash_ritmo_largo": 0.09       -> cuanto dura cada uno
#     "flash_ritmo_color": [255,255,255]

def _tiempos_flash_ritmo(cfg):
    """Momentos absolutos (en segundos) donde cae un flash. Se calcula
    una vez y se guarda en cfg; con 'fork' cada trabajador del pool
    hereda el calculo hecho."""
    if "_flash_tiempos" in cfg:
        return cfg["_flash_tiempos"]
    ritmo = cfg.get("flash_ritmo")
    dur = cfg.get("_dur_total") or 0
    tiempos = []
    if ritmo and dur:
        pasos = [float(x) for x in (ritmo if isinstance(ritmo, (list, tuple))
                                    else [ritmo]) if float(x) > 0.05]
        if pasos:
            t, i = pasos[0], 0
            # Arranca en el primer intervalo, no en 0: en 0 ya esta el
            # flash de entrada del primer plano y se superpondrian.
            while t < dur:
                tiempos.append(round(t, 3))
                i += 1
                t += pasos[i % len(pasos)]
    cfg["_flash_tiempos"] = tiempos
    return tiempos


def aplicar_flash_ritmo(img, t_abs, cfg):
    """Lava el cuadro si 't_abs' cae dentro de un flash del pulso."""
    tiempos = _tiempos_flash_ritmo(cfg)
    if not tiempos:
        return img
    largo = float(cfg.get("flash_ritmo_largo", 0.09))
    if largo <= 0:
        return img
    for ft in tiempos:
        if ft <= t_abs < ft + largo:
            k = (1.0 - (t_abs - ft) / largo) ** 2
            color = tuple(cfg.get("flash_ritmo_color", (255, 255, 255)))
            return Image.blend(img, Image.new("RGB", img.size, color),
                               min(0.9, k))
        if ft > t_abs:
            break
    return img


def aplicar_flash(img, seg, t):
    """Lava los primeros cuadros del segmento hacia blanco (o el color
    que pida el guion). Es lo que se lee como "aparecio de la nada": el
    ojo pierde la escena anterior por dos o tres cuadros y cuando
    vuelve la nueva ya esta puesta, sin ver el cambio.

    JSON: "flash": true  (0.10s) o "flash": 0.16 para uno mas largo.
          "flash_color": [255,255,255] por defecto.
    """
    fl = seg.get("flash")
    if not fl:
        return img
    largo = 0.10 if fl is True else float(fl)
    if largo <= 0:
        return img
    dur = float(seg.get("duracion", 2.0)) or 2.0
    ts = t * dur
    if ts >= largo:
        return img
    # Cae al cuadrado: golpea fuerte y se va rapido, en vez de dejar
    # medio plano lavado.
    k = (1.0 - ts / largo) ** 2
    color = tuple(seg.get("flash_color", (255, 255, 255)))
    return Image.blend(img, Image.new("RGB", img.size, color), min(0.94, k))


def dibujar_palabra_cinetica(img, d, palabra, clave, lt, idx, pal, cy,
                             tam_base=104, ancho_max=None,
                             col_normal=(255, 255, 255), sombra=True):
    """UNA palabra, centrada en 'cy', que ENTRA volando desde un borde o
    esquina distinta cada vez y con un tratamiento tipografico distinto
    cada vez. Reemplaza al texto quieto que se limitaba a aparecer."""
    if not palabra:
        return
    est = ESTILOS_PALABRA[idx % len(ESTILOS_PALABRA)]
    # Direccion desfasada respecto del estilo: 6 estilos y 8 direcciones
    # avanzando de a 3 no vuelven a coincidir hasta la palabra 24, asi
    # que no se percibe un patron.
    dxu, dyu = DIRECCIONES_PALABRA[(idx * 3) % len(DIRECCIONES_PALABRA)]

    txt = palabra.upper() if est["mayus"] else palabra
    ancho_max = ancho_max or (W - 170)
    tam = max(30, int(tam_base * est["esc"]))
    f = fnt(tam, ligera=est["ligera"], serif=est["serif"], italica=est["italica"])
    while d.textbbox((0, 0), txt, font=f)[2] > ancho_max and tam > 34:
        tam -= 6
        f = fnt(tam, ligera=est["ligera"], serif=est["serif"], italica=est["italica"])

    # Entrada en el primer 26% de la palabra. eo_back se pasa un poco y
    # vuelve: ese rebote es lo que hace que "aparezca de golpe" en vez
    # de deslizarse suave.
    e = eo_back(min(1.0, lt / 0.26))
    alpha = int(255 * min(1.0, lt / 0.14))
    # Tres formas de entrar, no solo una. Desplazarse siempre igual,
    # aunque cambie el borde de origen, termina leyendose como un solo
    # efecto repetido; el golpe de escala y el enderezado dan dos
    # sensaciones distintas con el mismo motor.
    tipo = TIPOS_ENTRADA[(idx * 5) % len(TIPOS_ENTRADA)]
    ox = oy = 0.0
    escala, giro = 1.0, 0.0
    if tipo == "desliza":
        desliz = (1.0 - e) * (150 if (dxu and dyu) else 215)
        ox, oy = dxu * desliz, dyu * desliz
    elif tipo == "escala":
        # entra grande y se acomoda: golpe seco
        escala = 1.0 + (1.0 - e) * 0.55
    else:  # "giro" -- entra torcida y se endereza
        giro = (1.0 - e) * 9.0 * (1 if dxu >= 0 else -1)
        ox = dxu * (1.0 - e) * 70

    x0, y0, x1, y1 = d.textbbox((0, 0), txt, font=f)
    tw, th = x1 - x0, y1 - y0
    pad = 28
    col = tuple(pal["destacado"]) if clave else tuple(col_normal)

    capa = Image.new("RGBA", (tw + pad * 2 + 12, th + pad * 2 + 12), (0, 0, 0, 0))
    dc = ImageDraw.Draw(capa)
    px, py = pad - x0, pad - y0
    if est["caja"]:
        dc.rounded_rectangle([pad - 20, pad - 12, pad + tw + 20, pad + th + 18],
                             radius=10, fill=tuple(pal["destacado"]) + (alpha,))
        col = (12, 12, 14)
    elif sombra:
        dc.text((px + 6, py + 6), txt, font=f, fill=(0, 0, 0, int(alpha * 0.55)))
    dc.text((px, py), txt, font=f, fill=tuple(col) + (alpha,))

    if giro:
        capa = capa.rotate(giro, resample=Image.BICUBIC, expand=True)
    if escala != 1.0:
        capa = capa.resize((max(1, int(capa.width * escala)),
                            max(1, int(capa.height * escala))),
                           Image.BICUBIC)
    img.paste(capa, (int((W - capa.width) / 2 + ox),
                     int(cy - capa.height / 2 + oy)), capa)


_CUADROS_VIDEO = {}


def _cuadros_video(ruta, fps):
    """Lista de cuadros ya extraidos de un clip, en orden.

    El motor dibuja cuadro por cuadro con Pillow, asi que no puede
    "leer video" -- se extraen los cuadros una vez a JPG y despues cada
    plano elige el que le toca. Se extrae a una carpeta temporal y se
    renombra al final: si dos procesos del pool piden el mismo clip a
    la vez, el peor caso es trabajo duplicado, nunca una carpeta a
    medio llenar.
    """
    clave = (str(ruta), int(fps))
    if clave in _CUADROS_VIDEO:
        return _CUADROS_VIDEO[clave]
    base = Path(tempfile.gettempdir()) / "metraje_cuadros"
    destino = base / f"{Path(ruta).stem}-{int(fps)}"
    if not destino.exists():
        tmp = base / f".{Path(ruta).stem}-{int(fps)}-{os.getpid()}"
        tmp.mkdir(parents=True, exist_ok=True)
        r = subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(ruta),
             "-vf", f"fps={int(fps)}", "-q:v", "3",
             str(tmp / "c%04d.jpg")], capture_output=True, text=True)
        if r.returncode != 0:
            shutil.rmtree(tmp, ignore_errors=True)
            _CUADROS_VIDEO[clave] = []
            return []
        try:
            tmp.rename(destino)
        except OSError:
            # otro proceso llego primero: su carpeta sirve igual
            shutil.rmtree(tmp, ignore_errors=True)
    cuadros = sorted(destino.glob("c*.jpg"))
    _CUADROS_VIDEO[clave] = cuadros
    return cuadros


def _cuadro_medio(img, seg, caja, t=0.0):
    """Dibuja el metraje del segmento dentro de 'caja' (x0,y0,x1,y1),
    recortando para llenar sin deformar. Acepta un clip de video
    ("video") o una foto ("imagen"/"foto"). Si no hay nada, deja la
    caja vacia (el fondo de la maqueta se ve igual).

    El clip avanza a su velocidad REAL, no estirado al largo del plano:
    un clip de 8s metido en un plano de 2s se veria en camara rapida.
    Si el plano dura mas que el clip, el ultimo cuadro se congela."""
    vid = seg.get("video")
    if vid and Path(vid).exists():
        fps = seg.get("_fps", 30)
        cuadros = _cuadros_video(vid, fps)
        if cuadros:
            dur = float(seg.get("duracion", 2.0)) or 2.0
            i = min(len(cuadros) - 1, max(0, int(t * dur * fps)))
            try:
                im = Image.open(cuadros[i]).convert("RGB")
                _pegar_encuadrado(img, im, caja)
                return
            except Exception:
                pass
    ruta = seg.get("imagen") or seg.get("foto")
    if not ruta or not Path(ruta).exists():
        return
    try:
        im = Image.open(ruta).convert("RGB")
    except Exception:
        return
    _pegar_encuadrado(img, im, caja)


def _pegar_encuadrado(img, im, caja):
    """Escala para LLENAR la caja sin deformar y recorta el sobrante."""
    x0, y0, x1, y1 = caja
    cw, ch = x1 - x0, y1 - y0
    esc = max(cw / im.width, ch / im.height)
    im = im.resize((max(1, int(im.width * esc)), max(1, int(im.height * esc))),
                   Image.LANCZOS)
    ox = (im.width - cw) // 2
    oy = (im.height - ch) // 2
    img.paste(im.crop((ox, oy, ox + cw, oy + ch)), (x0, y0))


def f_pleno(img, d, seg, t, pal):
    """MAQUETA A -- metraje a sangre completa y UNA palabra en serif
    italica encima, centrada.

    Es la mitad del contraste que hace funcionar la referencia: cuadro
    oscuro, tipografia elegante, una idea por vez. La otra mitad es
    f_tarjeta (fondo blanco). Alternar las dos ES la transicion de
    flash -- no hace falta un efecto aparte, el salto de un cuadro casi
    negro a uno casi blanco ya lo produce.

    JSON: {"formato": "pleno", "imagen": "...", "narracion": "..."}
    """
    _cuadro_medio(img, seg, (0, 0, W, H), t)
    # Oscurecido general para que la palabra blanca siempre se lea
    velo = Image.new("RGB", (W, H), (0, 0, 0))
    img.paste(Image.blend(img, velo, seg.get("velo", 0.34)), (0, 0))

    # Si el segmento ya lleva el subtitulo palabra-por-palabra, esa capa
    # se dibuja sola despues y sobre el mismo texto: dibujar tambien la
    # palabra del plano ponia DOS palabras distintas de la misma frase
    # en pantalla al mismo tiempo.
    if seg.get("captions_palabra_por_palabra"):
        return
    palabra, clave, lt, idx = _palabra_activa(seg, t)
    if not palabra:
        return
    dibujar_palabra_cinetica(img, d, palabra, clave, lt,
                             idx + _semilla_seg(seg), pal,
                             H * seg.get("y_palabra", 0.46), tam_base=104)


def f_tarjeta(img, d, seg, t, pal):
    """MAQUETA B -- fondo blanco liso, titulo en sans negra mayuscula
    arriba, y el metraje metido en una tarjeta redondeada al medio.

    Es el reverso exacto de f_pleno. Saltar de una a otra produce el
    golpe de luz que en la referencia se lee como flash de foto.

    JSON: {"formato": "tarjeta", "texto": "SALCHICHA", "imagen": "..."}
    """
    img.paste(Image.new("RGB", (W, H), seg.get("fondo_tarjeta", (247, 247, 245))),
              (0, 0))

    titulo = seg.get("texto", "")
    y_card = 300
    if titulo:
        ft, lt_ = auto_tam(d, titulo.upper() if seg.get("mayus", True) else titulo,
                           W - 160, 210, 96)
        y = 150
        for ln in lt_:
            wl = d.textbbox((0, 0), ln, font=ft)[2]
            d.text(((W - wl) / 2, y), ln, font=ft, fill=(16, 16, 18))
            y += ft.size + 12
        y_card = max(300, y + 60)

    cx0, cx1 = 96, W - 96
    alto = min(H - y_card - 190, int((cx1 - cx0) * 1.28))
    if alto < 160:
        return
    caja = (cx0, int(y_card), cx1, int(y_card + alto))
    # La tarjeta se arma aparte y se pega con una mascara de rectangulo
    # redondeado. Antes intentaba redondear repintando las cuatro puntas
    # con circulos y salia al reves: dejaba un circulo oscuro en cada
    # esquina en vez de recortarla.
    cw, ch = cx1 - cx0, alto
    tarjeta = Image.new("RGB", (cw, ch), (232, 232, 230))
    _cuadro_medio(tarjeta, seg, (0, 0, cw, ch), t)
    mascara = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, cw - 1, ch - 1],
                                              radius=34, fill=255)
    img.paste(tarjeta, (cx0, int(y_card)), mascara)

    palabra, clave, lt2, idx2 = _palabra_activa(seg, t)
    if palabra:
        dibujar_palabra_cinetica(img, d, palabra, clave, lt2,
                                 idx2 + _semilla_seg(seg), pal,
                                 caja[3] + 76, tam_base=64,
                                 ancho_max=W - 200,
                                 col_normal=(16, 16, 18), sombra=False)


def f_declaracion(img, d, seg, t, pal):
    """Tipografia a sangre. El texto ES la composicion."""
    txt = seg["texto"].upper() if seg.get("mayus", True) else seg["texto"]
    if seg.get("karaoke"):
        f, ls = auto_tam(d, txt, W - 120, H * 0.62, 150)
        karaoke(d, txt, f, (60, H * 0.18, W - 60, H * 0.82), pal, t)
        e = eo_expo(min(1.0, t / 0.4))
        d.rectangle([80, 80, 80 + int(120 * e), 88],
                    fill=tuple(pal["destacado"]))
        return
    # Si el segmento usa captions kinetic palabra por palabra, esas ya
    # muestran el texto (una palabra grande a la vez, mas al estilo
    # 2026) -- dibujar tambien el parrafo completo aca duplica el
    # texto y lo satura. Se deja solo la marca de esquina.
    if not seg.get("captions_palabra_por_palabra"):
        f, ls = auto_tam(d, txt, W - 120, H * 0.62, 200)
        alto_l = f.size + f.size * 0.14
        y = (H - len(ls) * alto_l) / 2
        n = sum(len(l.split()) for l in ls)
        idx = 0
        for ln in ls:
            wl = d.textbbox((0, 0), ln, font=f)[2]
            x = (W - wl) / 2
            for p in ln.split():
                idx += 1
                d0 = (idx - 1) / max(1, n) * 0.34
                lt = max(0.0, min(1.0, (t - d0) / 0.26))
                if lt <= 0:
                    x += d.textbbox((0, 0), p + " ", font=f)[2]
                    continue
                esc = 0.82 + 0.18 * eo_back(lt)
                fu = fnt(int(f.size * esc))
                sombra_t(d, (x, y + (f.size - fu.size) / 2), p, fu,
                       tuple(pal["texto"]), 6)
                x += d.textbbox((0, 0), p + " ", font=f)[2]
            y += alto_l
    # Marca de esquina minima
    e = eo_expo(min(1.0, t / 0.4))
    d.rectangle([80, 80, 80 + int(120 * e), 88], fill=tuple(pal["destacado"]))


def f_dato_duro(img, d, seg, t, pal):
    """Jerarquia extrema: numero gigante, contexto en cuerpo fino."""
    num = str(seg.get("numero", 47)) + seg.get("sufijo", "")
    e = eo_expo(min(1.0, t / 0.55))
    try:
        val = int(float(seg.get("numero", 47)) * e)
        num_anim = f"{val:,}".replace(",", ".") + seg.get("sufijo", "")
    except (TypeError, ValueError):
        num_anim = num
    fn = fnt(340)
    wn = d.textbbox((0, 0), num_anim, font=fn)[2]
    while wn > W - 140:
        fn = fnt(int(fn.size * 0.9))
        wn = d.textbbox((0, 0), num_anim, font=fn)[2]
    y = H * 0.30
    sombra_t(d, ((W - wn) / 2, y), num_anim, fn, tuple(pal["destacado"]), 8)
    # Regla fina
    er = eo_expo(max(0.0, min(1.0, (t - 0.3) / 0.4)))
    ry = y + fn.size * 1.12
    d.rectangle([(W - 420 * er) / 2, ry, (W + 420 * er) / 2, ry + 4],
                fill=tuple(pal["texto"]))
    # Contexto en tipografia ligera (contraste de peso = elegancia)
    fc, lc = auto_tam(d, seg["texto"], W - 260, 300, 54, ligera=True)
    yc = ry + 60
    ac = eo_cubic(max(0.0, min(1.0, (t - 0.42) / 0.4)))
    for ln in lc:
        wl = d.textbbox((0, 0), ln, font=fc)[2]
        col = tuple(int(f + (c - f) * ac)
                    for f, c in zip(pal["fondo"], (185, 185, 200)))
        d.text(((W - wl) / 2, yc), ln, font=fc, fill=col)
        yc += fc.size + 16


def f_division(img, d, seg, t, pal):
    """Pantalla partida real: dos mitades opuestas."""
    izq = seg.get("izquierda", {"titulo": "ANTES", "texto": "Publicar y esperar",
                                "valor": "12"})
    der = seg.get("derecha", {"titulo": "DESPUES", "texto": "Un canal, 30 dias",
                              "valor": "340"})
    e = eio(min(1.0, t / 0.45))
    corte = int(H * 0.5)
    # Mitad superior: apagada. Inferior: acento.
    d.rectangle([0, 0, W, corte], fill=tuple(min(255, c + 10)
                                             for c in pal["fondo"]))
    d.rectangle([0, corte, W, H], fill=tuple(pal["destacado"]))
    # Linea divisoria que se dibuja
    d.rectangle([0, corte - 4, int(W * e), corte + 4], fill=(255, 255, 255))
    for i, (blq, col_t, col_s, y0) in enumerate([
            (izq, (170, 170, 188), tuple(pal["texto"]), 0),
            (der, (30, 22, 20), (14, 14, 18), corte)]):
        dy = int(70 * (1 - eo_expo(max(0.0, min(1.0, (t - i * 0.14) / 0.5)))))
        ft = fnt(40)
        d.text((90, y0 + 120 + dy), blq.get("titulo", "").upper(), font=ft,
               fill=col_t)
        fv = fnt(170)
        val = blq.get("valor", "")
        d.text((90, y0 + 190 + dy), val, font=fv, fill=col_s)
        fx, lx = auto_tam(d, blq.get("texto", ""), W - 400, 200, 52)
        yy = y0 + 240 + dy
        for ln in lx:
            wl = d.textbbox((0, 0), ln, font=fx)[2]
            d.text((W - 90 - wl, yy), ln, font=fx, fill=col_s)
            yy += fx.size + 12


def f_revelacion(img, d, seg, t, pal):
    """Estado A -> mascara animada -> estado B."""
    a = seg.get("antes", "Sin plan")
    b = seg.get("despues", "Con plan")
    capa = Image.new("RGB", (W, H), tuple(pal["destacado"]))
    dc = ImageDraw.Draw(capa)
    fb, lb = auto_tam(dc, b, W - 200, H * 0.4, 130)
    yb = (H - len(lb) * (fb.size + 18)) / 2
    for ln in lb:
        wl = dc.textbbox((0, 0), ln, font=fb)[2]
        dc.text(((W - wl) / 2, yb), ln, font=fb, fill=(14, 14, 18))
        yb += fb.size + 18
    fa, la = auto_tam(d, a, W - 200, H * 0.4, 130)
    ya = (H - len(la) * (fa.size + 18)) / 2
    for ln in la:
        wl = d.textbbox((0, 0), ln, font=fa)[2]
        sombra_t(d, ((W - wl) / 2, ya), ln, fa, tuple(pal["texto"]), 5)
        ya += fa.size + 18
    e = eio(max(0.0, min(1.0, (t - 0.28) / 0.44)))
    if e > 0:
        m = Image.new("L", (W, H), 0)
        dm = ImageDraw.Draw(m)
        # Barrido diagonal
        x = int(-W * 0.3 + e * W * 1.4)
        dm.polygon([(0, H), (x, H), (x + 280, 0), (0, 0)], fill=255)
        img.paste(capa, (0, 0), m)
        d2 = ImageDraw.Draw(img)
        if 0 < e < 1:
            d2.line([(x, H), (x + 280, 0)], fill=(255, 255, 255), width=6)


def f_cronologia(img, d, seg, t, pal):
    """Linea de tiempo con hitos que se encienden en secuencia."""
    hitos = seg.get("hitos", ["Dia 1", "Dia 7", "Dia 14", "Dia 30"])
    vals = seg.get("valores", ["0", "3", "11", "61"])
    ft, lt = auto_tam(d, seg["texto"], W - 180, 260, 76)
    y = 240
    for ln in lt:
        wl = d.textbbox((0, 0), ln, font=ft)[2]
        sombra_t(d, ((W - wl) / 2, y), ln, ft, tuple(pal["texto"]))
        y += ft.size + 14
    ly = H * 0.60
    x0, x1 = 130, W - 130
    ventana = min(0.94, 0.7 * _factor_estiro(seg, 2.5))
    e = eo_cubic(min(1.0, t / ventana))
    d.line([(x0, ly), (x1, ly)], fill=(56, 56, 72), width=6)
    d.line([(x0, ly), (x0 + (x1 - x0) * e, ly)],
           fill=tuple(pal["destacado"]), width=6)
    n = len(hitos)
    fh, fv = fnt(36), fnt(58)
    for i, h in enumerate(hitos):
        px = x0 + (x1 - x0) * i / max(1, n - 1)
        ap = (i / max(1, n - 1))
        on = e >= ap - 0.02
        r = 20 if on else 13
        col = tuple(pal["destacado"]) if on else (60, 60, 78)
        if on:
            halo = 34 + 6 * math.sin(t * 10 + i)
            d.ellipse([px - halo, ly - halo, px + halo, ly + halo],
                      outline=tuple(pal["destacado"]), width=2)
        d.ellipse([px - r, ly - r, px + r, ly + r], fill=col)
        wh = d.textbbox((0, 0), h, font=fh)[2]
        d.text((px - wh / 2, ly + 52), h, font=fh,
               fill=(165, 165, 182) if on else (80, 80, 96))
        if on and i < len(vals):
            wv = d.textbbox((0, 0), vals[i], font=fv)[2]
            sombra_t(d, (px - wv / 2, ly - 120), vals[i], fv,
                   tuple(pal["texto"]), 4)


def f_conteo(img, d, seg, t, pal):
    """Cuenta regresiva: un item por vez, grande."""
    items = seg.get("items", ["Sin nicho", "Sin canal", "Sin medicion"])
    n = len(items)
    seg_dur = 1.0 / n
    i = min(n - 1, int(t / seg_dur))
    lt = (t - i * seg_dur) / seg_dur
    num = str(n - i)
    fn = fnt(420)
    wn = d.textbbox((0, 0), num, font=fn)[2]
    e = eo_back(min(1.0, lt / 0.3))
    fu = fnt(max(20, int(fn.size * (0.6 + 0.4 * e))))
    wu = d.textbbox((0, 0), num, font=fu)[2]
    col = tuple(int(f + (c - f) * 0.22)
                for f, c in zip(pal["fondo"], pal["destacado"]))
    d.text(((W - wu) / 2, H * 0.18), num, font=fu, fill=col)
    ft, lts = auto_tam(d, items[i], W - 200, 340, 96)
    y = H * 0.56
    for ln in lts:
        wl = d.textbbox((0, 0), ln, font=ft)[2]
        dy = int(50 * (1 - eo_expo(min(1.0, lt / 0.28))))
        sombra_t(d, ((W - wl) / 2, y + dy), ln, ft, tuple(pal["texto"]))
        y += ft.size + 16
    # Puntos de progreso
    for k in range(n):
        cx = W / 2 - (n - 1) * 22 + k * 44
        r = 9 if k == i else 6
        d.ellipse([cx - r, H - 130 - r, cx + r, H - 130 + r],
                  fill=tuple(pal["destacado"]) if k <= i else (62, 62, 78))


def f_pregunta(img, d, seg, t, pal):
    """Pregunta, pausa deliberada, respuesta de golpe."""
    q = seg.get("pregunta", seg["texto"])
    a = seg.get("respuesta", "")
    fq, lq = auto_tam(d, q, W - 180, 380, 78)
    y = H * 0.24
    aq = eo_cubic(min(1.0, t / 0.3))
    for ln in lq:
        wl = d.textbbox((0, 0), ln, font=fq)[2]
        col = tuple(int(f + (c - f) * aq)
                    for f, c in zip(pal["fondo"], (175, 175, 192)))
        d.text(((W - wl) / 2, y), ln, font=fq, fill=col)
        y += fq.size + 14
    # Pausa: nada pasa entre 0.30 y 0.55 -> el silencio genera tension
    if t < 0.55:
        pulso = abs(math.sin(t * 6))
        r = 7 + 3 * pulso
        for k in range(3):
            cx = W / 2 - 44 + k * 44
            d.ellipse([cx - r, H * 0.52 - r, cx + r, H * 0.52 + r],
                      fill=tuple(int(f + (c - f) * (0.3 + 0.7 * pulso))
                                 for f, c in zip(pal["fondo"], pal["destacado"])))
        return
    lt = (t - 0.55) / 0.45
    fa, la = auto_tam(d, a, W - 160, 520, 130)
    ya = H * 0.52
    e = eo_back(min(1.0, lt / 0.3))
    for ln in la:
        fu = fnt(max(20, int(fa.size * (0.7 + 0.3 * e))))
        wl = d.textbbox((0, 0), ln, font=fu)[2]
        sombra_t(d, ((W - wl) / 2, ya), ln, fu, tuple(pal["destacado"]), 7)
        ya += fa.size + 16


def f_editorial(img, d, seg, t, pal):
    """Composicion de revista: grilla asimetrica, espacio negativo."""
    e = eo_expo(min(1.0, t / 0.4))
    # Numero de seccion arriba a la derecha
    fnum = fnt(150)
    nn = seg.get("indice", "01")
    wn = d.textbbox((0, 0), nn, font=fnum)[2]
    col_tenue = tuple(min(255, c + 26) for c in pal["fondo"])
    d.text((W - 90 - wn, 130), nn, font=fnum, fill=col_tenue)
    # Kicker + regla
    if seg.get("kicker"):
        d.text((90, 150), seg["kicker"].upper(), font=fnt(34),
               fill=tuple(pal["destacado"]))
    d.rectangle([90, 205, 90 + int((W - 400) * e), 209],
                fill=tuple(pal["destacado"]))
    # Titular alineado a izquierda, mucho aire abajo
    ft, lt = auto_tam(d, seg["texto"], W - 260, 560, 104)
    y = 300
    n = sum(len(l.split()) for l in lt)
    idx = 0
    for ln in lt:
        x = 90
        for p in ln.split():
            idx += 1
            d0 = (idx - 1) / max(1, n) * 0.3
            a_ = max(0.0, min(1.0, (t - d0) / 0.25))
            if a_ <= 0:
                x += d.textbbox((0, 0), p + " ", font=ft)[2]
                continue
            dy = int(28 * (1 - eo_expo(a_)))
            sombra_t(d, (x, y + dy), p, ft, tuple(pal["texto"]))
            x += d.textbbox((0, 0), p + " ", font=ft)[2]
        y += ft.size + 16
    # Pie: linea fina + texto secundario
    if seg.get("pie"):
        py = H - 320
        d.rectangle([90, py, 90 + int(180 * e), py + 3],
                    fill=tuple(pal["destacado"]))
        fp, lp = auto_tam(d, seg["pie"], W - 260, 220, 44, ligera=True)
        yy = py + 34
        for ln in lp:
            d.text((90, yy), ln, font=fp, fill=(160, 160, 178))
            yy += fp.size + 10



def f_cita(img, d, seg, t, pal):
    """Cita destacada: comillas gigantes, atribucion. Autoridad social."""
    e = eo_expo(min(1.0, t / 0.4))
    fq = fnt(340)
    d.text((70, 180), '"', font=fq,
           fill=tuple(min(255, c + 30) for c in pal["fondo"]))
    ft, lt = auto_tam(d, seg["texto"], W - 260, 620, 86)
    y = H * 0.34
    n = sum(len(l.split()) for l in lt); idx = 0
    for ln in lt:
        x = 130
        for pw_ in ln.split():
            idx += 1
            a_ = max(0.0, min(1.0, (t - (idx - 1) / max(1, n) * 0.34) / 0.26))
            if a_ <= 0:
                x += d.textbbox((0, 0), pw_ + " ", font=ft)[2]; continue
            dy = int(24 * (1 - eo_expo(a_)))
            sombra_t(d, (x, y + dy), pw_, ft, tuple(pal["texto"]))
            x += d.textbbox((0, 0), pw_ + " ", font=ft)[2]
        y += ft.size + 16
    if seg.get("autor"):
        ay = y + 60
        d.rectangle([130, ay, 130 + int(90 * e), ay + 4],
                    fill=tuple(pal["destacado"]))
        d.text((130, ay + 26), seg["autor"], font=fnt(42, True),
               fill=(170, 170, 188))


def f_pasos(img, d, seg, t, pal):
    """Proceso paso a paso: cada paso se ilumina en secuencia."""
    pasos = seg.get("pasos", ["Investigar", "Crear", "Publicar", "Medir"])
    ft, lt = auto_tam(d, seg.get("texto", ""), W - 200, 200, 64)
    y = 220
    for ln in lt:
        wl = d.textbbox((0, 0), ln, font=ft)[2]
        sombra_t(d, ((W - wl) / 2, y), ln, ft, tuple(pal["texto"]))
        y += ft.size + 12
    n = len(pasos)
    top = H * 0.34
    alto = (H * 0.52) / n
    fp = fnt(52); fnm = fnt(38)
    for i, ps in enumerate(pasos):
        ap = i / max(1, n)
        act = t >= ap
        e = eo_back(max(0.0, min(1.0, (t - ap) / 0.2)))
        yy = top + i * alto
        dx = int(70 * (1 - max(0, e)))
        col = tuple(pal["destacado"]) if act else (52, 52, 66)
        d.rounded_rectangle([120 - dx, yy, W - 120 - dx, yy + alto - 26],
                            radius=18,
                            fill=tuple(min(255, c + 10) for c in pal["fondo"]),
                            outline=col, width=4)
        cy = yy + (alto - 26) / 2
        d.ellipse([160 - dx, cy - 30, 220 - dx, cy + 30], fill=col)
        bb = d.textbbox((0, 0), str(i + 1), font=fnm)
        d.text((190 - dx - (bb[2] - bb[0]) / 2 - bb[0],
                cy - (bb[3] - bb[1]) / 2 - bb[1]), str(i + 1), font=fnm,
               fill=(14, 14, 18) if act else (120, 120, 140))
        d.text((260 - dx, cy - fp.size * 0.55), ps, font=fp,
               fill=tuple(pal["texto"]) if act else (110, 110, 130))
        if i < n - 1 and act:
            d.polygon([(W / 2 - 12, yy + alto - 24), (W / 2 + 12, yy + alto - 24),
                       (W / 2, yy + alto - 6)], fill=col)


def f_ranking(img, d, seg, t, pal):
    """Top N con barras horizontales que crecen en carrera."""
    items = seg.get("items", [["Pinterest", 61], ["SEO", 34],
                              ["Reddit", 18], ["Ads", 9]])
    ft, lt = auto_tam(d, seg.get("texto", ""), W - 200, 180, 66)
    y = 230
    for ln in lt:
        wl = d.textbbox((0, 0), ln, font=ft)[2]
        sombra_t(d, ((W - wl) / 2, y), ln, ft, tuple(pal["texto"]))
        y += ft.size + 12
    mx = max(v for _, v in items) or 1
    n = len(items)
    top = H * 0.36; alto = (H * 0.46) / n
    fl, fv = fnt(46), fnt(52)
    for i, (nom, val) in enumerate(items):
        e = eo_expo(max(0.0, min(1.0, (t - i * 0.10) / 0.6)))
        yy = top + i * alto
        w = (W - 420) * (val / mx) * e
        col = tuple(pal["destacado"]) if i == 0 else (64, 64, 82)
        d.text((90, yy + 6), f"{i+1}", font=fl, fill=(120, 120, 142))
        d.rounded_rectangle([160, yy, 160 + max(8, w), yy + alto * 0.56],
                            radius=12, fill=col)
        d.text((178, yy + 8), nom, font=fl,
               fill=(14, 14, 18) if i == 0 else tuple(pal["texto"]))
        # El numero va DESPUES de la barra Y de la etiqueta: si el label
        # es mas ancho que la barra a mitad de animacion (comun con
        # texto largo), el numero no puede quedar pisandolo.
        wl_nom = d.textbbox((0, 0), nom, font=fl)[2]
        x_num = max(160 + max(8, w) + 22, 178 + wl_nom + 22)
        d.text((x_num, yy + 6), f"{int(val * e)}", font=fv,
               fill=tuple(pal["texto"]))


def f_alerta(img, d, seg, t, pal):
    """Advertencia: franjas diagonales, simbolo, pulso. Alta urgencia."""
    pulso = 0.5 + 0.5 * math.sin(t * 7)
    for x in range(-H, W + H, 90):
        d.polygon([(x, 0), (x + 44, 0), (x + 44 - H, H), (x - H, H)],
                  fill=tuple(min(255, c + int(14 + 8 * pulso))
                             for c in pal["fondo"]))
    e = eo_back(min(1.0, t / 0.32))
    r = int(120 * max(0.05, e))
    cx, cy = W / 2, H * 0.30
    d.ellipse([cx - r, cy - r, cx + r, cy + r],
              outline=tuple(pal["destacado"]), width=int(10 * max(0.1, e)))
    fs = fnt(int(150 * max(0.05, e)))
    bb = d.textbbox((0, 0), "!", font=fs)
    d.text((cx - (bb[2] - bb[0]) / 2 - bb[0], cy - (bb[3] - bb[1]) / 2 - bb[1]),
           "!", font=fs, fill=tuple(pal["destacado"]))
    ft, lt = auto_tam(d, seg["texto"], W - 180, 520, 92)
    y = H * 0.52
    a_ = eo_expo(max(0.0, min(1.0, (t - 0.2) / 0.35)))
    for ln in lt:
        wl = d.textbbox((0, 0), ln, font=ft)[2]
        dy = int(40 * (1 - a_))
        if a_ > 0:
            sombra_t(d, ((W - wl) / 2, y + dy), ln, ft, tuple(pal["texto"]))
        y += ft.size + 14


def f_panel(img, d, seg, t, pal):
    """Panel de 3-4 metricas: sensacion de reporte / dashboard."""
    datos = seg.get("datos", [["Vistas", "12.4k"], ["Clics", "890"],
                              ["Ventas", "47"], ["Conv.", "5.3%"]])
    ft, lt = auto_tam(d, seg.get("texto", ""), W - 200, 170, 62)
    y = 210
    for ln in lt:
        wl = d.textbbox((0, 0), ln, font=ft)[2]
        sombra_t(d, ((W - wl) / 2, y), ln, ft, tuple(pal["texto"]))
        y += ft.size + 10
    cols, top = 2, H * 0.34
    cw, ch_ = (W - 240) / cols, 300
    fv, fl = fnt(84), fnt(38)
    factor = _factor_estiro(seg, 3.6)
    for i, (lab, val) in enumerate(datos[:4]):
        e = eo_back(max(0.0, min(1.0, (t - i * 0.09 * factor) / (0.34 * factor))))
        cx = 120 + (i % cols) * cw
        cy = top + (i // cols) * (ch_ + 30)
        dy = int(40 * (1 - max(0, e)))
        d.rounded_rectangle([cx, cy + dy, cx + cw - 30, cy + ch_ + dy],
                            radius=22,
                            fill=tuple(min(255, c + 14) for c in pal["fondo"]),
                            outline=(58, 58, 74), width=3)
        d.text((cx + 34, cy + 44 + dy), lab.upper(), font=fl,
               fill=(150, 150, 170))
        col = tuple(pal["destacado"]) if i == 0 else tuple(pal["texto"])
        d.text((cx + 34, cy + 116 + dy), val, font=fv, fill=col)


def f_terminal(img, d, seg, t, pal):
    """Estetica de terminal: monoespaciado, cursor, tipeo real."""
    d.rounded_rectangle([70, H * 0.24, W - 70, H * 0.70], radius=18,
                        fill=(8, 10, 14), outline=(52, 56, 70), width=3)
    d.rectangle([70, H * 0.24, W - 70, H * 0.24 + 62], fill=(24, 26, 34))
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse([104 + i * 38, H * 0.24 + 22, 122 + i * 38, H * 0.24 + 40],
                  fill=c)
    lineas = seg.get("lineas", ["$ analizar --nicho", "> 47 productos",
                                "> 3 con ventas", "> causa: sin trafico"])
    f = fnt(44)
    y = H * 0.24 + 110
    total = sum(len(l) for l in lineas)
    escritos = int(total * min(1.0, t / 0.8))
    acc = 0
    for ln in lineas:
        if acc >= escritos:
            break
        vis = ln[:max(0, escritos - acc)]
        col = tuple(pal["destacado"]) if ln.startswith("$") else (200, 230, 210)
        d.text((116, y), vis, font=f, fill=col)
        if acc + len(ln) > escritos and int(t * 6) % 2 == 0:
            wv = d.textbbox((0, 0), vis, font=f)[2]
            d.rectangle([116 + wv + 4, y + 6, 116 + wv + 24, y + f.size],
                        fill=tuple(pal["destacado"]))
        acc += len(ln)
        y += f.size + 22
    if seg.get("texto"):
        ft, lt = auto_tam(d, seg["texto"], W - 200, 220, 62)
        yy = H * 0.76
        for ln in lt:
            wl = d.textbbox((0, 0), ln, font=ft)[2]
            sombra_t(d, ((W - wl) / 2, yy), ln, ft, tuple(pal["texto"]))
            yy += ft.size + 12



# ============ EFECTOS DE HOOK (primeros frames) ============
# Se aplican SOBRE el frame ya compuesto. El objetivo es romper el
# patron del scroll en el primer frame, no decorar.

def hk_flash(img, t, pal):
    """Destello blanco que se apaga rapido. Rompe el scroll."""
    if t > 0.09:
        return img
    a = 1 - t / 0.09
    return Image.blend(img, Image.new("RGB", (W, H), (255, 255, 255)), a * 0.85)


def hk_zoom_golpe(img, t, pal):
    """Entra sobredimensionado y se asienta: sensacion de impacto."""
    if t > 0.30:
        return img
    e = eo_expo(t / 0.30)
    z = 1.5 - 0.5 * e
    nw, nh = int(W * z), int(H * z)
    zz = img.resize((nw, nh), Image.LANCZOS)
    return zz.crop(((nw - W) // 2, (nh - H) // 2,
                    (nw - W) // 2 + W, (nh - H) // 2 + H))


def hk_glitch(img, t, pal):
    """Separacion RGB + bandas desplazadas: error digital."""
    if t > 0.26:
        return img
    f = 14 * (1 - t / 0.26)
    r, g, b = img.split()
    out = Image.merge("RGB", (ImageChops.offset(r, int(f), 0), g,
                              ImageChops.offset(b, -int(f), 0)))
    rnd = random.Random(int(t * 90))
    for _ in range(4):
        y0 = rnd.randint(0, H - 60)
        alto = rnd.randint(14, 54)
        banda = out.crop((0, y0, W, y0 + alto))
        out.paste(banda, (rnd.randint(-30, 30), y0))
    return out


def hk_sacudida(img, t, pal):
    """Shake de camara amortiguado."""
    if t > 0.24:
        return img
    a = (1 - t / 0.24) * 26
    dx = int(math.sin(t * 70) * a)
    dy = int(math.cos(t * 58) * a * 0.6)
    z = 1.06
    nw, nh = int(W * z), int(H * z)
    zz = img.resize((nw, nh), Image.LANCZOS)
    cx = max(0, min((nw - W) / 2 + dx, nw - W))
    cy = max(0, min((nh - H) / 2 + dy, nh - H))
    return zz.crop((int(cx), int(cy), int(cx) + W, int(cy) + H))


def hk_barras(img, t, pal):
    """Barras horizontales que se abren revelando el contenido."""
    if t > 0.34:
        return img
    e = eio(t / 0.34)
    out = img.copy()
    d = ImageDraw.Draw(out)
    n = 7
    alto = H / n
    for i in range(n):
        y0 = i * alto
        h = alto * (1 - e) / 2
        if h > 1:
            d.rectangle([0, y0, W, y0 + h], fill=tuple(pal["fondo"]))
            d.rectangle([0, y0 + alto - h, W, y0 + alto], fill=tuple(pal["fondo"]))
    return out


def hk_persiana(img, t, pal):
    """Bloques verticales que caen revelando. Estilo motion graphics."""
    if t > 0.38:
        return img
    out = img.copy()
    d = ImageDraw.Draw(out)
    n = 6
    an = W / n
    rnd = random.Random(3)
    for i in range(n):
        d0 = rnd.uniform(0, 0.14)
        e = eo_expo(max(0.0, min(1.0, (t - d0) / 0.24))) if t > d0 else 0.0
        h = H * (1 - e)
        if h > 1:
            d.rectangle([i * an, 0, (i + 1) * an, h],
                        fill=tuple(min(255, c + 8) for c in pal["fondo"]))
            d.rectangle([i * an, h - 5, (i + 1) * an, h],
                        fill=tuple(pal["destacado"]))
    return out


def hk_impacto(img, t, pal):
    """Golpe combinado: flash + punch-zoom + shake, todo en ~0.26s.
    Ni zoom_golpe (sin shake) ni sacudida (sin zoom) alcanzaban para
    el 'texto pega con un golpe' del hook/cierre de la gramatica de
    6 beats -- esto junta los tres en la MISMA ventana corta para que
    el SFX de impacto caiga exactamente cuando el texto aparece, no
    en una entrada suave."""
    dur = 0.26
    if t > dur:
        return img
    e = eo_expo(t / dur)
    if t < 0.05:
        img = Image.blend(img, Image.new("RGB", (W, H), (255, 255, 255)),
                          (1 - t / 0.05) * 0.55)
    z = 1.42 - 0.42 * e
    nw, nh = int(W * z), int(H * z)
    a = 1 - t / dur
    dx = int(math.sin(t * 80) * a * 22)
    dy = int(math.cos(t * 64) * a * 15)
    zz = img.resize((nw, nh), Image.LANCZOS)
    cx = max(0, min((nw - W) / 2 + dx, nw - W))
    cy = max(0, min((nh - H) / 2 + dy, nh - H))
    return zz.crop((int(cx), int(cy), int(cx) + W, int(cy) + H))


HOOKS = {"flash": hk_flash, "zoom_golpe": hk_zoom_golpe, "glitch": hk_glitch,
         "sacudida": hk_sacudida, "barras": hk_barras, "persiana": hk_persiana,
         "impacto": hk_impacto}



# ============ TRATAMIENTO DE IMAGEN (elegancia) ============
# El secreto de que una foto se vea "disenada" y no "pegada":
# duotono a la paleta + vineta + encuadre inteligente + marco.

def duotono(img, sombra, luz):
    """Mapea la imagen a dos colores de la paleta. Unifica cualquier
    foto con la identidad visual, sin importar de donde venga."""
    g = img.convert("L")
    paleta = []
    for i in range(256):
        f = i / 255
        paleta += [int(sombra[c] + (luz[c] - sombra[c]) * f) for c in range(3)]
    salida = Image.new("P", g.size)
    salida.putpalette(paleta)
    salida.paste(g, (0, 0))
    return salida.convert("RGB")


def vineta(img, fuerza=0.75):
    """Oscurece los bordes: enfoca la mirada al centro."""
    w, h = img.size
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    for i in range(60):
        f = i / 60
        r = int(255 * (1 - f * fuerza))
        pad = int(min(w, h) * 0.5 * f)
        d.ellipse([pad - w * 0.15, pad - h * 0.12,
                   w - pad + w * 0.15, h - pad + h * 0.12], fill=r)
    m = m.filter(ImageFilter.GaussianBlur(40))
    negro = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.composite(img, negro, m)


def encuadrar(img, w, h):
    """Recorta al centro conservando proporcion. Nunca deforma."""
    iw, ih = img.size
    if iw / ih > w / h:
        nh = h; nw = int(h * iw / ih)
    else:
        nw = w; nh = int(w * ih / iw)
    img = img.resize((nw, nh), Image.LANCZOS)
    return img.crop(((nw - w) // 2, (nh - h) // 2,
                     (nw - w) // 2 + w, (nh - h) // 2 + h))


def preparar_retrato(path, w, h, pal, cache):
    """Carga + encuadra + duotono + vineta. Devuelve None si falla."""
    if path in cache:
        base = cache[path]
    else:
        pth = Path(path)
        if not pth.exists():
            print(f"AVISO: no existe la imagen '{path}'.")
            cache[path] = None
            return None
        try:
            cache[path] = Image.open(pth).convert("RGB")
        except Exception as e:
            print(f"AVISO: no se pudo abrir '{path}' ({e}).")
            cache[path] = None
            return None
        base = cache[path]
    if base is None:
        return None
    img = encuadrar(base, w, h)
    sombra = tuple(min(255, int(c * 0.75 + 30)) for c in pal["fondo"])
    luz = tuple(min(255, int(c * 0.35 + 255 * 0.72)) for c in pal["destacado"])
    img = duotono(img, sombra, luz)
    return vineta(img, 0.32)


def f_retrato(img, d, seg, t, pal):
    """Retrato de un pensador: marco en arco clasico, nombre, fechas,
    cita. Es el formato para cuando la figura historica ES el tema."""
    cache = seg.setdefault("_cache", {})
    aw, ah = int(W * 0.62), int(W * 0.62 * 1.28)
    ax = (W - aw) // 2
    ay = int(H * 0.16)
    e = eo_expo(min(1.0, t / 0.5))

    ret = preparar_retrato(seg.get("imagen", ""), aw, ah, pal, cache) \
        if seg.get("imagen") else None

    # Marco en arco (medio punto arriba): lenguaje visual clasico
    marco = Image.new("L", (aw, ah), 0)
    dm = ImageDraw.Draw(marco)
    r = aw // 2
    dm.pieslice([0, 0, aw, aw], 180, 360, fill=255)
    dm.rectangle([0, r, aw, ah], fill=255)

    if ret is not None:
        # Ken Burns muy lento (el nicho pide ritmo meditativo)
        z = 1.0 + 0.05 * eio(t)
        zw, zh = int(aw * z), int(ah * z)
        zi = ret.resize((zw, zh), Image.LANCZOS).crop(
            ((zw - aw) // 2, (zh - ah) // 2,
             (zw - aw) // 2 + aw, (zh - ah) // 2 + ah))
        img.paste(zi, (ax, ay), marco)
    else:
        # Sin imagen: silueta de placeholder, no un hueco feo
        ph = Image.new("RGB", (aw, ah), tuple(min(255, c + 12)
                                              for c in pal["fondo"]))
        dp = ImageDraw.Draw(ph)
        dp.ellipse([aw * 0.28, ah * 0.16, aw * 0.72, ah * 0.60],
                   fill=tuple(min(255, c + 26) for c in pal["fondo"]))
        dp.ellipse([aw * 0.14, ah * 0.56, aw * 0.86, ah * 1.30],
                   fill=tuple(min(255, c + 26) for c in pal["fondo"]))
        img.paste(ph, (ax, ay), marco)

    # Contorno dorado del arco
    d.arc([ax, ay, ax + aw, ay + aw], 180, 360,
          fill=tuple(pal["destacado"]), width=4)
    d.line([(ax, ay + r), (ax, ay + ah)], fill=tuple(pal["destacado"]), width=4)
    d.line([(ax + aw, ay + r), (ax + aw, ay + ah)],
           fill=tuple(pal["destacado"]), width=4)
    d.line([(ax, ay + ah), (ax + aw, ay + ah)],
           fill=tuple(pal["destacado"]), width=4)

    # Nombre + fechas
    y = ay + ah + 46
    nombre = seg.get("nombre", "")
    if nombre:
        fn = fnt(66, serif=True)
        wn = d.textbbox((0, 0), nombre, font=fn)[2]
        sombra_t(d, ((W - wn) / 2, y), nombre, fn, tuple(pal["texto"]))
        y += fn.size + 10
    if seg.get("fechas"):
        ff = fnt(34, ligera=True)
        wf = d.textbbox((0, 0), seg["fechas"], font=ff)[2]
        d.text(((W - wf) / 2, y), seg["fechas"], font=ff,
               fill=tuple(pal["destacado"]))
        y += ff.size + 26

    # Regla dorada que se dibuja
    d.rectangle([(W - 260 * e) / 2, y, (W + 260 * e) / 2, y + 3],
                fill=tuple(pal["destacado"]))
    y += 34

    # Cita en serif
    if seg.get("texto"):
        fc, lc = auto_tam(d, seg["texto"], W - 200, H - y - 120, 56)
        fc = fnt(fc.size, serif=True)
        lc = envolver(d, seg["texto"], fc, W - 200)
        a_ = eo_cubic(max(0.0, min(1.0, (t - 0.35) / 0.4)))
        for ln in lc:
            wl = d.textbbox((0, 0), ln, font=fc)[2]
            col = tuple(int(f + (c - f) * a_)
                        for f, c in zip(pal["fondo"], pal["texto"]))
            d.text(((W - wl) / 2, y), ln, font=fc, fill=col)
            y += fc.size + 12


def f_galeria(img, d, seg, t, pal):
    """Varias figuras en fila que se encienden en secuencia.
    Para 'los 3 estoicos', comparaciones entre pensadores, etc."""
    figs = seg.get("figuras", [])
    cache = seg.setdefault("_cache", {})
    ft, lt = auto_tam(d, seg.get("texto", ""), W - 180, 220, 72)
    y = 230
    for ln in lt:
        wl = d.textbbox((0, 0), ln, font=ft)[2]
        sombra_t(d, ((W - wl) / 2, y), ln, ft, tuple(pal["texto"]))
        y += ft.size + 12

    n = max(1, len(figs))
    cw = int((W - 160) / n) - 20
    ch = int(cw * 1.25)
    top = int(H * 0.40)
    for i, f_ in enumerate(figs):
        ap = i / n * 0.6
        e = eo_expo(max(0.0, min(1.0, (t - ap) / 0.3)))
        if e <= 0:
            continue
        x = 80 + i * (cw + 20)
        dy = int(40 * (1 - e))
        ret = preparar_retrato(f_.get("imagen", ""), cw, ch, pal, cache) \
            if f_.get("imagen") else None
        if ret is None:
            ret = Image.new("RGB", (cw, ch),
                            tuple(min(255, c + 14) for c in pal["fondo"]))
            dp = ImageDraw.Draw(ret)
            dp.ellipse([cw * 0.26, ch * 0.14, cw * 0.74, ch * 0.58],
                       fill=tuple(min(255, c + 30) for c in pal["fondo"]))
        img.paste(ret, (x, top + dy))
        d.rectangle([x, top + dy, x + cw, top + ch + dy],
                    outline=tuple(pal["destacado"]), width=3)
        fn2 = fnt(int(cw * 0.16), serif=True)
        nom = f_.get("nombre", "")
        wn = d.textbbox((0, 0), nom, font=fn2)[2]
        d.text((x + (cw - wn) / 2, top + ch + dy + 18), nom, font=fn2,
               fill=tuple(pal["texto"]))
        if f_.get("nota"):
            fnn = fnt(int(cw * 0.12), ligera=True)
            wnn = d.textbbox((0, 0), f_["nota"], font=fnn)[2]
            d.text((x + (cw - wnn) / 2, top + ch + dy + 18 + fn2.size + 8),
                   f_["nota"], font=fnn, fill=tuple(pal["destacado"]))


def _catmull_rom(pts, pasos=22):
    """Suaviza una lista de puntos con un spline Catmull-Rom: da una
    curva fluida entre nodos (look de ruta de mapa) en vez de tramos
    rectos. Con 2 puntos o menos devuelve los puntos tal cual."""
    if len(pts) < 3:
        return list(pts)
    ext = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        for s in range(pasos):
            u = s / pasos
            u2, u3 = u * u, u * u * u
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u +
                       (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 +
                       (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u +
                       (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 +
                       (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)
            out.append((x, y))
    out.append(pts[-1])
    return out


def f_camino(img, d, seg, t, pal):
    """Ruta tipo mapa: curva sinuosa (no una linea recta) que atraviesa
    el frame con 3-5 paradas numeradas. Las paradas aparecen una por
    una con un 'pop', siguiendo el recorrido de la linea. Verde de
    acento para lo ya recorrido/alcanzado, apagado para lo que falta.

    JSON (mismo patron que 'pasos'/'ranking': lista simple + 'texto'
    opcional como titulo arriba):
      {"formato": "camino", "texto": "Asi se corta el bucle",
       "pasos": ["Notas la rumia", "Nombras el bucle",
                  "Cortas con una accion", "Volves al presente"]}
    """
    paradas = seg.get("pasos") or ["Notás la rumia", "Nombrás el bucle",
                                    "Cortás con una acción",
                                    "Volvés al presente"]
    n = len(paradas)
    if seg.get("texto"):
        ft, lt = auto_tam(d, seg["texto"], W - 180, 200, 68)
        y = 150
        for ln in lt:
            wl = d.textbbox((0, 0), ln, font=ft)[2]
            sombra_t(d, ((W - wl) / 2, y), ln, ft, tuple(pal["texto"]))
            y += ft.size + 12

    top_y, bot_y = H * 0.36, H * 0.88
    nodos = []
    for i in range(n):
        frac = i / max(1, n - 1)
        nx = W / 2 + math.sin(i * 2.1 + 0.6) * W * 0.24
        ny = top_y + (bot_y - top_y) * frac
        nodos.append((nx, ny))
    curva = _catmull_rom(nodos, 22)

    # El recorrido completo avanza con t; cada parada se "enciende"
    # cuando el avance de la linea la alcanza (mismo espiritu que la
    # linea de tiempo de f_cronologia).
    e = eo_cubic(min(1.0, t / 0.92))
    hasta = int(len(curva) * e)
    dur_seg = seg.get("duracion", 3.6)

    apagado = tuple(pal["apagado"]) if "apagado" in pal else (107, 107, 112)
    if len(curva) > 1:
        d.line(curva, fill=tuple(min(255, c + 12) for c in pal["fondo"]),
               width=10, joint="curve")
    if hasta > 1:
        d.line(curva[:hasta], fill=tuple(pal["destacado"]), width=10,
               joint="curve")

    # Micro-evento en la punta del trazo mientras la ruta se sigue
    # dibujando: un anillo que late (late de escala, no de contenido)
    # viajando en la punta de la linea. La linea ya crece cuadro a
    # cuadro (nunca esta quieta durante el 92% del segmento), esto
    # solo lo hace mas evidente/vivo -- pedido explicito del operador
    # de "que pase algo" con un latido, no un cambio de contenido.
    if 1 < hasta < len(curva):
        tx_p, ty_p = curva[hasta - 1]
        pulso = 0.55 + 0.45 * math.sin(t * dur_seg * 7.4)
        rp = 9 + 5 * pulso
        d.ellipse([tx_p - rp, ty_p - rp, tx_p + rp, ty_p + rp],
                  outline=tuple(pal["destacado"]), width=3)
    elif hasta >= len(curva) and nodos:
        # Cola del segmento (ruta ya completa, faltan cuadros hasta
        # que termine): halo tenue que respira detras de la ultima
        # parada, para que ese resto nunca quede totalmente quieto.
        fx, fy = nodos[-1]
        resp = 0.5 + 0.5 * math.sin(t * dur_seg * 2.1)
        rh = 36 + 9 * resp
        halo = tuple(int(fo + (c - fo) * 0.30)
                     for fo, c in zip(pal["fondo"], pal["destacado"]))
        d.ellipse([fx - rh, fy - rh, fx + rh, fy + rh], outline=halo, width=2)

    fn_num, fn_lab = fnt(40), fnt(38)
    for i, (nx, ny) in enumerate(nodos):
        ap = (i / max(1, n - 1)) if n > 1 else 0.0
        alcanzada = e >= ap - 0.015
        pop = eo_back(max(0.0, min(1.0, (t - ap * 0.92) / 0.22))) \
            if alcanzada else 0.0
        r = (30 if alcanzada else 20)
        if alcanzada:
            r = r * (0.55 + 0.45 * max(0.0, pop))
        col = tuple(pal["destacado"]) if alcanzada else apagado
        d.ellipse([nx - r, ny - r, nx + r, ny + r], fill=col,
                  outline=tuple(pal["fondo"]), width=4)
        bb = d.textbbox((0, 0), str(i + 1), font=fn_num)
        d.text((nx - (bb[2] - bb[0]) / 2 - bb[0],
                ny - (bb[3] - bb[1]) / 2 - bb[1]), str(i + 1), font=fn_num,
               fill=(14, 14, 18) if alcanzada else (190, 190, 196))
        etiqueta = paradas[i] if i < len(paradas) else ""
        if etiqueta and alcanzada and pop > 0:
            lado_izq = math.sin(i * 2.1 + 0.6) > 0
            fw = d.textbbox((0, 0), etiqueta, font=fn_lab)[2]
            tx = (nx - fw - 46) if lado_izq else (nx + 46)
            tx = max(20, min(tx, W - fw - 20))
            ty = ny - fn_lab.size / 2
            ac = max(0.0, min(1.0, pop))
            col_txt = tuple(int(fo + (c - fo) * ac)
                            for fo, c in zip(pal["fondo"], pal["texto"]))
            sombra_t(d, (tx, ty), etiqueta, fn_lab, col_txt, 4)


def f_collage(img, d, seg, t, pal):
    """2 a 4 fotos que entran una tras otra en rapida sucesion (no
    todas juntas), cada una con su propio leve zoom/parallax (Ken
    Burns) y un corte tipo whip al entrar. Es el "pattern interrupt"
    barato de las tendencias 2026: stills reales cortados adentro del
    video, no un slideshow estatico.

    JSON (mismo patron que 'pasos'/'ranking': lista de objetos; cada
    uno con 'ruta' y 'texto' opcional como etiqueta corta sobre la
    foto; 'texto' a nivel de segmento es un titulo general arriba,
    opcional):
      {"formato": "collage",
       "texto": "Asi se ve el patron",
       "imagenes": [{"ruta": "assets/imagenes/x.jpg", "texto": "Lunes"},
                     {"ruta": "assets/imagenes/y.jpg", "texto": "Jueves"}]}

    El audio (construir_audio) sincroniza un whoosh por cada entrada
    de imagen usando la MISMA division en partes iguales (1/n) que se
    usa aca para decidir que imagen esta activa -- ver SFX_POR_FORMATO
    ("collage" -> primera imagen) y el bloque de SFX extra mas abajo
    (imagenes 2 en adelante). Si se toca el reparto de tiempo aca,
    hay que tocarlo tambien alla para que no se desincronicen.
    """
    imagenes = (seg.get("imagenes") or [])[:4]
    if not imagenes:
        f = fnt(42, ligera=True)
        txt = "Sin imagenes en el guion"
        w = d.textbbox((0, 0), txt, font=f)[2]
        d.text(((W - w) / 2, H / 2 - f.size / 2), txt, font=f,
               fill=(120, 120, 130))
        return
    n = len(imagenes)
    slot = 1.0 / n
    idx = min(n - 1, int(t / slot))
    local_t = max(0.0, min(1.0, (t - idx * slot) / slot))
    it = imagenes[idx]
    ruta = it.get("ruta", "")

    cache = seg.setdefault("_cache", {})
    base = cache.get(ruta, "PENDIENTE")
    if base == "PENDIENTE":
        sub_cache = {}
        base = preparar_retrato(ruta, int(W * 1.32), int(H * 1.32), pal,
                                sub_cache) if ruta else None
        cache[ruta] = base

    signo = 1 if idx % 2 == 0 else -1
    if base is not None:
        # Ken Burns propio por imagen: arranca zoomeada afuera (se ve
        # mas escena) y cierra sobre el encuadre final, con una
        # deriva horizontal leve (parallax) que alterna de lado segun
        # el indice, para que ninguna foto se sienta igual a la
        # anterior.
        e = eio(local_t)
        z = 1.16 - 0.16 * e
        cw, ch = min(base.width, int(W * z)), min(base.height, int(H * z))
        max_dx, max_dy = base.width - cw, base.height - ch
        # Micro-respiracion continua encima del Ken Burns: el ease
        # in-out del zoom se aplana cerca del final de cada slot (la
        # derivada tiende a 0), lo que puede sentirse "quieto" un
        # instante si el slot es largo. Esta deriva chica en base a t
        # (continua entre fotos, no se reinicia por slot) asegura que
        # SIEMPRE haya algun movimiento de camara, sin cambiar encuadre
        # final ni el timing del corte entre fotos.
        cx = max_dx * (0.5 + signo * 0.20 * e) + math.sin(t * 5.4) * 3.0
        cy = max_dy * 0.5 + math.cos(t * 4.1) * 2.2
        cx = max(0, min(cx, max_dx)); cy = max(0, min(cy, max_dy))
        cuadro = base.crop((int(cx), int(cy), int(cx) + cw, int(cy) + ch))
        if (cw, ch) != (W, H):
            cuadro = cuadro.resize((W, H), Image.LANCZOS)
        img.paste(cuadro, (0, 0))
    else:
        d.rectangle([0, 0, W, H], fill=tuple(min(255, c + 10)
                                             for c in pal["fondo"]))

    # Whip de entrada: blur + corrimiento horizontal que se disuelve
    # rapido en los primeros frames del slot. El contenido ya corto
    # en duro (la imagen ya cambio); esto solo agrega la sensacion de
    # barrido en vez de aparicion estatica -- el look "collage
    # caotico controlado" pedido, no un slideshow aburrido.
    if idx > 0 and local_t < 0.16:
        fz = 1 - local_t / 0.16
        borroneado = img.filter(ImageFilter.GaussianBlur(fz * 10))
        capa = Image.new("RGB", (W, H), tuple(pal["fondo"]))
        capa.paste(borroneado, (int(signo * -46 * fz), 0))
        img.paste(capa, (0, 0))

    d2 = ImageDraw.Draw(img)

    # Puntos de progreso arriba: cual foto del collage estamos viendo.
    # El punto activo late suave (latido de escala): otro pequeno
    # recordatorio constante de que el reloj sigue corriendo, incluso
    # en el instante en que la foto de fondo esta casi quieta.
    apagado = tuple(pal["apagado"]) if "apagado" in pal else (107, 107, 112)
    for k in range(n):
        cxp = W / 2 - (n - 1) * 24 + k * 48
        r = 8 if k == idx else 5
        if k == idx:
            r += 1.3 * math.sin(t * 42.0)
        d2.ellipse([cxp - r, 70 - r, cxp + r, 70 + r],
                   fill=tuple(pal["destacado"]) if k <= idx else apagado)

    # Titulo general opcional del segmento, chico, arriba (no compite
    # con las etiquetas por imagen que van abajo).
    if seg.get("texto"):
        ft2, lt2 = auto_tam(d2, seg["texto"], W - 200, 140, 46, ligera=True)
        y2 = 120
        for ln in lt2:
            wl = d2.textbbox((0, 0), ln, font=ft2)[2]
            sombra_t(d2, ((W - wl) / 2, y2), ln, ft2, tuple(pal["texto"]), 4)
            y2 += ft2.size + 8

    # Etiqueta corta opcional por imagen, abajo. Si el segmento ademas
    # usa captions kinetic, esas ya ocupan esa franja con la palabra
    # narrada -- no dibujar la etiqueta encima para no duplicar texto
    # en el mismo frame (mismo criterio que f_declaracion).
    if it.get("texto") and not seg.get("captions_palabra_por_palabra"):
        franja = img.crop((0, int(H * 0.80), W, H))
        oscuro = Image.new("RGB", franja.size, tuple(pal["fondo"]))
        img.paste(Image.blend(franja, oscuro, 0.60), (0, int(H * 0.80)))
        d2 = ImageDraw.Draw(img)
        eb = eo_back(min(1.0, local_t / 0.3))
        dy = int(22 * (1 - max(0.0, eb)))
        ft, lt = auto_tam(d2, it["texto"], W - 140, 150, 50)
        y = H * 0.845 + dy
        for ln in lt:
            wl = d2.textbbox((0, 0), ln, font=ft)[2]
            sombra_t(d2, ((W - wl) / 2, y), ln, ft, tuple(pal["texto"]), 4)
            y += ft.size + 8


# ============ GRAMATICA DE 6 BEATS: "mensajes" y "escalada" ============
# Los dos formatos que pidio el operador para que la HISTORIA tenga
# desarrollo visual propio en vez de decoracion pareja: el beat de
# "situacion real" necesita mostrar literalmente lo que dijo la otra
# persona (mensajes), y el de "escalada" necesita que el pensamiento
# que se arma en la cabeza sea contenido real, no un contador
# abstracto. Ambos comparten el mismo reparto de tiempo con
# construir_audio() (SFX por beat) y render() (microshake de camara
# por beat) via las funciones _tiempos_* de aca abajo -- si se toca el
# reparto en una, hay que tocarlo en las tres.

def _tiempos_mensajes(seg):
    """Momento (fraccion 0..1 del segmento) en que aparece cada
    mensaje: division en partes iguales, mismo criterio que f_collage
    (slot = 1/n). 'menos de 1.5s cada uno' es responsabilidad del
    guion (duracion del segmento / n mensajes)."""
    n = max(1, len(seg.get("mensajes") or []))
    return [i / n for i in range(n)]


def _tiempos_escalada(seg):
    """Limites (fraccion 0..1 del segmento) de cada paso de la
    escalada, con pesos DECRECIENTES: el primer paso es el mas largo,
    el ultimo el mas corto -- asi los cortes se aceleran de verdad en
    vez de quedar parejos. Devuelve n+1 valores (bordes), no n."""
    n = max(1, len(seg.get("pasos") or []))
    pesos = [n - i for i in range(n)]
    tot = sum(pesos)
    bordes, acc = [0.0], 0.0
    for w in pesos:
        acc += w / tot
        bordes.append(acc)
    return bordes


def f_mensajes(img, d, seg, t, pal):
    """Mockup de chat oscuro (iMessage/WhatsApp) en la paleta de marca:
    2-4 mensajes que se van ACUMULANDO en sucesion rapida (no se
    reemplazan uno al otro, se apilan como una conversacion real).
    Pattern interrupt de storytime/drama commentary: la otra persona
    dice/hace algo LITERAL en pantalla, no un icono o un nodo
    abstracto.

    JSON: {"formato": "mensajes", "contacto": "Ella" (opcional),
           "mensajes": [{"texto": "...", "emisor": "otro"|"yo"}, ...]}
    """
    msjs = (seg.get("mensajes") or [])[:4]
    if not msjs:
        return
    bordes = _tiempos_mensajes(seg)
    apagado = tuple(pal.get("apagado", (107, 107, 112)))

    px0, py0, px1, py1 = 60, int(H * 0.30), W - 60, int(H * 0.90)
    panel = tuple(max(0, c - 6) for c in pal["fondo"])
    d.rounded_rectangle([px0, py0, px1, py1], radius=34, fill=panel,
                        outline=(52, 52, 60), width=2)

    if seg.get("contacto"):
        fh = fnt(38)
        d.text((px0 + 40, py0 + 30), seg["contacto"], font=fh,
               fill=tuple(pal["texto"]))
        d.line([(px0 + 30, py0 + 92), (px1 - 30, py0 + 92)],
               fill=(48, 48, 56), width=2)
        y = py0 + 92 + 34
    else:
        y = py0 + 40

    max_w = (px1 - px0) - 140
    fb = fnt(44)
    for i, m in enumerate(msjs):
        ap = bordes[i]
        if t < ap - 0.01 or y > py1 - 80:
            break
        lt = max(0.0, min(1.0, (t - ap) / 0.22))
        e = eo_back(lt)
        texto = m.get("texto", "")
        lineas = envolver(d, texto, fb, max_w)
        alto_burbuja = len(lineas) * (fb.size + 10) + 44
        anchos = [d.textbbox((0, 0), ln, font=fb)[2] for ln in lineas]
        w_burbuja = min(max_w, max(anchos, default=0)) + 64
        dy_pop = int(20 * (1 - max(0.0, e)))
        es_otro = m.get("emisor", "otro") != "yo"
        if es_otro:
            bx0 = px0 + 40
            col_bg = tuple(min(255, c + 22) for c in pal["fondo"])
            col_txt = tuple(pal["texto"])
        else:
            bx0 = px1 - 40 - w_burbuja
            col_bg = tuple(pal["destacado"])
            col_txt = (14, 14, 18)
        d.rounded_rectangle(
            [bx0, y + dy_pop, bx0 + w_burbuja, y + alto_burbuja + dy_pop],
            radius=24, fill=col_bg)
        ty = y + 22 + dy_pop
        for ln in lineas:
            d.text((bx0 + 32, ty), ln, font=fb, fill=col_txt)
            ty += fb.size + 10
        y += alto_burbuja + 26

    if seg.get("texto"):
        ft, lt = auto_tam(d, seg["texto"], W - 160, 140, 52, ligera=True)
        yy = int(H * 0.19)
        for ln in lt:
            wl = d.textbbox((0, 0), ln, font=ft)[2]
            sombra_t(d, ((W - wl) / 2, yy), ln, ft, apagado, 4)
            yy += ft.size + 10


def f_escalada(img, d, seg, t, pal):
    """La escalada del pensamiento como CONTENIDO REAL: frases que se
    apilan (no se reemplazan) con cortes cada vez MAS rapidos --
    aceleracion real via _tiempos_escalada(), no un contador numerico
    abstracto. La ultima frase ('ya armaste toda una historia') es
    justamente eso: la idea completa, no un simbolo de que algo crecio.

    JSON: {"formato": "escalada",
           "pasos": ["primero pensaste esto", "despues esto",
                      "ya armaste toda una historia"]}
    """
    pasos = seg.get("pasos") or ["Primero pensaste esto", "Despues esto",
                                  "Ya armaste toda una historia"]
    n = len(pasos)
    bordes = _tiempos_escalada(seg)
    idx = 0
    for i in range(n):
        if t >= bordes[i] - 0.004:
            idx = i
    dur_paso = max(0.02, bordes[idx + 1] - bordes[idx])
    lt = max(0.0, min(1.0, (t - bordes[idx]) / (dur_paso * 0.6)))
    e = eo_back(lt)
    apagado = tuple(pal.get("apagado", (107, 107, 112)))

    if seg.get("texto"):
        ft, ltl = auto_tam(d, seg["texto"], W - 180, 160, 56, ligera=True)
        y0 = 150
        for ln in ltl:
            wl = d.textbbox((0, 0), ln, font=ft)[2]
            d.text(((W - wl) / 2, y0), ln, font=ft, fill=apagado)
            y0 += ft.size + 10

    y = H * 0.32
    for i in range(idx + 1):
        if y > H * 0.86:
            break
        activo = (i == idx)
        f = fnt(96 if activo else 52)
        ls = envolver(d, pasos[i], f, W - 160)
        col = tuple(pal["destacado"]) if activo else apagado
        for ln in ls:
            if activo:
                esc = 0.8 + 0.2 * max(0.0, e)
                fu = fnt(int(f.size * esc))
                wl = d.textbbox((0, 0), ln, font=fu)[2]
                sombra_t(d, ((W - wl) / 2, y), ln, fu, col, 6)
                y += fu.size + 14
            else:
                wl = d.textbbox((0, 0), ln, font=f)[2]
                d.text(((W - wl) / 2, y), ln, font=f, fill=col)
                y += f.size + 10
        y += 20 if activo else 8

    # Tension que SUBE con el avance real de la escalada (no con el
    # reloj): el borde pulsa cada vez mas rapido a medida que idx
    # crece, mismo lenguaje visual que f_alerta pero atado a la
    # historia, no a un timer fijo.
    urgencia = idx / max(1, n - 1)
    pulso = 0.5 + 0.5 * math.sin(t * (5 + 9 * urgencia))
    borde = int(6 + 10 * urgencia * pulso)
    if borde > 2:
        d.rectangle([0, 0, W, borde], fill=tuple(pal["destacado"]))
        d.rectangle([0, H - borde, W, H], fill=tuple(pal["destacado"]))


_LOGO_CACHE = {}


def _logo_icono():
    """Icono de marca (marca/icono.png) para el CTA final, cacheado una
    sola vez por proceso. None si el archivo no esta (no rompe nada,
    el CTA se dibuja igual sin logo)."""
    if "icono" not in _LOGO_CACHE:
        p = Path(__file__).parent / "marca" / "icono.png"
        try:
            _LOGO_CACHE["icono"] = Image.open(p).convert("RGBA") if p.exists() else False
        except Exception:
            _LOGO_CACHE["icono"] = False
    return _LOGO_CACHE["icono"] or None


def _texto_espaciado(dib, xy, txt, f, col, esp=0):
    """Dibuja con espaciado entre letras. Pillow no lo soporta, y sin
    esto un nombre de marca en mayuscula se ve apretado y barato: el
    aire entre letras es la mitad de lo que hace que algo se lea caro.
    Devuelve el ancho total."""
    x, y = xy
    for ch in txt:
        dib.text((x, y), ch, font=f, fill=col)
        x += dib.textlength(ch, font=f) + esp
    return x - xy[0]


def _ancho_espaciado(dib, txt, f, esp=0):
    return sum(dib.textlength(c, font=f) for c in txt) + esp * max(0, len(txt) - 1)


def f_cta(img, d, seg, t, pal):
    """CIERRE DE MARCA -- editorial y sobrio.

    El cierre anterior era una tarjeta con borde de 2px, el logo pegado
    al lado del nombre y un subtitulo en color: leia a plantilla, no a
    marca. Desentonaba con el resto del video, que es justamente lo mas
    trabajado.

    Este no dibuja ni una caja. La jerarquia la hacen el aire, el
    espaciado entre letras y una linea de un pixel que se abre desde el
    centro. Todo entra escalonado para que el ojo lea en orden: primero
    la frase de cierre, despues la marca, despues donde encontrarla.

    JSON: {"formato": "cta", "texto": "frase de cierre",
           "cta_marca": "Taller de Activos",
           "cta_sub": "Problemas reales. Productos que se mueven.",
           "cta_handle": "@tallerdeactivos"}
    """
    fondo = tuple(pal["fondo"])
    img.paste(Image.new("RGB", (W, H), fondo), (0, 0))
    # Vineta muy suave: baja los bordes un par de tonos para que el
    # centro respire. Se arma en escala de grises chiquita y se estira,
    # que es barato y no se nota el escalado en un degrade tan plano.
    vg = Image.new("L", (16, 28), 96)
    ImageDraw.Draw(vg).ellipse([-5, -9, 21, 37], fill=0)
    vg = vg.resize((W, H), Image.BILINEAR)
    img.paste(Image.new("RGB", (W, H), tuple(max(0, c - 10) for c in fondo)),
              (0, 0), vg)

    acento = tuple(pal["destacado"])
    claro = tuple(pal["texto"])
    apagado = tuple(pal.get("apagado", (120, 120, 126)))

    def bloque(txt, f, y, col, ap, esp=0, centrado=True):
        """Un renglon que sube y aparece. ap = 0..1."""
        if ap <= 0.01:
            return
        e = eo_cubic(min(1.0, ap))
        alpha = int(255 * min(1.0, ap / 0.6))
        dy = (1 - e) * 26
        ancho = _ancho_espaciado(d, txt, f, esp)
        capa = Image.new("RGBA", (int(ancho) + 30, f.size + 40), (0, 0, 0, 0))
        dc = ImageDraw.Draw(capa)
        _texto_espaciado(dc, (0, 0), txt, f, col + (alpha,), esp)
        x = (W - capa.width) / 2 if centrado else 120
        img.paste(capa, (int(x), int(y + dy)), capa)

    # 1. Frase de cierre. Es lo que se acaba de escuchar: va primero y
    #    va grande, pero no en mayuscula -- gritar aca abarata todo.
    txt = seg.get("texto", "")
    if seg.get("mayus", True):
        txt = txt.upper()
    y = H * 0.26
    if txt:
        f, ls = auto_tam(d, txt, W - 200, H * 0.24, 104)
        for i, ln in enumerate(ls):
            bloque(ln, f, y, claro, min(1.0, max(0.0, (t - i * 0.05) / 0.24)))
            y += f.size + 16

    # 2. Linea que se abre desde el centro. Es el unico grafico del
    #    plano y separa el cierre hablado de la marca.
    ap_l = max(0.0, min(1.0, (t - 0.30) / 0.26))
    if ap_l > 0:
        medio_x = W / 2
        largo = eo_expo(ap_l) * (W * 0.30)
        yl = H * 0.545
        d.rectangle([medio_x - largo, yl, medio_x + largo, yl + 1.6], fill=acento)

    # 3. La marca. Mayuscula, MUY espaciada: es lo que la hace leer
    #    cara en vez de apretada.
    marca = seg.get("cta_marca", "Taller de Activos").upper()
    fm = fnt(74)
    esp = 9
    while _ancho_espaciado(d, marca, fm, esp) > W - 150 and fm.size > 34:
        fm = fnt(fm.size - 4)
    bloque(marca, fm, H * 0.605, claro,
           max(0.0, min(1.0, (t - 0.40) / 0.26)), esp=esp)

    # 4. Bajada en serif italica: el mismo tono que las palabras
    #    sueltas del resto del video, para que el cierre pertenezca al
    #    video y no parezca pegado de otro lado.
    sub = seg.get("cta_sub", "")
    if sub:
        fs = fnt(44, serif=True, italica=True)
        while d.textlength(sub, font=fs) > W - 200 and fs.size > 24:
            fs = fnt(fs.size - 3, serif=True, italica=True)
        bloque(sub, fs, H * 0.685, apagado,
               max(0.0, min(1.0, (t - 0.54) / 0.26)))

    # 5. Donde encontrarla. Chico, espaciado, en el acento.
    handle = seg.get("cta_handle", "")
    if handle:
        fh = fnt(34, ligera=True)
        bloque(handle, fh, H * 0.775, acento,
               max(0.0, min(1.0, (t - 0.68) / 0.24)), esp=5)


# --- Vida ambiental (universal, todos los formatos) -------------------
#
# Feedback del operador sobre el demo de "collage": queda "un espacio
# libre tremendo" -- zonas grandes del cuadro de 1080x1920 sin ninguna
# textura ni movimiento -- y algunos tramos donde "no pasa nada" por
# mas de un par de segundos. La investigacion de edicion corta 2026
# coincide en el diagnostico (regla dura: ningun plano completamente
# estatico por mas de ~3s) pero tambien advierte del extremo contrario:
# convertir el video en "cafeina visual" sin ningun instante de
# claridad. La solucion no es agregar mas cortes de contenido -- es
# una capa de textura viva, muy sutil, que nunca compite con el texto.
#
# Diseño elegido: un puñado de motas de luz (particulas) que flotan
# lento por TODO el cuadro (no solo en los margenes), con parpadeo
# propio, en los dos tonos de marca (verde de acento / apagado). Se
# genera una sola vez por proceso (identidad estable: misma mota, misma
# fase, en todo el video) y se compone con alpha real pero SOLO sobre
# la region minima que cada punto toca -- nunca se crea una capa RGBA
# del tamaño completo del cuadro, asi el costo es proporcional a la
# cantidad de puntos (unos pocos px cada uno), no al tamaño del video.
# Barato de sobra para CPU frame a frame sin GPU.
#
# Se llama UNA sola vez desde render(), centralizado, para que aplique
# a los 18 formatos por igual sin duplicar codigo adentro de cada f_*.

_AMBIENTE_CACHE = {}


def _ambiente_particulas(n=13):
    """Parametros fijos de cada particula (posicion base, fase,
    velocidad). Se sortean una sola vez (semilla fija) para que cada
    mota tenga identidad estable a lo largo de todo el video -- no se
    re-sortean cuadro a cuadro ni video a video."""
    parts = _AMBIENTE_CACHE.get(n)
    if parts is None:
        rr = random.Random(7919)
        parts = []
        for i in range(n):
            parts.append({
                "bx": rr.uniform(0.08, 0.92), "by": rr.uniform(0.10, 0.90),
                "fase": rr.uniform(0, 6.2832),
                "vx": rr.uniform(0.026, 0.07), "vy": rr.uniform(0.020, 0.055),
                "vp": rr.uniform(0.10, 0.20),
                "r": rr.uniform(2.0, 4.6),
                "acento": (i % 4 == 0),
            })
        _AMBIENTE_CACHE[n] = parts
    return parts


def _punto_suave(img, x, y, r, color, alpha):
    """Dibuja un punto translucido sin crear una capa del tamaño del
    cuadro completo: recorta solo la caja minima que el punto toca,
    compone ahi con alpha real, y pega de vuelta. Barato incluso con
    varias docenas de puntos por cuadro."""
    if alpha <= 1:
        return
    r = max(1.2, r)
    x0, y0 = int(x - r - 1), int(y - r - 1)
    x1, y1 = int(x + r + 2), int(y + r + 2)
    x0c, y0c = max(0, x0), max(0, y0)
    x1c, y1c = min(W, x1), min(H, y1)
    if x1c <= x0c or y1c <= y0c:
        return
    region = img.crop((x0c, y0c, x1c, y1c)).convert("RGBA")
    capa = Image.new("RGBA", region.size, (0, 0, 0, 0))
    ImageDraw.Draw(capa).ellipse(
        [x - x0c - r, y - y0c - r, x - x0c + r, y - y0c + r],
        fill=tuple(color) + (int(alpha),))
    img.paste(Image.alpha_composite(region, capa).convert("RGB"), (x0c, y0c))


def _grano_fuente():
    """Lienzo de ruido (grano) generado UNA sola vez por proceso, mas
    grande que el cuadro para poder recortar una ventana distinta cada
    llamada. random.Random(...).randbytes es un solo call en C (no un
    loop en Python), asi que generarlo es practicamente gratis; el
    costo real de por-cuadro es solo el crop + blend de mas abajo.

    Investigacion de tendencias 2026 (ver nota en dibujar_ambiente):
    el grano/textura analogica vuelve como recurso deliberado para que
    un plano quieto no se sienta "muerto" -- exactamente el mismo
    diagnostico que el operador hizo a ojo. Un grano animado (que
    parpadea cuadro a cuadro, no una textura fija pegada a la pantalla)
    es barato en Pillow puro sin numpy: PIL.Image.frombytes sobre
    bytes aleatorios, sin ningun loop por pixel."""
    gw, gh = W + 360, H + 420
    if "grano" not in _AMBIENTE_CACHE:
        datos = random.Random(31337).randbytes(gw * gh)
        _AMBIENTE_CACHE["grano"] = (Image.frombytes("L", (gw, gh), datos)
                                     .convert("RGB"), gw, gh)
    return _AMBIENTE_CACHE["grano"]


def dibujar_ambiente(img, d, t_abs, pal):
    """Vida ambiental universal: dos capas baratas que se llaman una
    sola vez desde render() para TODOS los formatos (no duplicar en
    cada f_*), deliberadamente tenues para que se sientan textura de
    fondo viva y nunca un elemento que le saca atencion al texto:

    1. Motas de luz que flotan lento por todo el cuadro con parpadeo
       propio (particula + "pulso de brillo" en una sola tecnica,
       alpha maximo ~22/255).
    2. Grano animado tenuisimo (blend ~3% contra ruido, alpha maximo
       equivalente) que parpadea cuadro a cuadro -- textura analogica
       que evita que CUALQUIER zona del cuadro (no solo donde caen las
       motas) se sienta plana. Confirmado como tendencia de edicion
       2026 real, no solo intuicion (ver investigacion en el reporte
       de esta ronda).

    t_abs: tiempo absoluto en segundos, continuo a lo largo de TODO el
    video (no se reinicia en cada segmento), para que ninguna de las
    dos capas salte de fase en los cortes entre segmentos.
    """
    ac = tuple(pal["destacado"])
    ap = tuple(pal.get("apagado", (107, 107, 112)))
    for p in _ambiente_particulas():
        x = p["bx"] * W + math.sin(t_abs * p["vx"] * 6.2832 + p["fase"]) * W * 0.045
        y = p["by"] * H + math.cos(t_abs * p["vy"] * 6.2832 + p["fase"] * 1.3) * H * 0.035
        pulso = 0.5 + 0.5 * math.sin(t_abs * p["vp"] * 6.2832 + p["fase"] * 2.1)
        alpha = 7 + 15 * pulso
        _punto_suave(img, x, y, p["r"], ac if p["acento"] else ap, alpha)

    grano, gw, gh = _grano_fuente()
    # Offset "saltarin" (no una deriva suave): dos multiplicadores
    # grandes y sin relacion simple hacen que la ventana recortada
    # cambie de golpe cuadro a cuadro, como el parpadeo real del grano
    # de pelicula -- no como un patron que se desliza por la pantalla.
    # La mezcla se mantiene CONSTANTE (ver nota 2 del latido abajo:
    # modularla multiplica por 13 el peso del archivo).
    ox = int((t_abs * 971) % (gw - W))
    oy = int((t_abs * 613) % (gh - H))
    ventana = grano.crop((ox, oy, ox + W, oy + H))
    img.paste(Image.blend(img, ventana, 0.028), (0, 0))

    # Latido: pulso con periodo FIJO en tiempo absoluto (no normalizado
    # por segmento). Es el seguro final contra pantalla muerta -- los
    # formatos individuales revelan su contenido segun una curva que
    # satura rapido (eo_cubic/eo_back llegan a ~99% bien antes de t=1
    # sin importar cuanto se agrande la ventana), asi que estirar esas
    # ventanas no alcanza por si solo cuando la voz real deja un
    # segmento mucho mas largo de lo que el formato asumia.
    #
    # Implementado como un marco de acento que respira en los bordes.
    #
    # DOS INTENTOS DESCARTADOS, medidos sobre el archivo final (no a
    # ojo sobre los PNG):
    #  1. Marco finito (2-7px) con alpha 0.14: la compresion lo borra
    #     -- diferencia medida entre pico y valle del pulso: 0.09/255,
    #     o sea invisible.
    #  2. Modular la mezcla del GRANO (0.028 -> 0.103): se ve perfecto
    #     (diferencia 5.4/255) pero el grano es ruido de alta entropia
    #     y x264 le gasta bits a lo loco: el mismo video paso de 11 MB
    #     a 145 MB. Inservible para subir a TikTok.
    # La version que queda usa un marco ANCHO (hasta 46px) y de mayor
    # contraste: area grande y de baja frecuencia = sobrevive la
    # compresion sin costarle bits al codec.
    periodo = 1.4
    pulso_latido = math.sin((t_abs % periodo) / periodo * math.pi)
    if pulso_latido > 0.03:
        grosor = int(10 + 36 * pulso_latido)
        alpha_l = 0.06 + pulso_latido * 0.26
        col = tuple(int(f + (c - f) * alpha_l)
                    for f, c in zip(pal["fondo"], pal["destacado"]))
        d.rectangle([0, 0, W - 1, H - 1], outline=col, width=grosor)


def f_ruleta(img, d, seg, t, pal):
    """RULETA -- una frase fija y UNA sola palabra que se reemplaza
    deslizando de abajo hacia arriba, como un contador que rota.

    Sirve para el hook: deja claro en dos segundos que lo que vas a
    decir aplica a un monton de rubros, sin gastar un plano por cada
    uno. Solo se ve una palabra por vez.

    JSON: {"formato": "ruleta", "fijo": "Tenés una",
           "palabras": ["barbería", "peluquería", "taller"],
           "imagen": "...", "velo": 0.5}
    """
    _cuadro_medio(img, seg, (0, 0, W, H), t)
    velo = Image.new("RGB", (W, H), (0, 0, 0))
    img.paste(Image.blend(img, velo, seg.get("velo", 0.52)), (0, 0))

    palabras = seg.get("palabras") or []
    if not palabras:
        return
    fijo = seg.get("fijo", "")
    y_fijo = H * seg.get("y_ruleta", 0.40)

    if fijo:
        ff, lf = auto_tam(d, fijo, W - 200, 220, 74)
        yy = y_fijo - (len(lf) * (ff.size + 10)) / 2
        for ln in lf:
            wl = d.textbbox((0, 0), ln, font=ff)[2]
            sombra_t(d, ((W - wl) / 2, yy), ln, ff, (255, 255, 255), 5)
            yy += ff.size + 10

    # Cual palabra toca y cuanto lleva puesta
    n = len(palabras)
    avance = min(0.9999, t)
    i = int(avance * n)
    lt = avance * n - i
    # 22% del turno rodando, el resto quieta: se lee, no marea
    rod = min(1.0, lt / 0.22)
    e = eo_expo(rod)

    banda_y = int(y_fijo + 92)
    banda_h = 150
    banda = Image.new("RGB", (W, banda_h), (0, 0, 0))
    # La banda copia el fondo ya dibujado para que el deslizamiento
    # recorte contra la imagen y no contra un rectangulo negro.
    banda.paste(img.crop((0, banda_y, W, banda_y + banda_h)), (0, 0))
    db = ImageDraw.Draw(banda)

    def poner(texto, dy, alpha=255):
        if not texto:
            return
        tam = 108
        f = fnt(tam, serif=True, italica=True)
        while db.textbbox((0, 0), texto, font=f)[2] > W - 150 and tam > 40:
            tam -= 6
            f = fnt(tam, serif=True, italica=True)
        wb = db.textbbox((0, 0), texto, font=f)[2]
        x = (W - wb) / 2
        y = (banda_h - f.size) / 2 + dy
        capa = Image.new("RGBA", (W, banda_h), (0, 0, 0, 0))
        dc = ImageDraw.Draw(capa)
        dc.text((x + 5, y + 5), texto, font=f, fill=(0, 0, 0, int(alpha * 0.5)))
        dc.text((x, y), texto, font=f, fill=tuple(pal["destacado"]) + (alpha,))
        banda.paste(capa, (0, 0), capa)

    # La saliente sube y se va; la entrante viene desde abajo.
    if i > 0 and e < 1.0:
        poner(palabras[i - 1], -e * banda_h, int(255 * (1 - e)))
    poner(palabras[i], (1 - e) * banda_h, int(255 * min(1.0, rod / 0.5)))
    img.paste(banda, (0, banda_y))


def f_lista(img, d, seg, t, pal):
    """LISTA QUE SE ACUMULA -- los renglones van APARECIENDO uno abajo
    del otro y QUEDAN en pantalla. La columna crece.

    Es el formato del dolor: cada renglon suma una perdida concreta y
    al final se ven todas juntas, que es donde pega. Distinto de la
    ruleta, donde solo se ve una por vez.

    JSON: {"formato": "lista", "titulo": "Se te va en",
           "items": ["el que no vino", "el hueco de las 3"],
           "imagen": "...", "marcador": "—"}
    """
    _cuadro_medio(img, seg, (0, 0, W, H), t)
    velo = Image.new("RGB", (W, H), (0, 0, 0))
    img.paste(Image.blend(img, velo, seg.get("velo", 0.60)), (0, 0))

    items = seg.get("items") or []
    if not items:
        return
    titulo = seg.get("titulo", "")
    marcador = seg.get("marcador", "—")

    y = H * seg.get("y_lista", 0.26)
    if titulo:
        ft, lt_ = auto_tam(d, titulo.upper() if seg.get("mayus", True) else titulo,
                           W - 180, 200, 78)
        for ln in lt_:
            wl = d.textbbox((0, 0), ln, font=ft)[2]
            sombra_t(d, ((W - wl) / 2, y), ln, ft, (255, 255, 255), 5)
            y += ft.size + 12
        y += 44

    n = len(items)
    # Todos los renglones tienen que estar puestos antes del final del
    # plano: se reparte el 82% del tiempo y el resto queda para leer la
    # lista completa, que es el momento en que el dato pega.
    paso = 0.82 / max(1, n)
    tam_item = seg.get("tam_item", 62)
    for k, it in enumerate(items):
        arranque = k * paso
        if t < arranque:
            break
        lt_i = min(1.0, (t - arranque) / max(0.001, paso * 0.55))
        e = eo_back(lt_i)
        alpha = int(255 * min(1.0, lt_i / 0.35))
        # Entra desde la izquierda: es una lista, se lee como lista.
        ox = (1.0 - e) * -120

        f = fnt(tam_item, ligera=False)
        txt = f"{marcador} {it}" if marcador else it
        while d.textbbox((0, 0), txt, font=f)[2] > W - 170 and f.size > 30:
            f = fnt(f.size - 4, ligera=False)
        x0, y0, x1, y1 = d.textbbox((0, 0), txt, font=f)
        tw, th = x1 - x0, y1 - y0
        capa = Image.new("RGBA", (tw + 40, th + 40), (0, 0, 0, 0))
        dc = ImageDraw.Draw(capa)
        # El ultimo renglon puesto va en el acento: es el que se acaba
        # de decir, y guia el ojo hacia abajo.
        ultimo = (k == n - 1) or (t < arranque + paso)
        col = tuple(pal["destacado"]) if ultimo else (238, 238, 236)
        dc.text((20 - x0 + 4, 20 - y0 + 4), txt, font=f, fill=(0, 0, 0, int(alpha * 0.55)))
        dc.text((20 - x0, 20 - y0), txt, font=f, fill=col + (alpha,))
        img.paste(capa, (int(110 + ox), int(y)), capa)
        y += th + 34


def f_comparacion(img, d, seg, t, pal):
    """COMPARACION GRANDE -- dos columnas enfrentadas: el que pierde en
    ROJO, el que gana en VERDE, y un numero concreto por renglon.

    No es una tabla neutra. El color hace el juicio antes de que se
    lea el texto: rojo = esto te esta costando plata, verde = esto te
    la trae. Y cada renglon puede llevar su cifra ("-36.000" /
    "+36.000"), que es lo que convierte un argumento en un hecho.

    JSON: {"formato": "comparacion",
           "izq_titulo": "VOS", "der_titulo": "ÉL",
           "izq": ["cobrás el corte"], "der": ["cobrás la agenda"],
           "izq_num": ["-36.000"], "der_num": ["+36.000"],
           "remate": "misma tijera", "remate_num": "+432.000 al año"}
    """
    img.paste(Image.new("RGB", (W, H), seg.get("fondo_comp", (12, 12, 14))), (0, 0))
    izq = seg.get("izq") or []
    der = seg.get("der") or []
    n = max(len(izq), len(der))
    if not n:
        return

    medio = W // 2
    y_cab = int(H * 0.16)
    # Encabezados
    ROJO = tuple(seg.get("color_pierde", (232, 66, 52)))
    VERDE = tuple(seg.get("color_gana", (58, 214, 122)))
    for lado, titulo, col in (
            (0, seg.get("izq_titulo", "VOS"), ROJO),
            (1, seg.get("der_titulo", "ÉL"), VERDE)):
        f = fnt(64)
        txt = titulo.upper()
        wb = d.textbbox((0, 0), txt, font=f)[2]
        cx = medio / 2 if lado == 0 else medio + medio / 2
        d.text((cx - wb / 2, y_cab), txt, font=f, fill=col)
    # Linea divisoria que se dibuja sola de arriba hacia abajo
    e_lin = eo_cubic(min(1.0, t / 0.30))
    d.rectangle([medio - 2, y_cab - 24, medio + 2,
                 int((y_cab - 24) + (H * 0.76 - y_cab) * e_lin)],
                fill=(82, 82, 92))

    y0_items = y_cab + 118
    paso = 0.72 / max(1, n * 2)
    alto_fila = int((H * 0.74 - y0_items) / max(1, n))
    for k in range(n):
        for lado, lista in ((0, izq), (1, der)):
            if k >= len(lista):
                continue
            # Alternado: primero el lado que pierde, despues el que gana.
            arranque = 0.06 + (k * 2 + lado) * paso
            if t < arranque:
                continue
            lt_i = min(1.0, (t - arranque) / max(0.001, paso * 0.9))
            e = eo_back(lt_i)
            alpha = int(255 * min(1.0, lt_i / 0.4))
            # Cada lado entra desde SU borde: refuerza el enfrentamiento.
            ox = (1.0 - e) * (-150 if lado == 0 else 150)
            col = ROJO if lado == 0 else VERDE
            ancho = medio - 66
            # El texto va en blanco roto y la CIFRA en el color del
            # lado: si se pinta todo de color, el rojo y el verde
            # pierden fuerza y ademas cuesta leer parrafos enteros en
            # saturado. El color tiene que ser el veredicto, no el
            # cuerpo.
            f, lineas = auto_tam(d, lista[k], ancho, alto_fila - 74, 58)
            cx = medio / 2 if lado == 0 else medio + medio / 2
            yy = y0_items + k * alto_fila
            for ln in lineas:
                x0b, y0b, x1b, y1b = d.textbbox((0, 0), ln, font=f)
                tw, th = x1b - x0b, y1b - y0b
                capa = Image.new("RGBA", (tw + 30, th + 30), (0, 0, 0, 0))
                dc = ImageDraw.Draw(capa)
                dc.text((15 - x0b, 15 - y0b), ln, font=f,
                        fill=(228, 228, 232, alpha))
                img.paste(capa, (int(cx - capa.width / 2 + ox), int(yy)), capa)
                yy += f.size + 8
            # La cifra entra un toque despues del texto: primero se lee
            # que pasa, despues cuanto cuesta.
            nums = seg.get("izq_num" if lado == 0 else "der_num") or []
            if k < len(nums) and nums[k]:
                lt_n = min(1.0, max(0.0, (t - arranque - paso * 0.35) / max(0.001, paso * 0.6)))
                if lt_n > 0:
                    fn = fnt(62)
                    txtn = str(nums[k])
                    while d.textlength(txtn, font=fn) > ancho and fn.size > 28:
                        fn = fnt(fn.size - 4)
                    an = int(255 * min(1.0, lt_n / 0.5))
                    en = eo_back(lt_n)
                    wn = d.textlength(txtn, font=fn)
                    capa = Image.new("RGBA", (int(wn) + 30, fn.size + 40), (0, 0, 0, 0))
                    ImageDraw.Draw(capa).text((15, 8), txtn, font=fn, fill=col + (an,))
                    img.paste(capa, (int(cx - capa.width / 2),
                                     int(yy + 6 + (1 - en) * 18)), capa)

    # Remate opcional abajo del todo, cuando ya estan las dos columnas
    remate = seg.get("remate")
    yy = H * 0.795
    if remate and t > 0.78:
        lt_r = min(1.0, (t - 0.78) / 0.13)
        f, lr = auto_tam(d, remate.upper(), W - 160, 170, 58)
        for ln in lr:
            wl = d.textbbox((0, 0), ln, font=f)[2]
            capa = Image.new("RGBA", (W, f.size + 30), (0, 0, 0, 0))
            ImageDraw.Draw(capa).text(((W - wl) / 2, 0), ln, font=f,
                                      fill=(214, 214, 220, int(255 * lt_r)))
            img.paste(capa, (0, int(yy)), capa)
            yy += f.size + 8
    # La cifra que cierra la discusion. Ultima en entrar y la mas
    # grande del plano: es el unico numero que el que mira se lleva.
    rnum = seg.get("remate_num")
    if rnum and t > 0.86:
        lt_n = min(1.0, (t - 0.86) / 0.11)
        fn = fnt(86)
        while d.textlength(str(rnum), font=fn) > W - 160 and fn.size > 40:
            fn = fnt(fn.size - 5)
        wn = d.textlength(str(rnum), font=fn)
        capa = Image.new("RGBA", (int(wn) + 40, fn.size + 46), (0, 0, 0, 0))
        ImageDraw.Draw(capa).text((20, 10), str(rnum), font=fn,
                                  fill=VERDE + (int(255 * lt_n),))
        img.paste(capa, (int((W - capa.width) / 2),
                         int(yy + 14 + (1 - eo_back(lt_n)) * 20)), capa)


def f_prueba(img, d, seg, t, pal):
    """Evidencia CON la fuente a la vista.

    El formato que le faltaba al proyecto entero: mostrar la captura y
    de donde salio, en el mismo plano. Un numero sin fuente es una
    opinion con tipografia grande, y este contenido se sostiene en que
    el dato sea verificable por el que mira.

    Campos:
        "kicker"     linea chica arriba (por defecto "PRUEBA")
        "imagen" / "foto" / "video"
                     la captura. Si no hay ninguna, el plano se
                     reacomoda como ficha de cita: texto grande arriba
                     y la fuente abajo.
        "texto"      que dice la prueba
        "fuente"     de donde salio. Si falta, el plano LO DICE en
                     pantalla ("SIN FUENTE") en vez de disimularlo:
                     la omision tiene que costar algo.
        "resaltado"  [x0, y0, x1, y1] en fracciones 0..1 de la caja de
                     la imagen. Recuadro que late sobre la parte que
                     importa, que es lo que uno hace con el dedo
                     cuando muestra una captura.
    """
    acc = tuple(pal["destacado"])
    col_txt = tuple(pal["texto"])
    col_fondo = tuple(pal["fondo"])

    # --- Kicker ---
    kicker = str(seg.get("kicker", "PRUEBA")).upper()
    ek = eo_expo(min(1.0, t / 0.16))
    fk = fnt(34)
    esp = 8
    wk = _ancho_espaciado(d, kicker, fk, esp)
    capa = Image.new("RGBA", (int(wk) + 60, fk.size + 34), (0, 0, 0, 0))
    _texto_espaciado(ImageDraw.Draw(capa), (30, 8), kicker, fk,
                     acc + (int(255 * ek),), esp)
    img.paste(capa, (int((W - capa.width) / 2),
                     int(H * 0.075 + (1 - ek) * 14)), capa)

    hay_img = bool(seg.get("imagen") or seg.get("foto") or seg.get("video"))
    ytop, ybot = int(H * 0.155), int(H * 0.575)

    # --- La captura, revelada como una persiana que se abre ---
    if hay_img:
        er = eo_expo(min(1.0, t / 0.30))
        cy = (ytop + ybot) / 2
        med = (ybot - ytop) / 2 * max(0.02, er)
        caja = (80, int(cy - med), W - 80, int(cy + med))
        if caja[3] - caja[1] > 6:
            _cuadro_medio(img, seg, caja, t)
            d.rectangle([caja[0] - 3, caja[1] - 3, caja[2] + 2, caja[3] + 2],
                        outline=acc, width=3)
        res = seg.get("resaltado")
        if res and er >= 0.999 and len(res) == 4:
            cw, ch = caja[2] - caja[0], caja[3] - caja[1]
            bx0 = caja[0] + float(res[0]) * cw
            by0 = caja[1] + float(res[1]) * ch
            bx1 = caja[0] + float(res[2]) * cw
            by1 = caja[1] + float(res[3]) * ch
            pulso = 0.5 + 0.5 * math.sin(t * 26.0)
            capa = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            dc = ImageDraw.Draw(capa)
            dc.rectangle([bx0, by0, bx1, by1], fill=acc + (int(26 + 22 * pulso),))
            dc.rectangle([bx0, by0, bx1, by1],
                         outline=acc + (int(140 + 115 * pulso),), width=5)
            img.paste(capa, (0, 0), capa)

    # --- Que dice la prueba ---
    demora = 0.34 if hay_img else 0.14
    ec = eo_cubic(max(0.0, min(1.0, (t - demora) / 0.30)))
    if ec > 0:
        ft, lns = auto_tam(d, seg.get("texto", ""), W - 190,
                           300 if hay_img else 640, 76 if hay_img else 104)
        if hay_img:
            y = ybot + 44
        else:
            # Sin captura el plano es solo texto + fuente: centrar el
            # bloque entre el kicker y la regla de la fuente, si no
            # queda un pozo muerto en la mitad de abajo.
            alto_bloque = len(lns) * (ft.size + 14) - 14
            y = H * 0.16 + (H * 0.845 - H * 0.16 - alto_bloque) / 2
        for ln in lns:
            wl = d.textbbox((0, 0), ln, font=ft)[2]
            capa = Image.new("RGBA", (W, ft.size + 34), (0, 0, 0, 0))
            ImageDraw.Draw(capa).text(((W - wl) / 2, 0), ln, font=ft,
                                      fill=col_txt + (int(255 * ec),))
            img.paste(capa, (0, int(y + (1 - ec) * 26)), capa)
            y += ft.size + 14

    # --- La fuente. Ultima en entrar y siempre presente ---
    ef = eo_expo(max(0.0, min(1.0, (t - 0.58) / 0.26)))
    if ef <= 0:
        return
    fuente = str(seg.get("fuente", "")).strip()
    etiqueta = "FUENTE" if fuente else "SIN FUENTE"
    cuerpo = fuente or "este dato va sin respaldo"
    col_lab = acc if fuente else (206, 92, 78)
    yf = H * 0.845
    semi = 300 * ef
    d.rectangle([W / 2 - semi, yf, W / 2 + semi, yf + 2], fill=(70, 70, 82))

    fe = fnt(26)
    we = _ancho_espaciado(d, etiqueta, fe, 6)
    capa = Image.new("RGBA", (W, fe.size + 22), (0, 0, 0, 0))
    _texto_espaciado(ImageDraw.Draw(capa), ((W - we) / 2, 0), etiqueta, fe,
                     col_lab + (int(255 * ef),), 6)
    img.paste(capa, (0, int(yf + 22)), capa)

    ff, lf = auto_tam(d, cuerpo, W - 200, 140, 40, ligera=True)
    yy = yf + 74
    for ln in lf:
        wl = d.textbbox((0, 0), ln, font=ff)[2]
        capa = Image.new("RGBA", (W, ff.size + 24), (0, 0, 0, 0))
        ImageDraw.Draw(capa).text(((W - wl) / 2, 0), ln, font=ff,
                                  fill=(178, 178, 190, int(255 * ef)))
        img.paste(capa, (0, int(yy)), capa)
        yy += ff.size + 8


def f_flujo(img, d, seg, t, pal):
    """Cadena A -> B -> C: cajas apiladas unidas por flechas.

    'camino' es un mapa sinuoso de recorrido y 'pasos' una lista
    numerada; ninguno dibuja la forma caja-flecha-caja, que es como se
    explica un flujo o una automatizacion. La ultima caja va en el
    color de acento: es el resultado, y tiene que leerse distinto de
    los pasos que llevan a el.

    Campos:
        "nodos"  ["Lo que ya hacés", "La herramienta", "El resultado"]
                 (hasta 4; mas que eso no entra legible en vertical)
        "notas"  opcional, una linea chica adentro de cada caja
        "texto"  opcional, titulo arriba
    """
    acc = tuple(pal["destacado"])
    col_txt = tuple(pal["texto"])
    col_fondo = tuple(pal["fondo"])

    nodos = [str(n) for n in (seg.get("nodos") or [])][:4]
    if not nodos:
        nodos = [str(seg.get("texto", ""))]
        titulo = None
    else:
        titulo = seg.get("texto")
    notas = list(seg.get("notas") or [])
    n = len(nodos)

    # --- Titulo ---
    if titulo:
        et = eo_expo(min(1.0, t / 0.14))
        ft, lt_ = auto_tam(d, str(titulo).upper(), W - 200, 150, 46)
        yt = H * 0.10
        for ln in lt_:
            wl = d.textbbox((0, 0), ln, font=ft)[2]
            capa = Image.new("RGBA", (W, ft.size + 26), (0, 0, 0, 0))
            ImageDraw.Draw(capa).text(((W - wl) / 2, 0), ln, font=ft,
                                      fill=(182, 182, 196, int(255 * et)))
            img.paste(capa, (0, int(yt + (1 - et) * 12)), capa)
            yt += ft.size + 8

    gap = 96
    alto = min(250, int((H * 0.68 - gap * (n - 1)) / n))
    total = alto * n + gap * (n - 1)
    y0 = int(H * 0.53 - total / 2)

    t0 = 0.10 if titulo else 0.02
    slot = (0.97 - t0) / n

    for i, texto_nodo in enumerate(nodos):
        e = eo_back(max(0.0, min(1.0, (t - t0 - i * slot) /
                                 max(0.02, slot * 0.60))))
        if e <= 0:
            break
        a = int(255 * min(1.0, max(0.0, e) * 1.5))
        ultimo = (i == n - 1)
        yy = y0 + i * (alto + gap)
        dx = int(max(0.0, 1 - e) * 70)

        capa = Image.new("RGBA", (W, alto + 10), (0, 0, 0, 0))
        dc = ImageDraw.Draw(capa)
        if ultimo:
            dc.rounded_rectangle([110, 0, W - 110, alto], radius=26,
                                 fill=acc + (a,))
            col = col_fondo
            col_nota = col_fondo
        else:
            dc.rounded_rectangle([110, 0, W - 110, alto], radius=26,
                                 fill=(255, 255, 255, int(a * 0.05)),
                                 outline=(150, 150, 166, a), width=3)
            col = col_txt
            col_nota = (168, 168, 184)

        nota = str(notas[i]) if i < len(notas) and notas[i] else None
        ft, lns = auto_tam(d, texto_nodo, W - 300,
                           alto - (72 if nota else 30), 66)
        alto_txt = len(lns) * (ft.size + 10) - 10 + (46 if nota else 0)
        yt = (alto - alto_txt) / 2
        for ln in lns:
            wl = d.textbbox((0, 0), ln, font=ft)[2]
            dc.text(((W - wl) / 2, yt), ln, font=ft, fill=col + (a,))
            yt += ft.size + 10
        if nota:
            fnn = fnt(30, ligera=True)
            wl = d.textlength(nota, font=fnn)
            dc.text(((W - wl) / 2, yt + 10), nota, font=fnn,
                    fill=col_nota + (int(a * 0.85),))
        img.paste(capa, (dx, yy), capa)

        # --- Flecha hacia el nodo siguiente ---
        if ultimo:
            continue
        pa = max(0.0, min(1.0, (t - t0 - i * slot - slot * 0.55) /
                          max(0.02, slot * 0.45)))
        if pa <= 0:
            continue
        ax = W / 2
        ay0 = yy + alto + 16
        largo = (gap - 34) * eo_expo(pa)
        d.rectangle([ax - 2, ay0, ax + 2, ay0 + largo], fill=acc)
        if pa > 0.72:
            p = (pa - 0.72) / 0.28
            ay1 = ay0 + largo
            d.polygon([(ax - 16 * p, ay1 - 17 * p), (ax + 16 * p, ay1 - 17 * p),
                       (ax, ay1)], fill=acc)

# ============ CASCADA — el bloque escalonado de la referencia ============
# Reconstruido mirando cuadro por cuadro los videos que paso el
# operador (cuenta @ventasilenciosa). Lo que hace NO es una palabra
# que cae ni un subtitulo grande: es un BLOQUE DE LINEAS QUE SE
# ACUMULA y se queda quieto mientras el metraje corta debajo.
#
#     Por $0.50 centavos          serif, pegado a la izquierda
#                   más...        sans pesada y apretada, corrida a la derecha
#     Agrandas también            sans liviana, izquierda otra vez
#              la bebida          sans pesada, centrada
#
# Las cuatro cosas que lo hacen ese efecto y no otro:
#
#   1. Las lineas ENTRAN DE A UNA y NO SE VAN. Al final del plano
#      estan las cuatro juntas. Eso es lo que deja leer la frase
#      entera mientras la voz ya paso a otra cosa.
#   2. Cada linea tiene OTRA TIPOGRAFIA. Serif, sans liviana y sans
#      pesada alternadas: el contraste es el que hace que se vea caro,
#      no un efecto de movimiento.
#   3. Cada linea tiene OTRA SANGRIA. Izquierda, derecha, centro. El
#      escalonado es lo que se lee como "cascada".
#   4. Van de a PARES: dos lineas juntas, un hueco grande, dos lineas
#      juntas. Sin ese hueco se lee como una lista y se pierde el
#      remate.
#
# El texto va DIRECTO sobre el metraje, sin caja ni franja: solo un
# halo difuminado para que se lea. Y el metraje puede ir a sangre o
# como tarjeta redondeada sobre negro, que la referencia alterna.

# (estilo, alineacion, escala). Se cicla si el guion no declara nada.
CASCADA_RITMO = [
    ("serif",    "izq",    1.00),
    ("peso",     "der",    1.05),
    ("liviana",  "izq",    0.92),
    ("peso",     "centro", 1.10),
]
CASCADA_TAM = 78
# Tracking negativo en la pesada: en la referencia las letras casi se
# tocan, y eso es la mitad de su caracter. Va como fraccion del cuerpo.
CASCADA_APRIETE = -0.030


def _cascada_linea(dib, linea, i):
    """Normaliza una linea del guion: acepta un string suelto o un
    diccionario que pisa estilo, alineacion y escala."""
    est, ali, esc = CASCADA_RITMO[i % len(CASCADA_RITMO)]
    if isinstance(linea, dict):
        return (str(linea.get("texto", "")), linea.get("estilo", est),
                linea.get("align", ali), float(linea.get("esc", esc)))
    return (str(linea), est, ali, esc)


def _cascada_fuente(estilo, tam):
    if estilo == "serif":
        return fnt(tam, serif=True), 0
    if estilo == "liviana":
        return fnt(tam, ligera=True), 0
    return fnt(tam), int(round(tam * CASCADA_APRIETE))   # "peso"


def f_cascada(img, d, seg, t, pal):
    """Bloque escalonado que se acumula sobre el metraje.

    JSON:
        {"formato": "cascada",
         "lineas": ["Por $0.50 centavos", "más...",
                    {"texto": "la bebida", "estilo": "peso",
                     "align": "centro", "esc": 1.2}],
         "imagen": "...",            metraje detras (o "video")
         "encuadre": "sangre"|"tarjeta",
         "velo": 0.30,               cuanto se oscurece el metraje
         "cascada_y0": 0.10}         donde arranca el bloque
    """
    encuadre = seg.get("encuadre", "sangre")
    # "claro": el cartel al reves, fondo claro y letra oscura. La
    # referencia alterna negro pleno y blanco pleno todo el tiempo, y
    # ESE salto es la transicion: no hace falta ningun efecto, el ojo
    # ya lo lee como un golpe.
    claro = bool(seg.get("claro"))
    if claro:
        pal = {"fondo": pal["texto"], "texto": pal["fondo"],
               "destacado": pal["destacado"]}
    if encuadre == "plano":
        # Cartel sin metraje: solo color y tipografia.
        img.paste(Image.new("RGB", (W, H), tuple(pal["fondo"])), (0, 0))
    elif encuadre == "tarjeta":
        # Metraje como tarjeta redondeada sobre negro, como alterna la
        # referencia. El negro alrededor es lo que deja respirar al
        # texto que va arriba y abajo de la tarjeta.
        img.paste(Image.new("RGB", (W, H), tuple(pal["fondo"])), (0, 0))
        cw = int(W * 0.91)
        ch = int(cw * 0.72)
        cx, cy = (W - cw) // 2, int(H * 0.52 - ch / 2)
        tarjeta = Image.new("RGB", (cw, ch), tuple(pal["fondo"]))
        _cuadro_medio(tarjeta, seg, (0, 0, cw, ch), t)
        mascara = Image.new("L", (cw, ch), 0)
        ImageDraw.Draw(mascara).rounded_rectangle([0, 0, cw - 1, ch - 1],
                                                  radius=24, fill=255)
        img.paste(tarjeta, (cx, cy), mascara)
    else:
        _cuadro_medio(img, seg, (0, 0, W, H), t)
    velo = float(seg.get("velo", 0.0 if encuadre == "plano" else 0.30))
    if velo > 0:
        img.paste(Image.blend(img, Image.new("RGB", (W, H), (0, 0, 0)), velo),
                  (0, 0))

    lineas = seg.get("lineas") or []
    if not lineas:
        return
    n = len(lineas)
    base = int(seg.get("cascada_tam", CASCADA_TAM))
    y = H * float(seg.get("cascada_y0", 0.105))
    col = tuple(pal["texto"])
    # Cada linea aparece en su turno y ya no se va. El ultimo 18% del
    # plano queda con el bloque completo: es el tiempo de leerlo.
    reparto = 0.82 / n
    entrada = min(0.13, reparto * 0.7)

    for i, cruda in enumerate(lineas):
        txt, estilo, align, esc = _cascada_linea(d, cruda, i)
        if not txt:
            continue
        tam = max(28, int(base * esc))
        f, apriete = _cascada_fuente(estilo, tam)
        ancho_max = W * 0.88
        anc = _ancho_espaciado(d, txt, f, apriete)
        while anc > ancho_max and tam > 28:
            tam -= 4
            f, apriete = _cascada_fuente(estilo, tam)
            anc = _ancho_espaciado(d, txt, f, apriete)

        aparece = i * reparto
        lt = (t - aparece) / entrada
        if lt <= 0:
            # Todavia no le toca: igual hay que reservar su altura para
            # que las de abajo no se corran cuando entre.
            y += tam * (1.18 if i % 2 == 0 else 2.15)
            continue
        lt = min(1.0, lt)
        alpha = int(255 * lt)
        # Sube unos pocos pixeles al entrar. Corto: en la referencia
        # la linea aparece casi de golpe, no se desliza.
        dy = int((1 - eo_expo(lt)) * 16)

        if align == "izq":
            x = W * 0.055
        elif align == "der":
            x = W - W * 0.075 - anc
        else:
            x = (W - anc) / 2

        x0b, y0b, x1b, y1b = d.textbbox((0, 0), txt, font=f)
        pad = 26
        capa = Image.new("RGBA", (int(anc) + pad * 2, (y1b - y0b) + pad * 2),
                         (0, 0, 0, 0))
        _sombra_suave(capa, txt, f, pad, pad - y0b, alpha, apriete, col)
        _texto_espaciado(ImageDraw.Draw(capa), (pad, pad - y0b), txt, f,
                         col + (alpha,), apriete)
        img.paste(capa, (int(x - pad), int(y + dy - pad)), capa)

        # Los pares: dos lineas pegadas, hueco grande, dos lineas
        # pegadas. Sin el hueco se lee como lista y se pierde el remate.
        y += tam * (1.18 if i % 2 == 0 else 2.15)


def _sombra_suave(capa, txt, f, px, py, alpha, track=0, col_txt=None):
    """Halo difuminado detras del texto. La sombra dura desplazada es
    el tic de plantilla; esto es lo que hace que el texto se lea sobre
    metraje sin parecer pegoteado encima.

    El halo va del color CONTRARIO al del texto: sobre un cartel claro
    con letra oscura, un halo oscuro se ve como un manchon alrededor
    de cada palabra."""
    claro = False
    if col_txt is not None:
        r, g, b = col_txt[:3]
        claro = (0.299 * r + 0.587 * g + 0.114 * b) < 128
    h = Image.new("L", capa.size, 0)
    dh = ImageDraw.Draw(h)
    if track:
        _texto_espaciado(dh, (px, py), txt, f, int(alpha * 0.8), track)
    else:
        dh.text((px, py), txt, font=f, fill=int(alpha * 0.8))
    h = h.filter(ImageFilter.GaussianBlur(10))
    halo = (255, 255, 255, 255) if claro else (0, 0, 0, 255)
    capa.paste(Image.new("RGBA", capa.size, halo), (0, 0), h)

def f_menu(img, d, seg, t, pal):
    """Lista de precios con miniatura, como la carta de un local.

    Sacado de la referencia: filas que se acumulan, cada una con el
    texto chico a un lado y una miniatura REDONDEADA del producto al
    otro. Escalonadas, no alineadas en una grilla. Es la forma mas
    barata de mostrar "esto cuesta tanto y viene con esto" sin tener
    que filmar nada.

    JSON:
        {"formato": "menu",
         "filas": [
           {"texto": "POR SOLO $1 MÁS.\\nAgregás bebida:", "imagen": "..."},
           {"texto": "POR OTROS $0.25.\\ncebolla caramelizada:", "imagen": "..."}
         ],
         "claro": false}
    """
    if seg.get("claro"):
        pal = {"fondo": pal["texto"], "texto": pal["fondo"],
               "destacado": pal["destacado"]}
    img.paste(Image.new("RGB", (W, H), tuple(pal["fondo"])), (0, 0))
    filas = seg.get("filas") or []
    if not filas:
        return
    n = len(filas)
    reparto = 0.84 / n
    entrada = min(0.14, reparto * 0.7)
    mini = int(W * 0.155)
    alto_fila = int(mini * 1.72)
    y = H * float(seg.get("menu_y0", 0.14))
    col = tuple(pal["texto"])

    for i, fila in enumerate(filas):
        lt = (t - i * reparto) / entrada
        if lt <= 0:
            y += alto_fila
            continue
        lt = min(1.0, lt)
        alpha = int(255 * lt)
        dy = int((1 - eo_expo(lt)) * 14)
        # Escalonado: las impares corridas a la derecha. Sin eso se
        # lee como una tabla y pierde el aire de la referencia.
        sangria = W * (0.055 if i % 2 == 0 else 0.235)
        ancho_txt = W - sangria - mini - W * 0.10

        lineas = str(fila.get("texto", "")).split("\n")
        f = fnt(max(26, int(W * 0.036)), ligera=True, serif=True)
        yy = y + dy
        for k, ln in enumerate(lineas):
            ft = f if k else fnt(max(26, int(W * 0.036)), serif=True)
            while d.textbbox((0, 0), ln, font=ft)[2] > ancho_txt and ft.size > 20:
                ft = fnt(ft.size - 2, ligera=bool(k), serif=True)
            x0b, y0b, x1b, y1b = d.textbbox((0, 0), ln, font=ft)
            capa = Image.new("RGBA", (x1b - x0b + 40, y1b - y0b + 40),
                             (0, 0, 0, 0))
            _sombra_suave(capa, ln, ft, 20 - x0b, 20 - y0b, alpha, 0, col)
            ImageDraw.Draw(capa).text((20 - x0b, 20 - y0b), ln, font=ft,
                                      fill=col + (alpha,))
            img.paste(capa, (int(sangria - 20), int(yy - 20)), capa)
            yy += ft.size * 1.28

        ruta = fila.get("imagen") or fila.get("foto")
        if ruta and Path(ruta).exists() and lt > 0.25:
            try:
                im = Image.open(ruta).convert("RGB")
            except Exception:
                im = None
            if im is not None:
                mx = int(sangria + ancho_txt + W * 0.035)
                my = int(y + dy)
                cuadro = Image.new("RGB", (mini, mini), tuple(pal["fondo"]))
                _pegar_encuadrado(cuadro, im, (0, 0, mini, mini))
                mascara = Image.new("L", (mini, mini), 0)
                ImageDraw.Draw(mascara).rounded_rectangle(
                    [0, 0, mini - 1, mini - 1], radius=int(mini * 0.22),
                    fill=int(255 * min(1.0, (lt - 0.25) / 0.4)))
                img.paste(cuadro, (mx, my), mascara)
        y += alto_fila

FORMATOS = {
    "declaracion": f_declaracion, "dato_duro": f_dato_duro,
    "division": f_division, "revelacion": f_revelacion,
    "cronologia": f_cronologia, "conteo": f_conteo,
    "pregunta": f_pregunta, "editorial": f_editorial,
    "retrato": f_retrato, "galeria": f_galeria,
    "cita": f_cita, "pasos": f_pasos, "ranking": f_ranking,
    "alerta": f_alerta, "panel": f_panel, "terminal": f_terminal,
    "camino": f_camino, "collage": f_collage,
    "mensajes": f_mensajes, "escalada": f_escalada, "cta": f_cta,
    "pleno": f_pleno, "tarjeta": f_tarjeta,
    "ruleta": f_ruleta, "lista": f_lista, "comparacion": f_comparacion,
    "prueba": f_prueba, "flujo": f_flujo, "cascada": f_cascada,
    "menu": f_menu,
}

# Los comentarios de aca abajo describen el COLOR, no una marca ni un
# nicho: la etapa cambio de tema y las etiquetas viejas ("EL CORTE",
# "nicho filosofia") ya no decian nada util sobre cuando usar cada una.
# Los valores quedan intactos a proposito -- tocarlos re-pintaria en
# silencio todos los guiones ya escritos.
PALETAS = [
    # [0] Por defecto: casi negro, tipografia hueso, verde señal.
    #     Editorial y de pantalla; el acento se lee como "esto importa".
    {"fondo": [15, 15, 16], "texto": [242, 239, 233], "destacado": [74, 222, 128]},
    # [1] Piedra, hueso y dorado apagado. Calida y sobria.
    {"fondo": [24, 22, 20], "texto": [238, 232, 220], "destacado": [198, 160, 92]},
    {"fondo": [18, 18, 17], "texto": [232, 228, 218], "destacado": [176, 148, 108]},
    {"fondo": [12, 12, 18], "texto": [245, 245, 250], "destacado": [255, 84, 48]},
    {"fondo": [8, 14, 26], "texto": [238, 246, 255], "destacado": [82, 190, 255]},
    {"fondo": [10, 22, 17], "texto": [235, 250, 242], "destacado": [62, 222, 140]},
    {"fondo": [20, 11, 26], "texto": [246, 240, 252], "destacado": [200, 110, 255]},
    {"fondo": [6, 6, 6], "texto": [255, 255, 255], "destacado": [250, 208, 40]},
    {"fondo": [242, 239, 233], "texto": [20, 20, 26], "destacado": [228, 60, 32]},
]


# Contexto compartido con los procesos que dibujan cuadros en paralelo.
# Se llena una sola vez antes de abrir el pool; con 'fork' cada hijo lo
# hereda tal cual, sin serializar nada.
_CTX = {}
_ULT_CACHE = {}


def _ultimo_cuadro(si):
    """Ultimo cuadro del segmento anterior, necesario para las
    transiciones. Se calcula bajo demanda y se cachea POR PROCESO."""
    if si in _ULT_CACHE:
        return _ULT_CACHE[si]
    segs, cfg, fps = _CTX["segs"], _CTX["cfg"], _CTX["fps"]
    acc = sum(s["duracion"] for s in segs[:si + 1])
    img = render(segs[si], 1.0, acc / _CTX["dur"], cfg)
    _ULT_CACHE[si] = img
    return img


def _dibujar_cuadro(tarea):
    """Dibuja y guarda UN cuadro. Se ejecuta en el proceso principal o
    en un trabajador del pool, sin diferencia."""
    n, si, f, nf, tipo, ft_local, freeze_frac, acc = tarea
    cfg, segs, fps = _CTX["cfg"], _CTX["segs"], _CTX["fps"]
    seg = segs[si]
    t = f / max(1, nf - 1)
    fr = render(seg, t, (acc + f / fps) / _CTX["dur"], cfg)
    if si > 0 and f < ft_local and tipo != "corte":
        prev = _ultimo_cuadro(si - 1)
        if prev is not None:
            fr = transicion(prev, fr, f / ft_local, tipo, cfg["paleta"],
                            freeze_frac)
    # compress_level=1 en vez del 6 por defecto: 25ms en vez de 37ms por
    # cuadro. El PNG pesa mas pero es temporal, ffmpeg lo lee igual y se
    # borra al terminar.
    fr.save(_CTX["tmp"] / f"f{n:06d}.png", compress_level=1)


def render(seg, t, prog, cfg):
    pal = cfg["paleta"]
    # Los cuadros de un clip se extraen a los fps del video final, asi
    # que la maqueta necesita saber cual es.
    seg.setdefault("_fps", cfg.get("fps", 30))
    img = base_fondo(pal, t, seg)
    # Imagen de fondo: encuadrada, duotono a la paleta y oscurecida para
    # que el texto siempre se lea. Ken Burns muy lento (ritmo del nicho).
    # 'prueba' enmarca la captura el mismo: si ademas se pintara de
    # fondo a sangre, la misma imagen se veria dos veces y en duotono
    # verde. Una captura que se muestra como evidencia tiene que
    # verse con sus colores y una sola vez.
    if seg.get("imagen") and seg.get("formato") not in ("retrato", "prueba"):
        listo = seg.get("_fondo")
        if listo is None:
            cache = {}
            listo = preparar_retrato(seg["imagen"], int(W*1.10), int(H*1.10),
                                     pal, cache)
            seg["_fondo"] = listo if listo is not None else False
        base = seg["_fondo"] or None
        if base is not None:
            dx = int((base.width - W) * (0.5 + 0.12*math.sin(t*math.pi)))
            dy = int((base.height - H) * 0.5)
            dx = max(0, min(dx, base.width - W)); dy = max(0, min(dy, base.height - H))
            base = base.crop((dx, dy, dx + W, dy + H))
            vel = seg.get("vel_imagen", 0.62)
            img = Image.blend(base, img, vel)
    d = ImageDraw.Draw(img)
    fmt = seg.get("formato", "declaracion")
    FORMATOS.get(fmt, f_declaracion)(img, d, seg, t, pal)
    # Flash de corte: va DESPUES de la maqueta (lava la escena ya
    # dibujada) y antes del hook, para que el golpe de luz sea lo
    # primero que se ve del plano nuevo.
    if seg.get("flash"):
        img = aplicar_flash(img, seg, t)
        d = ImageDraw.Draw(img)
    # Efecto de hook (solo primeros frames del segmento)
    hk = seg.get("hook")
    if hk:
        for nombre in ([hk] if isinstance(hk, str) else hk):
            if nombre in HOOKS:
                img = HOOKS[nombre](img, t, pal)
        d = ImageDraw.Draw(img)

    # Captions kinetic opcionales (palabra por palabra). Van despues
    # del hook y antes de la camara para que floten con el resto del
    # frame igual que cualquier otro elemento.
    if seg.get("captions_palabra_por_palabra"):
        dibujar_captions_kinetic(img, d, seg, t, pal)

    # Vida ambiental (ver definicion arriba de FORMATOS): universal,
    # va antes de la camara para que las motas floten integradas al
    # resto del cuadro (reciben el mismo leve zoom/paneo que todo lo
    # demas, en vez de sentirse pegadas encima). t_abs es tiempo
    # absoluto y continuo a lo largo de TODO el video -- generar()
    # guarda la duracion total en cfg["_dur_total"] para esto; sin esa
    # clave (p.ej. catalogo(), que solo pide un cuadro suelto) se cae
    # a tiempo local del segmento, que alcanza para un cuadro fijo.
    dur_total = cfg.get("_dur_total")
    t_abs = prog * dur_total if dur_total else t * seg.get("duracion", 3.0)
    # La capa ambiental (particulas + grano + latido de borde) esta hecha
    # para fondos oscuros. Sobre la maqueta clara 'tarjeta' pinta un
    # marco de acento encima del blanco y ensucia lo que justamente tiene
    # que verse limpio, asi que ahi no corre: en esa maqueta el
    # movimiento ya lo da la palabra que cambia y el salto a la maqueta
    # oscura.
    if fmt not in ("tarjeta", "comparacion", "cta", "prueba", "flujo", "cascada", "menu"):
        dibujar_ambiente(img, d, t_abs, pal)
    d = ImageDraw.Draw(img)

    # Camara: leve deriva, distinta por formato, con opcion de shake
    # real encima -- pedido explicito del operador de "camara mas
    # agresiva" (no solo el paneo sutil que ya existia).
    amp = cfg.get("camara", 1.0) * seg.get("camara_intensidad", 1.0)
    if amp > 0 and fmt not in ("division",):
        z = 1.0 + 0.028 * amp * eio(t)
        dx = math.sin(t * 2.2) * 9 * amp
        dy = math.cos(t * 1.7) * 7 * amp

        # Shake continuo (ruido real, no seno): "camara_shake" 0..1+.
        shake_cont = seg.get("camara_shake", 0.0)
        if shake_cont > 0:
            rc = random.Random(int(t * 5000))
            dx += rc.uniform(-1, 1) * 16 * shake_cont
            dy += rc.uniform(-1, 1) * 11 * shake_cont
            z += 0.018 * shake_cont

        # Picos puntuales de shake en momentos declarados del segmento
        # ("camara_golpes": fracciones 0..1). 'mensajes'/'escalada'
        # generan los suyos solos (uno por mensaje/corte) si el guion
        # no los declara a mano -- mismo reparto de tiempo que usan
        # sus propios formatos y el SFX correspondiente en
        # construir_audio(), via las mismas funciones _tiempos_*.
        golpes = seg.get("camara_golpes")
        if golpes is None:
            if fmt == "mensajes":
                golpes = _tiempos_mensajes(seg)
            elif fmt == "escalada":
                golpes = _tiempos_escalada(seg)[1:-1]
        if golpes:
            pico = 0.0
            for gt in golpes:
                dtime = abs(t - gt)
                if dtime < 0.16:
                    pico = max(pico, 1 - dtime / 0.16)
            if pico > 0:
                rg = random.Random(int(t * 3000) + 7)
                dx += rg.uniform(-1, 1) * 26 * pico
                dy += rg.uniform(-1, 1) * 18 * pico
                z += 0.05 * pico

        nw, nh = int(W * z), int(H * z)
        img = img.resize((nw, nh), Image.LANCZOS)
        cx = (nw - W) / 2 + dx
        cy = (nh - H) / 2 + dy
        cx = max(0, min(cx, nw - W)); cy = max(0, min(cy, nh - H))
        img = img.crop((int(cx), int(cy), int(cx) + W, int(cy) + H))
    # Pulso de flashes a lo largo de todo el video (ver
    # aplicar_flash_ritmo). Va al final, sobre el cuadro ya compuesto y
    # ya movido por la camara: es un golpe de luz sobre la imagen
    # final, no un elemento mas de la maqueta.
    if cfg.get("flash_ritmo"):
        img = aplicar_flash_ritmo(img, t_abs, cfg)
    d = ImageDraw.Draw(img)
    d.rectangle([0, H - 9, int(W * prog), H], fill=tuple(pal["destacado"]))
    return img



def _zoom_radial(img, fuerza):
    """Desenfoque radial: simula un zoom rapido de camara.
    Se logra apilando copias escaladas. Muy cinematografico."""
    if fuerza < 0.02:
        return img
    acum = img.convert("RGB")
    pasos = 5
    for i in range(1, pasos + 1):
        z = 1 + fuerza * (i / pasos) * 0.16
        nw, nh = int(W * z), int(H * z)
        capa = img.resize((nw, nh), Image.BILINEAR).crop(
            ((nw - W) // 2, (nh - H) // 2,
             (nw - W) // 2 + W, (nh - H) // 2 + H))
        acum = Image.blend(acum, capa, 1.0 / (i + 1))
    return acum


def _polvo(a, b, t, semilla=9):
    """Disolucion en particulas: A se deshace en polvo y aparece B.
    Encaja con la estetica de marmol/piedra del nicho."""
    e = eio(t)
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    rnd = random.Random(semilla)
    # Bloques que se revelan en orden pseudo-aleatorio segun avance
    cel = 26
    for y in range(0, H, cel):
        for x in range(0, W, cel):
            umbral = rnd.random() * 0.75 + (x / W) * 0.25
            if e > umbral:
                r = min(cel, int(cel * (e - umbral) * 6))
                d.rectangle([x, y, x + r, y + r], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(7))
    return Image.composite(b, a, m)


def _iris(a, b, t):
    """Apertura circular desde el centro, con borde luminoso."""
    e = eio(t)
    r = int(math.hypot(W, H) * 0.55 * e)
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    d.ellipse([W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(18))
    out = Image.composite(b, a, m)
    if 0.04 < e < 0.97:
        do = ImageDraw.Draw(out)
        do.ellipse([W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r],
                   outline=(255, 245, 220), width=5)
    return out


def _rotacion(a, b, t):
    """Giro leve con escala: entrada elegante, no mareadora."""
    e = eio(t)
    ang = 7 * (1 - e)
    z = 1 + 0.13 * (1 - e)
    nw, nh = int(W * z), int(H * z)
    capa = b.resize((nw, nh), Image.BICUBIC).rotate(
        ang, resample=Image.BICUBIC, center=(nw / 2, nh / 2))
    capa = capa.crop(((nw - W) // 2, (nh - H) // 2,
                      (nw - W) // 2 + W, (nh - H) // 2 + H))
    return Image.blend(a, capa, min(1.0, e * 1.2))


def _linea_dorada(a, b, t, pal=None):
    """Barrido vertical con una linea luminosa que corta la pantalla."""
    e = eio(t)
    y = int(H * e)
    out = a.copy()
    out.paste(b.crop((0, 0, W, y)), (0, 0))
    if 0 < y < H:
        d = ImageDraw.Draw(out)
        col = tuple(pal["destacado"]) if pal else (230, 200, 130)
        for k, gr in enumerate([10, 6, 3]):
            alfa = [70, 140, 255][k]
            capa = Image.new("RGB", (W, H), col)
            mm = Image.new("L", (W, H), 0)
            ImageDraw.Draw(mm).rectangle([0, y - gr, W, y + gr], fill=alfa)
            out = Image.composite(capa, out, mm)
        d = ImageDraw.Draw(out)
        d.rectangle([0, y - 2, W, y + 2], fill=(255, 250, 235))
    return out


_QUIEBRE_CACHE = {}


def _scanlines_fuente():
    """Lienzo de scanlines generado UNA sola vez (mismo criterio de
    costo que _grano_fuente en la capa de vida ambiental): recortar +
    multiplicar por cuadro es barato, dibujar ~480 lineas por cuadro
    no lo es."""
    if "scan" not in _QUIEBRE_CACHE:
        im = Image.new("L", (W, H), 255)
        dd = ImageDraw.Draw(im)
        for y in range(0, H, 4):
            dd.line([(0, y), (W, y)], fill=130)
        _QUIEBRE_CACHE["scan"] = im
    return _QUIEBRE_CACHE["scan"]


def _quiebre_glitch(a, b, t, pal):
    """VHS/glitch fuerte hacia el capitulo nuevo: separacion RGB,
    scanlines, bandas desplazadas, dip a negro en el pico y un
    light-leak en el verde de marca -- señal real de cambio de
    capitulo (confirmado por la investigacion de esta ronda), no un
    fade suave. t = 0..1 SOLO dentro de la porcion de glitch (la
    porcion de freeze ya se resolvio antes, en transicion())."""
    pico = 0.5
    fuerza = max(0.0, 1 - abs(t - pico) / pico)
    base = a if t < pico else b
    if fuerza < 0.03:
        return base
    r, g, bl = base.split()
    off = int(20 * fuerza)
    out = Image.merge("RGB", (ImageChops.offset(r, off, 0), g,
                              ImageChops.offset(bl, -off, 0)))
    scan = _scanlines_fuente()
    scan_rgb = Image.merge("RGB", (scan, scan, scan))
    mezcla = ImageChops.multiply(out, scan_rgb)
    out = Image.blend(out, mezcla, min(1.0, fuerza * 1.3))
    rnd = random.Random(int(t * 977))
    for _ in range(3):
        y0 = rnd.randint(0, H - 50)
        alto = rnd.randint(10, 46)
        banda = out.crop((0, y0, W, y0 + alto))
        out.paste(banda, (rnd.randint(-40, 40), y0))
    if fuerza > 0.55:
        k = (fuerza - 0.55) / 0.45
        out = Image.blend(out, Image.new("RGB", (W, H), (0, 0, 0)), k * 0.85)
    if fuerza > 0.6:
        col = tuple(pal["destacado"]) if pal else (74, 222, 128)
        m = Image.new("L", (W, H), 0)
        dm = ImageDraw.Draw(m)
        cx = int(W * t)
        dm.polygon([(cx - 260, 0), (cx + 260, 0), (cx + 60, H), (cx - 460, H)],
                   fill=int(85 * (fuerza - 0.6) / 0.4))
        out = Image.composite(Image.new("RGB", (W, H), col), out, m)
    return out


def transicion(a, b, t, tipo, pal=None, freeze_frac=None):
    e = eio(t)
    if tipo == "fade":
        des = math.sin(t * math.pi) * 2.4
        aa = a.filter(ImageFilter.GaussianBlur(des)) if des > .4 else a
        bb = b.filter(ImageFilter.GaussianBlur(des)) if des > .4 else b
        return Image.blend(aa, bb, e)
    if tipo == "corte_duro":
        return b if t > 0.5 else a
    if tipo == "barrido":
        o = a.copy(); x = int(W * e)
        o.paste(b.crop((0, 0, x, H)), (0, 0))
        if 0 < x < W:
            ImageDraw.Draw(o).rectangle([x - 8, 0, x, H], fill=(255, 255, 255))
        return o
    if tipo == "slide":
        off = int(H * e); o = Image.new("RGB", (W, H))
        o.paste(a, (0, -off)); o.paste(b, (0, H - off)); return o
    if tipo == "punch":
        z = 1 + .2 * (1 - e); nw, nh = int(W * z), int(H * z)
        zz = b.resize((nw, nh), Image.LANCZOS).crop(
            ((nw - W) // 2, (nh - H) // 2, (nw - W) // 2 + W, (nh - H) // 2 + H))
        return Image.blend(a, zz, min(1.0, e * 1.3))
    if tipo == "dip":
        n = Image.new("RGB", (W, H), (0, 0, 0))
        return Image.blend(a, n, eio(t * 2)) if t < .5 \
            else Image.blend(n, b, eio((t - .5) * 2))
    if tipo == "whip":
        fz = math.sin(t * math.pi)
        aa = a.filter(ImageFilter.GaussianBlur(fz * 15))
        bb = b.filter(ImageFilter.GaussianBlur(fz * 15))
        ca = Image.new("RGB", (W, H)); ca.paste(aa, (-int(W * .4 * e), 0))
        cb = Image.new("RGB", (W, H)); cb.paste(bb, (int(W * .4 * (1 - e)), 0))
        return Image.blend(ca, cb, e)
    if tipo == "polvo":
        return _polvo(a, b, t)
    if tipo == "iris":
        return _iris(a, b, t)
    if tipo == "rotacion":
        return _rotacion(a, b, t)
    if tipo == "linea":
        return _linea_dorada(a, b, t, pal)
    if tipo == "zoom_radial":
        f = math.sin(t * math.pi)
        return Image.blend(_zoom_radial(a, f), _zoom_radial(b, f), e)
    if tipo == "quiebre":
        # Quiebre de capitulo: freeze total del ultimo frame del
        # segmento anterior (silencio de audio en esta misma ventana,
        # ver QUIEBRE_FREEZE_S/construir_audio) y DESPUES glitch/VHS
        # fuerte hacia el nuevo. freeze_frac lo calcula generar() a
        # partir de "quiebre_freeze"/"quiebre_glitch" del segmento.
        ff = freeze_frac if freeze_frac is not None else 0.55
        if t < ff:
            return a
        tt = (t - ff) / max(0.001, 1 - ff)
        return _quiebre_glitch(a, b, tt, pal)
    return b




# ============ SINCRONIZACION: LINEA DE TIEMPO CALCULADA ============
# El problema que resuelve: si la duracion de cada segmento se escribe
# a mano, la voz se corta o sobra silencio. Aca la VOZ manda: se genera
# primero, se mide su duracion real, y el video se ajusta a ella.
#
# Orden de calculo:
#   1. Generar voz de cada segmento -> duracion real medida con ffprobe
#   2. duracion_segmento = voz + respiro (pausa entre frases)
#   3. Los SFX se anclan al inicio EXACTO de cada transicion
#   4. La musica baja de volumen (ducking) donde hay voz
#   5. El total del video = suma exacta de la linea de tiempo

RESPIRO = 0.45          # silencio despues de cada frase, en segundos
DUCK_CON_VOZ = 0.10     # volumen de musica cuando hay voz
DUCK_SIN_VOZ = 0.26     # volumen de musica cuando no hay voz

# Quiebre de capitulo (freeze frame + silencio + glitch). Ver el
# campo "quiebre_capitulo" en el docstring del modulo. Un segmento
# puede sobreescribir cada mitad con "quiebre_freeze"/"quiebre_glitch"
# (segundos); su "duracion" tiene que alcanzar al menos la suma.
QUIEBRE_FREEZE_S = 0.5  # freeze + "aire muerto" (silencio total)
QUIEBRE_GLITCH_S = 0.4  # VHS/glitch hacia el segmento nuevo


def duracion_audio(path):
    """Mide la duracion real de un archivo con ffprobe."""
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except (ValueError, AttributeError):
        return None


def generar_voz(texto, modelo, destino):
    """Genera voz con Piper (open source). Devuelve duracion o None."""
    if not texto or not texto.strip():
        return None
    try:
        r = subprocess.run(
            [sys.executable, "-m", "piper", "-m", modelo, "-f", str(destino)],
            input=texto, capture_output=True, text=True, timeout=180)
        if r.returncode != 0 or not Path(destino).exists():
            print(f"AVISO: piper fallo -> {r.stderr[:160]}")
            return None
        return duracion_audio(destino)
    except FileNotFoundError:
        print("AVISO: piper no instalado (pip install piper-tts). "
              "Se usan las duraciones del guion.")
        return None
    except Exception as e:
        print(f"AVISO: error de voz ({e}).")
        return None


def texto_hablado(seg):
    """Extrae lo que se debe narrar de cada formato."""
    partes = []
    if seg.get("narracion"):
        return seg["narracion"]
    if seg.get("texto"):
        partes.append(seg["texto"])
    if seg.get("pregunta"):
        partes.append(seg["pregunta"])
    if seg.get("respuesta"):
        partes.append(seg["respuesta"])
    if seg.get("nombre"):
        partes.insert(0, seg["nombre"])
    for k in ("pasos", "items"):
        if seg.get(k):
            partes += list(seg[k])
    if seg.get("imagenes"):
        for im in seg["imagenes"]:
            if isinstance(im, dict) and im.get("texto"):
                partes.append(im["texto"])
    if seg.get("izquierda") and seg.get("derecha"):
        partes.append(seg["izquierda"].get("texto", ""))
        partes.append(seg["derecha"].get("texto", ""))
    return ". ".join([p for p in partes if p])


def construir_linea_tiempo(cfg, segs, tmp):
    """Calcula la linea de tiempo completa ANTES de renderizar.
    Devuelve (voces, marcas) donde marcas[i] = segundo de inicio del
    segmento i. Si hay voz, reescribe seg['duracion']."""
    voces = {}
    respiro = cfg.get("respiro", RESPIRO)

    # Voz externa (ej. grabada en ElevenLabs por el operador, no
    # generada por Piper): si el segmento trae 'voz_archivo', se usa
    # tal cual. La duracion real del audio manda igual que con Piper,
    # y reusa toda la mezcla/ducking de construir_audio() sin cambios.
    for i, seg in enumerate(segs):
        va = seg.get("voz_archivo")
        if not va:
            continue
        if not Path(va).exists():
            print(f"AVISO: no existe voz_archivo '{va}' (segmento {i+1}).")
            continue
        d = duracion_audio(va)
        if d:
            voces[i] = Path(va)
            seg["duracion"] = round(d + respiro, 2)

    if cfg.get("tts"):
        modelo = cfg.get("voz_modelo", "es_AR-daniela-high")
        print("Generando voz y midiendo duraciones...")
        for i, seg in enumerate(segs):
            if i in voces:
                continue  # ya tiene voz externa (voz_archivo)
            txt = texto_hablado(seg)
            if not txt:
                continue
            wav = tmp / f"voz{i:03d}.wav"
            d = generar_voz(txt, modelo, wav)
            if d:
                voces[i] = wav
                # LA VOZ MANDA: la duracion del segmento se ajusta a ella
                seg["duracion"] = round(d + respiro, 2)
        if voces:
            print(f"Voz generada: {len(voces)}/{len(segs)} segmentos. "
                  "Duraciones ajustadas a la narracion.")
        else:
            print("Sin voz generada: se usan las duraciones del guion.")

    marcas, acc = [], 0.0
    for seg in segs:
        marcas.append(acc)
        acc += seg["duracion"]
    return voces, marcas


# ============ AUDIO: SFX AUTOMATICO POR TRANSICION ============
# Cada transicion tiene un sonido que le corresponde. Se aplica solo,
# sin que el guion tenga que declararlo. Se puede sobreescribir con
# "sfx" en el segmento, o desactivar con "sfx_auto": false.

SFX_POR_TRANSICION = {
    "punch": "impacto", "whip": "whoosh", "slide": "whoosh",
    "barrido": "whoosh", "dip": "sub", "corte_duro": "impacto",
    "fade": None, "corte": None, "quiebre": "impacto",
}

SFX_POR_FORMATO = {
    "dato_duro": "campana", "conteo": "tick", "revelacion": "riser",
    "pasos": "tick", "alerta": "impacto", "collage": "whoosh",
    "mensajes": "tick", "escalada": "riser",
}


def _ventanas_quiebre(segs, marcas):
    """Ventanas [inicio, fin] en segundos donde el audio va a silencio
    TOTAL por el quiebre de capitulo -- el "aire muerto" antes del
    golpe (freeze frame + corte de audio a silencio: tecnica dramatica
    real, confirmada por la investigacion de esta ronda). Se aplica
    DESPUES del mix (ver 'silencios' en construir_audio), asi gana
    sobre voz + musica + sfx sin importar que haya debajo."""
    out = []
    for i, seg in enumerate(segs):
        if not seg.get("quiebre_capitulo"):
            continue
        t0 = marcas[i] if i < len(marcas) else 0.0
        fs = seg.get("quiebre_freeze", QUIEBRE_FREEZE_S)
        out.append((t0, t0 + fs))
    return out


def construir_audio(cfg, segs, dur_total, tmp, voces=None, marcas=None):
    """Mezcla sincronizada: voz + SFX anclados a las transiciones +
    musica con ducking automatico donde hay voz.

    Todo se posiciona con adelay en milisegundos calculados desde la
    linea de tiempo, no estimados. Por eso queda cuadrado."""
    voces = voces or {}
    marcas = marcas or []
    dir_sfx = Path(cfg.get("dir_sfx", "assets/sfx"))
    entradas, filtros, etiquetas = [], [], []
    n = 0

    # --- 1. VOZ (la capa principal, va primero) ---
    for i, seg in enumerate(segs):
        if i in voces and Path(voces[i]).exists():
            t0 = marcas[i] if i < len(marcas) else 0.0
            delay = int(t0 * 1000)
            entradas += ["-i", str(voces[i])]
            filtros.append(f"[{n}:a]adelay={delay}|{delay},"
                           f"volume={cfg.get('vol_voz', 1.0)}[a{n}]")
            etiquetas.append(f"[a{n}]")
            n += 1

    # --- 2. SFX anclados al INICIO EXACTO de cada transicion ---
    for i, seg in enumerate(segs):
        if not seg.get("sfx_auto", True):
            continue
        quiebre = bool(seg.get("quiebre_capitulo"))
        nombre = seg.get("sfx") or SFX_POR_FORMATO.get(seg.get("formato"))
        if not nombre and i > 0:
            nombre = SFX_POR_TRANSICION.get(seg.get("transicion", "fade"))
        if not nombre and quiebre:
            nombre = "impacto"  # el golpe que rompe el silencio del quiebre
        if not nombre:
            continue
        ruta = dir_sfx / f"{nombre}.wav"
        if not ruta.exists():
            continue
        t0 = marcas[i] if i < len(marcas) else 0.0
        # El SFX suena cuando ARRANCA la transicion, no despues -- salvo
        # en un quiebre, donde el default es sonar justo al TERMINAR el
        # freeze+silencio (no adentro de la ventana de silencio total).
        en_default = seg.get("quiebre_freeze", QUIEBRE_FREEZE_S) if quiebre else 0.0
        delay = int(max(0.0, t0 + seg.get("sfx_en", en_default)) * 1000)
        vol = seg.get("sfx_vol", 0.45 if voces else 0.55)
        entradas += ["-i", str(ruta)]
        filtros.append(f"[{n}:a]adelay={delay}|{delay},volume={vol}[a{n}]")
        etiquetas.append(f"[a{n}]")
        n += 1

    # --- 2b. SFX extra por imagen en 'collage' ---
    # El bloque de arriba ya puso UN whoosh por segmento (imagen 0,
    # via SFX_POR_FORMATO["collage"], anclado al inicio del segmento
    # igual que cualquier otro formato). Un collage tiene ademas 1-3
    # cortes internos (imagen 1, 2, 3) que no son segmentos propios,
    # asi que reusan el MISMO mecanismo (adelay+volume) pero calculan
    # su propio momento con la misma division en partes iguales
    # (k / n_img) que usa f_collage() para decidir que foto esta
    # activa -- si un valor cambia, el otro tiene que cambiar igual.
    for i, seg in enumerate(segs):
        if seg.get("formato") != "collage" or not seg.get("sfx_auto", True):
            continue
        n_img = max(1, min(4, len(seg.get("imagenes") or [])))
        if n_img < 2:
            continue
        nombre = seg.get("collage_sfx", "whoosh")
        ruta = dir_sfx / f"{nombre}.wav" if nombre else None
        if not ruta or not ruta.exists():
            continue
        t0 = marcas[i] if i < len(marcas) else 0.0
        dur_seg = seg["duracion"]
        vol = seg.get("sfx_vol", 0.4 if voces else 0.5)
        for k in range(1, n_img):
            delay = int(max(0.0, t0 + (k / n_img) * dur_seg) * 1000)
            entradas += ["-i", str(ruta)]
            filtros.append(f"[{n}:a]adelay={delay}|{delay},volume={vol}[a{n}]")
            etiquetas.append(f"[a{n}]")
            n += 1

    # --- 2c. SFX multi-beat generico: 'mensajes' (golpe por cada
    # mensaje desde el 2do -- el 1ro ya sono en el bloque 2 via
    # SFX_POR_FORMATO) y 'escalada' (tick en cada corte que acelera,
    # ademas del riser de fondo que el bloque 2 ya puso para todo el
    # segmento). Mismo mecanismo que 2b (collage): fracciones de
    # tiempo 0..1 ancladas con adelay -- usa las MISMAS funciones
    # _tiempos_mensajes/_tiempos_escalada que f_mensajes/f_escalada y
    # el microshake de camara en render(), asi los tres nunca se
    # desincronizan entre si.
    for i, seg in enumerate(segs):
        if not seg.get("sfx_auto", True):
            continue
        fmt = seg.get("formato")
        if fmt == "mensajes":
            beats = _tiempos_mensajes(seg)[1:]
            nombre = seg.get("mensajes_sfx", "tick")
        elif fmt == "escalada":
            beats = _tiempos_escalada(seg)[1:-1]
            nombre = seg.get("escalada_sfx", "tick")
        else:
            continue
        if not beats:
            continue
        ruta = dir_sfx / f"{nombre}.wav" if nombre else None
        if not ruta or not ruta.exists():
            continue
        t0 = marcas[i] if i < len(marcas) else 0.0
        dur_seg = seg["duracion"]
        vol = seg.get("sfx_vol_beats", 0.42 if voces else 0.5)
        for frac in beats:
            delay = int(max(0.0, t0 + frac * dur_seg) * 1000)
            entradas += ["-i", str(ruta)]
            filtros.append(f"[{n}:a]adelay={delay}|{delay},volume={vol}[a{n}]")
            etiquetas.append(f"[a{n}]")
            n += 1

    # --- 3. MUSICA con ducking donde hay voz ---
    musica = cfg.get("musica")
    if musica and Path(musica).exists():
        base = cfg.get("vol_musica",
                       DUCK_CON_VOZ if voces else DUCK_SIN_VOZ)
        cadena = (f"[{n}:a]aloop=loop=-1:size=2e9,atrim=0:{dur_total},"
                  f"volume={base},afade=t=in:st=0:d=1.2,"
                  f"afade=t=out:st={max(0, dur_total-2.0)}:d=2.0")
        # Sube el volumen en los tramos SIN voz (respira entre frases)
        if voces:
            huecos = []
            for i, seg in enumerate(segs):
                if i not in voces:
                    t0 = marcas[i] if i < len(marcas) else 0
                    huecos.append((t0, t0 + seg["duracion"]))
            for (a, b) in huecos[:6]:   # limite para no romper el filtro
                cadena += (f",volume=enable='between(t,{a:.2f},{b:.2f})':"
                           f"volume={DUCK_SIN_VOZ / max(base, 0.01):.2f}")
        entradas += ["-i", musica]
        filtros.append(cadena + f"[a{n}]")
        etiquetas.append(f"[a{n}]")
        n += 1
    elif musica:
        print(f"AVISO: no existe la musica '{musica}'.")

    if not etiquetas:
        return None

    out = tmp / "audio.m4a"
    # apad + -t: si el audio es solo SFX puntuales (sin musica ni voz),
    # 'amix duration=longest' termina cuando termina el ULTIMO sfx, no
    # cuando termina el video. Sin este padding, el '-shortest' del
    # ensamblado final en generar() recorta el video en silencio para
    # que coincida con un audio mas corto -- se pierden segundos de
    # imagen sin ningun error visible.
    # Silencio TOTAL en las ventanas de quiebre de capitulo: se aplica
    # DESPUES del amix (mismo patron volume+enable='between(t,x,y)' ya
    # usado arriba para el ducking de musica), asi gana sobre voz,
    # musica y SFX por igual sin importar que haya debajo.
    silencios = "".join(
        f",volume=enable='between(t,{a:.3f},{b:.3f})':volume=0"
        for a, b in _ventanas_quiebre(segs, marcas))
    mix = "".join(etiquetas) + (
        f"amix=inputs={len(etiquetas)}:duration=longest:normalize=0"
        + silencios +
        f",apad,alimiter=limit=0.95,"
        f"loudnorm=I=-14:TP=-1.5:LRA=4,"
        f"aresample=44100[o]")
    cmd = ["ffmpeg", "-y", "-loglevel", "error"] + entradas + [
        "-filter_complex", ";".join(filtros + [mix]),
        "-map", "[o]", "-t", f"{dur_total:.3f}",
        "-c:a", "aac", "-b:a", "192k", str(out)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"AVISO: fallo la mezcla de audio.\n{r.stderr[:400]}")
        return None
    return out


DEMO = {
    "salida": "demo-v9.mp4", "fps": 30, "camara": 1.0,
    "paleta": PALETAS[0],
    "segmentos": [
        {"formato": "declaracion", "texto": "Publique 47 productos",
         "duracion": 1.8, "transicion": "corte_duro"},
        {"formato": "dato_duro", "numero": 3, "texto": "productos vendidos en cuatro meses",
         "duracion": 2.2, "transicion": "punch"},
        {"formato": "division", "texto": "", "duracion": 2.4,
         "izquierda": {"titulo": "Sin canal", "texto": "Publicar y esperar",
                       "valor": "12"},
         "derecha": {"titulo": "Con canal", "texto": "Un canal, 30 dias",
                     "valor": "340"}, "transicion": "barrido"},
        {"formato": "pregunta", "pregunta": "Cual fue el error?",
         "respuesta": "Nadie los vio", "texto": "", "duracion": 2.8,
         "transicion": "dip"},
        {"formato": "cronologia", "texto": "Asi crece si sostenes",
         "hitos": ["Dia 1", "Dia 7", "Dia 14", "Dia 30"],
         "valores": ["0", "3", "11", "61"], "duracion": 2.6,
         "transicion": "slide"},
        {"formato": "conteo", "texto": "",
         "items": ["Sin nicho", "Sin canal", "Sin medicion"],
         "duracion": 3.0, "transicion": "whip"},
        {"formato": "revelacion", "antes": "Publicar y esperar",
         "despues": "Un canal. 30 dias.", "texto": "", "duracion": 2.4,
         "transicion": "punch"},
        {"formato": "editorial", "kicker": "conclusion", "indice": "05",
         "texto": "Publicar no es distribuir",
         "pie": "El producto no era el problema. La distribucion si.",
         "duracion": 2.6, "transicion": "fade"},
    ],
}


def catalogo():
    """Genera una tira con 1 frame de cada formato, para comparar."""
    cfg = {"paleta": PALETAS[0], "camara": 0}
    muestras = [
        {"formato": "declaracion", "texto": "Publique 47 productos"},
        {"formato": "dato_duro", "numero": 3, "texto": "productos vendidos"},
        {"formato": "division", "texto": "",
         "izquierda": {"titulo": "Sin canal", "texto": "Esperar", "valor": "12"},
         "derecha": {"titulo": "Con canal", "texto": "30 dias", "valor": "340"}},
        {"formato": "revelacion", "antes": "Sin plan", "despues": "Con plan",
         "texto": ""},
        {"formato": "cronologia", "texto": "Asi crece",
         "hitos": ["D1", "D7", "D14", "D30"], "valores": ["0", "3", "11", "61"]},
        {"formato": "conteo", "texto": "",
         "items": ["Sin nicho", "Sin canal", "Sin medicion"]},
        {"formato": "pregunta", "pregunta": "Cual fue el error?",
         "respuesta": "Nadie los vio", "texto": ""},
        {"formato": "editorial", "kicker": "conclusion", "indice": "05",
         "texto": "Publicar no es distribuir", "pie": "La distribucion si."},
    ]
    ts = [0.9, 0.9, 0.9, 0.95, 0.9, 0.2, 0.95, 0.9]
    ims = [render(m, ts[i], 0.5, cfg).resize((190, 338))
           for i, m in enumerate(muestras)]
    out = Image.new("RGB", (190 * 4 + 30, 338 * 2 + 10), (12, 12, 16))
    for i, im in enumerate(ims):
        out.paste(im, ((i % 4) * 198, (i // 4) * 348))
    out.save("catalogo-formatos.png")
    print("OK: catalogo-formatos.png")
    return 0


def generar(path):
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
        print("ERROR: falta 'segmentos'.")
        return 1
    for i, s in enumerate(segs):
        fm = s.get("formato", "declaracion")
        if fm not in FORMATOS:
            print(f"ERROR: segmento {i+1}: formato '{fm}' no existe.")
            print(f"Validos: {', '.join(FORMATOS)}")
            return 1
    if not shutil.which("ffmpeg"):
        print("ERROR: falta ffmpeg.")
        return 1
    cfg.setdefault("fps", 30)
    cfg.setdefault("camara", 1.0)
    cfg.setdefault("paleta", PALETAS[0])
    fps = cfg["fps"]
    tmp = Path(tempfile.mkdtemp(prefix="v9_"))
    # LINEA DE TIEMPO: la voz define las duraciones antes de renderizar
    voces, marcas = construir_linea_tiempo(cfg, segs, tmp)
    dur = sum(s["duracion"] for s in segs)
    # Tiempo total, para que la vida ambiental (render() -> t_abs) sea
    # un reloj continuo a lo largo de TODO el video, no algo que
    # reinicia fase en cada corte de segmento.
    cfg["_dur_total"] = dur
    ft = int(0.42 * fps); n = 0; acc = 0.0
    print(f"Renderizando {dur:.1f}s a {fps}fps ({len(segs)} formatos)...")

    # --- Plan de cuadros ---
    # Se arma primero la lista COMPLETA de cuadros a dibujar (sin
    # dibujar ninguno todavia) para poder repartirlos entre varios
    # nucleos. Antes esto era un bucle secuencial de un solo hilo, que
    # dejaba la maquina al 25% de uso: dibujar un cuadro cuesta 55-120ms
    # y hay ~800 por video.
    plan = []
    for si, seg in enumerate(segs):
        nf = int(seg["duracion"] * fps)
        tipo = seg.get("transicion", "fade")
        freeze_frac = None
        ft_local = ft
        if seg.get("quiebre_capitulo"):
            freeze_s = seg.get("quiebre_freeze", QUIEBRE_FREEZE_S)
            glitch_s = seg.get("quiebre_glitch", QUIEBRE_GLITCH_S)
            ft_local = max(1, int((freeze_s + glitch_s) * fps))
            if ft_local > nf - 1:
                print(f"AVISO: segmento {si+1} 'quiebre_capitulo' dura "
                      f"menos que freeze+glitch ({freeze_s+glitch_s:.2f}s); "
                      "se recorta.")
                ft_local = max(1, nf - 1)
            freeze_frac = freeze_s / max(0.001, freeze_s + glitch_s)
            tipo = "quiebre"
        for f in range(nf):
            plan.append((n, si, f, nf, tipo, ft_local, freeze_frac, acc))
            n += 1
        acc += seg["duracion"]

    _CTX["cfg"] = cfg
    _CTX["segs"] = segs
    _CTX["fps"] = fps
    _CTX["dur"] = dur
    _CTX["tmp"] = tmp

    nucleos = max(1, min(os.cpu_count() or 1, 8))
    if nucleos > 1 and len(plan) > 60:
        # 'fork' comparte los caches ya calculados (fuentes, grano,
        # particulas) sin volver a serializarlos, y cada trabajador
        # escribe su propio archivo -> no hay estado compartido que
        # coordinar.
        ctx = multiprocessing.get_context("fork")
        with ctx.Pool(nucleos) as pool:
            pool.map(_dibujar_cuadro, plan, chunksize=8)
    else:
        for tarea in plan:
            _dibujar_cuadro(tarea)
    if cfg.get("loop"):
        pri = render(segs[0], 0.0, 0.0, cfg); nl = int(0.5 * fps)
        for i in range(nl):
            idx = n - nl + i
            if idx < 0:
                continue
            fp = tmp / f"f{idx:06d}.png"
            if fp.exists():
                Image.blend(Image.open(fp).convert("RGB"), pri,
                            eio((i + 1) / nl)).save(fp)
    salida = cfg.get("salida", "video-v9.mp4")
    audio = construir_audio(cfg, segs, dur, tmp, voces, marcas)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps),
           "-i", str(tmp / "f%06d.png")]
    if audio:
        cmd += ["-i", str(audio), "-c:a", "aac", "-shortest"]
    cmd += ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast",
            "-crf", "20", salida]
    r = subprocess.run(cmd, capture_output=True, text=True)
    shutil.rmtree(tmp, ignore_errors=True)
    if r.returncode != 0:
        print(f"ERROR ffmpeg: {r.stderr[:300]}")
        return 1
    print(f"LISTO: {salida} ({Path(salida).stat().st_size/1024:.0f} KB, {dur:.1f}s)")
    return 0


def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        return
    if a[0] == "--catalogo":
        sys.exit(catalogo())
    if a[0] == "--demo":
        Path("guion-v9-demo.json").write_text(
            json.dumps(DEMO, indent=2, ensure_ascii=False))
        print("Creado guion-v9-demo.json")
        sys.exit(generar("guion-v9-demo.json"))
    sys.exit(generar(a[0]))


if __name__ == "__main__":
    main()
