import {execSync} from 'node:child_process';
import path from 'node:path';

/**
 * R7-31: wrapper TS de `detectar_pausas.py` -- mismo patrón execSync
 * ya usado para `resolver_musica.py`/`assets/resolver.py` en los
 * generadores de demo. Devuelve el punto MEDIO de la mejor pausa real
 * detectada dentro de un clip de audio, o `undefined` si no hay
 * ninguna pausa útil (nunca inventa un número).
 *
 * "Útil" = no muy cerca del inicio/fin del clip (una pausa a 0.05s o a
 * 0.05s del final no sirve como punto de cambio visual real -- sería
 * indistinguible de la entrada/salida de la escena, que ya tienen su
 * propio microevento). Se descartan pausas fuera del rango
 * [15%, 85%] de la duración del clip.
 */
export function detectarPausaInterna(rutaWav: string, duracionClipSeg: number): number | undefined {
  try {
    const salida = execSync(
      `python3 "${path.join(__dirname, 'detectar_pausas.py')}" "${rutaWav}"`,
      {encoding: 'utf-8'}
    );
    const r = JSON.parse(salida) as {pausas: {inicio: number; fin: number; duracion: number}[]};
    const min = duracionClipSeg * 0.15;
    const max = duracionClipSeg * 0.85;
    const candidatas = r.pausas
      .map((p) => (p.inicio + p.fin) / 2)
      .filter((medio) => medio >= min && medio <= max);
    if (candidatas.length === 0) return undefined;
    // La pausa mas cercana al centro del clip -- punto de cambio mas
    // "neutral" cuando hay varias candidatas reales.
    const centro = duracionClipSeg / 2;
    candidatas.sort((a, b) => Math.abs(a - centro) - Math.abs(b - centro));
    return candidatas[0];
  } catch {
    return undefined;
  }
}
