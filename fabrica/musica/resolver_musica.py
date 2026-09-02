#!/usr/bin/env python3
"""
Infra de musica de fondo (item pedido explicitamente: "sin depender de
un servicio pago", $0 hasta que haya ventas). NO inventa musica: hoy
`biblioteca.json` esta vacio a proposito (no hay ningun archivo de
musica real todavia en el repo) -- este modulo es la ESTRUCTURA lista
para recibir una biblioteca real sin rediseñar nada, con la misma
filosofia que `fabrica/assets/resolver.py`: preferible FALTANTE
explicito a "lo mas parecido aunque sea malo".

Por que no hay tracks reales todavia: conseguir musica libre de
derechos real (Jamendo, Free Music Archive) requiere acceso a internet
que esta bloqueado desde este sandbox (mismo problema documentado para
Qwen3-TTS y para el motor viejo en `investigar_musica.py`, que hace
exactamente esta busqueda pero corriendo en un GitHub Actions runner).
Ver `.github/workflows/investigar-musica-fabrica.yml` -- prepara la
busqueda real, queda documentada como pendiente de que el operador la
dispare (misma limitacion de rama que la prueba de Qwen3-TTS, ver
PENDIENTES.md).

Contrato de cada entrada en biblioteca.json:
    {
      "id": "nombre-corto-unico",
      "archivo": "biblioteca/nombre-corto-unico.mp3",
      "mood": ["motivacional", "tenso", ...],   # palabras libres, en espanol
      "intensidad": 0.0-1.0,                     # mismo rango que la intensidad de un componente visual
      "bpm": 120,
      "duracionSeg": 95.0,
      "licencia": "CC-BY 4.0" | "dominio publico" | "royalty-free (Jamendo)" | ...,
      "atribucion": "texto exacto a incluir en creditos, o null si la licencia no lo exige"
    }

Uso como CLI:
    python3 fabrica/musica/resolver_musica.py --intensidad 0.7 --duracion 20 --mood motivacional
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path

RAIZ = Path(__file__).parent
BIBLIOTECA_JSON = RAIZ / "biblioteca.json"


@dataclass
class ResultadoMusica:
    encontrado: bool
    id: str | None = None
    archivo: str | None = None
    licencia: str | None = None
    atribucion: str | None = None
    score: float = 0.0
    razon: str = ""

    def to_dict(self) -> dict:
        return {"encontrado": self.encontrado, "id": self.id, "archivo": self.archivo,
                "licencia": self.licencia, "atribucion": self.atribucion,
                "score": self.score, "razon": self.razon}


def _cargar_biblioteca(ruta: Path = BIBLIOTECA_JSON) -> list[dict]:
    return json.loads(ruta.read_text(encoding="utf-8"))


def _score_track(track: dict, intensidad_deseada: float, mood_deseado: str | None,
                  duracion_minima_seg: float) -> float:
    score = 0.0
    # Intensidad: mismo criterio de proximidad que usa el Director
    # Visual para puntuar componentes (ver fabrica/directores/visual.ts)
    # -- 0 de diferencia es +1.0, se degrada linealmente.
    score += max(0.0, 1.0 - abs(track.get("intensidad", 0.5) - intensidad_deseada))
    if mood_deseado:
        moods = [m.lower() for m in track.get("mood", [])]
        if mood_deseado.lower() in moods:
            score += 1.5
    # Bonus si el track ya cubre la duracion completa sin necesitar
    # loop (un loop mal cortado se nota; preferible evitarlo cuando se
    # pueda, pero NO es un filtro duro -- un track mas corto en loop
    # sigue siendo una opcion valida, section 14: faltante > incorrecto,
    # no aplica aca porque un loop no es "incorrecto", es una tecnica
    # normal de produccion).
    if track.get("duracionSeg", 0) >= duracion_minima_seg:
        score += 0.3
    return score


def resolver_musica(intensidad_deseada: float, duracion_minima_seg: float = 0.0,
                     mood: str | None = None, ruta_biblioteca: Path = BIBLIOTECA_JSON) -> ResultadoMusica:
    biblioteca = _cargar_biblioteca(ruta_biblioteca)
    directorio_base = ruta_biblioteca.parent
    if not biblioteca:
        return ResultadoMusica(
            encontrado=False,
            razon="biblioteca.json esta vacio -- todavia no hay ningun track de musica real "
                  "en el repo (ver PENDIENTES.md: conseguir musica libre de derechos real "
                  "requiere internet, bloqueado en este sandbox; el workflow de investigacion "
                  "esta preparado pero necesita que el operador lo dispare).",
        )

    mejor: tuple[dict, float] | None = None
    for track in biblioteca:
        score = _score_track(track, intensidad_deseada, mood, duracion_minima_seg)
        if mejor is None or score > mejor[1]:
            mejor = (track, score)

    track, score = mejor
    archivo_real = (directorio_base / track["archivo"])
    if not archivo_real.exists():
        return ResultadoMusica(
            encontrado=False,
            razon=f"'{track['id']}' esta en biblioteca.json pero el archivo {track['archivo']!r} "
                  f"no existe en el repo -- entrada de catalogo sin audio real, revisar.",
        )

    return ResultadoMusica(
        encontrado=True, id=track["id"], archivo=track["archivo"],
        licencia=track.get("licencia"), atribucion=track.get("atribucion"),
        score=score, razon=f"score {score:.2f} (intensidad {track.get('intensidad')} vs deseada "
                            f"{intensidad_deseada}, mood {track.get('mood')})",
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--intensidad", type=float, required=True)
    ap.add_argument("--duracion", type=float, default=0.0, help="duracion minima deseada en segundos")
    ap.add_argument("--mood", default=None)
    args = ap.parse_args()
    r = resolver_musica(args.intensidad, args.duracion, args.mood)
    print(json.dumps(r.to_dict(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
