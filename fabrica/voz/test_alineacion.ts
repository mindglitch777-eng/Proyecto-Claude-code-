import {buscarPalabraAlineada} from './alineacion';
import path from 'node:path';

const RAIZ = path.resolve(__dirname, '../..');

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

function main() {
  // Fixture real ya existente (R6-2/P3-3): resultado real de
  // faster-whisper sobre audio real de Qwen3-TTS.
  const ruta = path.join(RAIZ, 'fabrica/voz/resultados_alineacion/desarrollo_0.json');
  const marzo = buscarPalabraAlineada(ruta, 'marzo');
  check('encuentra una palabra real presente en el resultado', marzo !== undefined);
  check('el timestamp encontrado es un numero real > 0', !!marzo && marzo.inicio > 0);
  check('inicio < fin', !!marzo && marzo.inicio < marzo.fin);

  const inexistente = buscarPalabraAlineada(ruta, 'blockchain');
  check('palabra que no aparece en el audio -> undefined, no inventa nada', inexistente === undefined);

  const archivoInexistente = buscarPalabraAlineada(path.join(RAIZ, 'fabrica/voz/resultados_alineacion/no-existe.json'), 'marzo');
  check('archivo de resultado inexistente -> undefined, nunca lanza ni inventa', archivoInexistente === undefined);

  check('busqueda ignora mayusculas/puntuacion', buscarPalabraAlineada(ruta, 'MARZO') !== undefined);

  if (FALLOS.length) {
    console.log(`\n${FALLOS.length} FALLO(S):\n`);
    for (const f of FALLOS) console.log(f);
    process.exit(1);
  }
  console.log('Todos los tests del lector de alineacion (fabrica/voz/alineacion.ts) pasaron OK.');
}

main();
