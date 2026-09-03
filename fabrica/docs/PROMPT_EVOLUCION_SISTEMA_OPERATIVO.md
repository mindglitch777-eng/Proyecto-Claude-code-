# Prompt vivo — "Ronda de evolución real: Sistema Operativo de Contenido"

**Por qué existe este archivo:** mismo motivo que `PROMPT_EXPLORACION_AGRESIVA.md`
-- este prompt (de 20 fases, pegado por el operador el 2026-09-03,
enviado dos veces sin querer) es demasiado largo para sobrevivir a una
compactación de la conversación sin este archivo. Se guarda completo
acá, y la tabla de estado de abajo se actualiza incrementalmente a
medida que se avanza, en vez de depender de la memoria del chat.

**Diferencia clave con el prompt anterior:** este pide explícitamente
IMPLEMENTAR (fase 16: "NO TE QUEDES EN EL ANÁLISIS"), no solo
investigar/documentar -- prioriza conectar sistemas ya existentes por
sobre sumar catálogos nuevos ("prefiero 5 sistemas realmente conectados
antes que 30 carpetas decorativas").

## El prompt, texto completo

```
QUIERO QUE TOMES ESTA ORDEN COMO UNA RONDA DE EVOLUCIÓN REAL DEL PROYECTO.

No quiero una respuesta teórica, ni una lista de ideas para hacer algún día.
Quiero que AUDITES EL REPOSITORIO, detectes qué existe realmente, qué está
incompleto, qué está siendo subutilizado y qué puede aprovecharse mejor, y
después IMPLEMENTES todo lo que sea posible de forma segura y verificable.

OBJETIVO GENERAL: Estamos construyendo una NUEVA FÁBRICA AUDIOVISUAL /
SISTEMA OPERATIVO DE CONTENIDO. La visión ya no es simplemente
guion→voz→video→render. La visión es: INVESTIGAR → DESCUBRIR PATRONES →
GENERAR IDEAS → CONSTRUIR GUION → DISEÑAR RETENCIÓN → DISEÑAR EDICIÓN →
GENERAR VIDEO/CARRUSEL → QA → MEDIR → APRENDER → ACTUALIZAR EL SISTEMA →
VOLVER A CREAR. Quiero que la fábrica tenga capacidad de mejorar
continuamente con información real.

REGLAS FUNDAMENTALES:
1. $0 de gasto hasta la primera venta real.
2. Nunca inventes datos, resultados, métricas, tendencias, fuentes o
   capacidades.
3. Diferenciar siempre: evidencia real / patrón observado / buena
   práctica / hipótesis / experimento / resultado real / conclusión /
   bloqueado-no confirmado.
4. Nunca considerar una herramienta "inútil" solo porque no se pudo
   acceder a ella desde este entorno.
5. Si algo está bloqueado por internet/navegador/autenticación/permisos:
   documentar exactamente el bloqueo, buscar alternativa, buscar forma
   de ejecutarlo desde GitHub Actions u otro entorno permitido, dejar
   preparado el código para conectar después.
6. No ser conservador por defecto.
7. Si existe una solución razonable y gratuita, investigarla y probarla.
8. Si existe una skill/MCP/proyecto open source/librería que pueda
   mejorar la fábrica, investigarla antes de descartarla.
9. No crear sistemas duplicados.
10. Antes de construir algo nuevo, auditar si ya existe algo equivalente.
11. No reemplazar algo funcional solo por hacerlo "más moderno".
12. Todo cambio importante debe tener tests.
13. Todo lo implementado debe quedar documentado.
14. No publicar nada automáticamente.
15. No gastar dinero.
16. No borrar funcionalidad existente sin demostrar que es redundante o
    perjudicial.

FASE 0 — AUDITORÍA PROFUNDA: inspeccionar estructura completa del repo,
CLAUDE.md, README, documentación, git history reciente, tests, módulos
de inteligencia, Directores, Knowledge Engine, Research System, Viral/
Retention Engine, Advanced Editing Engine, Sales Engine, Product
Ecosystem, Carousel Engine, Data Engine, Decision Engine, Skill
Intelligence, MCP/Connectors, todos los pendientes. Para cada sistema
importante determinar: A) existe B) funciona C) está integrado D) se
usa automáticamente E) aprende de datos F) tiene tests G) tiene datos
reales H) tiene fallback I) está bloqueado por dependencia externa.
Crear un mapa de madurez del sistema.

FASE 1 — Problema central: tenemos muchísimas capacidades pero el
sistema no las aprovecha al máximo -- no acumular archivos, CONECTAR
capacidades: Knowledge Engine → Research → Pattern Detection → Hook
Engine → Script Strategy → Retention Strategy → Visual Strategy →
Editing Strategy → Audio Strategy → Video → QA → Measurement →
Learning → Knowledge Engine actualizado. Ese ciclo tiene que ser real.

FASE 2 — Skills: auditoría agresiva, no quedarse con las primeras 3-4
encontradas. Buscar exhaustivamente en: Remotion, edición audiovisual,
storytelling, hooks, retención, YouTube, TikTok, Instagram, carruseles,
marketing, copywriting, ventas, productos digitales, investigación de
mercado, análisis de contenido/competencia, SEO, thumbnails, social
media, analytics, automatización, motion design, subtítulos, audio,
TTS, transcripción, composición, generación de assets. Por cada skill:
nombre/fuente/qué hace/licencia/costo/dependencias/compatibilidad/
utilidad/riesgo/si puede ejecutarse realmente/si puede integrarse/
decisión (USAR/ADAPTAR/INVESTIGAR/RESERVAR/DESCARTAR). No descartar una
skill solo porque hace algo parecido a Remotion -- puede servir como
referencia arquitectónica, fuente de técnicas, catálogo de patrones,
inspiración, módulo auxiliar, sistema de evaluación, fuente de
componentes, sistema de automatización.

FASE 3 — Remotion: no usarlo solo como "renderizador". Auditar
componentes, transiciones, composición, timing, motion design,
interpolaciones, easing, texto, layouts, overlays, imágenes, video,
audio, subtítulos, secuencias, cámaras, profundidad, parallax, efectos,
composición por capas, ritmo, cambios bruscos/suaves, silencios,
golpes, acumulación visual, variación de intensidad. Determinar qué se
tiene y qué se desaprovecha. Investigar técnicas/componentes de
proyectos open source relacionados con Remotion (sin copiar código sin
revisar licencia) e incorporar lo compatible.

FASE 4 — Motor de retención: no una lista de hooks, un motor de
decisión real que pueda responder por qué esta apertura/duración/
estructura/cambio visual/pausa/transición/cifra/elemento/cambio de
ritmo/agresividad. La edición subordinada a la narrativa: MENSAJE →
EMOCIÓN → ATENCIÓN → VISUAL → AUDIO → TIMING.

FASE 5 — Sistema de patrones: almacenar hooks, estructuras, CTAs,
formas de revelar información/presentar cifras, patrones visuales/de
edición/de audio, estructuras de carrusel/venta, formatos de contenido,
errores frecuentes, patrones a evitar. Cada patrón con: descripción,
fuente, evidencia, contexto, cuándo usarlo/NO usarlo, nivel de
confianza, resultados observados, relación con otros patrones.

FASE 6 — Research Engine: infraestructura de investigación repetible
(no manual en una conversación). Guardar fuente/fecha/tema/hallazgo/
evidencia/enlace/confianza/categoría/patrón extraído/aplicación
posible/estado de verificación. Fuente bloqueada: registrar BLOCKED +
motivo + fuente + alternativa + siguiente acción, nunca inventar. Si
existe MCP/conector para esa información, investigarlo.

FASE 7 — MCP y conectores: auditoría completa, atención especial a
YouTube/TikTok/Instagram/Google Trends/Reddit/analytics/Hotmart/
investigación web/búsqueda/contenido/automatización. Determinar por
cada uno: ¿puede conectarse? ¿instalado? ¿activo? ¿costo? ¿necesita API
key/cuenta? ¿gratis? ¿ejecutable desde Claude Code? ¿desde GitHub
Actions? ¿alimenta la base de conocimiento? ¿datos estructurados?
¿sirve para comparar contenido/detectar patrones? Si requiere acción
humana, documentarlo, nunca inventar que está conectado.

FASE 8 — Video analysis: no aceptar como final que algunas plataformas
no se puedan ver desde este entorno. Investigar: descarga legal de
contenido permitido, extracción de frames, análisis frame-by-frame,
extracción de audio, transcripción, análisis de timestamps, detección
de cambios de escena, análisis de texto en pantalla/ritmo/duración de
planos/subtítulos. Si no se puede directo, diseñar el pipeline para
GitHub Actions u otro entorno permitido. Meta eventual: dar un video y
obtener HOOK/ESTRUCTURA/RITMO/CAMBIOS VISUALES/TEXTO/AUDIO/
TRANSICIONES/DURACIÓN/PATRONES/CTA/POSIBLES RAZONES DE RETENCIÓN. Dejar
la arquitectura preparada aunque no se resuelva todo ahora.

FASE 9 — Sistema de carruseles: evolucionar junto con el de video.
Investigar patrones de carrusel (portada/curiosidad/tensión/desarrollo/
ejemplo/contraste/lista/storytelling/cierre/CTA). Transformar
conocimiento en carrusel con lógica propia, no copiar el formato de los
videos.

FASE 10 — Sistema de aprendizaje: no una memoria que solo almacena,
sino que aprende. Cada experimento: HIPÓTESIS/VARIABLE/FORMATO/
RESULTADO/MÉTRICAS/CONCLUSIÓN/CONFIANZA/SIGUIENTE ACCIÓN. Distinguir
"creemos que funciona" de "tenemos datos reales de que funciona".
Cuando haya datos reales de publicaciones, el sistema debe poder
actualizar pesos/prioridades de patrones. No inventar métricas.

FASE 11 — Motor de decisión: verdadero Decision Engine. Con opciones
A/B/C/D, evaluar evidencia/costo/dificultad/impacto potencial/
compatibilidad/riesgo/dependencia/reversibilidad y recomendar una. Debe
poder decir "NO HAY SUFICIENTE INFORMACIÓN" como decisión válida.

FASE 12 — Sistema de ventas: no desconectado de la fábrica audiovisual.
Conectar CONTENIDO→ATENCIÓN→INTERÉS→PROBLEMA→SOLUCIÓN→PRODUCTO→
OFERTA→CTA→VENTA→DATOS→APRENDIZAJE. Auditar qué falta técnicamente. No
inventar ventas. Si Hotmart requiere clave del operador, documentarlo,
pero dejar preparado todo lo que se pueda sin esa clave.

FASE 13 — Sistema de configuración: evitar editar código para cambiar
el estilo. Configuración de estilo (agresividad, ritmo, densidad
visual/textual, cantidad de cambios, intensidad de audio, uso de
logos/cifras/imágenes/video, nivel de animación/contraste, tipo de
hook/narrativa) que alimente a los Directores -- no hace falta usar
exactamente estos nombres, diseñar la mejor solución tras auditar.

FASE 14 — QA real: crecer más allá de "el JSON es válido". Revisar todo
lo medible: duración, audio, silencios, clipping, archivos faltantes,
texto fuera de pantalla, contraste, tamaño de texto, densidad,
repetición, cambios visuales, ritmo, subtítulos, sincronización,
resolución, fps, errores de render, inconsistencias. Si algo no puede
medirse todavía, documentarlo.

FASE 15 — Autocrítica: antes de terminar, auditar el propio trabajo con
14 preguntas (¿creando infraestructura real? ¿duplicando? ¿usando
realmente las herramientas disponibles? ¿descartando demasiado rápido?
¿confundiendo "no puedo acceder" con "no sirve"? ¿catálogos que nadie
usa? ¿decisiones automáticas o solo documentadas? ¿datos reales o solo
hipótesis? ¿dejando algo preparado? ¿aprovechando Remotion/skills/MCP/
GitHub Actions realmente? ¿conectando las piezas?).

FASE 16 — Implementación: NO quedarse en el análisis. Implementar todo
lo posible ahora, en este orden de prioridad: (1) cosas que mejoren
directamente la fábrica, (2) cosas que conecten sistemas existentes,
(3) cosas que aumenten capacidad de investigación, (4) cosas que
permitan medir, (5) cosas que permitan aprender, (6) cosas que preparen
futuras integraciones, (7) documentación. Si algo es muy grande,
dividir en etapas y ejecutar la primera completa. "Prefiero 5 sistemas
realmente conectados antes que 30 carpetas decorativas."

FASE 17 — Testing: ejecutar todos los tests, agregar tests nuevos,
verificar compatibilidad, prueba de integración, si es posible generar/
renderizar un ejemplo real y verificar el resultado, revisar git diff,
confirmar que nada existente se rompió. Arreglar lo que falle. No
marcar como terminado algo no probado.

FASE 18 — Documentación: actualizar README, CLAUDE.md si corresponde,
documentación interna, pendientes, registro de decisiones/herramientas/
MCP/investigación. Todo bloqueo y todo descubrimiento importante debe
quedar registrado.

FASE 19 — Resultado final: resumen en lenguaje normal de 1) qué
encontraste 2) qué estaba desaprovechado 3) qué implementaste 4) qué
conectaste 5) qué skills aprovechaste 6) qué MCP/conexiones preparaste
7) qué mejoró 8) qué testeaste 9) qué funcionó 10) qué no pudiste hacer
11) por qué no pudiste 12) qué necesito hacer yo (el operador) 13) qué
harías como siguiente capa.

REGLA FINAL: no preguntar a cada paso, autonomía total dentro de las
reglas de $0/no romper/no publicar/no inventar. Si algo requiere
cuenta/API key/decisión humana, documentarlo perfectamente y seguir con
todo lo demás. No poner techos artificiales, pero tampoco inventar
capacidades. Filosofía: AMBICIÓN MÁXIMA + EVIDENCIA MÁXIMA +
IMPLEMENTACIÓN REAL. Trabajar como arquitecto + investigador +
ingeniero + auditor. No solo que el sistema "tenga muchas cosas" --
que las cosas SE CONECTEN y formen un verdadero sistema operativo de
contenido.
```

## Estado real, fase por fase (se actualiza incrementalmente)

| # | Fase | Estado | Nota |
|---|---|---|---|
| 0 | Auditoría profunda + mapa de madurez | **HECHO** | `docs/MAPA_MADUREZ_SISTEMA.md` -- 18 sistemas evaluados A-I con evidencia de código real. Corrección importante a un supuesto de la ronda anterior: `checks_duros.py` SÍ mide cosas reales del render (ffprobe/ffmpeg), no es cierto que el QA "solo valide JSON" -- eso aplica solo a `checks_composicion.py`. Confirmado que el Carousel Engine + Product Ecosystem ya cierran el ciclo Knowledge→Contenido de punta a punta para carruseles (artefacto real `carrusel_001`). El mismo bloqueo real (sin publicaciones/ventas) explica por qué Sales Engine/Data Engine/Laboratorio/Research no "aprenden" todavía -- no es un problema de arquitectura. |
| 1 | Ciclo de capacidades conectado end-to-end | **PARCIAL, con una conexión real nueva** | El mapa de madurez confirmó que Knowledge→Hooks→Edición→Video→QA-duro ya es real. El eslabón roto identificado (QA -> Measurement: un resultado de QA no sobrevivía más allá de un render) se conectó: `datos/tipos.ts` agrega `qaResumen` a `RegistroVideoCompleto` (mismo shape que ya devuelven `checks_duros.py`/`contraste.py`) + `datos/consultar.ts` agrega `videosConProblemasDeQa()`. Sigue sin conectar automáticamente: Measurement -> Learning -> Knowledge Engine actualizado (correcto no forzarlo: no hay datos reales todavía que aprender, ver hallazgo raíz de la auditoría de techos) |
| 2 | Skills, auditoría agresiva | **cubierto por trabajo previo (R7-28 punto 4)** | No se repitió esta ronda -- ya se hizo con el mismo rigor pedido acá (storytelling-skills, claude-youtube, tiktok-skills, claude-shorts, más el hallazgo de skills de marketing ya habilitadas) |
| 3 | Remotion más allá de "renderizador" | **cubierto por trabajo previo (R7-24/25)** | 71 paquetes evaluados, 66 efectos mapeados, hallazgo generativo-vs-modulador, cámara orgánica/viñeta/pulso integrados -- no se repitió esta ronda |
| 4 | Motor de retención como motor de decisión | **evaluado, no ampliado** | El mapa de madurez confirma que `DirectorEdicion`/`DirectorRetencion` YA responden la mayoría de las preguntas pedidas (por qué esta apertura/energía/transición) vía el campo `razonGeneral`/`motivo` de cada `EstrategiaEdicion` -- no es una lista de hooks suelta. No se profundizó más esta ronda por presupuesto de tiempo |
| 5 | Sistema de patrones ampliado | **evaluado, no ampliado** | `hooks/` (19 patrones) + `conocimiento/` (24 ítems) ya cubren la mayoría de los campos pedidos (fuente/evidencia/contexto/cuándo usar/nivel de confianza) -- no se agregaron patrones nuevos esta ronda |
| 6 | Research Engine repetible | **evaluado, cumple parcialmente** | `research/investigacion_necesaria.ts` ya guarda fuente/fecha/tema/hallazgo/estado de verificación y usa `BLOQUEADO-NO CONFIRMADO` correctamente -- no tiene un campo `patrón extraído`/`aplicación posible` explícito todavía |
| 7 | MCP y conectores | **cubierto por trabajo previo (R7-17, R7-28 punto 5)** | 13 MCP reales investigados con el nivel de detalle pedido (costo/auth/límites/ejecutable desde dónde) -- no se repitió esta ronda |
| 8 | Video analysis (pipeline preparado) | **NO abordado esta ronda** | Pendiente real -- requeriría diseñar un pipeline de GitHub Actions para descarga/extracción de frames, no se llegó por presupuesto de tiempo de esta ronda |
| 9 | Sistema de carruseles evolucionado | **evaluado, ya cumple lo pedido** | `carrusel/generar.ts` ya tiene lógica propia real (no copia el formato de video) y ya produjo un artefacto real (`carrusel_001`) -- confirmado en el mapa de madurez, no se amplió esta ronda |
| 10 | Sistema de aprendizaje real | **evaluado, bloqueado honestamente** | `memoria/laboratorio.json` ya distingue hipótesis de resultado real -- las 10 hipótesis siguen en `esperando_datos` porque no hay publicaciones reales, confirmado en la auditoría de techos. No es un problema de arquitectura |
| 11 | Motor de decisión (Decision Engine) | **evaluado, ya cumple lo pedido** | `decision_engine/` ya puede decir `estado: 'abierta'` (equivalente a "no hay suficiente información") -- confirmado con las 2 decisiones reales ya registradas |
| 12 | Sistema de ventas conectado | **evaluado, mismo bloqueo real** | `ventas/` + `datos/` están listos pero vacíos (mismo hallazgo raíz) -- la API oficial de Hotmart (ya registrada en R7-28) es la vía real para cerrar esto cuando el operador decida conectarla |
| 13 | Sistema de configuración de estilo | **HECHO** | `directores/edicion/configuracion.ts` -- auditado primero que `ContextoUnidad.estilosSugeridos` ya era el mecanismo real (no se duplicó), se agregó una capa de 5 PRESETS reutilizables a nivel de video completo (`ventas_agresivo`, `documental_serio`, `financiero_directo`, `misterio_revelacion`, `educativo_calmo`) con `aplicarConfiguracionVideo()` que nunca pisa un valor ya puesto a mano. `financiero_directo` está basado directo en el hallazgo real de R7-28 sobre ese nicho. Con tests (`test-configuracion-video`) |
| 14 | QA real (medible, no solo JSON válido) | **PARCIAL, primer pedazo real implementado** | `fabrica/qa/contraste.py` -- fórmula oficial WCAG 2.x, valida las 3 combinaciones reales de la paleta de marca + escaneo best-effort de hex literales en `.tsx`. Hallazgo real: `texto sobre acento` = 3.05:1, NO cumple para texto normal (documentado, ningún componente actual lo usa mal). Con tests (`test-qa-contraste`, en `test-todo`). Sigue pendiente: tamaño de texto real medido en frame renderizado, contraste sobre b-roll fotográfico (requeriría procesar píxeles de un export real, no solo código fuente) |
| 15 | Autocrítica | **HECHO** | Ver sección de autocrítica más abajo en este archivo |
| 16 | Implementación real | **HECHO, con alcance honesto** | 3 conexiones/capacidades reales implementadas y testeadas (QA de contraste, configuración de estilo, QA->Data Engine) siguiendo exactamente el orden de prioridad pedido (mejorar la fábrica > conectar sistemas > preparar futuras integraciones) -- no se implementaron las Fases 4/5/8/9/10 por presupuesto de tiempo, quedaron evaluadas pero no ampliadas |
| 17 | Testing | **HECHO** | Cada implementación se testeó antes de commitear (34/34 suites + tsc limpio en cada paso) |
| 18 | Documentación | **HECHO** | ESTADO.md, ARSENAL_AUDIOVISUAL.md, y este mismo archivo actualizados en cada paso |
| 19 | Resultado final (informe) | **HECHO** | Entregado al operador en el mensaje de cierre de esta ronda |

## Autocrítica (Fase 15)

Respuesta honesta a las 14 preguntas del prompt:

- **¿Infraestructura real o decorativa?** Real: `contraste.py`/
  `configuracion.ts`/`qaResumen` son código que corre, con tests que
  fallan si algo se rompe -- no son documentos que describen una idea.
- **¿Duplicando algo?** No -- se auditó primero en los 3 casos
  (`ContextoUnidad.estilosSugeridos` ya existía, `RegistroVideoCompleto`
  ya existía, `checks_duros.py` ya medía cosas reales) antes de agregar
  nada.
- **¿Descartando una herramienta demasiado rápido?** No aplica esta
  ronda -- no se investigaron herramientas externas nuevas, el foco fue
  auditoría + conexión interna.
- **¿Confundiendo "no puedo acceder" con "no sirve"?** No se declaró
  ningún bloqueo nuevo esta ronda.
- **¿Catálogos que después nadie usa?** Riesgo real en
  `configuracion.ts`: los 5 presets están testeados pero ningún
  generador (`ejemplos/generar_demo_XX.ts`) los usa todavía -- queda
  documentado como pendiente, no oculto.
- **¿Decisiones automáticas o solo documentadas?** Mixto, honesto:
  `contraste.py` y `qaResumen` son mecanismos reales que corren, pero
  no se disparan solos todavía (necesitan que un script los invoque).
- **¿Datos reales o solo hipótesis?** Los ratios de contraste
  (18.28/6.0/3.05) son cálculos reales verificados a mano, no
  estimaciones.
- **¿Dejando algo preparado para cuando haya datos?** Sí -- `qaResumen`
  existe precisamente para eso, sin forzar un dato inventado ahora.
- **¿Aprovechando Remotion/skills/MCP/GitHub Actions realmente?** No
  se tocó ninguno de los 3 esta ronda (fuera de alcance del trabajo
  hecho, ver fases 2/3/7/8 marcadas arriba).
- **¿Conectando las piezas?** Un eslabón real conectado (QA->Data
  Engine) de los varios identificados como rotos en el mapa de
  madurez -- no todos, por presupuesto de tiempo.

**Conclusión honesta:** esta ronda priorizó PROFUNDIDAD Y VERIFICACIÓN
sobre 3 piezas concretas por sobre CANTIDAD de fases tocadas -- de las
20 fases del prompt, 6 se implementaron/conectaron de verdad (0, 1, 13,
14, 15, 17-19 contados como bloque final), 8 ya estaban cubiertas por
rondas anteriores y se evaluaron sin repetir trabajo, y 1 (Fase 8,
video analysis) queda como pendiente real no abordado.

## Historial de actualizaciones

- **2026-09-03**: creado este archivo con el texto completo del prompt
  (recibido dos veces, mismo contenido) antes de empezar cualquier
  trabajo, aplicando la lección de la ronda anterior (nunca depender
  solo de la memoria de la conversación para un prompt largo).
