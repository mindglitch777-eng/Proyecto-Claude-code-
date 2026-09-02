# Auditoría: "Sistema Operativo de Contenido y Ventas" vs. estado real (Ronda 7)

Mapeo directo antes de construir nada nuevo — qué de la nueva
directiva ya existe (con qué nombre real en el código), qué es
parcial, qué no existe todavía. Mismo método que
`AUDITORIA_PROMPT_MAESTRO_2.md` (Ronda 6), esta vez contra el pedido
de evolucionar hacia un ecosistema de contenido + marketing + producto,
no solo un motor de video.

## Lo que YA EXISTE (no se reconstruye)

| Pieza pedida | Nombre real en el código | Estado |
|---|---|---|
| Knowledge Engine | `fabrica/conocimiento/` (Ronda 6) | **Existe, básico.** 6 items, schema chico (`tema/afirmacion/nivel/confirmado/fuente/aplicacionFabrica/tags`) — le faltan varios campos pedidos ahora (contexto, nivel de confianza granular, ejemplos, limitaciones, qué NO demuestra) y categorías (hoy `tema` es texto libre, no la taxonomía de 27 categorías pedida). **Se amplía, no se reemplaza — R7-2.** |
| Research System | `fabrica/research/retencion.md` (prosa) + notas puntuales en otros docs | **Existe informal.** El patrón "esto no lo pudimos confirmar" ya se usa en prosa (ver sección 4 de `retencion.md`) pero no como un tipo de dato real, reusable y listable. **Se formaliza — R7-3.** |
| Skill Intelligence | `fabrica/skills/INVESTIGACION_HERRAMIENTAS.md` | **Existe, en prosa.** 13 herramientas investigadas con el formato pedido (fuente/qué hace/licencia/riesgo/recomendación) pero en Markdown, no tipado ni consultable por código. **Se tipa — R7-4.** |
| Hook Engine / Viral-Retention | `fabrica/hooks/` (Ronda 6) | **Existe, chico.** 4 patrones de HOOK (apertura) nada más — la directiva pide una biblioteca mucho más amplia (contradicción, sorpresa, escalada, revelación, comparación, tensión, recompensa, cambio de perspectiva, cierre, CTA) y que el Director de Retención la CONSULTE, cosa que hoy no pasa (el catálogo existe pero nadie lo usa en la decisión real). **Se amplía y se conecta — R7-5.** |
| Editing Engine | `fabrica/directores/edicion/` (Ronda 4) | **Existe, decide bien, pero sin catálogo citable.** Las decisiones de intención/energía/estilos ya están, lo que falta es un catálogo EXPLÍCITO de técnicas con su respaldo (buena práctica/evidencia) — hoy el conocimiento de "por qué esta técnica" vive implícito en el código, no como dato consultable. **R7-6.** |
| Experiment Engine | `fabrica/memoria/tipos.ts` `ExperimentoAB` (Ronda 5) | **Existe, cerca del pedido nuevo.** `{variableModificada, variablesControladas, variantes}` — falta el campo explícito de "conclusión" separado del resultado crudo. **Se revisa — R7-7.** |
| Quality Intelligence | `checks_duros.py` + `critica_editorial.py`/`critico_audiovisual.py` | **Existe, sin cambios necesarios.** |
| Memoria permanente | `fabrica/docs/`, `fabrica/decisions/`, `PENDIENTES.md` | **Existe, se sigue usando igual.** |

## Lo que NO EXISTE todavía (dominio nuevo: negocio, no solo video)

- **Sales Engine** (audiencia→problema→oportunidad→producto→oferta→...→nuevo
  producto) — no existe ninguna estructura de datos para esto. Es
  dominio de NEGOCIO, no de producción audiovisual — hasta ahora la
  fábrica solo producía video, nunca modeló el embudo comercial.
  **R7-8.**
- **Product Ecosystem** (una investigación → video + carrusel + guía +
  lead magnet + ...) — no existe ningún mecanismo de reutilizar un
  ítem de conocimiento en más de un formato. **R7-9.**
- **Carousel Engine** — no existe NINGÚN renderer de carrusel; la
  fábrica solo sabe producir video (Remotion). Carrusel es formato de
  imágenes estáticas (típicamente 1-10 slides) — requiere una forma de
  render distinta (frames fijos, no timeline). **R7-10.**
- **Data Engine formal** — hoy `fabrica/memoria/laboratorio.json`
  registra hipótesis/experimentos de VIDEO, pero no hay ningún
  esquema para datos de PRODUCTO/VENTA (oferta, precio, tráfico,
  conversión, reembolsos). **R7-11.**
- **Decision Engine** — no existe una plantilla formal de "Opción
  A/B/C con ventajas/desventajas/recomendación"; se hizo ad-hoc en
  rondas anteriores cuando hacía falta, nunca como documento
  reusable. **R7-12.**

## Principio que se respeta desde el día 1 de esta ronda

Regla de $0 (sección 12 de la directiva): nada de lo nuevo requiere
gastar. Sales/Product/Carousel/Data Engine son ESTRUCTURA (tipos,
esquemas, catálogos) lista para recibir datos reales — no se inventa
ningún producto, precio, oferta o audiencia ficticia. Eso requiere
decisiones e información que solo puede aportar el operador (quién es
la audiencia real, qué problema resuelve, qué precio probar) — hasta
que eso exista, la arquitectura queda lista pero vacía de contenido de
negocio real, documentado explícitamente como tal en cada módulo.
