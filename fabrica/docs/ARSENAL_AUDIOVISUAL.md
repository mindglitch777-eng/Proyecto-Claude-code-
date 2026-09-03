# Arsenal Audiovisual — capacidades externas conocidas

Pedido explícito del operador (sección 9, "Prompt Maestro — capa de
exploración agresiva"): un mapa vivo de qué herramientas/técnicas
externas existen para cada capacidad, cuál usamos, y por qué. **No es
una carpeta nueva** — es una síntesis de lo que ya vive repartido en
`fabrica/skills/registro.ts`, `fabrica/mcp/registro.ts`,
`fabrica/directores/edicion/tecnicas.ts` y `fabrica/hooks/catalogo.ts`
(cada capacidad linkea a su registro real; este documento no duplica
el detalle, lo organiza por capacidad en vez de por herramienta).

Se actualiza cada vez que se investiga/prueba una capacidad nueva —
nunca se re-investiga desde cero algo que ya está acá.

---

### CAPACIDAD: Transiciones con superposición real
**HERRAMIENTAS:** `@remotion/transitions` (oficial) · CSS crossfade casero (descartado)
**NUESTRA IMPLEMENTACIÓN:** `remotion-spike/src/fabrica_bridge/FabricaVideo.tsx` (`TransitionSeries`)
**MEJOR OPCIÓN ACTUAL:** `@remotion/transitions`
**ESTADO:** INTEGRADO (R6-8)
**EVIDENCIA:** Render real con audio, sin desincronizar la narración (`ffmpeg silencedetect`) — `remotion-spike/src/pruebas-r6/README.md`
**COSTO:** $0 (Remotion License, cubre individuos)
**COMPATIBILIDAD:** confirmada con `remotion@4.0.518`
**RIESGO:** ninguno — ya en producción, solo para golpes 'fundido'/'desliza'

### CAPACIDAD: Efectos visuales/cinematográficos (viñeta, glitch, etc.)
**HERRAMIENTAS:** `@remotion/effects` (oficial, ~60 efectos WebGL2)
**NUESTRA IMPLEMENTACIÓN:** `lightLeak()` real para golpe 'cortina'; vignette probado y descartado (muy opaco)
**MEJOR OPCIÓN ACTUAL:** `@remotion/effects`
**ESTADO:** INTEGRADO parcialmente (R6-9) — solo `lightLeak()`, el resto del catálogo de ~60 efectos sin explorar caso por caso
**EVIDENCIA:** WebGL2 confirmado funcionando en `headless_shell` sin GPU dedicada (hallazgo no garantizado de antemano)
**COSTO:** $0
**COMPATIBILIDAD:** confirmada en este sandbox; **NO CONFIRMADO** en runner real de GitHub Actions (`fabrica/research/`, id `webgl2-github-actions-runner-real`)
**RIESGO:** ninguno de costo; el pendiente es de plataforma (CI real), no de la herramienta

### CAPACIDAD: Motion 3D
**HERRAMIENTAS:** `@remotion/three` (oficial) · `@remotion/skia` (oficial, no probado) · `@remotion/rive` (oficial, Remotion License, no probado)
**NUESTRA IMPLEMENTACIÓN:** `Torre3D` (`remotion-spike/src/tres/Torre3D.tsx`)
**MEJOR OPCIÓN ACTUAL:** `@remotion/three` (única probada con render real)
**ESTADO:** INTEGRADO (R6-10) para `@remotion/three`; `skia`/`rive` sin evaluar en profundidad — BLOQUEADO/NO CONFIRMADO si aportarían algo que `three` no dé
**EVIDENCIA:** render real de punta a punta con audio, iteración de ajuste de escala documentada
**COSTO:** $0
**COMPATIBILIDAD:** confirmada
**RIESGO:** ninguno para `three`; `skia`/`rive` sin evaluar, no se asume nada de ellos

### CAPACIDAD: Kinetic Typography / énfasis de texto
**HERRAMIENTAS:** `@remotion/rough-notation` (oficial)
**NUESTRA IMPLEMENTACIÓN:** primitiva `<Enfasis>` conectada opcionalmente a `Contador`
**MEJOR OPCIÓN ACTUAL:** `@remotion/rough-notation`
**ESTADO:** INTEGRADO (R6-11)
**EVIDENCIA:** círculo dibujado a mano confirmado con 2 renders reales (ajuste de espaciado documentado)
**COSTO:** $0
**COMPATIBILIDAD:** confirmada
**RIESGO:** ninguno — opt-in, cero cambio para videos que no lo usan

### CAPACIDAD: Subtítulos con timing palabra-por-palabra
**HERRAMIENTAS:** `@remotion/install-whisper-cpp` + `@remotion/captions` (oficiales) · prototipo propio con `faster-whisper` (Python)
**NUESTRA IMPLEMENTACIÓN:** `TikTokCaptions.tsx` (renderiza `Caption[]`, confirmado real) — sin transcripción real todavía
**MEJOR OPCIÓN ACTUAL:** el camino whisper.cpp (oficial, mejor integración) sobre el prototipo casero
**ESTADO:** PROBAR — BLOQUEADO/NO CONFIRMADO la transcripción real (el binario compila, el modelo no se puede descargar: huggingface.co y su mirror están denegados por política de red de este sandbox)
**EVIDENCIA:** `whisper-cli --help` corre real; `TikTokCaptions.tsx` renderizado real con fixture sintética (`fabrica/salidas/captions_001/`)
**COSTO:** $0 (whisper.cpp es MIT, corre 100% local)
**COMPATIBILIDAD:** confirmada para el build; no confirmada la descarga del modelo en este entorno
**RIESGO:** ninguno de costo — el bloqueo es de red del sandbox, candidato a resolverse en GitHub Actions

### CAPACIDAD: Visualización de datos / gráficos / charts
**HERRAMIENTAS:** `@remotion/shapes` + `@remotion/paths` (oficiales, MIT) · `chuk-motion` (MCP de terceros, 6 tipos de chart) · Grafico.tsx (propio, solo barras)
**NUESTRA IMPLEMENTACIÓN:** `Grafico.tsx` (barras) + `GraficoTorta.tsx` NUEVO (torta/donut, R7-18)
**MEJOR OPCIÓN ACTUAL:** `@remotion/shapes`/`paths` integrado directo (control total, sin arquitectura paralela)
**ESTADO:** INTEGRADO (R7-18)
**EVIDENCIA:** render real, 2 bugs encontrados y corregidos probando (`fabrica/salidas/grafico_torta_001/`)
**COSTO:** $0
**COMPATIBILIDAD:** confirmada, versión alineada a `4.0.518` tras corregir un desalineamiento real
**RIESGO:** ninguno — `chuk-motion` tiene más tipos de chart ya armados pero es una arquitectura completa paralela, se usa solo como referencia de diseño, no como dependencia

### CAPACIDAD: Efectos cinematográficos temporales (motion blur)
**HERRAMIENTAS:** `@remotion/motion-blur` (oficial)
**NUESTRA IMPLEMENTACIÓN:** ninguna
**MEJOR OPCIÓN ACTUAL:** `@remotion/motion-blur`, pero no instalado todavía
**ESTADO:** PROBAR (bloqueado por versión, no por licencia/costo)
**EVIDENCIA:** se instaló para probar, se encontró que fuerza una copia anidada de `remotion@4.0.520` (desalineada con el `4.0.518` del proyecto) — se desinstaló antes de escribir código sobre una base inestable
**COSTO:** $0
**COMPATIBILIDAD:** NO CONFIRMADA hasta homologar la versión de Remotion de todo el proyecto
**RIESGO:** medio -- toca el motor temporal (compara frames), más riesgoso que shapes/paths si se fuerza sin alinear versiones

### CAPACIDAD: SFX (banco de efectos de sonido)
**HERRAMIENTAS:** `@remotion/sfx` (oficial)
**NUESTRA IMPLEMENTACIÓN:** biblioteca propia en `assets/sfx/` (impacto/campana/riser/tick/whoosh/sub)
**MEJOR OPCIÓN ACTUAL:** sin decidir — no comparado banco contra banco todavía
**ESTADO:** PROBAR
**EVIDENCIA:** ninguna todavía — solo investigado, no probado
**COSTO:** $0 (licencia por verificar, ver `fabrica/skills/registro.ts`)
**COMPATIBILIDAD:** no evaluada
**RIESGO:** bajo

### CAPACIDAD: Buscar documentación oficial de Remotion desde el agente
**HERRAMIENTAS:** `@remotion/mcp` (oficial) · `WebFetch` a remotion.dev (no funciona)
**NUESTRA IMPLEMENTACIÓN:** ninguna — se lee código fuente/README real vía `raw.githubusercontent.com` cuando hace falta
**MEJOR OPCIÓN ACTUAL:** ninguna funciona en ESTE sandbox
**ESTADO:** BLOQUEADO/NO CONFIRMADO -- el único endpoint de `@remotion/mcp` (`mcp.remotion.dev`) está denegado por la misma política de red que bloquea `remotion.dev`
**EVIDENCIA:** código fuente real inspeccionado (`npm pack`), confirmado que el paquete es real y MIT, confirmado con `curl` que su endpoint está bloqueado
**COSTO:** $0
**COMPATIBILIDAD:** N/A en este sandbox; podría funcionar en la computadora del operador o en GitHub Actions
**RIESGO:** ninguno de costo

### CAPACIDAD: Descubrir qué contenido funciona de verdad (YouTube/TikTok/Instagram)
**HERRAMIENTAS:** vidIQ (conector ya instalado en la org, desconectado) · Trends MCP (trendsmcp.ai) · video-url-analyzer-mcp (usa Gemini)
**NUESTRA IMPLEMENTACIÓN:** ninguna — hoy la fábrica no tiene ningún dato real de qué funciona, solo evidencia académica/de industria (Knowledge Engine)
**MEJOR OPCIÓN ACTUAL:** vidIQ, si el plan conectado no tiene costo (no confirmado)
**ESTADO:** ESPERANDO AUTORIZACIÓN DEL OPERADOR (los 3 requieren cuenta/costo no confirmado)
**EVIDENCIA:** conector real confirmado con `ListConnectors`; READMEs reales de los otros 2 leídos vía `raw.githubusercontent.com`
**COSTO:** no confirmado (vidIQ/Trends MCP), confirmado NO 100% gratis (Gemini)
**COMPATIBILIDAD:** N/A, son conectores, no código
**RIESGO:** ninguno técnico -- el riesgo es de cuenta/costo, por eso se registró y no se activó solo

### CAPACIDAD: Criterio experto de marketing/ventas (ofertas, precio, copy)
**HERRAMIENTAS:** `coreyhaines31/marketingskills` (50 skills, MIT)
**NUESTRA IMPLEMENTACIÓN:** `fabrica/ventas/` (arquitectura tipada, sin criterio de contenido)
**MEJOR OPCIÓN ACTUAL:** las 10 skills ya instaladas
**ESTADO:** INTEGRADO (R7-19)
**EVIDENCIA:** LICENSE real confirmado MIT, 10 skills copiadas a `.claude/skills/`, invocables ahora
**COSTO:** $0
**COMPATIBILIDAD:** mismo formato que las skills de Remotion ya usadas
**RIESGO:** ninguno de costo -- riesgo real es tratar sus recomendaciones como hechos probados en vez de buena práctica de industria (mismo criterio del Knowledge Engine, ya aplicado)

### CAPACIDAD: Templates/componentes Remotion de terceros
**HERRAMIENTAS:** `ali-abassi/remotion-templates` (1000 plantillas) · `remocn`, `remotion-animated`, `remotion-bits`, `remotion-kit` (comunidad)
**NUESTRA IMPLEMENTACIÓN:** catálogo propio de 28 componentes (`fabrica/componentes/registro.json`)
**MEJOR OPCIÓN ACTUAL:** el catálogo propio -- los de terceros se usan solo como inspiración de diseño
**ESTADO:** PROBAR (solo como referencia, licencia de `remotion-templates` sin confirmar todavía)
**EVIDENCIA:** ninguna de código copiado -- deliberado
**COSTO:** $0
**COMPATIBILIDAD:** N/A (no se integra código)
**RIESGO:** licencia de `remotion-templates` no confirmada -- no copiar nada de ahí hasta resolverlo (`fabrica/research/`, pendiente)

---

## Lectura rápida: dónde estamos parados

- **9 capacidades con solución YA integrada y probada con render real.**
- **1 capacidad totalmente bloqueada por red** (documentación oficial vía MCP) -- sin impacto real porque `raw.githubusercontent.com` cubre casi lo mismo.
- **1 capacidad bloqueada por modelo de IA no descargable** (subtítulos reales) -- el único bloqueo que sí duele, candidato a resolver en GitHub Actions.
- **1 capacidad completamente vacía todavía**: saber qué contenido funciona de verdad en las plataformas -- depende 100% de que el operador autorice una cuenta externa.
- **Ninguna capacidad depende de un servicio pago activo.**
