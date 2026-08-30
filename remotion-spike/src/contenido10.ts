// Contenido de los bloques explicador (tabla) y remate (cifra grande)
// de cada uno de los 10 videos.
//
// ETIQUETAS
//   ILUSTRATIVO  aritmetica de ejemplo, no afirma nada del mercado
//   DECLARADO    la fuente lo dice de si misma, nadie lo audito
//   ESTIMADO     distribucion reportada por una sola fuente secundaria

export type Explicador = {
  titulo: string;
  filas: {concepto: string; valor: string}[];
  total?: {concepto: string; valor: string};
  remate: {arriba: string; grande: string; abajo: string};
  etiqueta?: string;
  fuente?: string;
};

export type Remate = {
  lineas: string[];
  grande: string;
  pie: string;
};

export const EXPLICADOR: Record<string, Explicador> = {
  v01: {
    titulo: 'El mismo trabajo',
    filas: [
      {concepto: 'Uno tarda', valor: '8 horas'},
      {concepto: 'El otro tarda', valor: '40 min'},
    ],
    total: {concepto: 'Los dos cobran', valor: 'lo mismo'},
    remate: {arriba: 'El de 40 minutos puede cobrar', grande: 'LA MITAD', abajo: 'y seguir ganando más que vos'},
    etiqueta: 'ILUSTRATIVO',
  },
  v02: {
    titulo: 'Lo que te cambió sin avisar',
    filas: [
      {concepto: 'Antes te llevaba', valor: 'una tarde'},
      {concepto: 'Ahora sale en', valor: '20 min'},
    ],
    total: {concepto: 'Si cobrás por hora', valor: '÷ 4'},
    remate: {arriba: 'Por el mismo trabajo cobrás', grande: '4 VECES MENOS', abajo: 'y encima lo entregaste mejor'},
    etiqueta: 'ILUSTRATIVO',
  },
  v03: {
    titulo: 'Tu carpeta de guardados',
    filas: [
      {concepto: 'Videos guardados', valor: '40'},
      {concepto: 'Videos abiertos', valor: '0'},
    ],
    total: {concepto: 'Cambió algo', valor: 'nada'},
    remate: {arriba: 'Mirar se siente igual que aprender', grande: 'PERO NO CUENTA', abajo: 'el cerebro te paga con la misma sensación'},
  },
  v04: {
    titulo: 'La cuenta que no hiciste',
    filas: [
      {concepto: 'Negocio que funciona', valor: '× 10'},
      {concepto: 'Negocio sin clientes', valor: '× 10'},
    ],
    total: {concepto: 'El segundo da', valor: '0'},
    remate: {arriba: 'Cero por mil sigue siendo', grande: 'CERO', abajo: 'primero uno que te pague. Uno.'},
  },
  v05: {
    titulo: 'Qué se paga y qué no',
    filas: [
      {concepto: 'El cómo', valor: 'gratis'},
      {concepto: 'El qué', valor: 'tuyo'},
    ],
    total: {concepto: 'Se cobra', valor: 'el qué'},
    remate: {arriba: '30 herramientas y ningún problema', grande: 'NO VENDE NADA', abajo: 'una herramienta y un problema caro, factura'},
  },
  v06: {
    titulo: 'El cliente pidió a tres',
    filas: [
      {concepto: 'Vos contestás', valor: 'en 2 días'},
      {concepto: 'El otro contesta', valor: 'en 5 min'},
    ],
    total: {concepto: 'Se lo lleva', valor: 'el otro'},
    remate: {arriba: 'No lo perdiste por caro ni por malo', grande: 'POR TARDE', abajo: 'y ni te enteraste de que lo tenías'},
    etiqueta: 'ILUSTRATIVO',
  },
  v07: {
    titulo: 'Lo que le diste',
    filas: [
      {concepto: 'Le escribiste', valor: '4 palabras'},
      {concepto: 'Te devolvió', valor: 'genérico'},
    ],
    total: {concepto: 'La culpa es', valor: 'tuya'},
    remate: {arriba: 'Lo que sale vale exactamente', grande: 'LO QUE PUSISTE', abajo: 'ni un peso más'},
  },
  v08: {
    titulo: 'Doce meses, doce proyectos',
    filas: [
      {concepto: 'Proyectos que hizo', valor: '12'},
      {concepto: 'Que fracasaron', valor: 'casi todos'},
    ],
    total: {concepto: 'Que quedaron', valor: 'unos pocos'},
    remate: {arriba: 'Hoy dice facturar', grande: 'US$ 3M / año', abajo: 'él solo, sin un empleado'},
    etiqueta: 'DECLARADO',
    fuente: 'Cifras auto-reportadas por Pieter Levels · nadie las auditó',
  },
  v09: {
    titulo: 'De cada 100 que arrancan',
    filas: [
      {concepto: 'No llegan a US$1.000/mes', valor: '50'},
      {concepto: 'Pasan los US$10.000/mes', valor: '10'},
    ],
    total: {concepto: 'Pasan los US$100.000', valor: 'menos de 5'},
    remate: {arriba: 'El que llegó no acertó a la primera', grande: '9 DE 10 SE CAEN', abajo: 'la décima paga a las nueve'},
    etiqueta: 'ESTIMADO',
    fuente: 'Distribución reportada por una sola fuente secundaria',
  },
  v10: {
    titulo: 'América Latina hispana',
    filas: [
      {concepto: 'Personas que compraron', valor: '8.700.000'},
      {concepto: 'Operaciones', valor: '+17.000.000'},
    ],
    total: {concepto: 'Cruzaron la frontera', valor: '+ de la mitad'},
    remate: {arriba: 'Sin local, sin stock, sin empleados', grande: 'UN ARCHIVO', abajo: 'algo que sabía, puesto en un archivo'},
    etiqueta: 'DECLARADO',
    fuente: 'Estudio de Hotmart sobre su propia plataforma · enero 2026',
  },
};

export const REMATE: Record<string, Remate> = {
  v01: {lineas: ['8 horas', '40 minutos', 'El mismo precio'], grande: '¿QUIÉN BAJA PRIMERO?', pie: 'no competís contra la máquina'},
  v02: {lineas: ['Mismo trabajo', 'Cuatro veces más rápido', 'Cuatro veces menos plata'], grande: 'POR HORA = TRAMPA', pie: 'al cliente no le importa cuánto tardaste'},
  v03: {lineas: ['40 guardados', '0 abiertos', 'Cero cambios'], grande: 'UNA. SOLA. VEZ.', pie: 'usala una vez para algo tuyo'},
  v04: {lineas: ['Sin clientes', 'Con inteligencia artificial', 'Sigue sin clientes'], grande: 'MÁS RÁPIDO', pie: 'te da cero clientes, pero más rápido'},
  v05: {lineas: ['La máquina hace el cómo', 'Gratis', 'Para todos'], grande: 'EL QUÉ ES TUYO', pie: 'y es lo único que se cobra'},
  v06: {lineas: ['No más barato', 'No mejor', 'Primero'], grande: 'GANA EL PRIMERO', pie: 'aunque no sea el mejor de los tres'},
  v07: {lineas: ['Quién sos', 'Para quién es', 'Qué querés lograr'], grande: '4 LÍNEAS', pie: 'eso es todo lo que le falta'},
  v08: {lineas: ['Sin oficina', 'Sin empleados', 'Sin inversión'], grande: 'US$ 130K / MES', pie: 'de un solo producto · cifra declarada por él'},
  v09: {lineas: ['Te muestran al que ganó', 'Nunca la fila de atrás', 'La mitad no llega'], grande: 'HACÉ DIEZ COSAS', pie: 'no una sola apuesta grande'},
  v10: {lineas: ['Ni local', 'Ni stock', 'Ni empleados'], grande: 'NO TE ESPERA', pie: 'el mercado ya está pasando'},
};
