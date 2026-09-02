import {decidirPrioridadPatron, type PatronEdicion, type RegistroPatron} from './patrones';
import type {EntradaLaboratorio} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

const patronA: PatronEdicion = {categoria: 'cifra', estilos: ['agresivo', 'data'], golpe: 'fogonazo'};

function entrada(overrides: Partial<EntradaLaboratorio> & {id: string}): EntradaLaboratorio {
  return {
    hipotesis: 'h', experimento: 'e', resultadoReal: null, conclusion: null,
    estado: 'esperando_datos', fechaCreacion: new Date().toISOString(), ...overrides,
  };
}

function main() {
  // Nunca usado -> sin penalizacion.
  const sinHistorial = decidirPrioridadPatron({patron: patronA, historial: [], laboratorio: []});
  check('patron nunca usado -> penalizacion 0', sinHistorial.penalizacion === 0);

  // Usado 2 veces recientemente, sin ningun dato real -> penalizado por defecto.
  const historialUsado: RegistroPatron[] = [
    {videoId: 'v1', fecha: 'x', patron: patronA},
    {videoId: 'v2', fecha: 'x', patron: patronA},
  ];
  const sinDatos = decidirPrioridadPatron({patron: patronA, historial: historialUsado, laboratorio: []});
  check('usado 2 veces sin datos reales -> penalizacion > 0', sinDatos.penalizacion === 2);
  check('la razon explica que no hay datos reales todavia', sinDatos.razon.includes('sin ningun resultadoReal'));

  // El orden de los estilos no importa para la clave del patron.
  const mismoPatronOtroOrden: PatronEdicion = {...patronA, estilos: ['data', 'agresivo']};
  const conOrdenInvertido = decidirPrioridadPatron({patron: mismoPatronOtroOrden, historial: historialUsado, laboratorio: []});
  check('el orden de los estilos no cambia si se considera el mismo patron', conOrdenInvertido.penalizacion === 2);

  // Categoria distinta -> NO es el mismo patron, sin penalizacion.
  const patronDistinto: PatronEdicion = {...patronA, categoria: 'texto'};
  const distinto = decidirPrioridadPatron({patron: patronDistinto, historial: historialUsado, laboratorio: []});
  check('categoria distinta -> patron distinto, sin penalizacion', distinto.penalizacion === 0);

  // Usado recientemente Y con resultadoReal real que indica que
  // funciono (retencion alta) -> prioridad recuperada (penalizacion 0).
  const laboratorioConExito: EntradaLaboratorio[] = [
    entrada({id: 'h1', videoId: 'v1', resultadoReal: {retencionPct: 55, fuente: 'TikTok Analytics', fechaMedicion: 'x'}}),
  ];
  const recuperado = decidirPrioridadPatron({patron: patronA, historial: historialUsado, laboratorio: laboratorioConExito});
  check('resultadoReal con buena retencion -> penalizacion 0 (prioridad recuperada)', recuperado.penalizacion === 0);
  check('la razon explica la recuperacion de prioridad', recuperado.razon.includes('prioridad recuperada'));

  // Usado recientemente CON resultadoReal real pero que indica que NO
  // funciono (retencion baja) -> se mantiene la penalizacion, nunca se
  // "perdona" solo por tener un dato real cualquiera.
  const laboratorioConFracaso: EntradaLaboratorio[] = [
    entrada({id: 'h2', videoId: 'v1', resultadoReal: {retencionPct: 12, fuente: 'TikTok Analytics', fechaMedicion: 'x'}}),
  ];
  const noRecuperado = decidirPrioridadPatron({patron: patronA, historial: historialUsado, laboratorio: laboratorioConFracaso});
  check('resultadoReal con retencion baja -> penalizacion se mantiene', noRecuperado.penalizacion === 2);
  check('nunca se mezcla heuristica con resultado real en la misma cifra (penalizacion es un conteo de usos, no un score combinado)',
    typeof noRecuperado.penalizacion === 'number' && !noRecuperado.razon.includes('score'));

  // Un resultadoReal de un video QUE NO USO este patron no debe afectar la decision.
  const laboratorioDeOtroVideo: EntradaLaboratorio[] = [
    entrada({id: 'h3', videoId: 'v-no-relacionado', resultadoReal: {retencionPct: 90, fuente: 'x', fechaMedicion: 'x'}}),
  ];
  const noRelacionado = decidirPrioridadPatron({patron: patronA, historial: historialUsado, laboratorio: laboratorioDeOtroVideo});
  check('un resultadoReal de un video no relacionado no recupera prioridad', noRelacionado.penalizacion === 2);

  // La ventana limita cuanto historial se mira hacia atras.
  const historialLargo: RegistroPatron[] = Array.from({length: 20}, (_, i) => ({videoId: `v${i}`, fecha: 'x', patron: patronA}));
  const conVentanaChica = decidirPrioridadPatron({patron: patronA, historial: historialLargo, laboratorio: [], ventana: 3});
  check('la ventana limita cuantos usos recientes se cuentan', conVentanaChica.penalizacion === 3);

  if (FALLOS.length) {
    console.log(`\n${FALLOS.length} FALLO(S):\n`);
    for (const f of FALLOS) console.log(f);
    process.exit(1);
  }
  console.log('Todos los tests de anti-repeticion por patron (memoria/patrones.ts) pasaron OK.');
}

main();
