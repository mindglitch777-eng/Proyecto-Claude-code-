#!/usr/bin/env python3
"""
Critica Editorial (Ronda 4, seccion 19 de la orden maestra). Distinta
de checks_composicion.py: aquella verifica cosas TECNICAS del arbol
(assets, presupuesto de texto, duracion); esta evalua las DECISIONES
DE EDICION en si -- lo que el Director de Edicion (fabrica/directores/
edicion/) decidio para cada escena, cuando esa informacion esta
disponible en el arbol (`escena.estrategiaEdicion`, Ronda 4, opcional).

Organizada en las 6 categorias que pide la orden maestra:
REPETICION, RITMO, VISUAL, NARRATIVA, AUDIOVISUAL, COHERENCIA.

Regla dura, no negociable (seccion 19 in fine): TODO lo que este
modulo produce es HEURISTICO. Nunca se presenta como "el video sera
viral" ni como una prueba de calidad real -- son señales para que un
humano revise, igual que checks_composicion.py. `ok` siempre es True:
esto NUNCA bloquea un render ni un pipeline, solo informa.

Un arbol SIN `estrategiaEdicion` en sus escenas (generado con
generar_demo_01/02/03/04.ts, que no pasan por el Director de Edicion)
sigue siendo evaluable -- las categorias que dependen de esa
informacion simplemente no producen alertas (no hay forma honesta de
criticar una decision que nunca se tomo explicitamente), documentado
como limitacion, no fingido como cubierto.
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]

sys.path.insert(0, str(Path(__file__).parent))
from checks_composicion import (  # noqa: E402
    verificar_categoria_repetida_consecutiva,
    verificar_cifra_repetida_en_texto,
    verificar_golpe_repetido_consecutivo,
)

DURACION_ESTATICA_SOSPECHOSA_SEG = 8.0
DURACION_PAUSA_MINIMA_PERCEPTIBLE_SEG = 1.0
RACHA_ACELERADA_MIN_ESCENAS = 3
DURACION_ACELERADA_SEG = 2.0


@dataclass
class ReporteCriticaEditorial:
    arbol_id: str
    ok: bool = True  # SIEMPRE True -- esto nunca bloquea, ver docstring
    repeticion: list = field(default_factory=list)
    ritmo: list = field(default_factory=list)
    visual: list = field(default_factory=list)
    narrativa: list = field(default_factory=list)
    audiovisual: list = field(default_factory=list)
    coherencia: list = field(default_factory=list)

    def alertas(self) -> list[str]:
        return self.repeticion + self.ritmo + self.visual + self.narrativa + self.audiovisual + self.coherencia

    def to_dict(self) -> dict:
        d = asdict(self)
        d["total_alertas"] = len(self.alertas())
        return d


def _estrategia(escena: dict) -> dict | None:
    return escena.get("estrategiaEdicion")


def _con_estrategia(escenas: list[dict]) -> list[dict]:
    return [e for e in escenas if _estrategia(e)]


# ─────────────────────────────── REPETICION ───────────────────────────────

def _repeticion_intencion_consecutiva(escenas: list[dict]) -> list[str]:
    alertas = []
    for i in range(1, len(escenas)):
        ea, eb = _estrategia(escenas[i - 1]), _estrategia(escenas[i])
        if not ea or not eb:
            continue
        if ea["intencion"] == eb["intencion"]:
            alertas.append(
                f"escenas '{escenas[i-1]['unidadId']}' y '{escenas[i]['unidadId']}' seguidas tienen "
                f"la misma intencion editorial ({eb['intencion']!r}) -- revisar si es una decision "
                f"real o el mismo tratamiento repetido sin variacion"
            )
    return alertas


def _repeticion_combinacion_estilos(escenas: list[dict]) -> list[str]:
    """3+ escenas SEGUIDAS con exactamente la misma combinacion de
    estilos (mismo orden) es la formula repetitiva de lenguaje visual
    que la seccion 9 de la orden pide evitar ('no quiero que todos los
    videos parezcan la misma plantilla con diferentes datos')."""
    alertas = []
    con_estrategia = [(e["unidadId"], tuple(_estrategia(e)["estilos"])) for e in escenas if _estrategia(e)]
    racha_inicio = 0
    for i in range(1, len(con_estrategia) + 1):
        mismo = i < len(con_estrategia) and con_estrategia[i][1] == con_estrategia[racha_inicio][1]
        if not mismo:
            largo = i - racha_inicio
            if largo >= 3:
                nombres = ", ".join(u for u, _ in con_estrategia[racha_inicio:i])
                alertas.append(
                    f"{largo} escenas seguidas ({nombres}) usan exactamente la misma combinacion de "
                    f"estilos {con_estrategia[racha_inicio][1]} -- posible plantilla repetitiva, "
                    f"revisar variedad de lenguaje visual"
                )
            racha_inicio = i
    return alertas


# ─────────────────────────────── RITMO ───────────────────────────────

def _ritmo_tramo_estatico(escenas: list[dict]) -> list[str]:
    alertas = []
    for e in escenas:
        est = _estrategia(e)
        if not est:
            continue
        if e["duracionSeg"] > DURACION_ESTATICA_SOSPECHOSA_SEG and len(est.get("microeventos", [])) <= 1:
            alertas.append(
                f"escena '{e['unidadId']}' dura {e['duracionSeg']:.1f}s pero el Director de Edicion "
                f"solo registro {len(est.get('microeventos', []))} microevento(s) -- posible tramo "
                f"estatico, revisar si conviene agregar un cambio interno"
            )
    return alertas


def _ritmo_racha_acelerada(escenas: list[dict]) -> list[str]:
    alertas = []
    racha = 0
    for i, e in enumerate(escenas):
        if e["duracionSeg"] < DURACION_ACELERADA_SEG:
            racha += 1
        else:
            if racha >= RACHA_ACELERADA_MIN_ESCENAS:
                nombres = ", ".join(x["unidadId"] for x in escenas[i - racha:i])
                alertas.append(
                    f"{racha} escenas seguidas ({nombres}) duran menos de {DURACION_ACELERADA_SEG}s cada "
                    f"una -- tramo muy acelerado, confirmar que es una decision de ritmo y no una "
                    f"consecuencia no intencional del guion"
                )
            racha = 0
    return alertas


def _ritmo_energia_plana(escenas: list[dict]) -> list[str]:
    con_estrategia = _con_estrategia(escenas)
    energias = [_estrategia(e)["energia"] for e in con_estrategia]
    if len(energias) >= 4 and len(set(energias)) == 1:
        return [f"las {len(energias)} escenas con estrategia editorial tienen la misma energia "
                f"({energias[0]!r}) de principio a fin -- sin arco de intensidad real"]
    return []


# ─────────────────────────────── VISUAL ───────────────────────────────

def _visual_densidad_sin_espacio(escenas: list[dict], registro_por_id: dict) -> list[str]:
    alertas = []
    for e in escenas:
        est = _estrategia(e)
        comp = registro_por_id.get(e["componenteId"])
        if not est or not comp:
            continue
        if est["densidadVisual"] == "densa" and comp.get("capacidadTexto") == "larga":
            alertas.append(
                f"escena '{e['unidadId']}' combina densidadVisual='densa' con un componente de "
                f"capacidadTexto='larga' -- riesgo real de sobrecargar la pantalla, revisar"
            )
    return alertas


def _visual_sin_estrategia(escenas: list[dict]) -> list[str]:
    sin = [e["unidadId"] for e in escenas if not _estrategia(e)]
    if sin and len(sin) < len(escenas):
        return [f"{len(sin)} de {len(escenas)} escenas no tienen estrategiaEdicion (generadas sin pasar "
                f"por el Director de Edicion: {', '.join(sin)}) -- la critica editorial no puede "
                f"evaluar jerarquia/ritmo para esas escenas puntuales"]
    return []


# ─────────────────────────────── NARRATIVA ───────────────────────────────

def _narrativa_hook_debil(escenas: list[dict]) -> list[str]:
    if not escenas:
        return []
    est = _estrategia(escenas[0])
    if est and est["intencion"] != "enganchar":
        return [f"la primera escena ('{escenas[0]['unidadId']}') tiene intencion "
                f"'{est['intencion']}' en vez de 'enganchar' -- revisar si el hook tiene suficiente fuerza"]
    return []


def _narrativa_cierre_debil(escenas: list[dict]) -> list[str]:
    if not escenas:
        return []
    est = _estrategia(escenas[-1])
    if est and est["intencion"] != "cerrar":
        return [f"la ultima escena ('{escenas[-1]['unidadId']}') tiene intencion "
                f"'{est['intencion']}' en vez de 'cerrar' -- revisar si el cierre se siente resuelto"]
    return []


def _narrativa_sin_revelacion(escenas: list[dict]) -> list[str]:
    con_estrategia = _con_estrategia(escenas)
    if not con_estrategia:
        return []
    if not any(_estrategia(e)["intencion"] == "revelar" for e in con_estrategia):
        return ["ninguna escena tiene intencion 'revelar' -- si el guion tiene un giro/revelacion, "
                "confirmar que se marco esRevelacion al generar la estrategia"]
    return []


# ─────────────────────────────── AUDIOVISUAL ───────────────────────────────

def _audiovisual_transicion_sin_motivo(escenas: list[dict]) -> list[str]:
    alertas = []
    for e in escenas:
        est = _estrategia(e)
        if not est:
            continue
        motivo = est.get("transicion", {}).get("motivo", "")
        if e.get("golpe") not in (None, "ninguno") and not motivo.strip():
            alertas.append(f"escena '{e['unidadId']}' usa golpe '{e['golpe']}' sin ningun motivo "
                            f"registrado en la estrategia -- toda transicion importante deberia poder explicarse")
    return alertas


def _audiovisual_pausa_imperceptible(escenas: list[dict]) -> list[str]:
    alertas = []
    for e in escenas:
        est = _estrategia(e)
        if est and est.get("respiracion") and e["duracionSeg"] < DURACION_PAUSA_MINIMA_PERCEPTIBLE_SEG:
            alertas.append(f"escena '{e['unidadId']}' esta marcada como respiracion/pausa pero dura "
                            f"solo {e['duracionSeg']:.2f}s -- puede ser demasiado corta para percibirse como un respiro real")
    return alertas


# ─────────────────────────────── COHERENCIA ───────────────────────────────

def _coherencia_cambio_estilo_sin_puente(escenas: list[dict]) -> list[str]:
    alertas = []
    for i in range(1, len(escenas)):
        ea, eb = _estrategia(escenas[i - 1]), _estrategia(escenas[i])
        if not ea or not eb:
            continue
        if not (set(ea["estilos"]) & set(eb["estilos"])):
            alertas.append(
                f"escenas '{escenas[i-1]['unidadId']}' ({'+'.join(ea['estilos'])}) y "
                f"'{escenas[i]['unidadId']}' ({'+'.join(eb['estilos'])}) no comparten NINGUN estilo -- "
                f"cambio de lenguaje visual total, confirmar que es intencional y no un salto brusco"
            )
    return alertas


def correr_critica_editorial(arbol_path: str, registro_path: Path | None = None) -> ReporteCriticaEditorial:
    arbol = json.loads(Path(arbol_path).read_text(encoding="utf-8"))
    escenas = arbol.get("escenas", [])
    registro_path = registro_path or (Path(__file__).resolve().parents[1] / "componentes/registro.json")
    registro = json.loads(registro_path.read_text(encoding="utf-8"))
    registro_por_id = {c["id"]: c for c in registro}

    r = ReporteCriticaEditorial(arbol_id=arbol.get("id", "?"))

    r.repeticion.extend(_repeticion_intencion_consecutiva(escenas))
    r.repeticion.extend(_repeticion_combinacion_estilos(escenas))
    r.repeticion.extend(verificar_categoria_repetida_consecutiva(arbol, registro))
    r.repeticion.extend(verificar_golpe_repetido_consecutivo(arbol))
    r.repeticion.extend(verificar_cifra_repetida_en_texto(arbol))

    r.ritmo.extend(_ritmo_tramo_estatico(escenas))
    r.ritmo.extend(_ritmo_racha_acelerada(escenas))
    r.ritmo.extend(_ritmo_energia_plana(escenas))

    r.visual.extend(_visual_densidad_sin_espacio(escenas, registro_por_id))
    r.visual.extend(_visual_sin_estrategia(escenas))

    r.narrativa.extend(_narrativa_hook_debil(escenas))
    r.narrativa.extend(_narrativa_cierre_debil(escenas))
    r.narrativa.extend(_narrativa_sin_revelacion(escenas))

    r.audiovisual.extend(_audiovisual_transicion_sin_motivo(escenas))
    r.audiovisual.extend(_audiovisual_pausa_imperceptible(escenas))

    r.coherencia.extend(_coherencia_cambio_estilo_sin_puente(escenas))

    return r


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("arbol_json")
    ap.add_argument("--registro", default=None)
    args = ap.parse_args()
    reporte = correr_critica_editorial(args.arbol_json, Path(args.registro) if args.registro else None)
    print(json.dumps(reporte.to_dict(), ensure_ascii=False, indent=2))
    return 0  # nunca falla el proceso -- esto es heuristico, ver docstring


if __name__ == "__main__":
    sys.exit(main())
