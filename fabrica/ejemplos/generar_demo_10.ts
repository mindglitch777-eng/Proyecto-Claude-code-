/**
 * R7-32 ("Nueva prueba de estrés de la fábrica -- Benchmark audiovisual
 * agresivo", docs/PROMPT_BENCHMARK_AGRESIVO.md): a diferencia de TODOS
 * los demos anteriores, esta vez el guion, la dirección visual escena
 * por escena, el ritmo, las transiciones y la curva de energía vienen
 * dados EXPLÍCITAMENTE por el operador -- el trabajo de este generador
 * es traducir ese brief a llamadas reales de la infraestructura ya
 * construida, no interpretar libremente qué es "agresivo".
 *
 * 14 unidades (una por línea exacta del guion -- ver
 * docs/PROMPT_BENCHMARK_AGRESIVO.md para la tabla completa
 * ESCENA→FRASE→INTENCIÓN→ENERGÍA→RECURSO→MOTIVO). Reutiliza:
 *   - Rhythm Engine (curva_energia.ts, R7-31) con una curva NUEVA
 *     (`CURVA_BENCHMARK_AGRESIVO`, un punto por unidad -- la curva
 *     original de demo_08/09 no encaja con 14 unidades).
 *   - Pausas reales medidas (composicion/pausas.ts, R7-31) para anclar
 *     tanto `cambia_encuadre` como el `momentoCambioSeg` real de
 *     `antes-despues` en unidades de un solo clip de audio.
 *   - Forced-alignment real (fabrica/voz/alineacion.ts, nuevo esta
 *     ronda pero envolviendo el prototipo YA EXISTENTE de R6-2/P3-3)
 *     para anclar la jerarquía visual del Hook a la palabra real "no".
 *
 * Regla dura seguida en TODO el archivo: ningún componente que exija
 * pasar un número/valor no narrado en esa unidad (el guion de esta
 * prueba, a propósito, no tiene ninguna cifra nueva) -- ver la sección
 * "No usados esta ronda" del brief para la lista completa de
 * componentes de categoría 'cifra' descartados por este motivo.
 *
 * Uso:
 *   npx tsx ejemplos/generar_demo_10.ts             (genera + escribe el arbol)
 *   npx tsx ejemplos/generar_demo_10.ts --confirmar  (registra en memoria Y datos/, DESPUES del render+QA)
 */
import {execSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio, intensidadMusicaPromedio, type DecisionAudio} from '../directores/audio';
import {DirectorEdicion} from '../directores/edicion/edicion';
import {CURVA_BENCHMARK_AGRESIVO} from '../directores/edicion/curva_energia';
import {detectarPausaInterna} from '../composicion/pausas';
import {buscarPalabraAlineada} from '../voz/alineacion';
import type {ContextoUnidad} from '../directores/edicion/tipos';
import {DirectorRetencion} from '../directores/retencion/retencion';
import {armarComposicion, AIRE_SEG} from '../composicion/armar';
import {propsParaComparacion} from '../composicion/adaptadores';
import type {ArbolComposicion, ClipAudio, UnidadResuelta} from '../composicion/tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import type {TipoGolpe} from '../directores/audio';
import {registrarVideo as registrarVideoMemoria, agregarHipotesis, componentesUsadosRecientes} from '../memoria/api';
import {registrarPatronUsado, type PatronEdicion} from '../memoria/patrones';
import {correrCicloMejora, type ParametrosGeneracion} from '../laboratorio/ciclo_mejora';
import {armarRegistroConQaReal} from '../orquestador/orquestador';
import registroRaw from '../componentes/registro.json';

const RAIZ = path.resolve(__dirname, '../..');
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_demo_10');
const PUBLIC_DEMO_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_demo_10');
const PUBLIC_MUSICA_DIR = path.join(RAIZ, 'remotion-spike/public/musica');
const BRIDGE_JSON = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_10.json');
const RUTA_TEMPORAL_CICLO = path.join(RAIZ, 'fabrica/laboratorio/.tmp_demo_10.json');
const RUTA_MP4_ESPERADA = path.join(RAIZ, 'fabrica/salidas/fabrica-demo-10.mp4');
const RUTA_ALINEACION_HOOK = path.join(RAIZ, 'fabrica/voz/resultados_alineacion/hook_0.json');
const VIDEO_ID = 'fabrica-demo-10';
const TOTAL = 14;

mkdirSync(PUBLIC_DEMO_DIR, {recursive: true});
mkdirSync(PUBLIC_MUSICA_DIR, {recursive: true});

function resolverMusicaFondo(decisiones: DecisionAudio[], duracionTotalSeg: number) {
  const intensidad = intensidadMusicaPromedio(decisiones);
  try {
    const salida = execSync(
      `python3 "${path.join(__dirname, '../musica/resolver_musica.py')}" --intensidad ${intensidad.toFixed(3)} --duracion ${duracionTotalSeg.toFixed(1)}`,
      {encoding: 'utf-8'}
    );
    const r = JSON.parse(salida);
    if (!r.encontrado) {
      console.log(`   [musica] FALTANTE (intensidad ${intensidad.toFixed(2)}): ${r.razon}`);
      return undefined;
    }
    const origen = path.join(RAIZ, 'fabrica/musica', r.archivo);
    const destino = path.join(PUBLIC_MUSICA_DIR, path.basename(r.archivo));
    if (!existsSync(destino)) copyFileSync(origen, destino);
    console.log(`   [musica] elegido "${r.id}" para intensidad promedio ${intensidad.toFixed(2)} (score ${r.score.toFixed(2)}) -- ${r.razon}`);
    return {
      archivo: `musica/${path.basename(r.archivo)}`,
      volumen: 0.12,
      licencia: r.licencia as string,
      atribucion: r.atribucion as string | null,
    };
  } catch (e) {
    console.log(`   [musica] error consultando el resolver: ${e}`);
    return undefined;
  }
}

function clipReal(id: string): ClipAudio {
  const origen = path.join(AUDIO_ORIGEN, `${id}.wav`);
  if (!existsSync(origen)) {
    throw new Error(`FALTANTE: no existe audio real para "${id}" en ${origen} -- correr generar-voz-demo-10.yml primero`);
  }
  const duracionSeg = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim()
  );
  copyFileSync(origen, path.join(PUBLIC_DEMO_DIR, `${id}.wav`));
  return {archivo: `fabrica_demo_10/${id}.wav`, duracionSeg};
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
  const decisionesAudio: DecisionAudio[] = [];
  const patronesRetencionUsadosEnEsteVideo: string[] = [];
  const unidades: UnidadResuelta[] = [];

  function planificarEdicion(ctx: Omit<ContextoUnidad, 'unidadId'> & {unidadId: string}, golpe: TipoGolpe) {
    const estrategia = directorEdicion.planificar(ctx as ContextoUnidad, golpe, patronesRetencionUsadosEnEsteVideo, CURVA_BENCHMARK_AGRESIVO);
    if (estrategia.patronRetencionId) patronesRetencionUsadosEnEsteVideo.push(estrategia.patronRetencionId);
    imprimir(`   [edicion] intencion=${estrategia.intencion} energia=${estrategia.energia} ` +
      `densidad=${estrategia.densidadVisual} estilos=[${estrategia.estilos.join('+')}] ` +
      `respiracion=${estrategia.respiracion}`);
    imprimir(`   [edicion] transicion: ${estrategia.transicion.motivo}`);
    for (const m of estrategia.microeventos) {
      imprimir(`   [microevento] +${m.enSegRelativo.toFixed(2)}s ${m.tipo}: ${m.descripcion}`);
    }
    return estrategia;
  }

  function elegirYRegistrar(indice: number, params2: Parameters<DirectorVisual['consultar']>[0], golpeParams: Parameters<DirectorAudio['decidirParaUnidad']>[0] extends infer P ? Omit<P, 'indice' | 'total' | 'intensidadVisual' | 'evitarGolpes'> : never) {
    const candidatos = director.consultar({...params2, evitar: evitarComponentes()});
    if (!candidatos.length) throw new Error(`Director Visual no encontro candidato para la unidad #${indice}`);
    const elegido = candidatos[0];
    imprimir(`${indice + 1}. eligio "${elegido.componente.id}" (score ${elegido.score.toFixed(2)}) [categorias: ${params2.categorias.join(',')}]`);
    const golpe = directorAudio.decidirParaUnidad({
      indice, total: TOTAL, intensidadVisual: elegido.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo, ...golpeParams,
    });
    return {elegido, golpe};
  }

  // ══════════════════════════════ 1. HOOK_0 -- interrupcion absoluta ══════════
  const audiosHook0 = [clipReal('hook_0')];
  const duracionHook0 = duracionTotalDeAudios(audiosHook0);
  const {elegido: elHook0, golpe: golpeHook0} = elegirYRegistrar(0, {
    categorias: ['texto'], intensidadDeseada: 0.85, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: ['video'], duracionDisponibleSeg: duracionHook0, requiereAudioSincronizado: true,
  }, {});
  golpesUsadosEnEsteVideo.push(golpeHook0.golpeSugerido);
  decisionesAudio.push(golpeHook0);
  // Jerarquia visual real (seccion "Escena 1" del brief): "LA IA" / "NO" / "TE VA A HACER GANAR PLATA",
  // anclada a la palabra REAL "no" medida por forced-alignment (fabrica/voz/alineacion.ts) si existe.
  const palabraNo = buscarPalabraAlineada(RUTA_ALINEACION_HOOK, 'no');
  let lineasHook0: string[];
  let entraHook0: number[];
  if (palabraNo) {
    lineasHook0 = ['LA INTELIGENCIA ARTIFICIAL', 'NO', 'TE VA A HACER GANAR PLATA'];
    entraHook0 = [0, palabraNo.inicio, palabraNo.fin];
    imprimir(`   [alineacion_real] palabra "no" medida por faster-whisper: ${palabraNo.inicio.toFixed(2)}s-${palabraNo.fin.toFixed(2)}s -- golpe anclado a esto, no inventado`);
  } else {
    lineasHook0 = ['LA INTELIGENCIA ARTIFICIAL NO', 'TE VA A HACER GANAR PLATA'];
    entraHook0 = [0, audiosHook0[0].duracionSeg * 0.5];
    imprimir('   [alineacion_real] SIN resultado de forced-alignment todavia -- division PAREJA (no medida), ver docs/PROMPT_BENCHMARK_AGRESIVO.md');
  }
  const estrategiaHook0 = planificarEdicion({
    unidadId: 'hook_0', categoria: elHook0.componente.categoria, intensidadComponente: elHook0.componente.intensidad,
    indice: 0, total: TOTAL, duracionSegTotal: duracionHook0, offsetsAudioSeg: offsetsAcumulados(audiosHook0), esPrimera: true,
  }, golpeHook0.golpeSugerido);
  unidades.push({
    id: 'hook_0', componente: elHook0.componente,
    props: {lineas: lineasHook0, entra: entraHook0},
    audios: audiosHook0, golpe: golpeHook0.golpeSugerido, volumenSfx: golpeHook0.volumenSfxSugerido,
    estrategiaEdicion: estrategiaHook0,
  });
  usadosEnEsteVideo.push(elHook0.componente.id);

  // ══════════════════════════════ 2. HOOK_1 -- contraste inmediato ═══════════
  const audiosHook1 = [clipReal('hook_1')];
  const duracionHook1 = duracionTotalDeAudios(audiosHook1);
  const {elegido: elHook1, golpe: golpeHook1} = elegirYRegistrar(1, {
    categorias: ['texto'], intensidadDeseada: 0.25, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionHook1, requiereAudioSincronizado: false,
  }, {});
  golpesUsadosEnEsteVideo.push(golpeHook1.golpeSugerido);
  decisionesAudio.push(golpeHook1);
  const estrategiaHook1 = planificarEdicion({
    unidadId: 'hook_1', categoria: elHook1.componente.categoria, intensidadComponente: elHook1.componente.intensidad,
    indice: 1, total: TOTAL, duracionSegTotal: duracionHook1, offsetsAudioSeg: offsetsAcumulados(audiosHook1),
  }, golpeHook1.golpeSugerido);
  unidades.push({
    id: 'hook_1', componente: elHook1.componente,
    props: {idea: {texto: 'Y cuanto antes entiendas esto, mejor.', pie: ''}},
    audios: audiosHook1, golpe: golpeHook1.golpeSugerido, volumenSfx: golpeHook1.volumenSfxSugerido,
    estrategiaEdicion: estrategiaHook1,
  });
  usadosEnEsteVideo.push(elHook1.componente.id);

  // ══════════════════════════════ 3. DESARROLLO_0 -- abundancia (rafaga) ═════
  const audiosDesarrollo0 = [clipReal('desarrollo_0')];
  const duracionDesarrollo0 = duracionTotalDeAudios(audiosDesarrollo0);
  const {elegido: elDesarrollo0, golpe: golpeDesarrollo0} = elegirYRegistrar(2, {
    categorias: ['montaje'], intensidadDeseada: 0.8, capacidadTextoNecesaria: 'ninguna',
    assetsDisponibles: ['video'], duracionDisponibleSeg: duracionDesarrollo0, requiereAudioSincronizado: false,
  }, {});
  golpesUsadosEnEsteVideo.push(golpeDesarrollo0.golpeSugerido);
  decisionesAudio.push(golpeDesarrollo0);
  const estrategiaDesarrollo0 = planificarEdicion({
    unidadId: 'desarrollo_0', categoria: elDesarrollo0.componente.categoria, intensidadComponente: elDesarrollo0.componente.intensidad,
    indice: 2, total: TOTAL, duracionSegTotal: duracionDesarrollo0, offsetsAudioSeg: offsetsAcumulados(audiosDesarrollo0),
  }, golpeDesarrollo0.golpeSugerido);
  unidades.push({
    id: 'desarrollo_0', componente: elDesarrollo0.componente,
    // "100 EN UNA TARDE" recuerda la cifra YA NARRADA en este mismo clip
    // (cien videos/imagenes/productos) -- no es un dato nuevo inventado.
    props: {clips: ['freelance-00.mp4', 'celular-00.mp4', 'freelance-02.mp4', 'celular-02.mp4', 'freelance-04.mp4'], sello: '100 EN UNA TARDE'},
    audios: audiosDesarrollo0, golpe: golpeDesarrollo0.golpeSugerido, volumenSfx: golpeDesarrollo0.volumenSfxSugerido,
    estrategiaEdicion: estrategiaDesarrollo0,
  });
  usadosEnEsteVideo.push(elDesarrollo0.componente.id);

  // ══════════════════════════════ 4. DESARROLLO_1 -- frenazo (balanza) ═══════
  const audiosDesarrollo1 = [clipReal('desarrollo_1')];
  const duracionDesarrollo1 = duracionTotalDeAudios(audiosDesarrollo1);
  const {elegido: elDesarrollo1, golpe: golpeDesarrollo1} = elegirYRegistrar(3, {
    categorias: ['comparacion'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionDesarrollo1, requiereAudioSincronizado: false,
  }, {});
  golpesUsadosEnEsteVideo.push(golpeDesarrollo1.golpeSugerido);
  decisionesAudio.push(golpeDesarrollo1);
  const estrategiaDesarrollo1 = planificarEdicion({
    unidadId: 'desarrollo_1', categoria: elDesarrollo1.componente.categoria, intensidadComponente: elDesarrollo1.componente.intensidad,
    indice: 3, total: TOTAL, duracionSegTotal: duracionDesarrollo1, offsetsAudioSeg: offsetsAcumulados(audiosDesarrollo1),
  }, golpeDesarrollo1.golpeSugerido);
  // Pesos RELATIVOS (produccion vs. ventas), NINGUN numero real -- balanza
  // esta disenada exactamente para esto (ver componentes/registro.json).
  const propsDesarrollo1 = propsParaComparacion(elDesarrollo1.componente.id, {
    izquierda: {rotulo: 'Producción', texto: 'producción', peso: 8},
    derecha: {rotulo: 'Ventas', texto: 'ventas', peso: 2},
    remate: 'Producir más no es vender más.',
  });
  unidades.push({
    id: 'desarrollo_1', componente: elDesarrollo1.componente, props: propsDesarrollo1,
    audios: audiosDesarrollo1, golpe: golpeDesarrollo1.golpeSugerido, volumenSfx: golpeDesarrollo1.volumenSfxSugerido,
    estrategiaEdicion: estrategiaDesarrollo1,
  });
  usadosEnEsteVideo.push(elDesarrollo1.componente.id);

  // ══════════════════════════════ 5. DESARROLLO_2 -- automatizacion (lista) ══
  const audiosDesarrollo2 = [clipReal('desarrollo_2')];
  const duracionDesarrollo2 = duracionTotalDeAudios(audiosDesarrollo2);
  const {elegido: elDesarrollo2, golpe: golpeDesarrollo2} = elegirYRegistrar(4, {
    categorias: ['lista'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'media',
    assetsDisponibles: ['icono'], duracionDisponibleSeg: duracionDesarrollo2, requiereAudioSincronizado: false,
  }, {});
  // HALLAZGO REAL (no un bug a esconder): el ganador real en esta franja
  // es "logos-herramientas" (intensidad intrinseca 0.35) porque la
  // anti-repeticion cross-video penaliza a ranking/lista-tachada (ya
  // usados en fabrica-demo-08/09, ver memoria/historial_componentes.json)
  // -- subir intensidadDeseada en la consulta NO cambia esto, porque
  // decidirIntencion() usa la intensidad REAL del componente ganador,
  // no la deseada. Con un clip corto (~2.5s) y esa intensidad, el
  // sistema clasifica esta unidad como "dejar_respirar" -- el Rhythm
  // Engine respeta esa clasificacion (nunca fuerza energia sobre una
  // pausa real, R7-31), asi que desarrollo_2 termina leyendose como un
  // segundo momento de calma en vez de la "aceleracion" que pedia el
  // brief. Documentado en vez de forzarlo con un componente peor.
  golpesUsadosEnEsteVideo.push(golpeDesarrollo2.golpeSugerido);
  decisionesAudio.push(golpeDesarrollo2);
  const pausaDesarrollo2 = detectarPausaInterna(path.join(AUDIO_ORIGEN, 'desarrollo_2.wav'), audiosDesarrollo2[0].duracionSeg);
  if (pausaDesarrollo2 !== undefined) imprimir(`   [pausa_real] desarrollo_2: pausa detectada a los ${pausaDesarrollo2.toFixed(2)}s`);
  const estrategiaDesarrollo2 = planificarEdicion({
    unidadId: 'desarrollo_2', categoria: elDesarrollo2.componente.categoria, intensidadComponente: elDesarrollo2.componente.intensidad,
    indice: 4, total: TOTAL, duracionSegTotal: duracionDesarrollo2, offsetsAudioSeg: offsetsAcumulados(audiosDesarrollo2),
    pausaInternaSeg: pausaDesarrollo2,
  }, golpeDesarrollo2.golpeSugerido);
  const procesos = [
    {nombre: 'Contenido', color: '#3b82f6', texto: 'solo'},
    {nombre: 'Mensajes', color: '#22c55e', texto: 'solos'},
    {nombre: 'Ventas', color: '#f97316', texto: 'solas'},
  ];
  const propsDesarrollo2 = elDesarrollo2.componente.id === 'logos-herramientas'
    ? {titulo: 'Todo se automatiza', items: procesos, pie: 'Todo.'}
    : elDesarrollo2.componente.id === 'pasos'
      ? {titulo: 'Todo se automatiza', pasos: [{fig: 'engranaje' as const, txt: 'Contenido'}, {fig: 'mensaje' as const, txt: 'Mensajes'}, {fig: 'billete' as const, txt: 'Ventas'}]}
      : elDesarrollo2.componente.id === 'lista-tachada'
        ? {titulo: 'Todo se automatiza', items: ['Contenido', 'Mensajes'], queda: 'Ventas'}
        : {titulo: 'Todo se automatiza', filas: procesos.map((p, i) => ({txt: p.nombre, valor: 90 - i * 20})), unidad: '%'};
  unidades.push({
    id: 'desarrollo_2', componente: elDesarrollo2.componente, props: propsDesarrollo2,
    audios: audiosDesarrollo2, golpe: golpeDesarrollo2.golpeSugerido, volumenSfx: golpeDesarrollo2.volumenSfxSugerido,
    estrategiaEdicion: estrategiaDesarrollo2,
  });
  usadosEnEsteVideo.push(elDesarrollo2.componente.id);

  // ══════════════════════════════ 6. DESARROLLO_3 -- GIRO 1 (colapso) ════════
  const audiosDesarrollo3 = [clipReal('desarrollo_3')];
  const duracionDesarrollo3 = duracionTotalDeAudios(audiosDesarrollo3);
  const {elegido: elDesarrollo3, golpe: golpeDesarrollo3} = elegirYRegistrar(5, {
    categorias: ['comparacion'], intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta',
    // requiereAudioSincronizado:true es HARD FILTER -- de los componentes
    // de categoria 'comparacion', solo antes-despues lo soporta (ver
    // registro.json), asi que esto garantiza el ganador correcto para
    // poder anclar el colapso a un momento real, sin competir con
    // balanza (ya usado en desarrollo_1).
    assetsDisponibles: [], duracionDisponibleSeg: duracionDesarrollo3, requiereAudioSincronizado: true,
  }, {esRevelacion: true});
  golpesUsadosEnEsteVideo.push(golpeDesarrollo3.golpeSugerido);
  decisionesAudio.push(golpeDesarrollo3);
  const pausaDesarrollo3 = detectarPausaInterna(path.join(AUDIO_ORIGEN, 'desarrollo_3.wav'), audiosDesarrollo3[0].duracionSeg);
  if (pausaDesarrollo3 !== undefined) imprimir(`   [pausa_real] desarrollo_3: pausa detectada a los ${pausaDesarrollo3.toFixed(2)}s -- ancla real del colapso visual`);
  const estrategiaDesarrollo3 = planificarEdicion({
    unidadId: 'desarrollo_3', categoria: elDesarrollo3.componente.categoria, intensidadComponente: elDesarrollo3.componente.intensidad,
    indice: 5, total: TOTAL, duracionSegTotal: duracionDesarrollo3, offsetsAudioSeg: offsetsAcumulados(audiosDesarrollo3),
    esRevelacion: true, pausaInternaSeg: pausaDesarrollo3,
  }, golpeDesarrollo3.golpeSugerido);
  const propsDesarrollo3Base = propsParaComparacion(elDesarrollo3.componente.id, {
    izquierda: {rotulo: 'Antes', texto: 'Todo automatizado'},
    derecha: {rotulo: 'Después', texto: 'Vacío'},
  });
  // Reusa la MISMA pausa real ya detectada arriba -- una unica medicion,
  // dos sistemas la consumen (cambia_encuadre via microeventos.ts Y el
  // reveal real de antes-despues aca), conexion no duplicacion (seccion
  // 17 del brief).
  const propsDesarrollo3 = pausaDesarrollo3 !== undefined
    ? {...propsDesarrollo3Base, momentoCambioSeg: pausaDesarrollo3}
    : propsDesarrollo3Base;
  unidades.push({
    id: 'desarrollo_3', componente: elDesarrollo3.componente, props: propsDesarrollo3,
    audios: audiosDesarrollo3, golpe: golpeDesarrollo3.golpeSugerido, volumenSfx: golpeDesarrollo3.volumenSfxSugerido,
    estrategiaEdicion: estrategiaDesarrollo3,
  });
  usadosEnEsteVideo.push(elDesarrollo3.componente.id);

  // ══════════════════════════════ 7. GIRO_0 -- nueva direccion ═══════════════
  const audiosGiro0 = [clipReal('giro_0')];
  const duracionGiro0 = duracionTotalDeAudios(audiosGiro0);
  const {elegido: elGiro0, golpe: golpeGiro0} = elegirYRegistrar(6, {
    categorias: ['otro'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionGiro0, requiereAudioSincronizado: false,
  }, {});
  golpesUsadosEnEsteVideo.push(golpeGiro0.golpeSugerido);
  decisionesAudio.push(golpeGiro0);
  const estrategiaGiro0 = planificarEdicion({
    unidadId: 'giro_0', categoria: elGiro0.componente.categoria, intensidadComponente: elGiro0.componente.intensidad,
    indice: 6, total: TOTAL, duracionSegTotal: duracionGiro0, offsetsAudioSeg: offsetsAcumulados(audiosGiro0),
  }, golpeGiro0.golpeSugerido);
  unidades.push({
    id: 'giro_0', componente: elGiro0.componente,
    props: {consulta: 'cómo vender con ia', sugerencias: [{txt: 'primero, una oferta real', t: 1.6, acento: true}]},
    audios: audiosGiro0, golpe: golpeGiro0.golpeSugerido, volumenSfx: golpeGiro0.volumenSfxSugerido,
    estrategiaEdicion: estrategiaGiro0,
  });
  usadosEnEsteVideo.push(elGiro0.componente.id);

  // ══════════════════════════════ 8. GIRO_1 -- triada 1/3: PROBLEMA ══════════
  const audiosGiro1 = [clipReal('giro_1')];
  const duracionGiro1 = duracionTotalDeAudios(audiosGiro1);
  const {elegido: elGiro1, golpe: golpeGiro1} = elegirYRegistrar(7, {
    categorias: ['otro'], intensidadDeseada: 0.45, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: duracionGiro1, requiereAudioSincronizado: false,
  }, {});
  golpesUsadosEnEsteVideo.push(golpeGiro1.golpeSugerido);
  decisionesAudio.push(golpeGiro1);
  const estrategiaGiro1 = planificarEdicion({
    unidadId: 'giro_1', categoria: elGiro1.componente.categoria, intensidadComponente: elGiro1.componente.intensidad,
    indice: 7, total: TOTAL, duracionSegTotal: duracionGiro1, offsetsAudioSeg: offsetsAcumulados(audiosGiro1),
  }, golpeGiro1.golpeSugerido);
  unidades.push({
    id: 'giro_1', componente: elGiro1.componente,
    props: {titulo: 'PROBLEMA', mensajes: [
      {de: 'ellos', txt: 'Generé un montón de contenido con IA esta semana...', t: 0.3},
      {de: 'ellos', txt: 'y no vendí nada.', t: 1.5, acento: true},
    ]},
    audios: audiosGiro1, golpe: golpeGiro1.golpeSugerido, volumenSfx: golpeGiro1.volumenSfxSugerido,
    estrategiaEdicion: estrategiaGiro1,
  });
  usadosEnEsteVideo.push(elGiro1.componente.id);

  // ══════════════════════════════ 9. GIRO_2 -- triada 2/3: OFERTA ════════════
  const audiosGiro2 = [clipReal('giro_2')];
  const duracionGiro2 = duracionTotalDeAudios(audiosGiro2);
  const {elegido: elGiro2, golpe: golpeGiro2} = elegirYRegistrar(8, {
    categorias: ['otro'], intensidadDeseada: 0.45, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionGiro2, requiereAudioSincronizado: false,
  }, {});
  golpesUsadosEnEsteVideo.push(golpeGiro2.golpeSugerido);
  decisionesAudio.push(golpeGiro2);
  const estrategiaGiro2 = planificarEdicion({
    unidadId: 'giro_2', categoria: elGiro2.componente.categoria, intensidadComponente: elGiro2.componente.intensidad,
    indice: 8, total: TOTAL, duracionSegTotal: duracionGiro2, offsetsAudioSeg: offsetsAcumulados(audiosGiro2),
  }, golpeGiro2.golpeSugerido);
  unidades.push({
    id: 'giro_2', componente: elGiro2.componente,
    props: {titulo: 'OFERTA', items: [
      {app: 'Mensajes', txt: 'Una propuesta te espera', t: 0.3},
      {app: 'Mail', txt: 'Alguien quiere lo tuyo', t: 1.3, acento: true},
    ]},
    audios: audiosGiro2, golpe: golpeGiro2.golpeSugerido, volumenSfx: golpeGiro2.volumenSfxSugerido,
    estrategiaEdicion: estrategiaGiro2,
  });
  usadosEnEsteVideo.push(elGiro2.componente.id);

  // ══════════════════════════════ 10. GIRO_3 -- triada 3/3: CULMINACION ══════
  const audiosGiro3 = [clipReal('giro_3')];
  const duracionGiro3 = duracionTotalDeAudios(audiosGiro3);
  const {elegido: elGiro3, golpe: golpeGiro3} = elegirYRegistrar(9, {
    categorias: ['texto'], intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionGiro3, requiereAudioSincronizado: true,
  }, {});
  golpesUsadosEnEsteVideo.push(golpeGiro3.golpeSugerido);
  decisionesAudio.push(golpeGiro3);
  const estrategiaGiro3 = planificarEdicion({
    unidadId: 'giro_3', categoria: elGiro3.componente.categoria, intensidadComponente: elGiro3.componente.intensidad,
    indice: 9, total: TOTAL, duracionSegTotal: duracionGiro3, offsetsAudioSeg: offsetsAcumulados(audiosGiro3),
  }, golpeGiro3.golpeSugerido);
  unidades.push({
    id: 'giro_3', componente: elGiro3.componente,
    props: {lineas: ['Y RECIÉN AHÍ MULTIPLICAN LO QUE FUNCIONA'], entra: [0]},
    audios: audiosGiro3, golpe: golpeGiro3.golpeSugerido, volumenSfx: golpeGiro3.volumenSfxSugerido,
    estrategiaEdicion: estrategiaGiro3,
  });
  usadosEnEsteVideo.push(elGiro3.componente.id);

  // ══════════════════════════════ 11. REVELACION_0 -- PAUSA deliberada ═══════
  const audiosRevelacion0 = [clipReal('revelacion_0')];
  const duracionRevelacion0 = duracionTotalDeAudios(audiosRevelacion0);
  const {elegido: elRevelacion0, golpe: golpeRevelacion0} = elegirYRegistrar(10, {
    categorias: ['texto'], intensidadDeseada: 0.25, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionRevelacion0, requiereAudioSincronizado: false,
  }, {});
  golpesUsadosEnEsteVideo.push(golpeRevelacion0.golpeSugerido);
  decisionesAudio.push(golpeRevelacion0);
  const estrategiaRevelacion0 = planificarEdicion({
    unidadId: 'revelacion_0', categoria: elRevelacion0.componente.categoria, intensidadComponente: elRevelacion0.componente.intensidad,
    indice: 10, total: TOTAL, duracionSegTotal: duracionRevelacion0, offsetsAudioSeg: offsetsAcumulados(audiosRevelacion0),
  }, golpeRevelacion0.golpeSugerido);
  unidades.push({
    id: 'revelacion_0', componente: elRevelacion0.componente,
    props: {idea: {texto: 'La máquina no decide qué quiere comprar la gente.', pie: ''}},
    audios: audiosRevelacion0, golpe: golpeRevelacion0.golpeSugerido, volumenSfx: golpeRevelacion0.volumenSfxSugerido,
    estrategiaEdicion: estrategiaRevelacion0,
  });
  usadosEnEsteVideo.push(elRevelacion0.componente.id);

  // ══════════════════════════════ 12. REVELACION_1 -- GOLPE ══════════════════
  const audiosRevelacion1 = [clipReal('revelacion_1')];
  const duracionRevelacion1 = duracionTotalDeAudios(audiosRevelacion1);
  const {elegido: elRevelacion1, golpe: golpeRevelacion1} = elegirYRegistrar(11, {
    categorias: ['texto'], intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: duracionRevelacion1, requiereAudioSincronizado: true,
  }, {});
  golpesUsadosEnEsteVideo.push(golpeRevelacion1.golpeSugerido);
  decisionesAudio.push(golpeRevelacion1);
  const estrategiaRevelacion1 = planificarEdicion({
    unidadId: 'revelacion_1', categoria: elRevelacion1.componente.categoria, intensidadComponente: elRevelacion1.componente.intensidad,
    indice: 11, total: TOTAL, duracionSegTotal: duracionRevelacion1, offsetsAudioSeg: offsetsAcumulados(audiosRevelacion1),
  }, golpeRevelacion1.golpeSugerido);
  unidades.push({
    id: 'revelacion_1', componente: elRevelacion1.componente,
    props: {lineas: ['TE AYUDA A EJECUTAR'], entra: [0]},
    audios: audiosRevelacion1, golpe: golpeRevelacion1.golpeSugerido, volumenSfx: golpeRevelacion1.volumenSfxSugerido,
    estrategiaEdicion: estrategiaRevelacion1,
  });
  usadosEnEsteVideo.push(elRevelacion1.componente.id);

  // ══════════════════════════════ 13. PAYOFF_0 -- convergencia (diagrama) ════
  const audiosPayoff0 = [clipReal('payoff_0')];
  const duracionPayoff0 = duracionTotalDeAudios(audiosPayoff0);
  const {elegido: elPayoff0, golpe: golpePayoff0} = elegirYRegistrar(12, {
    categorias: ['diagrama'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: ['icono'], duracionDisponibleSeg: duracionPayoff0, requiereAudioSincronizado: true,
  }, {});
  golpesUsadosEnEsteVideo.push(golpePayoff0.golpeSugerido);
  decisionesAudio.push(golpePayoff0);
  const estrategiaPayoff0 = planificarEdicion({
    unidadId: 'payoff_0', categoria: elPayoff0.componente.categoria, intensidadComponente: elPayoff0.componente.intensidad,
    indice: 12, total: TOTAL, duracionSegTotal: duracionPayoff0, offsetsAudioSeg: offsetsAcumulados(audiosPayoff0),
  }, golpePayoff0.golpeSugerido);
  unidades.push({
    id: 'payoff_0', componente: elPayoff0.componente,
    props: {d: {
      nodos: [
        {fig: 'lupa', x: 0.22, y: 0.28, tam: 65, rotulo: 'Problema', t: 0.2},
        {fig: 'etiqueta', x: 0.78, y: 0.28, tam: 65, rotulo: 'Oferta', t: 0.6},
        {fig: 'robot', x: 0.5, y: 0.52, tam: 65, rotulo: 'IA', t: 1.0},
        {fig: 'cohete', x: 0.5, y: 0.78, tam: 85, rotulo: 'Ejecución', t: 1.6, acento: true},
      ],
      flechas: [
        {de: 0, a: 3, t: 1.2},
        {de: 1, a: 3, t: 1.3},
        {de: 2, a: 3, t: 1.4},
      ],
    }},
    audios: audiosPayoff0, golpe: golpePayoff0.golpeSugerido, volumenSfx: golpePayoff0.volumenSfxSugerido,
    estrategiaEdicion: estrategiaPayoff0,
  });
  usadosEnEsteVideo.push(elPayoff0.componente.id);

  // ══════════════════════════════ 14. PAYOFF_1 -- CIERRE ═════════════════════
  const audiosPayoff1 = [clipReal('payoff_1')];
  const duracionPayoff1 = duracionTotalDeAudios(audiosPayoff1);
  const {elegido: elPayoff1, golpe: golpePayoff1} = elegirYRegistrar(13, {
    categorias: ['texto'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: ['video'], duracionDisponibleSeg: duracionPayoff1, requiereAudioSincronizado: false,
  }, {esCierre: true});
  golpesUsadosEnEsteVideo.push(golpePayoff1.golpeSugerido);
  decisionesAudio.push(golpePayoff1);
  const estrategiaPayoff1 = planificarEdicion({
    unidadId: 'payoff_1', categoria: elPayoff1.componente.categoria, intensidadComponente: elPayoff1.componente.intensidad,
    indice: 13, total: TOTAL, duracionSegTotal: duracionPayoff1, offsetsAudioSeg: offsetsAcumulados(audiosPayoff1), esCierre: true,
  }, golpePayoff1.golpeSugerido);
  const fondoCierre = buscarFondo('persona decidiendo, trabajo digital, laptop');
  unidades.push({
    id: 'payoff_1', componente: elPayoff1.componente,
    props: {
      d: {
        lineas: ['El problema.', 'La oferta.', 'La IA, al final.'],
        grande: 'CAMBIA EL JUEGO',
        pie: '',
      },
      clip: fondoCierre ?? 'freelance-05.mp4',
    },
    audios: audiosPayoff1, golpe: golpePayoff1.golpeSugerido, volumenSfx: golpePayoff1.volumenSfxSugerido,
    estrategiaEdicion: estrategiaPayoff1,
  });
  usadosEnEsteVideo.push(elPayoff1.componente.id);

  const arbol = armarComposicion(VIDEO_ID, unidades);

  const musicaFondo = resolverMusicaFondo(decisionesAudio, arbol.duracionTotalSeg);
  if (musicaFondo) {
    arbol.musicaFondo = musicaFondo;
    imprimir(`\n[musica] arbol.musicaFondo = ${musicaFondo.archivo} (volumen ${musicaFondo.volumen}, licencia ${musicaFondo.licencia})`);
  }

  const analisisRetencion = new DirectorRetencion().analizarVideo(arbol);
  arbol.analisisRetencion = analisisRetencion;
  imprimir(`\n[retencion] mapa: ${analisisRetencion.mapa.map((p) => `${p.unidadId}=${p.fase}${p.esClimax ? '(climax)' : ''}`).join(' -> ')}`);
  for (const a of analisisRetencion.alertas) {
    imprimir(`[retencion] ALERTA (${a.severidad}) ${a.tipo}: ${a.descripcion} -- ${a.razon}`);
  }

  imprimir(`\nArbol de composicion armado. Duracion total: ${arbol.duracionTotalSeg.toFixed(2)}s ` +
    `(${Math.round(arbol.duracionTotalSeg * arbol.fps)} frames a ${arbol.fps}fps)`);
  imprimir(`Componentes usados (${new Set(usadosEnEsteVideo).size} distintos de 14 unidades): ${usadosEnEsteVideo.join(', ')}`);
  imprimir(`Golpes usados: ${golpesUsadosEnEsteVideo.join(', ')}`);

  return arbol;
}

function derivarPatrones(arbol: ArbolComposicion): PatronEdicion[] {
  const porId = new Map(registro.map((c) => [c.id, c]));
  return arbol.escenas.map((e) => ({
    categoria: porId.get(e.componenteId)?.categoria ?? 'otro',
    estilos: e.estrategiaEdicion?.estilos ?? [],
    golpe: e.golpe,
  }));
}

export function confirmarRegistro() {
  const arbol: ArbolComposicion = JSON.parse(readFileSync(BRIDGE_JSON, 'utf-8'));
  const usados = Array.from(new Set(arbol.escenas.map((e) => e.componenteId)));

  registrarVideoMemoria(VIDEO_ID, usados);
  for (const p of derivarPatrones(arbol)) registrarPatronUsado(VIDEO_ID, p);
  const hipotesis = agregarHipotesis({
    id: `${VIDEO_ID}-${Date.now()}`,
    hipotesis: 'Un guion + direccion visual escena-por-escena + curva de energia explicitos, ' +
      'entregados por el operador y traducidos 1:1 a la infraestructura existente (Director Visual/Audio/Edicion, ' +
      'Rhythm Engine, pausas reales, forced-alignment), produce un video objetivamente mas variado y menos ' +
      'predecible que fabrica-demo-09 (mas componentes distintos del catalogo, mas eventos de cambio, ' +
      'menos dependencia de cifras) -- sin que eso implique una mejora de RETENCION real (ninguna publicacion existe).',
    experimento: `${VIDEO_ID}: guion nuevo ("La IA no es el negocio"), 14 unidades (una por linea), ` +
      'brief de director completo (docs/PROMPT_BENCHMARK_AGRESIVO.md) vs. fabrica-demo-09 (guion de Tomas, 7 unidades).',
    videoId: VIDEO_ID,
  });
  console.log(`Registrado en memoria/laboratorio.json: ${hipotesis.id} (estado: ${hipotesis.estado})`);

  if (!existsSync(RUTA_MP4_ESPERADA)) {
    console.log(`NOTA: ${RUTA_MP4_ESPERADA} no existe todavía -- correr el render de Remotion antes de --confirmar.`);
    return;
  }
  const {registro: registroDatos, log} = armarRegistroConQaReal({
    rutaMp4: RUTA_MP4_ESPERADA,
    rutaArbolJson: BRIDGE_JSON,
    publicDir: path.join(RAIZ, 'remotion-spike/public'),
    registroBase: {
      videoId: VIDEO_ID, idea: 'La IA no es el negocio: primero problema y oferta, despues IA para multiplicar.',
      tema: 'IA aplicada a negocios digitales', angulo: 'contrarian -- produccion no es lo mismo que venta',
      hookPatronId: 'contexto-parcial', estructura: 'hook-desarrollo-giro-triada-revelacion-payoff',
      duracionSeg: arbol.duracionTotalSeg, voz: 'Qwen3-TTS', componentesUsados: usados,
      formato: 'vertical 1080x1920, benchmark audiovisual agresivo (R7-32)', fecha: '2026-09-03',
    },
  });
  console.log('\n[orquestador] decisiones QA -> Data Engine:');
  for (const l of log) console.log(`   [${l.paso}] ${l.decision} -- ${l.razon}`);
  console.log(`\nRegistroVideoCompleto armado (qaResumen.ok=${registroDatos.qaResumen?.ok}):`);
  console.log(JSON.stringify(registroDatos, null, 2));
  console.log(
    '\nNOTA (mismo hallazgo real de R7-30): fabrica/datos/datos.ts no persiste solo -- copiar el JSON de ' +
    'arriba a mano en fabrica/datos/datos.ts (REGISTROS_VIDEO) despues de confirmar que el QA salio bien.'
  );
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
  console.log('NOTA: todavia NO se registro -- correr con --confirmar despues del render + QA exitoso.');
}

if (require.main === module) {
  if (process.argv.includes('--confirmar')) {
    confirmarRegistro();
  } else {
    main();
  }
}
