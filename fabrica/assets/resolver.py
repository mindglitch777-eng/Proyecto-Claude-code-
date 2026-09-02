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

UMBRAL_RELEVANCIA = 1.0  # score minimo (ver _frecuencia_documento) para aceptar un match
UMBRAL_GENERICA = 3  # una palabra que aparece en >= N carpetas distintas se trata como generica


@dataclass
class ResultadoAsset:
    encontrado: bool
    tipo: str | None = None          # 'foto' | 'video' | None
    ruta: str | None = None
    carpeta: str | None = None
    score: float = 0
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


def _tags_por_carpeta(pool: dict[str, list[str]]) -> dict[str, set[str]]:
    return {carpeta: {t for et in etiquetas for t in _tokenizar(et)} for carpeta, etiquetas in pool.items()}


def _frecuencia_documento(tags_por_carpeta: dict[str, set[str]]) -> dict[str, int]:
    """Cuenta en cuantas carpetas DISTINTAS aparece cada palabra clave.

    Bug real encontrado probando la fabrica (2026-09-02): con umbral
    fijo de 1 palabra en comun, la consulta "modelo de negocio, trabajo
    freelance" matcheaba 'barber-shop-haircut-man-working' con score 1
    -- la unica palabra en comun era "trabajo", que tambien aparece en
    los tags de freelance, oficina, taller, etc. Una palabra que
    aparece en muchas carpetas no es una señal real de relevancia. Las
    palabras "genericas" (en >= UMBRAL_GENERICA carpetas) pesan 0.3 en
    vez de 1 -- un match de UNA sola palabra generica ya no alcanza el
    umbral, pero seguir contando algo evita que una carpeta con una
    palabra generica + una especifica pierda contra otra con una sola
    especifica."""
    frecuencia: dict[str, int] = {}
    for tokens in tags_por_carpeta.values():
        for t in tokens:
            frecuencia[t] = frecuencia.get(t, 0) + 1
    return frecuencia


def _score(consulta: set[str], tokens_carpeta: set[str], frecuencia: dict[str, int]) -> float:
    score = 0.0
    for palabra in consulta & tokens_carpeta:
        es_generica = frecuencia.get(palabra, 0) >= UMBRAL_GENERICA
        score += 0.3 if es_generica else 1.0
    return score


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
    tags_por_carpeta = _tags_por_carpeta(tags)
    frecuencia = _frecuencia_documento(tags_por_carpeta)
    consulta = _tokenizar(descripcion)
    mejor: tuple[str, float] | None = None
    for carpeta, tokens_carpeta in tags_por_carpeta.items():
        score = _score(consulta, tokens_carpeta, frecuencia)
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
                           score=score, razon=f"score {score} (palabras clave en comun, ponderadas) con {carpeta!r}")


def resolver_metraje(descripcion: str) -> ResultadoAsset:
    """Busca un CLIP DE VIDEO en assets/metraje_video por palabras clave."""
    tags = _cargar_tags()["metraje_video"]
    tags_por_carpeta = _tags_por_carpeta(tags)
    frecuencia = _frecuencia_documento(tags_por_carpeta)
    consulta = _tokenizar(descripcion)
    mejor: tuple[str, float] | None = None
    for carpeta, tokens_carpeta in tags_por_carpeta.items():
        score = _score(consulta, tokens_carpeta, frecuencia)
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
                           score=score, razon=f"score {score} (palabras clave en comun, ponderadas) con {carpeta!r} "
                                               f"({len(clips)} clip(s) disponibles)")


def resolver(descripcion: str, persona_slug: str | None = None,
             tipo: str | None = None) -> ResultadoAsset:
    """Punto de entrada general (seccion 14, paso a paso):
    1. si es una persona real puntual -> resolver_persona (exacto)
    2. si `tipo` pide 'foto' o 'video' especificamente, busca SOLO ahi
       (ej. un componente cuyo prop es literalmente un video de fondo
       no tiene sentido resolverlo con una foto)
    3. si no se pide un tipo, se calculan los dos candidatos (biblioteca
       Y metraje) y gana el de MEJOR SCORE, no "el primero que pasa el
       umbral" -- antes de este fix, un match debil en biblioteca podia
       ganarle a uno mas fuerte en metraje solo por evaluarse primero.
    4. si nada supera el umbral -> FALTANTE explicito
    """
    if persona_slug:
        return resolver_persona(persona_slug)

    if tipo == "foto":
        return resolver_biblioteca(descripcion)
    if tipo == "video":
        return resolver_metraje(descripcion)

    r_foto = resolver_biblioteca(descripcion)
    r_video = resolver_metraje(descripcion)
    if r_foto.encontrado and r_video.encontrado:
        return r_foto if r_foto.score >= r_video.score else r_video
    if r_foto.encontrado:
        return r_foto
    if r_video.encontrado:
        return r_video
    return ResultadoAsset(encontrado=False,
                           razon=f"FALTANTE: ni biblioteca ni metraje_video tienen algo relevante "
                                 f"para {descripcion!r} ({r_foto.razon}; {r_video.razon})")


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 0
    tipo = None
    if args and args[0] == "--tipo":
        if len(args) < 3:
            print("Uso: resolver.py --tipo foto|video \"descripcion\"")
            return 1
        tipo = args[1]
        args = args[2:]
    descripcion = " ".join(args)
    r = resolver(descripcion, tipo=tipo)
    print(json.dumps(r.to_dict(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
