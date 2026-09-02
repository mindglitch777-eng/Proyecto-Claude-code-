import {CATALOGO_PATRONES} from './catalogo';
import type {CategoriaPatron, ExplicacionPatron, PatronRetencion} from './tipos';
import type {IntencionEdicion} from '../directores/edicion/tipos';
import {porId as conocimientoPorId, validarIds} from '../conocimiento/consultar';
import {NIVELES_CONFIRMADOS} from '../conocimiento/tipos';

export function porId(id: string): PatronRetencion | undefined {
  return CATALOGO_PATRONES.find((p) => p.id === id);
}

export function porCategoria(categoria: CategoriaPatron): PatronRetencion[] {
  return CATALOGO_PATRONES.filter((p) => p.categoria === categoria);
}

export function patronesCompatibles(intencion: IntencionEdicion): PatronRetencion[] {
  return CATALOGO_PATRONES.filter((p) => p.compatibleConIntencion.includes(intencion));
}

export function conEvidenciaReal(): PatronRetencion[] {
  return CATALOGO_PATRONES.filter((p) => p.respaldo === 'evidencia');
}

/** Falla si algun patron del catalogo cita un id de conocimiento que
 * no existe -- integridad real entre Viral/Retention Engine y
 * Knowledge Engine, no solo dos listas de texto que podrian
 * desincronizarse en silencio. */
export function validarCatalogo(): void {
  for (const patron of CATALOGO_PATRONES) {
    validarIds(patron.evidenciaIds);
  }
}

/**
 * Responde las 4 preguntas que la directiva pide que el Director de
 * Retención pueda contestar sobre cualquier patrón que use:
 * ¿Qué patrón? ¿Por qué? ¿Qué evidencia? ¿Hipótesis u observado?
 * (la 5ta, "¿de qué parte del video depende?", la completa quien
 * llama, pasando `dependeDeUnidades` -- este módulo no sabe de árboles
 * de composición, esa es responsabilidad de directores/retencion/).
 */
export function explicarPatron(id: string, dependeDeUnidades: string): ExplicacionPatron {
  const patron = porId(id);
  if (!patron) throw new Error(`Patrón de retención inexistente: ${id}`);
  const evidencia = patron.evidenciaIds.map((eid) => {
    const item = conocimientoPorId(eid);
    if (!item) throw new Error(`Patrón ${id} cita un id de conocimiento inexistente: ${eid}`);
    return {id: item.id, concepto: item.concepto, nivel: item.nivel};
  });
  const hayEvidenciaReal = evidencia.some((e) => NIVELES_CONFIRMADOS.includes(e.nivel as any));
  return {
    patron,
    porQue: patron.descripcion,
    evidencia,
    esHipotesisUObservado: hayEvidenciaReal
      ? 'evidencia_real'
      : evidencia.length > 0
        ? 'patron_observado_o_buena_practica'
        : 'sin_respaldo_formal',
    dependeDe: dependeDeUnidades,
  };
}
