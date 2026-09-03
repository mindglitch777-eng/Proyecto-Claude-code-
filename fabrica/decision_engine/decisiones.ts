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
];
