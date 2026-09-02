# Auditoría: Prompt Maestro 2 vs. estado real de la fábrica

Mapeo directo, sin teoría — qué de las 38 secciones del prompt ya
existe (con qué nombre real en el código), qué está parcial, qué
falta. Base para decidir dónde poner el esfuerzo de esta ronda.

| Sección del prompt | Nombre real en la fábrica | Estado |
|---|---|---|
| 5. Retention Engine | `fabrica/directores/retencion/` (Ronda 5) | **Existe.** Mapa narrativo + 6 alertas de arco. |
| 7. Editing Engine | `fabrica/directores/edicion/` (Ronda 4) | **Existe.** Intención/energía/estilos/microeventos/transición motivada. |
| 8. Ritmo multidimensional | `EstrategiaEdicion.energia` + microeventos | **Parcial.** Cubre energía por unidad, no ritmo verbal/sonoro/espacial por separado. |
| 10. Sistema de transiciones | `directores/audio.ts` (golpes) + `EstrategiaTransicion` (motivo/función) + `@remotion/transitions` real (R6-8) | **Existe.** Golpes con variedad+razón, MÁS superposición real (crossfade) para los golpes 'fundido'/'desliza' — probado de punta a punta con audio real, ver `remotion-spike/src/pruebas-r6/README.md`. |
| 13. Information Emphasis Engine | `composicion/repeticion_datos.ts` + `composicion/adaptadores.ts` + `dibujo/enfasis.tsx` (`@remotion/rough-notation`, R6-11) | **Existe, ampliado.** Decide reutilizar/derivar/omitir una cifra repetida, MÁS una primitiva real para destacar visualmente (círculo/subrayado/resaltado dibujado a mano) conectada a `Contador`. No cubre TODAS las categorías de información (nombres, fechas, conceptos) todavía. |
| 17. Anti-repetición inteligente | `memoria/patrones.ts` (Ronda 5) | **Existe, completo.** Categoría+estilos+golpe+hookId (R6-5), con mecanismo de recuperar prioridad vía `resultadoReal` — el Hook Engine (R6-4) ya participa de la misma clave. |
| 18-19. Style Engine + Style Mixer | `directores/edicion/estilos.ts` (Ronda 4) | **Existe.** 6 estilos combinables, `combinarEstilos()` ya hace exactamente lo pedido en la sección 19. |
| 20-21. Experiment Engine + A/B | `memoria/tipos.ts` `ExperimentoAB` (Ronda 5) | **Existe, sin ejecutar.** Contrato completo + `experimento_001` diseñado; falta generar variantes reales (infraestructura para eso: pendiente). |
| 22. Research Engine | `fabrica/research/` (Ronda 5) | **Existe, primera versión.** Un documento (retención); falta cubrir más categorías (edición, motion design, etc.) — ver Knowledge Engine abajo. |
| 24. Quality Intelligence | `checks_duros.py` (técnico) + `critica_editorial.py`/`critico_audiovisual.py` (creativo) | **Existe.** Separación estricta ya implementada desde antes de este prompt. |
| 27. Memoria permanente | `fabrica/docs/`, `fabrica/decisions/`, `PENDIENTES.md` (Ronda 5) | **Existe.** |
| 28. Skills/herramientas externas | `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md` (Ronda 5) | **Existe, primera pasada.** Esta ronda se extiende con "Agent Skills" de Remotion (ítem R6-2). |

## Resuelto esta ronda (estaba en "FALTA" al escribir este documento)

- **3-4. Knowledge Engine formal** — **R6-3, hecho.**
  `fabrica/conocimiento/` (`tipos.ts`+`base.ts`+`consultar.ts`):
  índice tipado y consultable (por id/tema/tag/nivel) de la misma
  investigación de `research/retencion.md`, con `NIVELES_CONFIRMADOS`
  para que el código (no solo un humano leyendo markdown) pueda
  filtrar evidencia real de heurística/anecdótico. Testeado
  (`test_conocimiento.ts`).
- **6. Hook Engine** — **R6-4, hecho.** `fabrica/hooks/`
  (`tipos.ts`+`catalogo.ts`+`consultar.ts`): 4 patrones de apertura
  combinables (contexto-parcial, loop-abierto, cifra-inmediata,
  pregunta-directa), cada uno citando por id su respaldo real contra
  el Knowledge Engine (o marcado explícitamente `sin_evidencia_formal`
  si no lo tiene) — integridad referencial verificada con
  `validarCatalogo()` + tests. Pendiente honesto: el catálogo es
  consultable (`patronesCompatibles(intencion)`) pero el Director de
  Edición todavía NO lo consulta automáticamente al elegir un hook —
  esa integración queda para una ronda futura, es un cambio de mayor
  riesgo sobre lógica ya funcionando.

## Lo que FALTA de verdad (no existe todavía, ni parcial)

- **9. Cinematic Director** — no existe como capa de COORDINACIÓN.
  R6-10 sí agregó el primer componente 3D real (`Torre3D`,
  `@remotion/three`), pero eso es un componente puntual en el
  registro, no un director que decida cámara/profundidad/iluminación
  de forma centralizada. **Pendiente, documentado, no se arranca esta
  ronda** (ver "NO SE IMPLEMENTA" abajo) — construirlo antes de tener
  2-3 componentes 3D reales más sería la misma sobreingeniería que ya
  se evitó con el Creative Director.
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
