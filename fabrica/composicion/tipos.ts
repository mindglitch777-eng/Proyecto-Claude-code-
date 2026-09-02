import type {ComponenteRegistrado} from '../componentes/tipos';
import type {TipoGolpe} from '../directores/audio';

/** Un clip de audio real, con su duracion medida (nunca estimada). */
export type ClipAudio = {archivo: string; duracionSeg: number};

/** Una unidad narrativa ya resuelta: el Director Visual ya eligio el
 * componente, el Director de Audio ya eligio el golpe, y (si aplica)
 * la voz ya genero su audio real. Composicion solo la ubica en el
 * tiempo -- no decide nada de contenido.
 *
 * `audios` es un ARRAY (0, 1 o varios clips), no un solo audio -- esto
 * generaliza el patron `AudioCentro` de `CasoGenerico.tsx` (un bloque
 * como Cronologia puede tener 3 hitos, cada uno con su propio audio,
 * todos superpuestos DENTRO de la misma instancia del componente, no
 * en escenas separadas). Un array de 1 elemento es el caso simple de
 * siempre (una linea, un componente, un audio). Array vacio o null =
 * sin audio propio, la duracion sale de duracionMinMaxSeg. */
export type UnidadResuelta = {
  id: string;
  componente: ComponenteRegistrado;
  props: Record<string, unknown>;
  audios: ClipAudio[] | null;
  golpe: TipoGolpe;
  volumenSfx: number;
};

export type EscenaComposicion = {
  unidadId: string;
  desdeSeg: number;
  duracionSeg: number;
  componenteId: string;
  props: Record<string, unknown>;
  /** offsets relativos AL INICIO DE LA ESCENA (no al video), en
   * segundos -- el puente de render los usa para overlayer cada
   * <Audio> en su punto exacto dentro del Sequence de la escena. */
  audios: {archivo: string; desdeSegRelativo: number; duracionSeg: number}[];
  golpe: TipoGolpe;
  volumenSfx: number;
};

export type ArbolComposicion = {
  id: string;
  fps: number;
  escenas: EscenaComposicion[];
  duracionTotalSeg: number;
};
