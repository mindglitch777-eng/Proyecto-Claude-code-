/**
 * Mide con ffprobe la duracion real de las 35 lineas de audio de
 * rebecca-beach (unico caso documental armado a mano, fuera de
 * casos.ts/mapear_audio_documental.ts) y escribe un array indexado
 * 0..34 -- el mismo orden del manifest -- que RebeccaBeach.tsx usa
 * para retimear su coreografia sobre el audio real.
 *
 * Uso: npx tsx mapear_audio_rebecca.ts
 */
import {execSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(RAIZ, 'capturas_voz/audio_documental');
const N = 40;

function duracionSegundos(archivo: string): number {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${archivo}"`,
    {encoding: 'utf-8'}
  );
  return parseFloat(out.trim());
}

function main() {
  const duraciones: number[] = [];
  for (let i = 0; i < N; i++) {
    const archivo = path.join(AUDIO_DIR, `rebecca-beach_${String(i).padStart(2, '0')}.mp3`);
    duraciones.push(duracionSegundos(archivo));
  }
  const destino = path.join(RAIZ, 'capturas_voz/mapa_audio_rebecca.json');
  writeFileSync(destino, JSON.stringify(duraciones, null, 2), 'utf-8');
  console.log(`${N} duraciones medidas -> ${destino}`);
}

main();
