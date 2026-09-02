import {CATALOGO_HOOKS} from './catalogo';
import type {PatronHook} from './tipos';
import type {IntencionEdicion} from '../directores/edicion/tipos';
import {validarIds} from '../conocimiento/consultar';

export function porId(id: string): PatronHook | undefined {
  return CATALOGO_HOOKS.find((p) => p.id === id);
}

export function patronesCompatibles(intencion: IntencionEdicion): PatronHook[] {
  return CATALOGO_HOOKS.filter((p) => p.compatibleConIntencion.includes(intencion));
}

export function conEvidenciaReal(): PatronHook[] {
  return CATALOGO_HOOKS.filter((p) => p.respaldo === 'evidencia');
}

/** Falla si algun patron del catalogo cita un id de conocimiento que
 * no existe -- integridad real entre Hook Engine y Knowledge Engine,
 * no solo dos listas de texto que podrian desincronizarse en silencio. */
export function validarCatalogo(): void {
  for (const patron of CATALOGO_HOOKS) {
    validarIds(patron.evidenciaIds);
  }
}
