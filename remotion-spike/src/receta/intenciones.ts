// EL COMPILADOR DE GUIONES
//
// Esta es la pieza que faltaba. Hasta ahora yo elegia a mano que
// formato usaba cada video, y por eso salian todos iguales.
//
// Ahora funciona al reves: el guion dice QUE HACE cada parte -- pega,
// niega, compara, cuenta, cierra -- y el sistema elige COMO se ve.
// Como cada intencion tiene varios formatos posibles y la eleccion
// depende del guion, dos guiones distintos nunca salen iguales aunque
// cuenten la misma historia.

/** Que hace cada parte del guion. No como se ve: que HACE. */
export type Intencion =
  | 'golpe'        // el arranque: que se reconozca en el primer cuadro
  | 'niega'        // sacarle la explicacion facil de encima
  | 'pregunta'     // abrir el bucle
  | 'dato'         // una cifra sola
  | 'cuenta'       // la aritmetica paso a paso
  | 'comparar'     // esto contra aquello
  | 'proceso'      // uno, dos, tres
  | 'historia'     // paso esto, despues esto
  | 'descarte'     // todo lo que probaste y no anduvo
  | 'consecuencia' // lo que te cuesta
  | 'giro'         // la frase que da vuelta el video
  | 'prueba'       // se muestra en pantalla: chat, buscador, notificacion
  | 'cierre';      // que tiene que hacer el que llego hasta aca

/** Los formatos que pueden expresar cada intencion. */
export const FORMATOS: Record<Intencion, string[]> = {
  golpe:        ['punch', 'tresVerdades', 'congelado', 'estoSosVos', 'relojQueCorre'],
  niega:        ['punch', 'tresVerdades', 'listaTachada', 'diagrama'],
  pregunta:     ['encuesta', 'buscador', 'punch', 'diagrama'],
  dato:         ['contador', 'datoVivo', 'cifraSeCae', 'ranking'],
  cuenta:       ['recibo', 'explicador', 'contador'],
  comparar:     ['duelo', 'dosVidas', 'balanza', 'antesDespues', 'encuesta', 'ranking'],
  proceso:      ['pasos', 'diagrama', 'cronologia'],
  historia:     ['cronologia', 'diagrama', 'pasos'],
  descarte:     ['listaTachada', 'embudo', 'notificaciones'],
  consecuencia: ['cifraSeCae', 'congelado', 'embudo', 'datoVivo', 'recibo'],
  giro:         ['punch', 'antesDespues', 'tresVerdades', 'diagrama', 'letraVentana'],
  prueba:       ['chat', 'buscador', 'notificaciones'],
  cierre:       ['cierre'],
};

/** Cuales usan filmacion de verdad. Sirve para exigir que todo video
 *  tenga al menos dos, que es lo que pidio el operador. */
export const CON_METRAJE = new Set([
  'dosVidas', 'congelado', 'datoVivo', 'estoSosVos', 'letraVentana',
]);

/** Cuales son "de pantalla llena de texto". Dos seguidos cansan. */
export const SOLO_TEXTO = new Set([
  'punch', 'tresVerdades', 'listaTachada',
]);

/** Golpes de entrada disponibles, y cual pega con cual intencion. */
export const GOLPES: Record<Intencion, string[]> = {
  golpe:        ['corte', 'sacudon'],
  niega:        ['fogonazo', 'corte'],
  pregunta:     ['negro', 'corte'],
  dato:         ['fogonazo', 'sacudon'],
  cuenta:       ['corte'],
  comparar:     ['raya', 'fogonazo'],
  proceso:      ['corte'],
  historia:     ['negro', 'corte'],
  descarte:     ['sacudon', 'corte'],
  consecuencia: ['sacudon', 'raya'],
  giro:         ['fogonazo', 'raya'],
  prueba:       ['corte', 'negro'],
  cierre:       ['fogonazo'],
};

/** Numero estable a partir de un texto. El mismo guion elige siempre
 *  los mismos formatos: si no, cada render seria distinto y no se
 *  podria corregir nada. */
export function semilla(txt: string): number {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) {
    h ^= txt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
