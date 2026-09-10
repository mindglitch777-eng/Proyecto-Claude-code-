/**
 * CLI de solo lectura: lista los posts recientes de Zernio (y sus logs
 * de publicacion por plataforma) para diagnosticar un fallo puntual --
 * por ejemplo, v05 publico bien en YouTube pero no en TikTok y el
 * codigo de subir_video.ts no distinguia el detalle por plataforma.
 * No sube ni publica nada.
 *
 * Uso: npx tsx subida/diagnosticar.ts
 */
import {listarPostsRecientes, obtenerLogsPost} from './zernio';

async function main(): Promise<void> {
  const posts = (await listarPostsRecientes(5)) as any;
  console.log('--- GET /v1/posts?limit=5 ---');
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
