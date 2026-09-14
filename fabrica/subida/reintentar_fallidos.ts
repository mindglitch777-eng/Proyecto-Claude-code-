/**
 * CLI: revisa state/uploads.json + state/carruseles.json buscando
 * entradas cuyo post real en Zernio quedo "failed" por el error
 * puntual de TikTok "Too many pending posts" (cupo lleno del Creator
 * Inbox, transitorio -- no un problema del contenido en si) y las
 * recrea automaticamente en la proxima franja horaria "viral"
 * confirmada por el operador (2026-09-11): 18hs, o de 20 a 23hs (ART).
 *
 * Reusa EXACTAMENTE los mismos mediaItems/content/platformSpecificData
 * que ya tenia el post fallido (leidos de Zernio via obtenerPost, no
 * re-derivados de los datos locales del lote) -- asi no hace falta que
 * el video/carrusel siga existiendo en disco en el checkout del
 * workflow, y no se re-sube el archivo de nuevo (la URL en
 * media.zernio.com ya es valida).
 *
 * Solo actua sobre el error puntual de rate limit -- cualquier otro
 * motivo de "failed" (contenido rechazado, cuenta desconectada, etc.)
 * se deja intacto para revision humana, nunca se reintenta a ciegas.
 *
 * Limite: 2 reintentos automaticos por entrada original. Agotados los
 * reintentos, se avisa por ntfy con prioridad "urgent" en vez de seguir
 * chocando contra un error que ya dejo de ser transitorio.
 *
 * Uso: npx tsx subida/reintentar_fallidos.ts
 * Env: ZERNIO_API_KEY (existente), NTFY_TOPIC (existente)
 */
import {crearPost, obtenerPost, type CuentaObjetivo, type MediaItem} from './zernio';
import {RUTA_UPLOADS as UPLOADS_PATH, RUTA_CARRUSELES as CARRUSELES_PATH, leerLog as leer, guardarLog as guardar, type Publicacion as Entrada} from './publicacion';

const MAX_REINTENTOS = 2;
// TikTok pide esperar 15-30 min tras el rate limit antes de reintentar
// -- se toma el piso de ese rango para no chocar de nuevo enseguida.
const ESPERA_MINIMA_MS = 30 * 60 * 1000;

function esRateLimitTikTok(msg: unknown): boolean {
  return typeof msg === 'string' && /too many pending posts/i.test(msg);
}

/** Franja "viral" -- regla RÍGIDA confirmada por el operador (2026-09-11,
 *  reconfirmada 2026-09-14): 18:00 a 23:00 ART corrido (UTC-3), sin
 *  hueco adentro -- para TikTok. YouTube no tiene restricción horaria,
 *  publica bien a cualquier hora (ver CLAUDE.md). Si `desde` ya cae en
 *  la franja, devuelve `desde` tal cual (publicar ya); si no, el
 *  próximo arranque de franja (18:00 ART) en UTC. */
export function proximaFranjaBuena(desde: Date): Date {
  const horaArt = (desde.getUTCHours() - 3 + 24) % 24;
  if (horaArt >= 18 && horaArt < 23) return new Date(desde.getTime());

  // Un solo candidato posible por día (18:00 ART) -- el de hoy si todavía
  // no pasó, si no el de mañana (los candidatos ya vienen en orden
  // cronológico, así que el primero que sea futuro es el más próximo).
  for (let dias = 0; dias < 2; dias++) {
    const candidato = new Date(desde.getTime());
    candidato.setUTCDate(desde.getUTCDate() + dias);
    candidato.setUTCHours(18 + 3, 0, 0, 0);
    if (candidato.getTime() > desde.getTime()) return candidato;
  }
  // Inalcanzable en la práctica (mañana 18:00 ART siempre es futuro),
  // pero TypeScript necesita un retorno exhaustivo.
  throw new Error('No se encontró franja buena en las próximas 48hs -- esto no debería pasar nunca.');
}

async function avisar(topic: string, titulo: string, mensaje: string, prioridad: string): Promise<void> {
  const resp = await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: {Title: titulo, Priority: prioridad, Tags: 'tiktok'},
    body: mensaje,
  });
  if (!resp.ok) throw new Error(`ntfy.sh respondio HTTP ${resp.status}: ${await resp.text()}`);
}

type PostZernio = {
  status?: string;
  content?: string;
  mediaItems?: Array<{type: string; url: string}>;
  updatedAt?: string;
  platforms?: Array<{
    platform: string;
    accountId?: string | {_id?: string};
    platformSpecificData?: unknown;
    status?: string;
    errorMessage?: string;
  }>;
};

function extraerDoc(respuesta: unknown): PostZernio {
  return ((respuesta as any)?.post ?? respuesta ?? {}) as PostZernio;
}

/** Procesa una entrada "raiz" (no un reintento en si) contra su propio
 *  postId, o -- si ya tiene reintentos previos -- contra el postId del
 *  ULTIMO reintento generado, para saber si ya se resolvio, si hay que
 *  reintentar de nuevo, o si hay que agotar. */
async function procesarEntrada(entrada: Entrada, topic: string, todas: Entrada[]): Promise<'reintentado' | 'resuelto' | 'agotado' | 'sin_cambios'> {
  if (!entrada.ok || !entrada.postId) return 'sin_cambios';
  if (entrada.estadoReintento === 'resuelto' || entrada.estadoReintento === 'agotado') return 'sin_cambios';
  // Si ya se notifico (publicado con exito, chequeado por notificar_pendientes.ts)
  // no puede estar "failed" -- saltar ANTES de gastar una llamada a Zernio.
  // Sin este corte se consultaba obtenerPost() para las 60+ entradas
  // historicas en cada corrida (cada 20 min) y se chocaba con el rate
  // limit propio de la API de Zernio (60 req/ventana, HTTP 429) antes de
  // llegar siquiera a las entradas realmente fallidas -- confirmado real
  // 2026-09-12, job que proceso 0 de 60+ entradas por este motivo.
  if (entrada.notificado) return 'sin_cambios';

  const reintentosPrevios = entrada.reintentos ?? 0;
  const ultimoReintento = [...todas].reverse().find((x) => x.reintentoDe === entrada.id);
  const postIdAChequear = ultimoReintento?.ok ? ultimoReintento.postId : entrada.postId;
  if (!postIdAChequear) return 'sin_cambios';

  const doc = extraerDoc(await obtenerPost(postIdAChequear));

  if (doc.status !== 'failed') {
    if (ultimoReintento) {
      entrada.estadoReintento = 'resuelto';
      return 'resuelto';
    }
    return 'sin_cambios'; // todavia pendiente/programado, nada que hacer
  }

  const plataformaFallada = (doc.platforms ?? []).find((p) => p.status === 'failed' && esRateLimitTikTok(p.errorMessage));
  if (!plataformaFallada) return 'sin_cambios'; // fallo real de contenido -- no se toca, requiere revision humana aparte

  if (reintentosPrevios >= MAX_REINTENTOS) {
    entrada.estadoReintento = 'agotado';
    await avisar(
      topic,
      `${entrada.id}: reintentos agotados`,
      `Sigue fallando por cupo lleno de TikTok despues de ${MAX_REINTENTOS} reintentos automaticos. Revisar a mano en Zernio.`,
      'urgent',
    );
    return 'agotado';
  }

  const ultimaActualizacion = new Date(doc.updatedAt ?? entrada.fecha ?? 0).getTime();
  if (Date.now() - ultimaActualizacion < ESPERA_MINIMA_MS) return 'sin_cambios'; // todavia dentro del piso de espera que pide TikTok

  const mediaItems: MediaItem[] = (doc.mediaItems ?? []).map((m) => ({type: m.type as 'image' | 'video', url: m.url}));
  const cuentas: CuentaObjetivo[] = (doc.platforms ?? []).map((p) => ({
    platform: p.platform as 'tiktok' | 'youtube',
    accountId: typeof p.accountId === 'string' ? p.accountId : (p.accountId?._id ?? ''),
    platformSpecificData: p.platformSpecificData,
  })) as CuentaObjetivo[];

  const scheduledFor = proximaFranjaBuena(new Date()).toISOString();
  const resultado = await crearPost({contenido: doc.content ?? '', mediaItems, cuentas, scheduledFor});

  entrada.reintentos = reintentosPrevios + 1;
  entrada.estadoReintento = 'reintentando';

  todas.push({
    id: `${entrada.id}-reintento${entrada.reintentos}`,
    fecha: new Date().toISOString(),
    ok: resultado.ok,
    postId: resultado.ok ? resultado.postId : undefined,
    reintentoDe: entrada.id,
    scheduledFor,
    notificado: false,
    respuestaCruda: resultado.respuestaCruda,
    ...(resultado.ok ? {} : {error: (resultado as {error: string}).error}),
  });

  await avisar(
    topic,
    resultado.ok ? `${entrada.id}: reintentado` : `${entrada.id}: fallo el reintento`,
    resultado.ok
      ? `Habia fallado por cupo lleno de TikTok -- se recreo, programado para ${scheduledFor}.`
      : `El reintento automatico tambien fallo: ${(resultado as {error: string}).error}`,
    resultado.ok ? 'default' : 'high',
  );
  return 'reintentado';
}

async function procesar(ruta: string, topic: string): Promise<number> {
  const datos = leer(ruta);
  let cambios = 0;
  // Solo se itera sobre entradas raiz (sin reintentoDe) -- los propios
  // reintentos generados se consultan desde procesarEntrada(), nunca
  // como raiz de un reintento nuevo.
  for (const entrada of datos.filter((e) => !e.reintentoDe)) {
    try {
      const resultado = await procesarEntrada(entrada, topic, datos);
      if (resultado !== 'sin_cambios') cambios++;
    } catch (error) {
      console.error(`Error procesando ${entrada.id}: ${(error as Error).message}`);
    }
  }
  if (cambios > 0) guardar(ruta, datos);
  return cambios;
}

async function main(): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    console.error('Falta NTFY_TOPIC en el entorno.');
    process.exit(1);
  }
  const cambiosUploads = await procesar(UPLOADS_PATH, topic);
  const cambiosCarruseles = await procesar(CARRUSELES_PATH, topic);
  console.log(`Listo. ${cambiosUploads} upload(s) + ${cambiosCarruseles} carrusel(es) procesados.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
