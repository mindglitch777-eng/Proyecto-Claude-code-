#!/usr/bin/env python3
"""
Engancha audios de voz externos (ElevenLabs) a un guion - CERO TOKENS.

Busca archivos <nombre-del-guion>-vozN.mp3 (N = indice del segmento,
0-based, en la lista 'segmentos' del guion -- los segmentos de
'captura' no llevan voz y se saltean) en la carpeta indicada, y los
engancha via el campo 'voz_archivo' que animador_v9.py ya sabe usar
(la duracion real del audio manda sobre la del guion).

Uso:
    python3 sincronizar_voz.py guiones/07-acordas-hace-anios.json capturas_voz/
    -> escribe guiones/07-acordas-hace-anios-con-voz.json
    -> despues: python3 armar_video.py guiones/07-acordas-hace-anios-con-voz.json
"""
import json
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    guion_path = Path(sys.argv[1])
    carpeta = Path(sys.argv[2])
    cfg = json.loads(guion_path.read_text(encoding="utf-8"))
    stem = guion_path.stem

    faltantes = []
    encontrados = 0
    for i, seg in enumerate(cfg["segmentos"]):
        if "captura" in seg:
            continue  # el producto real se muestra sin voz encima
        if seg.get("quiebre_capitulo"):
            continue  # freeze + silencio total a proposito, sin voz
        candidato = carpeta / f"{stem}-voz{i}.mp3"
        if not candidato.exists():
            candidato = candidato.with_suffix(".wav")
        if candidato.exists():
            seg["voz_archivo"] = str(candidato)
            encontrados += 1
        else:
            faltantes.append(f"{stem}-voz{i}.mp3")

    if faltantes:
        print(f"Faltan {len(faltantes)} audio(s) en {carpeta}:")
        for f in faltantes:
            print(f"  - {f}")
        print("(los que ya estan se van a usar igual si corres armar_video.py "
              "directo, pero el resto queda con duracion adivinada del guion)")

    out = guion_path.with_name(f"{stem}-con-voz.json")
    out.write_text(json.dumps(cfg, indent=2, ensure_ascii=False) + "\n",
                    encoding="utf-8")
    print(f"\nOK: {encontrados} voces enganchadas -> {out}")
    print(f"Ahora: python3 armar_video.py {out}")
    return 1 if faltantes else 0


if __name__ == "__main__":
    sys.exit(main())
