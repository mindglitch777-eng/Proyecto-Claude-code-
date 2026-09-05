/**
 * Guion de prueba de los efectos nuevos (carta tecnica de DeepSeek,
 * 2026-09-05) pasado por el orquestador script-driven
 * (renderizador_por_guion.ts) -- el primer guion real de punta a
 * punta que lo ejercita (antes solo tenia la prueba de humo de 2
 * escenas de test_renderizador_por_guion.ts).
 *
 * Adaptaciones reales al guion original, documentadas aca (no
 * silenciosas):
 *
 *   1. "Tap-to-Cut" se pidio como TRANSICION entre escenas, pero
 *      tap-to-cut es un COMPONENTE (categoria montaje, como
 *      pixel-burst), no un TipoGolpe -- se agrego como su propia
 *      escena breve SIN narracion entre las unidades que lo pedian
 *      (3 veces: despues del hook, despues del problema, antes de la
 *      prueba). Requirio el fix de esta misma sesion a
 *      renderizador_por_guion.ts (escenas con textoVoz='').
 *   2. "Corte seco" y "Fundido a negro final" SI son golpes reales de
 *      golpes.tsx -- se pasaron como `transicionSalida` explicito en
 *      la escena que corresponde (el golpe describe como se ENTRA a
 *      una unidad, no un efecto de salida separado; "fundido final"
 *      se mapeo como el golpe de entrada de la escena de cierre, que
 *      es la aproximacion mas honesta que permite la arquitectura
 *      actual -- no hay un concepto de "outro" separado del golpe de
 *      la ultima escena).
 *   3. La escena 2 del guion original pedia DOS efectos en la MISMA
 *      escena (KineticText y luego PunchIn) sobre una sola narracion
 *      -- el contrato de renderizador_por_guion.ts es un componente
 *      por escena. Se separo en "problema" (kinetic-text, con la
 *      narracion completa) + "problema_enfasis" (punch-in, SIN
 *      narracion propia, como golpe de enfasis visual inmediatamente
 *      despues) -- mismo efecto visual pedido, sin inventar una
 *      segunda linea de narracion que el guion no tenia.
 *   4. `SpotlightReveal` se pidio con `logoImage="[URL_LOGO]"` y
 *      `accountName="@tu_cuenta"` -- no existe cuenta real todavia
 *      (mismo criterio ya aplicado al lote de 10 videos de venta).
 *      Se uso `text` en vez de `logoImage`, sin `accountName`.
 *   5. Los valores de `intensidad` (0-10) no vienen del guion original
 *      (no los especifica) -- son criterio propio siguiendo la
 *      escalada narrativa que el guion SI describe (hook fuerte,
 *      problema medio, revelacion de la solucion, prueba fuerte,
 *      cierre calmo).
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'prueba-efectos-nuevos';

const escenas: EscenaGuion[] = [
  {
    id: 'hook',
    textoVoz: 'El 98% de las personas pierde dinero todos los días.',
    componenteId: 'kinetic-text',
    props: {lines: ['EL 98%', 'PIERDE PLATA'], impactColor: '#FF4E24'},
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
    textoVoz: 'Venden su tiempo, cuando deberían vender activos digitales.',
    componenteId: 'kinetic-text',
    props: {lines: ['TIEMPO vs', 'ACTIVOS DIGITALES'], impactColor: '#00FF88'},
    intensidad: 6,
  },
  {
    id: 'problema_enfasis',
    textoVoz: '',
    componenteId: 'punch-in',
    props: {text: 'ACTIVOS', scale: 1.8, color: '#00FF88'},
    intensidad: 7,
  },
  {
    id: 'transicion_2',
    textoVoz: '',
    componenteId: 'tap-to-cut',
    props: {},
    intensidad: 6,
  },
  {
    id: 'solucion',
    textoVoz: 'El sistema es simple: creás un producto digital una vez, y la IA lo vende por vos mientras dormís.',
    componenteId: 'mindmap-connect',
    props: {items: ['IDEA', 'PRODUCTO', 'VENTA'], lineColor: '#00BFFF', nodeGlow: '#0088FF'},
    intensidad: 5,
    transicionSalida: {tipo: 'corte'}, // "corte seco para variar el ritmo", pedido explicito del guion
  },
  {
    id: 'transicion_3',
    textoVoz: '',
    componenteId: 'tap-to-cut',
    props: {},
    intensidad: 6,
  },
  {
    id: 'prueba',
    textoVoz: 'Casos documentados: creadores pasaron de 0 a 5.000 dólares en 60 días.',
    componenteId: 'split-screen',
    props: {beforeText: '$0', afterText: '$5.000', beforeColor: '#FF0044', afterColor: '#00FF88'},
    intensidad: 7,
  },
  {
    id: 'cierre',
    textoVoz: 'Si querés saber cómo se hace, seguime. Esta semana te muestro el sistema paso a paso.',
    componenteId: 'spotlight-reveal',
    props: {text: 'SISTEMA DE INGRESOS PASIVOS CON IA', spotColor: '#FFD700'},
    intensidad: 4,
    esCierre: true,
    transicionSalida: {tipo: 'fundido'}, // "fundido a negro final", pedido explicito del guion
  },
];

function main() {
  const resultado = renderizarPorGuion(ID_VIDEO, escenas, {
    audioOrigenDir: 'capturas_voz/audio_prueba_efectos',
    carpetaPublica: 'fabrica_prueba_efectos',
  }, RAIZ);

  const destino = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge', `${ID_VIDEO}.json`);
  writeFileSync(destino, JSON.stringify(resultado.arbol, null, 2));

  console.log(`Escrito: ${destino}`);
  console.log(`Duracion total: ${resultado.arbol.duracionTotalSeg.toFixed(2)}s`);
  console.log('Resumen por escena:');
  for (const u of resultado.resumen) {
    console.log(
      `  ${u.id.padEnd(20)} componente=${u.componenteId.padEnd(16)} golpe=${u.golpe}` +
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
