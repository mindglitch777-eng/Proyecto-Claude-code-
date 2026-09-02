import path from 'node:path';
import {correrCicloMejora, extraerCorreccionesSeguras, formatearReporteIteraciones, type ParametrosGeneracion} from './ciclo_mejora';
import type {ArbolComposicion} from '../composicion/tipos';
import type {TipoGolpe} from '../directores/audio';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

const RAIZ = path.resolve(__dirname, '..', '..');
const PUBLIC_DIR_REAL = path.join(RAIZ, 'remotion-spike/public'); // tiene fabrica_demo_04/*.wav reales, ya commiteados

/** Arbol sintetico con un problema DELIBERADO y reproducible: dos
 * escenas seguidas con el mismo golpe ('fogonazo') Y la misma
 * categoria de componente ('punch' -> texto) -- la primera es
 * "corregible" por el ciclo (evitarGolpesExtra), la segunda NO (el
 * ciclo no cambia de componente por su cuenta). Usa audio REAL ya
 * commiteado (fabrica_demo_04) para que checks_composicion.py no
 * reporte un problema DURO de "audio faltante" que ensuciaria el test. */
function generarArbolPrueba(params: ParametrosGeneracion): ArbolComposicion {
  const golpeB: TipoGolpe = params.evitarGolpesExtra.includes('fogonazo') ? 'corte' : 'fogonazo';
  return {
    id: 'prueba-ciclo-mejora', fps: 30,
    escenas: [
      {
        unidadId: 'a', desdeSeg: 0, duracionSeg: 3, componenteId: 'punch',
        props: {lineas: ['linea a'], entra: [0]},
        audios: [{archivo: 'fabrica_demo_04/hook_0.wav', desdeSegRelativo: 0, duracionSeg: 2.751995}],
        golpe: 'fogonazo', volumenSfx: 0.5,
      },
      {
        unidadId: 'b', desdeSeg: 3, duracionSeg: 3, componenteId: 'punch',
        props: {lineas: ['linea b'], entra: [0]},
        audios: [{archivo: 'fabrica_demo_04/hook_1.wav', desdeSegRelativo: 0, duracionSeg: 1.984014}],
        golpe: golpeB, volumenSfx: 0.5,
      },
    ],
    duracionTotalSeg: 6.5,
  };
}

function main() {
  // extraerCorreccionesSeguras: reconoce el patron real que produce
  // checks_composicion.py, no un texto inventado a mano.
  const alertaGolpe = "escenas 'a' y 'b' seguidas usan el mismo golpe de transicion ('fogonazo') -- poca variedad de corte";
  const {golpes, razones} = extraerCorreccionesSeguras([alertaGolpe, 'otra alerta sin relacion']);
  check('extrae el golpe repetido de una alerta real', golpes.length === 1 && golpes[0] === 'fogonazo');
  check('genera una razon legible', razones.length === 1);

  const sinMatch = extraerCorreccionesSeguras(['la cifra "47" aparece en el texto de 2 escenas distintas']);
  check('una alerta de otro tipo (cifra repetida) no se propone como correccion segura', sinMatch.golpes.length === 0);

  // Ciclo completo contra los scripts reales de QA/critica (via
  // shell-out, igual que hace la fabrica en produccion).
  const rutaTemporal = path.join(RAIZ, 'fabrica/laboratorio/.tmp_test_ciclo.json');
  const historial = correrCicloMejora(generarArbolPrueba, {maxIteraciones: 2, rutaTemporal, publicDir: PUBLIC_DIR_REAL});

  check('el ciclo corrio 2 intentos (encontro una correccion segura en el primero)', historial.length === 2);
  check('intento 1 detecto el golpe repetido', historial[0].alertasComposicion.some((a) => a.includes('mismo golpe de transicion')));
  check('intento 1 SI aplico correcciones (habia mas intentos disponibles)', historial[0].seAplicaronCorrecciones === true);
  check('intento 2 ya no tiene el golpe repetido (la correccion se aplico de verdad)',
    !historial[1].alertasComposicion.some((a) => a.includes('mismo golpe de transicion')));
  check('intento 2 el arbol tiene golpes distintos en las 2 escenas', historial[1].arbol.escenas[0].golpe !== historial[1].arbol.escenas[1].golpe);
  check('intento 2 NO propone mas correcciones (llego al tope de iteraciones)', historial[1].seAplicaronCorrecciones === false);
  // La categoria repetida (punch+punch) sigue ahi -- el ciclo NUNCA
  // inventa una correccion para algo que no sabe corregir con seguridad.
  check('la categoria repetida sigue reportada en ambos intentos (no es "corregible" por este ciclo)',
    historial[1].alertasComposicion.some((a) => a.includes('misma categoria de componente')));

  // totalProblemas (Ronda 5, seccion 15): cuenta real, no inventada,
  // de alertasComposicion + alertasCritica por intento.
  check('intento 1 totalProblemas coincide con la suma real de alertas',
    historial[0].totalProblemas === historial[0].alertasComposicion.length + historial[0].alertasCritica.length);
  check('intento 2 tiene MENOS problemas que el intento 1 (la correccion redujo algo real)',
    historial[1].totalProblemas < historial[0].totalProblemas);

  // formatearReporteIteraciones (seccion 15): formato exacto pedido.
  const reporte = formatearReporteIteraciones('video_prueba_ciclo', historial);
  const lineas = reporte.split('\n');
  check('el reporte empieza con el id del video', lineas[0] === 'video_prueba_ciclo');
  check('el reporte termina en FINAL', lineas[lineas.length - 1] === 'FINAL');
  check('el reporte tiene una linea "iteracion_N -> M problemas" por cada intento',
    lineas.length === historial.length + 2);
  const n0 = historial[0].totalProblemas;
  check('la primera iteracion en el texto coincide con el conteo real', lineas[1] === `iteracion_1 -> ${n0} problema${n0 === 1 ? '' : 's'}`);

  if (FALLOS.length) {
    console.log(`\n${FALLOS.length} FALLO(S):\n`);
    for (const f of FALLOS) console.log(f);
    process.exit(1);
  }
  console.log('Todos los tests del ciclo de mejora controlado pasaron OK.');
}

main();
