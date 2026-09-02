/**
 * Advanced Editing Engine (Ronda 7, directiva FASE NUEVA 5). Catálogo
 * AUDITABLE de las técnicas de edición/motion design que la fábrica ya
 * implementa (golpes, transiciones reales, efectos WebGL, 3D,
 * kinetic text) -- responde explícitamente "¿a qué está subordinada
 * esta técnica?" para que ninguna quede como "porque existe" (regla
 * dura textual de la directiva).
 *
 * Esto NO reimplementa nada -- cada `implementacion` apunta al código
 * real ya construido en rondas anteriores. Es la capa de conocimiento
 * que faltaba: por qué existe cada técnica, no solo que exista.
 */
export type PropositoNarrativo = 'narrativa' | 'retencion' | 'comprension' | 'impacto';
export type CategoriaTecnica = 'transicion' | 'motion' | 'composicion' | 'ritmo' | 'texto' | 'audio' | '3d' | 'ciclo_calidad';
export type RespaldoTecnica = 'evidencia' | 'patron_observado' | 'buena_practica' | 'sin_evidencia_formal';

export type TecnicaEdicion = {
  id: string;
  categoria: CategoriaTecnica;
  nombre: string;
  descripcion: string;
  /** Dónde vive el código real -- nunca una técnica sin implementación. */
  implementacion: string;
  /** A qué propósito narrativo está subordinada -- nunca vacío
   * (una técnica sin propósito declarado es exactamente lo que la
   * directiva prohíbe: "no agregar efectos solamente porque existen"). */
  subordinadoA: PropositoNarrativo[];
  /** id opcional de fabrica/hooks/catalogo.ts si esta técnica es la
   * ejecución concreta de un patrón de retención ya catalogado ahí. */
  patronRetencionRelacionado?: string;
  evidenciaIds: string[];
  respaldo: RespaldoTecnica;
};

export const TECNICAS_EDICION: TecnicaEdicion[] = [
  {
    id: 'golpe-fogonazo',
    categoria: 'transicion',
    nombre: 'Fogonazo (flash blanco + escala)',
    descripcion: 'Lavado a blanco con empujón de escala en el corte -- golpe de impacto por defecto para momentos de alta energía.',
    implementacion: 'remotion-spike/src/escenas/golpes.tsx (tipo "fogonazo")',
    subordinadoA: ['impacto'],
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
  },
  {
    id: 'golpe-sacudon',
    categoria: 'motion',
    nombre: 'Sacudón (shake + escala aleatoria)',
    descripcion: 'Vibración de posición/escala aleatoria que decae -- simula un golpe físico de cámara.',
    implementacion: 'remotion-spike/src/escenas/golpes.tsx (tipo "sacudon")',
    subordinadoA: ['impacto'],
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
  },
  {
    id: 'transicion-real-fundido',
    categoria: 'transicion',
    nombre: 'Crossfade real entre dos escenas',
    descripcion: 'Superposición real de dos escenas (@remotion/transitions) para continuidad suave -- reemplaza el corte duro cuando NO se quiere marcar un quiebre sino dar continuidad.',
    implementacion: 'remotion-spike/src/fabrica_bridge/FabricaVideo.tsx (TransitionSeries.Transition, golpe "fundido")',
    subordinadoA: ['narrativa', 'comprension'],
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
  },
  {
    id: 'transicion-real-desliza',
    categoria: 'transicion',
    nombre: 'Slide real entre dos escenas',
    descripcion: 'Una escena empuja a la otra desde un lado, superposición real -- transición direccional para indicar avance/progresión.',
    implementacion: 'remotion-spike/src/fabrica_bridge/FabricaVideo.tsx (TransitionSeries.Transition, golpe "desliza")',
    subordinadoA: ['narrativa'],
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
  },
  {
    id: 'cortina-lightleak-real',
    categoria: 'motion',
    nombre: 'Light leak real (lavado cálido diagonal)',
    descripcion: 'Efecto WebGL2 real de "light leak" de cámara analógica -- más suave que un golpe de impacto, para escenas que acompañan en vez de golpear.',
    implementacion: 'remotion-spike/src/escenas/golpes.tsx (tipo "cortina", @remotion/effects lightLeak())',
    subordinadoA: ['impacto', 'narrativa'],
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
  },
  {
    id: 'anticipo-pulsos-acelerados',
    categoria: 'ritmo',
    nombre: 'Anticipo (pulsos que se aceleran antes de un golpe fuerte)',
    descripcion: 'En los últimos instantes de una escena que termina en un golpe fuerte, pulsos de luz que se aceleran -- prepara el impacto en vez de que salte de la nada.',
    implementacion: 'remotion-spike/src/escenas/golpes.tsx (componente Anticipo, Ronda 3)',
    subordinadoA: ['retencion', 'impacto'],
    patronRetencionRelacionado: 'ritmo-que-no-deja-descansar',
    evidenciaIds: ['pattern-interrupt-concepto'],
    respaldo: 'buena_practica',
  },
  {
    id: 'anti-repeticion-golpes',
    categoria: 'ritmo',
    nombre: 'Variedad forzada de golpes (anti-repetición)',
    descripcion: 'El Director de Audio no repite el mismo tipo de golpe en cortes consecutivos -- un golpe repetido pierde su función de "reset de atención".',
    implementacion: 'fabrica/directores/audio.ts (Ronda 3)',
    subordinadoA: ['retencion'],
    patronRetencionRelacionado: 'ritmo-que-no-deja-descansar',
    evidenciaIds: ['pattern-interrupt-concepto'],
    respaldo: 'buena_practica',
  },
  {
    id: 'microeventos-anclados-a-audio',
    categoria: 'composicion',
    nombre: 'Microeventos anclados a offsets reales de audio',
    descripcion: 'El cambio visual dentro de una escena (ej. "antes" -> "después") ocurre EXACTO cuando el audio empieza a hablar de eso, no en una fracción fija de la duración total.',
    implementacion: 'fabrica/directores/edicion/microeventos.ts (Ronda 4) -- corrigió un desfasaje medido de 1.6s en demo_04.',
    subordinadoA: ['narrativa', 'comprension'],
    evidenciaIds: ['jcut-lcut-cutting-on-action'],
    respaldo: 'buena_practica',
  },
  {
    id: 'multi-audio-audiocentro',
    categoria: 'audio',
    nombre: 'Multi-audio dentro de una misma escena (patrón AudioCentro)',
    descripcion: 'Una escena puede tener varios clips de audio superpuestos en offsets distintos dentro de la misma animación, en vez de cortar a una escena nueva por cada línea.',
    implementacion: 'fabrica/composicion/armar.ts (resolverAudios) + remotion-spike/src/fabrica_bridge/FabricaVideo.tsx',
    subordinadoA: ['narrativa', 'comprension'],
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
  },
  {
    id: 'torre3d-momento-alto-impacto',
    categoria: '3d',
    nombre: 'Momento 3D real para cifras de alto impacto',
    descripcion: 'Profundidad/cámara/luz reales (no CSS) reservados para el momento de mayor impacto de un video -- no reemplaza componentes 2D en todos lados.',
    implementacion: 'remotion-spike/src/tres/Torre3D.tsx (R6-10)',
    subordinadoA: ['impacto'],
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
  },
  {
    id: 'enfasis-rough-notation',
    categoria: 'texto',
    nombre: 'Kinetic text: énfasis dibujado a mano sobre una cifra clave',
    descripcion: 'Círculo/subrayado real dibujado a mano alrededor del dato que importa, en el instante en que termina de "aterrizar" -- dirige la atención al dato específico, no solo lo muestra.',
    implementacion: 'remotion-spike/src/dibujo/enfasis.tsx (R6-11), conectado opcionalmente a Contador',
    subordinadoA: ['comprension', 'impacto'],
    evidenciaIds: ['silvia-2005-apraisal-interes'],
    respaldo: 'evidencia',
  },
  {
    id: 'ciclo-render-inspeccionar-corregir',
    categoria: 'ciclo_calidad',
    nombre: 'Ciclo acotado de render → inspección → corrección → re-render',
    descripcion: 'Después de renderizar, se extraen datos reales del mp4 (QA duro + crítica editorial + retención), se corrige lo que se puede corregir con seguridad, y se re-renderiza -- acotado a un máximo de iteraciones, nunca un loop infinito.',
    implementacion: 'fabrica/laboratorio/ciclo_mejora.ts (Ronda 4-5) -- YA satisface el pedido de la directiva ("RENDER → EXTRAER FRAMES → INSPECCIONAR → DETECTAR PROBLEMAS → CORREGIR → RENDER NUEVAMENTE"), no se reconstruye.',
    subordinadoA: ['narrativa', 'retencion', 'comprension', 'impacto'],
    evidenciaIds: [],
    respaldo: 'sin_evidencia_formal',
  },
];
