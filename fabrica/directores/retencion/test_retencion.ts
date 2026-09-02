import {DirectorRetencion} from './retencion';
import type {ArbolComposicion, EscenaComposicion} from '../../composicion/tipos';
import type {EstrategiaEdicion, IntencionEdicion, NivelEnergia} from '../edicion/tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

const director = new DirectorRetencion();

function estrategia(intencion: IntencionEdicion, energia: NivelEnergia): EstrategiaEdicion {
  return {
    unidadId: 'x', intencion, energia, densidadVisual: 'moderada', estilos: ['documental'],
    elementoPrincipal: {tipo: 'concepto', descripcion: 'x'},
    entrada: {tipo: 'inmediata', razon: 'x'}, salida: {tipo: 'corte_limpio', razon: 'x'},
    transicion: {golpe: 'corte', motivo: 'x', funcion: 'sin_funcion_especial', intensidad: energia},
    microeventos: [], relacionConAnterior: 'x', respiracion: intencion === 'dejar_respirar',
    razonGeneral: 'x',
  };
}

function escena(id: string, dur: number, intencion?: IntencionEdicion, energia: NivelEnergia = 'media'): EscenaComposicion {
  return {
    unidadId: id, desdeSeg: 0, duracionSeg: dur, componenteId: 'punch', props: {}, audios: [],
    golpe: 'corte', volumenSfx: 0.5,
    ...(intencion ? {estrategiaEdicion: estrategia(intencion, energia)} : {}),
  };
}

function arbol(escenas: EscenaComposicion[]): ArbolComposicion {
  return {id: 'test', fps: 30, escenas, duracionTotalSeg: escenas.reduce((s, e) => s + e.duracionSeg, 0)};
}

function main() {
  // Arco "sano": hook -> desarrollo -> escalada -> revelacion -> cierre.
  const sano = arbol([
    escena('hook', 5, 'enganchar', 'alta'),
    escena('desarrollo', 8, 'contextualizar', 'media'),
    escena('escalada', 4, 'construir_tension', 'alta'),
    escena('revelacion', 6, 'revelar', 'muy_alta'),
    escena('cierre', 3, 'cerrar', 'alta'),
  ]);
  const mapaSano = director.analizarVideo(sano);
  check('mapa tiene 5 puntos', mapaSano.mapa.length === 5);
  check('primera fase es hook', mapaSano.mapa[0].fase === 'hook');
  check('la revelacion queda marcada como climax (mayor energia entre no-hook/no-cierre)', mapaSano.mapa.find((p) => p.unidadId === 'revelacion')!.esClimax);
  check('arco sano no alerta hook_debil', !mapaSano.alertas.some((a) => a.tipo === 'hook_debil'));
  check('arco sano no alerta promesa_poco_clara (hay desarrollo antes de la escalada)', !mapaSano.alertas.some((a) => a.tipo === 'promesa_poco_clara'));
  check('arco sano no alerta sin_escalada_visible', !mapaSano.alertas.some((a) => a.tipo === 'sin_escalada_visible'));
  check('arco sano no alerta caida_energia_antes_del_climax (escalada alta -> revelacion muy_alta, sube)', !mapaSano.alertas.some((a) => a.tipo === 'caida_energia_antes_del_climax'));

  // Hook debil: primera unidad no es 'enganchar'.
  const hookDebil = arbol([
    escena('u1', 5, 'contextualizar'),
    escena('u2', 5, 'cerrar'),
  ]);
  check('hook debil detectado cuando la primera unidad no es enganchar', director.analizarVideo(hookDebil).alertas.some((a) => a.tipo === 'hook_debil'));

  // Promesa poco clara: hook seguido DIRECTO de escalada, sin desarrollo.
  const sinPromesa = arbol([
    escena('hook', 5, 'enganchar'),
    escena('escalada', 5, 'construir_tension'),
    escena('cierre', 3, 'cerrar'),
  ]);
  check('promesa poco clara detectada (escalada pega directo despues del hook)', director.analizarVideo(sinPromesa).alertas.some((a) => a.tipo === 'promesa_poco_clara'));

  // Tramo sin evolucion: 3 escenas seguidas en la misma fase 'desarrollo'.
  const tramoPlano = arbol([
    escena('hook', 5, 'enganchar'),
    escena('d1', 4, 'contextualizar'),
    escena('d2', 4, 'contextualizar'),
    escena('d3', 4, 'contextualizar'),
    escena('cierre', 3, 'cerrar'),
  ]);
  const alertasPlano = director.analizarVideo(tramoPlano).alertas;
  check('tramo sin evolucion detectado (3 desarrollo seguidos)', alertasPlano.some((a) => a.tipo === 'tramo_sin_evolucion'));

  // Sin escalada visible: nunca hay fase 'escalada'.
  const sinEscalada = arbol([
    escena('hook', 5, 'enganchar'),
    escena('d1', 5, 'contextualizar'),
    escena('rev', 5, 'revelar'),
    escena('cierre', 3, 'cerrar'),
  ]);
  check('sin escalada visible detectado', director.analizarVideo(sinEscalada).alertas.some((a) => a.tipo === 'sin_escalada_visible'));

  // Cierre con poca energia tras tramos de energia alta.
  const cierreFlojo = arbol([
    escena('hook', 5, 'enganchar', 'alta'),
    escena('esc', 5, 'construir_tension', 'muy_alta'),
    escena('cierre', 3, 'cerrar', 'baja'),
  ]);
  check('cierre con poca energia detectado tras tramo de energia alta', director.analizarVideo(cierreFlojo).alertas.some((a) => a.tipo === 'cierre_con_poca_energia'));

  // Caida de energia antes del climax: la energia baja A MITAD del
  // tramo de construccion (media -> baja) antes de llegar al climax
  // (muy_alta) -- un bache en la escalada, no una comparacion directa
  // contra el climax (eso es imposible por definicion, ver retencion.ts).
  const caidaAntesClimax = arbol([
    escena('hook', 5, 'enganchar', 'alta'),
    escena('sube', 5, 'construir_tension', 'media'),
    escena('bache', 5, 'construir_tension', 'baja'),
    escena('climax', 5, 'revelar', 'muy_alta'),
    escena('cierre', 3, 'cerrar', 'media'),
  ]);
  check('caida de energia antes del climax detectada', director.analizarVideo(caidaAntesClimax).alertas.some((a) => a.tipo === 'caida_energia_antes_del_climax'));

  // Escenas SIN estrategiaEdicion (arbol viejo, demo_01..04): no debe
  // romper, todo queda 'sin_clasificar', sin alertas inventadas sobre
  // datos que no existen mas alla de hook_debil (que es real: la
  // primera fase efectivamente no es 'hook').
  const arbolViejo = arbol([escena('a', 5), escena('b', 5), escena('c', 5)]);
  const mapaViejo = director.analizarVideo(arbolViejo);
  check('arbol sin estrategiaEdicion no rompe', mapaViejo.mapa.every((p) => p.fase === 'sin_clasificar'));
  check('arbol sin estrategiaEdicion no crashea al buscar climax (energia default pareja, el primer candidato lo marca)', mapaViejo.mapa.filter((p) => p.esClimax).length === 1);

  // R7-5: si ninguna unidad declara patronesRetencion (el caso de
  // siempre hasta ahora), MapaRetencion no trae patronesUsados -- cero
  // cambios para todo arbol anterior a Ronda 7.
  check('sin patronesRetencion declarados, patronesUsados queda ausente', director.analizarVideo(arbolViejo).patronesUsados === undefined);

  // R7-5: cuando SI se declaran, el Director de Retencion resuelve
  // cada patron contra su evidencia real y reporta de que unidades depende.
  const conPatrones = arbol([
    {...escena('hook', 5, 'enganchar'), patronesRetencion: ['contexto-parcial', 'loop-abierto']},
    escena('cierre', 5, 'cerrar'),
  ]);
  const mapaConPatrones = director.analizarVideo(conPatrones);
  check('patronesUsados tiene los 2 patrones declarados', mapaConPatrones.patronesUsados?.length === 2);
  const contextoParcial = mapaConPatrones.patronesUsados?.find((p) => p.patronId === 'contexto-parcial');
  check('responde que patron (nombre real, no el id crudo)', contextoParcial?.nombre === 'Contexto parcial');
  check('responde por que (no vacio)', !!contextoParcial?.porQue && contextoParcial.porQue.trim().length > 0);
  check('responde con que evidencia (item real del Knowledge Engine)', contextoParcial?.evidencia.length === 1 && contextoParcial.evidencia[0].id === 'loewenstein-1994-brecha-curiosidad');
  check('distingue evidencia real de heuristica/hipotesis', contextoParcial?.esHipotesisUObservado === 'evidencia_real');
  check('reporta de que unidad depende', contextoParcial?.dependeDe === 'hook');

  if (FALLOS.length) {
    console.log(`\n${FALLOS.length} FALLO(S):\n`);
    for (const f of FALLOS) console.log(f);
    process.exit(1);
  }
  console.log('Todos los tests del Director de Retencion pasaron OK.');
}

main();
