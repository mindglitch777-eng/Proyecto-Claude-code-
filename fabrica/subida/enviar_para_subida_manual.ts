/**
 * Tercera alternativa al bug de presign de Zernio (ver zernio.ts y
 * ESTADO.md 2026-09-14): en vez de pelear con la subida automática de
 * videos pesados (>4MB de /v1/media/upload-direct, presign roto sin
 * arreglo posible de nuestro lado), se entrega el video para que el
 * operador lo suba a mano desde la app nativa de TikTok/YouTube.
 *
 * INTENTO 1 (descartado, evidencia real 2026-09-14): mandar el archivo
 * pegado directo a una notificación de ntfy.sh. Falló con HTTP 413
 * "attachment too large, or bandwidth limit reached" en un video de
 * 8.38MB -- bien debajo del límite documentado de 15MB por adjunto. La
 * causa real no es el tamaño: las máquinas de GitHub Actions comparten
 * IP entre miles de usuarios del servidor GRATIS de ntfy.sh, y el cupo
 * de ancho de banda "por visitante" de esa IP ya viene gastado por
 * tráfico ajeno -- no es confiable (a veces anda, a veces no, según qué
 * tan usada esté la IP en ese momento).
 *
 * SOLUCIÓN REAL (esta): el video se sube como artifact del propio
 * workflow de GitHub Actions (gratis, sin compartir cupo con nadie, ya
 * es infraestructura que usamos para todo lo demás) y ntfy.sh manda
 * SOLO un mensaje de texto con el link a esa corrida -- los adjuntos de
 * GitHub Actions requieren estar logueado en GitHub para bajarlos
 * (confirmado leyendo docs.github.com/rest/actions/artifacts), así que
 * esto no es "publicar contenido públicamente": hace falta la cuenta de
 * GitHub del operador, la misma que ya usa para todo este proyecto.
 *
 * Uso: npx tsx subida/enviar_para_subida_manual.ts <ruta-video> <tema> <horario> <caption>
 * Env: NTFY_TOPIC (existente), GITHUB_SERVER_URL/GITHUB_REPOSITORY/
 *      GITHUB_RUN_ID (los pone GitHub Actions solo, no hace falta setearlos)
 */
import {basename} from 'path';

export function construirLinkDelRun(): string {
  const servidor = process.env.GITHUB_SERVER_URL;
  const repo = process.env.GITHUB_REPOSITORY;
  const runId = process.env.GITHUB_RUN_ID;
  if (!servidor || !repo || !runId) {
    throw new Error(
      'Faltan GITHUB_SERVER_URL/GITHUB_REPOSITORY/GITHUB_RUN_ID -- este script está pensado para correr ' +
      'dentro de un workflow de GitHub Actions, donde estas variables las pone GitHub solo.'
    );
  }
  return `${servidor}/${repo}/actions/runs/${runId}`;
}

/**
 * `tema` y `horario` van SEPARADOS del resto del cuerpo, no metidos
 * dentro del caption -- decisión 2026-09-14, a pedido del operador: un
 * aviso que solo dice "tenés un video" sin decir DE QUÉ es ni CUÁNDO
 * corresponde subirlo no genera confianza de que lo que se va a subir
 * es lo correcto en el momento correcto (mismo objetivo que la sección
 * "Buzón" de la Torre de Control, que muestra estos mismos dos datos).
 */
export async function enviarAvisoParaSubidaManual(
  topic: string,
  nombreVideo: string,
  tema: string,
  horario: string,
  caption: string
): Promise<void> {
  const link = construirLinkDelRun();
  const cuerpo =
    `Tema: ${tema}\n` +
    `Subilo: ${horario}\n\n` +
    `${caption}\n\n` +
    `Bajá el video acá (necesitás estar logueado en GitHub con tu cuenta): ${link}\n` +
    `Buscá el archivo adjunto ("video") al final de esa página, bajalo y compartilo directo a TikTok/YouTube.`;
  const resp = await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: {
      Title: `Video nuevo -- subilo a mano (${nombreVideo})`,
      Priority: 'high',
      Tags: 'movie_camera',
      Markdown: 'yes',
    },
    body: cuerpo,
  });
  if (!resp.ok) throw new Error(`ntfy.sh respondió HTTP ${resp.status}: ${await resp.text()}`);
}

async function main(): Promise<void> {
  const rutaVideo = process.argv[2];
  const tema = process.argv[3] ?? '(sin tema de prueba)';
  const horario = process.argv[4] ?? '(sin horario de prueba)';
  const caption = process.argv[5] ?? '(sin caption de prueba)';
  if (!rutaVideo) {
    console.error('Uso: npx tsx subida/enviar_para_subida_manual.ts <ruta-video> <tema> <horario> <caption>');
    process.exit(1);
  }
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    console.error('Falta NTFY_TOPIC en el entorno.');
    process.exit(1);
  }
  const nombreVideo = basename(rutaVideo);
  console.log('Mandando aviso con tema, horario y el link al artifact de este run...');
  await enviarAvisoParaSubidaManual(topic, nombreVideo, tema, horario, caption);
  console.log('Listo -- debería haber llegado 1 notificación con el tema, el horario y el link para bajar el video.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
