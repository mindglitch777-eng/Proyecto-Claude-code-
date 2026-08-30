// Los 10 videos. Ver GUIONES-10.md para la narracion completa.
//
// Las duraciones de cada bloque son PROVISORIAS: estan calculadas por
// cantidad de palabras (~2.9 palabras/segundo). Cuando llegue el audio
// se re-cronometran contra la voz real -- manda la voz, los cortes se
// acomodan.

import type {Bloque} from './guion-agresivo';

export type Video = {
  id: string;
  titulo: string;
  registro: 'agresivo' | 'documental';
  cta: string;
  bloques: Bloque[];
};

const C = {
  // Clips disponibles en assets/metraje_video. Se reparten para que dos
  // videos seguidos no abran con el mismo plano.
  dinero: ['dinero-00.mp4', 'dinero-01.mp4', 'dinero-02.mp4', 'dinero-03.mp4', 'dinero-04.mp4', 'dinero-05.mp4'],
  oficio: ['barberia-00.mp4', 'barberia-03.mp4', 'unias-01.mp4', 'unias-03.mp4', 'gimnasio-01.mp4', 'nutricion-00.mp4', 'veterinaria-02.mp4'],
};

const rafagaMixta = [C.oficio[0], C.dinero[1], C.oficio[2], C.dinero[3], C.oficio[4]];

export const VIDEOS: Video[] = [
  {
    id: 'v01',
    titulo: 'No te reemplaza la máquina',
    registro: 'agresivo',
    cta: 'IA',
    bloques: [
      {tipo: 'hook', dur: 3.4, lineas: ['No te va', 'a reemplazar', 'la máquina'], entra: [0, 0.5, 1.15]},
      {tipo: 'niega', dur: 3.2, clip: C.dinero[0], lineas: ['Te reemplaza', 'el que', 'la sabe usar'], entra: [0, 0.6, 1.4]},
      {tipo: 'rafaga', dur: 2.6, clips: rafagaMixta, sello: 'MISMO TRABAJO'},
      {tipo: 'cuenta', dur: 7.6},
      {tipo: 'veredicto', dur: 4.2, clip: C.dinero[2]},
      {tipo: 'verdad', dur: 4.6, clip: C.oficio[1], lineas: ['No competís', 'contra la máquina', 'Contra alguien igual que vos'], entra: [0, 1.1, 2.2]},
      {tipo: 'payoff', dur: 4.4, lineas: ['Se sentó una tarde', 'a aprenderla', 'Esa tarde', 'es toda la diferencia'], entra: [0, 0.7, 1.6, 2.4]},
      {tipo: 'cierre', dur: 2.4},
    ],
  },
  {
    id: 'v02',
    titulo: 'Si cobrás por hora, la IA te fundió',
    registro: 'agresivo',
    cta: 'PRECIO',
    bloques: [
      {tipo: 'hook', dur: 3.2, lineas: ['Si cobrás', 'por hora', 'te fundió'], entra: [0, 0.5, 1.2]},
      {tipo: 'niega', dur: 3.4, clip: C.oficio[2], lineas: ['No te bajó', 'el precio', 'Te bajó las horas'], entra: [0, 0.6, 1.5]},
      {tipo: 'rafaga', dur: 2.4, clips: rafagaMixta, sello: 'UNA TARDE → 20 MINUTOS'},
      {tipo: 'cuenta', dur: 7.8},
      {tipo: 'veredicto', dur: 4.4, clip: C.dinero[3]},
      {tipo: 'verdad', dur: 4.4, clip: C.oficio[3], lineas: ['No le importa', 'cuánto tardaste', 'Le importa que esté resuelto'], entra: [0, 1.0, 2.1]},
      {tipo: 'payoff', dur: 4.2, lineas: ['Dejá de vender tiempo', 'Vendé el problema resuelto'], entra: [0, 1.4]},
      {tipo: 'cierre', dur: 2.4},
    ],
  },
  {
    id: 'v03',
    titulo: 'Cuarenta videos guardados',
    registro: 'agresivo',
    cta: 'EMPEZAR',
    bloques: [
      {tipo: 'hook', dur: 3.4, lineas: ['Guardaste', '40 videos', 'No abriste', 'ninguno'], entra: [0, 0.45, 1.05, 1.6]},
      {tipo: 'niega', dur: 3.0, clip: C.dinero[1], lineas: ['No te falta', 'información', 'Te sobra'], entra: [0, 0.5, 1.4]},
      {tipo: 'rafaga', dur: 2.4, clips: rafagaMixta, sello: 'MIRAR NO ES APRENDER'},
      {tipo: 'cuenta', dur: 7.4},
      {tipo: 'veredicto', dur: 4.0, clip: C.oficio[4]},
      {tipo: 'verdad', dur: 4.4, clip: C.dinero[4], lineas: ['La usó una vez', 'para algo real', 'Una sola vez'], entra: [0, 1.0, 2.2]},
      {tipo: 'payoff', dur: 4.2, lineas: ['Agarrá una herramienta', 'y resolvé algo tuyo', 'Hoy'], entra: [0, 1.0, 2.2]},
      {tipo: 'cierre', dur: 2.4},
    ],
  },
  {
    id: 'v04',
    titulo: 'Cero por mil sigue siendo cero',
    registro: 'agresivo',
    cta: 'CLIENTES',
    bloques: [
      {tipo: 'hook', dur: 3.2, lineas: ['La IA no', 'te va a conseguir', 'un solo cliente'], entra: [0, 0.5, 1.25]},
      {tipo: 'niega', dur: 3.2, clip: C.oficio[5], lineas: ['No crea nada', 'Multiplica', 'lo que ya hay'], entra: [0, 0.6, 1.5]},
      {tipo: 'rafaga', dur: 2.4, clips: rafagaMixta, sello: 'CERO × MIL = CERO'},
      {tipo: 'cuenta', dur: 7.4},
      {tipo: 'veredicto', dur: 4.2, clip: C.dinero[5]},
      {tipo: 'verdad', dur: 4.4, clip: C.oficio[0], lineas: ['Conseguí que', 'una persona', 'te pague'], entra: [0, 0.9, 2.0]},
      {tipo: 'payoff', dur: 4.2, lineas: ['Primero uno', 'Después automatizá', 'Al revés no funciona'], entra: [0, 1.0, 2.2]},
      {tipo: 'cierre', dur: 2.4},
    ],
  },
  {
    id: 'v05',
    titulo: 'Nadie te paga por saber usarla',
    registro: 'agresivo',
    cta: 'PROBLEMA',
    bloques: [
      {tipo: 'hook', dur: 3.4, lineas: ['Nadie te paga', 'por saber', 'usar la IA'], entra: [0, 0.55, 1.3]},
      {tipo: 'niega', dur: 3.2, clip: C.dinero[2], lineas: ['Te pagan por', 'saber qué', 'problema resolver'], entra: [0, 0.6, 1.5]},
      {tipo: 'rafaga', dur: 2.4, clips: rafagaMixta, sello: 'EL CÓMO ES GRATIS'},
      {tipo: 'cuenta', dur: 7.6},
      {tipo: 'veredicto', dur: 4.2, clip: C.oficio[6]},
      {tipo: 'verdad', dur: 4.4, clip: C.dinero[0], lineas: ['30 herramientas', 'y ningún problema', 'no vende nada'], entra: [0, 1.0, 2.1]},
      {tipo: 'payoff', dur: 4.0, lineas: ['Elegí el problema', 'primero'], entra: [0, 1.2]},
      {tipo: 'cierre', dur: 2.4},
    ],
  },
  {
    id: 'v06',
    titulo: 'Entrega antes',
    registro: 'agresivo',
    cta: 'RÁPIDO',
    bloques: [
      {tipo: 'hook', dur: 3.2, lineas: ['Tu competencia', 'no es', 'más inteligente'], entra: [0, 0.5, 1.2]},
      {tipo: 'niega', dur: 3.0, clip: C.oficio[1], lineas: ['Entrega antes', 'Nada más'], entra: [0, 1.1]},
      {tipo: 'rafaga', dur: 2.4, clips: rafagaMixta, sello: 'PIDE A TRES · GANA EL PRIMERO'},
      {tipo: 'cuenta', dur: 7.4},
      {tipo: 'veredicto', dur: 4.2, clip: C.dinero[1]},
      {tipo: 'verdad', dur: 4.4, clip: C.oficio[2], lineas: ['Perdiste trabajos', 'que ya tenías', 'ganados'], entra: [0, 0.9, 2.0]},
      {tipo: 'payoff', dur: 4.2, lineas: ['No sos más lento', 'Contestás más tarde'], entra: [0, 1.3]},
      {tipo: 'cierre', dur: 2.4},
    ],
  },
  {
    id: 'v07',
    titulo: 'Le pedís respuestas',
    registro: 'agresivo',
    cta: 'PREGUNTA',
    bloques: [
      {tipo: 'hook', dur: 3.4, lineas: ['Le escribís', '4 palabras', 'y te devuelve', 'una porquería'], entra: [0, 0.45, 1.05, 1.65]},
      {tipo: 'niega', dur: 3.2, clip: C.dinero[3], lineas: ['No es la máquina', 'Es lo que', 'le pediste'], entra: [0, 0.7, 1.6]},
      {tipo: 'rafaga', dur: 2.4, clips: rafagaMixta, sello: 'SALE LO QUE PUSISTE'},
      {tipo: 'cuenta', dur: 7.6},
      {tipo: 'veredicto', dur: 4.0, clip: C.oficio[3]},
      {tipo: 'verdad', dur: 4.4, clip: C.dinero[4], lineas: ['Quién sos', 'Para quién es', 'Qué querés', 'Qué no querés'], entra: [0, 0.8, 1.6, 2.4]},
      {tipo: 'payoff', dur: 4.0, lineas: ['Cuatro líneas', 'Nada más'], entra: [0, 1.2]},
      {tipo: 'cierre', dur: 2.4},
    ],
  },

  // ---- DOCUMENTALES: mas lentos, sin rafaga, con hitos ----
  {
    id: 'v08',
    titulo: 'Un tipo. Sin empleados.',
    registro: 'documental',
    cta: 'SOLO',
    bloques: [
      {tipo: 'hook', dur: 4.2, lineas: ['Sin oficina', 'Sin empleados', 'Sin socios', 'Sin inversión'], entra: [0, 0.75, 1.5, 2.25]},
      {tipo: 'niega', dur: 4.4, clip: C.dinero[0], lineas: ['Programa', 'desde una notebook', 'mudándose de país'], entra: [0, 0.9, 2.0]},
      {tipo: 'cuenta', dur: 8.4},
      {tipo: 'veredicto', dur: 5.0, clip: C.dinero[2]},
      {tipo: 'verdad', dur: 4.8, clip: C.dinero[4], lineas: ['Nadie', 'le dio', 'permiso'], entra: [0, 0.9, 1.9]},
      {tipo: 'niega', dur: 4.6, clip: C.oficio[5], lineas: ['Los números', 'los da él', 'Nadie los auditó'], entra: [0, 0.9, 1.9]},
      {tipo: 'payoff', dur: 4.6, lineas: ['El método', 'no es secreto', 'Es lo único', 'que podés copiar'], entra: [0, 0.8, 1.7, 2.5]},
      {tipo: 'cierre', dur: 2.6},
    ],
  },
  {
    id: 'v09',
    titulo: 'El número que nadie te muestra',
    registro: 'documental',
    cta: 'DIEZ',
    bloques: [
      {tipo: 'hook', dur: 4.0, lineas: ['Te muestran', 'al que gana', 'Nunca te muestran', 'la fila de atrás'], entra: [0, 0.7, 1.5, 2.3]},
      {tipo: 'niega', dur: 4.2, clip: C.oficio[4], lineas: ['De cada 100', 'que arrancan', 'la mitad', 'no llega'], entra: [0, 0.75, 1.5, 2.2]},
      {tipo: 'cuenta', dur: 8.0},
      {tipo: 'veredicto', dur: 4.6, clip: C.dinero[5]},
      {tipo: 'verdad', dur: 4.8, clip: C.oficio[0], lineas: ['Hizo diez cosas', 'Nueve se cayeron', 'La décima', 'pagó las nueve'], entra: [0, 0.9, 1.8, 2.6]},
      {tipo: 'payoff', dur: 4.6, lineas: ['Si tu plan', 'es acertar a la primera', 'no tenés un plan', 'Tenés una apuesta'], entra: [0, 0.8, 1.8, 2.7]},
      {tipo: 'cierre', dur: 2.6},
    ],
  },
  {
    id: 'v10',
    titulo: 'El mercado que tenés al lado',
    registro: 'documental',
    cta: 'DIGITAL',
    bloques: [
      {tipo: 'hook', dur: 4.0, lineas: ['Mientras discutimos', 'si esto sirve', 'ya pasó'], entra: [0, 0.8, 1.7]},
      {tipo: 'niega', dur: 4.4, clip: C.dinero[1], lineas: ['8.700.000', 'personas', 'ya compraron'], entra: [0, 0.9, 1.8]},
      {tipo: 'cuenta', dur: 8.2},
      {tipo: 'veredicto', dur: 4.8, clip: C.dinero[3]},
      {tipo: 'verdad', dur: 4.8, clip: C.oficio[6], lineas: ['Sin local', 'Sin stock', 'Sin empleados'], entra: [0, 0.9, 1.9]},
      {tipo: 'niega', dur: 4.4, clip: C.dinero[5], lineas: ['Los publica', 'la plataforma', 'sobre sí misma'], entra: [0, 0.9, 1.9]},
      {tipo: 'payoff', dur: 4.4, lineas: ['Existe', 'Y no te', 'está esperando'], entra: [0, 0.9, 1.8]},
      {tipo: 'cierre', dur: 2.6},
    ],
  },
];

export const durDe = (v: Video) => v.bloques.reduce((a, b) => a + b.dur, 0);
