# Estado vivo del proyecto

A diferencia de `fabrica/ESTADO_ACTUAL.md` (informe congelado de Ronda
4, marcado explícitamente como histórico), este documento se actualiza
después de cada bloque de trabajo real, como pide el "Prompt Maestro
3" (sección 28). Para el detalle técnico completo de cada ronda, ver
`MEJORAS_RONDA*.md`; para lo que necesita al operador,
`PENDIENTES_OPERADOR.md`; para todo lo pendiente técnico,
`PENDIENTES.md`.

## Último bloque de trabajo: R7-23 (2026-09-03)

Pedido explícito del operador: priorizar la investigación para
detectar patrones virales, y que el sistema los use automáticamente
("que detecte patrones... y luego haga todo").

**HECHO:**
- Verificado (de nuevo, con curl real, no de memoria) que TikTok,
  Social Blade, Google Trends, Exploding Topics y vidIQ siguen
  bloqueados desde este sandbox -- los datos REALES de vistas/
  engagement de contenido real siguen dependiendo de que el operador
  consiga la clave gratis de YouTube Data API (R7-20, ya lista) o
  habilite vidIQ. Registrado explícitamente en
  `research/investigacion_necesaria.ts` como bloqueo real, no
  abandonado.
- Mientras tanto, investigación SÍ posible con `WebSearch`: 3 patrones
  cualitativos que convergen en múltiples fuentes independientes de
  2026 se agregaron al Knowledge Engine (`conocimiento/base.ts`,
  items 15-17) -- "resultado primero" (abrir con el desenlace),
  "especificidad numérica" (formaliza algo que la fábrica ya hacía
  intuitivamente), y una tensión real sin resolver (crudo vs.
  producido). Las cifras puntuales sin fuente primaria verificable
  (ej. "1.3 segundos", "34.635 clips", "+138% conversión") se
  descartaron explícitamente, mismo criterio que Ronda 7 original.
- **"Resultado primero" agregado como patrón nuevo real a
  `hooks/catalogo.ts`** -- no quedó solo documentado: se verificó que
  el Director de Edición ya puede elegirlo de verdad (probado forzando
  la elección, evitando los otros 4 patrones de apertura) sin cablear
  nada más, gracias a que R7-15 ya conecta el catálogo completo a la
  elección automática.
- **Bug de cobertura real encontrado y arreglado**: 13 archivos de
  test de Ronda 7 (`hooks/`, `conocimiento/`, `research/`, `skills/`,
  `ventas/`, `carrusel/`, `datos/`, `decision_engine/`,
  `ecosistema_producto/`, `mcp/`, `directores/edicion/test_tecnicas.ts`)
  nunca se habían agregado a `package.json`/`test-todo` -- corrían
  bien sueltos pero jamás como parte de la batería estándar. Ahora
  `npm run test-todo` corre las 32 suites reales del proyecto, no 19.

**PRÓXIMO PASO:** con el patrón nuevo ya disponible, ejercitarlo en un
video real (mismo patrón que R7-21) cuando se genere el próximo demo.
El techo de fondo sigue siendo el mismo: sin la clave de YouTube o
vidIQ, no hay forma de saber si estos patrones correlacionan con
retención/ventas reales -- son teoría bien fundada, no datos propios.

## Bloque anterior: R7-22 (2026-09-03)

Tras archivar "El Corte" (Fase 1 original, decisión del operador) y
confirmar que `fabrica/` pasa a ser la prioridad explícita del
proyecto (ver CLAUDE.md), se siguió con el segundo hallazgo más
importante de la auditoría de puntos débiles (R7-19): música de fondo
en `null` desde Ronda 1.

**HECHO:**
- `fabrica/musica/biblioteca.json` poblado con 9 tracks reales CC0 1.0
  Universal (repo público `effacestudios/Royalty-Free-Music-Pack`,
  clonado con `git clone` -- canal de red confirmado funcional en este
  sandbox -- y licencia verificada leyendo el `LICENSE` real del repo,
  no solo la descripción). Postura resolutiva real: la vía "oficial"
  (GitHub Actions + Jamendo/FMA, ya preparada desde antes) había
  fallado (FMA cambió de API, Jamendo pide una key que el operador no
  configuró) -- en vez de reportar bloqueado, se buscó y verificó una
  alternativa real con las herramientas disponibles en esta sesión.
  Metadata de mood/intensidad marcada honestamente como "primer pase"
  (inferido de nombre + volumen real medido con ffmpeg, no de
  escuchar el track completo) -- mismo patrón que ya se usa para voz.
- `directores/audio.ts`: `intensidadMusicaPromedio()` nuevo (escala
  separada de `VOLUMEN_POR_NIVEL`, que es para SFX). `composicion/tipos.ts`:
  campo `musicaFondo` nuevo en `ArbolComposicion`.
- `fabrica-demo-07` generado: MISMO guion/voz/edición que
  `fabrica-demo-06` (experimento A/B real, única variable: música) --
  render completo, QA duro 100% limpio, y evidencia cuantitativa real
  de que la música se escucha en los huecos de silencio (-42.6dB)
  sin competir con la narración (volumen medio del video casi
  idéntico a demo_06: -17.1dB vs -17.2dB).
- `remotion-spike/src/fabrica_bridge/FabricaVideo.tsx`: `<Audio>` de
  fondo nuevo, fuera del `TransitionSeries`, volumen fijo 0.12.

**LIMITACIÓN REAL, no resuelta (documentada en ARQUITECTURA.md):** sin
loop de audio (se corta si un video supera la duración del track,
~90-100s) y sin ducking dinámico (volumen fijo, no baja solo durante
la narración) -- suficiente para los videos cortos de hoy, no para un
formato más largo.

**PRÓXIMO PASO:** con retención (R7-15) y música ya probadas en video
real, el techo que queda es siempre el mismo: cero dato de resultado
real (nada publicado todavía). Candidatos incrementales: probar más
efectos de `@remotion/effects` (solo se usó 1 de ~60), o resolver el
bug recurrente de props por categoría de raíz.

## Bloque anterior: R7-21 (2026-09-03)

Pedido del operador: buscar una solución 100% gratis para investigación
de contenido, y seguir con la línea de "exploración agresiva" -- se
priorizó cerrar el hallazgo más grande de la auditoría R7-19 (ver
`ARQUITECTURA.md` > PUNTOS DÉBILES): R7-15 nunca se había ejercitado en
un video real.

**HECHO:**
- `fabrica-demo-06` (7 unidades) regenerado con
  `directorEdicion.planificar(ctx, golpe, evitarPatrones)` real (antes
  el generador no pasaba el 3er parámetro) -- anti-repetición de
  patrones de retención confirmada con datos reales: 7 patrones
  distintos, uno por unidad, mapa coherente
  (hook->desarrollo->escalada(climax)->pausa->revelacion->escalada->cierre).
- Render completo real (1150/1150 frames, 38.4s) + QA duro 100% limpio
  (`problemas: []`, `alertas: []`) + 3 frames extraídos e inspeccionados
  visualmente (hook, Torre3D a los 18s, cierre) -- confirmados
  correctos.
- Bug real encontrado y arreglado en el camino (postura resolutiva,
  no estaba planeado): `Torre3D` (R6-10) nunca tenía caso en
  `propsParaCifra()` -- se agregó, con test dedicado.
- Video registrado en memoria (`--confirmar`, primera vez que
  `patronesRetencionUsadosEnEsteVideo` se persiste de verdad en
  `patrones_usados.json` desde un video completo, no un test).
- Detalle completo de R7-20 (cliente real de YouTube Data API v3,
  confirmado 100% gratis sin tarjeta ni tope de pago, sin necesidad de
  vidIQ/Gemini) en el bloque siguiente.

**PRÓXIMO PASO:** con R7-15 ya probado en video real, el techo más
grande que queda es el de siempre: cero dato de resultado real
(ninguna publicación todavía). El resto son mejoras incrementales
(probar más efectos de `@remotion/effects`, música de fondo real).

## Bloque anterior: R7-20 (2026-09-03)

**HECHO:**
- `fabrica/research/youtube_api.ts` -- cliente real de YouTube Data
  API v3 (`buscarVideos`, `estadisticasDeVideos`), confirmado con
  `WebSearch` (múltiples fuentes 2026) que es 100% gratis: no pide
  tarjeta para generar la key, y a diferencia de vidIQ/Gemini NO EXISTE
  un tier pago -- solo un formulario gratis para pedir más cuota.
  Reemplaza la ambigüedad de costo de vidIQ/Gemini con una opción de
  costo cero verificado.
- Tests con `fetch` mockeado, fixtures iguales a la forma real
  documentada de la API.
- Guía de 5 pasos para que el operador saque su key gratis, agregada a
  `PENDIENTES_OPERADOR.md`.

**BLOQUEADO (requiere al operador):** la key de YouTube Data API v3
(`FABRICA_YOUTUBE_API_KEY`) -- el cliente nunca inventa datos si falta,
tira error explícito.

## Bloque anterior: R7-19 (2026-09-03)

El operador señaló (correctamente) que la investigación venía siendo
demasiado literal: se reportaba "bloqueado" ante el primer `WebFetch`
fallido en vez de buscar rutas alternativas, y no se había ido a
buscar el universo amplio de skills/comunidades que el operador pedía
explícitamente investigar.

**HECHO:**
- Confirmado con pruebas reales que este sandbox usa una lista
  BLANCA de dominios (ni Google ni Bing responden por curl directo) --
  ningún proxy/espejo la esquiva desde adentro. Pero `WebSearch` tiene
  su propio camino de red (no pasa por el mismo proxy) y SÍ funciona
  ampliamente -- es la herramienta real para investigación externa.
  Documentado como decisión permanente en `DECISIONES.md`.
- Con `WebSearch` + lectura de código fuente real (`raw.githubusercontent.com`)
  se encontraron y evaluaron a fondo: `coreyhaines31/marketingskills`
  (50 skills de marketing, MIT) -- se instalaron 10 relevantes a Fase 1
  en `.claude/skills/`; `chuk-motion` (MCP de Remotion, Apache-2.0);
  `tiktok-trends-mcp`/`viral-app-mcp`/`video-url-analyzer-mcp` (MCP de
  contenido, cada uno con su licencia/costo real verificado, no
  asumido).
- Primera vez que la fábrica tiene criterio experto de VENTAS
  instalado (antes `fabrica/ventas/` era solo arquitectura vacía).

**BLOQUEADO (requiere al operador):** activar `video-url-analyzer-mcp`
(usa API de Google Gemini, no 100% gratis) -- registrado en
`PENDIENTES_OPERADOR.md`.

**PRÓXIMO PASO:** seguir la línea de descubrimiento amplio si el
operador lo pide (más MCP de contenido, más skills del catálogo de
marketing según necesidad real, no instalación preventiva).

## Bloque anterior: R7-17 (2026-09-03)

**HECHO:**
- `fabrica/mcp/` -- primer registro real de conectores MCP (4 items:
  vidIQ, Trends MCP, OpusClip, cluster de SaaS de video pagos).
- `fabrica/docs/AUDITORIA_PROMPT_MAESTRO_3.md` -- mapeo del pedido
  "capa de inteligencia" contra el estado real; decisión de NO crear
  `fabrica/inteligencia/` porque duplicaría 11 de 13 carpetas pedidas.
- Confirmados y registrados los 3 Agent Skills de Remotion ya
  disponibles en este entorno (`remotion-markup`, `remotion-render`,
  `remotion-captions`) en `fabrica/skills/`.
- Este documento (`ESTADO.md`).

**CONFIRMADO (evidencia real, no supuesto):**
- `Interactive`, `CanvasImage`, `AnimatedImage` existen en
  `remotion@4.0.518` (versión instalada) -- la skill `remotion-markup`
  es compatible con la versión fijada del proyecto.
- Existe un conector MCP **vidIQ** instalado a nivel de organización
  con herramientas reales de investigación de YouTube/Instagram/
  TikTok (outliers, trending, stats de canal) -- confirmado con
  `ListConnectors`/`SearchMcpRegistry`, no inventado.

**BLOQUEADO (requiere al operador, ver `PENDIENTES_OPERADOR.md`):**
- Conectar vidIQ -- no se puede confirmar si el plan asociado tiene
  costo sin habilitarlo, y habilitar un conector de terceros no es una
  decisión reversible tomable sin autorización (regla de $0).
- Agregar Trends MCP como conector personalizado (candidato gratis
  según su propia fuente, no verificado de forma independiente).

**NO CONFIRMADO todavía:**
- Si vidIQ (una vez conectado) realmente da acceso gratis a
  `vidiq_outliers`/`vidiq_earnings_estimate`, o si esas herramientas
  específicas requieren el plan pago de la plataforma.

**PRÓXIMO PASO:** esperar la decisión del operador sobre vidIQ/Trends
MCP. Mientras tanto, seguir extendiendo los módulos ya existentes
(Knowledge Engine, Viral/Retention Engine, Advanced Editing Engine)
con lo que SÍ se puede investigar sin conectores nuevos (búsqueda web
de fuentes oficiales/académicas, como ya se hizo en R7-1).

## Bloques anteriores (resumen, detalle completo en cada `MEJORAS_RONDA*.md`)

- **R7-16:** Subtítulos -- whisper.cpp compila real, modelo bloqueado
  por política de red (huggingface.co + mirror, ambos denegados).
- **R7-15:** Viral/Retention Engine conectado a la elección automática
  del Director de Edición (con anti-repetición).
- **R7-14:** Generador completo de carruseles (6-10 slides desde una
  fuente del Knowledge Engine), carrusel real de 7 slides renderizado.
- **R7-0 a R7-13:** construcción completa del "sistema operativo de
  contenido + ventas" (Knowledge/Research/Skill Intelligence/Viral-
  Retention/Advanced Editing/Sales/Product Ecosystem/Carousel/Data/
  Decision Engine) -- ver `MEJORAS_RONDA7.md`.
- **Rondas 1-6:** pipeline completo de video (guion→voz→visual→
  audio→edición→retención→render→QA→memoria) -- ver
  `docs/ARQUITECTURA.md`.
