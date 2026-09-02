/**
 * Director de Retención 2.0 (Ronda 5). Evoluciona de "etiquetar una
 * unidad como revelación" (Ronda 3, campo `esRevelacion` que ya
 * consume `DirectorAudio`) a analizar el VIDEO COMPLETO y construir
 * un mapa narrativo aproximado (orden maestra sección 4).
 *
 * Fuente de los datos: la `intencion` que YA decidió
 * `DirectorEdicion.planificar()` para cada unidad (Ronda 4) -- no se
 * inventa un análisis de guion en lenguaje natural (eso requeriría un
 * LLM pago corriendo desatendido, prohibido por la regla de $0, ver
 * PENDIENTES.md ítem 5). Este Director reinterpreta decisiones YA
 * tomadas por metadata, agregando la vista de "arco completo" que
 * faltaba.
 *
 * TODO lo que produce es HEURÍSTICO (orden maestra sección 2): un
 * `MapaRetencion` es una lectura aproximada, nunca una medición real
 * de si alguien va a seguir mirando. Las `alertas` son señales para
 * revisión humana, nunca una garantía ni un score de viralidad.
 */
import type {NivelEnergia} from '../edicion/tipos';

/** Las fases del arco de la orden maestra (sección 4), MÁS 'pausa'
 * (ya establecida como beat narrativo real desde Ronda 3 -- "dejar
 * respirar" no aparece en la lista literal del pedido pero es
 * exactamente el mismo tipo de fase, se agrega sin romper el
 * vocabulario pedido) y 'sin_clasificar' (nunca se fuerza una fase
 * cuando la intención no mapea claramente a ninguna). */
export type FaseNarrativa =
  | 'hook' | 'desarrollo' | 'escalada' | 'pausa' | 'revelacion' | 'cierre' | 'sin_clasificar';

export type PuntoMapa = {
  unidadId: string;
  fase: FaseNarrativa;
  energia: NivelEnergia;
  duracionSeg: number;
  /** true en, a lo sumo, un punto del mapa: el de mayor energía entre
   * los que no son hook ni cierre. Es un CÁLCULO sobre el mapa, no
   * una intención que alguien haya declarado -- ver `retencion.ts`. */
  esClimax: boolean;
};

export type TipoAlertaRetencion =
  | 'hook_debil' | 'promesa_poco_clara' | 'tramo_sin_evolucion'
  | 'caida_energia_antes_del_climax' | 'cierre_con_poca_energia'
  | 'sin_escalada_visible';

export type SeveridadAlerta = 'baja' | 'media' | 'alta';

export type AlertaRetencion = {
  tipo: TipoAlertaRetencion;
  severidad: SeveridadAlerta;
  descripcion: string;
  /** Qué datos concretos del mapa llevaron a esta alerta -- para que
   * sea auditable, no una afirmación sin base. */
  razon: string;
};

export type MapaRetencion = {
  mapa: PuntoMapa[];
  alertas: AlertaRetencion[];
};
