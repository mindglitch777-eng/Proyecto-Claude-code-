#!/usr/bin/env python3
"""
Busca voces masculinas graves en LibriVox para clonar con Chatterbox.

POR QUE LIBRIVOX
    Chatterbox no tiene catalogo de voces: CLONA la que le des. Grabar
    la voz del operador es la mejor opcion a mediano plazo, pero para
    probar HOY sin grabar nada, LibriVox sirve: son audiolibros leidos
    por voluntarios y el proyecto entero esta dedicado a dominio
    publico (ni el texto ni la lectura tienen derechos de autor).

    LibriVox no etiqueta el tono de voz de sus lectores (no hay forma
    de pedirle programaticamente "grave" y "masculina"), asi que este
    script no elige UNA voz: junta varios CANDIDATOS de proyectos con
    un solo narrador y clona la MISMA frase de prueba con cada uno.
    Se escuchan los resultados y se elige de oido -- mismo metodo que
    ya se uso para elegir entre Piper/Kokoro/Pocket/Chatterbox.

COMO
    1. Recorre la API de LibriVox (https://librivox.org/api/feed/
       audiobooks) buscando libros en español donde TODOS los
       capitulos los lea la misma persona (proyecto solista: mas
       probable que sea una sola voz consistente, no una antologia
       coral).
    2. De cada candidato baja UN capitulo (no el primero, que suele
       ser una intro corta), recorta 14s limpios saltando el arranque,
       y normaliza el volumen.
    3. Si chatterbox-tts esta instalado, clona la frase de prueba del
       proyecto con cada candidato como referencia.
    4. Escribe creditos: titulo, autor, lector, URL de LibriVox.

Uso:
    python3 conseguir_voz_librivox.py [cuantos_candidatos]
"""
import json
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "assets" / "voz_referencia" / "candidatos"
MUESTRAS = RAIZ / "muestras_voz"
API = "https://librivox.org/api/feed/audiobooks/"

FRASE = ("La mitad de lo que venden los latinos no se vende acá. "
         "Se cobra en dólares, afuera. El problema no es el mercado: "
         "es que no sabés qué vender.")

UA = {"User-Agent": "Mozilla/5.0 (compatible; FabricaContenido/1.0)"}


def _pedir_json(url):
    pedido = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(pedido, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def _slug(t):
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:40] or "sin-nombre"


def buscar_candidatos(cuantos=5, paginas_max=25):
    """Recorre el catalogo paginado juntando, por LECTOR individual (no
    por libro), un capitulo suyo para usar de referencia.

    La mayoria de los libros en español de LibriVox son proyectos
    corales -- un voluntario distinto por capitulo -- asi que exigir
    que TODO el libro comparta un solo lector (como se probo primero)
    da cero resultados sobre cientos de libros revisados. Agrupar por
    lector individual aprovecha esos mismos proyectos corales: cada
    capitulo ya es, de por si, la voz de una sola persona.

    Devuelve una lista de dicts con titulo, autor, lector y la URL de
    audio de un capitulo, uno por lector distinto."""
    lectores_vistos = {}   # display_name -> dict del candidato
    libros_es, secciones_con_lector = 0, 0
    for pagina in range(paginas_max):
        if len(lectores_vistos) >= cuantos:
            break
        offset = pagina * 50
        url = (f"{API}?{urllib.parse.urlencode({'format': 'json', 'extended': 1, 'limit': 50, 'offset': offset})}")
        try:
            datos = _pedir_json(url)
        except Exception as e:
            print(f"  pagina {pagina}: fallo la consulta ({e})")
            continue
        libros = datos.get("books", [])
        if not libros:
            print(f"  pagina {pagina}: catalogo vacio, se corta la busqueda")
            break
        for libro in libros:
            if libro.get("language") != "Spanish":
                continue
            libros_es += 1
            secciones = libro.get("sections") or []
            if isinstance(secciones, dict):
                secciones = list(secciones.values())
            for sec in secciones:
                if not sec.get("listen_url"):
                    continue
                lector = None
                for r in (sec.get("readers") or []):
                    if r.get("display_name"):
                        lector = r["display_name"]
                        break
                if not lector or lector in lectores_vistos:
                    continue
                secciones_con_lector += 1
                lectores_vistos[lector] = {
                    "titulo": libro.get("title", "?"),
                    "autor": (libro.get("authors") or [{}])[0].get("last_name", "?"),
                    "lector": lector,
                    "url_audio": sec["listen_url"],
                    "url_libro": f"https://librivox.org/{_slug(libro.get('title',''))}/",
                }
                if len(lectores_vistos) >= cuantos:
                    break
            if len(lectores_vistos) >= cuantos:
                break
    print(f"  diagnostico: {libros_es} libro(s) en español revisados, "
          f"{secciones_con_lector} capitulo(s) con lector identificado, "
          f"{len(lectores_vistos)} lector(es) distinto(s) encontrados")
    return list(lectores_vistos.values())


def bajar_y_recortar(cand, n):
    """Baja el capitulo, recorta 14s limpios y normaliza. Devuelve la
    ruta al wav de referencia o None si algo fallo."""
    carpeta = DESTINO
    carpeta.mkdir(parents=True, exist_ok=True)
    crudo = carpeta / f".tmp-{n}.mp3"
    ref = carpeta / f"{n}-{_slug(cand['lector'])}.wav"
    try:
        pedido = urllib.request.Request(cand["url_audio"], headers=UA)
        with urllib.request.urlopen(pedido, timeout=120) as r, open(crudo, "wb") as out:
            out.write(r.read())
    except Exception as e:
        print(f"  [{n}] fallo la descarga: {e}")
        return None
    # Salta el arranque (suele tener una frase de LibriVox antes de
    # empezar el capitulo) y toma 14s limpios, en el rango 6-15s que
    # pide Chatterbox para clonar bien.
    r = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-ss", "8", "-i", str(crudo),
         "-t", "14", "-af", "loudnorm=I=-18:TP=-2:LRA=7", "-ar", "24000",
         "-ac", "1", str(ref)], capture_output=True, text=True)
    crudo.unlink(missing_ok=True)
    if r.returncode != 0 or not ref.exists():
        print(f"  [{n}] ffmpeg fallo: {r.stderr[:200]}")
        return None
    return ref


def clonar(ref_wav, n, lector):
    """Genera la frase de prueba clonando la voz de referencia. Se
    importa aca adentro (no al tope del archivo) para que el script
    tambien sirva para solo bajar candidatos si chatterbox no esta."""
    try:
        import torchaudio as ta
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    except ImportError as e:
        print(f"  [{n}] chatterbox no instalado, no se clona ({e})")
        return None
    global _MODELO
    try:
        modelo = _MODELO
    except NameError:
        import time
        t0 = time.time()
        modelo = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
        print(f"  modelo chatterbox cargado en {time.time()-t0:.0f}s")
        globals()["_MODELO"] = modelo
    try:
        wav = modelo.generate(FRASE, language_id="es",
                              audio_prompt_path=str(ref_wav), exaggeration=0.55)
        salida = MUESTRAS / f"librivox-{n}-{_slug(lector)}-CLON.wav"
        ta.save(str(salida), wav, modelo.sr)
        return salida
    except Exception as e:
        print(f"  [{n}] fallo la clonacion: {e}")
        return None


def _a_mp3(wav, nombre):
    mp3 = MUESTRAS / f"{nombre}.mp3"
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav),
                        "-b:a", "128k", str(mp3)], capture_output=True, text=True)
    return mp3.name if r.returncode == 0 else None


def main():
    cuantos = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    MUESTRAS.mkdir(exist_ok=True)
    print(f"Buscando {cuantos} candidatos en español, un lector por proyecto...")
    candidatos = buscar_candidatos(cuantos)
    if not candidatos:
        print("No se encontro ningun candidato.")
        return 1

    creditos, hechos = [], []
    for i, c in enumerate(candidatos, 1):
        print(f"\n[{i}] \"{c['titulo']}\" — {c['autor']} — lector: {c['lector']}")
        ref = bajar_y_recortar(c, i)
        if not ref:
            continue
        m = _a_mp3(ref, f"librivox-{i}-{_slug(c['lector'])}-ORIGINAL")
        if m:
            hechos.append(m)
        creditos.append(
            f"- **Candidato {i}** — \"{c['titulo']}\" de {c['autor']}, "
            f"leido por **{c['lector']}** — {c['url_libro']} "
            f"(LibriVox, dominio público)")
        clon = clonar(ref, i, c["lector"])
        if clon:
            m = _a_mp3(clon, f"librivox-{i}-{_slug(c['lector'])}-CLON")
            if m:
                hechos.append(m)
            clon.unlink(missing_ok=True)

    (MUESTRAS / "LEEME-librivox.md").write_text(
        "# Candidatos de voz masculina desde LibriVox\n\n"
        "Cada candidato tiene DOS archivos:\n\n"
        "- `...-ORIGINAL.mp3` — el lector de LibriVox leyendo SU libro "
        "(para juzgar el timbre de la voz).\n"
        "- `...-CLON.mp3` — Chatterbox clonando esa voz para decir "
        "NUESTRA frase de guion (esto es lo que va a sonar en los "
        "videos).\n\n"
        "## Créditos\n\n" + "\n".join(creditos) + "\n\n"
        "Todas las grabaciones de LibriVox están dedicadas a dominio "
        "público: se pueden usar libremente, sin atribución obligatoria "
        "(igual se las deja documentadas arriba).\n",
        encoding="utf-8")
    print(f"\n{len(hechos)} archivo(s) en {MUESTRAS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
