# Estado actual de la fábrica — Ronda 4 (Director de Edición)

Informe final pedido explícitamente por el operador al cierre de la
orden maestra de esta ronda ("de combinar componentes a editar
audiovisualmente"). El detalle técnico completo (análisis del video
anterior, arquitectura, decisiones) está en `fabrica/MEJORAS_RONDA4.md`
— este documento es el resumen ejecutivo.

---

## CONSTRUIDO

1. **Director de Edición** (`fabrica/directores/edicion/`) — nueva
   capa entre Director Visual/Audio y Composición. Convierte cada
   unidad narrativa en una **estrategia de edición** (intención,
   energía, densidad visual, estilos combinados, elemento principal/
   secundario, entrada/salida, transición con motivo/función
   registrados, microeventos, relación con la escena anterior). Es
   metadata-driven (como los directores existentes), no reglas
   hardcodeadas por video.
2. **Microeventos** (`microeventos.ts`) — cambios internos dentro de
   una escena, siempre anclados a offsets **reales** de audio, nunca
   inventados. Corrige un bug real medido en `fabrica-demo-04.mp4`
   (ver "RESULTADOS").
3. **6 estilos editoriales combinables** (`estilos.ts`): documental,
   agresivo, data, misterio, storytelling, cinemático. Se combinan
   (`combinarEstilos()`), advirtiendo — nunca bloqueando — mezclas
   atípicas.
4. **Editorial Critic** (`fabrica/qa/critica_editorial.py`) — crítica
   post-render en 6 categorías (repetición/ritmo/visual/narrativa/
   audiovisual/coherencia), 100% heurística, nunca presentada como
   prueba de calidad real.
5. **Ciclo de mejora controlado** (`fabrica/laboratorio/ciclo_mejora.ts`)
   — genera → QA → detecta → propone → corrige lo seguro → reintenta
   (máx. 2 veces) → compara. Corrido de verdad sobre el generador real,
   no un mock.
6. **Anti-repetición por patrón** (`fabrica/memoria/patrones.ts`) —
   evoluciona de "este componente ya se usó" a "este patrón
   (categoría+estilos+golpe) ya se usó", con el mecanismo de recuperar
   prioridad si hay datos reales de que funciona (implementado y
   testeado; sin datos reales todavía para ejercitarlo en producción).

## MEJORADO

- `AntesDespues` (componente ya existente) acepta ahora
  `momentoCambioSeg`/`anchoCambioSeg` opcionales — el cambio de cara ya
  no depende de una fracción fija de la duración total, sino que puede
  anclarse al momento real en que el audio empieza a hablar del
  "después". 100% compatible hacia atrás (sin pasar el prop nuevo, el
  resultado es idéntico al de antes).
- La escena de "pausa"/respiro ya **no requiere una excepción manual**
  en el generador (demo_04 forzaba `golpe: 'ninguno'` a mano) — el
  Director de Audio decide de verdad, y el Director de Edición
  clasifica la unidad como respiro solo a partir de metadata.
- `fabrica/componentes/registro.json`: notas de `antes-despues`
  actualizadas con el hallazgo real y los props nuevos.

## VIDEO DE PRUEBA

`fabrica/salidas/fabrica-demo-05.mp4` (también en
`remotion-spike/src/fabrica_bridge/demo_05.json`) — guion nuevo (Mica,
edición de video, NO reciclado de demo_04), voz real de Qwen3-TTS,
generado por `fabrica/ejemplos/generar_demo_05.ts` llamando de verdad
al pipeline completo (Director Visual → Director de Audio → Director
de Edición → Composición) para las 7 unidades, sin ninguna decisión
tomada a mano fuera de ese pipeline (la única "excepción manual" es la
reformulación de contenido para el componente `ranking` cuando gana esa
categoría — documentado abajo, es un caso de props/semántica distinta
entre componentes de una misma categoría, limitación ya conocida desde
Ronda 2).

## RESULTADOS

- **7 golpes de transición, los 7 distintos entre sí** (ninguno,
  fundido, fogonazo, raya, sacudón, corte, negro) — mejor variedad que
  `fabrica-demo-04` (que ya tenía 5 de 6 distintos).
- **Corrección real y verificada del desfasaje narración↔visual**: en
  `demo_04`, la escena "impacto" cambiaba de cara según una fracción
  fija de la duración total, generando un desfasaje medido de ~1.6s
  entre lo que la voz decía y lo que la pantalla mostraba. En
  `demo_05`, el microevento `se_revela_comparacion` ancla ese cambio al
  offset real del audio — confirmado visualmente: a los 24.5s la
  pantalla sigue en "$340" (correcto, todavía no llegó el momento real)
  y a los 27.5s ya muestra "$6.120 EN TOTAL" (la consecuencia derivada:
  340 × 18), sincronizado con la narración real, no con una fracción
  arbitraria.
- **La anti-repetición entre videos funcionó de verdad, con un efecto
  secundario real e interesante**: al penalizar "silueta" (usado en
  demo_04), el Director Visual eligió "tres-verdades" para la pausa —
  un componente de mayor intensidad. Eso hizo que el Director de
  Edición clasificara esa unidad como `construir_tension` en vez de
  `dejar_respirar` en la corrida intermedia. La Crítica Editorial
  **detectó esto sola**: alertó que "aceleracion" y "pausa" quedaron
  con la misma intención editorial seguidas. En la corrida final (tras
  limpiar el historial contaminado por un intento fallido, ver
  "PROBLEMAS ENCONTRADOS"), la pausa volvió a "silueta" y sí se
  clasificó como respiro real. Este hallazgo queda documentado como
  una interacción real entre dos sistemas, no un bug — ver "PRÓXIMO
  PASO".
- **QA duro**: `ok: true`, sin alertas (sin silencios ni pantallas
  negras no intencionales).
- **QA de composición**: sin problemas duros, 5 alertas heurísticas
  esperadas (3 de presupuesto de texto cerca del límite, 2 de cifras
  "340"/"18" repetidas como texto plano — la limitación ya conocida de
  no distinguir "cifra protagonista" de "mención secundaria").
- **Crítica editorial**: 5 alertas — las 2 cifras ya mencionadas, la
  intención repetida ya explicada arriba, y 2 alertas de "cambio de
  lenguaje visual total" entre escenas consecutivas sin ningún estilo
  en común (`desarrollo`→`aceleracion`, `desarrollo2`→`cierre`) —
  información real para revisión humana sobre si esos saltos de
  lenguaje son intencionales.
- **Comparación conceptual con `fabrica-demo-04.mp4`**: mismo tipo de
  arco narrativo (experimento controlado, ver `MEJORAS_RONDA4.md`),
  pero en `demo_05` cada transición lleva una razón registrada, la
  escena de impacto sincroniza su cambio visual con el audio real en
  vez de una fracción fija, y ninguna escena tuvo que forzarse a mano.

## PROBLEMAS ENCONTRADOS

- **Bug real de props/semántica**: el Director Visual eligió `ranking`
  para la categoría "lista" en la primera corrida; el generador tenía
  hardcodeado el shape de `lista-tachada` (`items`/`queda`), lo que
  hizo crashear el render (`Cannot read properties of undefined
  (reading 'map')`, `plata.tsx:296`). No es solo un problema de forma
  de props — `ranking` y `lista-tachada` son conceptos distintos
  (comparar valores vs. tachar opciones descartadas). Se corrigió con
  una rama que **reformula el contenido** para que tenga sentido real
  en cada caso (ver `generar_demo_05.ts`), no solo adapta la forma.
  Esto reconfirma la limitación ya documentada en `PENDIENTES.md` ítem
  10 (Ronda 2) — ahora con un segundo caso real, esta vez con
  consecuencias visibles (crash), no solo una sorpresa de contenido.
- **Efecto secundario operativo real**: el primer intento de generación
  (el que crasheó en el render) ya había registrado
  `fabrica-demo-05` en `historial_componentes.json`,
  `laboratorio.json` y `patrones_usados.json` — contaminando la
  anti-repetición con un video que nunca se terminó de verdad. Se
  detectó y limpió manualmente antes de la corrida final. **Causa
  raíz**: `generar_demo_05.ts` registra en memoria dentro de la misma
  función que arma el árbol, antes de que el render (un proceso
  separado, Remotion CLI) confirme que el video es válido. Documentado
  como pendiente técnico, ver "PRÓXIMO PASO".
- Ver también "la cifra repetida en texto plano" y "cambio de
  intención por anti-repetición" ya explicados en RESULTADOS — no son
  bugs, son limitaciones/comportamientos reales documentados.

## PENDIENTES

Del pedido de 37 secciones, lo que **no** recibió trabajo real esta
ronda (documentado, no fingido como resuelto):

- **Escenas que evolucionan internamente más allá de microeventos
  puntuales** (sección 6 del pedido original de Ronda 3, retomada acá):
  solo se tradujo UN microevento a una prop real (`momentoCambioSeg` de
  `AntesDespues`). Otros componentes no tienen todavía un punto de
  anclaje real para eventos internos.
- **Motor de composiciones en capas** (secciones 4/6 del pedido): el
  pedido mismo prohibía construirlo como sistema paralelo. Sigue sin
  existir — cada unidad narrativa sigue siendo UN componente, no capas
  independientes combinables.
- **Transiciones "motivadas" nuevas** (sección 12): se agregó la
  metadata de motivo/función/intensidad sobre los golpes YA
  existentes, pero no se construyeron transiciones nuevas basadas en
  continuidad de elemento/color/movimiento compartido entre escenas.
- **B-roll inteligente más allá de lo ya existente**: el resolver de
  assets (`fabrica/assets/resolver.py`) ya cumplía el principio "asset
  faltante > asset incorrecto" desde antes de esta ronda — se reafirmó,
  no se reconstruyó.
- **Registrar en memoria solo tras confirmar el render** (ver
  "PROBLEMAS ENCONTRADOS") — pendiente técnico concreto, no una
  decisión de diseño.
- **Anti-repetición por patrón sin datos reales**: el mecanismo de
  "recuperar prioridad si el resultado real indica que funciona" está
  implementado y testeado con datos sintéticos, pero no hay ningún
  video publicado con métricas reales todavía para ejercitarlo en
  producción.

## INVESTIGACIÓN NECESARIA

- Nada nuevo esta ronda que requiera investigación externa (no se usó
  ninguna librería/servicio nuevo). Los pendientes de investigación de
  rondas anteriores (licencia exacta del modelo Qwen3-TTS en Hugging
  Face, CustomVoice vs. método actual) siguen abiertos en
  `PENDIENTES.md`, sin cambios esta ronda.

## DECISIONES HUMANAS

Ninguna decisión de esta ronda requería aprobación del operador antes
de implementarse (todo lo construido es interno a la fábrica, sin
gasto, sin publicación, sin integración externa nueva). Lo único que
sí necesita tu criterio, cuando tengas tiempo:

1. **Escuchar/mirar `fabrica-demo-05.mp4`** — todo lo técnico ya salió
   limpio; lo que no puedo evaluar yo es cómo se siente el ritmo real,
   si el cambio de lenguaje visual entre "desarrollo" y "aceleración"
   (que la crítica editorial marcó) se percibe como una decisión o como
   un salto brusco.
2. Si te importa más alguno de los pendientes de arriba que otro para
   la próxima ronda, decime cuál y arranco por ahí.

## PRÓXIMO PASO

El más lógico, en orden de impacto/costo:

1. **Arreglar el orden de registro en memoria** (generar → renderizar
   → QA duro → recién ahí `registrarVideo`/`agregarHipotesis`/
   `registrarPatronUsado`) — es un cambio chico y evita que un render
   fallido contamine la anti-repetición de videos futuros. Es el
   pendiente técnico más concreto y de menor esfuerzo de toda la ronda.
2. Extender la traducción microevento→prop a un segundo componente
   real (no un sistema genérico todavía, un segundo caso concreto como
   se hizo con `AntesDespues`) para empezar a acumular evidencia de si
   vale la pena generalizarlo.
3. Cuando haya un primer video publicado con métricas reales, cargar
   ese `resultadoReal` en `laboratorio.json` — ese es el evento que
   activa de verdad el mecanismo de "recuperar prioridad" de
   `fabrica/memoria/patrones.ts`, hoy solo probado con datos sintéticos.
