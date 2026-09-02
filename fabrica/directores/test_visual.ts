/**
 * Tests reales del Director Visual contra el registro.json real (no
 * un registro de prueba inventado) -- si el registro cambia de forma
 * que rompe estas expectativas razonables, este test lo detecta.
 *
 * Uso: npx tsx directores/test_visual.ts
 */
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from './visual';
import type {ComponenteRegistrado} from '../componentes/tipos';

const registro: ComponenteRegistrado[] = JSON.parse(
  readFileSync(path.join(__dirname, '../componentes/registro.json'), 'utf-8')
);
const director = new DirectorVisual(registro);

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

// 1) Pedido de "cifra" de alta intensidad, con audio de ~5s: Contador
//    y CifraSeCae son las cifras validadas -- alguna de las dos
//    deberia salir primero (ambas encajan bien en 5s).
{
  const r = director.consultar({
    categorias: ['cifra'],
    intensidadDeseada: 0.75,
    capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [],
    duracionDisponibleSeg: 5,
    requiereAudioSincronizado: true,
  });
  check('cifra: hay al menos 1 candidato', r.length > 0);
  check('cifra: el primero es contador o cifra-se-cae',
    r.length > 0 && ['contador', 'cifra-se-cae'].includes(r[0].componente.id));
  check('cifra: no aparece un componente de otra categoria', r.every((c) => c.componente.categoria === 'cifra'));
}

// 2) Pedido de categoria "diagrama" sin iconos disponibles: Diagrama
//    exige assets tipo icono obligatorio -> debe quedar EXCLUIDO.
{
  const r = director.consultar({
    categorias: ['diagrama'],
    intensidadDeseada: 0.4,
    capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], // sin iconos
    duracionDisponibleSeg: 8,
  });
  check('diagrama sin assets: no debe devolver "diagrama" (requiere icono obligatorio)',
    !r.some((c) => c.componente.id === 'diagrama'));
}

// 2b) Mismo pedido, CON iconos disponibles: ahora si debe aparecer.
{
  const r = director.consultar({
    categorias: ['diagrama'],
    intensidadDeseada: 0.4,
    capacidadTextoNecesaria: 'corta',
    assetsDisponibles: ['icono'],
    duracionDisponibleSeg: 8,
  });
  check('diagrama con icono disponible: si debe aparecer', r.some((c) => c.componente.id === 'diagrama'));
}

// 3) Anti-repeticion: pedir timeline evitando 'cronologia' (el unico
//    componente validado de categoria timeline) -- debe bajarle el
//    score pero seguir apareciendo (no se prohibe, solo se penaliza).
{
  const sinEvitar = director.consultar({
    categorias: ['timeline'], intensidadDeseada: 0.35, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: 8,
  });
  const conEvitar = director.consultar({
    categorias: ['timeline'], intensidadDeseada: 0.35, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: 8, evitar: ['cronologia'],
  });
  check('anti-repeticion: cronologia sigue apareciendo aunque este en "evitar"',
    conEvitar.some((c) => c.componente.id === 'cronologia'));
  const scoreSin = sinEvitar.find((c) => c.componente.id === 'cronologia')?.score ?? -999;
  const scoreCon = conEvitar.find((c) => c.componente.id === 'cronologia')?.score ?? -999;
  check('anti-repeticion: el score baja cuando esta en "evitar"', scoreCon < scoreSin);
}

// 4) Categoria inexistente en el registro (ej. 'montaje' no tiene
//    ningun componente validado con ese id de categoria salvo si se
//    agrega) -- no debe explotar, debe devolver lista vacia.
{
  const r = director.consultar({
    categorias: ['montaje'], intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media',
    assetsDisponibles: [], duracionDisponibleSeg: 5,
  });
  check('categoria sin componentes: no explota, devuelve array (posiblemente vacio)', Array.isArray(r));
}

// 5) Cada candidato trae razones (transparencia del score, no caja negra).
{
  const r = director.consultar({
    categorias: ['cifra'], intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta',
    assetsDisponibles: [], duracionDisponibleSeg: 5,
  });
  check('cada candidato trae al menos una razon', r.every((c) => c.razones.length > 0));
}

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):\n`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Director Visual pasaron OK.');
