/**
 * Prueba de punta a punta minima (Fase 8b): arma un video de juguete
 * usando la cadena real de la fabrica -- Director Visual eligiendo
 * componentes (no hardcodeados a mano), Director de Audio decidiendo
 * golpes, Composicion (con soporte MULTI-AUDIO) calculando offsets
 * exactos -- y deja el resultado listo para que Remotion lo renderice.
 *
 * El audio NO se genera de nuevo (el motor Qwen3-TTS no corre en este
 * sandbox, ver PENDIENTES.md): se reusan clips REALES ya generados y
 * aprobados de la serie documental (capturas_voz/audio_documental/),
 * CADA UNO POR SEPARADO (ya no hace falta concatenarlos con ffmpeg --
 * eso era un workaround de la primera version de este script, antes
 * de generalizar multi-audio en fabrica/composicion/armar.ts).
 *
 * Para un ejemplo mas grande, con mas componentes y memoria/
 * laboratorio conectados, ver generar_demo_02.ts.
 *
 * Uso: npx tsx ejemplos/generar_demo_01.ts
 *
 * OJO: este script copia el audio directo a remotion-spike/public/
 * fabrica_demo/ (no pasa por preparar-public.sh a proposito -- la
 * fabrica es independiente del pipeline viejo). Si despues de correr
 * esto se corre `preparar-public.sh`, ese script hace `rm -rf` de
 * public/ entero y se pierde fabrica_demo/ -- volver a correr este
 * generador si eso pasa.
 */
import {execSync} from 'node:child_process';
import {copyFileSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio} from '../directores/audio';
import {armarComposicion} from '../composicion/armar';
import type {ClipAudio, UnidadResuelta} from '../composicion/tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import registroRaw from '../componentes/registro.json';

const RAIZ = path.resolve(__dirname, '../..');
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_documental');
const PUBLIC_DEMO_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_demo');
const BRIDGE_JSON = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_01.json');

mkdirSync(PUBLIC_DEMO_DIR, {recursive: true});

export function clipReal(nombreArchivo: string): ClipAudio {
  const origen = path.join(AUDIO_ORIGEN, nombreArchivo);
  const duracionSeg = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim()
  );
  copyFileSync(origen, path.join(PUBLIC_DEMO_DIR, nombreArchivo));
  return {archivo: `fabrica_demo/${nombreArchivo}`, duracionSeg};
}

function main() {
  const registro = registroRaw as unknown as ComponenteRegistrado[];
  const director = new DirectorVisual(registro);
  const directorAudio = new DirectorAudio();

  // ── Unidad 1: timeline de 3 hitos reales (caso-08), MULTI-AUDIO real ──
  const audiosCronologia = [clipReal('caso-08_02.mp3'), clipReal('caso-08_03.mp3'), clipReal('caso-08_04.mp3')];
  const duracionTotalCronologia = audiosCronologia.reduce((a, c) => a + c.duracionSeg, 0);
  const candidatosTimeline = director.consultar({
    categorias: ['timeline'], intensidadDeseada: 0.35, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: duracionTotalCronologia, requiereAudioSincronizado: true,
  });
  if (!candidatosTimeline.length) throw new Error('Director Visual no encontro candidato para timeline');
  console.log(`Unidad 1 (timeline): Director Visual eligio "${candidatosTimeline[0].componente.id}" (score ${candidatosTimeline[0].score.toFixed(2)}) -- ${audiosCronologia.length} clips de audio reales`);
  candidatosTimeline[0].razones.forEach((r) => console.log('   - ' + r));

  const golpe1 = directorAudio.decidirParaUnidad({indice: 0, total: 2, intensidadVisual: candidatosTimeline[0].componente.intensidad});
  const unidad1: UnidadResuelta = {
    id: 'u1', componente: candidatosTimeline[0].componente,
    props: {
      hitos: [
        {cuando: 'MES 1', que: 'Las primeras ventas, más flojas de lo que esperaba'},
        {cuando: 'MES 3', que: 'Empieza a aparecer información real, no ilusiones'},
        {cuando: 'MES 12', que: 'Ya no opina: tiene datos', acento: true},
      ],
    },
    audios: audiosCronologia, golpe: golpe1.golpeSugerido, volumenSfx: golpe1.volumenSfxSugerido,
  };

  // ── Unidad 2: cifra real (caso-09, "40+"), MULTI-AUDIO real (2 clips) ──
  const audiosCifra = [clipReal('caso-09_04.mp3'), clipReal('caso-09_05.mp3')];
  const duracionTotalCifra = audiosCifra.reduce((a, c) => a + c.duracionSeg, 0);
  const candidatosCifra = director.consultar({
    categorias: ['cifra'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionTotalCifra, requiereAudioSincronizado: true,
    evitar: ['cifra-se-cae'], // para esta demo forzamos ver la anti-repeticion en accion
  });
  if (!candidatosCifra.length) throw new Error('Director Visual no encontro candidato para cifra');
  console.log(`Unidad 2 (cifra): Director Visual eligio "${candidatosCifra[0].componente.id}" (score ${candidatosCifra[0].score.toFixed(2)}) -- ${audiosCifra.length} clips de audio reales`);
  candidatosCifra[0].razones.forEach((r) => console.log('   - ' + r));

  const golpe2 = directorAudio.decidirParaUnidad({indice: 1, total: 2, intensidadVisual: candidatosCifra[0].componente.intensidad, esCierre: true});
  const unidad2: UnidadResuelta = {
    id: 'u2', componente: candidatosCifra[0].componente,
    props: {abajo: 'El secreto nunca fue la cantidad: fue la especificidad', hasta: 40, sufijo: '+'},
    audios: audiosCifra, golpe: golpe2.golpeSugerido, volumenSfx: golpe2.volumenSfxSugerido,
  };

  const arbol = armarComposicion('fabrica-demo-01', [unidad1, unidad2]);
  writeFileSync(BRIDGE_JSON, JSON.stringify(arbol, null, 2));

  console.log(`\nArbol de composicion escrito en ${BRIDGE_JSON}`);
  console.log(`Duracion total: ${arbol.duracionTotalSeg.toFixed(2)}s (${Math.round(arbol.duracionTotalSeg * arbol.fps)} frames a ${arbol.fps}fps)`);
}

if (require.main === module) main();
