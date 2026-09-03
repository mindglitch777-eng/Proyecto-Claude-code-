# Decisiones arquitectónicas — tomadas y rechazadas

Orden maestra sección 29: registrar decisiones importantes para que
una sesión futura no las tenga que redescubrir ni repetir un debate ya
cerrado.

## Tomadas

### Director de Retención 2.0 reusa `EstrategiaEdicion.intencion`, no un análisis de guion en lenguaje natural

**Decisión:** el mapa narrativo (`fabrica/directores/retencion/`) se
construye a partir de la `intencion` que ya decidió el Director de
Edición (Ronda 4) para cada unidad, no analizando el texto del guion
con un LLM.

**Por qué:** un análisis de lenguaje natural real requeriría un LLM
corriendo de forma desatendida — violaría la regla de $0 (sección 22)
sin autorización explícita. La intención ya es una clasificación
metadata-driven razonable (enganchar/revelar/cerrar/etc.) que sirve
como proxy honesto de la función narrativa de cada unidad.

**Alternativa rechazada:** un "Director de Retención" que lee el texto
crudo del guion y clasifica su función narrativa con un modelo de
lenguaje. Documentado como posible mejora futura SI el operador
autoriza gasto — no antes.

### El ciclo de mejora opera sobre el árbol de composición, no re-renderiza cada iteración

Ya documentado en `MEJORAS_RONDA4.md` — se reafirma acá porque sigue
vigente en Ronda 5 (el Crítico Audiovisual solo corre QA duro sobre un
mp4 real cuando se le pasa `--mp4`, una sola vez al final, no por
iteración).

### `fabrica/guion/tipos.ts` se recreó como contrato mínimo, no como sistema de ideación

**Decisión:** al encontrar que `fabrica/guion/tipos.ts` estaba
documentado como construido pero la carpeta estaba vacía (ver
`docs/ARQUITECTURA.md`, "qué no funcionó"), se creó el archivo con el
contrato mínimo que el código YA necesitaba (`MecanismoRetencion` como
alias de `IntencionEdicion`), no un sistema de guion/ideación completo.

**Por qué:** construir un sistema de ideación automática real sigue
bloqueado por la regla de $0 (ver `PENDIENTES.md` ítem 5, sin cambios
desde Ronda 1) — no es el momento de resolver ESO solo porque se
encontró un archivo faltante relacionado.

### El Crítico Audiovisual unifica presentación, no duplica análisis

**Decisión:** `fabrica/qa/critico_audiovisual.py` NO reimplementa
ninguna lógica de detección — importa y reutiliza `checks_duros.py`,
`critica_editorial.py` y lee `analisisRetencion` ya calculado por el
generador. Solo re-formatea al esquema Problema/Evidencia/Severidad/
Tipo/Propuesta.

**Por qué:** la orden maestra (sección 5, y repetida en varias
rondas) prohíbe sistemas paralelos que dupliquen lo que ya existe.

## Rechazadas (investigadas, no implementadas)

Ver `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md` para el detalle
completo de cada una:

- **`remotion-superpowers`** (plugin de Claude Code) — descartado por
  alto riesgo de depender de servicios pagos (voces/música/imagen IA)
  para la mayoría de sus comandos.
- **Templates comerciales de Remotion** (RenderComp, etc.) —
  descartados como dependencia (licencias no verificadas, probable
  costo); su valor como inspiración de principios de diseño ya se usó
  conceptualmente, no como código.
- **Twick** (framework alternativo a Remotion) — descartado: cambiar
  de motor de render sería una reescritura completa de la fábrica sin
  ninguna limitación real de Remotion que lo justifique.

## Decisiones tomadas — Ronda 6

- **`@remotion/transitions` integrado de verdad (R6-8)** — decisión:
  solo los golpes 'fundido'/'desliza' (ya conceptualmente continuos)
  usan una transición REAL con superposición; el resto de golpes
  (impacto) siguen con el efecto CSS de siempre, sin forzar un encaje
  que no es. Para que la superposición no se coma audio real, se
  extendió el margen de aire de las escenas elegibles (de 0.25s a
  0.6s, solo cuando tienen audio propio) y se corrigió la matemática
  de offsets en `armar.ts` para que `desdeSeg`/`duracionTotalSeg`
  reflejen la posición REAL post-superposición, no una ficticia. Ver
  `remotion-spike/src/pruebas-r6/README.md` (sección R6-8) para la
  prueba de punta a punta con audio real y evidencia del crossfade.
- **`@remotion/effects` y `@remotion/three` confirmados con render
  real (R6-7)** — WebGL2 funciona en el `headless_shell` sin GPU
  dedicada, resultado que no estaba garantizado. Pendiente de
  confirmar en el runner real de GitHub Actions (usa un binario de
  Chromium distinto), no solo en este sandbox.
- **Knowledge Engine y Hook Engine como módulos separados pero
  cruzados por id (R6-3, R6-4)** — decisión: el Knowledge Engine
  (`fabrica/conocimiento/`) indexa TIPADO lo que ya estaba en
  `research/retencion.md` (nunca inventa afirmaciones nuevas sin pasar
  antes por el documento en prosa con su fuente real); el Hook Engine
  (`fabrica/hooks/`) cita esos items POR ID, con un validador de
  integridad referencial (`validarCatalogo()`) — evita que ambos
  sistemas se desincronicen en silencio. Decisión explícita de NO
  conectar todavía el Hook Engine a la elección automática del
  Director de Edición: es un catálogo consultable, la integración
  automática es un cambio de mayor riesgo sobre lógica que ya funciona
  bien, se deja para una ronda futura.
- **Anti-repetición evolucionada con `hookId` opcional, no un sistema
  paralelo (R6-5)** — decisión: en vez de construir un tracker
  separado para "patrones de hook repetidos", se agregó `hookId?`
  como una dimensión más de la misma clave de `PatronEdicion`
  (`memoria/patrones.ts`) — reutiliza toda la lógica ya testeada de
  "recuperar prioridad si hay `resultadoReal` bueno" sin duplicarla.
  100% retrocompatible (el campo es opcional, confirmado con tests):
  un generador viejo que no pasa `hookId` se comporta exactamente
  igual que antes de R6-5.

## Decision Engine (Ronda 7) — primera decisión formal aplicada

`fabrica/decision_engine/decisiones.ts` (id `prioridad-post-ronda-7`)
aplica la plantilla Opción A/B/C que pide la directiva a la pregunta
real que queda abierta al cerrar Ronda 7: ¿profundizar el motor de
video, expandir el Carousel Engine, o enfocarse en validar el Sales
Engine con datos reales del operador? Comparación completa
(ventajas/desventajas/dependencias/costos/riesgos/potencial/
complejidad) en el código, con tests que confirman que nunca queda una
opción sin ventajas Y desventajas declaradas.

**Recomendación:** validar el Sales Engine con datos reales — es la
única opción que avanza el objetivo real del proyecto (CLAUDE.md, Fase
1: "1 producto digital vendible en Hotmart"), pero requiere información
que solo el operador puede dar (audiencia, problema, oferta real) —
registrado como pregunta abierta en `PENDIENTES.md`. Mientras se
espera esa respuesta, el trabajo autónomo de mayor impacto es expandir
el Carousel Engine (opción B), no seguir profundizando el motor de
video (opción A) — ninguna mejora técnica de video genera una venta
por sí sola.

## Seguimiento de la decisión Ronda 7: opción B ejecutada (R7-14)

Mientras se espera la respuesta del operador a `PENDIENTES.md` ítem 15
(opción C, bloqueada), se ejecutó la opción B recomendada: el Carousel
Engine ahora tiene un generador completo (`fabrica/carrusel/generar.ts`),
no solo un componente aislado. Genera un carrusel real (6-10 slides)
a partir de UNA fuente del Knowledge Engine sin inventar contenido, y
se probó de punta a punta generando y renderizando 7 slides reales
desde el item `brunson-value-ladder` (`fabrica/salidas/carrusel_001/`).

## Pendientes de decisión (requieren probar antes de decidir)

- `@remotion/install-whisper-cpp` + `@remotion/captions` — clasificados
  como PROBAR, no se instalaron todavía (ver
  `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md`).
