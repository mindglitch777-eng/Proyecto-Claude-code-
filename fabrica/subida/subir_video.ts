/**
 * CLI: sube un video del lote 21 a TikTok + YouTube via Zernio.
 * Uso: npx tsx subida/subir_video.ts v01
 *
 * Cuentas de TikTok/YouTube ya conectadas en Zernio por el operador
 * (2026-09-10) -- los accountId son fijos por ahora (una sola cuenta
 * de cada plataforma), se podrian mover a env vars si el dia de mañana
 * hay mas de una cuenta por plataforma.
 */
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {publicarVideo, type ResultadoPlataforma} from './zernio';
import {VIDEOS} from '../ejemplos/lote_21_datos';
import {PUBLICACION_LOTE21} from '../ejemplos/lote_21_publicacion';

const RAIZ = resolve(__dirname, '../..');

const ACCOUNT_ID_TIKTOK = '6aa1ce18726ebfe037cfddd1';
const ACCOUNT_ID_YOUTUBE = '6aa1ce88726ebfe037cfe0ea';

const LOG_PATH = resolve(RAIZ, 'state/uploads.json');

type EntradaLog = {
  id: string;
  fecha: string;
  ok: boolean;
  postId?: string;
  error?: string;
  plataformas?: ResultadoPlataforma[];
  respuestaCruda?: unknown;
};

function leerLog(): EntradaLog[] {
  if (!existsSync(LOG_PATH)) return [];
  return JSON.parse(readFileSync(LOG_PATH, 'utf-8'));
}

function guardarEnLog(entrada: EntradaLog): void {
  const log = leerLog();
  log.push(entrada);
  mkdirSync(dirname(LOG_PATH), {recursive: true});
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + '\n');
}

async function main(): Promise<void> {
  const id = process.argv[2];
  if (!id) {
    console.error('Uso: npx tsx subida/subir_video.ts <id>  (ej: v01)');
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

  console.log(`Subiendo ${id} ("${video.titulo}") a TikTok + YouTube...`);

  const resultado = await publicarVideo({
    rutaVideo,
    contenido: caption,
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
      },
    },
    cuentaYouTube: {
      accountId: ACCOUNT_ID_YOUTUBE,
      datos: {
        title: video.titulo,
        visibility: 'public',
        containsSyntheticMedia: true,
      },
    },
  });

  guardarEnLog({
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
