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
como el primer paso de R6-8/R6-9/R6-10 antes de dar por cerrado el
riesgo de CI.
