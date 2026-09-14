/**
 * Forma única y canónica de una entrada de log de entrega de
 * contenido -- el "formulario oficial" que toda la fábrica de subida
 * comparte. Antes de esto existían 6 declaraciones sueltas del mismo
 * concepto, cada una con los campos que le tocó necesitar en el
 * momento -- ver fabrica/ESTADO.md 2026-09-14 ("engranajes sueltos").
 *
 * Simplificado 2026-09-14 (segunda vez, mismo día): TikTok y YouTube
 * se publican SIEMPRE a mano vía apps nativas (TikTok Studio/YouTube
 * Studio, programación propia hasta 10+ días/~1 año) -- Zernio dejó de
 * usarse para publicar. Se sacaron los campos que solo existían para
 * el flujo automático (postId/error/plataformas/respuestaCruda de la
 * respuesta de Zernio, notificado/reintentos/reintentoDe/
 * estadoReintento del sondeo y reintento automático) -- si el día de
 * mañana se recupera algo de eso, se agrega de nuevo acá, no antes.
 *
 * Vive en dos archivos con la MISMA forma -- state/uploads.json
 * (videos) y state/carruseles.json (carruseles) -- lo que diferencia
 * uno de otro es el archivo en el que vive, no un campo "tipo" adentro
 * de la entrada.
 */
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';

const RAIZ = resolve(__dirname, '../..');
export const RUTA_UPLOADS = resolve(RAIZ, 'state/uploads.json');
export const RUTA_CARRUSELES = resolve(RAIZ, 'state/carruseles.json');

export type Publicacion = {
  id: string;
  fecha: string; // ISO -- cuándo se generó/entregó este contenido
  ok: boolean;
  nota?: string; // anotación manual libre, para reconstrucciones a mano de entradas perdidas

  // -- Entrega manual (siempre -- TikTok/YouTube se publican a mano
  // desde las apps nativas, no automático):
  estado?: 'pendiente' | 'subido' | 'vencido';
  tema?: string;
  scheduledFor?: string; // ISO -- horario SUGERIDO (franja 18-23 ART para TikTok), la hora real la fija el operador en la app
  rutaVideo?: string; // solo videos
  link?: string; // URL del run de GitHub Actions donde vive el artifact para descargar
  avisadoBuzon?: boolean;
  avisadoBuzonEn?: string; // ISO -- cuándo se mandó el aviso de ntfy.sh
  subidoEn?: string; // ISO -- lo escribe netlify/functions/marcar-subido.js al click "Ya lo subí"
};

export function leerLog(ruta: string): Publicacion[] {
  if (!existsSync(ruta)) return [];
  return JSON.parse(readFileSync(ruta, 'utf-8'));
}

export function guardarLog(ruta: string, entradas: Publicacion[]): void {
  mkdirSync(dirname(ruta), {recursive: true});
  writeFileSync(ruta, JSON.stringify(entradas, null, 2) + '\n');
}

export function agregarEntrada(ruta: string, entrada: Publicacion): void {
  const entradas = leerLog(ruta);
  entradas.push(entrada);
  guardarLog(ruta, entradas);
}
