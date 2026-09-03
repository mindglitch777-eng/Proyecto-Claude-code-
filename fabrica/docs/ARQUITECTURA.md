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
motivada; desde R7-15 también elige AUTOMÁTICAMENTE un patrón
compatible del Viral/Retention Engine para cada unidad (con
anti-repetición explícita vía `evitarPatrones`, mismo principio que
`evitarGolpes` del Director de Audio)
  ↓
Director de Retención 2.0 (fabrica/directores/retencion/, Ronda 5) --
mapa narrativo del video completo + alertas de arco
  ↓
Knowledge Engine + Viral/Retention Engine (fabrica/conocimiento/,
fabrica/hooks/, Ronda 6, ampliado Ronda 7 a 27 categorías / 18
patrones / 14 categorías de patrón) -- catálogo de conocimiento y de
patrones de retención con evidencia real citada por id, conectado al
Director de Edición (elección automática, R7-15) Y al Director de
Retención (campo `patronesRetencion` derivado automáticamente en
`armarComposicion()`, sin que el generador tenga que declararlo a
mano)
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
- Subtítulos reales con transcripción real (nunca se generaron en
  ningún video de la fábrica) -- R7-16 confirmó que
  `installWhisperCpp()` funciona (build real de whisper.cpp) y que el
  componente de render (`TikTokCaptions.tsx`) renderiza `Caption[]`
  real, pero `downloadWhisperModel()` está BLOQUEADO en este sandbox
  (huggingface.co y su mirror ambos denegados por política de red).
  Sin modelo no hay transcripción real todavía -- ver
  `fabrica/research/`, id `whisper-cpp-modelo-descarga-bloqueada`, y
  `remotion-spike/src/subtitulos/README.md`.
- Motor de composiciones en capas -- deliberadamente NO construido
  (prohibido como sistema paralelo, ver `MEJORAS_RONDA4.md`).
- Cinematic Director (capa de coordinación de cámara/profundidad/
  iluminación) -- Ronda 6 agregó el primer componente 3D real
  (`Torre3D`), pero no una capa central que decida esto para todo el
  catálogo. Ver `fabrica/docs/AUDITORIA_PROMPT_MAESTRO_2.md`.
- ~~Hook Engine conectado a la elección automática~~ RESUELTO (R7-15):
  `DirectorEdicion.planificar()` elige automáticamente un patrón
  compatible con la intención de cada unidad, con anti-repetición
  (`evitarPatrones`) y `armarComposicion()` lo propaga a
  `patronesRetencion` sin que el generador tenga que declararlo a
  mano.
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
- ~~Carousel Engine sin generador completo~~ RESUELTO (R7-14):
  `fabrica/carrusel/generar.ts` arma un carrusel completo (6-10
  slides) desde una sola fuente del Knowledge Engine, sin inventar
  contenido. Carrusel real de 7 slides generado y renderizado de
  punta a punta (`fabrica/salidas/carrusel_001/`).

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
- Generador completo de carruseles, `generarCarrusel()` (R7-14) --
  funcionó de punta a punta: desde una sola fuente real del Knowledge
  Engine armó un carrusel de 7 slides (dentro del rango 6-10 del
  patrón observado), sin inventar contenido, y los 7 PNG se
  renderizaron de verdad (`fabrica/salidas/carrusel_001/`).
- Elección automática de patrón de retención por unidad (R7-15) --
  funcionó: probado que el patrón elegido para una unidad "enganchar"
  siempre es compatible con esa intención (y lo mismo para "revelar"),
  y que la anti-repetición evita repetir el primer candidato cuando ya
  se usó en el mismo video, sin romper ningún test previo del Director
  de Edición ni de `armarComposicion()`.
- `@remotion/shapes`/`paths` real -- primer gráfico de torta/donut de
  la fábrica (`GraficoTorta.tsx`, R7-18). Bug real encontrado y
  corregido probando (el path de `makePie()` está centrado en
  `(radio,radio)`, no en `(0,0)`): el primer render salía con el
  gráfico fuera de cuadro, el segundo (ya corregido) salió bien --
  evidencia en `fabrica/salidas/grafico_torta_001/`.
- Build real de whisper.cpp + render real de subtítulos estilo TikTok
  (R7-16) -- funcionó: `installWhisperCpp()` compila el binario de
  verdad (`whisper-cli` corre) y `TikTokCaptions.tsx` renderiza
  `Caption[]` real sobre audio real de la fábrica, con la palabra
  activa resaltada en sincronía con los timestamps (evidencia real en
  `fabrica/salidas/captions_001/`). NO funcionó (bloqueo de red, no de
  código): descargar el modelo real -- ver `QUÉ NO SABEMOS`.

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

## PUNTOS DÉBILES REALES DE LA FÁBRICA (auditoría R7-19)

Pedido explícito del operador: encontrar los techos actuales, no solo
documentar lo que ya se hizo bien.

- **Cero dato real de resultado en todo el sistema.** El Knowledge
  Engine, la anti-repetición inteligente y el Decision Engine están
  listos para aprender de `resultadoReal`, pero NINGÚN video/carrusel
  de la fábrica se publicó nunca con métricas reales -- toda la capa
  de "aprendizaje" es arquitectura probada con datos sintéticos,
  nunca ejercitada de verdad. Es el techo más grande del proyecto, y
  no es técnico: depende de publicar algo real.
- ~~**La elección automática de patrones de retención (R7-15) nunca se
  ejercitó en un video real**~~ -- **RESUELTO en R7-21.** Se regeneró
  `fabrica-demo-06` (7 unidades) llamando a
  `directorEdicion.planificar(ctx, golpe, evitarPatrones)` con
  anti-repetición real (mismo patrón que ya usaba
  `DirectorAudio.decidirParaUnidad`). Resultado real, sin curar a
  mano: 7 patrones distintos, uno por unidad
  (`contexto-parcial` en el hook, `estructura-problema-agitacion-solucion`
  en el desarrollo, `loop-abierto` en la aceleración, etc.), mapa de
  retención coherente (`hook -> desarrollo -> escalada(climax) ->
  pausa -> revelacion -> escalada -> cierre`). Render completo
  (1150/1150 frames, 38.4s, 1080x1920) y QA duro 100% limpio (sin
  `problemas` ni `alertas`, silencio/pantalla-negra sospechosos
  vacíos). Evidencia visual: `salidas/demo06_frame_hook.png`,
  `demo06_frame_torre3d.png`, `demo06_frame_cierre.png`.
  Bonus (postura resolutiva, no estaba en el plan): al ejercitar esto
  con datos reales se encontró que `Torre3D` (R6-10, componente 3D de
  categoría `cifra`) nunca tenía caso en `propsParaCifra()`
  (`composicion/adaptadores.ts`) -- bug real, no teórico, que hubiera
  bloqueado cualquier generador futuro que ganara ese componente. Se
  agregó el caso (mismo contrato que `contador`: `{arriba, hasta,
  abajo, prefijo}`) con test dedicado en `test_adaptadores.ts`.
- **`@remotion/effects` tiene ~60 efectos, se usó 1 solo**
  (`lightLeak`) -- el resto del catálogo (glitch, chromatic
  aberration, etc.) nunca se evaluó individualmente.
- **Componentes de la misma categoría con props semánticamente
  distintas** siguen siendo un bug recurrente del Director Visual
  (visto en Ronda 2, 4 y 5 -- ver `PENDIENTES.md` ítem 10) -- la
  limitación de fondo (elegir por categoría/intensidad sin entender
  la forma real de los datos) nunca se resolvió de raíz.
- ~~**Música de fondo sigue en `null`** desde Ronda 1~~ -- **RESUELTO
  en R7-22.** `fabrica/musica/biblioteca.json` tiene 9 tracks reales
  CC0 1.0 Universal (repo `effacestudios/Royalty-Free-Music-Pack`,
  licencia verificada leyendo su `LICENSE` real). `resolver_musica.py`
  se conecta desde el generador (una sola elección por video, según la
  intensidad promedio real de `DirectorAudio` -- ver
  `intensidadMusicaPromedio()` en `directores/audio.ts`), y el puente
  de render agrega la música como `<Audio>` de fondo a volumen bajo
  (0.12). Probado en `fabrica-demo-07` (mismo guion/voz que
  `fabrica-demo-06`, único cambio: música) como experimento A/B real:
  QA duro 100% limpio, volumen medio casi idéntico (-17.1dB vs
  -17.2dB), y evidencia cuantitativa de que la música SÍ está presente
  y audible en los huecos de silencio entre líneas (-42.6dB medidos
  ahí, contra -91dB de silencio digital real en demo_06 sin música).
  `musicaSugerida` (per-unidad, en `DecisionAudio`) sigue en `null` a
  propósito -- la música es una decisión de TODO el video, no por
  unidad, ver `fabrica/musica/README.md`.
  Limitación real que queda documentada, no resuelta: no hay loop de
  audio todavía si un video algún día supera la duración del track
  elegido (~90-100s) -- se corta en seco (`trimAfter`). No importa
  para los videos cortos de hoy, pero hay que resolverlo antes de un
  formato más largo. Tampoco hay ducking dinámico (bajar la música
  automáticamente cuando hay narración) -- el volumen fijo bajo (0.12)
  es lo que evita hoy que compita con la voz, verificado con datos
  reales, no solo supuesto.
- **Reglas de golpe/transición son tablas fijas escritas a mano**
  (`GOLPES_POR_NIVEL` en `directores/audio.ts`) -- no aprenden de qué
  combinación funcionó mejor, solo tienen anti-repetición. Candidato
  real para conectar al Knowledge Engine cuando haya datos.
- **Sales Engine y Data Engine (R7-8/R7-11) siguen 100% vacíos** --
  arquitectura probada, cero fila de negocio real, bloqueado en el
  operador (`PENDIENTES.md` ítem 15).

## QUÉ NO SABEMOS

- Si alguna de las heurísticas de retención/edición de esta fábrica
  correlaciona con retención REAL -- no hay ningún video publicado con
  métricas todavía.
- Si la transcripción REAL de whisper.cpp sobre un audio de la
  fábrica es precisa -- R7-16 confirmó que el binario compila y que
  el componente de captions renderiza bien, pero la descarga del
  modelo está bloqueada en este sandbox (huggingface.co y su mirror
  ambos denegados) y no se pudo correr la transcripción real todavía.
  Candidato para probarlo: GitHub Actions.
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
| `remotion-spike/src/subtitulos/README.md` | Subtítulos reales (R7-16) -- build de whisper.cpp confirmado, descarga de modelo bloqueada, evidencia real de render de captions |
| `fabrica/docs/AUDITORIA_PROMPT_MAESTRO_3.md` | Mapeo del pedido de "capa de inteligencia" (R7-17) contra el estado real -- por qué NO se creó `fabrica/inteligencia/` |
| `fabrica/mcp/` | Registro MCP (R7-17, nuevo) -- conectores investigados (vidIQ, Trends MCP, SaaS de video descartados) |
| `fabrica/ESTADO.md` | Estado vivo del proyecto, actualizado por bloque de trabajo (distinto de `ESTADO_ACTUAL.md`, histórico y congelado) |
| `fabrica/docs/ARSENAL_AUDIOVISUAL.md` | Mapa por CAPACIDAD (no por herramienta) de qué existe afuera, qué usamos, evidencia, costo y riesgo (R7-19) |
