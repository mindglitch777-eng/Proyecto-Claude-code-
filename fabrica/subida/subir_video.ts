/**
 * CLI: entrega un video del lote 21 al operador para que lo suba a
 * mano vía TikTok Studio + YouTube Studio (programación nativa de cada
 * app, hasta 10+ días TikTok / ~1 año YouTube) -- decisión de
 * arquitectura 2026-09-14. Ya no publica nada vía Zernio: el operador
 * hace el upload real desde su celular, este script solo le arma y le
 * entrega el paquete completo (video + tema + horario sugerido +
 * descripción + hashtags + música) por ntfy.sh, con el video como
 * artifact de GitHub Actions.
 *
 * Uso: npx tsx subida/subir_video.ts v01 [scheduledForISO]
 */
import {existsSync, appendFileSync} from 'fs';
import {resolve} from 'path';
import {enviarAvisoParaSubidaManual} from './enviar_para_subida_manual';
import {RUTA_UPLOADS, agregarEntrada} from './publicacion';
import {VIDEOS} from '../ejemplos/lote_21_datos';
import {PUBLICACION_LOTE21} from '../ejemplos/lote_21_publicacion';
import {MUSICA_CATEGORIA} from '../carrusel/lote_42_datos';

const RAIZ = resolve(__dirname, '../..');

async function main(): Promise<void> {
  const id = process.argv[2];
  const scheduledFor = process.argv[3]; // opcional, ISO UTC -- horario SUGERIDO, el operador programa la hora real en la app nativa
  if (!id) {
    console.error('Uso: npx tsx subida/subir_video.ts <id> [scheduledForISO]  (ej: v01 2026-09-16T21:00:00Z)');
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
  // Música sugerida solo va en el AVISO (para elegirla al subir a mano
  // desde TikTok Studio) -- nunca en `caption`, que el operador pega
  // tal cual en la descripción del post real.
  const musica = MUSICA_CATEGORIA[publicacion.categoria];
  const captionConMusica = `${caption}\n\n🎵 Música sugerida: ${musica}`;

  const topic = process.env.NTFY_TOPIC;
  if (!topic) throw new Error('Falta NTFY_TOPIC en el entorno para avisar.');
  const rutaOutput = process.env.GITHUB_OUTPUT;
  if (rutaOutput) appendFileSync(rutaOutput, `rutaVideoBuzon=${rutaVideo}\n`);

  const link = await enviarAvisoParaSubidaManual(topic, `${id}.mp4`, video.titulo, scheduledFor ?? '(programalo vos en TikTok Studio / YouTube Studio)', captionConMusica);
  agregarEntrada(RUTA_UPLOADS, {
    id,
    fecha: new Date().toISOString(),
    ok: true,
    estado: 'pendiente',
    tema: video.titulo,
    scheduledFor,
    rutaVideo,
    link,
    avisadoBuzon: true,
    avisadoBuzonEn: new Date().toISOString(),
  });
  console.log(`OK -- ${id} entregado al operador (aviso mandado, video como artifact).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
