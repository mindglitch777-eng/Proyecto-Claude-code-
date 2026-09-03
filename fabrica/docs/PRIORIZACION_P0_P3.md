# Priorización P0-P3 (punto 15 del prompt de exploración agresiva)

Toma TODO lo descubierto y registrado hasta R7-28 (`fabrica/mcp/registro.ts`,
`fabrica/skills/registro.ts`, `fabrica/docs/ARSENAL_AUDIOVISUAL.md`, los
hallazgos de `fabrica/docs/AUDITORIA_TECHOS_FABRICA.md`) y le pone una
prioridad real, no una lista plana. Criterio de prioridad: impacto real
sobre el objetivo de negocio (CLAUDE.md, Fase 1: primera venta real) y
sobre la calidad audiovisual, ponderado por costo/riesgo/si depende de
una decisión del operador.

## P0 — Imprescindible

Cosas que cierran un hueco real ya identificado, con $0 de costo y sin
depender de una decisión de arquitectura mayor.

1. **API oficial de Hotmart** (`mcp/registro.ts`, id `hotmart-api-oficial`)
   — es la pieza que le falta al Sales Engine (`fabrica/ventas/`, hoy
   con `REGISTROS_VIDEO`/`REGISTROS_PRODUCTO` vacíos, hallazgo raíz de
   la auditoría de techos). Bloqueado por credenciales del operador, no
   por nada técnico — es P0 de IMPACTO, no de "hacer ya".
2. **QA de contraste/legibilidad real sobre frames renderizados**
   (nuevo, motivado por `conocimiento/base.ts` id
   `contraste-texto-wcag-legibilidad` + hallazgo #7 de la auditoría de
   techos) — hoy el QA de la fábrica audita solo estructura (JSON), no
   el frame real. Implementable YA con $0 (Pillow, ya disponible) sin
   depender de nadie. **Candidato concreto para la próxima ronda de
   código real, no solo investigación.**
3. **Reddit Research MCP** (`mcp/registro.ts`, id `reddit-research-mcp`)
   — sin cuenta, sin clave, sin límite documentado, responde directo a
   "qué le pasa a gente real" (sección 5). Usable HOY mismo.

## P1 — Muy valioso

Aporta calidad/capacidad real, $0, pero no es un hueco urgente ni
bloqueante.

4. **GoogleTrendsMCP (cryptoken)** (`mcp/registro.ts`) — validar interés
   de búsqueda real de un tema de guion antes de producir el video.
5. **carousel-narratives** (`skills/registro.ts`, id
   `storytelling-skills-yaxeen`) — el Carousel Engine (`fabrica/carrusel/`)
   hoy no tiene ninguna capa narrativa, solo estructura de slides.
6. **Beat-sync BPM → golpes de `directores/audio.ts`** (Decision Engine,
   id `beat-sync-cuando-conectar`) — dato ya medido (R7-26), decisión ya
   tomada de esperar un video de prueba dedicado (demo_08) antes de
   tocar producción.
7. **@remotion/rounded-text-box + @remotion/gsap** — ya probados y
   funcionando (R7-25), listos para integrar cuando un guion concreto
   lo necesite (cajas de texto TikTok-style / timelines complejos).

## P2 — Interesante

Vale la pena, sin ser prioritario mientras no haya más volumen de
producción o datos reales.

8. **claude-youtube (AgriciDaniel)** (`skills/registro.ts`) — analítica
   de YouTube sin necesidad de cuenta real, pero sin datos reales de un
   canal todavía que analizar (Fase 1 sin canal activo confirmado).
9. **tiktok-skills sin Publora** (`skills/registro.ts`) — hooks/captions/
   trend-mapping de TikTok, útil para diversificar guiones.
10. **SocialCrawl MCP** (`mcp/registro.ts`) — pendiente de que el
    operador decida crear la cuenta (100 créditos gratis, sin tarjeta).
11. **Sistema de capas persistentes / parallax** (hallazgo #6 de la
    auditoría de techos + `conocimiento/base.ts` id
    `capas-profundidad-parallax`) — técnica real documentada, sin caso
    de uso urgente todavía (ningún guion pide hoy un elemento de marca
    persistente).
12. **Auditoría de tipografía de componentes contra 48-72px bold**
    (`conocimiento/base.ts` id `tipografia-tamano-video-vertical`) —
    revisar `componentes/registro.json` contra el rango documentado.

## P3 — Referencia futura

Documentado para no perderlo, sin acción esperada por ahora.

13. **Trend Intel / Apify** (`mcp/registro.ts`) — más caro/ambiguo que
    SocialCrawl (compute units vs. requests simples), esperar.
14. **Zapier MCP** (`mcp/registro.ts`) — automatización real prematura
    mientras la Fase 1 (primera venta) no avance, y choca con la Regla
    de Oro si se activa sin supervisión por sesión.
15. **claude-shorts (AgriciDaniel)** (`skills/registro.ts`) — referencia
    arquitectónica (audio-aware boundary snapping) para cuando se
    destrabe whisper.cpp (R7-16), no un caso de uso actual.
16. **video-shotcraft** (galería de movimientos de cámara) — referencia
    visual, sin código a copiar.
17. **@remotion/rive / lottie / skia / maptiler** — evaluados en R7-25,
    sin necesidad concreta de ningún guion actual.

## Qué se puede implementar YA con $0 (sin esperar al operador)

De la lista de arriba, lo que no depende de ninguna decisión de cuenta/
credencial del operador y es puramente código/instalación:

- QA de contraste WCAG sobre frames renderizados (P0 #2) — el más
  valioso de implementar en la próxima ronda de código real.
- Instalar y probar `GoogleTrendsMCP` (P1 #4) y `Reddit Research MCP`
  (P0 #3) — ambos self-hosted/sin cuenta.
- Instalar la skill `carousel-narratives` (P1 #5) y ejercitarla sobre
  el generador de carruseles existente.
- Auditoría de tipografía de componentes (P2 #12) — solo requiere leer
  `componentes/registro.json`, sin dependencias nuevas.

Todo lo demás (Hotmart, SocialCrawl, Trend Intel, Zapier) depende de
que el operador cree una cuenta, genere una credencial, o autorice un
gasto/riesgo -- no es una limitación técnica, es la Regla de Oro del
proyecto funcionando como corresponde.
