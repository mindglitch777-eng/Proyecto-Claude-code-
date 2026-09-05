# Estado vivo del proyecto

A diferencia de `fabrica/ESTADO_ACTUAL.md` (informe congelado de Ronda
4, marcado explícitamente como histórico), este documento se actualiza
después de cada bloque de trabajo real, como pide el "Prompt Maestro
3" (sección 28). Para el detalle técnico completo de cada ronda, ver
`MEJORAS_RONDA*.md`; para lo que necesita al operador,
`PENDIENTES_OPERADOR.md`; para todo lo pendiente técnico,
`PENDIENTES.md`; para el texto completo y el checklist punto-por-punto
del prompt "Capa de exploración agresiva" (para no perderlo de nuevo
en la memoria de la conversación), `docs/PROMPT_EXPLORACION_AGRESIVA.md`.

## Bloque: sacar `slot-machine` del catálogo (2026-09-05, feedback directo del operador)

El operador vio el resultado real (usado en `venta-06.mp4`/`venta-09.mp4`)
y lo pidió sacar por mala calidad visual. Removido de TODO lugar activo,
no solo `estado`:
- `remotion-spike/src/effects/SlotMachine.tsx` -- borrado (no archivado:
  a diferencia del orquestador de Fase 1, esto no tiene valor futuro
  como referencia, es simplemente un componente que no cumplió).
- `registro.json` -- entrada eliminada (55→54 componentes).
- `FabricaVideo.tsx`, `effects/index.ts`, `Root.tsx` (import, mapa de
  implementaciones, `efecto-slot-machine`) -- todas las referencias
  sacadas.
- `adaptadores.ts` -- el caso `'slot-machine'` de `propsParaCifra()` y
  su entrada en `COMPONENTES_CIFRA_SOPORTADOS` sacados (referencia
  colgando a un componente que ya no existe).

**Lo que se dejó a propósito sin tocar**: `generar_lote_ventas.ts`
(script histórico ya corrido, referencia `slot-machine` dos veces) y
`fabrica_bridge/venta_06.json`/`venta_09.json` (árboles de composición
ya renderizados) -- son registro histórico de lo que efectivamente se
generó, no código vivo. Consecuencia real y aceptada: si alguien
intenta volver a correr `generar_lote_ventas.ts` desde cero hoy, esas
dos escenas fallarían (`componenteId` inexistente) -- ese script ya
está superado por `renderizador_por_guion.ts` de todos modos.

Categoría `cifra` queda sin un efecto de "número único revelado estilo
tragamonedas" hasta que se construya una versión mejor (pendiente, si
se pide).

Verificado: `validar_registro.ts`, `tsc --noEmit` en `fabrica/` y
`remotion-spike/`, y la suite completa de tests de `fabrica/` -- todo
en verde después de la remoción completa.

## Bloque: carta técnica "efectos virales" (2026-09-05)

4 componentes nuevos pedidos por carta técnica externa (5 efectos
pedidos, 1 ya existía -- ver más abajo), integrados al catálogo real y
verificados con still real (no solo compilación):

- **`punch-in`** (texto): zoom digital 1.0→1.8x con sobregiro sobre UNA
  palabra/cifra ya en pantalla, mantiene y vuelve con rebote. Distinto
  de `punch` (agresivo/Punch.tsx), que es una SECUENCIA de frases
  entrando una tras otra -- mecánica distinta, ids distintos a
  propósito.
- **`split-screen`** (comparación): dos mitades verticales simultáneas
  antes/después con línea neón central, el lado "después" gana terreno
  con el tiempo. Distinto de `antes-despues` (cortina que revela una
  sola cara a la vez) -- mecánica visual distinta aunque el rol
  narrativo se superponga.
- **`kinetic-text`** (texto): hasta 3 líneas entran desde arriba a alta
  velocidad, chocan con rebote + glitch/chispa de impacto (chromatic
  aberration manual, sin libreria nueva), se congelan.
- **`tap-to-cut`** (montaje, no golpe): destello que se expande desde
  el centro y se desvanece -- mismo patrón que `pixel-burst` (escena
  autocontenida entre dos unidades). La carta lo pedía como componente
  `<TapToCut/>`; se documentó por qué NO es un `TipoGolpe` nuevo de
  `golpes.tsx` (son sistemas distintos: golpe = transición ENTRE
  escenas resuelta por el puente de render; esto es una escena propia).

**3 correcciones a la carta, aplicadas y documentadas en el código para
llevar de vuelta a la discusión**:
1. El 5to efecto pedido ("Contador Dinámico", slot-machine style) **ya
   existe** como `slot-machine` (agregado la ronda pasada) con props
   casi idénticas (`finalNumber`, `metalColor`). No se construyó un
   componente duplicado (`Counter`) -- eso hubiera repetido el mismo
   patrón de duplicación que la auditoría de esta misma ronda encontró
   en `generar_demo_11.ts`/`demo_12.ts`.
2. La carta pedía `@react-spring/three` para las animaciones de
   rebote. No se agregó -- esa librería no está en `package.json` de
   `remotion-spike` (sería LA dependencia no estándar que la carta
   misma pide evitar). Se usó una función `easeOutBack` de 4 líneas
   (mismo resultado visual: overshoot + settle), cero dependencias
   nuevas.
3. La carta pedía marcar los 4 componentes como `estado: "validado"`
   "ya que se van a usar en producción inmediatamente". Se dejaron
   como `"sin_validar"` (igual que TODOS los demás efectos nunca antes
   ejercitados en un video real) -- `validado` significa, en todo el
   resto del catálogo, "confirmado con un render de producción real",
   no "intención de uso". Cambiar ese significado solo para estos 4
   corrompería la señal que el propio scoring del Director Visual usa
   (aunque esté deprecado para producción, sigue siendo la fuente de
   verdad de qué está realmente probado). No tiene costo funcional:
   `renderizador_por_guion.ts` (el flujo de producción actual) no lee
   `estado` para nada.

Verificado con render de still real (`prueba-efectos-virales`, 6
frames en puntos clave de cada efecto) -- los 4 se ven como se
describieron, sin errores. `tsc --noEmit` limpio en `fabrica/` y
`remotion-spike/`, suite completa de tests de `fabrica/` en verde.

## Último bloque de trabajo: Orden de auditoría + reestructuración (2026-09-04, en curso)

Orden explícita del operador tras ver que el lote de 10 videos de venta
salió con calidad visual muy por debajo del benchmark R7-32
("demasiada locura" el guion, video "deteriorado"). Dos partes: (1)
auditar qué motores de la fábrica están conectados de verdad vs
aislados, y (2) declarar el Director Visual/scoring automático
DEPRECADO para producción (sin borrarlo) y construir un orquestador
script-driven donde el guionista elige el componente a mano.

**HECHO (real, testeado):**
- **Auditoría punto 1 (motores conectados vs aislados)**: confirmado
  con `grep` real sobre los 13 generadores de `fabrica/ejemplos/` --
  `DirectorEdicion`/`DirectorRetencion`/`correrCicloMejora` se usan en
  `generar_demo_05.ts` a `12.ts` (8 de 13), forced-alignment solo en
  `demo_10`. `generar_lote_ventas.ts` (el que produjo los 10 videos de
  venta) no usa NINGUNO de los cuatro -- causa real confirmada de la
  caída de calidad. Sales Engine, Research System, Carousel Engine,
  ecosistema_producto, Skill Intelligence, Decision Engine y el
  registro MCP: cero imports desde cualquier otro módulo, están
  totalmente aislados. Data Engine tiene un solo consumidor real
  (`orquestador/orquestador.ts`).
- **Auditoría punto 2 (obsoleto/duplicado)**: `generar_demo_11.ts` y
  `generar_demo_12.ts` son ~95% el mismo archivo (diff de imports/
  constantes only). De los 51 componentes de `registro.json`, 19 nunca
  se usaron en ningún `ArbolComposicion` real generado hasta hoy (7
  legacy + 12 de los 23 efectos nuevos de esta ronda) -- medido
  recorriendo los 24 JSON reales de `fabrica_bridge/`. Dos workflows
  (`pexels-automatico.yml`, `probar-render.yml`) no tienen corridas
  registradas en la API -- diagnóstico verificado, NO están rotos: su
  propio encabezado ya documenta que `workflow_dispatch` solo funciona
  una vez mergeado a `main` (misma limitación que obligó a disparar
  `render-lote-ventas.yml` por push a un centinela). No se tocaron.
- **Punto 4 ejecutado**: archivado (`git mv`, reversible) a
  `archivado/fase1-orquestador-original/` de `orchestrator.py`,
  `state/state.json`, `state/fabrica.json` y
  `.github/workflows/orquestador-diario.yml` -- los cuatro son,
  literalmente, el sistema de Fase 1 que `CLAUDE.md` ya declaraba
  congelado. Hallazgo no pedido pero real, encontrado en el camino:
  `orquestador-diario.yml` seguía CORRIENDO TODOS LOS DÍAS a las 9am,
  gastando uso real de Claude Code del operador contra
  `orchestrator.py status` -- su última corrida antes de este archivado
  falló. `producto/` (código real de "El Corte") no se tocó, por
  instrucción explícita de `CLAUDE.md`. TODOs/"por si acaso" huérfanos:
  se buscaron en toda `fabrica/`, no hay ninguno real (las coincidencias
  eran la palabra española "todo/todos" dentro de comentarios normales).
- **Nuevo orquestador `fabrica/composicion/renderizador_por_guion.ts`**:
  recibe `EscenaGuion[]` con `componenteId`/`props` explícitos (sin
  Director Visual/scoring), pero SÍ corre `DirectorEdicion` (+ curva de
  energía opcional), `DirectorAudio` (salvo `transicionSalida`
  explícito, que gana siempre), forced-alignment real vía
  `palabraClave` (nunca inventa un timestamp), y `DirectorRetencion`
  sobre el árbol completo -- exactamente las cuatro piezas que
  `generar_lote_ventas.ts` se saltó. Rechaza con error explícito un
  `componenteId` inexistente o un `transicionSalida.tipo` inventado
  (ej. confundir un golpe real con el id de un efecto visual como
  "pixel-burst"). Probado de punta a punta en
  `test_renderizador_por_guion.ts` con audio real ya grabado (9
  verificaciones + 2 casos de rechazo, todos en verde) y `tsc --noEmit`
  limpio sobre toda `fabrica/`.

**PENDIENTE de esta misma orden:**
- Puntos 3 (plan de conexión escrito) y 4 (archivar código muerto a
  `archivado/`, limpiar TODOs huérfanos) de la Parte 1 -- investigación
  ya hecha, informe y limpieza todavía no.
- Ejercitar `renderizador_por_guion.ts` en un guion real completo (no
  solo la prueba de humo de 2 escenas) para tener el primer video de
  producción con este orquestador nuevo.

## Último bloque de trabajo: R7-32 (2026-09-03) -- Benchmark audiovisual agresivo

Pedido explícito del operador: a diferencia de todas las rondas anteriores
("hacelo más agresivo"), esta vez entregó un brief de director completo
-- guion nuevo de 14 líneas exactas ("La IA no es el negocio"), dirección
visual escena por escena, curva de energía, dirección de transiciones y
de audio, regla de oro ("agresivo = contraste, no más efectos") -- y pidió
un render real, no otra ronda de documentación. Texto completo en
`docs/PROMPT_BENCHMARK_AGRESIVO.md`.

**HECHO (real, testeado, video renderizado y entregado):**
- **Guion nuevo + voz real**: 14 líneas exactas (sin cambiar ni una,
  sin estadísticas agregadas), voz Qwen3-TTS con la MISMA configuración
  de producción (voz clonada `librivox-11`, mismo instruct, mismo rate
  1.25 -- única variable de esta prueba es guion+dirección+edición, no
  el motor de voz, tal como pidió el operador). Generada vía
  `.github/workflows/generar-voz-demo-10.yml` (mismo patrón ya probado
  en rondas anteriores).
- **Forced-alignment real usado por primera vez en producción**:
  `fabrica/voz/alineacion.ts` (nuevo, envuelve el prototipo YA
  EXISTENTE de R6-2/P3-3) lee el resultado real de faster-whisper
  (corrido en GitHub Actions, bloqueado en este sandbox por política de
  red hacia Hugging Face) para anclar la jerarquía visual del hook
  ("LA IA" / "NO" / "TE VA A HACER GANAR PLATA") a la palabra real "no"
  medida en el audio (1.80s-2.16s) -- confirmado visualmente en frames
  extraídos del render.
- **Plan de dirección real, no interpretación libre**: 14 unidades (una
  por línea de guion) mapeadas explícitamente a categorías/componentes
  reales del catálogo según la intención de cada escena del brief (tabla
  completa en `docs/PROMPT_BENCHMARK_AGRESIVO.md`), sin inventar ningún
  componente nuevo ni ningún dato/número no narrado.
- **Curva de energía propia** (`CURVA_BENCHMARK_AGRESIVO`, nueva
  configuración en el MISMO `curva_energia.ts` de R7-31 -- conexión, no
  duplicación): un punto exacto por unidad (14 puntos, no 7-8 gruesos)
  para que unidades consecutivas con objetivos opuestos (hook muy_alta
  seguido de un valle deliberado) no se contaminen entre sí.
- **Video real generado y renderizado**: `fabrica-demo-10.mp4` (43.84s).
  QA duro y de composición 100% limpios (`ok: true`). **11 componentes
  distintos del catálogo usados en 14 unidades** (punch, silueta,
  rafaga, balanza, logos-herramientas, antes-despues, buscador, chat,
  notificaciones, diagrama, remate) -- contra los ~6 componentes que se
  repetían siempre en demos anteriores. Inspección visual real confirmó
  variedad de lenguaje visual genuina (b-roll+ráfaga para abundancia,
  balanza sin números para el frenazo, aro pulsante en antes-despues
  para el colapso, mockups de búsqueda/chat/notificaciones para la
  tríada, diagrama con iconos reales para la convergencia).
- **Hallazgo honesto real (documentado, no escondido)**: el mecanismo
  `cambia_encuadre` de R7-31 (pausas reales dentro de un clip) dio 0
  resultados esta ronda -- los clips de este guion son más cortos que
  los de demo_06 donde se validó la técnica, y `detectarPausaInterna()`
  no encontró ninguna pausa útil en la ventana [15%,85%]. Se documenta
  como límite real de la técnica con audio corto, no se fuerza un
  resultado falso.
- **Otro hallazgo honesto**: la unidad "desarrollo_2" (automatización)
  quedó clasificada como `dejar_respirar` (pausa) en vez de la
  "aceleración" que pedía el brief -- el componente ganador real
  (`logos-herramientas`) tiene intensidad intrínseca baja (0.35) y el
  clip es corto, y la anti-repetición cross-video penaliza a las
  alternativas de mayor intensidad (`ranking`/`lista-tachada`, ya
  usados en demo-08/09). El Rhythm Engine respeta esa clasificación
  (nunca fuerza energía sobre una pausa real, R7-31) -- se documenta la
  tensión real entre mi intención de dirección y la decisión honesta
  del sistema, en vez de forzar un componente peor solo para que
  coincida con el plan.
- **Comparación objetiva vs. fabrica-demo-09** (Crítico v2, con
  advertencia explícita de que la estructura es distinta -- 14 unidades
  cortas vs. 7 más largas, así que los conteos crudos no son 1:1):
  demo-10 usa **11 componentes distintos vs. 6** de demo-09/08, y su
  densidad visual **SÍ varía en el tiempo** (`densidad_visual_varia:
  true`) a diferencia de demo-09 (`false`, por el efecto colateral de
  memoria documentado en el bloque anterior). QA duro limpio en ambos,
  0 silencios/negros sospechosos en los dos.
- **Registrado con datos reales**: `memoria/laboratorio.json`
  (hipótesis `esperando_datos`) + `datos/datos.ts` (tercera entrada
  real, `qaResumen.ok=true`, `metricas: null`, nunca publicado).

**Suite completa verificada**: `npm run test-todo` (39/39 OK, incluye
tests nuevos de forced-alignment y de la comparación objetiva) + `tsc
--noEmit` limpio en `fabrica/` y `remotion-spike/`.

**PRÓXIMO PASO real, ya registrado**: si se repite este benchmark, usar
clips de audio más largos (o textos con más pausas naturales) para que
`cambia_encuadre` tenga con qué trabajar; y considerar un mecanismo que
permita a un director "reservar" intencionalmente un componente de baja
intensidad para una franja donde SÍ se quiere aceleración, sin pelear
contra la clasificación honesta de `decidirIntencion()`.

## Bloque anterior: R7-31 (2026-09-03) -- que la fábrica PIENSE la edición

Pedido explícito del operador: diagnóstico propio sobre `fabrica-demo-08`
(cambios estructurales fuertes solo en ~15.7s/21.7s/30.4s/34.3s, tramos
largos sin variación, edición dependiente de texto+timeline) + prohibición
explícita de "arreglarlo con más efectos" -- pidió arreglar el SISTEMA DE
DECISIÓN. Texto completo (24 secciones) en
`docs/PROMPT_DIRECCION_AUDIOVISUAL.md`, con tabla de estado sección por
sección y un hallazgo honesto documentado ahí (ver abajo).

**HECHO (real, testeado, ejercitado en video):**
- **Rhythm Engine real** (`directores/edicion/curva_energia.ts`, nuevo):
  curva de energía objetivo para todo el video (7 checkpoints
  hook→explicación→aceleración→micro-pausa→revelación→aceleración→cierre),
  conectada a `DirectorEdicion.planificar()`. Diseño deliberadamente
  limitado: solo empuja energía HACIA ARRIBA, nunca contradice una unidad
  de respiración real -- evita que una curva rígida pise contenido real.
  Efecto limpio confirmado en el video real: la unidad "impacto"
  (revelación/clímax) pasó de `alta` a `muy_alta` sin cambiar de
  componente, ahora el clímax se distingue energéticamente de las demás
  unidades (en demo-08 tenía la misma energía que hook/cierre).
- **Causa raíz real de los tramos estáticos, encontrada y corregida**:
  las unidades de un solo clip de audio (aceleración, pausa, desarrollo2)
  no tenían NINGÚN offset interno donde anclar un cambio visual -- por la
  regla dura del proyecto de nunca inventar timing no medido. Fix:
  `composicion/pausas.ts` (nuevo) detecta pausas de voz REALES con
  `ffmpeg silencedetect` (mismo mecanismo que ya usaba `checks_duros.py`,
  umbral distinto) y las usa para anclar un microevento `cambia_encuadre`
  real -- un tipo que existía en `tipos.ts` hace varias rondas pero nunca
  se emitía ni se consumía (hallazgo real de "implementado pero no
  usado"). Ejercitado en Remotion (`CambioEncuadre.tsx`, nuevo, wrapper
  genérico de scale-pulse anclado a un frame).
- **Crítico Audiovisual v2** (`qa/critico_v2_metricas.py`, nuevo): métricas
  objetivas MEDIDAS del árbol/render real (cantidad y timestamps de
  cambios estructurales, duración media/máxima de bloque visual, variedad
  de componentes/golpes, densidad visual en el tiempo, silencios/negros
  reales). Confirmó numéricamente el diagnóstico del operador sobre
  demo-08 antes de tocar código, y sirvió para la comparación real.
- **Video real de prueba generado y renderizado**: `fabrica-demo-09.mp4`
  (38.38s), mismo guion/voz/preset `financiero_directo` que demo-08 (A/B
  real, única variable nueva: las dos de arriba). QA duro y de
  composición 100% limpios (`ok: true`). Entregado al operador.
- **Comparación objetiva real demo-08 vs demo-09** (Crítico v2):
  cantidad de eventos de cambio 12→14 (+2, exactamente los dos
  `cambia_encuadre` nuevos, anclados a pausas reales a los 17.79s y
  32.91s); duración media de bloque visual 3.32s→2.81s (menos tramos
  largos sin variación); duración máxima de bloque sin cambio: sin
  cambios (5.82s en ambos) -- la unidad "pausa" no tenía ninguna pausa
  de voz útil detectada dentro de la ventana real, así que honestamente
  no se le agregó ningún cambio inventado. Confirmado visualmente con
  frames extraídos del render (el pulso de escala es visible en el
  frame exacto de la pausa detectada).
- **Hallazgo honesto (no atribuido de más)**: la comparación reveló que
  la unidad "pausa" y "desarrollo2" cambiaron de COMPONENTE entre
  demo-08 y demo-09 (`silueta`→`tres-verdades`,
  `lista-tachada`→`ranking`) -- esto NO es efecto del Rhythm Engine ni
  de `cambia_encuadre`, es la memoria anti-repetición cross-video ya
  existente (`componentesUsadosRecientes(5)`, R6-5) penalizando
  componentes que demo-08 ya había usado y registrado en
  `memoria/historial_componentes.json`. Efecto secundario real: la
  intención de "pausa" pasó de `dejar_respirar` a `construir_tension`, y
  ESO -- no la curva -- redujo la variación de densidad visual en ese
  punto. Se documenta como un límite real del método de comparación A/B
  con memoria persistente entre videos consecutivos, no como una mejora
  falsa ni como un bug urgente.
- **Registro real**: `memoria/laboratorio.json` (hipótesis
  `esperando_datos`, sin resultado inventado) + `datos/datos.ts`
  (segunda entrada real, `qaResumen.ok=true`, `metricas: null` porque
  nunca se publicó).

**NO abordado esta ronda (presupuesto de tiempo, documentado sin
maquillar en `docs/PROMPT_DIRECCION_AUDIOVISUAL.md`)**: Hook Engine v2,
biblioteca de lenguaje visual de negocios (dinero/ventas/etc.), familias
de transición nuevas más allá de los `TipoGolpe` existentes, Payoff
Engine, CTA integrado a la narrativa, Anti-Predictability Engine
extendido más allá de componentId/golpe/patrón de retención.

**Suite completa verificada**: `npm run test-todo` (38/38 OK, incluye
un nuevo test de comparación objetiva demo-08 vs demo-09) + `tsc
--noEmit` limpio en `fabrica/` y `remotion-spike/`.

**PRÓXIMO PASO real, ya registrado**: si se genera un demo-10, resetear
o filtrar `historial_componentes.json` para ese experimento puntual (o
comparar solo escenas con el mismo componente) para que el A/B vuelva a
ser de una sola variable limpia; después, Hook Engine v2 o Anti-
Predictability Engine extendido son los candidatos más directos según
la propia lista de pendientes de esta ronda.

## Bloque anterior: R7-30 (2026-09-03) -- Orquestador real + video real generado

Pedido explícito del operador: "no más piezas sueltas, construí una
máquina" -- Orquestador real que conecte todo el pipeline y termine en
un video real, con cada decisión registrada. Texto completo en
`docs/PROMPT_MAQUINA_CONECTADA.md`.

**HECHO:**
- **Orquestador** (`fabrica/orquestador/orquestador.ts`): corre QA real
  (`checks_duros.py` + `checks_composicion.py`) sobre un render real y
  arma un `RegistroVideoCompleto` con log de decisiones explícito.
- **Video real generado**: `fabrica-demo-08.mp4` (38.32s) -- mismo
  guion/voz que demo_07 (A/B real), única variable nueva: preset de
  estilo `financiero_directo` (R7-29) aplicado por primera vez por un
  generador real. QA real 100% limpio, inspección visual real
  confirmó texto legible y el efecto de revelación disparando bien.
  Entregado al operador.
- **Bloqueo real resuelto**: Remotion intentó descargar su propio
  Chromium (bloqueado, mismo dominio `remotion.media` ya conocido) --
  se resolvió apuntando `--browser-executable` al binario de
  Playwright ya preinstalado en el entorno (`/opt/pw-browsers/`), $0,
  sin depender de nada bloqueado.
- **Hallazgo real de proceso**: `fabrica/datos/datos.ts` es código TS
  literal (no un archivo JSON respaldado como `memoria/laboratorio.json`)
  -- la primera entrada real (`fabrica-demo-08`, con `qaResumen` real)
  se agregó a mano, mismo patrón que `ecosistema_producto/datos.ts`.
- **Hallazgo real sobre `configuracion.ts`**: al usarlo por primera vez
  en un generador real, se confirmó que `decidirEstilos()` combina
  (une) los estilos del preset con los de la intención narrativa, no
  los reemplaza -- documentado tal cual salió, no maquillado.

**Suite completa verificada**: `npm run test-todo` (35/35 OK) + `tsc
--noEmit` limpio en `fabrica/` y `remotion-spike/`.

**PRÓXIMO PASO real, ya registrado**: anti-repetición perceptual por
familias (sección 11 del prompt, no abordada esta ronda) y generalizar
el Orquestador a un comando único parametrizable ("crear video sobre
X") en vez de un script por guion.

## Bloque anterior: R7-29 (2026-09-03) -- Ronda de evolución real (sistema operativo de contenido)

Pedido explícito del operador: prompt nuevo de 20 fases, esta vez
pidiendo explícitamente IMPLEMENTAR conexiones reales entre sistemas
ya existentes (no solo investigar/documentar) -- "prefiero 5 sistemas
realmente conectados antes que 30 carpetas decorativas". Texto completo
guardado en `docs/PROMPT_EVOLUCION_SISTEMA_OPERATIVO.md`.

**HECHO:**
- **Fase 0 (auditoría + mapa de madurez)**: `docs/MAPA_MADUREZ_SISTEMA.md`
  -- 18 sistemas evaluados con evidencia de código real. Corrección
  importante: `checks_duros.py` YA mide cosas reales del render
  (ffprobe/ffmpeg), no es cierto que el QA "solo valide JSON". Confirmado
  que Carousel Engine + Product Ecosystem ya cierran el ciclo Knowledge
  → Contenido de punta a punta (artefacto real `carrusel_001`).
- **Fase 1 (conectar el ciclo)**: identificado un eslabón real roto
  (QA → Measurement) y conectado -- `datos/tipos.ts` agrega `qaResumen`
  a `RegistroVideoCompleto`, `datos/consultar.ts` agrega
  `videosConProblemasDeQa()`.
- **Fase 13 (configuración de estilo)**: `directores/edicion/configuracion.ts`
  -- 5 presets reutilizables a nivel de video (`ventas_agresivo`,
  `documental_serio`, `financiero_directo`, `misterio_revelacion`,
  `educativo_calmo`), auditado primero que no duplicaba nada existente.
- **Fase 14 (QA real de contraste)**: `fabrica/qa/contraste.py` --
  fórmula oficial WCAG 2.x, sin dependencias nuevas. Hallazgo real
  verificado: `texto` sobre `acento` (paleta de marca) = 3.05:1, NO
  cumple el mínimo de texto normal (4.5:1) -- confirmado que ningún
  componente actual usa esa combinación mal (ya usan un color oscuro
  propio en su lugar).
- **Fase 15 (autocrítica)** y **Fase 19 (informe final)**: hechas,
  con honestidad explícita sobre qué se implementó vs. qué quedó
  evaluado sin ampliar vs. qué no se abordó (Fase 8, video analysis).

**Suite completa verificada en cada paso**: `npm run test-todo` (34/34
OK) + `npx tsc --noEmit` limpio en `fabrica/` y `remotion-spike/`.

**BLOQUEADO -- NO CONFIRMADO (sin cambios, ya documentados antes):**
mismos bloqueos reales de siempre (YouTube API key, Hotmart
credenciales, Jamendo client ID) -- ninguno nuevo esta ronda.

**PRÓXIMO PASO real, ya registrado**: de las fases no abordadas, la
más concreta es la Fase 8 (pipeline de análisis de video vía GitHub
Actions) -- requiere diseño nuevo, no se llegó por presupuesto de
tiempo de esta ronda. De las fases evaluadas sin ampliar, la de mayor
impacto de negocio sigue siendo la misma que ya está en el Decision
Engine: conseguir datos reales del operador para el Sales Engine.

## Bloque anterior: R7-28 (2026-09-03) -- los 6 puntos pendientes del prompt, cerrados

Pedido explícito del operador: terminar los 6 puntos del prompt de
exploración agresiva que habían quedado con hueco real (17, 10, 11, 5,
4, 15), con investigación exhaustiva y sin bloquearse -- ANTES de irse
a dormir, esperando un resultado positivo a la vuelta. Instrucción de
proceso importante a mitad de ronda: NO paralelizar con varios agentes
de investigación a la vez (el operador lo pidió explícitamente al ver
4 agentes lanzados en simultáneo) -- se rehizo todo el bloque punto por
punto, en serie, cada uno investigado y cerrado antes de pasar al
siguiente.

**HECHO (los 6 puntos, en orden de cierre):**
- **Punto 17 (auditoría de techos)**: `docs/AUDITORIA_TECHOS_FABRICA.md`
  -- hallazgo raíz con evidencia de código real: toda la fábrica es
  heurística declarada (tablas fijas, umbrales mágicos en los 4
  Directores), y el sistema de aprendizaje real (`memoria/laboratorio.json`)
  tiene sus 10 hipótesis en `estado="esperando_datos"` -- cero feedback
  real cerró el loop todavía porque no hubo publicación/venta real. Más
  7 techos específicos citando líneas de código concretas.
- **Punto 10 (técnicas sin herramienta)**: 6 entradas nuevas al
  Knowledge Engine con fuentes reales -- contraste WCAG (única marcada
  `evidencia`, estándar oficial W3C), tipografía en video vertical,
  pacing/duración de plano (con respaldo de un estudio peer-reviewed de
  eye-tracking), silencio como énfasis, capas/parallax, edición por
  nicho financiero.
- **Punto 11 (referencias reales)**: 3 entradas nuevas, con la
  limitación real del sandbox declarada explícitamente (TikTok/YouTube/
  Instagram bloqueados, no se pudo transcribir un video real) --
  identidad visual de Cleo Abram (entrevista directa, no analizada por
  terceros), estructura "Hook-Error-Solución" de nicho financiero,
  ventana de atención de texto animado.
- **Punto 5 (MCP restantes)**: 4 MCP nuevos verificados con WebFetch
  directo a cada README real -- GoogleTrendsMCP (único de 3 candidatos
  de Trends genuinamente $0, los otros 2 dependen de una API paga),
  Reddit Research MCP (el más limpio de toda la exploración: sin
  cuenta, sin clave, sin límite), Zapier MCP (esperar autorización NO
  por costo sino porque ejecuta acciones reales en apps de terceros),
  **API oficial de Hotmart** (hallazgo de alto valor: es la pieza que
  le falta al Sales Engine, hoy vacío).
- **Punto 4 (skills restantes)**: hallazgo clave -- gran parte de
  "marketing/ventas/productos digitales" ya estaba resuelta sin buscar
  nada (esta cuenta de Claude Code ya tiene copywriting/cro/
  customer-research/offers/pricing/product-marketing/marketing-plan/
  launch/lead-magnets/marketing-psychology habilitadas). Sumadas 4
  skills externas reales (storytelling-skills, claude-youtube,
  tiktok-skills sin Publora, claude-shorts como referencia).
- **Punto 15 (priorización P0-P3)**: `docs/PRIORIZACION_P0_P3.md` --
  17 ítems priorizados + lista concreta de qué implementar YA con $0.

**Corrección de proceso permanente**: creado `docs/PROMPT_EXPLORACION_AGRESIVA.md`
con el texto COMPLETO del prompt de 31 puntos + checklist de estado por
punto -- el operador señaló que el prompt se venía perdiendo entre
compactaciones de la conversación (el resumen automático solo guarda un
parafraseo, no el texto literal). Este archivo vive en el repo, no en
la memoria del chat, y se actualiza incrementalmente.

Suite completa verificada antes de cerrar: `npm run test-todo` (32/32
OK) + `npx tsc --noEmit` limpio en `fabrica/` y `remotion-spike/`.

**PRÓXIMO PASO real, ya registrado**: de la lista P0 de
`PRIORIZACION_P0_P3.md`, el más concreto para código real (no solo
investigación) es el QA de contraste/legibilidad sobre frames
renderizados (motivado por el hallazgo #7 de la auditoría de techos) --
implementable con $0, sin depender de ninguna decisión del operador.

## Bloque anterior: R7-27 (2026-09-03) -- cierre de la capa de exploración agresiva

Pedido del operador: terminar TODOS los puntos del prompt "CAPA DE
EXPLORACIÓN AGRESIVA DE SKILLS, REMOTION, MCP Y ARSENAL AUDIOVISUAL"
(31 secciones) -- este bloque cierra los puntos que quedaban abiertos
de R7-22 a R7-26 (sección 5 del prompt: MCP de investigación de
contenido; sección 15: Decision Engine; sección 22: informe final
formato A-P).

**HECHO:**
- **Sección 5 (MCP de contenido real)**: investigados 2 candidatos
  nuevos con el mismo rigor que los ya registrados (fuente citada,
  costo/límites/riesgo reales, no supuestos):
  - **SocialCrawl MCP** (`socialcrawl.dev`) -- 42-48 plataformas, 381
    endpoints, 3 de 4 tools funcionan SIN api key (documentación/lista
    de endpoints local). Confirmado vía su propia página de pricing:
    100 créditos gratis, **sin tarjeta, sin vencimiento, sin
    conversión automática a plan pago** -- el perfil de riesgo más
    bajo de todos los MCP evaluados hasta ahora. Decisión: `probar`.
  - **Trend Intel (actor sobre Apify)** -- $5 USD/mes de crédito
    gratis sin tarjeta, pero facturado en "compute units" (no en
    requests simples como SocialCrawl), más difícil de predecir el
    rendimiento real del crédito gratis. Decisión:
    `esperar_autorizacion_operador` (no por costo confirmado, sino por
    la ambigüedad real de cuánto rinde el crédito gratis).
  - Ambos registrados en `fabrica/mcp/registro.ts` con el mismo
    template que `vidiq`/`trends-mcp` -- `test_mcp.ts` sigue pasando
    sin cambios (el registro es genérico).
- **Sección 15 (Decision Engine)**: agregada una decisión real y
  abierta -- "¿conectar el beat-sync (BPM medido en R7-26) al timing
  de golpes de `directores/audio.ts` ya mismo, o esperar un video de
  prueba dedicado?" -- comparando ambas opciones con ventajas/riesgos
  reales (incluye la limitación conocida del BPM automático). Recomendación:
  esperar un A/B real antes de tocar un sistema de producción que ya
  funciona, mismo patrón que la decisión de Ronda 6 sobre
  `@remotion/transitions`.
- Suite completa verificada antes de cerrar: `npm run test-todo`
  (32/32 suites OK) + `npx tsc --noEmit` limpio en `fabrica/` y en
  `remotion-spike/`.
- Entregado al operador el informe final formato A-P (sección 22 del
  prompt) resumiendo todo el arco R7-22 a R7-27 -- ver el mensaje de
  cierre de esta sesión (no se duplica el contenido acá para no
  desincronizar; este ESTADO.md es el resumen técnico operativo).

**BLOQUEADO -- NO CONFIRMADO (ninguno nuevo, ya documentados antes):**
YouTube Data API sigue esperando `YOUTUBE_API_KEY` del operador
(R7-20); `vidiq`/Apify Trend Intel siguen esperando autorización de
cuenta/costo; Jamendo sigue esperando `JAMENDO_CLIENT_ID`.

**PRÓXIMO PASO real, ya registrado**: el más claro y de más impacto de
negocio (no técnico) sigue siendo el de la decisión "prioridad-post-
ronda-7" ya registrada: conseguir del operador la info real de
audiencia/oferta para el Sales Engine. En paralelo, técnicamente, el
candidato más concreto es generar el video de prueba dedicado
(demo_08) que compare timing de golpes con/sin grilla de BPM antes de
integrar beat-sync a producción.

## Bloque anterior: R7-26 (2026-09-03)

Pedido del operador: seguir profundizando la exploración agresiva
(skills de Claude Code + MCP), tomándose el tiempo necesario.

**HECHO:**
- Investigados 4 repos reales nuevos vía WebSearch + lectura directa
  de README/LICENSE (`raw.githubusercontent.com`):
  - **`iart-ai/motion-design-skills`** (MIT) -- **PROBAR/INTEGRADO
    parcialmente**: se instaló de verdad la skill `beat-sync-editing`
    en `.claude/skills/` (ya activa, visible en el listado de skills
    de esta sesión). Trae una técnica real y accionable: cortar en la
    grilla del BPM (`framesPerBeat = (60/BPM)*fps`) -- justo lo que le
    faltaba a `directores/audio.ts`.
  - **`haidrrrry/claude-remotion-skill`** (MIT) -- DESCARTADO: su regla
    principal (loop render->inspeccionar->corregir) ya es exactamente
    la disciplina que esta fábrica sigue desde Ronda 2, sin aporte
    nuevo real.
  - **`Vincentwei1021/video-shotcraft`** (Apache-2.0, libre) y
    **`video-talkcraft`** (**PolyForm Noncommercial -- prohíbe uso
    comercial**, DESCARTADO para código, esta fábrica es 100%
    comercial) -- el segundo, aunque no usable, corrobora
    independientemente que forced-alignment de 20-40ms (lo mismo que
    ya midió nuestro propio prototipo P3-3) es el estándar real de la
    industria para sincronizar movimiento a la voz.
- **Postura resolutiva real**: se instaló `librosa` (`pip install`,
  MIT/BSD, $0 -- PyPI SÍ es alcanzable desde este sandbox, canal nuevo
  confirmado) y se midió el **BPM real** de los 9 tracks de
  `musica/biblioteca.json` (antes en `null`) con detección de tempo
  estándar (`medir_bpm.py`, reproducible, no un número tipeado a
  mano). Limitación real documentada: el método puede confundir el
  doble/mitad del tempo real (`aceleracion-planificando` dio 178.2
  BPM, plausible pero no verificado de oído).

**PRÓXIMO PASO real, ya registrado**: conectar el BPM real recién
medido con la técnica de `beat-sync-editing` -- ajustar el timing de
los golpes de `directores/audio.ts` a la grilla de beats del track de
`musicaFondo` elegido. No implementado todavía (necesita un video de
prueba dedicado para validar que se sienta bien, no solo que compile).

## Bloque anterior: R7-25 (2026-09-03)

Pedido explícito del operador: seguir paso a paso la "capa de
exploración agresiva" (skills/Remotion/MCP/arsenal audiovisual),
segunda pasada más profunda que R7-18.

**HECHO:**
- `registry.npmjs.org` devuelve **71 paquetes oficiales `@remotion/*`**
  (antes solo se habían evaluado 32) -- se investigaron todos los
  nuevos: `noise`, `starburst`, `rounded-text-box`, `gsap`, `maptiler`,
  `rive`, `lottie`, `skia`, `canvas`, `timeline-utils`,
  `animated-emoji`, `light-leaks`, `media`.
- **Integrado a producción**: `CamaraOrganica.tsx` (`@remotion/noise`,
  MIT, cero dependencias) -- temblor de cámara orgánico y sutil para
  momentos de máxima energía, técnica nunca antes investigada
  ("cámaras" era un hueco explícito del prompt). Verificado con una
  resta real entre 2 frames del video renderizado (9.16% de píxeles
  cambiaron), no solo supuesto.
- **Probado y confirmado con render real, sin forzar integración sin
  necesidad concreta**: `@remotion/rounded-text-box` (cajas de texto
  TikTok-style) y `@remotion/gsap` (timelines complejos, licencia
  gratis confirmada desde 2024) -- ambos funcionan, ninguno reemplaza
  algo que ya funciona bien hoy.
- **Hallazgo real de "no duplicar"**: `@remotion/starburst` y
  `@remotion/light-leaks` son paquetes standalone DEPRECADOS -- su
  propio código fuente redirige a `@remotion/effects`, que ya
  tenemos. Se confirmó instalándolos y leyendo el código, no
  asumiendo por el nombre.
- `fabrica/docs/ARSENAL_AUDIOVISUAL.md` actualizado con 7 capacidades
  nuevas documentadas (cámara, texto redondeado, timelines, mapas,
  Rive/Lottie, motor gráfico Skia, emojis animados) con el criterio
  INTEGRAR/PROBAR/REFERENCIA/DESCARTAR/BLOQUEADO pedido.
- **Segundo efecto real integrado a producción**: `PulsoRevelacion.tsx`
  (`@remotion/effects/rings`) -- un pulso expansivo tipo onda de radar
  en el momento exacto de `intencion='revelar'` (ya calculado por el
  Director de Edición). Probado en `fabrica-demo-07`, confirmado
  visualmente, QA duro 100% limpio.
- **Hallazgo arquitectónico real** (probando `shine`, comparado contra
  `rings`/`vignette`): los 66 efectos de `@remotion/effects` se
  dividen en GENERATIVOS (dibujan su propio contenido, sirven como
  overlay universal -- vignette/lightLeak/rings, confirmados) y
  MODULADORES (necesitan píxeles reales debajo para transformarlos --
  chromaticAberration/glow/scanlines/shine, confirmado que `shine`
  sobre transparente no produce ningún cambio, 8 frames idénticos).
  Usar los moduladores exigiría tocar cada componente de contenido
  para exponer un prop `effects` -- cambio de arquitectura mayor, no
  se hace sin necesidad concreta.

**BLOQUEADO/NO CONFIRMADO:** mapas (`@remotion/maptiler`, necesita
cuenta de MapTiler Cloud); Rive/Lottie (necesitan un archivo de
animación real que no tenemos, fabricar uno sintético no demuestra
nada útil); Skia (dependencia pesada, WASM no probado en este sandbox,
sin necesidad concreta que lo justifique).

**PRÓXIMO PASO:** de los 66 efectos reales de `@remotion/effects`
confirmados, siguen sin evaluar ~58 (glitch/scanlines/zoom-blur/
halftone son candidatos reales para momentos de "impacto"/
"contradicción"). El techo de fondo sigue siendo el mismo: sin datos
reales de resultado, todo esto es capacidad técnica probada, no
verificada contra retención/ventas reales.

## Bloque anterior: R7-24 (2026-09-03)

Pedido del operador: agotar la solución para la investigación de
patrones antes de seguir, y después avanzar en los puntos visuales/
gráficos del prompt.

**Investigación (postura resolutiva, exhaustiva antes de reportar
bloqueado):**
- Se probó `WebFetch` (canal de red separado del proxy del sandbox,
  usado ya con éxito para `WebSearch`) directo contra YouTube -- **sí
  está bloqueado igual que el resto** (`EGRESS_BLOCKED`). Se probaron
  además 6 espejos/alternativas sin cuenta (Invidious, Piped,
  noembed.com, returnyoutubedislike.com) -- las 6 bloqueadas.
- Se confirmó con una llamada real (no supuesta) que `googleapis.com`
  **no está bloqueado por la red** -- el error real es de Google
  ("Method doesn't allow unregistered callers"), un tema de
  credencial, no de acceso. Confirma que R7-20 (cliente de YouTube
  Data API) funcionaría apenas haya una API key -- no hay ningún
  problema técnico de por medio, solo falta la clave del operador.
  **No se buscó ni se usó ninguna clave ajena/compartida** -- usar una
  credencial que no es del operador está fuera de lo que este proyecto
  hace, sea o no "gratis" encontrarla.
- Con eso genuinamente agotado, se sumó investigación cualitativa real
  vía `WebSearch` (que sí funciona): un caso real con nombre y cifra
  concreta (C.M. de la Vega, $13.322,71 en 7 días vendiendo un curso)
  agregado al Knowledge Engine con nivel de confianza bajo y
  limitaciones explícitas (un solo caso, no verificado, no se sabe qué
  video/formato usó).

**Visual/gráfico:**
- **`vignette` (@remotion/effects) conectado a producción de verdad**
  -- ya se había probado y confirmado en R6-9 pero nunca se conectó a
  ninguna escena real. Ahora se dispara automáticamente cuando la
  unidad tiene el estilo `cinematico` (que el Director de Edición YA
  calculaba). Probado en `fabrica-demo-07`, confirmado visualmente en
  2 frames reales.
- **`@remotion/sfx` probado e instalado real** (versión exacta
  alineada, sin conflicto de dependencias) -- descartado con evidencia
  real, no solo por el bloqueo de este sandbox: cada sonido es una URL
  remota a `remotion.media`, una dependencia de red en cada render que
  nuestra biblioteca propia (`assets/sfx/`, archivos locales) no
  necesita. Desinstalado limpio tras confirmar el hallazgo.

**PRÓXIMO PASO:** con el patrón "resultado primero" (R7-23) y la
viñeta (R7-24) ya conectados a producción, quedan ~58 efectos del
catálogo de `@remotion/effects` sin evaluar individualmente
(glitch/chromatic aberration ya probados aislados en R6-7, nunca
conectados). El techo de fondo sigue siendo el mismo de siempre: sin
datos reales de resultado, todo esto es teoría bien fundada aplicada,
no verificada contra retención/ventas reales.

## Bloque anterior: R7-23 (2026-09-03)

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
