# Mapa de madurez del sistema (Fase 0 del prompt "Ronda de evolución real")

Para cada sistema importante de la fábrica, evaluado leyendo el código
real (no por el nombre del archivo): A) existe B) funciona C) está
integrado con otros sistemas D) se usa automáticamente (sin que un
humano lo dispare a mano) E) aprende de datos reales F) tiene tests
G) tiene datos reales cargados H) tiene fallback ante fallo I) está
bloqueado por una dependencia externa.

| Sistema | A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|---|
| **Director Visual** (`directores/visual.ts`) | Sí | Sí | Sí (usado por `composicion/armar.ts`) | Sí | No (score con pesos fijos, declarado como heurística) | Sí | Sí (28 componentes reales) | Sí (si nada cumple filtros duros, devuelve lista vacía en vez de fallar) | No |
| **Director de Audio** (`directores/audio.ts`) | Sí | Sí | Sí | Sí | No (tablas fijas por nivel) | Sí | Sí (9 tracks de música real, biblioteca CC0) | Sí (si todos los golpes "usados", repite antes que romper) | No |
| **Director de Edición** (`directores/edicion/`) | Sí | Sí | Sí (integra Retención vía `decidirPatronRetencion`) | Sí | No | Sí | Sí | Sí | No |
| **Director de Retención** (`directores/retencion/`) | Sí | Sí | Sí (lee `estrategiaEdicion` del árbol de composición) | Sí (se corre sobre cada árbol armado) | No -- es diagnóstico, no corrige solo (ver auditoría de techos) | Sí | Sí | Sí (escenas sin `estrategiaEdicion` quedan `sin_clasificar`, no rompe) | No |
| **Knowledge Engine** (`conocimiento/`) | Sí | Sí | Sí (consumido por `hooks/`, `directores/edicion/`, `carrusel/generar.ts`) | Parcial -- se consulta automáticamente (`porId`, `patronesCompatibles`), pero cargar un ítem nuevo es manual (edición de `base.ts`) | No -- es una base curada, no se actualiza sola con resultados | Sí | Sí (24 ítems reales, con niveles de evidencia correctos) | N/A (no aplica "fallback" a una base de conocimiento) | No |
| **Viral/Retention Engine (hooks)** (`hooks/`) | Sí | Sí | Sí (`patronesCompatibles()` alimenta al Director de Edición) | Sí | No | Sí | Sí (19 patrones catalogados) | Sí (si no hay patrón compatible, devuelve `undefined`, no rompe) | No |
| **Advanced Editing Engine** (`directores/edicion/tecnicas.ts`) | Sí | Sí | Parcial -- es un CATÁLOGO auditable de técnicas ya implementadas en otro lado, no decide nada por sí mismo | No (es de consulta, no se ejecuta solo) | No | Sí | Sí | N/A | No |
| **Research System** (`research/`) | Sí | Sí | Parcial -- `investigacion_necesaria.ts` es una lista curada a mano de qué falta investigar, no dispara investigación sola | No (se corre cuando un humano/Claude decide investigar algo) | No | Sí | Sí (7 líneas de investigación registradas, con estado real) | Sí (bloqueos se documentan como `BLOQUEADO-NO CONFIRMADO`, nunca inventa) | Sí (el cliente de YouTube Data API existe y funciona, pero bloqueado sin `YOUTUBE_API_KEY` del operador) |
| **Sales Engine** (`ventas/`) | Sí | Sí (funciones reales: `registrarVideo`, `retencionPromedioPorHook`, etc.) | Sí (tipado, listo para consumir) | No | No (no hay datos que aprender) | Sí | **No -- `REGISTROS_VIDEO`/`REGISTROS_PRODUCTO` vacíos a propósito** (hallazgo raíz de la auditoría de techos) | N/A | Sí (bloqueado por falta de ventas/publicaciones reales, no por código) |
| **Product Ecosystem** (`ecosistema_producto/`) | Sí | Sí | Sí (conecta Knowledge Engine con Carousel Engine, ver `DERIVACIONES`) | Parcial (una derivación real ya generada, `d-carrusel-brunson-value-ladder`, pero no corre sola) | No | Sí | Sí (1 derivación real con artefacto real) | N/A | No |
| **Carousel Engine** (`carrusel/`) | Sí | Sí | **Sí, de forma real y verificada**: `generar.ts` toma un ítem de `conocimiento/` + un patrón de `hooks/` y arma un carrusel real (sin inventar texto) -- prueba concreta de que el ciclo Knowledge→Contenido SÍ funciona hoy para este formato | No (se dispara a mano) | No | Sí | Sí (carrusel real de 7 slides renderizado, `salidas/carrusel_001/`) | N/A | No |
| **Data Engine** (`datos/`) | Sí | Sí (`videosConMetricasReales`, `retencionPromedioPorHook` son funciones reales) | Sí (tipado para consumir Sales Engine) | No | Sí, en el sentido de que ESTÁ DISEÑADO para aprender de datos reales -- pero no tiene ninguno todavía | Sí | **No -- arrays vacíos** (mismo hallazgo raíz que Sales Engine) | N/A | Sí (mismo bloqueo: sin publicaciones reales) |
| **Decision Engine** (`decision_engine/`) | Sí | Sí | Parcial (documenta decisiones, no las EJECUTA automáticamente) | No | No | Sí | Sí (2 decisiones reales completas, con opciones/ventajas/desventajas/recomendación) | Sí (`estado: 'abierta'` es un resultado válido explícito -- confirma que el sistema SÍ puede decir "no hay suficiente información/decisión pendiente") | No |
| **Skill Intelligence** (`skills/registro.ts`) | Sí | Sí | Parcial (registro consultable, pero instalar una skill sigue siendo una acción manual) | No | No | Sí | Sí (30 skills reales investigadas) | N/A | No |
| **MCP/Connectors** (`mcp/registro.ts`) | Sí | Sí | Parcial (registro consultable, conectar un MCP real sigue siendo manual/requiere al operador) | No | No | Sí | Sí (13 MCP reales investigados) | N/A | Sí (la mayoría de "usar"/"probar" reales están sin conectar en esta sesión concreta) |
| **QA duro** (`qa/checks_duros.py`) | Sí | Sí -- **usa ffprobe/ffmpeg real** (silencios, negros, volumen) sobre el archivo renderizado, no solo JSON | Sí (se corre sobre cada render) | Sí (parte del flujo de `test-todo`, pero no se dispara solo después de cada render real todavía) | No | Sí | Sí | Sí (exit code distingue problemas duros de alertas) | No |
| **QA de composición** (`qa/checks_composicion.py`) | Sí | Sí (valida assets/capacidad de texto/categoría repetida/golpe repetido/intensidad plana/cifra repetida) | Sí | Sí | No | Sí | Sí | Sí | No |
| **Crítico Audiovisual / Crítica Editorial** (`qa/critico_audiovisual.py`, `qa/critica_editorial.py`) | Sí | Sí | Sí | No (se corre a pedido, post-render) | No (usa reglas, no aprende de resultado real todavía) | Sí | Sí | Sí | No |
| **Laboratorio / Memoria** (`memoria/`, `laboratorio/ciclo_mejora.ts`) | Sí | Sí | Sí (tipado, `EntradaLaboratorio` real) | Parcial (el ciclo de mejora corre a pedido, no automático) | **No -- las 10 hipótesis reales están en `estado: "esperando_datos"`** (hallazgo raíz) | Sí | Sí (10 hipótesis reales, 0 con resultado real) | N/A | Sí (bloqueado por falta de publicaciones reales) |

## Conclusión del mapa de madurez

**Lo que ya es sólido:** cada sistema individual EXISTE, FUNCIONA, tiene
TESTS, y en su gran mayoría tiene datos reales de entrada (no
placeholders). El QA duro ya mide cosas reales del archivo renderizado
(no es cierto que "solo valide JSON" -- eso aplica a `checks_composicion.py`,
no a `checks_duros.py`). El Carousel Engine + Product Ecosystem ya
demuestran, con un artefacto real generado (`carrusel_001`), que el
ciclo Knowledge Engine → Contenido SÍ puede cerrarse de punta a punta
para al menos un formato.

**El patrón que se repite en casi todos los "no" de la columna D
(automático) y E (aprende):** el conocimiento/las decisiones no se
generan ni corrigen SOLAS -- necesitan que un humano (o una sesión de
Claude Code) dispare cada paso. Esto es coherente con la escala actual
del proyecto (sin publicaciones reales, automatizar el ciclo completo
sería automatizar sobre datos vacíos) pero es el techo real de "sistema
operativo" vs. "conjunto de módulos bien hechos".

**El bloqueo real que aparece en 4 sistemas distintos (Sales Engine,
Data Engine, Laboratorio, Research System)** es el mismo: no hay
publicaciones/ventas reales todavía. No es un problema de arquitectura
-- la arquitectura de los 4 está lista para recibir datos reales el día
que existan.
