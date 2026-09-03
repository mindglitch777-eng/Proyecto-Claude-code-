import {CATALOGO_PATRONES} from './catalogo';
import {porId, porCategoria, patronesCompatibles, conEvidenciaReal, validarCatalogo, explicarPatron} from './consultar';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

check('el catalogo no esta vacio', CATALOGO_PATRONES.length > 0);
check('todos los ids son unicos', new Set(CATALOGO_PATRONES.map((p) => p.id)).size === CATALOGO_PATRONES.length);
check('las 14 categorias pedidas por la directiva tienen al menos 1 patron',
  ['apertura', 'curiosidad', 'contradiccion', 'sorpresa', 'escalada', 'revelacion', 'comparacion', 'tension', 'recompensa', 'cambio_perspectiva', 'storytelling', 'ritmo', 'cierre', 'cta']
    .every((cat) => porCategoria(cat as any).length > 0));

for (const p of CATALOGO_PATRONES) {
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

check('porCategoria("apertura") trae los 5 patrones (4 de siempre + "resultado-primero" de R7-23)', porCategoria('apertura').length === 5);
check('porCategoria("cta") trae el patron de CTA', porCategoria('cta').some((p) => p.id === 'cta-especifico-accionable'));

check('patronesCompatibles("enganchar") incluye los patrones de apertura', patronesCompatibles('enganchar').length >= 4);
check('patronesCompatibles("cerrar") incluye el patron de resolucion de loop', patronesCompatibles('cerrar').some((p) => p.id === 'resolucion-explicita-del-loop'));

check('conEvidenciaReal excluye "pregunta-directa" (sin_evidencia_formal)', !conEvidenciaReal().some((p) => p.id === 'pregunta-directa'));
check('conEvidenciaReal incluye "contexto-parcial" y "loop-abierto"', conEvidenciaReal().some((p) => p.id === 'contexto-parcial') && conEvidenciaReal().some((p) => p.id === 'loop-abierto'));

// Las 4 preguntas que la directiva pide poder responder.
{
  const explicacion = explicarPatron('loop-abierto', 'unidad hook + unidad cierre');
  check('explicarPatron responde que patron es', explicacion.patron.id === 'loop-abierto');
  check('explicarPatron responde por que (no vacio)', explicacion.porQue.trim().length > 0);
  check('explicarPatron responde con que evidencia (items reales, no ids sueltos)', explicacion.evidencia.length === 2 && explicacion.evidencia.every((e) => e.concepto.trim().length > 0));
  check('explicarPatron distingue evidencia real de patron observado', explicacion.esHipotesisUObservado === 'evidencia_real');
  check('explicarPatron reporta de que depende', explicacion.dependeDe === 'unidad hook + unidad cierre');
}
check('explicarPatron con patron sin evidencia -> sin_respaldo_formal', explicarPatron('pregunta-directa', 'hook').esHipotesisUObservado === 'sin_respaldo_formal');
check('explicarPatron con patron de buena_practica -> patron_observado_o_buena_practica', explicarPatron('tension-creciente', 'desarrollo').esHipotesisUObservado === 'patron_observado_o_buena_practica');
check('explicarPatron con id inexistente lanza', (() => {
  try {
    explicarPatron('esto-no-existe', 'x');
    return false;
  } catch {
    return true;
  }
})());

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Viral/Retention Engine (fabrica/hooks) pasaron OK.');
