/**
 * fabrica-demo-11 ("La mayoría está usando la IA mal"): guion +
 * dirección visual escena por escena entregados por el operador.
 * 12 unidades (una por línea de guion). Reutiliza la infraestructura
 * ya construida (Director Visual/Audio/Edición, Rhythm Engine, pausas
 * reales) sin agregar nada nuevo.
 *
 * Uso:
 *   npx tsx ejemplos/generar_demo_11.ts
 *   npx tsx ejemplos/generar_demo_11.ts --confirmar
 */
import {execSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio, intensidadMusicaPromedio, type DecisionAudio} from '../directores/audio';
import {DirectorEdicion} from '../directores/edicion/edicion';
import {CURVA_HOOK_ESCALADA_PAYOFF} from '../directores/edicion/curva_energia';
import {detectarPausaInterna} from '../composicion/pausas';
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
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_demo_11');
const PUBLIC_DEMO_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_demo_11');
const PUBLIC_MUSICA_DIR = path.join(RAIZ, 'remotion-spike/public/musica');
const BRIDGE_JSON = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_11.json');
const RUTA_TEMPORAL_CICLO = path.join(RAIZ, 'fabrica/laboratorio/.tmp_demo_11.json');
const RUTA_MP4_ESPERADA = path.join(RAIZ, 'fabrica/salidas/fabrica-demo-11.mp4');
const VIDEO_ID = 'fabrica-demo-11';
const TOTAL = 12;

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
    if (!r.encontrado) return undefined;
    const origen = path.join(RAIZ, 'fabrica/musica', r.archivo);
    const destino = path.join(PUBLIC_MUSICA_DIR, path.basename(r.archivo));
    if (!existsSync(destino)) copyFileSync(origen, destino);
    return {archivo: `musica/${path.basename(r.archivo)}`, volumen: 0.12, licencia: r.licencia as string, atribucion: r.atribucion as string | null};
  } catch {
    return undefined;
  }
}

function clipReal(id: string): ClipAudio {
  const origen = path.join(AUDIO_ORIGEN, `${id}.wav`);
  if (!existsSync(origen)) throw new Error(`FALTANTE: no existe audio real para "${id}" en ${origen}`);
  const duracionSeg = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim());
  copyFileSync(origen, path.join(PUBLIC_DEMO_DIR, `${id}.wav`));
  return {archivo: `fabrica_demo_11/${id}.wav`, duracionSeg};
}

function offsetsAcumulados(clips: ClipAudio[]): number[] {
  const offsets: number[] = [];
  let cursor = 0;
  for (const c of clips) { offsets.push(cursor); cursor += c.duracionSeg + AIRE_SEG; }
  return offsets;
}
function duracionTotalDeAudios(clips: ClipAudio[]): number {
  return clips.reduce((cursor, c) => cursor + c.duracionSeg + AIRE_SEG, 0);
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
    const estrategia = directorEdicion.planificar(ctx as ContextoUnidad, golpe, patronesRetencionUsadosEnEsteVideo, CURVA_HOOK_ESCALADA_PAYOFF);
    if (estrategia.patronRetencionId) patronesRetencionUsadosEnEsteVideo.push(estrategia.patronRetencionId);
    imprimir(`   [edicion] intencion=${estrategia.intencion} energia=${estrategia.energia} densidad=${estrategia.densidadVisual} estilos=[${estrategia.estilos.join('+')}] respiracion=${estrategia.respiracion}`);
    for (const m of estrategia.microeventos) imprimir(`   [microevento] +${m.enSegRelativo.toFixed(2)}s ${m.tipo}: ${m.descripcion}`);
    return estrategia;
  }

  function elegir(indice: number, q: Parameters<DirectorVisual['consultar']>[0], golpeExtra: Partial<Parameters<DirectorAudio['decidirParaUnidad']>[0]> = {}) {
    const candidatos = director.consultar({...q, evitar: evitarComponentes()});
    if (!candidatos.length) throw new Error(`Sin candidato para unidad #${indice} (categorias: ${q.categorias.join(',')})`);
    const elegido = candidatos[0];
    imprimir(`${indice + 1}. eligio "${elegido.componente.id}" (score ${elegido.score.toFixed(2)}) [${q.categorias.join(',')}]`);
    const golpe = directorAudio.decidirParaUnidad({indice, total: TOTAL, intensidadVisual: elegido.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo, ...golpeExtra});
    return {elegido, golpe};
  }

  function agregar(id: string, indice: number, elegido: ReturnType<DirectorVisual['consultar']>[number], golpe: DecisionAudio, audios: ClipAudio[], props: Record<string, unknown>, ctxExtra: Partial<ContextoUnidad> = {}) {
    golpesUsadosEnEsteVideo.push(golpe.golpeSugerido);
    decisionesAudio.push(golpe);
    const estrategia = planificarEdicion({
      unidadId: id, categoria: elegido.componente.categoria, intensidadComponente: elegido.componente.intensidad,
      indice, total: TOTAL, duracionSegTotal: duracionTotalDeAudios(audios), offsetsAudioSeg: offsetsAcumulados(audios), ...ctxExtra,
    }, golpe.golpeSugerido);
    unidades.push({id, componente: elegido.componente, props, audios, golpe: golpe.golpeSugerido, volumenSfx: golpe.volumenSfxSugerido, estrategiaEdicion: estrategia});
    usadosEnEsteVideo.push(elegido.componente.id);
  }

  // 1. hook_0 -- "La mayoria usa la IA mal." GOLPE ABSOLUTO
  const audiosHook0 = [clipReal('hook_0')];
  const {elegido: elHook0, golpe: golpeHook0} = elegir(0, {categorias: ['texto'], intensidadDeseada: 0.85, capacidadTextoNecesaria: 'corta', assetsDisponibles: ['video'], duracionDisponibleSeg: duracionTotalDeAudios(audiosHook0), requiereAudioSincronizado: true}, {});
  agregar('hook_0', 0, elHook0, golpeHook0, audiosHook0, {lineas: ['USÁS LA IA', 'MAL.'], entra: [0, audiosHook0[0].duracionSeg * 0.55]}, {esPrimera: true});

  // 2. desarrollo_0 -- "Abren ChatGPT, prueban otra herramienta..." ACUMULACION
  const audiosDesarrollo0 = [clipReal('desarrollo_0')];
  const {elegido: elDesarrollo0, golpe: golpeDesarrollo0} = elegir(1, {categorias: ['montaje'], intensidadDeseada: 0.8, capacidadTextoNecesaria: 'ninguna', assetsDisponibles: ['video'], duracionDisponibleSeg: duracionTotalDeAudios(audiosDesarrollo0), requiereAudioSincronizado: false}, {});
  agregar('desarrollo_0', 1, elDesarrollo0, golpeDesarrollo0, audiosDesarrollo0, {clips: ['freelance-01.mp4', 'celular-01.mp4', 'freelance-03.mp4', 'celular-03.mp4'], sello: 'ACUMULANDO'});

  // 3. desarrollo_1 -- "...y al final no construyen nada." CORTE BRUSCO
  const audiosDesarrollo1 = [clipReal('desarrollo_1')];
  const {elegido: elDesarrollo1, golpe: golpeDesarrollo1} = elegir(2, {categorias: ['texto'], intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosDesarrollo1), requiereAudioSincronizado: true}, {esRevelacion: true});
  agregar('desarrollo_1', 2, elDesarrollo1, golpeDesarrollo1, audiosDesarrollo1, {lineas: ['NO CONSTRUYEN NADA.'], entra: [0]}, {esRevelacion: true});

  // 4. desarrollo_2 -- "Porque tener herramientas no es tener un negocio." HERRAMIENTAS vs RESULTADOS
  const audiosDesarrollo2 = [clipReal('desarrollo_2')];
  const {elegido: elDesarrollo2, golpe: golpeDesarrollo2} = elegir(3, {categorias: ['comparacion'], intensidadDeseada: 0.55, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosDesarrollo2), requiereAudioSincronizado: true}, {});
  const pausaDesarrollo2 = detectarPausaInterna(path.join(AUDIO_ORIGEN, 'desarrollo_2.wav'), audiosDesarrollo2[0].duracionSeg);
  const propsDesarrollo2Base = propsParaComparacion(elDesarrollo2.componente.id, {izquierda: {rotulo: 'Herramientas', texto: 'Herramientas'}, derecha: {rotulo: 'Resultados', texto: 'Resultados'}});
  agregar('desarrollo_2', 3, elDesarrollo2, golpeDesarrollo2, audiosDesarrollo2, pausaDesarrollo2 !== undefined ? {...propsDesarrollo2Base, momentoCambioSeg: pausaDesarrollo2} : propsDesarrollo2Base, {pausaInternaSeg: pausaDesarrollo2});

  // 5. giro_0 -- "El juego cambia cuando conectas todo." CONEXION PROGRESIVA
  const audiosGiro0 = [clipReal('giro_0')];
  const {elegido: elGiro0, golpe: golpeGiro0} = elegir(4, {categorias: ['diagrama'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'corta', assetsDisponibles: ['icono'], duracionDisponibleSeg: duracionTotalDeAudios(audiosGiro0), requiereAudioSincronizado: false}, {});
  agregar('giro_0', 4, elGiro0, golpeGiro0, audiosGiro0, {d: {
    nodos: [
      {fig: 'foco', x: 0.2, y: 0.3, tam: 60, rotulo: 'Idea', t: 0.2},
      {fig: 'carpeta', x: 0.5, y: 0.3, tam: 60, rotulo: 'Producto', t: 0.9},
      {fig: 'documento', x: 0.8, y: 0.3, tam: 60, rotulo: 'Contenido', t: 1.6},
      {fig: 'billete', x: 0.5, y: 0.7, tam: 60, rotulo: 'Ventas', t: 2.3, acento: true},
    ],
    flechas: [{de: 0, a: 1, t: 0.9}, {de: 1, a: 2, t: 1.6}, {de: 2, a: 3, t: 2.3}],
  }});

  // 6. giro_1 -- cadena idea->producto->contenido->personas
  const audiosGiro1 = [clipReal('giro_1')];
  const {elegido: elGiro1, golpe: golpeGiro1} = elegir(5, {categorias: ['timeline'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'media', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosGiro1), requiereAudioSincronizado: true}, {});
  agregar('giro_1', 5, elGiro1, golpeGiro1, audiosGiro1,
    elGiro1.componente.id === 'crecimiento'
      ? {titulo: 'La cadena', puntos: [
          {cuando: 'Idea', etiqueta: 'Se convierte en producto', valor: 1},
          {cuando: 'Producto', etiqueta: 'Genera contenido', valor: 2},
          {cuando: 'Contenido', etiqueta: 'Atrae personas', valor: 3},
        ]}
      : {titulo: 'La cadena', hitos: [
          {cuando: '1', que: 'Una idea se convierte en producto'},
          {cuando: '2', que: 'El producto genera contenido'},
          {cuando: '3', que: 'El contenido atrae personas', acento: true},
        ]});

  // 7. pausa_0 -- "Y ahi dejas de usar la IA para jugar..." PAUSA
  const audiosPausa0 = [clipReal('pausa_0')];
  const {elegido: elPausa0, golpe: golpePausa0} = elegir(6, {categorias: ['texto'], intensidadDeseada: 0.25, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosPausa0), requiereAudioSincronizado: false}, {});
  agregar('pausa_0', 6, elPausa0, golpePausa0, audiosPausa0, {idea: {texto: 'Dejás de jugar.', pie: ''}});

  // 8. giro_2 -- "...y empezas a usarla para construir." MOMENTO MAS PODEROSO
  const audiosGiro2 = [clipReal('giro_2')];
  const {elegido: elGiro2, golpe: golpeGiro2} = elegir(7, {categorias: ['texto'], intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosGiro2), requiereAudioSincronizado: true}, {});
  agregar('giro_2', 7, elGiro2, golpeGiro2, audiosGiro2, {lineas: ['CONSTRUIR.'], entra: [0]});

  // 9. desarrollo_3 -- "cien herramientas" -> aparecen, CORTE, desaparecen
  const audiosDesarrollo3 = [clipReal('desarrollo_3')];
  const {elegido: elDesarrollo3, golpe: golpeDesarrollo3} = elegir(8, {categorias: ['lista'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'media', assetsDisponibles: ['icono'], duracionDisponibleSeg: duracionTotalDeAudios(audiosDesarrollo3), requiereAudioSincronizado: false}, {});
  const propsHerramientas = {titulo: 'Cien herramientas', items: [
    {nombre: 'Chat', color: '#3b82f6', texto: ''}, {nombre: 'Imagen', color: '#22c55e', texto: ''}, {nombre: 'Video', color: '#f97316', texto: ''},
  ], pie: 'No es la cantidad.'};
  agregar('desarrollo_3', 8, elDesarrollo3, golpeDesarrollo3, audiosDesarrollo3,
    elDesarrollo3.componente.id === 'logos-herramientas' ? propsHerramientas
    : elDesarrollo3.componente.id === 'pasos' ? {titulo: 'Cien herramientas', pasos: [{fig: 'chip' as const, txt: 'Chat'}, {fig: 'nube' as const, txt: 'Imagen'}, {fig: 'telefono' as const, txt: 'Video'}]}
    : elDesarrollo3.componente.id === 'lista-tachada' ? {titulo: 'Cien herramientas', items: ['Chat', 'Imagen'], queda: 'Ninguna sola'}
    : {titulo: 'Cien herramientas', filas: [{txt: 'Chat', valor: 90}, {txt: 'Imagen', valor: 70}, {txt: 'Video', valor: 50}], unidad: '%'});

  // 10. payoff_0 -- "Esta en saber que hacer con ellas." CONCLUSION
  const audiosPayoff0 = [clipReal('payoff_0')];
  const {elegido: elPayoff0, golpe: golpePayoff0} = elegir(9, {categorias: ['texto'], intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosPayoff0), requiereAudioSincronizado: false}, {});
  agregar('payoff_0', 9, elPayoff0, golpePayoff0, audiosPayoff0, {frases: ['NO ES LA HERRAMIENTA.', 'ES LO QUE HACÉS CON ELLA.']});

  // 11. payoff_1 -- "estoy construyendo ese sistema desde cero." REVELACION FINAL
  const audiosPayoff1 = [clipReal('payoff_1')];
  const {elegido: elPayoff1, golpe: golpePayoff1} = elegir(10, {categorias: ['diagrama'], intensidadDeseada: 0.45, capacidadTextoNecesaria: 'corta', assetsDisponibles: ['icono'], duracionDisponibleSeg: duracionTotalDeAudios(audiosPayoff1), requiereAudioSincronizado: false}, {});
  agregar('payoff_1', 10, elPayoff1, golpePayoff1, audiosPayoff1, {d: {
    nodos: [
      {fig: 'foco', x: 0.15, y: 0.25, tam: 55, rotulo: 'Idea', t: 0.2},
      {fig: 'carpeta', x: 0.4, y: 0.25, tam: 55, rotulo: 'Producto', t: 0.7},
      {fig: 'documento', x: 0.65, y: 0.25, tam: 55, rotulo: 'Contenido', t: 1.2},
      {fig: 'gente', x: 0.85, y: 0.5, tam: 55, rotulo: 'Audiencia', t: 1.7},
      {fig: 'billete', x: 0.5, y: 0.78, tam: 70, rotulo: 'Venta', t: 2.2, acento: true},
    ],
    flechas: [{de: 0, a: 1, t: 0.7}, {de: 1, a: 2, t: 1.2}, {de: 2, a: 3, t: 1.7}, {de: 3, a: 4, t: 2.2}],
  }});

  // 12. cierre_0 -- "Seguime y mira como lo hago." CTA
  const audiosCierre0 = [clipReal('cierre_0')];
  const {elegido: elCierre0, golpe: golpeCierre0} = elegir(11, {categorias: ['texto'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta', assetsDisponibles: ['video'], duracionDisponibleSeg: duracionTotalDeAudios(audiosCierre0), requiereAudioSincronizado: false}, {esCierre: true});
  agregar('cierre_0', 11, elCierre0, golpeCierre0, audiosCierre0,
    elCierre0.componente.id === 'remate'
      ? {d: {lineas: ['Idea.', 'Producto.', 'Sistema.'], grande: 'SEGUIME', pie: 'Y mirá cómo lo hago.'}, clip: 'freelance-05.mp4'}
      : elCierre0.componente.id === 'silueta'
        ? {idea: {texto: 'Seguime.', pie: 'Y mirá cómo lo hago.'}}
        : {lineas: ['SEGUIME.', 'Y MIRÁ CÓMO LO HAGO.'], entra: [0, audiosCierre0[0].duracionSeg * 0.5], clip: 'freelance-05.mp4'},
    {esCierre: true});

  const arbol = armarComposicion(VIDEO_ID, unidades);
  const musicaFondo = resolverMusicaFondo(decisionesAudio, arbol.duracionTotalSeg);
  if (musicaFondo) { arbol.musicaFondo = musicaFondo; imprimir(`[musica] ${musicaFondo.archivo}`); }

  const analisisRetencion = new DirectorRetencion().analizarVideo(arbol);
  arbol.analisisRetencion = analisisRetencion;
  imprimir(`\n[retencion] mapa: ${analisisRetencion.mapa.map((p) => `${p.unidadId}=${p.fase}${p.esClimax ? '(climax)' : ''}`).join(' -> ')}`);
  for (const a of analisisRetencion.alertas) imprimir(`[retencion] ALERTA (${a.severidad}) ${a.tipo}: ${a.descripcion}`);

  imprimir(`\nDuracion total: ${arbol.duracionTotalSeg.toFixed(2)}s (${Math.round(arbol.duracionTotalSeg * arbol.fps)} frames)`);
  imprimir(`Componentes (${new Set(usadosEnEsteVideo).size} distintos de ${TOTAL}): ${usadosEnEsteVideo.join(', ')}`);
  return arbol;
}

function derivarPatrones(arbol: ArbolComposicion): PatronEdicion[] {
  const porId = new Map(registro.map((c) => [c.id, c]));
  return arbol.escenas.map((e) => ({categoria: porId.get(e.componenteId)?.categoria ?? 'otro', estilos: e.estrategiaEdicion?.estilos ?? [], golpe: e.golpe}));
}

export function confirmarRegistro() {
  const arbol: ArbolComposicion = JSON.parse(readFileSync(BRIDGE_JSON, 'utf-8'));
  const usados = Array.from(new Set(arbol.escenas.map((e) => e.componenteId)));
  registrarVideoMemoria(VIDEO_ID, usados);
  for (const p of derivarPatrones(arbol)) registrarPatronUsado(VIDEO_ID, p);
  const hipotesis = agregarHipotesis({
    id: `${VIDEO_ID}-${Date.now()}`,
    hipotesis: 'Guion + direccion visual escena-por-escena entregados por el operador, traducidos a la infraestructura existente, producen un video coherente con la intencion narrativa dada -- sin afirmar mejora de retencion real (sin publicacion).',
    experimento: `${VIDEO_ID}: guion nuevo ("La mayoria usa la IA mal"), 12 unidades.`,
    videoId: VIDEO_ID,
  });
  console.log(`Registrado en memoria/laboratorio.json: ${hipotesis.id}`);
  if (!existsSync(RUTA_MP4_ESPERADA)) { console.log('NOTA: falta renderizar antes de --confirmar.'); return; }
  const {registro: registroDatos, log} = armarRegistroConQaReal({
    rutaMp4: RUTA_MP4_ESPERADA, rutaArbolJson: BRIDGE_JSON, publicDir: path.join(RAIZ, 'remotion-spike/public'),
    registroBase: {
      videoId: VIDEO_ID, idea: 'La mayoria usa la IA mal: coleccionar herramientas no es construir un sistema.',
      tema: 'IA aplicada a negocios digitales', angulo: 'contrarian -- herramientas vs sistema',
      hookPatronId: 'contexto-parcial', estructura: 'hook-desarrollo-giro-pausa-giro-payoff-cierre',
      duracionSeg: arbol.duracionTotalSeg, voz: 'Qwen3-TTS', componentesUsados: usados,
      formato: 'vertical 1080x1920', fecha: '2026-09-04',
    },
  });
  for (const l of log) console.log(`   [${l.paso}] ${l.decision} -- ${l.razon}`);
  console.log(JSON.stringify(registroDatos, null, 2));
}

function main() {
  const historial = correrCicloMejora(generarArbol as (p: ParametrosGeneracion) => ArbolComposicion, {
    maxIteraciones: 2, rutaTemporal: RUTA_TEMPORAL_CICLO, publicDir: path.join(RAIZ, 'remotion-spike/public'),
  });
  console.log(`\nCiclo de mejora: ${historial.length} intento(s)`);
  const arbol = historial[historial.length - 1].arbol;
  writeFileSync(BRIDGE_JSON, JSON.stringify(arbol, null, 2));
  console.log(`Arbol escrito en ${BRIDGE_JSON}`);
}

if (require.main === module) {
  if (process.argv.includes('--confirmar')) confirmarRegistro();
  else main();
}
