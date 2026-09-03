import {CONOCIMIENTO} from './base';
import {porId, porCategoria, porTag, porNivel, soloConfirmados, buscar, validarIds} from './consultar';
import {NIVELES_CONFIRMADOS} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('la base no esta vacia', CONOCIMIENTO.length > 0);
check('todos los ids son unicos', new Set(CONOCIMIENTO.map((i) => i.id)).size === CONOCIMIENTO.length);

// Integridad real (regla dura heredada de Ronda 5/6, con el
// vocabulario nuevo de la directiva de Ronda 7): confirmado=true SOLO
// en 'evidencia'/'resultado_real' -- nunca en patron_observado/
// buena_practica/hipotesis, sin excepcion.
for (const item of CONOCIMIENTO) {
  const debeSerConfirmado = NIVELES_CONFIRMADOS.includes(item.nivel);
  check(`${item.id}: confirmado=${item.confirmado} coincide con su nivel (${item.nivel})`, item.confirmado === debeSerConfirmado);
  check(`${item.id}: tiene al menos un tag`, item.tags.length > 0);
  check(`${item.id}: concepto no vacio`, item.concepto.trim().length > 0);
  check(`${item.id}: descripcion no vacia`, item.descripcion.trim().length > 0);
  check(`${item.id}: fuente no vacia`, item.fuente.trim().length > 0);
  check(`${item.id}: limitaciones no vacias (nada esta libre de límites)`, item.limitaciones.trim().length > 0);
  check(`${item.id}: queNoDemuestra no vacio (disciplina anti-sobregeneralizacion)`, item.queNoDemuestra.trim().length > 0);
  check(`${item.id}: nivel='evidencia' siempre trae subtipoEvidencia`, item.nivel !== 'evidencia' || !!item.subtipoEvidencia);
  check(`${item.id}: subtipoEvidencia solo aparece si nivel='evidencia'`, !!item.subtipoEvidencia === (item.nivel === 'evidencia'));
}

check('porId encuentra un item real', porId('loewenstein-1994-brecha-curiosidad')?.categoria === 'psicologia_atencion');
check('porId con id inexistente devuelve undefined', porId('no-existe-esto') === undefined);

check('porCategoria("estructuras") trae al menos Freytag', porCategoria('estructuras').some((i) => i.id === 'freytag-1863-piramide-narrativa'));
check('porCategoria("ofertas") trae la escalera de valor', porCategoria('ofertas').some((i) => i.id === 'brunson-value-ladder'));

check('porTag("hooks") trae items reales', porTag('hooks').length > 0);
check('porTag con tag inexistente trae array vacio', porTag('esto-no-es-un-tag-real').length === 0);

check('porNivel("evidencia") trae Loewenstein, Zeigarnik, YouTube oficial, Silvia y WCAG contraste (5 items)', porNivel('evidencia').length === 5);
check('porNivel("patron_observado") NUNCA queda marcado confirmado', porNivel('patron_observado').every((i) => !i.confirmado));
check('porNivel("buena_practica") NUNCA queda marcado confirmado', porNivel('buena_practica').every((i) => !i.confirmado));

const confirmados = soloConfirmados();
check('soloConfirmados excluye toda heuristica/buena_practica/patron_observado', confirmados.every((i) => NIVELES_CONFIRMADOS.includes(i.nivel)));
check('soloConfirmados no esta vacio (hay evidencia academica y oficial real)', confirmados.length > 0);

check('buscar("curiosidad") encuentra el item de Loewenstein', buscar('curiosidad').some((i) => i.id === 'loewenstein-1994-brecha-curiosidad'));
check('buscar con texto sin coincidencias trae vacio', buscar('esto-no-deberia-matchear-nada-zzz').length === 0);

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
console.log('Todos los tests del Knowledge Engine v2 (fabrica/conocimiento) pasaron OK.');
