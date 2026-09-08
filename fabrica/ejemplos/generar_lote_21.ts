/**
 * Arma los 21 bridges (remotion-spike/src/fabrica_bridge/lote21-vNN.json)
 * a partir de VIDEOS (lote_21_datos.ts), UNA VEZ que el audio real ya
 * existe en capturas_voz/audio_lote21/*.wav (generado por
 * generar-voz-lote21.yml). Mismo patron que generar_piloto_N.ts, pero
 * en loop sobre los 21.
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {renderizarPorGuion} from '../composicion/renderizador_por_guion';
import {VIDEOS} from './lote_21_datos';

const RAIZ = path.join(__dirname, '..', '..');

function main() {
  for (const video of VIDEOS) {
    const idVideo = `lote21-${video.id}`;
    const resultado = renderizarPorGuion(idVideo, video.escenas, {
      audioOrigenDir: 'capturas_voz/audio_lote21',
      carpetaPublica: `fabrica_lote21_${video.id}`,
    }, RAIZ);

    const destino = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge', `${idVideo}.json`);
    writeFileSync(destino, JSON.stringify(resultado.arbol, null, 2));

    console.log(`[${video.id}] "${video.titulo}" -> ${destino} (${resultado.arbol.duracionTotalSeg.toFixed(1)}s)`);
    for (const u of resultado.resumen) {
      console.log(`    ${u.id.padEnd(18)} componente=${u.componenteId.padEnd(16)} golpe=${u.golpe}${u.golpeExplicito ? ' (explicito)' : ''}`);
    }
  }
}

main();
