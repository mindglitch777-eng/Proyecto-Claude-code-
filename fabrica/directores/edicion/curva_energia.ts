/**
 * Rhythm Engine / curva de energía objetivo (R7-31, prompt "que la
 * fábrica piense la edición", sección 1). Responde al diagnóstico real
 * sobre `fabrica-demo-08`: la energía de cada unidad se calculaba
 * SOLO a partir del contenido de ESA unidad (`decidirEnergia()` en
 * `edicion.ts`), nunca contra un objetivo de video completo -- por eso
 * el video podía sentirse plano/predecible aunque cada decisión local
 * fuera razonable.
 *
 * Diseño deliberadamente MODESTO (regla de la sección 17, conexión >
 * duplicación): esto NO reemplaza `decidirEnergia()`, lo complementa.
 * La curva solo puede EMPUJAR la energía hacia arriba en sus picos
 * declarados -- nunca la fuerza hacia abajo ni contradice una unidad
 * de respiración real (`dejar_respirar` sigue devolviendo `baja`
 * siempre, sin excepción, ver `edicion.ts`). Esto evita el riesgo real
 * de una curva rígida contradiciendo contenido real (ej. forzar
 * energía alta en una unidad que el guion pide que sea un respiro).
 *
 * `progreso` es el mismo valor 0-1 que ya usa `edicion.ts`
 * (`ctx.indice / (ctx.total - 1)`), así que esta curva funciona con
 * cualquier cantidad de unidades, no solo con guiones de 7 unidades
 * como demo_07/08.
 */
import type {NivelEnergia} from './tipos';

const ORDEN_ENERGIA: NivelEnergia[] = ['baja', 'media', 'alta', 'muy_alta'];

export type PuntoCurvaEnergia = {
  /** Progreso 0-1 en el que este punto es el objetivo (el más cercano
   * al progreso real de la unidad gana). */
  progreso: number;
  nivelObjetivo: NivelEnergia;
  /** Por qué este punto está acá -- nunca un número mágico sin explicar. */
  razon: string;
};

export type CurvaEnergia = {
  id: string;
  nombre: string;
  puntos: PuntoCurvaEnergia[];
};

/**
 * Curva por defecto -- traduce literalmente el ejemplo del propio
 * prompt ("HOOK fuerte → explicación breve → aceleración → micro
 * pausa → revelación → aceleración → payoff → cierre") a progreso 0-1.
 * No es la única curva posible -- es un PUNTO DE PARTIDA razonable
 * para guiones de estructura hook/desarrollo/escalada/revelación/cierre
 * (el mismo patrón que ya usan los guiones reales de la fábrica).
 */
export const CURVA_HOOK_ESCALADA_PAYOFF: CurvaEnergia = {
  id: 'hook_escalada_payoff',
  nombre: 'Hook fuerte -> escalada con pausa -> revelación -> payoff',
  puntos: [
    {progreso: 0.0, nivelObjetivo: 'alta', razon: 'hook: capturar atención desde el frame 0'},
    {progreso: 0.2, nivelObjetivo: 'baja', razon: 'explicación/contexto breve: contraste deliberado después del hook (sección 7 del prompt)'},
    {progreso: 0.4, nivelObjetivo: 'alta', razon: 'primera aceleración real'},
    {progreso: 0.55, nivelObjetivo: 'baja', razon: 'micro pausa antes de la revelación -- prepara el contraste del pico siguiente'},
    {progreso: 0.7, nivelObjetivo: 'muy_alta', razon: 'revelación/clímax del video'},
    {progreso: 0.85, nivelObjetivo: 'alta', razon: 'segunda aceleración post-revelación'},
    {progreso: 1.0, nivelObjetivo: 'media', razon: 'cierre/payoff -- ni pico ni caída total, deja resonar el mensaje'},
  ],
};

/**
 * Curva del "Benchmark audiovisual agresivo" (R7-32,
 * docs/PROMPT_BENCHMARK_AGRESIVO.md) -- traduce la curva de energía
 * ASCII que el propio operador entregó (0-4s máxima, 4-10s alta,
 * 10-16s alta+aceleración, 16-21s giro, 21-30s escalada, 30-34s pausa,
 * 34-39s payoff, 39-42s cierre) a un punto POR UNIDAD (14 unidades,
 * `progreso = indice/13` exacto) en vez de 7-8 puntos gruesos --
 * necesario porque varias unidades consecutivas piden niveles
 * opuestos muy cerca una de otra (ej. hook_0 muy_alta seguido
 * inmediatamente de hook_1 baja, la "caída máxima posible" que pide el
 * brief) y `empujarHaciaCurva` solo empuja hacia arriba: un punto
 * "alto" mal ubicado cerca de una unidad que debe sentirse baja la
 * contaminaría. Con un punto exacto por unidad (distancia 0 al vecino
 * más cercano), cada una recibe su propio objetivo sin interferencia.
 * Reutiliza el mismo mecanismo de `CURVA_HOOK_ESCALADA_PAYOFF` --
 * ninguna lógica nueva, solo una configuración distinta (sección 17
 * del prompt: conexión > duplicación).
 */
export const CURVA_BENCHMARK_AGRESIVO: CurvaEnergia = {
  id: 'benchmark_agresivo_14_unidades',
  nombre: 'Hook interrumpido -> contraste -> abundancia -> frenazo -> giro -> tríada -> pausa -> payoff -> cierre',
  puntos: [
    {progreso: 0 / 13, nivelObjetivo: 'muy_alta', razon: 'hook_0: interrupción absoluta, sección 1 del brief'},
    {progreso: 1 / 13, nivelObjetivo: 'baja', razon: 'hook_1: "cambio radical" inmediato, contraste máximo tras el golpe 1'},
    {progreso: 2 / 13, nivelObjetivo: 'muy_alta', razon: 'desarrollo_0 (ráfaga): abundancia, velocidad, sección 3'},
    {progreso: 3 / 13, nivelObjetivo: 'baja', razon: 'desarrollo_1 (balanza): frenazo deliberado, "caos -> corte -> simplicidad", sección 4'},
    {progreso: 4 / 13, nivelObjetivo: 'alta', razon: 'desarrollo_2: automatización acelerando de nuevo, sección 5'},
    {progreso: 5 / 13, nivelObjetivo: 'muy_alta', razon: 'desarrollo_3: primer giro/colapso del video, sección 6'},
    {progreso: 6 / 13, nivelObjetivo: 'media', razon: 'giro_0: nueva dirección, composición deliberada, no un pico más'},
    {progreso: 7 / 13, nivelObjetivo: 'media', razon: 'giro_1 (tríada, PROBLEMA)'},
    {progreso: 8 / 13, nivelObjetivo: 'media', razon: 'giro_2 (tríada, OFERTA)'},
    {progreso: 9 / 13, nivelObjetivo: 'muy_alta', razon: 'giro_3 (tríada, IA): culminación explícita de la tríada, sección 8'},
    {progreso: 10 / 13, nivelObjetivo: 'baja', razon: 'revelacion_0: pausa deliberada antes del payoff, sección 9 -- "agresivo también es silencio"'},
    {progreso: 11 / 13, nivelObjetivo: 'alta', razon: 'revelacion_1: golpe corto, sección 10'},
    {progreso: 12 / 13, nivelObjetivo: 'alta', razon: 'payoff_0: convergencia de las ideas, sección 11'},
    {progreso: 13 / 13, nivelObjetivo: 'alta', razon: 'payoff_1: cierre memorable, sección 12'},
  ],
};

/** Devuelve el nivel objetivo del punto de la curva más cercano al
 * progreso real de la unidad -- interpolación por vecino más cercano,
 * no lineal (NivelEnergia es una escala discreta de 4 escalones, no
 * un continuo, promediar dos escalones no tiene un valor real). */
export function nivelObjetivoEnProgreso(curva: CurvaEnergia, progreso: number): PuntoCurvaEnergia {
  let mejor = curva.puntos[0];
  let mejorDistancia = Math.abs(progreso - mejor.progreso);
  for (const punto of curva.puntos) {
    const distancia = Math.abs(progreso - punto.progreso);
    if (distancia < mejorDistancia) {
      mejor = punto;
      mejorDistancia = distancia;
    }
  }
  return mejor;
}

/** Combina un nivel YA calculado a partir del contenido real de la
 * unidad con el objetivo de la curva -- SOLO empuja hacia arriba,
 * nunca hacia abajo (ver docstring del archivo, motivo real). */
export function empujarHaciaCurva(nivelBase: NivelEnergia, nivelObjetivo: NivelEnergia): NivelEnergia {
  const idxBase = ORDEN_ENERGIA.indexOf(nivelBase);
  const idxObjetivo = ORDEN_ENERGIA.indexOf(nivelObjetivo);
  return ORDEN_ENERGIA[Math.max(idxBase, idxObjetivo)];
}
