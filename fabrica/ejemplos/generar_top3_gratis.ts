/**
 * "Top 3 gratis" -- angulo de ranking honesto pedido explicitamente por
 * el operador (2026-09-21) tras feedback directo de que las piezas de
 * noticia suelta (noticia-ia/higgsfield-gratis) no generaban curiosidad
 * ni agresividad reales: "no estamos creando ningun guion que
 * verdaderamente genere lo que necesitamos ni la curiosidad ni la
 * agresividad ni el fomo".
 *
 * Test de angulo comercial (CLAUDE.md) aplicado antes de escribir esto:
 *   1. Le importa a cualquiera que este viendo el hype de herramientas
 *      de IA gratis sin conocer nada de la fabrica.
 *   2. El espectador se lleva una lista accionable y gratis (3
 *      herramientas reales que sirven), no un dato sobre nosotros.
 *   3. Las apuestas son del espectador: su propio tiempo perdido
 *      probando herramientas que no sirven.
 *   4. Patrones de fabrica/hooks/catalogo.ts: 'resultado-primero'
 *      (el golpe "te estan mintiendo" va ANTES de la explicacion) +
 *      'expectativa-violada' (contradice el hype de "todo gratis de IA
 *      sirve") + 'loop-abierto' (cuales son las 3, resuelto recien con
 *      los nombres).
 *   5. Honestidad no negociable: el cierre aclara que nada de esto hace
 *      rico de un dia para el otro.
 *
 * Los 9 descartes y los 3 ganadores son veredictos REALES de la
 * investigacion de esta sesion (fabrica/skills/INVESTIGACION_HERRAMIENTAS.md,
 * items 17/18) mas verificacion puntual por WebSearch de las 3 cifras
 * ganadoras (50 creditos/dia de Flow, minutos de GPU gratis de
 * Hugging Face Spaces+ZeroGPU, NotebookLM gratis). Nada inventado.
 *
 * Guion revisado EN VIVO con el operador (2026-09-21) antes de generar
 * la voz definitiva: gancho reescrito para pegar primero (resultado
 * primero: "9 de cada 12... te estan mintiendo" en vez de enumerar),
 * menos tecnicismos ("GPU"/"codigo abierto" -> "el poder de una
 * computadora carisima"), CTA de orden a pregunta directa.
 *
 * Logos reales (Regla de logos reales, CLAUDE.md 2026-09-21): corrida
 * real de descargar_logos_lote.py sobre las 12 marcas -- 3 encontradas
 * con ficha confiable en Wikidata (Hugging Face, NotebookLM, Zhipu AI),
 * 9 sin ficha todavia (la mayoria son productos de Google Labs
 * demasiado nuevos) -- esas quedan con texto solo, nunca un logo
 * inventado. Ver assets/logos/RESUMEN.md para el detalle real.
 *
 * Componente: `top3-gratis` (agresivo/Top3Gratis.tsx) -- primer uso en
 * produccion de @remotion/gsap real (pop elastico del montaje de
 * descarte y de las 3 tarjetas ganadoras).
 */
import path from 'node:path';
import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';
import type {Ganador, Rechazado} from '../../remotion-spike/src/agresivo/Top3Gratis';

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'top3-gratis';

// -- Logos reales: copia el que encontro descargar_logos_lote.py a
// public/, undefined si no hay archivo real (nunca un logo inventado).
function logoPublico(slug: string): string | undefined {
  const candidatos = ['png', 'svg', 'jpg', 'jpeg'];
  for (const ext of candidatos) {
    const origen = path.join(RAIZ, 'assets/logos', slug, `logo.${ext}`);
    if (existsSync(origen)) {
      const destinoDir = path.join(RAIZ, 'remotion-spike/public/logos', slug);
      mkdirSync(destinoDir, {recursive: true});
      const destino = path.join(destinoDir, `logo.${ext}`);
      copyFileSync(origen, destino);
      return `logos/${slug}/logo.${ext}`;
    }
  }
  return undefined;
}

const rechazados: Rechazado[] = [
  {nombre: 'Google Stitch', logo: logoPublico('stitch-google')},
  {nombre: 'GLM (Zhipu AI)', logo: logoPublico('glm-zhipu')},
  {nombre: 'n8n', logo: logoPublico('n8n')},
  {nombre: 'Manus', logo: logoPublico('manus-ai')},
  {nombre: 'Google Lyria', logo: logoPublico('lyria-google')},
  {nombre: 'Google Opal', logo: logoPublico('opal-google')},
  {nombre: 'Google Pomelli', logo: logoPublico('pomelli-google')},
  {nombre: 'Producer AI', logo: logoPublico('producer-ai')},
  {nombre: 'Google MixBoard', logo: logoPublico('mixboard-google')},
];

const ganadores: [Ganador, Ganador, Ganador] = [
  {
    nombre: 'Google Flow',
    dato: '50 videos gratis por día',
    detalle: 'Imágenes con Nano Banana: gratis, sin límite.',
    logo: logoPublico('google-flow'),
  },
  {
    nombre: 'Hugging Face',
    dato: 'Te presta una compu carísima',
    detalle: 'Gratis, directo desde tu navegador.',
    logo: logoPublico('hugging-face'),
  },
  {
    nombre: 'NotebookLM',
    dato: 'Organiza y te lee tu info',
    detalle: 'Gratis para siempre.',
    logo: logoPublico('notebooklm'),
  },
];

const escenas: EscenaGuion[] = [
  {
    id: 'top3-todo',
    textoVoz:
      'Nueve de cada doce herramientas de inteligencia artificial gratis te están mintiendo. '
      + 'Las probé todas. Solo tres sirven de verdad. '
      + 'Google Flow te regala cincuenta videos por día, y las imágenes con Nano Banana son gratis, sin límite. '
      + 'Hugging Face te presta gratis el poder de una computadora carísima, directo desde tu navegador. '
      + 'NotebookLM organiza toda tu información y te la lee en voz alta, gratis para siempre. '
      + 'Nada de esto te hace rico de un día para el otro. Pero es real, y lo podés probar hoy. '
      + '¿Querés ser parte de una comunidad sobre inteligencia artificial? Los primeros veinte lugares son gratis.',
    componenteId: 'top3-gratis',
    props: {
      hookIntro: 'Nueve de cada doce herramientas de inteligencia artificial gratis',
      hookImpacto: 'TE ESTÁN MINTIENDO.',
      aclaracion: 'Las probé todas.',
      rechazados,
      transicion: 'SOLO 3 SIRVEN DE VERDAD',
      ganadores,
      cierre: 'Nada de esto te hace rico de un día para el otro. Pero es real, y lo podés probar hoy.',
      cta: '¿Querés ser parte de una comunidad sobre inteligencia artificial? Los primeros veinte lugares son gratis.',
      // Anclajes reales: silencedetect real sobre top3-todo.wav
      // (25.79s, umbral -30dB, min 0.12s) -- 9 huecos reales
      // detectados: (3.516,3.710) (4.453,4.612) (5.662,5.859)
      // (9.805,9.927) (10.373,10.584 -- pausa de coma DENTRO de la
      // frase de Hugging Face, no limite de oracion) (14.490,14.624)
      // (17.491,17.626 -- pausa de coma DENTRO de la frase de
      // NotebookLM) (18.420,18.554) (20.809,20.986). Mapeados a mano
      // contra las 10 oraciones del texto (conteo de caracteres +
      // limites reales de silencio, criterio de la skill
      // beat-sync-editing: la voz manda, nunca se inventa un
      // timestamp). Las ultimas 2 oraciones (cierre parte 2 / cta
      // parte 2) no cruzaron el umbral de silencio -- estimadas por
      // proporcion de caracteres sobre el tiempo real restante.
      t: {
        hookIntro: 0.05,
        hookImpacto: 2.65,
        aclaracion: 3.71,
        rechazadosDesde: 2.85,
        rechazadosDuracion: 2.6,
        transicion: 4.612,
        ganador1: 5.859,
        ganador2: 9.927,
        ganador3: 14.624,
        cierre: 18.554,
        cta: 21.9,
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

  // musicaFondo real: 'impacto-furia' (112.3 BPM, mood
  // intenso/dramatico/accion, intensidad 0.9, CC0 --
  // fabrica/musica/biblioteca.json) -- variedad real respecto a
  // tension-alarmante (ya usada 2 veces), y el mood mas agresivo del
  // catalogo calza con el pedido explicito del operador de "un
  // contenido mucho mas agresivo".
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
  console.log(`Logos reales encontrados: ${[...rechazados, ...ganadores].filter((x) => x.logo).map((x) => x.nombre).join(', ') || 'ninguno'}`);
  for (const u of resultado.resumen) {
    console.log(`  ${u.id.padEnd(20)} componente=${u.componenteId.padEnd(14)} golpe=${u.golpe}${u.golpeExplicito ? ' (explicito)' : ''}`);
  }
}

main();
