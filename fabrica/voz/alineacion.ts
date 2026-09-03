/**
 * Lector real de los resultados de forced-alignment
 * (`fabrica/voz/resultados_alineacion/*.json`, generados por
 * `voz/probar_alineacion.py` corriendo en GitHub Actions -- faster-whisper
 * necesita descargar su modelo de Hugging Face, bloqueado en este
 * sandbox, ver `.github/workflows/probar-alineacion-faster-whisper.yml`).
 *
 * R7-32 (benchmark audiovisual agresivo): el Hook pide una jerarquía
 * visual anclada a la palabra REAL "no" dentro del audio -- esto NUNCA
 * inventa un timestamp, solo lee lo que faster-whisper ya midió. Si el
 * resultado no existe o la palabra no aparece, devuelve `undefined` y
 * el llamador decide un fallback explícito (nunca finge que algo se
 * midió cuando no se midió).
 */
import {existsSync, readFileSync} from 'node:fs';

export type PalabraAlineada = {palabra: string; inicio: number; fin: number};

type ResultadoAlineacion = {
  texto_transcripto: string;
  duracion_audio_seg: number;
  palabras_con_timestamp: PalabraAlineada[];
};

function limpiar(palabra: string): string {
  return palabra.toLowerCase().replace(/[^a-záéíóúñ]/gi, '');
}

/** Busca la PRIMERA aparición de `palabra` (sin distinguir mayúsculas
 * ni puntuación) en el resultado de alineación real. `undefined` si el
 * archivo no existe o la palabra no aparece -- nunca un valor inventado. */
export function buscarPalabraAlineada(rutaResultado: string, palabra: string): PalabraAlineada | undefined {
  if (!existsSync(rutaResultado)) return undefined;
  let resultado: ResultadoAlineacion;
  try {
    resultado = JSON.parse(readFileSync(rutaResultado, 'utf-8'));
  } catch {
    return undefined;
  }
  const objetivo = limpiar(palabra);
  return resultado.palabras_con_timestamp.find((p) => limpiar(p.palabra) === objetivo);
}
