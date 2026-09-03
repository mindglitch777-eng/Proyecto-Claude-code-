import type {Carrusel, IdentidadMarca, Slide} from './tipos';
import {validarIds as validarIdsConocimiento} from '../conocimiento/consultar';
import {porId as patronPorId} from '../hooks/consultar';

export function armarCarrusel(
  id: string,
  tema: string,
  slides: Slide[],
  identidadMarca: IdentidadMarca,
  fuenteConocimientoIds: string[] = []
): Carrusel {
  return {id, tema, slides, identidadMarca, fuenteConocimientoIds};
}

/**
 * Valida la ESTRUCTURA contra el patrón observado real
 * (fabrica/conocimiento/base.ts, id "carrusel-estructura-hook-valor-cta"):
 * portada primero, al menos un CTA, y un total de slides dentro del
 * rango que ese patrón documenta (6-10) -- devuelve advertencias, no
 * lanza, porque son guías de diseño, no invariantes técnicas duras.
 */
export function validarEstructura(carrusel: Carrusel): string[] {
  const advertencias: string[] = [];
  if (carrusel.slides.length === 0) {
    advertencias.push('el carrusel no tiene ningún slide');
    return advertencias;
  }
  if (carrusel.slides[0].tipo !== 'portada') {
    advertencias.push('el primer slide no es tipo "portada" -- el patrón observado dice que el slide 1 debe detener el scroll con algo específico, no un genérico');
  }
  if (!carrusel.slides.some((s) => s.tipo === 'cta')) {
    advertencias.push('el carrusel no tiene ningún slide de tipo "cta"');
  }
  if (carrusel.slides.length < 6 || carrusel.slides.length > 10) {
    advertencias.push(`el carrusel tiene ${carrusel.slides.length} slides -- el patrón observado recomienda 6-10 (fuera de ese rango, revisar si es intencional)`);
  }
  for (const s of carrusel.slides) {
    if (!s.texto.trim()) advertencias.push(`slide "${s.id}" no tiene texto`);
  }
  return advertencias;
}

/** Integridad referencial REAL (a diferencia de validarEstructura, esto
 * SÍ lanza -- un id inventado no es una guía de diseño, es un error). */
export function validarReferencias(carrusel: Carrusel): void {
  validarIdsConocimiento(carrusel.fuenteConocimientoIds);
  for (const s of carrusel.slides) {
    if (s.patronRetencionId && !patronPorId(s.patronRetencionId)) {
      throw new Error(`Slide "${s.id}" cita un patrón de retención inexistente: ${s.patronRetencionId}`);
    }
  }
}
