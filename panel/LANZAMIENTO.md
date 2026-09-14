# Torre de Control — bloqueantes estrictos antes de lanzar

Esta lista es la que el operador pidió guardar explícitamente el 2026-09-14
("guarda esto como estrictamente necesario antes de lanzar el panel así no
me olvido"). Mientras cualquiera de estos puntos siga sin marcar, el panel
sigue siendo una maqueta con datos de ejemplo — no reemplaza todavía a
preguntarme a mí el estado real.

## Configuración manual del operador (nadie más puede hacer esto)

- [ ] Crear un GitHub PAT fine-grained, alcance **solo este repositorio**,
      permiso **Contents: Read and write** — nada más.
- [ ] En Netlify → Site settings → Environment variables, cargar:
  - [ ] `GITHUB_TOKEN` = el PAT de arriba.
  - [ ] `MARCAR_SUBIDO_SECRET` = una palabra clave elegida por el operador.
- [ ] Guardar ese mismo valor de `MARCAR_SUBIDO_SECRET` también como
      GitHub Actions secret (lo va a necesitar el paso que genera la
      página con datos reales, ítem de abajo).

## Piezas de código que todavía faltan (en construcción)

- [ ] El paso que regenera `panel/torre-de-control.html` con datos reales
      desde `state/uploads.json` + `state/carruseles.json` + métricas —
      hoy la página es estática, con datos de ejemplo escritos a mano.
- [ ] Chequeo periódico que dispare el aviso del buzón en el momento
      preciso (comparando `scheduledFor` contra la hora actual), no antes
      ni después.
- [ ] Marcar como "vencido" (no silenciosamente perdido) un video del
      buzón cuyos 3 días de retención del artifact pasaron sin que se
      haya tocado "Ya lo subí".
- [ ] Fetch real de métricas: confirmar si el plan gratuito de Zernio
      incluye `obtenerAnalytics()` (nunca probado), conectar la API
      oficial de YouTube, adaptar el scraper de TikTok a videos propios.
- [ ] Conteo real de videos vs. carruseles subidos + comparación semana
      contra semana — depende de que los dos puntos de arriba ya estén
      guardando datos reales.

## Qué SÍ está construido y probado hoy

- Buzón de subida manual (artifact de GitHub Actions + aviso por ntfy
  con tema, horario y link) — probado real, funciona.
- Botón "Ya lo subí" → Netlify Function → guarda en `state/uploads.json`
  en `main` — código escrito y commiteado, pendiente solo de la
  configuración manual del operador de arriba para activarse de verdad.
- Diseño visual completo (paleta, calendario semanal con múltiples
  publicaciones por día, previsualizaciones) — aprobado por el operador.
