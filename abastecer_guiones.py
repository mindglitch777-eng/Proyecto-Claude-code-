#!/usr/bin/env python3
"""
Le consigue a cada plano la imagen que ese plano DICE que necesita.

EL PROBLEMA QUE RESUELVE
    Antes se bajaban 12 fotos por nicho y despues se escribia el guion
    eligiendo entre lo que habia. Eso es escribir atado al stock: si la
    voz decia "perros" pero solo habia fotos de barberia, se veia una
    barberia. La imagen acompañaba de fondo en vez de confirmar la
    palabra.

    Ahora manda el guion. Cada plano declara que necesita mostrar y
    este script lo consigue:

        {"formato": "pleno",
         "narracion": "se cobra en dólares, afuera",
         "necesita": "us dollar bills cash close up"}

    -> baja la foto, la guarda en assets/biblioteca/<consulta>/ y
       escribe el campo "imagen" de vuelta en el guion.

    Lo bajado QUEDA. El segundo guion que pida "us dollar bills" no
    gasta una descarga, y la biblioteca crece sola con cada guion.

SOBRE LAS CONSULTAS
    Van en INGLES: el banco esta indexado en ingles y devuelve mucho
    mas material. Y conviene pedir cosas CONCRETAS, no conceptos:
    "latin america" devuelve turismo de folleto (playas, ruinas,
    mochileros) que no le habla a nadie de aca. Un local de barrio con
    la persiana a medio subir, unas manos trabajando o un billete
    arrugado se reconocen como propios al cuarto de segundo.

Uso:
    python3 abastecer_guiones.py guiones/taller-mercado-digital.json
    python3 abastecer_guiones.py "guiones/*taller*.json"
    python3 abastecer_guiones.py --listar guiones/*.json   (que falta)
"""
import glob
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).parent
BIBLIOTECA = RAIZ / "assets" / "biblioteca"
API = "https://api.pexels.com/v1/search"
API_VIDEO = "https://api.pexels.com/videos/search"
POR_CONSULTA = 4   # variantes por consulta, para no repetir foto


def clave():
    from descargar_metraje import clave as _c
    return _c()


def _slug(consulta):
    s = re.sub(r"[^a-z0-9]+", "-", consulta.lower()).strip("-")
    return s[:60] or "sin-nombre"


def _pedir(url, k):
    pedido = urllib.request.Request(url, headers={
        "Authorization": k,
        "User-Agent": "Mozilla/5.0 (compatible; FabricaContenido/1.0)",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(pedido, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def existentes(consulta, es_video=False):
    carpeta = BIBLIOTECA / _slug(consulta)
    if not carpeta.exists():
        return []
    ext = "*.mp4" if es_video else "*.jpg"
    return sorted(carpeta.glob(ext))


def conseguir(consulta, k, es_video=False, cuantas=POR_CONSULTA):
    """Baja hasta 'cuantas' piezas para esa consulta si no estan ya."""
    ya = existentes(consulta, es_video)
    if len(ya) >= cuantas:
        return ya
    carpeta = BIBLIOTECA / _slug(consulta)
    carpeta.mkdir(parents=True, exist_ok=True)
    if es_video:
        from descargar_metraje import bajar_video_nicho
        # reusa la logica de recorte/encuadre ya probada
        import descargar_metraje as dm
        destino_previo = dm.DESTINO_VIDEO
        dm.DESTINO_VIDEO = BIBLIOTECA
        try:
            dm.bajar_video_nicho(_slug(consulta), consulta, cuantas, k)
        finally:
            dm.DESTINO_VIDEO = destino_previo
        return existentes(consulta, True)

    url = f"{API}?{urllib.parse.urlencode({'query': consulta, 'per_page': cuantas, 'orientation': 'portrait', 'size': 'large'})}"
    datos = _pedir(url, k)
    fotos = datos.get("photos", [])
    if not fotos:
        print(f"  SIN RESULTADOS: '{consulta}'")
        return ya
    creditos = []
    for i, f in enumerate(fotos):
        destino = carpeta / f"{i:02d}.jpg"
        if destino.exists():
            continue
        src = f["src"].get("portrait") or f["src"].get("large")
        pedido = urllib.request.Request(src, headers={
            "User-Agent": "Mozilla/5.0 (compatible; FabricaContenido/1.0)"})
        try:
            with urllib.request.urlopen(pedido, timeout=90) as r, open(destino, "wb") as out:
                out.write(r.read())
            creditos.append(f"- `{destino.name}` — {f['photographer']} "
                            f"({f['photographer_url']}) — {f['url']}")
        except Exception as e:
            print(f"  fallo {consulta}#{i}: {e}")
    if creditos:
        cr = carpeta / "CREDITOS.md"
        previo = cr.read_text(encoding="utf-8") if cr.exists() else \
            f"# {consulta}\n\nFotos de Pexels, licencia libre para uso comercial.\n\n"
        cr.write_text(previo + "\n".join(creditos) + "\n", encoding="utf-8")
    return existentes(consulta, False)


def abastecer(ruta, k, solo_listar=False):
    """Recorre un guion, consigue lo que pide cada plano y engancha las
    rutas de vuelta. Devuelve (planos_resueltos, faltantes)."""
    p = Path(ruta)
    cfg = json.loads(p.read_text(encoding="utf-8"))
    usadas = {}       # consulta -> cuantas veces ya se uso en este guion
    resueltos, faltan = 0, []
    for seg in cfg.get("segmentos", []):
        consulta = seg.get("necesita")
        if not consulta:
            continue
        es_video = bool(seg.get("necesita_video"))
        if solo_listar:
            if not existentes(consulta, es_video):
                faltan.append(consulta)
            continue
        piezas = conseguir(consulta, k, es_video)
        if not piezas:
            faltan.append(consulta)
            continue
        # Variante distinta cada vez que el MISMO guion repite una
        # consulta: si no, dos planos seguidos muestran la misma foto y
        # se siente que el video se quedo trabado.
        n = usadas.get(consulta, 0)
        usadas[consulta] = n + 1
        elegida = piezas[n % len(piezas)]
        seg["video" if es_video else "imagen"] = str(
            elegida.relative_to(RAIZ)).replace("\\", "/")
        resueltos += 1
    if not solo_listar:
        p.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n",
                     encoding="utf-8")
    return resueltos, faltan


def main():
    a = sys.argv[1:]
    solo_listar = False
    if a and a[0] == "--listar":
        solo_listar = True
        a = a[1:]
    if not a:
        print(__doc__)
        return 0
    rutas = []
    for patron in a:
        rutas += [f for f in glob.glob(patron) if not f.endswith("-con-voz.json")]
    if not rutas:
        print("No hay guiones que coincidan.")
        return 1
    k = None if solo_listar else clave()
    BIBLIOTECA.mkdir(parents=True, exist_ok=True)
    total, todos_faltan = 0, []
    for r in sorted(set(rutas)):
        print(f"\n[{Path(r).name}]")
        n, faltan = abastecer(r, k, solo_listar)
        total += n
        todos_faltan += faltan
        if solo_listar:
            for f in faltan:
                print(f"  falta: {f}")
        else:
            print(f"  {n} plano(s) con imagen enganchada")
    if todos_faltan and not solo_listar:
        print("\nNO SE PUDO CONSEGUIR:")
        for f in sorted(set(todos_faltan)):
            print(f"  - {f}")
    print(f"\nTotal: {total} plano(s) abastecido(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
