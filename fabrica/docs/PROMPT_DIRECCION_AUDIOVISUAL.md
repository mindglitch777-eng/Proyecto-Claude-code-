# Prompt vivo — "Que la fábrica PIENSE la edición" (evolución de dirección audiovisual)

Mismo patrón que los 3 prompts anteriores guardados en `fabrica/docs/`
-- texto completo guardado antes de tocar código, tabla de estado
actualizada incrementalmente.

## El prompt, resumen fiel (texto completo pegado 2026-09-03; ver
git blame de este archivo para el original íntegro si hace falta)

Objetivo: pasar de "generar un video correctamente" a "dirigir
audiovisualmente" -- que el sistema decida CUÁNDO/POR QUÉ/QUÉ/CUÁNTO
cambiar, no solo texto→componente. Diagnóstico dado sobre
`fabrica-demo-08` (38.4s): cambios estructurales fuertes solo en
~15.7s/21.7s/30.4s/34.3s -- segmentos largos sin variación,
narrativamente predecible; hook con poco impacto audiovisual;
desarrollo dependiente de texto+timeline; cifras con demasiado
protagonismo; poca variedad informe/metáfora/objeto/gráfico/interfaz/
texto/movimiento; edición sin interpretar suficiente la intención de
cada frase.

23 secciones pidiendo: intención narrativa por unidad (HOOK/REVELACIÓN/
CONTRADICCIÓN/PREGUNTA/ESCALADA/PRUEBA/COMPARACIÓN/EXPLICACIÓN/TENSIÓN/
GIRO/PAYOFF/CTA); un "Rhythm Engine" con curva de energía real
(aceleración/desaceleración/pausa/silencio/golpe/clímax/resolución);
sistema de cambios visuales con WHY/WHAT/INTENSITY/TIMING explícitos;
cambios repentinos deliberados (no solo transiciones ordenadas); Hook
Engine v2 (verbal+visual+información+curiosidad); reducir dependencia
de texto grande+número grande; biblioteca de lenguaje visual de
negocios (ventas/clientes/dinero/crecimiento/etc. con varias
representaciones); contraste de energía deliberado (alta→baja→alta);
audio reaccionando a eventos narrativos, no como capa aparte; familias
de transición (CUT/SMASH CUT/MATCH/WHIP/ZOOM/MASK/SLIDE/GLITCH/SCALE/
COLOR/LIGHT/MORPH/WIPE/NONE); Anti-Predictability Engine (repetición de
estructura/transición/posición/tipo de entrada/patrón de texto/ritmo/
color-evento/metáfora, no solo componentId); Visual Density Engine
(MINIMAL/LOW/MEDIUM/HIGH/MAXIMUM variando en el tiempo); Payoff Engine
(la promesa del hook debe pagarse); CTA integrado a la narrativa;
Crítico Audiovisual v2 (hook strength/visual variety/pacing/energy
curve/predictability/number overuse/visual repetition/transition
variety/narrative alignment/payoff strength/CTA integration, separando
SIEMPRE medido/deducido/heurístico/hipótesis); self-correction real
(DETECT→DIAGNOSE→REPLAN→RENDER AGAIN→QA AGAIN, límite razonable de
iteraciones); no defender el video actual, usarlo de baseline; regla
dura anti-sobreingeniería (conexión > duplicación, no crear si un
sistema existente resuelve); flujo integrado de punta a punta; PRUEBA
OBLIGATORIA (generar un video real comparable al demo anterior);
comparación objetiva medible (cambios estructurales, duración media de
bloque visual, variedad de componentes/transiciones, repetición,
densidad visual, silencios, eventos de audio) + evaluación cualitativa
separada; regla de honestidad (nunca afirmar mejora de retención real
sin datos de publicación -- HIPÓTESIS/MEDIDO/EVIDENCIA/RESULTADO REAL);
no detenerse por bloqueos (buscar alternativa); autonomía total salvo
gastar/publicar/contactar/acciones externas irreversibles; criterio de
"terminado" explícito de 10 puntos (A-J, no solo "pasan los tests").
Orden: auditar → mapear qué sistema existente resuelve cada cosa →
diseñar el modelo de decisión → implementar reutilizando lo existente →
conectar todo → generar el video nuevo → analizar → corregir →
re-renderizar si hace falta → comparar contra el demo anterior →
documentar.

## Estado real (se actualiza incrementalmente)

| Sección | Estado | Nota |
|---|---|---|
| Auditoría (Fase A/B) | hecho (liviana) | Reutilizó mapa de madurez + auditoría de techos ya existentes; el diagnóstico del propio operador sobre demo-08 se confirmó numéricamente con Crítico v2 antes de tocar código (ver abajo) |
| Intención narrativa por unidad | ya existía, no se tocó | `IntencionEdicion` (8 valores) ya cubre esto desde R4; no se creó tipo paralelo |
| Rhythm Engine / curva de energía | **implementado y ejercitado en video real** | `directores/edicion/curva_energia.ts` (nuevo) -- `CurvaEnergia` con 7 checkpoints, empuja energía SOLO hacia arriba, nunca contradice `dejar_respirar`. Conectado a `DirectorEdicion.planificar()`. Efecto limpio confirmado en `fabrica-demo-09`: unidad "impacto" (revelación/clímax) pasó de `alta` a `muy_alta` sin cambiar de componente -- ahora el clímax realmente se distingue energéticamente de las demás unidades, cosa que en demo-08 no pasaba (impacto tenía la misma energía que hook/cierre) |
| Cambios visuales con WHY/WHAT/INTENSITY/TIMING | ya existía, extendido | `estrategia.transicion.motivo` + `microeventos.razon` ya daban esto; se agregó el nuevo microevento `cambia_encuadre` con su propia razón explícita (pausa real medida) |
| Cambios repentinos / unidades estáticas | **implementado y ejercitado** | Causa raíz real encontrada: unidades de 1 solo clip de audio no tenían NINGÚN offset interno para anclar un cambio (regla dura anti-invención). Fix: `composicion/pausas.ts` detecta pausas de voz REALES con `ffmpeg silencedetect` (mismo mecanismo que QA duro) y las usa como ancla de un `cambia_encuadre` real. Resultado medido: +2 eventos de cambio reales en demo-09 (aceleración a los 17.79s, desarrollo2 a los 32.91s), confirmado visualmente en frames extraídos |
| Hook Engine v2 | no ampliado esta ronda | Presupuesto de tiempo -- foco puesto en Rhythm Engine + unidades estáticas por ser la causa raíz más directa del diagnóstico del operador |
| Lenguaje visual de negocios (dinero/ventas/etc.) | no ampliado esta ronda | Presupuesto de tiempo |
| Energy contrast | conectado con la curva de energía (mismo trabajo) | Ver hallazgo honesto abajo: un efecto colateral de la memoria anti-repetición (no de la curva) redujo el contraste en la unidad "pausa" en este video puntual |
| Audio como parte de la edición | no ampliado esta ronda más allá de lo ya conectado (R7-22) | |
| Familias de transición | evaluado -- los 10 `TipoGolpe` ya existentes se mapean contra esto, no se crea taxonomía nueva | |
| Anti-Predictability Engine | no ampliado esta ronda | Sigue en componentId/golpe/patrón de retención (R6-5), no se extendió a estructura/color/ritmo esta ronda |
| Visual Density Engine | ya existía, sin cambios de código esta ronda | `DensidadVisual` en `combinarEstilos`; el Crítico v2 SÍ mide ahora si varía en el tiempo (`densidad_visual_varia`) -- reveló que en demo-09 dejó de variar por el mismo efecto colateral de memoria mencionado arriba |
| Payoff Engine | no ampliado esta ronda | |
| CTA integrado | no ampliado esta ronda | |
| Crítico Audiovisual v2 (métricas objetivas) | **implementado y usado para la comparación real** | `qa/critico_v2_metricas.py` (nuevo) -- todo MEDIDO directo del árbol/render real, heurísticas siempre prefijadas `HEURISTICO:`, nunca una métrica de retención inventada |
| Self-correction real | ya existía (`laboratorio/ciclo_mejora.ts`), ejercitado de nuevo | No se disparó una segunda iteración esta ronda porque el ciclo no encontró problemas duros bloqueantes en demo-09 (QA ok=true) -- el loop DETECT→CORRECT existe pero esta ronda no lo necesitó, no se simuló su uso |
| Video real de prueba (Sección 19) | **hecho** | `fabrica-demo-09.mp4` (38.38s), mismo guion/voz/preset que demo-08, renderizado real, QA real ok=true, entregado al operador |
| Comparación objetiva (Sección 20) | **hecho** | Ver tabla de métricas + hallazgo del confound en el informe entregado al operador (2026-09-03) |
| Honestidad (Sección 21) | aplicada en todo lo anterior | Incluye reportar un efecto que NO es mejora atribuible a este trabajo (ver confound de memoria anti-repetición) en vez de adjudicárselo a la curva/pausas |

## Hallazgo honesto de esta ronda (no inventar una mejora que no es tal)

Al comparar demo-08 vs demo-09 con el Crítico v2 aparecieron dos cambios que
**NO** son efecto del Rhythm Engine ni de `cambia_encuadre`: la unidad
"pausa" cambió de componente (`silueta` → `tres-verdades`) y la unidad
"desarrollo2" también (`lista-tachada` → `ranking`). Causa real: el
Director Visual usa `componentesUsadosRecientes(5)` (memoria cross-video
de R6-5, ya existente) para penalizar componentes recién usados -- y
`fabrica-demo-08` ya estaba registrado en `memoria/historial_componentes.json`
cuando se generó demo-09, así que "silueta" (usado en demo-08) quedó
penalizado y perdió el slot de "pausa" frente a "tres-verdades". Efecto
secundario real: la intención de esa unidad pasó de `dejar_respirar` a
`construir_tension`, y **eso** -- no la curva -- es lo que hizo que
`densidad_visual_varia` pasara de `true` a `false` en demo-09. Se documenta
en vez de re-generar el video para "arreglarlo": es un límite real y
honesto del método de comparación A/B cuando se usa memoria persistente
entre videos consecutivos, no un bug a corregir con urgencia.

## Historial de actualizaciones

- **2026-09-03**: creado antes de tocar código.
- **2026-09-03 (cierre de ronda)**: Rhythm Engine (`curva_energia.ts`) +
  detección de pausas reales (`composicion/pausas.ts`) + microevento
  `cambia_encuadre` implementados, testeados (38 suites verdes) y
  ejercitados en un video real (`fabrica-demo-09.mp4`) comparado
  objetivamente contra `fabrica-demo-08.mp4` con el nuevo Crítico v2
  (`qa/critico_v2_metricas.py`). Hook Engine v2, biblioteca de lenguaje
  visual de negocios, familias de transición nuevas, Payoff Engine, CTA
  integrado y Anti-Predictability Engine ampliado quedan sin tocar esta
  ronda (presupuesto de tiempo, ver tabla arriba) -- no se simuló ni se
  documentó como "hecho" nada de esto.
