/**
 * GUION DE PRUEBA V4 - ARSENAL COMPLETO, pasado por el orquestador
 * script-driven (renderizador_por_guion.ts).
 *
 * Adaptaciones reales al guion original del operador, documentadas
 * aca (no silenciosas):
 *
 *   1. GlitchShatter (escena 1) reemplazado por `subtitulos-grandes`
 *      (componente nuevo, R7-34) -- pedido explicito del operador tras
 *      ver el efecto original ("se ve bastante mal"). Requiere
 *      Caption[] REAL medido por forced-alignment sobre el audio ya
 *      generado de "hook" -- `capsDesdeAlineacion()` lee
 *      fabrica/voz/resultados_alineacion/hook.json (formato real de
 *      probar_alineacion.py) y tira error explicito si todavia no
 *      existe -- nunca inventa timestamps.
 *   2. MindMapConnect (escena 4) reemplazado por `diagrama`
 *      (dibujo/Diagrama.tsx, ya validado) -- pedido explicito del
 *      operador ("borralo, no lo rediseñes"; el reemplazo elegido por
 *      el operador es la gramatica de dibujo existente). Layout
 *      ESTRICTAMENTE lineal vertical (los 4 nodos en el mismo eje x,
 *      uno debajo del otro) -- pedido explicito de rondas anteriores
 *      ("no triangular"). Colores: todos los nodos con `acento: true`
 *      (PALETA.acento), nunca los defaults cian/magenta que motivaron
 *      la queja original sobre MindMapConnect.
 *   3. Dos escenas del guion original piden DOS efectos en la MISMA
 *      narracion (problema: TextRevealFire + ArquitecturaNeon; sistema:
 *      Diagrama + TextRevealFire) -- el contrato de
 *      renderizador_por_guion.ts es un componente por escena (mismo
 *      criterio ya aplicado en generar_prueba_efectos.ts). Se separo
 *      cada una en la escena con narracion completa + una escena
 *      SIN narracion propia inmediatamente despues con el segundo
 *      efecto, como enfasis visual.
 *   4. "NeonArchitecture" del guion original es `arquitectura-neon`
 *      (id/exportacion real del registro) -- mismo componente, nombre
 *      normalizado.
 *   5. SpotlightReveal (CTA) se pidio con `logoImage="[URL_LOGO]"` y
 *      `accountName="@tu_cuenta"` -- no existe cuenta real todavia
 *      (mismo criterio ya aplicado en prueba-efectos-nuevos y en el
 *      lote de 10 videos de venta). Se uso `text` en vez de `logoImage`,
 *      sin `accountName`.
 *   6. Transiciones: "Tap-to-Cut" es un COMPONENTE (categoria montaje),
 *      no un TipoGolpe -- se agrego como escena propia SIN narracion
 *      entre las unidades que lo pedian (mismo criterio que
 *      generar_prueba_efectos.ts). "Corte seco" y "Fundido a negro" SI
 *      son golpes reales de golpes.tsx -- se pasaron como
 *      `transicionSalida` explicito.
 *   7. Los valores de `intensidad` (0-10) no vienen del guion original
 *      -- criterio propio siguiendo la escalada narrativa que el guion
 *      SI describe (hook fuerte, problema medio, revelacion de la
 *      solucion, prueba fuerte, reward alto, cierre calmo).
 */
import path from 'node:path';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';

// Espejo minimo de DatosDiagrama (remotion-spike/src/dibujo/Diagrama.tsx)
// -- no se importa el tipo real porque ese archivo es .tsx y el
// tsconfig de fabrica/ no tiene --jsx configurado (proyectos separados
// a proposito, ver fabrica/tsconfig.json). `props` de EscenaGuion es
// Record<string, unknown> de todas formas, asi que esto es solo para
// que este generador tenga chequeo de tipos propio al escribirlo.
type NodoDiagrama = {fig: string; x: number; y: number; tam: number; rotulo?: string; t: number; acento?: boolean};
type FlechaDiagrama = {de: number; a: number; t: number; acento?: boolean};
type DatosDiagrama = {nodos: NodoDiagrama[]; flechas?: FlechaDiagrama[]};

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'guion-v4';

type PalabraAlineada = {palabra: string; inicio: number; fin: number};
type ResultadoAlineacion = {palabras_con_timestamp: PalabraAlineada[]};
type Caption = {text: string; startMs: number; endMs: number; timestampMs: number | null; confidence: number | null};

/** Lee el resultado REAL de forced-alignment (probar_alineacion.py,
 * corrido en GitHub Actions) y lo convierte a Caption[] de
 * @remotion/captions -- nunca inventa un timestamp si el archivo no
 * existe todavia. */
function capsDesdeAlineacion(idEscena: string): Caption[] {
  const ruta = path.join(RAIZ, 'fabrica/voz/resultados_alineacion', `${idEscena}.json`);
  if (!existsSync(ruta)) {
    throw new Error(
      `generar_guion_v4: falta el forced-alignment real de "${idEscena}" en ${ruta}. ` +
      `Correr probar-alineacion-faster-whisper.yml (archivo_audio="audio_guion_v4/${idEscena}.wav") primero.`
    );
  }
  const resultado: ResultadoAlineacion = JSON.parse(readFileSync(ruta, 'utf-8'));
  return resultado.palabras_con_timestamp.map((p) => ({
    text: p.palabra,
    startMs: Math.round(p.inicio * 1000),
    endMs: Math.round(p.fin * 1000),
    timestampMs: null,
    confidence: null,
  }));
}

const diagramaSistema: DatosDiagrama = {
  nodos: [
    {fig: 'foco', x: 0.5, y: 0.28, tam: 150, rotulo: 'IDEA', t: 0, acento: true},
    {fig: 'documento', x: 0.5, y: 0.44, tam: 150, rotulo: 'PRODUCTO', t: 0.9, acento: true},
    {fig: 'telefono', x: 0.5, y: 0.6, tam: 150, rotulo: 'CONTENIDO', t: 1.8, acento: true},
    {fig: 'billete', x: 0.5, y: 0.76, tam: 150, rotulo: 'VENTA', t: 2.6, acento: true},
  ],
  flechas: [
    {de: 0, a: 1, t: 1.0, acento: true},
    {de: 1, a: 2, t: 1.9, acento: true},
    {de: 2, a: 3, t: 2.8, acento: true},
  ],
};

const escenas: EscenaGuion[] = [
  {
    id: 'hook',
    textoVoz: 'El 90% de la gente usa la inteligencia artificial mal. Y te está costando caro.',
    componenteId: 'subtitulos-grandes',
    props: {captions: capsDesdeAlineacion('hook')},
    intensidad: 9,
    esPrimera: true,
  },
  {
    id: 'transicion_1',
    textoVoz: '',
    componenteId: 'tap-to-cut',
    props: {},
    intensidad: 6,
  },
  {
    id: 'problema',
    textoVoz: 'Mientras vos usas ChatGPT para hacer poemas, otros están construyendo imperios digitales.',
    componenteId: 'text-reveal-fire',
    props: {text: 'POEMAS', fireColor: '#FF0044', textColor: '#F6F6F4'},
    intensidad: 6,
  },
  {
    id: 'problema_efecto',
    textoVoz: '',
    componenteId: 'arquitectura-neon',
    props: {text: 'IMPERIOS DIGITALES', mainColor: '#FF4E24', sparkColor: '#FFD700'},
    intensidad: 7,
    transicionSalida: {tipo: 'corte'}, // "corte seco (0.3s)", pedido explicito del guion
  },
  {
    id: 'transicion_2',
    textoVoz: '',
    componenteId: 'tap-to-cut',
    props: {},
    intensidad: 6,
  },
  {
    id: 'comparacion',
    textoVoz: 'La diferencia no es la herramienta. Es el sistema.',
    componenteId: 'bar-brawl',
    props: {labelA: 'HERRAMIENTAS', labelB: 'SISTEMA', winner: 'B', colorA: '#FF0044', colorB: '#FF4E24'},
    intensidad: 6,
  },
  {
    id: 'transicion_3',
    textoVoz: '',
    componenteId: 'tap-to-cut',
    props: {},
    intensidad: 6,
  },
  {
    id: 'sistema',
    textoVoz: 'Idea, Producto, Contenido, Venta. Conectá esos cuatro puntos y la IA hace el resto.',
    componenteId: 'diagrama',
    props: {d: diagramaSistema},
    intensidad: 5,
  },
  {
    id: 'sistema_enfasis',
    textoVoz: '',
    componenteId: 'text-reveal-fire',
    props: {text: 'SISTEMA', fireColor: '#FF4E24', textColor: '#F6F6F4'},
    intensidad: 6,
    transicionSalida: {tipo: 'corte'}, // "corte seco (0.3s)", pedido explicito del guion
  },
  {
    id: 'prueba',
    textoVoz: 'Gente común, sin experiencia, pasó de 0 a 5.000 dólares en 60 días. Este es el antes y el después.',
    componenteId: 'split-screen',
    props: {beforeText: '$0', afterText: '$5.000', beforeColor: '#FF0044', afterColor: '#00FF88'},
    intensidad: 7,
  },
  {
    id: 'transicion_4',
    textoVoz: '',
    componenteId: 'tap-to-cut',
    props: {},
    intensidad: 6,
  },
  {
    id: 'reward',
    textoVoz: 'Y cuando el sistema funciona, la plata empieza a llegar sola.',
    componenteId: 'gold-rush',
    props: {achievementText: 'PLATA LLEGA SOLA', goldColor: '#FFD700', coinCount: 100},
    intensidad: 7,
    transicionSalida: {tipo: 'fundido'}, // "fundido a negro de 0.5s", pedido explicito del guion
  },
  {
    id: 'cta',
    textoVoz: 'Seguime. Esta semana te muestro cómo construir el tuyo paso a paso.',
    componenteId: 'spotlight-reveal',
    props: {text: 'SEGUIME', spotColor: '#FF4E24'},
    intensidad: 4,
    esCierre: true,
    transicionSalida: {tipo: 'fundido'}, // "fundido a negro final", pedido explicito del guion
  },
];

function main() {
  const resultado = renderizarPorGuion(ID_VIDEO, escenas, {
    audioOrigenDir: 'capturas_voz/audio_guion_v4',
    carpetaPublica: 'fabrica_guion_v4',
  }, RAIZ);

  const destino = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge', `${ID_VIDEO}.json`);
  writeFileSync(destino, JSON.stringify(resultado.arbol, null, 2));

  console.log(`Escrito: ${destino}`);
  console.log(`Duracion total: ${resultado.arbol.duracionTotalSeg.toFixed(2)}s`);
  console.log('Resumen por escena:');
  for (const u of resultado.resumen) {
    console.log(
      `  ${u.id.padEnd(20)} componente=${u.componenteId.padEnd(18)} golpe=${u.golpe}` +
      `${u.golpeExplicito ? ' (explicito)' : ''} intencion=${u.intencion} energia=${u.energia}` +
      `${u.patronRetencionId ? ` patron=${u.patronRetencionId}` : ''}`
    );
  }
  console.log('\nMapa de retencion:', resultado.arbol.analisisRetencion?.mapa.map((p) => `${p.unidadId}=${p.fase}${p.esClimax ? '(climax)' : ''}`).join(' -> '));
  if (resultado.arbol.analisisRetencion?.alertas.length) {
    console.log('\nAlertas del Director de Retencion:');
    for (const a of resultado.arbol.analisisRetencion.alertas) console.log(`  - ${a.descripcion}`);
  }
}

main();
