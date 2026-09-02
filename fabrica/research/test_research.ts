import {INVESTIGACION_NECESARIA} from './investigacion_necesaria';
import {porEstado, pendientes, porId} from './consultar';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('el registro no esta vacio', INVESTIGACION_NECESARIA.length > 0);
check('todos los ids son unicos', new Set(INVESTIGACION_NECESARIA.map((i) => i.id)).size === INVESTIGACION_NECESARIA.length);

for (const item of INVESTIGACION_NECESARIA) {
  check(`${item.id}: pregunta no vacia`, item.pregunta.trim().length > 0);
  check(`${item.id}: bloqueo no vacio (nunca "no se pudo" sin explicar por que)`, item.bloqueo.trim().length > 0);
  check(`${item.id}: estado != 'pendiente' siempre trae resolucion`, item.estado === 'pendiente' || !!item.resolucion);
}

check('pendientes() no incluye la descartada de estadisticas no verificables', !pendientes().some((i) => i.id === 'estadisticas-tiktok-blogs-no-verificables'));
check('porEstado("descartada") incluye esa misma entrada', porEstado('descartada').some((i) => i.id === 'estadisticas-tiktok-blogs-no-verificables'));
check('porId encuentra una entrada real', porId('tiktok-creator-academy-oficial-bloqueado')?.estado === 'pendiente');
check('porId con id inexistente devuelve undefined', porId('esto-no-existe') === undefined);

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Research System (fabrica/research) pasaron OK.');
