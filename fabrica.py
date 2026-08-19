#!/usr/bin/env python3
"""
Fabrica de contenido (v9) - CERO TOKENS por render.

Produce MUCHOS videos en UNA corrida, y exporta cada uno en varios
formatos (9:16 vertical, 1:1 cuadrado, 16:9 horizontal) para cubrir
TikTok, Reels, Shorts, feed y YouTube con una sola construccion.

Multiplicar formatos multiplica visualizaciones sin producir contenido
nuevo: el mismo video rinde en 3 plataformas en vez de 1.

Uso:
    python3 fabrica.py lote.json
    python3 fabrica.py lote.json --solo-validar
    python3 fabrica.py --ejemplo

Formato del lote (JSON):
{
  "salida_dir": "videos",
  "formatos": ["9:16", "1:1", "16:9"],
  "base": {                          # config compartida por todos
    "fps": 30, "loop": true,
    "paleta": {"fondo": [12,12,18], "texto": [245,245,250],
               "destacado": [255,84,48]}
  },
  "videos": [
    {"nombre": "error-01", "segmentos": [ ... ]},
    {"nombre": "error-02", "segmentos": [ ... ]}
  ]
}
"""

import json
import subprocess
import sys
import time
from pathlib import Path

FORMATOS = {
    "9:16": (1080, 1920),
    "1:1": (1080, 1080),
    "16:9": (1920, 1080),
    "4:5": (1080, 1350),
}

EJEMPLO = {
    "salida_dir": "videos",
    "formatos": ["9:16", "1:1"],
    "base": {
        "fps": 30,
        "loop": True,
        "paleta": {"fondo": [12, 12, 18], "texto": [245, 245, 250],
                   "destacado": [255, 84, 48]},
    },
    "videos": [
        {"nombre": "error-01", "segmentos": [
            {"texto": "Publique 47 productos.", "duracion": 1.6,
             "estilo": "hook", "transicion": "corte"},
            {"texto": "productos vendidos", "numero": 3, "duracion": 1.8,
             "estilo": "contador", "transicion": "punch"},
            {"texto": "3 errores que cometi", "duracion": 3.0,
             "estilo": "lista", "transicion": "whip",
             "items": ["Publicar y esperar", "Cambiar de canal",
                       "No medir nada"]},
            {"texto": "Publique 47 productos...", "duracion": 1.6,
             "estilo": "cierre", "transicion": "fade"},
        ]},
        {"nombre": "error-02", "segmentos": [
            {"texto": "Baje el precio a la mitad.", "duracion": 1.6,
             "estilo": "hook", "transicion": "corte"},
            {"texto": "ventas menos", "numero": 40, "duracion": 1.8,
             "estilo": "contador", "transicion": "punch"},
            {"texto": "El precio bajo mata la percepcion de valor",
             "duracion": 2.4, "transicion": "glide"},
            {"texto": "Baje el precio a la mitad...", "duracion": 1.6,
             "estilo": "cierre", "transicion": "fade"},
        ]},
    ],
}


def reencuadrar(entrada, salida, ancho, alto):
    """Reencuadra manteniendo el centro. El texto ya esta centrado,
    asi que no se pierde informacion importante."""
    vf = (f"scale={ancho}:{alto}:force_original_aspect_ratio=increase,"
          f"crop={ancho}:{alto}")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(entrada),
           "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p",
           "-preset", "medium", "-crf", "20"]
    # Conserva el audio si existe
    cmd += ["-c:a", "copy", str(salida)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        # Reintenta sin copiar audio (video mudo)
        cmd = [c for c in cmd if c not in ("-c:a", "copy")]
        r = subprocess.run(cmd, capture_output=True, text=True)
    return r.returncode == 0


def producir(path_lote, solo_validar=False):
    p = Path(path_lote)
    if not p.exists():
        print(f"ERROR: no existe '{path_lote}'.")
        return 1
    try:
        lote = json.loads(p.read_text())
    except json.JSONDecodeError as e:
        print(f"ERROR: JSON invalido -> {e}")
        return 1

    videos = lote.get("videos")
    if not videos:
        print("ERROR: el lote necesita una lista 'videos'.")
        return 1

    base = lote.get("base", {})
    formatos = lote.get("formatos", ["9:16"])
    for f in formatos:
        if f not in FORMATOS:
            print(f"ERROR: formato '{f}' desconocido. "
                  f"Validos: {list(FORMATOS.keys())}")
            return 1

    out_dir = Path(lote.get("salida_dir", "videos"))
    out_dir.mkdir(exist_ok=True)
    tmp_dir = out_dir / "_tmp"
    tmp_dir.mkdir(exist_ok=True)

    animador = Path(__file__).parent / "animador_v9.py"
    validador = Path(__file__).parent / "validar_hook.py"
    if not animador.exists():
        print(f"ERROR: falta {animador}")
        return 1

    ok, fallidos, rechazados = 0, [], []
    t0 = time.time()
    print(f"=== FABRICA: {len(videos)} videos x {len(formatos)} formatos "
          f"= {len(videos) * len(formatos)} archivos ===\n")

    for i, v in enumerate(videos, 1):
        nombre = v.get("nombre", f"video-{i:02d}")
        print(f"[{i}/{len(videos)}] {nombre}")

        cfg = dict(base)
        cfg.update({k: val for k, val in v.items() if k != "nombre"})
        guion = tmp_dir / f"{nombre}.json"

        # --- Validacion de retencion antes de gastar tiempo de render ---
        if validador.exists():
            cfg_val = dict(cfg)
            guion.write_text(json.dumps(cfg_val, ensure_ascii=False, indent=2))
            rv = subprocess.run([sys.executable, str(validador), str(guion)],
                                capture_output=True, text=True)
            if rv.returncode != 0:
                print("  RECHAZADO por el validador de retencion:")
                for ln in rv.stdout.splitlines():
                    if ln.strip().startswith("✗"):
                        print(f"   {ln.strip()}")
                rechazados.append(nombre)
                continue

        if solo_validar:
            print("  validado OK (modo --solo-validar)")
            ok += 1
            continue

        # --- Render maestro en 9:16 ---
        maestro = tmp_dir / f"{nombre}-master.mp4"
        cfg["salida"] = str(maestro)
        guion.write_text(json.dumps(cfg, ensure_ascii=False, indent=2))
        r = subprocess.run([sys.executable, str(animador), str(guion)],
                           capture_output=True, text=True)
        if r.returncode != 0 or not maestro.exists():
            print(f"  ERROR al renderizar:\n   {r.stdout[-200:]}")
            fallidos.append(nombre)
            continue

        # --- Exportar a cada formato ---
        for fmt in formatos:
            w, h = FORMATOS[fmt]
            dest = out_dir / f"{nombre}_{fmt.replace(':', 'x')}.mp4"
            if fmt == "9:16":
                dest.write_bytes(maestro.read_bytes())
                print(f"  ✓ {dest.name}")
            elif reencuadrar(maestro, dest, w, h):
                print(f"  ✓ {dest.name}")
            else:
                print(f"  ✗ fallo el reencuadre a {fmt}")
                fallidos.append(f"{nombre}:{fmt}")
        ok += 1

    # Limpieza de temporales
    for f in tmp_dir.glob("*"):
        f.unlink()
    tmp_dir.rmdir()

    seg = time.time() - t0
    print(f"\n=== RESUMEN ===")
    print(f"Producidos: {ok}/{len(videos)} videos en {seg:.0f}s")
    if rechazados:
        print(f"Rechazados por retencion: {', '.join(rechazados)}")
    if fallidos:
        print(f"Fallidos: {', '.join(fallidos)}")
    if ok and not solo_validar:
        print(f"Archivos en: {out_dir.resolve()}")
    return 0 if not fallidos else 1


def crear_ejemplo():
    path = Path("lote-ejemplo.json")
    if path.exists():
        print(f"ERROR: {path} ya existe.")
        return 1
    path.write_text(json.dumps(EJEMPLO, indent=2, ensure_ascii=False))
    print(f"Creado: {path}\nCorre: python3 fabrica.py {path}")
    return 0


def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        return
    if a[0] == "--ejemplo":
        sys.exit(crear_ejemplo())
    sys.exit(producir(a[0], "--solo-validar" in a))


if __name__ == "__main__":
    main()
