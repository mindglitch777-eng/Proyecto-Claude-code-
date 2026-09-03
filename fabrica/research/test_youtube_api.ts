import {estadisticasDeVideos, buscarVideos, duracionIso8601ASegundos} from './youtube_api';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

// Parsing de duracion ISO 8601 -- logica nuestra, se puede probar sin red real.
check('PT4M13S -> 253 segundos', duracionIso8601ASegundos('PT4M13S') === 253);
check('PT1H2M3S -> 3723 segundos', duracionIso8601ASegundos('PT1H2M3S') === 3723);
check('PT45S -> 45 segundos', duracionIso8601ASegundos('PT45S') === 45);
check('PT0S -> 0 segundos', duracionIso8601ASegundos('PT0S') === 0);
check('formato invalido lanza', (() => {
  try {
    duracionIso8601ASegundos('no-es-iso8601');
    return false;
  } catch {
    return true;
  }
})());

// Sin API key -- nunca debe inventar datos, siempre lanzar un error claro.
async function testSinApiKey() {
  const originalEnv = process.env.FABRICA_YOUTUBE_API_KEY;
  delete process.env.FABRICA_YOUTUBE_API_KEY;
  let lanzo = false;
  try {
    await estadisticasDeVideos(['dQw4w9WgXcQ']);
  } catch {
    lanzo = true;
  }
  check('sin FABRICA_YOUTUBE_API_KEY, estadisticasDeVideos() lanza en vez de devolver datos inventados', lanzo);
  if (originalEnv) process.env.FABRICA_YOUTUBE_API_KEY = originalEnv;
}

// Parsing de una respuesta REAL de la API (forma documentada oficial
// de videos.list -- fixture fiel al formato real, no una fantasia;
// se simula fetch() en vez de llamar a la red real porque no hay una
// API key real disponible en este entorno de test).
async function testParseoRespuestaVideos() {
  const fixtureRespuestaVideosList = {
    items: [
      {
        id: 'dQw4w9WgXcQ',
        snippet: {title: 'Título de prueba', channelTitle: 'Canal de prueba', publishedAt: '2009-10-25T06:57:33Z'},
        statistics: {viewCount: '1500000000', likeCount: '17000000', commentCount: '3000000'},
        contentDetails: {duration: 'PT3M33S'},
      },
    ],
  };
  const originalFetch = global.fetch;
  // @ts-expect-error -- mock minimo, solo lo que usa el cliente real.
  global.fetch = async () => ({ok: true, json: async () => fixtureRespuestaVideosList});
  process.env.FABRICA_YOUTUBE_API_KEY = 'test-key-simulada';

  const videos = await estadisticasDeVideos(['dQw4w9WgXcQ']);
  check('parsea 1 video de la respuesta simulada', videos.length === 1);
  check('vistas se parsea como numero real, no string', videos[0].vistas === 1500000000 && typeof videos[0].vistas === 'number');
  check('duracion ISO se convierte a segundos reales', videos[0].duracionSeg === 213);
  check('titulo/canal se extraen del snippet', videos[0].titulo === 'Título de prueba' && videos[0].canal === 'Canal de prueba');

  global.fetch = originalFetch;
  delete process.env.FABRICA_YOUTUBE_API_KEY;
}

async function testParseoRespuestaBusqueda() {
  const fixtureRespuestaSearchList = {
    items: [{id: {videoId: 'abc123'}, snippet: {title: 'Resultado 1', channelTitle: 'Canal X'}}],
  };
  const originalFetch = global.fetch;
  // @ts-expect-error -- mock minimo.
  global.fetch = async () => ({ok: true, json: async () => fixtureRespuestaSearchList});

  const resultados = await buscarVideos('test', 5, 'test-key-simulada');
  check('busqueda parsea el videoId anidado correctamente (forma real de search.list)', resultados[0].id === 'abc123');
  check('busqueda parsea titulo/canal', resultados[0].titulo === 'Resultado 1' && resultados[0].canal === 'Canal X');

  global.fetch = originalFetch;
}

async function testErrorDeLaApi() {
  const originalFetch = global.fetch;
  // @ts-expect-error -- mock minimo, misma forma real de un error de Google.
  global.fetch = async () => ({ok: false, statusText: 'Bad Request', json: async () => ({error: {message: 'API key not valid.'}})});

  let lanzo = false;
  try {
    await estadisticasDeVideos(['x'], 'clave-invalida');
  } catch (e: any) {
    lanzo = e.message.includes('API key not valid');
  }
  check('un error real de la API se propaga con su mensaje real, no se traga', lanzo);

  global.fetch = originalFetch;
}

async function main() {
  await testSinApiKey();
  await testParseoRespuestaVideos();
  await testParseoRespuestaBusqueda();
  await testErrorDeLaApi();

  if (FALLOS.length) {
    console.error(`${FALLOS.length} FALLO(S):`);
    FALLOS.forEach((f) => console.error(' ' + f));
    process.exit(1);
  }
  console.log('Todos los tests del cliente de YouTube Data API (fabrica/research/youtube_api.ts) pasaron OK.');
}

main();
