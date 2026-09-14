/**
 * Entrega el contenido (video o carrusel) al operador para que lo
 * suba a mano vía TikTok Studio / YouTube Studio -- arquitectura
 * 2026-09-14: TikTok y YouTube se publican SIEMPRE a mano desde las
 * apps nativas (programación nativa: TikTok Studio hasta 10+ días,
 * YouTube Studio hasta ~1 año), no vía Zernio. Este script solo arma
 * y manda el paquete completo (archivo + tema + horario sugerido +
 * descripción + hashtags + música) para que el operador lo cargue.
 *
 * INTENTO 1 (descartado, evidencia real 2026-09-14): mandar el archivo
 * pegado directo a una notificación de ntfy.sh. Falló con HTTP 413
 * "attachment too large, or bandwidth limit reached" en un video de
 * 8.38MB -- bien debajo del límite documentado de 15MB por adjunto. La
 * causa real no es el tamaño: las máquinas de GitHub Actions comparten
 * IP entre miles de usuarios del servidor GRATIS de ntfy.sh, y el cupo
 * de ancho de banda "por visitante" de esa IP ya viene gastado por
 * tráfico ajeno -- no es confiable.
 *
 * SOLUCIÓN REAL (esta): el archivo se sube como artifact del propio
 * workflow de GitHub Actions (gratis, sin compartir cupo con nadie) y
 * ntfy.sh manda SOLO un mensaje de texto con el link a esa corrida --
 * los adjuntos de GitHub Actions requieren estar logueado en GitHub
 * para bajarlos, así que esto no es "publicar contenido públicamente":
 * hace falta la cuenta de GitHub del operador.
 *
 * Uso: npx tsx subida/enviar_para_subida_manual.ts <ruta-archivo> <tema> <horario> <caption> [video|carrusel]
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
 * dentro del caption -- un aviso que solo dice "tenés contenido" sin
 * decir DE QUÉ es ni CUÁNDO conviene subirlo no genera confianza de
 * que lo que se va a subir es lo correcto en el momento correcto.
 * `horario` es SUGERIDO (franja 18-23 ART para TikTok, ver CLAUDE.md)
 * -- la hora real la fija el operador al programar en la app nativa.
 */
export async function enviarAvisoParaSubidaManual(
  topic: string,
  nombreArchivo: string,
  tema: string,
  horario: string,
  caption: string,
  tipoContenido: 'video' | 'carrusel' = 'video'
): Promise<string> {
  const link = construirLinkDelRun();
  const instruccion =
    tipoContenido === 'carrusel'
      ? 'Bajá las imágenes del carrusel acá (necesitás estar logueado en GitHub con tu cuenta), en orden, y armá el post desde TikTok Studio:'
      : 'Bajá el video acá (necesitás estar logueado en GitHub con tu cuenta) y programalo desde TikTok Studio / YouTube Studio:';
  const cuerpo =
    `Tema: ${tema}\n` +
    `Horario sugerido: ${horario}\n\n` +
    `${caption}\n\n` +
    `${instruccion} ${link}\n` +
    `Buscá el archivo adjunto ("${tipoContenido}") al final de esa página.`;
  const headers: Record<string, string> = {
    Title: `${tipoContenido === 'carrusel' ? 'Carrusel' : 'Video'} listo -- subilo a mano (${nombreArchivo})`,
    Priority: 'high',
    Tags: tipoContenido === 'carrusel' ? 'frame_with_picture' : 'movie_camera',
    Markdown: 'yes',
  };
  const resp = await fetch(`https://ntfy.sh/${topic}`, {method: 'POST', headers, body: cuerpo});
  if (!resp.ok) throw new Error(`ntfy.sh respondió HTTP ${resp.status}: ${await resp.text()}`);
  return link;
}

async function main(): Promise<void> {
  const rutaArchivo = process.argv[2];
  const tema = process.argv[3] ?? '(sin tema de prueba)';
  const horario = process.argv[4] ?? '(sin horario de prueba)';
  const caption = process.argv[5] ?? '(sin caption de prueba)';
  const tipoContenido = (process.argv[6] as 'video' | 'carrusel') ?? 'video';
  if (!rutaArchivo) {
    console.error('Uso: npx tsx subida/enviar_para_subida_manual.ts <ruta-archivo> <tema> <horario> <caption> [video|carrusel]');
    process.exit(1);
  }
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    console.error('Falta NTFY_TOPIC en el entorno.');
    process.exit(1);
  }
  const nombreArchivo = basename(rutaArchivo);
  console.log('Mandando aviso, con tema, horario sugerido y el link al artifact de este run...');
  await enviarAvisoParaSubidaManual(topic, nombreArchivo, tema, horario, caption, tipoContenido);
  console.log('Listo -- el aviso quedó mandado.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
