# Auditoría: Prompt Maestro 2 vs. estado real de la fábrica

Mapeo directo, sin teoría — qué de las 38 secciones del prompt ya
existe (con qué nombre real en el código), qué está parcial, qué
falta. Base para decidir dónde poner el esfuerzo de esta ronda.

| Sección del prompt | Nombre real en la fábrica | Estado |
|---|---|---|
| 5. Retention Engine | `fabrica/directores/retencion/` (Ronda 5) | **Existe.** Mapa narrativo + 6 alertas de arco. |
| 7. Editing Engine | `fabrica/directores/edicion/` (Ronda 4) | **Existe.** Intención/energía/estilos/microeventos/transición motivada. |
| 8. Ritmo multidimensional | `EstrategiaEdicion.energia` + microeventos | **Parcial.** Cubre energía por unidad, no ritmo verbal/sonoro/espacial por separado. |
| 10. Sistema de transiciones | `directores/audio.ts` (golpes) + `EstrategiaTransicion` (motivo/función) | **Parcial.** Golpes con variedad+razón sí; transiciones con superposición real (crossfade) NO — ver `skills/INVESTIGACION_HERRAMIENTAS.md`, `@remotion/transitions` sigue en PROBAR. |
| 13. Information Emphasis Engine | `composicion/repeticion_datos.ts` + `composicion/adaptadores.ts` | **Existe, acotado.** Decide reutilizar/derivar/omitir una cifra repetida; no cubre TODAS las categorías de información (nombres, fechas, conceptos) todavía. |
| 17. Anti-repetición inteligente | `memoria/patrones.ts` (Ronda 5) | **Existe.** Categoría+estilos+golpe, con mecanismo de recuperar prioridad vía `resultadoReal`. Falta: hooks/estructuras como parte del patrón (esta ronda, ítem R6-5). |
| 18-19. Style Engine + Style Mixer | `directores/edicion/estilos.ts` (Ronda 4) | **Existe.** 6 estilos combinables, `combinarEstilos()` ya hace exactamente lo pedido en la sección 19. |
| 20-21. Experiment Engine + A/B | `memoria/tipos.ts` `ExperimentoAB` (Ronda 5) | **Existe, sin ejecutar.** Contrato completo + `experimento_001` diseñado; falta generar variantes reales (infraestructura para eso: pendiente). |
| 22. Research Engine | `fabrica/research/` (Ronda 5) | **Existe, primera versión.** Un documento (retención); falta cubrir más categorías (edición, motion design, etc.) — ver Knowledge Engine abajo. |
| 24. Quality Intelligence | `checks_duros.py` (técnico) + `critica_editorial.py`/`critico_audiovisual.py` (creativo) | **Existe.** Separación estricta ya implementada desde antes de este prompt. |
| 27. Memoria permanente | `fabrica/docs/`, `fabrica/decisions/`, `PENDIENTES.md` (Ronda 5) | **Existe.** |
| 28. Skills/herramientas externas | `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md` (Ronda 5) | **Existe, primera pasada.** Esta ronda se extiende con "Agent Skills" de Remotion (ítem R6-2). |

## Lo que FALTA de verdad (no existe todavía, ni parcial)

- **3-4. Knowledge Engine formal** — hoy `research/retencion.md` es
  prosa con citas, NO una estructura tipada consultable por código
  (nombre/categoría/evidencia/tipo/compatibilidades como campos
  reales). Esta ronda: **R6-3**.
- **6. Hook Engine** — no existe ninguna biblioteca de patrones de
  hook; el generador de cada demo escribe el texto del hook a mano.
  Esta ronda: **R6-4**.
- **9. Cinematic Director** — no existe. Requeriría controlar
  "cámara"/profundidad/iluminación simulada sobre componentes 2D de
  Remotion — es un diseño grande, no trivial. **Pendiente,
  documentado, no se arranca esta ronda** (ver "NO SE IMPLEMENTA"
  abajo).
- **11-12. Motion Design Engine / Kinetic Text Engine formales** — hoy
  cada componente tiene su propio easing/spring hardcodeado; no existe
  una capa central que decida esos parámetros por metadata. **Pendiente.**
- **23. Creative Director** (coordinador de todos los directores) —
  no existe. Hoy el generador (`generar_demo_XX.ts`) hace ese trabajo
  de coordinación a mano, llamando a cada Director en orden.
  **Pendiente, alto riesgo de sobreingeniería si se construye antes de
  tener 2-3 conflictos reales entre directores que resolver.**
- **25. Video Intelligence** (representación estructurada de un video
  completo, para analizar muchos después) — parcialmente cubierto por
  el árbol de composición + `analisisRetencion` ya serializados, pero
  no hay un formato unificado "IDEA→TEMA→ÁNGULO→...". **Pendiente.**
- **26. Learning Engine** — imposible construir con sentido sin datos
  reales de publicaciones (cero videos publicados todavía). **Bloqueado
  por falta de datos, no por falta de código.**

## NO SE IMPLEMENTA esta ronda (con motivo)

- **Cinematic Director completo**: la orden pide "profundidad,
  cámara, iluminación simulada" — construir esto de verdad sobre
  Remotion (que es 2D/DOM, sin motor 3D real) requeriría o bien
  simular con CSS transforms/blur/scale (posible pero ES un diseño
  nuevo real que merece su propia ronda) o integrar algo como
  `@remotion/three` (no investigado todavía). Se documenta como
  próxima prioridad de investigación, no se improvisa una versión
  débil solo para decir que existe.
- **Creative Director coordinador**: sección 23 pide que resuelva
  conflictos entre directores (ej. "retención pide velocidad,
  contenido pide claridad"). Hoy no hay ningún conflicto real
  registrado entre los directores existentes -- construir un
  resolutor de conflictos hipotéticos es la sobreingeniería que la
  sección 30 del prompt prohíbe explícitamente ("no crear
  infraestructura vacía... no crear simulaciones falsas").
