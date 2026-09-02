/**
 * Composicion (Fase 8): convierte una lista de unidades ya resueltas
 * (Director Visual + Director de Audio + Voz, en ese orden) en un
 * arbol con offsets exactos en segundos, listo para el puente de
 * render de Remotion (remotion-spike/src/fabrica_bridge/FabricaVideo.tsx).
 *
 * Regla dura de la especificacion (y leccion real del bug de
 * RebeccaBeach.tsx de la sesion anterior): la duracion de una unidad
 * CON audio es SIEMPRE la duracion real medida de ese audio + un
 * margen de aire fijo -- nunca una duracion inventada. Solo las
 * unidades SIN audio (componente.soportaAudioSincronizado=false)
 * caen al rango aproximado del registro.
 *
 * MULTI-AUDIO (generalizacion del patron AudioCentro de
 * CasoGenerico.tsx, hecha en esta sesion): una unidad puede traer
 * VARIOS clips de audio (ej. una Cronologia con 3 hitos, cada uno con
 * su propia narracion). La duracion de la unidad es la SUMA de todos
 * sus clips + aire entre cada uno; cada clip se posiciona en su
 * offset acumulado DENTRO de la escena. El componente visual se monta
 * UNA sola vez para toda la escena (sigue siendo su misma animacion
 * proporcional interna) -- lo que cambia es que ahora puede sonar mas
 * de un audio durante esa animacion, en vez de uno solo.
 */
import type {ArbolComposicion, EscenaComposicion, UnidadResuelta} from './tipos';

/** Publico a proposito: componentes como Punch necesitan un array
 * `entra` con el offset de cada linea -- para que coincida EXACTO con
 * lo que este modulo va a calcular (y no una copia del numero 0.25
 * puesta a mano en otro archivo), se expone la misma constante. */
export const AIRE_SEG = 0.25;
const MARGEN_FINAL_SEG = 0.5;

/** R6-8: golpes que el puente de render (FabricaVideo.tsx) trata como
 * una transicion CONTINUA real (superposicion de verdad via
 * @remotion/transitions), no un efecto de impacto -- ver
 * fabrica/skills/INVESTIGACION_HERRAMIENTAS.md item 1 y
 * remotion-spike/src/pruebas-r6/README.md. 'fundido' y 'desliza' ya
 * eran, semanticamente, los dos unicos golpes "suaves/continuos" del
 * catalogo (golpes.tsx) -- fogonazo/sacudon/negro/corte/raya/cortina
 * son impactos que NO tiene sentido forzar a un crossfade real (misma
 * leccion de siempre: no forzar un encaje semantico que no es, ver
 * docs/DECISIONES.md). */
const GOLPES_TRANSICION_REAL: UnidadResuelta['golpe'][] = ['fundido', 'desliza'];

/** Cuanto silencio de cola hace falta para que una transicion real
 * (superposicion de dos escenas) tenga un margen visible y prolijo, en
 * vez del minimo de AIRE_SEG (0.25s ~ 7 cuadros a 30fps, demasiado
 * corto para un fundido/deslizamiento que se sienta real). */
export const AIRE_TRANSICION_SEG = 0.6;

function resolverAudios(u: UnidadResuelta): {
  duracionSeg: number;
  audios: EscenaComposicion['audios'];
} {
  if (!u.audios || u.audios.length === 0) {
    // sin audio real: punto intermedio del rango declarado por el
    // propio componente -- misma fuente de verdad que uso el
    // Director Visual para puntuarlo, nunca un numero aparte.
    const [minS, maxS] = u.componente.duracionMinMaxSeg;
    return {duracionSeg: (minS + maxS) / 2, audios: []};
  }
  let cursor = 0;
  const audios: EscenaComposicion['audios'] = u.audios.map((clip) => {
    const desdeSegRelativo = cursor;
    cursor += clip.duracionSeg + AIRE_SEG;
    return {archivo: clip.archivo, desdeSegRelativo, duracionSeg: clip.duracionSeg};
  });
  return {duracionSeg: cursor, audios};
}

export function armarComposicion(id: string, unidades: UnidadResuelta[], fps = 30): ArbolComposicion {
  let cursor = 0;
  const escenas: EscenaComposicion[] = unidades.map((u, i) => {
    const desdeSeg = cursor;
    const {duracionSeg: duracionBase, audios} = resolverAudios(u);
    const siguiente = unidades[i + 1];
    // R6-8: solo se estira la cola de ESTA unidad si (a) tiene audio
    // real -- sin eso no hay garantia de que el final este en
    // silencio, resolverAudios() de una unidad sin audio no deja
    // ningun margen -- y (b) la unidad que sigue entra con un golpe de
    // los que el puente de render va a resolver como transicion real.
    // Sin estas dos condiciones, la escena se comporta exactamente
    // igual que antes de R6-8 (ver test_armar.ts para el arbol viejo
    // demo_01..06, que no debe cambiar ni un cuadro).
    const puedeTransicionReal = (u.audios?.length ?? 0) > 0 && !!siguiente && GOLPES_TRANSICION_REAL.includes(siguiente.golpe);
    // duracionSeg (lo que se declara para ESTA escena, y lo que el
    // puente de render usa como duracion de su TransitionSeries.Sequence)
    // estira la cola de AIRE_SEG a AIRE_TRANSICION_SEG para darle
    // espacio real a la superposicion. Pero @remotion/transitions hace
    // que la ESCENA SIGUIENTE arranque AIRE_TRANSICION_SEG antes del
    // final declarado de esta (superposicion real, no un efecto
    // encima) -- por eso el cursor (que define desdeSeg de la
    // siguiente escena y duracionTotalSeg del video entero) avanza
    // duracionSeg MENOS esa superposicion, para que desdeSeg siga
    // siendo la posicion REAL en el video final renderizado, no una
    // posicion ficticia "como si no hubiera transicion". El resultado
    // neto (verificado a mano): la escena siguiente arranca exactamente
    // cuando termina el ultimo audio real de esta escena, sin el
    // AIRE_SEG de silencio que habria habido sin transicion -- se
    // reemplaza esa pausa de silencio por una transicion visual real,
    // no se pierde ni se inventa tiempo.
    const duracionSeg = duracionBase + (puedeTransicionReal ? AIRE_TRANSICION_SEG - AIRE_SEG : 0);
    cursor += puedeTransicionReal ? duracionSeg - AIRE_TRANSICION_SEG : duracionSeg;
    return {
      unidadId: u.id,
      desdeSeg,
      duracionSeg,
      componenteId: u.componente.id,
      props: u.props,
      audios,
      golpe: u.golpe,
      volumenSfx: u.volumenSfx,
      ...(puedeTransicionReal ? {transicionSalienteSeg: AIRE_TRANSICION_SEG} : {}),
      ...(u.estrategiaEdicion ? {estrategiaEdicion: u.estrategiaEdicion} : {}),
    };
  });
  return {id, fps, escenas, duracionTotalSeg: cursor + MARGEN_FINAL_SEG};
}
