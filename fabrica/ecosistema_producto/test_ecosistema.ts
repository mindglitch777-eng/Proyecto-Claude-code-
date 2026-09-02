import {DERIVACIONES} from './datos';
import {derivacionesDe, formatosPendientesPara, validarDerivaciones} from './consultar';
import type {DerivacionFormato} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('DERIVACIONES real esta vacio (ningun contenido nuevo generado esta ronda)', DERIVACIONES.length === 0);
check('validarDerivaciones no lanza sobre el almacen vacio', (() => {
  try {
    validarDerivaciones();
    return true;
  } catch {
    return false;
  }
})());

// Fixtures LOCALES de prueba (nunca en datos.ts) -- usan un id REAL
// del Knowledge Engine para poder probar la integridad referencial.
const derivacionesTest: DerivacionFormato[] = [
  {id: 'd1', fuenteConocimientoId: 'loewenstein-1994-brecha-curiosidad', formato: 'video', titulo: 'test', estado: 'publicado', fecha: '2026-09-02'},
  {id: 'd2', fuenteConocimientoId: 'loewenstein-1994-brecha-curiosidad', formato: 'post', titulo: 'test', estado: 'planeado', fecha: '2026-09-02'},
];

check('derivacionesDe encuentra las 2 derivaciones de esa fuente', derivacionesDe('loewenstein-1994-brecha-curiosidad', derivacionesTest).length === 2);
check('derivacionesDe con una fuente sin derivaciones da vacio', derivacionesDe('zeigarnik-1927-tareas-incompletas', derivacionesTest).length === 0);

const pendientes = formatosPendientesPara('loewenstein-1994-brecha-curiosidad', derivacionesTest);
check('formatosPendientesPara excluye video y post (ya derivados)', !pendientes.includes('video') && !pendientes.includes('post'));
check('formatosPendientesPara incluye carrusel (todavia no derivado)', pendientes.includes('carrusel'));

check('validarDerivaciones no lanza con una fuente real', (() => {
  try {
    validarDerivaciones(derivacionesTest);
    return true;
  } catch {
    return false;
  }
})());

check('validarDerivaciones lanza con una fuente de conocimiento inventada', (() => {
  try {
    validarDerivaciones([{id: 'd3', fuenteConocimientoId: 'esto-no-existe', formato: 'video', titulo: 'x', estado: 'planeado', fecha: '2026-09-02'}]);
    return false;
  } catch {
    return true;
  }
})());

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Product Ecosystem (fabrica/ecosistema_producto) pasaron OK.');
