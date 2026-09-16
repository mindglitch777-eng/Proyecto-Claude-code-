/**
 * PILOTO DOCUMENTAL 1 -- "Le pedí un mes de contenido a mi sistema".
 * Primer video de un formato nuevo, en paralelo a Taller de Activos:
 * mostrar el proceso real de la fábrica (pedido -> resultado real, con
 * métricas reales) en vez de opinar sobre gurús. Guion armado a partir
 * de la charla con el operador (storyboard: texto cinético -> línea
 * que se dibuja hacia el pedido real -> resultado real -> métricas
 * reales -> CTA al grupo de WhatsApp, 20 cupos gratis).
 *
 * Componentes, todos reales y validados de registro.json:
 *   - punch: texto de entrada con la última línea en rojo (acentoUltima).
 *   - chat: la captura del pedido real, como mensaje de "Claude" --
 *     se usa el componente nativo (mismo motor visual que el resto del
 *     video) en vez de una captura de pantalla externa, para que no
 *     desentone de estilo y para no replicar la interfaz real de Claude.
 *   - diagrama: la línea se DIBUJA con el paso del tiempo (no aparece
 *     hecha) conectando el pedido -> la fábrica -> el resultado.
 *   - rafaga: los 6 videos reales del lote21 (v01,v03,v05,v06,v08,v09)
 *     y, en una segunda rafaga corta, 2 carruseles reales del lote42 --
 *     uno atrás del otro, nunca simultáneos (pedido explícito del
 *     operador). La duración de cada clip sale sola de dividir la
 *     duración real de la narración de esa escena entre la cantidad de
 *     clips -- por eso las dos líneas de voz de estas escenas son más
 *     largas que las demás, para no caer en corte rápido tipo "ensalada".
 *   - remate: métricas reales (captura de TikTok Studio, 7 días,
 *     1.8K vistas) como clip de fondo, y cierre con el CTA real al
 *     grupo de WhatsApp (20 cupos gratis, sin promesa de por vida).
 *
 * Requiere: voz real ya generada en capturas_voz/audio_pilotos/doc1-*.wav
 * (ver capturas_voz/manifest_pilotos.json + generar-voz-pilotos.yml) y
 * los clips en assets/metraje_video/documental_piloto/ (se copian solos
 * a remotion-spike/public/video/ via preparar-public.sh en el render).
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';

type NodoDiagrama = {fig: string; x: number; y: number; tam: number; rotulo?: string; t: number; acento?: boolean};
type FlechaDiagrama = {de: number; a: number; t: number; acento?: boolean};
type DatosDiagrama = {nodos: NodoDiagrama[]; flechas?: FlechaDiagrama[]};

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'piloto-documental-1';

const diagramaProcesoReal: DatosDiagrama = {
  nodos: [
    {fig: 'mensaje', x: 0.5, y: 0.3, tam: 150, rotulo: 'EL PEDIDO', t: 0, acento: true},
    {fig: 'robot', x: 0.5, y: 0.52, tam: 150, rotulo: 'LA FÁBRICA', t: 1.7, acento: true},
    {fig: 'cohete', x: 0.5, y: 0.74, tam: 150, rotulo: 'EL RESULTADO', t: 3.3, acento: true},
  ],
  flechas: [
    {de: 0, a: 1, t: 1.1, acento: true},
    {de: 1, a: 2, t: 2.7, acento: true},
  ],
};

const escenas: EscenaGuion[] = [
  {
    id: 'doc1-hook',
    textoVoz: 'Le pedí a mi sistema que armara un mes de contenido. Esto es lo que me tiró.',
    componenteId: 'punch',
    props: {
      lineas: ['Le pedí a mi sistema que armara un mes de contenido.', 'Esto es lo que me tiró.'],
      entra: [0, 1.6],
      acentoUltima: true,
    },
    intensidad: 9,
    esPrimera: true,
  },
  {
    id: 'doc1-prompt',
    textoVoz: 'Esto es lo que le pedí.',
    componenteId: 'chat',
    props: {
      titulo: 'Claude',
      mensajes: [
        {de: 'vos', txt: 'Armame 21 videos completos: guion, voz y edición, listos para publicar.', t: 0},
      ],
    },
    intensidad: 6,
  },
  {
    id: 'doc1-diagrama',
    textoVoz: 'Y esto fue lo que armó, solo, sin que yo tocara nada más.',
    componenteId: 'diagrama',
    props: {d: diagramaProcesoReal},
    intensidad: 6,
  },
  {
    id: 'doc1-resultado',
    textoVoz: 'Veintiún videos, terminados de punta a punta: guion, voz clonada y edición, listos para subir. '
      + 'Cuarenta y dos carruseles, cada uno con su copy, sus hashtags y el horario sugerido. '
      + 'Nada de esto lo edité escena por escena, lo armó el sistema solo, mientras yo hacía otra cosa.',
    componenteId: 'rafaga',
    props: {
      clips: ['doc-v01.mp4', 'doc-v03.mp4', 'doc-v05.mp4', 'doc-v06.mp4', 'doc-v08.mp4', 'doc-v09.mp4'],
      sello: 'Resultado real -- sin editar',
    },
    intensidad: 7,
  },
  {
    id: 'doc1-carruseles',
    textoVoz: 'Y los carruseles van por el mismo camino: armados, con su texto y su diseño, listos para subir sin que yo toque una imagen.',
    componenteId: 'rafaga',
    props: {
      clips: ['doc-carrusel-04.mp4', 'doc-carrusel-11.mp4'],
      sello: 'Carruseles -- mismo sistema',
    },
    intensidad: 6,
  },
  {
    id: 'doc1-metricas',
    textoVoz: 'Una semana después, esto es lo que pasó.',
    componenteId: 'remate',
    props: {
      d: {
        lineas: ['Una semana después...'],
        grande: '1.8K vistas',
        pie: 'recién estamos arrancando',
      },
      clip: 'doc-metricas.mp4',
    },
    intensidad: 7,
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
