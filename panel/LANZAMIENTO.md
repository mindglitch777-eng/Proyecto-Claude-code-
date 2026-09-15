# Buzón / Torre de Control — estado de lanzamiento

Alcance definido por el operador 2026-09-14: el panel es SOLO la cola de contenido
para bajar y subir a mano vía TikTok Studio / YouTube Studio (link de descarga,
descripción, hashtags, música) -- nada de calendario ni métricas acá, esos quedan
como módulos aparte.

## Arquitectura (reescrita 2026-09-15 — GitHub Pages, no Netlify)

Primer intento (2026-09-14): el panel vivía en el mismo sitio de Netlify que El
Corte, con reglas de redirect (`/panel`, `/api/marcar-subido`) y una Netlify
Function con un secreto compartido para el botón "Ya lo subí". Un desajuste de
sincronización entre la rama de trabajo y `main` (la que sirve Netlify) hizo que el
operador entrara y viera El Corte en vez del panel -- confusión real, pareció que el
producto pago se había roto. **Decisión explícita del operador: separar del todo**
("no tiene nada que ver una cosa con la otra").

**Ahora:**
- El panel se publica en **GitHub Pages** (`https://mindglitch777-eng.github.io/Proyecto-Claude-code-/`),
  un sitio propio, sin ninguna relación con Netlify/El Corte.
  `.github/workflows/publicar-panel-pages.yml` lo redespliega solo cada vez que
  `panel/torre-de-control.html` cambia en `main`.
- El botón "Ya lo subí" ya NO pega a ninguna función con secreto -- es un link que
  abre un **Issue de GitHub prellenado** (`Ya subido: <id>`). El operador ya está
  logueado en GitHub (lo usa para todo lo demás), así que no hace falta ninguna
  contraseña nueva. `.github/workflows/marcar-subido-por-issue.yml` procesa el
  issue, marca la entrada real como subida, regenera el panel, lo empuja a `main`
  (lo que dispara el redespliegue de Pages) y cierra el issue solo.
- Como el repo es público desde 2026-09-15, ese workflow solo procesa el issue si
  lo abrió el propio operador (chequeo por usuario de GitHub) -- nadie más puede
  marcar nada como subido.

## Qué SÍ está construido y funcionando

- Entrega del contenido: `subir_video.ts`/`subir_carrusel.ts` arman el paquete
  completo (archivo + tema + horario sugerido + descripción + hashtags + música) y lo
  mandan por ntfy.sh, con el archivo como artifact de GitHub Actions.
- Generador real del panel (`fabrica/subida/generar_panel.ts`): lee
  `state/uploads.json` + `state/carruseles.json` y arma `panel/torre-de-control.html`
  con lo que está `pendiente`/`vencido` de verdad.
- Sincronización a `main`: los 4 workflows que tocan el panel/estado
  (`subir-video.yml`, `subir-carrusel.yml`, `chequear-buzon.yml`,
  `marcar-subido-por-issue.yml`) empujan panel + estado a `main` en cada corrida
  (con reintento anti-carrera-de-git), que a su vez dispara `publicar-panel-pages.yml`.
- Botón "Ya lo subí" → abre Issue → `marcar-subido-por-issue.yml` lo procesa →
  marca subido, regenera panel, cierra el issue. Cero configuración manual
  pendiente del operador.
- Limpieza de vencidos: `chequear-buzon.yml` (diario) marca `vencido` un contenido
  avisado hace más de 3 días que nunca se confirmó subido.

## Pendiente real

- Nada bloqueante. El primer deploy real de GitHub Pages puede tardar uno o dos
  minutos la primera vez que corre `publicar-panel-pages.yml` -- después queda
  rápido.
