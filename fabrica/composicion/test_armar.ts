import {armarComposicion} from './armar';
import type {UnidadResuelta} from './tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

function compFake(id: string, extra?: Partial<ComponenteRegistrado>): ComponenteRegistrado {
  return {
    id, archivo: 'x.tsx', exportacion: 'X', categoria: 'texto', funcion: 'test',
    intensidad: 0.5, ritmo: 'dinamico', capacidadTexto: 'corta',
    requiereAssets: {tipo: 'ninguno', obligatorio: false},
    duracionMinMaxSeg: [4, 10], compatibleCon: [], soportaAudioSincronizado: true,
    estado: 'validado', ...extra,
  };
}

// unidad CON audio real: la duracion debe ser exactamente audio+aire, no adivinada.
{
  const unidades: UnidadResuelta[] = [
    {id: 'u1', componente: compFake('c1'), props: {}, audio: {archivo: 'a.mp3', duracionSeg: 3.0}, golpe: 'fogonazo', volumenSfx: 0.9},
    {id: 'u2', componente: compFake('c2'), props: {}, audio: {archivo: 'b.mp3', duracionSeg: 5.0}, golpe: 'corte', volumenSfx: 0.5},
  ];
  const arbol = armarComposicion('demo', unidades);
  check('escena 1 empieza en 0', arbol.escenas[0].desdeSeg === 0);
  check('escena 1 dura audio(3.0) + aire(0.25) = 3.25', Math.abs(arbol.escenas[0].duracionSeg - 3.25) < 1e-9);
  check('escena 2 empieza justo donde termina la 1 (sin huecos ni superposicion)',
    Math.abs(arbol.escenas[1].desdeSeg - 3.25) < 1e-9);
  check('escena 2 dura audio(5.0) + aire(0.25) = 5.25', Math.abs(arbol.escenas[1].duracionSeg - 5.25) < 1e-9);
  check('duracionTotalSeg = suma de escenas + margen final (0.5)',
    Math.abs(arbol.duracionTotalSeg - (3.25 + 5.25 + 0.5)) < 1e-9);
}

// unidad SIN audio: cae al punto medio de duracionMinMaxSeg del propio componente.
{
  const unidades: UnidadResuelta[] = [
    {id: 'u1', componente: compFake('c1', {duracionMinMaxSeg: [4, 10]}), props: {}, audio: null, golpe: 'ninguno', volumenSfx: 0},
  ];
  const arbol = armarComposicion('demo', unidades);
  check('sin audio: duracion = punto medio de [4,10] = 7', arbol.escenas[0].duracionSeg === 7);
}

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests de armarComposicion pasaron OK.');
