/**
 * Product Ecosystem (Ronda 7, directiva FASE NUEVA 7): "una misma
 * investigación puede producir VIDEO, CARRUSEL, GUÍA, LEAD MAGNET,
 * MINI PRODUCTO, MÓDULO DE CURSO, EMAIL, POST, EXPERIMENTO -- no
 * duplicar conocimiento, una única fuente de verdad debe alimentar
 * diferentes formatos."
 *
 * Implementación: cada `DerivacionFormato` REFERENCIA un item real del
 * Knowledge Engine por id (`fuenteConocimientoId`) -- nunca copia su
 * contenido. El contenido vive en un solo lugar
 * (fabrica/conocimiento/base.ts); esto solo trackea QUÉ formatos ya se
 * derivaron de esa fuente y en qué estado están, para que el mismo
 * conocimiento no se reinvente en cada pieza de contenido nueva.
 */
export type TipoFormatoSalida =
  | 'video' | 'carrusel' | 'guia' | 'lead_magnet' | 'modulo_curso'
  | 'email' | 'post' | 'experimento';

export type EstadoDerivacion = 'planeado' | 'en_progreso' | 'publicado';

export type DerivacionFormato = {
  id: string;
  /** id real de fabrica/conocimiento/base.ts -- la ÚNICA fuente de
   * verdad del contenido, esto no la copia. */
  fuenteConocimientoId: string;
  formato: TipoFormatoSalida;
  titulo: string;
  estado: EstadoDerivacion;
  fecha: string;
  /** referencia al artefacto real ya generado (id de video en
   * fabrica/salidas/, ruta de un archivo de carrusel, etc.) -- ausente
   * mientras sea solo un plan, nunca un link inventado. */
  artefactoRef?: string;
};
