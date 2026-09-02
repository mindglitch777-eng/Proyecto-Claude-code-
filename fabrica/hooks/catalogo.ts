import type {PatronRetencion} from './tipos';

export const CATALOGO_PATRONES: PatronRetencion[] = [
  // ───────────────────────────── APERTURA (Ronda 6, sin cambios de fondo)
  {
    id: 'contexto-parcial',
    categoria: 'apertura',
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
    categoria: 'apertura',
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
    categoria: 'apertura',
    nombre: 'Cifra inmediata',
    descripcion:
      'Muestra un número llamativo (dinero, cantidad, porcentaje) en los primeros segundos, antes de cualquier explicación -- consistente con la evidencia de que el peso de los primeros segundos es real, aunque los números puntuales de blogs de marketing no estén confirmados.',
    ejemploAplicado: '"$3.560" en pantalla antes de decir de qué se trata el video',
    evidenciaIds: ['youtube-oficial-primeros-30s', 'heuristica-tiktok-3s-hook'],
    respaldo: 'patron_observado',
    compatibleConIntencion: ['enganchar'],
  },
  {
    id: 'pregunta-directa',
    categoria: 'apertura',
    nombre: 'Pregunta directa al espectador',
    descripcion:
      'Abre dirigiéndose directamente a quien mira ("¿Alguna vez...?", "¿Sabías que...?") -- práctica común en el formato, pero SIN un estudio o dato de plataforma que la respalde específicamente.',
    ejemploAplicado: '"¿Alguna vez pensaste en vender un curso online?"',
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
    compatibleConIntencion: ['enganchar'],
  },

  // ───────────────────────────── CURIOSIDAD (Ronda 7, nuevo)
  {
    id: 'pregunta-sin-resolver-intermedia',
    categoria: 'curiosidad',
    nombre: 'Micro-loop a mitad de video',
    descripcion:
      'Reabre un loop chico (una pregunta nueva, más pequeña que la del hook) a mitad del video para "reenganchar" antes de que la atención decaiga -- la misma tensión cognitiva de Zeigarnik, aplicada varias veces en vez de una sola.',
    ejemploAplicado: '"Pero eso no es lo más loco -- esperá a ver qué pasó la semana siguiente" (a mitad de un video de desarrollo)',
    evidenciaIds: ['zeigarnik-1927-tareas-incompletas'],
    respaldo: 'evidencia',
    compatibleConIntencion: ['construir_tension', 'acelerar'],
  },

  // ───────────────────────────── CONTRADICCIÓN (Ronda 7, nuevo)
  {
    id: 'expectativa-violada',
    categoria: 'contradiccion',
    nombre: 'Expectativa violada',
    descripcion:
      'Afirma algo que contradice lo que la audiencia probablemente cree cierto ("no es lo que pensás") -- la novedad/incongruencia percibida es lo que genera interés, según la teoría de apreciación del interés, aunque esa teoría no habla específicamente de "contradicción" como técnica retórica.',
    ejemploAplicado: '"Todos piensan que hace falta plata para arrancar un curso online. Tomás empezó con $0."',
    evidenciaIds: ['silvia-2005-apraisal-interes'],
    respaldo: 'patron_observado',
    compatibleConIntencion: ['enganchar', 'revelar'],
  },

  // ───────────────────────────── SORPRESA (Ronda 7, nuevo)
  {
    id: 'dato-sorprendente-comprensible',
    categoria: 'sorpresa',
    nombre: 'Dato sorprendente pero comprensible',
    descripcion:
      'Un dato novedoso genera interés SOLO si además es comprensible de inmediato -- si es novedoso pero confuso, genera confusión, no enganche. La cifra sorprendente debe poder entenderse sin esfuerzo (evitar jerga sin explicar).',
    ejemploAplicado: 'Mostrar "$3.560 en una semana" (comprensible al instante) en vez de una métrica técnica sin contexto.',
    evidenciaIds: ['silvia-2005-apraisal-interes'],
    respaldo: 'evidencia',
    compatibleConIntencion: ['enganchar', 'revelar'],
  },

  // ───────────────────────────── ESCALADA (Ronda 7, nuevo)
  {
    id: 'tension-creciente',
    categoria: 'escalada',
    nombre: 'Tensión creciente hacia un clímax',
    descripcion:
      'Estructura clásica de acción ascendente: cada unidad narrativa aumenta la complicación/expectativa hasta un punto de máxima tensión (clímax), en vez de mantener una energía plana.',
    ejemploAplicado: 'Las unidades "aceleracion" e "impacto" de los guiones de la fábrica ya escalan energía antes de la revelación.',
    evidenciaIds: ['freytag-1863-piramide-narrativa'],
    respaldo: 'buena_practica',
    compatibleConIntencion: ['construir_tension', 'acelerar'],
  },

  // ───────────────────────────── REVELACIÓN (Ronda 7, nuevo)
  {
    id: 'climax-diferido',
    categoria: 'revelacion',
    nombre: 'Clímax diferido (la revelación llega después de escalar)',
    descripcion:
      'La respuesta a la pregunta/loop planteado en el hook se guarda para el punto de mayor tensión narrativa, no se revela apenas es posible -- combina la escalada (Freytag) con el cierre del loop (Zeigarnik).',
    ejemploAplicado: 'El "esClimax" que ya calcula el Director de Retención (Ronda 5) es candidato natural para ubicar la revelación.',
    evidenciaIds: ['zeigarnik-1927-tareas-incompletas', 'freytag-1863-piramide-narrativa'],
    respaldo: 'evidencia',
    compatibleConIntencion: ['revelar'],
  },

  // ───────────────────────────── COMPARACIÓN (Ronda 7, nuevo)
  {
    id: 'contraste-antes-despues',
    categoria: 'comparacion',
    nombre: 'Contraste antes/después',
    descripcion:
      'Presenta dos estados opuestos (antes de X / después de X) uno al lado del otro -- ya existe como componente real en el catálogo (AntesDespues), esto documenta el patrón narrativo detrás de esa elección visual.',
    ejemploAplicado: 'Componente `antes-despues` de la fábrica (escenas/explica.tsx).',
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
    compatibleConIntencion: ['comparar'],
  },

  // ───────────────────────────── TENSIÓN (Ronda 7, nuevo)
  {
    id: 'ritmo-que-no-deja-descansar',
    categoria: 'tension',
    nombre: 'Ritmo sin espacio para desconectar',
    descripcion:
      'Mantiene cortes/cambios frecuentes durante un tramo de tensión para no darle a la audiencia un momento "plano" donde decida abandonar -- aplicación del concepto de pattern interrupt sostenido en el tiempo, no un solo corte aislado.',
    ejemploAplicado: 'El catálogo de golpes de la fábrica ya varía el tipo de corte para evitar monotonía (Ronda 3).',
    evidenciaIds: ['pattern-interrupt-concepto'],
    respaldo: 'buena_practica',
    compatibleConIntencion: ['construir_tension', 'acelerar'],
  },

  // ───────────────────────────── RECOMPENSA (Ronda 7, nuevo)
  {
    id: 'pago-de-la-promesa',
    categoria: 'recompensa',
    nombre: 'Pago explícito de la promesa del hook',
    descripcion:
      'Cuando el hook prometió algo (una respuesta, un resultado), el video debe entregarlo explícitamente y de forma reconocible -- cerrar el loop es lo que da la "recompensa" cognitiva de la tensión generada, según Zeigarnik.',
    ejemploAplicado: 'El Director de Retención ya marca la alerta "promesa_poco_clara" cuando esto no pasa.',
    evidenciaIds: ['zeigarnik-1927-tareas-incompletas'],
    respaldo: 'evidencia',
    compatibleConIntencion: ['cerrar', 'revelar'],
  },

  // ───────────────────────────── CAMBIO DE PERSPECTIVA (Ronda 7, nuevo)
  {
    id: 'giro-de-marco',
    categoria: 'cambio_perspectiva',
    nombre: 'Giro de marco (reencuadrar lo ya mostrado)',
    descripcion:
      'Presenta la misma información desde un ángulo distinto al que la audiencia asumía (ej. pasar de "cuánto cuesta" a "cuánto genera") -- técnica narrativa de práctica común, sin un estudio específico que la mida.',
    ejemploAplicado: 'Pasar de mostrar el precio del curso ($89) a mostrar lo que generó ($3.560) -- el mismo patrón que ya usan los guiones de demo_05/06.',
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
    compatibleConIntencion: ['revelar', 'comparar'],
  },

  // ───────────────────────────── STORYTELLING (Ronda 7, nuevo)
  {
    id: 'estructura-problema-agitacion-solucion',
    categoria: 'storytelling',
    nombre: 'Problema → Agitación → Solución (PAS)',
    descripcion:
      'Identifica un problema concreto, amplifica el malestar/costo real de no resolverlo, y presenta la solución -- fórmula clásica de copywriting/storytelling de marca.',
    ejemploAplicado: 'Los guiones de la fábrica sobre productos digitales (ej. Tomás) ya siguen esta forma implícitamente.',
    evidenciaIds: ['storytelling-storybrand-pas-pixar'],
    respaldo: 'buena_practica',
    compatibleConIntencion: ['contextualizar', 'construir_tension'],
  },

  // ───────────────────────────── RITMO (Ronda 7, nuevo)
  {
    id: 'corte-en-la-accion',
    categoria: 'ritmo',
    nombre: 'Corte en el punto natural de la acción/oración',
    descripcion:
      'Cortar exactamente al final natural de una acción o frase -- cortar antes se siente inconcluso, cortar después pierde momentum. Convención de edición profesional de décadas.',
    ejemploAplicado: 'El Director de Edición (Ronda 4) ya ancla microeventos a offsets reales de audio para evitar cortes en medio de una idea.',
    evidenciaIds: ['jcut-lcut-cutting-on-action', 'pattern-interrupt-concepto'],
    respaldo: 'buena_practica',
    compatibleConIntencion: ['acelerar', 'dejar_respirar'],
  },

  // ───────────────────────────── CIERRE (Ronda 7, nuevo)
  {
    id: 'resolucion-explicita-del-loop',
    categoria: 'cierre',
    nombre: 'Resolución explícita de todo loop abierto',
    descripcion:
      'Ningún loop abierto durante el video (hook u otro) queda sin resolver en el cierre -- dejarlo sin cerrar frustra en vez de enganchar, según la misma base de Zeigarnik que justifica abrirlos.',
    ejemploAplicado: 'El Director de Retención marca "promesa_poco_clara" cuando el mapa detecta un hook sin resolución visible antes del cierre.',
    evidenciaIds: ['zeigarnik-1927-tareas-incompletas', 'heuristica-cliffhanger-aplicado-vertical'],
    respaldo: 'evidencia',
    compatibleConIntencion: ['cerrar'],
  },

  // ───────────────────────────── CTA (Ronda 7, nuevo)
  {
    id: 'cta-especifico-accionable',
    categoria: 'cta',
    nombre: 'CTA específico y accionable (no genérico)',
    descripcion:
      'El llamado a la acción del cierre debe ser una acción concreta y única, no una lista de opciones ni un "seguime para más" genérico -- coherente con el rol del "guía" en StoryBrand: le dice al héroe (la audiencia) exactamente qué hacer después.',
    ejemploAplicado: '"Mirá el link en la bio" en vez de "seguime, dale like y comentá".',
    evidenciaIds: ['storytelling-storybrand-pas-pixar'],
    respaldo: 'buena_practica',
    compatibleConIntencion: ['cerrar'],
  },
];
