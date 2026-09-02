/**
 * Ronda 3 (calidad audiovisual): video de prueba real, NO reciclado de
 * fabrica-demo-01/02/03. Ejercita las mejoras de esta ronda:
 *
 *   - Variedad real de golpes (DirectorAudio.decidirParaUnidad ahora
 *     recibe `evitarGolpes` -- nunca el mismo golpe fuerte dos veces).
 *   - Anticipo antes del golpe fuerte del cierre (automatico en
 *     FabricaVideo.tsx, no requiere nada especial aca).
 *   - Tratamiento explicito de un valor repetido ($47, dinero): se
 *     establece en el hook, y en "impacto" se muestra la CONSECUENCIA
 *     derivada ($2.209 = $47 x 47 clientes) en vez de repetir la
 *     cifra (ver fabrica/composicion/repeticion_datos.ts).
 *   - 7 categorias de componente sin repetir ninguna consecutiva
 *     (texto, timeline, cifra, texto/pausa, comparacion, lista,
 *     texto/cierre).
 *   - Arco de ritmo real: calma -> desarrollo -> aceleracion -> PAUSA
 *     real (silencio antes de la revelacion) -> impacto -> nuevo
 *     desarrollo -> cierre.
 *
 * Uso: npx tsx ejemplos/generar_demo_04.ts
 * (requiere que capturas_voz/audio_demo_04/*.wav ya exista)
 */
import {execSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio} from '../directores/audio';
import {armarComposicion, AIRE_SEG} from '../composicion/armar';
import {propsParaCifra, propsParaComparacion} from '../composicion/adaptadores';
import {decidirTratamientoValor, registrarValorEstablecido, ValorEstablecido} from '../composicion/repeticion_datos';
import type {ClipAudio, UnidadResuelta} from '../composicion/tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import type {TipoGolpe} from '../directores/audio';
import {registrarVideo, agregarHipotesis, componentesUsadosRecientes} from '../memoria/api';
import registroRaw from '../componentes/registro.json';

const RAIZ = path.resolve(__dirname, '../..');
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_demo_04');
const PUBLIC_DEMO_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_demo_04');
const BRIDGE_JSON = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_04.json');

mkdirSync(PUBLIC_DEMO_DIR, {recursive: true});

function clipReal(id: string): ClipAudio {
  const origen = path.join(AUDIO_ORIGEN, `${id}.wav`);
  if (!existsSync(origen)) {
    throw new Error(`FALTANTE: no existe audio real para "${id}" en ${origen} -- correr el workflow generar-voz-demo-04.yml primero`);
  }
  const duracionSeg = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim()
  );
  copyFileSync(origen, path.join(PUBLIC_DEMO_DIR, `${id}.wav`));
  return {archivo: `fabrica_demo_04/${id}.wav`, duracionSeg};
}

function offsetsAcumulados(clips: ClipAudio[]): number[] {
  const offsets: number[] = [];
  let cursor = 0;
  for (const c of clips) {
    offsets.push(cursor);
    cursor += c.duracionSeg + AIRE_SEG;
  }
  return offsets;
}

function buscarFondo(descripcion: string): string | undefined {
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
  const evitarComponentes = () => [...componentesUsadosRecientes(5), ...usadosEnEsteVideo];
  const golpesUsadosEnEsteVideo: TipoGolpe[] = [];
  let valoresEstablecidos: ValorEstablecido[] = [];
  const unidades: UnidadResuelta[] = [];
  const TOTAL = 7;

  // ══════════════════════════════ 1. HOOK (texto, calma) ══════════════════════
  const audiosHook = [clipReal('hook_0'), clipReal('hook_1')];
  const duracionHook = audiosHook.reduce((a, c) => a + c.duracionSeg, 0);
  const candHook = director.consultar({
    categorias: ['texto'], intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: ['video'], duracionDisponibleSeg: duracionHook,
    requiereAudioSincronizado: true, evitar: evitarComponentes(),
  });
  if (!candHook.length) throw new Error('Director Visual no encontro candidato para el hook');
  const elHook = candHook[0];
  console.log(`1. HOOK (texto): eligio "${elHook.componente.id}" (score ${elHook.score.toFixed(2)})`);
  const fondoHook = buscarFondo('alguien trabajando en una laptop, producto digital, freelance');
  const golpeHook = directorAudio.decidirParaUnidad({indice: 0, total: TOTAL, intensidadVisual: elHook.componente.intensidad});
  unidades.push({
    id: 'hook', componente: elHook.componente,
    props: {lineas: ['Jai Rodríguez cobra $47.', 'Por algo que armó en dos tardes.'], entra: offsetsAcumulados(audiosHook), clip: fondoHook},
    audios: audiosHook, golpe: golpeHook.golpeSugerido, volumenSfx: golpeHook.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elHook.componente.id);
  golpesUsadosEnEsteVideo.push(golpeHook.golpeSugerido);
  valoresEstablecidos = registrarValorEstablecido(valoresEstablecidos, 47, 'dinero', 'hook');

  // ══════════════════════ 2. DESARROLLO (timeline) ═════════════════════════════
  const audiosDesarrollo = [clipReal('desarrollo_0'), clipReal('desarrollo_1'), clipReal('desarrollo_2')];
  const duracionDesarrollo = audiosDesarrollo.reduce((a, c) => a + c.duracionSeg, 0);
  const candDesarrollo = director.consultar({
    categorias: ['timeline'], intensidadDeseada: 0.35, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: duracionDesarrollo,
    requiereAudioSincronizado: true, evitar: evitarComponentes(),
  });
  if (!candDesarrollo.length) throw new Error('Director Visual no encontro candidato para el desarrollo');
  const elDesarrollo = candDesarrollo[0];
  console.log(`2. DESARROLLO (timeline): eligio "${elDesarrollo.componente.id}" (score ${elDesarrollo.score.toFixed(2)})`);
  const golpeDesarrollo = directorAudio.decidirParaUnidad({
    indice: 1, total: TOTAL, intensidadVisual: elDesarrollo.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  unidades.push({
    id: 'desarrollo', componente: elDesarrollo.componente,
    props: {hitos: [
      {cuando: 'Semana 1', que: '3 ventas, casi por error'},
      {cuando: 'Mes 4', que: '19 clientes en una semana'},
      {cuando: 'Mes 9', que: '47 clientes en una semana', acento: true},
    ]},
    audios: audiosDesarrollo, golpe: golpeDesarrollo.golpeSugerido, volumenSfx: golpeDesarrollo.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elDesarrollo.componente.id);
  golpesUsadosEnEsteVideo.push(golpeDesarrollo.golpeSugerido);
  // "47" aca es CANTIDAD (clientes), no dinero -- tipoDato distinto de
  // los "$47" del hook, no es la misma repeticion (ver repeticion_datos.ts).
  valoresEstablecidos = registrarValorEstablecido(valoresEstablecidos, 47, 'cantidad', 'desarrollo');

  // ══════════════════════ 3. ACELERACION (cifra) ═══════════════════════════════
  const audiosAceleracion = [clipReal('aceleracion_0')];
  const duracionAceleracion = audiosAceleracion.reduce((a, c) => a + c.duracionSeg, 0);
  const candAceleracion = director.consultar({
    categorias: ['cifra'], intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionAceleracion,
    requiereAudioSincronizado: false, evitar: evitarComponentes(),
  });
  if (!candAceleracion.length) throw new Error('Director Visual no encontro candidato para la aceleracion');
  const elAceleracion = candAceleracion[0];
  console.log(`3. ACELERACION (cifra): eligio "${elAceleracion.componente.id}" (score ${elAceleracion.score.toFixed(2)})`);
  const golpeAceleracion = directorAudio.decidirParaUnidad({
    indice: 2, total: TOTAL, intensidadVisual: elAceleracion.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  const propsAceleracion = propsParaCifra(elAceleracion.componente.id, {
    titulo: 'Clientes por semana', puntos: [{etiqueta: 'Antes', valor: 3}, {etiqueta: 'Ahora', valor: 47}], etiqueta: 'clientes/semana',
  });
  unidades.push({
    id: 'aceleracion', componente: elAceleracion.componente, props: propsAceleracion,
    audios: audiosAceleracion, golpe: golpeAceleracion.golpeSugerido, volumenSfx: golpeAceleracion.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elAceleracion.componente.id);
  golpesUsadosEnEsteVideo.push(golpeAceleracion.golpeSugerido);

  // ══════════════════ 4. PAUSA (texto, calma real -- sin audioSync) ════════════
  const audiosPausa = [clipReal('pausa_0')];
  const duracionPausa = audiosPausa.reduce((a, c) => a + c.duracionSeg, 0);
  const candPausa = director.consultar({
    categorias: ['texto'], intensidadDeseada: 0.35, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionPausa,
    requiereAudioSincronizado: false, evitar: evitarComponentes(),
  });
  if (!candPausa.length) throw new Error('Director Visual no encontro candidato para la pausa');
  const elPausa = candPausa[0];
  console.log(`4. PAUSA (texto, calma): eligio "${elPausa.componente.id}" (score ${elPausa.score.toFixed(2)})`);
  // Pausa real (seccion 10 del pedido): golpe "ninguno" a proposito --
  // no todo necesita un corte marcado, este es el respiro antes de la
  // revelacion.
  unidades.push({
    id: 'pausa', componente: elPausa.componente,
    props: elPausa.componente.id === 'silueta' ? {idea: {texto: 'El precio nunca cambió.', pie: ''}} : {frases: ['El precio nunca cambió.']},
    audios: audiosPausa, golpe: 'ninguno', volumenSfx: 0,
  });
  usadosEnEsteVideo.push(elPausa.componente.id);

  // ══════════════════ 5. IMPACTO/REVELACION (comparacion) ══════════════════════
  const audiosImpacto = [clipReal('impacto_0'), clipReal('impacto_1')];
  const duracionImpacto = audiosImpacto.reduce((a, c) => a + c.duracionSeg, 0);
  const candImpacto = director.consultar({
    categorias: ['comparacion'], intensidadDeseada: 0.5, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionImpacto,
    requiereAudioSincronizado: true, evitar: evitarComponentes(),
  });
  if (!candImpacto.length) throw new Error('Director Visual no encontro candidato para el impacto');
  const elImpacto = candImpacto[0];
  console.log(`5. IMPACTO (comparacion): eligio "${elImpacto.componente.id}" (score ${elImpacto.score.toFixed(2)})`);
  const golpeImpacto = directorAudio.decidirParaUnidad({
    indice: 4, total: TOTAL, intensidadVisual: elImpacto.componente.intensidad, esRevelacion: true, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  // Aca se ejercita repeticion_datos.ts de verdad: "$47" (dinero) ya
  // se establecio en el hook. En vez de repetirlo como cifra
  // protagonista, se deriva y se muestra la CONSECUENCIA real (precio
  // x clientes de la semana pico).
  const decisionRepeticion = decidirTratamientoValor({
    valor: 47, tipoDato: 'dinero', unidadActual: 'impacto', yaEstablecidos: valoresEstablecidos,
    derivarConsecuencia: (precio) => precio * 47, // 47 clientes esa semana (cantidad, ver desarrollo)
  });
  console.log(`   [repeticion_datos] ${decisionRepeticion.tratamiento}: ${decisionRepeticion.razon}`);
  const totalDerivado = decisionRepeticion.valorDerivado ?? 47;
  const propsImpacto = propsParaComparacion(elImpacto.componente.id, {
    izquierda: {rotulo: 'Precio por cliente', texto: '$47', peso: 1},
    derecha: {rotulo: '47 clientes esa semana', texto: `$${totalDerivado.toLocaleString('es-AR')} en total`, peso: 47},
    remate: 'El mismo precio de siempre, 47 veces en una semana.',
  });
  unidades.push({
    id: 'impacto', componente: elImpacto.componente, props: propsImpacto,
    audios: audiosImpacto, golpe: golpeImpacto.golpeSugerido, volumenSfx: golpeImpacto.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elImpacto.componente.id);
  golpesUsadosEnEsteVideo.push(golpeImpacto.golpeSugerido);
  if (decisionRepeticion.tratamiento === 'consecuencia') {
    valoresEstablecidos = registrarValorEstablecido(valoresEstablecidos, totalDerivado, 'dinero', 'impacto');
  }

  // ══════════════════ 6. NUEVO DESARROLLO (lista) ══════════════════════════════
  const audiosDesarrollo2 = [clipReal('desarrollo2_0')];
  const duracionDesarrollo2 = audiosDesarrollo2.reduce((a, c) => a + c.duracionSeg, 0);
  const candDesarrollo2 = director.consultar({
    categorias: ['lista'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: duracionDesarrollo2,
    requiereAudioSincronizado: false, evitar: evitarComponentes(),
  });
  if (!candDesarrollo2.length) throw new Error('Director Visual no encontro candidato para el nuevo desarrollo');
  const elDesarrollo2 = candDesarrollo2[0];
  console.log(`6. NUEVO DESARROLLO (lista): eligio "${elDesarrollo2.componente.id}" (score ${elDesarrollo2.score.toFixed(2)})`);
  const golpeDesarrollo2 = directorAudio.decidirParaUnidad({
    indice: 5, total: TOTAL, intensidadVisual: elDesarrollo2.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  unidades.push({
    id: 'desarrollo2', componente: elDesarrollo2.componente,
    props: {items: ['Más anuncios', 'Más contenido', 'Más seguidores'], queda: 'Mostrarlo en el lugar correcto'},
    audios: audiosDesarrollo2, golpe: golpeDesarrollo2.golpeSugerido, volumenSfx: golpeDesarrollo2.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elDesarrollo2.componente.id);
  golpesUsadosEnEsteVideo.push(golpeDesarrollo2.golpeSugerido);

  // ══════════════════════════════ 7. CIERRE (texto) ════════════════════════════
  const audiosCierre = [clipReal('cierre_0'), clipReal('cierre_1')];
  const duracionCierre = audiosCierre.reduce((a, c) => a + c.duracionSeg, 0);
  const evitarCierre = evitarComponentes();
  const candCierre = director.consultar({
    categorias: ['texto'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionCierre,
    requiereAudioSincronizado: true, evitar: evitarCierre,
  });
  if (!candCierre.length) throw new Error('Director Visual no encontro candidato para el cierre');
  const elCierre = candCierre[0];
  console.log(`7. CIERRE (texto): eligio "${elCierre.componente.id}" (score ${elCierre.score.toFixed(2)})`);
  const golpeCierre = directorAudio.decidirParaUnidad({
    indice: 6, total: TOTAL, intensidadVisual: elCierre.componente.intensidad, esCierre: true, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  console.log(`   golpe de cierre: "${golpeCierre.golpeSugerido}" -- Anticipo se activa solo si es fuerte (fogonazo/sacudon/negro)`);
  unidades.push({
    id: 'cierre', componente: elCierre.componente,
    props: {lineas: ['El archivo es el mismo.', 'El resultado, no.'], entra: offsetsAcumulados(audiosCierre)},
    audios: audiosCierre, golpe: golpeCierre.golpeSugerido, volumenSfx: golpeCierre.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elCierre.componente.id);

  // ═══════════════════════════════ COMPOSICION ════════════════════════════════
  const arbol = armarComposicion('fabrica-demo-04', unidades);
  writeFileSync(BRIDGE_JSON, JSON.stringify(arbol, null, 2));
  console.log(`\nArbol de composicion escrito en ${BRIDGE_JSON}`);
  console.log(`Duracion total: ${arbol.duracionTotalSeg.toFixed(2)}s (${Math.round(arbol.duracionTotalSeg * arbol.fps)} frames a ${arbol.fps}fps)`);
  console.log(`Componentes usados: ${usadosEnEsteVideo.join(', ')}`);
  console.log(`Golpes usados: ${golpesUsadosEnEsteVideo.join(', ')}, ${golpeCierre.golpeSugerido}`);

  // ═══════════════════════════ MEMORIA + LABORATORIO ══════════════════════════
  registrarVideo('fabrica-demo-04', usadosEnEsteVideo);
  const hipotesis = agregarHipotesis({
    id: `fabrica-demo-04-${Date.now()}`,
    hipotesis: 'Variedad real de golpes (evitarGolpes) + anticipo antes de un golpe fuerte + tratamiento explicito de un valor repetido (consecuencia derivada en vez de repetir la cifra) + 7 categorias sin repetir consecutiva produce un video que se siente mas dirigido y menos formulaico que fabrica-demo-03.',
    experimento: 'fabrica-demo-04: Ronda 3 de calidad audiovisual -- guion nuevo (hook/desarrollo/aceleracion/pausa/impacto/desarrollo2/cierre), voz real de Qwen3-TTS, $47 establecido en hook y resuelto por consecuencia ($2.209) en impacto en vez de repetido.',
    videoId: 'fabrica-demo-04',
  });
  console.log(`\nRegistrado en memoria/laboratorio.json: ${hipotesis.id} (estado: ${hipotesis.estado})`);
  console.log('NOTA: no se escribe ningun resultadoReal -- este video no se publico, es una prueba de fabrica.');
}

if (require.main === module) main();
