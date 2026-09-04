/**
 * Traductores universales: Ficha metadata → props de componente
 *
 * Cada tipo de escena (numero, versus, lista, etc.) mapea a múltiples
 * componentes posibles. El director elige cuál; el traductor adapta
 * los campos Ficha al formato que ese componente espera.
 *
 * Principio: si el director elige "torre-3d" para un "numero", o
 * "contador" para el mismo "numero", el traductor maneja ambos.
 * Metadatos Ficha siempre idénticos; traducción distinta por componente.
 */

export interface MetadataFicha {
  tipo: 'numero' | 'versus' | 'lista' | 'cadena' | 'cronologia' | 'pantalla' | 'frase' | 'cuenta_regresiva' | 'encuesta' | 'montaje';
  intensidad: 'baja' | 'media' | 'alta' | 'muy_alta';
  campos: Record<string, string | number | string[]>;
}

// ============================================================================
// TIPO: numero
// ============================================================================

export interface PropsNumero {
  valor: number | string;
  etiqueta?: string;
  esDestello?: boolean; // para torre-3d o contador con animación de impacto
}

export function traducirNumero(
  componente: string,
  ficha: MetadataFicha
): PropsNumero {
  const { dato, etiqueta } = ficha.campos as Record<string, any>;

  if (!dato) {
    throw new Error(`Numero: campo 'dato' requerido, recibido: ${JSON.stringify(ficha.campos)}`);
  }

  return {
    valor: dato,
    etiqueta: etiqueta || undefined,
    esDestello: ficha.intensidad === 'muy_alta', // para torre-3d: hace crecer mientras cuenta
  };
}

// ============================================================================
// TIPO: versus
// ============================================================================

export interface PropsVersus {
  lado1: string;
  lado2: string;
  ganadorEs: 1 | 2 | null; // cuál lado "pesa más"
}

export function traducirVersus(
  componente: string,
  ficha: MetadataFicha
): PropsVersus {
  const { lado1, lado2 } = ficha.campos as Record<string, any>;

  if (!lado1 || !lado2) {
    throw new Error(
      `Versus: campos 'lado1' y 'lado2' requeridos, recibido: ${JSON.stringify(ficha.campos)}`
    );
  }

  // Lógica simple: "lado2" tiende a ganar en la mayoría de los scripts de Ficha
  // (ej: "Tiempo" vs "Activo digital" → gana Activo digital).
  // Si necesitas invertir, el director puede modificar este score en generar_demo_NN.ts
  const ganadorEs = ficha.intensidad === 'muy_alta' ? 2 : null; // null = ambos pesan igual

  return { lado1, lado2, ganadorEs };
}

// ============================================================================
// TIPO: lista
// ============================================================================

export interface PropsLista {
  items: string[];
  itemsTachados?: number[]; // índices de items que se tachan
  itemResaltado?: number;   // cuál sobrevive/resalta
}

export function traducirLista(
  componente: string,
  ficha: MetadataFicha
): PropsLista {
  const { items } = ficha.campos as Record<string, any>;

  if (!items || !Array.isArray(items)) {
    throw new Error(
      `Lista: campo 'items' debe ser array, recibido: ${JSON.stringify(ficha.campos)}`
    );
  }

  // Por defecto: si hay multiple items, los primeros se tachan, el último resalta
  const itemResaltado = items.length - 1;
  const itemsTachados = items.length > 1 ? Array.from({ length: items.length - 1 }, (_, i) => i) : [];

  return { items, itemsTachados, itemResaltado };
}

// ============================================================================
// TIPO: cadena
// ============================================================================

export interface PropsCadena {
  pasos: string[];
  dirigidoA?: 'izq_der' | 'arriba_abajo' | 'flujo_libre';
}

export function traducirCadena(
  componente: string,
  ficha: MetadataFicha
): PropsCadena {
  const { pasos } = ficha.campos as Record<string, any>;

  if (!pasos || !Array.isArray(pasos)) {
    throw new Error(
      `Cadena: campo 'pasos' debe ser array, recibido: ${JSON.stringify(ficha.campos)}`
    );
  }

  // Nodos dibujados a mano: por defecto flujo izq → der
  return { pasos, dirigidoA: 'izq_der' };
}

// ============================================================================
// TIPO: cronologia
// ============================================================================

export interface PropsCronologia {
  hitos: string[]; // "Mes 1: empezó solo", "Mes 6: armó equipo", etc.
  esTimeline?: boolean; // si es timeline con barras (cantidad/plata), vs línea de hitos
}

export function traducirCronologia(
  componente: string,
  ficha: MetadataFicha
): PropsCronologia {
  const { hitos } = ficha.campos as Record<string, any>;

  if (!hitos || !Array.isArray(hitos)) {
    throw new Error(
      `Cronologia: campo 'hitos' debe ser array, recibido: ${JSON.stringify(ficha.campos)}`
    );
  }

  // Detectar si es timeline con números (crecimiento): si un hito menciona cantidad/dinero
  const esTimeline = hitos.some((h: string) => /\d+%|\$|dinero|cantidad|crecimiento/.test(h));

  return { hitos, esTimeline };
}

// ============================================================================
// TIPO: pantalla
// ============================================================================

export interface PropsPantalla {
  textos: string[];
  tipo: 'chat' | 'buscador' | 'notificaciones' | 'generico';
  alineacion?: 'arriba' | 'centro' | 'abajo';
}

export function traducirPantalla(
  componente: string,
  ficha: MetadataFicha
): PropsPantalla {
  const { texto } = ficha.campos as Record<string, any>;

  if (!texto) {
    throw new Error(`Pantalla: campo 'texto' requerido, recibido: ${JSON.stringify(ficha.campos)}`);
  }

  const textos = Array.isArray(texto) ? texto : [texto];

  // Detectar tipo de pantalla por keywords
  let tipoPantalla: 'chat' | 'buscador' | 'notificaciones' | 'generico' = 'generico';
  const textoJunto = textos.join(' ').toLowerCase();

  if (/buscar|búsqueda|search|query/.test(textoJunto)) {
    tipoPantalla = 'buscador';
  } else if (/mensaje|chat|conversa|whatsapp|telegram|dm|reply/.test(textoJunto)) {
    tipoPantalla = 'chat';
  } else if (/notificación|notification|alerta|pop-up|bell/.test(textoJunto)) {
    tipoPantalla = 'notificaciones';
  }

  return { textos, tipo: tipoPantalla, alineacion: 'centro' };
}

// ============================================================================
// TIPO: frase
// ============================================================================

export interface PropsFrase {
  lineas: string[]; // si `lineas: "A / B / C"`, se parte en ["A", "B", "C"]
  impacto: 'suave' | 'medio' | 'fuerte';
}

export function traducirFrase(
  componente: string,
  ficha: MetadataFicha
): PropsFrase {
  const { lineas } = ficha.campos as Record<string, any>;

  if (!lineas) {
    throw new Error(`Frase: campo 'lineas' requerido, recibido: ${JSON.stringify(ficha.campos)}`);
  }

  const lineasArray = typeof lineas === 'string'
    ? lineas.split('/').map((l: string) => l.trim())
    : Array.isArray(lineas)
      ? lineas
      : [lineas.toString()];

  const impacto = ficha.intensidad === 'muy_alta' ? 'fuerte' : ficha.intensidad === 'alta' ? 'medio' : 'suave';

  return { lineas: lineasArray, impacto };
}

// ============================================================================
// TIPO: cuenta_regresiva
// ============================================================================

export interface PropsCuentaRegresiva {
  desde: number;
  hasta: number;
  duracionSeg?: number; // tiempo de la cuenta (estimado, el editor decide)
}

export function traducirCuentaRegresiva(
  componente: string,
  ficha: MetadataFicha
): PropsCuentaRegresiva {
  const { desde, hasta } = ficha.campos as Record<string, any>;

  if (desde === undefined || hasta === undefined) {
    throw new Error(
      `CuentaRegresiva: campos 'desde' y 'hasta' requeridos, recibido: ${JSON.stringify(ficha.campos)}`
    );
  }

  return { desde: Number(desde), hasta: Number(hasta), duracionSeg: undefined };
}

// ============================================================================
// TIPO: encuesta
// ============================================================================

export interface PropsEncuesta {
  pregunta: string;
  opcionA: string; // "Sí 30%"
  opcionB: string; // "No 70%"
}

export function traducirEncuesta(
  componente: string,
  ficha: MetadataFicha
): PropsEncuesta {
  const { pregunta, opcionA, opcionB } = ficha.campos as Record<string, any>;

  if (!pregunta || !opcionA || !opcionB) {
    throw new Error(
      `Encuesta: campos 'pregunta', 'opcionA', 'opcionB' requeridos, recibido: ${JSON.stringify(ficha.campos)}`
    );
  }

  return { pregunta, opcionA, opcionB };
}

// ============================================================================
// TIPO: montaje
// ============================================================================

export interface PropsMontaje {
  sello?: string; // "100 EN UNA TARDE"
  duracionTotal?: number; // velocidad de la ráfaga
}

export function traducirMontaje(
  componente: string,
  ficha: MetadataFicha
): PropsMontaje {
  const { sello } = ficha.campos as Record<string, any>;

  return {
    sello: sello || undefined,
    duracionTotal: ficha.intensidad === 'muy_alta' ? 0.5 : 1, // segundos por imagen
  };
}

// ============================================================================
// Despachador central
// ============================================================================

export function traducirMetadata(
  componente: string,
  ficha: MetadataFicha
): Record<string, any> {
  switch (ficha.tipo) {
    case 'numero':
      return traducirNumero(componente, ficha);
    case 'versus':
      return traducirVersus(componente, ficha);
    case 'lista':
      return traducirLista(componente, ficha);
    case 'cadena':
      return traducirCadena(componente, ficha);
    case 'cronologia':
      return traducirCronologia(componente, ficha);
    case 'pantalla':
      return traducirPantalla(componente, ficha);
    case 'frase':
      return traducirFrase(componente, ficha);
    case 'cuenta_regresiva':
      return traducirCuentaRegresiva(componente, ficha);
    case 'encuesta':
      return traducirEncuesta(componente, ficha);
    case 'montaje':
      return traducirMontaje(componente, ficha);
    default:
      throw new Error(`Tipo de escena desconocido: ${(ficha as any).tipo}`);
  }
}
