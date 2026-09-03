# Arquitectura de la fábrica — memoria viva

Orden maestra Ronda 5, sección 21: si una sesión termina y otra
continúa en una semana, debe poder entender qué somos, qué está hecho,
qué falta, qué probamos, qué funcionó, qué no, qué no sabemos, qué no
debemos volver a hacer — sin depender del chat. Este documento es el
punto de entrada; cada afirmación enlaza al archivo con el detalle
real.

## QUÉ SOMOS

Un laboratorio audiovisual que investiga, diseña, produce, critica,
experimenta, mide y aprende — NO un generador de videos que solo
combina componentes. Ver la pregunta guía de cada ronda: `¿esto hace
que el video comunique mejor / retenga más / se sienta más
profesional? Si no, no se agrega.`

## QUÉ ESTÁ HECHO (pipeline real, de punta a punta)

```
Guion (a mano, conversando con Claude -- ideación automática bloqueada
por la regla de $0, ver PENDIENTES.md ítem 5)
  ↓
Voz real (Qwen3-TTS, motor C, voz clonada de librivox-11) --
fabrica/voz/
  ↓
Director Visual (fabrica/directores/visual.ts) -- elige componente por
metadata (categoría/intensidad/duración/assets), nunca por id
hardcodeado
  ↓
Director de Audio (fabrica/directores/audio.ts) -- elige golpe de
transición con variedad real + anti-repetición
  ↓
Director de Edición (fabrica/directores/edicion/, Ronda 4) --
intención/energía/estilos combinables/microeventos/transición
motivada
  ↓
Director de Retención 2.0 (fabrica/directores/retencion/, Ronda 5) --
mapa narrativo del video completo + alertas de arco
  ↓
Knowledge Engine + Viral/Retention Engine (fabrica/conocimiento/,
fabrica/hooks/, Ronda 6, ampliado Ronda 7 a 27 categorías / 18
patrones / 14 categorías de patrón) -- catálogo de conocimiento y de
patrones de retención con evidencia real citada por id, ya conectado
al Director de Retención (campo opcional `patronesRetencion`, Ronda
7); todavía NO conectado a la elección automática del Director de
Edición
  ↓
Composición (fabrica/composicion/armar.ts) -- offsets exactos en
segundos, audio real como fuente de verdad del timing; desde Ronda 6
también reserva margen real para una transición con superposición
(@remotion/transitions) cuando el golpe siguiente es 'fundido'/'desliza'
  ↓
Render (Remotion, remotion-spike/src/fabrica_bridge/FabricaVideo.tsx)
-- TransitionSeries real para golpes continuos, lightLeak() real para
'cortina', primer componente 3D real (Torre3D, @remotion/three),
Information Emphasis Engine real (dibujo/enfasis.tsx,
@remotion/rough-notation) conectado opcionalmente a Contador (Ronda 6)
  ↓
QA duro (fabrica/qa/checks_duros.py) -- hechos objetivos del mp4
  ↓
Crítico Audiovisual (fabrica/qa/critico_audiovisual.py, Ronda 5) --
unifica QA duro + crítica editorial + retención en formato
Problema/Evidencia/Severidad/Tipo/Propuesta
  ↓
Ciclo de mejora controlado (fabrica/laboratorio/ciclo_mejora.ts) --
máx. 2 iteraciones, solo corrige lo que puede corregir con seguridad
  ↓
Memoria (fabrica/memoria/) -- anti-repetición por componente Y por
patrón, laboratorio de hipótesis/experimentos A-B, nunca mezcla
heurística con resultado real
```

En paralelo al pipeline de video, Ronda 7 agregó un segundo pipeline
de negocio (arquitectura tipada, datos reales vacíos a propósito --
ver `MEJORAS_RONDA7.md`):

```
Research System (fabrica/research/) + Skill Intelligence
(fabrica/skills/) -- qué investigar/qué herramienta usar, con decisión
explícita
  ↓
Sales Engine (fabrica/ventas/) -- Audiencia→Problema→Oportunidad→
Producto→Oferta→LeadMagnet→Lead→Nutrición→Conversión→Entrega→Feedback→
Retención
  ↓
Product Ecosystem (fabrica/ecosistema_producto/) -- una pieza de
conocimiento -> múltiples formatos de salida, sin duplicar contenido
  ↓
Carousel Engine (fabrica/carrusel/, remotion-spike/src/carrusel/) --
segundo formato de salida real (no solo video), reusa Knowledge Engine
y Viral/Retention Engine
  ↓
Data Engine (fabrica/datos/) -- métricas de video y de producto, listo
para carga manual cuando haya datos reales
  ↓
Decision Engine (fabrica/decision_engine/) -- plantilla Opción A/B/C
para decisiones de arquitectura/prioridad, nunca "la más fácil" sin
más
```

Videos de prueba reales generados hasta ahora: `fabrica-demo-01` a
`fabrica-demo-06` (`fabrica/salidas/` / `capturas_voz/audio_demo_06/`
-- demo_06 tiene voz real generada pero el render final quedó pausado
a pedido explícito del operador, ver `PENDIENTES.md`), cada ronda con
su detalle documentado (`MEJORAS_RONDA3.md`, `MEJORAS_RONDA4.md`, este
documento para la Ronda 5, `MEJORAS_RONDA6.md` para la Ronda 6,
`MEJORAS_RONDA7.md` para la Ronda 7). Ronda 7 no generó videos nuevos
ni carruseles de producción -- el foco fue construir el sistema
operativo de contenido + ventas, no producir contenido nuevo.

## QUÉ FALTA (ver PENDIENTES.md para el detalle completo)

- Publicación real y datos reales (`resultadoReal`) -- sin esto, todo
  el sistema de anti-repetición por patrón y de experimentos A/B tiene
  su mecanismo más importante sin ejercitar en producción todavía.
- Subtítulos (nunca se generaron en ningún video de la fábrica) --
  candidato identificado: `@remotion/install-whisper-cpp` +
  `@remotion/captions` (ver `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md`),
  todavía en PROBAR, no se tocó en Ronda 6.
- Motor de composiciones en capas -- deliberadamente NO construido
  (prohibido como sistema paralelo, ver `MEJORAS_RONDA4.md`).
- Cinematic Director (capa de coordinación de cámara/profundidad/
  iluminación) -- Ronda 6 agregó el primer componente 3D real
  (`Torre3D`), pero no una capa central que decida esto para todo el
  catálogo. Ver `fabrica/docs/AUDITORIA_PROMPT_MAESTRO_2.md`.
- Hook Engine conectado a la elección automática -- el catálogo
  (`fabrica/hooks/`) existe y es consultable, pero el Director de
  Edición todavía no lo usa para elegir el patrón de apertura de un
  video real.
- Confirmar WebGL2 (`@remotion/effects`/`@remotion/three`) en el
  runner REAL de GitHub Actions -- confirmado con render real solo en
  el sandbox de esta sesión (Chromium de Playwright), el workflow de
  producción usa un binario distinto (`npx remotion browser ensure`).
- Vignette cinemática sutil sobre una escena completa -- probado con
  `@remotion/effects` (Ronda 6), resultó mucho más opaco de lo
  esperado con los parámetros probados; necesita más ajuste, no se usó.
- Sales Engine / Product Ecosystem / Data Engine sin datos reales
  (Ronda 7) -- arquitectura completa y testeada, pero vacía de negocio
  real hasta que el operador responda `PENDIENTES.md` ítem 15
  (audiencia, oferta, precio, datos existentes).
- Carousel Engine sin generador completo (Ronda 7) -- solo 1 componente
  real probado (portada/desarrollo/cta aislados); construir el
  generador de 8-10 slides desde un tema queda para la próxima ronda
  (recomendación del Decision Engine, opción B).

## QUÉ PROBAMOS Y QUÉ FUNCIONÓ

- Golpes con variedad real + anti-repetición (Ronda 3) -- funcionó,
  verificado con 5-7 golpes distintos por video en demo_04/05.
  Anticipo antes de golpe fuerte (Ronda 3) -- funcionó, verificado con
  análisis de luminancia real.
- Tratamiento de repetición de datos (Ronda 3) -- funcionó, verificado
  visualmente ($2.209/$6.120 mostrados en vez de repetir la cifra).
- Director de Edición + microeventos anclados a audio real (Ronda 4)
  -- funcionó, corrigió un desfasaje medido de 1.6s en demo_04.
- Anti-repetición entre videos por componente (Ronda 3-4) -- funcionó
  de verdad en demo_05 (penalizó "silueta" recién usado), con un
  efecto secundario real documentado (cambió la clasificación de
  intención de la escena de pausa).
- WebGL2 (`@remotion/effects`, `@remotion/three`) en el `headless_shell`
  sin GPU dedicada (Ronda 6) -- funcionó, era el riesgo más grande de
  toda la investigación de motion design y quedó resuelto con render
  real, no supuesto.
- Transición real con superposición (`@remotion/transitions`, Ronda 6)
  -- funcionó de punta a punta con audio real, sin desincronizar la
  narración (confirmado con `ffmpeg silencedetect`, ver
  `remotion-spike/src/pruebas-r6/README.md`).
- `lightLeak()` real reemplazando el golpe 'cortina' (Ronda 6) --
  funcionó, mejor calidad visual que el CSS que imitaba lo mismo.
- Primer componente 3D real, `Torre3D` (Ronda 6) -- funcionó de punta a
  punta con audio real a través del pipeline completo, con una
  iteración real de ajuste de escala/espaciado documentada.
- Information Emphasis Engine real, `<Enfasis>` con rough-notation
  (Ronda 6) -- funcionó, conectado como opt-in a `Contador` sin romper
  ningún video existente.

## QUÉ NO FUNCIONÓ / QUÉ SE ENCONTRÓ ROTO

- `fabrica/guion/tipos.ts` estaba documentado como "ya construido"
  desde Ronda 1 (`PENDIENTES.md` ítem 5) pero la carpeta estaba VACÍA,
  sin ningún historial en git -- la afirmación era incorrecta.
  Corregido en Ronda 5 (ver este mismo documento, sección de
  decisiones, y `PENDIENTES.md`).
- El Director Visual eligiendo "ranking" para una unidad pensada para
  "lista-tachada" (Ronda 5, mismo tipo de bug ya visto en Ronda 2/4) --
  confirma que la limitación de "props/semántica distinta dentro de la
  misma categoría" sigue siendo real y recurrente, no un caso
  aislado. Ver ítem 10 de `PENDIENTES.md`.
- `vignette()` de `@remotion/effects` en modo `color` sobre un `<Solid
  color="transparent">` (Ronda 6) -- se esperaba un look "bordes
  oscuros, centro transparente" como el de `lightLeak()`, pero salió
  mucho más opaco de lo esperado incluso con `radius=0.55` (el "centro
  sin afectar" casi no se distinguía). No se usó; documentado como
  necesita-más-ajuste, no descartado del todo.

## QUÉ NO SABEMOS

- Si alguna de las heurísticas de retención/edición de esta fábrica
  correlaciona con retención REAL -- no hay ningún video publicado con
  métricas todavía.
- Si `@remotion/install-whisper-cpp`/`@remotion/captions` funcionan
  bien en nuestro entorno real (GitHub Actions, sin GPU) -- evaluados
  por investigación, NO probados en código todavía (ver
  `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md`).
- Si `@remotion/effects`/`@remotion/three` (confirmados con render real
  en el sandbox de esta sesión, Ronda 6) se comportan igual en el
  runner REAL de GitHub Actions -- usa un Chrome Headless Shell
  distinto al Chromium de Playwright de este entorno.
- Si el costo de render extra de WebGL (transiciones/efectos/3D) sigue
  siendo práctico a escala de producción (muchas escenas, muchos
  videos por corrida de CI) -- no medido todavía, solo probado en
  composiciones cortas y aisladas.

## QUÉ NO DEBEMOS VOLVER A HACER

- No documentar algo como "construido" sin haber verificado que el
  archivo existe de verdad (la lección del ítem `guion/tipos.ts`).
- No instalar un plugin/herramienta de terceros con superficie amplia
  (ej. `remotion-superpowers`) sin verificar primero si sus
  funcionalidades más atractivas dependen de servicios pagos.
- No registrar un video en la memoria de anti-repetición (`historial_
  componentes.json`/`patrones_usados.json`) antes de confirmar que el
  render fue exitoso (bug real de Ronda 4, todavía pendiente de
  arreglar formalmente -- ver `PENDIENTES.md` ítem 13).

## Mapa de documentos

| Documento | Contenido |
|---|---|
| `fabrica/README.md` | Visión general y estado por fase (histórico) |
| `fabrica/PENDIENTES.md` | Todo lo pendiente, con motivo/bloqueo/próximo paso |
| `fabrica/PENDIENTES_OPERADOR.md` | Solo lo que necesita al operador |
| `fabrica/ESTADO_ACTUAL.md` | Informe ejecutivo de Ronda 4 (histórico, no actualizado desde) |
| `fabrica/MEJORAS_RONDA3.md` / `_RONDA4.md` / `_RONDA6.md` / `_RONDA7.md` | Detalle técnico de cada ronda (Ronda 5 es este mismo documento) |
| `fabrica/docs/AUDITORIA_PROMPT_MAESTRO_2.md` | Mapeo del Prompt Maestro 2 (38 secciones, Ronda 6) contra el estado real |
| `fabrica/docs/AUDITORIA_SISTEMA_OPERATIVO.md` | Mapeo de la directiva de Ronda 7 (sistema operativo de contenido+ventas) contra el estado real |
| `fabrica/research/` | Investigación en prosa con evidencia clasificada (retención, etc.) |
| `fabrica/conocimiento/` | Knowledge Engine (Ronda 6, schema ampliado Ronda 7 a 27 categorías) -- investigación tipada y consultable |
| `fabrica/research/` (tipado) | Research System formal (Ronda 7) -- `InvestigacionNecesaria` cuando una fuente no se puede verificar |
| `fabrica/skills/` | Skill Intelligence System -- herramientas externas investigadas, USAR/PROBAR/DESCARTAR |
| `fabrica/hooks/` | Viral/Retention Engine (Ronda 6, ampliado Ronda 7 a 18 patrones/14 categorías) -- patrones de retención con evidencia citada |
| `remotion-spike/src/pruebas-r6/README.md` | Evidencia real (renders, frames) de cada integración visual de Ronda 6 |
| `remotion-spike/src/carrusel/README.md` | Evidencia real (stills PNG) del Carousel Engine (Ronda 7) |
| `fabrica/experiments/` | Experimentos A/B formalizados |
| `fabrica/criticas/` | Salidas guardadas del Crítico Audiovisual por video |
| `fabrica/decisions/` | Decisiones arquitectónicas tomadas y rechazadas, con motivo |
| `fabrica/decision_engine/` | Decision Engine (Ronda 7) -- plantilla Opción A/B/C tipada y testeada |
| `fabrica/ventas/` | Sales Engine (Ronda 7) -- pipeline de negocio tipado, datos reales vacíos hasta respuesta del operador |
| `fabrica/ecosistema_producto/` | Product Ecosystem (Ronda 7) -- una fuente de conocimiento -> múltiples formatos, sin duplicar |
| `fabrica/carrusel/` | Carousel Engine (Ronda 7) -- estructura y validación de carruseles |
| `fabrica/datos/` | Data Engine (Ronda 7) -- esquemas de métricas de video/producto para carga manual |
