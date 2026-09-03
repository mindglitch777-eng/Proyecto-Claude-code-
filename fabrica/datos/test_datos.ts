import {REGISTROS_VIDEO, REGISTROS_PRODUCTO} from './datos';
import {validarRegistroVideo, registrarVideo, registrarProducto, videosConMetricasReales, retencionPromedioPorHook, videosConProblemasDeQa} from './consultar';
import type {RegistroVideoCompleto} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('REGISTROS_VIDEO real esta vacio (ningun video publicado todavia)', REGISTROS_VIDEO.length === 0);
check('REGISTROS_PRODUCTO real esta vacio', REGISTROS_PRODUCTO.length === 0);
check('retencionPromedioPorHook sobre almacen vacio da objeto vacio (sin inventar un promedio)', Object.keys(retencionPromedioPorHook()).length === 0);

const registroBase: RegistroVideoCompleto = {
  videoId: 'v-test', idea: 'test', tema: 'test', angulo: 'test',
  hookPatronId: 'contexto-parcial', estructura: 'hook-desarrollo-cierre',
  duracionSeg: 30, voz: 'Qwen3-TTS', componentesUsados: ['contador'],
  formato: 'vertical 1080x1920', metricas: null, fecha: '2026-09-03',
};

check('validarRegistroVideo no lanza con componente y hook reales', (() => {
  try {
    validarRegistroVideo(registroBase);
    return true;
  } catch {
    return false;
  }
})());

check('validarRegistroVideo lanza con un componente inventado', (() => {
  try {
    validarRegistroVideo({...registroBase, componentesUsados: ['esto-no-existe']});
    return false;
  } catch {
    return true;
  }
})());

check('validarRegistroVideo lanza con un hookPatronId inventado', (() => {
  try {
    validarRegistroVideo({...registroBase, hookPatronId: 'esto-no-existe'});
    return false;
  } catch {
    return true;
  }
})());

// registrarVideo valida antes de aceptar -- probado sobre un destino
// LOCAL de test, nunca sobre el almacen real.
const destinoTest: RegistroVideoCompleto[] = [];
registrarVideo(registroBase, destinoTest);
check('registrarVideo agrega el registro valido', destinoTest.length === 1);
check('registrarVideo lanza y NO agrega un registro invalido', (() => {
  try {
    registrarVideo({...registroBase, videoId: 'v-invalido', componentesUsados: ['no-existe']}, destinoTest);
    return false;
  } catch {
    return destinoTest.length === 1; // no crecio
  }
})());

check('videosConMetricasReales excluye videos sin metricas (metricas: null)', videosConMetricasReales(destinoTest).length === 0);
const conMetricas: RegistroVideoCompleto = {...registroBase, videoId: 'v-con-metricas', metricas: {retencionPct: 55, fuente: 'test', fechaMedicion: '2026-09-03'}};
check('videosConMetricasReales incluye uno con metricas reales', videosConMetricasReales([...destinoTest, conMetricas]).length === 1);

const promedio = retencionPromedioPorHook([conMetricas]);
check('retencionPromedioPorHook calcula el promedio real sobre datos con metricas', promedio['contexto-parcial'] === 55);

// R7-29: qaResumen conecta QA -> Data Engine (antes de esto, un
// resultado de QA no sobrevivia mas alla de un solo render).
check('videosConProblemasDeQa sobre almacen vacio da vacio', videosConProblemasDeQa(destinoTest).length === 0);
const conQaLimpio: RegistroVideoCompleto = {...registroBase, videoId: 'v-qa-limpio', qaResumen: {ok: true, problemas: [], fuente: 'qa/checks_duros.py'}};
const conQaConProblema: RegistroVideoCompleto = {...registroBase, videoId: 'v-qa-con-problema', qaResumen: {ok: false, problemas: ['contraste texto/acento 3.05:1'], fuente: 'qa/contraste.py'}};
check('videosConProblemasDeQa excluye el que tiene qaResumen.ok=true', videosConProblemasDeQa([conQaLimpio]).length === 0);
check('videosConProblemasDeQa incluye el que tiene qaResumen.ok=false', videosConProblemasDeQa([conQaLimpio, conQaConProblema]).length === 1);
check('videosConProblemasDeQa no confunde "sin qaResumen" con "ok=false"', videosConProblemasDeQa([registroBase]).length === 0);

const destinoProductoTest: import('./tipos').RegistroProducto[] = [];
registrarProducto({productoId: 'p1', ofertaId: 'o1', fuenteTrafico: 'organico', fuente: 'test', fecha: '2026-09-03'}, destinoProductoTest);
check('registrarProducto agrega el registro', destinoProductoTest.length === 1);

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Data Engine (fabrica/datos) pasaron OK.');
