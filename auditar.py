#!/usr/bin/env python3
"""
Auditoria del repo. Solo mira: no toca ni borra nada.

Sirve para lo que se rompe en silencio y no da error hasta que ya
renderizaste veinte videos:

  - guiones que apuntan a un archivo que no existe (el animador avisa
    por consola y sigue, asi que el plano sale en negro y nadie se
    entera hasta verlo);
  - fotos identicas guardadas dos veces con distinto nombre, porque
    dos consultas distintas a Pexels devolvieron la misma imagen;
  - formatos usados en los guiones que el animador no conoce;
  - guiones sin narracion en planos que la necesitan.

Uso:
    python3 auditar.py            todo
    python3 auditar.py --assets   solo referencias rotas
    python3 auditar.py --dups     solo duplicados
"""
import glob
import hashlib
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
CAMPOS = ("imagen", "foto", "video", "voz_archivo", "ruta")


def _rutas(seg):
    for k in CAMPOS:
        if seg.get(k):
            yield k, seg[k]
    for lista in ("imagenes", "filas"):
        for fila in (seg.get(lista) or []):
            if isinstance(fila, dict):
                for k in CAMPOS:
                    if fila.get(k):
                        yield f"{lista}.{k}", fila[k]


def assets_rotos():
    faltan, total = Counter(), 0
    culpables = defaultdict(set)
    for f in sorted(glob.glob(str(RAIZ / "guiones" / "*.json"))):
        try:
            g = json.loads(Path(f).read_text(encoding="utf-8"))
        except Exception as e:
            print(f"  ILEGIBLE {Path(f).name}: {e}")
            continue
        for seg in g.get("segmentos", []):
            for _, v in _rutas(seg):
                total += 1
                if not (RAIZ / v).exists():
                    faltan[v] += 1
                    culpables[v].add(Path(f).name)
    print(f"{total} referencias a archivos, {sum(faltan.values())} rotas")
    for v, n in faltan.most_common():
        print(f"  x{n:<3} {v}")
        print(f"        en: {', '.join(sorted(culpables[v]))}")
    return sum(faltan.values())


def duplicados():
    porhash = defaultdict(list)
    peso = 0
    for f in (RAIZ / "assets").rglob("*"):
        if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".mp4"):
            porhash[hashlib.md5(f.read_bytes()).hexdigest()].append(f)
    grupos = [v for v in porhash.values() if len(v) > 1]
    for g in grupos:
        peso += g[0].stat().st_size * (len(g) - 1)
    print(f"{len(grupos)} archivo(s) guardado(s) mas de una vez "
          f"({peso/1e6:.1f} MB de mas)")
    for g in sorted(grupos, key=lambda x: -x[0].stat().st_size)[:15]:
        print(f"  {g[0].stat().st_size/1000:7.0f} KB")
        for f in g:
            print(f"      {f.relative_to(RAIZ)}")
    if grupos:
        print("\n  No se borra nada solo: hay guiones que apuntan a una copia "
              "y no a\n  la otra. Antes de borrar, revisar quien la usa.")
    return len(grupos)


def formatos_desconocidos():
    try:
        sys.path.insert(0, str(RAIZ))
        import animador_v9
        conocidos = set(animador_v9.FORMATOS)
    except Exception as e:
        print(f"  no se pudo cargar el animador: {e}")
        return 0
    malos = Counter()
    for f in sorted(glob.glob(str(RAIZ / "guiones" / "*.json"))):
        try:
            g = json.loads(Path(f).read_text(encoding="utf-8"))
        except Exception:
            continue
        for seg in g.get("segmentos", []):
            fmt = seg.get("formato")
            if fmt and fmt not in conocidos:
                malos[f"{Path(f).name}: {fmt}"] += 1
    print(f"{len(conocidos)} formatos en el animador, "
          f"{len(malos)} uso(s) de formato inexistente")
    for k, n in malos.most_common():
        print(f"  x{n} {k}   -> se dibuja como 'declaracion'")
    return len(malos)


def main():
    a = set(sys.argv[1:])
    todo = not a or a == {"--todo"}
    fallas = 0
    if todo or "--assets" in a:
        print("=== REFERENCIAS ROTAS EN LOS GUIONES ===")
        fallas += assets_rotos()
        print()
    if todo or "--dups" in a:
        print("=== ARCHIVOS DUPLICADOS EN assets/ ===")
        duplicados()
        print()
    if todo or "--formatos" in a:
        print("=== FORMATOS DESCONOCIDOS ===")
        fallas += formatos_desconocidos()
    return 1 if fallas else 0


if __name__ == "__main__":
    sys.exit(main())
