import type {PatronHook} from './tipos';

export const CATALOGO_HOOKS: PatronHook[] = [
  {
    id: 'contexto-parcial',
    nombre: 'Contexto parcial',
    descripcion:
      'Da un dato concreto (un nombre, una cifra) sin explicar todavia el resto -- el espectador entiende que hay una historia pero no la historia completa. Maxima curiosidad con ALGO de contexto, no con cero.',
    ejemploAplicado: '"Tomás cobra $89 por su curso..." (sin decir todavía cuánto vendió ni cómo)',
    evidenciaIds: ['loewenstein-1994-brecha-curiosidad'],
    respaldo: 'evidencia',
    compatibleConIntencion: ['enganchar'],
  },
  {
    id: 'loop-abierto',
    nombre: 'Loop abierto / pregunta sin resolver',
    descripcion:
      'Plantea una pregunta o situación de tensión en el hook y la deja explícitamente sin resolver hasta el cierre -- la tensión cognitiva de "algo incompleto" mantiene la atención.',
    ejemploAplicado: '"¿Cómo hizo Tomás para vender 40 veces en una semana?" (se responde recién en el cierre)',
    evidenciaIds: ['zeigarnik-1927-tareas-incompletas', 'heuristica-cliffhanger-aplicado-vertical'],
    respaldo: 'evidencia',
    compatibleConIntencion: ['enganchar', 'construir_tension'],
  },
  {
    id: 'cifra-inmediata',
    nombre: 'Cifra inmediata',
    descripcion:
      'Muestra un número llamativo (dinero, cantidad, porcentaje) en los primeros segundos, antes de cualquier explicación -- consistente con la evidencia de que el peso de los primeros segundos es real, aunque los números puntuales de blogs de marketing no estén confirmados.',
    ejemploAplicado: '"$3.560" en pantalla antes de decir de qué se trata el video',
    evidenciaIds: ['youtube-oficial-primeros-30s', 'heuristica-tiktok-3s-hook'],
    respaldo: 'heuristica',
    compatibleConIntencion: ['enganchar'],
  },
  {
    id: 'pregunta-directa',
    nombre: 'Pregunta directa al espectador',
    descripcion:
      'Abre dirigiéndose directamente a quien mira ("¿Alguna vez...?", "¿Sabías que...?") -- práctica común en el formato, pero SIN un estudio o dato de plataforma que la respalde específicamente (a diferencia de los otros 3 patrones de este catálogo).',
    ejemploAplicado: '"¿Alguna vez pensaste en vender un curso online?"',
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
    compatibleConIntencion: ['enganchar'],
  },
];
