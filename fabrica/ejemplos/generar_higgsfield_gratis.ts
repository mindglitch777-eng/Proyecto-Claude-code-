/**
 * Primera pieza del Pilar A ("tips fáciles"/noticias reales de IA en
 * tiempo real) -- ver debate de reposicionamiento en fabrica/ESTADO.md
 * (2026-09-20): tras decidir alejarse del lenguaje "gurú de IA que te
 * hace rico" hacia una posición de educación honesta, esta pieza cuenta
 * una noticia real ya verificada por WebSearch (no asumida):
 *
 *   - Higgsfield AI (generador de video hiperrealista con IA) cerró una
 *     ronda Serie B de 400 millones de USD liderada por DST Global.
 *   - Valuación resultante: más de 5.400 millones de USD.
 *   - Lanzó su acceso público el 16/09/2026, con una promo de crédito
 *     gratis por tiempo limitado para atraer usuarios nuevos.
 *
 * Test de ángulo comercial (CLAUDE.md) aplicado antes de escribir esto:
 *   1. Le importa a cualquiera que use o mire IA, sin contexto interno
 *      de la fábrica.
 *   2. El espectador se lleva FOMO real (ventana de lanzamiento) + un
 *      dato verificable y accionable.
 *   3. Las apuestas son del espectador: su propia oportunidad de probar
 *      la herramienta mientras dura la promo.
 *   4. Patrones de fabrica/hooks/catalogo.ts: 'cifra-inmediata' (GRATIS
 *      como golpe inicial) + 'expectativa-violada' (una IA cara,
 *      gratis) + 'loop-abierto' ("investigué por qué", resuelto en la
 *      tarjeta de hechos).
 *   5. Honestidad no negociable: NUNCA se dice "gratis para siempre" --
 *      el cierre aclara que el free tier permanente (marca de agua,
 *      pocos créditos/día) es distinto de esta promo de lanzamiento.
 *
 * Deliberadamente SIN CTA a la comunidad exclusiva: la estructura de
 * privilegios/precio todavía no está definida ni lanzada (ver
 * fabrica/ESTADO.md, discusión en curso) -- el cierre es autocontenido,
 * resuelve la curiosidad abierta en el hook.
 *
 * Componente: `noticia-ia` (agresivo/NoticiaIA.tsx) -- primer uso.
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'higgsfield-gratis';

const escenas: EscenaGuion[] = [
  {
    id: 'noti1-todo',
    textoVoz: 'Una inteligencia artificial que genera videos hiperrealistas se volvió gratis. '
      + 'Investigué por qué. '
      + 'Higgsfield acaba de recibir cuatrocientos millones de dólares de inversión. '
      + 'Hoy la empresa vale más de cinco mil cuatrocientos millones. '
      + 'El dieciséis de septiembre abrió el acceso al público, y regaló crédito gratis para atraer usuarios nuevos. '
      + 'Esto no es el plan gratis de siempre, que tiene marca de agua y pocos créditos por día. '
      + 'Es la ventana de lanzamiento, y no dura para siempre.',
    componenteId: 'noticia-ia',
    props: {
      hookIntro: 'Una IA que genera videos hiperrealistas',
      hookMedio: 'SE VOLVIÓ',
      hookImpacto: 'GRATIS.',
      aclaracion: 'Investigué por qué.',
      hechosTitulo: 'LO QUE PASÓ DE VERDAD',
      hechosLineas: [
        'Higgsfield recibió 400 millones de dólares de inversión.',
        'Hoy la empresa vale más de 5.400 millones.',
        'El 16 de septiembre abrió el acceso al público, con crédito gratis para atraer usuarios nuevos.',
      ],
      resultadoNumero: 5400,
      resultadoPrefijo: 'U$S ',
      resultadoDetalle: 'millones vale hoy Higgsfield',
      verificacion: 'Confirmado: ronda Serie B liderada por DST Global.',
      cierre: 'Esto no es el plan gratis de siempre -eso tiene marca de agua y pocos créditos-. Es la ventana de lanzamiento, y no dura para siempre.',
      // Anclajes provisorios (ritmo estimado ~2.4 palabras/seg,
      // igual que en las piezas anteriores) -- se recalculan con
      // ffmpeg silencedetect sobre el audio real antes de renderizar
      // la version final.
      t: {
        hookIntro: 0,
        hookMedio: 1.9,
        hookImpacto: 2.7,
        aclaracion: 4.0,
        hechosAparece: 5.7,
        lineaSigue: 12.5,
        resultadoCountDesde: 9.6,
        resultadoCountDuracion: 1.2,
        resultadoDetalle: 13.0,
        verificacion: 16.5,
        cierre: 19.0,
      },
    },
    intensidad: 7,
    esPrimera: true,
    esCierre: true,
  },
];

function main() {
  const resultado = renderizarPorGuion(ID_VIDEO, escenas, {
    audioOrigenDir: 'capturas_voz/audio_pilotos',
    carpetaPublica: 'fabrica_higgsfield_gratis',
  }, RAIZ);

  const destino = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge', `${ID_VIDEO}.json`);
  writeFileSync(destino, JSON.stringify(resultado.arbol, null, 2));

  console.log(`Escrito: ${destino}`);
  console.log(`Duracion total: ${resultado.arbol.duracionTotalSeg.toFixed(2)}s`);
  for (const u of resultado.resumen) {
    console.log(`  ${u.id.padEnd(20)} componente=${u.componenteId.padEnd(14)} golpe=${u.golpe}${u.golpeExplicito ? ' (explicito)' : ''}`);
  }
}

main();
