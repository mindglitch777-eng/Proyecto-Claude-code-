import type {ComponenteRegistrado} from '../componentes/tipos';
import type {TipoGolpe} from '../directores/audio';

/** Una unidad narrativa ya resuelta: el Director Visual ya eligio el
 * componente, el Director de Audio ya eligio el golpe, y (si aplica)
 * la voz ya genero su audio real. Composicion solo la ubica en el
 * tiempo -- no decide nada de contenido. */
export type UnidadResuelta = {
  id: string;
  componente: ComponenteRegistrado;
  props: Record<string, unknown>;
  /** null = esta unidad no tiene audio propio (ver
   * componente.soportaAudioSincronizado=false) -- la duracion sale de
   * componente.duracionMinMaxSeg en vez de un clip real. */
  audio: {archivo: string; duracionSeg: number} | null;
  golpe: TipoGolpe;
  volumenSfx: number;
};

export type EscenaComposicion = {
  unidadId: string;
  desdeSeg: number;
  duracionSeg: number;
  componenteId: string;
  props: Record<string, unknown>;
  archivoAudio: string | null;
  golpe: TipoGolpe;
  volumenSfx: number;
};

export type ArbolComposicion = {
  id: string;
  fps: number;
  escenas: EscenaComposicion[];
  duracionTotalSeg: number;
};
