/**
 * Cliente real de YouTube Data API v3 (R7-20). Respuesta a "busquemos
 * una solución gratuita sin cargos" -- alternativa a vidIQ (costo no
 * confirmado) y a video-url-analyzer-mcp (usa Gemini, no 100% gratis).
 *
 * CONFIRMADO REAL (2026-09-03, dos fuentes independientes por
 * WebSearch): la API es gratis sin excepción -- 10.000 unidades de
 * cuota por día, NO requiere tarjeta de crédito para generar la clave,
 * y NO EXISTE un plan pago para comprar más cuota (solo se puede pedir
 * un aumento gratuito por formulario). Cero riesgo de gasto accidental,
 * a diferencia de casi cualquier otra API de estas características.
 *
 * También confirmado con una llamada real desde este sandbox: el
 * dominio `googleapis.com` NO está bloqueado por la política de red
 * (a diferencia de `youtube.com`, el sitio web, que sí lo está) --
 * `curl` a este endpoint con una clave inválida devuelve el error 400
 * real de Google ("API key not valid"), no un bloqueo del proxy.
 *
 * Costo de cuota real por operación (documentado por Google):
 *   - videos.list (estadísticas de videos por id): 1 unidad.
 *   - search.list (buscar por palabra clave): 100 unidades.
 *   Con 10.000/día: ~100 búsquedas O miles de consultas de
 *   estadísticas puntuales -- de sobra para investigación manual.
 *
 * Requiere: una API key de YouTube Data API v3 (Google Cloud Console,
 * gratis, sin tarjeta, ~10 minutos) en la variable de entorno
 * FABRICA_YOUTUBE_API_KEY -- ver PENDIENTES_OPERADOR.md para el paso
 * a paso. Sin esa key, estas funciones lanzan un error claro (nunca
 * inventan datos ni fallan en silencio).
 */

const BASE = 'https://www.googleapis.com/youtube/v3';

export type VideoYouTube = {
  id: string;
  titulo: string;
  canal: string;
  publicadoEn: string;
  vistas: number;
  likes: number;
  comentarios: number;
  duracionSeg: number;
};

function requerirApiKey(apiKeyParam?: string): string {
  const apiKey = apiKeyParam ?? process.env.FABRICA_YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Falta FABRICA_YOUTUBE_API_KEY -- sin una API key real de YouTube Data API v3 no se puede consultar nada (nunca se inventan datos). Ver PENDIENTES_OPERADOR.md para conseguir una, gratis, en ~10 minutos.'
    );
  }
  return apiKey;
}

/** Convierte una duración ISO 8601 (ej. "PT4M13S") a segundos reales. */
export function duracionIso8601ASegundos(iso: string): number {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) throw new Error(`Duración ISO 8601 con formato inesperado: ${iso}`);
  const [, h, m, s] = match;
  return (Number(h ?? 0) * 3600) + (Number(m ?? 0) * 60) + Number(s ?? 0);
}

function parsearVideo(item: any): VideoYouTube {
  return {
    id: item.id,
    titulo: item.snippet.title,
    canal: item.snippet.channelTitle,
    publicadoEn: item.snippet.publishedAt,
    vistas: Number(item.statistics?.viewCount ?? 0),
    likes: Number(item.statistics?.likeCount ?? 0),
    comentarios: Number(item.statistics?.commentCount ?? 0),
    duracionSeg: item.contentDetails?.duration ? duracionIso8601ASegundos(item.contentDetails.duration) : 0,
  };
}

/** Estadísticas reales de hasta 50 videos por id -- 1 unidad de cuota
 * total (no por video). Es la operación más barata y la más útil para
 * "¿cuánto le fue realmente a este video puntual que encontré?". */
export async function estadisticasDeVideos(ids: string[], apiKey?: string): Promise<VideoYouTube[]> {
  if (ids.length === 0) return [];
  if (ids.length > 50) throw new Error('La API solo acepta hasta 50 ids por llamada.');
  const key = requerirApiKey(apiKey);
  const url = `${BASE}/videos?part=snippet,statistics,contentDetails&id=${ids.join(',')}&key=${key}`;
  const res = await fetch(url);
  const data: any = await res.json();
  if (!res.ok) throw new Error(`YouTube Data API error: ${data.error?.message ?? res.statusText}`);
  return (data.items ?? []).map(parsearVideo);
}

/** Búsqueda real por palabra clave -- 100 unidades de cuota (usar con
 * moderación, ~100/día disponibles). Devuelve resultados básicos (sin
 * estadísticas todavía); combinar con estadisticasDeVideos() para las
 * cifras reales de los resultados que interesen. */
export async function buscarVideos(query: string, maxResultados = 10, apiKey?: string): Promise<{id: string; titulo: string; canal: string}[]> {
  const key = requerirApiKey(apiKey);
  const url = `${BASE}/search?part=snippet&type=video&maxResults=${maxResultados}&q=${encodeURIComponent(query)}&key=${key}`;
  const res = await fetch(url);
  const data: any = await res.json();
  if (!res.ok) throw new Error(`YouTube Data API error: ${data.error?.message ?? res.statusText}`);
  return (data.items ?? []).map((item: any) => ({
    id: item.id.videoId,
    titulo: item.snippet.title,
    canal: item.snippet.channelTitle,
  }));
}
