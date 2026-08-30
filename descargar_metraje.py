#!/usr/bin/env python3
"""
Baja metraje de banco desde Pexels para las maquetas 'pleno' y
'tarjeta' -- CERO TOKENS.

La clave NUNCA se escribe en el repo: se lee de la variable de entorno
PEXELS_API_KEY, que en GitHub Actions viene del secreto del mismo
nombre. Si falta, el script corta y explica como cargarla.

Este script corre en un runner de GitHub Actions porque el entorno de
Claude Code tiene bloqueado el acceso a pexels.com (verificado: el
proxy responde 403 a la conexion). El runner si tiene internet abierto,
igual que ya haciamos para bajar imagenes de Openverse.

Uso:
    python3 descargar_metraje.py barberia "barber shop" 12
    python3 descargar_metraje.py --lote          (todos los nichos de NICHOS)

Deja los archivos en assets/metraje/<nicho>/ y escribe un CREDITOS.md
con autor y enlace de cada foto, como pide la licencia de Pexels.
"""
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).parent
DESTINO = RAIZ / "assets" / "metraje"
API = "https://api.pexels.com/v1/search"
API_VIDEO = "https://api.pexels.com/videos/search"
DESTINO_VIDEO = RAIZ / "assets" / "metraje_video"

# Terminos en INGLES a proposito: el banco esta indexado en ingles y
# devuelve mucho mas material que buscando en castellano.
NICHOS = {
    "barberia": "barber shop haircut man",
    "unias": "nail salon manicure hands",
    "gimnasio": "personal trainer gym coaching",
    "nutricion": "nutritionist healthy food consultation",
    "veterinaria": "veterinarian clinic dog",
    "dinero": "money cash entrepreneur laptop",
}


ARCHIVO_CLAVE = RAIZ / "pexels_key.txt"


def clave():
    """Clave de Pexels. Primero la variable de entorno (si algun dia se
    carga como secreto del repo, manda esa); si no, el archivo
    pexels_key.txt.

    Decision del operador: la clave va en el archivo para que la
    descarga funcione sin ningun paso manual. Es una clave de SOLO
    LECTURA del banco de fotos gratuito -- no permite gastar dinero,
    no da acceso a ninguna cuenta y su unico limite es 200 descargas
    por hora. Si alguna vez se filtra, se regenera desde pexels.com/api
    y se reemplaza este archivo."""
    k = os.environ.get("PEXELS_API_KEY", "").strip()
    if k:
        return k
    if ARCHIVO_CLAVE.exists():
        k = ARCHIVO_CLAVE.read_text(encoding="utf-8").strip()
        if k:
            return k
    print(f"ERROR: no hay clave. Escribila en {ARCHIVO_CLAVE.name} o "
          f"cargala como variable PEXELS_API_KEY.")
    sys.exit(1)


def buscar(consulta, cantidad, k):
    url = (f"{API}?{urllib.parse.urlencode({'query': consulta, 'per_page': cantidad, 'orientation': 'portrait', 'size': 'large'})}")
    # User-Agent explicito: con el de urllib por defecto
    # ("Python-urllib/3.11") la API responde 403. Pexels espera la clave
    # cruda en Authorization, sin "Bearer".
    pedido = urllib.request.Request(url, headers={
        "Authorization": k,
        "User-Agent": "Mozilla/5.0 (compatible; FabricaContenido/1.0)",
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(pedido, timeout=45) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        cuerpo = e.read().decode("utf-8", "ignore")[:300]
        if e.code in (401, 403):
            print(f"ERROR {e.code}: Pexels rechazo la clave.\n"
                  f"Respuesta: {cuerpo}\n"
                  f"Revisa que la clave este completa y activa en "
                  f"pexels.com/api.")
        else:
            print(f"ERROR {e.code} al consultar Pexels: {cuerpo}")
        raise


def bajar_nicho(nicho, consulta, cantidad, k):
    carpeta = DESTINO / nicho
    carpeta.mkdir(parents=True, exist_ok=True)
    datos = buscar(consulta, cantidad, k)
    fotos = datos.get("photos", [])
    if not fotos:
        print(f"  [{nicho}] sin resultados para '{consulta}'")
        return 0
    creditos = []
    n = 0
    for i, f in enumerate(fotos):
        # 'portrait' ya viene recortado 800x1200, buena base para 1080x1920
        src = f["src"].get("portrait") or f["src"].get("large")
        destino = carpeta / f"{nicho}-{i:02d}.jpg"
        # El servidor de imagenes tambien rechaza el User-Agent por
        # defecto de urllib: la busqueda respondia bien pero las 72
        # descargas fallaban en silencio y quedaban las carpetas vacias.
        pedido = urllib.request.Request(src, headers={
            "User-Agent": "Mozilla/5.0 (compatible; FabricaContenido/1.0)"})
        try:
            with urllib.request.urlopen(pedido, timeout=60) as r, open(destino, "wb") as out:
                out.write(r.read())
        except Exception as e:
            print(f"  [{nicho}] fallo {i}: {e}")
            continue
        creditos.append(f"- `{destino.name}` — foto de {f['photographer']} "
                        f"({f['photographer_url']}) — {f['url']}")
        n += 1
    (carpeta / "CREDITOS.md").write_text(
        f"# Creditos — {nicho}\n\nFotos de Pexels, licencia libre para uso "
        f"comercial. Atribucion no obligatoria pero incluida.\n\n"
        + "\n".join(creditos) + "\n", encoding="utf-8")
    print(f"  [{nicho}] {n} fotos -> {carpeta}")
    return n


def buscar_video(consulta, cantidad, k):
    url = (f"{API_VIDEO}?{urllib.parse.urlencode({'query': consulta, 'per_page': cantidad, 'orientation': 'portrait', 'size': 'medium'})}")
    pedido = urllib.request.Request(url, headers={
        "Authorization": k,
        "User-Agent": "Mozilla/5.0 (compatible; FabricaContenido/1.0)",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(pedido, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def _mejor_archivo(v):
    """De las varias resoluciones que ofrece Pexels, la vertical mas
    cercana a 1080x1920 SIN pasarse mucho: bajar un 4K para despues
    reducirlo a 1080 es tirar ancho de banda y tiempo de decodificado
    en cada render."""
    archivos = [a for a in v.get("video_files", [])
                if a.get("height") and a.get("width")
                and a["height"] >= a["width"]]
    if not archivos:
        archivos = v.get("video_files", [])
    if not archivos:
        return None
    # penaliza fuerte pasarse de 1920 de alto
    def costo(a):
        h = a.get("height") or 0
        return abs(h - 1920) + (h - 1920) * 2 if h > 1920 else abs(h - 1920)
    return sorted(archivos, key=costo)[0]


def bajar_video_nicho(nicho, consulta, cantidad, k, seg_max=8):
    """Baja clips cortos y los recorta a seg_max segundos. Un clip de
    banco suele durar 20-30s y en el video se usan 2 o 3: guardar el
    original entero seria decenas de MB por nada."""
    carpeta = DESTINO_VIDEO / nicho
    carpeta.mkdir(parents=True, exist_ok=True)
    datos = buscar_video(consulta, cantidad, k)
    videos = datos.get("videos", [])
    if not videos:
        print(f"  [{nicho}] sin videos para '{consulta}'")
        return 0
    creditos, n = [], 0
    for i, v in enumerate(videos):
        arch = _mejor_archivo(v)
        if not arch:
            continue
        crudo = carpeta / f".tmp-{i:02d}.mp4"
        destino = carpeta / f"{nicho}-{i:02d}.mp4"
        pedido = urllib.request.Request(arch["link"], headers={
            "User-Agent": "Mozilla/5.0 (compatible; FabricaContenido/1.0)"})
        try:
            with urllib.request.urlopen(pedido, timeout=180) as r, open(crudo, "wb") as out:
                out.write(r.read())
        except Exception as e:
            print(f"  [{nicho}] fallo video {i}: {e}")
            crudo.unlink(missing_ok=True)
            continue
        # recorte + encuadre vertical exacto, para que el render no
        # tenga que resolver relacion de aspecto en cada cuadro
        r = subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(crudo),
             "-t", str(seg_max),
             "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,"
                    "crop=1080:1920",
             "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
             str(destino)], capture_output=True, text=True)
        crudo.unlink(missing_ok=True)
        if r.returncode != 0 or not destino.exists():
            print(f"  [{nicho}] ffmpeg fallo en {i}: {r.stderr[:120]}")
            continue
        creditos.append(f"- `{destino.name}` — video de {v['user']['name']} "
                        f"({v['user']['url']}) — {v['url']}")
        n += 1
    (carpeta / "CREDITOS.md").write_text(
        f"# Creditos video — {nicho}\n\nVideos de Pexels, licencia libre "
        f"para uso comercial.\n\n" + "\n".join(creditos) + "\n",
        encoding="utf-8")
    print(f"  [{nicho}] {n} clips -> {carpeta}")
    return n


def main():
    a = sys.argv[1:]
    k = clave()
    DESTINO.mkdir(parents=True, exist_ok=True)
    if a and a[0] == "--video":
        DESTINO_VIDEO.mkdir(parents=True, exist_ok=True)
        resto = a[1:]
        cuantos = int(resto[-1]) if resto and resto[-1].isdigit() else 6
        nichos = ([resto[0]] if resto and not resto[0].isdigit()
                  else list(NICHOS))
        total = sum(bajar_video_nicho(n, NICHOS.get(n, n), cuantos, k)
                    for n in nichos)
        print(f"\nTotal: {total} clips.")
        return 0
    if not a or a[0] == "--lote":
        total = sum(bajar_nicho(n, c, 12, k) for n, c in NICHOS.items())
        print(f"\nTotal: {total} fotos en {len(NICHOS)} nichos.")
        return 0
    # Un solo nicho. Si el nombre esta en NICHOS se usa su consulta; si
    # no, se toma el texto tal cual como busqueda. Asi el workflow solo
    # necesita pasar el nombre y no tiene que resolver la consulta.
    nicho = a[0]
    consulta = NICHOS.get(nicho, a[1] if len(a) > 1 else nicho)
    cantidad = int(a[-1]) if a[-1].isdigit() else 12
    bajar_nicho(nicho, consulta, cantidad, k)
    return 0


if __name__ == "__main__":
    sys.exit(main())
