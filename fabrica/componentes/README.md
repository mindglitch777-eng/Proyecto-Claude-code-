# Registro de componentes

`schema.json` define el contrato de una entrada. `registro.json` es el
catálogo real. `tipos.ts` es el mismo contrato en TypeScript.
`validar_registro.ts` valida forma + que cada componente exista de
verdad en `remotion-spike/src/` (no solo que el JSON tenga buena
pinta).

Correr: `npx tsx validar_registro.ts` (desde `fabrica/`).

## Estado real (2026-09-02, actualizado)

**26 componentes catalogados, los 26 `validado`** (se leyó el código
fuente real de cada uno). Categorías cubiertas: texto, cifra,
comparación, timeline, diagrama, lista, logos, encuesta, cuenta
regresiva, montaje, "otro" (mockups de UI: chat, buscador,
notificaciones).

Componentes con soporte MULTI-AUDIO confirmado (pueden recibir varios
clips de audio superpuestos dentro de una misma instancia — ver
`fabrica/composicion/armar.ts`): `cronologia`, `lista-tachada`,
`balanza`, `antes-despues`, `contador`, `cifra-se-cae`, `diagrama`,
`logos-herramientas`, `punch`. El resto funciona con 0 o 1 clip por
ahora (nunca se probaron con más de uno, no porque no puedan).

## Lo que se agregó en esta pasada

- `Recibo`, `Duelo`, `Ranking`, `Crecimiento` (`escenas/plata.tsx`):
  pasaron de `sin_validar` (catalogados por nombre nomás) a
  `validado`, leyendo el código real y documentando props exactas.
- `Punch`, `Rafaga`, `Explicador`, `Remate` (`agresivo/`): nuevos.
  `Punch` es especialmente valioso para multi-audio: su prop `entra:
  number[]` es exactamente el offset acumulado que ya calcula
  `armarComposicion`.
- `Chat`, `Buscador`, `Notificaciones` (`escenas/pantallas.tsx`):
  nuevos, mockups de UI (mensajes, búsqueda, notificaciones) — aportan
  variedad real que no existía antes en el registro.
- `Grafico`, `Silueta` (`escenas/Grafico.tsx`, `escenas/Silueta.tsx`):
  nuevos. Ojo: su prop real es `idea: Extract<Idea, {tipo: '...'}>`
  importado de `../guion.ts` (el motor VIEJO de "El Corte", no la
  fábrica) — usarlos implica armar un objeto con esa forma exacta, no
  es un componente 100% desacoplado. Documentado en sus `notas`.

## Lo que se investigó y se dejó AFUERA del registro (con motivo)

- **`agresivo/Veredicto.tsx` y `agresivo/Cuenta.tsx`**: importan
  constantes hardcodeadas (`COSTO_HORA`, `HORAS_TRABAJO`, `COBRAS`,
  `CUENTA`, `CUENTA_TOTAL`, `HORAS_MES`) directo de
  `../guion-agresivo.ts` — NO son componentes reutilizables, están
  atados a los números de un video puntual ya hecho. `Explicador` y
  `Remate` son literalmente las "versiones genéricas" de estos dos
  (dice el propio comentario en el código) y sí quedaron catalogadas.
- **`escenas/Muestrario.tsx` a `Muestrario8.tsx`, `formatosNuevos.tsx`
  a `formatosNuevos6.tsx`, `FormatoCompleto.tsx`, `Escena.tsx`**: son
  reels/demos que ENCADENAN componentes ya catalogados (Diagrama,
  AntesDespues, Balanza, Cronologia, etc.) o videos completos
  (`FormatoA`/`FormatoB`) — exactamente lo que la sección 4 del prompt
  maestro pide no confundir con un componente ("formato" viejo, no
  pieza combinable). Confirmado leyendo `Muestrario.tsx`.
- **`escenas/golpes.tsx`, `escenas/metraje.tsx`,
  `escenas/dinero-fx.tsx`**: infraestructura compartida (transiciones,
  fondo con foto/video, efectos de partículas superpuestos) que otros
  componentes ya usan internamente — no son escenas/piezas que el
  Director Visual elija de forma independiente.
- **`escenas/Hook.tsx`**: usa `idea: Extract<Idea,{tipo:'hook'}>` del
  motor viejo igual que Grafico/Silueta, pero con una forma de datos
  más compleja (`lineas: {t,estilo,alinea}[]`) atada a decisiones de
  tipografía del motor viejo (serif/grotesca, izq/der) — se evaluó y
  se decidió no catalogar todavía por relación esfuerzo/valor: ya
  existen `punch` y `tres-verdades` cubriendo la misma categoría
  (texto de impacto) sin ese acople. Si hace falta esa variante
  específica, es la próxima candidata natural.

Con esto, prácticamente todo archivo `.tsx` de `escenas/`, `dibujo/` y
`agresivo/` fue inspeccionado al menos una vez en esta sesión — lo que
queda afuera del registro está afuera por una razón documentada, no
por falta de tiempo.
