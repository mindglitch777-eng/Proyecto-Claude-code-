#!/usr/bin/env python3
"""
Critico Audiovisual v2 -- metricas objetivas (R7-31, prompt "que la
fabrica piense la edicion", seccion 14/20). Responde a la regla dura
del propio prompt: separar SIEMPRE MEDIDO de HIPOTESIS/HEURISTICO,
nunca inventar una metrica de retencion sin datos de publicacion real.

Todo lo que devuelve este modulo es MEDIDO -- calculado directamente
del arbol de composicion (estructura real) y, si se pasa un .mp4, del
reporte real de checks_duros.py. Nada de esto es una prediccion de
"esto va a retener mejor" -- eso seria HIPOTESIS y no se afirma aca.

Reutiliza (no duplica) verificar_categoria_repetida_consecutiva,
verificar_golpe_repetido_consecutivo y verificar_intensidad_plana de
checks_composicion.py -- las alertas de esas funciones SON las
"repeticion"/"pacing plano" medidas, no se reimplementa la logica.

Uso:
    python3 fabrica/qa/critico_v2_metricas.py <arbol.json> [--mp4 archivo.mp4] [--registro REGISTRO_JSON]
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from checks_composicion import (  # noqa: E402
    REGISTRO_DEFAULT,
    verificar_categoria_repetida_consecutiva,
    verificar_golpe_repetido_consecutivo,
    verificar_intensidad_plana,
)
from checks_duros import correr_qa as correr_qa_duro  # noqa: E402


@dataclass
class MetricasCriticoV2:
    arbol_id: str
    # MEDIDO -- estructura real del arbol.
    duracion_total_seg: float
    cantidad_escenas: int
    cantidad_eventos_de_cambio: int = 0  # golpes reales (!= 'ninguno') + microeventos reales
    timestamps_eventos_de_cambio_seg: list[float] = field(default_factory=list)
    duracion_media_bloque_visual_seg: float = 0.0
    duracion_maxima_bloque_visual_seg: float = 0.0
    variedad_componentes: float = 0.0  # componentes distintos / total escenas
    componentes_distintos: int = 0
    variedad_golpes: float = 0.0  # golpes distintos / total escenas
    golpes_distintos: int = 0
    densidades_visuales_en_orden: list[str] = field(default_factory=list)
    densidad_visual_varia: bool = False
    alertas_repeticion_categoria: list[str] = field(default_factory=list)
    alertas_golpe_repetido: list[str] = field(default_factory=list)
    alertas_intensidad_plana: list[str] = field(default_factory=list)
    cantidad_microeventos_cambia_encuadre: int = 0  # R7-31: nuevo mecanismo, contado explicito
    # MEDIDO -- solo si se paso --mp4 (requiere ffprobe/ffmpeg real).
    silencios_sospechosos: int | None = None
    pantallas_negras_sospechosas: int | None = None
    volumen_medio_db: float | None = None
    # HEURISTICO -- una lectura razonada de lo medido, NUNCA una
    # prediccion de retencion real (esa seria HIPOTESIS, y no se afirma
    # sin datos de publicacion, ver regla de honestidad del prompt).
    lectura_heuristica: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


def calcular_metricas(arbol_path: str, mp4_path: str | None = None, registro_path: Path = REGISTRO_DEFAULT) -> MetricasCriticoV2:
    arbol = json.loads(Path(arbol_path).read_text(encoding="utf-8"))
    registro = json.loads(registro_path.read_text(encoding="utf-8"))
    escenas = arbol.get("escenas", [])

    m = MetricasCriticoV2(
        arbol_id=arbol.get("id", "?"),
        duracion_total_seg=arbol.get("duracionTotalSeg", 0.0),
        cantidad_escenas=len(escenas),
    )

    # Eventos de cambio reales: 1 por golpe real (excluye 'ninguno', que
    # es la primera unidad sin corte que marcar) + cada microevento real
    # de cada escena, con su timestamp ABSOLUTO (desdeSeg + relativo) --
    # esto es exactamente lo que el diagnostico real pidio medir
    # ("los cambios estructurales fuertes aparecen aproximadamente en
    # X/Y/Z segundos").
    timestamps: list[float] = []
    componentes = []
    golpes = []
    densidades = []
    cambia_encuadre_count = 0
    for e in escenas:
        desde = e.get("desdeSeg", 0.0)
        golpe = e.get("golpe", "ninguno")
        componentes.append(e.get("componenteId"))
        golpes.append(golpe)
        if golpe != "ninguno":
            timestamps.append(desde)
        estrategia = e.get("estrategiaEdicion") or {}
        if estrategia.get("densidadVisual"):
            densidades.append(estrategia["densidadVisual"])
        for me in estrategia.get("microeventos", []):
            timestamps.append(desde + me.get("enSegRelativo", 0.0))
            if me.get("tipo") == "cambia_encuadre":
                cambia_encuadre_count += 1

    timestamps = sorted(set(round(t, 3) for t in timestamps))
    m.timestamps_eventos_de_cambio_seg = timestamps
    m.cantidad_eventos_de_cambio = len(timestamps)
    m.cantidad_microeventos_cambia_encuadre = cambia_encuadre_count

    if len(timestamps) >= 2:
        bloques = [timestamps[i + 1] - timestamps[i] for i in range(len(timestamps) - 1)]
        m.duracion_media_bloque_visual_seg = round(sum(bloques) / len(bloques), 2)
        m.duracion_maxima_bloque_visual_seg = round(max(bloques), 2)

    m.componentes_distintos = len(set(componentes))
    m.variedad_componentes = round(m.componentes_distintos / len(escenas), 2) if escenas else 0.0
    m.golpes_distintos = len(set(golpes))
    m.variedad_golpes = round(m.golpes_distintos / len(escenas), 2) if escenas else 0.0
    m.densidades_visuales_en_orden = densidades
    m.densidad_visual_varia = len(set(densidades)) > 1

    m.alertas_repeticion_categoria = verificar_categoria_repetida_consecutiva(arbol, registro)
    m.alertas_golpe_repetido = verificar_golpe_repetido_consecutivo(arbol)
    m.alertas_intensidad_plana = verificar_intensidad_plana(arbol)

    if mp4_path and Path(mp4_path).exists():
        reporte_duro = correr_qa_duro(mp4_path)
        m.silencios_sospechosos = len(reporte_duro.silencios_sospechosos)
        m.pantallas_negras_sospechosas = len(reporte_duro.pantallas_negras_sospechosas)
        m.volumen_medio_db = reporte_duro.volumen_medio_db

    # Lectura heuristica -- SIEMPRE explicita como heuristica, nunca
    # como medicion de retencion real (regla de honestidad, seccion 21).
    if m.duracion_maxima_bloque_visual_seg > 6:
        m.lectura_heuristica.append(
            f"HEURISTICO: el bloque visual mas largo entre cambios dura {m.duracion_maxima_bloque_visual_seg}s -- "
            "posible tramo largo sin variacion (no es una medicion de retencion real, es una lectura sobre la estructura)."
        )
    if not m.densidad_visual_varia and len(m.densidades_visuales_en_orden) > 1:
        m.lectura_heuristica.append(
            "HEURISTICO: la densidad visual no varia en ningun punto del video -- posible falta de contraste de energia."
        )
    if m.variedad_componentes < 0.6 and m.cantidad_escenas > 3:
        m.lectura_heuristica.append(
            f"HEURISTICO: solo {m.componentes_distintos} componentes distintos en {m.cantidad_escenas} escenas -- variedad visual baja."
        )

    return m


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("arbol_json")
    ap.add_argument("--mp4", default=None)
    ap.add_argument("--registro", default=str(REGISTRO_DEFAULT))
    args = ap.parse_args()

    m = calcular_metricas(args.arbol_json, args.mp4, Path(args.registro))
    print(json.dumps(m.to_dict(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
