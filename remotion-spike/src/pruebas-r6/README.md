# R6-7 — Pruebas aisladas de 4 paquetes nuevos de Remotion

Resultado real de instalar y renderizar (no solo revisar documentación)
`@remotion/transitions`, `@remotion/effects`, `@remotion/three` y
`@remotion/rough-notation` en `remotion-spike/`, ANTES de tocar
`FabricaVideo.tsx` o cualquier componente de producción. Ver
`fabrica/skills/INVESTIGACION_HERRAMIENTAS.md` (ítems 1, 8, 9, 10) para
el análisis previo a esta prueba.

Comando de render usado (mismo motor headless que ya usa la fábrica,
via Playwright pre-instalado en este entorno — `npx remotion browser
ensure` de los workflows de GitHub Actions no aplica aquí porque
descarga desde `remotion.media`, bloqueado por la política de red de
este sandbox):

```bash
npx remotion render <id> out/<id>.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

## Resultados

| Composición | Paquete | Render | Verificación visual | Riesgo confirmado |
|---|---|---|---|---|
| `prueba-highlights` | `@remotion/rough-notation` | OK, 90/90 frames | `Highlight`/`Circle`/`Underline` animados con `progress` | Ninguno — dibujo 2D puro |
| `prueba-transiciones` | `@remotion/transitions` | OK, 75/75 frames | Frame 20: blend real de fade (ESCENA A/B superpuestas); frame 50 y 65: corte duro de slide/wipe con las dos escenas visibles a la vez | Ninguno |
| `prueba-efectos` | `@remotion/effects` | OK, 60/60 frames (más lento: ~60s vs ~1-2s de las otras — señal de que WebGL2 real se activó, no un no-op) | Frame 30 exportado a PNG: viñeta (`vignette`) claramente visible oscureciendo los bordes — no hay pantalla negra ni error silencioso | **WebGL2 funciona en el `headless_shell` de este entorno sin configuración adicional** (más allá del `setChromiumOpenGlRenderer('angle')` que ya estaba en `remotion.config.ts` desde antes) |
| `prueba-3d` | `@remotion/three` | OK, 60/60 frames | Frame 30 exportado a PNG: cubo 3D real en perspectiva, con sombreado direccional de `meshStandardMaterial` reaccionando a `pointLight` — confirma geometría/cámara/luz reales, no un placeholder 2D | **3D real (Three.js/R3F) renderiza correctamente en el mismo entorno headless, sin GPU dedicada** |

## Duración total de `prueba-transiciones` — confirma la fórmula documentada

4 escenas de 30 frames + 3 transiciones de 15 frames cada una:
`30*4 - 15*3 = 75` frames a 30fps = 2.5s. `ffprobe` sobre el archivo
renderizado devolvió `duration=2.560000` (los 0.06s extra son overhead
normal de muxing) — la fórmula de `transitions.md` es correcta en la
práctica, no solo en la doc.

## Conclusión — actualiza el estado "NO CONFIRMADO" de `INVESTIGACION_HERRAMIENTAS.md`

Las 4 herramientas quedan reclasificadas de **PROBAR** a **CONFIRMADAS,
listas para integrar** (R6-8 a R6-11). El riesgo más grande de la
tanda — si WebGL2 funcionaría sin GPU dedicada en el entorno headless
ya usado para renderizar — quedó resuelto con evidencia real: sí
funciona, con el mismo `Config.setChromiumOpenGlRenderer('angle')` que
ya estaba puesto (sin saber, hasta ahora, que hacía falta para esto).

Pendiente honesto: esta prueba corrió en el sandbox de esta sesión, no
en el runner real de GitHub Actions. El workflow de producción usa
`npx remotion browser ensure` (que descarga el propio Chrome Headless
Shell de Remotion desde `remotion.media`), un binario distinto al
Playwright pre-instalado usado acá. Es razonable esperar el mismo
comportamiento (ambos son Chromium con ANGLE), pero **no está
confirmado en GitHub Actions real** hasta que se corra ahí — anotado
como el primer paso de R6-9/R6-10 antes de dar por cerrado el riesgo de
CI (R6-8, abajo, ya se integró y probó).

## R6-8 — Transiciones reales integradas al puente de render (`FabricaVideo.tsx`)

Problema real que había que resolver antes de conectar
`@remotion/transitions` de verdad (no solo probarlo aislado): el
`TransitionSeries.Transition` SUPERPONE dos escenas, acortando la
duración total -- pero en la fábrica cada escena dura EXACTO lo que
dura su audio real (Qwen3-TTS) + un margen de aire fijo de 0.25s
(`AIRE_SEG`, ver `fabrica/composicion/armar.ts`). Si se aplicara una
transición real sin más, la escena siguiente arrancaría antes de lo
que su propio audio "sabe" que le corresponde -- un desincronismo
real, no cosmético.

**Solución implementada** (`fabrica/composicion/armar.ts`,
`remotion-spike/src/fabrica_bridge/FabricaVideo.tsx`,
`remotion-spike/src/escenas/golpes.tsx`):

1. Solo los golpes ya conceptualmente "continuos" (`fundido`,
   `desliza` -- nunca los de impacto: fogonazo/sacudon/negro/corte/
   raya/cortina, mismo criterio de siempre de no forzar un encaje que
   no es) califican para una transición real.
2. Una escena solo puede ofrecer una transición real si TIENE audio
   propio (si no, no hay garantía de silencio real al final).
3. `armarComposicion()` extiende el margen de cola de `AIRE_SEG` (0.25s)
   a `AIRE_TRANSICION_SEG` (0.6s) SOLO en esas escenas, y ajusta el
   cursor para que `desdeSeg` de la escena siguiente refleje la
   posición REAL que produce la superposición (no una posición
   ficticia "como si no hubiera transición") -- ver el comentario largo
   en `armar.ts` con la derivación completa.
4. `FabricaVideo.tsx` pasó de `<Sequence>` planas a `<TransitionSeries>`
   real, insertando `<TransitionSeries.Transition>` (fade para
   'fundido', slide-from-right con spring para 'desliza') solo donde
   `transicionSalienteSeg` viene marcado en el árbol.
5. `Golpe` (`golpes.tsx`) gana un prop `sinEfectoVisual` para no
   duplicar el efecto CSS de siempre cuando la transición real ya
   resuelve la entrada (el sonido del golpe se mantiene igual).

**Prueba de punta a punta con audio REAL** (no inventado):
`fabrica/composicion/prueba_r6_8.ts` arma un árbol de 2 escenas
usando 2 audios reales ya generados con Qwen3-TTS para fabrica-demo-06
(`hook_0.wav` = 3.136009s, `hook_1.wav` = 2.111995s, copiados a
`public/pruebas-r6/`), con golpe `fundido` en la segunda. Resultado
verificado con render real (composición `prueba-r6-8`):

- `armarComposicion()` calculó `desdeSeg` de la escena 2 = exactamente
  `3.136009` -- el mismo número que la duración real medida del primer
  audio, sin el hueco de silencio de 0.25s que había antes.
- `ffmpeg -af silencedetect` sobre el .mp4 renderizado confirma: sin
  hueco de silencio anómalo entre el fin del audio 1 y el comienzo del
  audio 2 (los silencios detectados son las pausas naturales DENTRO de
  cada narración, no un artefacto del corte) -- cero desincronismo.
- El video renderizó exactamente 180 cuadros (`duracionTotalSeg` =
  5.998004s × 30fps), sin cuadros congelados/vacíos al final -- prueba
  de que la resta de la superposición en el cursor de `armar.ts` es
  correcta.
- El frame en el cuadro 102 (t≈3.4s, dentro de la ventana de
  transición) muestra REALMENTE los dos textos superpuestos
  ("EL CURSO CUESTA $89" desvaneciéndose sobre "Y GENERA POR SEMANA
  $3.560" apareciendo) -- confirma un crossfade real de
  `@remotion/transitions`, no un efecto CSS de golpes.tsx.

Los tests unitarios de `armarComposicion()` (`test_armar.ts`) cubren
los 3 casos: transición real activada, golpe siguiente NO continuo
(sin cambios respecto a antes de R6-8) y escena sin audio (nunca
ofrece transición real, aunque el golpe siguiente calificaría). Los 12
suites de test de `fabrica/` (incluidos todos los generadores de
demo_01..06) siguen pasando sin cambios -- backward compatible
confirmado, no solo asumido.

## R6-9 — Capa de efectos reales (`@remotion/effects`) para golpes

Hallazgo técnico real (con evidencia, no supuesto) sobre cómo funciona
`effects` de `@remotion/effects`: el efecto post-procesa los PIXELES
PROPIOS del elemento etiquetado (`<Video>`/`<Solid>`/`<CanvasImage>`),
no el contenido de React que esté DEBAJO en el DOM. Esto separa las 4
herramientas probadas en dos grupos reales:

- **`chromaticAberration`/`glow` sobre un `<Solid>` de color sólido**
  (ver `PruebaEfectos.tsx`, R6-7): funcionan como efecto GENERATIVO
  sobre ese color -- útiles para un flash/destello propio, no para
  procesar la escena de abajo.
- **`lightLeak`** (ver `PruebaLightLeak.tsx`, NUEVO): SÍ funciona como
  capa decorativa transparente encima de contenido real -- confirmado
  con un `<Solid color="transparent">`, el "CONTENIDO DEBAJO" se ve
  perfectamente a través de las zonas sin leak, y el barrido cálido
  diagonal es real WebGL, no CSS.
- **`vignette`** (ver `PruebaVineta.tsx`, NUEVO): probado con
  `mode:'color'` sobre un `<Solid color="transparent">` esperando el
  mismo comportamiento que `lightLeak` (oscurecer solo los bordes,
  centro transparente) -- el resultado real fue mucho más opaco de lo
  esperado incluso con `radius=0.55` (el "centro sin afectar" casi no
  se distingue del resto). **No se usa esta ronda** -- necesitaría más
  ajuste de parámetros para dar un look "viñeta cinemática sutil"
  utilizable, y no vale la pena adivinar parámetros sin poder verlos
  renderizados uno por uno. Queda como PENDIENTE, no descartado.

## R6-10 — Primer componente 3D real, agregado al registro (`torre-3d`)

`remotion-spike/src/tres/Torre3D.tsx`: una torre de 7 bloques 3D reales
(Three.js/`@remotion/three`, geometría/cámara/luz de verdad, rotación
sutil de grupo) que se apila mientras un número cuenta hasta el valor
final -- mismo rol narrativo que `Contador` (misma curva de conteo,
para que el aterrizaje del número coincida con el último bloque
asentándose), pero con profundidad real en vez de CSS. Agregado
formalmente al registro de componentes
(`fabrica/componentes/registro.json`, id `torre-3d`, categoría
`cifra`) y al mapa de implementaciones de `FabricaVideo.tsx` -- no es
una prueba aislada, es un componente real y usable por el Director
Visual.

Iteración real durante la prueba (documentada porque así se hizo, no
porque saliera bien a la primera): el primer render con bloques de
1.7×0.42×1.7 y espaciado 0.5 dio una torre demasiado apretada -- los
bloques se veían como un bloque sólido sin separación visible. Se
ajustó a 1.3×0.28×1.3 con espaciado 0.62, confirmado con un segundo
render real que sí muestra 7 bloques distintos con huecos visibles y
caras superiores en perspectiva.

Probado de punta a punta con audio real a través del pipeline
completo (no solo como composición aislada):
`fabrica/composicion/prueba_r6_10.ts` arma un árbol con `torre-3d` +
un audio real de 5.568s (`impacto_1.wav` de demo_06) + golpe
`fogonazo`, y la composición `prueba-r6-10` (usa `FabricaVideo`, el
puente de render real) renderizó los 190 cuadros esperados
correctamente.

Pendiente honesto: no se midió el costo de render de este componente a
escala de producción (WebGL es más caro que CSS/Canvas 2D, ver R6-7) --
razonable para un momento puntual de alto impacto, no medido si usarlo
en muchas escenas seguidas de un video largo sigue siendo práctico en
tiempo de render de GitHub Actions.

**Implementado en producción** (`remotion-spike/src/escenas/golpes.tsx`):
el golpe `'cortina'` -- que ya era conceptualmente "un lavado cálido
diagonal, como un light leak de cámara analógica" con una imitación en
CSS (gradiente + `clip-path`) -- ahora usa el `lightLeak()` REAL de
`@remotion/effects`. Confirmado con la composición `prueba-cortina`
(usa el componente `Golpe` real, no una copia aislada): el texto de la
escena real se ve correctamente a través del leak, con el barrido
cálido diagonal genuino. Ningún otro golpe cambió -- `fogonazo` se dejó
con su CSS actual porque una prueba real de `glow()` sobre un Solid ya
blanco no mostraría una mejora clara (glow necesita contraste
brillante/oscuro para tener algo que resaltar; un blanco uniforme no lo
tiene) -- mejor no cambiarlo que cambiarlo sin una mejora demostrable.
