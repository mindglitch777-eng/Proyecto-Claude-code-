/**
 * CLI: cancela un post programado a futuro en Zernio (DELETE /v1/posts/:id).
 * Uso: npx tsx subida/cancelar_post.ts <postId>
 *
 * Pensado para reprogramar un carrusel/video ya creado con un
 * scheduledFor equivocado -- cancelar el viejo antes de crear uno
 * nuevo con el horario corregido, en vez de dejar dos posts
 * compitiendo (dos avisos de notificar-box para el mismo contenido).
 * No se toca ningun state/*.json -- el operador/la sesion que dispara
 * esto es responsable de anotar a mano que el postId quedo cancelado.
 */
import {eliminarPost} from './zernio';

async function main(): Promise<void> {
  const postId = process.argv[2];
  if (!postId) {
    console.error('Uso: npx tsx subida/cancelar_post.ts <postId>');
    process.exit(1);
  }

  console.log(`Cancelando post ${postId}...`);
  const resultado = await eliminarPost(postId);
  console.log(JSON.stringify(resultado, null, 2));
  console.log(`OK -- DELETE aceptado para ${postId}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
