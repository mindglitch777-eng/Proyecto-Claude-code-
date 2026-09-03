import path from 'node:path';
import {existsSync} from 'node:fs';
import {detectarPausaInterna} from './pausas';

const RAIZ = path.resolve(__dirname, '../..');
const AUDIO_DIR = path.join(RAIZ, 'capturas_voz/audio_demo_06');

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

function main() {
  const wavAceleracion = path.join(AUDIO_DIR, 'aceleracion_0.wav');
  if (!existsSync(wavAceleracion)) {
    console.log('SALTEADO: no existen los audios reales de capturas_voz/audio_demo_06 en este checkout.');
    return;
  }

  // Valor real medido (ver detectar_pausas.py corrido a mano sobre
  // este archivo): pausa real en ~1.96-2.30s dentro de un clip de
  // duracion real medida por ffprobe.
  const punto = detectarPausaInterna(wavAceleracion, 3.5);
  check('detectarPausaInterna devuelve un numero real para un audio con pausa real', typeof punto === 'number');
  if (typeof punto === 'number') {
    check(`el punto detectado cae dentro del rango util [0.15*dur, 0.85*dur] (dio ${punto.toFixed(2)})`, punto >= 3.5 * 0.15 && punto <= 3.5 * 0.85);
  }

  // Archivo inexistente: nunca inventa, nunca tira excepcion.
  const puntoInexistente = detectarPausaInterna('/no/existe/este/archivo.wav', 5);
  check('archivo inexistente: devuelve undefined, no inventa ni revienta', puntoInexistente === undefined);

  // Duracion muy chica: cualquier pausa real cae fuera del rango
  // 15%-85%, debe devolver undefined en vez de forzar un punto inutil.
  const puntoDuracionChica = detectarPausaInterna(wavAceleracion, 0.05);
  check('duracion declarada absurdamente chica: no fuerza un punto fuera de rango', puntoDuracionChica === undefined);

  if (FALLOS.length) {
    console.error(`${FALLOS.length} FALLO(S):`);
    FALLOS.forEach((f) => console.error(' ' + f));
    process.exit(1);
  }
  console.log('Todos los tests de deteccion de pausas (fabrica/composicion/pausas.ts) pasaron OK.');
}

main();
