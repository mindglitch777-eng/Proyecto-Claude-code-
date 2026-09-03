import path from 'node:path';
import {existsSync} from 'node:fs';
import {armarRegistroConQaReal, leerArbol} from './orquestador';

const RAIZ = path.resolve(__dirname, '../..');
const MP4_REAL = path.join(RAIZ, 'fabrica/salidas/fabrica-demo-07.mp4');
const ARBOL_REAL = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_07.json');
const PUBLIC_DIR = path.join(RAIZ, 'remotion-spike/public');

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

function main() {
  if (!existsSync(MP4_REAL) || !existsSync(ARBOL_REAL)) {
    console.log('SALTEADO: no existe fabrica-demo-07.mp4/demo_07.json todavia en este checkout -- correr sobre un checkout con los demos ya renderizados.');
    return;
  }

  // leerArbol() lee el arbol real ya armado -- confirma que tiene la
  // forma esperada (escenas reales, no un fixture inventado).
  const arbol = leerArbol(ARBOL_REAL);
  check('leerArbol: el arbol real tiene escenas', arbol.escenas.length > 0);
  check('leerArbol: el arbol real tiene id', arbol.id === 'fabrica-demo-07');

  const {registro, log} = armarRegistroConQaReal({
    rutaMp4: MP4_REAL,
    rutaArbolJson: ARBOL_REAL,
    publicDir: PUBLIC_DIR,
    registroBase: {
      videoId: 'fabrica-demo-07', idea: 'test', tema: 'test', angulo: 'test',
      estructura: 'hook-desarrollo-aceleracion-pausa-impacto-desarrollo2-cierre',
      duracionSeg: arbol.duracionTotalSeg, voz: 'Qwen3-TTS',
      componentesUsados: Array.from(new Set(arbol.escenas.map((e) => e.componenteId))),
      formato: 'vertical 1080x1920', fecha: '2026-09-03',
    },
  });

  // El registro real -- verifica la FORMA, no un valor fijo esperado
  // (el resultado real de QA sobre demo-07 puede variar si el fixture
  // cambia, lo que no puede variar es la estructura del registro).
  check('armarRegistroConQaReal: qaResumen existe', registro.qaResumen !== undefined);
  check('armarRegistroConQaReal: qaResumen.ok es boolean', typeof registro.qaResumen?.ok === 'boolean');
  check('armarRegistroConQaReal: qaResumen.problemas es array', Array.isArray(registro.qaResumen?.problemas));
  check('armarRegistroConQaReal: qaResumen.fuente menciona los 2 scripts reales', (registro.qaResumen?.fuente ?? '').includes('checks_duros.py') && (registro.qaResumen?.fuente ?? '').includes('checks_composicion.py'));
  check('armarRegistroConQaReal: metricas es null (honesto, sin datos reales de audiencia)', registro.metricas === null);
  check('armarRegistroConQaReal: no pisa videoId del registroBase', registro.videoId === 'fabrica-demo-07');

  // El log de decisiones existe y tiene los 3 pasos reales (seccion 2
  // del prompt: "nada de decisiones invisibles").
  check('log tiene 3 pasos', log.length === 3);
  check('log incluye el paso qa_duro', log.some((l) => l.paso === 'qa_duro'));
  check('log incluye el paso qa_composicion', log.some((l) => l.paso === 'qa_composicion'));
  check('log incluye el paso registro_data_engine', log.some((l) => l.paso === 'registro_data_engine'));
  check('cada paso del log tiene razon no vacia (trazabilidad)', log.every((l) => l.razon.trim().length > 0));

  // Caso real de fallo: un mp4 que no existe -- no debe tirar
  // excepcion, debe reflejarlo como problema real en el qaResumen.
  const {registro: registroFalla} = armarRegistroConQaReal({
    rutaMp4: '/no/existe/este/archivo.mp4',
    rutaArbolJson: ARBOL_REAL,
    publicDir: PUBLIC_DIR,
    registroBase: {
      videoId: 'v-inexistente', idea: 'test', tema: 'test', angulo: 'test', estructura: 'test',
      duracionSeg: 1, voz: 'test', componentesUsados: [], formato: 'test', fecha: '2026-09-03',
    },
  });
  check('mp4 inexistente: qaResumen.ok=false (no revienta, no miente)', registroFalla.qaResumen?.ok === false);
  check('mp4 inexistente: el problema queda explicado en texto', (registroFalla.qaResumen?.problemas ?? []).some((p) => p.includes('no existe') || p.includes('no pudo')));

  if (FALLOS.length) {
    console.error(`${FALLOS.length} FALLO(S):`);
    FALLOS.forEach((f) => console.error(' ' + f));
    process.exit(1);
  }
  console.log('Todos los tests del Orquestador (fabrica/orquestador) pasaron OK.');
}

main();
