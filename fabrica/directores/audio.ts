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

/** Familias de golpe por nivel de intensidad (Ronda 3 -- antes esto
 * era un mapa 1:1 fijo: "impacto" SIEMPRE daba "fogonazo", "pausa"
 * SIEMPRE "negro", etc. Bug real encontrado mirando fabrica-demo-03:
 * de los 9 tipos reales de golpes.tsx, "desliza", "iris" y "cortina"
 * NUNCA se elegian -- ningun camino del codigo llegaba a ellos. Eso
 * es la causa mecanica de la sensacion de "pantalla desaparece ->
 * pantalla aparece" siempre igual que señalo el operador viendo el
 * video: no es que el golpe este mal, es que siempre es EL MISMO
 * dentro de cada nivel.
 *
 * Cada nivel ahora tiene una lista ordenada por preferencia (el
 * primero es el que se elige por defecto, IDENTICO al comportamiento
 * viejo si no se pide evitar nada -- no rompe los tests existentes).
 * `elegirGolpe()` recorre la lista y devuelve el primero que no este
 * en `evitarGolpes` (mismo principio de anti-repeticion que ya usa
 * DirectorVisual, no un sistema nuevo). */
const GOLPES_POR_NIVEL: Record<NivelIntensidad, TipoGolpe[]> = {
  calma: ['fundido', 'iris'],
  tension: ['raya', 'cortina'],
  aceleracion: ['corte', 'desliza'],
  impacto: ['fogonazo', 'sacudon'],
  pausa: ['negro', 'fundido'],
  revelacion: ['sacudon', 'fogonazo', 'iris'],
};

function elegirGolpe(nivel: NivelIntensidad, evitarGolpes: TipoGolpe[]): TipoGolpe {
  const candidatos = GOLPES_POR_NIVEL[nivel];
  const libre = candidatos.find((g) => !evitarGolpes.includes(g));
  return libre ?? candidatos[0]; // si estan todos "usados", mejor repetir que romper
}

const VOLUMEN_POR_NIVEL: Record<NivelIntensidad, number> = {
  calma: 0,
  tension: 0.55,
  aceleracion: 0.6,
  impacto: 0.9,
  pausa: 0.5,
  revelacion: 0.85,
};

/** R7-22: escala DISTINTA de VOLUMEN_POR_NIVEL -- esa es volumen de
 * SFX de un golpe puntual (calma=0, sin sonido); esta es que tan
 * "intensa" tiene que sentirse la MUSICA DE FONDO del video en ese
 * tramo, para consultar fabrica/musica/resolver_musica.py (escala
 * 0-1, ver fabrica/musica/biblioteca.json). calma/pausa no son 0 aca
 * porque un video sin musica de fondo en absoluto durante una pausa se
 * siente vacio, no tranquilo -- solo el volumen SFX de un golpe
 * puntual tiene sentido en 0. */
const NIVEL_A_INTENSIDAD_MUSICA: Record<NivelIntensidad, number> = {
  calma: 0.15,
  pausa: 0.25,
  tension: 0.45,
  aceleracion: 0.6,
  revelacion: 0.75,
  impacto: 0.85,
};

/** Musica de fondo se elige UNA sola vez para todo el video (ver
 * fabrica/musica/README.md) -- no tiene sentido cambiar de track cada
 * pocos segundos. El generador junta todas las `DecisionAudio` reales
 * de decidirParaUnidad() y le pasa el promedio a resolver_musica.py. */
export function intensidadMusicaPromedio(decisiones: DecisionAudio[]): number {
  if (!decisiones.length) return 0.5;
  const suma = decisiones.reduce((acc, d) => acc + NIVEL_A_INTENSIDAD_MUSICA[d.nivel], 0);
  return suma / decisiones.length;
}

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
    /** Golpes usados en las ultimas unidades de ESTE video (Ronda 3) --
     * mismo principio que `evitar` en DirectorVisual.consultar(), para
     * que dos escalas seguidas de "impacto" no caigan siempre en
     * "fogonazo" solo porque las dos son impacto. */
    evitarGolpes?: TipoGolpe[];
  }): DecisionAudio {
    const {indice, total, intensidadVisual, esRevelacion, esCierre, evitarGolpes = []} = params;

    if (esRevelacion) {
      return {
        nivel: 'revelacion', golpeSugerido: elegirGolpe('revelacion', evitarGolpes),
        volumenSfxSugerido: VOLUMEN_POR_NIVEL.revelacion, musicaSugerida: null,
        razon: 'unidad marcada como revelacion/giro por el guion -> golpe fuerte',
      };
    }
    if (esCierre) {
      return {
        nivel: 'pausa', golpeSugerido: elegirGolpe('pausa', evitarGolpes),
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
      nivel, golpeSugerido: elegirGolpe(nivel, evitarGolpes),
      volumenSfxSugerido: VOLUMEN_POR_NIVEL[nivel], musicaSugerida: null,
      razon: `intensidadVisual=${intensidadVisual}, progreso=${progreso.toFixed(2)} -> nivel ${nivel}`,
    };
  }
}
