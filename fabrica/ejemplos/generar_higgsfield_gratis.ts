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
 * v2 (2026-09-20, mismo día): reescritura de fondo tras feedback
 * directo del operador sobre la v1 ("súper aburrida... sin sonido y
 * sin colores fuertes... las letras apenas se leen... no cuenta una
 * historia o una utilidad"). Cambios reales, no cosméticos:
 *   - Se agrega un bloque nuevo de UTILIDAD real (3 pasos concretos
 *     para aprovechar la promo) -- la pieza deja de ser solo "noticia
 *     que sabés" y pasa a ser "algo que podés hacer hoy". Nueva frase
 *     de voz real, TTS regenerado (no reciclado).
 *   - musicaFondo real (fabrica/musica/biblioteca.json, CC0, $0):
 *     'tension-alarmante' (126 BPM, mood tenso/urgente) -- elegida a
 *     mano por mood/BPM en vez de correr resolver_musica.py, porque
 *     esta pieza es un solo bloque (no pasa por DirectorAudio con
 *     multiples unidades) y el mood "noticia urgente con ventana de
 *     tiempo limitada" ya es un match directo y verificable con el
 *     catalogo real.
 *   - SFX reales (assets/sfx/, ya sintetizados, sin licencia) en los
 *     golpes clave del componente v2 -- ver NoticiaIA.tsx.
 *
 * Deliberadamente SIN CTA a la comunidad exclusiva: la estructura de
 * privilegios/precio todavía no está definida ni lanzada (ver
 * fabrica/ESTADO.md, discusión en curso) -- el cierre es autocontenido,
 * resuelve la curiosidad abierta en el hook + da una utilidad real.
 *
 * Componente: `noticia-ia` v2 (agresivo/NoticiaIA.tsx).
 */
import path from 'node:path';
import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
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
      + 'El dieciséis de septiembre abrió el acceso al público, con crédito gratis para atraer usuarios nuevos. '
      + 'Así lo podés probar ahora: entrás a Higgsfield, creás tu cuenta, y usás el crédito gratis antes de que se acabe. '
      + 'Ojo: esto no es el plan gratis de siempre, que tiene marca de agua y pocos créditos por día. '
      + 'Es la ventana de lanzamiento, y se cierra pronto.',
    componenteId: 'noticia-ia',
    props: {
      alertaEtiqueta: 'ALERTA IA',
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
      utilidadTitulo: 'Así lo probás hoy',
      utilidadPasos: ['Entrás a Higgsfield', 'Creás tu cuenta', 'Usás el crédito gratis antes de que se acabe'],
      cierre: 'Ojo: esto no es el plan gratis de siempre -tiene marca de agua y pocos créditos-. Es la ventana de lanzamiento, y se cierra pronto.',
      // PLACEHOLDER -- se recalculan con silencedetect real sobre el
      // audio nuevo (noti1-todo.wav v2) antes de la version final.
      t: {
        hookIntro: 0.3,
        hookMedio: 2.7,
        hookImpacto: 2.95,
        aclaracion: 3.94,
        hechosAparece: 4.9,
        lineaSigue: 8.5,
        resultadoCountDesde: 7.9,
        resultadoCountDuracion: 1.3,
        resultadoDetalle: 9.4,
        verificacion: 11.2,
        utilidadAparece: 14.9,
        utilidadPaso1: 15.1,
        utilidadPaso2: 16.5,
        utilidadPaso3: 17.6,
        cierre: 20.5,
      },
    },
    intensidad: 8,
    esPrimera: true,
    esCierre: true,
  },
];

function main() {
  const resultado = renderizarPorGuion(ID_VIDEO, escenas, {
    audioOrigenDir: 'capturas_voz/audio_pilotos',
    carpetaPublica: 'fabrica_higgsfield_gratis',
  }, RAIZ);

  // musicaFondo real: 'tension-alarmante' (126 BPM, mood tenso/urgente,
  // CC0 -- fabrica/musica/biblioteca.json), copiada a public/musica/
  // como ya hace generar_demo_07.ts para el resto de la fabrica.
  const origenMusica = path.join(RAIZ, 'fabrica/musica/biblioteca/tension-alarmante.mp3');
  const dirPublicoMusica = path.join(RAIZ, 'remotion-spike/public/musica');
  const destinoMusica = path.join(dirPublicoMusica, 'tension-alarmante.mp3');
  mkdirSync(dirPublicoMusica, {recursive: true});
  if (!existsSync(destinoMusica)) copyFileSync(origenMusica, destinoMusica);
  (resultado.arbol as typeof resultado.arbol & {musicaFondo?: {archivo: string; volumen: number}}).musicaFondo = {
    archivo: 'musica/tension-alarmante.mp3',
    volumen: 0.16,
  };

  const destino = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge', `${ID_VIDEO}.json`);
  writeFileSync(destino, JSON.stringify(resultado.arbol, null, 2));

  console.log(`Escrito: ${destino}`);
  console.log(`Duracion total: ${resultado.arbol.duracionTotalSeg.toFixed(2)}s`);
  for (const u of resultado.resumen) {
    console.log(`  ${u.id.padEnd(20)} componente=${u.componenteId.padEnd(14)} golpe=${u.golpe}${u.golpeExplicito ? ' (explicito)' : ''}`);
  }
}

main();
