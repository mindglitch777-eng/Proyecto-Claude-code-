import type {McpInvestigado} from './tipos';

/**
 * Registro real de conectores MCP investigados (Ronda 7, R7-17).
 * Ningún dato inventado: `vidiq` se confirmó con ListConnectors/
 * SearchMcpRegistry (herramientas reales listadas por el propio
 * registro de conectores de esta cuenta); `trends-mcp` se encontró
 * por búsqueda web (fuente citada, marcado como no verificado
 * directamente); el resto se encontró en el mismo registro de
 * conectores al buscar por categoría "video/contenido".
 */
export const MCP_INVESTIGADOS: McpInvestigado[] = [
  {
    id: 'vidiq',
    nombre: 'vidIQ',
    fuente: 'Conector MCP instalado a nivel de organización en claude.ai (confirmado con ListConnectors, 2026-09-03). Herramientas reales expuestas: vidiq_keyword_research, vidiq_outliers, vidiq_similar_thumbnails, vidiq_channel_stats, vidiq_trending_videos, vidiq_channel_search, vidiq_video_earnings_estimate, vidiq_earnings_calculate (+35 más).',
    funcion: 'Investigación real de YouTube/Instagram/TikTok: qué videos son outliers (mucho mejor que el promedio del canal), qué está en tendencia, estadísticas reales de canal, estimación de ganancias -- es la respuesta MÁS directa a la sección 4 del "Prompt Maestro 3" (investigar patrones ganadores de contenido real), y algo que este sandbox no puede hacer solo (scraping directo de esas plataformas está bloqueado por política de red).',
    licencia: 'Servicio comercial (vidIQ Inc.), no es código abierto -- términos propios de la plataforma.',
    requiereCuenta: true,
    requiereApiKey: false,
    esGratis: 'no_confirmado',
    limites: 'No confirmado sin conectar -- vidIQ tiene un plan gratuito limitado, pero herramientas como "outliers" o "earnings estimate" suelen ser de planes pagos en la mayoría de estas plataformas; no se puede saber el alcance real del plan de esta cuenta sin habilitarlo.',
    riesgo: 'Está instalado a nivel de organización pero DESCONECTADO en este chat (enabledInChat: false). Habilitarlo activa el uso de una cuenta/plan de terceros -- viola la regla de $0 si el plan conectado tiene costo y no se confirmó antes. No se puede conectar un MCP desde este sandbox unilateralmente: requiere que el operador lo habilite en la configuración de conectores de este chat en claude.ai.',
    utilidad: 'Si el plan conectado no tiene costo (o ya está pago por otro motivo), sería la primera fuente de datos REALES de qué contenido funciona en el nicho -- reemplazaría por completo la limitación actual de "no podemos ver ejemplos reales de contenido viral".',
    estadoConexion: 'instalado_no_conectado',
    decision: 'esperar_autorizacion_operador',
    fecha: '2026-09-03',
  },
  {
    id: 'trends-mcp',
    nombre: 'Trends MCP Server',
    fuente: 'https://mcpservers.org/servers/trendsmcp/trends-mcp (encontrado por búsqueda web, 2026-09-03) -- NO está en el registro de conectores de esta cuenta, NO se pudo verificar conectándolo directamente.',
    funcion: 'Tendencias en tiempo real unificadas de Google (Search/Images/News/Shopping), YouTube, TikTok, Reddit, Amazon, Wikipedia, X, LinkedIn, Spotify, GitHub, Steam, npm, App Store -- según la descripción de la fuente, sin necesidad de scrapear cada plataforma por separado.',
    licencia: 'No verificada -- la fuente no confirma si el servidor en sí es open source o un wrapper comercial con API key propia.',
    requiereCuenta: true,
    requiereApiKey: true,
    esGratis: 'no_confirmado',
    limites: 'La fuente DECLARA "20 requests/día sin tarjeta de crédito" -- esto es una afirmación de la propia página del servicio, NO verificada de forma independiente por nosotros (mismo criterio que la sección 11 del prompt: si no se puede confirmar, se registra como tal, no como hecho).',
    riesgo: 'No es un conector de la organización -- agregarlo requeriría que el operador lo sume como conector personalizado en claude.ai. No hay riesgo de código (no se instala nada en el repo), pero sí implica crear una cuenta en un tercero.',
    utilidad: 'Complementaría a vidIQ con tendencias fuera de YouTube/TikTok/Instagram (Reddit, X, Google Trends) -- útil para el Research System al elegir temas para Fase 1.',
    estadoConexion: 'no_instalado',
    decision: 'probar',
    fecha: '2026-09-03',
  },
  {
    id: 'opusclip',
    nombre: 'OpusClip',
    fuente: 'Registro de conectores MCP de la cuenta (SearchMcpRegistry, 2026-09-03) -- no instalado.',
    funcion: '"Turn long videos into viral short clips" -- recorta videos largos existentes en clips cortos.',
    licencia: 'Servicio comercial.',
    requiereCuenta: true,
    requiereApiKey: false,
    esGratis: false,
    riesgo: 'Servicio pago (freemium con límites muy bajos en el plan gratuito, según reputación pública de la herramienta) -- no se conecta sin autorización de gasto.',
    utilidad: 'Ninguna para nuestro caso de uso: la fábrica GENERA video desde cero con Remotion (guion → voz → composición), no recorta grabaciones largas ya existentes -- es un problema distinto al que resuelve OpusClip.',
    estadoConexion: 'no_instalado',
    decision: 'descartar',
    fecha: '2026-09-03',
  },
  {
    id: 'cluster-video-saas-pagos',
    nombre: 'Tella / Cloudinary / Adobe for creativity / HyperFrames by HeyGen / Descript / Riverside',
    fuente: 'Registro de conectores MCP de la cuenta (SearchMcpRegistry, 2026-09-03) -- ninguno instalado.',
    funcion: 'Edición/grabación/gestión de video y assets como servicio (screen recording, transformación de imágenes/video en la nube, suite creativa, motion graphics con HTML, transcripción/edición de podcasts, grabación remota).',
    licencia: 'Todos servicios comerciales (Cloudinary tiene un tier gratuito para almacenamiento/transformación de assets, pero no lo necesitamos: los assets de la fábrica son locales).',
    requiereCuenta: true,
    requiereApiKey: false,
    esGratis: false,
    riesgo: 'Todos con planes pagos para el uso real (más allá de un tier gratuito muy acotado) -- ninguno agrega una capacidad que Remotion (ya integrado, MIT, gratis, corriendo en este mismo repo) no tenga para el caso de uso real de la fábrica: generación programática de video, no edición manual de grabaciones ni gestión de assets en la nube.',
    utilidad: 'Ninguna identificada hoy -- se agrupan en una sola entrada (en vez de 6 entradas casi idénticas) para no inflar el registro con "descartado por el mismo motivo" repetido.',
    estadoConexion: 'no_instalado',
    decision: 'descartar',
    fecha: '2026-09-03',
  },
];
