/**
 * Ronda 2 (fortalecimiento + prueba integral): video de prueba real,
 * NO reciclado de fabrica-demo-01/02. Usa voz NUEVA generada de
 * verdad por Qwen3-TTS (capturas_voz/audio_demo_03/, ver
 * fabrica/voz/preparar_guion_demo_03.py y
 * .github/workflows/generar-voz-demo-03.yml) -- no audio de la serie
 * documental.
 *
 * Estructura narrativa explicita (pedida por el operador): hook,
 * desarrollo, escalada, payoff/revelacion, cierre -- 5 categorias de
 * componente DISTINTAS (texto, timeline, cifra, comparacion, texto de
 * nuevo para el cierre) para que la variedad visual tenga una razon
 * real, no sea "cambiar por cambiar".
 *
 * Uso: npx tsx ejemplos/generar_demo_03.ts
 * (requiere que capturas_voz/audio_demo_03/*.wav ya exista)
 */
import {execSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio} from '../directores/audio';
import {armarComposicion, AIRE_SEG} from '../composicion/armar';
import type {ClipAudio, UnidadResuelta} from '../composicion/tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import {registrarVideo, agregarHipotesis, componentesUsadosRecientes} from '../memoria/api';
import registroRaw from '../componentes/registro.json';

const RAIZ = path.resolve(__dirname, '../..');
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_demo_03');
const PUBLIC_DEMO_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_demo_03');
const BRIDGE_JSON = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_03.json');

mkdirSync(PUBLIC_DEMO_DIR, {recursive: true});

function clipReal(id: string): ClipAudio {
  const origen = path.join(AUDIO_ORIGEN, `${id}.wav`);
  if (!existsSync(origen)) {
    throw new Error(`FALTANTE: no existe audio real para "${id}" en ${origen} -- correr el workflow generar-voz-demo-03.yml primero`);
  }
  const duracionSeg = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim()
  );
  copyFileSync(origen, path.join(PUBLIC_DEMO_DIR, `${id}.wav`));
  return {archivo: `fabrica_demo_03/${id}.wav`, duracionSeg};
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
  const evitar = () => [...componentesUsadosRecientes(5), ...usadosEnEsteVideo];
  const unidades: UnidadResuelta[] = [];
  const TOTAL = 5;

  // ══════════════════════════════ UNIDAD 1: HOOK (texto) ══════════════════════════════
  const audiosHook = [clipReal('hook_0'), clipReal('hook_1')];
  const duracionHook = audiosHook.reduce((a, c) => a + c.duracionSeg, 0);
  const candHook = director.consultar({
    categorias: ['texto'], intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: ['video'], duracionDisponibleSeg: duracionHook,
    requiereAudioSincronizado: true, evitar: evitar(),
  });
  if (!candHook.length) throw new Error('Director Visual no encontro candidato para el hook');
  const elHook = candHook[0];
  console.log(`Unidad 1 (hook, texto): eligio "${elHook.componente.id}" (score ${elHook.score.toFixed(2)})`);
  elHook.razones.forEach((r) => console.log('   - ' + r));
  const fondoHook = buscarFondo('alguien vendiendo un archivo o producto digital, trabajo remoto en la laptop');
  const golpeHook = directorAudio.decidirParaUnidad({indice: 0, total: TOTAL, intensidadVisual: elHook.componente.intensidad});
  unidades.push({
    id: 'hook', componente: elHook.componente,
    props: {
      lineas: ['Nicolás Gómez vendió lo mismo 2.847 veces.', 'A $9 cada uno.'],
      entra: offsetsAcumulados(audiosHook),
      clip: fondoHook,
    },
    audios: audiosHook, golpe: golpeHook.golpeSugerido, volumenSfx: golpeHook.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elHook.componente.id);

  // ═══════════════════════════ UNIDAD 2: DESARROLLO (timeline) ═══════════════════
  const audiosDesarrollo = [clipReal('desarrollo_0'), clipReal('desarrollo_1'), clipReal('desarrollo_2')];
  const duracionDesarrollo = audiosDesarrollo.reduce((a, c) => a + c.duracionSeg, 0);
  const candDesarrollo = director.consultar({
    categorias: ['timeline'], intensidadDeseada: 0.35, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: duracionDesarrollo,
    requiereAudioSincronizado: true, evitar: evitar(),
  });
  if (!candDesarrollo.length) throw new Error('Director Visual no encontro candidato para el desarrollo');
  const elDesarrollo = candDesarrollo[0];
  console.log(`Unidad 2 (desarrollo, timeline): eligio "${elDesarrollo.componente.id}" (score ${elDesarrollo.score.toFixed(2)}) -- ${audiosDesarrollo.length} clips`);
  elDesarrollo.razones.forEach((r) => console.log('   - ' + r));
  const golpeDesarrollo = directorAudio.decidirParaUnidad({indice: 1, total: TOTAL, intensidadVisual: elDesarrollo.componente.intensidad});
  unidades.push({
    id: 'desarrollo', componente: elDesarrollo.componente,
    props: {
      hitos: [
        {cuando: '15 MAR 2024', que: 'Primer archivo subido. Cero ventas.'},
        {cuando: 'MES 3', que: 'Aparece en búsquedas: 10 ventas/semana'},
        {cuando: 'MES 8', que: '100 ventas/semana, $0 en anuncios', acento: true},
      ],
    },
    audios: audiosDesarrollo, golpe: golpeDesarrollo.golpeSugerido, volumenSfx: golpeDesarrollo.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elDesarrollo.componente.id);

  // ══════════════════════════════ UNIDAD 3: ESCALADA (cifra) ═════════════════════════
  const audiosEscalada = [clipReal('escalada_0')];
  const duracionEscalada = audiosEscalada.reduce((a, c) => a + c.duracionSeg, 0);
  // sin exigir audio sincronizado: un solo clip, no hace falta timing
  // interno por linea -- deja a "grafico" competir en igualdad con
  // contador/cifra-se-cae (ambos SI exigirian audioSync).
  const candEscalada = director.consultar({
    categorias: ['cifra'], intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: duracionEscalada,
    requiereAudioSincronizado: false, evitar: evitar(),
  });
  if (!candEscalada.length) throw new Error('Director Visual no encontro candidato para la escalada');
  const elEscalada = candEscalada[0];
  console.log(`Unidad 3 (escalada, cifra): eligio "${elEscalada.componente.id}" (score ${elEscalada.score.toFixed(2)})`);
  elEscalada.razones.forEach((r) => console.log('   - ' + r));
  const golpeEscalada = directorAudio.decidirParaUnidad({indice: 2, total: TOTAL, intensidadVisual: elEscalada.componente.intensidad});
  // LIMITACION REAL encontrada corriendo este mismo script (Ronda 2):
  // la categoria 'cifra' mezcla componentes con contratos de props MUY
  // distintos (grafico = serie de puntos neutral, recibo = balance de
  // dinero entra/sale, contador = un solo numero) -- el Director
  // Visual elige bien por metadata (intensidad/capacidadTexto), pero
  // el LLAMADOR todavia tiene que saber que forma de props arma segun
  // quien gano. No hay generador de props 100% generico todavia (ver
  // PENDIENTES.md) -- se resuelve por componente conocido, honesto
  // sobre la limitacion en vez de fingir que no existe.
  const propsEscalada: Record<string, unknown> =
    elEscalada.componente.id === 'recibo'
      ? {
          // reinterpretado como ingresos semanales en dolares (10 y 100
          // ventas/semana x $9 c/u) -- consistente con el resto del
          // guion, no un numero inventado aparte.
          titulo: 'Cómo crecieron los ingresos por semana',
          entra: [
            {txt: 'Semana 1', monto: 0, t: 0.6},
            {txt: 'Mes 3 (10 ventas/sem)', monto: 90, t: 2.2},
            {txt: 'Mes 8 (100 ventas/sem)', monto: 900, t: 4.0},
          ],
          sale: [],
          total: {txt: 'Esa semana', t: 5.0},
        }
      : {
          idea: {
            titulo: 'Ventas por semana',
            datos: [
              {etiqueta: 'Mes 1', valor: 0},
              {etiqueta: 'Mes 3', valor: 10},
              {etiqueta: 'Mes 8', valor: 100},
            ],
            etiqueta: 'ventas/semana',
            fuente: 'Datos ilustrativos para esta prueba de fábrica',
          },
        };
  unidades.push({
    id: 'escalada', componente: elEscalada.componente,
    props: propsEscalada,
    audios: audiosEscalada, golpe: golpeEscalada.golpeSugerido, volumenSfx: golpeEscalada.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elEscalada.componente.id);

  // ══════════════════════════════ UNIDAD 4: PAYOFF (comparacion) ═════════════════════
  const audiosPayoff = [clipReal('payoff_0'), clipReal('payoff_1')];
  const duracionPayoff = audiosPayoff.reduce((a, c) => a + c.duracionSeg, 0);
  const candPayoff = director.consultar({
    categorias: ['comparacion'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionPayoff,
    requiereAudioSincronizado: true, evitar: evitar(),
  });
  if (!candPayoff.length) throw new Error('Director Visual no encontro candidato para el payoff');
  const elPayoff = candPayoff[0];
  console.log(`Unidad 4 (payoff, comparacion): eligio "${elPayoff.componente.id}" (score ${elPayoff.score.toFixed(2)})`);
  elPayoff.razones.forEach((r) => console.log('   - ' + r));
  const golpePayoff = directorAudio.decidirParaUnidad({indice: 3, total: TOTAL, intensidadVisual: elPayoff.componente.intensidad, esRevelacion: true});
  // Misma limitacion que en escalada: 'comparacion' mezcla balanza
  // (peso numerico en una balanza) y antes-despues (dos paneles de
  // texto) -- contratos distintos, se arma segun quien gano de verdad.
  const propsPayoff: Record<string, unknown> =
    elPayoff.componente.id === 'antes-despues'
      ? {
          antes: {rotulo: 'Trabajo full-time', txt: 'Cambia tu tiempo por plata, siempre igual.'},
          despues: {rotulo: 'Un archivo de $9', txt: 'Se vende solo, 2.847 veces si hace falta.'},
        }
      : {
          izq: {txt: 'Trabajo full-time', peso: 8},
          der: {txt: 'Un archivo de $9', peso: 3},
          pie: 'El tiempo no escala igual en los dos lados.',
        };
  unidades.push({
    id: 'payoff', componente: elPayoff.componente,
    props: propsPayoff,
    audios: audiosPayoff, golpe: golpePayoff.golpeSugerido, volumenSfx: golpePayoff.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elPayoff.componente.id);

  // ══════════════════════════════ UNIDAD 5: CIERRE (texto) ════════════════════════════
  const audiosCierre = [clipReal('cierre_0')];
  const duracionCierre = audiosCierre.reduce((a, c) => a + c.duracionSeg, 0);
  const evitarCierre = evitar();
  const candCierre = director.consultar({
    categorias: ['texto'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionCierre,
    requiereAudioSincronizado: true, evitar: evitarCierre,
  });
  if (!candCierre.length) throw new Error('Director Visual no encontro candidato para el cierre');
  const elCierre = candCierre[0];
  console.log(`Unidad 5 (cierre, texto): eligio "${elCierre.componente.id}" (score ${elCierre.score.toFixed(2)})`);
  elCierre.razones.forEach((r) => console.log('   - ' + r));
  if (evitarCierre.includes(elCierre.componente.id)) {
    console.log(`   NOTA anti-repeticion: "${elCierre.componente.id}" ya se uso en este mismo video -- penalizado, no prohibido.`);
  }
  const golpeCierre = directorAudio.decidirParaUnidad({indice: 4, total: TOTAL, intensidadVisual: elCierre.componente.intensidad, esCierre: true});
  unidades.push({
    id: 'cierre', componente: elCierre.componente,
    props: {
      lineas: ['El tiempo no escala.', 'El archivo, sí.'],
      entra: offsetsAcumulados(audiosCierre),
    },
    audios: audiosCierre, golpe: golpeCierre.golpeSugerido, volumenSfx: golpeCierre.volumenSfxSugerido,
  });
  usadosEnEsteVideo.push(elCierre.componente.id);

  // ═══════════════════════════════ COMPOSICION ════════════════════════════════
  const arbol = armarComposicion('fabrica-demo-03', unidades);
  writeFileSync(BRIDGE_JSON, JSON.stringify(arbol, null, 2));
  console.log(`\nArbol de composicion escrito en ${BRIDGE_JSON}`);
  console.log(`Duracion total: ${arbol.duracionTotalSeg.toFixed(2)}s (${Math.round(arbol.duracionTotalSeg * arbol.fps)} frames a ${arbol.fps}fps)`);
  console.log(`Componentes usados: ${usadosEnEsteVideo.join(', ')}`);

  // ═══════════════════════════ MEMORIA + LABORATORIO ══════════════════════════
  registrarVideo('fabrica-demo-03', usadosEnEsteVideo);
  const hipotesis = agregarHipotesis({
    id: `fabrica-demo-03-${Date.now()}`,
    hipotesis: 'Un video con 5 categorias de componente distintas (texto/timeline/cifra/comparacion/texto), cada una eligiendo su mejor candidato real por metadata (no por nombre fijo), y voz 100% nueva generada por Qwen3-TTS (no reciclada), produce un video que se siente completo y no como una demo tecnica.',
    experimento: 'fabrica-demo-03: Ronda 2 de fortalecimiento -- guion nuevo (hook/desarrollo/escalada/payoff/cierre), voz real de Qwen3-TTS (capturas_voz/audio_demo_03/), assets reales, anti-repeticion real.',
    videoId: 'fabrica-demo-03',
  });
  console.log(`\nRegistrado en memoria/laboratorio.json: ${hipotesis.id} (estado: ${hipotesis.estado})`);
  console.log('NOTA: no se escribe ningun resultadoReal -- este video no se publico, es una prueba de fabrica.');
}

if (require.main === module) main();
