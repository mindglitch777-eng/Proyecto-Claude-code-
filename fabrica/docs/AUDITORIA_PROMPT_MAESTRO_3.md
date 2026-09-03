# Auditoría — "Prompt Maestro 3" (capa de inteligencia + MCP + skills)

Igual que `AUDITORIA_PROMPT_MAESTRO_2.md` (Ronda 6) y
`AUDITORIA_SISTEMA_OPERATIVO.md` (Ronda 7), este documento mapea el
pedido nuevo contra el estado REAL antes de construir nada — evita
reconstruir con otro nombre lo que ya existe (regla dura de todo el
proyecto, secciones 22-23 del propio prompt: "no destruir", "no
sobreingeniería").

## Hallazgo principal: la mayoría de la estructura pedida YA EXISTE

El prompt pide crear `fabrica/inteligencia/` con subcarpetas
`fuentes/patrones/hooks/estructuras/edicion/carruseles/skills/mcp/
herramientas/estudios/hipotesis/decisiones/pendientes/`. Comparado
contra lo que ya se construyó en Ronda 7 (ver `MEJORAS_RONDA7.md`),
**11 de esas 13 carpetas ya existen con otro nombre y el mismo
propósito**:

| Carpeta pedida | Ya existe como | Decisión |
|---|---|---|
| `patrones/`, `estudios/` | `fabrica/conocimiento/` (Knowledge Engine v2, 27 categorías, niveles de evidencia) | Extender, no duplicar |
| `hooks/` | `fabrica/hooks/` (Viral/Retention Engine, 18 patrones/14 categorías) | Extender, no duplicar |
| `estructuras/` | `fabrica/conocimiento/` categoría `estructuras` + catálogo de patrones `storytelling`/`cierre` en `fabrica/hooks/` | Extender, no duplicar |
| `edicion/` | `fabrica/directores/edicion/tecnicas.ts` (Advanced Editing Engine) | Extender, no duplicar |
| `carruseles/` | `fabrica/carrusel/` (Carousel Engine + generador real, R7-14) | Ya cubierto |
| `skills/` | `fabrica/skills/` (Skill Intelligence System) | Extender, no duplicar |
| `herramientas/` | `fabrica/skills/` (mismo propósito) | Ya cubierto |
| `hipotesis/` | `fabrica/memoria/` (`EntradaLaboratorio`, Hipótesis→Variables→Resultado) + `nivel='hipotesis'` en Knowledge Engine | Ya cubierto |
| `decisiones/` | `fabrica/decisions/` + `fabrica/decision_engine/` (Decision Engine, R7-12) | Ya cubierto |
| `fuentes/` | `fabrica/research/` (Research System, registra fuentes intentadas/bloqueadas) | Ya cubierto |
| `pendientes/` | `fabrica/PENDIENTES.md` (técnico) + `fabrica/PENDIENTES_OPERADOR.md` (solo lo que necesita al humano) | Ya cubierto |

**Lo único genuinamente nuevo de esas 13 carpetas es `mcp/`** — no
existía ningún registro de conectores MCP hasta esta ronda. Se creó
`fabrica/mcp/` (nuevo, sin equivalente previo).

**Decisión (ver `fabrica/decisions/DECISIONES.md`):** NO se crea
`fabrica/inteligencia/` como árbol paralelo. Construir una segunda
jerarquía que duplica 11 de 13 carpetas ya existentes violaría
directamente la regla de "no sistemas paralelos" que el propio
proyecto viene aplicando desde Ronda 4 (ver `DECISIONES.md`, "El
Crítico Audiovisual unifica presentación, no duplica análisis"). En
cambio, cada sección del prompt se resuelve EXTENDIENDO el módulo
existente que ya cubre ese propósito.

## Mapeo sección por sección (numeración del prompt)

| # | Pedido | Estado real |
|---|---|---|
| 3 | Motor de análisis de contenido con niveles hecho/patrón/inferencia/hipótesis/recomendación/resultado real | Ya existe (Knowledge Engine v2, `NivelConocimiento`) -- el vocabulario del prompt es sinónimo del ya implementado |
| 4 | Investigar patrones ganadores de contenido real (views/engagement) | **BLOQUEADO en este sandbox** -- no hay acceso directo a scrapear TikTok/YouTube/Instagram. Hallazgo real: existe un conector MCP **vidIQ** instalado a nivel de organización (herramientas reales: outliers, trending videos, stats de canal) pero DESCONECTADO en este chat -- requiere que el operador lo habilite y confirme si su plan tiene costo. Registrado en `fabrica/mcp/` y en `PENDIENTES_OPERADOR.md` |
| 5-6 | Biblioteca de hooks/estructuras | Ya existe y ampliada (`fabrica/hooks/`, 18 patrones). Los mecanismos que pide el prompt (autoridad, demostración, amenaza, pérdida, desafío, misterio, secreto, error, oportunidad, transformación) ya están cubiertos por las 14 categorías existentes (`contradiccion`≈error/amenaza, `revelacion`≈secreto/descubrimiento, `escalada`≈desafío, `comparacion`≈transformación, etc.) -- no se crea una segunda taxonomía paralela |
| 7-8 | Motor de edición inteligente + referencias reales | Ya existe (`EstrategiaEdicion`, Advanced Editing Engine, R7-6/R7-15). Novedad real esta ronda: se inspeccionaron los 3 Agent Skills oficiales de Remotion ya disponibles en este entorno (`remotion-markup`, `remotion-render`, `remotion-captions`) -- confirmado que `Interactive`, `CanvasImage`, `AnimatedImage` existen en la versión instalada (`remotion@4.0.518`). Registrado en `fabrica/skills/registro.ts` |
| 9 | Investigar skills | Ya existe (`fabrica/skills/`) -- ampliado con los 3 skills del entorno |
| 10 | Capa MCP | **NUEVA** -- `fabrica/mcp/` creado esta ronda, con hallazgos reales (ver más abajo) |
| 12-13 | Sistema de conocimiento + niveles de confianza | Ya existe (Knowledge Engine v2 completo, R7-2) |
| 14 | Evidencia científica separada de patrón/resultado | Ya existe (`NivelConocimiento`, `subtipoEvidencia`) |
| 15 | Carruseles con pipeline completo | Ya existe (`generarCarrusel()`, R7-14) |
| 16 | Sistema de ventas | Ya existe (`fabrica/ventas/`, R7-8) -- datos reales vacíos hasta respuesta del operador (`PENDIENTES.md` ítem 15) |
| 17 | Motor de decisión sin "score mágico" | Ya existe (`fabrica/decision_engine/`, R7-12) -- ya prohíbe explícitamente un score de probabilidad de viralidad |
| 18 | Sistema de experimentos | Ya existe (`fabrica/memoria/`, Hipótesis→Variables→Resultado desde Ronda 5) |
| 19 | Memoria | Ya existe (`fabrica/memoria/`, anti-repetición por componente/patrón/golpe/hook) |
| 27-28 | `OPERADOR_PENDIENTES.md` + `ESTADO.md` | `PENDIENTES_OPERADOR.md` ya cumple la función de "solo lo que necesita al operador" -- se sigue usando ESE archivo (no se crea un duplicado con otro nombre). `fabrica/ESTADO.md` es genuinamente nuevo: un estado vivo siempre actualizado, distinto de `ESTADO_ACTUAL.md` (que es un informe histórico congelado de Ronda 4, marcado como tal) |

## Qué es genuinamente nuevo esta ronda

1. **`fabrica/mcp/`** -- primer registro formal de conectores MCP.
2. **Hallazgo del conector vidIQ** -- instalado pero desconectado,
   respuesta real a la sección 4 del prompt (investigación de
   patrones ganadores), pendiente de decisión del operador.
3. **Confirmación de los 3 Remotion Agent Skills del entorno** como
   fuente de buenas prácticas de edición real (secciones 7-9).
4. **`fabrica/ESTADO.md`** -- estado vivo del proyecto, actualizado
   por bloque de trabajo (sección 28 del prompt).

## Qué NO se hizo (y por qué)

- No se creó `fabrica/inteligencia/` (ver arriba).
- No se conectó vidIQ ni ningún otro MCP -- requiere autorización del
  operador (regla de $0 + CLAUDE.md sección "antes de cualquier
  integración con API externa, confirmar con el operador").
- No se scrapeó TikTok/YouTube/Instagram directamente -- bloqueado
  por política de red de este sandbox (mismo bloqueo ya documentado
  en Ronda 7 para TikTok Creator Academy).
- No se migró el puente de render a `@remotion/media` (paquete más
  nuevo que recomienda la skill `remotion-markup` para `<Video>`/
  `<Audio>`) -- cambio de mayor riesgo sobre un puente de render que
  ya funciona bien; queda registrado como "probar" en
  `fabrica/skills/registro.ts`, no se ejecuta sin necesidad concreta.
