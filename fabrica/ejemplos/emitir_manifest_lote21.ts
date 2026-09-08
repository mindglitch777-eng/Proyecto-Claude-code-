/**
 * Extrae {id, texto} de todas las escenas narradas de VIDEOS
 * (lote_21_datos.ts) y escribe el manifest para la voz real
 * (Qwen3-TTS, GitHub Actions) -- no toca audio ni bridges, solo lee la
 * data. Se corre ANTES de que exista el audio; generar_lote_21.ts se
 * corre DESPUES (requiere los .wav ya generados).
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {VIDEOS} from './lote_21_datos';

const RAIZ = path.join(__dirname, '..', '..');

function main() {
  const lineas = VIDEOS.flatMap((v) =>
    v.escenas
      .filter((e) => e.textoVoz.trim().length > 0)
      .map((e) => ({id: e.id, texto: e.textoVoz}))
  );
  const destino = path.join(RAIZ, 'capturas_voz/manifest_lote21.json');
  writeFileSync(destino, JSON.stringify(lineas, null, 2));
  console.log(`Escrito: ${destino}`);
  console.log(`Total de lineas narradas: ${lineas.length} (de ${VIDEOS.length} videos)`);
}

main();
