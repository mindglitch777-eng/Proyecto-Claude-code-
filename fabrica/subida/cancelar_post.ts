/**
 * CLI: cancela uno o varios posts programados a futuro en Zernio
 * (DELETE /v1/posts/:id). Uso: npx tsx subida/cancelar_post.ts <postId>[,<postId>...]
 * (acepta coma, espacio o salto de linea como separador).
 *
 * Pensado para reprogramar un carrusel/video ya creado con un
 * scheduledFor equivocado -- cancelar el viejo antes de crear uno
 * nuevo con el horario corregido, en vez de dejar dos posts
 * compitiendo (dos avisos de notificar-box para el mismo contenido).
 * Tambien sirve para vaciar de una el backlog completo de posts
 * programados en Zernio (ej: al abandonar Zernio para publicar). Sigue
 * de largo si un postId individual falla (ya cancelado, ya publicado,
 * etc.) en vez de cortar el resto del lote -- reporta un resumen final
 * de ok/fallidos. No se toca ningun state/*.json -- el operador/la
 * sesion que dispara esto es responsable de anotar a mano el resultado.
 */
import {eliminarPost} from './zernio';

async function main(): Promise<void> {
  const crudo = process.argv[2];
  if (!crudo) {
    console.error('Uso: npx tsx subida/cancelar_post.ts <postId>[,<postId>...]');
    process.exit(1);
  }
  const postIds = crudo.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  if (postIds.length === 0) {
    console.error('No se encontro ningun postId valido en el argumento.');
    process.exit(1);
  }

  const ok: string[] = [];
  const fallidos: {postId: string; error: string}[] = [];
  for (const postId of postIds) {
    console.log(`Cancelando post ${postId}...`);
    try {
      const resultado = await eliminarPost(postId);
      console.log(JSON.stringify(resultado, null, 2));
      console.log(`OK -- DELETE aceptado para ${postId}.`);
      ok.push(postId);
    } catch (error) {
      console.error(`FALLO ${postId}: ${(error as Error).message}`);
      fallidos.push({postId, error: (error as Error).message});
    }
  }

  console.log(`\n=== Resumen: ${ok.length}/${postIds.length} cancelados ok ===`);
  if (fallidos.length > 0) {
    console.log(`Fallidos (${fallidos.length}):`);
    for (const f of fallidos) console.log(`  - ${f.postId}: ${f.error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
