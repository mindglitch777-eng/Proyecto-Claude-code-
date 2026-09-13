/**
 * CLI de una sola vez: vuelve a probar el flujo de /v1/media/presign +
 * PUT directo (subirArchivo() de zernio.ts) con un video real >4MB, para
 * ver si Zernio arregló de su lado el bug real documentado en el
 * comentario de cabecera de zernio.ts y en fabrica/ESTADO.md (2026-09-10):
 * el presign nunca devolvía `fileUrl`, solo `uploadUrl`, y el POST
 * /v1/posts subsiguiente siempre fallaba con `missingFiles:1`.
 *
 * Esto SOLO prueba presign+PUT (subirArchivo) -- no llama a crearPost(),
 * a propósito: eso programaría un post real de verdad, y esta prueba es
 * solo para ver si el paso de subida en sí ya funciona. Si esto pasa,
 * el siguiente paso (probar crearPost real) necesita confirmación
 * explícita del operador antes de disparar una publicación de verdad.
 *
 * Uso: npx tsx subida/probar_presign.ts <ruta-al-video>
 * Env: ZERNIO_API_KEY (existente)
 */
import {subirArchivo} from './zernio';

async function main(): Promise<void> {
  const ruta = process.argv[2];
  if (!ruta) {
    console.error('Uso: npx tsx subida/probar_presign.ts <ruta-al-video>');
    process.exit(1);
  }
  console.log(`Probando presign+PUT con ${ruta}...`);
  try {
    const resultado = await subirArchivo(ruta);
    console.log('✅ subirArchivo() devolvió una URL sin tirar error:');
    console.log(resultado);
    const tieneQuery = resultado.includes('?');
    console.log(
      tieneQuery
        ? 'OJO: la URL devuelta todavía tiene query de firma (?...) -- puede ser la uploadUrl completa como fallback, no necesariamente un fileUrl real nuevo. Ver el body crudo abajo.'
        : 'La URL no tiene query de firma -- podría ser un fileUrl real nuevo.'
    );
  } catch (error) {
    console.error('❌ Sigue fallando:', (error as Error).message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
