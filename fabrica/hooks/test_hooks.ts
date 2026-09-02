import {CATALOGO_HOOKS} from './catalogo';
import {porId, patronesCompatibles, conEvidenciaReal, validarCatalogo} from './consultar';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('el catalogo no esta vacio', CATALOGO_HOOKS.length > 0);
check('todos los ids son unicos', new Set(CATALOGO_HOOKS.map((p) => p.id)).size === CATALOGO_HOOKS.length);

for (const p of CATALOGO_HOOKS) {
  check(`${p.id}: tiene ejemplo aplicado no vacio`, p.ejemploAplicado.trim().length > 0);
  check(`${p.id}: respaldo 'evidencia' tiene al menos 1 id de conocimiento`, p.respaldo !== 'evidencia' || p.evidenciaIds.length > 0);
  check(`${p.id}: respaldo 'sin_evidencia_formal' no cita ningun id (seria contradictorio)`, p.respaldo !== 'sin_evidencia_formal' || p.evidenciaIds.length === 0);
  check(`${p.id}: compatible con al menos una intencion`, p.compatibleConIntencion.length > 0);
}

// Integridad real contra el Knowledge Engine -- no dos listas
// desincronizadas en silencio.
check('validarCatalogo no lanza (todos los ids de evidencia citados existen de verdad)', (() => {
  try {
    validarCatalogo();
    return true;
  } catch {
    return false;
  }
})());

check('porId encuentra un patron real', porId('contexto-parcial')?.nombre === 'Contexto parcial');
check('porId con id inexistente devuelve undefined', porId('esto-no-existe') === undefined);

check('patronesCompatibles("enganchar") trae los 4 patrones (todos son de apertura)', patronesCompatibles('enganchar').length === 4);
check('patronesCompatibles("construir_tension") trae solo loop-abierto', patronesCompatibles('construir_tension').length === 1 && patronesCompatibles('construir_tension')[0].id === 'loop-abierto');
check('patronesCompatibles("cerrar") no trae ningun patron de hook', patronesCompatibles('cerrar').length === 0);

check('conEvidenciaReal excluye "pregunta-directa" (sin_evidencia_formal) y "cifra-inmediata" (heuristica)', !conEvidenciaReal().some((p) => p.id === 'pregunta-directa' || p.id === 'cifra-inmediata'));
check('conEvidenciaReal incluye "contexto-parcial" y "loop-abierto"', conEvidenciaReal().length === 2);

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Hook Engine (fabrica/hooks) pasaron OK.');
