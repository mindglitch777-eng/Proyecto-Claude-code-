#!/usr/bin/env python3
"""
Render de prueba + verificacion, para correr en GitHub Actions.

POR QUE EXISTE
    Cada vez que se toca el motor visual o la mezcla de audio hay que
    ver el resultado. Hacerlo en la sesion de Claude quema tokens en
    logs de render y en extraer cuadros a mano. Aca se hace todo del
    lado del runner y vuelve UNA tira de contactos y UN informe corto:
    mirar eso cuesta una imagen y treinta lineas, no un render.

QUE DEJA
    pruebas/<guion>.mp4        el video
    pruebas/<guion>-tira.jpg   tira de contactos (N cuadros repartidos)
    PRUEBA_RENDER.md           medidas de todos los guiones probados

QUE MIDE
    Duracion, peso, codecs, y del audio: sonoridad integrada (LUFS),
    pico REAL (dBTP) y rango dinamico (LRA). Los tres numeros que
    importan para que el video no suene mas bajo que el anterior del
    feed ni clipee. Referencia medida en ESTILO.md: -13.2 a -13.9
    LUFS, pico -2.5 dBTP, rango 1.5 a 5.7 LU.

Uso:
    python3 probar_render.py guiones/cotizar-tarde.json
    python3 probar_render.py "guiones/demo-*.json" --cuadros 12
    python3 probar_render.py --solo-medir pruebas/x.mp4
"""
import glob
import re
import subprocess
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
SALIDA = RAIZ / "pruebas"
INFORME = RAIZ / "PRUEBA_RENDER.md"


def _correr(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def medir_audio(video):
    """Sonoridad integrada, pico real y rango dinamico."""
    r = _correr(["ffmpeg", "-hide_banner", "-nostats", "-i", str(video),
                 "-af", "loudnorm=print_format=summary", "-f", "null", "-"])
    def cap(etiqueta):
        # [-+] y no solo -: un pico real por ENCIMA del techo se
        # imprime como "+0.7 dBTP", y ese es justo el numero que
        # no se puede perder, porque es el que dice que clipea.
        m = re.search(etiqueta + r":\s*([-+]?[\d.]+|inf)", r.stderr)
        return m.group(1) if m else "—"
    return {"lufs": cap("Input Integrated"), "tp": cap("Input True Peak"),
            "lra": cap("Input LRA")}


def medir_video(video):
    r = _correr(["ffprobe", "-v", "error", "-show_entries",
                 "format=duration,size", "-show_entries",
                 "stream=codec_name,codec_type,width,height",
                 "-of", "default=nw=1", str(video)])
    d = dict(l.split("=", 1) for l in r.stdout.strip().splitlines() if "=" in l)
    return d


def contar_cortes(video, umbral=0.25):
    """Cuantos cambios de plano tiene, para comparar la cadencia contra
    la referencia (ver ESTILO.md: la de ellos NO es pareja)."""
    r = _correr(["ffmpeg", "-hide_banner", "-nostats", "-i", str(video),
                 "-filter:v", f"select='gt(scene,{umbral})',showinfo",
                 "-f", "null", "-"])
    ts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", r.stderr)]
    if len(ts) < 2:
        return len(ts), None, None
    huecos = sorted(round(b - a, 2) for a, b in zip(ts, ts[1:]))
    return len(ts), huecos[0], huecos[len(huecos) // 2]


def tira_contactos(video, destino, cuadros=8, ancho=260):
    """Tira de contactos: N cuadros repartidos parejo, en una sola
    imagen. Es lo que permite revisar un video entero de un vistazo
    sin bajarlo."""
    dur = float(medir_video(video).get("duration", 0) or 0)
    if dur <= 0:
        return None
    # 'fps' en vez de 'select' por numero de cuadro: no depende de que
    # sepamos los fps ni de que el video tenga cuadros clave parejos.
    filas = 2 if cuadros > 5 else 1
    cols = (cuadros + filas - 1) // filas
    vf = (f"fps={cuadros / dur:.6f},scale={ancho}:-1,"
          f"tile={cols}x{filas}:padding=6:color=0x101014")
    r = _correr(["ffmpeg", "-y", "-v", "error", "-i", str(video),
                 "-vf", vf, "-frames:v", "1", "-q:v", "3", str(destino)])
    return destino if r.returncode == 0 and destino.exists() else None


def probar(ruta, cuadros=8):
    stem = Path(ruta).stem
    SALIDA.mkdir(parents=True, exist_ok=True)
    video = SALIDA / f"{stem}.mp4"
    t0 = time.time()
    r = _correr([sys.executable, "animador_v9.py", str(ruta), str(video)],
                cwd=RAIZ)
    tardo = time.time() - t0
    if not video.exists():
        return {"guion": stem, "error": (r.stderr or r.stdout)[-400:]}
    tira = tira_contactos(video, SALIDA / f"{stem}-tira.jpg", cuadros)
    v, a = medir_video(video), medir_audio(video)
    n, minimo, mediana = contar_cortes(video)
    return {"guion": stem, "video": str(video.relative_to(RAIZ)),
            "tira": str(tira.relative_to(RAIZ)) if tira else None,
            "dur": float(v.get("duration", 0) or 0),
            "mb": int(v.get("size", 0) or 0) / 1e6,
            "render_s": tardo, "cortes": n, "corte_min": minimo,
            "corte_mediana": mediana, **a,
            "avisos": [l for l in (r.stdout or "").splitlines()
                       if l.startswith("AVISO")]}


def escribir_informe(resultados):
    md = ["# Prueba de render\n",
          f"_Corrido el {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}._\n",
          "\nReferencia medida (ESTILO.md): **−13,2 a −13,9 LUFS**, pico "
          "**−2,5 dBTP**, rango **1,5 a 5,7 LU**. Y la cadencia de corte de "
          "la referencia NO es pareja: mínimos de 0,03 s conviviendo con "
          "sostenidos de 7 a 10 s.\n",
          "\n| guion | dur | peso | LUFS | pico dBTP | LRA | cortes | mín | mediana | render |",
          "|---|---|---|---|---|---|---|---|---|---|"]
    for x in resultados:
        if x.get("error"):
            md.append(f"| **{x['guion']}** | FALLO | | | | | | | | |")
            continue
        md.append(
            f"| {x['guion']} | {x['dur']:.1f}s | {x['mb']:.1f} MB | "
            f"{x['lufs']} | {x['tp']} | {x['lra']} | {x['cortes']} | "
            f"{x['corte_min'] if x['corte_min'] is not None else '—'} | "
            f"{x['corte_mediana'] if x['corte_mediana'] is not None else '—'} | "
            f"{x['render_s']:.0f}s |")
    for x in resultados:
        md.append(f"\n## {x['guion']}\n")
        if x.get("error"):
            md.append("```\n" + x["error"] + "\n```")
            continue
        if x.get("tira"):
            md.append(f"![tira]({x['tira']})\n")
        if x.get("avisos"):
            md.append("Avisos del render:\n")
            for a in dict.fromkeys(x["avisos"]):
                md.append(f"- `{a}`")
    INFORME.write_text("\n".join(md) + "\n", encoding="utf-8")


def main():
    args = [a for a in sys.argv[1:]]
    cuadros = 8
    if "--cuadros" in args:
        i = args.index("--cuadros")
        cuadros = int(args[i + 1])
        del args[i:i + 2]
    if "--solo-medir" in args:
        args.remove("--solo-medir")
        for v in args:
            print(v, medir_video(v), medir_audio(v))
        return 0
    rutas = []
    for patron in (args or ["guiones/cotizar-tarde.json"]):
        rutas += [f for f in glob.glob(patron) if not f.endswith("-con-voz.json")]
    if not rutas:
        print("No hay guiones que coincidan.")
        return 1
    res = []
    for r in sorted(set(rutas)):
        print(f"[{Path(r).name}] renderizando...")
        x = probar(r, cuadros)
        res.append(x)
        if x.get("error"):
            print(f"  FALLO: {x['error'][:200]}")
        else:
            print(f"  {x['dur']:.1f}s | {x['lufs']} LUFS | pico {x['tp']} dBTP "
                  f"| {x['cortes']} cortes | {x['render_s']:.0f}s de render")
    escribir_informe(res)
    print(f"\nEscrito {INFORME.name}")
    return 1 if any(x.get("error") for x in res) else 0


if __name__ == "__main__":
    sys.exit(main())
