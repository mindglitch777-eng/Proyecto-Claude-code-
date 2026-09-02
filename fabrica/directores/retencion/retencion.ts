/**
 * Director de Retención 2.0 (Fase 14, Ronda 5). Ver tipos.ts para el
 * contrato completo y las decisiones de diseño.
 */
import type {ArbolComposicion} from '../../composicion/tipos';
import type {IntencionEdicion, NivelEnergia} from '../edicion/tipos';
import type {AlertaRetencion, FaseNarrativa, MapaRetencion, PatronUsadoInfo, PuntoMapa} from './tipos';
import {explicarPatron} from '../../hooks/consultar';

const FASE_POR_INTENCION: Record<IntencionEdicion, FaseNarrativa> = {
  enganchar: 'hook',
  contextualizar: 'desarrollo',
  construir_tension: 'escalada',
  revelar: 'revelacion',
  comparar: 'desarrollo',
  dejar_respirar: 'pausa',
  acelerar: 'escalada',
  cerrar: 'cierre',
};

const ORDEN_ENERGIA: NivelEnergia[] = ['baja', 'media', 'alta', 'muy_alta'];
const indiceEnergia = (n: NivelEnergia) => ORDEN_ENERGIA.indexOf(n);

const MIN_TRAMO_SIN_EVOLUCION = 3;

export class DirectorRetencion {
  /** Analiza el árbol COMPLETO ya armado (Composición, Ronda 4 con
   * `estrategiaEdicion` por escena) y construye el mapa + alertas.
   * Escenas sin `estrategiaEdicion` (árboles viejos, demo_01..04)
   * quedan como `sin_clasificar` -- no se inventa una intención que
   * nadie decidió. */
  analizarVideo(arbol: ArbolComposicion): MapaRetencion {
    const mapa = this.construirMapa(arbol);
    const alertas = this.detectarAlertas(mapa);
    const patronesUsados = this.resolverPatronesUsados(arbol);
    return {mapa, alertas, ...(patronesUsados ? {patronesUsados} : {})};
  }

  /** Ronda 7: si alguna unidad del árbol declaró `patronesRetencion`
   * (Viral/Retention Engine, fabrica/hooks/), resuelve cada patrón
   * usado contra su evidencia real y arma la lista de qué unidades
   * dependen de él -- responde las 4 preguntas de la directiva sin que
   * quien llama tenga que saber nada del catálogo de patrones. */
  private resolverPatronesUsados(arbol: ArbolComposicion): PatronUsadoInfo[] | undefined {
    const unidadesPorPatron = new Map<string, string[]>();
    for (const escena of arbol.escenas) {
      for (const patronId of escena.patronesRetencion ?? []) {
        const unidades = unidadesPorPatron.get(patronId) ?? [];
        unidades.push(escena.unidadId);
        unidadesPorPatron.set(patronId, unidades);
      }
    }
    if (unidadesPorPatron.size === 0) return undefined;

    return [...unidadesPorPatron.entries()].map(([patronId, unidades]) => {
      const explicacion = explicarPatron(patronId, unidades.join(', '));
      return {
        patronId,
        nombre: explicacion.patron.nombre,
        categoria: explicacion.patron.categoria,
        porQue: explicacion.porQue,
        evidencia: explicacion.evidencia,
        esHipotesisUObservado: explicacion.esHipotesisUObservado,
        dependeDe: explicacion.dependeDe,
      };
    });
  }

  private construirMapa(arbol: ArbolComposicion): PuntoMapa[] {
    const puntos: PuntoMapa[] = arbol.escenas.map((e) => {
      const est = e.estrategiaEdicion;
      return {
        unidadId: e.unidadId,
        fase: est ? FASE_POR_INTENCION[est.intencion] : 'sin_clasificar',
        energia: est?.energia ?? 'baja',
        duracionSeg: e.duracionSeg,
        esClimax: false,
      };
    });

    // Climax = mayor energia entre los puntos que NO son hook ni
    // cierre -- un CALCULO sobre el mapa, no una intencion declarada
    // (ver tipos.ts). Si hay empate, se queda con el primero (el que
    // construye tension antes suele ser el climax real, no el ultimo).
    const candidatos = puntos.filter((p) => p.fase !== 'hook' && p.fase !== 'cierre');
    if (candidatos.length > 0) {
      const maxEnergia = Math.max(...candidatos.map((p) => indiceEnergia(p.energia)));
      const climax = candidatos.find((p) => indiceEnergia(p.energia) === maxEnergia);
      if (climax) climax.esClimax = true;
    }

    return puntos;
  }

  private detectarAlertas(mapa: PuntoMapa[]): AlertaRetencion[] {
    const alertas: AlertaRetencion[] = [];
    if (mapa.length === 0) return alertas;

    // hook_debil: la primera unidad no es un hook real.
    if (mapa[0].fase !== 'hook') {
      alertas.push({
        tipo: 'hook_debil', severidad: 'alta',
        descripcion: 'la primera unidad del video no está clasificada como hook',
        razon: `unidad "${mapa[0].unidadId}" tiene fase "${mapa[0].fase}"`,
      });
    }

    // promesa_poco_clara: nada de "desarrollo" (contexto/promesa)
    // entre el hook y la primera escalada/revelacion -- salta directo
    // de enganchar a tension sin dar ningun contexto.
    const idxHook = mapa.findIndex((p) => p.fase === 'hook');
    const idxPrimeraTension = mapa.findIndex((p, i) => i > idxHook && (p.fase === 'escalada' || p.fase === 'revelacion'));
    if (idxHook === 0 && idxPrimeraTension === 1) {
      alertas.push({
        tipo: 'promesa_poco_clara', severidad: 'media',
        descripcion: 'el video pasa del hook directo a la escalada/revelación sin ninguna unidad de desarrollo/contexto en el medio',
        razon: `unidad "${mapa[idxPrimeraTension].unidadId}" (fase "${mapa[idxPrimeraTension].fase}") sigue inmediatamente al hook`,
      });
    }

    // tramo_sin_evolucion: 3+ escenas SEGUIDAS en la MISMA fase --
    // estructuralmente plano, sin importar que cada una use un
    // componente distinto (eso ya lo audita checks_composicion.py).
    let racha = 1;
    for (let i = 1; i <= mapa.length; i++) {
      const mismaFase = i < mapa.length && mapa[i].fase === mapa[i - 1].fase && mapa[i].fase !== 'sin_clasificar';
      if (mismaFase) {
        racha++;
      } else {
        if (racha >= MIN_TRAMO_SIN_EVOLUCION) {
          const tramo = mapa.slice(i - racha, i);
          alertas.push({
            tipo: 'tramo_sin_evolucion', severidad: 'media',
            descripcion: `${racha} unidades seguidas en la misma fase narrativa ("${tramo[0].fase}") sin avanzar el arco`,
            razon: `unidades: ${tramo.map((p) => p.unidadId).join(', ')}`,
          });
        }
        racha = 1;
      }
    }

    // caida_energia_antes_del_climax: en el tramo de construccion
    // hacia el climax (excluyendo el hook), la energia BAJA en algun
    // punto en vez de escalar sostenidamente. No compara contra el
    // climax en si (el climax es, por definicion, el maximo entre los
    // candidatos -- nada de ese tramo puede superarlo, comparar
    // directo nunca dispararia la alerta) sino contra el paso anterior
    // DENTRO del tramo de construccion.
    const idxClimax = mapa.findIndex((p) => p.esClimax);
    if (idxClimax > 1) {
      const tramo = mapa.slice(1, idxClimax + 1); // excluye el hook, incluye el climax
      for (let i = 1; i < tramo.length; i++) {
        if (indiceEnergia(tramo[i].energia) < indiceEnergia(tramo[i - 1].energia)) {
          alertas.push({
            tipo: 'caida_energia_antes_del_climax', severidad: 'baja',
            descripcion: 'la energía baja en algún punto del tramo de construcción hacia el climax, en vez de escalar sostenidamente',
            razon: `"${tramo[i - 1].unidadId}" (${tramo[i - 1].energia}) -> "${tramo[i].unidadId}" (${tramo[i].energia})`,
          });
          break; // reportar solo la primera caida real, no inundar de alertas
        }
      }
    }

    // cierre_con_poca_energia: hubo energia alta/muy_alta en algun
    // momento y el cierre termina en energia baja -- posible anticlimax.
    const huboEnergiaAlta = mapa.some((p) => indiceEnergia(p.energia) >= indiceEnergia('alta'));
    const cierre = mapa[mapa.length - 1];
    if (huboEnergiaAlta && cierre.fase === 'cierre' && cierre.energia === 'baja') {
      alertas.push({
        tipo: 'cierre_con_poca_energia', severidad: 'baja',
        descripcion: 'el video tuvo tramos de energía alta pero el cierre termina en energía baja -- posible sensación de anticlímax',
        razon: `cierre "${cierre.unidadId}" en energía "baja"`,
      });
    }

    // sin_escalada_visible: nunca aparece una fase de escalada en todo
    // el mapa -- el video puede sentirse plano en tension aunque tenga
    // una revelacion (revelar algo sin haber construido tension antes
    // pega menos fuerte).
    if (!mapa.some((p) => p.fase === 'escalada')) {
      alertas.push({
        tipo: 'sin_escalada_visible', severidad: 'baja',
        descripcion: 'ninguna unidad del video está clasificada como escalada -- si hay una revelación, puede llegar sin suficiente tensión construida antes',
        razon: `fases presentes: ${[...new Set(mapa.map((p) => p.fase))].join(', ')}`,
      });
    }

    return alertas;
  }
}
