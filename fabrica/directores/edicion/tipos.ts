/**
 * Director de Edicion (Ronda 4). Contrato de la nueva capa que la
 * fabrica necesitaba entre "Directores (Visual/Audio) deciden QUE
 * componente y QUE golpe" y "Composicion los ubica en el tiempo":
 * nadie decidia todavia una ESTRATEGIA DE EDICION -- por que ese golpe,
 * que microeventos ocurren DENTRO de la escena, que estilo audiovisual
 * corresponde a esta unidad, que relacion tiene con la escena anterior
 * y la siguiente.
 *
 * Principio de diseño (orden maestra, seccion 5): esto NO reemplaza al
 * Director Visual ni al Director de Audio, ni es una segunda fabrica
 * paralela. El Director de Edicion consulta a los dos existentes (les
 * pasa lo que ya decidieron) y agrega la capa de INTENCION que faltaba
 * -- el golpe sigue eligiendose con el vocabulario real de
 * directores/audio.ts, el componente sigue siendo el que eligio
 * directores/visual.ts. Lo que agrega esta capa es el POR QUE y el
 * CUANDO-DENTRO-DE-LA-ESCENA.
 */
import type {Categoria} from '../../componentes/tipos';
import type {TipoGolpe} from '../audio';
import type {TipoDato} from '../../composicion/repeticion_datos';

// ─────────────────────────── VOCABULARIO EDITORIAL ───────────────────────────

/** Que esta tratando de lograr esta unidad narrativa, en terminos de
 * direccion (no de contenido -- el contenido ya lo decidio el guion). */
export type IntencionEdicion =
  | 'enganchar'        // hook: capturar atencion en los primeros segundos
  | 'contextualizar'   // dar informacion de base, tono mas calmo
  | 'construir_tension'// escalar hacia algo, sin revelarlo todavia
  | 'revelar'          // el giro/la revelacion misma
  | 'comparar'         // poner dos cosas una al lado de la otra
  | 'dejar_respirar'   // pausa deliberada, silencio narrativo
  | 'acelerar'         // ritmo rapido, tramo de montaje
  | 'cerrar';          // ultima unidad / CTA

export type NivelEnergia = 'baja' | 'media' | 'alta' | 'muy_alta';

export type DensidadVisual = 'minima' | 'moderada' | 'densa';

/** Los 6 estilos de partida de la orden maestra (seccion 10). Es un
 * union type, no un enum cerrado en la logica: `estilos.ts` exporta un
 * REGISTRO (record) de estilos, agregar uno nuevo es agregar una
 * entrada ahi + este literal, igual que agregar un componente al
 * registro.json no toca directores/visual.ts. */
export type EstiloId =
  | 'documental' | 'agresivo' | 'data' | 'misterio' | 'storytelling' | 'cinematico';

export type FuncionTransicion =
  | 'dirigir_atencion' | 'marcar_cambio' | 'preparar_impacto'
  | 'dar_continuidad' | 'crear_contraste' | 'sin_funcion_especial';

export type EstrategiaEntrada = {
  tipo: 'inmediata' | 'progresiva' | 'diferida';
  razon: string;
};

export type EstrategiaSalida = {
  /** 'corte_limpio' = la escena termina y no deja nada; 'se_desvanece'
   * = pierde protagonismo antes de que termine (deliberado, no un
   * bug); 'queda_como_ancla' = el elemento principal permanece visible
   * hasta el corte, para dar continuidad a la escena siguiente. */
  tipo: 'corte_limpio' | 'se_desvanece' | 'queda_como_ancla';
  razon: string;
};

/** El golpe en si sigue siendo TipoGolpe (vocabulario real de
 * directores/audio.ts + golpes.tsx) -- lo que esta capa agrega es la
 * JUSTIFICACION, para que el resultado sea auditable (seccion 13:
 * "todo movimiento/transicion importante debe tener una razon") y para
 * que la critica editorial pueda evaluar si la razon tiene sentido. */
export type EstrategiaTransicion = {
  golpe: TipoGolpe;
  motivo: string;
  funcion: FuncionTransicion;
  intensidad: NivelEnergia;
};

export type TipoElementoDestacado = 'cifra' | 'concepto' | 'persona' | 'comparacion' | 'accion' | 'otro';

export type ElementoDestacado = {
  tipo: TipoElementoDestacado;
  descripcion: string;
};

/** Un cambio significativo DENTRO de una escena (seccion 7 de la
 * orden). `enSegRelativo` es SIEMPRE relativo al inicio de la escena y
 * SIEMPRE anclado a un limite real (offset de un clip de audio real,
 * o 0/duracion de la escena) -- nunca un numero inventado a ojo. Ver
 * microeventos.ts, `construirMicroeventos()`. */
export type TipoMicroEvento =
  | 'entra_elemento_principal' | 'entra_elemento_secundario' | 'sale_elemento'
  | 'cambia_cifra' | 'entra_sfx' | 'cambia_encuadre' | 'se_revela_comparacion'
  | 'aparece_dato_apoyo' | 'silencio';

export type MicroEvento = {
  enSegRelativo: number;
  tipo: TipoMicroEvento;
  descripcion: string;
  razon: string;
};

/** La salida completa del Director de Edicion para UNA unidad
 * narrativa. No reemplaza nada de UnidadResuelta (componente/props/
 * audios/golpe siguen decidiendose donde siempre) -- es informacion
 * ADICIONAL que viaja junto al arbol de composicion para que el puente
 * de render pueda usarla (microeventos, momentoCambio) y para que la
 * critica editorial pueda auditar las decisiones. */
export type EstrategiaEdicion = {
  unidadId: string;
  intencion: IntencionEdicion;
  energia: NivelEnergia;
  densidadVisual: DensidadVisual;
  /** Estilos combinados, orden = prioridad (el primero pesa mas si
   * hay conflicto). Ver estilos.ts, combinarEstilos(). */
  estilos: EstiloId[];
  elementoPrincipal: ElementoDestacado;
  elementoSecundario?: ElementoDestacado;
  entrada: EstrategiaEntrada;
  salida: EstrategiaSalida;
  transicion: EstrategiaTransicion;
  microeventos: MicroEvento[];
  /** Texto libre, NO una metrica: como se relaciona esta unidad con la
   * anterior (continuidad, contraste, ninguna relacion especial). */
  relacionConAnterior: string;
  /** R7-15: id real de fabrica/hooks/catalogo.ts (Viral/Retention
   * Engine) elegido AUTOMÁTICAMENTE para esta unidad, según qué
   * patrones son compatibles con `intencion` (patronesCompatibles()).
   * Antes de R7-15 el catálogo era solo consultable a mano -- esto es
   * la conexión real a la elección automática que R6-4 dejó
   * deliberadamente diferida. Ausente solo si `patronesCompatibles`
   * no devuelve ningún candidato para la intención (no ocurre hoy con
   * el catálogo real de 18 patrones, pero el campo queda opcional por
   * si una intención nueva se agrega sin patrones todavía). */
  patronRetencionId?: string;
  /** true = esta unidad es, a proposito, un momento de silencio/
   * respiro (seccion 18: "el sistema tambien debe poder decidir NO
   * poner nada"). No es lo mismo que energia='baja' -- una unidad de
   * baja energia puede seguir teniendo microeventos; una de
   * respiracion=true deliberadamente no agrega nada mas alla de lo
   * imprescindible. */
  respiracion: boolean;
  /** Explicacion agregada de toda la decision -- para debug y para que
   * la critica editorial tenga contexto legible, no numeros sueltos. */
  razonGeneral: string;
};

// ─────────────────────────── CONTEXTO DE ENTRADA ───────────────────────────

/** Lo que el Director de Edicion necesita saber de una unidad para
 * poder planificar -- viene de lo que YA decidieron Guion/Voz/
 * Director Visual/Director de Audio, nunca inventado aca. */
export type ContextoUnidad = {
  unidadId: string;
  categoria: Categoria;
  intensidadComponente: number; // 0-1, del componente que ya eligio el Director Visual
  indice: number;
  total: number;
  duracionSegTotal: number; // duracion real de la escena (audio + aire, o rango del componente)
  /** Offsets reales (relativos al inicio de la escena) de cada clip de
   * audio de esta unidad -- la UNICA fuente valida para anclar
   * microeventos/momentoCambio. Si la unidad no tiene audio propio,
   * queda vacio y el Director de Edicion no inventa timings. */
  offsetsAudioSeg: number[];
  esPrimera?: boolean;
  esRevelacion?: boolean;
  esCierre?: boolean;
  /** Si esta unidad muestra una cifra protagonista, el tipo de dato
   * (de repeticion_datos.ts) y si ya fue tratada como repeticion --
   * afecta directamente elementoPrincipal/energia (seccion 14). */
  tipoDatoDestacado?: TipoDato;
  esRepeticionTratada?: boolean;
  /** El generador puede sugerir estilos (ej. "el hook casi siempre
   * combina agresivo+documental") pero el Director decide la
   * combinacion final vía combinarEstilos() -- esto es una sugerencia,
   * no una orden directa (mismo principio que `evitar` en
   * DirectorVisual: pesa, no dicta). */
  estilosSugeridos?: EstiloId[];
  /** R7-31: un punto de pausa REAL medido dentro del audio de esta
   * unidad (fabrica/composicion/pausas.ts, detección real con ffmpeg
   * silencedetect sobre el .wav -- nunca un número inventado, mismo
   * estándar que `offsetsAudioSeg`). Sirve para anclar un microevento
   * `cambia_encuadre` real en unidades de un solo clip de audio, que
   * hoy no tienen NINGÚN punto interno donde anclar un cambio visual
   * (hallazgo real del diagnóstico R7-31: esas unidades quedan
   * visualmente estáticas toda su duración). */
  pausaInternaSeg?: number;
};
