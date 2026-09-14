# Buzón / Torre de Control — bloqueantes estrictos antes de lanzar

Alcance definido por el operador 2026-09-14: el panel es SOLO la cola de contenido
para bajar y subir a mano vía TikTok Studio / YouTube Studio (link de descarga,
descripción, hashtags, música) -- nada de calendario ni métricas acá, esos quedan
como módulos aparte.

## Configuración manual del operador (nadie más puede hacer esto)

- [ ] Crear un GitHub PAT fine-grained, alcance **solo este repositorio**,
      permiso **Contents: Read and write** — nada más.
- [ ] En Netlify → Site settings → Environment variables, cargar:
  - [ ] `GITHUB_TOKEN` = el PAT de arriba.
  - [ ] `MARCAR_SUBIDO_SECRET` = una palabra clave elegida por el operador.
- [ ] En GitHub → este repo → Settings → Secrets and variables → Actions → New
      repository secret: `MARCAR_SUBIDO_SECRET` con el **mismo valor exacto** que
      cargaste en Netlify. (Ya está cableado del lado del código --
      `generar_panel.ts` lo hornea solo en la página cada vez que se regenera, ver
      bloque de abajo. Solo falta que este secret exista.)

## Qué SÍ está construido hoy (código real, commiteado)

- Entrega del contenido: `subir_video.ts`/`subir_carrusel.ts` arman el paquete
  completo (archivo + tema + horario sugerido + descripción + hashtags + música) y lo
  mandan por ntfy.sh, con el archivo como artifact de GitHub Actions.
- Generador real del panel (`fabrica/subida/generar_panel.ts`): lee
  `state/uploads.json` + `state/carruseles.json` y arma `panel/torre-de-control.html`
  con lo que está `pendiente`/`vencido` de verdad -- ya no es una maqueta con datos de
  ejemplo. Se regenera solo en cada corrida de `subir-video.yml`/`subir-carrusel.yml`/
  `chequear-buzon.yml`.
- Botón "Ya lo subí" → Netlify Function → guarda en `state/uploads.json`/
  `state/carruseles.json` en `main` — código escrito y commiteado, pendiente solo de
  la configuración manual del operador de arriba para activarse de verdad.
- El secreto que el botón manda ya se hornea solo en cada página generada
  (`generar_panel.ts` lee `MARCAR_SUBIDO_SECRET` del entorno y reemplaza el
  placeholder) -- no hace falta editar el HTML a mano nunca más, solo cargar el
  secret una vez en GitHub Actions (arriba).
- Limpieza de vencidos: `chequear-buzon.yml` (diario) marca `vencido` un contenido
  avisado hace más de 3 días que nunca se confirmó subido (el artifact expira a los
  3 días).

## Pendiente real, no bloqueante para lanzar

- El commit del panel regenerado hoy va a la rama de trabajo, no a `main` -- Netlify
  sirve desde `main`, así que hasta que se mergee (o se extienda el paso de commit
  para pushear también a `main`, mismo patrón que ya usa `marcar-subido.js`), el panel
  "en vivo" en Netlify no refleja la última corrida. No bloquea desarrollo, sí bloquea
  que el operador lo use de verdad desde el link público.
