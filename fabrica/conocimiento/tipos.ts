/**
 * Knowledge Engine v2 (Ronda 7, directiva "Sistema Operativo de
 * Contenido y Ventas", FASE NUEVA 1). Evoluciona el schema de Ronda 6
 * (`nivel`+`confirmado`+`tags` nada más) al set de campos pedido
 * explícitamente esta ronda: concepto, descripción, categoría,
 * fuente, evidencia, fecha, contexto, nivel de confianza, ejemplos,
 * limitaciones, si es hipótesis o evidencia, cómo puede usarse, qué NO
 * demuestra.
 *
 * Los 6 items de Ronda 6 se migraron a este schema (ver base.ts) --
 * ningún dato se perdió, se completaron los campos nuevos.
 */

/** Taxonomía pedida explícitamente por la directiva (27 categorías).
 * Union type, no enum cerrado en tiempo de ejecución -- agregar una
 * categoría nueva es agregarla acá, igual que agregar un `EstiloId`. */
export type CategoriaConocimiento =
  | 'hooks' | 'retencion' | 'storytelling' | 'estructuras' | 'ritmo'
  | 'edicion' | 'motion_design' | 'captions' | 'audio' | 'musica' | 'sfx'
  | 'visuales' | 'broll' | 'transiciones' | 'narracion'
  | 'psicologia_atencion' | 'presentacion_informacion' | 'cta'
  | 'ventas' | 'ofertas' | 'funnels' | 'productos_digitales'
  | 'carruseles' | 'distribucion' | 'formatos' | 'casos_reales'
  | 'skills' | 'herramientas';

/**
 * Niveles pedidos textualmente por la directiva: EVIDENCIA, PATRÓN
 * OBSERVADO, BUENA PRÁCTICA, HIPÓTESIS, EXPERIMENTO, RESULTADO REAL,
 * CONCLUSIÓN. Reemplaza el enum más fino de Ronda 6
 * (evidencia_academica/evidencia_oficial_plataforma/heuristica_secundaria/
 * anecdotico) -- esa distinción no se pierde, pasa a `subtipoEvidencia`
 * (solo relevante cuando nivel='evidencia') y a `nivelConfianza`.
 *
 * - evidencia: estudio revisado por pares, documentación oficial de
 *   una plataforma, o un resultado real medido por NOSOTROS (ver
 *   subtipoEvidencia). Lo más cercano a un hecho que tenemos.
 * - patron_observado: algo que se repite consistentemente en
 *   contenido real (nuestro o de terceros creíbles) o en múltiples
 *   fuentes independientes, SIN que exista un estudio o dato oficial
 *   que lo respalde -- más fuerte que una anécdota suelta, más débil
 *   que evidencia real.
 * - buena_practica: convención aceptada del oficio (edición,
 *   copywriting, diseño) -- no es un hallazgo científico, es consenso
 *   de la práctica profesional, generalmente con un nombre/autor
 *   identificable (ej. "value ladder" de Russell Brunson).
 * - hipotesis / experimento / resultado_real / conclusion: igual
 *   significado que ya usaba `memoria/tipos.ts` ExperimentoAB -- un
 *   ítem de conocimiento puede nacer como hipótesis, pasar a
 *   experimento, y (con datos reales) resolverse en resultado_real +
 *   conclusion.
 */
export type NivelConocimiento =
  | 'evidencia'
  | 'patron_observado'
  | 'buena_practica'
  | 'hipotesis'
  | 'experimento'
  | 'resultado_real'
  | 'conclusion';

export type SubtipoEvidencia = 'academica' | 'oficial_plataforma' | 'caso_real';

/** Solo estos niveles pueden marcar `confirmado: true` -- todo lo
 * demás es pista, nunca hecho, sin excepción (regla dura heredada de
 * Ronda 5/6, ahora con el vocabulario nuevo de la directiva). */
export const NIVELES_CONFIRMADOS: NivelConocimiento[] = ['evidencia', 'resultado_real'];

export type NivelConfianza = 'alta' | 'media' | 'baja';

export type ItemConocimiento = {
  id: string;
  concepto: string;
  descripcion: string;
  categoria: CategoriaConocimiento;
  tags: string[];
  nivel: NivelConocimiento;
  /** Solo cuando nivel='evidencia' -- de qué TIPO de evidencia se trata. */
  subtipoEvidencia?: SubtipoEvidencia;
  /** true solo si nivel está en NIVELES_CONFIRMADOS -- campo
   * redundante a propósito (ver Ronda 6): hace el filtro trivial sin
   * repetir la lista en cada consumidor. */
  confirmado: boolean;
  fuente: string;
  fecha: string;
  /** En qué contexto aplica esto -- ej. "video corto vertical
   * (TikTok/Reels/Shorts), no aplica necesariamente a video largo". */
  contexto?: string;
  nivelConfianza: NivelConfianza;
  ejemplos: string[];
  /** Qué limita o condiciona esta afirmación -- nunca vacío para
   * nivel != 'evidencia' con subtipoEvidencia='academica' de máxima calidad. */
  limitaciones: string;
  /** Cómo se puede usar esto en la fábrica/el negocio -- reemplaza
   * `aplicacionFabrica` de Ronda 6 (ahora el alcance es más amplio que
   * solo video). */
  comoUtilizarlo?: string;
  /** Qué NO demuestra esto -- previene la lectura de "esto prueba que
   * X funciona siempre" cuando en realidad prueba algo más acotado. */
  queNoDemuestra: string;
};
