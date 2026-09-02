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

// unidad CON un solo audio: la duracion debe ser exactamente audio+aire, no adivinada.
{
  const unidades: UnidadResuelta[] = [
    {id: 'u1', componente: compFake('c1'), props: {}, audios: [{archivo: 'a.mp3', duracionSeg: 3.0}], golpe: 'fogonazo', volumenSfx: 0.9},
    {id: 'u2', componente: compFake('c2'), props: {}, audios: [{archivo: 'b.mp3', duracionSeg: 5.0}], golpe: 'corte', volumenSfx: 0.5},
  ];
  const arbol = armarComposicion('demo', unidades);
  check('escena 1 empieza en 0', arbol.escenas[0].desdeSeg === 0);
  check('escena 1 dura audio(3.0) + aire(0.25) = 3.25', Math.abs(arbol.escenas[0].duracionSeg - 3.25) < 1e-9);
  check('escena 2 empieza justo donde termina la 1 (sin huecos ni superposicion)',
    Math.abs(arbol.escenas[1].desdeSeg - 3.25) < 1e-9);
  check('escena 2 dura audio(5.0) + aire(0.25) = 5.25', Math.abs(arbol.escenas[1].duracionSeg - 5.25) < 1e-9);
  check('duracionTotalSeg = suma de escenas + margen final (0.5)',
    Math.abs(arbol.duracionTotalSeg - (3.25 + 5.25 + 0.5)) < 1e-9);
  check('escena 1 trae 1 clip de audio en el arbol final', arbol.escenas[0].audios.length === 1);
  check('el clip de la escena 1 arranca en offset relativo 0', arbol.escenas[0].audios[0].desdeSegRelativo === 0);
}

// MULTI-AUDIO: una unidad con 3 clips (ej. Cronologia con 3 hitos) --
// la duracion de la unidad es la suma de los 3 + aire entre cada uno,
// y cada clip queda en su offset RELATIVO a la escena, acumulado.
{
  const unidades: UnidadResuelta[] = [
    {
      id: 'u1', componente: compFake('cronologia', {categoria: 'timeline'}), props: {hitos: []},
      audios: [
        {archivo: 'hito1.mp3', duracionSeg: 2.0},
        {archivo: 'hito2.mp3', duracionSeg: 3.0},
        {archivo: 'hito3.mp3', duracionSeg: 1.5},
      ],
      golpe: 'ninguno', volumenSfx: 0,
    },
  ];
  const arbol = armarComposicion('demo-multi', unidades);
  const escena = arbol.escenas[0];
  check('multi-audio: 3 clips en la escena', escena.audios.length === 3);
  check('clip 1 arranca en 0', escena.audios[0].desdeSegRelativo === 0);
  check('clip 2 arranca en 2.0+aire(0.25) = 2.25', Math.abs(escena.audios[1].desdeSegRelativo - 2.25) < 1e-9);
  check('clip 3 arranca en 2.25+3.0+aire(0.25) = 5.5', Math.abs(escena.audios[2].desdeSegRelativo - 5.5) < 1e-9);
  check('duracion total de la escena = 2.0+0.25+3.0+0.25+1.5+0.25 = 7.25',
    Math.abs(escena.duracionSeg - 7.25) < 1e-9);
  check('el componente se resuelve UNA sola vez para toda la escena (props intactas)',
    Object.prototype.hasOwnProperty.call(escena.props, 'hitos'));
}

// unidad SIN audio: cae al punto medio de duracionMinMaxSeg del propio componente.
{
  const unidades: UnidadResuelta[] = [
    {id: 'u1', componente: compFake('c1', {duracionMinMaxSeg: [4, 10]}), props: {}, audios: null, golpe: 'ninguno', volumenSfx: 0},
  ];
  const arbol = armarComposicion('demo', unidades);
  check('sin audio: duracion = punto medio de [4,10] = 7', arbol.escenas[0].duracionSeg === 7);
  check('sin audio: el array de audios de la escena queda vacio', arbol.escenas[0].audios.length === 0);
}

// unidad con audios: [] (array vacio explicito, no null) se comporta igual que null.
{
  const unidades: UnidadResuelta[] = [
    {id: 'u1', componente: compFake('c1', {duracionMinMaxSeg: [2, 6]}), props: {}, audios: [], golpe: 'ninguno', volumenSfx: 0},
  ];
  const arbol = armarComposicion('demo', unidades);
  check('array vacio: duracion = punto medio de [2,6] = 4', arbol.escenas[0].duracionSeg === 4);
}

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests de armarComposicion pasaron OK.');
