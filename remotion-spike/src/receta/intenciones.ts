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
  dato:         ['contador', 'datoVivo', 'cifraSeCae', 'ranking', 'crecimiento'],
  cuenta:       ['recibo', 'contador'],
  comparar:     ['duelo', 'dosVidas', 'balanza', 'antesDespues', 'encuesta', 'ranking'],
  proceso:      ['pasos', 'diagrama', 'cronologia', 'herramientas'],
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

/**
 * Algunos formatos necesitan un dato numerico o una lista para decir
 * algo de verdad (una encuesta sin porcentaje no es una encuesta). El
 * autor del guion NO sabe de antemano que formato le va a tocar a su
 * parte -- por eso el contrato es: 'dice' (el texto) SIEMPRE alcanza
 * para cualquier formato de la intencion, y 'datos' es una mejora
 * opcional que solo algunos formatos aprovechan.
 *
 * Esta tabla dice, por formato, si necesita 'datos' con una forma
 * especifica para poder elegirse. Si el guion no trajo esos datos, el
 * compilador lo saca de la lista en vez de renderizar a medias.
 *
 * Formas que se esperan (documentado aca porque no hay un TS type por
 * formato -- 'datos' es deliberadamente libre para no atar el guion a
 * la eleccion del compilador):
 *   contador   {hasta:number, prefijo?, sufijo?, desde?}
 *   cifraSeCae {de:string, a:string}
 *   ranking    {filas:{txt,valor:number,acento?}[]}
 *   encuesta   {aTxt,aPct:number,bTxt,bPct:number}
 *   recibo       {conceptos:{txt,monto:number}[]}  (monto<0 = "sale")
 *   crecimiento  {puntos:{cuando,etiqueta,valor:number}[], fuente?}
 *                (para casos REALES con numero verificable; necesita
 *                al menos 2 puntos, si no no hay "crecimiento" que ver)
 *   herramientas {items:{nombre,color}[]}
 */
export const REQUIERE_DATOS: Record<string, (d: any) => boolean> = {
  contador: (d) => !!d && typeof d.hasta === 'number',
  cifraSeCae: (d) => !!d && typeof d.de === 'string' && typeof d.a === 'string',
  ranking: (d) => !!d && Array.isArray(d.filas) && d.filas.length > 0,
  encuesta: (d) => !!d && typeof d.aPct === 'number' && typeof d.bPct === 'number',
  recibo: (d) => !!d && Array.isArray(d.conceptos) && d.conceptos.length > 0,
  crecimiento: (d) => !!d && Array.isArray(d.puntos) && d.puntos.length >= 2,
  herramientas: (d) => !!d && Array.isArray(d.items) && d.items.length > 0,
};

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
