import {AUDIENCIAS, PROBLEMAS, OPORTUNIDADES, PRODUCTOS, OFERTAS, LEAD_MAGNETS, LEADS, CONVERSIONES, FEEDBACK} from './datos';
import {problemasDeAudiencia, oportunidadesDeProblema, productosDeOportunidad, ofertasDeProducto, validarCadena, resumenFunnel} from './consultar';
import type {Audiencia, Problema, Oportunidad, Producto, Oferta, LeadMagnet} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

// Los almacenes reales (datos.ts) empiezan VACIOS -- confirma que
// nadie cargo un producto/oferta/audiencia inventada sin que el
// operador lo pidiera.
check('AUDIENCIAS real esta vacio (sin datos de negocio inventados)', AUDIENCIAS.length === 0);
check('PROBLEMAS real esta vacio', PROBLEMAS.length === 0);
check('OPORTUNIDADES real esta vacio', OPORTUNIDADES.length === 0);
check('PRODUCTOS real esta vacio', PRODUCTOS.length === 0);
check('OFERTAS real esta vacio', OFERTAS.length === 0);
check('LEAD_MAGNETS real esta vacio', LEAD_MAGNETS.length === 0);
check('LEADS real esta vacio', LEADS.length === 0);
check('CONVERSIONES real esta vacio', CONVERSIONES.length === 0);
check('FEEDBACK real esta vacio', FEEDBACK.length === 0);
check('resumenFunnel() sobre almacenes vacios da todo en 0 (honesto, no una simulacion)', Object.values(resumenFunnel()).every((n) => n === 0));

// Fixtures LOCALES de prueba (nunca exportadas, nunca en datos.ts) --
// solo para probar que la cadena de validacion funciona de verdad.
const audienciasTest: Audiencia[] = [{id: 'a1', descripcion: 'test', fuente: 'hipotesis del operador, sin validar', estado: 'sin_validar', fecha: '2026-09-02'}];
const problemasTest: Problema[] = [{id: 'p1', audienciaId: 'a1', descripcion: 'test', estado: 'sin_validar', fecha: '2026-09-02'}];
const oportunidadesTest: Oportunidad[] = [{id: 'o1', problemaId: 'p1', descripcion: 'test', estado: 'sin_validar', fecha: '2026-09-02'}];
const productosTest: Producto[] = [{id: 'pr1', oportunidadId: 'o1', nombre: 'test', tipo: 'mini_curso', descripcion: 'test', estado: 'sin_validar', fecha: '2026-09-02'}];
const ofertasTest: Oferta[] = [{id: 'of1', productoId: 'pr1', hipotesisDePrecio: 'test, sin validar', estado: 'sin_validar', fecha: '2026-09-02'}];
const leadMagnetsTest: LeadMagnet[] = [{id: 'lm1', ofertaId: 'of1', nombre: 'test', formato: 'guia', estado: 'sin_validar', fecha: '2026-09-02'}];

check('problemasDeAudiencia encuentra el problema real de esa audiencia', problemasDeAudiencia('a1', problemasTest).length === 1);
check('oportunidadesDeProblema encuentra la oportunidad real', oportunidadesDeProblema('p1', oportunidadesTest).length === 1);
check('productosDeOportunidad encuentra el producto real', productosDeOportunidad('o1', productosTest).length === 1);
check('ofertasDeProducto encuentra la oferta real', ofertasDeProducto('pr1', ofertasTest).length === 1);

check('validarCadena no encuentra errores con una cadena consistente', validarCadena({
  audiencias: audienciasTest, problemas: problemasTest, oportunidades: oportunidadesTest,
  productos: productosTest, ofertas: ofertasTest, leadMagnets: leadMagnetsTest,
}).length === 0);

check('validarCadena detecta un problema apuntando a una audiencia inexistente', validarCadena({
  audiencias: [], problemas: problemasTest, oportunidades: [], productos: [], ofertas: [], leadMagnets: [],
}).some((e) => e.includes('audienciaId inexistente')));

check('validarCadena detecta una oferta apuntando a un producto inexistente', validarCadena({
  audiencias: audienciasTest, problemas: problemasTest, oportunidades: oportunidadesTest,
  productos: [], ofertas: ofertasTest, leadMagnets: [],
}).some((e) => e.includes('productoId inexistente')));

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Sales Engine (fabrica/ventas) pasaron OK.');
