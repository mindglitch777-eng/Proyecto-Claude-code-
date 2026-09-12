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
 *      files". Es la que usa publicarVideo() por defecto (ver OJO real
 *      del punto 2 -- el presign quedo roto en la practica).
 *   2. POST /v1/media/presign + PUT directo al storage -- en teoria la
 *      via para archivos grandes (hasta 5GB segun rules/media.md), pero
 *      PROBADA Y ROTA en 3 intentos reales distintos (2026-09-10, video
 *      v07 de 9.76MB):
 *        a) el presign real solo devuelve `{"uploadUrl": "..."}` --
 *           nunca `fileUrl`, a pesar de que el ejemplo de rules/media.md
 *           lo muestra (es pseudo-codigo, no el body real).
 *        b) usando la uploadUrl sin la query de firma como fileUrl: el
 *           PUT da 200 pero POST /v1/posts falla siempre con HTTP 400
 *           `{"error":"Some media files failed to upload...",
 *           "details":{"missingFiles":1}}`.
 *        c) agregando una espera de 4s por si era un tema de
 *           propagacion: mismo error, igual de instantaneo -- no es
 *           timing.
 *        d) usando la uploadUrl COMPLETA (con la firma) como fileUrl:
 *           mismo error otra vez.
 *      Busqueda exhaustiva en los 24 archivos de rules/ del repo oficial
 *      de Zernio (`git clone` de zernio-dev/zernio-api) sin encontrar
 *      ningun endpoint de "finalize"/"confirm upload" ni una forma
 *      documentada de resolver esto. subirArchivo() de aca abajo queda
 *      implementada pero SIN USAR por publicarVideo() -- devuelve la
 *      uploadUrl firmada completa (la ultima variante probada) por si
 *      en el futuro Zernio arregla su lado, pero no se confia en ella
 *      para produccion. Video de mas de ~4MB: por ahora la unica salida
 *      real encontrada (sin comprimir) seria alojar el archivo en una
 *      URL publica propia y pasarsela a mediaItems.url -- pero esto
 *      significa publicar contenido en un canal nuevo (ej. hacer public
 *      el repo, o subir a un host publico), lo cual la Regla de Oro del
 *      proyecto exige confirmar con el operador antes de hacerlo. No
 *      implementado sin esa confirmacion.
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
// Limite real confirmado de /v1/media/upload-direct (no el 25MB que dice
// la doc) -- ver OJO real arriba. Un video mas grande no se sube solo:
// publicarVideo() tira un error explicito en vez de intentarlo y fallar
// con un 413 confuso.
const LIMITE_UPLOAD_DIRECTO_BYTES = 4 * 1024 * 1024;
// Limite real de /v1/media/presign segun rules/media.md (5GB) -- se deja
// como red de seguridad para subirArchivo(), que no se usa por defecto.
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
  // Solo aplica a posts de fotos (carruseles) -- rules/platforms.md:
  // indice del slide que se usa como portada, y descripcion extendida
  // especifica para posts de fotos (hasta 4000 caracteres).
  photoCoverIndex?: number;
  autoAddMusic?: boolean;
  // OJO real (confirmado con el error de Zernio en el primer intento de
  // carrusel-01): en un post de fotos, el `content` de nivel superior se
  // usa como TITULO del slideshow -- TikTok lo capa a 90 caracteres. El
  // caption largo real (descripcion + hashtags) va aca, en `description`
  // (hasta 4000 caracteres), no en el `content` del post.
  description?: string;
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

    const buffer = readFileSync(rutaVideo);
    const respPut = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {'Content-Type': 'video/mp4'},
      body: buffer,
    });
    if (!respPut.ok) throw new Error(`PUT a uploadUrl HTTP ${respPut.status}: ${await respPut.text()}`);

    // Hipotesis 1 (espera de propagacion, 4s) probada y descartada: el
    // 400 de crearPost() con "missingFiles":1 vuelve practicamente
    // instantaneo incluso con la espera, asi que no es timing.
    // Hipotesis 2, probando ahora: en vez de la URL derivada (sin la
    // query de firma, que asumia que el objeto quedaba publico), se usa
    // la uploadUrl COMPLETA (con firma) como fileUrl -- por si el
    // backend de Zernio la lee directo de ahi en vez de necesitar una
    // URL publica separada.
    return cuerpoPresign.fileUrl ?? uploadUrl;
  }, `subir archivo ${nombreArchivo} (presign)`);
}

/**
 * Sube el archivo entero de una via upload-direct -- solo sirve para
 * archivos chicos (~4.5MB o menos, ver comentario arriba). Ya no la usa
 * publicarVideo() (usa subirArchivo() / presign, que no tiene ese techo);
 * queda disponible por si hace falta el camino rapido para un archivo
 * chico puntual.
 */
export async function subirArchivoDirecto(rutaArchivo: string, apiKeyParam?: string, contentType = 'video/mp4'): Promise<string> {
  const apiKey = requerirApiKey(apiKeyParam);
  return conReintentos(async () => {
    const buffer = readFileSync(rutaArchivo);
    const form = new FormData();
    form.append('file', new Blob([buffer], {type: contentType}), basename(rutaArchivo));

    const resp = await fetch(`${BASE}/media/upload-direct`, {
      method: 'POST',
      headers: {Authorization: `Bearer ${apiKey}`},
      body: form,
    });
    if (!resp.ok) throw new Error(`upload-direct HTTP ${resp.status}: ${await resp.text()}`);
    const data = (await resp.json()) as {url: string};
    if (!data.url) throw new Error(`upload-direct sin campo "url" en la respuesta: ${JSON.stringify(data)}`);
    return data.url;
  }, `subir archivo ${basename(rutaArchivo)}`);
}

export type MediaItem = {type: 'image' | 'video'; url: string};

/**
 * Crea el post apuntando a las plataformas indicadas.
 * `scheduledFor` (ISO UTC) programa el post para mas adelante -- si no
 * se pasa, publishNow=true (nunca programa para despues sin que se
 * pida explicito). rules/posts.md: "Scheduling (pick one)" -- publishNow
 * y scheduledFor son mutuamente excluyentes.
 */
export async function crearPost(opciones: {
  contenido: string;
  mediaItems: MediaItem[];
  cuentas: CuentaObjetivo[];
  scheduledFor?: string;
  apiKey?: string;
}): Promise<ResultadoSubida> {
  const apiKey = requerirApiKey(opciones.apiKey);

  return conReintentos(async () => {
    const resp = await fetch(`${BASE}/posts`, {
      method: 'POST',
      headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        content: opciones.contenido,
        mediaItems: opciones.mediaItems,
        platforms: opciones.cuentas,
        ...(opciones.scheduledFor ? {scheduledFor: opciones.scheduledFor} : {publishNow: true}),
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
 * Trae el estado ACTUAL de un post puntual (GET /v1/posts/:id) -- a
 * diferencia de obtenerLogsPost() (historial de eventos, puede venir
 * vacio), esto devuelve el documento del post con el `status` real por
 * plataforma tal cual esta ahora mismo (published/failed/pending).
 *
 * OJO real (2026-09-12): la API de Zernio tiene su PROPIO rate limit
 * (60 req/ventana, HTTP 429 con body
 * `{"error":"Rate limit exceeded...","details":{"currentCount","limit","retryAfterSeconds"}}`)
 * -- distinto del rate limit de TikTok que reportan los posts en si.
 * notificar_pendientes.ts y reintentar_fallidos.ts corren en el mismo
 * job cada 20 min e iteran decenas de entradas cada uno llamando esta
 * funcion, y lo chocaban de lleno (confirmado real: job que proceso 0
 * de 60+ entradas por este motivo). Ante un 429 se espera lo que pide
 * `retryAfterSeconds` (+ margen) y se reintenta un par de veces en vez
 * de tirar el error de una -- sin esto cualquier corrida con muchas
 * entradas pendientes queda inutil de nuevo apenas crezca el volumen.
 */
export async function obtenerPost(postId: string, apiKeyParam?: string): Promise<unknown> {
  const apiKey = requerirApiKey(apiKeyParam);
  const MAX_INTENTOS_429 = 3;
  for (let intento = 1; intento <= MAX_INTENTOS_429; intento++) {
    const resp = await fetch(`${BASE}/posts/${postId}`, {
      headers: {Authorization: `Bearer ${apiKey}`},
    });
    const cuerpo = await resp.text();
    let data: any = cuerpo;
    try { data = JSON.parse(cuerpo); } catch { /* se deja como texto */ }
    if (resp.ok) return data;
    if (resp.status === 429 && intento < MAX_INTENTOS_429) {
      const retryAfterSeg = typeof data?.details?.retryAfterSeconds === 'number' ? data.details.retryAfterSeconds : 30;
      console.error(`[zernio] GET /posts/${postId} -- rate limit de Zernio (429), esperando ${retryAfterSeg}s antes de reintentar (intento ${intento}/${MAX_INTENTOS_429})`);
      await new Promise((r) => setTimeout(r, (retryAfterSeg + 2) * 1000));
      continue;
    }
    throw new Error(`GET /posts/${postId} HTTP ${resp.status}: ${cuerpo}`);
  }
  throw new Error(`GET /posts/${postId} -- rate limit de Zernio persistente tras ${MAX_INTENTOS_429} intentos`);
}

/**
 * Cancela/elimina un post programado a futuro (DELETE /v1/posts/:id).
 * El repo oficial de Zernio lista el endpoint en la tabla resumen pero
 * SIN contrato detallado (body/respuesta/comportamiento con posts ya
 * programados) -- no hay forma de confirmarlo sin probarlo con un caso
 * real. Uso previsto: reprogramar un carrusel que YA fue creado con
 * `scheduledFor` en un horario malo (Zernio publica carruseles directo,
 * sin pasar por el inbox de borrador de TikTok, asi que crear un post
 * nuevo con el horario corregido SIN borrar el viejo duplicaria la
 * publicacion real en la cuenta -- a diferencia de los videos, donde el
 * viejo borrador nunca tocado en el inbox no hace daño si se lo deja
 * expirar solo).
 */
export async function eliminarPost(postId: string, apiKeyParam?: string): Promise<unknown> {
  const apiKey = requerirApiKey(apiKeyParam);
  const resp = await fetch(`${BASE}/posts/${postId}`, {
    method: 'DELETE',
    headers: {Authorization: `Bearer ${apiKey}`},
  });
  const cuerpo = await resp.text();
  let data: any = cuerpo;
  try { data = JSON.parse(cuerpo); } catch { /* se deja como texto */ }
  if (!resp.ok) throw new Error(`DELETE /posts/${postId} HTTP ${resp.status}: ${cuerpo}`);
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
  scheduledFor?: string;
  apiKey?: string;
}): Promise<ResultadoSubida> {
  if (!opciones.cuentaTikTok && !opciones.cuentaYouTube) {
    throw new Error('publicarVideo: no se paso ninguna cuenta destino (ni TikTok ni YouTube).');
  }
  const tamano = statSync(opciones.rutaVideo).size;
  if (tamano > LIMITE_UPLOAD_DIRECTO_BYTES) {
    throw new Error(
      `${opciones.rutaVideo} pesa ${(tamano / 1024 / 1024).toFixed(2)}MB, supera el limite real de ~4MB de ` +
      `/v1/media/upload-direct. El flujo /v1/media/presign (subirArchivo()) esta probado y roto en el lado de ` +
      `Zernio (POST /v1/posts falla siempre con "missingFiles":1, ver el comentario de arriba del archivo). ` +
      `Pendiente del operador: comprimir este video para que entre en upload-direct, o decidir alojarlo en una ` +
      `URL publica propia (esto ultimo publica contenido en un canal nuevo -- requiere confirmacion explicita).`
    );
  }
  const urlVideo = await subirArchivoDirecto(opciones.rutaVideo, opciones.apiKey);
  const cuentas: CuentaObjetivo[] = [];
  if (opciones.cuentaTikTok) {
    cuentas.push({platform: 'tiktok', accountId: opciones.cuentaTikTok.accountId, platformSpecificData: opciones.cuentaTikTok.datos});
  }
  if (opciones.cuentaYouTube) {
    cuentas.push({platform: 'youtube', accountId: opciones.cuentaYouTube.accountId, platformSpecificData: opciones.cuentaYouTube.datos});
  }
  return crearPost({
    contenido: opciones.contenido,
    mediaItems: [{type: 'video', url: urlVideo}],
    cuentas,
    scheduledFor: opciones.scheduledFor,
    apiKey: opciones.apiKey,
  });
}

/**
 * Sube un carrusel de imagenes (TikTok photo post -- YouTube no tiene
 * equivalente, asi que solo aplica a TikTok). Sube cada slide via
 * upload-direct (imagenes del lote42 pesan <1.2MB, bien por debajo del
 * limite real de ~4MB) y arma un unico post con todas las imagenes en
 * `mediaItems` en orden. `photoCoverIndex: 0` fija la portada en el
 * primer slide (rules/platforms.md).
 */
export async function publicarCarrusel(opciones: {
  rutasImagenes: string[];
  contenido: string;
  cuentaTikTok: {accountId: string; datos: DatosTikTok};
  scheduledFor?: string;
  apiKey?: string;
}): Promise<ResultadoSubida> {
  if (opciones.rutasImagenes.length === 0) {
    throw new Error('publicarCarrusel: no se paso ninguna imagen.');
  }
  const mediaItems: MediaItem[] = [];
  for (const ruta of opciones.rutasImagenes) {
    const url = await subirArchivoDirecto(ruta, opciones.apiKey, 'image/png');
    mediaItems.push({type: 'image', url});
  }
  return crearPost({
    contenido: opciones.contenido,
    mediaItems,
    cuentas: [{platform: 'tiktok', accountId: opciones.cuentaTikTok.accountId, platformSpecificData: opciones.cuentaTikTok.datos}],
    scheduledFor: opciones.scheduledFor,
    apiKey: opciones.apiKey,
  });
}
