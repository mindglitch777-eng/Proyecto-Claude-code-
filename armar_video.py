#!/usr/bin/env python3
"""
Compositor de video (v1) - CERO TOKENS.

Une los actos animados de animador_v9.py con capturas reales del
producto (capturar_producto.py) en un solo video, con transiciones
ffmpeg 'xfade' en los cortes -- 58 tipos nativos (wipe, zoom, dissolve,
radial, slice, wind...), sin GPU y sin compilar nada, porque este
entorno no tiene /dev/dri.

Lee el mismo guion JSON que ya pasa por validar_hook.py. Los segmentos
con 'formato' se agrupan y se renderizan con animador_v9.py (que ya
sabe poner su propio SFX por transicion/formato). Los segmentos con
'captura' se recortan del video real (capturar_producto.py), se
enmarcan en un mockup de telefono y se les quema el caption.

Uso:
    python3 armar_video.py guiones/03-no-decidis.json [salida.mp4]
"""

import json
import os
import subprocess
import sys
import tempfile
import textwrap
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

W, H = 1080, 1920
ANIMADOR = Path(__file__).parent / "animador_v9.py"
_FUENTE_PROPIA = Path(__file__).parent / "assets/fuentes/SpaceGrotesk-Bold.ttf"
FONT_BOLD = str(_FUENTE_PROPIA) if _FUENTE_PROPIA.exists() else \
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Mapeo de las 12 transiciones de animador_v9.py a xfade nativo de ffmpeg.
# corte_duro se resuelve como un fade casi instantaneo (0.12s): visualmente
# es un corte, sin la complejidad de mezclar 'concat' y 'xfade' en el mismo
# grafo de filtros.
XFADE = {
    "fade": "fade", "corte_duro": "fade", "punch": "zoomin",
    "whip": "hlwind", "slide": "slideup", "barrido": "wipeleft",
    "dip": "fadeblack", "polvo": "dissolve", "iris": "circleopen",
    "rotacion": "squeezeh", "linea": "wipeup", "zoom_radial": "radial",
    "quiebre": "fadeblack",
}
DUR_TRANS = {"corte_duro": 0.12, "quiebre": 0.9}
DUR_DEFAULT = 0.4

# Igual que SFX_POR_TRANSICION en animador_v9.py, para que el corte
# hacia/desde una captura suene igual que un corte entre actos animados.
SFX_POR_TRANSICION = {
    "punch": "impacto", "whip": "whoosh", "slide": "whoosh",
    "barrido": "whoosh", "dip": "sub", "corte_duro": "impacto",
    "fade": None, "quiebre": "impacto",
}


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"fallo: {' '.join(str(c) for c in cmd)}\n{r.stderr[-800:]}")
    return r


def agrupar(segmentos):
    """Corta la lista en corridas: bloques consecutivos de segmentos
    'formato' (un solo render de animador_v9.py) vs. cada segmento
    'captura' como clip individual (cada uno tiene su propio recorte
    y caption)."""
    grupos, actual = [], []
    for seg in segmentos:
        if "captura" in seg:
            if actual:
                grupos.append(("render", actual)); actual = []
            grupos.append(("captura", [seg]))
        else:
            actual.append(seg)
    if actual:
        grupos.append(("render", actual))
    return grupos


def marco_telefono(paleta, hole, tmp):
    """Bezel con hueco redondeado transparente + sombra suave + borde
    fino en el color de acento. Se reusa para todos los clips de
    captura del video."""
    hx, hy, hw, hh, r = hole
    sombra = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ds = ImageDraw.Draw(sombra)
    off = 14
    ds.rounded_rectangle([hx - off, hy - off + 10, hx + hw + off, hy + hh + off + 10],
                          radius=r + off, fill=(0, 0, 0, 140))
    sombra = sombra.filter(ImageFilter.GaussianBlur(28))

    marco = Image.new("RGBA", (W, H), tuple(paleta["fondo"]) + (255,))
    marco.alpha_composite(sombra)
    hueco = Image.new("L", (W, H), 255)
    dh = ImageDraw.Draw(hueco)
    dh.rounded_rectangle([hx, hy, hx + hw, hy + hh], radius=r, fill=0)
    marco.putalpha(hueco)
    d = ImageDraw.Draw(marco)
    d.rounded_rectangle([hx, hy, hx + hw, hy + hh], radius=r,
                         outline=tuple(paleta["destacado"]) + (255,), width=4)
    out = tmp / "marco.png"
    marco.save(out)
    return out


def envolver_texto(texto, ancho_chars=26):
    return "\n".join(textwrap.wrap(texto, ancho_chars)) or texto


def render_run(segmentos, cfg_base, tmp, idx):
    cfg = dict(cfg_base)
    cfg["loop"] = False
    cfg["segmentos"] = segmentos
    salida = tmp / f"clip{idx:02d}_render.mp4"
    cfg["salida"] = str(salida)
    guion = tmp / f"clip{idx:02d}_render.json"
    guion.write_text(json.dumps(cfg, ensure_ascii=False))
    run([sys.executable, str(ANIMADOR), str(guion)])
    return salida


def render_captura(seg, cfg_base, tmp, idx, marco_path):
    fuente = Path(seg["captura"])
    t0, t1 = seg["recorte"]
    dur = seg.get("duracion", t1 - t0)
    paleta = cfg_base["paleta"]
    hole_w, hole_h = 693, 1500
    hole_x, hole_y = (W - hole_w) // 2, 150

    cap_txt = tmp / f"clip{idx:02d}_caption.txt"
    cap_txt.write_text(envolver_texto(seg.get("texto", ""), 30))

    fondo_hex = "0x%02x%02x%02x" % tuple(paleta["fondo"])
    texto_hex = "0x%02x%02x%02x" % tuple(paleta["texto"])
    salida = tmp / f"clip{idx:02d}_captura.mp4"

    # Vineta sutil sobre la captura (no sobre todo el frame): refuerza
    # la sensacion de "estar adentro de la herramienta" -- el
    # tratamiento levemente distinto que pide el beat de la app tras
    # el quiebre de capitulo, sin tocar el marco/paleta del resto del
    # video. Desactivable por segmento con "captura_vineta": false.
    vineta = ",vignette=PI/3.4" if seg.get("captura_vineta", True) else ""
    # Acercamiento lento sobre la captura. Una grabacion de pantalla real
    # tiene tramos donde nada se mueve (un cronometro quieto, una lista
    # sin scroll) y ahi el cuadro queda congelado varios segundos -- el
    # detector de pantalla muerta lo venia marcando. El zoom garantiza
    # movimiento continuo sin tocar el contenido. Desactivable por
    # segmento con "captura_zoom": false.
    z = seg.get("captura_zoom", True)
    zoom = ""
    if z:
        # Se agranda ~9% a lo largo del clip, centrado. El escalado
        # previo x2 evita el temblor tipico de zoompan al redondear.
        zoom = (f",scale={hole_w*2}:{hole_h*2},"
                f"zoompan=z='min(1+0.09*on/({int(dur*30)}),1.09)':d=1:"
                f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
                f"s={hole_w}x{hole_h}:fps=30")
    filtro = (
        f"[0:v]trim=start={t0}:end={t1},setpts=PTS-STARTPTS,"
        f"scale={hole_w}:{hole_h}:force_original_aspect_ratio=increase,"
        f"crop={hole_w}:{hole_h}{vineta}{zoom},fps=30[cap];"
        f"[1:v][cap]overlay=x={hole_x}:y={hole_y}:shortest=1[bg1];"
        f"[bg1][2:v]overlay=0:0[bg2];"
        f"[bg2]drawtext=textfile={cap_txt}:fontfile={FONT_BOLD}:"
        f"fontsize=46:fontcolor={texto_hex}:line_spacing=12:"
        f"x=(w-text_w)/2:y={hole_y + hole_h + 60}:"
        f"bordercolor=black@0.6:borderw=3[out]"
    )
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", str(fuente),
        "-f", "lavfi", "-i", f"color=c={fondo_hex}:s={W}x{H}:r=30:d={dur}",
        "-loop", "1", "-t", str(dur), "-i", str(marco_path),
        "-filter_complex", filtro, "-map", "[out]",
        "-t", str(dur), "-r", "30",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast",
        "-crf", "20", str(salida),
    ]
    run(cmd)
    # SFX de entrada: por defecto el mismo mapeo que animador_v9.py
    # (para que el corte hacia el metraje real suene igual que un
    # corte entre actos), pero un "sfx" explicito en el segmento
    # manda -- asi un beat de "capturas rapidas" puede pedir un
    # click/tick en cada corte sin depender del tipo de transicion
    # (mismo campo "sfx" que ya usan los segmentos 'formato').
    nombre_sfx = seg.get("sfx") or SFX_POR_TRANSICION.get(
        seg.get("transicion", "fade"))
    return salida, nombre_sfx


def duracion(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(path)])
    return float(r.stdout.strip())


def tiene_audio(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a",
         "-show_entries", "stream=index", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True)
    return bool(r.stdout.strip())


def asegurar_audio(path):
    """xfade/amix necesitan que TODOS los clips tengan pista de audio.
    Un clip animado sin ningun SFX que le corresponda (ej. un solo
    segmento sin transicion previa) sale mudo de animador_v9.py; una
    captura recien armada tambien. Les agrega silencio."""
    if tiene_audio(path):
        return path
    nuevo = path.with_name(path.stem + "_a" + path.suffix)
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path),
         "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
         "-shortest", "-c:v", "copy", "-c:a", "aac", str(nuevo)])
    return nuevo


def armar(guion_path, salida_final):
    cfg = json.loads(Path(guion_path).read_text())
    segs = cfg["segmentos"]
    cfg_base = {"fps": cfg.get("fps", 30), "camara": cfg.get("camara", 1.0),
                "paleta": cfg["paleta"]}
    grupos = agrupar(segs)

    with tempfile.TemporaryDirectory(prefix="armar_") as tmpd:
        tmp = Path(tmpd)
        marco_path = marco_telefono(cfg["paleta"], (194, 150, 693, 1500, 48), tmp)

        # Cada grupo se arma en su propio proceso (animador_v9 o ffmpeg) y
        # escribe archivos distintos dentro de tmp, asi que son totalmente
        # independientes entre si: se lanzan EN PARALELO en vez de uno
        # detras del otro. El runner tiene varios nucleos y el render de
        # cuadros es de un solo hilo, asi que esta era la parte que dejaba
        # la maquina al 25% de uso. Se usan hilos (no procesos) porque
        # cada tarea solo espera a un subproceso -- el GIL no molesta.
        def armar_grupo(par):
            i, (tipo, bloque) = par
            if tipo == "render":
                return i, render_run(bloque, cfg_base, tmp, i), SFX_POR_TRANSICION.get(
                    bloque[0].get("transicion", "fade"))
            clip, sfx = render_captura(bloque[0], cfg_base, tmp, i, marco_path)
            return i, clip, sfx

        n_hilos = min(len(grupos), max(1, (os.cpu_count() or 2)))
        with ThreadPoolExecutor(max_workers=n_hilos) as pool:
            resultados = sorted(pool.map(armar_grupo, enumerate(grupos)))

        clips = [r[1] for r in resultados]
        # el primer clip nunca tiene sonido de "entrada"
        sfx_entrada = [None] + [r[2] for r in resultados[1:]]

        # Transicion de entrada de cada grupo (salvo el primero)
        transiciones = ["fade"] + [g[1][0].get("transicion", "fade")
                                    for g in grupos[1:]]

        clips = [asegurar_audio(c) for c in clips]
        durs = [duracion(c) for c in clips]

        # --- Cadena de xfade con offsets acumulados ---
        filtro_v = []
        offsets = [0.0]
        etiqueta_prev = "0:v"
        acumulado = durs[0]
        for i in range(1, len(clips)):
            xf = XFADE.get(transiciones[i], "fade")
            td = DUR_TRANS.get(transiciones[i], DUR_DEFAULT)
            td = min(td, durs[i] - 0.05, durs[i - 1] - 0.05, 1.0)
            td = max(td, 0.08)
            offset = acumulado - td
            offsets.append(offset)
            et_out = f"v{i}"
            filtro_v.append(
                f"[{etiqueta_prev}][{i}:v]xfade=transition={xf}:"
                f"duration={td:.3f}:offset={offset:.3f}[{et_out}]")
            etiqueta_prev = et_out
            acumulado = acumulado + durs[i] - td

        # --- Audio: cada clip a su offset real + SFX de entrada ---
        filtro_a, entradas_a, n_extra = [], [], len(clips)
        for i in range(len(clips)):
            ms = int(offsets[i] * 1000)
            filtro_a.append(f"[{i}:a]adelay={ms}|{ms}[a{i}]")
            entradas_a.append(f"[a{i}]")
        for i, nombre in enumerate(sfx_entrada):
            if not nombre:
                continue
            ruta = Path("assets/sfx") / f"{nombre}.wav"
            if not ruta.exists():
                continue
            idx_in = n_extra
            n_extra += 1
            ms = int(offsets[i] * 1000)
            filtro_a.append(f"[{idx_in}:a]adelay={ms}|{ms},volume=0.6[sfx{i}]")
            entradas_a.append(f"[sfx{i}]")

        mix = "".join(entradas_a) + (
            f"amix=inputs={len(entradas_a)}:duration=longest:normalize=0,"
            f"alimiter=limit=0.9[aout]")

        cmd = ["ffmpeg", "-y", "-loglevel", "error"]
        for c in clips:
            cmd += ["-i", str(c)]
        for nombre in sfx_entrada:
            if nombre and (Path("assets/sfx") / f"{nombre}.wav").exists():
                cmd += ["-i", str(Path("assets/sfx") / f"{nombre}.wav")]

        filtro_completo = ";".join(filtro_v + filtro_a) + ";" + mix
        cmd += ["-filter_complex", filtro_completo,
                "-map", f"[{etiqueta_prev}]", "-map", "[aout]",
                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast",
                "-crf", "20", "-c:a", "aac", "-b:a", "192k", str(salida_final)]
        run(cmd)

    print(f"LISTO: {salida_final} ({Path(salida_final).stat().st_size/1024:.0f} KB, "
          f"~{acumulado:.1f}s)")


def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        return
    guion = Path(a[0])
    salida = Path(a[1]) if len(a) > 1 else Path("videos") / (guion.stem + ".mp4")
    salida.parent.mkdir(exist_ok=True, parents=True)
    armar(guion, salida)


if __name__ == "__main__":
    main()
