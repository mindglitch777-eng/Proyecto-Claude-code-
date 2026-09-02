/**
 * Indice tipado de fabrica/research/retencion.md (Ronda 5). Cada item
 * de aca es una transcripcion fiel de una fila de ese documento -- NO
 * se agrega ninguna afirmacion nueva que no estuviera ya investigada y
 * clasificada ahi. Si se agrega investigacion nueva, agregarla PRIMERO
 * en prosa en research/ (con su fuente real) y RECIEN DESPUES indexarla
 * aca -- nunca al reves (evita que el Knowledge Engine se convierta en
 * una lista de afirmaciones inventadas sin respaldo real).
 */
import type {ItemConocimiento} from './tipos';

export const CONOCIMIENTO: ItemConocimiento[] = [
  {
    id: 'loewenstein-1994-brecha-curiosidad',
    tema: 'curiosidad-brecha-informacion',
    afirmacion:
      'La curiosidad surge cuando la atencion se enfoca en una brecha (gap) entre lo que sabemos y lo que querriamos saber. Es maxima con un poco de conocimiento previo, no con cero -- "se algo de esto pero no todo" engancha mas que "no se nada de esto".',
    nivel: 'evidencia_academica',
    confirmado: true,
    fuente: 'Loewenstein, G. (1994). "The Psychology of Curiosity: A Review and Reinterpretation."',
    aplicacionFabrica:
      'Un hook que da CONTEXTO PARCIAL (ej. "Mica cobra $340 por video...") activa mas curiosidad real que uno completamente abstracto o uno que ya lo explica todo.',
    tags: ['hook', 'curiosidad', 'retencion'],
  },
  {
    id: 'zeigarnik-1927-tareas-incompletas',
    tema: 'loops-abiertos',
    afirmacion:
      'Las tareas interrumpidas/incompletas quedan mas tiempo en la memoria activa que las completadas -- "tension cognitiva" que empuja a querer cerrar el circulo.',
    nivel: 'evidencia_academica',
    confirmado: true,
    fuente: 'Zeigarnik, B. (1927), efecto Zeigarnik.',
    aplicacionFabrica:
      'Base psicologica real detras de "loops abiertos"/cliffhangers: abrir una pregunta o situacion sin resolver al principio del video, y resolverla EXPLICITAMENTE mas adelante -- nunca dejarla sin cerrar (eso frustra, no engancha).',
    tags: ['hook', 'loop-abierto', 'estructura-narrativa', 'retencion'],
  },
  {
    id: 'youtube-oficial-primeros-30s',
    tema: 'primeros-segundos-plataforma',
    afirmacion:
      'YouTube mide explicitamente que porcentaje de audiencia sigue mirando despues de los primeros 30 segundos ("Intro"), y recomienda que ese tramo cumpla la expectativa que genero el titulo/miniatura.',
    nivel: 'evidencia_oficial_plataforma',
    confirmado: true,
    fuente: 'YouTube Creator Academy / YouTube Help, "Key moments for audience retention".',
    aplicacionFabrica:
      'El Director de Edicion ya prioriza intencion=enganchar con energia alta y entrada inmediata para la primera unidad (Ronda 4) -- consistente con este peso real de los primeros segundos.',
    tags: ['retencion', 'plataforma', 'hook'],
  },
  {
    id: 'heuristica-33pct-abandono-30s',
    tema: 'primeros-segundos-plataforma',
    afirmacion: 'Mas del 33% de los espectadores abandona en los primeros 30 segundos si la intro no engancha.',
    nivel: 'heuristica_secundaria',
    confirmado: false,
    fuente: 'Atribuido a "YouTube Creator Academy 2023" en blogs de marketing -- publicacion oficial original con ese numero exacto NO confirmada.',
    tags: ['retencion', 'plataforma', 'no-confirmado'],
  },
  {
    id: 'heuristica-tiktok-3s-hook',
    tema: 'primeros-segundos-plataforma',
    afirmacion:
      '63% de los videos con mejor CTR en TikTok enganchan en los primeros 3 segundos; el video promedio de TikTok dura 8.4s de watch time; los videos de menos de 10s tienen 27% mas finalizaciones.',
    nivel: 'heuristica_secundaria',
    confirmado: false,
    fuente: 'Blogs citando "TikTok Creative Center"/"TikTok for Business" sin enlazar la publicacion primaria verificable.',
    aplicacionFabrica: 'Direccion plausible (el hook importa muchisimo en formato corto) pero los numeros puntuales NO estan confirmados de forma independiente -- tratar como orden de magnitud, no como cifra exacta.',
    tags: ['retencion', 'plataforma', 'no-confirmado'],
  },
  {
    id: 'heuristica-cliffhanger-aplicado-vertical',
    tema: 'loops-abiertos',
    afirmacion:
      'Abrir con una pregunta o situacion sin resolver y cerrarla explicitamente en el cierre funciona en formato vertical corto, igual que en folletines/series de TV.',
    nivel: 'heuristica_secundaria',
    confirmado: false,
    fuente: 'Combinacion de Zeigarnik (base academica) con practica narrativa clasica -- la APLICACION concreta a video corto es heuristica derivada, no un hallazgo especifico de ese formato.',
    aplicacionFabrica:
      'El Director de Retencion 2.0 (Ronda 5) mapea el video completo buscando si existe una "promesa" hecha en el hook y si se resuelve antes del cierre -- marcado como heuristica de alerta, nunca como puntaje.',
    tags: ['hook', 'loop-abierto', 'estructura-narrativa', 'retencion'],
  },
];
