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
      // Anclajes reales: silencedetect real sobre noti1-todo.wav v2
      // (24.32s, umbral -30dB, min 0.12s) mapeado a mano a la
      // estructura de 8 oraciones del texto nuevo, y despues los
      // golpes puntuales (impacto del hook, aterrizaje del count-up,
      // pasos de utilidad) ajustados al frame ON-BEAT mas cercano de
      // la musica real (tension-alarmante, 126 BPM -> 0.4762s/beat),
      // criterio de la skill beat-sync-editing: la voz manda el
      // timing base, el golpe puntual se ajusta a la grilla (tolerancia
      // de unos pocos frames, igual que un offset de J-cut/L-cut).
      // Huecos reales detectados (ffmpeg silencedetect): (3.42,3.55)
      // (4.22,4.46) (7.18,7.39) (9.52,9.76) (13.75,14.02) (14.98,15.22)
      // (16.01,16.15) (18.51,18.78) (19.00,19.33) (22.41,22.65).
      t: {
        hookIntro: 0.05,
        hookMedio: 2.69,
        hookImpacto: 2.857, // snap: beat 6 (2.857s), real voz ~2.99s
        aclaracion: 3.55,
        hechosAparece: 4.46,
        lineaSigue: 7.39,
        resultadoCountDesde: 8.095, // snap: beat 17
        resultadoCountDuracion: 1.429, // aterriza en beat 20 (9.524s), rampa de 3 beats exactos
        resultadoDetalle: 9.6,
        verificacion: 10.476, // snap: beat 22
        utilidadAparece: 14.286, // snap: beat 30
        utilidadPaso1: 15.238, // snap: beat 32 ("entrás a Higgsfield")
        utilidadPaso2: 16.190, // snap: beat 34 ("creás tu cuenta")
        utilidadPaso3: 16.667, // snap: beat 35 ("usás el crédito gratis...")
        cierre: 19.33, // fase de resolve, sin golpe -- se sostiene hasta el final
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
