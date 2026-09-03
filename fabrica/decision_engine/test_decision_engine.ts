import {DECISIONES_ARQUITECTURA} from './decisiones';
import {porId, abiertas, validarDecisiones} from './consultar';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('hay al menos 1 decision registrada', DECISIONES_ARQUITECTURA.length > 0);

check('validarDecisiones no lanza (todas las decisiones reales estan bien formadas)', (() => {
  try {
    validarDecisiones();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
})());

check('porId encuentra la decision real', porId('prioridad-post-ronda-7')?.opciones.length === 3);
check('porId con id inexistente devuelve undefined', porId('esto-no-existe') === undefined);

check('abiertas() incluye la decision real (no fue decidida todavia)', abiertas().some((d) => d.id === 'prioridad-post-ronda-7'));

const decision = porId('prioridad-post-ronda-7')!;
check('nunca se recomienda "la mas facil" sin mas -- la opcion recomendada tiene complejidad "baja" PERO la justificacion explica el motivo real (impacto en el objetivo de negocio), no "porque es facil"',
  !decision.justificacion.toLowerCase().includes('mas facil') && !decision.justificacion.toLowerCase().includes('más fácil'));
check('la recomendacion es un id de opcion real', decision.opciones.some((o) => o.id === decision.recomendacionId));

// Regla dura: ninguna opcion puede quedar sin comparacion real.
for (const opcion of decision.opciones) {
  check(`opcion "${opcion.id}": tiene ventajas Y desventajas (comparacion real, no unilateral)`, opcion.ventajas.length > 0 && opcion.desventajas.length > 0);
  check(`opcion "${opcion.id}": declara riesgos (aunque sea ninguno relevante)`, Array.isArray(opcion.riesgos));
}

// Deteccion de una decision mal formada (fixture local de test,
// insertada y removida del mismo array real -- no queda en decisiones.ts).
check('validarDecisiones detecta una decision con 1 sola opcion', (() => {
  const original = [...DECISIONES_ARQUITECTURA];
  DECISIONES_ARQUITECTURA.push({
    id: 'test-invalida', pregunta: 'x', fecha: '2026-09-03', estado: 'abierta',
    opciones: [{id: 'o1', nombre: 'x', queHace: 'x', ventajas: ['x'], desventajas: ['x'], dependencias: [], costos: 'x', riesgos: [], potencial: 'x', complejidad: 'baja'}],
    recomendacionId: 'o1', justificacion: 'x',
  });
  let lanzo = false;
  try {
    validarDecisiones();
  } catch {
    lanzo = true;
  }
  DECISIONES_ARQUITECTURA.length = 0;
  DECISIONES_ARQUITECTURA.push(...original);
  return lanzo;
})());

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Decision Engine (fabrica/decision_engine) pasaron OK.');
