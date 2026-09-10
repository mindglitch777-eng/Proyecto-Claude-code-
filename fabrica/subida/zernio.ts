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
 * Tres llamadas:
 *   1. POST /v1/media/upload-direct -- sube el archivo entero de una
 *      (multipart, campo "file"). La documentacion dice 25MB de
 *      maximo, pero el limite REAL observado es mucho menor: un video
 *      de 4.02MB entro bien, uno de 9.76MB fallo con HTTP 413 "Request
 *      Entity Too Large" / FUNCTION_PAYLOAD_TOO_LARGE (limite tipico
 *      de una funcion serverless de Vercel detras de Zernio). Sirve
 *      solo para archivos chicos -- rules/media.md del repo de Zernio
 *      lo confirma explicito: pensado para "inbox messages and small
 *      files".
 *   2. POST /v1/media/presign + PUT directo al storage -- la via real
 *      para archivos grandes (hasta 5GB segun la doc), confirmada en
 *      rules/media.md: se pide una URL firmada, se sube el archivo
 *      DIRECTO a esa URL (nunca pasa por la funcion serverless de
 *      Zernio, asi que el limite de ~4.5MB no aplica), y se usa la
 *      `fileUrl` que devuelve para crear el post. Es la que usa
 *      subirArchivo() de aca abajo -- upload-direct quedo solo de
 *      referencia, no se llama mas desde publicarVideo().
 *   3. POST /v1/posts -- crea el post apuntando a la URL que devolvio
 *      la subida, una entrada por plataforma (tiktok/youtube) con su
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
// Limite real de /v1/media/presign segun rules/media.md (5GB) -- muy por
// encima de cualquier video del lote, se deja como red de seguridad nomas.
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024 * 1024;
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
  // OJO real: el errorMessage real de Zernio ante "TikTok direct posting
  // is at capacity" dice literalmente "Use tiktokSettings.draft: true"
  // -- distinto del campo `draft` plano de arriba, que es lo que dice
  // rules/platforms.md. Se manda ANIDADO tambien, ademas del plano, por
  // si la API en verdad lee de aca (no se pudo confirmar cual de los
  // dos lee sin una prueba real con draft:true).
  tiktokSettings?: {draft?: boolean};
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

export type ResultadoPlataforma = {platform: string; status: string; error?: string | null; publishedUrl?: string};

export type ResultadoSubida =
  | {ok: true; postId?: string; plataformas?: ResultadoPlataforma[]; respuestaCruda: unknown}
  | {ok: false; error: string; plataformas?: ResultadoPlataforma[]; respuestaCruda?: unknown};

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

/**
 * Sube el archivo de video via presign (pide URL firmada, hace PUT
 * directo al storage, evita el limite chico de upload-direct) y
 * devuelve la URL final para usar en crearPost(). Reemplaza a la
 * vieja subirArchivoDirecto() (renombrada abajo, ya no se usa desde
 * publicarVideo pero queda por si algun dia hace falta un archivo
 * chico rapido).
 *
 * OJO real: el ejemplo de rules/media.md (`const {uploadUrl, fileUrl}
 * = await getPresignedUrl(...)`) es pseudo-codigo -- llama a una
 * funcion inventada, no muestra el body real de la respuesta. Probado
 * en vivo: POST /v1/media/presign solo devuelve `{"uploadUrl": "..."}`,
 * sin `fileUrl`. La `fileUrl` se deriva sacandole los parametros de
 * firma (todo despues del "?") a `uploadUrl` -- asi funcionan las URLs
 * firmadas de S3/R2 en general (el "?X-Amz-..." es solo la firma
 * temporal para el PUT, el path de antes es la URL real del objeto).
 * No confirmado 100% que Zernio pueda leer ese objeto de vuelta al
 * crear el post -- si crearPost() falla con un error de "no se pudo
 * descargar el media", ese es el primer lugar a revisar.
 */
export async function subirArchivo(rutaVideo: string, apiKeyParam?: string): Promise<string> {
  const apiKey = requerirApiKey(apiKeyParam);
  const tamano = statSync(rutaVideo).size;
  if (tamano > TAMANO_MAXIMO_BYTES) {
    throw new Error(
      `${rutaVideo} pesa ${(tamano / 1024 / 1024).toFixed(1)}MB, supera el limite de 5GB de /v1/media/presign -- no deberia pasar con un video de este proyecto.`
    );
  }
  const nombreArchivo = basename(rutaVideo);

  return conReintentos(async () => {
    const respPresign = await fetch(`${BASE}/media/presign`, {
      method: 'POST',
      headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({filename: nombreArchivo, contentType: 'video/mp4'}),
    });
    if (!respPresign.ok) throw new Error(`media/presign HTTP ${respPresign.status}: ${await respPresign.text()}`);
    const cuerpoPresign = (await respPresign.json()) as {uploadUrl: string; fileUrl?: string};
    const uploadUrl = cuerpoPresign.uploadUrl;
    if (!uploadUrl) {
      throw new Error(`media/presign sin uploadUrl en la respuesta: ${JSON.stringify(cuerpoPresign)}`);
    }
    const fileUrl = cuerpoPresign.fileUrl ?? uploadUrl.split('?')[0];

    const buffer = readFileSync(rutaVideo);
    const respPut = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {'Content-Type': 'video/mp4'},
      body: buffer,
    });
    if (!respPut.ok) throw new Error(`PUT a uploadUrl HTTP ${respPut.status}: ${await respPut.text()}`);

    // Hipotesis real probada tras un fallo con "missingFiles":1 en
    // crearPost() (el PUT da 200 pero el backend de Zernio no encuentra
    // el objeto todavia al armar el post) -- espera corta para darle
    // tiempo a R2/Zernio a propagar el objeto recien subido.
    await new Promise((r) => setTimeout(r, 4000));

    return fileUrl;
  }, `subir archivo ${nombreArchivo} (presign)`);
}

/**
 * Sube el archivo entero de una via upload-direct -- solo sirve para
 * archivos chicos (~4.5MB o menos, ver comentario arriba). Ya no la usa
 * publicarVideo() (usa subirArchivo() / presign, que no tiene ese techo);
 * queda disponible por si hace falta el camino rapido para un archivo
 * chico puntual.
 */
export async function subirArchivoDirecto(rutaVideo: string, apiKeyParam?: string): Promise<string> {
  const apiKey = requerirApiKey(apiKeyParam);
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

    // OJO real: un HTTP 200 NO significa que se publico -- Zernio puede
    // devolver 200 con el post creado pero "publishing failed" en el
    // cuerpo (ej: TikTok a capacidad). Se cuenta como exito solo si
    // NINGUNA plataforma pedida quedo "failed" -- no se exige que TODAS
    // digan "published" porque una plataforma en modo borrador
    // (tiktokSettings.draft:true) legitimamente no termina en
    // "published" (va a Creator Inbox a la espera de que el operador la
    // confirme a mano) y no por eso es un fallo real.
    const plataformas: ResultadoPlataforma[] | undefined = Array.isArray(data?.platformResults)
      ? data.platformResults
      : undefined;
    if (plataformas && plataformas.some((p) => p.status === 'failed')) {
      const detalle = plataformas.map((p) => `${p.platform}:${p.status}${p.error ? ` (${p.error})` : ''}`).join(', ');
      return {ok: false, error: data.error ?? `no todas las plataformas publicaron -- ${detalle}`, plataformas, respuestaCruda: data};
    }
    return {ok: true, postId: data.id ?? data.postId ?? data.post?._id, plataformas, respuestaCruda: data};
  }, 'crear post en Zernio');
}

/**
 * Lista los posts recientes con su detalle crudo (incluye, segun
 * rules/webhooks.md del repo de Zernio, resultado por plataforma:
 * platform/status/publishedUrl/error). Es de solo lectura, pensada
 * para diagnostico -- no publica nada.
 */
export async function listarPostsRecientes(limite = 5, apiKeyParam?: string): Promise<unknown> {
  const apiKey = requerirApiKey(apiKeyParam);
  const resp = await fetch(`${BASE}/posts?limit=${limite}`, {
    headers: {Authorization: `Bearer ${apiKey}`},
  });
  const cuerpo = await resp.text();
  let data: any = cuerpo;
  try { data = JSON.parse(cuerpo); } catch { /* se deja como texto */ }
  if (!resp.ok) throw new Error(`GET /posts HTTP ${resp.status}: ${cuerpo}`);
  return data;
}

/**
 * Trae los logs de publicacion de un post puntual (donde Zernio informa
 * el error real por plataforma cuando una falla, segun rules/errors.md).
 */
export async function obtenerLogsPost(postId: string, apiKeyParam?: string): Promise<unknown> {
  const apiKey = requerirApiKey(apiKeyParam);
  const resp = await fetch(`${BASE}/posts/${postId}/logs`, {
    headers: {Authorization: `Bearer ${apiKey}`},
  });
  const cuerpo = await resp.text();
  let data: any = cuerpo;
  try { data = JSON.parse(cuerpo); } catch { /* se deja como texto */ }
  if (!resp.ok) throw new Error(`GET /posts/${postId}/logs HTTP ${resp.status}: ${cuerpo}`);
  return data;
}

/**
 * Consulta el resumen de analiticas por cuenta (GET /v1/analytics).
 * OJO real: rules/analytics.md dice que la mayoria de estos endpoints
 * requieren el "analytics add-on" de Zernio -- no confirmado si el plan
 * gratuito lo incluye. Esta funcion es de solo lectura, para probarlo
 * antes de prometer metricas en cualquier panel.
 */
export async function obtenerAnalytics(apiKeyParam?: string): Promise<unknown> {
  const apiKey = requerirApiKey(apiKeyParam);
  const resp = await fetch(`${BASE}/analytics`, {
    headers: {Authorization: `Bearer ${apiKey}`},
  });
  const cuerpo = await resp.text();
  let data: any = cuerpo;
  try { data = JSON.parse(cuerpo); } catch { /* se deja como texto */ }
  return {httpStatus: resp.status, ok: resp.ok, data};
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
  const urlVideo = await subirArchivo(opciones.rutaVideo, opciones.apiKey);
  const cuentas: CuentaObjetivo[] = [];
  if (opciones.cuentaTikTok) {
    cuentas.push({platform: 'tiktok', accountId: opciones.cuentaTikTok.accountId, platformSpecificData: opciones.cuentaTikTok.datos});
  }
  if (opciones.cuentaYouTube) {
    cuentas.push({platform: 'youtube', accountId: opciones.cuentaYouTube.accountId, platformSpecificData: opciones.cuentaYouTube.datos});
  }
  return crearPost({contenido: opciones.contenido, urlVideo, cuentas, apiKey: opciones.apiKey});
}
