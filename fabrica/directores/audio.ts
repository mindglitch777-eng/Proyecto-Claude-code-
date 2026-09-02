/**
 * Director de Audio (Fase 7). Decide, por unidad narrativa, que golpe
 * de transicion y que intensidad de SFX usar -- sobre el vocabulario
 * REAL que ya existe en remotion-spike/src/escenas/golpes.tsx
 * (TipoGolpe + su mapa SONIDO), no uno inventado nuevo.
 *
 * Musica de fondo: NO IMPLEMENTADO. Es un pendiente de todo el
 * proyecto (state.json ya lo tenia como tarea pendiente antes de esta
 * sesion; investigar_musica.py existe para buscar candidatos con
 * licencia libre pero no se corrio/confirmo ningun resultado
 * concreto). Este Director deja el campo `musicaSugerida` en null a
 * proposito -- ver fabrica/PENDIENTES.md.
 */

/** Mismos 10 valores que TipoGolpe en escenas/golpes.tsx -- se
 * duplica el literal aca (no se importa el .tsx real porque este
 * archivo vive en un paquete Node sin React/Remotion como dependencia,
 * ver README de fabrica/) pero DEBE mantenerse igual; validar_registro
 * -like check pendiente si esto empieza a desincronizarse. */
export type TipoGolpe = 'fogonazo' | 'sacudon' | 'corte' | 'negro' | 'raya' | 'fundido' | 'desliza' | 'iris' | 'cortina' | 'ninguno';

export type NivelIntensidad = 'calma' | 'tension' | 'aceleracion' | 'impacto' | 'pausa' | 'revelacion';

export type DecisionAudio = {
  nivel: NivelIntensidad;
  golpeSugerido: TipoGolpe;
  volumenSfxSugerido: number; // 0-1, referencia -- el golpe real ya trae su propio volumen fijo en golpes.tsx
  musicaSugerida: null; // bloqueado, ver PENDIENTES.md #musica
  razon: string;
};

/** Mapa real de golpe -> intensidad segun el mapa SONIDO de
 * golpes.tsx (fogonazo/sacudon = impacto fuerte 0.85-0.9; corte/
 * desliza = tick suave 0.35-0.55; negro/raya/cortina = whoosh
 * 0.45-0.8; fundido/iris/ninguno = sin sonido). */
const GOLPE_POR_NIVEL: Record<NivelIntensidad, TipoGolpe> = {
  calma: 'fundido',
  tension: 'raya',
  aceleracion: 'corte',
  impacto: 'fogonazo',
  pausa: 'negro',
  revelacion: 'sacudon',
};

const VOLUMEN_POR_NIVEL: Record<NivelIntensidad, number> = {
  calma: 0,
  tension: 0.55,
  aceleracion: 0.6,
  impacto: 0.9,
  pausa: 0.5,
  revelacion: 0.85,
};

export class DirectorAudio {
  /** Deriva un nivel de intensidad para la unidad `indice` de `total`,
   * a partir de la intensidad visual que ya decidio el Director Visual
   * para esa unidad y de si esta marcada como revelacion/giro por el
   * Director de Retencion (ver fabrica/guion/tipos.ts, campo
   * `mecanismoRetencion`). No es una IA analizando el guion -- es una
   * regla explicita, declarada como heuristica. */
  decidirParaUnidad(params: {
    indice: number;
    total: number;
    intensidadVisual: number; // 0-1, la misma que uso el Director Visual
    esRevelacion?: boolean;
    esCierre?: boolean; // ultima unidad del video / CTA
  }): DecisionAudio {
    const {indice, total, intensidadVisual, esRevelacion, esCierre} = params;

    if (esRevelacion) {
      return {
        nivel: 'revelacion', golpeSugerido: GOLPE_POR_NIVEL.revelacion,
        volumenSfxSugerido: VOLUMEN_POR_NIVEL.revelacion, musicaSugerida: null,
        razon: 'unidad marcada como revelacion/giro por el guion -> golpe fuerte',
      };
    }
    if (esCierre) {
      return {
        nivel: 'pausa', golpeSugerido: GOLPE_POR_NIVEL.pausa,
        volumenSfxSugerido: VOLUMEN_POR_NIVEL.pausa, musicaSugerida: null,
        razon: 'ultima unidad / cierre -> golpe de pausa (negro), no de impacto',
      };
    }
    if (indice === 0) {
      return {
        nivel: 'calma', golpeSugerido: 'ninguno',
        volumenSfxSugerido: 0, musicaSugerida: null,
        razon: 'primera unidad del video -> sin golpe (no hay corte que marcar, igual que sonido=false en Golpe.tsx)',
      };
    }

    // regla de escalada simple (seccion 13): la intensidad sube hacia
    // la mitad/cierre si la intensidad visual ya es alta, se acompaña;
    // si es media, se pasa a "aceleracion" en el tramo final del video.
    const progreso = total > 1 ? indice / (total - 1) : 0;
    let nivel: NivelIntensidad;
    if (intensidadVisual >= 0.7) nivel = 'impacto';
    else if (intensidadVisual >= 0.45 && progreso > 0.6) nivel = 'aceleracion';
    else if (intensidadVisual >= 0.45) nivel = 'tension';
    else nivel = 'calma';

    return {
      nivel, golpeSugerido: GOLPE_POR_NIVEL[nivel],
      volumenSfxSugerido: VOLUMEN_POR_NIVEL[nivel], musicaSugerida: null,
      razon: `intensidadVisual=${intensidadVisual}, progreso=${progreso.toFixed(2)} -> nivel ${nivel}`,
    };
  }
}
