import type {IntencionEdicion} from '../directores/edicion/tipos';

/**
 * Viral/Retention Engine (Ronda 7, directiva FASE NUEVA 4 -- evoluciona
 * el Hook Engine de Ronda 6, que solo cubría patrones de APERTURA).
 * Biblioteca COMBINABLE de patrones narrativos/de retención -- no un
 * generador de texto, no reemplaza a quien escribe el guion. Cada
 * patrón es una FORMA reconocible (de abrir, de generar curiosidad, de
 * escalar, de cerrar, etc.), con su respaldo real (o la falta de él,
 * declarada explícitamente) citado por id contra el Knowledge Engine
 * (fabrica/conocimiento/).
 *
 * El folder se mantiene `fabrica/hooks/` (no se renombra a proposito
 * -- regla de no romper referencias existentes sin necesidad real,
 * `memoria/patrones.ts` ya usa `hookId` como id de string libre, sin
 * acoplarse al tipo). El ALCANCE es el que pide la directiva: mucho
 * más que solo aperturas.
 */
export type CategoriaPatron =
  | 'apertura' | 'curiosidad' | 'contradiccion' | 'sorpresa' | 'escalada'
  | 'revelacion' | 'comparacion' | 'tension' | 'recompensa'
  | 'cambio_perspectiva' | 'storytelling' | 'ritmo' | 'cierre' | 'cta';

export type PatronRetencion = {
  id: string;
  categoria: CategoriaPatron;
  nombre: string;
  descripcion: string;
  ejemploAplicado: string;
  /** ids reales de fabrica/conocimiento/base.ts -- vacio si el patron
   * es practica observada sin evidencia formal citada (ver `respaldo`). */
  evidenciaIds: string[];
  respaldo: 'evidencia' | 'patron_observado' | 'buena_practica' | 'sin_evidencia_formal';
  /** con que intenciones del Director de Edicion combina bien. */
  compatibleConIntencion: IntencionEdicion[];
};

/** Respuesta a las 4 preguntas que la directiva pide que el Director
 * de Retención pueda contestar sobre CUALQUIER patrón que use: qué
 * patrón, por qué, con qué evidencia, y de qué depende. */
export type ExplicacionPatron = {
  patron: PatronRetencion;
  porQue: string;
  evidencia: {id: string; concepto: string; nivel: string}[];
  esHipotesisUObservado: 'evidencia_real' | 'patron_observado_o_buena_practica' | 'sin_respaldo_formal';
  dependeDe: string;
};
