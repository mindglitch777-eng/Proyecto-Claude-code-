import {CONOCIMIENTO} from './base';
import type {ItemConocimiento, NivelEvidencia} from './tipos';
import {NIVELES_CONFIRMADOS} from './tipos';

export function porId(id: string): ItemConocimiento | undefined {
  return CONOCIMIENTO.find((i) => i.id === id);
}

export function porTema(tema: string): ItemConocimiento[] {
  return CONOCIMIENTO.filter((i) => i.tema === tema);
}

export function porTag(tag: string): ItemConocimiento[] {
  return CONOCIMIENTO.filter((i) => i.tags.includes(tag));
}

export function porNivel(nivel: NivelEvidencia): ItemConocimiento[] {
  return CONOCIMIENTO.filter((i) => i.nivel === nivel);
}

/** Solo items con evidencia real de verdad (academica, oficial de
 * plataforma, o resultado_real) -- lo unico citable como respaldo
 * "confirmado" de una decision de diseño (ver NIVELES_CONFIRMADOS). */
export function soloConfirmados(): ItemConocimiento[] {
  return CONOCIMIENTO.filter((i) => i.confirmado);
}

/** Valida que un array de ids realmente exista en la base -- pensado
 * para que otros modulos (ej. fabrica/hooks/catalogo.ts) puedan citar
 * evidencia por id con la garantia de que el id es real, no un typo
 * silencioso. Lanza si algun id no existe. */
export function validarIds(ids: string[]): void {
  const faltantes = ids.filter((id) => !porId(id));
  if (faltantes.length > 0) {
    throw new Error(`Ids de conocimiento inexistentes: ${faltantes.join(', ')}`);
  }
}
