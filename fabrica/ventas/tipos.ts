/**
 * Sales Engine (Ronda 7, directiva FASE NUEVA 6). Arquitectura del
 * pipeline comercial completo pedido textualmente:
 *
 *   AUDIENCIA → PROBLEMA → OPORTUNIDAD → PRODUCTO → OFERTA →
 *   CONTENIDO → LEAD MAGNET → LEAD → NUTRICIÓN → CONVERSIÓN →
 *   ENTREGA → FEEDBACK → RETENCIÓN → NUEVO PRODUCTO
 *
 * REGLA DURA (sección 12 de la directiva + regla de $0 del proyecto):
 * esto es ESTRUCTURA, no contenido de negocio real. Ningún dato acá
 * es un producto/precio/oferta/audiencia inventada -- los arrays de
 * datos (ver `datos.ts`) empiezan VACÍOS a propósito y solo se llenan
 * cuando el operador aporte información real (quién es la audiencia,
 * qué problema resuelve, qué precio probar). Decidir eso es una
 * decisión de negocio del operador, no algo que este sistema pueda
 * inventar por su cuenta.
 *
 * Cada etapa es una HIPÓTESIS hasta que se valida con datos reales
 * (mismo principio de EstadoInvestigacion/NivelConocimiento ya
 * establecido en el resto del proyecto) -- `estado` nunca se saltea a
 * 'validada' sin una fuente real.
 */
export type EstadoHipotesisNegocio = 'sin_validar' | 'validando' | 'validada' | 'invalidada';

export type Audiencia = {
  id: string;
  descripcion: string;
  /** de dónde sale esta definición -- investigación real, entrevista,
   * o explícitamente "hipótesis del operador, sin validar todavía". */
  fuente: string;
  estado: EstadoHipotesisNegocio;
  fecha: string;
};

export type Problema = {
  id: string;
  audienciaId: string;
  descripcion: string;
  /** ids opcionales del Knowledge Engine si el problema está
   * respaldado por investigación real, no solo intuición. */
  evidenciaIds?: string[];
  estado: EstadoHipotesisNegocio;
  fecha: string;
};

export type Oportunidad = {
  id: string;
  problemaId: string;
  descripcion: string;
  estado: EstadoHipotesisNegocio;
  fecha: string;
};

export type TipoProducto =
  | 'recurso_gratuito' | 'plantilla' | 'guia' | 'mini_producto' | 'workshop'
  | 'mini_curso' | 'curso' | 'programa' | 'herramienta' | 'bundle'
  | 'membresia' | 'complementario';

export type Producto = {
  id: string;
  oportunidadId: string;
  nombre: string;
  tipo: TipoProducto;
  descripcion: string;
  estado: EstadoHipotesisNegocio;
  fecha: string;
};

export type Oferta = {
  id: string;
  productoId: string;
  /** ausente hasta que exista una hipótesis de precio explícita --
   * NUNCA un número copiado de un framework (ver
   * conocimiento/base.ts "brunson-value-ladder": los rangos de ese
   * framework son referencia, no un precio real a copiar). */
  precio?: number;
  hipotesisDePrecio: string;
  estado: EstadoHipotesisNegocio;
  fecha: string;
};

export type LeadMagnet = {
  id: string;
  ofertaId: string;
  nombre: string;
  formato: string;
  estado: EstadoHipotesisNegocio;
  fecha: string;
};

export type Lead = {
  id: string;
  leadMagnetId?: string;
  /** de dónde vino -- "video X", "carrusel Y", "orgánico" -- nunca
   * datos de contacto reales (esto no es un CRM, es el registro
   * agregado para medir el funnel). */
  fuente: string;
  fecha: string;
};

export type EventoNutricion = {
  id: string;
  leadId: string;
  descripcion: string;
  fecha: string;
};

export type EventoConversion = {
  id: string;
  ofertaId: string;
  leadId?: string;
  monto?: number;
  fecha: string;
  fuente: string;
};

export type EventoEntrega = {
  id: string;
  conversionId: string;
  descripcion: string;
  fecha: string;
};

export type Feedback = {
  id: string;
  productoId: string;
  texto: string;
  sentimiento?: 'positivo' | 'negativo' | 'neutral';
  fecha: string;
};

export type EventoRetencion = {
  id: string;
  productoId: string;
  descripcion: string;
  fecha: string;
};
