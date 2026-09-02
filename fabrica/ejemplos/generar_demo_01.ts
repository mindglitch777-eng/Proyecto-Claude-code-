/**
 * Prueba de punta a punta (Fase 8b): arma un video de juguete usando
 * TODA la cadena real de la fabrica -- Director Visual eligiendo
 * componentes (no hardcodeados a mano), Director de Audio decidiendo
 * golpes, Composicion calculando offsets exactos -- y deja el
 * resultado listo para que Remotion lo renderice de verdad.
 *
 * El audio NO se genera de nuevo (el motor Qwen3-TTS no corre en este
 * sandbox, ver PENDIENTES.md): se reusan clips REALES ya generados y
 * aprobados de la serie documental (capturas_voz/audio_documental/),
 * concatenados con ffmpeg donde una "unidad" junta mas de una linea
 * (ej. los 3 hitos de una cronologia) -- la duracion que ve
 * Composicion es la duracion REAL medida de esa concatenacion, no una
 * estimacion.
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
import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio} from '../directores/audio';
import {armarComposicion} from '../composicion/armar';
import type {UnidadResuelta} from '../composicion/tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';

const RAIZ = path.resolve(__dirname, '../..');
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_documental');
const SALIDA_DIR = path.join(__dirname, 'demo_01');
const PUBLIC_DEMO_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_demo');
const BRIDGE_JSON = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_01.json');

mkdirSync(SALIDA_DIR, {recursive: true});
mkdirSync(PUBLIC_DEMO_DIR, {recursive: true});

function concatenar(nombre: string, archivos: string[]): {archivo: string; duracionSeg: number} {
  const lista = path.join(SALIDA_DIR, `${nombre}.txt`);
  writeFileSync(lista, archivos.map((a) => `file '${path.join(AUDIO_ORIGEN, a)}'`).join('\n'));
  const salida = path.join(SALIDA_DIR, `${nombre}.mp3`);
  execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i "${lista}" -c copy "${salida}"`);
  const duracionSeg = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${salida}"`).toString().trim()
  );
  const destinoPublic = path.join(PUBLIC_DEMO_DIR, `${nombre}.mp3`);
  copyFileSync(salida, destinoPublic);
  return {archivo: `fabrica_demo/${nombre}.mp3`, duracionSeg};
}

function main() {
  const registro: ComponenteRegistrado[] = JSON.parse(
    readFileSync(path.join(__dirname, '../componentes/registro.json'), 'utf-8')
  );
  const director = new DirectorVisual(registro);
  const directorAudio = new DirectorAudio();

  // ── Unidad 1: timeline de 3 hitos reales (caso-08) ──
  const audioCronologia = concatenar('u1_cronologia', ['caso-08_02.mp3', 'caso-08_03.mp3', 'caso-08_04.mp3']);
  const candidatosTimeline = director.consultar({
    categorias: ['timeline'], intensidadDeseada: 0.35, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: audioCronologia.duracionSeg, requiereAudioSincronizado: true,
  });
  if (!candidatosTimeline.length) throw new Error('Director Visual no encontro candidato para timeline');
  console.log(`Unidad 1 (timeline): Director Visual eligio "${candidatosTimeline[0].componente.id}" (score ${candidatosTimeline[0].score.toFixed(2)})`);
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
    audio: audioCronologia, golpe: golpe1.golpeSugerido, volumenSfx: golpe1.volumenSfxSugerido,
  };

  // ── Unidad 2: cifra real (caso-09, "40+") ──
  const audioCifra = concatenar('u2_cifra', ['caso-09_04.mp3', 'caso-09_05.mp3']);
  const candidatosCifra = director.consultar({
    categorias: ['cifra'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: audioCifra.duracionSeg, requiereAudioSincronizado: true,
    evitar: ['cifra-se-cae'], // para esta demo forzamos ver la anti-repeticion en accion
  });
  if (!candidatosCifra.length) throw new Error('Director Visual no encontro candidato para cifra');
  console.log(`Unidad 2 (cifra): Director Visual eligio "${candidatosCifra[0].componente.id}" (score ${candidatosCifra[0].score.toFixed(2)})`);
  candidatosCifra[0].razones.forEach((r) => console.log('   - ' + r));

  const golpe2 = directorAudio.decidirParaUnidad({indice: 1, total: 2, intensidadVisual: candidatosCifra[0].componente.intensidad, esCierre: true});
  const unidad2: UnidadResuelta = {
    id: 'u2', componente: candidatosCifra[0].componente,
    props: {abajo: 'El secreto nunca fue la cantidad: fue la especificidad', hasta: 40, sufijo: '+'},
    audio: audioCifra, golpe: golpe2.golpeSugerido, volumenSfx: golpe2.volumenSfxSugerido,
  };

  const arbol = armarComposicion('fabrica-demo-01', [unidad1, unidad2]);
  writeFileSync(BRIDGE_JSON, JSON.stringify(arbol, null, 2));

  console.log(`\nArbol de composicion escrito en ${BRIDGE_JSON}`);
  console.log(`Duracion total: ${arbol.duracionTotalSeg.toFixed(2)}s (${Math.round(arbol.duracionTotalSeg * arbol.fps)} frames a ${arbol.fps}fps)`);
  console.log(JSON.stringify(arbol, null, 2));
}

main();
