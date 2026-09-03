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
| 1 | Auditoría completa (A-F) | pendiente | Reutiliza y reclasifica `docs/MAPA_MADUREZ_SISTEMA.md` (R7-29) en la nueva taxonomía, no repite desde cero |
| 2 | Orquestador central | pendiente | Pieza central de esta ronda |
| 3-8, 16 | Investigación externa/skills/MCP nuevos | **NO se repite** | Ya cubierto exhaustivamente en R7-28 (puntos 4/5) -- esta ronda es de CONEXIÓN, no de más catálogo, por pedido explícito del operador |
| 9 | Render → inspección → corrección | pendiente | |
| 10 | Sistema de estilo real conectado al pipeline | pendiente | `configuracion.ts` (R7-29) existe pero self-crítica ya reconoció que ningún generador lo usaba -- cerrar ese hueco acá |
| 11 | Anti-repetición perceptual (familias) | pendiente | |
| 12 | Motor de audio evolucionado | evaluado en R7-29, no ampliado | |
| 13 | Carruseles en el mismo sistema | ya existe (Product Ecosystem + Carousel Engine) | evaluar si falta algo real |
| 14 | Métricas con ID único + WAITING_FOR_REAL_DATA | pendiente | `datos/`+`memoria/` ya usan este patrón (`esperando_datos`) -- verificar consistencia |
| 15 | Decision Engine con "no hacer nada" | ya cumple (confirmado R7-29) | |
| 17 | Cero gasto | disciplina ya aplicada en todo el proyecto | |
| 18 | Sistema de experimentos | ya existe (`memoria/laboratorio.json`) | verificar contra el contrato pedido |
| 19 | Integración real (pipeline callable) | pendiente | Mismo objetivo que el Orquestador (#2) |
| 20 | Video real generado con decisiones registradas | pendiente | Obligatorio -- no se puede reportar terminado sin esto |
| 21 | Informe final (18 puntos) | pendiente | |
| 22 | Regla final / autocrítica | pendiente | |

## Historial de actualizaciones

- **2026-09-03**: creado este archivo con el texto completo del prompt
  antes de empezar cualquier trabajo.
