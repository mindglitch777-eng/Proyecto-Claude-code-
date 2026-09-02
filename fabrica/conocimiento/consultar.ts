import {CONOCIMIENTO} from './base';
import type {CategoriaConocimiento, ItemConocimiento, NivelConocimiento} from './tipos';
import {NIVELES_CONFIRMADOS} from './tipos';

export function porId(id: string): ItemConocimiento | undefined {
  return CONOCIMIENTO.find((i) => i.id === id);
}

export function porCategoria(categoria: CategoriaConocimiento): ItemConocimiento[] {
  return CONOCIMIENTO.filter((i) => i.categoria === categoria);
}

export function porTag(tag: string): ItemConocimiento[] {
  return CONOCIMIENTO.filter((i) => i.tags.includes(tag));
}

export function porNivel(nivel: NivelConocimiento): ItemConocimiento[] {
  return CONOCIMIENTO.filter((i) => i.nivel === nivel);
}

/** Solo items con evidencia real de verdad (evidencia o resultado_real)
 * -- lo unico citable como respaldo "confirmado" de una decision de
 * diseño (ver NIVELES_CONFIRMADOS). */
export function soloConfirmados(): ItemConocimiento[] {
  return CONOCIMIENTO.filter((i) => i.confirmado);
}

/** Busqueda simple de texto libre sobre concepto/descripcion -- util
 * para explorar la base sin saber de antemano la categoria/tag exacta. */
export function buscar(texto: string): ItemConocimiento[] {
  const q = texto.toLowerCase();
  return CONOCIMIENTO.filter((i) => i.concepto.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q));
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
