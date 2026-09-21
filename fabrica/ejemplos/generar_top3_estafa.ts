/**
 * "Top 3 gratis" v2 -- reescritura de fondo pedida por el operador tras
 * ver la v1 (angulo aprobado en fabrica/ejemplos/generar_top3_gratis.ts,
 * que queda documentado pero sin usar): "muy pequeño... sin palabra
 * interesante... usaste los mismos componentes que veniamos usando".
 *
 * Cambios reales sobre la v1:
 *   1. Gancho reescrito: "LA INTELIGENCIA ARTIFICIAL TE ESTAFA. Y te
 *      explico por que." -- mas directo/agresivo que "te estan
 *      mintiendo".
 *   2. Montaje de descarte con HUMO real (filtro SVG feTurbulence) +
 *      sello rojo "NO SIRVE" por herramienta (agresivo/rojo pedido
 *      explicitamente).
 *   3. Las 3 ganadoras pasan a "vidrieras" de pantalla completa: icono
 *      real de la app + nombre gigante + CAPTURA REAL de la pantalla de
 *      la herramienta (Playwright real via capturar_sitio_real.py, sin
 *      login), siguiendo el formato exacto de las capturas de Instagram
 *      de referencia que mando el operador -- no un dato en una tarjeta
 *      chica.
 *   4. Texto mas grande en todo el video.
 *
 * Honestidad real: NotebookLM (notebooklm.google.com) redirige directo
 * a un login de Google -- la captura de esa URL no sirve (solo muestra
 * el formulario de sign-in). Se cambio a labs.google/notebooklm (pagina
 * publica de marketing de la misma herramienta, sin login) -- ver
 * fabrica/ESTADO.md para el detalle. Si algun icono/captura no esta
 * disponible en el momento de generar el guion, la vidriera cae a un
 * placeholder honesto (inicial de la marca / "captura no disponible"),
 * nunca una imagen inventada.
 *
 * Componente: `top3-gratis` (agresivo/Top3Gratis.tsx, reescrito).
 */
import path from 'node:path';
import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';
import type {Rechazado, Vidriera} from '../../remotion-spike/src/agresivo/Top3Gratis';

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'top3-gratis';

// -- Copia el asset real (captura o icono) a public/ si existe, undefined
// si no -- nunca se inventa nada, mismo criterio que la Regla de logos reales.
function assetPublico(slug: string, archivo: 'captura' | 'icono'): string | undefined {
  const candidatos = archivo === 'captura' ? ['png'] : ['png', 'ico', 'svg', 'jpg'];
  for (const ext of candidatos) {
    const origen = path.join(RAIZ, 'assets/capturas_sitio', slug, `${archivo}.${ext}`);
    if (existsSync(origen)) {
      const destinoDir = path.join(RAIZ, 'remotion-spike/public/capturas_sitio', slug);
      mkdirSync(destinoDir, {recursive: true});
      const destino = path.join(destinoDir, `${archivo}.${ext}`);
      copyFileSync(origen, destino);
      return `capturas_sitio/${slug}/${archivo}.${ext}`;
    }
  }
  return undefined;
}

const rechazados: Rechazado[] = [
  {nombre: 'Google Stitch'},
  {nombre: 'GLM (Zhipu AI)'},
  {nombre: 'n8n'},
  {nombre: 'Manus'},
  {nombre: 'Google Lyria'},
  {nombre: 'Google Opal'},
  {nombre: 'Google Pomelli'},
  {nombre: 'Producer AI'},
  {nombre: 'Google MixBoard'},
];

const ganadores: [Vidriera, Vidriera, Vidriera] = [
  {
    nombre: 'Google Flow',
    dato: '50 videos gratis por día',
    detalle: 'Imágenes con Nano Banana: gratis, sin límite.',
    icono: assetPublico('google-flow', 'icono'),
    captura: assetPublico('google-flow', 'captura'),
  },
  {
    nombre: 'Hugging Face',
    dato: 'Te presta una compu carísima',
    detalle: 'Gratis, directo desde tu navegador.',
    icono: assetPublico('hugging-face', 'icono'),
    captura: assetPublico('hugging-face', 'captura'),
  },
  {
    nombre: 'NotebookLM',
    dato: 'Organiza y te lee tu info',
    detalle: 'Gratis para siempre.',
    icono: assetPublico('notebooklm', 'icono'),
    captura: assetPublico('notebooklm', 'captura'),
  },
];

const escenas: EscenaGuion[] = [
  {
    id: 'top3-estafa-todo',
    textoVoz:
      'La inteligencia artificial te estafa. Y te explico por qué. '
      + 'Probé doce herramientas que todos recomiendan gratis. Nueve son puro humo. Estas tres sí sirven de verdad. '
      + 'Google Flow te regala cincuenta videos por día, y las imágenes con Nano Banana son gratis, sin límite. '
      + 'Hugging Face te presta gratis el poder de una computadora carísima, directo desde tu navegador. '
      + 'NotebookLM organiza toda tu información y te la lee en voz alta, gratis para siempre. '
      + 'Nada de esto te hace rico de un día para el otro. Pero es real, y lo podés probar hoy. '
      + '¿Querés ser parte de una comunidad sobre inteligencia artificial? Los primeros veinte lugares son gratis.',
    componenteId: 'top3-gratis',
    props: {
      hookLinea1: 'LA INTELIGENCIA ARTIFICIAL',
      hookImpacto: 'TE ESTAFA.',
      aclaracion: 'Y te explico por qué.',
      introRechazo: 'Probé doce herramientas que todos recomiendan gratis.',
      rechazados,
      transicion: 'SOLO 3 SIRVEN DE VERDAD',
      ganadores,
      cierre: 'Nada de esto te hace rico de un día para el otro. Pero es real, y lo podés probar hoy.',
      cta: '¿Querés ser parte de una comunidad sobre inteligencia artificial? Los primeros veinte lugares son gratis.',
      // PLACEHOLDER -- se reemplaza por anclajes reales de ffmpeg
      // silencedetect sobre top3-estafa-todo.wav en cuanto la voz real
      // este lista (mismo criterio de todo el resto de la fabrica:
      // nunca se deja un timestamp inventado en el guion final).
      t: {
        hookLinea1: 0.05,
        hookImpacto: 2,
        aclaracion: 3,
        introRechazo: 4,
        rechazadosDesde: 5.5,
        transicion: 8,
        ganador1: 9,
        ganador2: 13,
        ganador3: 17,
        cierre: 21,
        cta: 24,
      },
    },
    intensidad: 9,
    esPrimera: true,
    esCierre: true,
  },
];

function main() {
  const resultado = renderizarPorGuion(ID_VIDEO, escenas, {
    audioOrigenDir: 'capturas_voz/audio_pilotos',
    carpetaPublica: 'fabrica_top3_gratis',
  }, RAIZ);

  const origenMusica = path.join(RAIZ, 'fabrica/musica/biblioteca/impacto-furia.mp3');
  const dirPublicoMusica = path.join(RAIZ, 'remotion-spike/public/musica');
  const destinoMusica = path.join(dirPublicoMusica, 'impacto-furia.mp3');
  mkdirSync(dirPublicoMusica, {recursive: true});
  if (!existsSync(destinoMusica)) copyFileSync(origenMusica, destinoMusica);
  (resultado.arbol as typeof resultado.arbol & {musicaFondo?: {archivo: string; volumen: number}}).musicaFondo = {
    archivo: 'musica/impacto-furia.mp3',
    volumen: 0.14,
  };

  const destino = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge', `${ID_VIDEO}.json`);
  writeFileSync(destino, JSON.stringify(resultado.arbol, null, 2));

  console.log(`Escrito: ${destino}`);
  console.log(`Duracion total: ${resultado.arbol.duracionTotalSeg.toFixed(2)}s`);
  console.log(`Capturas reales: ${ganadores.filter((g) => g.captura).map((g) => g.nombre).join(', ') || 'ninguna'}`);
  console.log(`Iconos reales: ${ganadores.filter((g) => g.icono).map((g) => g.nombre).join(', ') || 'ninguno'}`);
  for (const u of resultado.resumen) {
    console.log(`  ${u.id.padEnd(20)} componente=${u.componenteId.padEnd(14)} golpe=${u.golpe}${u.golpeExplicito ? ' (explicito)' : ''}`);
  }
}

main();
