import {SKILLS_INVESTIGADAS} from './registro';
import {porDecision, porId, listasParaUsar} from './consultar';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('el registro no esta vacio', SKILLS_INVESTIGADAS.length > 0);
check('todos los ids son unicos', new Set(SKILLS_INVESTIGADAS.map((s) => s.id)).size === SKILLS_INVESTIGADAS.length);

for (const s of SKILLS_INVESTIGADAS) {
  check(`${s.id}: nombre no vacio`, s.nombre.trim().length > 0);
  check(`${s.id}: fuente no vacia`, s.fuente.trim().length > 0);
  check(`${s.id}: riesgo no vacio (toda decision documenta su riesgo, aunque sea "ninguno")`, s.riesgo.trim().length > 0);
}

check('porId encuentra una entrada real', porId('remotion-transitions')?.decision === 'usar');
check('porId con id inexistente devuelve undefined', porId('esto-no-existe') === undefined);

check('porDecision("descartar") incluye remotion-superpowers', porDecision('descartar').some((s) => s.id === 'remotion-superpowers'));
check('listasParaUsar incluye los 4 paquetes reales de Ronda 6', ['remotion-transitions', 'remotion-effects', 'remotion-three', 'remotion-rough-notation'].every((id) => listasParaUsar().some((s) => s.id === id)));
check('listasParaUsar NUNCA incluye algo bloqueado por hardware', !listasParaUsar().some((s) => s.id === 'huggingface-video-gen'));

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Skill Intelligence System (fabrica/skills) pasaron OK.');
