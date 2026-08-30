#!/usr/bin/env python3
"""
Investiga motores de voz rapidos y gratuitos DESDE DENTRO del runner,
que tiene internet completo -- no desde la sesion de Claude Code, que
tiene medio internet bloqueado y ademas cuesta tiempo de sesion cada
busqueda.

Hace DOS cosas, no una:

  1. INVESTIGACION con fuentes reales: repos de GitHub mejor puntuados
     sobre texto-a-voz, modelos mas populares de HuggingFace,
     discusiones de Reddit. Todo con links citables.

  2. BENCHMARK real: mide cuanto tarda CADA candidato liviano en
     generar la MISMA frase de nuestro guion, EN ESTE MISMO RUNNER.
     Un numero de un blog con otro hardware no sirve para decidir
     cuanto va a tardar nuestra produccion real -- este si.

Escribe INVESTIGACION_VOZ.md con todo.
"""
import json
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).parent
UA = {"User-Agent": "Mozilla/5.0 (compatible; FabricaContenido-Investigacion/1.0)"}
FRASE = ("La mitad de lo que venden los latinos no se vende acá. "
         "Se cobra en dólares, afuera. El problema no es el mercado: "
         "es que no sabés qué vender.")
# Duracion tipica de narracion de nuestros guiones reales (medido en
# taller-mercado-digital.json y demo-taller-barberia.json).
SEG_NARRACION_TIPICA = 42


def _get_json(url, extra_headers=None):
    h = dict(UA)
    if extra_headers:
        h.update(extra_headers)
    pedido = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(pedido, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


# ---------------------------------------------------------------- #
# INVESTIGACION
# ---------------------------------------------------------------- #

def buscar_github(query, minimo_estrellas=150):
    import os
    headers = {}
    tok = os.environ.get("GITHUB_TOKEN", "")
    if tok:
        headers["Authorization"] = f"Bearer {tok}"
    url = ("https://api.github.com/search/repositories?"
           + urllib.parse.urlencode({
               "q": f"{query} stars:>{minimo_estrellas} pushed:>2025-01-01",
               "sort": "stars", "order": "desc", "per_page": 12}))
    try:
        datos = _get_json(url, headers)
    except Exception as e:
        return [], str(e)
    items = []
    for r in datos.get("items", []):
        items.append({
            "nombre": r["full_name"], "estrellas": r["stargazers_count"],
            "licencia": (r.get("license") or {}).get("spdx_id", "?"),
            "descripcion": (r.get("description") or "")[:170],
            "url": r["html_url"], "actualizado": r["pushed_at"][:10],
        })
    return items, None


def buscar_huggingface(query, limite=15):
    url = ("https://huggingface.co/api/models?"
           + urllib.parse.urlencode({"search": query, "sort": "likes",
                                      "direction": -1, "limit": limite}))
    try:
        datos = _get_json(url)
    except Exception as e:
        return [], str(e)
    items = []
    for m in datos:
        items.append({
            "id": m.get("id", "?"), "likes": m.get("likes", 0),
            "downloads": m.get("downloads", 0),
            "licencia": next((t.split(":", 1)[1] for t in m.get("tags", [])
                              if t.startswith("license:")), "?"),
            "url": f"https://huggingface.co/{m.get('id','')}",
        })
    return items, None


def buscar_reddit(subreddit, query, limite=8):
    url = (f"https://www.reddit.com/r/{subreddit}/search.json?"
           + urllib.parse.urlencode({"q": query, "restrict_sr": 1,
                                      "sort": "relevance", "limit": limite, "t": "year"}))
    try:
        datos = _get_json(url)
    except Exception as e:
        return [], str(e)
    items = []
    for c in datos.get("data", {}).get("children", []):
        d = c["data"]
        items.append({
            "titulo": d.get("title", "?"), "puntaje": d.get("score", 0),
            "comentarios": d.get("num_comments", 0),
            "url": f"https://reddit.com{d.get('permalink','')}",
            "fecha": time.strftime("%Y-%m-%d", time.gmtime(d.get("created_utc", 0))),
        })
    return items, None


def investigar():
    secciones = []

    repos, err = buscar_github("text-to-speech OR TTS voice cloning")
    secciones.append(("Repos de GitHub (texto a voz), por estrellas", repos, err,
                      lambda r: f"- **[{r['nombre']}]({r['url']})** — {r['estrellas']}⭐ "
                                f"— {r['licencia']} — actualizado {r['actualizado']}\n"
                                f"  {r['descripcion']}"))

    modelos, err2 = buscar_huggingface("text-to-speech spanish")
    secciones.append(("Modelos de HuggingFace (TTS), por likes", modelos, err2,
                      lambda m: f"- **[{m['id']}]({m['url']})** — {m['likes']} likes, "
                                f"{m['downloads']} descargas/mes — licencia: {m['licencia']}"))

    for sub in ("LocalLLaMA", "MachineLearning"):
        posts, err3 = buscar_reddit(sub, "fastest open source tts spanish OR cpu")
        secciones.append((f"Reddit r/{sub}", posts, err3,
                          lambda p: f"- [{p['titulo']}]({p['url']}) "
                                    f"— {p['puntaje']} puntos, {p['comentarios']} comentarios "
                                    f"({p['fecha']})"))

    md = ["# Investigación de motores de voz — fuentes reales\n",
          f"_Generado desde el runner el {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}._\n"]
    for titulo, items, err, fmt in secciones:
        md.append(f"\n## {titulo}\n")
        if err:
            md.append(f"_No se pudo consultar: {err}_\n")
        elif not items:
            md.append("_Sin resultados._\n")
        else:
            for it in items:
                md.append(fmt(it))
    return "\n".join(md)


# ---------------------------------------------------------------- #
# BENCHMARK REAL: misma frase, este runner
# ---------------------------------------------------------------- #

def _wav_duracion(ruta):
    import wave
    with wave.open(str(ruta)) as w:
        return w.getnframes() / w.getframerate()


def medir_kokoro():
    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline
    t0 = time.time()
    pipe = KPipeline(lang_code="e")
    trozos = [a for _, _, a in pipe(FRASE, voice="em_alex", speed=1.0)]
    audio = np.concatenate(trozos)
    t1 = time.time()
    sf.write(str(RAIZ / "bench-kokoro.wav"), audio, 24000)
    dur = len(audio) / 24000
    return {"modelo": "Kokoro-82M (em_alex)", "licencia": "Apache-2.0",
            "seg_generacion": t1 - t0, "seg_audio": dur}


def medir_piper():
    from voz_piper import sintetizar
    t0 = time.time()
    ok = sintetizar(FRASE, "es_MX-ald-medium", RAIZ / "bench-piper.wav")
    t1 = time.time()
    if not ok:
        return None
    return {"modelo": "Piper (es_MX-ald)", "licencia": "MIT",
            "seg_generacion": t1 - t0,
            "seg_audio": _wav_duracion(RAIZ / "bench-piper.wav")}


def medir_melo():
    from melo.api import TTS
    t0 = time.time()
    modelo = TTS(language="ES", device="cpu")
    hablante = list(modelo.hps.data.spk2id.keys())[0]
    t_carga = time.time()
    modelo.tts_to_file(FRASE, modelo.hps.data.spk2id[hablante],
                       str(RAIZ / "bench-melo.wav"), speed=1.0)
    t1 = time.time()
    return {"modelo": f"MeloTTS ({hablante})", "licencia": "MIT",
            "seg_generacion": t1 - t0, "seg_carga_modelo": t_carga - t0,
            "seg_audio": _wav_duracion(RAIZ / "bench-melo.wav")}


def medir_pocket():
    wav = RAIZ / "bench-pocket.wav"
    t0 = time.time()
    r = subprocess.run(["pocket-tts", "generate", "--text", FRASE, "--out", str(wav)],
                       capture_output=True, text=True, timeout=300)
    t1 = time.time()
    if not wav.exists():
        return None
    return {"modelo": "Pocket TTS (Kyutai)", "licencia": "MIT",
            "seg_generacion": t1 - t0, "seg_audio": _wav_duracion(wav)}


def benchmark():
    resultados = []
    for nombre, fn in (("kokoro", medir_kokoro), ("piper", medir_piper),
                       ("melo", medir_melo), ("pocket", medir_pocket)):
        print(f"midiendo {nombre}...")
        try:
            r = fn()
            if r:
                r["rtf"] = r["seg_generacion"] / max(r["seg_audio"], 0.01)
                r["min_por_video_42s"] = r["rtf"] * SEG_NARRACION_TIPICA / 60
                resultados.append(r)
                print(f"  {nombre}: {r['seg_generacion']:.1f}s para "
                      f"{r['seg_audio']:.1f}s de audio (RTF {r['rtf']:.1f}x)")
            else:
                print(f"  {nombre}: no disponible")
        except Exception as e:
            print(f"  {nombre}: fallo ({e})")
    return resultados


def main():
    print("=== Investigacion con fuentes ===")
    reporte_investigacion = investigar()

    print("\n=== Benchmark real en este runner ===")
    resultados = benchmark()

    tabla = ["\n## Benchmark real — misma frase, este runner\n",
             f"Frase de prueba ({len(FRASE)} caracteres): _{FRASE}_\n",
             f"Estimacion de minutos es para una narracion tipica de "
             f"{SEG_NARRACION_TIPICA}s (la duracion real de nuestros guiones).\n",
             "| Modelo | Licencia | Tiempo real | Audio generado | RTF | Min. estimados por video |",
             "|---|---|---|---|---|---|"]
    for r in sorted(resultados, key=lambda x: x["rtf"]):
        tabla.append(f"| {r['modelo']} | {r['licencia']} | {r['seg_generacion']:.1f}s "
                     f"| {r['seg_audio']:.1f}s | {r['rtf']:.1f}x | "
                     f"{r['min_por_video_42s']:.1f} min |")
    if not resultados:
        tabla.append("| _ningun motor pudo medirse_ | | | | | |")

    Path("INVESTIGACION_VOZ.md").write_text(
        reporte_investigacion + "\n".join(tabla) + "\n", encoding="utf-8")
    print(f"\nEscrito INVESTIGACION_VOZ.md ({len(resultados)} motor(es) medido(s))")
    return 0


if __name__ == "__main__":
    sys.exit(main())
