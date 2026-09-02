#!/usr/bin/env python3
"""
QA duro (Fase 8, seccion 21 del prompt maestro): todo lo que se puede
comprobar objetivamente con ffprobe/ffmpeg, sin opinar sobre si el
video es bueno. Nada de esto es una "alerta creativa" (eso es Fase 9 /
Director de Retencion) -- son hechos: el archivo existe, tiene audio,
no esta corrupto, no tiene silencios/negros sospechosos, no clipea.

Uso:
    python3 fabrica/qa/checks_duros.py videos/documental/caso-05.mp4

Devuelve JSON por stdout y exit code 0 si no hay PROBLEMAS (puede
haber ALERTAS igual, exit 0). Exit 1 si hay al menos un problema duro.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

UMBRAL_SILENCIO_SOSPECHOSO_SEG = 2.0   # silencio mas largo que esto en la pista de audio -> alerta
UMBRAL_NEGRO_SOSPECHOSO_SEG = 1.0      # pantalla negra mas larga que esto -> alerta (fuera de golpes de corte)
UMBRAL_CLIPPING_DB = -0.5              # volumen maximo mas cerca de 0dB que esto -> posible clipping


@dataclass
class ReporteQA:
    archivo: str
    ok: bool = True
    duracion_seg: float | None = None
    tiene_video: bool = False
    tiene_audio: bool = False
    ancho: int | None = None
    alto: int | None = None
    fps: float | None = None
    volumen_max_db: float | None = None
    volumen_medio_db: float | None = None
    silencios_sospechosos: list = field(default_factory=list)
    pantallas_negras_sospechosas: list = field(default_factory=list)
    problemas: list = field(default_factory=list)   # duro: si hay algo aca, ok=False
    alertas: list = field(default_factory=list)     # heuristico: no baja ok, pero se reporta

    def to_dict(self) -> dict:
        return asdict(self)


def _ffprobe_json(archivo: Path) -> dict:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-print_format", "json",
         "-show_format", "-show_streams", str(archivo)],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        raise RuntimeError(f"ffprobe fallo (archivo corrupto o inexistente): {r.stderr[:400]}")
    return json.loads(r.stdout)


def _detectar_silencios(archivo: Path, umbral_db: str = "-35dB", duracion_min: float = 0.3) -> list[dict]:
    r = subprocess.run(
        ["ffmpeg", "-i", str(archivo), "-af",
         f"silencedetect=noise={umbral_db}:d={duracion_min}", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    salida = r.stderr
    inicios = [float(m) for m in re.findall(r"silence_start:\s*([\d.]+)", salida)]
    fines_dur = re.findall(r"silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)", salida)
    silencios = []
    for i, (fin, dur) in enumerate(fines_dur):
        inicio = inicios[i] if i < len(inicios) else float(fin) - float(dur)
        silencios.append({"inicio": inicio, "fin": float(fin), "duracion": float(dur)})
    return silencios


def _detectar_negros(archivo: Path, duracion_min: float = 0.3) -> list[dict]:
    # pix_th=0.035 (no el default 0.10): la marca de esta serie usa un
    # fondo casi-negro real (PALETA.fondo = #0A0A0C, luma ~0.040) para
    # TODOS los videos -- con el pix_th por defecto, blackdetect
    # marcaba como "pantalla negra sospechosa" el fondo normal de
    # cualquier escena sin texto todavia en pantalla (falso positivo
    # confirmado renderizando fabrica-demo-01: Cronologia con fondo
    # normal aparecia como "negro" antes de que entrara el primer
    # hito). 0.035 deja pasar el fondo de marca pero sigue detectando
    # negro puro real (#000, como el fondo de CifraBeat con
    # dinero=true) y cortes a negro genuinos.
    r = subprocess.run(
        ["ffmpeg", "-i", str(archivo), "-vf",
         f"blackdetect=d={duracion_min}:pic_th=0.98:pix_th=0.035", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    salida = r.stderr
    negros = []
    for m in re.finditer(r"black_start:([\d.]+)\s+black_end:([\d.]+)\s+black_duration:([\d.]+)", salida):
        negros.append({"inicio": float(m.group(1)), "fin": float(m.group(2)), "duracion": float(m.group(3))})
    return negros


def _detectar_volumen(archivo: Path) -> tuple[float | None, float | None]:
    r = subprocess.run(
        ["ffmpeg", "-i", str(archivo), "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    salida = r.stderr
    m_max = re.search(r"max_volume:\s*(-?[\d.]+)\s*dB", salida)
    m_mean = re.search(r"mean_volume:\s*(-?[\d.]+)\s*dB", salida)
    return (float(m_max.group(1)) if m_max else None, float(m_mean.group(1)) if m_mean else None)


def correr_qa(archivo: str) -> ReporteQA:
    ruta = Path(archivo)
    r = ReporteQA(archivo=str(ruta))

    if not ruta.exists():
        r.ok = False
        r.problemas.append("el archivo no existe")
        return r

    try:
        datos = _ffprobe_json(ruta)
    except RuntimeError as e:
        r.ok = False
        r.problemas.append(str(e))
        return r

    r.duracion_seg = float(datos.get("format", {}).get("duration", 0)) or None
    if not r.duracion_seg or r.duracion_seg <= 0:
        r.ok = False
        r.problemas.append("duracion invalida o cero")

    for s in datos.get("streams", []):
        if s.get("codec_type") == "video":
            r.tiene_video = True
            r.ancho = s.get("width")
            r.alto = s.get("height")
            if "r_frame_rate" in s and s["r_frame_rate"] and s["r_frame_rate"] != "0/0":
                num, den = s["r_frame_rate"].split("/")
                r.fps = round(int(num) / int(den), 3) if int(den) else None
        elif s.get("codec_type") == "audio":
            r.tiene_audio = True

    if not r.tiene_video:
        r.ok = False
        r.problemas.append("no tiene pista de video")
    if not r.tiene_audio:
        r.ok = False
        r.problemas.append("no tiene pista de audio")

    # a partir de aca son checks mas caros (decodifican todo el
    # archivo) -- solo tiene sentido correrlos si el archivo esta sano.
    if r.tiene_audio:
        vmax, vmean = _detectar_volumen(ruta)
        r.volumen_max_db, r.volumen_medio_db = vmax, vmean
        if vmax is not None and vmax >= UMBRAL_CLIPPING_DB:
            r.alertas.append(f"volumen maximo {vmax}dB muy cerca de 0dB -- posible clipping")
        if vmean is not None and vmean < -35:
            r.alertas.append(f"volumen medio muy bajo ({vmean}dB) -- puede sonar inaudible en celular")

        silencios = _detectar_silencios(ruta)
        sospechosos = [s for s in silencios if s["duracion"] >= UMBRAL_SILENCIO_SOSPECHOSO_SEG]
        r.silencios_sospechosos = sospechosos
        for s in sospechosos:
            r.alertas.append(f"silencio de {s['duracion']:.1f}s en t={s['inicio']:.1f}s -- revisar si es intencional")

    if r.tiene_video:
        negros = _detectar_negros(ruta)
        sospechosos_negro = [n for n in negros if n["duracion"] >= UMBRAL_NEGRO_SOSPECHOSO_SEG]
        r.pantallas_negras_sospechosas = sospechosos_negro
        for n in sospechosos_negro:
            r.alertas.append(f"pantalla negra de {n['duracion']:.1f}s en t={n['inicio']:.1f}s -- revisar si es un golpe tipo 'negro' intencional o un error")

    return r


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 0
    reporte = correr_qa(sys.argv[1])
    print(json.dumps(reporte.to_dict(), ensure_ascii=False, indent=2))
    return 0 if reporte.ok else 1


if __name__ == "__main__":
    sys.exit(main())
