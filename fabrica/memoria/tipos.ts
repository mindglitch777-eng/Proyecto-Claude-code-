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

/** Una variante concreta dentro de un experimento A/B (Ronda 5,
 * orden maestra secciones 18-19). `videoId` queda vacío hasta que esa
 * variante puntual se genera de verdad -- registrar una variante no
 * implica que ya exista un video para ella. */
export type VarianteExperimento = {
  nombre: string; // 'A', 'B', o un nombre descriptivo corto
  descripcion: string;
  videoId?: string;
};

/** El contrato de un experimento A/B real: UNA variable que cambia a
 * proposito entre variantes, y las que se mantienen iguales para que
 * la comparacion tenga sentido (si todo cambia a la vez, no se puede
 * saber que causo la diferencia). Ver ejemplo en la orden maestra,
 * sección 18: "Variante A: cifra completa. Variante B: cifra
 * progresiva. Variable modificada: forma de revelar la información.
 * Variables controladas: guion, voz, duración aproximada." */
export type ExperimentoAB = {
  variableModificada: string;
  variablesControladas: string[];
  variantes: VarianteExperimento[];
};

/**
 * R7-7 (Ronda 7, directiva FASE NUEVA 9): verificado -- este contrato
 * YA satisface el esquema pedido "Hipótesis → Variables →
 * Implementación → Resultado → Datos → Conclusión", campo por campo:
 *
 *   HIPÓTESIS      -> EntradaLaboratorio.hipotesis
 *   VARIABLES      -> ExperimentoAB.variableModificada + .variablesControladas
 *                     (solo cuando la entrada ES un experimento A/B formal --
 *                     no toda hipótesis necesita variantes explícitas)
 *   IMPLEMENTACIÓN -> EntradaLaboratorio.experimento (qué se probó concretamente)
 *   RESULTADO+DATOS-> EntradaLaboratorio.resultadoReal (ResultadoReal, con
 *                     fuente + fecha de medición -- nunca estimado)
 *   CONCLUSIÓN     -> EntradaLaboratorio.conclusion
 *
 * No se agregó ningún campo nuevo -- el schema de Ronda 5 ya cubría
 * esto. Lo que SÍ se confirma explícitamente acá (y ya estaba
 * garantizado por el propio sistema de tipos, no es una promesa
 * suelta): `ResultadoReal` NUNCA tiene un campo de "score" -- los
 * scores internos de la fábrica (Director Visual, resolver de assets,
 * resolver de música) viven en objetos completamente separados
 * (`fabrica/directores/tipos.ts` `CandidatoVisual.score`,
 * `assets/resolver.py`, `musica/resolver_musica.py`) y nunca se
 * escriben acá -- la separación "score interno" vs "resultado real"
 * que pide la directiva ya es estructural, no una convención que se
 * pueda romper por accidente.
 */
export type EntradaLaboratorio = {
  id: string;
  /** lo que CREEMOS que puede funcionar -- siempre HIPOTESIS, nunca
   * afirmado como hecho. */
  hipotesis: string;
  /** que se probo concretamente (que combinacion de componentes/
   * hook/estructura). */
  experimento: string;
  videoId?: string;
  /** Opcional -- solo cuando esta entrada de laboratorio es
   * específicamente un experimento A/B con variantes explícitas (no
   * todas las hipótesis lo son). Ver `ExperimentoAB` arriba. */
  experimentoAB?: ExperimentoAB;
  /** null mientras no haya dato real -- NUNCA se rellena con una
   * estimacion (seccion 19). */
  resultadoReal: ResultadoReal | null;
  /** solo tiene sentido escribir esto cuando resultadoReal existe. */
  conclusion: string | null;
  estado: EstadoExperimento;
  fechaCreacion: string;
};
