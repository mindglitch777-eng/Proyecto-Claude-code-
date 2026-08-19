# Log de decisiones

## 2026-08-19

**Contexto:** el operador subió el producto real ("El Corte", PWA en
`producto/el-corte-v7.html`) y aclaró que MARCA.md documenta el pivote de
estrategia ya decidido en otra conversación (nombre, paleta verde/negro,
serie fija "Qué hacer cuando...", 15 tópicos, estructura de 5 actos).
Esto reemplaza al "diario guiado" genérico de INVESTIGACION-NICHO.md como
producto concreto — es una herramienta interactiva real (localStorage,
sin backend), no un PDF.

**Decisión 1 — probar el pipeline antes de producir en serio.**
Corrí `animador_v9.py --demo` en este entorno (instalé Pillow y ffmpeg,
que no estaban presentes). Renderiza correctamente: 1080x1920, 30fps,
paleta de marca. Confirmado antes de generar nada del lote real.

**Decisión 2 — no fabricar demos de un producto que no existía en el repo.**
El pedido original era generar 5 videos "Formato 1" (demostración de
producto) de FOCO-VENTA.md, pero el producto no estaba en el repo y el
estado decía fase "research". Se paró y se preguntó en vez de inventar
una demo de un producto ficticio. El operador aportó el HTML real.

**Decisión 3 — grabar el producto de verdad en vez de simularlo.**
Se escribió `capturar_producto.py` (Playwright + Chromium headless, ya
preinstalados en este entorno) que abre `producto/el-corte-v7.html` y
ejecuta flujos reales (toques reales sobre botones reales, texto real
tipeado) para 5 de los 15 tópicos de MARCA.md, grabando video genuino.
El splash de marca se recorta automáticamente del clip. Capturas en
`capturas/`.

**Decisión 4 — 5 guiones siguiendo la estructura fija de MARCA.md.**
SITUACIÓN → ERROR → MECANISMO → SALIDA (captura real, partida en 2
cortes para cumplir la regla de los 5s de `validar_hook.py`) → LOOP.
Los 5 pasan `validar_hook.py` sin problemas bloqueantes. Viven en
`guiones/`. **No se renderizaron** — el operador pidió ver los guiones
antes de renderizar, y MARCA.md mismo lo exige explícitamente.

**Decisión 5 — bug real encontrado y corregido en `validar_hook.py`.**
No leía el campo `pregunta` (solo `texto`) al auditar el primer
segmento, generando falsos avisos de "hook sin número" en guiones que
usan `formato: "pregunta"` como hook. Corregido.

**Decisión 6 — biblioteca de SFX generada.**
`sfx.py todos` → `assets/sfx/` (whoosh, impacto, riser, campana, tick,
sub). `animador_v9.py` ya los usa automáticamente por transición/formato.

**Decisión 7 — GitHub Action para descarga de imágenes, sin activar sola.**
`descargar_imagenes.py` ya estaba completo pero nunca corrió (este
sandbox bloquea Wikimedia/Openverse). Se creó
`.github/workflows/descargar-imagenes.yml` como `workflow_dispatch`
manual (nunca por cron) — no descarga nada hasta que alguien lo dispare
a mano desde GitHub. Lote pendiente en `lote-imagenes-historicas.json`
(Séneca, Epicteto, Zenón, Sócrates, Aristóteles).

**Decisión 8 — sistema de vocabulario clínico (pedido del operador).**
"Rumiar" es jerga de paper de psicología, nadie la usa hablando y
además cruza la línea ética del proyecto (MARCA.md: no vendemos
diagnóstico). Investigación real (WebSearch) confirmó qué se usa en
la calle: "te comés la cabeza", "le das mil vueltas". Se agregaron
`VOCABULARIO_CLINICO` / `VOCABULARIO_FUERTE` a `hooks.py`, compartidas
con `validar_hook.py` (antes tenían lógica separada = riesgo de
desincronizarse). Nuevo patrón de hook `accion_real`: nombra la
situación en lenguaje de calle y la resuelve con una acción contable
en la app, nunca con un diagnóstico. Bug de paso: la comparación no
ignoraba tildes (`normalizar()` con NFKD agregado a ambos scripts).

**Decisión 9 — investigación de herramientas de edición IA (agente en
background).** Prioridad: todo tiene que correr por CLI/API, nada de
GUI manual (el operador solo tiene celular). Recomendación adoptada
parcialmente: usar el filtro nativo `xfade` de ffmpeg (58 transiciones,
sin GPU) en vez de gl-transitions (necesita compilar shaders + GPU,
y este entorno no tiene `/dev/dri`). Whisper+libass (subtítulos) y
Kokoro/Fish TTS quedan pendientes: dependen de si el operador quiere
narración por voz (la serie está diseñada mute-first, texto en
pantalla siempre — MARCA.md).

**Decisión 10 — compositor `armar_video.py` construido y probado.**
Une los actos animados con las capturas reales, transiciones via
`xfade` (mapeadas desde el vocabulario de transiciones ya existente
en `animador_v9.py`: punch→zoomin, whip→hlwind, etc.), marco de
teléfono con esquinas redondeadas + sombra + borde verde de marca
(PIL), caption quemado con ffmpeg drawtext. Bug real encontrado y
corregido en `animador_v9.py` (no en el compositor): cuando el audio
de un clip es solo SFX puntuales sin música/voz, `amix duration=longest`
termina cuando termina el ÚLTIMO sfx, no cuando termina el video
declarado -- el `-shortest` del ensamblado final recortaba el video en
silencio (se perdían ~2.4s sin ningún error visible). Se agregó `apad`
al filtro de mezcla. Esto afecta a cualquier guion futuro con SFX pero
sin música/voz, no solo a estos 5.

**Decisión 11 — correcciones de tildes/ñ en los 5 guiones.** Se habían
escrito sin acentos por error ("Manana" en vez de "Mañana", "dias" en
vez de "días", etc.) -- visible en los frames renderizados. Corregido
en los 5 archivos de `guiones/`.

**Estado actual: los 5 videos completos están renderizados** en
`videos/` (hook + mecanismo + producto real enmarcado + loop, con
transiciones xfade y audio sincronizado) y fueron enviados al operador
para revisión. Pendiente su aprobación final antes de publicar nada.

**Pendiente / próxima sesión:**
- Feedback del operador sobre los 5 videos finales.
- Decidir si la serie suma narración por voz (Kokoro/Fish TTS +
  Whisper para subtítulos sincronizados) o se mantiene mute-first.
- Correr manualmente el workflow de descarga de imágenes cuando el
  operador lo apruebe.
- Nada de esto se publicó en ninguna plataforma -- sigue pendiente la
  cuenta/verificación de identidad que hace el operador (CLAUDE.md).
