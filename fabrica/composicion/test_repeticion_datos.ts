import {decidirTratamientoValor, registrarValorEstablecido, ValorEstablecido} from './repeticion_datos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

// ── primera aparicion: siempre reutilizar ──
{
  const r = decidirTratamientoValor({valor: 2847, tipoDato: 'cantidad', unidadActual: 'hook', yaEstablecidos: []});
  check('primera vez: reutilizar', r.tratamiento === 'reutilizar');
}

// ── segunda aparicion del MISMO valor+tipo: sin derivarConsecuencia -> omitir_destaque ──
{
  const establecidos: ValorEstablecido[] = [{valor: 2847, tipoDato: 'cantidad', unidadId: 'hook'}];
  const r = decidirTratamientoValor({valor: 2847, tipoDato: 'cantidad', unidadActual: 'payoff', yaEstablecidos: establecidos});
  check('repetido sin consecuencia: omitir_destaque, no reutilizar', r.tratamiento === 'omitir_destaque');
  check('razon menciona donde se establecio antes', r.razon.includes('hook'));
}

// ── segunda aparicion CON derivarConsecuencia real (precio x cantidad) ──
{
  const establecidos: ValorEstablecido[] = [{valor: 2847, tipoDato: 'cantidad', unidadId: 'hook'}];
  const r = decidirTratamientoValor({
    valor: 2847, tipoDato: 'cantidad', unidadActual: 'payoff', yaEstablecidos: establecidos,
    derivarConsecuencia: (prev) => prev * 9,
  });
  check('con consecuencia real: tratamiento consecuencia', r.tratamiento === 'consecuencia');
  check('valor derivado correcto (2847 * 9 = 25623)', r.valorDerivado === 25623);
}

// ── mismo NUMERO pero tipoDato DISTINTO no cuenta como repetido ──
{
  const establecidos: ValorEstablecido[] = [{valor: 100, tipoDato: 'cantidad', unidadId: 'desarrollo'}];
  const r = decidirTratamientoValor({valor: 100, tipoDato: 'porcentaje', unidadActual: 'escalada', yaEstablecidos: establecidos});
  check('mismo numero, tipoDato distinto (cantidad vs porcentaje): no es repeticion', r.tratamiento === 'reutilizar');
}

// ── registrarValorEstablecido no muta el array original (inmutable, prevenible de bugs de referencia compartida) ──
{
  const original: ValorEstablecido[] = [];
  const nuevo = registrarValorEstablecido(original, 9, 'dinero', 'hook');
  check('no muta el array original', original.length === 0);
  check('el nuevo array tiene el valor', nuevo.length === 1 && nuevo[0].valor === 9);
}

// ── flujo completo: establecer, repetir, derivar consecuencia, repetir de nuevo ──
{
  let establecidos: ValorEstablecido[] = [];
  const r1 = decidirTratamientoValor({valor: 9, tipoDato: 'dinero', unidadActual: 'hook', yaEstablecidos: establecidos});
  check('flujo: 1ra vez reutilizar', r1.tratamiento === 'reutilizar');
  establecidos = registrarValorEstablecido(establecidos, 9, 'dinero', 'hook');

  const r2 = decidirTratamientoValor({
    valor: 9, tipoDato: 'dinero', unidadActual: 'payoff', yaEstablecidos: establecidos,
    derivarConsecuencia: (prev) => prev * 2847,
  });
  check('flujo: 2da vez con consecuencia real', r2.tratamiento === 'consecuencia' && r2.valorDerivado === 25623);
  establecidos = registrarValorEstablecido(establecidos, 25623, 'dinero', 'payoff');

  const r3 = decidirTratamientoValor({valor: 25623, tipoDato: 'dinero', unidadActual: 'cierre', yaEstablecidos: establecidos});
  check('flujo: el valor derivado tambien queda establecido (no se re-deriva infinito)', r3.tratamiento === 'omitir_destaque');
}

if (FALLOS.length) {
  console.log(`\n${FALLOS.length} FALLO(S):\n`);
  FALLOS.forEach((f) => console.log(f));
  process.exit(1);
}
console.log('Todos los tests de repeticion de datos pasaron OK.');
