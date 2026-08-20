# Log de decisiones

## 2026-08-20

**Contexto:** el operador aprobó precio ($15, descarga única en
Gumroad — pendiente que él arme la cuenta), pidió que las imágenes
reales fueran obligatorias ("no importa el proceso"), pidió sincronizar
videos con voz que va a grabar en ElevenLabs + música de fondo, pidió
logo/bio de marca, y 9 hooks más agresivos para los tópicos de
MARCA.md que faltaban.

**Decisión 15 — voz externa (ElevenLabs), no generación local.**
`animador_v9.py::construir_linea_tiempo()` ahora acepta un campo
`voz_archivo` por segmento (audio ya grabado). Reusa el 100% de la
mezcla/ducking/música que ya existía para Piper — cero código nuevo
de audio, solo una fuente de duración distinta. Probado de punta a
punta con audio sintético (duración real del wav = duración del
segmento en el video final, exacto salvo redondeo de frame).
`sincronizar_voz.py` engancha los .mp3 que el operador exporte de
ElevenLabs (convención `<guion>-vozN.mp3`) a un guion.

**Decisión 16 — logo generado por código, no encargado a nadie.**
`marca/generar_logo.py`: un círculo (el bucle) cortado por una barra
verde (el corte) — la marca ES el concepto del producto. Sin
derechos de terceros, coherente con la paleta de `MARCA.md`.
`brand.md` completado (tono, público, 3 variantes de bio).
**Encontrado**: `producto/el-corte-v7.html` todavía usa su propia
paleta dorada/serif interna, distinta de la decidida para marketing.
No se tocó (cambiar el producto es una decisión más grande) pero
queda documentado.

**Decisión 17 — 9 guiones nuevos (topicos 3,7,8,10-15 de MARCA.md).**
Generados por `guiones/generar_lote2.py` (data + template, no a mano
uno por uno) para poder iterar rápido. Reusan las 5 capturas reales
ya grabadas, mapeadas al flujo de la app más cercano temáticamente
(no se grabó nada nuevo con Playwright). Cada uno trae un campo
`elevenlabs.lineas` con el guion de voz listo para pegar. Bug real
encontrado y corregido: el formato `division` no tiene campo `texto`
(usa izquierda/derecha), así que la narración de esos mecanismos
salía vacía — `narracion_de()` no lo contemplaba.

**Decisión 18 — imágenes: 8/9 buenas, una se abandona.**
Revisadas una por una (no se aceptó nada a ciegas). Encontrado y
corregido OTRO bug de infraestructura: si un ítem del lote fallaba,
el step de commit se saltaba entero y se perdían descargas buenas de
la misma corrida (`if: always()` agregado). "acelerado" falló 4
búsquedas distintas en Openverse (cupcake de Halloween, autos de
juguete, screenshot de blog de 2008, gente en un barco) — se
abandona esa vía para ese tópico puntual en vez de seguir gastando
corridas; queda pendiente resolverlo con Cloudflare AI o código
propio.

**Pendiente / próxima sesión:**
- Las imágenes descargadas todavía NO están conectadas a ningún
  guion/formato de video (se bajaron y revisaron, falta el paso de
  usarlas realmente en `animador_v9.py`). Es la Tarea 16 pendiente.
- El operador todavía no generó audio real en ElevenLabs -- cuando
  lo tenga, correr `sincronizar_voz.py` + `armar_video.py` por cada
  uno de los 9 guiones nuevos.
- Conseguir música de fondo libre de derechos (Pixabay/Uppbeat/Mixkit
  por `ASSETS.md`) -- no se resolvió esta sesión, sigue bloqueado por
  la misma restricción de red que las imágenes (necesitaría su propio
  workflow de descarga, o que el operador la suba manualmente).
- Cuenta de Gumroad + publicar a $15 sigue siendo gate del operador.

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

**Feedback del operador sobre el lote de 5**: correctos, pero pidió (1)
mas variedad de formatos, (2) tipografia mas moderna, (3) imagenes
representativas, (4) frases mas fuertes con algun tema de relaciones/
amor, (5) definir el "foco que genere dinero". Sobre (5) -- todavia no
hay backend/paywall en `producto/el-corte-v7.html` (es 100% gratis,
sin cuenta) -- se le dio la recomendacion de vender el HTML completo
como descarga unica en Gumroad (cero desarrollo nuevo, cumple el
objetivo original de `PROJECT_PLAN.md`) pero el operador no lo cerro
todavia; sigue abierto.

**Decisión 12 — tipografia propia (Space Grotesk, OFL).** DejaVu Sans
Bold se leia generica. Se descargo Space Grotesk (variable font) desde
el repo github.com/google/fonts (raw.githubusercontent.com es de los
pocos hosts con red abierta en este sandbox), instanciada a Bold/
Regular estaticos con fonttools para que ffmpeg drawtext tambien la
use (drawtext no soporta ejes de variacion). Registrada en
`assets/LICENCIAS.txt`. `animador_v9.py` la usa por defecto vía
`fnt()`, con fallback a DejaVu si no esta presente.

**Decisión 13 — mas variedad de formatos.** Los 5 guiones originales
solo usaban 4 de los 16 formatos de `animador_v9.py`. Se reescribieron
los actos de MECANISMO (y algun ERROR/LOOP) para usar cronologia,
terminal, conteo, alerta, pasos, panel y ranking -- 11 de 16 formatos
ahora en uso. De paso se corrigio un bug real y preexistente en
`f_ranking()`: el numero final se dibujaba pisando la etiqueta cuando
la barra era mas angosta que el texto del label a mitad de animacion
(pasaba con etiquetas largas como "Ya no le gustás"). Ahora el numero
respeta el ancho real del label, no solo el de la barra.

**Decisión 14 — guion 6, tema de relaciones ("Te dejaron en visto",
topico 5 de MARCA.md).** Reusa la captura de 'persona' (tema
emocionalmente adyacente) con nuevos captions. Usa el formato
'ranking' (primera vez en el proyecto) para las excusas inventadas.

**Imagenes representativas — todavia sin resolver.** No se agrego
ninguna porque las dos vias reales requieren algo que el operador
tiene que decidir: (a) `descargar_imagenes.py` vía el workflow manual
ya creado (Wikimedia/Openverse, gratis, pero son fotos de bancos, no
necesariamente "representativas" al pixel), o (b) `imagen_ia.py`
(Cloudflare Workers AI, generacion a medida) que necesita
CF_ACCOUNT_ID/CF_API_TOKEN -- una cuenta que el operador tiene que
crear y autorizar (regla de CLAUDE.md: ninguna integracion de API
externa sin confirmar cuenta/credenciales). Pendiente su decision.

**Estado actual: los 6 videos completos (5 revisados + 1 nuevo) estan
renderizados** en `videos/`, con la tipografia y formatos nuevos.
Enviados al operador para revision. Nada se publico en ninguna
plataforma.

**Pendiente / próxima sesión:**
- Feedback del operador sobre el lote 2.
- Cerrar el modelo de monetizacion (Gumroad venta unica vs. freemium
  vs. otra cosa) -- bloquea que el CTA de los videos tenga destino real.
- Decidir de donde salen las imagenes representativas (banco gratis vs.
  Cloudflare AI con cuenta propia).
- Decidir si la serie suma narración por voz (Kokoro/Fish TTS +
  Whisper para subtítulos sincronizados) o se mantiene mute-first.
- Correr manualmente el workflow de descarga de imágenes cuando el
  operador lo apruebe.

## 2026-08-20 (continuación — Hotmart y exclusividad)

**Contexto:** se descartó Gumroad por Hotmart (mejor fit LatAm/español).
Se armó el pipeline de producción de video sin tokens (GitHub Actions +
`producir_lote.py`), 15 guiones finales pasan `validar_hook.py`, se
armó `marca/ficha-venta.md` con todo lo necesario para dar de alta el
producto en Hotmart.

**Problema planteado por el operador:** un link público plano a
`el-corte-v7.html` permite que un solo comprador lo reparta y cualquiera
lo use gratis — rompe el modelo de pago único. Se propusieron 3 niveles
(A: código de acceso en la app: B: Área de Membros nativa de Hotmart;
C: cuentas reales vía Supabase Auth + webhook).

**Decisión 16 — exclusividad: Área de Membros de Hotmart (opción B),
sin gate de código en el HTML.** El operador eligió NO tocar
`el-corte-v7.html` con un código de acceso; la exclusividad la va a
resolver 100% del lado de Hotmart, dando de alta el producto como
"Área de Membros" (login propio por comprador, gestionado por Hotmart)
en vez de "producto con entrega por link". `marca/ficha-venta.md`
actualizado con esta decisión y los 3 pasos pendientes para que
funcione (host de `el-corte-v7.html`, tipo de producto en el alta,
módulo/clase con el link/iframe adentro del Área de Membros).

**Importante — sigue pendiente el hosting.** El Área de Membros de
Hotmart no aloja el archivo HTML en sí, solo enlaza/embebe una URL.
`el-corte-v7.html` sigue sin estar publicado en ninguna URL. La
diferencia con la propuesta anterior es que esa URL ya NO se reparte
directamente al comprador — queda enlazada adentro del Área de Membros,
detrás del login de Hotmart. Sigue siendo "publicar algo públicamente"
según la regla de oro de `CLAUDE.md`, así que activar GitHub Pages
sigue requiriendo confirmación explícita del operador antes de tocarlo.

**Pendiente / próxima sesión:**
- Confirmación del operador para activar GitHub Pages (hosting de
  `el-corte-v7.html`, ahora como paso interno del Área de Membros).
- El operador da de alta la cuenta de Hotmart con `marca/ficha-venta.md`
  como tipo "Área de Membros".
- Recibir los audios de ElevenLabs para los 15 guiones y correr
  `sincronizar_voz.py` / el workflow `producir-videos.yml`.
- Música de fondo: sigue bloqueada por las mismas restricciones de red
  que las imágenes; no hay workflow armado todavía (a diferencia de
  imágenes).
- Imagen de portada para la ficha de Hotmart (1280×720) — ofrecida,
  no generada aún.
- Tema "acelerado" sigue sin imagen representativa (4 intentos fallidos
  en Openverse, búsqueda pausada deliberadamente).
