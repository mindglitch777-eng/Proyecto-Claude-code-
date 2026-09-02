# Ronda 3 — Calidad audiovisual (dirección real, no solo producción)

Origen: el operador mostró `fabrica-demo-03.mp4` a ChatGPT, recibió una
crítica detallada (14 problemas concretos) y pasó un pedido de 24
secciones ("PROMPT — ITERACIÓN DE CALIDAD VISUAL DE LA NUEVA FÁBRICA")
con la instrucción explícita de NO rediseñar la arquitectura, NO romper
lo que funciona, y evolucionar de "un sistema que puede producir un
video" a "un sistema que puede DIRIGIR un video".

Este documento es el balance honesto de esa ronda: qué se hizo de
verdad, qué se decidió no tocar y por qué, y qué queda abierto. No
reemplaza `PENDIENTES.md` (formato/laboratorio) — lo complementa desde
la perspectiva de "qué pidió esta ronda específicamente".

---

## MEJORAS IMPLEMENTADAS

### 1. Variedad real de golpes (transiciones) + anti-repetición

**Problema detectado (sección 2 del pedido, y hallazgo directo en el
video ya entregado):** `GOLPE_POR_NIVEL` en `directores/audio.ts` era
un mapa fijo 1:1 (nivel de intensidad → un único golpe). De los 9 tipos
de golpe reales que ya existían en `golpes.tsx` (`fogonazo`, `sacudon`,
`corte`, `negro`, `raya`, `fundido`, `desliza`, `iris`, `cortina`), 3
(`desliza`, `iris`, `cortina`) eran mecánicamente inalcanzables — nunca
se elegían, sin importar el guion. Esta es la causa raíz de la
sensación de "la pantalla desaparece → aparece la nueva, siempre igual"
que señaló el operador.

**Solución:** `GOLPES_POR_NIVEL` ahora mapea cada nivel a una LISTA de
golpes candidatos, y `elegirGolpe(nivel, evitarGolpes)` elige el
primero que no esté en la lista de "evitar" (con fallback a repetir si
se agotan las opciones, nunca lanza error). `decidirParaUnidad()` ahora
acepta `evitarGolpes?: TipoGolpe[]`, pasado por el generador con el
historial de golpes ya usados en el video. Backward-compatible: sin
`evitarGolpes`, el primer candidato de cada lista es idéntico al golpe
fijo anterior — todos los tests preexistentes siguieron pasando sin
modificarlos.

**Prueba real:** en `fabrica-demo-04`, los 6 golpes usados fueron
`fundido, fogonazo, sacudon, corte, negro` — cinco tipos distintos, cero
repeticiones consecutivas (antes del cambio, con el mismo guion, varias
habrían coincidido).

### 2. Anticipo antes de un golpe fuerte

**Problema detectado (crítica textual del operador: "la pantalla
naranja final funciona como impacto pero es demasiado abrupta... el
cambio alrededor de los ~36,5s es especialmente fuerte... hay que
conservarla pero hacer que el sistema pueda preparar ese impacto"):**
los golpes fuertes (`fogonazo`, `sacudon`, `negro`) ocurrían sin ningún
aviso visual previo.

**Solución:** se reutilizó el componente `Pulso` (ya existía en
`golpes.tsx`, sin usar en ningún lado de la fábrica) para construir
`Anticipo` — un overlay de pulsos acelerados (mapeo `Math.sqrt(progreso)`,
no lineal: los pulsos se aceleran de verdad, no se repiten a ritmo
constante) en los últimos `ventanaSeg` (0.5s por defecto) de una
escena. `FabricaVideo.tsx` lo activa automáticamente cuando la escena
SIGUIENTE tiene un golpe en `GOLPES_FUERTES = ['fogonazo', 'sacudon',
'negro']` — no requiere que el generador haga nada especial.

**Corrección durante la verificación:** la primera hipótesis fue que el
corte fuerte de `fabrica-demo-03` a los ~36.5s era un `sacudon`; al
extraer frames a 36.1s/36.55s se confirmó visualmente que en realidad
era el `negro` (blackout total) entre el payoff y el cierre. Se corrigió
`GOLPES_FUERTES` para incluir `'negro'` — la verificación con frames
reales evitó dejar el bug real sin cubrir.

**Prueba real (no solo "compila"):** en `fabrica-demo-04`, análisis de
luminancia (`ffprobe signalstats`) en la ventana previa al golpe `negro`
del cierre mostró oscilación real y creciente: `13.8 → 42.4 → 14.8 →
44.2 → 31.5 → ... → 68.0 → 56.1 → ... → 0` (blackout). Los pulsos
existen de verdad en el frame renderizado, no solo en el código fuente.

### 3. Tratamiento explícito de datos repetidos (no repetir una cifra automáticamente)

**Problema detectado (sección 5, con ejemplo concreto del operador: "el
número '2.847' aparece más de una vez de la misma manera"):** no existía
ningún mecanismo para decidir qué hacer cuando un valor ya mostrado
vuelve a aparecer en el guion.

**Solución:** `fabrica/composicion/repeticion_datos.ts` (nuevo).
`decidirTratamientoValor({valor, tipoDato, unidadActual, yaEstablecidos,
derivarConsecuencia?})` devuelve una de tres decisiones:
- `reutilizar` — primera aparición, no hay nada que decidir.
- `consecuencia` — ya se estableció antes; si se pasó una función
  `derivarConsecuencia`, se calcula y se devuelve un valor DERIVADO
  real (no el mismo número).
- `omitir_destaque` — ya se estableció y no hay forma de derivar una
  consecuencia con sentido; señal para el generador de no destacarlo
  de nuevo.

`tipoDato` (`dinero | cantidad | porcentaje | anio | fecha | ranking |
otro`) evita falsos positivos: el mismo número con un tipo de dato
DISTINTO (ej. "$47" de precio vs. "47" de cantidad de clientes) no
cuenta como la misma repetición. `registrarValorEstablecido()` es puro
(no muta la lista de entrada).

**Prueba real:** en `fabrica-demo-04`, "$47" (dinero) se establece en el
hook. En la escena de impacto, en vez de repetir "$47" como cifra
protagonista, el sistema calculó y mostró **"$2.209 EN TOTAL"** ($47 ×
47 clientes) como el número grande y destacado — confirmado visualmente
en el frame renderizado (ver "RESULTADO DEL NUEVO VIDEO" abajo). El
"47" original aparece solo como texto secundario de rótulo ("47
clientes esa semana"), nunca como el número protagonista.

### 4. QA creativo (heurísticas de ritmo/repetición/monotonía)

**Problema detectado (sección 18, "QA creativo"):** el QA existente
(`checks_duros.py`, `checks_composicion.py`) verificaba solo cosas
técnicas (assets faltantes, duración, presupuesto de texto) — nada
sobre la calidad de la DIRECCIÓN.

**Solución:** 4 funciones nuevas en `checks_composicion.py`, todas como
`alertas` (heurísticas, nunca `problemas` duros — nunca se afirma que
"esto es viralidad" ni se calcula un puntaje falso):
- `verificar_categoria_repetida_consecutiva` — dos escenas seguidas de
  la misma categoría de componente (la fórmula texto→número→gráfico
  repetitiva que señaló el operador).
- `verificar_golpe_repetido_consecutivo` — dos escenas seguidas con el
  mismo golpe de transición.
- `verificar_intensidad_plana` — todo el video (3+ escenas) usando un
  solo tipo de golpe, sin variación de ritmo real.
- `verificar_cifra_repetida_en_texto` — un número de 2+ dígitos
  apareciendo en el texto de 2+ escenas distintas (la red de seguridad
  que detecta si `repeticion_datos.ts` no se usó donde debía).

**Validado contra datos reales, no solo fixtures sintéticos:** corrido
contra el árbol YA ENTREGADO de `fabrica-demo-03`, detectó exactamente
"la cifra '2.847' aparece en el texto de 2 escenas distintas (hook,
payoff)" — el mismo problema que el operador señaló a mano — con cero
falsos positivos en categoría/golpe (demo_03 ya tenía variedad ahí).

---

## PROBLEMAS DETECTADOS (durante esta ronda, no antes)

- **La detección de "cifra repetida en texto" es sobre el texto crudo,
  no sobre "qué número es el protagonista visual".** En
  `fabrica-demo-04`, el QA alertó que "47" aparece en 3 escenas (hook,
  desarrollo, impacto) — técnicamente cierto (aparece como palabra en
  los props), pero en la escena de impacto el número protagonista real
  (grande, en negro sobre naranja) es "$2.209", y "47" solo aparece dos
  veces como texto secundario de acompañamiento ("47 clientes esa
  semana", "47 veces en una semana"). El módulo `repeticion_datos.ts`
  SÍ tomó la decisión correcta (mostrar la consecuencia derivada como
  cifra protagonista); el QA de texto no puede (todavía) distinguir
  "número protagonista" de "número mencionado de paso en una oración".
  Documentado como limitación conocida, no como bug — es exactamente
  el tipo de heurística con falsos positivos que el pedido original
  aceptó a cambio de no requerir OCR/render real.
- Las 3 alertas de "texto cerca del presupuesto de capacidadTexto"
  (hook, impacto, cierre, todas 1-34 caracteres arriba del límite
  heurístico) no se investigaron visualmente una por una más allá de
  los frames ya inspeccionados — los que se vieron (hook, impacto,
  cierre) se leen completos en pantalla sin corte, pero el presupuesto
  es deliberadamente conservador (ver docstring de
  `checks_composicion.py`) y no mide píxeles reales.

## DECISIONES TOMADAS

- **No se construyó un segundo Director Visual ni un motor de
  "composiciones" en capas** (sección 4 del pedido). El pedido mismo
  advertía explícitamente contra esto ("NO crear un segundo Director
  Visual ni un sistema de composición paralelo"). Se interpretó que
  construir ese motor de verdad — capas independientes tipo
  cifra+símbolo+movimiento+SFX combinables por metadata — es un cambio
  de arquitectura real, no una iteración de calidad sobre lo existente,
  y por lo tanto queda fuera de esta ronda. Ver "PROBLEMAS QUE SIGUEN
  ABIERTOS".
- **No se tocaron los springs/easings de los 26 componentes
  existentes** (secciones 7-8, microanimaciones/fluidez). Cambiar la
  curva de animación de un componente ya probado y ya usado en 20+
  videos entregados es un riesgo real de regresión visual silenciosa
  (nada en el QA automático detecta "esto se mueve peor que antes").
  Se prefirió invertir el tiempo en mecanismos NUEVOS con impacto
  medible (Anticipo, golpes variados, repetición de datos) en vez de
  retocar por intuición docenas de componentes que ya funcionan.
- **La cifra derivada se calculó con una función explícita
  (`derivarConsecuencia: precio => precio * 47`) escrita a mano en el
  generador, no inferida automáticamente del guion.** Inferir
  "cuál es la consecuencia lógica de este número" a partir de texto
  libre es un problema de lenguaje natural, no de composición
  determinista — se mantiene la regla de $0 (nada de LLM pago corriendo
  desatendido) y de "no fingir inteligencia que no existe".
- **Se generó un guion nuevo (`demo_04`) en vez de reusar `demo_03`**
  para poder probar de verdad la anti-repetición de golpes y el
  tratamiento de datos repetidos con voz real nueva — reusar audio
  viejo habría probado el código pero no el resultado percibido.

## COMPONENTES MODIFICADOS

- `fabrica/directores/audio.ts` — `GOLPES_POR_NIVEL` (listas en vez de
  mapeo fijo), `elegirGolpe()`, `evitarGolpes?` en
  `decidirParaUnidad()`.
- `remotion-spike/src/escenas/golpes.tsx` — nuevo componente
  `Anticipo` (reutiliza el patrón de `Pulso`, antes sin usar).
- `remotion-spike/src/fabrica_bridge/FabricaVideo.tsx` — constante
  `GOLPES_FUERTES`, lógica para activar `Anticipo` automáticamente en
  la escena previa a un golpe fuerte.
- `fabrica/qa/checks_composicion.py` — 4 funciones nuevas de QA
  creativo (todas heurísticas/alertas).

## NUEVAS CAPACIDADES

- `fabrica/composicion/repeticion_datos.ts` — módulo nuevo,
  `decidirTratamientoValor()` + `registrarValorEstablecido()`.
- `fabrica/ejemplos/generar_demo_04.ts` — generador de referencia que
  usa TODO lo anterior junto en un video real (patrón para futuros
  guiones: cómo pasar `evitarGolpes`, cómo consultar
  `decidirTratamientoValor` antes de mostrar una cifra que podría
  repetirse).

## TESTS

Todos corridos con `npm run test-todo` dentro de `fabrica/`, suite
completa verde (validar-registro, director-visual, director-audio,
memoria, composicion, adaptadores, **repeticion-datos** [nuevo],
normalizador, resolver-assets, resolver-musica, qa, **qa-composicion**
[ampliado]) — sin regresiones sobre lo ya existente. Tests nuevos:

- `fabrica/directores/test_audio.ts` — variedad de golpes con
  `evitarGolpes`, compatibilidad hacia atrás sin el parámetro,
  fallback a repetir cuando se agotan las opciones.
- `fabrica/composicion/test_repeticion_datos.ts` — primera aparición,
  repetición sin consecuencia, repetición CON consecuencia derivada
  (verificado `2847*9=25623`), mismo número con tipoDato distinto (NO
  es repetición), inmutabilidad de `registrarValorEstablecido`, cadena
  completa (establecer → repetir con consecuencia → re-establecer el
  valor derivado → repetir de nuevo → omitir).
- `fabrica/qa/test_checks_composicion.py` — 8 tests nuevos para las 4
  funciones de QA creativo, incluyendo el caso real de "2.847" contra
  el árbol ya entregado de `fabrica-demo-03`.

## RESULTADO DEL NUEVO VIDEO (`fabrica-demo-04.mp4`)

Guion nuevo (NO reciclado): hook ($47, calma) → desarrollo (timeline,
3→19→47 clientes) → aceleración (cifra, gráfico de barras 3→47) →
pausa real (sin golpe, "el precio nunca cambió") → impacto/revelación
(comparación, $47 vs. **$2.209 derivado**) → nuevo desarrollo (lista
tachada) → cierre (con Anticipo antes del golpe `negro`). Voz real de
Qwen3-TTS (voz clonada librivox-11, misma que producción), 12 líneas,
duración total 40.98s.

Componentes elegidos por el Director Visual real (no hardcodeado):
`punch, cronologia, contador, silueta, antes-despues, lista-tachada,
punch`. Golpes elegidos por el Director de Audio real: `ninguno,
fundido, fogonazo, sacudon, corte, negro` — 5 tipos distintos, cero
repeticiones consecutivas.

**QA duro** (`checks_duros.py`): `ok: true`, sin alertas, sin
silencios/pantallas negras sospechosas (el blackout del golpe `negro`
es intencional y corto, no lo confundió con un error).

**QA de composición** (`checks_composicion.py`): `ok: true` (sin
problemas duros), 4 alertas heurísticas esperadas (3 de
capacidad-de-texto cerca del límite, 1 de "47" repetido en texto plano
— ver "PROBLEMAS DETECTADOS" arriba).

**Verificación visual/analítica real** (no solo "el código corrió"):
- Frame del hook: video de fondo + texto legible, sin corte.
- Frame de aceleración: contador animando 3→47 en pleno conteo (34 en
  el frame capturado — comportamiento esperado de una animación, no un
  bug).
- Frame de impacto (lado derecho de antes-después): **"$2.209 EN
  TOTAL"** en grande, "47 clientes esa semana" en texto secundario
  pequeño — confirma visualmente que la decisión de
  `repeticion_datos.ts` se refleja en lo que de verdad se ve en
  pantalla, no solo en el log de la consola.
- Análisis de luminancia (`ffprobe signalstats`) en la ventana previa
  al golpe `negro` del cierre: oscilación real y creciente (13.8 → 68.0
  antes del blackout total), prueba de que `Anticipo` funciona en el
  render final, no solo en el componente aislado.

**Comparación conceptual con `fabrica-demo-03.mp4`:** demo_03 usaba
golpes de un set fijo y sin variar (mapeo 1:1 por intensidad), repetía
"2.847" tal cual en dos escenas sin ningún tratamiento, y el corte
fuerte final llegaba sin ningún aviso. demo_04, con un guion de
complejidad comparable, usa 5 golpes distintos sin repetición
consecutiva, resuelve su valor repetido con una consecuencia derivada
real y prepara su corte fuerte final con un anticipo medible. Esto es
exactamente lo que la ronda pidió arreglar, con evidencia (no solo
código) de que ahora pasa distinto.

## PROBLEMAS QUE SIGUEN ABIERTOS

Estas son las secciones del pedido de 24 puntos que **no** recibieron
trabajo real esta ronda — quedan documentadas en vez de fingirse
resueltas, como pidió el operador explícitamente:

- **Sección 3 — Escenas que evolucionan internamente.** Las escenas
  siguen teniendo el patrón entra/está/sale de cada componente
  individual; no hay un mecanismo de la fábrica que le pida a una
  escena "cambiar de estado" a mitad de camino (más allá de lo que ya
  hace el propio componente por diseño, ej. el conteo de `contador`).
- **Sección 4 — Composiciones en capas (no solo componentes).** Como
  se explicó en "DECISIONES TOMADAS", esto requeriría un motor de
  capas combinables (cifra+símbolo+movimiento+SFX) que el pedido mismo
  prohibió construir como sistema paralelo. Sigue sin existir; seguir
  eligiendo UN componente por unidad narrativa es la arquitectura
  actual.
- **Sección 6 — Jerarquía visual más allá de lo que cada componente ya
  hace por su cuenta.** No hay un mecanismo central que decida "este
  elemento pesa más que ese otro" entre componentes distintos.
- **Secciones 7-8 — Retrofit de microanimación/fluidez en los 26
  componentes existentes.** Deliberadamente no tocado esta ronda (ver
  "DECISIONES TOMADAS").
- **Sección 13 — Continuidad visual entre escenas (morphing de
  elementos compartidos).** No existe ningún mecanismo que lleve un
  elemento visual de una escena a la siguiente de forma continua.
- **Sección 15 — Director de Retención con etiquetas cualitativas**
  ("acá hay una pregunta abierta", "acá una escalada"). El Director de
  Audio decide golpe/volumen por intensidad numérica; no hay una capa
  de etiquetas heurísticas de retención narrativa.

## COSAS QUE NO PUDE VERIFICAR

- Cómo SUENA el video nuevo (ritmo real al escuchar la voz, si la
  pausa de la escena "pausa" se siente como un respiro real o como un
  bache) — igual que en rondas anteriores, esto requiere oído humano,
  no métricas.
- Si las 3 alertas de "texto cerca del presupuesto" representan un
  problema visual real en TODOS los dispositivos/resoluciones de
  reproducción (se verificó visualmente en los frames extraídos a
  1080x1920, pero no en, por ejemplo, una pantalla más chica con
  reproductor con overlays de UI).
- Si la "sensación de dirección" percibida por un espectador real
  mejoró de verdad entre demo_03 y demo_04 — la comparación de arriba
  es conceptual/técnica (qué mecanismos están presentes/ausentes en
  cada uno), no un test de usuario.

## INVESTIGACIONES PENDIENTES

- Diseño de un "adaptador de jerarquía visual" que centralice pesos
  relativos entre componentes de una misma escena (sección 6) sin
  reescribir cada componente individualmente.
- Diseño de un mecanismo liviano de "continuidad visual" (sección 13)
  que no requiera un sistema de capas completo — por ejemplo, pasar un
  color/posición ancla de la escena anterior a la siguiente como hint,
  sin forzar morphing real.
- Cómo escribir un QA de "cifra protagonista vs. mención textual
  incidental" sin necesitar OCR/render real (ver "PROBLEMAS
  DETECTADOS") — posible pista: marcar en el árbol de composición qué
  prop específico es "el número destacado" de cada componente, para
  que el QA lo lea directo del árbol en vez de adivinar con regex sobre
  todo el texto.
