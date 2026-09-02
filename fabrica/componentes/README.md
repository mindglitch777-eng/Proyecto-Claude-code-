# Registro de componentes

`schema.json` define el contrato de una entrada. `registro.json` es el
catálogo real. `tipos.ts` es el mismo contrato en TypeScript.
`validar_registro.ts` valida forma + que cada componente exista de
verdad en `remotion-spike/src/` (no solo que el JSON tenga buena
pinta).

Correr: `npx tsx validar_registro.ts` (desde `fabrica/`).

## Estado real (2026-09-02)

17 componentes catalogados: **13 validados** (se leyó el código fuente
y se documentó su comportamiento real) + **4 sin_validar** (`Recibo`,
`Duelo`, `Ranking`, `Crecimiento` de `escenas/plata.tsx` — catalogados
por nombre solamente).

## Lo que falta catalogar (Fase 5, sin empezar)

Estos archivos existen y compilan, pero **no se leyeron ni se
catalogaron todavía** — no están en `registro.json` en absoluto (ni
siquiera como `sin_validar`), así que el Director Visual no los ve:

- `agresivo/Cuenta.tsx`, `Diez.tsx`, `Explicador.tsx`,
  `PiezaAgresiva.tsx`, `Punch.tsx`, `Rafaga.tsx`, `Remate.tsx`,
  `Veredicto.tsx`
- `escenas/Escena.tsx`, `FormatoCompleto.tsx`, `Grafico.tsx`,
  `Hook.tsx`, `Muestrario.tsx` a `Muestrario8.tsx`, `Silueta.tsx`,
  `dinero-fx.tsx`, `formatosNuevos.tsx` a `formatosNuevos6.tsx`,
  `golpes.tsx`, `metraje.tsx`, `pantallas.tsx`

No se catalogaron por nombre nomás (como sí se hizo con
Recibo/Duelo/Ranking/Crecimiento) porque muchos de estos no son
"componentes" en el sentido de la sección 4 del prompt maestro —
`golpes.tsx` es infraestructura de transición, `metraje.tsx` es el
fondo con foto/video, `Escena.tsx`/`FormatoCompleto.tsx` parecen ser
plantillas de video completo, no piezas combinables. Inventarles
metadata sin leer el código sería exactamente lo que la sección 22
(capacidad de crítica) pide evitar: afirmar algo que no se confirmó.

**Siguiente paso real de Fase 5:** leer cada uno, decidir si es
COMPONENTE (entra al registro), infraestructura compartida (se
documenta aparte, no en el registro), o una plantilla completa de
video (no es un componente, es más bien un "formato" en el sentido
viejo — ver sección 4 del prompt maestro sobre por qué eso no es lo
que buscamos).
