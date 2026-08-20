#!/usr/bin/env python3
"""
Orquestador de produccion en lote - CERO TOKENS, CERO IA.

Para cada guion en guiones/*.json (salvo *-con-voz.json, que son
salida de sincronizar_voz.py, no fuente): si hay audios de voz en
capturas_voz/ los engancha, y siempre renderiza a videos/<nombre>.mp4
via armar_video.py.

Pensado para correr en GitHub Actions (ver
.github/workflows/producir-videos.yml) para que la produccion del
lote no consuma nada de una sesion de Claude Code -- todo esto es
Python + ffmpeg deterministico, sin ningun modelo de por medio.

Uso:
    python3 producir_lote.py                    # todos los guiones
    python3 producir_lote.py "guiones/0*.json"   # con patron glob
    python3 producir_lote.py --solo-nuevos       # saltea los que ya
                                                  # tienen video y no
                                                  # cambiaron
"""
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
GUIONES_DIR = RAIZ / "guiones"
VIDEOS_DIR = RAIZ / "videos"
VOZ_DIR = RAIZ / "capturas_voz"


def voces_completas(stem, n_segmentos):
    """True si TODOS los indices narrados esperados tienen su mp3.
    No sabemos de antemano cuales indices son 'captura' sin leer el
    guion, asi que esto se llama con la lista real de indices."""
    faltan = [i for i in n_segmentos
              if not (VOZ_DIR / f"{stem}-voz{i}.mp3").exists()]
    return not faltan


def indices_narrados(guion_path):
    import json
    cfg = json.loads(guion_path.read_text(encoding="utf-8"))
    return [i for i, s in enumerate(cfg["segmentos"])
            if "captura" not in s and not s.get("quiebre_capitulo")]


def producir_uno(guion_path, solo_nuevos):
    stem = guion_path.stem
    salida = VIDEOS_DIR / f"{stem}.mp4"

    if solo_nuevos and salida.exists() and salida.stat().st_mtime > guion_path.stat().st_mtime:
        print(f"[saltea] {stem}: video ya esta al dia")
        return True

    idx = indices_narrados(guion_path)
    fuente = guion_path
    if voces_completas(stem, idx):
        r = subprocess.run(
            [sys.executable, str(RAIZ / "sincronizar_voz.py"),
             str(guion_path), str(VOZ_DIR)],
            capture_output=True, text=True)
        print(r.stdout.strip())
        if r.returncode == 0:
            fuente = guion_path.with_name(f"{stem}-con-voz.json")
        else:
            print(f"  AVISO: sincronizar_voz fallo, sigo sin voz.\n{r.stderr[-300:]}")
    else:
        print(f"[{stem}] sin audios completos en {VOZ_DIR} -- "
              f"se renderiza con las duraciones del guion (sin voz real).")

    print(f"[{stem}] renderizando -> {salida}")
    r = subprocess.run(
        [sys.executable, str(RAIZ / "armar_video.py"), str(fuente), str(salida)],
        capture_output=True, text=True)
    print(r.stdout.strip())
    if r.returncode != 0:
        print(f"  ERROR: {r.stderr[-500:]}")
        return False

    # Control de calidad sobre el .mp4 real (no sobre el guion): sincronia
    # audio/video, voz que no entra en su segmento, pantalla muerta y peso
    # del archivo. Ver verificar_video.py. No frena la produccion del
    # lote -- informa, y el resumen final lista que videos salieron con
    # problemas para revisarlos antes de publicar.
    v = subprocess.run(
        [sys.executable, str(RAIZ / "verificar_video.py"), str(salida),
         str(fuente)],
        capture_output=True, text=True)
    print(v.stdout.strip())
    return True if v.returncode == 0 else "con_problemas"


def main():
    a = sys.argv[1:]
    solo_nuevos = "--solo-nuevos" in a
    a = [x for x in a if x != "--solo-nuevos"]
    patron = a[0] if a else "guiones/*.json"

    VIDEOS_DIR.mkdir(exist_ok=True)
    candidatos = sorted(p for p in RAIZ.glob(patron)
                         if not p.stem.endswith("-con-voz"))
    if not candidatos:
        print(f"Sin guiones para el patron '{patron}'.")
        return 1

    print(f"=== Produciendo {len(candidatos)} video(s) ===\n")
    ok, fallidos, con_problemas = 0, [], []
    for g in candidatos:
        res = producir_uno(g, solo_nuevos)
        if res == "con_problemas":
            ok += 1
            con_problemas.append(g.stem)
        elif res:
            ok += 1
        else:
            fallidos.append(g.stem)
        print()

    if con_problemas:
        print(f"!!! {len(con_problemas)} video(s) pasaron el render pero NO el "
              f"control de calidad (revisar antes de publicar):")
        for c in con_problemas:
            print(f"    - {c}")
        print()

    print(f"=== {ok}/{len(candidatos)} producidos ===")
    if fallidos:
        print("Fallidos:", ", ".join(fallidos))
    return 0 if not fallidos else 1


if __name__ == "__main__":
    sys.exit(main())
