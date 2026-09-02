import {combinarEstilos, ESTILOS} from './estilos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

function main() {
  // Los 6 estilos de partida existen y tienen los campos minimos.
  for (const id of ['documental', 'agresivo', 'data', 'misterio', 'storytelling', 'cinematico'] as const) {
    check(`estilo "${id}" existe en ESTILOS`, !!ESTILOS[id]);
    check(`estilo "${id}" tiene al menos 2 principios`, ESTILOS[id].principios.length >= 2);
  }

  // Un solo estilo: sin advertencias, densidad/energia son las propias.
  const solo = combinarEstilos(['documental']);
  check('un solo estilo no genera advertencias', solo.advertencias.length === 0);
  check('un solo estilo hereda su densidadVisual', solo.densidadVisual === ESTILOS.documental.densidadVisualPreferida);
  check('un solo estilo hereda su ajusteEnergia', solo.ajusteEnergia === ESTILOS.documental.ajusteEnergia);

  // Combinacion declarada como compatible (documental + data): sin advertencias.
  const compatibles = combinarEstilos(['documental', 'data']);
  check('documental + data (compatibles) no genera advertencias', compatibles.advertencias.length === 0);

  // Combinacion NO declarada como compatible en ninguna de las dos
  // fichas (agresivo + misterio: ni uno lista al otro): advierte, pero
  // NO tira excepcion ni bloquea el resultado (heuristica, no regla dura).
  check('agresivo no lista a misterio como compatible', !ESTILOS.agresivo.compatibleCon.includes('misterio'));
  check('misterio no lista a agresivo como compatible', !ESTILOS.misterio.compatibleCon.includes('agresivo'));
  const incompatibles = combinarEstilos(['agresivo', 'misterio']);
  check('agresivo + misterio (no declarados compatibles) genera advertencia', incompatibles.advertencias.length === 1);
  check('la combinacion sigue devolviendo un resultado usable pese a la advertencia', !!incompatibles.densidadVisual);

  // El primero decide densidadVisual en caso de conflicto.
  const ordenA = combinarEstilos(['agresivo', 'cinematico']); // densa vs minima
  check('el primer estilo de la lista decide densidadVisual', ordenA.densidadVisual === 'densa');
  const ordenB = combinarEstilos(['cinematico', 'agresivo']);
  check('invertir el orden invierte cual densidad gana', ordenB.densidadVisual === 'minima');

  // ajusteEnergia se promedia (no se suma sin limite).
  const promedio = combinarEstilos(['agresivo', 'cinematico']); // 0.6 y -0.4 -> promedio 0.1
  check('ajusteEnergia es el promedio de los estilos combinados', Math.abs(promedio.ajusteEnergia - 0.1) < 1e-9);

  // principios/funciones/microeventos se UNEN sin duplicados.
  const union = combinarEstilos(['documental', 'agresivo']);
  const setPrincipios = new Set(union.principios);
  check('principios combinados no tienen duplicados', setPrincipios.size === union.principios.length);
  check('principios combinados incluyen los de ambos estilos', union.principios.length > ESTILOS.documental.principios.length);

  check('combinarEstilos([]) tira error en vez de devolver un resultado invalido', (() => {
    try { combinarEstilos([]); return false; } catch { return true; }
  })());

  if (FALLOS.length) {
    console.log(`\n${FALLOS.length} FALLO(S):\n`);
    for (const f of FALLOS) console.log(f);
    process.exit(1);
  }
  console.log('Todos los tests de estilos.ts pasaron OK.');
}

main();
