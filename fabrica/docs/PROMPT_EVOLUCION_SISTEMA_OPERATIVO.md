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
| 1 | Ciclo de capacidades conectado end-to-end | pendiente | |
| 2 | Skills, auditoría agresiva | pendiente | ya hay trabajo previo (R7-28) que reduce el alcance restante |
| 3 | Remotion más allá de "renderizador" | pendiente | ya hay trabajo previo (R7-24/25) que reduce el alcance restante |
| 4 | Motor de retención como motor de decisión | pendiente | |
| 5 | Sistema de patrones ampliado | pendiente | |
| 6 | Research Engine repetible | pendiente | ya existe `fabrica/research/`, evaluar contra lo pedido |
| 7 | MCP y conectores | pendiente | ya hay trabajo previo (R7-17, R7-28) que reduce el alcance restante |
| 8 | Video analysis (pipeline preparado) | pendiente | |
| 9 | Sistema de carruseles evolucionado | pendiente | ya existe `fabrica/carrusel/`, evaluar contra lo pedido |
| 10 | Sistema de aprendizaje real | pendiente | ya existe `fabrica/memoria/`, evaluar contra lo pedido |
| 11 | Motor de decisión (Decision Engine) | pendiente | ya existe `fabrica/decision_engine/`, evaluar contra lo pedido |
| 12 | Sistema de ventas conectado | pendiente | ya existe `fabrica/ventas/`, evaluar contra lo pedido |
| 13 | Sistema de configuración de estilo | pendiente | |
| 14 | QA real (medible, no solo JSON válido) | pendiente | ya existe `fabrica/qa/`, evaluar contra lo pedido |
| 15 | Autocrítica | pendiente | |
| 16 | Implementación real | pendiente | |
| 17 | Testing | pendiente | |
| 18 | Documentación | pendiente | |
| 19 | Resultado final (informe) | pendiente | |

## Historial de actualizaciones

- **2026-09-03**: creado este archivo con el texto completo del prompt
  (recibido dos veces, mismo contenido) antes de empezar cualquier
  trabajo, aplicando la lección de la ronda anterior (nunca depender
  solo de la memoria de la conversación para un prompt largo).
