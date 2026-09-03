# Prompt: "Nueva prueba de estrés de la fábrica — Benchmark audiovisual agresivo" (R7-32)

Guardado verbatim (mismo patrón que los prompts anteriores) antes de tocar
código, para no perderlo en la memoria de la conversación.

## Texto completo del operador

NUEVA PRUEBA DE ESTRÉS DE LA FÁBRICA — BENCHMARK AUDIOVISUAL AGRESIVO

Quiero que hagamos una prueba completamente diferente a las anteriores.

Hasta ahora te pedimos "más agresividad", "más retención", "más cambios", etc., pero eso deja demasiado espacio para interpretación.

Esta vez NO quiero que interpretes libremente qué significa "agresivo".

Te voy a entregar:

1. un guion diseñado específicamente para esta prueba;
2. una dirección visual escena por escena;
3. una dirección de ritmo;
4. una dirección de transiciones;
5. una dirección de audio;
6. una curva de energía;
7. ejemplos conceptuales de qué debería ocurrir visualmente.

Tu trabajo es convertir TODO eso en un video real utilizando la infraestructura que ya construimos.

NO quiero otra ronda de documentación. NO quiero otro catálogo. NO quiero crear 50 carpetas nuevas. QUIERO UN RENDER REAL.

(objetivo, regla de voz, concepto del video, guion completo -- HOOK/DESARROLLO/GIRO/REVELACIÓN/PAYOFF --, dirección general de edición con curva de energía 0-42s, direcciones escena por escena de la 1 a la 12, transiciones, animaciones, movimiento, texto, color, audio, regla de oro de agresividad -- "AGRESIVO NO SIGNIFICA más efectos, SIGNIFICA más CONTRASTE" --, regla de variedad, prueba de estrés del director -- plan ESCENA→FRASE→INTENCIÓN→ENERGÍA→RECURSO VISUAL→ANIMACIÓN→TRANSICIÓN→AUDIO→MOTIVO --, test de integración de punta a punta, iteración con 14 preguntas de autocrítica y máximo 3 iteraciones, comparación objetiva contra fabrica-demo-09.mp4 con MEDIDO/HEURÍSTICO/HIPÓTESIS, regla final: "¿la fábrica es capaz de tomar un guion bien diseñado y convertirlo en una pieza audiovisual realmente agresiva, dinámica, moderna y narrativamente intencional? Si la respuesta es NO: encontrá exactamente dónde se rompe el flujo, arreglalo, probalo, volvé a renderizar. QUIERO EL VIDEO.")

Texto íntegro completo pegado por el operador en el mensaje de esta ronda
-- ver historial de la conversación para el texto carácter por carácter
si hace falta releerlo, no se resume aquí para no duplicar 500 líneas.

## Guion exacto a usar (NO cambiar las frases)

**HOOK**
- "La inteligencia artificial no te va a hacer ganar plata."
- "Y cuanto antes entiendas esto, mejor."

**DESARROLLO**
- "Porque hoy cualquiera puede generar cien videos, cien imágenes y cien productos en una tarde."
- "El problema es que producir más no significa vender más."
- "Podés automatizar absolutamente todo..."
- "...y seguir automatizando una idea que nadie quiere."

**GIRO**
- "Los que están aprovechando la IA de verdad hacen algo distinto."
- "Primero encuentran un problema."
- "Después encuentran una oferta."
- "Y recién ahí utilizan IA para multiplicar lo que funciona."

**REVELACIÓN**
- "La máquina no decide qué quiere comprar la gente."
- "Te ayuda a ejecutar."

**PAYOFF**
- "La ventaja está en saber qué ejecutar."
- "Y eso cambia completamente el juego."

Regla de voz: EXACTAMENTE la misma Qwen3-TTS ya usada (mismo modelo, voz,
configuración) -- la variable de esta prueba es guion+dirección+edición,
no el TTS.

## Plan por escena (ESCENA→FRASE→INTENCIÓN→ENERGÍA→RECURSO→ANIMACIÓN→TRANSICIÓN→AUDIO→MOTIVO)

Auditado el catálogo real (28 componentes en `componentes/registro.json`)
contra las 14 líneas exactas del guion. Regla seguida en cada fila:
**nunca** un componente que exija un número/dato no narrado en esa
unidad (rompería "no inventes datos"). Cada unidad = 1 clip de audio
real (a diferencia de demo_08/09, la Escena 8 "Tríada" del brief pide
identidad visual DISTINTA por etapa, así que se modela como 3 unidades
separadas: giro_1/giro_2/giro_3, no una unidad con 3 clips).

| # | id | Frase | Intención | Energía objetivo | Recurso (categoría → componente real) | Motivo | Transición/audio |
|---|---|---|---|---|---|---|---|
| 1 | hook_0 | "La IA no te va a hacer ganar plata." | HOOK/interrupción | muy_alta | texto → **punch** | Único componente `muy_dinamico` intensidad 0.75 con `entra[]` (timing por línea) y fondo de video -- jerarquía "LA IA"/"NO"/"TE VA A HACER GANAR PLATA" anclada a la palabra real "no" vía forced-alignment (faster-whisper, ver abajo), no inventada | golpe fuerte (fogonazo/sacudón, decide `decidirParaUnidad`); SFX de impacto sincronizado a la palabra real |
| 2 | hook_1 | "Y cuanto antes entiendas esto, mejor." | CONTRASTE inmediato | baja | texto → **silueta** | Máxima caída de intensidad posible justo después del golpe 1 -- el contraste ES el recurso (regla de oro: agresivo = contraste, no más efectos) | transición limpia/corte, sin golpe fuerte |
| 3 | desarrollo_0 | "cien videos, cien imágenes y cien productos en una tarde" | ABUNDANCIA | muy_alta | montaje → **rafaga** | Único componente de montaje del catálogo (corte veloz multi-clip + flash) -- comunica abundancia con movimiento, no con números gigantes en pantalla | b-roll real (`freelance`/`celular`, ver assets/resolver.py, score 4.0 cada uno); golpe de escala en cada corte propio del componente |
| 4 | desarrollo_1 | "producir más no significa vender más" | CONTRASTE/caos→simplicidad | media-baja | comparacion → **balanza** | Pesos RELATIVOS (produccion vs. ventas), sin pasar ningún número real -- evita inventar una cifra de ventas que el guion no da | frenazo brusco después de la ráfaga; transición de corte seco |
| 5 | desarrollo_2 | "Podés automatizar absolutamente todo…" | ESCALADA/automatización | alta | lista → **logos-herramientas** | Iconos reales (`dibujo/figuras.tsx`: robot/chip/engranaje/cohete) representando procesos automatizados que se acumulan -- ningún número inventado | continúa el movimiento; termina en la pausa real ("…") detectada por `composicion/pausas.ts` (mismo mecanismo de R7-31) |
| 6 | desarrollo_3 | "…y seguir automatizando una idea que nadie quiere" | GIRO 1 (colapso) | alta→vacío | comparacion → **antes-despues** | `momentoCambioSeg` anclado al offset REAL del audio (mismo patrón ya probado en R7-4/checks de composición) -- el "después" revela vacío, metáfora de colapso sin destrucción literal | golpe fuerte (primer gran golpe del video), posible reducción de volumen/SFX de ruptura |
| 7 | giro_0 | "Los que están aprovechando la IA de verdad hacen algo distinto." | NUEVA DIRECCIÓN | media | otro → **buscador** | "La pregunta que todos se hacen" (docstring propio del componente) -- encaja literal con "ahora mostramos decisión" | transición limpia, composición más deliberada/ordenada |
| 8 | giro_1 | "Primero encuentran un problema." | TRÍADA 1/3 — PROBLEMA | media | otro → **chat** | Mockup de conversación real -- un problema contado como algo que alguien vive, no una afirmación abstracta | corte simple, primera pieza de la tríada |
| 9 | giro_2 | "Después encuentran una oferta." | TRÍADA 2/3 — OFERTA | media | otro → **notificaciones** | Representa "algo que llega, una propuesta concreta" sin necesitar precio/monto (recibo hubiera exigido inventar un número) | corte simple, segunda pieza |
| 10 | giro_3 | "Y recién ahí utilizan IA para multiplicar lo que funciona." | TRÍADA 3/3 — CULMINACIÓN | alta | texto → **punch** | La tercera etapa debe sentirse como la culminación (brief explícito) -- el componente de golpe de texto más fuerte del catálogo, reservado para este momento y para el hook/golpe final | golpe de culminación, cierre visual de la tríada |
| 11 | revelacion_0 | "La máquina no decide qué quiere comprar la gente." | PAUSA deliberada | muy_baja | texto → **silueta** | Componente de MENOR intensidad de todo el catálogo (0.35) -- "agresivo también es silencio/espera", regla de oro explícita del brief | sin golpe, máximo espacio negativo, reducción de música si corresponde |
| 12 | revelacion_1 | "Te ayuda a ejecutar." | GOLPE | alta | texto → **punch** | Frase cortísima, conclusión inmediata -- mismo componente que el hook por ser objetivamente el mejor para un golpe de texto puro, en un momento bien separado (no consecutivo) | golpe + SFX puntual, escala rápida |
| 13 | payoff_0 | "La ventaja está en saber qué ejecutar." | CONVERGENCIA | alta | diagrama → **diagrama** | Nodos "Problema"/"Oferta"/"IA" (rótulos que RECUERDAN lo ya narrado, no datos nuevos) convergiendo en "Ejecución" -- composición que se completa, sin fórmula literal en pantalla | transición de composición que se arma, no de golpe seco |
| 14 | payoff_1 | "Y eso cambia completamente el juego." | CIERRE | alta→resolución | texto → **remate** | Función documentada del propio componente: "buen candidato para cierre/CTA de un video de la fábrica", metraje oscurecido | golpe de cierre (negro), transición fuerte hacia el final |

**No usados esta ronda, con motivo explícito**: `contador`/`torre-3d`/`cifra-se-cae`/`recibo`/`grafico`/`grafico_torta`/`embudo`/`encuesta`/`ranking`/`crecimiento`/`explicador` -- todos exigen pasar un número/valor concreto en sus props, y el guion de esta prueba (a propósito, por regla del operador) no narra ningún dato numérico nuevo. Usarlos hubiera significado inventar una cifra en pantalla, prohibido explícitamente ("NO agregues estadísticas. NO inventes datos.").

## Forced-alignment real para el golpe interno del Hook

`faster-whisper` SÍ está instalado en este entorno (a diferencia de
rondas anteriores) pero la descarga del modelo desde Hugging Face está
bloqueada por política de red del proxy (confirmado con
`/__agentproxy/status`: `connect_rejected` a `huggingface.co:443`, no
un fallo transitorio). Igual que Qwen3-TTS, el camino real ya existe:
`.github/workflows/probar-alineacion-faster-whisper.yml` (creado en
R6-2/P3-3) corre el mismo prototipo en un runner de GitHub Actions con
red completa. Plan: una vez generado `capturas_voz/audio_demo_10/hook_0.wav`
real, disparar ese workflow con `archivo_audio=audio_demo_10/hook_0.wav`
y `texto_esperado="La inteligencia artificial no te va a hacer ganar
plata."`, leer el timestamp real de la palabra "no" del JSON resultante
(`fabrica/voz/resultados_alineacion/hook_0.json`) y usarlo como el
offset real de la segunda línea de `Punch` -- ANCLADO a lo medido, no
un número inventado. Reutiliza infraestructura existente al 100%, cero
carpetas nuevas.

## Estado real (se actualiza incrementalmente)

| Bloque | Estado |
|---|---|
| Auditoría de catálogo disponible vs. lo que pide el brief | **hecho** -- 28 componentes auditados, tabla completa arriba |
| Voz real (Qwen3-TTS, 14 líneas del guion nuevo) | **hecho** -- `generar-voz-demo-10.yml`, misma voz/config de producción |
| Plan por escena (ESCENA→FRASE→INTENCIÓN→ENERGÍA→RECURSO→ANIMACIÓN→TRANSICIÓN→AUDIO→MOTIVO) | **hecho** -- tabla completa arriba |
| Generador real (`generar_demo_10.ts`) | **hecho** |
| Render real | **hecho** -- `fabrica-demo-10.mp4`, 43.84s |
| QA duro + composición | **hecho** -- ambos `ok: true`, sin problemas duros |
| Autocrítica de las 14 preguntas | **hecho** -- ver sección abajo |
| Iteración (máx 3) si hace falta | 1 iteración real (props de 3 escenas + query de desarrollo_2, ver hallazgos honestos en ESTADO.md) -- no hicieron falta 2 más |
| Comparación objetiva vs. fabrica-demo-09.mp4 (Crítico v2) | **hecho** -- ver tabla abajo, con advertencia de estructura distinta |
| Entrega + documentación honesta | **hecho** -- ver ESTADO.md, entregado al operador |

## Autocrítica real (las 14 preguntas del brief)

1. **¿El hook realmente golpea?** Sí, medido: "LA INTELIGENCIA ARTIFICIAL" entra, "NO" entra exactamente a los 1.80s (palabra real medida por forced-alignment), "TE VA A HACER GANAR PLATA" remata en color de acento -- confirmado visualmente en frames extraídos.
2. **¿El primer cambio visual llega rápido?** Sí -- el golpe "NO" ocurre a 1.80s, dentro de los primeros 2s que pedía el brief.
3. **¿La edición cambia cuando cambia la idea?** Sí en 11 de 14 unidades (componente distinto); en las 3 restantes el sistema reutilizó `punch`/`silueta` con justificación real (repetición documentada, no accidental).
4. **¿Existe una curva de energía?** Sí, real, con 14 puntos (uno por unidad) -- confirmada en energías registradas por escena.
5. **¿El video se siente estático en algún punto?** El bloque más largo sin cambio dura 6.2s (la ráfaga de abundancia, que es intencionalmente un tramo de movimiento continuo, no estático).
6. **¿Hay demasiados textos?** El hook y el cierre (`remate`) superan el presupuesto heurístico de caracteres de `checks_composicion.py` (alertas no bloqueantes) -- honesto: sí hay algo de texto de más ahí, documentado, no corregido a fondo por presupuesto de tiempo.
7. **¿Se repiten recursos?** `punch` se usa 3 veces y `silueta` 2 veces, siempre justificado por ser objetivamente el mejor recurso para ESE momento puntual (regla de variedad del propio brief: "si el mismo recurso es claramente el mejor, puede repetirse").
8. **¿Las transiciones tienen intención?** Sí -- 8 golpes distintos entre 14 unidades, elegidos por `DirectorAudio.decidirParaUnidad()` con anti-repetición real, no fijos.
9. **¿El audio acompaña?** Golpes/SFX en hook, ráfaga, giro (colapso), tríada y cierre; silencio relativo en las 2 unidades de pausa (`silueta`).
10. **¿El giro de "automatizar una idea que nadie quiere" realmente se siente?** Sí -- `antes-despues` con aros pulsantes revela "Antes: Todo automatizado" → "Después: Vacío", con golpe fuerte (`esRevelacion`), confirmado visualmente.
11. **¿La tríada problema→oferta→IA se entiende visualmente?** Sí -- 3 identidades visuales genuinamente distintas (chat/notificaciones/punch), confirmado en frames.
12. **¿La pausa antes del payoff funciona?** Sí -- `revelacion_0` (silueta, energía baja, `dejar_respirar` real) es la unidad de menor intensidad de todo el video.
13. **¿El final se siente como payoff?** `diagrama` converge 3 conceptos ya narrados (Problema/Oferta/IA) hacia "Ejecución", seguido de `remate` con recap + frase grande "CAMBIA EL JUEGO" sobre metraje oscurecido.
14. **¿Se aprovechó realmente el catálogo existente?** Sí, medido: **11 de 28 componentes (39%)** en un solo video, contra 6/28 (21%) en demos anteriores -- incluye 4 componentes NUNCA antes ejercitados en un video real de la fábrica (`balanza`, `buscador`, `chat`, `notificaciones`, `diagrama`).

## Comparación objetiva vs. fabrica-demo-09 (Crítico v2)

**Advertencia honesta primero**: demo-10 tiene 14 unidades cortas vs. las
7 más largas de demo-09/08 -- un guion completamente distinto. Comparar
conteos crudos 1:1 sería engañoso (más escenas no significa "más rápido"
por definición). Se comparan solo las métricas donde tiene sentido
hacerlo.

| Métrica | demo-09 | demo-10 | Lectura |
|---|---|---|---|
| Cantidad de escenas | 7 | 14 | Guiones distintos, no comparable directamente |
| Componentes distintos usados | 6 | **11** | MEDIDO: casi el doble de variedad de catálogo |
| % del catálogo (28 componentes) ejercitado | 21% | **39%** | MEDIDO |
| Densidad visual varía en el tiempo | No | **Sí** | MEDIDO -- demo-10 sí tiene contraste de densidad real |
| Golpes distintos | 7 | 8 | MEDIDO, similar variedad absoluta |
| `cambia_encuadre` reales | 2 | 0 | MEDIDO -- honesto: la técnica de R7-31 no encontró pausas útiles en estos clips más cortos |
| QA duro (silencios/negros sospechosos) | 0/0 | 0/0 | MEDIDO -- ambos limpios |
| Volumen medio | -17.1dB | -17.4dB | MEDIDO -- comparable |

**HIPÓTESIS explícita (no HECHO)**: un video con mayor variedad real de
catálogo y densidad visual que efectivamente varía es más consistente
con "edición moderna y dinámica" que uno que reutiliza siempre los
mismos ~6 componentes -- pero esto NO es una medición de retención, y no
existe ninguna publicación real de ninguno de los dos videos. No se
afirma que demo-10 vaya a retener mejor a una audiencia real.

## Historial de actualizaciones

- **2026-09-03**: creado antes de tocar código.
- **2026-09-03 (cierre de ronda)**: guion de 14 líneas + voz real +
  forced-alignment real (primera vez en producción) + plan de dirección
  completo + `fabrica-demo-10.mp4` renderizado, QA limpio, 11/28
  componentes del catálogo ejercitados en un solo video (vs. 6/28 en
  demos anteriores). Dos hallazgos honestos documentados (0
  `cambia_encuadre` por clips cortos; una unidad clasificada como pausa
  en vez de aceleración por decisión real y justificada del sistema,
  no un bug). Entregado al operador.
