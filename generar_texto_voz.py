#!/usr/bin/env python3
"""
Junta el texto narrado de uno o mas guiones en UN solo archivo para
pegar en ElevenLabs de una sola vez, y escribe el manifest que despues
usa dividir_voz_completo.py para cortar el audio combinado en los
clips individuales que espera cada guion.

POR QUE UN SOLO AUDIO Y NO UNO POR LINEA
    Generar linea por linea en ElevenLabs consume muchas mas
    "generaciones" separadas y el tono varia levemente entre una
    llamada y otra. Un solo audio combinado sale con el mismo tono de
    principio a fin, y dividir_voz_completo.py lo corta despues con
    alineacion por programacion dinamica (ver ese script).

Uso:
    python3 generar_texto_voz.py "guiones/*taller*.json"
    python3 generar_texto_voz.py guiones/taller-mercado-digital.json

Deja:
    capturas_voz/texto_voz_completo.txt      (pegar esto en ElevenLabs)
    capturas_voz/manifest_voz_completo.json  (lo usa dividir_voz_completo.py)
"""
import glob
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
VOZ_DIR = RAIZ / "capturas_voz"


def texto_narrado(seg):
    """Lo mismo que animador_v9.texto_hablado() para el caso comun
    (narracion explicita), sin importar el modulo entero -- animador_v9
    carga fuentes y arma constantes pesadas al importarse, que aca no
    hacen falta para juntar texto."""
    txt = seg.get("narracion") or seg.get("texto") or ""
    # Los asteriscos marcan la palabra clave para el resaltado de los
    # captions ("el que no viene ya *pagó*"); son solo para el video,
    # NO se le leen a ElevenLabs.
    return re.sub(r"\*([^*]+)\*", r"\1", txt).strip()


def procesar(ruta):
    cfg = json.loads(Path(ruta).read_text(encoding="utf-8"))
    stem = Path(ruta).stem
    entradas = []
    for i, seg in enumerate(cfg.get("segmentos", [])):
        txt = texto_narrado(seg)
        if txt:
            entradas.append({"stem": stem, "index": i, "texto": txt})
    return entradas


def main():
    patrones = sys.argv[1:]
    if not patrones:
        print(__doc__)
        return 1
    rutas = []
    for p in patrones:
        rutas += [f for f in glob.glob(p) if not f.endswith("-con-voz.json")]
    rutas = sorted(set(rutas))
    if not rutas:
        print("No hay guiones que coincidan.")
        return 1

    VOZ_DIR.mkdir(exist_ok=True)
    manifest_path = VOZ_DIR / "manifest_voz_completo.json"
    previo = []
    if manifest_path.exists():
        try:
            previo = json.loads(manifest_path.read_text(encoding="utf-8"))
        except Exception:
            previo = []

    stems_nuevos = {Path(r).stem for r in rutas}
    # Se sacan del manifest previo las entradas de los guiones que se
    # estan regenerando ahora (asi correr el script dos veces sobre el
    # mismo guion no lo duplica), y se conservan las de otros guiones
    # de lotes anteriores -- el manifest crece por lote, no se pisa.
    manifest = [e for e in previo if e["stem"] not in stems_nuevos]

    nuevas = []
    for r in rutas:
        entradas = procesar(r)
        nuevas += entradas
        print(f"  [{Path(r).stem}] {len(entradas)} linea(s)")
    manifest += nuevas

    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                             encoding="utf-8")
    # El .txt es solo lo pedido EN ESTA CORRIDA, no todo el historial:
    # si se pega el manifest completo, cada lote nuevo hace releer y
    # gastar cuota de ElevenLabs en guiones de lotes viejos ya grabados
    # (ej. El Corte, hoy de baja prioridad). El manifest si acumula
    # todo, porque dividir_voz_completo.py lo necesita completo para
    # poder cortar cualquier audio combinado que se le pida.
    (VOZ_DIR / "texto_voz_completo.txt").write_text(
        "\n\n".join(e["texto"] for e in nuevas) + "\n", encoding="utf-8")

    total_car = sum(len(e["texto"]) for e in nuevas)
    print(f"\n{len(nuevas)} linea(s) en el .txt para pegar ahora "
          f"({total_car} caracteres). Manifest completo: {len(manifest)} linea(s).")
    print(f"Pegar {VOZ_DIR / 'texto_voz_completo.txt'} en ElevenLabs, "
          f"UN audio para todo, y devolverlo.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
