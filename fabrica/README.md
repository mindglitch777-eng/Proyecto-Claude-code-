# La Nueva Fábrica

Sistema de creación audiovisual por fases (ver especificación completa
y decisión de arquitectura en `../NUEVA_FABRICA.md`). Este directorio
es **independiente** de todo lo demás en el repo: no reemplaza ni
modifica el motor viejo de "El Corte" (Hotmart) ni la serie documental
ya entregada (`remotion-spike/src/documental/`). El único punto de
contacto es `remotion-spike/src/fabrica_bridge/`, el puente de RENDER
(ver Fase 8).

**Antes de leer nada más, si algo no anda: `PENDIENTES.md` tiene la
lista concreta de bloqueos, qué los causa y qué se necesita para
resolverlos.** Nada en este README repite esa información.

## Cómo correr todo

```bash
cd fabrica
npm install          # una sola vez
npm run test-todo    # corre TODOS los tests reales de todos los sistemas
```

Cada sistema también se puede probar solo (ver `package.json` para la
lista completa de scripts: `validar-registro`, `test-director-visual`,
`test-director-audio`, `test-memoria`, `test-composicion`,
`test-normalizador`, `test-resolver-assets`, `test-qa`).

Prueba de punta a punta (arma un video de juguete con la cadena
completa y deja todo listo para renderizar con Remotion):

```bash
npm run demo-punta-a-punta
cd ../remotion-spike
npx remotion render fabrica-demo-01 out/fabrica-demo-01.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

## Estado real por fase (2026-09-02)

Regla seguida en toda esta tabla: una fase no está "terminada" solo
porque el archivo existe -- tiene que estar implementada, probada con
datos/tests reales, y conectada donde corresponde.

| Fase | Qué es | Estado | Evidencia |
|---|---|---|---|
| 0 | Comprensión de la especificación | **TERMINADA** | `../NUEVA_FABRICA.md` |
| 1 | Guion (ideación, unidades narrativas tipadas) | **PARCIAL — BLOQUEADO POR:** ideación automática necesita un LLM, y automatizarla sin autorización de gasto viola la regla de $0 (ver PENDIENTES.md #5). Los TIPOS del contrato sí existen (`voz/contrato.py:UnidadNarrativa`) y el guion se puede seguir escribiendo conversando con Claude, gratis. | `voz/contrato.py` |
| 2 | Fundaciones (registro, schema, memoria) | **TERMINADA** | `componentes/schema.json`, `componentes/registro.json`, `memoria/` |
| 3 | Voz (normalización, contrato, orquestador) | **PARCIAL — BLOQUEADO POR:** timestamps palabra-por-palabra de Qwen3-TTS no confirmados (PENDIENTES.md #1); el orquestador de generación (`voz/contrato.py:generar_audio_unidades`) está escrito, tipado y con sus imports probados, pero NO se ejecutó de punta a punta porque el motor Qwen3-TTS no corre en este sandbox (necesita GitHub Actions). El normalizador sí está 100% probado y funcionando. | `voz/normalizador.py` + `voz/test_normalizador.py` (todos los tests pasan) |
| 4 | Director Visual | **TERMINADA** | `directores/visual.ts` + `directores/test_visual.ts` (todos los tests pasan, contra el registro real) |
| 5 | Componentes (catálogo) | **PARCIAL** — 17 de ~45 archivos de componentes existentes en `remotion-spike/src/` catalogados (13 validados leyendo el código real + 4 por nombre). Falta catalogar el resto (`agresivo/`, la mayoría de `escenas/`) — ver `componentes/README.md` para la lista exacta y por qué no se inventó metadata para esos. | `componentes/registro.json`, `componentes/README.md` |
| 6 | Assets | **TERMINADA** (para lo que ya existe curado en el repo) | `assets/resolver.py` + `assets/test_resolver.py` (todos los tests pasan, contra carpetas reales) |
| 7 | Audio (golpes/SFX; música de fondo) | **PARCIAL — BLOQUEADO POR:** música de fondo es un pendiente de TODO el proyecto (ya estaba en `state/state.json` antes de esta sesión) — `investigar_musica.py` existe pero nunca se corrió/confirmó ningún track. El Director de Audio para golpes/SFX (lo que sí es 100% del proyecto) está terminado y probado. | `directores/audio.ts` + `directores/test_audio.ts` |
| 8 | Composición + Render | **TERMINADA para el caso simple** (1 unidad narrativa = 1 clip de audio = 1 escena). Probado de punta a punta con un render real (`fabrica-demo-01`, ver más abajo). El caso de un bloque con VARIOS audios superpuestos (patrón `AudioCentro` de la serie documental) no está generalizado todavía — ver PENDIENTES.md #6. | `composicion/armar.ts` + `composicion/test_armar.ts`, `remotion-spike/src/fabrica_bridge/FabricaVideo.tsx`, `ejemplos/generar_demo_01.ts` |
| 9 | Laboratorio + memoria de datos | **TERMINADA** (esquema y API; vacío de datos reales porque todavía no hay publicaciones de esta serie nueva — es lo esperable) | `memoria/tipos.ts`, `memoria/api.ts` + `memoria/test_api.ts` |
| 10-12 | Producción en volumen / Datos reales / Aprendizaje | **NO EMPEZADO** — necesitan videos publicados con métricas reales, que todavía no existen para esta serie. No hay nada que "adelantar" acá sin inventar datos. | — |

## Qué demuestra el render de prueba (`fabrica-demo-01`)

`npm run demo-punta-a-punta` corrió la cadena real (no simulada):

1. Tomó 2 "consultas" (una de categoría `timeline`, otra `cifra`).
2. `DirectorVisual.consultar()` **eligió** `cronologia` y `contador`
   del registro real -- nadie los escribió a mano en el ejemplo.
3. `DirectorAudio.decidirParaUnidad()` decidió el golpe/volumen de cada
   una (incluyendo forzar la anti-repetición: se pidió evitar
   `cifra-se-cae` a propósito y el segundo candidato ganó en su lugar).
4. `armarComposicion()` calculó los offsets a partir de la duración
   REAL de clips de audio ya generados en la serie documental
   (concatenados con ffmpeg para simular una unidad de guion de varias
   líneas).
5. `FabricaVideo.tsx` (el puente de render) montó eso en una
   composición Remotion real.
6. Se renderizó con `npx remotion render` y se verificó con
   `fabrica/qa/checks_duros.py` -- pasó sin problemas.

En el camino, este mismo render **encontró un bug real** en el QA duro
(`blackdetect` marcaba el fondo de marca casi-negro de la serie,
`#0A0A0C`, como "pantalla negra sospechosa" por error) -- ya está
corregido y tiene un test de regresión (`qa/test_checks_duros.py`).
Se deja documentado porque es exactamente el tipo de cosa que la
sección 22 del prompt maestro (capacidad de crítica) pide no barrer
bajo la alfombra.

## Decisiones de esta sesión que quedaron fuera del prompt maestro

- **Lenguaje:** TypeScript para todo lo que interactúa con el
  registro/Remotion (Director Visual, Director de Audio, Composición,
  memoria), Python para todo lo que interactúa con el motor de voz/
  ffmpeg existente (normalizador, contrato de voz, resolver de assets,
  QA). Se reusan `generar_voz_documental_qwen.py` y `voz_piper.py` tal
  cual están -- no hay una segunda copia de la llamada al motor C.
- **`fabrica/` es un paquete Node standalone** (su propio
  `package.json`, sin depender de `remotion-spike/node_modules`) --
  mantiene la separación de la sección 2 de `NUEVA_FABRICA.md`
  (`remotion-spike/` sigue siendo *solo* el motor de render).
