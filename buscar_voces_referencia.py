#!/usr/bin/env python3
"""
Busca candidatos de audio de referencia (voz masculina, español, licencia
libre) en Wikimedia Commons y Archive.org (LibriVox), para clonar con
Qwen3-TTS. Corre en GitHub Actions porque ambas APIs estan bloqueadas
desde el entorno de Claude Code.

Fuentes, ambas con licencia garantizada por diseño de la plataforma
(nunca contenido con copyright restrictivo):
    - Wikimedia Commons: Category:Audio files of males speaking Spanish
      (CC0 / CC-BY / CC-BY-SA segun el archivo)
    - Archive.org, coleccion librivoxaudio, filtrado a idioma Spanish
      (dominio publico)

Uso:
    python3 buscar_voces_referencia.py
"""
import json
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path

DESTINO = Path(__file__).parent / "muestras_voz" / "referencias-candidatas"
UA = {"User-Agent": "FabricaContenido/1.0 (investigacion de voz de referencia)"}


def _get(url):
    r = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(r, timeout=60) as resp:
        return json.load(resp)


def wikimedia_candidatos(limite=15):
    """Miembros de Category:Audio files of males speaking Spanish."""
    api = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query", "list": "categorymembers",
        "cmtitle": "Category:Audio files of males speaking Spanish",
        "cmtype": "file", "cmlimit": str(limite), "format": "json",
    }
    data = _get(f"{api}?{urllib.parse.urlencode(params)}")
    titulos = [m["title"] for m in data.get("query", {}).get("categorymembers", [])]
    candidatos = []
    for titulo in titulos:
        info = _get(f"{api}?{urllib.parse.urlencode({
            'action': 'query', 'titles': titulo, 'prop': 'imageinfo',
            'iiprop': 'url|size|extmetadata', 'format': 'json'})}")
        pages = info.get("query", {}).get("pages", {})
        for pagina in pages.values():
            for img in pagina.get("imageinfo", []):
                licencia = img.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "?")
                candidatos.append({"nombre": titulo, "url": img["url"], "licencia": licencia,
                                    "fuente": "wikimedia"})
    return candidatos


def librivox_candidatos(limite=15):
    """Audiolibros españoles en Archive.org, coleccion LibriVox."""
    api = "https://archive.org/advancedsearch.php"
    params = {
        "q": 'collection:librivoxaudio AND language:(Spanish)',
        "fl[]": ["identifier", "title", "creator"],
        "rows": str(limite), "output": "json",
    }
    data = _get(f"{api}?{urllib.parse.urlencode(params, doseq=True)}")
    candidatos = []
    for doc in data.get("response", {}).get("docs", []):
        ident = doc["identifier"]
        # el primer archivo mp3 del item, via la metadata API
        meta = _get(f"https://archive.org/metadata/{ident}")
        mp3s = [f for f in meta.get("files", []) if f.get("name", "").endswith(".mp3")]
        if not mp3s:
            continue
        archivo = sorted(mp3s, key=lambda f: -int(f.get("size", 0)))[0]
        candidatos.append({
            "nombre": doc.get("title", ident),
            "url": f"https://archive.org/download/{ident}/{archivo['name']}",
            "licencia": "dominio publico (LibriVox)", "fuente": "librivox",
        })
    return candidatos


def descargar_y_recortar(candidatos, segundos=25):
    DESTINO.mkdir(parents=True, exist_ok=True)
    hechos = []
    for i, c in enumerate(candidatos):
        nombre = f"{c['fuente']}-{i:02d}"
        crudo = DESTINO / f"{nombre}-original.tmp"
        try:
            urllib.request.urlretrieve(c["url"], crudo)
        except Exception as e:
            print(f"  [{nombre}] no se pudo bajar: {e}")
            continue
        # recorte de los primeros N segundos, salteando 3s iniciales
        # (suele haber silencio/intro) y a mp3 para escuchar facil
        salida = DESTINO / f"{nombre}.mp3"
        r = subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-ss", "3", "-i", str(crudo),
             "-t", str(segundos), "-b:a", "128k", str(salida)],
            capture_output=True, text=True)
        crudo.unlink(missing_ok=True)
        if r.returncode == 0 and salida.exists():
            hechos.append({**c, "archivo": salida.name})
            print(f"  [{nombre}] ok — {c['nombre']} ({c['licencia']})")
        else:
            print(f"  [{nombre}] fallo el recorte: {r.stderr[:200]}")
    return hechos


def main():
    print("=== Wikimedia Commons ===")
    wiki = wikimedia_candidatos()
    print(f"  {len(wiki)} candidatos encontrados")

    print("=== LibriVox / Archive.org ===")
    libri = librivox_candidatos()
    print(f"  {len(libri)} candidatos encontrados")

    todos = wiki + libri
    hechos = descargar_y_recortar(todos)

    (DESTINO / "LEEME.md").write_text(
        "# Candidatos de voz de referencia (para clonar con Qwen3-TTS)\n\n"
        "Recortes de 25s de audios con licencia libre garantizada por origen "
        "(Wikimedia Commons o LibriVox/Archive.org — nunca contenido con "
        "copyright restrictivo).\n\n"
        + "\n".join(f"- `{h['archivo']}` — {h['nombre']} ({h['licencia']}, "
                     f"fuente: {h['fuente']}) — {h['url']}" for h in hechos),
        encoding="utf-8")
    print(f"\n{len(hechos)} candidatos listos en {DESTINO}")


if __name__ == "__main__":
    main()
