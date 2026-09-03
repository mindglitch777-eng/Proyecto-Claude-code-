import {DECISIONES_ARQUITECTURA} from './decisiones';
import type {DecisionArquitectura} from './tipos';

export function porId(id: string): DecisionArquitectura | undefined {
  return DECISIONES_ARQUITECTURA.find((d) => d.id === id);
}

export function abiertas(): DecisionArquitectura[] {
  return DECISIONES_ARQUITECTURA.filter((d) => d.estado === 'abierta');
}

/** Cada decisión debe tener al menos 2 opciones reales (si hay una
 * sola opción, no es una decisión, es un hecho) y la recomendación
 * tiene que ser el id de una opción real que de verdad exista --
 * nunca una recomendación huérfana. */
export function validarDecisiones(): void {
  for (const d of DECISIONES_ARQUITECTURA) {
    if (d.opciones.length < 2) throw new Error(`Decisión "${d.id}" tiene menos de 2 opciones -- no es una decisión real.`);
    if (!d.opciones.some((o) => o.id === d.recomendacionId)) {
      throw new Error(`Decisión "${d.id}" recomienda un id de opción inexistente: ${d.recomendacionId}`);
    }
    for (const o of d.opciones) {
      if (o.ventajas.length === 0 || o.desventajas.length === 0) {
        throw new Error(`Opción "${o.id}" de la decisión "${d.id}" no tiene ventajas o desventajas -- comparación incompleta.`);
      }
    }
    if (!d.justificacion.trim()) throw new Error(`Decisión "${d.id}" no tiene justificación de la recomendación.`);
  }
}
