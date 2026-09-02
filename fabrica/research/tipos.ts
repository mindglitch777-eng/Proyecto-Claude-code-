/**
 * Research System (Ronda 7, directiva FASE NUEVA 2). Formaliza el
 * patrón que ya se usaba en prosa desde Ronda 5
 * ("INVESTIGACIÓN NECESARIA / Fuente / Qué queremos comprobar / Qué
 * falta") como un tipo de dato real, listable y consultable -- para
 * que una sesión futura no tenga que releer markdown para saber qué
 * quedó sin poder verificarse.
 *
 * Regla dura (textual de la directiva): si no se puede acceder a una
 * fuente, NO SE INVENTA -- se registra acá con el bloqueo real, y se
 * sigue con lo que sí se puede hacer.
 */
export type EstadoInvestigacion = 'pendiente' | 'resuelta' | 'descartada';

export type InvestigacionNecesaria = {
  id: string;
  /** Qué queremos comprobar -- la pregunta concreta, no un tema vago. */
  pregunta: string;
  /** Qué fuente se intentó o se debería intentar (URL, documento, tipo de fuente). */
  fuentePropuesta: string;
  /** Qué información especifica falta para responder la pregunta. */
  queFalta: string;
  /** Por qué no se pudo resolver ahora -- bloqueo real (acceso de red,
   * requiere cuenta, paywall, fuente no localizada, dato no verificable). */
  bloqueo: string;
  fecha: string;
  estado: EstadoInvestigacion;
  /** Si estado != 'pendiente', qué pasó -- cómo se resolvió, o por qué
   * se descartó definitivamente (ej. "fuente no verificable, no se
   * incorpora al Knowledge Engine"). */
  resolucion?: string;
};
