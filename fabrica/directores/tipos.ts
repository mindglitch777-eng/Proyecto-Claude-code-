import type {Categoria, CapacidadTexto, TipoAsset, ComponenteRegistrado} from '../componentes/tipos';

/** Lo que el Guion/Composicion le pide al Director Visual para UNA
 * unidad narrativa -- nunca el nombre de un componente, siempre lo
 * que esa unidad NECESITA comunicar (seccion 5 del prompt maestro). */
export type ConsultaVisual = {
  /** una o varias categorias aceptables para esta unidad */
  categorias: Categoria[];
  /** 0-1, que tan fuerte visualmente debe sentirse este momento */
  intensidadDeseada: number;
  /** cuanto texto trae la unidad (deriva del guion, no se adivina) */
  capacidadTextoNecesaria: CapacidadTexto;
  /** que tipos de asset hay disponibles para esta unidad (resueltos
   * por fabrica/assets/resolver.py) */
  assetsDisponibles: TipoAsset[];
  /** duracion real del audio de esta unidad (segundos) -- ya medida,
   * nunca estimada (ver fabrica/voz/contrato.py) */
  duracionDisponibleSeg: number;
  /** ids de componentes usados en las ultimas N unidades/videos, para
   * anti-repeticion (seccion 16) -- resta puntos, no descalifica */
  evitar?: string[];
  /** si esta unidad va a llevar un clip de audio propio que el
   * componente tiene que aceptar (seccion 12) */
  requiereAudioSincronizado?: boolean;
};

export type CandidatoComponente = {
  componente: ComponenteRegistrado;
  /** HEURISTICA, no una medida de calidad real (regla del prompt
   * maestro: todo score antes de datos reales es hipotesis). */
  score: number;
  /** por que puntuo asi -- para poder auditar la decision, no una caja negra */
  razones: string[];
};
