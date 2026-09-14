/**
 * CLI de una sola vez: profundiza el diagnóstico del bug de presign de
 * Zernio (ver comentario de cabecera de zernio.ts). Hasta ahora solo se
 * había probado que el PUT a `uploadUrl` devuelve 200 y que el POST
 * /v1/posts subsiguiente falla con `missingFiles:1` -- pero nunca se
 * había comprobado el paso del medio: ¿el objeto subido se puede LEER
 * de vuelta con un GET simple? Si ni siquiera nosotros podemos leerlo,
 * es evidencia dura de que el objeto quedó en un bucket privado que
 * Zernio tampoco puede leer -- explicación real del `missingFiles`, no
 * una entre varias hipótesis más.
 *
 * Esto NO llama a crearPost() ni sube nada a una cuenta real -- solo
 * hace presign + PUT + dos GET de verificación (uno a la URL derivada
 * sin firma, otro a la uploadUrl completa con firma). Cero costo, cero
 * publicación, cero contacto con terceros.
 *
 * Uso: npx tsx subida/probar_lectura_presign.ts <ruta-al-video>
 * Env: ZERNIO_API_KEY (existente)
 */
import {readFileSync, statSync} from 'fs';
import {basename} from 'path';

const BASE = 'https://zernio.com/api/v1';

function requerirApiKey(): string {
  const apiKey = process.env.ZERNIO_API_KEY;
  if (!apiKey) {
    console.error('Falta ZERNIO_API_KEY en el entorno.');
    process.exit(1);
  }
  return apiKey;
}

async function reportarGet(etiqueta: string, url: string): Promise<void> {
  try {
    const resp = await fetch(url, {method: 'GET'});
    const contentType = resp.headers.get('content-type');
    const contentLength = resp.headers.get('content-length');
    console.log(`  ${etiqueta}: HTTP ${resp.status} -- content-type=${contentType} content-length=${contentLength}`);
    if (!resp.ok) {
      const textoError = await resp.text();
      console.log(`    body (primeros 300 chars): ${textoError.slice(0, 300)}`);
    }
  } catch (error) {
    console.log(`  ${etiqueta}: ERROR de red -- ${(error as Error).message}`);
  }
}

async function main(): Promise<void> {
  const ruta = process.argv[2];
  if (!ruta) {
    console.error('Uso: npx tsx subida/probar_lectura_presign.ts <ruta-al-video>');
    process.exit(1);
  }
  const apiKey = requerirApiKey();
  const nombreArchivo = basename(ruta);
  const tamano = statSync(ruta).size;
  console.log(`Archivo: ${ruta} (${(tamano / 1024 / 1024).toFixed(2)}MB)`);

  console.log('\n1) Pidiendo presign...');
  const respPresign = await fetch(`${BASE}/media/presign`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({filename: nombreArchivo, contentType: 'video/mp4'}),
  });
  if (!respPresign.ok) {
    console.error(`media/presign HTTP ${respPresign.status}: ${await respPresign.text()}`);
    process.exit(1);
  }
  const cuerpoPresign = (await respPresign.json()) as {uploadUrl: string; fileUrl?: string};
  console.log(`   uploadUrl recibida (${cuerpoPresign.uploadUrl.length} chars). fileUrl en la respuesta: ${cuerpoPresign.fileUrl ?? '(ninguna, como siempre)'}`);
  const uploadUrl = cuerpoPresign.uploadUrl;
  const urlSinFirma = uploadUrl.split('?')[0];

  console.log('\n2) Subiendo el archivo real con PUT...');
  const buffer = readFileSync(ruta);
  const respPut = await fetch(uploadUrl, {method: 'PUT', headers: {'Content-Type': 'video/mp4'}, body: buffer});
  console.log(`   PUT -> HTTP ${respPut.status}`);
  if (!respPut.ok) {
    console.error(`   PUT falló: ${await respPut.text()}`);
    process.exit(1);
  }

  console.log('\n3) Verificando si el objeto se puede LEER de vuelta (esto nunca se había probado):');
  await reportarGet('GET a la URL SIN firma (la que usamos como fileUrl derivada)', urlSinFirma);
  await reportarGet('GET a la uploadUrl COMPLETA (con la firma del PUT)', uploadUrl);

  console.log('\nConclusión: si ambos GET fallan (403/404), el objeto quedó en un bucket privado que ni nosotros');
  console.log('ni Zernio pueden leer con esa URL -- es la causa real, comprobada, del "missingFiles":1, no una');
  console.log('hipótesis más. Si alguno de los dos devuelve 200 con el video, el problema está en otro lado');
  console.log('(Zernio no logra resolver esa URL desde su propio backend al crear el post).');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
