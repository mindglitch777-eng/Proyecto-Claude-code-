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
