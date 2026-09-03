import {CURVA_HOOK_ESCALADA_PAYOFF, empujarHaciaCurva, nivelObjetivoEnProgreso} from './curva_energia';
import {DirectorEdicion} from './edicion';
import type {ContextoUnidad} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

function main() {
  // nivelObjetivoEnProgreso: vecino mas cercano, no interpolacion lineal.
  check('progreso 0.0 -> alta (hook)', nivelObjetivoEnProgreso(CURVA_HOOK_ESCALADA_PAYOFF, 0).nivelObjetivo === 'alta');
  check('progreso 0.7 -> muy_alta (revelacion)', nivelObjetivoEnProgreso(CURVA_HOOK_ESCALADA_PAYOFF, 0.7).nivelObjetivo === 'muy_alta');
  check('progreso 1.0 -> media (cierre)', nivelObjetivoEnProgreso(CURVA_HOOK_ESCALADA_PAYOFF, 1.0).nivelObjetivo === 'media');
  check('cada punto de la curva tiene una razon explicada (nada invisible)', CURVA_HOOK_ESCALADA_PAYOFF.puntos.every((p) => p.razon.trim().length > 0));

  // empujarHaciaCurva: SOLO empuja hacia arriba, nunca hacia abajo.
  check('empujarHaciaCurva(baja, alta) = alta (empuja arriba)', empujarHaciaCurva('baja', 'alta') === 'alta');
  check('empujarHaciaCurva(muy_alta, baja) = muy_alta (NUNCA empuja abajo)', empujarHaciaCurva('muy_alta', 'baja') === 'muy_alta');
  check('empujarHaciaCurva(media, media) = media (sin cambio)', empujarHaciaCurva('media', 'media') === 'media');

  // Integracion real con DirectorEdicion.planificar(): la curva NUNCA
  // contradice una unidad de respiracion real (dejar_respirar siempre baja).
  const director = new DirectorEdicion();
  const ctxRespiracion: ContextoUnidad = {
    unidadId: 'pausa', categoria: 'texto', intensidadComponente: 0.2,
    indice: 3, total: 7, duracionSegTotal: 4, offsetsAudioSeg: [0],
  };
  // progreso = 3/6 = 0.5 -- la curva pide "baja" ahi (micro pausa), consistente,
  // pero igual verificamos que el mecanismo no ROMPE la regla de respiracion.
  const estrategiaRespiracion = director.planificar(ctxRespiracion, 'negro', [], CURVA_HOOK_ESCALADA_PAYOFF);
  check('unidad de respiracion real sigue en energia baja aunque se pase una curva', estrategiaRespiracion.energia === 'baja');

  // Sin curva (retrocompatibilidad): el comportamiento no cambia
  // respecto de llamar planificar() sin el 4to parametro.
  const ctxHook: ContextoUnidad = {
    unidadId: 'hook', categoria: 'texto', intensidadComponente: 0.75,
    indice: 0, total: 7, duracionSegTotal: 5, offsetsAudioSeg: [0], esPrimera: true,
  };
  const sinCurva = director.planificar(ctxHook, 'ninguno', []);
  const conCurva = director.planificar(ctxHook, 'ninguno', [], CURVA_HOOK_ESCALADA_PAYOFF);
  // El hook YA calcula "alta" por contenido propio (intensidadComponente alta
  // + intencion enganchar sube energia) -- la curva en progreso 0 tambien
  // pide "alta", asi que con o sin curva el resultado debe ser el mismo aca
  // (la curva no tiene nada nuevo que empujar en este caso puntual).
  check('sin curva y con curva alineada dan el mismo resultado en el hook (no hay contradiccion real)', sinCurva.energia === conCurva.energia);

  if (FALLOS.length) {
    console.log(`\n${FALLOS.length} FALLO(S):\n`);
    for (const f of FALLOS) console.log(f);
    process.exit(1);
  }
  console.log('Todos los tests de la curva de energia (fabrica/directores/edicion/curva_energia.ts) pasaron OK.');
}

main();
