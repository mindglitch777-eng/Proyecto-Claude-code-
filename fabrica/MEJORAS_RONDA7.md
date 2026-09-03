# Ronda 7 — De fábrica audiovisual a sistema operativo de contenido + ventas

Origen: la "NUEVA DIRECTIVA — EVOLUCIÓN DE LA NUEVA FÁBRICA
AUDIOVISUAL", pedida explícitamente por el operador después de varias
sesiones de profundizar el tema, con instrucción de ser "bastante
ambiciosos" pero mantener el sistema "funcional y entendible", buscar
"TODA la información disponible" (no quedarse con algo específico), y
trabajar de forma autónoma sin bloquear preguntando lo ya decidido.
Pide evolucionar la fábrica de "generador de videos" a una fábrica
autónoma de contenido + marketing + productos digitales, con una regla
central: nunca depender solo de prueba-y-error, siempre con
conocimiento investigado/evidencia/patrones observados/hipótesis
explícitas, nunca inventando datos.

Este documento es el resumen técnico de punta a punta de Ronda 7. El
mapeo completo de la directiva contra el estado real, en
`fabrica/docs/AUDITORIA_SISTEMA_OPERATIVO.md`; las decisiones de diseño
tomadas, en `fabrica/decisions/DECISIONES.md`; lo pendiente/bloqueado,
en `fabrica/PENDIENTES.md` (ítem 15 en particular).

## Regla de lectura de este documento

Ronda 7 construye DOS tipos de cosas muy distintas y es importante no
confundirlas:

1. **Motores de conocimiento/criterio** (Knowledge, Research, Skill
   Intelligence, Viral/Retention, Advanced Editing, Decision Engine) --
   tienen contenido REAL cargado (investigación real, patrones reales,
   decisiones reales) y tests que lo verifican. Esto es trabajo
   terminado y verificable hoy.
2. **Motores de negocio** (Sales Engine, Product Ecosystem, Carousel
   Engine generador completo, Data Engine) -- son ARQUITECTURA tipada y
   testeada, pero sus datos reales están **vacíos a propósito**:
   ninguna venta, ningún lead, ningún producto es inventado. Se llenan
   cuando haya datos reales del negocio (ver PENDIENTES.md ítem 15).

Ningún motor de la categoría 2 fue completado "figurativamente" para
aparentar avance -- están vacíos porque de verdad no hay datos todavía,
y decirlo así es parte de la regla de "nunca inventar evidencia" que
pide la propia directiva.

## R7-0/R7-1 — Auditoría + investigación amplia

`fabrica/docs/AUDITORIA_SISTEMA_OPERATIVO.md` mapea cada pedido de la
directiva contra lo que ya existía de Ronda 6 (Knowledge/Hook/Editing/
Experiment Engine en alguna forma) contra lo que es dominio de negocio
enteramente nuevo (Sales/Product/Carousel/Data Engine). Investigación
real ampliada: papers académicos citables (Loewenstein 1994 - brecha
de curiosidad, Zeigarnik 1927 - tareas incompletas, Silvia 2005 -
appraisal de interés), frameworks de storytelling con autor/fuente
(Pirámide de Freytag 1863, StoryBrand, PAS, Pixar Story Spine),
frameworks de venta con autor/fuente (Value Ladder de Russell Brunson,
funnel lead-magnet/tripwire), y una skill nueva de GitHub
(`ali-abassi/remotion-templates`, 1000+ templates). También se
investigaron y **rechazaron formalmente** estadísticas de blogs SEO no
verificables (84.3% de retención en TikTok, "TikTok Creator Health
Score") -- quedaron registradas como descartadas en el Research System,
no se usaron ni se inventó una fuente falsa para ellas.

## R7-2 — Knowledge Engine v2

`fabrica/conocimiento/` se reescribió con el vocabulario exacto que
pide la directiva: `nivel` pasa a ser
`evidencia | patron_observado | buena_practica | hipotesis |
experimento | resultado_real | conclusion` (antes era una
clasificación más granular propia de Ronda 6). Solo `evidencia` y
`resultado_real` pueden marcar `confirmado: true`
(`NIVELES_CONFIRMADOS`). `categoria` cubre las 27 categorías nombradas
en la directiva (hooks, retención, storytelling, ventas, funnels,
productos_digitales, carruseles, skills, herramientas, etc.). 14 items
reales cargados -- los 6 de Ronda 6 migrados sin perder contenido, más
8 nuevos de la investigación de R7-1.

## R7-3 — Research System formal

`fabrica/research/` -- cuando una fuente no se puede acceder (ej.
TikTok Creator Academy bloqueado por egress restringido en este
sandbox) o un dato no se puede verificar, se registra formalmente
como `InvestigacionNecesaria` (pregunta/fuente propuesta/qué
falta/bloqueo/estado) en vez de inventar la respuesta o ignorar el
vacío en silencio. 4 entradas reales, incluida la del bloqueo de
egress y la del descarte de estadísticas no verificables.

## R7-4 — Skill Intelligence System

`fabrica/skills/` tipa lo que ya estaba en prosa en
`INVESTIGACION_HERRAMIENTAS.md` (14 herramientas migradas) más 1 nueva
(`remotion-templates-1000-ai-agents`). Cada entrada declara
capacidad/utilidad/dependencias/licencia/riesgo/decisión
(usar/probar/descartar/confirmado_sin_accion) -- nunca "copiar código
porque existe", siempre con una decisión explícita y su motivo.

## R7-5 — Viral/Retention Engine ampliado

`fabrica/hooks/` (antes "Hook Engine", ahora nombrado como pide la
directiva) pasó de 4 a 18 patrones, cubriendo las 14 categorías
pedidas (apertura, curiosidad, contradicción, sorpresa, escalada,
revelación, comparación, tensión, recompensa, cambio de perspectiva,
storytelling, ritmo, cierre, CTA). Nueva función `explicarPatron(id)`
responde exactamente las 4 preguntas que pide la directiva para el
Director de Retención: ¿qué patrón? ¿por qué? ¿qué evidencia (o es
solo observado)? ¿de qué depende?. Conectado al Director de Retención
real (`fabrica/directores/retencion/retencion.ts`) vía un campo
opcional `patronesRetencion` en `EscenaComposicion` -- si una escena no
lo declara (100% de los videos ya generados), el comportamiento es
idéntico al de antes, confirmado con tests de retrocompatibilidad.

## R7-6 — Advanced Editing Engine

`fabrica/directores/edicion/tecnicas.ts` cataloga 12 técnicas de
edición reales ya implementadas en el motor (golpes, transiciones,
anticipo, anti-repetición, microeventos, multi-audio, 3D, énfasis) con
un campo obligatorio `subordinadoA` (nunca vacío: siempre
narrativa/retención/comprensión/impacto) -- ninguna técnica puede
existir "porque queda bonito" sin declarar a qué sirve. Una de las 12
entradas documenta explícitamente que el ciclo render→extraer
frames→inspeccionar→corregir→re-render que pide la directiva YA existe
(`fabrica/laboratorio/ciclo_mejora.ts`, Ronda 4) -- no se reconstruyó.

## R7-7 — Experimentation Engine alineado

No se construyó un sistema nuevo: `fabrica/memoria/tipos.ts` ya tenía
`EntradaLaboratorio` con la forma que pide la directiva
(Hipótesis→Variables→Implementación→Resultado→Datos→Conclusión) desde
Ronda 5. Se agregó un comentario de documentación que cruza
explícitamente el vocabulario de la directiva con los campos reales
existentes, y se confirmó que la separación entre score interno y
resultado real ya es estructural (no se puede confundir uno con otro
en el tipo).

## R7-8 — Sales Engine (arquitectura)

`fabrica/ventas/` tipa el pipeline completo que pide la directiva:
Audiencia→Problema→Oportunidad→Producto→Oferta→LeadMagnet→Lead→
Nutrición→Conversión→Entrega→Feedback→Retención, con 12 tipos de
producto digital soportados y `EstadoHipotesisNegocio` explícito
(sin_validar/validando/validada/invalidada) para nunca tratar una
hipótesis de negocio como un hecho. `validarCadena()` verifica
integridad referencial de punta a punta. **Todos los arrays de datos
reales están vacíos** -- no hay ninguna venta, lead ni oferta todavía;
`resumenFunnel()` devuelve honestamente todo en cero en vez de simular
números.

## R7-9 — Product Ecosystem

`fabrica/ecosistema_producto/` -- una pieza de conocimiento puede
derivar en múltiples formatos de salida (video, carrusel, guía,
lead-magnet, módulo de curso, email, post, experimento) sin duplicar
contenido: cada `DerivacionFormato` referencia por id la fuente en el
Knowledge Engine, nunca copia el texto. Array de derivaciones reales
vacío por ahora (no hay contenido derivado todavía, ver PENDIENTES).

## R7-10 — Carousel Engine

Primer motor de contenido no-video de la fábrica.
`fabrica/carrusel/` define la estructura (portada/hook/desarrollo/
ejemplo/cta) reutilizando 100% el Knowledge Engine y el Viral/Retention
Engine ya construidos (mismo principio de "una sola fuente de
verdad"). `remotion-spike/src/carrusel/CarruselSlide.tsx` es el primer
componente real, renderizado de verdad (no solo tipeado) con
`npx remotion still` a 1080x1350 -- 3 PNGs reales inspeccionados
visualmente confirman colores/texto/indicador "N / total" correctos.
`validarEstructura()` compara contra el patrón real del Knowledge
Engine (`carrusel-estructura-hook-valor-cta`).

## R7-11 — Data Engine

`fabrica/datos/` -- esquemas para métricas de video (reutiliza
`ResultadoReal` de `memoria/tipos.ts`, no lo duplica) y métricas de
producto (`RegistroProducto`), con `registrarVideo()`/
`registrarProducto()` listos para carga manual el día que haya datos
reales de publicación/ventas, con validación de integridad referencial
contra los catálogos reales de componentes y patrones.

## R7-12 — Decision Engine

`fabrica/decision_engine/` -- plantilla formal Opción A/B/C que pide
la directiva (nunca "la más fácil" ni "la más compleja" sin más,
siempre comparación real con ventajas/desventajas/dependencias/costos/
riesgos/potencial/complejidad declaradas para cada opción). Se aplicó
a una decisión real: dónde poner el esfuerzo después de cerrar Ronda 7
(profundizar video / expandir Carousel Engine / validar el Sales
Engine con datos reales). Recomendación: validar el Sales Engine es lo
único que avanza el objetivo real de negocio (CLAUDE.md, Fase 1), pero
requiere información que solo el operador puede dar -- registrado como
pregunta abierta real en `PENDIENTES.md` ítem 15 (audiencia, problema,
oferta/precio a probar, datos existentes). Mientras se espera
respuesta, se recomienda seguir con la opción B (expandir Carousel
Engine) como trabajo autónomo de mayor impacto.

## Qué NO se hizo esta ronda (y por qué)

- **No se inventó ningún dato de negocio** -- Sales Engine, Product
  Ecosystem y Data Engine son arquitectura real y testeada, pero
  vacíos de contenido real a propósito. Llenarlos con datos de mentira
  para "que se vea completo" violaría directamente la regla central de
  la directiva (nunca inventar evidencia).
- **No se construyó un generador completo de carruseles** (8-10
  slides automático) -- se probó y confirmó el primer componente real;
  construir el generador completo queda como parte de la opción B
  recomendada por el Decision Engine para la próxima ronda.
- **No se conectó el Viral/Retention Engine a la elección automática**
  del Director de Edición -- sigue siendo, como en Ronda 6, un
  catálogo consultable de alto valor pero de integración deliberada-
  mente diferida (cambio de mayor riesgo sobre lógica que ya funciona
  bien).
- **No se tocaron subtítulos** (`@remotion/install-whisper-cpp` +
  `@remotion/captions`) -- sigue en PROBAR desde Ronda 5, no era
  prioridad de esta directiva.
- **Cero videos ni carruseles de producción nuevos generados** -- el
  foco de la directiva era construir el sistema operativo completo, no
  producir contenido nuevo esta ronda.

## Tests

22 suites de test en `fabrica/` (10 nuevas de Ronda 7: `research/`,
`skills/`, `ventas/`, `ecosistema_producto/`, `carrusel/`, `datos/`,
`decision_engine/`, más las reescrituras de `conocimiento/` y
`hooks/`, más las extensiones a `composicion/` y `directores/retencion/`),
todas verdes. `npx tsc --noEmit` limpio en `fabrica/`. Ningún generador
de demo anterior ni el pipeline de video existente cambió de
comportamiento -- confirmado con tests de retrocompatibilidad
explícitos (campos nuevos siempre opcionales, ausencia de campo =
comportamiento idéntico a antes de Ronda 7).

## Próximo paso (según el propio Decision Engine, R7-12)

1. **Bloqueado en el operador**: responder las 3 preguntas de
   `PENDIENTES.md` ítem 15 (audiencia real, oferta/precio a probar,
   datos existentes) para empezar a cargar `fabrica/ventas/` y
   `fabrica/datos/` con información real -- es la única vía que avanza
   directamente el objetivo de Fase 1 (CLAUDE.md).
2. **Autónomo mientras se espera respuesta**: expandir el Carousel
   Engine a un generador completo (8-10 slides desde un tema), más
   tipos de slide reales.
3. Confirmar `@remotion/effects`/`@remotion/three` en el runner real de
   GitHub Actions (pendiente desde Ronda 6, sigue sin confirmar).
4. Confirmar licencia real de `ali-abassi/remotion-templates` antes de
   usar cualquier template concreto de ahí (Research System, pendiente).
