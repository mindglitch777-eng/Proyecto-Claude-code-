# Ronda 6 — Expansión radical (Prompt Maestro 2): visual/3D + Knowledge/Hook Engine

Origen: "Prompt Maestro 2", una orden de 38 secciones pidiendo
expandir la fábrica a un "ecosistema/sistema operativo" con motores
nuevos (Knowledge, Hook, Editing, Cinematic Director, Motion Design,
Kinetic Text, Style, Experiment, Research, Creative Director, Quality
Intelligence, Video Intelligence, Learning), más una demanda explícita
del operador en mensajes de seguimiento: máxima calidad visual real
("hasta 3D"), investigación exhaustiva (oficial + GitHub + HuggingFace),
sin gastar tiempo en generar videos de prueba nuevos esta ronda, sin
re-analizar lo ya decidido, presentar OPTION A/B solo para forks reales
de arquitectura, y nunca reclamar "avanzado" sin una capacidad nueva
que lo demuestre.

Este documento es el resumen técnico de punta a punta. El detalle de
investigación con evidencia real de cada integración visual vive en
`remotion-spike/src/pruebas-r6/README.md`; el mapeo completo de las 38
secciones contra el estado real, en `fabrica/docs/AUDITORIA_PROMPT_MAESTRO_2.md`;
las decisiones de diseño tomadas, en `fabrica/decisions/DECISIONES.md`.

## R6-1/R6-2 — Auditoría + investigación

Auditoría honesta de las 38 secciones contra el código real (qué ya
existe con qué nombre, qué es parcial, qué falta de verdad) antes de
construir nada nuevo -- evita reconstruir lo que ya funciona y evita
"NO SE IMPLEMENTA" sin justificar (Cinematic Director y Creative
Director quedaron explícitamente diferidos, con motivo).

Investigación exhaustiva de motion design más allá de la documentación
oficial de Remotion: instalación de los 3 Agent Skills oficiales de
Remotion (`remotion-markup`, `remotion-captions`, `remotion-render`),
más búsqueda en GitHub (librerías comunitarias `remocn`,
`remotion-animated`) y HuggingFace (modelos de generación de video/imagen).
Resultado real y honesto: 4 paquetes oficiales confirmados como
USAR (`@remotion/transitions`, `@remotion/effects`, `@remotion/three`,
`@remotion/rough-notation`); generación de video/imagen local sin GPU
confirmada como **bloqueada por hardware**, no por falta de
investigación (todos los modelos de HuggingFace investigados requieren
GPU real incluso cuantizados, GitHub Actions no ofrece GPU). Ver
`fabrica/skills/INVESTIGACION_HERRAMIENTAS.md`.

## R6-7 a R6-11 — Motion design real (la prioridad más urgente del operador)

Los 4 paquetes se instalaron y probaron AISLADOS antes de tocar
producción (`remotion-spike/src/pruebas-r6/`), con evidencia real (no
solo "no tiró error"): frames exportados a PNG inspeccionados, y en el
caso de audio, `ffmpeg silencedetect` sobre el video renderizado.

- **R6-8**: `@remotion/transitions` integrado de verdad al puente de
  render (`FabricaVideo.tsx`) para los golpes 'fundido'/'desliza'
  (los dos únicos ya conceptualmente continuos del catálogo). Problema
  real resuelto: una superposición acorta el timeline, pero cada
  escena de la fábrica dura exacto lo que dura su audio real --
  `armarComposicion()` (`fabrica/composicion/armar.ts`) ahora reserva
  un margen real (0.6s en vez de 0.25s) SOLO en escenas con audio
  propio antes de un golpe continuo, y corrige la matemática de
  offsets para que `desdeSeg`/`duracionTotalSeg` reflejen la posición
  REAL post-superposición. Probado de punta a punta con 2 audios
  reales: la escena siguiente arranca exacto donde termina el audio
  real de la anterior, sin hueco de silencio anómalo, y el frame en la
  ventana de transición muestra un crossfade real (dos textos
  superpuestos).
- **R6-9**: el golpe 'cortina' (ya conceptualmente "un light leak de
  cámara analógica" imitado en CSS) pasa a usar `lightLeak()` real de
  `@remotion/effects`. Hallazgo técnico real: los efectos de este
  paquete post-procesan los píxeles PROPIOS del elemento etiquetado, no
  el contenido de React debajo -- separa las herramientas en "efecto
  generativo sobre un color sólido" (`glow`/`chromaticAberration`,
  útiles para un flash propio) y "capa decorativa transparente sobre
  contenido real" (`lightLeak`, confirmado que el contenido de abajo se
  ve a través). `vignette()` se probó para un look "cinemático" pero
  resultó mucho más opaco de lo esperado -- no se usó, documentado como
  pendiente de más ajuste, no descartado.
- **R6-10**: `Torre3D`, primer componente REALMENTE 3D del catálogo
  (Three.js real vía `@remotion/three`, geometría/cámara/luz reales,
  toda la animación atada a `useCurrentFrame()`), agregado formalmente
  al registro de componentes (`torre-3d`, categoría `cifra`) y al mapa
  de `FabricaVideo.tsx` -- no una prueba aislada. Iteración real
  documentada: el primer diseño (bloques grandes, poco espaciado) se
  veía como un bloque sólido sin separación; ajustado y confirmado con
  un segundo render que muestra 7 bloques distintos con huecos
  visibles. Probado de punta a punta con audio real a través del
  pipeline completo.
- **R6-11**: Information Emphasis Engine real con
  `@remotion/rough-notation` -- primitiva reusable `<Enfasis>`
  (`fabrica/... ` → `remotion-spike/src/dibujo/enfasis.tsx`) que
  cualquier componente puede usar para dibujar a mano un
  círculo/subrayado/resaltado/tachado sobre su propio texto. Conectada
  como prueba real (prop opcional `enfasis`, default sin cambios) a
  `Contador`: dibuja un círculo real alrededor del número justo cuando
  termina de aterrizar. Cero cambios para cualquier video ya generado
  que no pase el prop nuevo.

Hallazgo más importante de toda la tanda: **WebGL2 funciona en el
`headless_shell` sin GPU dedicada** -- no estaba garantizado y era el
riesgo más grande antes de prometer nada. Pendiente honesto: confirmado
en el sandbox de esta sesión, no todavía en el runner real de GitHub
Actions (usa un Chrome Headless Shell distinto).

## R6-3/R6-4/R6-5 — Knowledge Engine, Hook Engine, anti-repetición evolucionada

- **R6-3**: `fabrica/conocimiento/` indexa TIPADO lo que ya estaba en
  prosa en `research/retencion.md` (Ronda 5) -- nunca inventa una
  afirmación nueva, `NIVELES_CONFIRMADOS` deja que el código (no solo
  un humano) filtre evidencia real de heurística/anecdótico/hipótesis.
- **R6-4**: `fabrica/hooks/` -- 4 patrones de apertura combinables,
  cada uno citando por id su respaldo real contra el Knowledge Engine
  (o marcado explícitamente `sin_evidencia_formal`). Integridad
  referencial verificada con `validarCatalogo()`. Pendiente honesto: es
  un catálogo consultable, el Director de Edición todavía no lo usa
  para elegir hooks automáticamente -- integración de mayor riesgo
  sobre lógica que ya funciona, se deja para una ronda futura.
- **R6-5**: `memoria/patrones.ts` gana un campo opcional `hookId` que
  se suma a la clave de comparación de patrones -- reutiliza TODA la
  lógica ya testeada de "recuperar prioridad si hay `resultadoReal`
  bueno" en vez de duplicarla en un sistema paralelo. 100%
  retrocompatible, confirmado con tests.

## Qué NO se hizo esta ronda (y por qué)

- **Cero videos nuevos generados** -- instrucción explícita del
  operador ("no gastemos mucho tiempo en eso... la idea es
  investigación e implementación"). `fabrica-demo-06` sigue con voz
  real generada pero sin renderizar, pausado a pedido explícito.
- **Cinematic Director / Creative Director** (coordinación central de
  cámara/directores) -- deliberadamente no construidos: serían
  sobreingeniería antes de tener 2-3 casos reales que resolver (mismo
  criterio ya aplicado en Ronda 5).
- **Hook Engine conectado automáticamente al Director de Edición** --
  el catálogo existe y es consultable; conectarlo a la elección
  automática de hooks es un cambio de mayor riesgo sobre una parte del
  sistema que ya funciona, no se arriesgó sin más tiempo de prueba.
- **@remotion/install-whisper-cpp + @remotion/captions** (subtítulos) --
  sigue en PROBAR desde Ronda 5, no se tocó esta ronda (prioridad fue
  el pedido explícito de motion design/3D).

## Tests

14 suites de test en `fabrica/` (todas verdes, incluidos los 3 nuevos
de esta ronda: `conocimiento/test_conocimiento.ts`,
`hooks/test_hooks.ts`, y las extensiones a `memoria/test_patrones.ts`),
`npx tsc --noEmit` limpio en `fabrica/` y en `remotion-spike/`. Ningún
generador de demo anterior (`demo_01`..`demo_06`) cambió de
comportamiento -- confirmado con los tests existentes, no solo
asumido.

## Próximo paso (en orden de impacto/costo)

1. Confirmar `@remotion/effects`/`@remotion/three` en un runner real de
   GitHub Actions (no solo este sandbox) antes de depender de ellos en
   un video de producción.
2. Ajustar los parámetros de `vignette()` hasta lograr un look
   cinemático sutil utilizable, o descartarlo formalmente si no se
   logra en un intento razonable.
3. Conectar el Hook Engine a la elección real de hooks del Director de
   Edición (hoy solo consultable a mano).
4. Cuando el operador decida retomar video, `fabrica-demo-06` ya tiene
   voz real generada y solo falta el render + QA + confirmación.
