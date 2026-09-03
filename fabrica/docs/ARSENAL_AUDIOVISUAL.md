# Arsenal Audiovisual — capacidades externas conocidas

Pedido explícito del operador (sección 9, "Prompt Maestro — capa de
exploración agresiva"): un mapa vivo de qué herramientas/técnicas
externas existen para cada capacidad, cuál usamos, y por qué. **No es
una carpeta nueva** — es una síntesis de lo que ya vive repartido en
`fabrica/skills/registro.ts`, `fabrica/mcp/registro.ts`,
`fabrica/directores/edicion/tecnicas.ts` y `fabrica/hooks/catalogo.ts`
(cada capacidad linkea a su registro real; este documento no duplica
el detalle, lo organiza por capacidad en vez de por herramienta).

Se actualiza cada vez que se investiga/prueba una capacidad nueva —
nunca se re-investiga desde cero algo que ya está acá.

---

### CAPACIDAD: Transiciones con superposición real
**HERRAMIENTAS:** `@remotion/transitions` (oficial) · CSS crossfade casero (descartado)
**NUESTRA IMPLEMENTACIÓN:** `remotion-spike/src/fabrica_bridge/FabricaVideo.tsx` (`TransitionSeries`)
**MEJOR OPCIÓN ACTUAL:** `@remotion/transitions`
**ESTADO:** INTEGRADO (R6-8)
**EVIDENCIA:** Render real con audio, sin desincronizar la narración (`ffmpeg silencedetect`) — `remotion-spike/src/pruebas-r6/README.md`
**COSTO:** $0 (Remotion License, cubre individuos)
**COMPATIBILIDAD:** confirmada con `remotion@4.0.518`
**RIESGO:** ninguno — ya en producción, solo para golpes 'fundido'/'desliza'

### CAPACIDAD: Efectos visuales/cinematográficos (viñeta, glitch, etc.)
**HERRAMIENTAS:** `@remotion/effects` (oficial, ~60 efectos WebGL2)
**NUESTRA IMPLEMENTACIÓN:** `lightLeak()` real para golpe 'cortina'; vignette probado y descartado (muy opaco)
**MEJOR OPCIÓN ACTUAL:** `@remotion/effects`
**ESTADO:** INTEGRADO parcialmente (R6-9) — solo `lightLeak()`, el resto del catálogo de ~60 efectos sin explorar caso por caso
**EVIDENCIA:** WebGL2 confirmado funcionando en `headless_shell` sin GPU dedicada (hallazgo no garantizado de antemano)
**COSTO:** $0
**COMPATIBILIDAD:** confirmada en este sandbox; **NO CONFIRMADO** en runner real de GitHub Actions (`fabrica/research/`, id `webgl2-github-actions-runner-real`)
**RIESGO:** ninguno de costo; el pendiente es de plataforma (CI real), no de la herramienta

### CAPACIDAD: Motion 3D
**HERRAMIENTAS:** `@remotion/three` (oficial) · `@remotion/skia` (oficial, no probado) · `@remotion/rive` (oficial, Remotion License, no probado)
**NUESTRA IMPLEMENTACIÓN:** `Torre3D` (`remotion-spike/src/tres/Torre3D.tsx`)
**MEJOR OPCIÓN ACTUAL:** `@remotion/three` (única probada con render real)
**ESTADO:** INTEGRADO (R6-10) para `@remotion/three`; `skia`/`rive` sin evaluar en profundidad — BLOQUEADO/NO CONFIRMADO si aportarían algo que `three` no dé
**EVIDENCIA:** render real de punta a punta con audio, iteración de ajuste de escala documentada
**COSTO:** $0
**COMPATIBILIDAD:** confirmada
**RIESGO:** ninguno para `three`; `skia`/`rive` sin evaluar, no se asume nada de ellos

### CAPACIDAD: Kinetic Typography / énfasis de texto
**HERRAMIENTAS:** `@remotion/rough-notation` (oficial)
**NUESTRA IMPLEMENTACIÓN:** primitiva `<Enfasis>` conectada opcionalmente a `Contador`
**MEJOR OPCIÓN ACTUAL:** `@remotion/rough-notation`
**ESTADO:** INTEGRADO (R6-11)
**EVIDENCIA:** círculo dibujado a mano confirmado con 2 renders reales (ajuste de espaciado documentado)
**COSTO:** $0
**COMPATIBILIDAD:** confirmada
**RIESGO:** ninguno — opt-in, cero cambio para videos que no lo usan

### CAPACIDAD: Subtítulos con timing palabra-por-palabra
**HERRAMIENTAS:** `@remotion/install-whisper-cpp` + `@remotion/captions` (oficiales) · prototipo propio con `faster-whisper` (Python)
**NUESTRA IMPLEMENTACIÓN:** `TikTokCaptions.tsx` (renderiza `Caption[]`, confirmado real) — sin transcripción real todavía
**MEJOR OPCIÓN ACTUAL:** el camino whisper.cpp (oficial, mejor integración) sobre el prototipo casero
**ESTADO:** PROBAR — BLOQUEADO/NO CONFIRMADO la transcripción real (el binario compila, el modelo no se puede descargar: huggingface.co y su mirror están denegados por política de red de este sandbox)
**EVIDENCIA:** `whisper-cli --help` corre real; `TikTokCaptions.tsx` renderizado real con fixture sintética (`fabrica/salidas/captions_001/`)
**COSTO:** $0 (whisper.cpp es MIT, corre 100% local)
**COMPATIBILIDAD:** confirmada para el build; no confirmada la descarga del modelo en este entorno
**RIESGO:** ninguno de costo — el bloqueo es de red del sandbox, candidato a resolverse en GitHub Actions

### CAPACIDAD: Visualización de datos / gráficos / charts
**HERRAMIENTAS:** `@remotion/shapes` + `@remotion/paths` (oficiales, MIT) · `chuk-motion` (MCP de terceros, 6 tipos de chart) · Grafico.tsx (propio, solo barras)
**NUESTRA IMPLEMENTACIÓN:** `Grafico.tsx` (barras) + `GraficoTorta.tsx` NUEVO (torta/donut, R7-18)
**MEJOR OPCIÓN ACTUAL:** `@remotion/shapes`/`paths` integrado directo (control total, sin arquitectura paralela)
**ESTADO:** INTEGRADO (R7-18)
**EVIDENCIA:** render real, 2 bugs encontrados y corregidos probando (`fabrica/salidas/grafico_torta_001/`)
**COSTO:** $0
**COMPATIBILIDAD:** confirmada, versión alineada a `4.0.518` tras corregir un desalineamiento real
**RIESGO:** ninguno — `chuk-motion` tiene más tipos de chart ya armados pero es una arquitectura completa paralela, se usa solo como referencia de diseño, no como dependencia

### CAPACIDAD: Efectos cinematográficos temporales (motion blur)
**HERRAMIENTAS:** `@remotion/motion-blur` (oficial)
**NUESTRA IMPLEMENTACIÓN:** ninguna
**MEJOR OPCIÓN ACTUAL:** `@remotion/motion-blur`, pero no instalado todavía
**ESTADO:** PROBAR (bloqueado por versión, no por licencia/costo)
**EVIDENCIA:** se instaló para probar, se encontró que fuerza una copia anidada de `remotion@4.0.520` (desalineada con el `4.0.518` del proyecto) — se desinstaló antes de escribir código sobre una base inestable
**COSTO:** $0
**COMPATIBILIDAD:** NO CONFIRMADA hasta homologar la versión de Remotion de todo el proyecto
**RIESGO:** medio -- toca el motor temporal (compara frames), más riesgoso que shapes/paths si se fuerza sin alinear versiones

### CAPACIDAD: SFX (banco de efectos de sonido)
**HERRAMIENTAS:** `@remotion/sfx` (oficial)
**NUESTRA IMPLEMENTACIÓN:** biblioteca propia en `assets/sfx/` (impacto/campana/riser/tick/whoosh/sub)
**MEJOR OPCIÓN ACTUAL:** la biblioteca propia — confirmado, no "sin decidir"
**ESTADO:** PROBADO (R7-24) -- BLOQUEADO/NO CONFIRMADO en este sandbox, descartado para este proyecto por una razón de ARQUITECTURA real, no solo de sandbox
**EVIDENCIA:** instalado de verdad (`@remotion/sfx@4.0.518`, versión exacta alineada, sin dependencias/peerDependencies -- a diferencia de `shapes`/`paths`/`motion-blur`, este SÍ instala limpio). Al inspeccionar `dist/index.d.ts` se encontró que el paquete NO trae los audios: cada export es una URL remota a `remotion.media` (ej. `whoosh: "https://remotion.media/whoosh.wav"`) -- Remotion la descarga en tiempo de RENDER, no es un asset local. Se confirmó con `curl` que `remotion.media` está bloqueado en este sandbox (mismo bloqueo que `remotion.dev`/`mcp.remotion.dev`), así que ni siquiera se pudo probar el sonido real acá. Se desinstaló limpio tras confirmar el hallazgo (mismo criterio que `@remotion/motion-blur`: no dejar una dependencia sin poder probarla de verdad).
**COSTO:** $0, MIT confirmado
**COMPATIBILIDAD:** version 4.0.518 exacta instala limpia -- el problema NO es de versión ni de licencia
**RIESGO:** **arquitectónico, no solo de este sandbox**: aunque funcionaría en un runner de GitHub Actions (con internet real), depender de `remotion.media` en cada render agrega una llamada de red externa por cada SFX -- un punto de falla nuevo (¿qué pasa si Remotion cambia/retira esos archivos, o el CDN está lento/caído justo cuando corre el CI?) que la biblioteca propia (`assets/sfx/`, archivos committeados, cero red en render) no tiene. **Conclusión real: la biblioteca propia sigue siendo la mejor opción incluso sin el bloqueo de este sandbox** -- no es solo "no se pudo probar", es "se probó lo suficiente para confirmar que no conviene".

### CAPACIDAD: Buscar documentación oficial de Remotion desde el agente
**HERRAMIENTAS:** `@remotion/mcp` (oficial) · `WebFetch` a remotion.dev (no funciona)
**NUESTRA IMPLEMENTACIÓN:** ninguna — se lee código fuente/README real vía `raw.githubusercontent.com` cuando hace falta
**MEJOR OPCIÓN ACTUAL:** ninguna funciona en ESTE sandbox
**ESTADO:** BLOQUEADO/NO CONFIRMADO -- el único endpoint de `@remotion/mcp` (`mcp.remotion.dev`) está denegado por la misma política de red que bloquea `remotion.dev`
**EVIDENCIA:** código fuente real inspeccionado (`npm pack`), confirmado que el paquete es real y MIT, confirmado con `curl` que su endpoint está bloqueado
**COSTO:** $0
**COMPATIBILIDAD:** N/A en este sandbox; podría funcionar en la computadora del operador o en GitHub Actions
**RIESGO:** ninguno de costo

### CAPACIDAD: Descubrir qué contenido funciona de verdad (YouTube)
**HERRAMIENTAS:** **YouTube Data API v3 (oficial de Google)** · vidIQ (conector ya instalado en la org, desconectado) · Trends MCP (trendsmcp.ai) · video-url-analyzer-mcp (usa Gemini)
**NUESTRA IMPLEMENTACIÓN:** `fabrica/research/youtube_api.ts` (R7-20) -- cliente real, `buscarVideos()`/`estadisticasDeVideos()`, listo para usar en cuanto haya una API key
**MEJOR OPCIÓN ACTUAL:** **YouTube Data API v3** -- es la ÚNICA de las 4 confirmada 100% gratis SIN AMBIGÜEDAD (sin tarjeta, sin plan pago que exista siquiera, 10.000 unidades/día). vidIQ/Trends MCP tienen costo no confirmado; Gemini tiene costo confirmado más allá de un tier limitado.
**ESTADO:** INTEGRADO (código listo) -- BLOQUEADO solo por la API key, que el operador puede sacar gratis en ~10 minutos (ver `PENDIENTES_OPERADOR.md`)
**EVIDENCIA:** confirmado con una llamada real desde este sandbox (`googleapis.com` no está bloqueado, a diferencia de `youtube.com`) -- la API devolvió el error real de Google ("API key not valid"), no un bloqueo de proxy. Costo/condiciones del tier gratis confirmados por búsqueda (múltiples fuentes independientes, 2026). Cliente probado con tests que parsean la forma REAL y documentada de la respuesta de `videos.list`/`search.list` (fixtures fieles al formato oficial, fetch simulado porque no hay key real todavía).
**COSTO:** $0, confirmado sin ambigüedad, sin plan pago que exista
**COMPATIBILIDAD:** confirmada -- Node 22 (`fetch` nativo, sin dependencia nueva)
**RIESGO:** ninguno de costo (no hay forma de que esto genere un cargo). Cubre solo YouTube -- TikTok/Instagram no tienen un equivalente oficial tan simple, siguen bloqueados/sin resolver

### CAPACIDAD: Criterio experto de marketing/ventas (ofertas, precio, copy)
**HERRAMIENTAS:** `coreyhaines31/marketingskills` (50 skills, MIT)
**NUESTRA IMPLEMENTACIÓN:** `fabrica/ventas/` (arquitectura tipada, sin criterio de contenido)
**MEJOR OPCIÓN ACTUAL:** las 10 skills ya instaladas
**ESTADO:** INTEGRADO (R7-19)
**EVIDENCIA:** LICENSE real confirmado MIT, 10 skills copiadas a `.claude/skills/`, invocables ahora
**COSTO:** $0
**COMPATIBILIDAD:** mismo formato que las skills de Remotion ya usadas
**RIESGO:** ninguno de costo -- riesgo real es tratar sus recomendaciones como hechos probados en vez de buena práctica de industria (mismo criterio del Knowledge Engine, ya aplicado)

### CAPACIDAD: Templates/componentes Remotion de terceros
**HERRAMIENTAS:** `ali-abassi/remotion-templates` (1000 plantillas) · `remocn`, `remotion-animated`, `remotion-bits`, `remotion-kit` (comunidad)
**NUESTRA IMPLEMENTACIÓN:** catálogo propio de 28 componentes (`fabrica/componentes/registro.json`)
**MEJOR OPCIÓN ACTUAL:** el catálogo propio -- los de terceros se usan solo como inspiración de diseño
**ESTADO:** PROBAR (solo como referencia, licencia de `remotion-templates` sin confirmar todavía)
**EVIDENCIA:** ninguna de código copiado -- deliberado
**COSTO:** $0
**COMPATIBILIDAD:** N/A (no se integra código)
**RIESGO:** licencia de `remotion-templates` no confirmada -- no copiar nada de ahí hasta resolverlo (`fabrica/research/`, pendiente)

---

## R7-25: segunda pasada de exploración agresiva (2026-09-03)

Pedido explícito del operador ("seguí paso a paso el prompt de
exploración agresiva"). `registry.npmjs.org` devuelve **71 paquetes
oficiales `@remotion/*`** -- más del doble de los 32 evaluados en
R7-18. Nuevas capacidades encontradas:

### CAPACIDAD: Cámara (temblor/movimiento orgánico) -- nunca investigada antes
**HERRAMIENTAS:** `@remotion/noise` (oficial, MIT)
**NUESTRA IMPLEMENTACIÓN:** `remotion-spike/src/escenas/CamaraOrganica.tsx` (NUEVO)
**MEJOR OPCIÓN ACTUAL:** `@remotion/noise` -- funciones puras de ruido tipo Perlin, cero dependencias
**ESTADO:** INTEGRADO (R7-25)
**EVIDENCIA:** wrapper que aplica un `translate`+`rotate` CSS continuo (no aleatorio frame-a-frame, que se vería como video roto) a las unidades con `energia='muy_alta'` que el Director de Edición ya calcula. Conectado a `fabrica-demo-07`, verificado con una resta real entre 2 frames (9.16% de píxeles cambiaron >5 niveles) -- confirma movimiento real, no solo teoría. QA duro sigue 100% limpio.
**COSTO:** $0
**COMPATIBILIDAD:** confirmada, versión exacta `4.0.518`
**RIESGO:** ninguno -- amplitud deliberadamente baja (6px), solo en momentos de máxima energía

### CAPACIDAD: Texto con fondo redondeado estilo TikTok
**HERRAMIENTAS:** `@remotion/rounded-text-box` (oficial, MIT)
**NUESTRA IMPLEMENTACIÓN:** ninguna todavía (nuestros textos no tienen caja de fondo ajustada al contenido)
**MEJOR OPCIÓN ACTUAL:** `@remotion/rounded-text-box` -- genera el `path` SVG exacto ajustado al texto real medido (`@remotion/layout-utils`)
**ESTADO:** PROBAR -- render real confirmado (`pruebas-r7/PruebaRoundedTextBox.tsx`, funciona perfecto), pero no conectado a ningún componente de producción todavía porque requiere tocar componentes de texto existentes (Punch.tsx y similares) para decidir CUÁNDO usar caja de fondo vs texto suelto -- decisión de diseño, no solo técnica, mejor no forzarla sin un caso de uso concreto (sección 7 del prompt: "no hace falta integrar inmediatamente")
**COSTO:** $0
**COMPATIBILIDAD:** confirmada
**RIESGO:** ninguno de costo -- riesgo de diseño si se usa en TODOS los textos (satura visualmente)

### CAPACIDAD: Animación por timeline (secuencias complejas de muchas propiedades)
**HERRAMIENTAS:** `@remotion/gsap` (oficial, MIT) + `gsap` (licencia "no charge" de GreenSock/Webflow desde 2024 -- gratis para este uso, no es OSI-open-source pero sí gratis, no exige compra) · interpolate()/spring() nativos de Remotion (ya usado en todo el proyecto)
**NUESTRA IMPLEMENTACIÓN:** `interpolate()`/`spring()` a mano en cada componente (golpes.tsx, etc.)
**MEJOR OPCIÓN ACTUAL:** seguir con lo nativo para lo que ya tenemos (funciona bien, es más simple) -- GSAP es candidato SOLO si algún día necesitamos coreografiar MUCHOS elementos con timing relativo complejo (stagger, secuencias encadenadas) donde `interpolate()` a mano se vuelve difícil de mantener
**ESTADO:** PROBAR -- confirmado que `useGsapTimeline()` construye un timeline PAUSADO y lo sincroniza al frame de Remotion (determinista, seguro para render, nunca corre en tiempo real) -- render real confirmado (`pruebas-r7/PruebaGsap.tsx`, rotación+escala funcionando). No integrado a producción: no hay hoy un componente real cuya animación sea tan compleja que justifique el cambio.
**COSTO:** $0 (licencia "no charge", confirmado que GSAP quitó TODOS sus plugins de pago en 2024)
**COMPATIBILIDAD:** confirmada
**RIESGO:** ninguno de costo -- agregar una segunda forma de animar (GSAP + nativo) sin necesidad real fragmentaría el código, por eso queda en PROBAR y no en INTEGRAR

### CAPACIDAD: Mapas / visualización geográfica -- nunca investigada antes
**HERRAMIENTAS:** `@remotion/maptiler` (oficial, Remotion License) + `@maptiler/sdk` (servicio externo MapTiler Cloud)
**NUESTRA IMPLEMENTACIÓN:** ninguna
**MEJOR OPCIÓN ACTUAL:** sin decidir -- no hay ningún guion de la fábrica hasta hoy que necesite un mapa real
**ESTADO:** BLOQUEADO/NO CONFIRMADO -- el paquete pide `apiKey: string` de MapTiler Cloud (cuenta externa, plan gratis existe pero sus límites exactos no se confirmaron todavía). No instalado.
**COSTO:** $0 si el plan gratis alcanza (NO CONFIRMADO); requeriría cuenta del operador
**COMPATIBILIDAD:** no evaluada (no instalado)
**RIESGO:** bajo prioridad -- ningún caso de uso real en el nicho actual (venta de productos digitales) pide un mapa

### CAPACIDAD: Animaciones vectoriales de diseñador (Rive/Lottie)
**HERRAMIENTAS:** `@remotion/rive` (oficial, Remotion License, usa `@rive-app/canvas-advanced`) · `@remotion/lottie` (oficial, Remotion License, usa `lottie-web`)
**NUESTRA IMPLEMENTACIÓN:** ninguna
**MEJOR OPCIÓN ACTUAL:** sin decidir -- ambos son motores REALES y gratis para nuestro uso (Remotion License, individuos/empresas chicas), pero ambos necesitan un ARCHIVO de animación (`.riv` o Lottie JSON) hecho por un diseñador o descargado de un banco de assets (ej. LottieFiles.com tiene muchos gratis) -- no tenemos ninguno todavía, y fabricar uno sintético solo para probar el pipeline no demuestra nada útil sobre la CALIDAD real de la técnica
**ESTADO:** PROBAR -- pendiente de un archivo `.riv`/Lottie real y gratis para la primera prueba de render
**COSTO:** $0 (librerías); el archivo de animación puede ser gratis (bancos de assets) o pago (diseñador a medida) -- no confirmado cuál usaríamos
**COMPATIBILIDAD:** no evaluada (no instalado -- requiere el asset primero para que la prueba tenga sentido)
**RIESGO:** ninguno de costo

### CAPACIDAD: Motor gráfico 2D avanzado (shaders, dibujo custom, partículas reales)
**HERRAMIENTAS:** `@remotion/skia` (oficial, MIT, usa `@shopify/react-native-skia`)
**NUESTRA IMPLEMENTACIÓN:** SVG/CSS a mano (`@remotion/shapes`, `@remotion/paths`, CSS)
**MEJOR OPCIÓN ACTUAL:** SVG/CSS actual para todo lo que ya hacemos bien -- Skia es MUCHO más potente (shaders, partículas reales, dibujo por píxel) pero es una dependencia pesada (bindings nativos de React Native, corre via WASM en el navegador) que no se justifica sin un caso de uso concreto que SVG/CSS no puedan resolver
**ESTADO:** PROBAR -- no instalado todavía, candidato real si algún día se necesita un sistema de partículas de verdad (sección 3 del prompt) que `@remotion/noise` (aplicado a CSS) no alcance a resolver
**COSTO:** $0
**COMPATIBILIDAD:** NO CONFIRMADA -- riesgo real de que el WASM de Skia no arranque limpio en el `headless_shell` de este sandbox (no probado)
**RIESGO:** medio -- dependencia pesada, mejor no instalar sin necesidad concreta

### CAPACIDAD: Emojis animados (micro-detalle de personalidad)
**HERRAMIENTAS:** `@remotion/animated-emoji` (oficial, MIT, usa emojis animados de Google Fonts)
**NUESTRA IMPLEMENTACIÓN:** ninguna
**MEJOR OPCIÓN ACTUAL:** sin decidir -- es un detalle menor (P2/P3), no una capacidad estructural
**ESTADO:** PROBAR -- no instalado, candidato de bajo esfuerzo para un remate/reacción puntual (ej. un emoji reaccionando a una cifra grande)
**COSTO:** $0
**COMPATIBILIDAD:** no evaluada -- probablemente necesita descargar el emoji real de Google Fonts en tiempo de render (revisar si el dominio está bloqueado en este sandbox antes de asumir que funciona)
**RIESGO:** bajo

### Hallazgo real: 2 paquetes standalone están DEPRECADOS (no duplicar)
`@remotion/starburst` y `@remotion/light-leaks` **no tienen implementación propia** -- su propio código fuente (confirmado leyendo los `.d.ts` reales tras instalarlos) redirige a usar `@remotion/effects/starburst` y `@remotion/effects/light-leak` en su lugar, paquete que ya tenemos instalado. Se instalaron, se confirmó la redundancia, y se DESINSTALARON -- ningún efecto nuevo real, solo confirma que `@remotion/effects` (66 efectos reales confirmados en `node_modules/@remotion/effects/package.json`, exports reales, no una estimación) sigue siendo la fuente correcta para casi cualquier efecto visual nuevo.

### Hallazgo arquitectónico real: los 66 efectos se dividen en 2 familias, no todos sirven igual como overlay
Probando 3 efectos más con render real (`shine`, `rings`, y releyendo `chromaticAberration`/`glow` de R6-7) se confirmó una distinción real que no estaba documentada:
- **Generativos** (dibujan su PROPIO contenido, no leen los píxeles de abajo): `vignette`, `lightLeak`, `rings` -- confirmados con render real funcionando sobre un `<Solid color="transparent">`, con el contenido real DEBAJO perfectamente visible. Estos sirven como overlay universal en cualquier escena, sin tocar el componente de contenido.
- **Moduladores** (necesitan píxeles reales para transformarlos -- blend, desplazamiento de canales, escaneo): `chromaticAberration`, `glow`, `scanlines`, `tvSignalOff`, `pixelDissolve`, y **`shine`** (probado esta ronda: sobre transparente NO produce ningún cambio visible, confirmado comparando 8 frames con hashes idénticos -- no es un bug de parámetros, es que el efecto necesita brillo real preexistente para "iluminar"). Estos SOLO funcionan aplicados directo a un componente con contenido visible real (Video/Solid/CanvasImage con color/imagen) -- exigiría tocar cada uno de los 28 componentes de `fabrica/componentes/` para exponer un prop `effects` pasante, cambio de arquitectura más grande, no se hace sin necesidad concreta.
- **`rings` INTEGRADO a producción** (`escenas/PulsoRevelacion.tsx`): un pulso expansivo tipo onda de radar en el momento exacto de `intencion='revelar'` (ya calculado por el Director de Edición). Probado en `fabrica-demo-07`, confirmado visualmente, QA duro 100% limpio.
- Candidatos generativos reales sin probar todavía (mismo patrón que rings, deberían funcionar igual): `gridlines`, `dot-grid`, `lines`.

### Otros paquetes descartados sin necesitar decisión del operador
- `@remotion/canvas`: "headless primitives for Remotion authoring interfaces" -- es para construir una UI tipo Remotion Studio, no aplica a un pipeline de generación de video. DESCARTADO.
- `@remotion/timeline-utils`: "internal utilities for rendering Remotion timelines" -- utilidad interna de Remotion Studio, no API pública pensada para consumidores. DESCARTADO.
- `@remotion/media`: API experimental basada en WebCodecs para reemplazar `<Video>`/`<Audio>` -- ya registrado desde R6-2 como "probar" sin urgencia (cambiar el puente de render que ya funciona bien es riesgo innecesario sin necesidad concreta).

---

## Lectura rápida: dónde estamos parados

- **11 capacidades con solución YA integrada y probada con render real** (+2 desde R7-25: cámara orgánica y pulso de revelación).
- **4 capacidades probadas con evidencia real pero sin conectar a producción todavía** (rounded-text-box, GSAP -- sin caso de uso concreto que lo justifique) **o pendientes de un insumo externo** (Rive/Lottie necesitan un archivo de animación real que no tenemos).
- **1 capacidad bloqueada por cuenta externa de pago no confirmado** (mapas/MapTiler) -- sin impacto real, ningún guion actual lo necesita.
- **1 capacidad totalmente bloqueada por red** (documentación oficial vía MCP) -- sin impacto real porque `raw.githubusercontent.com` cubre casi lo mismo.
- **1 capacidad bloqueada por modelo de IA no descargable** (subtítulos reales) -- el único bloqueo que sí duele, candidato a resolver en GitHub Actions.
- **1 capacidad completamente vacía todavía**: saber qué contenido funciona de verdad en las plataformas -- depende 100% de que el operador consiga la clave gratis de YouTube o autorice vidIQ.
- **2 paquetes confirmados redundantes/deprecados** (no duplicar): `@remotion/starburst`, `@remotion/light-leaks`.
- **Hallazgo arquitectónico real**: de los 66 efectos, solo los GENERATIVOS (dibujan su propio contenido: vignette, lightLeak, rings, y candidatos sin probar como gridlines/dot-grid/lines) sirven como overlay universal sin tocar componentes existentes. Los MODULADORES (chromaticAberration, glow, scanlines, shine, etc.) necesitan contenido visible real debajo -- confirmado que `shine` NO produce ningún cambio sobre transparente (8 frames idénticos). Usarlos exigiría exponer un prop `effects` en cada componente de contenido, cambio de arquitectura mayor sin necesidad concreta hoy.
- **~61 de los 66 efectos reales de `@remotion/effects` siguen sin evaluar individualmente** -- catálogo grande, exploración lejos de agotada.
- **Ninguna capacidad depende de un servicio pago activo.**
