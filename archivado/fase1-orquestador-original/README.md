# Archivado: orquestador original de la Fase 1 ("El Corte")

Movido acá el 2026-09-04, como parte del punto 4 de la orden de
auditoría del operador ("archivar sin miedo lo obsoleto"). Nada de
esto se borró -- si hace falta, `git mv` de vuelta a su lugar original.

## Qué es esto y por qué está acá

`CLAUDE.md` (la constitución del proyecto) ya decía, ANTES de esta
ronda, que este sistema quedó congelado:

> `state/state.json` + `orchestrator.py` fueron el sistema de la Fase 1
> original (El Corte) y quedaron congelados sin uso real desde que el
> trabajo se mudó a `fabrica/`.

Esta ronda confirmó dos cosas que faltaban documentar:

1. **`state/fabrica.json`** (a pesar del nombre, no tiene nada que ver
   con la carpeta `fabrica/` real -- es el tracking de video de "El
   Corte", Fase 1) no tenía NINGUNA referencia desde ningún script real
   del repo. Muerto de la misma forma que `state.json`.
2. **`.github/workflows/orquestador-diario.yml`** seguía ACTIVO -- un
   cron diario (9am) que instalaba Claude Code CLI y corría una sesión
   headless completa contra `orchestrator.py status`, todos los días,
   gastando uso real de Claude Code del operador contra un sistema que
   la propia constitución del proyecto ya declaraba sin uso real. La
   última corrida real (2026-09-04, antes de este archivado) **falló**
   (`conclusion: failure`). Se renombró a `.disabled` y se sacó de
   `.github/workflows/` -- GitHub deja de programarlo apenas el archivo
   no está en esa carpeta. Si en algún momento se quiere reactivar algo
   parecido mirando `fabrica/` en vez de "El Corte", hay que reescribirlo
   apuntando a `fabrica/ESTADO.md`, no restaurar este archivo tal cual.

## Qué NO se tocó

`producto/` (el código real de "El Corte") y todo lo relacionado a su
venta en Hotmart -- `CLAUDE.md` es explícito: "no se vuelve a tocar ni
a mencionar como próximo paso... No borrar su código sin que el
operador lo pida aparte". Este archivado es solo del ORQUESTADOR
(la maquinaria de tareas/estado), no del producto en sí.
