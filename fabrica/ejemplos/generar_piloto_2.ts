/**
 * PILOTO 2 -- "Montaje palabra-por-corte" (Bloque 2 de la lista de
 * corte, angulo: "Asi se ve un producto digital hecho en una tarde").
 * Formato b-roll real de ritmo rapido -- ya era faceless en el diseño
 * original, se mantiene igual. Usa el metraje generico ya existente en
 * assets/metraje_video/oficina y /freelance (persona trabajando en
 * laptop, nunca protagonista a cara descubierta).
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'piloto-2';

const escenas: EscenaGuion[] = [
  {
    id: 'p2-hook',
    textoVoz: 'Esto lo armé en una tarde. Mirá.',
    componenteId: 'punch',
    props: {
      lineas: ['Esto lo armé', 'en una tarde.', 'Mirá.'],
      entra: [0, 1.1, 2.1],
      clip: 'oficina-01.mp4',
      velo: 0.55,
    },
    intensidad: 8,
    esPrimera: true,
  },
  {
    id: 'p2-montaje',
    textoVoz: '',
    componenteId: 'rafaga',
    props: {
      clips: ['oficina-00.mp4', 'freelance-03.mp4', 'oficina-04.mp4', 'freelance-05.mp4'],
      sello: 'TALLER DE ACTIVOS',
    },
    intensidad: 8,
  },
  {
    id: 'p2-revelacion',
    textoVoz: 'Tiempo real de armado: cuatro horas. Sin editor. Sin equipo.',
    componenteId: 'contador',
    props: {
      arriba: 'Tiempo real de armado',
      hasta: 4,
      sufijo: ' horas',
      abajo: 'Sin editor. Sin equipo.',
      prefijo: '',
    },
    intensidad: 6,
  },
  {
    id: 'p2-cta',
    textoVoz: 'Si yo pude en una tarde, vos también podés.',
    componenteId: 'remate',
    props: {
      d: {
        lineas: ['Sin experiencia.', 'Sin plata.', 'Sin excusas.'],
        grande: 'TAMBIÉN PODÉS',
        pie: 'Empezá con lo que tenés.',
      },
      clip: 'freelance-00.mp4',
    },
    intensidad: 7,
    esCierre: true,
    transicionSalida: {tipo: 'fundido'},
  },
];

function main() {
  const resultado = renderizarPorGuion(ID_VIDEO, escenas, {
    audioOrigenDir: 'capturas_voz/audio_pilotos',
    carpetaPublica: 'fabrica_piloto_2',
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
