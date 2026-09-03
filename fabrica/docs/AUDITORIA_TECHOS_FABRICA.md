# Auditoría de techos reales de la fábrica (punto 17 del prompt de exploración agresiva)

Este documento responde al punto 17 del prompt: encontrar, con evidencia
concreta del código (no opinión), qué partes de la fábrica son débiles,
rígidas, dependen de reglas manuales, o están limitando la calidad —
los "techos" reales de hoy. No es una lista de bugs (la fábrica no tiene
bugs conocidos sin arreglar) sino de **límites estructurales de diseño**,
cada uno con la cita exacta del código que lo prueba.

## Hallazgo raíz: la fábrica entera es heurística declarada, no aprendida

Todos los "Directores" (`directores/visual.ts`, `directores/audio.ts`,
`directores/edicion/edicion.ts`, `directores/retencion/retencion.ts`) usan
el mismo patrón: tablas de mapeo fijas y pesos numéricos escritos a mano,
siempre declarados explícitamente como heurística en el propio comentario
del código (buena práctica de honestidad que el proyecto ya venía
siguiendo) pero **nunca calibrados contra un resultado real** porque
todavía no existe ese resultado real. Evidencia:

- `directores/visual.ts:36-38,44-46`: el score de un componente candidato
  suma pesos fijos (`2 * (1 - difIntensidad)`, `1.5`/`0.5`/`-1` según
  distancia de capacidad de texto, `-0.75` si `estado='sin_validar'`,
  `-1` por anti-repetición) — el propio comentario de cabecera dice
  textualmente que es *"una heurística declarada como tal: sirve para
  ordenar candidatos razonablemente, no es una medida de calidad real
  hasta que haya datos de publicaciones reales que la reemplacen/
  corrijan"* (línea 7-10). Ese reemplazo con datos reales **todavía no
  pasó ni una vez**.
- `directores/audio.ts:48-55,63-70,80-87`: `GOLPES_POR_NIVEL`,
  `VOLUMEN_POR_NIVEL`, `NIVEL_A_INTENSIDAD_MUSICA` son diccionarios
  fijos. `directores/edicion/edicion.ts:36-59`: `FUNCION_POR_INTENCION`
  y `ESTILOS_POR_INTENCION` son lo mismo. `decidirIntencion()` (línea
  142-158) es una cascada de `if` con umbrales mágicos (`0.35`, `0.45`,
  `0.5`, `0.55`, `0.6`, `0.7`) — cambiar la "sensación" de un video
  (más agresivo, más calmo) hoy requiere editar estas constantes a mano,
  no hay ninguna perilla expuesta.
- **La pieza que cerraría este loop existe en código pero está
  genuinamente vacía**: `fabrica/memoria/laboratorio.json` tiene 10
  hipótesis reales registradas (ej. "punch" vs texto estático) y **las
  10 tienen `resultadoReal: null, conclusion: null, estado:
  "esperando_datos"`** — cero feedback real cerró el ciclo todavía.
  `fabrica/datos/datos.ts:6-7` confirma lo mismo del otro lado:
  `REGISTROS_VIDEO` y `REGISTROS_PRODUCTO` son arrays vacíos por diseño
  ("vacíos a propósito... ningún dato inventado"), así que funciones ya
  construidas y testeadas como `retencionPromedioPorHook()`
  (`datos/consultar.ts:42`) nunca se ejecutaron sobre datos reales.

**Esto no es un bug ni una omisión** — es exactamente la disciplina de
"nunca inventar evidencia" que pide el propio prompt (punto 13). Pero es
EL techo real más grande de la fábrica: todo el sistema de aprendizaje
está construido y probado, pero no aprendió nada de la realidad todavía
porque no hubo ninguna publicación/venta real (Fase 1 del proyecto). La
prioridad de negocio ya registrada en el Decision Engine
(`prioridad-post-ronda-7`) apunta exactamente a esto.

## Techos específicos por módulo

### 1. Catálogo de componentes visuales: 28 opciones totales
`componentes/registro.json` tiene 28 entradas. El Director Visual es
metadata-driven y extensible sin tocar código (buen diseño), pero la
variedad real que puede producir un video está limitada por ese número.
Un editor humano con acceso a stock/plantillas ilimitadas tiene un techo
de variedad mucho más alto. No es urgente mientras el volumen de
producción sea bajo, pero escala mal: al publicar muchos videos con la
misma "voz" de marca, la repetición se va a notar antes que si el
catálogo fuera de 60-80 componentes.

### 2. Golpes de audio: solo 2-3 variantes por nivel de intensidad, sin variación de fuerza dentro del mismo golpe
`directores/audio.ts:49-55` (`GOLPES_POR_NIVEL`) da como máximo 3
opciones por nivel (`revelacion` tiene 3, el resto 2). El bug real de
Ronda 3 (siempre el mismo golpe por nivel) ya se resolvió con
anti-repetición, pero un "fogonazo" es siempre igual de fuerte —no hay
un parámetro de intensidad continua dentro de un mismo tipo de golpe.
Techo real de variedad sonora.

### 3. Música de fondo: una sola canción para todo el video, sin arco de intensidad interno
`fabrica/musica/README.md` documenta la decisión (deliberada, no un
descuido): se elige **una** canción por video, a partir del **promedio**
de intensidad de todas las unidades (`directores/audio.ts:93-97`,
`intensidadMusicaPromedio`). Un video real con arco emocional (empieza
calmo, escala, cierra eufórico) usa la misma canción de punta a punta,
sin transición de mood real. Es una simplificación consciente (evita
cambios de track ruidosos) pero sigue siendo un techo de producción real
frente a un editor humano, que sí cambiaría de pista o haría un layering
de capas de música según el momento.

### 4. Decisión de intención editorial: umbrales fijos sin perilla de "personalidad" expuesta
`directores/edicion/edicion.ts:142-158` (`decidirIntencion`) decide con
constantes hardcodeadas. No existe hoy una forma de decirle al sistema
"este video en particular debe sentirse más agresivo/más calmo" sin
editar el archivo TypeScript — no hay un parámetro de "personalidad de
edición" a nivel de guion, aunque el `EstiloId` (`documental|agresivo|
data|misterio|storytelling|cinematico`) ya cubre parte de esta necesidad
a otro nivel (elección de estilo visual, no de umbral narrativo).

### 5. Director de Retención: detecta problemas, no los corrige
`directores/retencion/retencion.ts` (`detectarAlertas`, líneas 95-189)
es puramente diagnóstico: encuentra 6 tipos de alertas reales
(hook_débil, promesa poco clara, tramo sin evolución, caída de energía
antes del clímax, cierre con poca energía, sin escalada visible) con
buena lógica (ej. el cálculo de clímax en líneas 81-90 es un cálculo
real sobre el mapa, no una intención declarada de antemano). Pero
ninguna alerta dispara una corrección automática — hoy depende de que
una persona (o una ronda de Claude Code) lea el reporte y decida qué
tocar. Es un techo de automatización real: el ciclo de mejora
(`laboratorio/ciclo_mejora.ts`) existe para cerrar esto, pero también
depende del feedback real que hoy no existe (ver hallazgo raíz).

### 6. Sin composición real de capas simultáneas
Revisando el registro de componentes y el puente de render, la
composición actual es fundamentalmente **secuencial** (una unidad
narrativa a la vez, con golpes de transición entre ellas) más overlays
puntuales (Vineta, CamaraOrganica, PulsoRevelacion). No hay un sistema
de "capas" persistentes (ej. un logo/marca de agua fijo, un contador de
progreso, un elemento de marca que viva encima de toda la secuencia) —
el punto 10 del prompt pide investigar justamente "uso de capas" como
técnica, y hoy la fábrica no tiene ese concepto como primitiva
reutilizable, cada overlay se cablea a mano en `FabricaVideo.tsx`.

### 7. QA es de reglas duras + un crítico basado en heurísticas, no hay medición perceptual real
`qa/checks_duros.py`, `qa/checks_composicion.py`, `qa/critica_editorial.py`
y `qa/critico_audiovisual.py` validan estructura (assets faltantes,
duración esperada vs. real, patrones de repetición, problemas con
severidad/tipo/propuesta). Es un sistema real y útil, pero **no mide
nada de percepción real** (legibilidad de texto a la velocidad que pasa
en pantalla, contraste de color real medido en píxeles, nivel de
loudness de audio real vs. estándar de plataforma) — todo lo que evalúa
es de la ESTRUCTURA de la composición (JSON), no del frame renderizado
en sí. Esto conecta directo con el punto 10 (contraste, tipografía)
del prompt: hoy no hay ningún check automático que abra un frame real y
mida, por ejemplo, si el contraste de texto sobre fondo cumple un
mínimo real (ej. WCAG AA, que en video también aplica de facto para
legibilidad).

## Resumen: los 3 techos que más importan, ordenados por impacto real

1. **Cero feedback real cerrando el loop de aprendizaje** (hallazgo
   raíz) — no es arreglable con código, depende de publicar contenido
   real (bloqueado por decisión de negocio del operador, ya registrado).
2. **QA solo de estructura, nunca de percepción real del frame
   renderizado** — sí es arreglable con $0 y sin depender del operador
   (se puede medir contraste/legibilidad/loudness sobre el video ya
   renderizado con librerías libres, ej. `ffmpeg`/Pillow/librosa, que ya
   están probadas en este sandbox). Candidato real para una próxima
   ronda.
3. **Catálogo de 28 componentes / variedad de golpes acotada** — techo
   de volumen, no de arquitectura (el Director Visual ya es extensible
   sin tocar código) — se resuelve agregando más componentes/golpes con
   el tiempo, no rediseñando nada.

Esta auditoría alimenta directamente el punto 15 (priorización P0-P3),
que sigue a continuación en este mismo documento de trabajo.
