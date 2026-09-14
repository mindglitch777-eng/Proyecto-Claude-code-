/**
 * Tercera alternativa al bug de presign de Zernio (ver zernio.ts y
 * ESTADO.md 2026-09-14): en vez de pelear con la subida automática de
 * videos pesados (>4MB de /v1/media/upload-direct, presign roto sin
 * arreglo posible de nuestro lado), se los manda directo al celular del
 * operador por ntfy.sh -- el archivo real pegado a la notificación. El
 * operador toca la notificación del video, lo comparte directo a
 * TikTok/YouTube desde la app nativa (sin límite de tamaño real, sin
 * pasar por Zernio para nada) y pega el caption del otro mensaje.
 *
 * Van DOS mensajes separados, no uno solo: leyendo docs/publish.md del
 * repo oficial de ntfy (binwiederhier/ntfy, confirmado 2026-09-14) no
 * existe ningún header tipo "Message" para mandar texto de acompañamiento
 * cuando el body del mensaje ya es el archivo binario -- el body sirve
 * para UNA cosa o la otra, no las dos a la vez.
 *
 * Límite real del servidor público ntfy.sh (no self-hosted, mismo doc):
 * 15MB por adjunto, expira a las 3 horas.
 *
 * Uso: npx tsx subida/enviar_para_subida_manual.ts <ruta-video> <caption>
 * Env: NTFY_TOPIC (existente, mismo secret que notificar_pendientes.ts)
 */
import {readFileSync, statSync} from 'fs';
import {basename} from 'path';

const LIMITE_ADJUNTO_BYTES = 15 * 1024 * 1024;

export async function enviarCaptionParaSubidaManual(topic: string, nombreVideo: string, caption: string): Promise<void> {
  const resp = await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: {Title: `Caption para ${nombreVideo}`, Priority: 'default', Tags: 'memo'},
    body: caption,
  });
  if (!resp.ok) throw new Error(`ntfy.sh (caption) respondió HTTP ${resp.status}: ${await resp.text()}`);
}

export async function enviarVideoParaSubidaManual(topic: string, rutaVideo: string): Promise<void> {
  const tamano = statSync(rutaVideo).size;
  if (tamano > LIMITE_ADJUNTO_BYTES) {
    throw new Error(
      `${rutaVideo} pesa ${(tamano / 1024 / 1024).toFixed(1)}MB, supera el límite real de 15MB de adjuntos de ` +
      `ntfy.sh -- este video puntual no entra por este camino, hace falta otra alternativa para este caso.`
    );
  }
  const nombreArchivo = basename(rutaVideo);
  const buffer = readFileSync(rutaVideo);
  const resp = await fetch(`https://ntfy.sh/${topic}`, {
    method: 'PUT',
    headers: {
      Title: 'Video nuevo -- subilo a mano (TikTok/YouTube)',
      Filename: nombreArchivo,
      Priority: 'high',
      Tags: 'movie_camera',
    },
    body: buffer,
  });
  if (!resp.ok) throw new Error(`ntfy.sh (video) respondió HTTP ${resp.status}: ${await resp.text()}`);
}

async function main(): Promise<void> {
  const rutaVideo = process.argv[2];
  const caption = process.argv[3] ?? '(sin caption de prueba)';
  if (!rutaVideo) {
    console.error('Uso: npx tsx subida/enviar_para_subida_manual.ts <ruta-video> <caption>');
    process.exit(1);
  }
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    console.error('Falta NTFY_TOPIC en el entorno.');
    process.exit(1);
  }
  const nombreVideo = basename(rutaVideo);
  console.log(`Mandando caption de prueba para ${nombreVideo}...`);
  await enviarCaptionParaSubidaManual(topic, nombreVideo, caption);
  console.log('Caption mandado. Mandando el video real...');
  await enviarVideoParaSubidaManual(topic, rutaVideo);
  console.log('Listo -- deberían haber llegado 2 notificaciones al celular (caption + video).');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
