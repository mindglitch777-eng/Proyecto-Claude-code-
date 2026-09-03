import {MCP_INVESTIGADOS} from './registro';
import {porId, porDecision, porEstadoConexion, esperandoOperador, validarRegistro} from './consultar';
import type {McpInvestigado} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('hay al menos 1 MCP investigado', MCP_INVESTIGADOS.length > 0);
check('todos los ids son unicos', new Set(MCP_INVESTIGADOS.map((m) => m.id)).size === MCP_INVESTIGADOS.length);

for (const m of MCP_INVESTIGADOS) {
  check(`${m.id}: riesgo no vacio (nunca "es gratis" sin explicar el riesgo real)`, m.riesgo.trim().length > 0);
  check(`${m.id}: funcion no vacia`, m.funcion.trim().length > 0);
  check(`${m.id}: fuente no vacia (todo dato viene de algun lado citado)`, m.fuente.trim().length > 0);
}

check('porId encuentra vidiq', porId('vidiq')?.nombre === 'vidIQ');
check('porId con id inexistente da undefined', porId('esto-no-existe') === undefined);

check('vidiq esta instalado_no_conectado', porEstadoConexion('instalado_no_conectado').some((m) => m.id === 'vidiq'));
check('esperandoOperador incluye vidiq (unico con costo/cuenta sin confirmar y ya instalado)', esperandoOperador().some((m) => m.id === 'vidiq'));

check('los SaaS de video pagos estan descartados, no "usar" (regla de $0)', porDecision('descartar').some((m) => m.id === 'opusclip') && porDecision('descartar').some((m) => m.id === 'cluster-video-saas-pagos'));
check('ningun MCP con costo confirmado (esGratis=false) esta marcado "usar"', MCP_INVESTIGADOS.filter((m) => m.esGratis === false).every((m) => m.decision !== 'usar'));

check('validarRegistro no lanza sobre datos reales', (() => {
  try {
    validarRegistro();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
})());

// Deteccion de inconsistencia: decision='usar' sin estar conectado.
check('validarRegistro detecta un MCP marcado "usar" sin estar conectado', (() => {
  const fixture: McpInvestigado[] = [
    {...MCP_INVESTIGADOS[0], id: 'test-invalido', decision: 'usar', estadoConexion: 'instalado_no_conectado'},
  ];
  const original = [...MCP_INVESTIGADOS];
  MCP_INVESTIGADOS.length = 0;
  MCP_INVESTIGADOS.push(...fixture);
  let lanzo = false;
  try {
    validarRegistro();
  } catch {
    lanzo = true;
  }
  MCP_INVESTIGADOS.length = 0;
  MCP_INVESTIGADOS.push(...original);
  return lanzo;
})());

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del registro MCP (fabrica/mcp) pasaron OK.');
