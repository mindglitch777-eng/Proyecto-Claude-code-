/**
 * Composicion (Fase 8): convierte una lista de unidades ya resueltas
 * (Director Visual + Director de Audio + Voz, en ese orden) en un
 * arbol con offsets exactos en segundos, listo para el puente de
 * render de Remotion (remotion-spike/src/fabrica_bridge/FabricaVideo.tsx).
 *
 * Regla dura de la especificacion (y leccion real del bug de
 * RebeccaBeach.tsx de la sesion anterior): la duracion de una unidad
 * CON audio es SIEMPRE la duracion real medida de ese audio + un
 * margen de aire fijo -- nunca una duracion inventada. Solo las
 * unidades SIN audio (componente.soportaAudioSincronizado=false)
 * caen al rango aproximado del registro.
 *
 * MULTI-AUDIO (generalizacion del patron AudioCentro de
 * CasoGenerico.tsx, hecha en esta sesion): una unidad puede traer
 * VARIOS clips de audio (ej. una Cronologia con 3 hitos, cada uno con
 * su propia narracion). La duracion de la unidad es la SUMA de todos
 * sus clips + aire entre cada uno; cada clip se posiciona en su
 * offset acumulado DENTRO de la escena. El componente visual se monta
 * UNA sola vez para toda la escena (sigue siendo su misma animacion
 * proporcional interna) -- lo que cambia es que ahora puede sonar mas
 * de un audio durante esa animacion, en vez de uno solo.
 */
import type {ArbolComposicion, EscenaComposicion, UnidadResuelta} from './tipos';

/** Publico a proposito: componentes como Punch necesitan un array
 * `entra` con el offset de cada linea -- para que coincida EXACTO con
 * lo que este modulo va a calcular (y no una copia del numero 0.25
 * puesta a mano en otro archivo), se expone la misma constante. */
export const AIRE_SEG = 0.25;
const MARGEN_FINAL_SEG = 0.5;

function resolverAudios(u: UnidadResuelta): {
  duracionSeg: number;
  audios: EscenaComposicion['audios'];
} {
  if (!u.audios || u.audios.length === 0) {
    // sin audio real: punto intermedio del rango declarado por el
    // propio componente -- misma fuente de verdad que uso el
    // Director Visual para puntuarlo, nunca un numero aparte.
    const [minS, maxS] = u.componente.duracionMinMaxSeg;
    return {duracionSeg: (minS + maxS) / 2, audios: []};
  }
  let cursor = 0;
  const audios: EscenaComposicion['audios'] = u.audios.map((clip) => {
    const desdeSegRelativo = cursor;
    cursor += clip.duracionSeg + AIRE_SEG;
    return {archivo: clip.archivo, desdeSegRelativo, duracionSeg: clip.duracionSeg};
  });
  return {duracionSeg: cursor, audios};
}

export function armarComposicion(id: string, unidades: UnidadResuelta[], fps = 30): ArbolComposicion {
  let cursor = 0;
  const escenas: EscenaComposicion[] = unidades.map((u) => {
    const desdeSeg = cursor;
    const {duracionSeg, audios} = resolverAudios(u);
    cursor += duracionSeg;
    return {
      unidadId: u.id,
      desdeSeg,
      duracionSeg,
      componenteId: u.componente.id,
      props: u.props,
      audios,
      golpe: u.golpe,
      volumenSfx: u.volumenSfx,
    };
  });
  return {id, fps, escenas, duracionTotalSeg: cursor + MARGEN_FINAL_SEG};
}
