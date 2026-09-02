import {TECNICAS_EDICION} from './tecnicas';
import {porId, porCategoria, porProposito, validarCatalogo} from './consultar_tecnicas';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('el catalogo no esta vacio', TECNICAS_EDICION.length > 0);
check('todos los ids son unicos', new Set(TECNICAS_EDICION.map((t) => t.id)).size === TECNICAS_EDICION.length);

for (const t of TECNICAS_EDICION) {
  check(`${t.id}: tiene implementacion real referenciada (no vacia)`, t.implementacion.trim().length > 0);
  check(`${t.id}: declara al menos un proposito narrativo (nunca "porque existe")`, t.subordinadoA.length > 0);
}

check('validarCatalogo no lanza (integridad referencial real)', (() => {
  try {
    validarCatalogo();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
})());

check('porId encuentra una tecnica real', porId('torre3d-momento-alto-impacto')?.categoria === '3d');
check('porId con id inexistente devuelve undefined', porId('esto-no-existe') === undefined);

check('porCategoria("transicion") trae al menos 3 tecnicas reales', porCategoria('transicion').length >= 3);
check('porProposito("impacto") incluye fogonazo y Torre3D', porProposito('impacto').some((t) => t.id === 'golpe-fogonazo') && porProposito('impacto').some((t) => t.id === 'torre3d-momento-alto-impacto'));
check('el ciclo de calidad esta subordinado a los 4 propositos (satisface el pedido completo de la directiva)', porId('ciclo-render-inspeccionar-corregir')?.subordinadoA.length === 4);

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Advanced Editing Engine (fabrica/directores/edicion/tecnicas.ts) pasaron OK.');
