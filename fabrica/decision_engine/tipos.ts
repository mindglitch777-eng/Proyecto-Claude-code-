/**
 * Decision Engine (Ronda 7, directiva FASE 11): plantilla formal para
 * cuando existen varias opciones reales de arquitectura/negocio.
 * Regla dura textual: nunca elegir "la más fácil" ni "la más
 * compleja" -- la recomendación tiene que salir de comparar
 * ventajas/desventajas/dependencias/costos/riesgos/potencial/
 * complejidad de cada opción, y decir POR QUÉ.
 *
 * Esto formaliza algo que el proyecto ya venía haciendo en prosa
 * dentro de fabrica/decisions/DECISIONES.md (ej. la elección entre
 * @remotion/transitions con Transition real vs. seguir con el efecto
 * CSS, Ronda 6) -- lo nuevo es el CONTRATO tipado, no el hábito.
 */
export type OpcionDecision = {
  id: string;
  nombre: string;
  queHace: string;
  ventajas: string[];
  desventajas: string[];
  dependencias: string[];
  costos: string;
  riesgos: string[];
  potencial: string;
  complejidad: 'baja' | 'media' | 'alta';
};

export type DecisionArquitectura = {
  id: string;
  pregunta: string;
  opciones: OpcionDecision[];
  /** debe ser el `id` de una de las `opciones` -- se valida. */
  recomendacionId: string;
  justificacion: string;
  fecha: string;
  estado: 'abierta' | 'decidida_por_operador' | 'decidida_por_claude';
};
