/**
 * CLI: chequea el estado REAL (GET /v1/posts/:id, no el que pedimos)
 * de cada post pendiente en state/uploads.json + state/carruseles.json
 * y avisa por ntfy.sh apenas TikTok confirma que llego de verdad al
 * Creator Inbox -- Zernio re-programa `publishNow`/`scheduledFor` para
 * TikTok por su cuenta (visto real en v17/v19/v20, delay no pedido por
 * nosotros), asi que la unica forma confiable de saber CUANDO avisar es
 * preguntarle a Zernio, no confiar en el scheduledFor que nosotros
 * mandamos.
 *
 * "Llego al inbox" = platforms[].platform === 'tiktok' &&
 * status === 'published' && platformPostId empieza con 'v_inbox_url~'
 * (confirmado real con v11, ver fabrica/ESTADO.md). Carruseles no usan
 * Creator Inbox (no son video, se publican directo) -- para esos el
 * aviso es simplemente "status published" en cualquier plataforma.
 *
 * Uso: npx tsx subida/notificar_pendientes.ts
 * Env: ZERNIO_API_KEY (existente), NTFY_TOPIC (nuevo)
 */
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {resolve} from 'path';
import {obtenerPost} from './zernio';

const RAIZ = resolve(__dirname, '../..');
const UPLOADS_PATH = resolve(RAIZ, 'state/uploads.json');
const CARRUSELES_PATH = resolve(RAIZ, 'state/carruseles.json');

type Entrada = {
  id: string;
  ok?: boolean;
  postId?: string;
  notificado?: boolean;
  [k: string]: unknown;
};

function leer(ruta: string): Entrada[] {
  if (!existsSync(ruta)) return [];
  return JSON.parse(readFileSync(ruta, 'utf-8'));
}

function guardar(ruta: string, datos: Entrada[]): void {
  writeFileSync(ruta, JSON.stringify(datos, null, 2) + '\n');
}

function extraerPlataformas(respuesta: unknown): Array<{platform: string; status: string; platformPostId?: string}> {
  const doc = (respuesta as any)?.post ?? respuesta;
  return Array.isArray(doc?.platforms) ? doc.platforms : [];
}

async function avisar(topic: string, titulo: string, mensaje: string): Promise<void> {
  const resp = await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: {Title: titulo, Priority: 'high', Tags: 'tiktok'},
    body: mensaje,
  });
  if (!resp.ok) {
    throw new Error(`ntfy.sh respondio HTTP ${resp.status}: ${await resp.text()}`);
  }
}

async function chequearVideo(entrada: Entrada, topic: string): Promise<boolean> {
  if (!entrada.ok || !entrada.postId || entrada.notificado) return false;
  const post = await obtenerPost(entrada.postId);
  const plataformas = extraerPlataformas(post);
  const tiktok = plataformas.find((p) => p.platform === 'tiktok');
  const enInbox =
    tiktok?.status === 'published' && typeof tiktok.platformPostId === 'string' && tiktok.platformPostId.startsWith('v_inbox_url~');
  if (!enInbox) return false;
  await avisar(
    topic,
    `${entrada.id} listo en la box de TikTok`,
    `Toca para confirmar la publicacion de ${entrada.id} en el Creator Inbox de TikTok.`,
  );
  entrada.notificado = true;
  return true;
}

async function chequearCarrusel(entrada: Entrada, topic: string): Promise<boolean> {
  if (!entrada.ok || !entrada.postId || entrada.notificado) return false;
  const post = await obtenerPost(entrada.postId);
  const plataformas = extraerPlataformas(post);
  const publicado = plataformas.some((p) => p.status === 'published');
  if (!publicado) return false;
  await avisar(topic, `${entrada.id} publicado`, `${entrada.id} ya salio publicado.`);
  entrada.notificado = true;
  return true;
}

async function main(): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    console.error('Falta NTFY_TOPIC en el entorno.');
    process.exit(1);
  }

  const uploads = leer(UPLOADS_PATH);
  const carruseles = leer(CARRUSELES_PATH);

  let cambiosUploads = 0;
  for (const entrada of uploads) {
    try {
      if (await chequearVideo(entrada, topic)) {
        cambiosUploads++;
        console.log(`Aviso enviado: ${entrada.id}`);
      }
    } catch (error) {
      console.error(`Error chequeando video ${entrada.id}: ${(error as Error).message}`);
    }
  }

  let cambiosCarruseles = 0;
  for (const entrada of carruseles) {
    try {
      if (await chequearCarrusel(entrada, topic)) {
        cambiosCarruseles++;
        console.log(`Aviso enviado: ${entrada.id}`);
      }
    } catch (error) {
      console.error(`Error chequeando carrusel ${entrada.id}: ${(error as Error).message}`);
    }
  }

  if (cambiosUploads > 0) guardar(UPLOADS_PATH, uploads);
  if (cambiosCarruseles > 0) guardar(CARRUSELES_PATH, carruseles);

  console.log(`Listo. ${cambiosUploads} video(s) + ${cambiosCarruseles} carrusel(es) avisados esta corrida.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
