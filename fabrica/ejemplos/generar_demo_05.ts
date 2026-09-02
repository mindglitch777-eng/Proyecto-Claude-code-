/**
 * Ronda 4 (Director de Edicion): video de prueba real, NO reciclado de
 * fabrica-demo-01..04. A diferencia de los generadores anteriores,
 * este llama de verdad al pipeline completo por cada unidad:
 *
 *   Director Visual -> Director de Audio -> Director de Edicion ->
 *   Composicion
 *
 * `generarArbol(params)` es una funcion PURA respecto de la memoria
 * global del proyecto (no escribe registrarVideo/agregarHipotesis/
 * registrarPatronUsado) para que el ciclo de mejora controlado
 * (fabrica/laboratorio/ciclo_mejora.ts) pueda invocarla mas de una vez
 * de forma segura -- esos registros se hacen UNA sola vez en main(),
 * despues de que el ciclo elige el arbol final. Si necesitas leer los
 * detalles completos de cada decision, correlo con
 * `npx tsx ejemplos/generar_demo_05.ts` y mira la consola.
 *
 * Ejercita, con datos reales (no un mock):
 *   - DirectorEdicion.planificar() para las 7 unidades -- intencion,
 *     energia, estilos combinados, elemento principal/secundario,
 *     entrada/salida, transicion motivada, microeventos.
 *   - El microevento 'se_revela_comparacion' anclado al offset REAL
 *     del segundo audio de "impacto" -> FabricaVideo.tsx lo traduce a
 *     `momentoCambioSeg` de AntesDespues (fix real, ver
 *     MEJORAS_RONDA4.md).
 *   - repeticion_datos.ts: "$340" (dinero) se establece en el hook y
 *     se resuelve por consecuencia derivada ($6.120 = 340 x 18) en el
 *     impacto, en vez de repetirse.
 *   - La escena de "pausa" YA NO fuerza golpe='ninguno' a mano (como
 *     hacia generar_demo_04.ts) -- DirectorAudio decide de verdad.
 *   - fabrica/memoria/patrones.ts: se consulta decidirPrioridadPatron
 *     para el patron de la escena de impacto (categoria+estilos+golpe)
 *     -- primera vez que corre este mecanismo, asi que no deberia
 *     penalizar nada todavia (se documenta la lectura, no se fuerza).
 *   - El ciclo de mejora controlado (fabrica/laboratorio/ciclo_mejora.ts)
 *     corre de verdad sobre este generador real, no sobre un mock.
 *
 * Uso: npx tsx ejemplos/generar_demo_05.ts
 * (requiere que capturas_voz/audio_demo_05/*.wav ya exista)
 */
import {execSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio} from '../directores/audio';
import {DirectorEdicion} from '../directores/edicion/edicion';
import type {ContextoUnidad, EstiloId} from '../directores/edicion/tipos';
import {armarComposicion, AIRE_SEG} from '../composicion/armar';
import {propsParaCifra, propsParaComparacion} from '../composicion/adaptadores';
import {decidirTratamientoValor, registrarValorEstablecido, ValorEstablecido} from '../composicion/repeticion_datos';
import type {ArbolComposicion, ClipAudio, UnidadResuelta} from '../composicion/tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import type {TipoGolpe} from '../directores/audio';
import {registrarVideo, agregarHipotesis, componentesUsadosRecientes} from '../memoria/api';
import {decidirPrioridadPatron, registrarPatronUsado, type PatronEdicion} from '../memoria/patrones';
import {correrCicloMejora, type ParametrosGeneracion} from '../laboratorio/ciclo_mejora';
import registroRaw from '../componentes/registro.json';

const RAIZ = path.resolve(__dirname, '../..');
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_demo_05');
const PUBLIC_DEMO_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_demo_05');
const BRIDGE_JSON = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge/demo_05.json');
const RUTA_TEMPORAL_CICLO = path.join(RAIZ, 'fabrica/laboratorio/.tmp_demo_05.json');

mkdirSync(PUBLIC_DEMO_DIR, {recursive: true});

function clipReal(id: string): ClipAudio {
  const origen = path.join(AUDIO_ORIGEN, `${id}.wav`);
  if (!existsSync(origen)) {
    throw new Error(`FALTANTE: no existe audio real para "${id}" en ${origen} -- correr el workflow generar-voz-demo-05.yml primero`);
  }
  const duracionSeg = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim()
  );
  copyFileSync(origen, path.join(PUBLIC_DEMO_DIR, `${id}.wav`));
  return {archivo: `fabrica_demo_05/${id}.wav`, duracionSeg};
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

/** Misma cuenta que armar.ts (resolverAudios) para poder pasarle a
 * DirectorEdicion la duracion real de la escena ANTES de que
 * armarComposicion() corra -- se necesita para decidir intencion
 * (seccion "pausa real") y para el check de tramo estatico. */
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

/**
 * Genera el arbol de composicion completo. PURA respecto de la
 * memoria global (ver docstring del archivo) -- `params` es lo unico
 * que puede variar el resultado entre llamadas (usado por el ciclo de
 * mejora controlado para reintentar con correcciones seguras).
 */
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
  const fondoHook = buscarFondo('alguien editando video en una laptop, trabajo creativo freelance');
  const golpeHook = directorAudio.decidirParaUnidad({indice: 0, total: TOTAL, intensidadVisual: elHook.componente.intensidad, evitarGolpes: golpesUsadosEnEsteVideo});
  const estrategiaHook = planificarEdicion({
    unidadId: 'hook', categoria: elHook.componente.categoria, intensidadComponente: elHook.componente.intensidad,
    indice: 0, total: TOTAL, duracionSegTotal: duracionHook, offsetsAudioSeg: offsetsAcumulados(audiosHook),
    esPrimera: true,
  }, golpeHook.golpeSugerido);
  unidades.push({
    id: 'hook', componente: elHook.componente,
    props: {lineas: ['Mica cobra $340.', 'Le llevaba tres horas terminarlo.'], entra: offsetsAcumulados(audiosHook), clip: fondoHook},
    audios: audiosHook, golpe: golpeHook.golpeSugerido, volumenSfx: golpeHook.volumenSfxSugerido,
    estrategiaEdicion: estrategiaHook,
  });
  usadosEnEsteVideo.push(elHook.componente.id);
  golpesUsadosEnEsteVideo.push(golpeHook.golpeSugerido);
  valoresEstablecidos = registrarValorEstablecido(valoresEstablecidos, 340, 'dinero', 'hook');

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
  // Estilo sugerido (seccion 14): el desarrollo cuenta la progresion de
  // UNA persona a lo largo del tiempo -- storytelling tiene sentido
  // como prioridad ademas de lo que el Director elegiria solo por
  // categoria/intencion.
  const estrategiaDesarrollo = planificarEdicion({
    unidadId: 'desarrollo', categoria: elDesarrollo.componente.categoria, intensidadComponente: elDesarrollo.componente.intensidad,
    indice: 1, total: TOTAL, duracionSegTotal: duracionDesarrollo, offsetsAudioSeg: offsetsAcumulados(audiosDesarrollo),
    estilosSugeridos: ['storytelling'] as EstiloId[],
  }, golpeDesarrollo.golpeSugerido);
  unidades.push({
    id: 'desarrollo', componente: elDesarrollo.componente,
    props: {hitos: [
      {cuando: 'Mes 1', que: 'graba y edita todo ella sola'},
      {cuando: 'Mes 5', que: 'empieza a automatizar el corte'},
      {cuando: 'Mes 10', que: 'entrega 18 videos por semana', acento: true},
    ]},
    audios: audiosDesarrollo, golpe: golpeDesarrollo.golpeSugerido, volumenSfx: golpeDesarrollo.volumenSfxSugerido,
    estrategiaEdicion: estrategiaDesarrollo,
  });
  usadosEnEsteVideo.push(elDesarrollo.componente.id);
  golpesUsadosEnEsteVideo.push(golpeDesarrollo.golpeSugerido);
  // "18" aca es CANTIDAD (videos), no dinero -- tipoDato distinto de
  // los "$340" del hook (ver repeticion_datos.ts).
  valoresEstablecidos = registrarValorEstablecido(valoresEstablecidos, 18, 'cantidad', 'desarrollo');

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
    titulo: 'Videos por semana', puntos: [{etiqueta: 'Antes', valor: 3}, {etiqueta: 'Ahora', valor: 18}], etiqueta: 'videos/semana',
  });
  unidades.push({
    id: 'aceleracion', componente: elAceleracion.componente, props: propsAceleracion,
    audios: audiosAceleracion, golpe: golpeAceleracion.golpeSugerido, volumenSfx: golpeAceleracion.volumenSfxSugerido,
    estrategiaEdicion: estrategiaAceleracion,
  });
  usadosEnEsteVideo.push(elAceleracion.componente.id);
  golpesUsadosEnEsteVideo.push(golpeAceleracion.golpeSugerido);

  // ═══════════ 4. PAUSA (texto, calma real) -- YA NO golpe forzado a mano ══════
  // Diferencia real respecto de generar_demo_04.ts: ahi esta escena
  // forzaba golpe:'ninguno' manualmente ("a proposito, el respiro").
  // Aca DirectorAudio decide de verdad (nivel 'calma' -> fundido/iris),
  // y DirectorEdicion clasifica esta unidad como 'dejar_respirar' SOLO
  // a partir de metadata (intensidad baja + escena corta + 1 audio) --
  // sin ninguna excepcion manual (seccion 32: "no hacer trampa").
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
    props: elPausa.componente.id === 'silueta' ? {idea: {texto: 'El precio nunca bajó.', pie: ''}} : {frases: ['El precio nunca bajó.']},
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
    valor: 340, tipoDato: 'dinero', unidadActual: 'impacto', yaEstablecidos: valoresEstablecidos,
    derivarConsecuencia: (precio) => precio * 18, // 18 videos por semana (cantidad, ver desarrollo)
  });
  imprimir(`   [repeticion_datos] ${decisionRepeticion.tratamiento}: ${decisionRepeticion.razon}`);
  const totalDerivado = decisionRepeticion.valorDerivado ?? 340;
  const propsImpacto = propsParaComparacion(elImpacto.componente.id, {
    izquierda: {rotulo: 'Precio por video', texto: '$340', peso: 1},
    derecha: {rotulo: '18 videos esa semana', texto: `$${totalDerivado.toLocaleString('es-AR')} en total`, peso: 18},
    remate: 'El mismo precio de siempre, dieciocho veces en una semana.',
  });
  const estrategiaImpacto = planificarEdicion({
    unidadId: 'impacto', categoria: elImpacto.componente.categoria, intensidadComponente: elImpacto.componente.intensidad,
    indice: 4, total: TOTAL, duracionSegTotal: duracionImpacto, offsetsAudioSeg: offsetsAcumulados(audiosImpacto),
    esRevelacion: true, tipoDatoDestacado: 'dinero', esRepeticionTratada: decisionRepeticion.tratamiento === 'consecuencia',
  }, golpeImpacto.golpeSugerido);

  // Anti-repeticion INTELIGENTE por patron (seccion 22): consulta si
  // este patron (categoria+estilos+golpe) ya se uso recientemente y si
  // hay evidencia real de que funciona. Primera vez que corre este
  // mecanismo en produccion -- se espera penalizacion 0 (nunca usado
  // todavia), documentado como tal, no forzado.
  const patronImpacto: PatronEdicion = {categoria: 'comparacion', estilos: estrategiaImpacto.estilos, golpe: golpeImpacto.golpeSugerido};
  const prioridadImpacto = decidirPrioridadPatron({patron: patronImpacto});
  imprimir(`   [patrones] ${prioridadImpacto.razon}`);

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
  unidades.push({
    id: 'desarrollo2', componente: elDesarrollo2.componente,
    props: {items: ['Más horas', 'Más estrés', 'Menos tiempo libre'], queda: 'El mismo talento, mejor proceso.'},
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
  imprimir(`   golpe de cierre: "${golpeCierre.golpeSugerido}" -- Anticipo se activa solo si es fuerte (fogonazo/sacudon/negro)`);
  unidades.push({
    id: 'cierre', componente: elCierre.componente,
    props: {lineas: ['El video es el mismo trabajo.', 'El tiempo, no.'], entra: offsetsAcumulados(audiosCierre)},
    audios: audiosCierre, golpe: golpeCierre.golpeSugerido, volumenSfx: golpeCierre.volumenSfxSugerido,
    estrategiaEdicion: estrategiaCierre,
  });
  usadosEnEsteVideo.push(elCierre.componente.id);
  golpesUsadosEnEsteVideo.push(golpeCierre.golpeSugerido);

  const arbol = armarComposicion('fabrica-demo-05', unidades);
  imprimir(`\nArbol de composicion armado. Duracion total: ${arbol.duracionTotalSeg.toFixed(2)}s ` +
    `(${Math.round(arbol.duracionTotalSeg * arbol.fps)} frames a ${arbol.fps}fps)`);
  imprimir(`Componentes usados: ${usadosEnEsteVideo.join(', ')}`);
  imprimir(`Golpes usados: ${golpesUsadosEnEsteVideo.join(', ')}`);

  // Adjuntar la lista de patrones de esta corrida al arbol via una
  // propiedad no tipada (solo para que main() los registre despues de
  // que el ciclo elige el resultado final) -- se limpia antes de
  // escribir el JSON real del puente de render.
  (arbol as any).__patronesDeEstaCorrida = unidades.map((u) => ({
    categoria: u.componente.categoria,
    estilos: u.estrategiaEdicion?.estilos ?? [],
    golpe: u.golpe,
  }));

  return arbol;
}

function main() {
  const historial = correrCicloMejora(generarArbol as (p: ParametrosGeneracion) => ArbolComposicion, {
    maxIteraciones: 2, rutaTemporal: RUTA_TEMPORAL_CICLO, publicDir: path.join(RAIZ, 'remotion-spike/public'),
  });

  console.log(`\n═══ CICLO DE MEJORA CONTROLADO: ${historial.length} intento(s) ═══`);
  for (const it of historial) {
    console.log(`\nIntento ${it.intento}:`);
    console.log(`  alertas de composicion: ${it.alertasComposicion.length}`);
    console.log(`  alertas de critica editorial: ${it.alertasCritica.length}`);
    if (it.correccionesPropuestas.length) {
      console.log(`  correcciones propuestas: ${it.correccionesPropuestas.join(' | ')}`);
    }
    console.log(`  se aplicaron correcciones para el siguiente intento: ${it.seAplicaronCorrecciones}`);
  }

  const final = historial[historial.length - 1];
  const arbol = final.arbol;
  const patrones: {categoria: string; estilos: string[]; golpe: string}[] = (arbol as any).__patronesDeEstaCorrida ?? [];
  delete (arbol as any).__patronesDeEstaCorrida;

  writeFileSync(BRIDGE_JSON, JSON.stringify(arbol, null, 2));
  console.log(`\nArbol final (intento ${final.intento}) escrito en ${BRIDGE_JSON}`);

  const usadosEnEsteVideo = Array.from(new Set(arbol.escenas.map((e) => e.componenteId)));
  registrarVideo('fabrica-demo-05', usadosEnEsteVideo);
  for (const p of patrones) {
    registrarPatronUsado('fabrica-demo-05', p as any);
  }
  const hipotesis = agregarHipotesis({
    id: `fabrica-demo-05-${Date.now()}`,
    hipotesis: 'El Director de Edicion (intencion/energia/estilos/microeventos/transicion motivada, decidido por metadata) ' +
      'produce un video que se percibe mas dirigido que fabrica-demo-04, sin ninguna excepcion manual por escena.',
    experimento: 'fabrica-demo-05: Ronda 4, guion nuevo (Mica, edicion de video), voz real de Qwen3-TTS, ' +
      'Director de Edicion real para las 7 unidades, ciclo de mejora controlado corrido de verdad.',
    videoId: 'fabrica-demo-05',
  });
  console.log(`Registrado en memoria/laboratorio.json: ${hipotesis.id} (estado: ${hipotesis.estado})`);
  console.log('NOTA: no se escribe ningun resultadoReal -- este video no se publico, es una prueba de fabrica.');
}

if (require.main === module) main();
