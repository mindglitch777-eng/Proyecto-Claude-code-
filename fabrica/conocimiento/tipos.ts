/**
 * Knowledge Engine (Ronda 6, Prompt Maestro 2 seccion "Knowledge
 * Engine"): version TIPADA y CONSULTABLE de la misma disciplina de
 * niveles de evidencia que ya existia en prosa desde Ronda 5
 * (fabrica/research/retencion.md). No reemplaza ese documento (sigue
 * siendo la version legible/citable para un humano) -- lo INDEXA como
 * datos reales que otro codigo puede consultar (ver
 * fabrica/hooks/catalogo.ts, que cita items de aca por id en vez de
 * repetir la evidencia en prosa).
 *
 * Regla dura heredada sin cambios (orden maestra seccion 2 y 21, y el
 * mismo principio que ya sigue fabrica/qa/critica_editorial.py):
 * nunca se trata un item HEURISTICA/ANECDOTICO/HIPOTESIS como si fuera
 * EVIDENCIA o RESULTADO_REAL. `confirmado` existe justamente para que
 * el codigo que consulta esto (no solo un humano leyendo markdown)
 * pueda filtrar por esa distincion sin tener que interpretar texto.
 */

export type NivelEvidencia =
  | 'evidencia_academica'
  | 'evidencia_oficial_plataforma'
  | 'heuristica_secundaria'
  | 'anecdotico'
  | 'hipotesis'
  | 'experimento'
  | 'resultado_real'
  | 'conclusion';

/** Los unicos niveles que se pueden citar como respaldo "confirmado"
 * de una decision de diseño real -- todo lo demas es pista, no hecho. */
export const NIVELES_CONFIRMADOS: NivelEvidencia[] = [
  'evidencia_academica',
  'evidencia_oficial_plataforma',
  'resultado_real',
];

export type ItemConocimiento = {
  id: string;
  tema: string;
  afirmacion: string;
  nivel: NivelEvidencia;
  /** true solo para evidencia_academica/evidencia_oficial_plataforma/
   * resultado_real -- heuristica/anecdotico/hipotesis SIEMPRE false,
   * sin excepcion (ver NIVELES_CONFIRMADOS). Campo redundante a
   * proposito: hace el filtro trivial sin tener que repetir la lista
   * de niveles confirmados en cada lugar que consulta esto. */
  confirmado: boolean;
  fuente?: string;
  aplicacionFabrica?: string;
  tags: string[];
};
