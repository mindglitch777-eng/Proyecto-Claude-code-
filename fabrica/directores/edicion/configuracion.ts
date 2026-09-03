/**
 * Configuración de estilo a nivel de VIDEO completo (Fase 13 del
 * prompt "Ronda de evolución real": evitar que cambiar la sensación
 * general de un video requiera editar código).
 *
 * Auditoría previa a construir esto (regla dura: buscar si ya existe
 * algo equivalente antes de crear algo nuevo): `ContextoUnidad.estilosSugeridos`
 * (tipos.ts) YA es el mecanismo real para influir el estilo sin tocar
 * `DirectorEdicion` -- lo que faltaba era una capa de PRESETS
 * reutilizables a nivel de video completo, para no repetir el mismo
 * array de estilos a mano en cada `ejemplos/generar_demo_XX.ts` (ver
 * `estilosSugeridos: ['storytelling']` repetido igual en demo_05/06/07).
 *
 * Esto NO reemplaza `ESTILOS` (estilos.ts, el catálogo de estilos
 * individuales) ni `DirectorEdicion.decidirEstilos()` (que sigue
 * siendo quien decide la combinación final) -- es una capa de
 * conveniencia ANTES de esos dos, que un generador puede usar en vez
 * de escribir el array a mano.
 */
import type {ContextoUnidad, EstiloId} from './tipos';

export type IdConfiguracionVideo =
  | 'ventas_agresivo' | 'documental_serio' | 'financiero_directo' | 'misterio_revelacion' | 'educativo_calmo';

export type ConfiguracionVideo = {
  id: IdConfiguracionVideo;
  nombre: string;
  descripcion: string;
  /** Se pasa como `estilosSugeridos` a cada unidad que no defina uno
   * propio -- sigue siendo una SUGERENCIA (mismo principio que el
   * campo que envuelve), `combinarEstilos()` puede advertir si no
   * combina bien, nunca se fuerza. */
  estilosBase: EstiloId[];
  /** Por qué esta combinación, con referencia a la fuente real cuando
   * aplica (mismo estándar de trazabilidad que el resto del proyecto). */
  razon: string;
};

export const CONFIGURACIONES_VIDEO: Record<IdConfiguracionVideo, ConfiguracionVideo> = {
  ventas_agresivo: {
    id: 'ventas_agresivo',
    nombre: 'Ventas agresivo',
    descripcion: 'Ritmo rápido, énfasis en cifras, poca respiración -- para contenido de oferta/resultado directo.',
    estilosBase: ['agresivo', 'data'],
    razon: 'Combinación ya usada implícitamente en guiones de resultado de negocio (Tomás/$89) -- formaliza el patrón sin agregar uno nuevo.',
  },
  documental_serio: {
    id: 'documental_serio',
    nombre: 'Documental serio',
    descripcion: 'Ritmo pausado, tono narrativo, prioriza continuidad sobre impacto.',
    estilosBase: ['documental', 'cinematico'],
    razon: 'Mismo par usado a mano en demo_05/06/07 para el hook -- formaliza como preset reutilizable.',
  },
  financiero_directo: {
    id: 'financiero_directo',
    nombre: 'Financiero / respuesta directa',
    descripcion: 'Claridad por sobre estilo -- prioriza datos y estructura documental, evita adornos de misterio/cinematico.',
    estilosBase: ['data', 'documental'],
    razon: 'Basado en conocimiento/base.ts id "edicion-por-nicho-financiero-respuesta-directa" (R7-28): "priorización explícita de la CLARIDAD por sobre el estilo visual" para este nicho.',
  },
  misterio_revelacion: {
    id: 'misterio_revelacion',
    nombre: 'Misterio con revelación',
    descripcion: 'Construye tensión antes de revelar -- para guiones con un giro/dato sorpresa central.',
    estilosBase: ['misterio', 'storytelling'],
    razon: 'Combinación ya declarada compatible en estilos.ts (misterio.compatibleCon incluye storytelling) -- la formaliza como preset de video completo.',
  },
  educativo_calmo: {
    id: 'educativo_calmo',
    nombre: 'Educativo calmo',
    descripcion: 'Ritmo bajo, prioriza comprensión sobre impacto -- para explicar un concepto sin urgencia de venta.',
    estilosBase: ['documental', 'data'],
    razon: 'Combina el estilo más neutro (documental) con el más orientado a claridad de datos (data), sin ningún estilo de alta energía (agresivo/misterio/cinematico).',
  },
};

/**
 * Aplica una configuración de video a un `ContextoUnidad` que todavía
 * no tiene `estilosSugeridos` propio -- NUNCA pisa un valor ya puesto
 * a mano por el generador (mismo principio de "sugerencia, no orden"
 * que ya rige `estilosSugeridos` dentro de `DirectorEdicion`).
 */
export function aplicarConfiguracionVideo(ctx: ContextoUnidad, configId: IdConfiguracionVideo): ContextoUnidad {
  if (ctx.estilosSugeridos && ctx.estilosSugeridos.length > 0) return ctx;
  const config = CONFIGURACIONES_VIDEO[configId];
  return {...ctx, estilosSugeridos: config.estilosBase};
}
