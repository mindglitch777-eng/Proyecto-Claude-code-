/**
 * Almacén real del Sales Engine -- EMPTY a propósito (ver tipos.ts).
 * Se llena con datos reales cuando el operador aporte información de
 * negocio real (audiencia, problema, producto, precio). Hasta
 * entonces, la arquitectura queda lista pero vacía -- exactamente lo
 * que pide la directiva ("no construir todavía productos inventados
 * sin validación").
 */
import type {
  Audiencia, Problema, Oportunidad, Producto, Oferta, LeadMagnet,
  Lead, EventoNutricion, EventoConversion, EventoEntrega, Feedback, EventoRetencion,
} from './tipos';

export const AUDIENCIAS: Audiencia[] = [];
export const PROBLEMAS: Problema[] = [];
export const OPORTUNIDADES: Oportunidad[] = [];
export const PRODUCTOS: Producto[] = [];
export const OFERTAS: Oferta[] = [];
export const LEAD_MAGNETS: LeadMagnet[] = [];
export const LEADS: Lead[] = [];
export const NUTRICION: EventoNutricion[] = [];
export const CONVERSIONES: EventoConversion[] = [];
export const ENTREGAS: EventoEntrega[] = [];
export const FEEDBACK: Feedback[] = [];
export const RETENCION: EventoRetencion[] = [];
