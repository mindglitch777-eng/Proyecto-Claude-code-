/**
 * Forma única y canónica de una entrada de log de publicación -- el
 * "formulario oficial" que toda la fábrica de subida comparte. Antes
 * de esto existían 6 declaraciones sueltas del mismo concepto (una
 * por script: subir_video.ts, subir_carrusel.ts, chequear_buzon.ts,
 * avisar_buzon.ts, notificar_pendientes.ts, reintentar_fallidos.ts),
 * cada una con los campos que le tocó necesitar en el momento y sin
 * ninguna garantía de que las demás se enteraran de un campo nuevo --
 * ver fabrica/ESTADO.md 2026-09-14 ("engranajes sueltos").
 *
 * Vive en dos archivos con la MISMA forma -- state/uploads.json
 * (videos) y state/carruseles.json (carruseles) -- lo que diferencia
 * uno de otro es el archivo en el que vive, no un campo "tipo" adentro
 * de la entrada.
 */
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';
import type {ResultadoPlataforma} from './zernio';

const RAIZ = resolve(__dirname, '../..');
export const RUTA_UPLOADS = resolve(RAIZ, 'state/uploads.json');
export const RUTA_CARRUSELES = resolve(RAIZ, 'state/carruseles.json');

export type Publicacion = {
  // -- Núcleo: toda entrada lo tiene desde que se creó, sin importar el flujo.
  id: string;
  fecha: string; // ISO
  ok: boolean;
  postId?: string; // presente cuando ok=true
  error?: string; // presente cuando ok=false
  plataformas?: ResultadoPlataforma[];
  respuestaCruda?: unknown;
  scheduledFor?: string; // ISO -- ausente si se publicó ya, sin programar
  notificado?: boolean; // ¿ya se avisó al operador que esto se publicó bien? (notificar_pendientes.ts)
  nota?: string; // anotación manual libre, para reconstrucciones a mano de entradas perdidas

  // -- Reintento automático (reintentar_fallidos.ts, cuando Zernio devolvió
  // un "failed" real por cupo lleno de TikTok, no por contenido):
  reintentos?: number;
  reintentoDe?: string; // id de la entrada original que este reintento reemplaza
  estadoReintento?: 'reintentando' | 'resuelto' | 'agotado';

  // -- Buzón de subida manual (solo videos -- Zernio no puede subir de
  // más de ~4MB por el bug de presign, ver zernio.ts):
  manual?: boolean;
  estado?: 'pendiente' | 'subido' | 'vencido';
  tema?: string;
  rutaVideo?: string;
  avisadoBuzon?: boolean;
  avisadoBuzonEn?: string; // ISO -- cuándo se programó/mandó el aviso de ntfy.sh
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
