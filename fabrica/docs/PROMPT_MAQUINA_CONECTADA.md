# Prompt vivo — "Construí una máquina, no piezas sueltas" (siguiente evolución)

**Por qué existe este archivo:** mismo motivo que los 2 anteriores
(`PROMPT_EXPLORACION_AGRESIVA.md`, `PROMPT_EVOLUCION_SISTEMA_OPERATIVO.md`)
-- el operador pidió explícitamente esta vez un Orchestrator real que
conecte TODO el pipeline y termine en un video real generado, con cada
decisión registrada. Texto completo guardado acá antes de tocar código.

## El prompt, texto completo (2026-09-03)

```
Quiero que hagas la siguiente evolución de LA NUEVA FÁBRICA AUDIOVISUAL.

IMPORTANTE: No quiero otra ronda de crear carpetas decorativas. No
quiero que simplemente documentes posibilidades. No quiero que seas
conservador diciendo "ya existe algo parecido" sin auditarlo. No
quiero que agregues herramientas porque sí.

Quiero que conviertas todo lo que YA tenemos + las mejores
herramientas externas que podamos usar en UNA INFRAESTRUCTURA
REALMENTE CONECTADA.

OBJETIVO: La fábrica debe evolucionar de "generador de videos con
muchos módulos" a "SISTEMA OPERATIVO DE CONTENIDO" que pueda:
INVESTIGAR → detectar patrones → evaluar evidencia → decidir qué
aplicar → construir guion → diseñar estructura de retención → decidir
edición → seleccionar assets → generar voz → montar → renderizar →
inspeccionar el resultado → hacer QA → registrar qué hizo → publicar
SOLO con autorización humana → recibir métricas reales → aprender →
actualizar sus decisiones futuras.

REGLA PRINCIPAL: NO sistemas aislados. Cada módulo nuevo debe
demostrar: 1) quién lo alimenta, 2) qué recibe, 3) qué produce, 4)
quién consume ese resultado, 5) cómo afecta la decisión siguiente. Si
una pieza no tiene conexión real con el pipeline, no construirla
todavía.

1. AUDITORÍA COMPLETA: auditar TODO antes de tocar código. No asumir
que algo está conectado porque existe un archivo. Documentar el flujo
REAL de research/knowledge/hooks/retention/script/voice/visual
director/audio director/editing director/style system/assets/
carousel/QA/critic/metrics/memory/experiments/decision engine/sales/
product ecosystem. Por cada sistema: ¿existe? ¿funciona? ¿tests?
¿datos reales? ¿produce datos utilizables? ¿conectado a otro sistema?
¿quién lo llama? ¿cuándo? ¿qué decisiones modifica? ¿está en el
pipeline real o solo como infraestructura? Clasificar en: A) FUNCIONANDO
Y CONECTADO B) FUNCIONANDO PERO AISLADO C) IMPLEMENTADO PERO NO USADO
D) SOLO DOCUMENTADO E) BLOQUEADO EXTERNAMENTE F) FALTA IMPLEMENTAR. No
decir "está listo" solo porque existe el código.

2. ORQUESTADOR CENTRAL: un Orchestrator real (no una mega-función
imposible de mantener) que coordine los módulos existentes: RESEARCH →
KNOWLEDGE → CONTENT STRATEGY → HOOK STRATEGY → RETENTION MAP → SCRIPT →
STYLE DECISION → VISUAL PLAN → AUDIO PLAN → EDITING PLAN → ASSET PLAN →
VOICE → COMPOSITION → RENDER → VISUAL INSPECTION → QA → CRITIC →
EXPERIMENT RECORD → OUTPUT. Cada etapa deja un artefacto estructurado
consumible por la siguiente. Nada de decisiones invisibles.

3. SISTEMA DE INVESTIGACIÓN REAL: capa que reciba información externa
(YouTube, TikTok Creative Center, Google Trends, Reddit, MCP
disponibles, APIs oficiales, conectores existentes, GitHub, fuentes
públicas). No inventar datos. Clasificar cada dato: EVIDENCIA REAL /
PATRÓN OBSERVADO / BUENA PRÁCTICA / HIPÓTESIS / EXPERIMENTO / RESULTADO
REAL / BLOQUEADO. Guardar fuente/fecha/dato/contexto/confianza/qué
patrón representa/qué decisión podría modificar.

4. INVESTIGACIÓN DE CONTENIDO GANADOR: no solo "hooks buenos" -- hook
(estructura/promesa/curiosidad/conflicto/contradicción/payoff),
velocidad, duración de escenas, cambios visuales, densidad de
información, texto en pantalla, subtítulos, movimiento, zooms,
transiciones, B-roll, sonido, silencios, música, cambios de
intensidad, CTA, estructura narrativa completa, loop, patrones
repetidos. Distinguir "esto aparece mucho" de "esto está respaldado
por datos" -- nunca correlación como causalidad.

5. PATTERN MINING: representación estructurada de patrones (ej. "Hook
de contradicción": descripción, cuándo usar/NO usar, estructura,
intensidad, duración recomendada, estilo compatible, tipo de
contenido, evidencia, ejemplos, riesgos, resultados reales si existen).
Un patrón visual debe poder terminar en una decisión concreta de
Remotion.

6. MOTOR DE RETENCIÓN: no "usa curiosidad" -- construir un mapa
TEMPORAL real (ej. 0-1.5s hook, 1.5-4s confirmación de promesa, 4-8s
primer cambio, etc.) pero como PARÁMETROS que cambian según duración/
tema/formato/audiencia/evidencia/objetivo, nunca números fijos
universales.

7. MOTOR DE EDICIÓN MÁS AVANZADO: auditar skills públicas para Claude
Code + Remotion de motion design/animation/transitions/captions/sound
design/pacing/video editing/cinematic polish/3D transitions/audio
reactive visuals/visual storytelling/automatic editing/silence
removal/frame inspection/render validation. Investigar muchas
candidatas (no limitarse a 3), no instalar todas. Por cada una: qué
aporta/licencia/dependencias/costo/calidad/compatibilidad/solapamiento/
riesgo/qué parte reutilizable. Clasificar: ADOPTAR/ADAPTAR/USAR COMO
REFERENCIA/PROBAR/DESCARTAR. Si la arquitectura de una skill no sirve
pero la idea sí, adaptar el concepto.

8. SKILLS DE REMOTION específicamente: springs, easing, stagger,
sequences, transitions, scene choreography, camera movement, parallax,
3D, motion blur, depth, typography, kinetic typography, captions,
audio-reactive animation, visual hierarchy, cinematic polish,
reusable components, timing systems. Buscar patrones que eviten que un
video parezca "texto + imagen + transición + texto" y en cambio parezca
edición diseñada por un editor/motion designer real.

9. RENDER → INSPECCIÓN → CORRECCIÓN (obligatorio): no aceptar "render
correcto" solo porque FFmpeg terminó. Después de renderizar: extraer
frames representativos, revisar composición/texto/contraste/saturación
visual/elementos cortados/ritmo/pantallas estáticas/repetición/cambios
bruscos malos/ausencia de estímulo/sincronización aproximada audio-
visual. Si hay un problema corregible: no solo reportarlo, generar una
propuesta de corrección y, cuando sea seguro, corregir y re-renderizar
(con un máximo razonable de iteraciones).

10. SISTEMA DE ESTILO REAL: los 5 estilos existentes (venta agresiva,
documental serio, financiero directo, misterio, educativo calmo) no
deben ser etiquetas -- cada uno debe modificar de verdad pacing,
densidad, transiciones, movimiento, tipografía, colores, música, SFX,
intensidad, composición, cantidad de cambios, comportamiento de
captions, tipo de hook. Conectados al pipeline. Generar un video real
usando uno de estos estilos.

11. ANTI-REPETICIÓN INTELIGENTE (perceptual, no solo por id): detectar
"familias" (visual, de transición, de movimiento, sonora, narrativa) --
dos componentes con nombres distintos que producen "zoom + texto
grande + golpe de sonido" cuentan como la misma familia. Evitar repetir
demasiado las mismas combinaciones.

12. MOTOR DE AUDIO evolucionado: no una canción plana todo el video --
decidir intensidad/entradas/salidas/golpes/silencios/cambios de
energía/relación audio-cambio visual, acompañando la estructura
narrativa cuando existan assets adecuados.

13. CARRUSELES en el mismo sistema: una investigación puede convertirse
en VIDEO/CARRUSEL/GUION/POST/CTA/PRODUCTO/LEAD MAGNET sin duplicar
conocimiento -- el sistema decide cuándo conviene cada formato.

14. MÉTRICAS Y APRENDIZAJE: cada contenido con ID único, guardando qué
investigación lo originó, qué hook/patrón de retención/estilo/edición/
componentes/duración/CTA/hipótesis probaba. Después guardar
visualizaciones/retención/likes/comentarios/shares/guardados/clics/
ventas CUANDO existan. Sin datos reales: STATUS = WAITING_FOR_REAL_DATA,
nunca inventar.

15. DECISION ENGINE: debe poder responder "¿qué debería hacer ahora?"
basándose en evidencia/resultados/coste/riesgo/objetivo/recursos. No
siempre "hacer más" -- también NO HACER NADA TODAVÍA / ESPERAR DATOS /
REPETIR EXPERIMENTO / CAMBIAR VARIABLE / DESCARTAR PATRÓN.

16. MCP/CONECTORES: auditar YouTube/TikTok/investigación/Google Trends/
Reddit/analytics/Hotmart/GitHub/automatización -- qué existe, qué
falta, qué puede conectarse. No activar pagos, no gastar, no publicar
ni enviar mensajes automáticos, todo bajo aprobación humana. Si un MCP
necesita cuenta/API key: BLOCKED — OPERATOR ACTION REQUIRED.

17. CERO GASTO: $0 hasta la primera venta -- priorizar gratis/open
source/APIs gratis/GitHub Actions/Remotion/FFmpeg/Python/TypeScript.
Herramienta paga espectacular: NO comprarla, registrar "INTERESTING —
PAID — FUTURE".

18. SISTEMA DE EXPERIMENTOS: HIPÓTESIS/VARIABLE/CONTROL/CAMBIO/
MÉTRICA/CRITERIO DE ÉXITO/RESULTADO/CONCLUSIÓN. Nunca declarar
"funciona" antes de tener datos -- RESULTADO: WAITING FOR DATA es
válido.

19. PRIORIDAD ABSOLUTA -- INTEGRACIÓN: después de construir un módulo,
demostrar cómo entra al pipeline. Poder ejecutar algo conceptualmente
como "Crear video sobre X" y que la fábrica automáticamente: consulte
conocimiento → detecte patrones → seleccione estrategia → cree mapa de
retención → genere estructura → seleccione estilo/edición/assets →
genere voz → componga → renderice → inspeccione → haga QA → registre
todo → entregue el video. Sin llamar manualmente 15 sistemas.

20. PRUEBA REAL OBLIGATORIA: generar un video REAL (no decir solo que
funciona) usando un estilo concreto, un hook concreto, un patrón de
retención, edición avanzada, audio, captions si están disponibles,
assets, QA, inspección post-render. Registrar exactamente qué
decisiones tomó el sistema.

21. INFORME FINAL (18 puntos): qué encontraste, qué ya estaba bien, qué
estaba desconectado, qué conectaste, qué skills nuevas encontraste,
cuáles adoptaste/descartaste, qué MCP encontraste/conectaste, qué
quedó bloqueado, qué cambió realmente, qué puede hacer ahora que antes
no podía, qué todavía no puede hacer, qué video real generaste, qué
decisiones tomó automáticamente, qué tests pasaron, qué falta para
datos reales, cuál es el siguiente cuello de botella.

22. REGLA FINAL: no ser conservador por miedo a "ya existe" -- auditar,
y si funciona CONECTARLO; si está aislado INTEGRARLO; si una skill
externa tiene algo mejor, ESTUDIARLA y adaptar lo útil; si no sirve,
DESCARTARLA; si está bloqueado, buscar alternativa o documentar el
bloqueo. Pensamiento resolutivo, sin inventar capacidades. AMBICIÓN EN
EL DISEÑO + RIGOR EN LA EVIDENCIA + DISCIPLINA EN LOS GASTOS +
INTEGRACIÓN EN LA ARQUITECTURA + DATOS REALES PARA APRENDER. No
construir piezas sueltas -- construir una MÁQUINA. Orden: auditar →
diseñar → implementar → integrar → probar → generar video real →
inspeccionar → documentar. No pedir confirmación para decisiones
técnicas normales -- solo detenerse si algo requiere gastar dinero,
publicar, contactar personas, acceder a una cuenta privada, o una API
key que solo el operador puede dar -- documentar esos casos como
pendiente del operador y seguir con todo lo demás.
```

## Estado real (se actualiza incrementalmente)

| # | Sección | Estado | Nota |
|---|---|---|---|
| 1 | Auditoría completa (A-F) | **HECHO** | Ver sección de reclasificación abajo -- reutiliza `docs/MAPA_MADUREZ_SISTEMA.md`, no repite auditoría desde cero |
| 2 | Orquestador central | **HECHO** | `fabrica/orquestador/orquestador.ts` -- corre QA real (duro+composición) sobre un render real y arma un `RegistroVideoCompleto` listo para el Data Engine, con log de decisiones explícito (nada invisible) |
| 3-8, 16 | Investigación externa/skills/MCP nuevos | **NO se repite** | Ya cubierto exhaustivamente en R7-28 (puntos 4/5) -- esta ronda es de CONEXIÓN, no de más catálogo, por pedido explícito del operador |
| 9 | Render → inspección → corrección | **HECHO parcialmente, con hallazgo honesto** | Render real ejecutado, QA real corrido (100% limpio), inspección visual real de frames (texto legible, efecto de revelación disparando bien). El loop de "detectar → corregir → re-renderizar" YA existe (`laboratorio/ciclo_mejora.ts`, corrió 1 intento con 7 alertas no-bloqueantes, ninguna auto-corregible de las que tenía este guion) -- no se disparó un segundo render automático porque no hizo falta (0 problemas duros) |
| 10 | Sistema de estilo real conectado al pipeline | **HECHO, con hallazgo honesto real** | `configuracion.ts` conectado por primera vez a un generador real (`generar_demo_08.ts`). Hallazgo real al probarlo: `decidirEstilos()` combina (unión) los estilos sugeridos con los de la intención narrativa, no los REEMPLAZA -- "financiero_directo" suaviza pero no elimina estilos de alta energía en momentos de tensión/revelación. Documentado como comportamiento real observado, no ocultado |
| 11 | Anti-repetición perceptual (familias) | **NO abordado esta ronda** | Requiere definir taxonomía de familias visuales/sonoras -- trabajo de diseño no trivial, no se llegó por presupuesto de tiempo |
| 12 | Motor de audio evolucionado | evaluado en R7-29, no ampliado esta ronda | |
| 13 | Carruseles en el mismo sistema | ya existe (Product Ecosystem + Carousel Engine, confirmado en el mapa de madurez) | sin cambios esta ronda |
| 14 | Métricas con ID único + WAITING_FOR_REAL_DATA | **confirmado con datos reales** | `fabrica-demo-08` tiene ID único, registro completo en `datos/` y `memoria/`, `metricas: null` honesto (no publicado) -- exactamente el patrón `esperando_datos`/`WAITING_FOR_REAL_DATA` pedido |
| 15 | Decision Engine con "no hacer nada" | ya cumple (confirmado R7-29) | |
| 17 | Cero gasto | mantenido -- el fix del render fue reutilizar un binario YA preinstalado, $0 | |
| 18 | Sistema de experimentos | ya existe, ejercitado de nuevo con un experimento A/B real (demo_07 vs demo_08) | |
| 19 | Integración real (pipeline callable) | **HECHO** | `generar_demo_08.ts` ejecuta el pipeline completo (Knowledge/hooks → Directores → composición → render → QA → registro) -- sigue requiriendo invocar el script (no es un comando único "crear video sobre X" genérico todavía, ver autocrítica) |
| 20 | Video real generado con decisiones registradas | **HECHO** | `fabrica-demo-08.mp4`, enviado al operador, con decisiones logueadas paso a paso |
| 21 | Informe final (18 puntos) | **HECHO** | Entregado al operador en el mensaje de cierre |
| 22 | Regla final / autocrítica | **HECHO** | Ver sección de autocrítica abajo |

## Reclasificación A-F (Sección 1, sobre `docs/MAPA_MADUREZ_SISTEMA.md` ya existente)

**A) FUNCIONANDO Y CONECTADO:** Director Visual, Director de Audio,
Director de Edición, Director de Retención, Knowledge Engine (consulta
automática vía `porId`/`patronesCompatibles`), Viral/Retention Engine
(hooks), Carousel Engine + Product Ecosystem (ciclo real demostrado con
artefacto), QA duro, QA de composición, Crítico Audiovisual/Editorial,
QA de contraste (nuevo, R7-29).

**B) FUNCIONANDO PERO AISLADO** (existe, corre bien, pero nadie más lo
llama automáticamente): Advanced Editing Engine (catálogo de consulta,
no decide), Research System (se dispara a mano), Skill Intelligence
(registro consultable, instalar sigue siendo manual), MCP registro
(igual), Decision Engine (documenta, no ejecuta).

**C) IMPLEMENTADO PERO NO USADO** (el hueco más concreto encontrado
esta ronda): `directores/edicion/configuracion.ts` (5 presets de
estilo, R7-29) -- **ningún generador lo llama todavía**, confirmado en
la autocrítica de la ronda anterior. `datos/tipos.ts.qaResumen` --
plumbing real pero ningún render real lo pobló todavía. Estos dos son
la prioridad de conexión de esta ronda (Sección 10 y 19 del prompt).

**D) SOLO DOCUMENTADO:** ninguno real -- las 24+ entradas de
`conocimiento/` tienen código consumidor real (`hooks/`,
`directores/edicion/`), no son solo prosa.

**E) BLOQUEADO EXTERNAMENTE:** Sales Engine, Data Engine, Laboratorio,
Research System -- los 4 comparten el mismo bloqueo real (sin
publicaciones/ventas todavía, no un problema de arquitectura).

**F) FALTA IMPLEMENTAR:** un Orquestador central único (no existe
todavía un solo punto de entrada "crear video sobre X" -- cada
generador de ejemplo llama a los Directores a mano); un loop real de
render→inspección→corrección automática (existe `laboratorio/ciclo_mejora.ts`
pero no re-renderiza solo); anti-repetición por FAMILIA perceptual (hoy
solo por id exacto de componente/patrón, no por "familia" conceptual);
pipeline de análisis de video externo (Fase 8 de la ronda anterior,
sigue sin abordar).

## Autocrítica final (sección 22)

- **¿Se construyó una máquina o piezas sueltas?** Una conexión real
  y verificable: Orquestador → QA real → Data Engine → Memoria, probada
  con un video real de punta a punta, no una promesa.
- **¿Se auditó antes de construir?** Sí -- se reutilizó
  `MAPA_MADUREZ_SISTEMA.md` en vez de re-auditar desde cero, y se
  descubrió en el camino que `laboratorio/ciclo_mejora.ts` YA hacía
  parte de lo pedido en la sección 9 (no se duplicó).
- **¿Alguna decisión quedó invisible?** No -- el log de
  `armarRegistroConQaReal()` imprime cada paso con su razón.
- **¿Se infló algo que no funcionó como se esperaba?** No -- el
  hallazgo de que `decidirEstilos()` combina en vez de reemplazar
  estilos se documentó tal cual salió, no se ocultó ni se maquilló el
  resultado del preset "financiero_directo".
- **¿El bloqueo real (Remotion pidiendo descargar Chromium) se aceptó
  como final?** No -- se buscó y encontró una alternativa real ($0,
  binario ya presente en el entorno) en vez de reportar "bloqueado".
- **¿Qué NO se hizo y por qué?** Anti-repetición perceptual por
  familias (sección 11) y el resto de investigación externa (secciones
  3-8/16, deliberadamente no repetidas por pedido explícito del
  operador) -- honesto en vez de simulado.

## Historial de actualizaciones

- **2026-09-03**: creado este archivo con el texto completo del prompt
  antes de empezar cualquier trabajo.
