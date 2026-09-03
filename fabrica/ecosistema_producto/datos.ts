import type {DerivacionFormato} from './tipos';

/** Primera derivación real (R7-14): el generador completo de
 * carruseles (fabrica/carrusel/generar.ts) tomó el item de
 * conocimiento "brunson-value-ladder" y produjo un carrusel real de
 * 7 slides, renderizados de verdad (7 PNG en
 * fabrica/salidas/carrusel_001/). Estado 'en_progreso' porque el
 * artefacto existe pero no se publicó todavía en ninguna red -- eso
 * requeriría confirmación del operador (regla de oro, CLAUDE.md). */
export const DERIVACIONES: DerivacionFormato[] = [
  {
    id: 'd-carrusel-brunson-value-ladder',
    fuenteConocimientoId: 'brunson-value-ladder',
    formato: 'carrusel',
    titulo: 'Escalera de valor (Value Ladder) -- carrusel de 7 slides',
    estado: 'en_progreso',
    fecha: '2026-09-03',
    artefactoRef: 'fabrica/salidas/carrusel_001/ (7 PNG, generado con fabrica/carrusel/generar.ts)',
  },
];
