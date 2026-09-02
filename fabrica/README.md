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
`test-normalizador`, `test-resolver-assets`, `test-resolver-musica`,
`test-qa`, `test-qa-composicion`).

Prueba de punta a punta (arma un video real con la cadena completa y
lo renderiza con Remotion):

```bash
npm run demo-punta-a-punta   # o: npx tsx ejemplos/generar_demo_02.ts (el ejemplo mas grande)
cd ../remotion-spike
npx remotion render fabrica-demo-02 out/fabrica-demo-02.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
python3 ../fabrica/qa/checks_duros.py out/fabrica-demo-02.mp4
python3 ../fabrica/qa/checks_composicion.py src/fabrica_bridge/demo_02.json --duracion-real <la que reporte ffprobe>
```

## Estado real por fase (2026-09-02, actualizado tras la ronda de trabajo autónoma)

Regla seguida en toda esta tabla: una fase no está "terminada" solo
porque el archivo existe -- tiene que estar implementada, probada con
datos/tests reales, y conectada donde corresponde.

| Fase | Qué es | Estado | Evidencia |
|---|---|---|---|
| 0 | Comprensión de la especificación | **TERMINADA** | `../NUEVA_FABRICA.md` |
| 1 | Guion (ideación, unidades narrativas tipadas) | **PARCIAL — BLOQUEADO POR:** ideación automática necesita un LLM, y automatizarla sin autorización de gasto viola la regla de $0 (ver PENDIENTES.md #5). Los TIPOS del contrato sí existen (`voz/contrato.py:UnidadNarrativa`) y el guion se puede seguir escribiendo conversando con Claude, gratis. | `voz/contrato.py` |
| 2 | Fundaciones (registro, schema, memoria) | **TERMINADA** | `componentes/schema.json`, `componentes/registro.json`, `memoria/` |
| 3 | Voz (normalización, contrato, orquestador) | **TERMINADA para lo que no depende de correr el motor.** Normalizador ampliado esta sesión: fechas completas, abreviaturas, números sueltos sin separador de miles, decimales con coma — todo con tests. Timestamps palabra-por-palabra: investigado y CONFIRMADO que el motor no los expone (PENDIENTES.md #1), con alternativa local ($0) identificada (`faster-whisper`). Prueba real con Qwen3-TTS preparada (manifest + workflow) — falta que el operador la dispare (ver PENDIENTES.md #3). | `voz/normalizador.py` + `voz/test_normalizador.py`, `voz/preparar_prueba_qwen.py` |
| 4 | Director Visual | **TERMINADA**, con extensibilidad probada empíricamente (un componente nuevo se vuelve elegible sin tocar `visual.ts`) | `directores/visual.ts` + `directores/test_visual.ts` |
| 5 | Componentes (catálogo) | **TERMINADA** — 26 de 26 componentes reusables identificados en `remotion-spike/src/` catalogados y validados contra el código real (subieron de 17 a 26 esta sesión: `agresivo/` completo, el resto de `escenas/plata.tsx` y `pantallas.tsx`, `Grafico.tsx`, `Silueta.tsx`). Lo que quedó afuera está documentado por qué (constantes hardcodeadas, demos/muestrarios) en `componentes/README.md`. | `componentes/registro.json`, `componentes/README.md` |
| 6 | Assets | **TERMINADA**, con un bug real de matching corregido esta sesión (ponderación por frecuencia de documento) | `assets/resolver.py` + `assets/test_resolver.py` |
| 7 | Audio (golpes/SFX; música de fondo) | **TERMINADA.** Golpes/SFX: terminado y probado desde antes. Música de fondo: infraestructura nueva esta sesión (`musica/resolver_musica.py`, catálogo vacío a propósito — no hay tracks reales todavía, investigación de candidatos libres de derechos preparada en un workflow, ver PENDIENTES.md). | `directores/audio.ts`, `musica/resolver_musica.py` + `musica/test_resolver_musica.py` |
| 8 | Composición + Render | **TERMINADA, incluyendo multi-audio.** El patrón `AudioCentro` (varios clips de audio superpuestos en un mismo bloque) está generalizado (`composicion/armar.ts`). Dos renders reales de punta a punta: `fabrica-demo-01` (2 unidades) y `fabrica-demo-02` (4 unidades, 3 con multi-audio, asset de fondo resuelto por el resolver real, anti-repetición real cruzando memoria entre videos) — ambos pasaron QA duro sin problemas. QA ampliado con checks a nivel de árbol de composición (assets faltantes, texto vs. capacidad, duración esperada vs. real). | `composicion/armar.ts`, `remotion-spike/src/fabrica_bridge/FabricaVideo.tsx`, `ejemplos/generar_demo_02.ts`, `qa/checks_composicion.py` |
| 9 | Laboratorio + memoria de datos | **TERMINADA** (esquema y API; datos reales cargándose ya con cada demo — `fabrica-demo-01`/`02` están registrados en `memoria/laboratorio.json` como hipótesis, sin resultado real todavía porque no se publicaron) | `memoria/tipos.ts`, `memoria/api.ts` + `memoria/test_api.ts` |
| 10-12 | Producción en volumen / Datos reales / Aprendizaje | **NO EMPEZADO** — necesitan videos publicados con métricas reales, que todavía no existen para esta serie. No hay nada que "adelantar" acá sin inventar datos. | — |

## Qué demuestra el render de prueba (`fabrica-demo-02`, el más completo)

`npx tsx ejemplos/generar_demo_02.ts` corrió la cadena real (no
simulada), de punta a punta, con 4 unidades (hook, timeline, cifra,
cierre):

1. `DirectorVisual.consultar()` **eligió** `punch` (hook), `cronologia`
   (centro, 3 clips de audio), `cifra-se-cae` (cifra) y de nuevo
   `punch` (cierre) del registro real -- nadie los escribió a mano.
2. **Multi-audio real:** el hook y el cierre reproducen 2 clips de
   audio cada uno, superpuestos dentro del mismo bloque visual, en sus
   offsets exactos calculados por `armarComposicion()` -- el patrón
   `AudioCentro` generalizado.
3. **Asset real resuelto:** el fondo de video del hook (`freelance-00.mp4`)
   lo encontró `assets/resolver.py` a partir de la descripción de la
   escena, sin que nadie lo nombrara a mano.
4. **Anti-repetición real:** `punch` se repite en hook y cierre --
   `DirectorVisual` lo detectó, restó puntos en la segunda consulta, y
   lo eligió igual porque seguía siendo el mejor candidato real (la
   regla exacta que pidió el operador: penalizar, no prohibir).
5. `FabricaVideo.tsx` montó todo en una composición Remotion real y se
   renderizó con `npx remotion render` (30.9s, 1080x1920, 926 frames).
6. Se verificó con `qa/checks_duros.py` (sin problemas ni alertas) y
   con `qa/checks_composicion.py` (sin problemas duros; alertas
   heurísticas de "texto largo para la capacidad declarada" en las 4
   escenas -- se verificaron visualmente extrayendo frames del render
   y el texto entra bien, envuelve en varias líneas sin salirse de
   pantalla: el presupuesto de caracteres es deliberadamente
   conservador, exactamente para que avise de más y no de menos).
7. El video quedó registrado en `memoria/laboratorio.json` como
   hipótesis (sin resultado real, porque no se publicó).

En el camino, el render anterior (`fabrica-demo-01`) **encontró un bug
real** en el QA duro (`blackdetect` marcaba el fondo de marca
casi-negro de la serie, `#0A0A0C`, como "pantalla negra sospechosa"
por error) -- ya está corregido con test de regresión. Esta ronda
encontró otro bug real corriendo `generar_demo_02.ts`: el resolver de
assets matcheaba por una palabra genérica compartida ("trabajo") en
vez de la palabra específica real -- corregido con ponderación por
frecuencia de documento (`assets/resolver.py`). Se deja documentado
porque es exactamente el tipo de cosa que la sección 22 del prompt
maestro (capacidad de crítica) pide no barrer bajo la alfombra.

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
