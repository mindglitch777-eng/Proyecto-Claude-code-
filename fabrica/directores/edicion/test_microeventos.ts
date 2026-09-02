import {combinarEstilos} from './estilos';
import {construirMicroeventos} from './microeventos';
import type {ContextoUnidad} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

const ctxBase: ContextoUnidad = {
  unidadId: 'u1', categoria: 'texto', intensidadComponente: 0.5,
  indice: 1, total: 5, duracionSegTotal: 8, offsetsAudioSeg: [0],
};

function main() {
  // Respiracion: casi nada mas alla de la entrada + un evento de silencio.
  const combi = combinarEstilos(['cinematico']);
  const principal = {tipo: 'concepto' as const, descripcion: 'la idea central'};
  const eventosRespiro = construirMicroeventos(ctxBase, combi, principal, undefined, true);
  check('respiracion produce exactamente 2 microeventos', eventosRespiro.length === 2);
  check('respiracion incluye un microevento tipo silencio', eventosRespiro.some((e) => e.tipo === 'silencio'));

  // Todo microevento esta anclado a un offset real -- nunca a un
  // numero fuera de [0, duracionSegTotal] ni inventado.
  for (const e of eventosRespiro) {
    check(`microevento "${e.tipo}" esta dentro del rango de la escena`, e.enSegRelativo >= 0 && e.enSegRelativo <= ctxBase.duracionSegTotal);
  }

  // Multi-audio en categoria "comparacion": el offset del segundo clip
  // genera 'se_revela_comparacion' EXACTAMENTE en ese offset real (el
  // hallazgo real de fabrica-demo-04 que motiva este modulo).
  const ctxComparacion: ContextoUnidad = {
    ...ctxBase, categoria: 'comparacion', offsetsAudioSeg: [0, 2.618005],
  };
  const eventosComparacion = construirMicroeventos(ctxComparacion, combi, principal, undefined, false);
  const revelacion = eventosComparacion.find((e) => e.tipo === 'se_revela_comparacion');
  check('categoria comparacion con 2 audios genera un microevento se_revela_comparacion', !!revelacion);
  check('el microevento de revelacion esta anclado al offset REAL del segundo clip (no a una fraccion de la duracion total)',
    revelacion!.enSegRelativo === 2.618005);

  // Un solo audio (sin segundo offset): no se inventa un microevento
  // de revelacion que no tiene con que anclarse.
  const ctxSinSegundo: ContextoUnidad = {...ctxBase, categoria: 'comparacion', offsetsAudioSeg: [0]};
  const eventosSinSegundo = construirMicroeventos(ctxSinSegundo, combi, principal, undefined, false);
  check('sin un segundo offset real, no aparece se_revela_comparacion inventado', !eventosSinSegundo.some((e) => e.tipo === 'se_revela_comparacion'));

  // Repeticion tratada (tipoDatoDestacado + esRepeticionTratada): el
  // segundo offset marca 'cambia_cifra', no 'aparece_dato_apoyo' generico.
  const ctxRepeticion: ContextoUnidad = {
    ...ctxBase, categoria: 'cifra', tipoDatoDestacado: 'dinero', esRepeticionTratada: true,
    offsetsAudioSeg: [0, 3],
  };
  const eventosRepeticion = construirMicroeventos(ctxRepeticion, combi, {tipo: 'cifra', descripcion: 'la cifra'}, undefined, false);
  check('repeticion tratada con 2 audios genera cambia_cifra en el offset real', eventosRepeticion.some((e) => e.tipo === 'cambia_cifra' && e.enSegRelativo === 3));

  // Estilo con SFX preferido y densidad no minima: agrega entra_sfx.
  const combiAgresivo = combinarEstilos(['agresivo']);
  const eventosSfx = construirMicroeventos(ctxBase, combiAgresivo, principal, undefined, false);
  check('estilo agresivo (prefiere entra_sfx, densidad densa) agrega un microevento de SFX', eventosSfx.some((e) => e.tipo === 'entra_sfx'));

  // Estilo cinematico (densidad minima): NO agrega SFX aunque en teoria
  // otro estilo combinado lo pidiera -- densidad minima gana.
  const eventosSinSfx = construirMicroeventos(ctxBase, combi, principal, undefined, false);
  check('estilo cinematico (densidad minima) no agrega SFX de entrada', !eventosSinSfx.some((e) => e.tipo === 'entra_sfx'));

  if (FALLOS.length) {
    console.log(`\n${FALLOS.length} FALLO(S):\n`);
    for (const f of FALLOS) console.log(f);
    process.exit(1);
  }
  console.log('Todos los tests de microeventos.ts pasaron OK.');
}

main();
