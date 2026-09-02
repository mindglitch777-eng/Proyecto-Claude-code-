import {DirectorEdicion} from './edicion';
import type {ContextoUnidad} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

const director = new DirectorEdicion();

function main() {
  // Primera unidad -> enganchar, entrada inmediata, energia subida un
  // escalon respecto de la intensidad base.
  const hook: ContextoUnidad = {
    unidadId: 'hook', categoria: 'texto', intensidadComponente: 0.75,
    indice: 0, total: 7, duracionSegTotal: 5, offsetsAudioSeg: [0, 3], esPrimera: true,
  };
  const eHook = director.planificar(hook, 'ninguno');
  check('primera unidad -> intencion enganchar', eHook.intencion === 'enganchar');
  check('primera unidad -> entrada inmediata', eHook.entrada.tipo === 'inmediata');
  check('primera unidad -> no es respiracion', eHook.respiracion === false);
  check('el golpe recibido se conserva en la transicion', eHook.transicion.golpe === 'ninguno');
  check('la transicion trae un motivo no vacio', eHook.transicion.motivo.length > 0);

  // Revelacion -> revelar, energia alta, salida no "se_desvanece"
  // (deberia anclar o cortar limpio, nunca perder protagonismo).
  const impacto: ContextoUnidad = {
    unidadId: 'impacto', categoria: 'comparacion', intensidadComponente: 0.55,
    indice: 4, total: 7, duracionSegTotal: 10, offsetsAudioSeg: [0, 2.6], esRevelacion: true,
    tipoDatoDestacado: 'dinero', esRepeticionTratada: true,
  };
  const eImpacto = director.planificar(impacto, 'sacudon');
  check('unidad marcada esRevelacion -> intencion revelar', eImpacto.intencion === 'revelar');
  check('revelar sube la energia respecto de la intensidad base (0.55 -> media, +1 -> alta)', eImpacto.energia === 'alta');
  check('elemento principal es una cifra cuando hay tipoDatoDestacado', eImpacto.elementoPrincipal.tipo === 'cifra');
  check('con 2 offsets de audio se genera elementoSecundario', !!eImpacto.elementoSecundario);
  check('microeventos incluyen se_revela_comparacion anclado al offset real', eImpacto.microeventos.some((m) => m.tipo === 'se_revela_comparacion' && m.enSegRelativo === 2.6));

  // Cierre -> cerrar, salida corte_limpio siempre (aunque el elemento
  // principal sea una cifra -- el cierre nunca deja un ancla suelta).
  const cierre: ContextoUnidad = {
    unidadId: 'cierre', categoria: 'texto', intensidadComponente: 0.7,
    indice: 6, total: 7, duracionSegTotal: 3, offsetsAudioSeg: [0, 1.8], esCierre: true,
  };
  const eCierre = director.planificar(cierre, 'negro');
  check('esCierre -> intencion cerrar', eCierre.intencion === 'cerrar');
  check('cierre siempre sale con corte_limpio', eCierre.salida.tipo === 'corte_limpio');

  // Pausa real (intensidad baja, escena corta, 1 audio) -> dejar_respirar.
  const pausa: ContextoUnidad = {
    unidadId: 'pausa', categoria: 'texto', intensidadComponente: 0.35,
    indice: 3, total: 7, duracionSegTotal: 1.8, offsetsAudioSeg: [0],
  };
  const ePausa = director.planificar(pausa, 'ninguno');
  check('unidad tipo pausa -> intencion dejar_respirar', ePausa.intencion === 'dejar_respirar');
  check('dejar_respirar -> respiracion=true', ePausa.respiracion === true);
  check('dejar_respirar -> energia baja sin importar ajustes de estilo', ePausa.energia === 'baja');
  check('dejar_respirar -> densidadVisual minima', ePausa.densidadVisual === 'minima');
  check('dejar_respirar -> pocos microeventos (2, ver test_microeventos)', ePausa.microeventos.length === 2);

  // estilosSugeridos tiene prioridad sobre la base por intencion.
  const conSugerencia: ContextoUnidad = {
    unidadId: 'desarrollo', categoria: 'timeline', intensidadComponente: 0.35,
    indice: 1, total: 7, duracionSegTotal: 12, offsetsAudioSeg: [0, 3.7, 7],
    estilosSugeridos: ['storytelling'],
  };
  const eConSugerencia = director.planificar(conSugerencia, 'fundido');
  check('estilo sugerido aparece primero en la lista final', eConSugerencia.estilos[0] === 'storytelling');

  // Comparacion siempre es intencion "comparar" salvo que sea revelacion/cierre/primera.
  const comparacionSimple: ContextoUnidad = {
    unidadId: 'c1', categoria: 'comparacion', intensidadComponente: 0.4,
    indice: 2, total: 7, duracionSegTotal: 6, offsetsAudioSeg: [0],
  };
  const eComparacion = director.planificar(comparacionSimple, 'raya');
  check('categoria comparacion (sin ser revelacion/cierre/primera) -> intencion comparar', eComparacion.intencion === 'comparar');

  // razonGeneral siempre es un texto no vacio (auditable).
  check('razonGeneral no esta vacio', eHook.razonGeneral.length > 0 && eImpacto.razonGeneral.length > 0);

  if (FALLOS.length) {
    console.log(`\n${FALLOS.length} FALLO(S):\n`);
    for (const f of FALLOS) console.log(f);
    process.exit(1);
  }
  console.log('Todos los tests del Director de Edicion pasaron OK.');
}

main();
