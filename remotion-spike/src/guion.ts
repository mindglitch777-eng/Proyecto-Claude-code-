// El MISMO guion que contenido/nombre-por-pais.json, idea por idea.
// Las cifras salen de MEDICION_NICHOS.md (Google Trends, 12 meses,
// medido 28/08/2026). Ninguna se inventa para que la prueba luzca mejor.

export type Linea = {t: string; estilo: 'serif' | 'grotesca'; alinea: 'izq' | 'der'};

export type Idea =
  | {
      tipo: 'hook';
      dur: number;
      lineas: Linea[];
      entra: number[];
      narracion: string;
    }
  | {
      tipo: 'escena';
      dur: number;
      lineas: Linea[];
      entra: number[];
      planos: {clip?: string; foto?: string; dur: number; mov: 'STATIC' | 'SUBTLE' | 'ACTIVE' | 'BURST'}[];
      narracion: string;
    }
  | {
      tipo: 'silueta';
      dur: number;
      texto: string;
      pie: string;
      narracion: string;
    }
  | {
      tipo: 'grafico';
      dur: number;
      titulo: string;
      datos: {etiqueta: string; valor: number}[];
      etiqueta: string;
      fuente: string;
      narracion: string;
    };

export const GUION: Idea[] = [
  // 0. HOOK — §3: conflicto + curiosidad + especificidad + consecuencia.
  // Microestados IMPACTO / AFIRMACION / PREGUNTA, igual que _entra_hook().
  {
    tipo: 'hook',
    dur: 3.4,
    lineas: [
      {t: 'Tu producto es bueno', estilo: 'serif', alinea: 'izq'},
      {t: 'Pero en España', estilo: 'grotesca', alinea: 'der'},
      {t: 'es un 1', estilo: 'grotesca', alinea: 'izq'},
      {t: 'y no te encuentran', estilo: 'grotesca', alinea: 'der'},
    ],
    entra: [0.0, 0.5, 1.02, 1.55],
    narracion: 'Tu producto es bueno. Pero en España es un uno sobre cien.',
  },

  // 1. CONTRADICCION
  {
    tipo: 'silueta',
    dur: 4.4,
    texto: 'Mismo producto',
    pie: 'otro nombre según dónde',
    narracion: 'Le pusiste el nombre de otro país.',
  },

  // 2. EVIDENCIA — contexto en movimiento y despues el grafico.
  {
    tipo: 'escena',
    dur: 1.6,
    lineas: [{t: '«Cotizador»', estilo: 'serif', alinea: 'izq'}],
    entra: [0.0],
    planos: [{clip: 'dinero-00.mp4', foto: 'buenos-aires-street-shop-sign.jpg', dur: 1.6, mov: 'SUBTLE'}],
    narracion: 'Cotizador.',
  },
  {
    tipo: 'grafico',
    dur: 5.4,
    titulo: '«cotizador»',
    datos: [
      {etiqueta: 'México', valor: 78.5},
      {etiqueta: 'Argentina', valor: 70.7},
      {etiqueta: 'España', valor: 1.0},
    ],
    etiqueta: 'VERIFICADO',
    fuente: 'Google Trends · 12 meses · medido 28/08/2026',
    narracion: 'Setenta y ocho de demanda en México, setenta en Argentina.',
  },

  // 3. GIRO
  {
    tipo: 'escena',
    dur: 1.6,
    lineas: [
      {t: 'En España', estilo: 'serif', alinea: 'izq'},
      {t: 'no existe', estilo: 'grotesca', alinea: 'der'},
    ],
    entra: [0.0, 0.55],
    planos: [{clip: 'dinero-02.mp4', foto: 'madrid-spain-street-city.jpg', dur: 1.6, mov: 'SUBTLE'}],
    narracion: 'En España esa palabra no existe.',
  },
  {
    tipo: 'grafico',
    dur: 5.4,
    titulo: 'Lo que busca España',
    datos: [
      {etiqueta: '«presupuesto online»', valor: 53.9},
      {etiqueta: '«cotizador»', valor: 1.0},
    ],
    etiqueta: 'VERIFICADO',
    fuente: 'Google Trends · España · 12 meses · 28/08/2026',
    narracion: 'Ahí buscan presupuesto online.',
  },

  // 4. CONCLUSION
  {
    tipo: 'escena',
    dur: 4.8,
    lineas: [
      {t: 'No cambies', estilo: 'serif', alinea: 'izq'},
      {t: 'el producto', estilo: 'grotesca', alinea: 'der'},
      {t: 'Cambiá', estilo: 'serif', alinea: 'izq'},
      {t: 'el nombre', estilo: 'grotesca', alinea: 'der'},
    ],
    entra: [0.0, 0.7, 1.6, 2.3],
    planos: [{clip: 'dinero-04.mp4', foto: 'hands-writing-notebook-plan-desk.jpg', dur: 4.8, mov: 'ACTIVE'}],
    narracion: 'No cambies el producto. Cambiá el nombre.',
  },
];

export const DUR_TOTAL = GUION.reduce((a, i) => a + i.dur, 0);
