/**
 * Ronda 5 (laboratorio audiovisual inteligente): video de prueba real,
 * NO reciclado de demo_04/05. Llama de verdad al pipeline completo:
 *
 *   Director Visual -> Director de Audio -> Director de Edicion ->
 *   Director de Retencion 2.0 -> Composicion
 *
 * `generarArbol(params)` sigue siendo PURA respecto de la memoria
 * global (mismo principio que demo_05) -- el ciclo de mejora
 * controlado la invoca mas de una vez de forma segura.
 *
 * FIX REAL respecto de demo_05 (ver ESTADO_ACTUAL.md, "PRÓXIMO PASO"
 * #1): `main()` ya NO registra en memoria automáticamente -- solo
 * genera y escribe el árbol. El registro (`registrarVideo`/
 * `agregarHipotesis`/`registrarPatronUsado`) se hace en
 * `confirmarRegistro()`, una función SEPARADA que se llama a mano
 * (`--confirmar`) DESPUÉS de confirmar que el render + QA duro salieron
 * bien -- así un render fallido nunca vuelve a contaminar la
 * anti-repetición entre videos (el bug real que pasó en Ronda 4).
 *
 * Ejercita, con datos reales:
 *   - Director de Retencion 2.0 (fabrica/directores/retencion/) sobre
 *     el arbol completo -- mapa narrativo + alertas de arco, adjuntado
 *     a `arbol.analisisRetencion`.
 *   - Critico Audiovisual (fabrica/qa/critico_audiovisual.py) leyendo
 *     ese `analisisRetencion` real, no un fixture.
 *   - Todo lo de Ronda 4 (Director de Edicion, microeventos anclados a
 *     audio real, repeticion_datos.ts, ciclo de mejora controlado).
 *
 * Uso:
 *   npx tsx ejemplos/generar_demo_06.ts             (genera + escribe el arbol)
 *   npx tsx ejemplos/generar_demo_06.ts --confirmar  (registra en memoria, DESPUES del render+QA)
 */
import {execSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio} from '../directores/audio';
import {DirectorEdicion} from '../directores/edicion/edicion';
import type {ContextoUnidad, EstiloId} from '../directores/edicion/tipos';
import {DirectorRetencion} from '../directores/retencion/retencion';
import {armarComposicion, AIRE_SEG} from '../composicion/armar';
import {propsParaCifra, propsParaComparacion} from '../composicion/adaptadores';
import {decidirTratamientoValor, registrarValorEstablecido, ValorEstablecido} from '../composicion/repeticion_datos';
import type {ArbolComposicion, ClipAudio, UnidadResuelta} from '../composicion/tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import type {TipoGolpe} from '../directores/audio';
import {registrarVideo, agregarHipotesis, componentesUsadosRecientes} from '../memoria/api';
import {registrarPatronUsado, type PatronEdicion} from '../memoria/patrones';
import {correrCicloMejora, type ParametrosGeneracion} from '../laboratorio/ciclo_mejora';
import registroRaw from '../componentes/registro.json';

const RAIZ = path.resolve(__dirname, '../..');
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_demo_06');
const PUBLIC_DEMO_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_demo_06');
const BRIDGE_JSON = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_06.json');
const RUTA_TEMPORAL_CICLO = path.join(RAIZ, 'fabrica/laboratorio/.tmp_demo_06.json');
const VIDEO_ID = 'fabrica-demo-06';

mkdirSync(PUBLIC_DEMO_DIR, {recursive: true});

function clipReal(id: string): ClipAudio {
  const origen = path.join(AUDIO_ORIGEN, `${id}.wav`);
  if (!existsSync(origen)) {
    throw new Error(`FALTANTE: no existe audio real para "${id}" en ${origen} -- correr el workflow generar-voz-demo-06.yml primero`);
  }
  const duracionSeg = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim()
  );
  copyFileSync(origen, path.join(PUBLIC_DEMO_DIR, `${id}.wav`));
  return {archivo: `fabrica_demo_06/${id}.wav`, duracionSeg};
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

function duracionTotalDeAudios(clips: ClipAudio[]): number {
  return clips.reduce((cursor, c) => cursor + c.duracionSeg + AIRE_SEG, 0);
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

const registro = registroRaw as unknown as ComponenteRegistrado[];

export function generarArbol(params: ParametrosGeneracion, log: boolean = true): ArbolComposicion {
  const imprimir = (...args: unknown[]) => { if (log) console.log(...args); };

  const director = new DirectorVisual(registro);
  const directorAudio = new DirectorAudio();
  const directorEdicion = new DirectorEdicion();

  const usadosEnEsteVideo: string[] = [];
  const evitarComponentes = () => [...componentesUsadosRecientes(5), ...usadosEnEsteVideo, ...params.evitarComponentesExtra];
  const golpesUsadosEnEsteVideo: TipoGolpe[] = [...params.evitarGolpesExtra];
  let valoresEstablecidos: ValorEstablecido[] = [];
  const unidades: UnidadResuelta[] = [];
  const TOTAL = 7;

  function planificarEdicion(ctx: Omit<ContextoUnidad, 'unidadId'> & {unidadId: string}, golpe: TipoGolpe) {
    const estrategia = directorEdicion.planificar(ctx, golpe);
    imprimir(`   [edicion] intencion=${estrategia.intencion} energia=${estrategia.energia} ` +
      `densidad=${estrategia.densidadVisual} estilos=[${estrategia.estilos.join('+')}] ` +
      `respiracion=${estrategia.respiracion}`);
    imprimir(`   [edicion] transicion: ${estrategia.transicion.motivo}`);
    for (const m of estrategia.microeventos) {
      imprimir(`   [microevento] +${m.enSegRelativo.toFixed(2)}s ${m.tipo}: ${m.descripcion}`);
    }
    return estrategia;
  }

  // ══════════════════════════════ 1. HOOK (texto, calma) ══════════════════════
  const audiosHook = [clipReal('hook_0'), clipReal('hook_1')];
  const duracionHook = duracionTotalDeAudios(audiosHook);
  const candHook = director.consultar({
    categorias: ['texto'], intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: ['video'], duracionDisponibleSeg: duracionHook,
    requiereAudioSincronizado: true, evitar: evitarComponentes(),
  });
  if (!candHook.length) throw new Error('Director Visual no encontro candidato para el hook');
  const elHook = candHook[0];
  imprimir(`1. HOOK (texto): eligio "${elHook.componente.id}" (score ${elHook.score.toFixed(2)})`);
  const fondoHook = buscarFondo('alguien grabando un curso online, laptop, producto digital');
  const golpeHook = directorAudio.decidirParaUnidad({indice: 0, total: TOTAL, intensidadVisual: elHook.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo});
  const estrategiaHook = planificarEdicion({
    unidadId: 'hook', categoria: elHook.componente.categoria, intensidadComponente: elHook.componente.intensidad,
    indice: 0, total: TOTAL, duracionSegTotal: duracionHook, offsetsAudioSeg: offsetsAcumulados(audiosHook),
    esPrimera: true,
  }, golpeHook.golpeSugerido);
  unidades.push({
    id: 'hook', componente: elHook.componente,
    props: {lineas: ['Tomás vende su curso a $89.', 'El primer mes, vendió apenas seis.'], entra: offsetsAcumulados(audiosHook), clip: fondoHook},
    audios: audiosHook, golpe: golpeHook.golpeSugerido, volumenSfx: golpeHook.volumenSfxSugerido,
    estrategiaEdicion: estrategiaHook,
  });
  usadosEnEsteVideo.push(elHook.componente.id);
  golpesUsadosEnEsteVideo.push(golpeHook.golpeSugerido);
  valoresEstablecidos = registrarValorEstablecido(valoresEstablecidos, 89, 'dinero', 'hook');

  // ══════════════════════ 2. DESARROLLO (timeline) ═════════════════════════════
  const audiosDesarrollo = [clipReal('desarrollo_0'), clipReal('desarrollo_1'), clipReal('desarrollo_2')];
  const duracionDesarrollo = duracionTotalDeAudios(audiosDesarrollo);
  const candDesarrollo = director.consultar({
    categorias: ['timeline'], intensidadDeseada: 0.35, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: duracionDesarrollo,
    requiereAudioSincronizado: true, evitar: evitarComponentes(),
  });
  if (!candDesarrollo.length) throw new Error('Director Visual no encontro candidato para el desarrollo');
  const elDesarrollo = candDesarrollo[0];
  imprimir(`2. DESARROLLO (timeline): eligio "${elDesarrollo.componente.id}" (score ${elDesarrollo.score.toFixed(2)})`);
  const golpeDesarrollo = directorAudio.decidirParaUnidad({
    indice: 1, total: TOTAL, intensidadVisual: elDesarrollo.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  const estrategiaDesarrollo = planificarEdicion({
    unidadId: 'desarrollo', categoria: elDesarrollo.componente.categoria, intensidadComponente: elDesarrollo.componente.intensidad,
    indice: 1, total: TOTAL, duracionSegTotal: duracionDesarrollo, offsetsAudioSeg: offsetsAcumulados(audiosDesarrollo),
    estilosSugeridos: ['storytelling'] as EstiloId[],
  }, golpeDesarrollo.golpeSugerido);
  unidades.push({
    id: 'desarrollo', componente: elDesarrollo.componente,
    props: {hitos: [
      {cuando: 'Mes 1', que: 'mandaba mensajes uno por uno'},
      {cuando: 'Mes 5', que: 'armó un embudo automático'},
      {cuando: 'Mes 8', que: 'vendió 40 cursos en una semana', acento: true},
    ]},
    audios: audiosDesarrollo, golpe: golpeDesarrollo.golpeSugerido, volumenSfx: golpeDesarrollo.volumenSfxSugerido,
    estrategiaEdicion: estrategiaDesarrollo,
  });
  usadosEnEsteVideo.push(elDesarrollo.componente.id);
  golpesUsadosEnEsteVideo.push(golpeDesarrollo.golpeSugerido);
  valoresEstablecidos = registrarValorEstablecido(valoresEstablecidos, 40, 'cantidad', 'desarrollo');

  // ══════════════════════ 3. ACELERACION (cifra) ═══════════════════════════════
  const audiosAceleracion = [clipReal('aceleracion_0')];
  const duracionAceleracion = duracionTotalDeAudios(audiosAceleracion);
  const candAceleracion = director.consultar({
    categorias: ['cifra'], intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionAceleracion,
    requiereAudioSincronizado: false, evitar: evitarComponentes(),
  });
  if (!candAceleracion.length) throw new Error('Director Visual no encontro candidato para la aceleracion');
  const elAceleracion = candAceleracion[0];
  imprimir(`3. ACELERACION (cifra): eligio "${elAceleracion.componente.id}" (score ${elAceleracion.score.toFixed(2)})`);
  const golpeAceleracion = directorAudio.decidirParaUnidad({
    indice: 2, total: TOTAL, intensidadVisual: elAceleracion.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  const estrategiaAceleracion = planificarEdicion({
    unidadId: 'aceleracion', categoria: elAceleracion.componente.categoria, intensidadComponente: elAceleracion.componente.intensidad,
    indice: 2, total: TOTAL, duracionSegTotal: duracionAceleracion, offsetsAudioSeg: offsetsAcumulados(audiosAceleracion),
  }, golpeAceleracion.golpeSugerido);
  const propsAceleracion = propsParaCifra(elAceleracion.componente.id, {
    titulo: 'Ventas por semana', puntos: [{etiqueta: 'Antes', valor: 6}, {etiqueta: 'Ahora', valor: 40}], etiqueta: 'ventas/semana',
  });
  unidades.push({
    id: 'aceleracion', componente: elAceleracion.componente, props: propsAceleracion,
    audios: audiosAceleracion, golpe: golpeAceleracion.golpeSugerido, volumenSfx: golpeAceleracion.volumenSfxSugerido,
    estrategiaEdicion: estrategiaAceleracion,
  });
  usadosEnEsteVideo.push(elAceleracion.componente.id);
  golpesUsadosEnEsteVideo.push(golpeAceleracion.golpeSugerido);

  // ══════════════════ 4. PAUSA (texto, calma real) ═════════════════════════════
  const audiosPausa = [clipReal('pausa_0')];
  const duracionPausa = duracionTotalDeAudios(audiosPausa);
  const candPausa = director.consultar({
    categorias: ['texto'], intensidadDeseada: 0.35, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionPausa,
    requiereAudioSincronizado: false, evitar: evitarComponentes(),
  });
  if (!candPausa.length) throw new Error('Director Visual no encontro candidato para la pausa');
  const elPausa = candPausa[0];
  imprimir(`4. PAUSA (texto, calma): eligio "${elPausa.componente.id}" (score ${elPausa.score.toFixed(2)})`);
  const golpePausa = directorAudio.decidirParaUnidad({
    indice: 3, total: TOTAL, intensidadVisual: elPausa.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  const estrategiaPausa = planificarEdicion({
    unidadId: 'pausa', categoria: elPausa.componente.categoria, intensidadComponente: elPausa.componente.intensidad,
    indice: 3, total: TOTAL, duracionSegTotal: duracionPausa, offsetsAudioSeg: offsetsAcumulados(audiosPausa),
  }, golpePausa.golpeSugerido);
  unidades.push({
    id: 'pausa', componente: elPausa.componente,
    props: elPausa.componente.id === 'silueta' ? {idea: {texto: 'El curso nunca cambió de precio.', pie: ''}} : {frases: ['El curso nunca cambió de precio.']},
    audios: audiosPausa, golpe: golpePausa.golpeSugerido, volumenSfx: golpePausa.volumenSfxSugerido,
    estrategiaEdicion: estrategiaPausa,
  });
  usadosEnEsteVideo.push(elPausa.componente.id);
  golpesUsadosEnEsteVideo.push(golpePausa.golpeSugerido);

  // ══════════════════ 5. IMPACTO/REVELACION (comparacion) ══════════════════════
  const audiosImpacto = [clipReal('impacto_0'), clipReal('impacto_1')];
  const duracionImpacto = duracionTotalDeAudios(audiosImpacto);
  const candImpacto = director.consultar({
    categorias: ['comparacion'], intensidadDeseada: 0.5, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionImpacto,
    requiereAudioSincronizado: true, evitar: evitarComponentes(),
  });
  if (!candImpacto.length) throw new Error('Director Visual no encontro candidato para el impacto');
  const elImpacto = candImpacto[0];
  imprimir(`5. IMPACTO (comparacion): eligio "${elImpacto.componente.id}" (score ${elImpacto.score.toFixed(2)})`);
  const golpeImpacto = directorAudio.decidirParaUnidad({
    indice: 4, total: TOTAL, intensidadVisual: elImpacto.componente.intensidad, esRevelacion: true, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  const decisionRepeticion = decidirTratamientoValor({
    valor: 89, tipoDato: 'dinero', unidadActual: 'impacto', yaEstablecidos: valoresEstablecidos,
    derivarConsecuencia: (precio) => precio * 40, // 40 ventas esa semana (cantidad, ver desarrollo)
  });
  imprimir(`   [repeticion_datos] ${decisionRepeticion.tratamiento}: ${decisionRepeticion.razon}`);
  const totalDerivado = decisionRepeticion.valorDerivado ?? 89;
  const propsImpacto = propsParaComparacion(elImpacto.componente.id, {
    izquierda: {rotulo: 'Precio por curso', texto: '$89', peso: 1},
    derecha: {rotulo: '40 ventas esa semana', texto: `$${totalDerivado.toLocaleString('es-AR')} en total`, peso: 40},
    remate: 'El mismo precio de siempre, cuarenta veces en una semana.',
  });
  const estrategiaImpacto = planificarEdicion({
    unidadId: 'impacto', categoria: elImpacto.componente.categoria, intensidadComponente: elImpacto.componente.intensidad,
    indice: 4, total: TOTAL, duracionSegTotal: duracionImpacto, offsetsAudioSeg: offsetsAcumulados(audiosImpacto),
    esRevelacion: true, tipoDatoDestacado: 'dinero', esRepeticionTratada: decisionRepeticion.tratamiento === 'consecuencia',
  }, golpeImpacto.golpeSugerido);
  unidades.push({
    id: 'impacto', componente: elImpacto.componente, props: propsImpacto,
    audios: audiosImpacto, golpe: golpeImpacto.golpeSugerido, volumenSfx: golpeImpacto.volumenSfxSugerido,
    estrategiaEdicion: estrategiaImpacto,
  });
  usadosEnEsteVideo.push(elImpacto.componente.id);
  golpesUsadosEnEsteVideo.push(golpeImpacto.golpeSugerido);
  if (decisionRepeticion.tratamiento === 'consecuencia') {
    valoresEstablecidos = registrarValorEstablecido(valoresEstablecidos, totalDerivado, 'dinero', 'impacto');
  }

  // ══════════════════ 6. NUEVO DESARROLLO (lista) ══════════════════════════════
  const audiosDesarrollo2 = [clipReal('desarrollo2_0')];
  const duracionDesarrollo2 = duracionTotalDeAudios(audiosDesarrollo2);
  const candDesarrollo2 = director.consultar({
    categorias: ['lista'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: duracionDesarrollo2,
    requiereAudioSincronizado: false, evitar: evitarComponentes(),
  });
  if (!candDesarrollo2.length) throw new Error('Director Visual no encontro candidato para el nuevo desarrollo');
  const elDesarrollo2 = candDesarrollo2[0];
  imprimir(`6. NUEVO DESARROLLO (lista): eligio "${elDesarrollo2.componente.id}" (score ${elDesarrollo2.score.toFixed(2)})`);
  const golpeDesarrollo2 = directorAudio.decidirParaUnidad({
    indice: 5, total: TOTAL, intensidadVisual: elDesarrollo2.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  const estrategiaDesarrollo2 = planificarEdicion({
    unidadId: 'desarrollo2', categoria: elDesarrollo2.componente.categoria, intensidadComponente: elDesarrollo2.componente.intensidad,
    indice: 5, total: TOTAL, duracionSegTotal: duracionDesarrollo2, offsetsAudioSeg: offsetsAcumulados(audiosDesarrollo2),
  }, golpeDesarrollo2.golpeSugerido);
  // Misma limitacion documentada en demo_05 (PENDIENTES.md item 10):
  // "ranking" y "lista-tachada" son conceptos distintos, no solo props
  // distintas -- el contenido se reformula, no se fuerza.
  const propsDesarrollo2 = elDesarrollo2.componente.id === 'ranking'
    ? {titulo: 'En qué se le iba el tiempo antes', filas: [
        {txt: 'Responder uno por uno', valor: 60},
        {txt: 'Armar cada venta a mano', valor: 30},
        {txt: 'Reordenar cobros', valor: 10},
      ], unidad: '%'}
    : {items: ['Más mensajes', 'Más seguimiento manual', 'Menos tiempo libre'], queda: 'El mismo curso, mejor proceso.'};
  unidades.push({
    id: 'desarrollo2', componente: elDesarrollo2.componente,
    props: propsDesarrollo2,
    audios: audiosDesarrollo2, golpe: golpeDesarrollo2.golpeSugerido, volumenSfx: golpeDesarrollo2.volumenSfxSugerido,
    estrategiaEdicion: estrategiaDesarrollo2,
  });
  usadosEnEsteVideo.push(elDesarrollo2.componente.id);
  golpesUsadosEnEsteVideo.push(golpeDesarrollo2.golpeSugerido);

  // ══════════════════════════════ 7. CIERRE (texto) ════════════════════════════
  const audiosCierre = [clipReal('cierre_0'), clipReal('cierre_1')];
  const duracionCierre = duracionTotalDeAudios(audiosCierre);
  const candCierre = director.consultar({
    categorias: ['texto'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionCierre,
    requiereAudioSincronizado: true, evitar: evitarComponentes(),
  });
  if (!candCierre.length) throw new Error('Director Visual no encontro candidato para el cierre');
  const elCierre = candCierre[0];
  imprimir(`7. CIERRE (texto): eligio "${elCierre.componente.id}" (score ${elCierre.score.toFixed(2)})`);
  const golpeCierre = directorAudio.decidirParaUnidad({
    indice: 6, total: TOTAL, intensidadVisual: elCierre.componente.intensidad, esCierre: true, evitarGolpes: golpesUsadosEnEsteVideo,
  });
  const estrategiaCierre = planificarEdicion({
    unidadId: 'cierre', categoria: elCierre.componente.categoria, intensidadComponente: elCierre.componente.intensidad,
    indice: 6, total: TOTAL, duracionSegTotal: duracionCierre, offsetsAudioSeg: offsetsAcumulados(audiosCierre),
    esCierre: true,
  }, golpeCierre.golpeSugerido);
  imprimir(`   golpe de cierre: "${golpeCierre.golpeSugerido}"`);
  unidades.push({
    id: 'cierre', componente: elCierre.componente,
    props: {lineas: ['El curso es el mismo archivo.', 'El alcance, no.'], entra: offsetsAcumulados(audiosCierre)},
    audios: audiosCierre, golpe: golpeCierre.golpeSugerido, volumenSfx: golpeCierre.volumenSfxSugerido,
    estrategiaEdicion: estrategiaCierre,
  });
  usadosEnEsteVideo.push(elCierre.componente.id);
  golpesUsadosEnEsteVideo.push(golpeCierre.golpeSugerido);

  const arbol = armarComposicion(VIDEO_ID, unidades);

  // Director de Retencion 2.0 (Ronda 5): analiza el arbol YA armado y
  // adjunta el mapa + alertas -- ver directores/retencion/.
  const analisisRetencion = new DirectorRetencion().analizarVideo(arbol);
  arbol.analisisRetencion = analisisRetencion;
  imprimir(`\n[retencion] mapa: ${analisisRetencion.mapa.map((p) => `${p.unidadId}=${p.fase}${p.esClimax ? '(climax)' : ''}`).join(' -> ')}`);
  for (const a of analisisRetencion.alertas) {
    imprimir(`[retencion] ALERTA (${a.severidad}) ${a.tipo}: ${a.descripcion} -- ${a.razon}`);
  }

  imprimir(`\nArbol de composicion armado. Duracion total: ${arbol.duracionTotalSeg.toFixed(2)}s ` +
    `(${Math.round(arbol.duracionTotalSeg * arbol.fps)} frames a ${arbol.fps}fps)`);
  imprimir(`Componentes usados: ${usadosEnEsteVideo.join(', ')}`);
  imprimir(`Golpes usados: ${golpesUsadosEnEsteVideo.join(', ')}`);

  return arbol;
}

/** Deriva los patrones (categoria+estilos+golpe) DIRECTAMENTE del
 * arbol final -- no hace falta smuggle-earlos desde generarArbol()
 * (fix del bug de Ronda 4: nada se registra hasta que este paso corre
 * a mano, sobre el arbol YA confirmado). */
function derivarPatrones(arbol: ArbolComposicion): PatronEdicion[] {
  const porId = new Map(registro.map((c) => [c.id, c]));
  return arbol.escenas.map((e) => ({
    categoria: porId.get(e.componenteId)?.categoria ?? 'otro',
    estilos: e.estrategiaEdicion?.estilos ?? [],
    golpe: e.golpe,
  }));
}

/** Registra el video en memoria -- llamar SOLO despues de confirmar
 * que el render + QA duro salieron bien (ver docstring del archivo). */
export function confirmarRegistro() {
  const arbol: ArbolComposicion = JSON.parse(readFileSync(BRIDGE_JSON, 'utf-8'));
  const usados = Array.from(new Set(arbol.escenas.map((e) => e.componenteId)));
  registrarVideo(VIDEO_ID, usados);
  for (const p of derivarPatrones(arbol)) registrarPatronUsado(VIDEO_ID, p);
  const hipotesis = agregarHipotesis({
    id: `${VIDEO_ID}-${Date.now()}`,
    hipotesis: 'El Director de Retencion 2.0 (mapa narrativo del video completo) + el Critico Audiovisual ' +
      '(formato Problema/Evidencia/Severidad/Tipo/Propuesta) permiten detectar problemas de arco narrativo ' +
      'que las rondas anteriores no podian ver (solo miraban unidad por unidad).',
    experimento: `${VIDEO_ID}: Ronda 5, guion nuevo (Tomás, curso online), voz real de Qwen3-TTS, ` +
      'Director de Retencion 2.0 + Critico Audiovisual corridos de verdad sobre el arbol real.',
    videoId: VIDEO_ID,
  });
  console.log(`Registrado en memoria/laboratorio.json: ${hipotesis.id} (estado: ${hipotesis.estado})`);
  console.log('NOTA: no se escribe ningun resultadoReal -- este video no se publico, es una prueba de fabrica.');
}

function main() {
  const historial = correrCicloMejora(generarArbol as (p: ParametrosGeneracion) => ArbolComposicion, {
    maxIteraciones: 2, rutaTemporal: RUTA_TEMPORAL_CICLO, publicDir: path.join(RAIZ, 'remotion-spike/public'),
  });

  console.log(`\n═══ CICLO DE MEJORA CONTROLADO: ${historial.length} intento(s) ═══`);
  for (const it of historial) {
    console.log(`\nIntento ${it.intento}: ${it.totalProblemas} problema(s)`);
    if (it.correccionesPropuestas.length) {
      console.log(`  correcciones propuestas: ${it.correccionesPropuestas.join(' | ')}`);
    }
    console.log(`  se aplicaron correcciones para el siguiente intento: ${it.seAplicaronCorrecciones}`);
  }

  const arbol = historial[historial.length - 1].arbol;
  writeFileSync(BRIDGE_JSON, JSON.stringify(arbol, null, 2));
  console.log(`\nArbol final escrito en ${BRIDGE_JSON}`);
  console.log('NOTA: todavia NO se registro en memoria -- correr con --confirmar despues del render + QA duro exitoso.');
}

if (require.main === module) {
  if (process.argv.includes('--confirmar')) {
    confirmarRegistro();
  } else {
    main();
  }
}
