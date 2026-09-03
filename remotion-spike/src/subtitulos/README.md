# Subtítulos reales (R7-16) — whisper.cpp + @remotion/captions

Pendiente más antiguo del proyecto (`PENDIENTES.md` ítem 1, desde
Ronda 2): timestamps palabra-por-palabra para subtítulos reales.
Ronda 5/6 lo dejaron investigado y clasificado "PROBAR" (ver
`fabrica/skills/INVESTIGACION_HERRAMIENTAS.md`, entrada
`whisper-cpp-captions`) sin instalar nada todavía. Esta ronda se
probó de verdad.

## Qué se confirmó REAL (2026-09-03)

- **`installWhisperCpp()` funciona en este entorno.** Se compiló
  whisper.cpp manualmente (`git clone` + `make`, el mismo camino que
  usa la función) y el binario `whisper-cli` resultante corre
  (`--help` responde correctamente). Confirma lo que la investigación
  de Ronda 6 ya sospechaba: whisper.cpp no necesita GPU ni Python/
  PyTorch, corre en CPU pura.
- **El componente de render `TikTokCaptions.tsx` funciona de
  verdad.** Usa `createTikTokStyleCaptions()` (paquete oficial
  `@remotion/captions`) para agrupar `Caption[]` en páginas y resalta
  la palabra activa según el frame actual. Renderizado real (no solo
  tipecheck) con `npx remotion render prueba-captions` sobre audio
  REAL de la fábrica (`fabrica_demo_05/hook_0.wav`) — evidencia en
  `fabrica/salidas/captions_001/` (mp4 + 2 frames PNG). Los frames
  confirman: texto legible, la palabra que suena en ese momento
  cambia de color (blanco → acento), sincronizado con los timestamps
  de la fixture.

## Qué está BLOQUEADO (no por falta de intento)

`downloadWhisperModel()` descarga el modelo real desde
`huggingface.co` — la política de red de ESTE sandbox lo BLOQUEA
explícitamente (403, "organization policy", confirmado con
`curl` y con el endpoint de estado del proxy). Se probó también el
mirror alternativo que el propio script de whisper.cpp deja
comentado, `ggml.ggerganov.com` — también bloqueado (mismo error).
Sin el modelo no hay transcripción real posible en este entorno.

**Consecuencia honesta:** no existe todavía ninguna transcripción
REAL de un audio de la fábrica. `fixture_sintetica.json` es un
`Caption[]` armado A MANO (texto real de `hook_0.wav`, timestamps
estimados por duración, NO medidos por whisper) -- existe solo para
probar que el componente de render funciona, está marcado como tal
en su propio JSON (`_advertencia`) y en el nombre del archivo.

## Próximo paso real

`fabrica/carrusel/exportar_props.ts` y el resto de la fábrica ya
demuestran que este sandbox puede compilar/renderizar sin problema —
el ÚNICO bloqueo acá es la descarga del modelo. El candidato natural
para destrabarlo es un runner de GitHub Actions (salida a internet
normalmente abierta, mismo razonamiento ya aplicado en Ronda 6 para
confirmar WebGL2 fuera de este sandbox): correr
`remotion-spike/src/subtitulos/transcribir.ts` ahí, sobre un audio
real, y si el modelo se descarga bien, reemplazar
`fixture_sintetica.json` por una transcripción real de verdad.
Registrado formalmente en `fabrica/research/` (bloqueo real, no
hipótesis) y en `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md`.

## Pendiente de pulido menor

En el frame renderizado, el espaciado entre una palabra muy corta
("Le") y la siguiente se ve un poco más apretado que entre el resto
de las palabras -- cosmético, no bloqueante, revisar si vale la pena
ajustar el `gap` de `TikTokCaptions.tsx` cuando haya una transcripción
real con la que iterar.
