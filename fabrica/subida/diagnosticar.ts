/**
 * CLI de solo lectura: lista los posts recientes de Zernio (y sus logs
 * de publicacion por plataforma) para diagnosticar un fallo puntual --
 * por ejemplo, v05 publico bien en YouTube pero no en TikTok y el
 * codigo de subir_video.ts no distinguia el detalle por plataforma.
 * No sube ni publica nada.
 *
 * Uso: npx tsx subida/diagnosticar.ts
 *      npx tsx subida/diagnosticar.ts <postId1,postId2,...>  -- salta el
 *      listado de recientes (paginado, solo trae 5 a la vez) y va directo
 *      a los logs de esos posts puntuales.
 */
import {listarPostsRecientes, obtenerLogsPost, obtenerPost, obtenerAnalytics} from './zernio';

async function main(): Promise<void> {
  const idsArg = process.argv[2];

  if (idsArg) {
    for (const id of idsArg.split(',').map((s) => s.trim()).filter(Boolean)) {
      console.log(`\n--- GET /v1/posts/${id} (estado actual) ---`);
      try {
        const post = await obtenerPost(id);
        console.log(JSON.stringify(post, null, 2));
      } catch (error) {
        console.error(`No se pudo obtener el post ${id}: ${(error as Error).message}`);
      }
      console.log(`\n--- GET /v1/posts/${id}/logs ---`);
      try {
        const logs = await obtenerLogsPost(id);
        console.log(JSON.stringify(logs, null, 2));
      } catch (error) {
        console.error(`No se pudieron obtener logs de ${id}: ${(error as Error).message}`);
      }
    }
    return;
  }

  console.log('--- GET /v1/analytics (probando si el plan gratuito lo incluye) ---');
  const analytics = await obtenerAnalytics();
  console.log(JSON.stringify(analytics, null, 2));

  const posts = (await listarPostsRecientes(5)) as any;
  console.log('\n--- GET /v1/posts?limit=5 ---');
  console.log(JSON.stringify(posts, null, 2));

  const lista: any[] = Array.isArray(posts) ? posts : posts?.data ?? posts?.posts ?? [];
  for (const post of lista) {
    const id = post?.id ?? post?.postId;
    if (!id) continue;
    console.log(`\n--- GET /v1/posts/${id}/logs ---`);
    try {
      const logs = await obtenerLogsPost(String(id));
      console.log(JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error(`No se pudieron obtener logs de ${id}: ${(error as Error).message}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
