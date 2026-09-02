#!/usr/bin/env python3
"""
QA sobre el ARBOL DE COMPOSICION (Fase 8/9, ampliando checks_duros.py
que solo mira el mp4 ya renderizado). Dos cosas que NO se pueden ver
mirando el video terminado, pero sí mirando el JSON que
`fabrica/composicion/armar.ts` produce antes de renderizar:

  1. Assets faltantes: un audio referenciado en `escena.audios[]` que
     no existe de verdad en `remotion-spike/public/` -- Remotion no
     rompe el build si un `staticFile()` apunta a un archivo
     inexistente, simplemente esa pista suena en silencio. Es un
     PROBLEMA DURO: si el arbol dice que hay audio ahi, tiene que
     estar. (Los props especificos de un componente, como `clip` de
     Punch, usan su propia convencion de carpeta -- ej. `video/<clip>`
     -- definida DENTRO del componente, no en el arbol. Este check NO
     los cubre: no hay forma honesta de saber esa convencion desde
     afuera sin un mapa por componente que hoy no existe. Documentado
     como limitacion, no fingido como cubierto.)
  2. Texto probablemente demasiado largo para la capacidadTexto
     declarada del componente elegido (`registro.json`): es una
     ALERTA heuristica (contamos caracteres en los props de tipo
     string, no medimos pixeles reales -- eso requeriria renderizar y
     hacer OCR, que no es parte de este chequeo), nunca un problema
     duro.

Y una tercera cosa que sí se puede comparar cruzando el arbol con el
mp4 real (requiere el resultado de checks_duros.py):
  3. Duracion esperada (arbol.duracionTotalSeg) vs duracion real del
     mp4 -- si difieren mas de la tolerancia, la fabrica tiene un bug
     real en como calcula offsets o como Remotion los interpreta (esto
     no deberia pasar nunca por diseño: es PROBLEMA DURO, no alerta).

Uso:
    python3 fabrica/qa/checks_composicion.py <arbol.json> [--public-dir DIR] [--registro REGISTRO_JSON] [--duracion-real SEG]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
PUBLIC_DIR_DEFAULT = RAIZ / "remotion-spike/public"
REGISTRO_DEFAULT = Path(__file__).resolve().parents[1] / "componentes/registro.json"

# Presupuesto de caracteres por capacidadTexto (heuristica, no medido
# en pixeles reales -- ver docstring). "ninguna" no deberia tener texto
# en absoluto; el resto sigue la descripcion textual ya documentada en
# componentes/schema.json ("corta ~1-4 palabras, media ~1 frase, larga
# ~parrafo/lista").
PRESUPUESTO_CHARS = {"ninguna": 0, "corta": 40, "media": 110, "larga": 450}

TOLERANCIA_DURACION_SEG = 1.0


@dataclass
class ReporteQAComposicion:
    arbol_id: str
    ok: bool = True
    problemas: list = field(default_factory=list)
    alertas: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


def _texto_total_de_props(props: dict) -> str:
    partes: list[str] = []

    def _recorrer(v):
        if isinstance(v, str):
            partes.append(v)
        elif isinstance(v, list):
            for it in v:
                _recorrer(it)
        elif isinstance(v, dict):
            for it in v.values():
                _recorrer(it)

    _recorrer(props)
    return " ".join(partes)


def verificar_assets_arbol(arbol: dict, public_dir: Path) -> list[str]:
    problemas = []
    for escena in arbol.get("escenas", []):
        for audio in escena.get("audios", []):
            ruta = public_dir / audio["archivo"]
            if not ruta.exists():
                problemas.append(
                    f"escena '{escena['unidadId']}': audio referenciado {audio['archivo']!r} "
                    f"no existe en {public_dir} -- esa pista sonaria en silencio"
                )
    return problemas


def verificar_texto_capacidad(arbol: dict, registro: list[dict]) -> list[str]:
    por_id = {c["id"]: c for c in registro}
    alertas = []
    for escena in arbol.get("escenas", []):
        comp = por_id.get(escena["componenteId"])
        if not comp:
            continue  # no es responsabilidad de este check (ver validar_registro.ts)
        capacidad = comp.get("capacidadTexto", "media")
        presupuesto = PRESUPUESTO_CHARS.get(capacidad, 110)
        largo = len(_texto_total_de_props(escena.get("props", {})))
        if largo > presupuesto:
            alertas.append(
                f"escena '{escena['unidadId']}' ({escena['componenteId']}, capacidadTexto="
                f"{capacidad!r}): {largo} caracteres de texto en los props, presupuesto "
                f"heuristico ~{presupuesto} -- revisar si se corta o se sale de pantalla"
            )
    return alertas


def verificar_categoria_repetida_consecutiva(arbol: dict, registro: list[dict]) -> list[str]:
    """QA creativo (Ronda 3, item 18 del pedido): dos escenas SEGUIDAS
    de la misma categoria (ej. dos 'cifra' una atras de la otra) son la
    formula repetitiva que el operador señalo -- 'no queremos texto ->
    numero -> grafico -> texto -> numero -> grafico'. Heuristica, no
    error duro: a veces SI tiene sentido (dos cifras relacionadas
    seguidas puede ser una decision real)."""
    por_id = {c["id"]: c for c in registro}
    alertas = []
    escenas = arbol.get("escenas", [])
    for i in range(1, len(escenas)):
        anterior, actual = escenas[i - 1], escenas[i]
        cat_anterior = (por_id.get(anterior["componenteId"]) or {}).get("categoria")
        cat_actual = (por_id.get(actual["componenteId"]) or {}).get("categoria")
        if cat_anterior and cat_anterior == cat_actual:
            alertas.append(
                f"escenas '{anterior['unidadId']}' y '{actual['unidadId']}' seguidas usan la "
                f"misma categoria de componente ({cat_actual!r}) -- revisar si es una decision "
                f"real o formula repetitiva"
            )
    return alertas


def verificar_golpe_repetido_consecutivo(arbol: dict) -> list[str]:
    """Dos escenas seguidas con el MISMO golpe de transicion (ej.
    'fogonazo' dos veces seguidas) refuerzan la sensacion de formula
    mecanica -- ver fabrica/directores/audio.ts, ahora elige entre
    varios golpes por familia de intensidad para evitar esto, pero
    puede seguir pasando si el llamador no pasa `evitarGolpes`."""
    alertas = []
    escenas = arbol.get("escenas", [])
    for i in range(1, len(escenas)):
        anterior, actual = escenas[i - 1], escenas[i]
        if actual.get("golpe") not in (None, "ninguno") and actual.get("golpe") == anterior.get("golpe"):
            alertas.append(
                f"escenas '{anterior['unidadId']}' y '{actual['unidadId']}' seguidas usan el "
                f"mismo golpe de transicion ({actual['golpe']!r}) -- poca variedad de corte"
            )
    return alertas


def verificar_intensidad_plana(arbol: dict) -> list[str]:
    """Si el video entero (3+ escenas) usa un solo tipo de golpe (fuera
    de la primera escena, que suele ir sin golpe), no hay variacion de
    ritmo real -- 'calma -> desarrollo -> aceleracion -> impacto' pedido
    en la seccion 1 no puede sentirse si todo es la misma transicion."""
    escenas = arbol.get("escenas", [])
    golpes = [e.get("golpe") for e in escenas[1:] if e.get("golpe") not in (None, "ninguno")]
    if len(escenas) >= 3 and golpes and len(set(golpes)) == 1:
        return [f"las {len(golpes)} transiciones del video (sin contar la primera escena) son "
                f"todas {golpes[0]!r} -- sin variacion de intensidad/ritmo real"]
    return []


_RE_NUMERO_DESTACADO = re.compile(r"\b\d{1,3}(?:[.,]\d{3})*\b")


def verificar_cifra_repetida_en_texto(arbol: dict) -> list[str]:
    """Un mismo numero (2+ digitos, para no marcar 'un'/'2' sueltos de
    texto corriente) apareciendo en los props de texto de 2+ escenas
    DISTINTAS es la repeticion de cifra que la seccion 5 del pedido
    señala explicitamente ('si ya mostramos 2.847, despues no
    necesitamos volver a mostrarlo de la misma manera'). Ver
    fabrica/composicion/repeticion_datos.ts para la decision real de
    que hacer en el generador -- esto es la RED DE SEGURIDAD que lo
    detecta si igual se coló."""
    apariciones: dict[str, list[str]] = {}
    for escena in arbol.get("escenas", []):
        texto = _texto_total_de_props(escena.get("props", {}))
        for m in _RE_NUMERO_DESTACADO.finditer(texto):
            numero = m.group(0)
            if len(numero.replace(".", "").replace(",", "")) < 2:
                continue
            apariciones.setdefault(numero, [])
            if escena["unidadId"] not in apariciones[numero]:
                apariciones[numero].append(escena["unidadId"])

    alertas = []
    for numero, unidades in apariciones.items():
        if len(unidades) > 1:
            alertas.append(
                f"la cifra '{numero}' aparece en el texto de {len(unidades)} escenas distintas "
                f"({', '.join(unidades)}) -- revisar si cada aparicion cumple una funcion nueva "
                f"o es repeticion sin tratamiento (ver repeticion_datos.ts)"
            )
    return alertas


def verificar_duracion_esperada_vs_real(duracion_esperada_seg: float,
                                         duracion_real_seg: float) -> str | None:
    diferencia = abs(duracion_esperada_seg - duracion_real_seg)
    if diferencia > TOLERANCIA_DURACION_SEG:
        return (f"duracion esperada por el arbol ({duracion_esperada_seg:.2f}s) difiere de la "
                f"duracion real del render ({duracion_real_seg:.2f}s) en {diferencia:.2f}s -- "
                f"mas que la tolerancia ({TOLERANCIA_DURACION_SEG}s); revisar armar.ts o el "
                f"puente de render, esto no deberia pasar por diseño")
    return None


def correr_qa_composicion(arbol_path: str, public_dir: Path = PUBLIC_DIR_DEFAULT,
                           registro_path: Path = REGISTRO_DEFAULT,
                           duracion_real_seg: float | None = None) -> ReporteQAComposicion:
    arbol = json.loads(Path(arbol_path).read_text(encoding="utf-8"))
    registro = json.loads(registro_path.read_text(encoding="utf-8"))
    r = ReporteQAComposicion(arbol_id=arbol.get("id", "?"))

    r.problemas.extend(verificar_assets_arbol(arbol, public_dir))
    r.alertas.extend(verificar_texto_capacidad(arbol, registro))
    r.alertas.extend(verificar_categoria_repetida_consecutiva(arbol, registro))
    r.alertas.extend(verificar_golpe_repetido_consecutivo(arbol))
    r.alertas.extend(verificar_intensidad_plana(arbol))
    r.alertas.extend(verificar_cifra_repetida_en_texto(arbol))

    if duracion_real_seg is not None:
        problema_duracion = verificar_duracion_esperada_vs_real(
            arbol["duracionTotalSeg"], duracion_real_seg)
        if problema_duracion:
            r.problemas.append(problema_duracion)

    r.ok = len(r.problemas) == 0
    return r


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("arbol_json")
    ap.add_argument("--public-dir", default=str(PUBLIC_DIR_DEFAULT))
    ap.add_argument("--registro", default=str(REGISTRO_DEFAULT))
    ap.add_argument("--duracion-real", type=float, default=None)
    args = ap.parse_args()

    reporte = correr_qa_composicion(args.arbol_json, Path(args.public_dir),
                                     Path(args.registro), args.duracion_real)
    print(json.dumps(reporte.to_dict(), ensure_ascii=False, indent=2))
    return 0 if reporte.ok else 1


if __name__ == "__main__":
    sys.exit(main())
