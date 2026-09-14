/**
 * Netlify Function: marca un item de state/uploads.json como "subido"
 * cuando el operador aprieta el botón "Ya lo subí" en la Torre de
 * Control. Es la única pieza de todo el panel que necesita memoria real
 * -- una vez que el operador sube un video a mano por la app nativa de
 * TikTok/YouTube, nuestro sistema no tiene forma de enterarse solo (no
 * pasa por Zernio para nada), así que hace falta este único click.
 *
 * Por qué una Function y no el botón escribiendo directo a la API de
 * GitHub desde el navegador: un botón en una página estática no puede
 * guardar un token con permiso de escritura sin exponerlo a cualquiera
 * que mire el código fuente de la página. Esta Function corre del lado
 * del servidor de Netlify -- el token vive como variable de entorno,
 * nunca llega al navegador del operador ni de nadie más.
 *
 * Variables de entorno necesarias (el operador las configura a mano en
 * Netlify -- Site settings > Environment variables -- esto no se puede
 * hacer desde el código, es la única parte manual de todo esto):
 *   GITHUB_TOKEN          fine-grained PAT, alcance SOLO este repo,
 *                         permiso "Contents: Read and write", nada más.
 *   MARCAR_SUBIDO_SECRET  una palabra clave elegida por el operador. El
 *                         panel la manda en cada click para que no
 *                         cualquiera que encuentre la URL pública pueda
 *                         marcar videos como subidos sin permiso.
 *
 * Escribe en la rama `main` -- es la rama que Netlify tiene deployada,
 * así que `state/uploads.json` en `main` es la copia "viva" que lee y
 * muestra el panel. El resto del código de la fábrica sigue viviendo en
 * la rama de trabajo hasta que se mergea -- esto es solo para el dato
 * (estado de subida), no para código.
 */

const OWNER = 'mindglitch777-eng';
const REPO = 'Proyecto-Claude-code-';
const RAMA = 'main';
const RUTA_ARCHIVO = 'state/uploads.json';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {statusCode: 405, body: 'Method not allowed'};
  }

  const token = process.env.GITHUB_TOKEN;
  const secretoEsperado = process.env.MARCAR_SUBIDO_SECRET;
  if (!token || !secretoEsperado) {
    return {statusCode: 500, body: 'Falta configurar GITHUB_TOKEN o MARCAR_SUBIDO_SECRET en Netlify.'};
  }

  let cuerpo;
  try {
    cuerpo = JSON.parse(event.body || '{}');
  } catch {
    return {statusCode: 400, body: 'Body inválido, se esperaba JSON.'};
  }

  if (cuerpo.secret !== secretoEsperado) {
    return {statusCode: 401, body: 'Secreto incorrecto.'};
  }
  if (!cuerpo.id) {
    return {statusCode: 400, body: 'Falta "id".'};
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  };

  const respGet = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${RUTA_ARCHIVO}?ref=${RAMA}`,
    {headers}
  );
  if (!respGet.ok) {
    return {statusCode: 502, body: `No se pudo leer ${RUTA_ARCHIVO}: HTTP ${respGet.status}`};
  }
  const dataGet = await respGet.json();
  const contenidoActual = JSON.parse(Buffer.from(dataGet.content, 'base64').toString('utf-8'));
  const entradas = Array.isArray(contenidoActual) ? contenidoActual : [];

  const entrada = entradas.find((e) => e.id === cuerpo.id);
  if (!entrada) {
    return {statusCode: 404, body: `No se encontró la entrada "${cuerpo.id}" en ${RUTA_ARCHIVO}.`};
  }
  entrada.estado = 'subido';
  entrada.subidoEn = new Date().toISOString();

  const nuevoContenido = Buffer.from(JSON.stringify(entradas, null, 2) + '\n', 'utf-8').toString('base64');
  const respPut = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${RUTA_ARCHIVO}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `panel: marcar ${cuerpo.id} como subido`,
      content: nuevoContenido,
      sha: dataGet.sha,
      branch: RAMA,
    }),
  });
  if (!respPut.ok) {
    return {statusCode: 502, body: `No se pudo guardar el cambio: HTTP ${respPut.status} ${await respPut.text()}`};
  }

  return {statusCode: 200, body: JSON.stringify({ok: true, id: cuerpo.id, estado: 'subido'})};
};
