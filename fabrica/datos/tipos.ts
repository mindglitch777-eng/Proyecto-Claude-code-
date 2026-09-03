/**
 * Data Engine (Ronda 7, directiva FASE NUEVA 10): esquemas para
 * registrar TODO lo que la directiva pide de cada video y cada
 * producto -- "no asumir que los datos estarán disponibles
 * automáticamente. Cuando no exista integración, dejar el sistema
 * preparado para carga manual."
 *
 * Reutiliza tipos YA existentes en vez de duplicarlos:
 * `ResultadoReal` (fabrica/memoria/tipos.ts, Ronda 5) sigue siendo la
 * ÚNICA fuente de verdad de métricas reales de video (retención,
 * vistas, clics, ventas) -- esto no la copia, la referencia.
 */
import type {ResultadoReal} from '../memoria/tipos';

/**
 * "Video Intelligence" (mencionado como pendiente en
 * fabrica/docs/AUDITORIA_PROMPT_MAESTRO_2.md, Ronda 6, ítem 25):
 * representación estructurada de UN video completo -- idea, ángulo,
 * hook, estructura, cómo se hizo, y (cuando existan) sus métricas
 * reales. Pensado para acumularse y analizar MUCHOS videos después,
 * no solo documentar uno.
 */
export type RegistroVideoCompleto = {
  videoId: string;
  idea: string;
  tema: string;
  angulo: string;
  /** id opcional de fabrica/hooks/catalogo.ts -- qué patrón de
   * apertura se usó de verdad en este video. */
  hookPatronId?: string;
  /** ej. "hook-desarrollo-escalada-revelacion-cierre". */
  estructura: string;
  duracionSeg: number;
  voz: string;
  /** ids reales de fabrica/componentes/registro.json. */
  componentesUsados: string[];
  formato: string;
  /** dónde se publicó -- ausente mientras no se haya publicado. */
  plataforma?: string;
  /** null hasta que haya datos reales medidos -- MISMO tipo que ya
   * usa memoria/tipos.ts, nunca un score interno disfrazado de métrica. */
  metricas: ResultadoReal | null;
  fecha: string;
  /**
   * R7-29 (Fase 1 del prompt "Ronda de evolución real"): conecta el QA
   * (fabrica/qa/*.py) con el Data Engine -- antes de esto, el resultado
   * de correr QA sobre un render era efímero (se imprimía por stdout y
   * se perdía). `ok`/`problemas` son EXACTAMENTE lo que ya devuelven
   * `checks_duros.py`/`checks_composicion.py`/`contraste.py` en su JSON
   * de salida -- este campo no inventa un dato nuevo, solo le da un
   * lugar para persistir. Opcional porque no todo registro histórico
   * tiene un QA real corrido y guardado.
   */
  qaResumen?: {
    ok: boolean;
    problemas: string[];
    /** ej. "qa/checks_duros.py", "qa/contraste.py" -- de dónde salió
     * este resumen, para poder volver a correrlo si hace falta. */
    fuente: string;
  };
};

/**
 * Métricas de negocio de un producto -- complementa
 * fabrica/ventas/tipos.ts (que modela el PIPELINE) con el registro
 * PLANO de números por producto/oferta, para análisis agregado.
 */
export type RegistroProducto = {
  /** id real de fabrica/ventas Producto.id. */
  productoId: string;
  /** id real de fabrica/ventas Oferta.id. */
  ofertaId: string;
  fuenteTrafico: string;
  visitas?: number;
  leads?: number;
  ventas?: number;
  conversionesPct?: number;
  reembolsos?: number;
  fuente: string;
  fecha: string;
};
