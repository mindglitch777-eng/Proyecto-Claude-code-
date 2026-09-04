/**
 * fabrica-demo-12 ("El 98% pierde dinero porque no vende productos
 * digitales con IA"): guion + dirección visual escena por escena
 * entregados por el operador (60s, 14 unidades). Sin música de fondo
 * continua (pedido explícito) -- solo SFX de golpe por unidad.
 * Reutiliza la infraestructura ya existente.
 *
 * Uso:
 *   npx tsx ejemplos/generar_demo_12.ts
 *   npx tsx ejemplos/generar_demo_12.ts --confirmar
 */
import {execSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio, type DecisionAudio} from '../directores/audio';
import {DirectorEdicion} from '../directores/edicion/edicion';
import {CURVA_HOOK_ESCALADA_PAYOFF} from '../directores/edicion/curva_energia';
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
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_demo_12');
const PUBLIC_DEMO_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_demo_12');
const BRIDGE_JSON = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_12.json');
const RUTA_TEMPORAL_CICLO = path.join(RAIZ, 'fabrica/laboratorio/.tmp_demo_12.json');
const RUTA_MP4_ESPERADA = path.join(RAIZ, 'fabrica/salidas/fabrica-demo-12.mp4');
const VIDEO_ID = 'fabrica-demo-12';
const TOTAL = 14;

mkdirSync(PUBLIC_DEMO_DIR, {recursive: true});

function clipReal(id: string): ClipAudio {
  const origen = path.join(AUDIO_ORIGEN, `${id}.wav`);
  if (!existsSync(origen)) throw new Error(`FALTANTE: no existe audio real para "${id}" en ${origen}`);
  const duracionSeg = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim());
  copyFileSync(origen, path.join(PUBLIC_DEMO_DIR, `${id}.wav`));
  return {archivo: `fabrica_demo_12/${id}.wav`, duracionSeg};
}
function offsetsAcumulados(clips: ClipAudio[]): number[] {
  const offsets: number[] = []; let cursor = 0;
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
    imprimir(`   [edicion] intencion=${estrategia.intencion} energia=${estrategia.energia} densidad=${estrategia.densidadVisual} estilos=[${estrategia.estilos.join('+')}]`);
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

  // 1. hook_0 -- "El 98% pierde dinero todos los dias." GOLPE SECO
  const audiosHook0 = [clipReal('hook_0')];
  const {elegido: elHook0, golpe: golpeHook0} = elegir(0, {categorias: ['cifra'], intensidadDeseada: 0.85, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosHook0), requiereAudioSincronizado: true}, {});
  const propsHook0 = elHook0.componente.id === 'torre-3d'
    ? {arriba: 'Pierde dinero', hasta: 98, sufijo: '%', prefijo: ''}
    : {arriba: 'Pierde dinero', hasta: 98, sufijo: '%', prefijo: '', desde: 0};
  agregar('hook_0', 0, elHook0, golpeHook0, audiosHook0, propsHook0, {esPrimera: true});

  // 2. hook_1 -- "Y no vas a querer saber por que." TACHADO
  const audiosHook1 = [clipReal('hook_1')];
  const {elegido: elHook1, golpe: golpeHook1} = elegir(1, {categorias: ['texto'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosHook1), requiereAudioSincronizado: true}, {});
  agregar('hook_1', 1, elHook1, golpeHook1, audiosHook1, {lineas: ['NO VAS A QUERER', 'SABER POR QUÉ.'], entra: [0, audiosHook1[0].duracionSeg * 0.5]});

  // 3. desarrollo_0 -- "Porque no venden productos digitales." TIEMPO vs ACTIVO DIGITAL
  const audiosDesarrollo0 = [clipReal('desarrollo_0')];
  const {elegido: elDesarrollo0, golpe: golpeDesarrollo0} = elegir(2, {categorias: ['comparacion'], intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosDesarrollo0), requiereAudioSincronizado: false}, {});
  const propsDesarrollo0 = elDesarrollo0.componente.id === 'duelo'
    ? {izq: {rotulo: 'Tiempo', valor: 'Se agota'}, der: {rotulo: 'Activo digital', valor: 'Se enciende'}, ganador: 'der' as const}
    : propsParaComparacion(elDesarrollo0.componente.id, {izquierda: {rotulo: 'Tiempo', texto: 'Se agota'}, derecha: {rotulo: 'Activo digital', texto: 'Se enciende'}});
  agregar('desarrollo_0', 2, elDesarrollo0, golpeDesarrollo0, audiosDesarrollo0, propsDesarrollo0);

  // 4. desarrollo_1 -- "$60.000.000.000 al año." LLUVIA DE CEROS
  const audiosDesarrollo1 = [clipReal('desarrollo_1')];
  const {elegido: elDesarrollo1, golpe: golpeDesarrollo1} = elegir(3, {categorias: ['cifra'], intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosDesarrollo1), requiereAudioSincronizado: true}, {});
  agregar('desarrollo_1', 3, elDesarrollo1, golpeDesarrollo1, audiosDesarrollo1, {arriba: 'Mercado digital', hasta: 60000000000, prefijo: '$', abajo: 'al año'});

  // 5. desarrollo_2 -- "La IA lo esta multiplicando." IA ORBITANDO
  const audiosDesarrollo2 = [clipReal('desarrollo_2')];
  const {elegido: elDesarrollo2, golpe: golpeDesarrollo2} = elegir(4, {categorias: ['diagrama'], intensidadDeseada: 0.5, capacidadTextoNecesaria: 'corta', assetsDisponibles: ['icono'], duracionDisponibleSeg: duracionTotalDeAudios(audiosDesarrollo2), requiereAudioSincronizado: false}, {});
  agregar('desarrollo_2', 4, elDesarrollo2, golpeDesarrollo2, audiosDesarrollo2, {d: {
    nodos: [
      {fig: 'robot', x: 0.5, y: 0.35, tam: 75, rotulo: 'IA', t: 0.2, acento: true},
      {fig: 'chip', x: 0.2, y: 0.6, tam: 50, t: 0.7},
      {fig: 'nube', x: 0.8, y: 0.6, tam: 50, t: 1.0},
      {fig: 'cohete', x: 0.5, y: 0.8, tam: 55, t: 1.3},
    ],
    flechas: [{de: 0, a: 1, t: 0.7}, {de: 0, a: 2, t: 1.0}, {de: 0, a: 3, t: 1.3}],
  }});

  // 6. casos_0 -- "0 a 5.000, 10.000 y 50.000 dolares al mes." CASOS VERIFICADOS
  const audiosCasos0 = [clipReal('casos_0')];
  const {elegido: elCasos0, golpe: golpeCasos0} = elegir(5, {categorias: ['lista'], intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosCasos0), requiereAudioSincronizado: false}, {});
  const propsCasos0 = elCasos0.componente.id === 'ranking'
    ? {titulo: 'Casos documentados', filas: [{txt: 'Caso 1', valor: 5000}, {txt: 'Caso 2', valor: 10000}, {txt: 'Caso 3', valor: 50000, acento: true}], unidad: '$/mes'}
    : {titulo: 'Casos documentados', items: ['Caso 1: $5.000', 'Caso 2: $10.000'], queda: 'Caso 3: $50.000/mes'};
  agregar('casos_0', 5, elCasos0, golpeCasos0, audiosCasos0, propsCasos0);

  // 7. critica_0 -- "El 98% sigue usando la IA para jugar." PROMPTS RIDICULOS
  const audiosCritica0 = [clipReal('critica_0')];
  const {elegido: elCritica0, golpe: golpeCritica0} = elegir(6, {categorias: ['otro'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosCritica0), requiereAudioSincronizado: false}, {});
  agregar('critica_0', 6, elCritica0, golpeCritica0, audiosCritica0, {consulta: 'receta de pizza', sugerencias: [{txt: 'poema', t: 1.0}, {txt: 'resúmeme esto', t: 1.6, acento: true}]});

  // 8. critica_1 -- "...para construir activos." LADRILLOS
  const audiosCritica1 = [clipReal('critica_1')];
  const {elegido: elCritica1, golpe: golpeCritica1} = elegir(7, {categorias: ['lista'], intensidadDeseada: 0.4, capacidadTextoNecesaria: 'media', assetsDisponibles: ['icono'], duracionDisponibleSeg: duracionTotalDeAudios(audiosCritica1), requiereAudioSincronizado: false}, {esRevelacion: true});
  const activos = [
    {nombre: 'eBook', color: '#3b82f6', texto: ''}, {nombre: 'Plantilla', color: '#22c55e', texto: ''},
    {nombre: 'Curso', color: '#f97316', texto: ''}, {nombre: 'Embudo', color: '#a855f7', texto: ''},
  ];
  const propsCritica1 = elCritica1.componente.id === 'logos-herramientas'
    ? {titulo: 'ACTIVOS', items: activos, pie: ''}
    : elCritica1.componente.id === 'pasos'
      ? {titulo: 'ACTIVOS', pasos: [{fig: 'documento' as const, txt: 'eBook'}, {fig: 'carpeta' as const, txt: 'Plantilla'}, {fig: 'foco' as const, txt: 'Curso'}, {fig: 'mapa' as const, txt: 'Embudo'}]}
      : {titulo: 'ACTIVOS', filas: activos.map((a, i) => ({txt: a.nombre, valor: 100 - i * 10})), unidad: '%'};
  agregar('critica_1', 7, elCritica1, golpeCritica1, audiosCritica1, propsCritica1, {esRevelacion: true});

  // 9. sistema_0 -- "Idea, producto digital, contenido, venta automatizada." DIAGRAMA
  const audiosSistema0 = [clipReal('sistema_0')];
  const {elegido: elSistema0, golpe: golpeSistema0} = elegir(8, {categorias: ['diagrama'], intensidadDeseada: 0.45, capacidadTextoNecesaria: 'corta', assetsDisponibles: ['icono'], duracionDisponibleSeg: duracionTotalDeAudios(audiosSistema0), requiereAudioSincronizado: false}, {});
  agregar('sistema_0', 8, elSistema0, golpeSistema0, audiosSistema0, {d: {
    nodos: [
      {fig: 'foco', x: 0.15, y: 0.3, tam: 55, rotulo: 'Idea', t: 0.2},
      {fig: 'carpeta', x: 0.4, y: 0.3, tam: 55, rotulo: 'Producto', t: 0.9},
      {fig: 'documento', x: 0.65, y: 0.3, tam: 55, rotulo: 'Contenido', t: 1.6},
      {fig: 'billete', x: 0.5, y: 0.7, tam: 65, rotulo: 'Venta', t: 2.3, acento: true},
    ],
    flechas: [{de: 0, a: 1, t: 0.9}, {de: 1, a: 2, t: 1.6}, {de: 2, a: 3, t: 2.3}],
  }});

  // 10. sistema_1 -- "No camara, no edicion, necesitas sistema." TACHADO
  const audiosSistema1 = [clipReal('sistema_1')];
  const {elegido: elSistema1, golpe: golpeSistema1} = elegir(9, {categorias: ['lista'], intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosSistema1), requiereAudioSincronizado: false}, {});
  const propsSistema1 = elSistema1.componente.id === 'lista-tachada'
    ? {titulo: 'No necesitas', items: ['Cámara', 'Edición'], queda: 'Sistema'}
    : elSistema1.componente.id === 'ranking'
      ? {titulo: 'No necesitas', filas: [{txt: 'Cámara', valor: 20}, {txt: 'Edición', valor: 20}, {txt: 'Sistema', valor: 100, acento: true}], unidad: '%'}
      : {titulo: 'No necesitas', items: [{nombre: 'Cámara', color: '#ef4444', texto: 'no'}, {nombre: 'Edición', color: '#ef4444', texto: 'no'}, {nombre: 'Sistema', color: '#22c55e', texto: 'sí'}], pie: ''};
  agregar('sistema_1', 9, elSistema1, golpeSistema1, audiosSistema1, propsSistema1);

  // 11. prueba_0 -- "Documentando el proceso completo." PAUSA
  const audiosPrueba0 = [clipReal('prueba_0')];
  const {elegido: elPrueba0, golpe: golpePrueba0} = elegir(10, {categorias: ['texto'], intensidadDeseada: 0.3, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosPrueba0), requiereAudioSincronizado: false}, {});
  agregar('prueba_0', 10, elPrueba0, golpePrueba0, audiosPrueba0, {idea: {texto: 'Documentando el proceso.', pie: ''}});

  // 12. prueba_1 -- "Casos reales, cifras exactas, errores que aprendi." 3 VIÑETAS
  const audiosPrueba1 = [clipReal('prueba_1')];
  const {elegido: elPrueba1, golpe: golpePrueba1} = elegir(11, {categorias: ['texto'], intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosPrueba1), requiereAudioSincronizado: false}, {});
  agregar('prueba_1', 11, elPrueba1, golpePrueba1, audiosPrueba1, {frases: ['CASOS REALES.', 'ERRORES QUE APRENDÍ.', 'LA SOLUCIÓN CON IA.']});

  // 13. payoff_0 -- "Dejar de perder plata... generar activos." ROTURA -> DORADO
  const audiosPayoff0 = [clipReal('payoff_0')];
  const {elegido: elPayoff0, golpe: golpePayoff0} = elegir(12, {categorias: ['comparacion'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta', assetsDisponibles: [], duracionDisponibleSeg: duracionTotalDeAudios(audiosPayoff0), requiereAudioSincronizado: true}, {esRevelacion: true});
  const propsPayoff0 = propsParaComparacion(elPayoff0.componente.id, {izquierda: {rotulo: 'Antes', texto: 'Perder plata'}, derecha: {rotulo: 'Después', texto: 'Generar activos'}});
  agregar('payoff_0', 12, elPayoff0, golpePayoff0, audiosPayoff0, propsPayoff0, {esRevelacion: true});

  // 14. cierre_0 -- CTA
  const audiosCierre0 = [clipReal('cierre_0')];
  const {elegido: elCierre0, golpe: golpeCierre0} = elegir(13, {categorias: ['texto'], intensidadDeseada: 0.65, capacidadTextoNecesaria: 'corta', assetsDisponibles: ['video'], duracionDisponibleSeg: duracionTotalDeAudios(audiosCierre0), requiereAudioSincronizado: false}, {esCierre: true});
  const propsCierre0 = elCierre0.componente.id === 'remate'
    ? {d: {lineas: ['Casos reales.', 'Cifras exactas.', 'Sistema aplicado.'], grande: 'SEGUIME', pie: ''}, clip: 'freelance-05.mp4'}
    : elCierre0.componente.id === 'silueta'
      ? {idea: {texto: 'Seguime.', pie: 'El sistema aplicado, esta semana.'}}
      : {lineas: ['SEGUIME.', 'EL SISTEMA APLICADO, ESTA SEMANA.'], entra: [0, audiosCierre0[0].duracionSeg * 0.5]};
  agregar('cierre_0', 13, elCierre0, golpeCierre0, audiosCierre0, propsCierre0, {esCierre: true});

  const arbol = armarComposicion(VIDEO_ID, unidades);
  // Pedido explicito: NO musica de fondo continua, solo SFX por golpe.

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
    hipotesis: 'Guion largo (60s, 14 unidades) con datos reales dados por el operador ($60B, 98%, casos de $5k/$10k/$50k) y direccion visual detallada, sin musica de fondo (solo SFX), traducido a la infraestructura existente, produce un video coherente y variado -- sin afirmar mejora de retencion real (sin publicacion).',
    experimento: `${VIDEO_ID}: guion nuevo ("98% pierde dinero"), 14 unidades, 60s objetivo.`,
    videoId: VIDEO_ID,
  });
  console.log(`Registrado en memoria/laboratorio.json: ${hipotesis.id}`);
  if (!existsSync(RUTA_MP4_ESPERADA)) { console.log('NOTA: falta renderizar antes de --confirmar.'); return; }
  const {registro: registroDatos, log} = armarRegistroConQaReal({
    rutaMp4: RUTA_MP4_ESPERADA, rutaArbolJson: BRIDGE_JSON, publicDir: path.join(RAIZ, 'remotion-spike/public'),
    registroBase: {
      videoId: VIDEO_ID, idea: 'El 98% pierde dinero por no vender productos digitales con IA.',
      tema: 'IA aplicada a negocios digitales', angulo: 'datos duros + casos documentados',
      hookPatronId: 'contexto-parcial', estructura: 'hook-desarrollo-casos-critica-sistema-prueba-payoff-cierre',
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
