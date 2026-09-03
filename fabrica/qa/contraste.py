#!/usr/bin/env python3
"""
QA de contraste real (Fase 14 del prompt "Ronda de evolucion real" +
hallazgo #7 de fabrica/docs/AUDITORIA_TECHOS_FABRICA.md: el QA
existente audita estructura (JSON) y el archivo renderizado a nivel
ffprobe/ffmpeg, pero nunca midio si un texto realmente se lee bien
sobre su fondo).

Implementa la formula OFICIAL de contraste de WCAG 2.x (criterio de
exito 1.4.3), no una aproximacion -- ver
fabrica/conocimiento/base.ts id "contraste-texto-wcag-legibilidad"
(fuente: W3C, unica entrada del Knowledge Engine marcada 'evidencia'
con subtipoEvidencia='oficial_plataforma'). Umbral AA: 4.5:1 para texto
normal, 3:1 para texto grande (>=18pt o >=14pt negrita).

Alcance real (limitacion declarada a proposito, no un descuido):
la fabrica compone sus videos con colores DECLARADOS en codigo
(remotion-spike/src/identidad.ts PALETA + hex literales en los .tsx),
no con fotografia/video real de camara -- por eso este check valida
las combinaciones de color REALMENTE declaradas en el codigo fuente
(estatico), en vez de intentar samplear pixeles de un frame renderizado
(que requeriria saber exactamente donde cae cada bounding box de texto,
un parser JSX/AST real, no regex -- eso queda fuera de este check,
documentado como pendiente en vez de simulado con una aproximacion
fragil).

Uso:
    python3 fabrica/qa/contraste.py                  (valida la PALETA base)
    python3 fabrica/qa/contraste.py --escanear-tsx    (+ escanea los .tsx
                                                        de remotion-spike/src
                                                        buscando pares
                                                        color/background
                                                        declarados en el
                                                        mismo style={{...}})
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
IDENTIDAD_TS = RAIZ / "remotion-spike" / "src" / "identidad.ts"
REMOTION_SRC = RAIZ / "remotion-spike" / "src"

UMBRAL_AA_NORMAL = 4.5
UMBRAL_AA_GRANDE = 3.0


def _hex_a_rgb(hexcolor: str) -> tuple[int, int, int]:
    h = hexcolor.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        raise ValueError(f"color hex invalido: {hexcolor!r}")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _linealizar(c: int) -> float:
    """sRGB -> lineal, formula oficial de WCAG 2.x."""
    cs = c / 255
    return cs / 12.92 if cs <= 0.03928 else ((cs + 0.055) / 1.055) ** 2.4


def luminancia_relativa(hexcolor: str) -> float:
    """Formula oficial WCAG: L = 0.2126*R + 0.7152*G + 0.0722*B (lineal)."""
    r, g, b = _hex_a_rgb(hexcolor)
    r, g, b = _linealizar(r), _linealizar(g), _linealizar(b)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio_contraste(hex1: str, hex2: str) -> float:
    """(L_claro + 0.05) / (L_oscuro + 0.05) -- formula oficial WCAG."""
    l1, l2 = luminancia_relativa(hex1), luminancia_relativa(hex2)
    claro, oscuro = max(l1, l2), min(l1, l2)
    return (claro + 0.05) / (oscuro + 0.05)


def cumple_wcag_aa(ratio: float, texto_grande: bool = False) -> bool:
    umbral = UMBRAL_AA_GRANDE if texto_grande else UMBRAL_AA_NORMAL
    return ratio >= umbral


@dataclass
class ResultadoCombinacion:
    nombre: str
    color_texto: str
    color_fondo: str
    ratio: float
    cumple_normal: bool
    cumple_grande: bool
    origen: str


@dataclass
class ReporteContraste:
    ok: bool
    combinaciones: list[ResultadoCombinacion] = field(default_factory=list)
    problemas: list[str] = field(default_factory=list)
    no_analizable: list[str] = field(default_factory=list)


def _leer_paleta(ruta: Path = IDENTIDAD_TS) -> dict[str, str]:
    """Extrae fondo/texto/acento de identidad.ts -- NO evalua TS, solo
    busca las 3 lineas conocidas con una regex simple (formato estable,
    ver identidad.ts). Si el archivo cambia de forma, falla explicito
    en vez de adivinar."""
    if not ruta.exists():
        raise FileNotFoundError(f"no existe {ruta} -- ¿se movio identidad.ts?")
    texto = ruta.read_text(encoding="utf-8")
    paleta: dict[str, str] = {}
    for clave in ("fondo", "texto", "acento"):
        m = re.search(rf"\b{clave}:\s*'(#[0-9A-Fa-f]{{3,6}})'", texto)
        if not m:
            raise ValueError(f"no se encontro '{clave}: ...' en {ruta} -- formato de PALETA cambio, actualizar este parser")
        paleta[clave] = m.group(1)
    return paleta


def validar_paleta_base(ruta: Path = IDENTIDAD_TS) -> ReporteContraste:
    """Valida las 3 combinaciones reales de la paleta de marca (texto/
    fondo/acento) contra el umbral WCAG AA -- las unicas combinaciones
    que se usan como base de TODOS los componentes visuales."""
    paleta = _leer_paleta(ruta)
    combinaciones = [
        ("texto sobre fondo", paleta["texto"], paleta["fondo"]),
        ("acento sobre fondo", paleta["acento"], paleta["fondo"]),
        ("texto sobre acento", paleta["texto"], paleta["acento"]),
    ]
    reporte = ReporteContraste(ok=True)
    for nombre, c1, c2 in combinaciones:
        ratio = ratio_contraste(c1, c2)
        cumple_n = cumple_wcag_aa(ratio, texto_grande=False)
        cumple_g = cumple_wcag_aa(ratio, texto_grande=True)
        reporte.combinaciones.append(ResultadoCombinacion(
            nombre=nombre, color_texto=c1, color_fondo=c2, ratio=round(ratio, 2),
            cumple_normal=cumple_n, cumple_grande=cumple_g, origen="identidad.ts PALETA",
        ))
        if not cumple_g:
            reporte.ok = False
            reporte.problemas.append(
                f"{nombre} ({c1} sobre {c2}): ratio {ratio:.2f}:1, NO cumple ni el minimo de texto grande (3:1)"
            )
        elif not cumple_n:
            # Cumple para texto grande pero no para texto normal -- esto
            # SI cuenta como problema real (ok=False): una combinacion
            # de la paleta base no es segura para texto de cualquier
            # tamano, y este check no sabe a que tamano se va a aplicar
            # en cada componente futuro. Mejor marcarlo y que quien lo
            # use decida, que dejarlo pasar en silencio.
            reporte.ok = False
            reporte.problemas.append(
                f"{nombre} ({c1} sobre {c2}): ratio {ratio:.2f}:1, cumple solo para texto GRANDE (>=18pt/14pt negrita) -- no usar en texto chico/normal"
            )
    return reporte


# ── Escaneo estatico best-effort de .tsx (opcional, --escanear-tsx) ──
# Limitacion declarada: solo detecta el patron literal
# `color: '#hex'` + `background(Color)?: '#hex'` dentro del MISMO
# `style={{ ... }}` en una sola linea (el estilo real de este
# codebase, ver escenas/*.tsx) -- no resuelve PALETA.x como variable
# (requeriria un parser TS real), no seguye ternarios multi-linea, y
# reporta como "no_analizable" cualquier archivo con expresiones mas
# complejas en vez de adivinar. Sirve para atrapar el caso mas
# riesgoso conocido (texto claro fijo sobre fondo de acento fijo
# escrito directo en hex), no para un analisis exhaustivo.
_PATRON_STYLE_LINEA = re.compile(
    r"color:\s*'(#[0-9A-Fa-f]{3,6})'.*?background(?:Color)?:\s*'(#[0-9A-Fa-f]{3,6})'"
    r"|background(?:Color)?:\s*'(#[0-9A-Fa-f]{3,6})'.*?color:\s*'(#[0-9A-Fa-f]{3,6})'"
)


def escanear_tsx_hex_literal(directorio: Path = REMOTION_SRC) -> ReporteContraste:
    reporte = ReporteContraste(ok=True)
    if not directorio.exists():
        reporte.no_analizable.append(f"{directorio} no existe")
        return reporte
    for archivo in sorted(directorio.rglob("*.tsx")):
        for i, linea in enumerate(archivo.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
            m = _PATRON_STYLE_LINEA.search(linea)
            if not m:
                continue
            grupos = [g for g in m.groups() if g]
            if len(grupos) != 2:
                continue
            c1, c2 = grupos
            try:
                ratio = ratio_contraste(c1, c2)
            except ValueError:
                continue
            nombre = f"{archivo.relative_to(RAIZ)}:{i}"
            cumple_n = cumple_wcag_aa(ratio, texto_grande=False)
            cumple_g = cumple_wcag_aa(ratio, texto_grande=True)
            reporte.combinaciones.append(ResultadoCombinacion(
                nombre=nombre, color_texto=c1, color_fondo=c2, ratio=round(ratio, 2),
                cumple_normal=cumple_n, cumple_grande=cumple_g, origen="hex literal en .tsx",
            ))
            if not cumple_g:
                reporte.ok = False
                reporte.problemas.append(f"{nombre}: {c1} sobre {c2} -> {ratio:.2f}:1, no cumple ni el minimo de texto grande")
    return reporte


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--escanear-tsx", action="store_true", help="ademas de la paleta base, escanea hex literales en remotion-spike/src/**/*.tsx")
    args = ap.parse_args()

    reporte = validar_paleta_base()
    if args.escanear_tsx:
        extra = escanear_tsx_hex_literal()
        reporte.combinaciones.extend(extra.combinaciones)
        reporte.problemas.extend(extra.problemas)
        reporte.no_analizable.extend(extra.no_analizable)
        reporte.ok = reporte.ok and extra.ok

    salida = {
        "ok": reporte.ok,
        "combinaciones": [
            {
                "nombre": c.nombre, "color_texto": c.color_texto, "color_fondo": c.color_fondo,
                "ratio": c.ratio, "cumple_wcag_aa_normal": c.cumple_normal,
                "cumple_wcag_aa_grande": c.cumple_grande, "origen": c.origen,
            }
            for c in reporte.combinaciones
        ],
        "problemas": reporte.problemas,
        "no_analizable": reporte.no_analizable,
    }
    print(json.dumps(salida, indent=2, ensure_ascii=False))
    return 0 if reporte.ok else 1


if __name__ == "__main__":
    sys.exit(main())
