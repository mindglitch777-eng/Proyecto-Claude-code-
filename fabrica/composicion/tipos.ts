import type {ComponenteRegistrado} from '../componentes/tipos';
import type {TipoGolpe} from '../directores/audio';
import type {EstrategiaEdicion} from '../directores/edicion/tipos';
import type {MapaRetencion} from '../directores/retencion/tipos';

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
  /** Ronda 4: la estrategia que decidio el Director de Edicion para
   * esta unidad (intencion, energia, microeventos, etc.). OPCIONAL a
   * proposito -- un generador viejo (demo_01/02/03/04) que no llama al
   * Director de Edicion sigue siendo un UnidadResuelta valido, esto no
   * rompe nada retroactivamente (seccion 25: "no romper la
   * arquitectura actual"). */
  estrategiaEdicion?: EstrategiaEdicion;
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
  /** Ronda 4: viaja serializada en el JSON para que el puente de
   * render (microeventos -> props reales) y la critica editorial
   * puedan leerla. Opcional, ver nota en UnidadResuelta. */
  estrategiaEdicion?: EstrategiaEdicion;
};

export type ArbolComposicion = {
  id: string;
  fps: number;
  escenas: EscenaComposicion[];
  duracionTotalSeg: number;
  /** Ronda 5: mapa narrativo + alertas del Director de Retención 2.0,
   * calculado sobre el árbol YA armado (ver
   * fabrica/directores/retencion/). Opcional -- se adjunta desde el
   * generador (armarComposicion() no sabe nada de retención, mismo
   * principio de capas separadas que estrategiaEdicion). El Crítico
   * Audiovisual (fabrica/qa/critico_audiovisual.py) lo lee para la
   * categoría "Retención". */
  analisisRetencion?: MapaRetencion;
};
