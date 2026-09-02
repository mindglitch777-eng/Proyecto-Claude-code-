import {TECNICAS_EDICION} from './tecnicas';
import type {CategoriaTecnica, PropositoNarrativo, TecnicaEdicion} from './tecnicas';
import {validarIds as validarIdsConocimiento} from '../../conocimiento/consultar';
import {porId as patronPorId} from '../../hooks/consultar';

export function porId(id: string): TecnicaEdicion | undefined {
  return TECNICAS_EDICION.find((t) => t.id === id);
}

export function porCategoria(categoria: CategoriaTecnica): TecnicaEdicion[] {
  return TECNICAS_EDICION.filter((t) => t.categoria === categoria);
}

export function porProposito(proposito: PropositoNarrativo): TecnicaEdicion[] {
  return TECNICAS_EDICION.filter((t) => t.subordinadoA.includes(proposito));
}

/** Ninguna técnica puede quedar sin propósito declarado -- justo lo
 * que la directiva prohíbe ("no agregar efectos solamente porque
 * existen"). Además valida integridad referencial contra el Knowledge
 * Engine y el Viral/Retention Engine. */
export function validarCatalogo(): void {
  for (const t of TECNICAS_EDICION) {
    if (t.subordinadoA.length === 0) {
      throw new Error(`Técnica "${t.id}" no declara a qué propósito narrativo está subordinada.`);
    }
    validarIdsConocimiento(t.evidenciaIds);
    if (t.patronRetencionRelacionado && !patronPorId(t.patronRetencionRelacionado)) {
      throw new Error(`Técnica "${t.id}" cita un patrón de retención inexistente: ${t.patronRetencionRelacionado}`);
    }
  }
}
