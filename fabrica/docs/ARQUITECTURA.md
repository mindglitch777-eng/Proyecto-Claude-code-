# Arquitectura de la fábrica — memoria viva

Orden maestra Ronda 5, sección 21: si una sesión termina y otra
continúa en una semana, debe poder entender qué somos, qué está hecho,
qué falta, qué probamos, qué funcionó, qué no, qué no sabemos, qué no
debemos volver a hacer — sin depender del chat. Este documento es el
punto de entrada; cada afirmación enlaza al archivo con el detalle
real.

## QUÉ SOMOS

Un laboratorio audiovisual que investiga, diseña, produce, critica,
experimenta, mide y aprende — NO un generador de videos que solo
combina componentes. Ver la pregunta guía de cada ronda: `¿esto hace
que el video comunique mejor / retenga más / se sienta más
profesional? Si no, no se agrega.`

## QUÉ ESTÁ HECHO (pipeline real, de punta a punta)

```
Guion (a mano, conversando con Claude -- ideación automática bloqueada
por la regla de $0, ver PENDIENTES.md ítem 5)
  ↓
Voz real (Qwen3-TTS, motor C, voz clonada de librivox-11) --
fabrica/voz/
  ↓
Director Visual (fabrica/directores/visual.ts) -- elige componente por
metadata (categoría/intensidad/duración/assets), nunca por id
hardcodeado
  ↓
Director de Audio (fabrica/directores/audio.ts) -- elige golpe de
transición con variedad real + anti-repetición
  ↓
Director de Edición (fabrica/directores/edicion/, Ronda 4) --
intención/energía/estilos combinables/microeventos/transición
motivada
  ↓
Director de Retención 2.0 (fabrica/directores/retencion/, Ronda 5) --
mapa narrativo del video completo + alertas de arco
  ↓
Composición (fabrica/composicion/armar.ts) -- offsets exactos en
segundos, audio real como fuente de verdad del timing
  ↓
Render (Remotion, remotion-spike/src/fabrica_bridge/FabricaVideo.tsx)
  ↓
QA duro (fabrica/qa/checks_duros.py) -- hechos objetivos del mp4
  ↓
Crítico Audiovisual (fabrica/qa/critico_audiovisual.py, Ronda 5) --
unifica QA duro + crítica editorial + retención en formato
Problema/Evidencia/Severidad/Tipo/Propuesta
  ↓
Ciclo de mejora controlado (fabrica/laboratorio/ciclo_mejora.ts) --
máx. 2 iteraciones, solo corrige lo que puede corregir con seguridad
  ↓
Memoria (fabrica/memoria/) -- anti-repetición por componente Y por
patrón, laboratorio de hipótesis/experimentos A-B, nunca mezcla
heurística con resultado real
```

Videos de prueba reales generados hasta ahora: `fabrica-demo-01` a
`fabrica-demo-05` (`fabrica/salidas/`), cada uno con su ronda de
mejoras documentada (`MEJORAS_RONDA3.md`, `MEJORAS_RONDA4.md`, este
documento para la Ronda 5).

## QUÉ FALTA (ver PENDIENTES.md para el detalle completo)

- Publicación real y datos reales (`resultadoReal`) -- sin esto, todo
  el sistema de anti-repetición por patrón y de experimentos A/B tiene
  su mecanismo más importante sin ejercitar en producción todavía.
- Subtítulos (nunca se generaron en ningún video de la fábrica) --
  candidato identificado: `@remotion/install-whisper-cpp` +
  `@remotion/captions` (ver `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md`).
- Transiciones con superposición real (crossfade/slide de verdad entre
  dos escenas) -- candidato identificado: `@remotion/transitions`
  (mismo documento de skills).
- Motor de composiciones en capas -- deliberadamente NO construido
  (prohibido como sistema paralelo, ver `MEJORAS_RONDA4.md`).

## QUÉ PROBAMOS Y QUÉ FUNCIONÓ

- Golpes con variedad real + anti-repetición (Ronda 3) -- funcionó,
  verificado con 5-7 golpes distintos por video en demo_04/05.
  Anticipo antes de golpe fuerte (Ronda 3) -- funcionó, verificado con
  análisis de luminancia real.
- Tratamiento de repetición de datos (Ronda 3) -- funcionó, verificado
  visualmente ($2.209/$6.120 mostrados en vez de repetir la cifra).
- Director de Edición + microeventos anclados a audio real (Ronda 4)
  -- funcionó, corrigió un desfasaje medido de 1.6s en demo_04.
- Anti-repetición entre videos por componente (Ronda 3-4) -- funcionó
  de verdad en demo_05 (penalizó "silueta" recién usado), con un
  efecto secundario real documentado (cambió la clasificación de
  intención de la escena de pausa).

## QUÉ NO FUNCIONÓ / QUÉ SE ENCONTRÓ ROTO

- `fabrica/guion/tipos.ts` estaba documentado como "ya construido"
  desde Ronda 1 (`PENDIENTES.md` ítem 5) pero la carpeta estaba VACÍA,
  sin ningún historial en git -- la afirmación era incorrecta.
  Corregido en Ronda 5 (ver este mismo documento, sección de
  decisiones, y `PENDIENTES.md`).
- El Director Visual eligiendo "ranking" para una unidad pensada para
  "lista-tachada" (Ronda 5, mismo tipo de bug ya visto en Ronda 2/4) --
  confirma que la limitación de "props/semántica distinta dentro de la
  misma categoría" sigue siendo real y recurrente, no un caso
  aislado. Ver ítem 10 de `PENDIENTES.md`.

## QUÉ NO SABEMOS

- Si alguna de las heurísticas de retención/edición de esta fábrica
  correlaciona con retención REAL -- no hay ningún video publicado con
  métricas todavía.
- Si `@remotion/transitions`/`@remotion/install-whisper-cpp` funcionan
  bien en nuestro entorno real (GitHub Actions, sin GPU) -- evaluados
  por investigación, NO probados en código todavía (ver
  `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md`).

## QUÉ NO DEBEMOS VOLVER A HACER

- No documentar algo como "construido" sin haber verificado que el
  archivo existe de verdad (la lección del ítem `guion/tipos.ts`).
- No instalar un plugin/herramienta de terceros con superficie amplia
  (ej. `remotion-superpowers`) sin verificar primero si sus
  funcionalidades más atractivas dependen de servicios pagos.
- No registrar un video en la memoria de anti-repetición (`historial_
  componentes.json`/`patrones_usados.json`) antes de confirmar que el
  render fue exitoso (bug real de Ronda 4, todavía pendiente de
  arreglar formalmente -- ver `PENDIENTES.md` ítem 13).

## Mapa de documentos

| Documento | Contenido |
|---|---|
| `fabrica/README.md` | Visión general y estado por fase (histórico) |
| `fabrica/PENDIENTES.md` | Todo lo pendiente, con motivo/bloqueo/próximo paso |
| `fabrica/PENDIENTES_OPERADOR.md` | Solo lo que necesita al operador |
| `fabrica/ESTADO_ACTUAL.md` | Informe ejecutivo de la ronda más reciente |
| `fabrica/MEJORAS_RONDA3.md` / `_RONDA4.md` | Detalle técnico de cada ronda anterior |
| `fabrica/research/` | Investigación con evidencia clasificada (retención, etc.) |
| `fabrica/skills/` | Herramientas externas investigadas, USAR/PROBAR/DESCARTAR |
| `fabrica/experiments/` | Experimentos A/B formalizados |
| `fabrica/criticas/` | Salidas guardadas del Crítico Audiovisual por video |
| `fabrica/decisions/` | Decisiones arquitectónicas tomadas y rechazadas, con motivo |
