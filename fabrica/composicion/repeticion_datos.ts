/**
 * Tratamiento de datos repetidos (Ronda 3, calidad visual, item 5/12
 * del pedido): "si ya mostramos 2.847, despues no necesitamos volver
 * a mostrar exactamente 2.847 de la misma manera". La repeticion NO
 * debe ser automatica -- este modulo hace esa decision explicita,
 * DENTRO de un mismo video (la memoria cross-video de
 * fabrica/memoria/api.ts sigue siendo para anti-repeticion de
 * COMPONENTES, esto es otra cosa: valores concretos).
 *
 * No es una IA "entendiendo" la narrativa -- es una regla explicita,
 * declarada como tal: la primera vez que un valor (mismo numero,
 * mismo tipo de dato) aparece como CIFRA PROTAGONISTA en el video, se
 * "establece"; la segunda vez, el llamador tiene que elegir una de 3
 * alternativas reales (reformular, mostrar una consecuencia derivada,
 * u omitir el destaque) en vez de repetir el mismo numero grande de
 * nuevo. "Reutilizar" sigue siendo valido cuando tiene sentido (ver
 * `decidirTratamientoValor`), no esta prohibido -- la seccion 5 del
 * pedido es explicita: "A) se reutiliza porque tiene sentido" es una
 * opcion real, no la unica.
 */

export type TipoDato = 'dinero' | 'cantidad' | 'porcentaje' | 'anio' | 'fecha' | 'ranking' | 'otro';

export type ValorEstablecido = {
  valor: number;
  tipoDato: TipoDato;
  unidadId: string; // en que unidad narrativa se mostro por primera vez
};

export type Tratamiento = 'reutilizar' | 'reformular' | 'consecuencia' | 'omitir_destaque';

export type DecisionRepeticion = {
  tratamiento: Tratamiento;
  razon: string;
  /** Solo si tratamiento==='consecuencia': un valor derivado real
   * (ej. total = precio * cantidad) que el llamador puede mostrar EN
   * VEZ del valor ya establecido -- nunca inventado sin base, siempre
   * una operacion real sobre datos ya conocidos. */
  valorDerivado?: number;
};

/**
 * Decide que hacer con un valor que se quiere mostrar como cifra
 * protagonista.
 *
 * Regla real (no heuristica de "sensacion", una condicion concreta):
 * - Si el valor (mismo numero + mismo tipoDato) NUNCA se establecio
 *   en este video -> 'reutilizar' (es la primera vez, se muestra tal
 *   cual).
 * - Si ya se establecio Y se pide `derivarConsecuencia` (el llamador
 *   sabe calcular algo real a partir de valores ya conocidos, ej.
 *   precio x cantidad) -> 'consecuencia', con el valor derivado.
 * - Si ya se establecio y NO hay una consecuencia real que calcular
 *   -> 'omitir_destaque': el dato se puede seguir MENCIONANDO en la
 *   narracion/texto de apoyo (la voz puede repetirlo, es natural en
 *   español reforzar un numero clave), pero no se vuelve a montar
 *   como la cifra gigante protagonista de una escena nueva.
 */
export function decidirTratamientoValor(params: {
  valor: number;
  tipoDato: TipoDato;
  unidadActual: string;
  yaEstablecidos: ValorEstablecido[];
  derivarConsecuencia?: (valorPrevio: number) => number;
}): DecisionRepeticion {
  const {valor, tipoDato, yaEstablecidos, derivarConsecuencia} = params;
  const previo = yaEstablecidos.find((v) => v.valor === valor && v.tipoDato === tipoDato);

  if (!previo) {
    return {
      tratamiento: 'reutilizar',
      razon: `primera vez que "${valor}" (${tipoDato}) aparece como cifra protagonista en este video -- se establece`,
    };
  }

  if (derivarConsecuencia) {
    const valorDerivado = derivarConsecuencia(previo.valor);
    return {
      tratamiento: 'consecuencia',
      razon: `"${valor}" (${tipoDato}) ya se establecio en la unidad "${previo.unidadId}" -- en vez de repetirlo, se muestra la consecuencia real derivada (${valorDerivado})`,
      valorDerivado,
    };
  }

  return {
    tratamiento: 'omitir_destaque',
    razon: `"${valor}" (${tipoDato}) ya se establecio en la unidad "${previo.unidadId}" y no hay una consecuencia real para derivar -- no se vuelve a montar como cifra protagonista (la narracion puede seguir mencionandolo en texto de apoyo)`,
  };
}

/** Registra un valor como "ya establecido" -- se llama despues de
 * decidir 'reutilizar' o 'consecuencia' (un valor derivado tambien
 * queda establecido, para no re-derivarlo dos veces). */
export function registrarValorEstablecido(
  lista: ValorEstablecido[],
  valor: number,
  tipoDato: TipoDato,
  unidadId: string
): ValorEstablecido[] {
  return [...lista, {valor, tipoDato, unidadId}];
}
