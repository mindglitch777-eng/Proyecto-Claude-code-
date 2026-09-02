# Investigación de retención — biblioteca clasificada por evidencia

Orden maestra sección 3: investigar técnicas de retención sin copiar
ciegamente cualquier consejo de redes sociales, clasificando la
calidad de la evidencia. Este documento crece con el tiempo — no está
completo, es la primera versión (2026-09-02).

## Niveles de evidencia usados en este documento

- **EVIDENCIA (académica)** — estudio revisado por pares, teoría
  psicológica establecida y citada. Es lo más cercano a un hecho que
  tenemos, pero sigue siendo sobre comportamiento humano general, NO
  sobre "este video en particular va a retener mejor".
- **EVIDENCIA (oficial de plataforma)** — documentación publicada
  directamente por YouTube/TikTok/Meta sobre cómo funciona SU métrica
  o SU algoritmo. Autorizada sobre esa plataforma puntual, pero la
  plataforma tiene interés en que produzcas más/mejor contenido para
  ella — no es neutral, y puede quedar desactualizada.
- **HEURÍSTICA (secundaria, con caveat)** — una cifra o afirmación que
  aparece en blogs/medios de marketing CITANDO datos de una plataforma
  o estudio, sin que hayamos podido verificar el dato primario
  nosotros mismos. Tratada como una pista razonable, nunca como un
  hecho confirmado.
- **ANECDÓTICO** — la experiencia de un creador o consultor particular,
  sin estudio ni dato oficial detrás. Puede ser un buen punto de
  partida creativo, nunca una regla.

Regla dura: **nunca** se convierte una fila de HEURÍSTICA/ANECDÓTICO en
un hecho, ni se calcula un "score de viralidad" a partir de estos
principios (ver sección 2 de la orden maestra y
`fabrica/qa/critica_editorial.py`, que ya sigue esta separación).

---

## 1. Curiosidad / brecha de información

- **Loewenstein, G. (1994). "The Psychology of Curiosity: A Review and
  Reinterpretation."** — **EVIDENCIA (académica)**. La curiosidad surge
  cuando la atención se enfoca en una brecha (gap) entre lo que
  sabemos y lo que querríamos saber; esa brecha se siente como una
  privación que motiva a buscar la respuesta. Dato importante y menos
  citado: la curiosidad es máxima con un poco de conocimiento previo,
  no con cero — "sé algo de esto pero no todo" engancha más que "no sé
  nada de esto". **Aplicación a la fábrica:** un hook que da CONTEXTO
  parcial ("Mica cobra $340 por video...") activa más curiosidad real
  que un hook completamente abstracto o uno que ya lo explica todo.
- **Zeigarnik, B. (1927), efecto Zeigarnik** — **EVIDENCIA
  (académica, histórica)**. Las tareas interrumpidas/incompletas
  quedan más tiempo en la memoria activa que las completadas —
  "tensión cognitiva" que empuja a querer cerrar el círculo. Es la
  base psicológica real detrás de la técnica narrativa de "loops
  abiertos"/cliffhangers. **Aplicación:** abrir una pregunta o
  situación sin resolver al principio del video, y resolverla
  explícitamente más adelante — no dejarla sin cerrar nunca (eso
  frustra, no engancha).

## 2. Primeros segundos (plataforma)

- **YouTube Creator Academy / YouTube Help, "Key moments for audience
  retention"** — **EVIDENCIA (oficial de plataforma)**. YouTube mide
  explícitamente qué porcentaje de audiencia sigue mirando después de
  los primeros 30 segundos ("Intro"), y recomienda que ese tramo
  cumpla la expectativa que generó el título/miniatura. Fuente:
  documentación oficial de Google/YouTube.
- **"Más del 33% de los espectadores abandona en los primeros 30
  segundos si la intro no engancha" (atribuido a YouTube Creator
  Academy 2023)** — **HEURÍSTICA (secundaria)**: esta cifra puntual
  aparece repetida en blogs de marketing citando a YouTube Creator
  Academy, pero no pudimos confirmar la publicación oficial original
  con ese número exacto. Tratada como pista, no como hecho verificado.
- **"63% de los videos con mejor CTR en TikTok enganchan en los
  primeros 3 segundos"; "el video promedio de TikTok dura 8.4s de
  watch time"; "los videos de menos de 10s tienen 27% más
  finalizaciones"** — **HEURÍSTICA (secundaria)**: estas cifras
  aparecen en blogs que citan "TikTok Creative Center"/"TikTok for
  Business" sin enlazar la publicación primaria verificable. Dirección
  plausible (el hook importa muchísimo en formato corto) pero los
  números puntuales NO están confirmados de forma independiente —
  **NO CONFIRMADO, tratar como orden de magnitud, no como cifra
  exacta**.
- **Aplicación a la fábrica:** el Director de Edición ya prioriza
  `intención='enganchar'` con `energía` alta y entrada `inmediata` para
  la primera unidad (Ronda 4) — esto es consistente con la evidencia
  de plataforma (peso real en los primeros segundos), aunque la
  fábrica no puede medir CTR/watch-time real todavía (no hay video
  publicado).

## 3. Estructura narrativa / loops abiertos

- **Técnica de "cliffhanger" / loop abierto** — combinación de
  Zeigarnik (arriba, académico) con la práctica narrativa clásica
  (folletines, series de TV) de cortar en un punto de tensión. La
  base psicológica es académica; la APLICACIÓN concreta a video corto
  ("abrir con una pregunta, cerrarla en el cierre") es una
  **HEURÍSTICA** razonable derivada de esa base, no un hallazgo
  específico de video corto.
- **Aplicación a la fábrica:** el Director de Retención 2.0 (esta
  ronda) mapea el video completo buscando si existe una "promesa"
  hecha en el hook y si se resuelve antes del cierre — exactamente la
  estructura de apertura/cierre de loop, marcada como heurística de
  alerta, nunca como puntaje.

## 4. Lo que la fábrica NO puede confirmar todavía

- Ningún estudio de los de arriba mide "retención de un video de
  nuestra fábrica en particular" — todos son sobre comportamiento
  humano general o sobre agregados de plataforma. La única forma real
  de saber si algo funciona PARA NOSOTROS es publicar y medir (ver
  `fabrica/memoria/laboratorio.json`, campo `resultadoReal`).
- Las cifras de TikTok citadas arriba son de más difícil verificación
  que las académicas o las de YouTube — quedan marcadas explícitamente
  como HEURÍSTICA/NO CONFIRMADO en vez de presentarse con la misma
  confianza que Loewenstein/Zeigarnik.

## Próximas líneas de investigación (no hechas todavía)

- Documentación oficial de TikTok for Business / Creative Center
  (fuente primaria, no blogs que la citan) — requiere acceso que no
  se intentó todavía esta ronda.
- Investigación académica específica sobre formato de video corto
  (menos de 60s) — la mayoría de la literatura de retención
  (Loewenstein, Zeigarnik) es anterior a TikTok/Reels y se aplica por
  extensión, no por estudio directo del formato.
