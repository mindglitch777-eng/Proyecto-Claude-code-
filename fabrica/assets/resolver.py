#!/usr/bin/env python3
"""
Resolver de assets (Fase 6). Dado "necesito representar X", busca en
las carpetas YA CURADAS del repo (assets/biblioteca, assets/personas,
assets/metraje_video), evalua relevancia por superposicion de palabras
clave contra fabrica/assets/tags.json, y devuelve:

  - un match, si supera el umbral de relevancia; o
  - FALTANTE explicito, si no hay nada suficientemente bueno.

Regla dura de la seccion 14: preferible ASSET FALTANTE a ASSET
INCORRECTO -- este modulo NUNCA devuelve "lo mas parecido aunque sea
malo" como si fuera un match real. El llamador decide que hacer con un
FALTANTE (generar con IA, pedir al operador, omitir el componente).

Personas reales (assets/personas/<slug>/) se resuelven por SLUG EXACTO
(no por busqueda difusa) -- son casos documentales puntuales, no
"una foto de alguien parecido".
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
ASSETS_DIR = RAIZ / "assets"
TAGS_PATH = Path(__file__).parent / "tags.json"

UMBRAL_RELEVANCIA = 1  # minimo de palabras clave en comun para aceptar un match


@dataclass
class ResultadoAsset:
    encontrado: bool
    tipo: str | None = None          # 'foto' | 'video' | None
    ruta: str | None = None
    carpeta: str | None = None
    score: int = 0
    razon: str = ""

    def to_dict(self) -> dict:
        return {"encontrado": self.encontrado, "tipo": self.tipo, "ruta": self.ruta,
                "carpeta": self.carpeta, "score": self.score, "razon": self.razon}


def _tokenizar(texto: str) -> set[str]:
    """Palabras significativas en minuscula, sin puntuacion, sin
    palabras vacias demasiado cortas."""
    palabras = re.findall(r"[a-záéíóúñ]+", texto.lower())
    vacias = {"de", "la", "el", "los", "las", "un", "una", "con", "en", "y", "a", "que", "para", "su"}
    return {p for p in palabras if p not in vacias and len(p) > 2}


def _cargar_tags() -> dict:
    return json.loads(TAGS_PATH.read_text(encoding="utf-8"))


def resolver_persona(slug: str) -> ResultadoAsset:
    """Caso documental puntual: busca la foto exacta de esa persona."""
    carpeta = ASSETS_DIR / "personas" / slug
    foto = carpeta / "00.jpg"
    if foto.exists():
        return ResultadoAsset(encontrado=True, tipo="foto", ruta=str(foto), carpeta=slug,
                               score=1, razon=f"foto real de {slug} ya curada en el repo")
    return ResultadoAsset(encontrado=False,
                           razon=f"no existe assets/personas/{slug}/00.jpg -- "
                                 f"correr descargar_foto_persona.py o marcar sin foto")


def resolver_biblioteca(descripcion: str) -> ResultadoAsset:
    """Busca una FOTO de stock en assets/biblioteca por palabras clave."""
    tags = _cargar_tags()["biblioteca"]
    consulta = _tokenizar(descripcion)
    mejor: tuple[str, int] | None = None
    for carpeta, etiquetas in tags.items():
        tags_carpeta = set()
        for et in etiquetas:
            tags_carpeta |= _tokenizar(et)
        score = len(consulta & tags_carpeta)
        if score > 0 and (mejor is None or score > mejor[1]):
            mejor = (carpeta, score)

    if mejor is None or mejor[1] < UMBRAL_RELEVANCIA:
        return ResultadoAsset(encontrado=False,
                               razon=f"ninguna carpeta de biblioteca supera el umbral de relevancia "
                                     f"({UMBRAL_RELEVANCIA}) para {descripcion!r}")

    carpeta, score = mejor
    archivo = ASSETS_DIR / "biblioteca" / carpeta / "00.jpg"
    if not archivo.exists():
        return ResultadoAsset(encontrado=False,
                               razon=f"la carpeta {carpeta!r} matcheo pero no tiene 00.jpg -- revisar")
    return ResultadoAsset(encontrado=True, tipo="foto", ruta=str(archivo), carpeta=carpeta,
                           score=score, razon=f"{score} palabra(s) clave en comun con {carpeta!r}")


def resolver_metraje(descripcion: str) -> ResultadoAsset:
    """Busca un CLIP DE VIDEO en assets/metraje_video por palabras clave."""
    tags = _cargar_tags()["metraje_video"]
    consulta = _tokenizar(descripcion)
    mejor: tuple[str, int] | None = None
    for carpeta, etiquetas in tags.items():
        tags_carpeta = set()
        for et in etiquetas:
            tags_carpeta |= _tokenizar(et)
        score = len(consulta & tags_carpeta)
        if score > 0 and (mejor is None or score > mejor[1]):
            mejor = (carpeta, score)

    if mejor is None or mejor[1] < UMBRAL_RELEVANCIA:
        return ResultadoAsset(encontrado=False,
                               razon=f"ninguna categoria de metraje supera el umbral de relevancia "
                                     f"({UMBRAL_RELEVANCIA}) para {descripcion!r}")

    carpeta, score = mejor
    clips = sorted((ASSETS_DIR / "metraje_video" / carpeta).glob("*.mp4"))
    if not clips:
        return ResultadoAsset(encontrado=False,
                               razon=f"la categoria {carpeta!r} matcheo pero no tiene clips .mp4")
    return ResultadoAsset(encontrado=True, tipo="video", ruta=str(clips[0]), carpeta=carpeta,
                           score=score, razon=f"{score} palabra(s) clave en comun con {carpeta!r} "
                                               f"({len(clips)} clip(s) disponibles)")


def resolver(descripcion: str, persona_slug: str | None = None,
             preferir: str = "foto") -> ResultadoAsset:
    """Punto de entrada general (seccion 14, paso a paso):
    1. si es una persona real puntual -> resolver_persona (exacto)
    2. si no, busca en biblioteca (foto) o metraje_video (video) segun `preferir`
    3. si preferir falla, prueba el otro tipo antes de rendirse
    4. si nada supera el umbral -> FALTANTE explicito
    """
    if persona_slug:
        return resolver_persona(persona_slug)

    primero, segundo = (resolver_biblioteca, resolver_metraje) if preferir == "foto" else (resolver_metraje, resolver_biblioteca)
    r = primero(descripcion)
    if r.encontrado:
        return r
    r2 = segundo(descripcion)
    if r2.encontrado:
        return r2
    return ResultadoAsset(encontrado=False,
                           razon=f"FALTANTE: ni biblioteca ni metraje_video tienen algo relevante "
                                 f"para {descripcion!r} ({r.razon}; {r2.razon})")


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 0
    descripcion = " ".join(sys.argv[1:])
    r = resolver(descripcion)
    print(json.dumps(r.to_dict(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
