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

## Pendientes de decisión (requieren probar antes de decidir)

- `@remotion/install-whisper-cpp` + `@remotion/captions` — clasificados
  como PROBAR, no se instalaron todavía (ver
  `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md`).
