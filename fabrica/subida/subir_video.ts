/**
 * CLI: sube un video del lote 21 a TikTok + YouTube via Zernio.
 * Uso: npx tsx subida/subir_video.ts v01
 *
 * Cuentas de TikTok/YouTube ya conectadas en Zernio por el operador
 * (2026-09-10) -- los accountId son fijos por ahora (una sola cuenta
 * de cada plataforma), se podrian mover a env vars si el dia de mañana
 * hay mas de una cuenta por plataforma.
 */
import {existsSync, appendFileSync} from 'fs';
import {resolve} from 'path';
import {publicarVideo} from './zernio';
import {enviarAvisoParaSubidaManual} from './enviar_para_subida_manual';
import {RUTA_UPLOADS, agregarEntrada} from './publicacion';
import {VIDEOS} from '../ejemplos/lote_21_datos';
import {PUBLICACION_LOTE21} from '../ejemplos/lote_21_publicacion';

const RAIZ = resolve(__dirname, '../..');

const ACCOUNT_ID_TIKTOK = '6aa1ce18726ebfe037cfddd1';
const ACCOUNT_ID_YOUTUBE = '6aa1ce88726ebfe037cfe0ea';

async function main(): Promise<void> {
  const id = process.argv[2];
  const scheduledFor = process.argv[3]; // opcional, ISO UTC -- si falta, publica ya
  const soloTiktok = process.argv[4] === '--solo-tiktok';
  if (!id) {
    console.error(
      'Uso: npx tsx subida/subir_video.ts <id> [scheduledForISO] [--solo-tiktok]  (ej: v01 2026-09-11T00:15:00Z)\n' +
        '--solo-tiktok: reintentar SOLO TikTok (para cuando YouTube ya publico bien la primera vez y no hay que duplicarlo).',
    );
    process.exit(1);
  }

  const video = VIDEOS.find((v) => v.id === id);
  const publicacion = PUBLICACION_LOTE21.find((p) => p.id === id);
  if (!video || !publicacion) {
    throw new Error(`No se encontro metadata para "${id}" en lote_21_datos.ts / lote_21_publicacion.ts.`);
  }

  const rutaVideo = resolve(RAIZ, `videos/lote21/lote21-${id}.mp4`);
  if (!existsSync(rutaVideo)) {
    throw new Error(`No existe ${rutaVideo} -- ¿el video ya esta renderizado y commiteado?`);
  }

  const caption = `${publicacion.descripcion}\n\n${publicacion.cta}\n\n${publicacion.hashtags.join(' ')}`;

  console.log(
    `Subiendo ${id} ("${video.titulo}") a TikTok${soloTiktok ? '' : ' + YouTube'}${scheduledFor ? ` (programado para ${scheduledFor})` : ''}...`,
  );

  let resultado;
  try {
    resultado = await publicarVideo({
      rutaVideo,
      contenido: caption,
      scheduledFor,
      cuentaTikTok: {
        accountId: ACCOUNT_ID_TIKTOK,
        datos: {
          privacyLevel: 'PUBLIC_TO_EVERYONE',
          allowComment: true,
          allowDuet: true,
          allowStitch: true,
          contentPreviewConfirmed: true,
          expressConsentGiven: true,
          videoMadeWithAi: true,
          // Decision del operador (2026-09-10) tras 2 fallos reales por
          // "TikTok direct posting is at capacity" (v05 y v14, ~15min
          // aparte -- no es un bache de segundos): mientras tanto TikTok
          // va a modo borrador (Creator Inbox) en vez de intentar publicar
          // directo. El operador confirma el video con un toque desde la
          // app -- YouTube sigue publicando 100% automatico sin cambios.
          draft: true,
          tiktokSettings: {draft: true},
        },
      },
      ...(soloTiktok
        ? {}
        : {
            cuentaYouTube: {
              accountId: ACCOUNT_ID_YOUTUBE,
              datos: {
                title: video.titulo,
                visibility: 'public',
                containsSyntheticMedia: true,
              },
            },
          }),
    });
  } catch (error) {
    const mensaje = (error as Error).message;
    // publicarVideo() tira ESTE error especifico, sin llamar a la red,
    // cuando el archivo supera el limite real de ~4MB de upload-direct
    // (presign de Zernio roto, ver zernio.ts) -- en vez de fallar el
    // job entero, cae al buzon de subida manual (2026-09-14, ver
    // panel/LANZAMIENTO.md). Cualquier OTRO error sigue siendo un fallo
    // real, no se lo confunde con este caso.
    if (!mensaje.includes('supera el limite real de ~4MB')) throw error;

    console.log(`${id} pesa mas de lo que Zernio puede subir solo -- cae al buzon de subida manual.`);

    // Entrega programada de ntfy.sh (min 10s, max 3 dias -- confirmado
    // real 2026-09-14) en vez de un chequeo periodico: se manda UNA
    // sola vez, ya, y ntfy.sh lo entrega solo en el momento justo. Cero
    // corridas de mas -- pedido explicito del operador ("que me avise
    // en el momento exacto, no que revise cada 20 minutos al pedo").
    const MAX_DELAY_MS = 3 * 24 * 60 * 60 * 1000;
    const msHastaHorario = scheduledFor ? new Date(scheduledFor).getTime() - Date.now() : 0;
    const entraEnVentanaDeNtfy = !scheduledFor || msHastaHorario <= MAX_DELAY_MS;

    if (entraEnVentanaDeNtfy) {
      const topic = process.env.NTFY_TOPIC;
      if (!topic) throw new Error('Falta NTFY_TOPIC en el entorno para avisar el buzon.');
      const rutaOutput = process.env.GITHUB_OUTPUT;
      if (rutaOutput) appendFileSync(rutaOutput, `huboBuzon=true\nrutaVideoBuzon=${rutaVideo}\n`);
      const entregarEnUnix = scheduledFor && msHastaHorario > 10_000 ? Math.floor(new Date(scheduledFor).getTime() / 1000) : undefined;
      await enviarAvisoParaSubidaManual(topic, `${id}.mp4`, video.titulo, scheduledFor ?? 'ahora', caption, entregarEnUnix);
      agregarEntrada(RUTA_UPLOADS, {id, fecha: new Date().toISOString(), ok: true, manual: true, estado: 'pendiente', tema: video.titulo, scheduledFor, rutaVideo, avisadoBuzon: true});
      console.log(
        entregarEnUnix
          ? `OK -- ${id} mandado al buzon, aviso programado para ${scheduledFor} (ntfy.sh lo entrega solo).`
          : `OK -- ${id} mandado al buzon de subida manual (aviso ya enviado).`,
      );
    } else {
      // Falta mas de 3 dias -- ntfy.sh no puede programar tan lejos.
      // Se registra pendiente; chequear_buzon.ts (corrida diaria, no
      // cada 15 min) lo agarra en cuanto entre en la ventana de 3 dias.
      agregarEntrada(RUTA_UPLOADS, {id, fecha: new Date().toISOString(), ok: true, manual: true, estado: 'pendiente', tema: video.titulo, scheduledFor, rutaVideo, avisadoBuzon: false});
      console.log(`OK -- ${id} registrado en el buzon, todavia faltan mas de 3 dias para ${scheduledFor} (limite real de ntfy.sh).`);
    }
    return;
  }

  agregarEntrada(RUTA_UPLOADS, {
    id,
    fecha: new Date().toISOString(),
    ok: resultado.ok,
    postId: resultado.ok ? resultado.postId : undefined,
    error: resultado.ok ? undefined : resultado.error,
    plataformas: resultado.plataformas,
    respuestaCruda: resultado.respuestaCruda,
  });

  console.log('Respuesta cruda de Zernio (para verificar cada plataforma por separado):');
  console.log(JSON.stringify(resultado.respuestaCruda, null, 2));

  if (resultado.plataformas) {
    console.log('Estado por plataforma:');
    for (const p of resultado.plataformas) {
      console.log(`  - ${p.platform}: ${p.status}${p.error ? ` -- ${p.error}` : ''}`);
    }
  }

  if (!resultado.ok) {
    console.error(`FALLO la subida de ${id}: ${resultado.error}`);
    process.exit(1);
  }
  console.log(`OK -- ${id} publicado en TODAS las plataformas pedidas. postId: ${resultado.postId ?? '(no informado)'}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
