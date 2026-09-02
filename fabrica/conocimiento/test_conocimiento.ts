import {CONOCIMIENTO} from './base';
import {porId, porTema, porTag, porNivel, soloConfirmados, validarIds} from './consultar';
import {NIVELES_CONFIRMADOS} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('la base no esta vacia', CONOCIMIENTO.length > 0);
check('todos los ids son unicos', new Set(CONOCIMIENTO.map((i) => i.id)).size === CONOCIMIENTO.length);

// Integridad real (orden maestra seccion 21): confirmado=true SOLO en
// los niveles que de verdad son evidencia/resultado real -- nunca en
// heuristica/anecdotico/hipotesis, sin excepcion.
for (const item of CONOCIMIENTO) {
  const debeSerConfirmado = NIVELES_CONFIRMADOS.includes(item.nivel);
  check(
    `${item.id}: confirmado=${item.confirmado} coincide con su nivel (${item.nivel})`,
    item.confirmado === debeSerConfirmado
  );
  check(`${item.id}: tiene al menos un tag`, item.tags.length > 0);
  check(`${item.id}: tiene afirmacion no vacia`, item.afirmacion.trim().length > 0);
}

check('porId encuentra un item real', porId('loewenstein-1994-brecha-curiosidad')?.tema === 'curiosidad-brecha-informacion');
check('porId con id inexistente devuelve undefined', porId('no-existe-esto') === undefined);

check('porTema("loops-abiertos") trae al menos los 2 items reales (Zeigarnik + heuristica aplicada)', porTema('loops-abiertos').length >= 2);

check('porTag("hook") trae items reales', porTag('hook').length > 0);
check('porTag con tag inexistente trae array vacio', porTag('esto-no-es-un-tag-real').length === 0);

check('porNivel("evidencia_academica") trae Loewenstein y Zeigarnik', porNivel('evidencia_academica').length === 2);
check('porNivel("heuristica_secundaria") NUNCA queda marcado confirmado', porNivel('heuristica_secundaria').every((i) => !i.confirmado));

const confirmados = soloConfirmados();
check('soloConfirmados excluye toda heuristica/anecdotico/hipotesis', confirmados.every((i) => NIVELES_CONFIRMADOS.includes(i.nivel)));
check('soloConfirmados no esta vacio (hay evidencia academica y oficial real)', confirmados.length > 0);

check('validarIds no lanza con ids reales', (() => {
  try {
    validarIds(['loewenstein-1994-brecha-curiosidad', 'zeigarnik-1927-tareas-incompletas']);
    return true;
  } catch {
    return false;
  }
})());

check('validarIds lanza con un id inventado', (() => {
  try {
    validarIds(['esto-no-existe']);
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
console.log('Todos los tests del Knowledge Engine (fabrica/conocimiento) pasaron OK.');
