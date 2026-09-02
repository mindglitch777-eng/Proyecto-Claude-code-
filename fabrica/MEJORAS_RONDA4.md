# Ronda 4 — Director de Edición (de "combinar componentes" a "editar")

Origen: orden maestra del operador pidiendo evolucionar la fábrica de
un sistema que combina componentes a un sistema capaz de **editar
audiovisualmente** — tomar decisiones de ritmo, jerarquía, transición
motivada, microeventos internos y variedad de lenguaje visual, no solo
elegir un componente por unidad narrativa. Regla explícita del pedido:
no agregar más efectos/componentes/transiciones porque sí — identificar
qué **capa** faltaba en la arquitectura y construirla ahí.

Este documento es el detalle técnico completo de la ronda. El resumen
ejecutivo (qué se construyó, qué demuestra el video nuevo, qué queda
pendiente) está en `fabrica/ESTADO_ACTUAL.md`, el informe que pidió
explícitamente el operador al final de la orden.

---

## ANÁLISIS DE `fabrica-demo-04.mp4` (antes de tocar código)

Con los datos ya reales de la Ronda 3 (timeline exacto de escenas, QA
técnico, QA de composición) más una inspección nueva enfocada en
evolución interna y correspondencia narración↔visual.

### Ritmo

Timeline real (7 escenas, 40.94s total):

| Escena | Inicio | Duración | Golpe |
|---|---|---|---|
| hook | 0.00s | 5.24s | ninguno |
| desarrollo | 5.24s | 12.14s | fundido |
| aceleracion | 17.38s | 4.35s | fogonazo |
| pausa | 21.72s | 1.79s | ninguno |
| impacto | 23.51s | 10.10s | sacudon |
| desarrollo2 | 33.61s | 3.58s | corte |
| cierre | 37.19s | 3.25s | negro |

Hallazgo real (no una impresión): **la escena "impacto" (10.1s) y
"desarrollo" (12.14s) concentran el 55% de la duración total del
video**, y ambas dependen de animaciones internas del COMPONENTE
(`AntesDespues`, `Cronologia`) que están calculadas como fracción fija
de la duración TOTAL de la escena, no de cuándo el audio realmente dice
algo nuevo. Eso produce tramos donde la pantalla no cambia mientras la
narración sigue — el "momento estático" que señaló el operador no es
un problema de guion, es que la fábrica no tenía forma de decirle a un
componente "acá pasa algo nuevo" en un punto que no fuera ese 42-62%
fijo.

### Narración → Visual (el hallazgo más concreto y medible)

En la escena "impacto", el audio tiene DOS clips: `impacto_0` (2.37s,
dice "sigue costando $47") y `impacto_1` (7.23s, empieza en el segundo
2.62 y dice "47 clientes... $2.209"). El componente `AntesDespues`
cambia de cara en `[dur*0.42, dur*0.62]` = `[4.24s, 6.26s]` de una
escena de 10.1s — es decir, **desde el segundo 2.62 hasta el 4.24 (1.6
segundos) el audio ya está hablando del "después" con la pantalla
todavía mostrando el "antes"**. Esto es un desfasaje real medido, no
una sospecha — confirma la nota que el propio `registro.json` ya tenía
("con audios muy distintos en duración el corte puede no caer justo
cuando termina de hablarse 'antes'") con un número real.

Contraste útil: el componente `Punch` (usado en hook/cierre) SÍ hace
esto bien — recibe un array `entra` con el offset real de cada línea de
audio, así que cada frase aparece exactamente cuando su audio empieza.
Ese es el patrón que faltaba generalizar, no una idea nueva.

### Visual / Transiciones

Ya resuelto en Ronda 3 (golpes variados + Anticipo). Lo que la Ronda 3
NO tenía: ninguna transición llevaba una **razón registrada** en
ningún lado — el golpe se elegía por nivel de intensidad, pero nada en
el sistema podía explicar "por qué fogonazo y no sacudón" más allá de
"fogonazo es el primero de la lista para ese nivel". Section 13 del
pedido ("todo movimiento importante debe tener una razón") no estaba
cubierta.

### Información

`repeticion_datos.ts` (Ronda 3) ya resuelve la repetición de la cifra
PROTAGONISTA. Lo que no resolvía: el texto de apoyo ("47 clientes esa
semana") sigue mencionando el número original en palabras, lo cual es
correcto lingüísticamente pero hace que el QA basado en texto plano
(`verificar_cifra_repetida_en_texto`) no pueda distinguir "protagonista"
de "mención secundaria" — limitación ya documentada en Ronda 3,
confirmada de nuevo acá.

### Audio

Sin cambios necesarios: QA duro (`checks_duros.py`) no encontró
problemas en demo_04 (sin silencios sospechosos, sin pantallas negras
no intencionales).

### Principios extraídos (no recetas — ver sección 4 del pedido)

1. **Un cambio de estado interno de un componente debería poder
   anclarse a un límite de tiempo real (offset de audio), no a una
   fracción fija de la duración total de la escena** — esto es lo que
   motiva `microeventos.ts` y el prop `momentoCambioSeg` nuevo de
   `AntesDespues`.
2. **Toda transición/golpe debería poder explicar por qué se eligió**
   — esto motiva `EstrategiaTransicion` (motivo/función/intensidad) en
   el Director de Edición.
3. **La "energía" de una escena y el "golpe" que la separa de la
   siguiente son decisiones relacionadas pero no idénticas** — un golpe
   fuerte puede acompañar una escena de energía media si la intención
   es "acelerar hacia" algo, no solo "esto es intenso ahora".
4. **No todo lo que dura mucho es un problema, y no todo lo que dura
   poco es bueno** — lo que importa es si DENTRO de esa duración pasa
   algo perceptible. De ahí `microeventos` como concepto central, no
   "acortar escenas".

---

## ARQUITECTURA: Director de Edición

Ver `fabrica/directores/edicion/` (tipos.ts, estilos.ts,
microeventos.ts, edicion.ts) — documentado en detalle en los propios
archivos. Resumen de la integración con lo existente:

```
Guion → Voz → Director Visual (componente) → Director de Audio (golpe)
                                                    ↓
                                     Director de Edición (ESTRATEGIA:
                                     intención, energía, estilos,
                                     microeventos, transición motivada)
                                                    ↓
                                             Composición → Render
```

El Director de Edición **no reemplaza ninguna decisión existente** —
consulta lo que Director Visual y Director de Audio ya decidieron y
agrega la capa de intención/justificación/microeventos que faltaba.
`UnidadResuelta`/`EscenaComposicion` ganan un campo opcional
`estrategiaEdicion` (ver `composicion/tipos.ts`) — un árbol viejo
(demo_01..04) sigue siendo válido sin él.

### Por qué NO es una segunda fábrica paralela

- No elige componentes (eso sigue en `DirectorVisual.consultar()`).
- No elige golpes (eso sigue en `DirectorAudio.decidirParaUnidad()`,
  que recibe el resultado del Director de Edición solo como parámetro
  de entrada para anotar el motivo, nunca al revés).
- No renderiza nada — sigue siendo Remotion + `FabricaVideo.tsx`.
- Los microeventos se traducen a UNA sola prop real hoy
  (`momentoCambioSeg` de `AntesDespues`), de forma explícita y
  puntual — no un sistema genérico de "cualquier componente puede
  suscribirse a microeventos" sin un segundo caso real que lo
  justifique (sección 24 del pedido).

---

## COMPONENTES MODIFICADOS

- `remotion-spike/src/escenas/explica.tsx` (`AntesDespues`): acepta
  `momentoCambioSeg`/`anchoCambioSeg` opcionales, backward-compatible
  por construcción (sin pasarlos, el resultado es idéntico al de
  antes — verificado algebraicamente: `centro=dur*0.52, ancho=dur*0.2`
  da exactamente `[dur*0.42, dur*0.62]`).
- `remotion-spike/src/fabrica_bridge/FabricaVideo.tsx`: traduce el
  microevento `'se_revela_comparacion'` a `momentoCambioSeg` cuando el
  componente es `antes-despues`. Tipo `EscenaFabrica` gana el campo
  opcional `estrategiaEdicion` (duck-tipado, sin importar el paquete
  completo de `fabrica/`, mismo principio que `TipoGolpe`).
- `fabrica/composicion/tipos.ts` / `armar.ts`: campo opcional
  `estrategiaEdicion` propagado sin tocar la lógica de timing existente.
- `fabrica/componentes/registro.json`: notas de `antes-despues`
  actualizadas con los props nuevos y la confirmación real del
  desfasaje medido.

## NUEVAS CAPACIDADES

- `fabrica/directores/edicion/` — Director de Edición completo (ver
  arriba).
- `fabrica/qa/critica_editorial.py` — Editorial Critic: 6 categorías
  (repetición/ritmo/visual/narrativa/audiovisual/coherencia), siempre
  heurístico, nunca bloquea (`ok` es siempre `True`).
- `fabrica/laboratorio/ciclo_mejora.ts` — ciclo de mejora controlado
  (máx. 2 iteraciones, única corrección automática: golpe repetido
  consecutivo; todo lo demás queda reportado, nunca "arreglado" a
  ciegas).
- `fabrica/memoria/patrones.ts` — anti-repetición evolucionada de
  componentId a patrón (categoría+estilos+golpe), con el mecanismo de
  "recuperar prioridad si `resultadoReal` indica que funciona"
  implementado y testeado (con datos sintéticos — no hay datos reales
  todavía, ver `PENDIENTES.md`).

## TESTS

Todo corrido con `npm run test-todo`, suite completa verde, cero
regresiones. Nuevos: `test_estilos.ts`, `test_microeventos.ts`,
`test_edicion.ts`, `test_patrones.ts`, `test_ciclo_mejora.ts` (este
último corre contra los scripts reales de QA vía shell-out, no un
mock), `test_critica_editorial.py` (incluye una corrida contra el
árbol real de `fabrica-demo-04`).

## DECISIONES TOMADAS (y por qué)

- **El ciclo de mejora opera sobre el árbol de composición, no sobre
  el render.** Volver a renderizar con Remotion en cada iteración
  cuesta minutos; el QA que sí necesita el mp4 (`checks_duros.py`) no
  cambia por reordenar golpes/evitar componentes. El render final pasa
  por QA duro una sola vez, sobre el árbol que ganó el ciclo.
- **La única corrección automática del ciclo es el golpe repetido
  consecutivo.** Es mecánica, reversible, y usa un camino ya existente
  y testeado (`evitarGolpes`). Todo lo demás (cifra repetida, energía
  plana, categoría repetida) queda como alerta para revisión humana —
  "si no puede determinar que una modificación mejora algo, no
  hacerla arbitrariamente" (sección 20 del pedido).
- **No se tocaron los otros 25 componentes** más allá de
  `AntesDespues`. El principio (anclar cambios internos a audio real)
  se documenta para aplicarse cuando un guion futuro lo necesite en
  otro componente, no de forma preventiva sobre todos.
- **No se construyó un motor de "composiciones en capas".** El pedido
  mismo lo prohibía como sistema paralelo (sección 5). La forma real
  en que esto se resolvió parcialmente es el mecanismo de traducción
  microevento→prop (hoy con un solo caso real).

Ver `fabrica/ESTADO_ACTUAL.md` para el resultado del video de prueba,
problemas encontrados, pendientes y próximo paso.
