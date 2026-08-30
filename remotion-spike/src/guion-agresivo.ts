// GUION 2 — "Tu hora vale menos que nada"
//
// Un solo dolor: laburás todo el mes y no te queda un peso. Y una sola
// cosa que la gente no entiende: que su hora YA cuesta plata antes de
// tocar una herramienta.
//
// Sin jerga, sin porcentajes, sin indices. Numeros redondos que se
// pueden seguir de memoria mientras se mira.
//
// LAS CIFRAS SON ILUSTRATIVAS, no relevadas: es aritmetica coherente
// para explicar un mecanismo, la categoria que FUENTES.md ya separa de
// las cifras con fuente. No se afirma nada sobre el mercado. Antes de
// publicar hay que ajustarlas a precios reales del rubro.

export type Bloque =
  | {tipo: 'hook'; dur: number; lineas: string[]; entra: number[]}
  | {tipo: 'niega'; dur: number; clip: string; lineas: string[]; entra: number[]}
  | {tipo: 'rafaga'; dur: number; clips: string[]; sello: string}
  | {tipo: 'cuenta'; dur: number}
  | {tipo: 'veredicto'; dur: number; clip: string}
  | {tipo: 'verdad'; dur: number; clip: string; lineas: string[]; entra: number[]}
  | {tipo: 'payoff'; dur: number; lineas: string[]; entra: number[]}
  | {tipo: 'cierre'; dur: number};

export const AGRESIVO: Bloque[] = [
  // 0.0 — El espectador se tiene que reconocer en el cuadro cero.
  {
    tipo: 'hook',
    dur: 2.9,
    lineas: ['Laburaste', 'todo el mes', 'y no te quedó', 'un peso'],
    entra: [0.0, 0.42, 0.95, 1.45],
  },

  // 2.9 — Le saca la explicacion facil de encima. Sin esto se va.
  {
    tipo: 'niega',
    dur: 3.0,
    clip: 'barberia-03.mp4',
    lineas: ['No es que', 'trabajes poco', 'Trabajás de más'],
    entra: [0.0, 0.5, 1.5],
  },

  // 5.9 — La pregunta que abre el bucle. Rafaga: pasa en todos los rubros.
  {
    tipo: 'rafaga',
    dur: 2.4,
    clips: ['unias-01.mp4', 'veterinaria-02.mp4', 'gimnasio-01.mp4', 'nutricion-00.mp4', 'barberia-00.mp4'],
    sello: '¿Cuánto te cuesta UNA HORA TUYA?',
  },

  // 8.3 — LA CUENTA. Esto es lo que la gente no hace nunca.
  {tipo: 'cuenta', dur: 8.2},

  // 16.5 — El veredicto. El numero que duele, con el metraje adentro.
  {tipo: 'veredicto', dur: 4.2, clip: 'barberia-04.mp4'},

  // 20.7 — La verdad que se lleva puesta la idea que tenia.
  {
    tipo: 'verdad',
    dur: 4.4,
    clip: 'unias-03.mp4',
    lineas: ['No vendés cortes', 'Vendés tu hora', 'Y la estás regalando'],
    entra: [0.0, 1.2, 2.4],
  },

  // 25.1 — Payoff: una sola cosa para hacer.
  {
    tipo: 'payoff',
    dur: 4.4,
    lineas: ['Sacá la cuenta', 'una sola vez', 'Va a doler', 'Y no vas a cobrar igual nunca más'],
    entra: [0.0, 0.6, 1.5, 2.4],
  },

  {tipo: 'cierre', dur: 2.4},
];

export const DUR_AGRESIVO = AGRESIVO.reduce((a, b) => a + b.dur, 0);

// La cuenta, paso a paso. Todo redondo a proposito: se tiene que poder
// seguir de memoria mientras se mira, sin pausar.
export const CUENTA = [
  {concepto: 'El alquiler', monto: 300000, t: 0.3},
  {concepto: 'Luz, teléfono, todo', monto: 100000, t: 1.7},
];

export const CUENTA_TOTAL = 400000;
export const HORAS_MES = 160;
export const COSTO_HORA = CUENTA_TOTAL / HORAS_MES; // 2500

// El veredicto
export const COBRAS = 5000;
export const HORAS_TRABAJO = 2;
