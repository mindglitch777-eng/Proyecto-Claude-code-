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
 */
import type {ArbolComposicion, EscenaComposicion, UnidadResuelta} from './tipos';

const AIRE_SEG = 0.25;
const MARGEN_FINAL_SEG = 0.5;

function duracionDeUnidad(u: UnidadResuelta): number {
  if (u.audio) return u.audio.duracionSeg + AIRE_SEG;
  // sin audio real: usar un punto intermedio del rango declarado por
  // el propio componente, nunca un numero inventado aparte -- es la
  // misma fuente de verdad que uso el Director Visual para puntuarlo.
  const [minS, maxS] = u.componente.duracionMinMaxSeg;
  return (minS + maxS) / 2;
}

export function armarComposicion(id: string, unidades: UnidadResuelta[], fps = 30): ArbolComposicion {
  let cursor = 0;
  const escenas: EscenaComposicion[] = unidades.map((u) => {
    const desdeSeg = cursor;
    const duracionSeg = duracionDeUnidad(u);
    cursor += duracionSeg;
    return {
      unidadId: u.id,
      desdeSeg,
      duracionSeg,
      componenteId: u.componente.id,
      props: u.props,
      archivoAudio: u.audio?.archivo ?? null,
      golpe: u.golpe,
      volumenSfx: u.volumenSfx,
    };
  });
  return {id, fps, escenas, duracionTotalSeg: cursor + MARGEN_FINAL_SEG};
}
