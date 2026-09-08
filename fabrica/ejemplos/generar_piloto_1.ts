/**
 * PILOTO 1 -- "Contradiccion directa" (Bloque 1 de la lista de corte,
 * angulo: "La gente que gana plata con productos digitales no sabe
 * editar video"). Pasado por el orquestador script-driven
 * (renderizador_por_guion.ts).
 *
 * Reescrito tras la correccion del operador: la version anterior de
 * este piloto usaba un formato de plano sostenido/talking-head, que
 * contradice la restriccion de marca (Taller de Activos es FACELESS).
 * Esta version usa solo componentes reales y validados de
 * registro.json (ninguno requiere camara ni rostro) + b-roll generico
 * ya existente en assets/metraje_video/freelance (persona trabajando,
 * nunca a cara descubierta como protagonista del video).
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';

type NodoDiagrama = {fig: string; x: number; y: number; tam: number; rotulo?: string; t: number; acento?: boolean};
type FlechaDiagrama = {de: number; a: number; t: number; acento?: boolean};
type DatosDiagrama = {nodos: NodoDiagrama[]; flechas?: FlechaDiagrama[]};

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'piloto-1';

const diagramaSistema: DatosDiagrama = {
  nodos: [
    {fig: 'foco', x: 0.5, y: 0.28, tam: 150, rotulo: 'IDEA', t: 0, acento: true},
    {fig: 'documento', x: 0.5, y: 0.44, tam: 150, rotulo: 'OFERTA', t: 0.9, acento: true},
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
    id: 'p1-hook',
    textoVoz: 'La gente que gana plata con productos digitales no sabe editar video. No tiene equipo caro. No sale en cámara.',
    componenteId: 'tres-verdades',
    props: {frases: ['No sabe editar video.', 'No tiene equipo caro.', 'No sale en cámara.']},
    intensidad: 8,
    esPrimera: true,
  },
  {
    id: 'p1-contradiccion',
    textoVoz: 'Vos pensás que necesitás saber editar. Lo que necesitás es saber vender.',
    componenteId: 'balanza',
    props: {
      titulo: '¿Qué pesa más?',
      izq: {txt: 'EDITAR BIEN', peso: 2},
      der: {txt: 'VENDER BIEN', peso: 8},
      pie: 'Adivinaste.',
    },
    intensidad: 6,
  },
  {
    id: 'p1-prueba',
    textoVoz: 'Guión: una hora. Grabación en cámara: cero minutos. El producto ya está armado.',
    componenteId: 'explicador',
    props: {
      d: {
        titulo: 'Lo que de verdad lleva tiempo',
        filas: [
          {concepto: 'Guión', valor: '1 hora'},
          {concepto: 'Grabación en cámara', valor: '0 minutos'},
          {concepto: 'Producto', valor: 'Ya armado'},
        ],
        remate: {arriba: 'Lo único que se vende es', grande: 'LA IDEA', abajo: 'no la edición'},
      },
    },
    intensidad: 6,
  },
  {
    id: 'p1-sistema',
    textoVoz: 'El sistema real es: idea, oferta, contenido, venta. En ese orden. No en el que te vendieron.',
    componenteId: 'diagrama',
    props: {d: diagramaSistema},
    intensidad: 5,
  },
  {
    id: 'p1-cta',
    textoVoz: 'Sin cámara. Sin equipo. Sin excusas. Empezá hoy.',
    componenteId: 'remate',
    props: {
      d: {
        lineas: ['Sin cámara.', 'Sin equipo.', 'Sin excusas.'],
        grande: 'EMPEZÁ HOY',
        pie: 'Guardá esto para cuando estés listo.',
      },
      clip: 'freelance-02.mp4',
    },
    intensidad: 7,
    esCierre: true,
    transicionSalida: {tipo: 'fundido'},
  },
];

function main() {
  const resultado = renderizarPorGuion(ID_VIDEO, escenas, {
    audioOrigenDir: 'capturas_voz/audio_pilotos',
    carpetaPublica: 'fabrica_piloto_1',
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
