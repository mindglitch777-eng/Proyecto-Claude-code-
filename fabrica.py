#!/usr/bin/env python3
"""
FABRICA DE CONTENIDO v2 - un solo comando, cero tokens, cero IA.

Une en una sola corrida lo que antes eran 5 scripts sueltos que habia
que acordarse de correr en orden. Cada etapa es determinista (Python +
ffmpeg), asi que el lote entero no consume ni un token de Claude Code.

    ETAPA 1  validar     reglas de retencion sobre cada guion
    ETAPA 2  voz         corta el audio unico de ElevenLabs y lo engancha
    ETAPA 3  render      arma el .mp4 (paralelo dentro de cada video)
    ETAPA 4  verificar   mide el archivo final: sync A/V, pantalla
                          muerta, peso, formato
    ETAPA 5  reporte     resumen + estado persistido en state/

QUE RESUELVE DE LA v1 (cada punto costo tiempo real, no son hipotesis)

  * Re-render inutil. Antes cada corrida rehacia los 27 videos aunque
    no hubiera cambiado nada. Ahora se guarda una huella (hash) del
    guion + su voz + el codigo que dibuja; si nada cambio, ese video se
    saltea. En un lote donde tocaste 3 guiones, se renderizan 3, no 27.

  * Fallas parciales caras. Antes, si fallaban 4 videos, se volvia a
    correr el lote completo. Con --solo-fallidos se rehacen unicamente
    esos 4, leyendo el reporte de la corrida anterior.

  * Errores que se descubrian tarde. La validacion de guiones ahora
    corre ANTES de renderizar: un guion roto se detecta en segundos, no
    despues de gastar minutos de render.

  * Videos malos que igual se publicaban. La verificacion del archivo
    final es parte del pipeline, no un paso aparte que hay que
    acordarse de correr.

Uso:
    python3 fabrica.py                       # todo el lote
    python3 fabrica.py "guiones/0*.json"     # un subconjunto
    python3 fabrica.py --voz audio.mp3       # corta y engancha la voz primero
    python3 fabrica.py --solo-fallidos       # solo lo que fallo la vez pasada
    python3 fabrica.py --forzar              # ignora la huella y rehace todo
"""
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).parent
GUIONES = RAIZ / "guiones"
VIDEOS = RAIZ / "videos"
VOZ_DIR = RAIZ / "capturas_voz"
ESTADO = RAIZ / "state" / "fabrica.json"

# Archivos cuyo contenido cambia como se ve un video: si tocas uno,
# todos los videos se rehacen aunque el guion no haya cambiado.
CODIGO_RENDER = ["animador_v9.py", "armar_video.py"]


def sh(cmd, **kw):
    return subprocess.run([str(c) for c in cmd], capture_output=True,
                          text=True, **kw)


def huella_codigo():
    h = hashlib.sha256()
    for nombre in CODIGO_RENDER:
        p = RAIZ / nombre
        if p.exists():
            h.update(p.read_bytes())
    return h.hexdigest()[:16]


def huella_guion(guion_path, cod):
    """Huella de todo lo que determina como sale el video: el guion, los
    audios de voz que usa, y el codigo que dibuja."""
    h = hashlib.sha256()
    h.update(cod.encode())
    h.update(guion_path.read_bytes())
    stem = guion_path.stem
    con_voz = GUIONES / f"{stem}-con-voz.json"
    fuente = con_voz if con_voz.exists() else guion_path
    try:
        cfg = json.loads(fuente.read_text(encoding="utf-8"))
    except Exception:
        return h.hexdigest()[:16]
    for seg in cfg.get("segmentos", []):
        va = seg.get("voz_archivo")
        if va and Path(va).exists():
            h.update(Path(va).read_bytes())
        cap = seg.get("captura")
        if cap and Path(cap).exists():
            h.update(str(Path(cap).stat().st_mtime).encode())
    return h.hexdigest()[:16]


def cargar_estado():
    if ESTADO.exists():
        try:
            return json.loads(ESTADO.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"videos": {}}


def guardar_estado(est):
    ESTADO.parent.mkdir(parents=True, exist_ok=True)
    ESTADO.write_text(json.dumps(est, indent=2, ensure_ascii=False) + "\n",
                      encoding="utf-8")


# ---------------- ETAPA 1: validar ----------------

def etapa_validar(guiones):
    print("\n=== ETAPA 1/5  validar guiones ===")
    malos = []
    for g in guiones:
        r = sh([sys.executable, RAIZ / "validar_hook.py", g])
        if "PROBLEMAS" in r.stdout:
            malos.append(g.stem)
            print(f"  [X] {g.stem}")
            for linea in r.stdout.splitlines():
                if linea.strip().startswith("✗"):
                    print(f"       {linea.strip()}")
    if not malos:
        print(f"  OK: {len(guiones)} guion(es) sin problemas bloqueantes.")
    return malos


# ---------------- ETAPA 2: voz ----------------

def etapa_voz(audio, guiones):
    print("\n=== ETAPA 2/5  voz ===")
    manifest = VOZ_DIR / "manifest_voz_completo.json"
    if audio:
        if not manifest.exists():
            print(f"  ERROR: falta {manifest}. Generalo antes de cortar el audio.")
            return False
        print(f"  cortando {Path(audio).name} en las lineas del manifest...")
        r = sh([sys.executable, RAIZ / "dividir_voz_completo.py", audio,
                manifest, VOZ_DIR])
        print("   ", "\n    ".join(r.stdout.strip().splitlines()[-4:]))
        if r.returncode != 0:
            print("  ERROR al cortar el audio. Se corta la fabrica.")
            return False
    enganchadas = 0
    for g in guiones:
        r = sh([sys.executable, RAIZ / "sincronizar_voz.py", g, VOZ_DIR])
        if r.returncode == 0:
            enganchadas += 1
    print(f"  {enganchadas}/{len(guiones)} guion(es) con voz completa enganchada.")
    return True


# ---------------- ETAPA 3: render ----------------

def etapa_render(guiones, estado, cod, forzar):
    print("\n=== ETAPA 3/5  render ===")
    VIDEOS.mkdir(exist_ok=True)
    hechos, salteados, fallidos = [], [], []
    for g in guiones:
        stem = g.stem
        salida = VIDEOS / f"{stem}.mp4"
        hf = huella_guion(g, cod)
        previo = estado["videos"].get(stem, {})
        if (not forzar and salida.exists() and previo.get("huella") == hf):
            salteados.append(stem)
            print(f"  [=] {stem} sin cambios, se saltea")
            continue

        con_voz = GUIONES / f"{stem}-con-voz.json"
        fuente = con_voz if con_voz.exists() else g
        t0 = time.time()
        r = sh([sys.executable, RAIZ / "armar_video.py", fuente, salida])
        dt = time.time() - t0
        if r.returncode != 0 or not salida.exists():
            fallidos.append(stem)
            print(f"  [X] {stem} fallo el render ({dt:.0f}s)")
            print(f"       {r.stderr.strip()[-300:]}")
            estado["videos"][stem] = {"huella": None, "estado": "render_fallido"}
            continue
        mb = salida.stat().st_size / 1048576
        print(f"  [OK] {stem}  {dt:5.0f}s  {mb:5.1f} MB")
        hechos.append(stem)
        estado["videos"][stem] = {"huella": hf, "estado": "renderizado",
                                   "segundos": round(dt, 1)}
    return hechos, salteados, fallidos


# ---------------- ETAPA 4: verificar ----------------

def etapa_verificar(stems, estado):
    print("\n=== ETAPA 4/5  control de calidad ===")
    if not stems:
        print("  (nada nuevo que verificar)")
        return []
    con_problemas = []
    for stem in stems:
        video = VIDEOS / f"{stem}.mp4"
        con_voz = GUIONES / f"{stem}-con-voz.json"
        guion = con_voz if con_voz.exists() else GUIONES / f"{stem}.json"
        r = sh([sys.executable, RAIZ / "verificar_video.py", video, guion])
        print(r.stdout.strip())
        if r.returncode != 0:
            con_problemas.append(stem)
            estado["videos"].setdefault(stem, {})["estado"] = "con_problemas"
        else:
            estado["videos"].setdefault(stem, {})["estado"] = "listo"
    return con_problemas


# ---------------- ETAPA 5: reporte ----------------

def etapa_reporte(t0, hechos, salteados, fallidos, con_problemas, malos):
    print("\n=== ETAPA 5/5  reporte ===")
    total = time.time() - t0
    print(f"  Tiempo total: {total/60:.1f} min")
    print(f"  Renderizados: {len(hechos)}   Salteados (sin cambios): {len(salteados)}")
    if malos:
        print(f"  Guiones con problemas de retencion ({len(malos)}): "
              f"{', '.join(malos)}")
    if fallidos:
        print(f"  FALLARON el render ({len(fallidos)}): {', '.join(fallidos)}")
    if con_problemas:
        print(f"  Pasaron el render pero NO el control de calidad "
              f"({len(con_problemas)}): {', '.join(con_problemas)}")
    listos = [s for s in hechos if s not in con_problemas]
    print(f"  LISTOS PARA PUBLICAR: {len(listos) + len(salteados)}")
    if hechos:
        print(f"  Promedio por video: {total/max(1,len(hechos)):.0f}s")
    return 1 if (fallidos or con_problemas) else 0


def main():
    args = sys.argv[1:]
    forzar = "--forzar" in args
    solo_fallidos = "--solo-fallidos" in args
    audio = None
    if "--voz" in args:
        i = args.index("--voz")
        audio = args[i + 1] if i + 1 < len(args) else None
        args = args[:i] + args[i + 2:]
    args = [a for a in args if not a.startswith("--")]
    patron = args[0] if args else "guiones/*.json"

    estado = cargar_estado()
    guiones = sorted(p for p in RAIZ.glob(patron)
                     if not p.stem.endswith("-con-voz"))
    if solo_fallidos:
        malos_previos = {s for s, d in estado["videos"].items()
                         if d.get("estado") in ("render_fallido", "con_problemas")}
        guiones = [g for g in guiones if g.stem in malos_previos]
        print(f"Modo --solo-fallidos: {len(guiones)} video(s) a rehacer.")
    if not guiones:
        print(f"Sin guiones para '{patron}'.")
        return 1

    t0 = time.time()
    print(f"=== FABRICA v2 — {len(guiones)} guion(es) ===")

    malos = etapa_validar(guiones)
    guiones = [g for g in guiones if g.stem not in malos]
    if not guiones:
        print("\nTodos los guiones tienen problemas bloqueantes. No se renderiza.")
        return 1

    if not etapa_voz(audio, guiones):
        return 1

    cod = huella_codigo()
    hechos, salteados, fallidos = etapa_render(guiones, estado, cod, forzar)
    con_problemas = etapa_verificar(hechos, estado)
    guardar_estado(estado)
    return etapa_reporte(t0, hechos, salteados, fallidos, con_problemas, malos)


if __name__ == "__main__":
    sys.exit(main())
