/**
 * PILOTO 3 -- "Screen-recording + texto apilado" (Bloque 3 de la lista
 * de corte, angulo: "3 herramientas de IA que reemplazan a un equipo
 * entero"). Faceless por diseño original -- usa `logos-herramientas`
 * (chapita con color de marca real + nombre, sin logo-imagen de
 * terceros, ver docstring de escenas/herramientas.tsx) y b-roll
 * generico de oficina ya existente en el repo.
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'piloto-3';

const escenas: EscenaGuion[] = [
  {
    id: 'p3-hook',
    textoVoz: 'Tres herramientas. Cero empleados. Mismo resultado.',
    componenteId: 'tres-verdades',
    props: {frases: ['3 herramientas.', '0 empleados.', 'Mismo resultado.']},
    intensidad: 8,
    esPrimera: true,
  },
  {
    id: 'p3-herramientas',
    textoVoz: 'Una escribe. Otra diseña. Otra organiza. Las tres juntas reemplazan a un equipo entero.',
    componenteId: 'logos-herramientas',
    props: {
      titulo: 'El equipo que no contrataste',
      items: [
        {nombre: 'ChatGPT', color: '#10A37F', texto: 'Reemplaza a tu redactor'},
        {nombre: 'Canva', color: '#00C4CC', texto: 'Reemplaza a tu diseñador'},
        {nombre: 'Notion', color: '#000000', texto: 'Reemplaza a tu asistente'},
      ],
      pie: 'Gratis o casi gratis.',
    },
    intensidad: 6,
  },
  {
    id: 'p3-comparacion',
    textoVoz: 'Un equipo tradicional cuesta miles de dólares por mes. Estas tres herramientas, apenas unos dólares.',
    componenteId: 'duelo',
    props: {
      izq: {rotulo: 'Equipo tradicional', valor: '$3.000/mes'},
      der: {rotulo: 'Estas 3 herramientas', valor: '$60/mes'},
      ganador: 'der',
      remate: 'La diferencia se nota en el bolsillo.',
    },
    intensidad: 6,
  },
  {
    id: 'p3-cta',
    textoVoz: 'No necesitás un equipo. Necesitás las herramientas correctas.',
    componenteId: 'remate',
    props: {
      d: {
        lineas: ['No es magia.', 'Es apalancamiento.', 'Empezá a usarlo.'],
        grande: 'MISMO RESULTADO',
        pie: 'Con una fracción del costo.',
      },
      clip: 'oficina-02.mp4',
    },
    intensidad: 7,
    esCierre: true,
    transicionSalida: {tipo: 'fundido'},
  },
];

function main() {
  const resultado = renderizarPorGuion(ID_VIDEO, escenas, {
    audioOrigenDir: 'capturas_voz/audio_pilotos',
    carpetaPublica: 'fabrica_piloto_3',
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
