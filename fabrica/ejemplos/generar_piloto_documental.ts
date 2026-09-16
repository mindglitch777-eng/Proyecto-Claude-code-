/**
 * PILOTO DOCUMENTAL 1 -- "Le pedí un mes de contenido a mi sistema".
 * Primer video de un formato nuevo, en paralelo a Taller de Activos:
 * mostrar el proceso real de la fábrica (pedido -> resultado real, con
 * métricas reales) en vez de opinar sobre gurús.
 *
 * CORRECCIÓN 1 (feedback real del operador): 3 escenas separadas
 * (punch+chat+diagrama) con cortes entre sí -> reemplazadas por UNA
 * pieza continua (`revelacion`).
 *
 * CORRECCIÓN 2 (2do feedback real, 7.5/10 -- "no cumple la idea
 * original tampoco"): la v2 seguía sin ser lo pedido en varios puntos
 * concretos:
 *   - La línea era RECTA. Pedido explícito: "tiene que hacer curvas,
 *     como un mapa del tesoro que se va desviando, si no, no se sabe
 *     hacia dónde va".
 *   - El "pedido real" era mi propio cuadrito de chat genérico --
 *     "no genera confianza". Pedido: que se vea como una captura real
 *     de la interfaz de Claude.
 *   - Los resultados (lo más importante) quedaban en segundo plano:
 *     un clip atrás de otro (`rafaga`). Pedido: pantalla dividida en 6,
 *     con 6 videos reales EN SIMULTÁNEO, mismo tratamiento para los
 *     carruseles, texto arriba sincronizado con la voz.
 *   - Las métricas sin peso visual real. Pedido: texto kinético
 *     palabra por palabra (tipografías alternadas), la palabra
 *     "resultados" en verde y otra tipografía, lluvia de billetes,
 *     métricas de fondo.
 *
 * Se resuelve con DOS piezas nuevas (ninguna reusa el catálogo básico
 * -- pedido explícito del operador de crear los formatos que hagan
 * falta):
 *   - `revelacion` (agresivo/Revelacion.tsx): gancho -> camino curvo
 *     real (bezier, se dibuja con el tiempo) -> tarjeta con la estética
 *     real de Claude (zoom + foco progresivo sobre el prompt real).
 *   - `resultados-vivos` (agresivo/ResultadosVivos.tsx): el camino
 *     sigue curveando -> grilla de 6 videos reales simultáneos con
 *     caption -> crossfade a grilla de 6 carruseles reales -> el
 *     camino sigue -> texto kinético + lluvia de billetes + métricas
 *     reales de fondo.
 *   - `remate`: cierre con el CTA real al grupo de WhatsApp (20 cupos
 *     gratis, sin promesa de por vida) -- esta pieza no tuvo objeciones,
 *     se mantiene igual.
 *
 * Requiere: voz real ya generada en capturas_voz/audio_pilotos/doc1-*.wav
 * (ver capturas_voz/manifest_pilotos.json + generar-voz-pilotos.yml) y
 * los clips en assets/metraje_video/documental_piloto/ (se copian solos
 * a remotion-spike/public/video/ via preparar-public.sh en el render).
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'piloto-documental-1';

const escenas: EscenaGuion[] = [
  {
    id: 'doc1-revelacion',
    textoVoz: 'Le pedí a mi sistema que armara un mes de contenido. Esto es lo que me tiró. '
      + 'Esto es lo que le pedí.',
    componenteId: 'revelacion',
    props: {
      lineaHook: 'Le pedí a mi sistema que armara un mes de contenido.',
      lineaTiro: 'Esto es lo que me tiró.',
      prompt: 'Armame 21 videos completos: guion, voz y edición, listos para publicar.',
      t: {
        hook: 0,
        tiro: 1.5,
        lineaEmpieza: 2.4,
        pedidoLlega: 3.6,
        promptBorroso: 3.8,
        promptEnfoca: 5.0,
        lineaSigue: 5.8,
      },
    },
    intensidad: 8,
    esPrimera: true,
  },
  {
    id: 'doc1-resultados-vivos',
    textoVoz: 'En una hora y media armé cuarenta y una piezas de contenido: veintiún videos y los carruseles, '
      + 'todos listos para subir. Y estos fueron los resultados. En cinco días, esto es lo que pasó.',
    componenteId: 'resultados-vivos',
    props: {
      textoGrid: 'En 1:30 armé 41 piezas de contenido',
      clipsVideos: ['doc-v01.mp4', 'doc-v03.mp4', 'doc-v05.mp4', 'doc-v06.mp4', 'doc-v08.mp4', 'doc-v09.mp4'],
      clipsCarruseles: [
        'doc-carrusel-01.mp4',
        'doc-carrusel-04.mp4',
        'doc-carrusel-11.mp4',
        'doc-carrusel-15.mp4',
        'doc-carrusel-22.mp4',
        'doc-carrusel-36.mp4',
      ],
      fraseAntes: 'Y estos fueron los ',
      fraseResaltada: 'resultados',
      fraseDespues: ' en 5 días.',
      clipMetricas: 'doc-metricas.mp4',
      t: {
        lineaSube: 0,
        gridVideosDesde: 0.6,
        gridVideosHasta: 5.2,
        gridCarrusDesde: 5.2,
        gridCarrusHasta: 8.4,
        lineaBaja: 8.4,
        textoDesde: 9.3,
        dineroDesde: 9.5,
        metricasDesde: 11.0,
      },
    },
    intensidad: 8,
  },
  {
    id: 'doc1-cta',
    textoVoz: 'Esto lo armé yo, solo, desde el celular. Si querés ver cómo, entrá al grupo. Quedan veinte lugares gratis.',
    componenteId: 'remate',
    props: {
      d: {
        lineas: ['Esto lo armé yo, solo, desde el celular.'],
        grande: 'ENTRÁ AL GRUPO',
        pie: 'Quedan 20 lugares gratis, por ahora.',
      },
      clip: 'doc-v01.mp4',
    },
    intensidad: 7,
    esCierre: true,
    transicionSalida: {tipo: 'fundido'},
  },
];

function main() {
  const resultado = renderizarPorGuion(ID_VIDEO, escenas, {
    audioOrigenDir: 'capturas_voz/audio_pilotos',
    carpetaPublica: 'fabrica_piloto_documental_1',
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
