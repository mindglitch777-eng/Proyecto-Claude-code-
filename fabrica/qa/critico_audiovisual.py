#!/usr/bin/env python3
"""
Crítico Audiovisual (Ronda 5, orden maestra sección 14). Unifica en un
único formato auditable:

    PROBLEMA -> EVIDENCIA -> SEVERIDAD -> TIPO -> PROPUESTA DE SOLUCIÓN

las tres fuentes de hallazgos que ya existían por separado:

  1. QA duro (checks_duros.py) -- hechos objetivos del mp4 renderizado
     (silencios, pantallas negras, clipping, etc.) -> tipo "Técnica".
  2. Crítica editorial (critica_editorial.py, Ronda 4) -- repetición/
     ritmo/visual/narrativa/audiovisual/coherencia sobre el árbol de
     composición -> se re-mapea a los tipos de esta orden (ver
     `_TIPO_POR_CATEGORIA`).
  3. Director de Retención 2.0 (directores/retencion/, Ronda 5) --
     mapa narrativo + alertas de arco completo, ya vienen serializadas
     en `arbol["analisisRetencion"]["alertas"]` -> tipo "Retención".

No inventa una fuente nueva de análisis -- ES la capa de presentación
unificada que la orden maestra pide, sobre datos que YA se calculan en
otro lado. Sigue siendo 100% HEURÍSTICO (ver critica_editorial.py y
checks_duros.py): nunca se convierte en un score de viralidad ni se
presenta como garantía.

Uso:
    python3 fabrica/qa/critico_audiovisual.py <arbol.json> [--mp4 archivo.mp4] [--registro REGISTRO_JSON]
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from checks_duros import correr_qa as correr_qa_duro  # noqa: E402
from critica_editorial import correr_critica_editorial  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]

# Las 6 categorias de critica_editorial.py se re-mapean a los 6 tipos
# de la orden maestra (Narrativa/Retencion/Edicion/Visual/Audio/
# Tecnica) -- no son identicas 1:1, pero cada categoria vieja encaja
# claramente en una de las nuevas.
_TIPO_POR_CATEGORIA = {
    "repeticion": "Narrativa",
    "ritmo": "Edición",
    "visual": "Visual",
    "narrativa": "Narrativa",
    "audiovisual": "Audio",
    "coherencia": "Edición",
}

_SEVERIDAD_POR_CATEGORIA = {
    "repeticion": "media",
    "ritmo": "media",
    "visual": "baja",
    "narrativa": "alta",
    "audiovisual": "baja",
    "coherencia": "baja",
}

# Propuestas genericas por tipo de alerta conocido -- cuando no hay una
# coincidencia especifica, se devuelve una propuesta honesta de
# "revisar a mano", nunca una inventada especifica que no aplica.
_PROPUESTAS = {
    "mismo golpe de transicion": "agregar ese golpe a evitarGolpes en el proximo intento del ciclo de mejora controlado.",
    "misma categoria de componente": "revisar si el guion puede reordenar unidades, o aceptar la repeticion si es una decision real.",
    "aparece en el texto de": "aplicar composicion/repeticion_datos.ts (reutilizar/derivar consecuencia/omitir destaque) si todavia no se hizo.",
    "misma intencion editorial": "revisar si el Director Visual eligio un componente de intensidad distinta a la esperada para esa unidad (ver anti-repeticion entre videos).",
    "combinacion de estilos": "variar `estilosSugeridos` para una de las escenas repetidas al llamar al Director de Edicion.",
    "hook_debil": "confirmar que la primera unidad tenga esPrimera=true al construir su ContextoUnidad -- el Director de Edicion la clasifica automaticamente como 'enganchar' en ese caso.",
    "promesa_poco_clara": "insertar o dejar una unidad de categoria distinta (contexto) entre el hook y la primera escalada/revelacion.",
    "tramo_sin_evolucion": "agregar un microevento intermedio, o cambiar el componente/estilo de una de las escenas del tramo repetido.",
    "caida_energia_antes_del_climax": "revisar la intensidad de los componentes elegidos en el tramo previo al climax -- deberia escalar, no bajar.",
    "cierre_con_poca_energia": "considerar un componente/golpe de mayor energia para el cierre si el video tuvo tramos intensos antes.",
    "sin_escalada_visible": "marcar alguna unidad intermedia con mayor intensidadComponente o intencion 'construir_tension' antes de la revelacion.",
    "sin ningun motivo registrado": "asegurar que la unidad pase por DirectorEdicion.planificar() en vez de setear el golpe a mano.",
    "demasiado corta para percibirse": "alargar la duracion de audio de esa unidad, o no marcarla como respiracion si no alcanza a sentirse como tal.",
    "no comparten NINGUN estilo": "agregar un estilo puente entre las dos escenas, o confirmar que el quiebre de lenguaje es intencional.",
    "cerca del limite": "acortar el texto o usar un componente con mayor capacidadTexto.",
}

_SEVERIDAD_TECNICA_ALTA = {"problemas"}  # los "problemas" de checks_duros SIEMPRE son severidad alta (rompen el video)


@dataclass
class Hallazgo:
    problema: str
    evidencia: str
    severidad: str  # 'baja' | 'media' | 'alta'
    tipo: str       # 'Narrativa' | 'Retención' | 'Edición' | 'Visual' | 'Audio' | 'Técnica'
    propuesta: str

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class ReporteCriticoAudiovisual:
    arbol_id: str
    hallazgos: list = field(default_factory=list)  # list[Hallazgo]

    def to_dict(self) -> dict:
        return {"arbol_id": self.arbol_id, "total_hallazgos": len(self.hallazgos),
                "hallazgos": [h.to_dict() for h in self.hallazgos]}


def _proponer(texto_alerta: str) -> str:
    for clave, propuesta in _PROPUESTAS.items():
        if clave in texto_alerta:
            return propuesta
    return "revisar manualmente -- no hay una correccion automatica segura conocida para este tipo de hallazgo todavia."


def _hallazgos_de_critica_editorial(arbol_path: str, registro_path: Path | None) -> list[Hallazgo]:
    reporte = correr_critica_editorial(arbol_path, registro_path) if registro_path else correr_critica_editorial(arbol_path)
    hallazgos = []
    for categoria in ("repeticion", "ritmo", "visual", "narrativa", "audiovisual", "coherencia"):
        for alerta in getattr(reporte, categoria):
            hallazgos.append(Hallazgo(
                problema=alerta,
                evidencia=f"detectado por critica_editorial.py, categoria '{categoria}', sobre el arbol de composicion",
                severidad=_SEVERIDAD_POR_CATEGORIA[categoria],
                tipo=_TIPO_POR_CATEGORIA[categoria],
                propuesta=_proponer(alerta),
            ))
    return hallazgos


def _hallazgos_de_retencion(arbol: dict) -> list[Hallazgo]:
    analisis = arbol.get("analisisRetencion")
    if not analisis:
        return []
    hallazgos = []
    for alerta in analisis.get("alertas", []):
        hallazgos.append(Hallazgo(
            problema=alerta["descripcion"],
            evidencia=alerta["razon"],
            severidad=alerta["severidad"],
            tipo="Retención",
            propuesta=_proponer(alerta["tipo"]),
        ))
    return hallazgos


def _hallazgos_de_qa_duro(mp4_path: str) -> list[Hallazgo]:
    reporte = correr_qa_duro(mp4_path)
    hallazgos = []
    for problema in reporte.problemas:
        hallazgos.append(Hallazgo(
            problema=problema,
            evidencia=f"checks_duros.py sobre {mp4_path} (ffprobe/ffmpeg, medicion objetiva)",
            severidad="alta",
            tipo="Técnica",
            propuesta="corregir antes de publicar -- esto es un problema duro, no una alerta heuristica.",
        ))
    for alerta in reporte.alertas:
        hallazgos.append(Hallazgo(
            problema=alerta,
            evidencia=f"checks_duros.py sobre {mp4_path} (ffprobe/ffmpeg, medicion objetiva)",
            severidad="media",
            tipo="Técnica",
            propuesta=_proponer(alerta),
        ))
    return hallazgos


_ORDEN_SEVERIDAD = {"alta": 0, "media": 1, "baja": 2}


def criticar(arbol_path: str, mp4_path: str | None = None, registro_path: Path | None = None) -> ReporteCriticoAudiovisual:
    arbol = json.loads(Path(arbol_path).read_text(encoding="utf-8"))
    hallazgos: list[Hallazgo] = []
    hallazgos.extend(_hallazgos_de_critica_editorial(arbol_path, registro_path))
    hallazgos.extend(_hallazgos_de_retencion(arbol))
    if mp4_path:
        hallazgos.extend(_hallazgos_de_qa_duro(mp4_path))
    hallazgos.sort(key=lambda h: _ORDEN_SEVERIDAD.get(h.severidad, 3))
    return ReporteCriticoAudiovisual(arbol_id=arbol.get("id", "?"), hallazgos=hallazgos)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("arbol_json")
    ap.add_argument("--mp4", default=None)
    ap.add_argument("--registro", default=None)
    args = ap.parse_args()
    reporte = criticar(args.arbol_json, args.mp4, Path(args.registro) if args.registro else None)
    print(json.dumps(reporte.to_dict(), ensure_ascii=False, indent=2))
    return 0  # el critico nunca falla el proceso -- es heuristico, ver docstring


if __name__ == "__main__":
    sys.exit(main())
