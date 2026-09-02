import {
  AUDIENCIAS, PROBLEMAS, OPORTUNIDADES, PRODUCTOS, OFERTAS, LEAD_MAGNETS,
  LEADS, CONVERSIONES, FEEDBACK,
} from './datos';
import type {
  Audiencia, Problema, Oportunidad, Producto, Oferta, LeadMagnet, Lead, EventoConversion, Feedback,
} from './tipos';

/**
 * Todas las funciones acá reciben los arrays como parámetro con
 * default a los datos reales del módulo (`datos.ts`) -- esto permite
 * testear con fixtures locales sin tocar el almacén real, y a la vez
 * usarlas directo sobre datos reales sin pasar nada.
 */

export function problemasDeAudiencia(audienciaId: string, problemas: Problema[] = PROBLEMAS): Problema[] {
  return problemas.filter((p) => p.audienciaId === audienciaId);
}

export function oportunidadesDeProblema(problemaId: string, oportunidades: Oportunidad[] = OPORTUNIDADES): Oportunidad[] {
  return oportunidades.filter((o) => o.problemaId === problemaId);
}

export function productosDeOportunidad(oportunidadId: string, productos: Producto[] = PRODUCTOS): Producto[] {
  return productos.filter((p) => p.oportunidadId === oportunidadId);
}

export function ofertasDeProducto(productoId: string, ofertas: Oferta[] = OFERTAS): Oferta[] {
  return ofertas.filter((o) => o.productoId === productoId);
}

export function leadsDeLeadMagnet(leadMagnetId: string, leads: Lead[] = LEADS): Lead[] {
  return leads.filter((l) => l.leadMagnetId === leadMagnetId);
}

export function conversionesDeOferta(ofertaId: string, conversiones: EventoConversion[] = CONVERSIONES): EventoConversion[] {
  return conversiones.filter((c) => c.ofertaId === ofertaId);
}

export function feedbackDeProducto(productoId: string, feedback: Feedback[] = FEEDBACK): Feedback[] {
  return feedback.filter((f) => f.productoId === productoId);
}

/** Valida integridad referencial de TODA la cadena -- ninguna etapa
 * puede apuntar a un id de la etapa anterior que no exista. Pensado
 * para correr como test/CI, no en producción (arrays completos como
 * parámetro para poder testear con fixtures). */
export function validarCadena(datos: {
  audiencias: Audiencia[]; problemas: Problema[]; oportunidades: Oportunidad[];
  productos: Producto[]; ofertas: Oferta[]; leadMagnets: LeadMagnet[];
}): string[] {
  const errores: string[] = [];
  const idsAudiencia = new Set(datos.audiencias.map((a) => a.id));
  const idsProblema = new Set(datos.problemas.map((p) => p.id));
  const idsOportunidad = new Set(datos.oportunidades.map((o) => o.id));
  const idsProducto = new Set(datos.productos.map((p) => p.id));
  const idsOferta = new Set(datos.ofertas.map((o) => o.id));

  for (const p of datos.problemas) if (!idsAudiencia.has(p.audienciaId)) errores.push(`Problema "${p.id}" referencia audienciaId inexistente: ${p.audienciaId}`);
  for (const o of datos.oportunidades) if (!idsProblema.has(o.problemaId)) errores.push(`Oportunidad "${o.id}" referencia problemaId inexistente: ${o.problemaId}`);
  for (const p of datos.productos) if (!idsOportunidad.has(p.oportunidadId)) errores.push(`Producto "${p.id}" referencia oportunidadId inexistente: ${p.oportunidadId}`);
  for (const o of datos.ofertas) if (!idsProducto.has(o.productoId)) errores.push(`Oferta "${o.id}" referencia productoId inexistente: ${o.productoId}`);
  for (const lm of datos.leadMagnets) if (!idsOferta.has(lm.ofertaId)) errores.push(`LeadMagnet "${lm.id}" referencia ofertaId inexistente: ${lm.ofertaId}`);

  return errores;
}

/** Resumen del funnel: cuántos items reales hay en cada etapa. Útil
 * para ver de un vistazo qué tan avanzado está el negocio -- hoy, con
 * los almacenes vacíos, esto devuelve todo en 0 (honesto: no hay
 * negocio todavía, no una simulación). */
export function resumenFunnel(): Record<string, number> {
  return {
    audiencias: AUDIENCIAS.length,
    problemas: PROBLEMAS.length,
    oportunidades: OPORTUNIDADES.length,
    productos: PRODUCTOS.length,
    ofertas: OFERTAS.length,
    leadMagnets: LEAD_MAGNETS.length,
    leads: LEADS.length,
    conversiones: CONVERSIONES.length,
    feedback: FEEDBACK.length,
  };
}
