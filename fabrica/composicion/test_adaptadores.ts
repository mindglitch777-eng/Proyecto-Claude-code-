/**
 * Tests reales de los adaptadores de props. Incluye una prueba
 * cruzada contra las props exactas que se armaron A MANO en
 * fabrica/ejemplos/generar_demo_03.ts para "grafico" y
 * "antes-despues" (los dos componentes que de verdad gano el Director
 * Visual en esa corrida) -- si el adaptador generaliza bien, tiene que
 * producir el MISMO resultado que ya se verifico visualmente (frames
 * extraidos del render real), no una version distinta.
 */
import {propsParaCifra, propsParaComparacion} from './adaptadores';

const FALLOS: string[] = [];

function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── cifra: grafico ──
const datosEscalada = {
  titulo: 'Ventas por semana',
  puntos: [
    {etiqueta: 'Mes 1', valor: 0},
    {etiqueta: 'Mes 3', valor: 10},
    {etiqueta: 'Mes 8', valor: 100},
  ],
  etiqueta: 'ventas/semana',
  fuente: 'Datos ilustrativos para esta prueba de fábrica',
};

const propsGraficoReal = {
  idea: {
    titulo: 'Ventas por semana',
    datos: [
      {etiqueta: 'Mes 1', valor: 0},
      {etiqueta: 'Mes 3', valor: 10},
      {etiqueta: 'Mes 8', valor: 100},
    ],
    etiqueta: 'ventas/semana',
    fuente: 'Datos ilustrativos para esta prueba de fábrica',
  },
};

check(
  'grafico: coincide EXACTO con las props armadas a mano en generar_demo_03.ts',
  deepEqual(propsParaCifra('grafico', datosEscalada), propsGraficoReal)
);

// ── cifra: recibo (reinterpretacion de la misma progresion en dolares) ──
const datosIngresos = {
  titulo: 'Cómo crecieron los ingresos por semana',
  puntos: [
    {etiqueta: 'Semana 1', valor: 0},
    {etiqueta: 'Mes 3 (10 ventas/sem)', valor: 90},
    {etiqueta: 'Mes 8 (100 ventas/sem)', valor: 900},
  ],
  esDinero: true,
};
const propsRecibo = propsParaCifra('recibo', datosIngresos) as any;
check('recibo: 3 renglones en "entra"', propsRecibo.entra.length === 3);
check('recibo: montos correctos', propsRecibo.entra.map((r: any) => r.monto).join(',') === '0,90,900');
check('recibo: "sale" vacio (no hay gastos en esta historia)', propsRecibo.sale.length === 0);
check('recibo: timings crecientes y dentro de un rango razonable', propsRecibo.entra[0].t < propsRecibo.entra[1].t && propsRecibo.entra[1].t < propsRecibo.entra[2].t);

check('recibo SIN esDinero=true tira error explicito (no inventa un $ falso)', (() => {
  try {
    propsParaCifra('recibo', {puntos: datosEscalada.puntos});
    return false;
  } catch (e) {
    return String(e).includes('esDinero');
  }
})());

// ── cifra: contador y cifra-se-cae (extremos de la progresion) ──
const propsContador = propsParaCifra('contador', datosIngresos) as any;
check('contador: desde/hasta son los extremos', propsContador.desde === 0 && propsContador.hasta === 900);
check('contador: prefijo $ cuando esDinero', propsContador.prefijo === '$');

const propsCifraSeCae = propsParaCifra('cifra-se-cae', datosIngresos) as any;
check('cifra-se-cae: "de" y "a" formateados como plata', propsCifraSeCae.de === '$0' && propsCifraSeCae.a === '$900');

const propsCifraSeCaeSinDinero = propsParaCifra('cifra-se-cae', datosEscalada) as any;
check('cifra-se-cae sin dinero: numeros crudos, sin "$" inventado', propsCifraSeCaeSinDinero.de === '0' && propsCifraSeCaeSinDinero.a === '100');

// R7-21: torre-3d (R6-10) nunca tuvo adaptador -- bug real encontrado
// generando fabrica-demo-06 (categoria 'cifra' sin caso en el switch).
const propsTorre3D = propsParaCifra('torre-3d', datosIngresos) as any;
check('torre-3d: "hasta" es el valor final (mismo contrato que Torre3D.tsx)', propsTorre3D.hasta === 900);
check('torre-3d: prefijo $ cuando esDinero', propsTorre3D.prefijo === '$');
check('torre-3d: arriba viene del titulo', propsTorre3D.arriba === datosIngresos.titulo);

check('cifra: componente desconocido tira error explicito, no props vacias', (() => {
  try {
    propsParaCifra('componente-inventado-que-no-existe', datosEscalada);
    return false;
  } catch {
    return true;
  }
})());

check('cifra: menos de 2 puntos tira error explicito', (() => {
  try {
    propsParaCifra('grafico', {puntos: [{etiqueta: 'Unico', valor: 5}]});
    return false;
  } catch {
    return true;
  }
})());

// ── comparacion: antes-despues (coincide con lo armado a mano) ──
const datosPayoff = {
  izquierda: {rotulo: 'Trabajo full-time', texto: 'Cambia tu tiempo por plata, siempre igual.'},
  derecha: {rotulo: 'Un archivo de $9', texto: 'Se vende solo, 2.847 veces si hace falta.'},
};
const propsAntesDespuesReal = {
  antes: {rotulo: 'Trabajo full-time', txt: 'Cambia tu tiempo por plata, siempre igual.'},
  despues: {rotulo: 'Un archivo de $9', txt: 'Se vende solo, 2.847 veces si hace falta.'},
};
check(
  'antes-despues: coincide EXACTO con las props armadas a mano en generar_demo_03.ts',
  deepEqual(propsParaComparacion('antes-despues', datosPayoff), propsAntesDespuesReal)
);

// ── comparacion: balanza (con pesos) y duelo ──
const datosPayoffConPeso = {
  izquierda: {rotulo: 'Trabajo full-time', texto: '', peso: 8},
  derecha: {rotulo: 'Un archivo de $9', texto: '', peso: 3},
  remate: 'El tiempo no escala igual en los dos lados.',
};
const propsBalanza = propsParaComparacion('balanza', datosPayoffConPeso) as any;
check('balanza: pesos correctos', propsBalanza.izq.peso === 8 && propsBalanza.der.peso === 3);
check('balanza: pie = remate', propsBalanza.pie === 'El tiempo no escala igual en los dos lados.');

const propsDuelo = propsParaComparacion('duelo', datosPayoff) as any;
check('duelo: izq/der con rotulo+valor', propsDuelo.izq.rotulo === 'Trabajo full-time' && propsDuelo.der.valor === 'Se vende solo, 2.847 veces si hace falta.');

check('comparacion: "embudo" (no es un "2 lados") tira error explicito, no lo fuerza', (() => {
  try {
    propsParaComparacion('embudo', datosPayoff);
    return false;
  } catch (e) {
    return String(e).includes('embudo') || String(e).includes('adaptador');
  }
})());

if (FALLOS.length) {
  console.log(`\n${FALLOS.length} FALLO(S):\n`);
  FALLOS.forEach((f) => console.log(f));
  process.exit(1);
}
console.log('Todos los tests de adaptadores de props pasaron OK.');
