/**
 * Cliente real de la API de Zernio (zernio.com) -- publica videos ya
 * renderizados en TikTok y YouTube sin pasar por la revision de
 * semanas de Meta/TikTok (Zernio ya tiene su propia app aprobada; el
 * operador solo conecta su cuenta). Contrato de la API confirmado
 * 2026-09-10 leyendo directo `docs.zernio.com` (via WebSearch, el
 * dominio esta bloqueado para fetch directo desde este sandbox) y el
 * repo oficial `zernio-dev/zernio-api` (rules/platforms.md,
 * rules/media.md via GitHub raw, no bloqueado) -- no adivinado.
 *
 * Dos llamadas:
 *   1. POST /v1/media/upload-direct -- sube el archivo (multipart,
 *      campo "file"), maximo 25MB, se borra solo a los 7 dias. Los 21
 *      videos del lote pesan 3.5-10.2MB, entran sin problema. Si algun
 *      video futuro pesa mas de 25MB, esta funcion tira error claro en
 *      vez de intentar y fallar en la plataforma.
 *   2. POST /v1/posts -- crea el post apuntando a la URL que devolvio
 *      el upload, una entrada por plataforma (tiktok/youtube) con su
 *      `accountId` y `platformSpecificData` propio.
 *
 * OJO real: la forma exacta de `platformSpecificData.tiktok` tiene una
 * ambiguedad entre dos fuentes -- un resumen de docs.zernio.com dice
 * que va anidado en `tiktokSettings`, pero `rules/platforms.md` (fuente
 * mas directa, el propio repo de Zernio) lo muestra plano. Se
 * implemento la version plana (mas autoritativa) -- si la primera
 * llamada real falla con un error de validacion sobre estos campos,
 * ese es el primer lugar a mirar, no un misterio nuevo.
 */
import {readFileSync, statSync} from 'fs';
import {basename} from 'path';

const BASE = 'https://zernio.com/api/v1';
const TAMANO_MAXIMO_BYTES = 25 * 1024 * 1024;
const REINTENTOS = 3;

export type PlataformaId = 'tiktok' | 'youtube';

export type DatosTikTok = {
  privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
  allowComment?: boolean;
  allowDuet?: boolean;
  allowStitch?: boolean;
  contentPreviewConfirmed: true;
  expressConsentGiven: true;
  draft?: boolean;
  commercialContentType?: 'none' | 'brand_organic' | 'brand_content';
  videoMadeWithAi?: boolean;
};

export type DatosYouTube = {
  title: string;
  visibility?: 'public' | 'private' | 'unlisted';
  firstComment?: string;
  containsSyntheticMedia?: boolean;
};

export type CuentaObjetivo =
  | {platform: 'tiktok'; accountId: string; platformSpecificData: DatosTikTok}
  | {platform: 'youtube'; accountId: string; platformSpecificData: DatosYouTube};

export type ResultadoSubida =
  | {ok: true; postId?: string; respuestaCruda: unknown}
  | {ok: false; error: string; respuestaCruda?: unknown};

function requerirApiKey(apiKeyParam?: string): string {
  const apiKey = apiKeyParam ?? process.env.ZERNIO_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Falta ZERNIO_API_KEY -- sin la API key real de Zernio no se puede publicar nada (nunca se simula una subida). Se guarda como secret de GitHub Actions, nunca en el repo.'
    );
  }
  return apiKey;
}

async function conReintentos<T>(intento: () => Promise<T>, contexto: string): Promise<T> {
  let ultimoError: unknown;
  for (let i = 1; i <= REINTENTOS; i++) {
    try {
      return await intento();
    } catch (error) {
      ultimoError = error;
      console.error(`[zernio] ${contexto} -- intento ${i}/${REINTENTOS} fallo: ${(error as Error).message}`);
      if (i < REINTENTOS) await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
  throw new Error(`${contexto} fallo despues de ${REINTENTOS} intentos: ${(ultimoError as Error).message}`);
}

/** Sube el archivo de video a Zernio y devuelve la URL temporal para usar en crearPost(). */
export async function subirArchivoDirecto(rutaVideo: string, apiKeyParam?: string): Promise<string> {
  const apiKey = requerirApiKey(apiKeyParam);
  const tamano = statSync(rutaVideo).size;
  if (tamano > TAMANO_MAXIMO_BYTES) {
    throw new Error(
      `${rutaVideo} pesa ${(tamano / 1024 / 1024).toFixed(1)}MB, supera el maximo de 25MB de Zernio -- hace falta alojarlo en otro lado (no lo intenta, para no fallar recien en la plataforma).`
    );
  }

  return conReintentos(async () => {
    const buffer = readFileSync(rutaVideo);
    const form = new FormData();
    form.append('file', new Blob([buffer], {type: 'video/mp4'}), basename(rutaVideo));

    const resp = await fetch(`${BASE}/media/upload-direct`, {
      method: 'POST',
      headers: {Authorization: `Bearer ${apiKey}`},
      body: form,
    });
    if (!resp.ok) throw new Error(`upload-direct HTTP ${resp.status}: ${await resp.text()}`);
    const data = (await resp.json()) as {url: string};
    if (!data.url) throw new Error(`upload-direct sin campo "url" en la respuesta: ${JSON.stringify(data)}`);
    return data.url;
  }, `subir archivo ${basename(rutaVideo)}`);
}

/** Crea el post apuntando a las plataformas indicadas. publishNow=true siempre (nunca programa para despues sin que se pida explicito). */
export async function crearPost(opciones: {
  contenido: string;
  urlVideo: string;
  cuentas: CuentaObjetivo[];
  apiKey?: string;
}): Promise<ResultadoSubida> {
  const apiKey = requerirApiKey(opciones.apiKey);

  return conReintentos(async () => {
    const resp = await fetch(`${BASE}/posts`, {
      method: 'POST',
      headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        content: opciones.contenido,
        mediaItems: [{type: 'video', url: opciones.urlVideo}],
        platforms: opciones.cuentas,
        publishNow: true,
      }),
    });
    const cuerpo = await resp.text();
    let data: any = {};
    try { data = JSON.parse(cuerpo); } catch { /* respuesta no-JSON, se guarda como texto */ }
    if (!resp.ok) return {ok: false, error: `posts HTTP ${resp.status}: ${cuerpo}`, respuestaCruda: data || cuerpo};
    return {ok: true, postId: data.id ?? data.postId, respuestaCruda: data};
  }, 'crear post en Zernio');
}

/** Orquesta subida + post, pensado para llamarse una vez por video ya renderizado. */
export async function publicarVideo(opciones: {
  rutaVideo: string;
  contenido: string;
  cuentaTikTok?: {accountId: string; datos: DatosTikTok};
  cuentaYouTube?: {accountId: string; datos: DatosYouTube};
  apiKey?: string;
}): Promise<ResultadoSubida> {
  if (!opciones.cuentaTikTok && !opciones.cuentaYouTube) {
    throw new Error('publicarVideo: no se paso ninguna cuenta destino (ni TikTok ni YouTube).');
  }
  const urlVideo = await subirArchivoDirecto(opciones.rutaVideo, opciones.apiKey);
  const cuentas: CuentaObjetivo[] = [];
  if (opciones.cuentaTikTok) {
    cuentas.push({platform: 'tiktok', accountId: opciones.cuentaTikTok.accountId, platformSpecificData: opciones.cuentaTikTok.datos});
  }
  if (opciones.cuentaYouTube) {
    cuentas.push({platform: 'youtube', accountId: opciones.cuentaYouTube.accountId, platformSpecificData: opciones.cuentaYouTube.datos});
  }
  return crearPost({contenido: opciones.contenido, urlVideo, cuentas, apiKey: opciones.apiKey});
}
