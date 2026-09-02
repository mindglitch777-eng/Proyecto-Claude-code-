/**
 * Skill Intelligence System (Ronda 7, directiva FASE NUEVA 3).
 * Versión TIPADA y consultable de lo que ya existía en prosa en
 * INVESTIGACION_HERRAMIENTAS.md (Ronda 5-6) -- ese documento sigue
 * siendo la referencia de detalle completo (queda citado por id en
 * `detalleSeccion`); esto es el índice que otro código puede filtrar
 * (ej. "dame todo lo que está en estado 'usar'").
 */
export type DecisionSkill = 'usar' | 'probar' | 'descartar' | 'confirmado_sin_accion';

export type SkillInvestigada = {
  id: string;
  nombre: string;
  fuente: string;
  capacidad: string;
  utilidad: string;
  dependencias: string;
  licencia: string;
  queAprovechar: string;
  queNoNecesitamos: string;
  riesgo: string;
  decision: DecisionSkill;
  fecha: string;
  /** Número de sección en INVESTIGACION_HERRAMIENTAS.md donde está el
   * detalle completo (evidencia, razonamiento largo) -- este registro
   * es el índice, no reemplaza el documento. */
  detalleSeccion: number;
};
