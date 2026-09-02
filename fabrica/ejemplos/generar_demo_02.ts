/**
 * Ejemplo real mas grande (Fase 8b, ronda 2): un "casi-video" completo
 * de 4 unidades (hook -> timeline -> cifra -> cierre) que ejercita TODO
 * lo que se sumo en esta pasada:
 *
 *   - MULTI-AUDIO en mas de un tipo de componente (cronologia con 3
 *     clips, contador con 2, punch con 2).
 *   - Componentes NUEVOS de esta pasada (`punch`).
 *   - Assets: se consulta el resolver real (fabrica/assets/resolver.py)
 *     para el fondo de video del hook -- si no encuentra nada
 *     relevante, el hook se queda sin fondo (Punch soporta `clip`
 *     opcional) en vez de inventar un archivo que no existe.
 *   - Anti-repeticion REAL: se arma una lista de "usados en este
 *     video" que crece unidad a unidad y se pasa como `evitar` a la
 *     siguiente consulta -- ademas se consulta el historial de
 *     memoria/ (videos anteriores) para sumarlo.
 *   - Memoria + Laboratorio: al final se registra el video producido
 *     (`registrarVideo`) y se abre una entrada de laboratorio
 *     (`agregarHipotesis`) -- sin escribir nunca un resultado real
 *     (no existe todavia, este video no se publico).
 *
 * Uso: npx tsx ejemplos/generar_demo_02.ts
 */
import {execSync} from 'node:child_process';
import {copyFileSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio} from '../directores/audio';
import {armarComposicion, AIRE_SEG} from '../composicion/armar';
import type {ClipAudio, UnidadResuelta} from '../composicion/tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import {registrarVideo, agregarHipotesis, componentesUsadosRecientes} from '../memoria/api';
import registroRaw from '../componentes/registro.json';

const RAIZ = path.resolve(__dirname, '../..');
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_documental');
const PUBLIC_DEMO_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_demo');
const BRIDGE_JSON = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_02.json');

mkdirSync(PUBLIC_DEMO_DIR, {recursive: true});

function clipReal(nombreArchivo: string): ClipAudio {
  const origen = path.join(AUDIO_ORIGEN, nombreArchivo);
  const duracionSeg = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim()
  );
  copyFileSync(origen, path.join(PUBLIC_DEMO_DIR, nombreArchivo));
  return {archivo: `fabrica_demo/${nombreArchivo}`, duracionSeg};
}

/** offsets acumulados de una lista de clips, en el mismo orden que
 * usa armarComposicion -- para props como `entra` de Punch que
 * necesitan saber DE ANTEMANO donde va a caer cada linea. */
function offsetsAcumulados(clips: ClipAudio[]): number[] {
  const offsets: number[] = [];
  let cursor = 0;
  for (const c of clips) {
    offsets.push(cursor);
    cursor += c.duracionSeg + AIRE_SEG;
  }
  return offsets;
}

function buscarFondoDeVideo(descripcion: string): string | undefined {
  try {
    const salida = execSync(
      `python3 "${path.join(__dirname, '../assets/resolver.py')}" --tipo video "${descripcion}"`,
      {encoding: 'utf-8'}
    );
    const r = JSON.parse(salida);
    if (r.encontrado && r.tipo === 'video') {
      console.log(`   [assets] encontrado para "${descripcion}": ${r.carpeta} (score ${r.score}) -> ${r.ruta}`);
      return path.basename(r.ruta);
    }
    console.log(`   [assets] FALTANTE para "${descripcion}": ${r.razon}`);
    return undefined;
  } catch (e) {
    console.log(`   [assets] error consultando el resolver: ${e}`);
    return undefined;
  }
}

function main() {
  const registro = registroRaw as unknown as ComponenteRegistrado[];
  const director = new DirectorVisual(registro);
  const directorAudio = new DirectorAudio();

  const usadosEnEsteVideo: string[] = [];
  const evitar = () => [...componentesUsadosRecientes(5), ...usadosEnEsteVideo];
  const unidades: UnidadResuelta[] = [];

  // ══════════════════════════════ UNIDAD 1: HOOK ══════════════════════════════
  const audiosHook = [clipReal('caso-08_00.mp3'), clipReal('caso-08_01.mp3')];
  const duracionHook = audiosHook.reduce((a, c) => a + c.duracionSeg, 0);
  const candidatosHook = director.consultar({
    categorias: ['texto'], intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: ['video'], duracionDisponibleSeg: duracionHook,
    requiereAudioSincronizado: true, evitar: evitar(),
  });
  if (!candidatosHook.length) throw new Error('Director Visual no encontro candidato para el hook');
  const elegidoHook = candidatosHook[0];
  console.log(`Unidad 1 (hook, texto): eligio "${elegidoHook.componente.id}" (score ${elegidoHook.score.toFixed(2)})`);
  elegidoHook.razones.forEach((r) => console.log('   - ' + r));

  const fondoHook = buscarFondoDeVideo('alguien probando un modelo de negocio, trabajo freelance');
  const golpeHook = directorAudio.decidirParaUnidad({indice: 0, total: 4, intensidadVisual: elegidoHook.componente.intensidad});
  unidades.push({
    id: 'hook', componente: elegidoHook.componente,
    props: {
      lineas: ['Alguien probó el mismo modelo durante un año entero.', 'Sin atajos, sin trucos, sin excusas.'],
      entra: offsetsAcumulados(audiosHook),
      clip: fondoHook,
    },
    audios: audiosHook, golpe: golpeHook.golpeSugerido, volumenSfx: golpeHook.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elegidoHook.componente.id);

  // ═══════════════════════════ UNIDAD 2: TIMELINE (centro) ═══════════════════
  const audiosCentro = [clipReal('caso-08_02.mp3'), clipReal('caso-08_03.mp3'), clipReal('caso-08_04.mp3')];
  const duracionCentro = audiosCentro.reduce((a, c) => a + c.duracionSeg, 0);
  const candidatosCentro = director.consultar({
    categorias: ['timeline'], intensidadDeseada: 0.35, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: duracionCentro,
    requiereAudioSincronizado: true, evitar: evitar(),
  });
  if (!candidatosCentro.length) throw new Error('Director Visual no encontro candidato para el centro');
  const elegidoCentro = candidatosCentro[0];
  console.log(`Unidad 2 (centro, timeline): eligio "${elegidoCentro.componente.id}" (score ${elegidoCentro.score.toFixed(2)}) -- ${audiosCentro.length} clips`);
  elegidoCentro.razones.forEach((r) => console.log('   - ' + r));

  const golpeCentro = directorAudio.decidirParaUnidad({indice: 1, total: 4, intensidadVisual: elegidoCentro.componente.intensidad});
  unidades.push({
    id: 'centro', componente: elegidoCentro.componente,
    props: {
      hitos: [
        {cuando: 'MES 1', que: 'Las primeras ventas, más flojas de lo que esperaba'},
        {cuando: 'MES 3', que: 'Empieza a aparecer información real, no ilusiones'},
        {cuando: 'MES 12', que: 'Ya no opina: tiene datos', acento: true},
      ],
    },
    audios: audiosCentro, golpe: golpeCentro.golpeSugerido, volumenSfx: golpeCentro.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elegidoCentro.componente.id);

  // ══════════════════════════════ UNIDAD 3: CIFRA ═════════════════════════════
  const audiosCifra = [clipReal('caso-09_04.mp3'), clipReal('caso-09_05.mp3')];
  const duracionCifra = audiosCifra.reduce((a, c) => a + c.duracionSeg, 0);
  const candidatosCifra = director.consultar({
    categorias: ['cifra'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionCifra,
    requiereAudioSincronizado: true, evitar: evitar(),
  });
  if (!candidatosCifra.length) throw new Error('Director Visual no encontro candidato para la cifra');
  const elegidoCifra = candidatosCifra[0];
  console.log(`Unidad 3 (cifra): eligio "${elegidoCifra.componente.id}" (score ${elegidoCifra.score.toFixed(2)}) -- ${audiosCifra.length} clips`);
  elegidoCifra.razones.forEach((r) => console.log('   - ' + r));

  const golpeCifra = directorAudio.decidirParaUnidad({indice: 2, total: 4, intensidadVisual: elegidoCifra.componente.intensidad});
  unidades.push({
    id: 'cifra', componente: elegidoCifra.componente,
    props: {abajo: 'El secreto nunca fue la cantidad: fue la especificidad', hasta: 40, sufijo: '+'},
    audios: audiosCifra, golpe: golpeCifra.golpeSugerido, volumenSfx: golpeCifra.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elegidoCifra.componente.id);

  // ══════════════════════════════ UNIDAD 4: CIERRE ════════════════════════════
  const audiosCierre = [clipReal('caso-08_05.mp3'), clipReal('caso-08_06.mp3')];
  const duracionCierre = audiosCierre.reduce((a, c) => a + c.duracionSeg, 0);
  const evitarCierre = evitar();
  const candidatosCierre = director.consultar({
    categorias: ['texto'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: ['video'], duracionDisponibleSeg: duracionCierre,
    requiereAudioSincronizado: true, evitar: evitarCierre,
  });
  if (!candidatosCierre.length) throw new Error('Director Visual no encontro candidato para el cierre');
  const elegidoCierre = candidatosCierre[0];
  console.log(`Unidad 4 (cierre, texto): eligio "${elegidoCierre.componente.id}" (score ${elegidoCierre.score.toFixed(2)})`);
  elegidoCierre.razones.forEach((r) => console.log('   - ' + r));
  if (evitarCierre.includes(elegidoCierre.componente.id)) {
    console.log(`   NOTA anti-repeticion: "${elegidoCierre.componente.id}" ya se uso en este mismo video (hook) -- ` +
      `el score de esta consulta le resto puntos por eso (ver razones arriba), pero SIGUIO SIENDO el mejor/unico ` +
      `candidato real para texto+audio-sincronizado -- exactamente la regla del operador: anti-repeticion no prohibe ` +
      `reusar lo que funciona, solo lo penaliza.`);
  }

  const golpeCierre = directorAudio.decidirParaUnidad({indice: 3, total: 4, intensidadVisual: elegidoCierre.componente.intensidad, esCierre: true});
  unidades.push({
    id: 'cierre', componente: elegidoCierre.componente,
    props: {
      lineas: ['Una semana demuestra que algo es posible.', 'Un año demuestra si de verdad funciona.'],
      entra: offsetsAcumulados(audiosCierre),
    },
    audios: audiosCierre, golpe: golpeCierre.golpeSugerido, volumenSfx: golpeCierre.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elegidoCierre.componente.id);

  // ═══════════════════════════════ COMPOSICION ════════════════════════════════
  const arbol = armarComposicion('fabrica-demo-02', unidades);
  writeFileSync(BRIDGE_JSON, JSON.stringify(arbol, null, 2));
  console.log(`\nArbol de composicion escrito en ${BRIDGE_JSON}`);
  console.log(`Duracion total: ${arbol.duracionTotalSeg.toFixed(2)}s (${Math.round(arbol.duracionTotalSeg * arbol.fps)} frames a ${arbol.fps}fps)`);
  console.log(`Componentes usados: ${usadosEnEsteVideo.join(', ')}`);

  // ═══════════════════════════ MEMORIA + LABORATORIO ══════════════════════════
  registrarVideo('fabrica-demo-02', usadosEnEsteVideo);
  const hipotesis = agregarHipotesis({
    id: `fabrica-demo-02-${Date.now()}`,
    hipotesis: 'Usar "punch" (golpes de texto sobre metraje) en vez de un texto estatico en el hook y el cierre mantiene mas intensidad visual que TresVerdades sin perder sincronizacion real con el audio.',
    experimento: 'fabrica-demo-02: hook y cierre con "punch" (multi-audio real, 2 clips cada uno), centro con "cronologia" (3 clips), cifra con "contador" (2 clips) -- primera vez que se usa "punch" en la fabrica nueva.',
    videoId: 'fabrica-demo-02',
  });
  console.log(`\nRegistrado en memoria/laboratorio.json: ${hipotesis.id} (estado: ${hipotesis.estado})`);
  console.log('NOTA: no se escribe ningun resultadoReal -- este video no se publico, solo se renderizo como prueba.');
}

if (require.main === module) main();
