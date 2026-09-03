# Investigación de skills/herramientas externas — Ronda 5

Orden maestra sección 16-17: investigar antes de instalar, clasificar
USAR/PROBAR/DESCARTAR, nunca incorporar algo solo "porque parece
bueno". Búsquedas reales hechas el 2026-09-02 (WebSearch/WebFetch, no
inventado — cada afirmación cita su fuente).

Formato por herramienta: nombre / fuente / qué hace / qué problema
resuelve / gratis / licencia / dependencias / funciona en nuestro
entorno / qué reemplazaría o mejoraría / riesgos / recomendación.

---

## 1. `@remotion/transitions` — **USAR** (candidato fuerte para próxima ronda)

- **Fuente:** paquete oficial del monorepo `remotion-dev/remotion`
  ([docs](https://www.remotion.dev/docs/transitions/),
  [npm](https://www.npmjs.com/package/@remotion/transitions)).
- **Qué hace:** expone `<TransitionSeries>`, con
  `<TransitionSeries.Sequence>` (equivalente a `<Series.Sequence>`) y
  `<TransitionSeries.Transition>`/`<TransitionSeries.Overlay>` — una
  transición cruza dos escenas (acorta la duración total porque se
  superponen durante la transición); un overlay (light leaks, flashes)
  se renderiza en el punto de corte sin afectar el timing.
- **Qué problema resuelve:** hoy nuestro sistema de golpes
  (`golpes.tsx`) monta CADA escena por separado con un overlay que
  imita una transición al principio de la escena siguiente — nunca hay
  una superposición real de dos escenas (crossfade de verdad, slide
  real de una escena empujando a la otra). `@remotion/transitions` sí
  hace eso.
- **Gratis:** sí, bajo la licencia de Remotion (ver ítem 2) —
  individual/no-profit sin restricción de ingresos, uso comercial
  permitido. Nuestro caso (operador individual) está cubierto sin
  costo, confirmado leyendo la licencia real.
- **Dependencias:** ninguna nueva más allá de alinear la versión con
  el resto de paquetes `remotion`/`@remotion/*` ya instalados.
- **¿Funciona en nuestro entorno?** **CONFIRMADO con render real**
  (2026-09-02, ver `remotion-spike/src/pruebas-r6/README.md`):
  instalado, probado en una composición aislada con fade/slide/wipe
  encadenados, renderiza 75/75 frames sin error y la duración total
  (2.5s) coincide exacto con la fórmula de superposición documentada.
  Verificado también visualmente (frames exportados a PNG) que el
  blend real ocurre — no es solo que "no tira error".
- **Qué reemplazaría/mejoraría:** el sistema de `Golpe`/`TipoGolpe`
  actual NO se reemplaza (sigue siendo la fuente de la intensidad/SFX
  motivada por el Director de Edición) — `@remotion/transitions` se
  sumaría como una CAPA ADICIONAL para los golpes que hoy son
  puramente visuales de corte duro (`fundido`, `desliza`, `iris`,
  `cortina`), dándoles una superposición real entre escenas en vez de
  un efecto que empieza cuando la escena nueva ya arrancó.
- **Riesgos:** cambia cómo se calculan los offsets de escena en
  `armar.ts` (las escenas se superpondrían, no serían estrictamente
  consecutivas) — es un cambio real a la Composición, no cosmético.
  Por eso no se integró ya esta ronda (evitar cambiar la arquitectura
  de timing sin haberlo probado primero en aislamiento).
- **Recomendación:** **USAR — confirmado, listo para integrar** (tarea
  R6-8: sumarlo al puente de render real para los golpes de corte duro).

## 2. Licencia de Remotion — **CONFIRMADO, sin acción requerida**

- **Fuente:** [LICENSE.md del repo](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
- **Hallazgo real:** gratis para "un individuo", una organización sin
  fines de lucro, o alguien evaluando si Remotion le sirve — SIN
  restricción de ingresos. Se necesita una licencia de empresa paga
  solo para una organización con fines de lucro de **más de 3
  empleados**. El operador (individual, solo) está cubierto sin costo
  para uso comercial, confirmado leyendo el texto legal directamente
  (no una fuente secundaria).
- **Recomendación:** ninguna acción — ya estábamos cumpliendo esto sin
  saberlo con certeza; ahora queda confirmado y documentado.

## 3. `@remotion/install-whisper-cpp` + `@remotion/captions` — **PROBAR (prioridad alta)**

- **Fuente:** paquetes oficiales
  ([install-whisper-cpp](https://www.remotion.dev/docs/install-whisper-cpp/),
  [captions](https://www.remotion.dev/docs/captions/api)), y el motor
  real es [whisper.cpp de ggerganov](https://github.com/ggerganov/whisper.cpp)
  (licencia **MIT**, confirmado por búsqueda).
- **Qué hace:** instala el binario de whisper.cpp (C/C++, sin
  necesitar Python/PyTorch) y un modelo, transcribe un audio real con
  `transcribe()`, y convierte el resultado a `Caption[]` con
  `toCaptions()` — de ahí `createTikTokStyleCaptions()` (paquete
  `@remotion/captions`) arma "páginas" de subtítulos estilo TikTok con
  timing por palabra.
- **Qué problema resuelve:** es EXACTAMENTE el ítem 1 de
  `PENDIENTES.md` (timestamps palabra-por-palabra), pendiente desde
  Ronda 2 — ya habíamos prototipado esto nosotros mismos con
  `faster-whisper` (Python) con resultado positivo pero heurístico.
  Este camino es mejor: (a) es el camino OFICIALMENTE soportado por
  Remotion, pensado para integrarse directo con componentes de
  render; (b) whisper.cpp es más liviano que la cadena Python de
  faster-whisper (sin PyTorch).
- **Gratis:** sí — MIT, corre 100% local/CPU.
- **Dependencias:** compilar whisper.cpp (igual patrón que ya usamos
  para compilar el motor C de Qwen3-TTS en GitHub Actions —
  `make blas` para BLAS, acá sería el build de whisper.cpp) + un
  modelo (~75MB-1.5GB según tamaño, se descarga una vez).
- **¿Funciona en nuestro entorno?** **NO CONFIRMADO — falta probarlo.**
  Whisper.cpp confirmado que NO requiere GPU (corre en CPU en
  cualquier máquina moderna, según la búsqueda), lo cual es
  compatible con GitHub Actions `ubuntu-latest` (mismo patrón que ya
  usamos con éxito para Qwen3-TTS). Falta una corrida real para
  confirmar tiempos/precisión sobre audio real nuestro.
- **Qué reemplazaría/mejoraría:** el prototipo de `faster-whisper`
  (`fabrica/voz/probar_alineacion.py`, ya documentado como
  "precisión parece alcanzar, heurística basada en una sola muestra")
  — este camino, al ser el oficialmente soportado por Remotion, tiene
  mejor integración con `@remotion/captions` para producir subtítulos
  reales (que hoy NO tenemos en ningún video de la fábrica).
- **Riesgos:** ninguno de licencia/costo. El riesgo real es de tiempo
  de build en CI (compilar whisper.cpp + descargar modelo en cada
  run, igual que ya hacemos con Qwen3-TTS).
- **Recomendación:** **PROBAR en la próxima ronda** — es el pendiente
  más antiguo de la fábrica (Ronda 2) y ahora hay un camino
  oficialmente soportado, no solo un prototipo casero.

## 4. `@remotion/media-utils` / `@remotion/media` — **PROBAR (prioridad baja)**

- **Fuente:** [docs oficiales](https://www.remotion.dev/docs/media/).
- **Qué hace:** utilidades para leer info de audio/video y
  visualizarlo (ej. waveforms/espectro).
- **Qué problema resuelve:** hoy calculamos duración de audio con
  `ffprobe` vía `execSync` (funciona bien) — este paquete serviría
  para un futuro componente "reactivo al audio" (ej. una barra que
  responde al volumen real de la voz), que hoy no existe.
- **Gratis:** sí, misma licencia de Remotion.
- **Recomendación:** **PROBAR** solo si en una ronda futura se decide
  construir un componente audio-reactivo — no hay necesidad concreta
  hoy, no instalar preventivamente (sección 26, evitar sobreingeniería).

## 5. `remotion-superpowers` (plugin de Claude Code, DojoCodingLabs) — **DESCARTAR (por ahora)**

- **Fuente:** [repo GitHub](https://github.com/dojocodinglabs/remotion-superpowers),
  se instala como plugin de Claude Code (`/plugin install
  remotion-superpowers`).
- **Qué hace:** "estudio de producción de video completo" con 5
  servidores MCP y 13 comandos: `/create-short`, `/add-captions`,
  `/add-transitions`, `/generate-image`, `/generate-clip`,
  `/transcribe`, `/review-video`, entre otros — voces IA, música,
  stock footage, generación de imagen/video, subtítulos, transiciones,
  "loop de revisión con IA".
- **Qué problema resuelve, en teoría:** varias cosas de esta misma
  orden (subtítulos, transiciones, crítica automática) de una sola vez.
- **Gratis:** el plugin en sí se declara "free & open source" — pero
  **NO CONFIRMADO** que TODO lo que hace sea gratis: "voiceovers, music,
  stock footage, image/video generation" son, en la enorme mayoría de
  herramientas de este tipo, wrappers sobre APIs PAGAS (voces
  sintéticas de terceros, generación de imagen tipo DALL-E/Midjourney,
  bancos de stock con API paga) — el setup wizard del propio plugin
  explícitamente pide "configurar API keys". Esto es una señal fuerte
  de dependencia paga, no confirmada en detalle porque no se instaló
  (sección 17: no depender ciegamente).
- **Licencia:** no verificada en detalle (fuera de alcance sin
  instalarlo).
- **¿Funciona en nuestro entorno?** Probablemente sí a nivel técnico
  (es un plugin de Claude Code), pero el operador trabaja sin cuentas
  de servicios pagos configuradas — instalarlo probablemente deje la
  mayoría de comandos inutilizables o incentive activar servicios
  pagos, exactamente lo que la regla de $0 prohíbe.
- **Qué reemplazaría/mejoraría:** en teoría, varias partes de nuestro
  pipeline (voz, assets, subtítulos, crítica) — pero CADA UNA de esas
  partes ya la resolvemos hoy con alternativas gratuitas propias
  (Qwen3-TTS local, resolver de assets con banco curado propio,
  crítica editorial heurística propia) o con los paquetes oficiales de
  Remotion de los ítems 1 y 3 de arriba, sin necesitar API keys pagas.
- **Riesgos:** dependencia de una superficie grande de funcionalidad
  (13 comandos, 5 MCP servers) mantenida por un tercero, con fuerte
  probabilidad de requerir servicios pagos para la mayoría de sus
  comandos más vistosos (voz/música/imagen). Alto riesgo de romper la
  regla de $0 sin darnos cuenta si algún comando cae a un fallback
  pago.
- **Recomendación:** **DESCARTAR como plugin instalado.** Si en el
  futuro interesa específicamente `/add-captions` o `/add-transitions`,
  mejor reimplementar esa funcionalidad puntual nosotros mismos sobre
  los paquetes oficiales gratuitos (`@remotion/captions`,
  `@remotion/install-whisper-cpp`, `@remotion/transitions` — ítems 1 y
  3 de arriba), que ya cubren el mismo problema sin la superficie de
  riesgo de un plugin de terceros con probables dependencias pagas.

## 6. Bibliotecas de componentes/templates comerciales (RenderComp, Wireflow, etc.) — **DESCARTAR**

- **Fuente:** resultados de búsqueda ("RenderComp ships more than
  1,000 production-ready components", "Wireflow Blog").
- **Qué son:** tiendas de templates/componentes de Remotion, en su
  mayoría de pago o con licencias por-proyecto no verificadas.
- **Recomendación:** **DESCARTAR como dependencia** — no cumplen la
  regla de $0 sin verificación caso por caso, y nuestro propio catálogo
  de 26 componentes (más los que se agreguen) ya cubre necesidades
  reales sin ese riesgo. Sirven como INSPIRACIÓN de principios de
  motion design (lectura de sus descripciones, no de su código) — eso
  sí es gratis y ya se usó conceptualmente en `MEJORAS_RONDA4.md`
  (sección de estilos combinables).

## 7. "Twick" (editor de video timeline-native, MIT) — **DESCARTAR (no evaluado en profundidad)**

- **Fuente:** mencionado en resultados de búsqueda como alternativa
  MIT a Remotion.
- **Qué es:** un framework de edición de video "timeline nativo" en
  vez de "frame compuesto" como Remotion.
- **Recomendación:** **DESCARTAR por ahora** — cambiar de framework de
  render sería una reescritura completa de toda la fábrica (Composición
  + puente de render + 26 componentes), exactamente la
  "sobreingeniería"/"refactorización gigante porque sí" que la orden
  maestra prohíbe explícitamente. No hay ninguna limitación real de
  Remotion hoy que Twick resuelva y que justifique ese costo.

## 8. `@remotion/effects` — **USAR** (motor de ~60 efectos visuales WebGL2)

- **Fuente:** paquete oficial ([docs](https://www.remotion.dev/docs/effects/)).
- **Qué hace:** ~60 efectos reales (blur, glow, vignette,
  chromaticAberration, lightLeak, noise, scanlines, halftone,
  pixelate, wave, starburst, dropShadow, duotone, thermalVision,
  etc.) aplicados vía prop `effects={[...]}` sobre `<Video>`,
  `<Solid>`, `<CanvasImage>` o `<HtmlInCanvas>`; también expone
  `createEffect()` para efectos 2D/WebGL2 100% custom.
- **Qué problema resuelve:** hoy el "impacto visual" de un golpe
  (`golpes.tsx`) es CSS puro (opacidad, transform, filter básico) —
  esto da acceso a efectos de grado cinematográfico reales (glow real,
  aberración cromática, light leak) que hoy no existen en la fábrica,
  conectables directamente a la intensidad/energía que ya calcula el
  Director de Edición (no hay que inventar una nueva escala: la
  energía de la escena ya existe como número).
- **Gratis:** sí, misma licencia de Remotion (ítem 2).
- **Dependencias:** requiere WebGL2. Para renderizar (no solo Studio)
  hace falta `Config.setChromiumOpenGlRenderer("angle")` en
  `remotion.config.ts` — **riesgo real a confirmar**: no sabemos si el
  `headless_shell` que usamos hoy soporta ANGLE/WebGL2 sin flags
  adicionales. Es la primera pregunta a responder en la prueba aislada.
- **¿Funciona en nuestro entorno?** **CONFIRMADO con render real**
  (2026-09-02, ver `remotion-spike/src/pruebas-r6/README.md`): era la
  pregunta de mayor riesgo de toda la tanda (WebGL2 sin GPU dedicada en
  headless) y quedó resuelta con evidencia, no supuesto — renderizó
  60/60 frames (más lento que un render CSS normal, señal real de que
  WebGL2 se activó) y el frame exportado a PNG muestra una viñeta
  (`vignette`) visiblemente aplicada, sin pantalla negra. Corrió con el
  `Config.setChromiumOpenGlRenderer('angle')` que ya estaba puesto en
  `remotion.config.ts` desde antes, sin cambios adicionales. Pendiente
  honesto: confirmado en el sandbox de esta sesión (Chromium de
  Playwright), no todavía en un runner real de GitHub Actions (usa un
  Chrome Headless Shell distinto, descargado por `remotion browser
  ensure`) — a confirmar ahí antes de dar el riesgo por cerrado del
  todo.
- **Qué reemplazaría/mejoraría:** los efectos de impacto CSS actuales
  no se descartan (siguen funcionando sin WebGL como base) —
  `@remotion/effects` se sumaría como capa opcional de mayor calidad
  para golpes de alta energía (`fogonazo`, `sacudon`) donde el efecto
  CSS se queda corto.
- **Riesgos:** ninguno de software confirmado (WebGL2 sí funciona) —
  el riesgo que queda es de tiempo de render (más lento que CSS/Canvas
  2D) y de confirmar el mismo comportamiento en el runner real de
  GitHub Actions, no de si la tecnología funciona en absoluto.
- **Recomendación:** **USAR — confirmado, listo para integrar** (tarea
  R6-9: capa de efectos conectada a la energía del Director de
  Edición).

## 9. `@remotion/three` — **USAR** (3D real, primer momento verdaderamente 3D de la fábrica)

- **Fuente:** paquete oficial ([docs](https://www.remotion.dev/docs/three/)),
  integración con React Three Fiber.
- **Qué hace:** permite escenas 3D reales (geometría, cámaras, luces)
  dentro de un `<ThreeCanvas width height>`, con animación determinista
  atada a `useCurrentFrame()` (NUNCA `useFrame()` de
  `@react-three/fiber`, que rompe la determinística del render — esto
  quedó explícito en la doc oficial y hay que respetarlo al pie de la
  letra). Requiere `<Sequence layout="none">` dentro del `ThreeCanvas`.
- **Qué problema resuelve:** es la respuesta directa al pedido
  explícito del operador de motion design "hasta 3D" — hoy CERO
  componentes de la fábrica usan profundidad/cámara/geometría 3D real,
  todo es 2D (CSS transforms, como mucho `perspective` falso).
- **Gratis:** sí, misma licencia de Remotion + Three.js (MIT) +
  React Three Fiber (MIT) — sin dependencias pagas.
- **Dependencias:** `three`, `@react-three/fiber`, `@remotion/three`.
  Renderiza sobre WebGL igual que `@remotion/effects` (ítem 8) — mismo
  riesgo de soporte headless a confirmar en la prueba aislada.
- **¿Funciona en nuestro entorno?** **CONFIRMADO con render real**
  (2026-09-02, ver `remotion-spike/src/pruebas-r6/README.md`): 60/60
  frames renderizados, frame exportado a PNG muestra un cubo 3D real
  en perspectiva con sombreado direccional de `meshStandardMaterial`
  reaccionando a una `pointLight` (no un placeholder plano) — confirma
  geometría, cámara y luz reales funcionando en el mismo entorno
  headless que ya usamos, sin GPU dedicada. Mismo pendiente honesto que
  el ítem 8: confirmado en este sandbox, falta confirmar en el runner
  real de GitHub Actions.
- **Qué reemplazaría/mejoraría:** nada existente se reemplaza (no hay
  nada 3D hoy) — sería un componente nuevo en el registro, usado con
  criterio (no forzar 3D donde un golpe 2D ya comunica bien, sección
  26 de la orden maestra: no sobreingeniería).
- **Riesgos:** el de WebGL2 headless quedó resuelto (ítem 8) — queda el
  riesgo real de performance a escala (una escena 3D más compleja que
  un cubo puede ser bastante más cara de renderizar; a medir cuando se
  diseñe el primer componente 3D de producción real, R6-10).
- **Recomendación:** **USAR — confirmado, listo para integrar** (tarea
  R6-10: primer componente 3D real en el registro, con criterio —
  no forzar 3D donde un golpe 2D ya comunica bien, sección 26 de la
  orden maestra).

## 10. `@remotion/rough-notation` — **USAR** (anotaciones de texto dibujadas a mano)

- **Fuente:** paquete oficial ([docs](https://www.remotion.dev/docs/text-highlights)),
  wrapper de la librería `rough-notation` (MIT).
- **Qué hace:** `<Highlight>`, `<Circle>`, `<Underline>`,
  `<StrikeThrough>`, `<CrossedOff>`, `<Box>`, `<Bracket>` — anotaciones
  de texto tipo "dibujado a mano" (marcador, círculo, subrayado),
  animadas con `progress` derivado de `interpolate(frame, ...)`, cada
  componente decide si la anotación va detrás o encima del texto.
- **Qué problema resuelve:** es el candidato directo para el
  "Information Emphasis Engine" pedido en Prompt Maestro 2 — hoy el
  énfasis de texto en la fábrica es solo tamaño/color/negrita CSS; esto
  da un lenguaje visual distinto (marcador real sobre una cifra clave,
  círculo real sobre un dato) sin depender de ninguna API externa.
- **Gratis:** sí, MIT + licencia de Remotion.
- **Dependencias:** ninguna nueva de peso, es una librería de dibujo
  SVG/canvas puro, sin WebGL — de las 4 herramientas de esta tanda, es
  la de MENOR riesgo técnico (no depende de GPU/WebGL2).
- **¿Funciona en nuestro entorno?** **CONFIRMADO con render real**
  (2026-09-02, ver `remotion-spike/src/pruebas-r6/README.md`): 90/90
  frames, sin complicaciones — como se esperaba, fue la prueba de
  menor riesgo y menor tiempo de render de las 4.
- **Qué reemplazaría/mejoraría:** los énfasis CSS actuales no
  desaparecen — esto se suma para momentos específicos donde vale la
  pena el efecto "a mano" (una cifra clave, una palabra que se quiere
  remarcar como si alguien la subrayara en vivo).
- **Riesgos:** ninguno técnico relevante identificado ni encontrado en
  la prueba real.
- **Recomendación:** **USAR — confirmado, listo para integrar** (tarea
  R6-11: Information Emphasis Engine).

## 11. `@remotion/sfx` — **USAR** (banco de efectos de sonido gratis, sin licencia por verificar)

- **Fuente:** paquete oficial, sonidos alojados en `remotion.media`.
- **Qué hace:** ~30 efectos de sonido reales (whoosh, whip, ding,
  vine-boom, record-scratch, etc.) vía `<Audio src="https://remotion.media/NOMBRE.wav">`
  del paquete `@remotion/sfx`.
- **Qué problema resuelve:** hoy los golpes de la fábrica no tienen
  SFX propio real más allá de lo que decida el Director de Audio con
  los recursos existentes — esto da una librería lista, sin fricción
  de licencia (parte del propio proyecto Remotion), para asociar un
  sonido real a un golpe de alta energía.
- **Gratis:** sí — alojado por el propio proyecto Remotion.
- **Dependencias:** requiere red en tiempo de render (fetch a
  `remotion.media`) — a diferencia de nuestro flujo actual, que usa
  audio local generado/curado. Si el runner de GitHub Actions no tiene
  salida a internet en el paso de render, esto falla — **a confirmar**.
- **¿Funciona en nuestro entorno?** Probablemente sí (los runners de
  GitHub Actions sí tienen salida a internet, ya lo usamos para bajar
  dependencias) — de todos modos, más prudente descargar los WAV una
  vez a `public/` en vez de depender de una URL externa en cada render
  (evita un punto de falla de red en cada video generado).
- **Qué reemplazaría/mejoraría:** nada se reemplaza — es un banco de
  sonido adicional para el Director de Audio.
- **Recomendación:** **PROBAR con prioridad baja/media** — no es de
  las 4 herramientas de la tanda de instalación aislada (transitions/
  effects/three/rough-notation), pero queda anotado para la próxima
  vez que se toque el Director de Audio.

## 12. Generación de video/imagen con modelos de HuggingFace (Pyramid Flow SD3, Wan2.2-TI2V-5B, Mochi 1, SVD) — **DESCARTAR, bloqueado por hardware**

- **Fuente:** búsqueda directa en HuggingFace + repos de cada modelo.
- **Qué se investigó:** si algún modelo de texto-a-video o
  imagen-a-video corría gratis, sin GPU, en un runner de GitHub
  Actions (CPU-only) — la pregunta explícita que motivó esta
  investigación tras el pedido de "máximo nivel visual" del operador.
- **Hallazgo real:** los 4 modelos investigados (Pyramid Flow SD3,
  Wan2.2-TI2V-5B, Mochi 1, Stable Video Diffusion) requieren GPU real
  incluso con cuantización agresiva (mínimo ~10GB de VRAM en GGUF
  cuantizado) — ninguno corre en CPU en un tiempo razonable, y los
  runners gratuitos de GitHub Actions son 100% CPU-only, sin GPU.
- **Gratis:** los modelos en sí son gratis/open-weight, pero el
  hardware necesario para correrlos no lo es en nuestro entorno actual.
- **¿Funciona en nuestro entorno?** **NO — confirmado, no es falta de
  investigación.** Esto es explícitamente lo que el operador pidió
  documentar cuando algo se bloquea: no es que no busquemos lo
  suficiente, es un límite real de hardware.
- **Qué reemplazaría/mejoraría:** en teoría, generación de clips de
  video/imagen originales en vez de depender de un banco de assets
  curado — sigue siendo el enfoque actual (banco de assets propio +
  componentes generativos en Canvas/CSS/SVG), que no requiere GPU.
- **Recomendación:** **DESCARTAR mientras no haya acceso a GPU.** Si
  en el futuro el operador consigue acceso a GPU (propia o de un
  servicio, pago o con cuota gratis tipo Colab), esto se retoma — no
  se cierra la puerta, solo se documenta como bloqueado por hardware,
  no por decisión de diseño.

## 13. Librerías comunitarias de componentes Remotion (`remocn`, `remotion-animated`, `remotion-bits`, `remotion-kit`, `remotion-templates`) — **PROBAR solo como inspiración, no como dependencia**

- **Fuente:** búsqueda en GitHub —
  [`remocn/remocn`](https://github.com/remocn/remocn) ("Onda", 110+
  componentes copy-paste, 18 transiciones, MIT),
  [`stefanwittwer/remotion-animated`](https://github.com/stefanwittwer/remotion-animated)
  (`<Animated/>`, primitiva declarativa de animación, MIT), más
  `av/remotion-bits`, `seblavoie/remotion-kit`,
  `reactvideoeditor/remotion-templates` (encontrados, no auditados en
  profundidad).
- **Qué hacen:** catálogos de componentes/animaciones Remotion
  reusables, en su mayoría de estilo "copy-paste" (como shadcn/ui) en
  vez de paquete npm instalable — se copia el código fuente, no se
  agrega como dependencia.
- **Qué problema resuelve, en teoría:** ahorrar tiempo de diseño de
  motion (curvas de animación, composición de efectos) ya resuelto por
  otros.
- **Gratis:** sí, todo MIT.
- **¿Funciona en nuestro entorno?** Sí técnicamente (es código React/
  Remotion plano), pero **no se instala como dependencia** — el estilo
  "copy-paste" significa que adoptarlo implica traer código de un
  tercero a mantener como propio, sin el control de calidad/pruebas
  que tiene nuestro propio catálogo de 26+ componentes.
- **Riesgos:** código de terceros sin el mismo nivel de prueba/control
  que nuestros propios componentes; mezclar estilos de motion no
  curados puede romper la coherencia visual entre golpes que ya logramos.
- **Recomendación:** **PROBAR únicamente como referencia de diseño**
  (leer su código para inspirarse en curvas/timings de animación), NO
  copiar componentes completos a la fábrica salvo que se audite y
  adapte cada uno individualmente al estilo/convenciones propias.

## 14. Remotion Agent Skills disponibles en ESTE entorno (`remotion-markup`, `remotion-render`, `remotion-captions`) — **USAR (ya confirmadas, gratis, sin instalar nada)**

- **Fuente:** `.claude/skills/remotion-markup/` y
  `.claude/skills/remotion-render/` (ya presentes en este entorno,
  invocadas de verdad en Ronda 7 vía la herramienta Skill, 2026-09-03)
  -- documentación oficial de Remotion empaquetada como Agent Skill,
  no un repositorio de terceros.
- **Qué hacen:** `remotion-markup` da buenas prácticas de animación
  (`useCurrentFrame()`+`interpolate()`, `Easing.bezier()`/`spring()`,
  componentes `<Interactive.Div>`/`<CanvasImage>`/`<AnimatedImage>`,
  `@remotion/media` para `<Video>`/`<Audio>` con `trimBefore`,
  transiciones, 3D, mapas, SFX, visualización de audio, medición de
  texto/DOM, `calculateMetadata` para props dinámicas).
  `remotion-render` documenta las opciones reales de
  `npx remotion render`/`still` y video transparente.
  `remotion-captions` (no invocada esta ronda, ya cubierta por R7-16)
  documenta el mismo flujo de whisper.cpp + `@remotion/captions` que
  ya se probó de verdad.
- **Confirmado real, no asumido:** se verificó que `Interactive`,
  `CanvasImage` y `AnimatedImage` -- símbolos que la skill usa en sus
  ejemplos -- EXISTEN de verdad en la versión instalada
  (`remotion@4.0.518`, confirmado con
  `node -e "require('remotion')"`), a pesar de que la skill describe
  una API que podría parecer más nueva que la versión fijada en el
  proyecto.
- **Gratis:** sí, viene con el entorno, no agrega ninguna dependencia
  nueva por sí sola (la guía referencia paquetes `@remotion/*`
  opcionales, cada uno evaluado individualmente si hace falta).
- **Qué aprovechar:** la guía de "Text highlights" (ya usada en R6-11,
  `@remotion/rough-notation`), "Transitions" (ya usada en R6-8), la
  técnica de detección de silencios con FFmpeg (relevante para
  `fabrica/qa/`), y `calculateMetadata` como alternativa más prolija
  a hardcodear `durationInFrames` en cada `Composition` de `Root.tsx`.
- **Qué NO se adoptó todavía:** migrar `<Audio>`/`<Video>` del puente
  de render (`FabricaVideo.tsx`) al paquete `@remotion/media` que la
  skill recomienda -- cambio de mayor riesgo sobre un puente de render
  que ya funciona bien con los componentes base de `remotion`; se dejó
  como PROBAR, no se ejecuta sin necesidad concreta.
- **Riesgos:** ninguno de costo/licencia (es documentación oficial).
  El único riesgo real es de tiempo: la guía cubre mucho más de lo que
  la fábrica usa hoy (mapas, Lottie, GIFs, visualización de audio) --
  no vale la pena adoptar nada de eso sin un caso de uso real primero
  (mismo principio de "no sobreingeniería" de siempre).
- **Recomendación:** **USAR** como referencia constante al tocar
  `remotion-spike/` -- ya está disponible, cuesta $0, y evita
  reinventar patrones que Remotion ya documentó oficialmente.

## 15. Ecosistema oficial completo de Remotion (32 paquetes @remotion/*) + @remotion/shapes/paths integrados de verdad — R7-18

- **Fuente:** `registry.npmjs.org` (búsqueda directa + `npm view` +
  `npm pack` para inspeccionar código fuente), 2026-09-03 -- respuesta
  al pedido explícito del operador de "no considerar que ya tenemos
  Remotion como razón para cortar la investigación".
- **Hallazgo real:** hasta esta ronda solo se habían evaluado 13 de
  los 32 paquetes oficiales `@remotion/*` que existen. Se catalogaron
  los 32 (lista completa en `fabrica/skills/registro.ts`, id
  `ecosistema-remotion-oficial-completo`).
- **Probado de verdad (no solo leído):** se instalaron
  `@remotion/shapes` + `@remotion/paths` (MIT) y se construyó
  `GraficoTorta.tsx` (`remotion-spike/src/escenas/`) -- primer gráfico
  de TORTA/DONUT real de la fábrica (Grafico.tsx solo cubre barras).
  **Bug real encontrado y corregido probando**: el path que devuelve
  `makePie()` está centrado en `(radio, radio)`, no en `(0,0)` -- el
  primer intento con un `viewBox` centrado en el origen dejaba el
  gráfico fuera de cuadro. Corregido y confirmado con un segundo
  render real (evidencia en `fabrica/salidas/grafico_torta_001/`).
  Registrado en `fabrica/componentes/registro.json` (id
  `grafico_torta`), pasa `validar_registro.ts`.
- **`@remotion/mcp` (oficial, MIT) inspeccionado leyendo su código
  fuente real:** un servidor MCP mínimo (un solo tool,
  "remotion-documentation") que busca en la documentación oficial vía
  `mcp.remotion.dev` -- confirmado real, pero ese dominio está
  bloqueado por la política de red de este sandbox (mismo bloqueo que
  `www.remotion.dev`). Útil en otro entorno, inútil acá.
- **Licencias aclaradas:** `light-leaks`, `starburst`, `maptiler`,
  `lottie`, `rive`, `gif`, `google-fonts` usan la "Remotion License"
  (gratis para individuos/empresas ≤3 empleados, ya confirmado que
  cubre a este proyecto) -- no tienen un LICENSE.md propio distinto,
  heredan el de la raíz del monorepo (confirmado leyendo
  `packages/<nombre>/` del repo real vía `git clone --sparse`).
  `shapes`, `paths`, `motion-blur`, `noise`, `animation-utils`,
  `fonts`, `elevenlabs`, `gsap`, `skia`, `rounded-text-box` son MIT
  explícito.
- **Hallazgo real de compatibilidad (probando, no leyendo):**
  `@remotion/motion-blur@4.0.520` se instaló para probarlo y se
  encontró que declara una dependencia DURA (no peer) a
  `remotion@4.0.520`, mientras todo el proyecto fija `4.0.518` --
  trae una copia anidada de Remotion en otra versión. `shapes`/`paths`
  tienen la misma dependencia dura pero SÍ se probaron con render real
  sin problema (son generadores de SVG puros, no tocan el motor
  temporal); `motion-blur` sí lo toca (compara frames para calcular el
  desenfoque), mayor riesgo de romper algo silenciosamente. Se
  desinstaló en vez de dejarlo a medio probar -- queda como PROBAR
  recién cuando se homologue todo el proyecto a una sola versión de
  Remotion.
- **Candidatos para la próxima ronda (PROBAR, no instalados
  todavía):** `@remotion/lottie` (ecosistema enorme de animaciones
  gratis), `@remotion/gsap` (integración con GSAP).
- **Descartados con motivo concreto:** `@remotion/lambda`/`cloudrun`/
  `vercel` (render serverless -- cuestan infraestructura en la nube,
  contradice $0 y "sin infraestructura propia"). `@remotion/maptiler`
  (requiere API key de un servicio externo con plan pago más allá de
  un free tier).
- **Recomendación:** **USAR** `@remotion/shapes`/`paths` (ya
  integrado). **PROBAR** `motion-blur`/`lottie`/`gsap` en una próxima
  ronda con un caso de uso real concreto (no instalar preventivamente
  sin necesidad, mismo principio de siempre).

## 16. Búsqueda amplia real (marketing skills + MCP de contenido + chuk-motion) — R7-19

- **Contexto:** el operador señaló, correctamente, que la investigación
  venía siendo demasiado literal -- se evaluaron 3 skills de Remotion
  y se paró ahí, sin ir a buscar el universo mucho más amplio de
  skills/MCP/comunidades que existen (el pedido explícito mencionaba
  cientos investigados por el operador con otra IA). Se corrigió el
  comportamiento: en vez de reportar "bloqueado" ante el primer
  `WebFetch` fallido, se usó `WebSearch` (sin restricción) + lectura
  directa de código fuente real vía `raw.githubusercontent.com` para
  ir mucho más profundo.
- **`coreyhaines31/marketingskills`** (MIT, confirmado leyendo el
  LICENSE real) -- 50 Agent Skills de marketing en el mismo formato
  que ya usa este entorno (`remotion-markup`/etc). Se instalaron 10
  directamente relevantes al objetivo de Fase 1 (CLAUDE.md: vender un
  producto digital en Hotmart): `product-marketing`, `offers`,
  `pricing`, `copywriting`, `cro`, `lead-magnets`, `launch`,
  `marketing-psychology`, `customer-research`, `marketing-plan`.
  Copiadas a `.claude/skills/` (mismo lugar que las skills de
  Remotion), invocables con la herramienta Skill. Esto es la primera
  vez que la fábrica tiene criterio experto real del lado de VENTAS
  (hasta ahora `fabrica/ventas/` tenía la arquitectura pero cero guía
  de cómo escribir una oferta/precio/lead-magnet reales).
- **`chuk-motion` (chrishayuk/chuk-mcp-remotion)** (Apache-2.0,
  confirmado) -- servidor MCP en Python que genera código Remotion con
  su propio sistema de diseño (51 componentes: 6 tipos de gráfico,
  17 layouts multi-plataforma con márgenes seguros ya calculados para
  TikTok/Instagram/LinkedIn). No tiene ninguna dependencia de API
  paga (confirmado leyendo `pyproject.toml` completo). Es una
  arquitectura PARALELA completa -- se clasifica PROBAR (referencia de
  diseño, ej. sus layouts multi-cámara/HUD/mosaico), NO se adopta como
  reemplazo del Director Visual (mismo criterio que descartó "Twick"
  en Ronda 6: reescribir la fábrica entera sin una limitación real que
  lo justifique).
- **`tiktok-trends-mcp` / trendsmcp.ai** -- confirmado con el README
  real (no solo un resumen de búsqueda): MIT, tier gratis declarado de
  100 req/mes, botón de instalación directa a Claude. Sigue pendiente
  de que el operador lo conecte (implica cuenta en un tercero).
- **`viral-app-mcp`** -- DEPRECADO (el propio README lo dice
  explícitamente), descartado.
- **`video-url-analyzer-mcp`** -- real, MIT el código, pero usa la API
  de Google Gemini (paga más allá de un tier gratis limitado) --
  requiere autorización del operador antes de activar, registrado en
  `PENDIENTES_OPERADOR.md`.
- **Lección para sesiones futuras:** antes de declarar algo
  "bloqueado" o "no investigado en profundidad", agotar `WebSearch` +
  `raw.githubusercontent.com`/`git clone --sparse` + `registry.npmjs.org`
  -- ver la decisión formal en `fabrica/decisions/DECISIONES.md`
  ("Estrategia de investigación mejorada tras bloqueos de red").

---

## Resumen de recomendaciones

| Herramienta | Clasificación | Prioridad |
|---|---|---|
| `@remotion/transitions` | **USAR — confirmado con render real (2026-09-02)** | Alta, integrar (R6-8) |
| Licencia Remotion | Confirmado, sin acción | — |
| `@remotion/install-whisper-cpp` + `@remotion/captions` | PROBAR | Alta (resuelve pendiente más antiguo) |
| `@remotion/media-utils` | PROBAR | Baja (sin necesidad concreta hoy) |
| `remotion-superpowers` (plugin) | DESCARTAR | — |
| Templates comerciales (RenderComp, etc.) | DESCARTAR como dependencia | — |
| Twick | DESCARTAR | — |
| `@remotion/effects` | **USAR — confirmado con render real, WebGL2 funciona headless (2026-09-02)** | Alta, integrar (R6-9) |
| `@remotion/three` | **USAR — confirmado con render real, 3D funciona headless (2026-09-02)** | Alta, integrar (R6-10) |
| `@remotion/rough-notation` | **USAR — confirmado con render real (2026-09-02)** | Alta, integrar (R6-11) |
| `@remotion/sfx` | PROBAR | Media (próxima vez que se toque Director de Audio) |
| Modelos de video/imagen de HuggingFace | DESCARTAR — bloqueado por hardware (no hay GPU) | — |
| Librerías comunitarias (`remocn`, `remotion-animated`, etc.) | PROBAR solo como inspiración de diseño | Baja |
| Remotion Agent Skills del entorno (`remotion-markup`/`render`/`captions`) | **USAR — confirmadas reales, gratis (2026-09-03)** | Alta, referencia constante |
| `@remotion/shapes` + `@remotion/paths` | **USAR — integrado y probado con render real, bug encontrado y corregido (2026-09-03)** | Alta, gráfico de torta ya en el registro de componentes |
| `@remotion/mcp` (oficial) | PROBAR -- real pero bloqueado en este sandbox | Baja acá, útil en otro entorno |
| Resto del ecosistema oficial @remotion/* (32 paquetes catalogados) | PROBAR selectivamente (lottie/gsap primero) | Media |
| `coreyhaines31/marketingskills` (10 de 50 instaladas) | **USAR — instaladas, MIT confirmado (2026-09-03)** | Alta, primer criterio experto de ventas de la fábrica |
| `chuk-motion` (MCP de Remotion, Apache-2.0) | PROBAR como referencia de diseño, NO como reemplazo | Baja -- arquitectura paralela |
| `tiktok-trends-mcp` (trendsmcp.ai) | PROBAR -- MIT, tier gratis declarado, pendiente que el operador lo conecte | Media |
| `viral-app-mcp` | DESCARTAR -- deprecado por su propio autor | — |
| `video-url-analyzer-mcp` | Pendiente autorización del operador (usa Gemini, no 100% gratis) | — |

**Evidencia real de las 4 confirmaciones de arriba:**
`remotion-spike/src/pruebas-r6/README.md` — 4 composiciones aisladas
instaladas, renderizadas con el mismo `headless_shell` que usa la
fábrica, y verificadas visualmente frame por frame (no solo "no tiró
error"). El hallazgo más importante: WebGL2 (necesario para efectos y
3D) SÍ funciona en este entorno headless sin GPU dedicada, algo que no
estaba garantizado y era el riesgo más grande de investigar antes de
prometer nada al operador.

Ninguna de estas integraciones se implementó todavía en el código de
la fábrica esta ronda — son candidatos evaluados y priorizados, no
cambios de arquitectura ya hechos (sección 17: "la arquitectura debe
poder sobrevivir sin una dependencia externa crítica"; sección 24: un
cambio que afecta arquitectura se documenta y se espera). Quedan como
el primer punto de "PRÓXIMO PASO" en `ESTADO_ACTUAL.md`.

La siguiente acción concreta (tarea R6-7) es instalar
`@remotion/transitions`, `@remotion/effects`, `@remotion/three` y
`@remotion/rough-notation` en `remotion-spike/` y probar cada uno en
una composición aislada — sobre todo para responder, con una prueba
real y no una suposición, si WebGL2 funciona en el `headless_shell`
que ya usamos para renderizar (riesgo real de los ítems 8 y 9).
