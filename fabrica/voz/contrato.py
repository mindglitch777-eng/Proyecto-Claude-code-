#!/usr/bin/env python3
"""
Contrato de "unidad narrativa" (Fase 1/3) y orquestador de generacion
de voz (Fase 3) para la nueva fabrica.

Regla dura de la especificacion (secciones 10-12 del prompt maestro,
y la leccion real del bug de RebeccaBeach.tsx de esta sesion): CADA
unidad narrativa es UN archivo de audio propio, con su duracion REAL
medida -- nunca un continuo a cortar despues, nunca una duracion
adivinada por caracteres. Este modulo es el unico lugar de la fabrica
donde eso deberia implementarse -- todo lo demas (Director Visual,
Composicion) lo consume ya resuelto.

No reimplementa el motor de sintesis: reusa generar_linea() de
generar_voz_documental_qwen.py (la funcion que ya llama al binario C
de Qwen3-TTS) y _CADENA_REAL de voz_piper.py (la limpieza de audio
que el operador aprobo esta sesion). Si esas dos piezas cambian, este
modulo las sigue automaticamente -- no hay una segunda copia del
comando del motor.

NO CONFIRMADO (ver fabrica/PENDIENTES.md item 1): no se sabe si
qwen3-tts expone timestamps por palabra. Este modulo NO INVENTA esa
capacidad -- expone `timestamps=None` explicito en cada resultado
hasta que se confirme.
"""
from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Literal

RAIZ = Path(__file__).resolve().parents[2]  # raiz del repo
sys.path.insert(0, str(RAIZ))
sys.path.insert(0, str(Path(__file__).parent))

from normalizador import texto_con_narracion_normalizada  # noqa: E402

RolNarrativo = Literal["hook", "dato", "comparacion", "revelacion", "cta", "transicion", "otro"]


@dataclass
class UnidadNarrativa:
    """Una unidad de guion tipada (Fase 1). El Guion (humano o
    conversando con Claude, ver PENDIENTES.md item 5) produce una
    lista de estas; Voz las consume 1 a 1."""
    id: str
    texto: str
    rol: RolNarrativo = "otro"
    moneda_por_defecto: str = "USD"

    def texto_para_tts(self) -> str:
        """El texto ya normalizado (numeros/dinero/% hablados), listo
        para mandar al motor -- nunca se manda `self.texto` crudo."""
        return texto_con_narracion_normalizada(self.texto, self.moneda_por_defecto)


@dataclass
class ClipGenerado:
    """Resultado de generar el audio de UNA unidad narrativa."""
    id: str
    archivo: str          # ruta al mp3 final
    duracion_seg: float   # medida con ffprobe, nunca estimada
    texto_hablado: str    # lo que realmente se le pidio al TTS
    texto_original: str
    timestamps: list | None = None  # None = no confirmado (ver PENDIENTES.md #1)

    def to_dict(self) -> dict:
        return asdict(self)


def _duracion_seg(archivo: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(archivo)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def generar_audio_unidades(
    unidades: list[UnidadNarrativa],
    motor: str,
    modelo: str,
    referencia: str,
    destino_dir: str,
    prefijo: str = "unidad",
) -> list[ClipGenerado]:
    """Genera un archivo de audio por unidad, ya limpio con la cadena
    de voz real, y devuelve la duracion REAL medida de cada uno.

    Requiere el motor Qwen3-TTS compilado + modelo descargado (no
    corre en el sandbox de Claude Code -- pensado para GitHub Actions,
    igual que generar_voz_documental_qwen.py)."""
    from generar_voz_documental_qwen import generar_linea  # motor real, sin duplicar
    from voz_piper import _CADENA_REAL

    destino = Path(destino_dir)
    destino.mkdir(parents=True, exist_ok=True)
    resultados: list[ClipGenerado] = []

    for i, u in enumerate(unidades):
        nombre = f"{prefijo}_{i:03d}_{u.id}"
        wav_crudo = destino / f"{nombre}.wav"
        texto_hablado = u.texto_para_tts()

        ok = generar_linea(motor, modelo, referencia, texto_hablado, wav_crudo)
        if not ok:
            raise RuntimeError(f"Fallo generando audio para unidad {u.id!r}")

        wav_limpio = destino / f"{nombre}-limpio.wav"
        r = subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_crudo),
             "-af", _CADENA_REAL, str(wav_limpio)],
            capture_output=True, text=True,
        )
        if r.returncode != 0:
            raise RuntimeError(f"Fallo limpiando audio de {u.id!r}: {r.stderr[:300]}")

        mp3 = destino / f"{nombre}.mp3"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_limpio),
             "-b:a", "128k", str(mp3)],
            capture_output=True, text=True, check=True,
        )
        wav_crudo.unlink(missing_ok=True)
        wav_limpio.unlink(missing_ok=True)

        resultados.append(ClipGenerado(
            id=u.id, archivo=str(mp3), duracion_seg=_duracion_seg(mp3),
            texto_hablado=texto_hablado, texto_original=u.texto,
        ))

    return resultados


def main() -> int:
    """CLI minima para probar el contrato con un guion de juguete
    (JSON: lista de {id, texto, rol}). Requiere --motor/--modelo/
    --referencia reales (GitHub Actions), no corre local en el
    sandbox."""
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("guion_json", help="Archivo JSON con lista de unidades {id, texto, rol}")
    ap.add_argument("--motor", required=True)
    ap.add_argument("--modelo", required=True)
    ap.add_argument("--referencia", required=True)
    ap.add_argument("--destino", default="fabrica/_salida_voz")
    args = ap.parse_args()

    datos = json.loads(Path(args.guion_json).read_text(encoding="utf-8"))
    unidades = [UnidadNarrativa(**d) for d in datos]
    resultados = generar_audio_unidades(unidades, args.motor, args.modelo, args.referencia, args.destino)
    for r in resultados:
        print(json.dumps(r.to_dict(), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
