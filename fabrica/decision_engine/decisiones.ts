import type {DecisionArquitectura} from './tipos';

/**
 * Aplicación real del Decision Engine a la pregunta que queda abierta
 * literalmente al cerrar Ronda 7: con Knowledge/Hook/Editing/Sales/
 * Carousel/Data Engine recién construidos, ¿dónde conviene poner el
 * esfuerzo de la próxima ronda?
 */
export const DECISIONES_ARQUITECTURA: DecisionArquitectura[] = [
  {
    id: 'prioridad-post-ronda-7',
    pregunta: '¿Dónde poner el esfuerzo de la próxima ronda: seguir profundizando el motor de video, expandir el Carousel Engine, o enfocarse en validar el Sales Engine con datos reales del negocio?',
    fecha: '2026-09-03',
    estado: 'abierta',
    opciones: [
      {
        id: 'profundizar-video',
        nombre: 'Profundizar el motor de video',
        queHace: 'Conectar el Hook Engine a la elección automática del Director de Edición, resolver subtítulos reales (whisper.cpp/@remotion/captions, PROBAR desde Ronda 5), agregar más componentes 3D.',
        ventajas: ['El motor de video es lo más maduro y probado de la fábrica -- cada mejora tiene alto piso de calidad garantizado.', 'Subtítulos son el pendiente más antiguo del proyecto (desde Ronda 2).'],
        desventajas: ['No genera ningún dato de negocio real nuevo -- sigue siendo "mejorar la máquina", no "validar si hay mercado".', 'Confirmar WebGL2 en GitHub Actions real sigue pendiente (Ronda 6) antes de poder confiar en efectos/3D en producción.'],
        dependencias: ['@remotion/install-whisper-cpp + @remotion/captions (PROBAR, sin instalar todavía)'],
        costos: '$0 -- todo lo necesario ya está identificado como gratuito.',
        riesgos: ['Seguir puliendo un motor que ya funciona bien mientras el negocio real (Fase 1 de CLAUDE.md: 1 producto vendible en Hotmart) sigue sin avanzar.'],
        potencial: 'Alto para la CALIDAD del contenido, bajo impacto directo en generar la primera venta.',
        complejidad: 'media',
      },
      {
        id: 'expandir-carousel',
        nombre: 'Expandir el Carousel Engine',
        queHace: 'Construir un generador real de carruseles completos (8-10 slides) a partir de un tema, con más tipos de slide (imagen/captura real para "ejemplo") y publicación de prueba.',
        ventajas: ['Un carrusel es MUCHO más barato y rápido de producir que un video -- permite iterar contenido de prueba más rápido.', 'Reutiliza 100% el Knowledge Engine y el Viral/Retention Engine ya construidos, sin duplicar trabajo.'],
        desventajas: ['El Carousel Engine recién tiene 1 componente probado (R7-10) -- construir un generador completo es trabajo nuevo, no una extensión chica.', 'Instagram/LinkedIn (plataformas de carrusel) no son necesariamente donde vive la audiencia real del producto de Fase 1 -- no confirmado.'],
        dependencias: ['Ninguna nueva -- todo con lo que ya existe.'],
        costos: '$0.',
        riesgos: ['Construir un generador de contenido para una plataforma sin haber confirmado que la audiencia real está ahí.'],
        potencial: 'Medio -- contenido de prueba más barato, pero no resuelve la pregunta de si hay demanda real.',
        complejidad: 'media',
      },
      {
        id: 'validar-sales-engine',
        nombre: 'Enfocarse en validar el Sales Engine con datos reales del operador',
        queHace: 'Conseguir del operador la información real de negocio (quién es la audiencia, qué problema resuelve el producto de Fase 1, qué oferta/precio probar) y empezar a cargar fabrica/ventas/ con datos reales en vez de la estructura vacía actual.',
        ventajas: ['Es lo único de las 3 opciones que avanza DIRECTAMENTE el objetivo de negocio real (CLAUDE.md, Fase 1: "1 producto digital vendible en Hotmart").', 'Sin esto, todo el Sales Engine/Product Ecosystem construido en R7-8/R7-9 sigue vacío y no se puede medir nada real.'],
        desventajas: ['Requiere información que SOLO el operador puede aportar -- no es una tarea que se pueda ejecutar de forma autónoma.', 'No es "código nuevo" -- puede sentirse como que la sesión avanza menos.'],
        dependencias: ['Respuesta del operador (audiencia real, problema real, precio a probar).'],
        costos: '$0.',
        riesgos: ['Ninguno técnico -- el riesgo es de negocio (que la primera oferta no convierta), pero eso es información real, no una construcción de código.'],
        potencial: 'El más alto de las 3 para el objetivo real del proyecto (primera venta) -- pero bloqueado por una acción humana, no ejecutable unilateralmente ahora mismo.',
        complejidad: 'baja',
      },
    ],
    recomendacionId: 'validar-sales-engine',
    justificacion:
      'El objetivo declarado del proyecto (CLAUDE.md, Fase 1) es "1 producto digital vendible en Hotmart", no "un motor de video más pulido" -- ninguna mejora técnica de video o carrusel genera una venta por sí sola. Dicho esto, esta opción está BLOQUEADA por una decisión/información que solo el operador puede dar (no se puede inventar una audiencia o un precio). Recomendación práctica: preguntarle al operador esa información (registrado en PENDIENTES.md), y MIENTRAS se espera respuesta, seguir con "expandir el Carousel Engine" (opción B) como trabajo autónomo de más impacto que "profundizar video" (opción A), porque genera un canal de contenido más barato de iterar una vez que haya un producto real que promocionar.',
  },
  {
    id: 'beat-sync-cuando-conectar',
    pregunta: '¿Conectar ya el timing de golpes de directores/audio.ts a la grilla de BPM real de musicaFondo (beat-sync editing), o esperar a un video de prueba dedicado antes de tocar ese código?',
    fecha: '2026-09-03',
    estado: 'abierta',
    opciones: [
      {
        id: 'conectar-ahora',
        nombre: 'Conectar el beat-sync ahora mismo en directores/audio.ts',
        queHace: 'Usar `framesPerBeat = (60/BPM)*fps` (técnica real de la skill `beat-sync-editing`, iart-ai/motion-design-skills, MIT) para redondear el frame de cada golpe de una unidad al beat más cercano del track de `musicaFondo` ya elegido.',
        ventajas: ['El dato que faltaba (bpm real, no null) ya está medido con librosa desde R7-26 -- no hay dependencia externa pendiente.', 'Es la pieza que le falta a la música de fondo (R7-22) para dejar de ser solo un fondo pasivo y pasar a reforzar el ritmo de corte real.'],
        desventajas: ['El dato de BPM tiene una limitación real conocida y no verificada de oído (octave error, ver medir_bpm.py) -- redondear a una grilla equivocada podría sonar PEOR que el timing actual (que ya pasó QA en demo_06/07), no solo neutral.', 'No hay todavía un video de prueba que aísle esta variable sola (A/B real) -- se estaría cambiando un sistema que funciona sin evidencia de que la versión nueva es mejor.'],
        dependencias: ['Ninguna nueva -- bpm ya está en biblioteca.json.'],
        costos: '$0.',
        riesgos: ['Romper el timing de golpes ya validado en demo_06/07 por una hipótesis (que sincronizar a BPM se ve/siente mejor) todavía no probada con un render real comparado.'],
        potencial: 'Alto SI el BPM medido es correcto -- pero no confirmado todavía.',
        complejidad: 'media',
      },
      {
        id: 'esperar-video-dedicado',
        nombre: 'Esperar a un video de prueba dedicado (A/B real) antes de tocar directores/audio.ts',
        queHace: 'Dejar el beat-sync documentado como pendiente real (ya está, en fabrica/musica/README.md) y generar primero un demo_08 que sea *igual* a demo_07 salvo por el timing de golpes (con vs. sin grilla de BPM), comparando ambos con Critico Audiovisual antes de decidir si se integra de forma permanente.',
        ventajas: ['Sigue el mismo patrón ya usado con éxito en este proyecto (demo_07 fue un A/B deliberado contra demo_06) -- decisiones de "esto se ve/siente mejor" se toman con evidencia comparada, no por intuición.', 'No arriesga romper timing ya validado sin necesidad.'],
        desventajas: ['Un video de prueba más consume tiempo de render/tokens antes de saber si vale la pena.', 'Requiere que el operador escuche al menos un track para confirmar que el BPM medido no tiene octave error, si el resultado se ve raro.'],
        dependencias: ['Ninguna nueva.'],
        costos: '$0.',
        riesgos: ['Ninguno técnico -- el único costo es tiempo de la próxima ronda.'],
        potencial: 'Mismo potencial que la opción A, pero con la certeza de no degradar lo que ya funciona.',
        complejidad: 'baja',
      },
    ],
    recomendacionId: 'esperar-video-dedicado',
    justificacion:
      'La "postura resolutiva" de CLAUDE.md pide no paralizarse, pero también pide no romper sistemas que funcionan sin evidencia -- y acá el propio dato de entrada (BPM automático) tiene una limitación conocida y explícitamente no verificada ("aceleracion-planificando" a 178.2 BPM es plausible pero no confirmado de oído). Cambiar el timing de golpes en el sistema de producción real sin un A/B que lo respalde repetiría el error que este proyecto ya evitó antes (Ronda 6, decisión de @remotion/transitions se tomó DESPUÉS de comparar, no antes). Recomendación: generar el video de prueba dedicado en la próxima ronda de trabajo activo sobre la fábrica, no en esta capa de exploración.',
  },
];
