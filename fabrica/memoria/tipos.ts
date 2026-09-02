// Tipos de la memoria del proyecto (secciones 16, 18, 19, 20, 25).
// Separacion ESTRICTA entre hipotesis y resultado real (seccion 19):
// nunca el mismo campo, nunca el mismo archivo se llena con datos
// inventados en el campo de datos reales.

export type RegistroVideo = {
  videoId: string;
  fecha: string; // ISO 8601
  componentesUsados: string[]; // ids de fabrica/componentes/registro.json
};

export type EstadoExperimento = 'esperando_datos' | 'evaluado_humano' | 'evaluado_real';

/** Metricas REALES de una publicacion -- solo se llenan con datos que
 * de verdad vinieron de la plataforma donde se publico (vistas,
 * retencion, etc.), nunca con un score calculado por la fabrica. */
export type ResultadoReal = {
  retencionPct?: number;
  vistasTotales?: number;
  clics?: number;
  ventas?: number;
  fuente: string; // de donde salio el dato (ej. "TikTok Analytics", "Hotmart")
  fechaMedicion: string;
};

export type EntradaLaboratorio = {
  id: string;
  /** lo que CREEMOS que puede funcionar -- siempre HIPOTESIS, nunca
   * afirmado como hecho. */
  hipotesis: string;
  /** que se probo concretamente (que combinacion de componentes/
   * hook/estructura). */
  experimento: string;
  videoId?: string;
  /** null mientras no haya dato real -- NUNCA se rellena con una
   * estimacion (seccion 19). */
  resultadoReal: ResultadoReal | null;
  /** solo tiene sentido escribir esto cuando resultadoReal existe. */
  conclusion: string | null;
  estado: EstadoExperimento;
  fechaCreacion: string;
};
