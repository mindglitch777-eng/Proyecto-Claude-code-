import type {IntencionEdicion} from '../directores/edicion/tipos';

/**
 * Hook Engine (Ronda 6, Prompt Maestro 2). Biblioteca COMBINABLE de
 * patrones de apertura -- no un generador de texto, no reemplaza a
 * quien escribe el guion. Cada patron es una FORMA reconocible de
 * abrir un video, con su respaldo real (o la falta de el, declarada
 * explicitamente) citado por id contra el Knowledge Engine
 * (fabrica/conocimiento/).
 *
 * Deliberadamente chico esta ronda (4 patrones): agregar uno nuevo
 * exige antes tener investigacion real que lo respalde o, como minimo,
 * marcarlo honestamente sin evidencia -- nunca inventar un respaldo.
 */
export type PatronHook = {
  id: string;
  nombre: string;
  descripcion: string;
  ejemploAplicado: string;
  /** ids reales de fabrica/conocimiento/base.ts -- vacio si el patron
   * es practica observada sin evidencia formal citada (ver `respaldo`). */
  evidenciaIds: string[];
  respaldo: 'evidencia' | 'heuristica' | 'sin_evidencia_formal';
  /** con que intenciones del Director de Edicion combina bien -- casi
   * siempre 'enganchar' (es la apertura), pero un patron de loop
   * abierto tambien puede iniciar una 'construir_tension'. */
  compatibleConIntencion: IntencionEdicion[];
};
