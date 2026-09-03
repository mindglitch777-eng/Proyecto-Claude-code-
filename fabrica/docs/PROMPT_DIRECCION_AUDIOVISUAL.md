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
| Auditoría (Fase A/B) | pendiente | Reutiliza mapa de madurez + auditoría de techos ya existentes, no repite desde cero |
| Intención narrativa por unidad | pendiente | Evaluar si `IntencionEdicion` (ya existe, 8 valores) cubre lo pedido o hace falta extender, ANTES de crear un tipo paralelo |
| Rhythm Engine / curva de energía | pendiente | Foco principal -- `decidirEnergia()` ya existe pero es local por unidad, falta una curva objetivo para todo el video |
| Cambios visuales con WHY/WHAT/INTENSITY/TIMING | pendiente | `estrategia.transicion.motivo` + `microeventos` ya dan parte de esto -- evaluar extender, no duplicar |
| Cambios repentinos deliberados | pendiente | Conectar con densidad de microeventos en unidades largas |
| Hook Engine v2 | evaluado, probablemente no ampliado esta ronda | Presupuesto de tiempo |
| Lenguaje visual de negocios (dinero/ventas/etc.) | evaluado, probablemente no ampliado esta ronda | Presupuesto de tiempo |
| Energy contrast | conectado con la curva de energía (mismo trabajo) | |
| Audio como parte de la edición | evaluado, no ampliado esta ronda más allá de lo ya conectado (R7-22) | |
| Familias de transición | evaluado -- los 10 `TipoGolpe` ya existentes se mapean contra esto, no se crea taxonomía nueva | |
| Anti-Predictability Engine | pendiente | Extender anti-repetición existente más allá de componentId/golpe |
| Visual Density Engine | ya existe (`DensidadVisual` en `combinarEstilos`) | evaluar si varía lo suficiente en el tiempo |
| Payoff Engine | evaluado, no ampliado esta ronda | |
| CTA integrado | evaluado, no ampliado esta ronda | |
| Crítico Audiovisual v2 (métricas objetivas) | pendiente | Pieza central para la comparación de la sección 20 |
| Self-correction real | ya existe (`laboratorio/ciclo_mejora.ts`) | evaluar y ejercitar de nuevo |
| Video real de prueba (Sección 19) | pendiente | `fabrica-demo-09`, mismo guion que demo_08 para comparar |
| Comparación objetiva (Sección 20) | pendiente | Tabla de métricas demo_08 vs demo_09 |
| Honestidad (Sección 21) | aplicada en todo lo anterior | |

## Historial de actualizaciones

- **2026-09-03**: creado antes de tocar código.
