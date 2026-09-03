/**
 * Director de Edicion (Fase 13, Ronda 4). Transforma una unidad
 * narrativa YA resuelta por Director Visual + Director de Audio en una
 * ESTRATEGIA DE EDICION -- el "por que" y el "que pasa DENTRO de la
 * escena" que faltaba en la fabrica (orden maestra, seccion 2).
 *
 * Como DirectorVisual.consultar() y DirectorAudio.decidirParaUnidad(),
 * esto es METADATA-DRIVEN: decide a partir de categoria/intensidad/
 * posicion en el arco/tipo de dato, nunca "si unidadId === 'hook'
 * entonces...". El mismo metodo sirve para cualquier guion nuevo sin
 * tocar este archivo.
 *
 * Integracion deliberada (seccion 5, "no romper la arquitectura"): NO
 * elige el golpe (eso lo sigue haciendo DirectorAudio.decidirParaUnidad,
 * que ya sabe de anti-repeticion de golpes) -- lo recibe como
 * parametro y le agrega la JUSTIFICACION (motivo/funcion) que antes no
 * existia en ningun lado del sistema.
 */
import type {TipoGolpe} from '../audio';
import {combinarEstilos} from './estilos';
import {construirMicroeventos} from './microeventos';
import {patronesCompatibles} from '../../hooks/consultar';
import type {
  ContextoUnidad, ElementoDestacado, EstiloId, EstrategiaEdicion, EstrategiaEntrada,
  EstrategiaSalida, FuncionTransicion, IntencionEdicion, NivelEnergia,
} from './tipos';

const ORDEN_ENERGIA: NivelEnergia[] = ['baja', 'media', 'alta', 'muy_alta'];

function subirEnergia(nivel: NivelEnergia, pasos: number): NivelEnergia {
  const idx = ORDEN_ENERGIA.indexOf(nivel);
  const nuevo = Math.max(0, Math.min(ORDEN_ENERGIA.length - 1, idx + pasos));
  return ORDEN_ENERGIA[nuevo];
}

const FUNCION_POR_INTENCION: Record<IntencionEdicion, FuncionTransicion> = {
  enganchar: 'dirigir_atencion',
  contextualizar: 'sin_funcion_especial',
  construir_tension: 'preparar_impacto',
  revelar: 'preparar_impacto',
  comparar: 'crear_contraste',
  dejar_respirar: 'sin_funcion_especial',
  acelerar: 'marcar_cambio',
  cerrar: 'marcar_cambio',
};

/** Estilos por defecto segun intencion -- punto de partida razonable,
 * NO una regla cerrada: `ctx.estilosSugeridos` (si el generador lo
 * pasa) se antepone porque tiene contexto mas especifico de la unidad. */
const ESTILOS_POR_INTENCION: Record<IntencionEdicion, EstiloId[]> = {
  enganchar: ['agresivo', 'documental'],
  contextualizar: ['documental'],
  construir_tension: ['misterio', 'cinematico'],
  revelar: ['misterio', 'agresivo'],
  comparar: ['data', 'documental'],
  dejar_respirar: ['cinematico'],
  acelerar: ['agresivo', 'data'],
  cerrar: ['cinematico', 'storytelling'],
};

export class DirectorEdicion {
  /**
   * @param evitarPatrones ids de fabrica/hooks/catalogo.ts usados
   * recientemente en ESTE video (mismo principio que `evitarGolpes` de
   * DirectorAudio.decidirParaUnidad) -- el llamador es quien conoce el
   * historial real, este método no lee memoria por sí mismo (mismo
   * principio arquitectónico que el resto de los Directores).
   */
  planificar(ctx: ContextoUnidad, golpeDecidido: TipoGolpe, evitarPatrones: string[] = []): EstrategiaEdicion {
    const intencion = this.decidirIntencion(ctx);
    const respiracion = intencion === 'dejar_respirar';

    const idsEstilos = this.decidirEstilos(intencion, ctx.estilosSugeridos);
    const combinacion = combinarEstilos(idsEstilos);

    const energia = this.decidirEnergia(ctx, intencion, combinacion.ajusteEnergia);
    const densidadVisual = respiracion ? 'minima' : combinacion.densidadVisual;

    const elementoPrincipal = this.decidirElementoPrincipal(ctx);
    const elementoSecundario = ctx.offsetsAudioSeg.length >= 2
      ? this.decidirElementoSecundario(ctx)
      : undefined;

    const entrada = this.decidirEntrada(ctx, energia, respiracion);
    const salida = this.decidirSalida(ctx, energia, elementoPrincipal);

    const transicion = {
      golpe: golpeDecidido,
      funcion: FUNCION_POR_INTENCION[intencion],
      intensidad: energia,
      motivo: `golpe "${golpeDecidido}" acompana una unidad con intencion "${intencion}" ` +
        `(elemento principal: ${elementoPrincipal.descripcion})`,
    };

    const microeventos = construirMicroeventos(ctx, combinacion, elementoPrincipal, elementoSecundario, respiracion);

    const relacionConAnterior = this.decidirRelacionConAnterior(ctx, intencion);

    const patronRetencionId = this.decidirPatronRetencion(intencion, evitarPatrones);

    const razonGeneral =
      `unidad "${ctx.unidadId}" (${ctx.indice + 1}/${ctx.total}, categoria=${ctx.categoria}): ` +
      `intencion=${intencion} (energia=${energia}, densidad=${densidadVisual}), ` +
      `estilos=[${idsEstilos.join('+')}]${combinacion.advertencias.length ? ` [${combinacion.advertencias.join('; ')}]` : ''}` +
      `${patronRetencionId ? `, patron_retencion=${patronRetencionId}` : ''}`;

    return {
      unidadId: ctx.unidadId,
      intencion,
      energia,
      densidadVisual,
      estilos: idsEstilos,
      elementoPrincipal,
      elementoSecundario,
      entrada,
      salida,
      transicion,
      microeventos,
      relacionConAnterior,
      respiracion,
      patronRetencionId,
      razonGeneral,
    };
  }

  /**
   * R7-15: elección automática de un patrón del Viral/Retention Engine
   * (fabrica/hooks/) compatible con la intención ya decidida --
   * conecta el catálogo (antes solo consultable a mano) a la decisión
   * real de edición. Misma lógica que `elegirGolpe` de
   * directores/audio.ts: primer candidato compatible que no esté en
   * `evitarPatrones`; si todos están usados, mejor repetir el primero
   * que romper (ningún patrón disponible es peor que uno repetido).
   */
  private decidirPatronRetencion(intencion: IntencionEdicion, evitarPatrones: string[]): string | undefined {
    const candidatos = patronesCompatibles(intencion);
    if (candidatos.length === 0) return undefined;
    const libre = candidatos.find((p) => !evitarPatrones.includes(p.id));
    return (libre ?? candidatos[0]).id;
  }

  private decidirIntencion(ctx: ContextoUnidad): IntencionEdicion {
    if (ctx.esPrimera) return 'enganchar';
    if (ctx.esRevelacion) return 'revelar';
    if (ctx.esCierre) return 'cerrar';
    if (ctx.categoria === 'comparacion') return 'comparar';

    // pausa real: intensidad muy baja, escena corta, un solo audio --
    // mismo patron que la unidad "pausa" de fabrica-demo-04 (Ronda 3).
    if (ctx.intensidadComponente <= 0.35 && ctx.duracionSegTotal <= 3 && ctx.offsetsAudioSeg.length <= 1) {
      return 'dejar_respirar';
    }

    const progreso = ctx.total > 1 ? ctx.indice / (ctx.total - 1) : 0;
    if (ctx.intensidadComponente >= 0.45 && progreso > 0.55) return 'acelerar';
    if (ctx.intensidadComponente >= 0.5 && progreso <= 0.55) return 'construir_tension';
    return 'contextualizar';
  }

  private decidirEstilos(intencion: IntencionEdicion, sugeridos?: EstiloId[]): EstiloId[] {
    const base = ESTILOS_POR_INTENCION[intencion];
    if (!sugeridos || sugeridos.length === 0) return base;
    // sugeridos primero (mayor prioridad, ver combinarEstilos), sin
    // duplicar los que ya estan en la base.
    return [...new Set([...sugeridos, ...base])];
  }

  private decidirEnergia(ctx: ContextoUnidad, intencion: IntencionEdicion, ajusteEnergia: number): NivelEnergia {
    let base: NivelEnergia = ctx.intensidadComponente >= 0.7 ? 'alta'
      : ctx.intensidadComponente >= 0.45 ? 'media' : 'baja';

    if (intencion === 'revelar' || intencion === 'enganchar') base = subirEnergia(base, 1);
    if (intencion === 'dejar_respirar') return 'baja';

    // ajusteEnergia viene de estilos.ts en [-1,1] -- se redondea a un
    // paso discreto (-1/0/+1) porque NivelEnergia son 4 escalones, no
    // un continuo.
    const paso = ajusteEnergia >= 0.34 ? 1 : ajusteEnergia <= -0.34 ? -1 : 0;
    return subirEnergia(base, paso);
  }

  private decidirElementoPrincipal(ctx: ContextoUnidad): ElementoDestacado {
    if (ctx.tipoDatoDestacado) {
      return {tipo: 'cifra', descripcion: `la cifra protagonista (${ctx.tipoDatoDestacado})`};
    }
    if (ctx.categoria === 'comparacion') {
      return {tipo: 'comparacion', descripcion: 'los dos lados de la comparacion'};
    }
    if (ctx.categoria === 'timeline' || ctx.categoria === 'lista') {
      return {tipo: 'concepto', descripcion: 'la progresion completa que se esta contando'};
    }
    return {tipo: 'concepto', descripcion: 'el mensaje central de la unidad'};
  }

  private decidirElementoSecundario(ctx: ContextoUnidad): ElementoDestacado {
    return {tipo: 'otro', descripcion: `informacion de apoyo que la narracion agrega despues (unidad "${ctx.unidadId}")`};
  }

  private decidirEntrada(ctx: ContextoUnidad, energia: NivelEnergia, respiracion: boolean): EstrategiaEntrada {
    if (ctx.esPrimera) {
      return {tipo: 'inmediata', razon: 'primera unidad del video (hook): capturar atencion desde el frame 0'};
    }
    if (respiracion) {
      return {tipo: 'diferida', razon: 'unidad de respiro: dejar que la escena anterior se asiente antes de introducir contenido nuevo'};
    }
    if (energia === 'alta' || energia === 'muy_alta') {
      return {tipo: 'inmediata', razon: 'energia alta: sin demora, para no perder el momentum que trae la unidad anterior'};
    }
    return {tipo: 'progresiva', razon: 'entrada gradual, coherente con una energia media/baja'};
  }

  private decidirSalida(ctx: ContextoUnidad, energia: NivelEnergia, elementoPrincipal: ElementoDestacado): EstrategiaSalida {
    if (ctx.esCierre) {
      return {tipo: 'corte_limpio', razon: 'cierre del video: no debe quedar nada pendiente despues'};
    }
    if (energia === 'alta' || energia === 'muy_alta') {
      return {tipo: 'corte_limpio', razon: 'ritmo acelerado: no hay tiempo narrativo para dejar un ancla visual'};
    }
    if (elementoPrincipal.tipo === 'cifra') {
      return {tipo: 'queda_como_ancla', razon: 'la cifra protagonista debe permanecer visible hasta el corte para que el espectador la retenga'};
    }
    return {tipo: 'se_desvanece', razon: 'transicion suave hacia la unidad siguiente, sin necesidad de un ancla visual'};
  }

  private decidirRelacionConAnterior(ctx: ContextoUnidad, intencion: IntencionEdicion): string {
    if (ctx.esPrimera) return 'abre el video -- no hay escena anterior con la cual relacionarse';
    if (intencion === 'revelar') return 'contrasta deliberadamente con la tension construida en las unidades anteriores';
    if (intencion === 'dejar_respirar') return 'da un respiro despues de la unidad anterior, a proposito sin agregar informacion nueva';
    if (intencion === 'comparar') return 'retoma un valor/concepto ya establecido antes para ponerlo en relacion con uno nuevo';
    return 'continua el desarrollo de la unidad anterior, sin quiebre deliberado de tono';
  }
}
