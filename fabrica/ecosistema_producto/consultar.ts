import {DERIVACIONES} from './datos';
import type {DerivacionFormato, TipoFormatoSalida} from './tipos';
import {porId as conocimientoPorId} from '../conocimiento/consultar';

const TODOS_LOS_FORMATOS: TipoFormatoSalida[] = ['video', 'carrusel', 'guia', 'lead_magnet', 'modulo_curso', 'email', 'post', 'experimento'];

export function derivacionesDe(fuenteConocimientoId: string, derivaciones: DerivacionFormato[] = DERIVACIONES): DerivacionFormato[] {
  return derivaciones.filter((d) => d.fuenteConocimientoId === fuenteConocimientoId);
}

/** Qué formatos NUNCA se derivaron todavía de una fuente de
 * conocimiento -- útil para ver de un vistazo qué le falta explotar a
 * un ítem de investigación real. */
export function formatosPendientesPara(fuenteConocimientoId: string, derivaciones: DerivacionFormato[] = DERIVACIONES): TipoFormatoSalida[] {
  const yaTiene = new Set(derivacionesDe(fuenteConocimientoId, derivaciones).map((d) => d.formato));
  return TODOS_LOS_FORMATOS.filter((f) => !yaTiene.has(f));
}

/** Valida que cada derivación referencia una fuente REAL del Knowledge
 * Engine -- nunca contenido inventado sin respaldo. Lanza si alguna no existe. */
export function validarDerivaciones(derivaciones: DerivacionFormato[] = DERIVACIONES): void {
  for (const d of derivaciones) {
    if (!conocimientoPorId(d.fuenteConocimientoId)) {
      throw new Error(`Derivación "${d.id}" referencia un item de conocimiento inexistente: ${d.fuenteConocimientoId}`);
    }
  }
}
