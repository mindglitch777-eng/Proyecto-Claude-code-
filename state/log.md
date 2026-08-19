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

**Pendiente / próxima sesión:**
- Aprobación del operador sobre los 5 guiones (ver mensaje de chat).
- Si aprueba: construir el compositor que arma el video final (acts
  animados de `animador_v9.py` + clips reales con marco de teléfono +
  caption quemado, unidos por ffmpeg) y renderizar recién ahí.
- Investigar herramientas de edición IA adicionales (pedido explícito
  del operador, después del prototipo de captura).
- Correr manualmente el workflow de descarga de imágenes cuando el
  operador lo apruebe.
