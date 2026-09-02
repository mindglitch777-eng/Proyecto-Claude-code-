/**
 * Biblioteca de estilos de edicion (orden maestra, secciones 10-11).
 * Cada estilo es un CONJUNTO DE PRINCIPIOS + tendencias declaradas, no
 * una plantilla rigida de "en la escena X hace Y". Se combinan (nunca
 * al azar: `combinarEstilos` revisa `compatibleCon` y advierte, nunca
 * bloquea, una combinacion atipica -- heuristica, no una regla dura).
 *
 * Agregar un estilo nuevo: una entrada en `ESTILOS` + el literal
 * `EstiloId` en tipos.ts. `edicion.ts` (el Director) no necesita
 * cambiar -- lee este registro igual que directores/visual.ts lee
 * componentes/registro.json.
 */
import type {DensidadVisual, EstiloId, FuncionTransicion, TipoMicroEvento} from './tipos';

export type PerfilEstilo = {
  id: EstiloId;
  nombre: string;
  /** Principios reutilizables (orden maestra, seccion 4: "BIEN: cuando
   * una informacion adquiere protagonismo, el sistema PUEDE usar
   * movimiento de escala..." -- nunca una receta tipo "en esta escena
   * usar un zoom"). Sirven de documentacion legible y de contexto para
   * la critica editorial, no se "ejecutan" literalmente. */
  principios: string[];
  densidadVisualPreferida: DensidadVisual;
  /** -1 (calma) a +1 (extremo) -- se promedia con los demas estilos de
   * la combinacion en combinarEstilos(). */
  ajusteEnergia: number;
  funcionesTransicionPreferidas: FuncionTransicion[];
  tiposMicroEventoPreferidos: TipoMicroEvento[];
  /** Otros estilos con los que combina bien SEGUN esta ficha (la
   * relacion no necesita ser simetrica en los datos -- combinarEstilos
   * la trata como simetrica revisando ambos lados). */
  compatibleCon: EstiloId[];
};

export const ESTILOS: Record<EstiloId, PerfilEstilo> = {
  documental: {
    id: 'documental',
    nombre: 'Documental cinematografico',
    principios: [
      'Preferir un asset real (b-roll/foto) sobre texto solo cuando exista uno relevante -- si no existe, FALTANTE explicito, nunca un generico solo para llenar espacio.',
      'Movimiento sutil (paneo, zoom lento) en vez de cortes duros o sacudones.',
      'La informacion se entrega progresivamente, un dato por vez -- no una lista completa de golpe.',
      'El ritmo puede sostenerse mas tiempo del habitual si la imagen sigue aportando contexto real.',
    ],
    densidadVisualPreferida: 'moderada',
    ajusteEnergia: -0.3,
    funcionesTransicionPreferidas: ['dar_continuidad', 'sin_funcion_especial'],
    tiposMicroEventoPreferidos: ['entra_elemento_principal', 'aparece_dato_apoyo'],
    compatibleCon: ['data', 'storytelling', 'cinematico', 'agresivo'],
  },
  agresivo: {
    id: 'agresivo',
    nombre: 'Agresivo / viral',
    principios: [
      'Cifras grandes, contraste fuerte de color para dirigir la mirada.',
      'SFX marcando cada revelacion o impacto -- nunca un SFX sin una razon (seccion 13).',
      'Aceleraciones y frenos deliberados: el ritmo parejo es lo que se quiere evitar, no el movimiento en si.',
    ],
    densidadVisualPreferida: 'densa',
    ajusteEnergia: 0.6,
    funcionesTransicionPreferidas: ['dirigir_atencion', 'preparar_impacto', 'crear_contraste'],
    tiposMicroEventoPreferidos: ['cambia_cifra', 'entra_sfx', 'cambia_encuadre'],
    compatibleCon: ['data', 'documental', 'storytelling'],
  },
  data: {
    id: 'data',
    nombre: 'Data / business',
    principios: [
      'Una cifra necesita contexto visual (de donde sale, con que se compara) -- no debe aparecer sola sin ningun apoyo.',
      'Si hay dos valores relacionados, preferir una comparacion antes que dos cifras sueltas en escenas separadas.',
      'El crecimiento se muestra como DIRECCION (una curva, un antes/despues), no solo como la cifra final.',
    ],
    densidadVisualPreferida: 'moderada',
    ajusteEnergia: 0,
    funcionesTransicionPreferidas: ['dirigir_atencion', 'dar_continuidad'],
    tiposMicroEventoPreferidos: ['cambia_cifra', 'se_revela_comparacion', 'aparece_dato_apoyo'],
    compatibleCon: ['documental', 'agresivo', 'cinematico', 'storytelling', 'misterio'],
  },
  misterio: {
    id: 'misterio',
    nombre: 'Investigacion / misterio',
    principios: [
      'Informacion PARCIAL primero, completa despues -- nunca revelar todo de una vez.',
      'Resaltar/enfocar un detalle especifico antes de mostrar la revelacion completa.',
      'Sostener la tension: evitar SFX de impacto antes del momento de revelacion real.',
    ],
    densidadVisualPreferida: 'minima',
    ajusteEnergia: -0.2,
    funcionesTransicionPreferidas: ['preparar_impacto', 'crear_contraste'],
    tiposMicroEventoPreferidos: ['aparece_dato_apoyo', 'se_revela_comparacion'],
    compatibleCon: ['storytelling', 'cinematico', 'data'],
  },
  storytelling: {
    id: 'storytelling',
    nombre: 'Storytelling',
    principios: [
      'Personaje/contexto antes que dato -- el numero llega despues de establecer a quien le paso.',
      'Arco real: problema -> desarrollo -> giro -> consecuencia, no una lista plana de hechos.',
      'El cierre conecta con el hook (mismo personaje/objeto/idea), no es un dato mas.',
    ],
    densidadVisualPreferida: 'moderada',
    ajusteEnergia: 0,
    funcionesTransicionPreferidas: ['dar_continuidad', 'marcar_cambio'],
    tiposMicroEventoPreferidos: ['entra_elemento_principal', 'entra_elemento_secundario'],
    compatibleCon: ['documental', 'cinematico', 'misterio', 'data', 'agresivo'],
  },
  cinematico: {
    id: 'cinematico',
    nombre: 'Cinematico',
    principios: [
      'Un elemento protagonista por momento -- el resto se subordina en tamano/opacidad/posicion.',
      'Las pausas estan motivadas por la narrativa, nunca son un relleno.',
      'Transiciones suaves salvo que el guion pida explicitamente un quiebre de lenguaje.',
    ],
    densidadVisualPreferida: 'minima',
    ajusteEnergia: -0.4,
    funcionesTransicionPreferidas: ['dar_continuidad', 'sin_funcion_especial'],
    tiposMicroEventoPreferidos: ['entra_elemento_principal'],
    compatibleCon: ['documental', 'storytelling', 'misterio', 'data'],
  },
};

export type CombinacionEstilos = {
  ids: EstiloId[];
  densidadVisual: DensidadVisual;
  ajusteEnergia: number;
  principios: string[];
  funcionesTransicionPreferidas: FuncionTransicion[];
  tiposMicroEventoPreferidos: TipoMicroEvento[];
  /** Heuristico, nunca bloquea (seccion 11: "la combinacion debe
   * producir una estrategia coherente, no mezclar cosas al azar" se
   * interpreta como ADVERTIR cuando dos estilos no se declaran
   * compatibles entre si, no como prohibir la combinacion -- el
   * generador/operador puede tener una razon real que esta biblioteca
   * no anticipo). */
  advertencias: string[];
};

/** Combina 1+ estilos en una unica estrategia coherente. El ORDEN
 * importa: el primero tiene mayor prioridad cuando dos estilos piden
 * cosas distintas para `densidadVisual` (un solo valor posible). El
 * resto de los campos se UNE (principios, funciones, microeventos) o
 * se PROMEDIA (energia) porque tiene sentido que convivan varios a la
 * vez dentro de la misma unidad. */
export function combinarEstilos(ids: EstiloId[]): CombinacionEstilos {
  if (ids.length === 0) throw new Error('combinarEstilos requiere al menos un estilo');
  const perfiles = ids.map((id) => ESTILOS[id]);

  const advertencias: string[] = [];
  for (let i = 1; i < perfiles.length; i++) {
    const a = perfiles[0];
    const b = perfiles[i];
    if (!a.compatibleCon.includes(b.id) && !b.compatibleCon.includes(a.id)) {
      advertencias.push(
        `combinar "${a.id}" + "${b.id}" no es una combinacion tipica declarada en estilos.ts -- ` +
        `revisar si tiene sentido para esta unidad o si conviene elegir otro estilo secundario`
      );
    }
  }

  return {
    ids,
    densidadVisual: perfiles[0].densidadVisualPreferida,
    ajusteEnergia: perfiles.reduce((suma, p) => suma + p.ajusteEnergia, 0) / perfiles.length,
    principios: [...new Set(perfiles.flatMap((p) => p.principios))],
    funcionesTransicionPreferidas: [...new Set(perfiles.flatMap((p) => p.funcionesTransicionPreferidas))],
    tiposMicroEventoPreferidos: [...new Set(perfiles.flatMap((p) => p.tiposMicroEventoPreferidos))],
    advertencias,
  };
}
