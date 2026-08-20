# Log de decisiones

## 2026-08-20 (continuación — checklist interactivo + 2 bugs reales de voz corregidos)

**Producción en lote: éxito en el segundo intento.** El primer intento
(ronda anterior) renderizó los 27 videos bien pero perdió el resultado
por el bug de `git add` con glob vacío. El segundo intento, ya con el
fix, terminó bien: los 18 videos que faltaban (07-15 y el resto del
lote 3) quedaron commiteados. **Los 27 guiones ya tienen video en
`videos/`** (sin voz real todavía, con las duraciones del guion).

**Dos bugs reales encontrados antes de mandarle instrucciones al
operador para ElevenLabs** (mejor encontrarlos ahora que después de
que grabe 100 audios mal indexados):
1. Los guiones 01 al 06 nunca tuvieron bloque `elevenlabs.lineas`
   (se crearon antes de esa convención) — completados con narración
   natural de cada segmento, adaptando formatos que no tienen un
   campo `texto` directo (terminal, conteo, ranking, panel,
   cronología) a texto hablado real, no leído literal.
2. `generar_lote3.py` tenía una condición invertida: cuando un guion
   usaba `mensajes`, saltaba la línea de narración del mecanismo en
   vez de sumar una línea más — 3 guiones (18, 22, 24) iban a quedar
   con la mitad de la voz sin grabar sin que nadie lo notara hasta
   escuchar el video armado. Corregido y verificado índice por índice
   contra los segmentos reales de cada guion (no solo contra el
   conteo de líneas).

También: `sincronizar_voz.py` y `producir_lote.py` iban a pedir un
audio para el segmento del "quiebre" (freeze + silencio total a
propósito) en los 12 guiones nuevos — corregido, ese segmento nunca
necesita voz.

**Checklist interactivo publicado como Artifact**
(https://claude.ai/code/artifact/1cf0efb4-deb2-4dc9-bd1c-2ecf1e4b8931):
pensado para uso en celular durante los 2 días que quedan. Cubre, en
orden: Netlify → Hotmart (cuenta + Área de Membros, todo el copy ya
armado) → TikTok (cuenta + bio) → los 27 guiones con su narración
exacta lista para pegar en ElevenLabs (nombre de archivo correcto por
segmento, botón de copiar) + su caption de TikTok con hashtags →
música → checklist final de revisión. Los checks quedan guardados en
localStorage del navegador del operador (no en el repo). 3 guiones
marcados "prioridad" (16, 18, 21) porque son los más revisados hasta
ahora.

**Pendiente real de este bloque**: el operador todavía no mandó la
URL de Netlify, así que las descripciones de TikTok en
`guiones/descripciones-tiktok.md` (y en el checklist) siguen con
`[LINK PENDIENTE]` como placeholder -- hay que volver a generarlas
(o hacer un find-replace) apenas exista esa URL.

## 2026-08-20 (continuación — sesión nocturna autónoma: gramática v2 + lote 3 + portada)

**Contexto:** el operador aprobó la demo de la gramática de 6 beats
("nos vamos entendiendo a dónde quiero llegar"), pidió: más movimiento
(cambio visual cada ~1.5s), hooks más agresivos con identificación
real y cero tecnicismos ("nunca más rumiar"), no abandonar los formatos
anteriores (camino/collage), CTA de venta visible al final de cada
video ("comunidad... en hotmart"), y una lista de qué falta antes del
22/08. Dejó dicho "te voy a dejar a vos codeando" y se fue a dormir —
el resto de este bloque se hizo de forma autónoma, sin supervisión en
vivo, verificando cada pieza antes de commitear (mismo criterio que
el resto de la sesión: nunca confiar ciegamente en el reporte de un
agente, correr y mirar el resultado real antes de dar por bueno algo).

**Decisión 22 — formato "cta" (tarjeta de venta al cierre).**
`f_cta` en `animador_v9.py`: la frase de cierre pega con el mismo golpe
que el hook (rima visual), y medio segundo después entra una tarjeta
con el ícono de marca + "Comunidad El Corte" + "Disponible en Hotmart"
en el verde de acento. Ahora es el cierre estándar de todo guion nuevo
— antes el CTA solo vivía en el texto hablado ("seguime"), lo cual el
operador señaló como insuficiente.

**Decisión 23 — guion 16 reescrito con la gramática de 6 beats.**
Hook de impacto → dato duro → escalada (contenido real de la excusa
del ego, no nodos abstractos) → quiebre de capítulo (freeze + silencio
+ glitch) → 3 capturas reales de la app cortadas <1.7s cada una → cta.
Renderizado end-to-end, verificado frame por frame.

**Decisión 24 — lote 3: los 11 guiones que faltaban de la lista
aprobada** (`guiones/17-*.json` a `27-*.json`, generados con
`guiones/generar_lote3.py`, mismo patrón data-driven que el lote 2).
Variedad real de mecanismo para que ningún video se sienta igual:
escalada (5 guiones), mensajes/mockup de chat (3), camino (3) — nunca
el mismo formato dos veces seguidas en la serie. Vocabulario 100% de
calle: "ansiedad", "celos", "ego", "frustración" se usan como se dicen
en la calle (nunca como diagnóstico — "tenés ansiedad" sigue
prohibido), cero "rumiar" en ningún lado. Los 15 guiones originales +
estos 12 nuevos (16 al 27) sí usan la lista de situaciones ampliada
que el operador pidió (pareja, familia, escuela, trabajo, amistad,
celos, oportunidad perdida) en vez de limitarse solo a rumiación
nocturna.

Bug encontrado y corregido de paso: el check de "payoff visual
adelantado" de `validar_hook.py` no conocía los formatos nuevos
(mensajes/camino/escalada/collage) y los marcaba como si no tuvieran
ningún elemento visual fuerte en la primera mitad — falso negativo,
corregido.

Los 12 guiones (16 al 27) pasan `validar_hook.py` sin ningún problema
bloqueante (solo avisos menores, mayormente sobre conexión de loop en
palabras muy genéricas — no vale la pena forzar la redacción por eso).
Verificado con 3 renders reales completos (16, 18 con mensajes, 21 con
camino) antes de dar el lote por bueno, no solo confiar en el
validador.

**Decisión 25 — imagen de portada para Hotmart, generada por código**
(`marca/generar_portada.py` → `marca/portada-hotmart.png`, 1280×720,
misma identidad de marca, cero derechos de terceros). Pendiente
histórica, resuelta.

**Producción en lote disparada:** workflow `producir-videos.yml`
corriendo en GitHub Actions (cero tokens de esta sesión) para
renderizar los 9 guiones del lote 3 que todavía no tenían video local
(17, 19, 20, 22-27). Confirmar el resultado en la pestaña Actions del
repo o en la próxima sesión.

**Punto abierto, no resuelto esta sesión:** el operador pidió
"segundo y medio" de cambio visual constante — la estructura actual
(escalada con cortes acelerados, mensajes con entrada rápida, captura
<1.7s) ya apunta ahí, pero no se cronometró plano por plano cada
guion nuevo contra esa regla exacta. Si al ver los renders algo se
siente lento, el lugar para ajustar es `_tiempos_escalada()` /
duración de cada `mensaje` en `animador_v9.py`, no hace falta
rediseñar de nuevo.

---

## Lo que falta antes del lanzamiento (22 de agosto) — checklist

**Del lado del operador (nadie más puede hacer esto):**
1. **Netlify**: conectar el repo (Sign up with GitHub → Import → repo
   privado → Base/Publish directory `producto`) y avisar la URL
   `.netlify.app`. Sin esto no hay dónde apuntar el botón del Área de
   Membros. Es lo único que bloquea TODO lo demás del lado de Hotmart.
2. **Cuenta de Hotmart**: alta como Productor, tipo de producto "Área
   de Membros" (no "link directo"), usando `marca/ficha-venta.md`
   (precio ya actualizado a USD $25, descripción y portada listas).
3. **Área de Membros**: crear el módulo único "Acceso a la app" con
   el copy que ya está escrito en `marca/ficha-venta.md`, botón a la
   URL de Netlify del punto 1.
4. **Voz de ElevenLabs**: quedan 27 guiones sin voz real (los videos
   de hoy se generaron con duraciones de guion, sin audio hablado).
   No hace falta grabar los 27 para lanzar — con 3 a 5 alcanza para
   arrancar. Prioridad sugerida: 16 (ego), 18 (mensajes/pareja), 21
   (camino/jefe) — ya están renderizados sin voz, son los que más se
   revisaron.
5. **Música de fondo**: bajar 3-5 temas de Pixabay Music (sin cuenta,
   botón de descarga directa) y pasarlos — mi sandbox no tiene salida
   de red a esos sitios, no lo puedo hacer solo.
6. **Cuenta de TikTok**: crear como cuenta de Negocio, handle
   `@elcorte.app`, subir `marca/icono.png` como foto de perfil, bio
   ya elegida en turnos anteriores.
7. **Revisar y confirmar** los 12 guiones nuevos (16 al 27) antes de
   que se suban con voz — mostrados en el chat, pendiente de tu ok
   final sobre contenido (no solo sobre el formato).

**De mi lado, sin bloquear el lanzamiento:**
- Sincronizar voz apenas lleguen los audios (`sincronizar_voz.py`, ya
  probado).
- Ajustar ritmo/duración si algo se siente lento al verlo en el
  celular (ver "punto abierto" arriba).
- Seguir la producción en lote de GitHub Actions y confirmar que los
  9 videos pendientes terminaron bien.
- Imagen representativa para "acelerado" (tema viejo, no bloquea nada
  nuevo, sigue pausado).

## 2026-08-20 (continuación — vida ambiental en animador_v9.py, ronda 3)

**Contexto:** feedback del operador sobre el demo de "collage": "espacio
libre tremendo" (zonas del cuadro 1080x1920 sin textura/movimiento) y
tramos donde no pasa nada por más de un par de segundos. Investigación
2026 confirmó el diagnóstico (regla dura: nada estático >~3s) pero
también la advertencia de no pasar al extremo contrario ("cafeína
visual" sin momentos de claridad).

**Decisión 19 — capa de "vida ambiental" centralizada en `render()`.**
`dibujar_ambiente(img, d, t_abs, pal)` (una función, un solo punto de
llamada en `render()`, antes de la cámara) aplica DOS técnicas baratas
a los 18 formatos por igual, sin tocar cada `f_*`:
1. `_ambiente_particulas()` + `_punto_suave()`: ~13 motas de luz que
   flotan lento por todo el cuadro con parpadeo propio (alpha real,
   máx. ~22/255), compuestas solo sobre la caja mínima que cada punto
   toca (nunca una capa RGBA del tamaño completo del frame — el costo
   es proporcional a la cantidad de puntos, no al video).
2. `_grano_fuente()`: grano/ruido animado — un lienzo de ruido
   generado una sola vez por proceso (`random.Random(...).randbytes`,
   sin loop por píxel, sin numpy) del que se recorta una ventana
   distinta cada cuadro (offset "saltarín", no deriva suave, para que
   parpadee como grano real) y se mezcla con `Image.blend` al 2.8%.
`t_abs` es tiempo absoluto y continuo a lo largo de TODO el video
(`cfg["_dur_total"]`, seteado en `generar()`), no se reinicia en cada
segmento, para que ninguna de las dos capas salte de fase en los
cortes. Costo medido: ~13ms/frame extra sobre una base de ~82ms/frame
(declaracion, cámara+resize incluidos) — bien por debajo del costo de
un `GaussianBlur` de cuadro completo que el propio `collage` ya hace.

**Decisión 20 — micro-eventos en camino/collage (pulido, no rediseño).**
- `f_camino`: anillo que late viaja en la punta del trazo mientras la
  ruta se sigue dibujando (la línea ya crece cuadro a cuadro, esto lo
  hace más evidente); halo tenue que respira detrás de la última
  parada durante la cola del segmento, por si el guion deja tiempo de
  sobra después de revelar todos los nodos.
- `f_collage`: micro-respiración continua superpuesta al paneo de Ken
  Burns (el ease in-out del zoom se aplana cerca del final de cada
  slot — sin esto podía sentirse quieto un instante en slots largos);
  el punto de progreso activo late de escala.
Ninguno de los dos cambia duración/timing de segmentos ni agrega
cortes de contenido — solo textura/movimiento en huecos existentes.
Análisis de timing real: con la cadencia actual de nodos/fotos en los
15+1 guiones de producción, ninguno llegaba a superar 3s sin evento
propio (la línea de `camino` y el Ken Burns de `collage` ya son
continuos) — los micro-eventos son refuerzo/robustez para guiones
futuros con menos nodos o slots más largos, no un parche a un bug
visto hoy.

**Investigación 2026 (WebSearch, 2 búsquedas) — nada nuevo que sumar
como formato.** Confirma lo ya implementado: revival de grano/textura
analógica como recurso deliberado contra planos "muertos" (mismo
diagnóstico que hizo el operador a ojo), y advertencia real de no
convertir el video en "cafeína visual" sin ningún instante de claridad
(por eso los micro-eventos son sutiles y puntuales, no un rediseño).
El otro hallazgo (chapter cards cada 5-8s para simular una serie
dentro de un solo video) se descartó para esta ronda: es una decisión
de estructura de contenido, no de pulido visual, y el pedido explícito
era no tocar timing/estructura de segmentos.

**Regresión:** los 18 formatos renderizan cuadro a cuadro sin error
(smoke test directo). Los 16 guiones de `guiones/*.json` (no 15 — hay
uno nuevo, `16-ego-perdon.json`, no roto por esta ronda) pasan
renderizado completo de cada segmento/formato sin excepciones; 2 de
ellos (`01-no-dormir`, `16-ego-perdon`) se corrieron de punta a punta
por `generar()` con `ffmpeg` real, video+audio válidos. Los dos demos
(`demos/_demo_camino.mp4`, `demos/_demo_collage.mp4`) se
re-renderizaron y sobrescribieron con la mejora aplicada (mismo
nombre de archivo). Nota menor: `demos/_demo-camino-captions.json`
tenía `"salida": "videos/_demo_camino.mp4"` (no coincidía con el
nombre real del demo en `demos/`) — corregido a
`"salida": "demos/_demo_camino.mp4"` para que coincida con su par
`_demo_collage.json` y con lo que el operador va a revisar.

**Pendiente / próxima sesión:**
- Que el operador vea los dos demos re-renderizados y confirme si la
  vida ambiental resuelve el feedback de "espacio libre" o si hace
  falta subir/bajar la intensidad (parámetros centralizados en
  `dibujar_ambiente()`, un solo lugar para ajustar).
- Todo lo demás pendiente de rondas anteriores (Netlify, audio real de
  ElevenLabs, música de fondo) sigue igual, no tocado esta ronda.

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

## 2026-08-20 (continuación — hosting bloqueado, 4 funcionalidades nuevas en la app)

**Hosting: GitHub Pages bloqueado por permisos de la integración.**
`configure-pages@v5` falló dos veces: primero porque el sitio de Pages
no existía (`enablement:false` por defecto), y con `enablement:true`
falló con "Resource not accessible by integration" — el token de la
app de GitHub conectada a Claude Code no tiene permiso de
administración de repo. Confirmado que tampoco puede crear un repo
nuevo (mismo error 403 en `create_repository`). Este no es un
problema de plan/repo privado, es un límite de la integración misma.
**Decisión: hosting vía Netlify**, conectado directo al repo privado
de GitHub (su plan free sí permite repos privados, a diferencia de
Pages) — evita hacer público nada del negocio. El operador tiene que
hacer el alta una vez (Sign up with GitHub → Import from GitHub →
elegir el repo → Base/Publish directory `producto`) — 3-4 toques,
después queda auto-deploy en cada push a `main`. Pendiente que el
operador lo conecte y avise el dominio `.netlify.app` resultante.

**Decisión 17 — 4 funcionalidades nuevas en `producto/el-corte-v7.html`,
aprobadas por el operador, más pulido visual.**
1. **Racha** (`ec_racha`): contador de días consecutivos con alguna
   actividad completada (sesión de bucle, 3AM, meditación, respiración,
   cierre del día, ritual, o "Corte ya"). Badge 🔥 en el header, con
   animación de "pop" al incrementar.
2. **"Corte ya"**: botón de un toque en la pantalla de inicio que da
   una acción concreta al azar (pool de 10, sin repetir la última)
   sin pasar por el diagnóstico de 2 preguntas — pensado para el
   momento de máxima fricción (3 AM, no ganas de pensar).
3. **Insight semanal proactivo**: reusa `revisionSemanal()` (ya
   existía pero estaba escondida en la pestaña Patrón) y la muestra
   como card en la pantalla de inicio una vez por semana calendario
   (clave `ec_insSemana`), sin esperar a que el usuario la busque.
4. **Recordatorio de cierre del día**: el usuario elige una hora en
   la vista de Cierre del día. Combina best-effort Notification API
   (mientras la pestaña sigue abierta) con un nudge confiable dentro
   de la app: si se abre después de la hora elegida y no cerró el
   día, aparece una card para hacerlo. Documentado en el código que
   sin servidor no hay push real — es la limitación honesta de
   "sin infraestructura propia" de `CLAUDE.md`.

**Pulido visual:** animación de entrada unificada (fade + slide + scale
sutil) aplicada a TODAS las subvistas de la app (antes solo las pestañas
principales la tenían), feedback táctil en botones/chips (`scale(.97)`
al tocar), transición del ícono activo en la barra de navegación.

Probado end-to-end con Playwright headless (Chromium): flujo completo
de "Corte ya" → racha se incrementa → recordatorio se guarda →
Patrón refleja el bucle cortado. Sin errores de consola propios (un
warning preexistente de un `<animate>` del splash, no tocado, no
introducido esta sesión).

**Pendiente / próxima sesión:**
- Que el operador conecte Netlify y confirme la URL.
- Seguir pensando más funcionalidades de hábito/profundidad con el
  operador (mencionó que quiere seguir iterando esta lista).

## 2026-08-20 (continuación — declaración de arranque, Riesgo 3 de ANTI-FRACASO.md)

**Fecha de arranque del canal TikTok: antes del 22 de agosto de 2026.**
Por `ANTI-FRACASO.md` Riesgo 3: compromiso mínimo de 30 días desde esa
fecha antes de evaluar o cambiar de canal/estrategia. No se pivotea
por falta de resultados antes de esa ventana.

Blueprint del Área de Membros de Hotmart definido y escrito en
`marca/ficha-venta.md` (nombre "Comunidad El Corte", módulo único
"Acceso a la app", copy de bienvenida, botón a la URL de Netlify).
Sigue pendiente que el operador conecte Netlify — es el único paso
técnico que falta para que ese blueprint sea ejecutable.

Aclarado con el operador: la limitación de link en la bio de TikTok
no bloquea nada — el plan siempre fue CTA en texto/voz ("entrá a mi
área de miembros"), no un link clickeable desde el video. El "link
distinto por video" que propuse no era sobre esto: era tracking de
qué video convierte mejor, para alimentar después el sistema de
auto-actualización de contenido. Queda como mejora de fase 1.4, no
bloqueante para lanzar.

## 2026-08-20 (continuación — gramática visual de 6 beats, ronda 4)

**Contexto:** el operador vio los resultados de las 3 rondas anteriores
(camino, collage, vida ambiental) y dijo, textual, que no ayudaban al
"desarrollo del video en sí" — el problema no era que los frames se
sintieran vacíos (ya resuelto), es que la HISTORIA no tenía desarrollo
visual propio: cada beat necesita su propio tratamiento ligado al
contenido de ESE momento, no decoración pareja para todo el video. Tras
una conversación de calibración con el operador (qué mecanismo visual,
cómo se siente el reveal de la app, qué motor de energía, qué
referencias — sin limitarse al nicho de autoayuda), se aprobó una
gramática de 6 beats concreta, usando "no le tenés confianza a tu
pareja" como caso de estudio.

**Decisión 21 — 6 piezas técnicas nuevas en `animador_v9.py`/
`armar_video.py` para la gramática de 6 beats (hook → situación real →
escalada → quiebre → app → cierre).**

- **`f_mensajes`** (formato nuevo): mockup de chat oscuro estilo
  iMessage/WhatsApp en la paleta de marca. 2-4 mensajes que se
  ACUMULAN (no se reemplazan) en sucesión rápida, cada uno con su
  propio pop + microshake de cámara + SFX. JSON: `{"formato":
  "mensajes", "contacto": "..." (opcional), "mensajes": [{"texto":
  "...", "emisor": "otro"|"yo"}, ...]}`. Muestra literalmente lo que
  dijo la otra persona en vez de íconos/nodos abstractos.
- **`f_escalada`** (formato nuevo): la escalada del pensamiento como
  CONTENIDO REAL — frases que se apilan con cortes cada vez MÁS
  rápidos (pesos decrecientes reales vía `_tiempos_escalada()`, no
  cortes parejos). JSON: `{"formato": "escalada", "pasos": [str,...]}`.
  El último paso es la idea completa ("ya armaste toda una historia"),
  no un contador numérico abstracto.
- **`"quiebre_capitulo": true`** (campo de segmento): freeze frame del
  último frame del segmento anterior + silencio TOTAL de audio ~0.5s
  (el "aire muerto" antes del golpe, técnica confirmada por
  investigación) + glitch/VHS fuerte (separación RGB, scanlines,
  bandas, dip a negro, light-leak en el verde de marca) hacia el
  segmento nuevo — con chapter-card opcional durante el quiebre.
  `"quiebre_freeze"`/`"quiebre_glitch"` (segundos) ajustan cada mitad;
  la `"duracion"` del segmento tiene que alcanzar la suma. El silencio
  se fuerza con `volume=enable='between(t,x,y)':volume=0` DESPUES del
  mix (mismo patrón que ya usaba el ducking de música), así gana sobre
  voz+música+SFX sin importar qué haya debajo.
- **Hook `"impacto"`**: los hooks existentes (`zoom_golpe` sin shake,
  `sacudida` sin zoom) no alcanzaban para "el texto pega con un golpe"
  — se agregó uno que junta flash + punch-zoom + shake en ~0.26s, para
  que el SFX de impacto caiga exactamente cuando el texto aparece.
  Se usa en el hook y en el cierre (misma técnica = rima visual).
- **Cámara más agresiva por segmento**: `"camara_intensidad"` (escala
  la deriva base), `"camara_shake"` (shake continuo con ruido real, no
  solo seno) y `"camara_golpes"` (picos puntuales en fracciones 0..1
  del segmento) — `mensajes`/`escalada` generan sus propios golpes
  automáticamente si el guion no los declara a mano.
- **Capturas más rápidas + click**: confirmado que el segmento
  `"captura"` soporta duraciones <2s sin romperse (probado con clips
  de 1.5/1.5/1.7s en el demo). `render_captura()` en `armar_video.py`
  ahora respeta un `"sfx"` explícito por segmento (mismo campo que ya
  usan los segmentos `"formato"`) para poner un click/tick en cada
  corte en vez de depender del tipo de transición. Se agregó además
  una viñeta sutil opcional (`"captura_vineta"`, default true) sobre
  la captura para reforzar la sensación de "adentro de la herramienta"
  tras el quiebre — punto opcional del brief, barato via
  `ffmpeg vignette`.

SFX nuevo por beat (mismo mecanismo puntual que ya usaba el whoosh del
collage — no se generó ningún archivo de audio nuevo, se reusan
tick/riser/impacto ya existentes en `assets/sfx/`): tick en cada
mensaje desde el 2do, riser de fondo + tick en cada corte de escalada,
impacto al terminar el silencio de un quiebre.

**Demo:** `demos/_demo_gramatica_v2.json` → `demos/_demo_gramatica_v2.mp4`
(16.7s), gramática completa de 6 beats con el caso de estudio "no le
tenés confianza a tu pareja", armado con `armar_video.py` (mezcla
segmentos `"formato"` con 3 clips `"captura"` reales de
`capturas/captura-decidir.mp4`). Verificado con capturas de frame de
las 6 etapas (hook, mensajes acumulando, escalada acumulando con
cortes acelerando, freeze+glitch+chapter-card, captura real con
viñeta, cierre) y con `silencedetect` de ffmpeg confirmando la ventana
muda en el quiebre (t≈9.0-9.5s).

**Regresión:** `guiones/03-no-decidis.json` y `guiones/16-ego-perdon.json`
se re-renderizaron completos vía `armar_video.py` sin ningún error
(ninguno usa los formatos/campos nuevos, así que el comportamiento es
pixel-idéntico al de antes de esta ronda). No se tocó el contenido de
`guiones/16-ego-perdon.json` — eso lo reescribe el operador con esta
gramática en la próxima sesión, usando los nombres exactos de arriba.

**Pendiente / próxima sesión:**
- Que el operador reescriba `guiones/16-ego-perdon.json` (u otro
  guion) con la gramática de 6 beats real.
- El quiebre solo se probó DENTRO de un mismo grupo `"formato"` (beat
  3→4 del demo, ambos renderizados por `animador_v9.py`). Si algún día
  se necesita un quiebre justo en el borde entre un grupo `"formato"`
  y un grupo `"captura"` (que `armar_video.py` compone con xfade, no
  con el `transicion()` de `animador_v9.py`), ese caso tiene un
  fallback mínimo (`"quiebre"` mapea a `fadeblack` con 0.9s en
  `XFADE`/`DUR_TRANS`) pero NO tiene el freeze+silencio real — quedaría
  como mejora si se necesita.
