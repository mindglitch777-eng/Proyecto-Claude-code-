import type {Carrusel, IdentidadMarca, Slide} from './tipos';
import {armarCarrusel} from './armar';
import {porId as conocimientoPorId} from '../conocimiento/consultar';
import {porId as patronPorId} from '../hooks/consultar';

/**
 * Generador completo del Carousel Engine (R7-14). Antes de esto solo
 * existía `armarCarrusel()` -- que arma un `Carrusel` a partir de
 * slides YA ESCRITOS a mano (ver test_carrusel.ts). Esta función
 * ARMA los slides ella misma a partir de UNA fuente real del Knowledge
 * Engine, siguiendo el patrón observado documentado en
 * `conocimiento/base.ts` (id "carrusel-estructura-hook-valor-cta":
 * portada que detiene el scroll, 6-10 slides totales, una idea por
 * slide, CTA).
 *
 * Regla dura: CERO contenido inventado -- cada slide de contenido usa
 * texto que YA existe en el item de conocimiento citado (concepto,
 * descripcion, ejemplos, comoUtilizarlo, limitaciones, fuente). Esta
 * función arma y ordena, no redacta hechos nuevos. El único texto que
 * el llamador aporta es el CTA (una decisión de negocio, no un dato).
 */
export const IDENTIDAD_DEFECTO: IdentidadMarca = {
  paletaRef: 'remotion-spike/src/identidad.ts PALETA',
  fuenteRef: 'GROTESCA',
};

function primeraOracion(texto: string): string {
  const corte = texto.indexOf('. ');
  return corte === -1 ? texto : texto.slice(0, corte + 1);
}

export function generarCarrusel(
  id: string,
  fuenteConocimientoId: string,
  cta: string,
  opciones?: {patronPortadaId?: string; identidadMarca?: IdentidadMarca}
): Carrusel {
  const item = conocimientoPorId(fuenteConocimientoId);
  if (!item) {
    throw new Error(`generarCarrusel: id de conocimiento inexistente: ${fuenteConocimientoId}`);
  }
  if (opciones?.patronPortadaId && !patronPorId(opciones.patronPortadaId)) {
    throw new Error(`generarCarrusel: patrón de retención inexistente: ${opciones.patronPortadaId}`);
  }

  const slides: Slide[] = [];
  let n = 0;
  const nextId = () => `s${++n}`;

  slides.push({id: nextId(), tipo: 'portada', texto: item.concepto, patronRetencionId: opciones?.patronPortadaId});
  slides.push({id: nextId(), tipo: 'hook', texto: primeraOracion(item.descripcion)});
  slides.push({
    id: nextId(),
    tipo: 'desarrollo',
    texto: `Fuente real: ${item.fuente}`,
    subtexto: `Nivel: ${item.nivel} · confianza ${item.nivelConfianza}`,
  });

  // Contenido de desarrollo: los ejemplos reales del item, o (si no
  // tiene ejemplos cargados) su campo comoUtilizarlo como único
  // sustituto -- nunca ambos como el mismo texto duplicado.
  const ejemplosOriginales = item.ejemplos;
  const listaDesarrollo = ejemplosOriginales.length > 0 ? ejemplosOriginales : item.comoUtilizarlo ? [item.comoUtilizarlo] : [];
  for (const texto of listaDesarrollo.slice(0, 5)) {
    slides.push({id: nextId(), tipo: 'desarrollo', texto});
  }
  if (item.comoUtilizarlo && ejemplosOriginales.length > 0) {
    slides.push({id: nextId(), tipo: 'desarrollo', texto: item.comoUtilizarlo});
  }

  // Slide de transparencia (regla de "nunca inventar" de la directiva,
  // aplicada al formato carrusel): qué NO garantiza este contenido.
  slides.push({id: nextId(), tipo: 'ejemplo', texto: 'Qué hay que tener en cuenta', subtexto: item.limitaciones});

  slides.push({id: nextId(), tipo: 'cta', texto: cta});

  return armarCarrusel(id, item.concepto, slides, opciones?.identidadMarca ?? IDENTIDAD_DEFECTO, [item.id]);
}
