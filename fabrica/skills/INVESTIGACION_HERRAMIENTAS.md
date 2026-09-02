# Investigación de skills/herramientas externas — Ronda 5

Orden maestra sección 16-17: investigar antes de instalar, clasificar
USAR/PROBAR/DESCARTAR, nunca incorporar algo solo "porque parece
bueno". Búsquedas reales hechas el 2026-09-02 (WebSearch/WebFetch, no
inventado — cada afirmación cita su fuente).

Formato por herramienta: nombre / fuente / qué hace / qué problema
resuelve / gratis / licencia / dependencias / funciona en nuestro
entorno / qué reemplazaría o mejoraría / riesgos / recomendación.

---

## 1. `@remotion/transitions` — **USAR** (candidato fuerte para próxima ronda)

- **Fuente:** paquete oficial del monorepo `remotion-dev/remotion`
  ([docs](https://www.remotion.dev/docs/transitions/),
  [npm](https://www.npmjs.com/package/@remotion/transitions)).
- **Qué hace:** expone `<TransitionSeries>`, con
  `<TransitionSeries.Sequence>` (equivalente a `<Series.Sequence>`) y
  `<TransitionSeries.Transition>`/`<TransitionSeries.Overlay>` — una
  transición cruza dos escenas (acorta la duración total porque se
  superponen durante la transición); un overlay (light leaks, flashes)
  se renderiza en el punto de corte sin afectar el timing.
- **Qué problema resuelve:** hoy nuestro sistema de golpes
  (`golpes.tsx`) monta CADA escena por separado con un overlay que
  imita una transición al principio de la escena siguiente — nunca hay
  una superposición real de dos escenas (crossfade de verdad, slide
  real de una escena empujando a la otra). `@remotion/transitions` sí
  hace eso.
- **Gratis:** sí, bajo la licencia de Remotion (ver ítem 2) —
  individual/no-profit sin restricción de ingresos, uso comercial
  permitido. Nuestro caso (operador individual) está cubierto sin
  costo, confirmado leyendo la licencia real.
- **Dependencias:** ninguna nueva más allá de alinear la versión con
  el resto de paquetes `remotion`/`@remotion/*` ya instalados.
- **¿Funciona en nuestro entorno?** Debería — es parte del mismo
  monorepo/CLI que ya usamos para renderizar (`npx remotion render`),
  sin necesidad de GPU ni servicio externo. **NO CONFIRMADO — falta
  instalarlo y probar un render real** antes de integrarlo a la
  fábrica.
- **Qué reemplazaría/mejoraría:** el sistema de `Golpe`/`TipoGolpe`
  actual NO se reemplaza (sigue siendo la fuente de la intensidad/SFX
  motivada por el Director de Edición) — `@remotion/transitions` se
  sumaría como una CAPA ADICIONAL para los golpes que hoy son
  puramente visuales de corte duro (`fundido`, `desliza`, `iris`,
  `cortina`), dándoles una superposición real entre escenas en vez de
  un efecto que empieza cuando la escena nueva ya arrancó.
- **Riesgos:** cambia cómo se calculan los offsets de escena en
  `armar.ts` (las escenas se superpondrían, no serían estrictamente
  consecutivas) — es un cambio real a la Composición, no cosmético.
  Por eso no se integró ya esta ronda (evitar cambiar la arquitectura
  de timing sin haberlo probado primero en aislamiento).
- **Recomendación:** **PROBAR en la próxima ronda**, en un ejemplo
  aislado (no en el pipeline de producción) antes de integrarlo.

## 2. Licencia de Remotion — **CONFIRMADO, sin acción requerida**

- **Fuente:** [LICENSE.md del repo](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
- **Hallazgo real:** gratis para "un individuo", una organización sin
  fines de lucro, o alguien evaluando si Remotion le sirve — SIN
  restricción de ingresos. Se necesita una licencia de empresa paga
  solo para una organización con fines de lucro de **más de 3
  empleados**. El operador (individual, solo) está cubierto sin costo
  para uso comercial, confirmado leyendo el texto legal directamente
  (no una fuente secundaria).
- **Recomendación:** ninguna acción — ya estábamos cumpliendo esto sin
  saberlo con certeza; ahora queda confirmado y documentado.

## 3. `@remotion/install-whisper-cpp` + `@remotion/captions` — **PROBAR (prioridad alta)**

- **Fuente:** paquetes oficiales
  ([install-whisper-cpp](https://www.remotion.dev/docs/install-whisper-cpp/),
  [captions](https://www.remotion.dev/docs/captions/api)), y el motor
  real es [whisper.cpp de ggerganov](https://github.com/ggerganov/whisper.cpp)
  (licencia **MIT**, confirmado por búsqueda).
- **Qué hace:** instala el binario de whisper.cpp (C/C++, sin
  necesitar Python/PyTorch) y un modelo, transcribe un audio real con
  `transcribe()`, y convierte el resultado a `Caption[]` con
  `toCaptions()` — de ahí `createTikTokStyleCaptions()` (paquete
  `@remotion/captions`) arma "páginas" de subtítulos estilo TikTok con
  timing por palabra.
- **Qué problema resuelve:** es EXACTAMENTE el ítem 1 de
  `PENDIENTES.md` (timestamps palabra-por-palabra), pendiente desde
  Ronda 2 — ya habíamos prototipado esto nosotros mismos con
  `faster-whisper` (Python) con resultado positivo pero heurístico.
  Este camino es mejor: (a) es el camino OFICIALMENTE soportado por
  Remotion, pensado para integrarse directo con componentes de
  render; (b) whisper.cpp es más liviano que la cadena Python de
  faster-whisper (sin PyTorch).
- **Gratis:** sí — MIT, corre 100% local/CPU.
- **Dependencias:** compilar whisper.cpp (igual patrón que ya usamos
  para compilar el motor C de Qwen3-TTS en GitHub Actions —
  `make blas` para BLAS, acá sería el build de whisper.cpp) + un
  modelo (~75MB-1.5GB según tamaño, se descarga una vez).
- **¿Funciona en nuestro entorno?** **NO CONFIRMADO — falta probarlo.**
  Whisper.cpp confirmado que NO requiere GPU (corre en CPU en
  cualquier máquina moderna, según la búsqueda), lo cual es
  compatible con GitHub Actions `ubuntu-latest` (mismo patrón que ya
  usamos con éxito para Qwen3-TTS). Falta una corrida real para
  confirmar tiempos/precisión sobre audio real nuestro.
- **Qué reemplazaría/mejoraría:** el prototipo de `faster-whisper`
  (`fabrica/voz/probar_alineacion.py`, ya documentado como
  "precisión parece alcanzar, heurística basada en una sola muestra")
  — este camino, al ser el oficialmente soportado por Remotion, tiene
  mejor integración con `@remotion/captions` para producir subtítulos
  reales (que hoy NO tenemos en ningún video de la fábrica).
- **Riesgos:** ninguno de licencia/costo. El riesgo real es de tiempo
  de build en CI (compilar whisper.cpp + descargar modelo en cada
  run, igual que ya hacemos con Qwen3-TTS).
- **Recomendación:** **PROBAR en la próxima ronda** — es el pendiente
  más antiguo de la fábrica (Ronda 2) y ahora hay un camino
  oficialmente soportado, no solo un prototipo casero.

## 4. `@remotion/media-utils` / `@remotion/media` — **PROBAR (prioridad baja)**

- **Fuente:** [docs oficiales](https://www.remotion.dev/docs/media/).
- **Qué hace:** utilidades para leer info de audio/video y
  visualizarlo (ej. waveforms/espectro).
- **Qué problema resuelve:** hoy calculamos duración de audio con
  `ffprobe` vía `execSync` (funciona bien) — este paquete serviría
  para un futuro componente "reactivo al audio" (ej. una barra que
  responde al volumen real de la voz), que hoy no existe.
- **Gratis:** sí, misma licencia de Remotion.
- **Recomendación:** **PROBAR** solo si en una ronda futura se decide
  construir un componente audio-reactivo — no hay necesidad concreta
  hoy, no instalar preventivamente (sección 26, evitar sobreingeniería).

## 5. `remotion-superpowers` (plugin de Claude Code, DojoCodingLabs) — **DESCARTAR (por ahora)**

- **Fuente:** [repo GitHub](https://github.com/dojocodinglabs/remotion-superpowers),
  se instala como plugin de Claude Code (`/plugin install
  remotion-superpowers`).
- **Qué hace:** "estudio de producción de video completo" con 5
  servidores MCP y 13 comandos: `/create-short`, `/add-captions`,
  `/add-transitions`, `/generate-image`, `/generate-clip`,
  `/transcribe`, `/review-video`, entre otros — voces IA, música,
  stock footage, generación de imagen/video, subtítulos, transiciones,
  "loop de revisión con IA".
- **Qué problema resuelve, en teoría:** varias cosas de esta misma
  orden (subtítulos, transiciones, crítica automática) de una sola vez.
- **Gratis:** el plugin en sí se declara "free & open source" — pero
  **NO CONFIRMADO** que TODO lo que hace sea gratis: "voiceovers, music,
  stock footage, image/video generation" son, en la enorme mayoría de
  herramientas de este tipo, wrappers sobre APIs PAGAS (voces
  sintéticas de terceros, generación de imagen tipo DALL-E/Midjourney,
  bancos de stock con API paga) — el setup wizard del propio plugin
  explícitamente pide "configurar API keys". Esto es una señal fuerte
  de dependencia paga, no confirmada en detalle porque no se instaló
  (sección 17: no depender ciegamente).
- **Licencia:** no verificada en detalle (fuera de alcance sin
  instalarlo).
- **¿Funciona en nuestro entorno?** Probablemente sí a nivel técnico
  (es un plugin de Claude Code), pero el operador trabaja sin cuentas
  de servicios pagos configuradas — instalarlo probablemente deje la
  mayoría de comandos inutilizables o incentive activar servicios
  pagos, exactamente lo que la regla de $0 prohíbe.
- **Qué reemplazaría/mejoraría:** en teoría, varias partes de nuestro
  pipeline (voz, assets, subtítulos, crítica) — pero CADA UNA de esas
  partes ya la resolvemos hoy con alternativas gratuitas propias
  (Qwen3-TTS local, resolver de assets con banco curado propio,
  crítica editorial heurística propia) o con los paquetes oficiales de
  Remotion de los ítems 1 y 3 de arriba, sin necesitar API keys pagas.
- **Riesgos:** dependencia de una superficie grande de funcionalidad
  (13 comandos, 5 MCP servers) mantenida por un tercero, con fuerte
  probabilidad de requerir servicios pagos para la mayoría de sus
  comandos más vistosos (voz/música/imagen). Alto riesgo de romper la
  regla de $0 sin darnos cuenta si algún comando cae a un fallback
  pago.
- **Recomendación:** **DESCARTAR como plugin instalado.** Si en el
  futuro interesa específicamente `/add-captions` o `/add-transitions`,
  mejor reimplementar esa funcionalidad puntual nosotros mismos sobre
  los paquetes oficiales gratuitos (`@remotion/captions`,
  `@remotion/install-whisper-cpp`, `@remotion/transitions` — ítems 1 y
  3 de arriba), que ya cubren el mismo problema sin la superficie de
  riesgo de un plugin de terceros con probables dependencias pagas.

## 6. Bibliotecas de componentes/templates comerciales (RenderComp, Wireflow, etc.) — **DESCARTAR**

- **Fuente:** resultados de búsqueda ("RenderComp ships more than
  1,000 production-ready components", "Wireflow Blog").
- **Qué son:** tiendas de templates/componentes de Remotion, en su
  mayoría de pago o con licencias por-proyecto no verificadas.
- **Recomendación:** **DESCARTAR como dependencia** — no cumplen la
  regla de $0 sin verificación caso por caso, y nuestro propio catálogo
  de 26 componentes (más los que se agreguen) ya cubre necesidades
  reales sin ese riesgo. Sirven como INSPIRACIÓN de principios de
  motion design (lectura de sus descripciones, no de su código) — eso
  sí es gratis y ya se usó conceptualmente en `MEJORAS_RONDA4.md`
  (sección de estilos combinables).

## 7. "Twick" (editor de video timeline-native, MIT) — **DESCARTAR (no evaluado en profundidad)**

- **Fuente:** mencionado en resultados de búsqueda como alternativa
  MIT a Remotion.
- **Qué es:** un framework de edición de video "timeline nativo" en
  vez de "frame compuesto" como Remotion.
- **Recomendación:** **DESCARTAR por ahora** — cambiar de framework de
  render sería una reescritura completa de toda la fábrica (Composición
  + puente de render + 26 componentes), exactamente la
  "sobreingeniería"/"refactorización gigante porque sí" que la orden
  maestra prohíbe explícitamente. No hay ninguna limitación real de
  Remotion hoy que Twick resuelva y que justifique ese costo.

---

## Resumen de recomendaciones

| Herramienta | Clasificación | Prioridad |
|---|---|---|
| `@remotion/transitions` | USAR (probar primero, aislado) | Alta |
| Licencia Remotion | Confirmado, sin acción | — |
| `@remotion/install-whisper-cpp` + `@remotion/captions` | PROBAR | Alta (resuelve pendiente más antiguo) |
| `@remotion/media-utils` | PROBAR | Baja (sin necesidad concreta hoy) |
| `remotion-superpowers` (plugin) | DESCARTAR | — |
| Templates comerciales (RenderComp, etc.) | DESCARTAR como dependencia | — |
| Twick | DESCARTAR | — |

Ninguna de estas integraciones se implementó todavía en el código de
la fábrica esta ronda — son candidatos evaluados y priorizados, no
cambios de arquitectura ya hechos (sección 17: "la arquitectura debe
poder sobrevivir sin una dependencia externa crítica"; sección 24: un
cambio que afecta arquitectura se documenta y se espera). Quedan como
el primer punto de "PRÓXIMO PASO" en `ESTADO_ACTUAL.md`.
