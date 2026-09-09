# Estado vivo del proyecto

## Bloque: aclarada la confusión real sobre "por qué la descarga nunca funciona" (2026-09-09, misma sesión que el bloque de abajo)

El operador reportó, después de todo lo anterior, que la descarga seguía sin
funcionar y preguntó directo "¿querés que lo hostee?" -- señal de que el
verdadero problema no era un bug de código sino una confusión de canal, ya
arrastrada por varias vueltas:

**La causa real**: el botón "Descargar 6 imágenes" depende de una conexión
(`window.claude`/`claude.use('db')`) que **solo existe cuando la página se
abre desde el link en vivo del Artifact** -- nunca en un archivo `.html`
guardado/descargado en el celular. Todas las vueltas anteriores en que se
mandó el calendario por chat como archivo para "descargarlo" entregaron,
sin darse cuenta, una versión en la que ese botón **no podía funcionar por
diseño** -- no era un bug a repetir, era el canal equivocado para esa
función puntual.

**Resuelto**: se publicó un Artifact nuevo (el anterior tenía 1075 líneas
y releerlo entero para poder republicarlo -- requisito de la plataforma
antes de sobrescribir -- salía carísimo en contexto; más simple publicar
uno nuevo) en `https://claude.ai/code/artifact/fa48493c-659b-405a-a784-eab5c6d41e74`
con `calendario_v4.html` (la versión de 5 días de semana) y
`capabilities: {db: {}, downloads: true}`, y se re-subieron las 252
imágenes (42 tandas de 6, reusando los JSON ya preparados en
`db_docs_v3/`, herramienta `ArtifactData` -- el nombre de la operación de
base de datos del Artifact cambió de tool esta sesión, de `Artifact` a
`ArtifactData`). El operador tiene que **abrir ese link** (no descargar el
archivo) para que el botón de descarga funcione.

**Pendiente real**: confirmar con el operador si, abriendo el link (no un
archivo bajado), la descarga funciona esta vez -- es la primera vez en la
sesión que se prueba el mecanismo correcto de punta a punta desde el lado
del operador.

## Bloque: calendario recalculado a 5 días de semana (2026-09-09, misma sesión que el bloque de abajo)

Tercer ajuste del mismo cronograma en la misma sesión: el operador pidió
recortar el reparto de 7 días corridos (bloque de abajo) a **solo días de
semana** (sin sábado ni domingo). 42 carruseles y 21 videos no dividen
exacto entre 5 días, así que `generar_calendario_v2.py` (scratchpad) ahora
reparte con una función `repartir()` que da lo más parejo posible (los
primeros días absorben el resto): carruseles `[9,9,8,8,8]`, videos
`[5,4,4,4,4]`. Dentro de cada día, esos items se vuelven a repartir entre
las mismas 3 franjas horarias investigadas (12:00/18:00/20:00), escalonados
15 min entre sí (a veces esa franja se extiende más allá de la hora exacta
cuando le tocan más piezas -- ej. 12:00 a 13:00 en el día más cargado --
pero se mantiene dentro de la ventana ancha de cada estudio, ej. almuerzo
IG 10-15h). Reemplaza el reparto de 7 días como versión vigente.

## Bloque: calendario re-entregado como archivo descargable + reorganizado a 7 días (2026-09-09, misma sesión que el bloque de abajo)

Dos ajustes reales pedidos por el operador sobre la entrega anterior, en la misma sesión:

**1) El calendario interactivo (Artifact) se le trababa al scrollear en el
celular.** En vez de seguir parcheando esa vía, se generó un PDF liviano de
referencia (texto plano, sin JS ni imágenes de más de unos KB) con
`generar_calendario_pdf.py` (scratchpad) -- pero el operador lo calificó de
"muy malo" y pidió en cambio el `.html` interactivo original **como archivo
para descargar y abrir localmente**, no como link de Artifact. Se le mandó
`calendario_v2.html` (luego `v3.html`, ver punto 2) directo por chat con
`SendUserFile`. Nota real, no oculta: el botón "Descargar 6 imágenes" de
cada carrusel no funciona en el archivo local (depende de `claude.use()`,
que solo existe dentro del visor de Artifact) -- no es un problema, porque
las 252 imágenes y los 21 videos ya estaban entregados por chat aparte.

**2) Reorganización real del cronograma**: el operador aclaró que la idea
de los 42 carruseles era que entraran en **7 días** (6/día), no en 21, y
pidió que los 21 videos entraran en la misma ventana (3/día) -- 9 piezas
por día. Se rehízo `generar_calendario_v2.py` (scratchpad) para repartir
`carruseles[6n:6n+6]` + `videos[3n:3n+3]` por día en vez de 2+1, usando las
mismas 3 franjas horarias más fuertes ya investigadas (12:00 / 18:00 /
20:00) pero ahora con 2 carruseles + 1 video por franja, escalonados 15 min
(`:00`/`:15`/`:30`) para no pisarse en el feed sin salirse de la ventana de
tráfico alto. Al ser 7 días corridos entran sábado y domingo, que los
mismos estudios muestran algo más débiles -- se documentó la salvedad en el
propio calendario en vez de callarla, ofreciendo recalcular a solo días de
semana si el operador lo prefiere (quedaría ~10-11 piezas/día en 4 días).

## Bloque: calendario unificado (21 videos + 42 carruseles) con horarios investigados + descarga de carruseles arreglada de nuevo (2026-09-09, misma sesión que el bloque de abajo)

Pedido explícito del operador: un calendario COMPLETO (hora/día/título/
hashtags/descripción/música) que junte los 21 videos normales Y los 42
carruseles en un solo cronograma, con horarios basados en investigación real
(no solo la intuición "martes a viernes de noche" que el operador propuso) y
que la descarga funcione correctamente esta vez.

**1) Horarios investigados de verdad (WebSearch, no asumidos).** TikTok:
pico fuerte en la noche (18-22h, especialmente 20-21h) y una ventana
secundaria a la mañana (6-9h); evitar 10-14h entre semana y siempre 1-5h.
Instagram: más fuerte martes-jueves, con ventana de almuerzo (11-13h/10-15h)
y ventana de "vuelta a casa" (17-19h); fines de semana débiles en ambas
plataformas. Fuentes: Sprout Social, Buffer (7.1M posts de TikTok / 9.6M de
Instagram analizados), Hootsuite — citadas con URL real en un `<details>`
plegable dentro del propio calendario. Confirma la intuición del operador
(mar-vie) y la refina: 3 franjas por día, 12:00 y 18:00 (carrusel) + 20:00
(video), en vez de "de noche" a secas.

**2) Cronograma unificado.** 42 carruseles (2/día) + 21 videos (1/día) = 21
días de publicación exactos, arrancando mañana, solo martes-viernes.
Metadata de publicación de los 21 videos, que no existía como estructura
separada, se creó en `fabrica/ejemplos/lote_21_publicacion.ts` (paralelo a
`lote_21_datos.ts`, que sigue siendo solo guión/voz) con hashtags,
descripción, categoría y CTA por video. `COLOR_CATEGORIA`/`MUSICA_CATEGORIA`
se exportaron desde `fabrica/carrusel/lote_42_datos.ts` para que videos y
carruseles compartan una sola taxonomía de categoría/color/música (antes
solo existía para carruseles). `fabrica/ejemplos/dump_calendario_unificado.ts`
(nuevo) vuelca todo a JSON plano para que el generador del calendario no
dependa de otra corrida de CI.

**3) Botón de descarga de los carruseles, reintentado con el bug real
corregido.** El bloque de abajo (mismo día) documenta que ese mecanismo se
había sacado del calendario anterior por poco confiable. El operador pidió
explícitamente en esta vuelta que la descarga funcionara, así que se
reintentó -- pero esta vez se encontró y corrigió el bug concreto: el
JS viejo escribía siempre `.png` como extensión del archivo descargado sin
mirar el `mime` real del documento (`downloads.save()` infiere el tipo por
la EXTENSIÓN del nombre de archivo, no por `Blob.type` -- confirmado
releyendo el contrato `.d.ts` de la capacidad, no asumido), y muchas
imágenes habían sido recomprimidas a JPEG por el límite de 256KB/documento.
Con `image/jpeg` guardado como `.png` el archivo quedaba corrupto o el
sistema operativo lo rechazaba -- causa directa más probable del "no me
guarda" reportado antes. Corregido con una tabla `EXT_POR_MIME` que arma el
nombre real según el `mime` del documento. **Aun así, la limitación de fondo
que motivó sacarlo la vez anterior (en iOS `downloads.save()` pasa por la
hoja de compartir nativa, no una escritura directa, y ya había fallado una
vez sin causa clara) no desapareció** -- esto es un segundo intento con un
bug real corregido, no una garantía de que quedó resuelto del todo; si
vuelve a fallar, la próxima vez conviene sacarlo definitivamente y quedarse
solo con `SendUserFile`, que fue 100% confiable las dos veces.

**4) Videos: sin botón de descarga, a propósito.** Investigado el contrato
real de `downloads` (`.d.ts`): no hay límite de tamaño en `save()` en sí,
pero para que los bytes lleguen a la página hace falta `db` (256KB/documento)
o incrustarlos en el HTML (≤16MB toda la página) -- los 21 videos pesan
3.5-10.2MB cada uno, así que ningún mecanismo del Artifact puede servirlos.
En vez de ofrecer un botón que iba a fallar seguro, cada tarjeta de video
del calendario dice explícitamente "ya te lo mandé por chat -- un .mp4 no
entra en este calendario, pesa demasiado" y los 21 videos se entregaron
por `SendUserFile` en 6 tandas (100MB total). Es una limitación técnica
real, no una decisión de conveniencia.

**5) Pipeline de datos.** Los 252 PNG de `imagenes/lote42/` se
recomprimieron (PNG si el base64 entra en 240000 caracteres, si no JPEG
bajando calidad de a 10 desde 85) y se resubieron al `db` del Artifact en
42 tandas de 6 (una por carrusel) -- el calendario se republicó primero con
`capabilities: {db: {}, downloads: true}` declaradas explícitamente (sin
esto el `write_db` falla con "no such artifact, collection, or document",
mismo síntoma que la vuelta anterior). Verificado con `read_db get` sobre
un documento que las 252 imágenes quedaron bien subidas.

**Entrega**: calendario republicado en el mismo Artifact de siempre
(`https://claude.ai/code/artifact/3531bacf-b3b3-47d2-bccc-5f46e3fb9f2f`),
21 videos entregados por chat en 6 tandas. El generador
(`generar_calendario_v2.py`) y el preparador de documentos
(`preparar_db_docs.py`) quedaron en el scratchpad de la sesión, no en el
repo -- son herramientas de entrega puntual, igual que el `generar_calendario.py`
del bloque anterior.

**Pendiente real, no resuelto esta vuelta**: confirmar con el operador si
la descarga de carruseles funcionó de verdad esta vez desde su celular
(no hay forma de probar la capacidad real de Artifact fuera del cliente
real de Claude) -- y lo mismo de siempre, automatizar la publicación real
a redes sigue bloqueado por la Regla de Oro.

## Bloque: colores por categoría + hooks sin duplicar + calendario día-por-día del lote de 42 (2026-09-09)

Continuación directa del bloque de abajo. El operador reportó dos problemas reales
sobre la entrega anterior y pidió, para la mañana siguiente, todo terminado con
más impacto visual, sin supervisión intermedia ("hace una registración cada 8
minutos... me voy a dormir"). Se resolvió todo en la misma sesión, sin pausar.

**1) El botón de descarga del calendario no guardaba nada en el dispositivo**
(reporte real del operador). Causa raíz: el flujo `db` + `downloads.save()` del
Artifact depende de que la capacidad esté disponible para el visor en ese momento
(iOS enruta `save()` por la hoja de compartir nativa, no una escritura directa) y
ya había fallado una vez. Se decidió **no seguir parcheando ese mecanismo** —
sacar el botón de descarga del Artifact y dejar el calendario como referencia
pura (fecha/horario/título/hashtags/música + miniatura), apoyado 100% en
`SendUserFile`, que fue el único canal 100% confiable toda la sesión para
entregar archivos reales guardables. Las 252 imágenes se reenviaron por chat
en 7 tandas de 36 (una por día de publicación).

**2) Colores con más impacto visual + edición más avanzada** (pedido explícito:
"colores que hagan un gran impacto visual", "edición un poco más avanzada, un
poco más compleja"). Se agregó un sistema de `categoria` por carrusel (dinero
oro `#F2B705` / IA azul `#2F8CFF` / mito-alerta rojo `#FF2D3D` / regalo-CTA
magenta `#FF2E9F` / éxito-sistema el naranja de marca de siempre, sin cambios)
que resuelve un `colorAcento` por slide (`CarruselSlide.tsx`, cae a
`PALETA.acento` si no se pasa -- no rompe nada de `identidad.ts`, que sigue
siendo la única paleta de marca real compartida con el motor de video). El
resaltado de palabras clave (`resaltar`) pasó de texto de color a un **chip
tipo marcador fluo** (fondo sólido + texto invertido), y cada slide tiene una
barra de acento arriba -- más "editado", visualmente más fuerte que antes.

**3) Hooks repetidos, encontrados y corregidos** (no pedido explícitamente,
encontrado auditando el lote antes de tocarlo). Los 10 carruseles "Mito: X"
(#21-30) eran casi duplicados textuales de otros 10 del mismo lote (mismo
ángulo, a veces la misma palabra clave de CTA) -- se reescribieron con un dato
o anécdota concreta y propia cada uno. **Bug real de producto encontrado y
arreglado en el camino**: 7 carruseles distintos compartían la misma palabra
clave de comentario con otro carrusel del lote (`SISTEMA` x5, `EMPEZAR` x3,
`VISIBLE`/`PRODUCTO`/`ACTIVOS`/`PLATAFORMAS`/`ERRORES` x2) -- si alguien
comentaba esa palabra en cualquiera de los dos posts, no había forma de saber
qué PDF corresponde mandarle. Las 42 palabras clave del lote son únicas ahora.

**4) Calendario reconstruido día por día** con fecha real (arranca al día
siguiente de la sesión), horario sugerido, título, hashtags y un **estilo de
música sugerido por categoría** (tono/género, no un track puntual real -- no
hay forma de saber qué está trending en la plataforma en el momento real de
publicar, así que se documentó como guía, no como un audio inventado).
Publicado en el mismo Artifact de siempre (misma URL), con `capabilities: {}`
para sacar la declaración vieja de `db`/`downloads` que ya no usa.

**Pipeline usado**: se borraron las 252 PNG viejas de `imagenes/lote42/` (el
workflow de render salta archivos que ya existen, así que hace falta borrar
para regenerar), se corrió `render-lote42-carruseles.yml` completo de nuevo
(run 34308469373, ~20 min, éxito), se generó el calendario con un script nuevo
(`generar_calendario.py`, en el scratchpad de la sesión -- no comiteado al
repo, es una herramienta de entrega puntual) que lee la metadata real vía
`dump_calendario_datos.ts` (nuevo, comiteado en `fabrica/carrusel/`) en vez de
depender de otra corrida de CI.

**Pendiente real, no resuelto esta sesión**: si los PDF/guías prometidos en
cada CTA ("te mando la guía") existen como archivos reales entregables, y el
mecanismo real de monitorear comentarios de TikTok y responder con el
recurso correcto -- bloqueado por la Regla de Oro (ninguna integración con
cuenta real sin confirmación explícita del operador sobre qué cuenta usar).

## Bloque: calendario interactivo del lote de 42 + portadas con imagen en los 37 restantes (2026-09-08, misma sesión que el bloque de abajo)

Continuación directa del bloque de abajo, ya con los 252 slides renderizados
y entregados. Dos pedidos nuevos del operador sobre la entrega:

**1) Botón de descarga en el calendario.** El calendario (Artifact) no
podía ofrecer un `<a download>` real (los Artifacts bloquean descargas
disparadas por la propia página) y el almacén de assets del Artifact
dio `store_unavailable` esa sesión. Se resolvió con las capacities
`db` + `downloads`: las 252 imágenes en resolución completa se
subieron a la base de datos del propio Artifact (`imagenes/<carrusel-id>/slides/sN`,
252 documentos, base64) y cada tarjeta tiene un botón "Descargar 6"
que lee esos documentos y llama a `downloads.save()` una vez por
imagen (6 confirmaciones nativas, sin ZIP -- la extensión `.zip` no
está en el allowlist de `downloads`). Límite real encontrado y resuelto:
un `write_db` de más de ~8 imágenes por lote pasa el máximo de 1MB por
request -- se subió de a 6 (una carpeta de carrusel) por llamada, y las
5 portadas con foto de persona real (más pesadas como PNG, >256KB
codificadas) se recomprimieron a JPEG calidad ~85 antes de subir.

**2) Imagen en los otros 37 carruseles** (antes solo texto sobre
color). Pedido explícito: "mitad genéricas/representativas, mitad
exactas" -- el operador aclaró después que por "exactas" se refería a
**fotos reales de personas famosas** (dinero/estatus/IA), no frames de
película (se le explicó el riesgo real de copyright en una cuenta
comercial y aceptó la alternativa). Resultado: 17 fotos reales de
figuras públicas (Warren Buffett, Robert Kiyosaki, Grant Cardone,
Cristiano Ronaldo, Tony Robbins, Dwayne Johnson, Mark Cuban, Bill
Gates, Kevin O'Leary, Rihanna, LeBron James, Oprah Winfrey, Richard
Branson, Jay-Z, Kim Kardashian, Sam Altman, Kylie Jenner, vía Wikidata
P18 igual que los 5 de "sistema de X") + 18 fotos de stock genéricas
por tema (Pexels, nichos nuevos en `descargar_metraje.py`) + logo real
de TikTok como badge en el carrusel de plataformas (Wikidata P154).
**Bug real encontrado y corregido**: el primer intento de bajar el
logo de Hotmart no encontró un P154 confiable en Wikidata y el script
cortó (por diseño, "mejor sin logo que el equivocado") -- pero el
workflow no tenía `if: always()` en el paso de commit, así que las 18
fotos de stock que SÍ se habían bajado bien en el mismo job se perdían
enteras cada vez. Corregido (logo opcional que no corta el job +
commit siempre) y carrusel-09 quedó con la foto genérica sin badge de
marca. Todas las fotos y el logo verificados visualmente con Read
antes de comprometerse al render.

`fabrica/carrusel/lote_42_datos.ts`: `IMAGENES_PERSONA` extendido (17
entradas nuevas) + `IMAGENES_STOCK` nuevo (20 entradas, con `logoSlug`
opcional) -- placeholder `imagen: "STOCK:<nicho>"` resuelto a archivo
real + crédito en `exportar_lote_42.ts` (`resolverStock()`, mismo
patrón que ya usaba el carrusel de prueba de Musk para las fotos de
cohete). Render de las 37 portadas nuevas: se borraron los 37
`slide-01.png` viejos (el guard del workflow salta si el archivo ya
existe) y se re-disparó `render-lote42-carruseles.yml`, que solo
regeneró esos 37 sin tocar los otros 215 slides. Calendario
republicado con las 42 miniaturas actualizadas.


## Bloque: 3 pilotos + lote de 21 videos + lote de 42 carruseles (Taller de Activos, 2026-09-08)

Tanda larga de producción real (no solo motor), pedida en varias etapas
por el operador. Todo entregado y confirmado, no queda nada corriendo.

**1) 3 videos piloto** (`fabrica/ejemplos/generar_piloto_1/2/3.ts`) --
primera prueba real de `renderizador_por_guion.ts` con componentes
100% faceless del registro actual (nunca cámara/rostro-hablando).
Producidos, entregados, feedback del operador: golpes más agresivos y
contenido más concreto (no plantitudes genéricas) -- aplicado en el
lote de 21.

**2) Lote de 21 videos** (`fabrica/ejemplos/lote_21_datos.ts` +
`.github/workflows/generar-voz-lote21.yml` + `render-lote21.yml`) --
ángulos mejorados (pasados por el operador desde DeepSeek), producción
nocturna autónoma pedida explícitamente ("no frenes cada operación...
revisa cada 10 minutos"). Los 21 completados y entregados
incrementalmente (uno por uno, no en bloque, para no perder trabajo si
algo fallaba a mitad de camino). Único incidente real: v11 falló el
`git push` por carrera entre 21 jobs simultáneos (no bug de código) --
resuelto con `rerun_failed_jobs` una vez bajó la contención.

**3) Carousel Engine ejercitado por primera vez con datos reales** --
`fabrica/carrusel/` ya existía (Ronda 7) pero nunca se había usado con
copy real del operador. Se agregó a `tipos.ts` soporte de imagen real
(`imagen`, `estiloImagen: 'circular'|'fondo'`, `credito`, `resaltar`,
`logo`) y en `remotion-spike/src/carrusel/CarruselSlide.tsx` el
tratamiento "fondo" (foto full-bleed + duotono marca + degradé para
legibilidad) y `ConResaltado` (resalta substrings en `PALETA.acento`).
**Bug real encontrado y corregido dos veces** en `ConResaltado`: el
early-return para slides sin `resaltar` no aplicaba `colorBase`,
dejando texto sin estilo (se veía invisible sobre fondo del mismo
color) -- encontrado recién al abrir el PNG renderizado con la
herramienta Read, no releyendo el código fuente y asumiendo. Probado
primero con un carrusel de prueba (Elon Musk/SpaceX) iterado 4 veces
hasta quedar bien.

**4) Infraestructura de fotos/logos reales** (nueva, vía Wikidata/
Commons -- Pexels y Wikidata están bloqueados desde el sandbox, todo
corre en GitHub Actions):
- `descargar_foto_persona.py` / `descargar_fotos_lote.py` -- fotos de
  personas reales (P18 de Wikidata), filosofía "mejor sin foto que con
  la persona equivocada".
- `descargar_logo_empresa.py` (nuevo) -- logos de empresas (P154), con
  parámetro `pista` para desambiguar (ej. "Amazon" río vs. empresa).
- `foto-persona.yml` -- **bug real corregido**: el step de lote corría
  igual aunque el trigger fuera un pedido suelto por `workflow_dispatch`,
  por un `pedido-lote.json` viejo que había quedado de otro batch --
  ahora el pedido suelto explícito siempre gana.
- `descargar_metraje.py` -- bug real corregido: un nicho custom llamado
  en la forma `nicho cantidad` (2 args) usaba el dígito de cantidad
  como query de Pexels si no estaba en el diccionario `NICHOS`.

**5) Lote de 42 carruseles (252 imágenes)** -- pedido completo del
operador ("42 carruseles... horario de subida en TikTok, hashtags,
descripción, título, todo"). `fabrica/carrusel/lote_42_datos.ts`
(datos + `horario()` que distribuye 7 días x 6 posteos, 3 franjas:
Mañana 09:30/10:30, Tarde 14:30/16:00, Noche 20:30/21:30) +
`exportar_lote_42.ts` (arma+valida+exporta 252 props). Los 5
carruseles "el sistema de <persona>" (Musk/MrBeast/Bezos/Gary Vee/
Jobs) usan historias reales concretas con tensión narrativa (no
biografías genéricas), foto real full-bleed + logo de la empresa,
crédito de Wikimedia Commons visible en el slide (uso editorial, nunca
esponsoreo). Cada CTA dice explícitamente qué se manda a cambio del
comentario (feedback directo del operador: "no da nada a cambio" tras
la primera versión). Render completo vía
`render-lote42-carruseles.yml` (252/252 slides, 0 advertencias de
`validarEstructura`). Verificación visual con Read antes de entregar
(las 5 fotos + los 3 logos reales, confirmados correctos).

**Entrega**: calendario de contenido publicado como Artifact
(agrupado por día, con miniatura, hora sugerida, hashtags, descripción,
botón "Copiar" que copia descripción+hashtags al portapapeles del
celular vía `navigator.clipboard`, y botón "Marcar publicado" que
persiste en `localStorage` del celular del operador -- el almacén de
assets de Artifact no estaba disponible en la sesión, así que las 42
miniaturas van incrustadas como JPEG comprimido en base64, ~260KB en
total). Las 252 imágenes en resolución completa se mandaron aparte, en
7 tandas (una por día de publicación) vía archivo directo.

**Pendiente real, no resuelto esta ronda**: cómo automatizar la
publicación real a redes (el operador preguntó por conectar sus
cuentas) -- la Regla de Oro exige confirmación explícita en la sesión
antes de publicar contenido públicamente o tocar cuentas reales de
terceros, así que no se construyó nada de eso; falta definir con el
operador si el método sería un scheduler oficial (API) o automatización
de sesión no oficial antes de tocar código.


## Bloque: investigación de "fórmula viral" en 16 videos reales + pipeline de descarga (2026-09-07)

Pedido del operador: analizar creadores reales (primero 10 profesionales
de productos digitales, luego ampliado a faceless/LatAm/casos famosos
como Venta Silenciosa y 5-Minute Crafts) para encontrar patrones
estructurales replicables en Taller de Activos. Informe completo con la
fórmula adaptada entregado en el chat de esa sesión (no duplicado acá).

**Infraestructura nueva que quedó funcionando** (`.github/workflows/`):
- `descargar-referencia.yml` -- descarga reels de Instagram vía yt-dlp,
  extrae SOLO frames+cortes+metadata (nunca el video), matriz paralela
  de `{id,url}[]`. YouTube y TikTok quedaron confirmados como
  bloqueados a nivel de IP de datacenter para descarga de video
  (4 variantes de cliente probadas en YouTube, error explícito
  "Your IP address is blocked" en TikTok) -- Instagram es el único
  canal viable para bajar video real desde este runner. Requiere
  `yt-dlp[default,curl-cffi]` (impersonation) y selector de formato
  `bv*+ba/b` (no `best[height<=1080]`, que falla en Instagram sin login).
- `scrapear-post.yml` + `fabrica/research/scraper.py` -- Scrapling para
  meta tags públicos (bio, seguidores, likes, títulos de video) de
  posts/perfiles de Instagram y TikTok. Confirmado que SÍ funciona en
  perfiles de TikTok (dato real de @venta.silenciosa) aunque no pueda
  bajar el video. Confirmado que NO funciona en perfiles de Instagram
  sin login (sí en posts/reels individuales).
- `fabrica/research/referencias/<id>/` -- 16 casos reales guardados
  (frames + timestamps_cortes.txt + duracion.txt + info.json), nunca el
  video en sí.

Pendiente real: aplicar la fórmula documentada a guiones/render nuevos
para la tanda de contenido de la semana.


A diferencia de `fabrica/ESTADO_ACTUAL.md` (informe congelado de Ronda
4, marcado explícitamente como histórico), este documento se actualiza
después de cada bloque de trabajo real, como pide el "Prompt Maestro
3" (sección 28). Para el detalle técnico completo de cada ronda, ver
`MEJORAS_RONDA*.md`; para lo que necesita al operador,
`PENDIENTES_OPERADOR.md`; para todo lo pendiente técnico,
`PENDIENTES.md`; para el texto completo y el checklist punto-por-punto
del prompt "Capa de exploración agresiva" (para no perderlo de nuevo
en la memoria de la conversación), `docs/PROMPT_EXPLORACION_AGRESIVA.md`.

## Bloque: sacar `slot-machine` del catálogo (2026-09-05, feedback directo del operador)

El operador vio el resultado real (usado en `venta-06.mp4`/`venta-09.mp4`)
y lo pidió sacar por mala calidad visual. Removido de TODO lugar activo,
no solo `estado`:
- `remotion-spike/src/effects/SlotMachine.tsx` -- borrado (no archivado:
  a diferencia del orquestador de Fase 1, esto no tiene valor futuro
  como referencia, es simplemente un componente que no cumplió).
- `registro.json` -- entrada eliminada (55→54 componentes).
- `FabricaVideo.tsx`, `effects/index.ts`, `Root.tsx` (import, mapa de
  implementaciones, `efecto-slot-machine`) -- todas las referencias
  sacadas.
- `adaptadores.ts` -- el caso `'slot-machine'` de `propsParaCifra()` y
  su entrada en `COMPONENTES_CIFRA_SOPORTADOS` sacados (referencia
  colgando a un componente que ya no existe).

**Lo que se dejó a propósito sin tocar**: `generar_lote_ventas.ts`
(script histórico ya corrido, referencia `slot-machine` dos veces) y
`fabrica_bridge/venta_06.json`/`venta_09.json` (árboles de composición
ya renderizados) -- son registro histórico de lo que efectivamente se
generó, no código vivo. Consecuencia real y aceptada: si alguien
intenta volver a correr `generar_lote_ventas.ts` desde cero hoy, esas
dos escenas fallarían (`componenteId` inexistente) -- ese script ya
está superado por `renderizador_por_guion.ts` de todos modos.

Categoría `cifra` queda sin un efecto de "número único revelado estilo
tragamonedas" hasta que se construya una versión mejor (pendiente, si
se pide).

Verificado: `validar_registro.ts`, `tsc --noEmit` en `fabrica/` y
`remotion-spike/`, y la suite completa de tests de `fabrica/` -- todo
en verde después de la remoción completa.

## Bloque: carta técnica "efectos virales" (2026-09-05)

4 componentes nuevos pedidos por carta técnica externa (5 efectos
pedidos, 1 ya existía -- ver más abajo), integrados al catálogo real y
verificados con still real (no solo compilación):

- **`punch-in`** (texto): zoom digital 1.0→1.8x con sobregiro sobre UNA
  palabra/cifra ya en pantalla, mantiene y vuelve con rebote. Distinto
  de `punch` (agresivo/Punch.tsx), que es una SECUENCIA de frases
  entrando una tras otra -- mecánica distinta, ids distintos a
  propósito.
- **`split-screen`** (comparación): dos mitades verticales simultáneas
  antes/después con línea neón central, el lado "después" gana terreno
  con el tiempo. Distinto de `antes-despues` (cortina que revela una
  sola cara a la vez) -- mecánica visual distinta aunque el rol
  narrativo se superponga.
- **`kinetic-text`** (texto): hasta 3 líneas entran desde arriba a alta
  velocidad, chocan con rebote + glitch/chispa de impacto (chromatic
  aberration manual, sin libreria nueva), se congelan.
- **`tap-to-cut`** (montaje, no golpe): destello que se expande desde
  el centro y se desvanece -- mismo patrón que `pixel-burst` (escena
  autocontenida entre dos unidades). La carta lo pedía como componente
  `<TapToCut/>`; se documentó por qué NO es un `TipoGolpe` nuevo de
  `golpes.tsx` (son sistemas distintos: golpe = transición ENTRE
  escenas resuelta por el puente de render; esto es una escena propia).

**3 correcciones a la carta, aplicadas y documentadas en el código para
llevar de vuelta a la discusión**:
1. El 5to efecto pedido ("Contador Dinámico", slot-machine style) **ya
   existe** como `slot-machine` (agregado la ronda pasada) con props
   casi idénticas (`finalNumber`, `metalColor`). No se construyó un
   componente duplicado (`Counter`) -- eso hubiera repetido el mismo
   patrón de duplicación que la auditoría de esta misma ronda encontró
   en `generar_demo_11.ts`/`demo_12.ts`.
2. La carta pedía `@react-spring/three` para las animaciones de
   rebote. No se agregó -- esa librería no está en `package.json` de
   `remotion-spike` (sería LA dependencia no estándar que la carta
   misma pide evitar). Se usó una función `easeOutBack` de 4 líneas
   (mismo resultado visual: overshoot + settle), cero dependencias
   nuevas.
3. La carta pedía marcar los 4 componentes como `estado: "validado"`
   "ya que se van a usar en producción inmediatamente". Se dejaron
   como `"sin_validar"` (igual que TODOS los demás efectos nunca antes
   ejercitados en un video real) -- `validado` significa, en todo el
   resto del catálogo, "confirmado con un render de producción real",
   no "intención de uso". Cambiar ese significado solo para estos 4
   corrompería la señal que el propio scoring del Director Visual usa
   (aunque esté deprecado para producción, sigue siendo la fuente de
   verdad de qué está realmente probado). No tiene costo funcional:
   `renderizador_por_guion.ts` (el flujo de producción actual) no lee
   `estado` para nada.

Verificado con render de still real (`prueba-efectos-virales`, 6
frames en puntos clave de cada efecto) -- los 4 se ven como se
describieron, sin errores. `tsc --noEmit` limpio en `fabrica/` y
`remotion-spike/`, suite completa de tests de `fabrica/` en verde.

## Último bloque de trabajo: Orden de auditoría + reestructuración (2026-09-04, en curso)

Orden explícita del operador tras ver que el lote de 10 videos de venta
salió con calidad visual muy por debajo del benchmark R7-32
("demasiada locura" el guion, video "deteriorado"). Dos partes: (1)
auditar qué motores de la fábrica están conectados de verdad vs
aislados, y (2) declarar el Director Visual/scoring automático
DEPRECADO para producción (sin borrarlo) y construir un orquestador
script-driven donde el guionista elige el componente a mano.

**HECHO (real, testeado):**
- **Auditoría punto 1 (motores conectados vs aislados)**: confirmado
  con `grep` real sobre los 13 generadores de `fabrica/ejemplos/` --
  `DirectorEdicion`/`DirectorRetencion`/`correrCicloMejora` se usan en
  `generar_demo_05.ts` a `12.ts` (8 de 13), forced-alignment solo en
  `demo_10`. `generar_lote_ventas.ts` (el que produjo los 10 videos de
  venta) no usa NINGUNO de los cuatro -- causa real confirmada de la
  caída de calidad. Sales Engine, Research System, Carousel Engine,
  ecosistema_producto, Skill Intelligence, Decision Engine y el
  registro MCP: cero imports desde cualquier otro módulo, están
  totalmente aislados. Data Engine tiene un solo consumidor real
  (`orquestador/orquestador.ts`).
- **Auditoría punto 2 (obsoleto/duplicado)**: `generar_demo_11.ts` y
  `generar_demo_12.ts` son ~95% el mismo archivo (diff de imports/
  constantes only). De los 51 componentes de `registro.json`, 19 nunca
  se usaron en ningún `ArbolComposicion` real generado hasta hoy (7
  legacy + 12 de los 23 efectos nuevos de esta ronda) -- medido
  recorriendo los 24 JSON reales de `fabrica_bridge/`. Dos workflows
  (`pexels-automatico.yml`, `probar-render.yml`) no tienen corridas
  registradas en la API -- diagnóstico verificado, NO están rotos: su
  propio encabezado ya documenta que `workflow_dispatch` solo funciona
  una vez mergeado a `main` (misma limitación que obligó a disparar
  `render-lote-ventas.yml` por push a un centinela). No se tocaron.
- **Punto 4 ejecutado**: archivado (`git mv`, reversible) a
  `archivado/fase1-orquestador-original/` de `orchestrator.py`,
  `state/state.json`, `state/fabrica.json` y
  `.github/workflows/orquestador-diario.yml` -- los cuatro son,
  literalmente, el sistema de Fase 1 que `CLAUDE.md` ya declaraba
  congelado. Hallazgo no pedido pero real, encontrado en el camino:
  `orquestador-diario.yml` seguía CORRIENDO TODOS LOS DÍAS a las 9am,
  gastando uso real de Claude Code del operador contra
  `orchestrator.py status` -- su última corrida antes de este archivado
  falló. `producto/` (código real de "El Corte") no se tocó, por
  instrucción explícita de `CLAUDE.md`. TODOs/"por si acaso" huérfanos:
  se buscaron en toda `fabrica/`, no hay ninguno real (las coincidencias
  eran la palabra española "todo/todos" dentro de comentarios normales).
- **Nuevo orquestador `fabrica/composicion/renderizador_por_guion.ts`**:
  recibe `EscenaGuion[]` con `componenteId`/`props` explícitos (sin
  Director Visual/scoring), pero SÍ corre `DirectorEdicion` (+ curva de
  energía opcional), `DirectorAudio` (salvo `transicionSalida`
  explícito, que gana siempre), forced-alignment real vía
  `palabraClave` (nunca inventa un timestamp), y `DirectorRetencion`
  sobre el árbol completo -- exactamente las cuatro piezas que
  `generar_lote_ventas.ts` se saltó. Rechaza con error explícito un
  `componenteId` inexistente o un `transicionSalida.tipo` inventado
  (ej. confundir un golpe real con el id de un efecto visual como
  "pixel-burst"). Probado de punta a punta en
  `test_renderizador_por_guion.ts` con audio real ya grabado (9
  verificaciones + 2 casos de rechazo, todos en verde) y `tsc --noEmit`
  limpio sobre toda `fabrica/`.

**PENDIENTE de esta misma orden:**
- Puntos 3 (plan de conexión escrito) y 4 (archivar código muerto a
  `archivado/`, limpiar TODOs huérfanos) de la Parte 1 -- investigación
  ya hecha, informe y limpieza todavía no.
- Ejercitar `renderizador_por_guion.ts` en un guion real completo (no
  solo la prueba de humo de 2 escenas) para tener el primer video de
  producción con este orquestador nuevo.

## Último bloque de trabajo: R7-32 (2026-09-03) -- Benchmark audiovisual agresivo

Pedido explícito del operador: a diferencia de todas las rondas anteriores
("hacelo más agresivo"), esta vez entregó un brief de director completo
-- guion nuevo de 14 líneas exactas ("La IA no es el negocio"), dirección
visual escena por escena, curva de energía, dirección de transiciones y
de audio, regla de oro ("agresivo = contraste, no más efectos") -- y pidió
un render real, no otra ronda de documentación. Texto completo en
`docs/PROMPT_BENCHMARK_AGRESIVO.md`.

**HECHO (real, testeado, video renderizado y entregado):**
- **Guion nuevo + voz real**: 14 líneas exactas (sin cambiar ni una,
  sin estadísticas agregadas), voz Qwen3-TTS con la MISMA configuración
  de producción (voz clonada `librivox-11`, mismo instruct, mismo rate
  1.25 -- única variable de esta prueba es guion+dirección+edición, no
  el motor de voz, tal como pidió el operador). Generada vía
  `.github/workflows/generar-voz-demo-10.yml` (mismo patrón ya probado
  en rondas anteriores).
- **Forced-alignment real usado por primera vez en producción**:
  `fabrica/voz/alineacion.ts` (nuevo, envuelve el prototipo YA
  EXISTENTE de R6-2/P3-3) lee el resultado real de faster-whisper
  (corrido en GitHub Actions, bloqueado en este sandbox por política de
  red hacia Hugging Face) para anclar la jerarquía visual del hook
  ("LA IA" / "NO" / "TE VA A HACER GANAR PLATA") a la palabra real "no"
  medida en el audio (1.80s-2.16s) -- confirmado visualmente en frames
  extraídos del render.
- **Plan de dirección real, no interpretación libre**: 14 unidades (una
  por línea de guion) mapeadas explícitamente a categorías/componentes
  reales del catálogo según la intención de cada escena del brief (tabla
  completa en `docs/PROMPT_BENCHMARK_AGRESIVO.md`), sin inventar ningún
  componente nuevo ni ningún dato/número no narrado.
- **Curva de energía propia** (`CURVA_BENCHMARK_AGRESIVO`, nueva
  configuración en el MISMO `curva_energia.ts` de R7-31 -- conexión, no
  duplicación): un punto exacto por unidad (14 puntos, no 7-8 gruesos)
  para que unidades consecutivas con objetivos opuestos (hook muy_alta
  seguido de un valle deliberado) no se contaminen entre sí.
- **Video real generado y renderizado**: `fabrica-demo-10.mp4` (43.84s).
  QA duro y de composición 100% limpios (`ok: true`). **11 componentes
  distintos del catálogo usados en 14 unidades** (punch, silueta,
  rafaga, balanza, logos-herramientas, antes-despues, buscador, chat,
  notificaciones, diagrama, remate) -- contra los ~6 componentes que se
  repetían siempre en demos anteriores. Inspección visual real confirmó
  variedad de lenguaje visual genuina (b-roll+ráfaga para abundancia,
  balanza sin números para el frenazo, aro pulsante en antes-despues
  para el colapso, mockups de búsqueda/chat/notificaciones para la
  tríada, diagrama con iconos reales para la convergencia).
- **Hallazgo honesto real (documentado, no escondido)**: el mecanismo
  `cambia_encuadre` de R7-31 (pausas reales dentro de un clip) dio 0
  resultados esta ronda -- los clips de este guion son más cortos que
  los de demo_06 donde se validó la técnica, y `detectarPausaInterna()`
  no encontró ninguna pausa útil en la ventana [15%,85%]. Se documenta
  como límite real de la técnica con audio corto, no se fuerza un
  resultado falso.
- **Otro hallazgo honesto**: la unidad "desarrollo_2" (automatización)
  quedó clasificada como `dejar_respirar` (pausa) en vez de la
  "aceleración" que pedía el brief -- el componente ganador real
  (`logos-herramientas`) tiene intensidad intrínseca baja (0.35) y el
  clip es corto, y la anti-repetición cross-video penaliza a las
  alternativas de mayor intensidad (`ranking`/`lista-tachada`, ya
  usados en demo-08/09). El Rhythm Engine respeta esa clasificación
  (nunca fuerza energía sobre una pausa real, R7-31) -- se documenta la
  tensión real entre mi intención de dirección y la decisión honesta
  del sistema, en vez de forzar un componente peor solo para que
  coincida con el plan.
- **Comparación objetiva vs. fabrica-demo-09** (Crítico v2, con
  advertencia explícita de que la estructura es distinta -- 14 unidades
  cortas vs. 7 más largas, así que los conteos crudos no son 1:1):
  demo-10 usa **11 componentes distintos vs. 6** de demo-09/08, y su
  densidad visual **SÍ varía en el tiempo** (`densidad_visual_varia:
  true`) a diferencia de demo-09 (`false`, por el efecto colateral de
  memoria documentado en el bloque anterior). QA duro limpio en ambos,
  0 silencios/negros sospechosos en los dos.
- **Registrado con datos reales**: `memoria/laboratorio.json`
  (hipótesis `esperando_datos`) + `datos/datos.ts` (tercera entrada
  real, `qaResumen.ok=true`, `metricas: null`, nunca publicado).

**Suite completa verificada**: `npm run test-todo` (39/39 OK, incluye
tests nuevos de forced-alignment y de la comparación objetiva) + `tsc
--noEmit` limpio en `fabrica/` y `remotion-spike/`.

**PRÓXIMO PASO real, ya registrado**: si se repite este benchmark, usar
clips de audio más largos (o textos con más pausas naturales) para que
`cambia_encuadre` tenga con qué trabajar; y considerar un mecanismo que
permita a un director "reservar" intencionalmente un componente de baja
intensidad para una franja donde SÍ se quiere aceleración, sin pelear
contra la clasificación honesta de `decidirIntencion()`.

## Bloque anterior: R7-31 (2026-09-03) -- que la fábrica PIENSE la edición

Pedido explícito del operador: diagnóstico propio sobre `fabrica-demo-08`
(cambios estructurales fuertes solo en ~15.7s/21.7s/30.4s/34.3s, tramos
largos sin variación, edición dependiente de texto+timeline) + prohibición
explícita de "arreglarlo con más efectos" -- pidió arreglar el SISTEMA DE
DECISIÓN. Texto completo (24 secciones) en
`docs/PROMPT_DIRECCION_AUDIOVISUAL.md`, con tabla de estado sección por
sección y un hallazgo honesto documentado ahí (ver abajo).

**HECHO (real, testeado, ejercitado en video):**
- **Rhythm Engine real** (`directores/edicion/curva_energia.ts`, nuevo):
  curva de energía objetivo para todo el video (7 checkpoints
  hook→explicación→aceleración→micro-pausa→revelación→aceleración→cierre),
  conectada a `DirectorEdicion.planificar()`. Diseño deliberadamente
  limitado: solo empuja energía HACIA ARRIBA, nunca contradice una unidad
  de respiración real -- evita que una curva rígida pise contenido real.
  Efecto limpio confirmado en el video real: la unidad "impacto"
  (revelación/clímax) pasó de `alta` a `muy_alta` sin cambiar de
  componente, ahora el clímax se distingue energéticamente de las demás
  unidades (en demo-08 tenía la misma energía que hook/cierre).
- **Causa raíz real de los tramos estáticos, encontrada y corregida**:
  las unidades de un solo clip de audio (aceleración, pausa, desarrollo2)
  no tenían NINGÚN offset interno donde anclar un cambio visual -- por la
  regla dura del proyecto de nunca inventar timing no medido. Fix:
  `composicion/pausas.ts` (nuevo) detecta pausas de voz REALES con
  `ffmpeg silencedetect` (mismo mecanismo que ya usaba `checks_duros.py`,
  umbral distinto) y las usa para anclar un microevento `cambia_encuadre`
  real -- un tipo que existía en `tipos.ts` hace varias rondas pero nunca
  se emitía ni se consumía (hallazgo real de "implementado pero no
  usado"). Ejercitado en Remotion (`CambioEncuadre.tsx`, nuevo, wrapper
  genérico de scale-pulse anclado a un frame).
- **Crítico Audiovisual v2** (`qa/critico_v2_metricas.py`, nuevo): métricas
  objetivas MEDIDAS del árbol/render real (cantidad y timestamps de
  cambios estructurales, duración media/máxima de bloque visual, variedad
  de componentes/golpes, densidad visual en el tiempo, silencios/negros
  reales). Confirmó numéricamente el diagnóstico del operador sobre
  demo-08 antes de tocar código, y sirvió para la comparación real.
- **Video real de prueba generado y renderizado**: `fabrica-demo-09.mp4`
  (38.38s), mismo guion/voz/preset `financiero_directo` que demo-08 (A/B
  real, única variable nueva: las dos de arriba). QA duro y de
  composición 100% limpios (`ok: true`). Entregado al operador.
- **Comparación objetiva real demo-08 vs demo-09** (Crítico v2):
  cantidad de eventos de cambio 12→14 (+2, exactamente los dos
  `cambia_encuadre` nuevos, anclados a pausas reales a los 17.79s y
  32.91s); duración media de bloque visual 3.32s→2.81s (menos tramos
  largos sin variación); duración máxima de bloque sin cambio: sin
  cambios (5.82s en ambos) -- la unidad "pausa" no tenía ninguna pausa
  de voz útil detectada dentro de la ventana real, así que honestamente
  no se le agregó ningún cambio inventado. Confirmado visualmente con
  frames extraídos del render (el pulso de escala es visible en el
  frame exacto de la pausa detectada).
- **Hallazgo honesto (no atribuido de más)**: la comparación reveló que
  la unidad "pausa" y "desarrollo2" cambiaron de COMPONENTE entre
  demo-08 y demo-09 (`silueta`→`tres-verdades`,
  `lista-tachada`→`ranking`) -- esto NO es efecto del Rhythm Engine ni
  de `cambia_encuadre`, es la memoria anti-repetición cross-video ya
  existente (`componentesUsadosRecientes(5)`, R6-5) penalizando
  componentes que demo-08 ya había usado y registrado en
  `memoria/historial_componentes.json`. Efecto secundario real: la
  intención de "pausa" pasó de `dejar_respirar` a `construir_tension`, y
  ESO -- no la curva -- redujo la variación de densidad visual en ese
  punto. Se documenta como un límite real del método de comparación A/B
  con memoria persistente entre videos consecutivos, no como una mejora
  falsa ni como un bug urgente.
- **Registro real**: `memoria/laboratorio.json` (hipótesis
  `esperando_datos`, sin resultado inventado) + `datos/datos.ts`
  (segunda entrada real, `qaResumen.ok=true`, `metricas: null` porque
  nunca se publicó).

**NO abordado esta ronda (presupuesto de tiempo, documentado sin
maquillar en `docs/PROMPT_DIRECCION_AUDIOVISUAL.md`)**: Hook Engine v2,
biblioteca de lenguaje visual de negocios (dinero/ventas/etc.), familias
de transición nuevas más allá de los `TipoGolpe` existentes, Payoff
Engine, CTA integrado a la narrativa, Anti-Predictability Engine
extendido más allá de componentId/golpe/patrón de retención.

**Suite completa verificada**: `npm run test-todo` (38/38 OK, incluye
un nuevo test de comparación objetiva demo-08 vs demo-09) + `tsc
--noEmit` limpio en `fabrica/` y `remotion-spike/`.

**PRÓXIMO PASO real, ya registrado**: si se genera un demo-10, resetear
o filtrar `historial_componentes.json` para ese experimento puntual (o
comparar solo escenas con el mismo componente) para que el A/B vuelva a
ser de una sola variable limpia; después, Hook Engine v2 o Anti-
Predictability Engine extendido son los candidatos más directos según
la propia lista de pendientes de esta ronda.

## Bloque anterior: R7-30 (2026-09-03) -- Orquestador real + video real generado

Pedido explícito del operador: "no más piezas sueltas, construí una
máquina" -- Orquestador real que conecte todo el pipeline y termine en
un video real, con cada decisión registrada. Texto completo en
`docs/PROMPT_MAQUINA_CONECTADA.md`.

**HECHO:**
- **Orquestador** (`fabrica/orquestador/orquestador.ts`): corre QA real
  (`checks_duros.py` + `checks_composicion.py`) sobre un render real y
  arma un `RegistroVideoCompleto` con log de decisiones explícito.
- **Video real generado**: `fabrica-demo-08.mp4` (38.32s) -- mismo
  guion/voz que demo_07 (A/B real), única variable nueva: preset de
  estilo `financiero_directo` (R7-29) aplicado por primera vez por un
  generador real. QA real 100% limpio, inspección visual real
  confirmó texto legible y el efecto de revelación disparando bien.
  Entregado al operador.
- **Bloqueo real resuelto**: Remotion intentó descargar su propio
  Chromium (bloqueado, mismo dominio `remotion.media` ya conocido) --
  se resolvió apuntando `--browser-executable` al binario de
  Playwright ya preinstalado en el entorno (`/opt/pw-browsers/`), $0,
  sin depender de nada bloqueado.
- **Hallazgo real de proceso**: `fabrica/datos/datos.ts` es código TS
  literal (no un archivo JSON respaldado como `memoria/laboratorio.json`)
  -- la primera entrada real (`fabrica-demo-08`, con `qaResumen` real)
  se agregó a mano, mismo patrón que `ecosistema_producto/datos.ts`.
- **Hallazgo real sobre `configuracion.ts`**: al usarlo por primera vez
  en un generador real, se confirmó que `decidirEstilos()` combina
  (une) los estilos del preset con los de la intención narrativa, no
  los reemplaza -- documentado tal cual salió, no maquillado.

**Suite completa verificada**: `npm run test-todo` (35/35 OK) + `tsc
--noEmit` limpio en `fabrica/` y `remotion-spike/`.

**PRÓXIMO PASO real, ya registrado**: anti-repetición perceptual por
familias (sección 11 del prompt, no abordada esta ronda) y generalizar
el Orquestador a un comando único parametrizable ("crear video sobre
X") en vez de un script por guion.

## Bloque anterior: R7-29 (2026-09-03) -- Ronda de evolución real (sistema operativo de contenido)

Pedido explícito del operador: prompt nuevo de 20 fases, esta vez
pidiendo explícitamente IMPLEMENTAR conexiones reales entre sistemas
ya existentes (no solo investigar/documentar) -- "prefiero 5 sistemas
realmente conectados antes que 30 carpetas decorativas". Texto completo
guardado en `docs/PROMPT_EVOLUCION_SISTEMA_OPERATIVO.md`.

**HECHO:**
- **Fase 0 (auditoría + mapa de madurez)**: `docs/MAPA_MADUREZ_SISTEMA.md`
  -- 18 sistemas evaluados con evidencia de código real. Corrección
  importante: `checks_duros.py` YA mide cosas reales del render
  (ffprobe/ffmpeg), no es cierto que el QA "solo valide JSON". Confirmado
  que Carousel Engine + Product Ecosystem ya cierran el ciclo Knowledge
  → Contenido de punta a punta (artefacto real `carrusel_001`).
- **Fase 1 (conectar el ciclo)**: identificado un eslabón real roto
  (QA → Measurement) y conectado -- `datos/tipos.ts` agrega `qaResumen`
  a `RegistroVideoCompleto`, `datos/consultar.ts` agrega
  `videosConProblemasDeQa()`.
- **Fase 13 (configuración de estilo)**: `directores/edicion/configuracion.ts`
  -- 5 presets reutilizables a nivel de video (`ventas_agresivo`,
  `documental_serio`, `financiero_directo`, `misterio_revelacion`,
  `educativo_calmo`), auditado primero que no duplicaba nada existente.
- **Fase 14 (QA real de contraste)**: `fabrica/qa/contraste.py` --
  fórmula oficial WCAG 2.x, sin dependencias nuevas. Hallazgo real
  verificado: `texto` sobre `acento` (paleta de marca) = 3.05:1, NO
  cumple el mínimo de texto normal (4.5:1) -- confirmado que ningún
  componente actual usa esa combinación mal (ya usan un color oscuro
  propio en su lugar).
- **Fase 15 (autocrítica)** y **Fase 19 (informe final)**: hechas,
  con honestidad explícita sobre qué se implementó vs. qué quedó
  evaluado sin ampliar vs. qué no se abordó (Fase 8, video analysis).

**Suite completa verificada en cada paso**: `npm run test-todo` (34/34
OK) + `npx tsc --noEmit` limpio en `fabrica/` y `remotion-spike/`.

**BLOQUEADO -- NO CONFIRMADO (sin cambios, ya documentados antes):**
mismos bloqueos reales de siempre (YouTube API key, Hotmart
credenciales, Jamendo client ID) -- ninguno nuevo esta ronda.

**PRÓXIMO PASO real, ya registrado**: de las fases no abordadas, la
más concreta es la Fase 8 (pipeline de análisis de video vía GitHub
Actions) -- requiere diseño nuevo, no se llegó por presupuesto de
tiempo de esta ronda. De las fases evaluadas sin ampliar, la de mayor
impacto de negocio sigue siendo la misma que ya está en el Decision
Engine: conseguir datos reales del operador para el Sales Engine.

## Bloque anterior: R7-28 (2026-09-03) -- los 6 puntos pendientes del prompt, cerrados

Pedido explícito del operador: terminar los 6 puntos del prompt de
exploración agresiva que habían quedado con hueco real (17, 10, 11, 5,
4, 15), con investigación exhaustiva y sin bloquearse -- ANTES de irse
a dormir, esperando un resultado positivo a la vuelta. Instrucción de
proceso importante a mitad de ronda: NO paralelizar con varios agentes
de investigación a la vez (el operador lo pidió explícitamente al ver
4 agentes lanzados en simultáneo) -- se rehizo todo el bloque punto por
punto, en serie, cada uno investigado y cerrado antes de pasar al
siguiente.

**HECHO (los 6 puntos, en orden de cierre):**
- **Punto 17 (auditoría de techos)**: `docs/AUDITORIA_TECHOS_FABRICA.md`
  -- hallazgo raíz con evidencia de código real: toda la fábrica es
  heurística declarada (tablas fijas, umbrales mágicos en los 4
  Directores), y el sistema de aprendizaje real (`memoria/laboratorio.json`)
  tiene sus 10 hipótesis en `estado="esperando_datos"` -- cero feedback
  real cerró el loop todavía porque no hubo publicación/venta real. Más
  7 techos específicos citando líneas de código concretas.
- **Punto 10 (técnicas sin herramienta)**: 6 entradas nuevas al
  Knowledge Engine con fuentes reales -- contraste WCAG (única marcada
  `evidencia`, estándar oficial W3C), tipografía en video vertical,
  pacing/duración de plano (con respaldo de un estudio peer-reviewed de
  eye-tracking), silencio como énfasis, capas/parallax, edición por
  nicho financiero.
- **Punto 11 (referencias reales)**: 3 entradas nuevas, con la
  limitación real del sandbox declarada explícitamente (TikTok/YouTube/
  Instagram bloqueados, no se pudo transcribir un video real) --
  identidad visual de Cleo Abram (entrevista directa, no analizada por
  terceros), estructura "Hook-Error-Solución" de nicho financiero,
  ventana de atención de texto animado.
- **Punto 5 (MCP restantes)**: 4 MCP nuevos verificados con WebFetch
  directo a cada README real -- GoogleTrendsMCP (único de 3 candidatos
  de Trends genuinamente $0, los otros 2 dependen de una API paga),
  Reddit Research MCP (el más limpio de toda la exploración: sin
  cuenta, sin clave, sin límite), Zapier MCP (esperar autorización NO
  por costo sino porque ejecuta acciones reales en apps de terceros),
  **API oficial de Hotmart** (hallazgo de alto valor: es la pieza que
  le falta al Sales Engine, hoy vacío).
- **Punto 4 (skills restantes)**: hallazgo clave -- gran parte de
  "marketing/ventas/productos digitales" ya estaba resuelta sin buscar
  nada (esta cuenta de Claude Code ya tiene copywriting/cro/
  customer-research/offers/pricing/product-marketing/marketing-plan/
  launch/lead-magnets/marketing-psychology habilitadas). Sumadas 4
  skills externas reales (storytelling-skills, claude-youtube,
  tiktok-skills sin Publora, claude-shorts como referencia).
- **Punto 15 (priorización P0-P3)**: `docs/PRIORIZACION_P0_P3.md` --
  17 ítems priorizados + lista concreta de qué implementar YA con $0.

**Corrección de proceso permanente**: creado `docs/PROMPT_EXPLORACION_AGRESIVA.md`
con el texto COMPLETO del prompt de 31 puntos + checklist de estado por
punto -- el operador señaló que el prompt se venía perdiendo entre
compactaciones de la conversación (el resumen automático solo guarda un
parafraseo, no el texto literal). Este archivo vive en el repo, no en
la memoria del chat, y se actualiza incrementalmente.

Suite completa verificada antes de cerrar: `npm run test-todo` (32/32
OK) + `npx tsc --noEmit` limpio en `fabrica/` y `remotion-spike/`.

**PRÓXIMO PASO real, ya registrado**: de la lista P0 de
`PRIORIZACION_P0_P3.md`, el más concreto para código real (no solo
investigación) es el QA de contraste/legibilidad sobre frames
renderizados (motivado por el hallazgo #7 de la auditoría de techos) --
implementable con $0, sin depender de ninguna decisión del operador.

## Bloque anterior: R7-27 (2026-09-03) -- cierre de la capa de exploración agresiva

Pedido del operador: terminar TODOS los puntos del prompt "CAPA DE
EXPLORACIÓN AGRESIVA DE SKILLS, REMOTION, MCP Y ARSENAL AUDIOVISUAL"
(31 secciones) -- este bloque cierra los puntos que quedaban abiertos
de R7-22 a R7-26 (sección 5 del prompt: MCP de investigación de
contenido; sección 15: Decision Engine; sección 22: informe final
formato A-P).

**HECHO:**
- **Sección 5 (MCP de contenido real)**: investigados 2 candidatos
  nuevos con el mismo rigor que los ya registrados (fuente citada,
  costo/límites/riesgo reales, no supuestos):
  - **SocialCrawl MCP** (`socialcrawl.dev`) -- 42-48 plataformas, 381
    endpoints, 3 de 4 tools funcionan SIN api key (documentación/lista
    de endpoints local). Confirmado vía su propia página de pricing:
    100 créditos gratis, **sin tarjeta, sin vencimiento, sin
    conversión automática a plan pago** -- el perfil de riesgo más
    bajo de todos los MCP evaluados hasta ahora. Decisión: `probar`.
  - **Trend Intel (actor sobre Apify)** -- $5 USD/mes de crédito
    gratis sin tarjeta, pero facturado en "compute units" (no en
    requests simples como SocialCrawl), más difícil de predecir el
    rendimiento real del crédito gratis. Decisión:
    `esperar_autorizacion_operador` (no por costo confirmado, sino por
    la ambigüedad real de cuánto rinde el crédito gratis).
  - Ambos registrados en `fabrica/mcp/registro.ts` con el mismo
    template que `vidiq`/`trends-mcp` -- `test_mcp.ts` sigue pasando
    sin cambios (el registro es genérico).
- **Sección 15 (Decision Engine)**: agregada una decisión real y
  abierta -- "¿conectar el beat-sync (BPM medido en R7-26) al timing
  de golpes de `directores/audio.ts` ya mismo, o esperar un video de
  prueba dedicado?" -- comparando ambas opciones con ventajas/riesgos
  reales (incluye la limitación conocida del BPM automático). Recomendación:
  esperar un A/B real antes de tocar un sistema de producción que ya
  funciona, mismo patrón que la decisión de Ronda 6 sobre
  `@remotion/transitions`.
- Suite completa verificada antes de cerrar: `npm run test-todo`
  (32/32 suites OK) + `npx tsc --noEmit` limpio en `fabrica/` y en
  `remotion-spike/`.
- Entregado al operador el informe final formato A-P (sección 22 del
  prompt) resumiendo todo el arco R7-22 a R7-27 -- ver el mensaje de
  cierre de esta sesión (no se duplica el contenido acá para no
  desincronizar; este ESTADO.md es el resumen técnico operativo).

**BLOQUEADO -- NO CONFIRMADO (ninguno nuevo, ya documentados antes):**
YouTube Data API sigue esperando `YOUTUBE_API_KEY` del operador
(R7-20); `vidiq`/Apify Trend Intel siguen esperando autorización de
cuenta/costo; Jamendo sigue esperando `JAMENDO_CLIENT_ID`.

**PRÓXIMO PASO real, ya registrado**: el más claro y de más impacto de
negocio (no técnico) sigue siendo el de la decisión "prioridad-post-
ronda-7" ya registrada: conseguir del operador la info real de
audiencia/oferta para el Sales Engine. En paralelo, técnicamente, el
candidato más concreto es generar el video de prueba dedicado
(demo_08) que compare timing de golpes con/sin grilla de BPM antes de
integrar beat-sync a producción.

## Bloque anterior: R7-26 (2026-09-03)

Pedido del operador: seguir profundizando la exploración agresiva
(skills de Claude Code + MCP), tomándose el tiempo necesario.

**HECHO:**
- Investigados 4 repos reales nuevos vía WebSearch + lectura directa
  de README/LICENSE (`raw.githubusercontent.com`):
  - **`iart-ai/motion-design-skills`** (MIT) -- **PROBAR/INTEGRADO
    parcialmente**: se instaló de verdad la skill `beat-sync-editing`
    en `.claude/skills/` (ya activa, visible en el listado de skills
    de esta sesión). Trae una técnica real y accionable: cortar en la
    grilla del BPM (`framesPerBeat = (60/BPM)*fps`) -- justo lo que le
    faltaba a `directores/audio.ts`.
  - **`haidrrrry/claude-remotion-skill`** (MIT) -- DESCARTADO: su regla
    principal (loop render->inspeccionar->corregir) ya es exactamente
    la disciplina que esta fábrica sigue desde Ronda 2, sin aporte
    nuevo real.
  - **`Vincentwei1021/video-shotcraft`** (Apache-2.0, libre) y
    **`video-talkcraft`** (**PolyForm Noncommercial -- prohíbe uso
    comercial**, DESCARTADO para código, esta fábrica es 100%
    comercial) -- el segundo, aunque no usable, corrobora
    independientemente que forced-alignment de 20-40ms (lo mismo que
    ya midió nuestro propio prototipo P3-3) es el estándar real de la
    industria para sincronizar movimiento a la voz.
- **Postura resolutiva real**: se instaló `librosa` (`pip install`,
  MIT/BSD, $0 -- PyPI SÍ es alcanzable desde este sandbox, canal nuevo
  confirmado) y se midió el **BPM real** de los 9 tracks de
  `musica/biblioteca.json` (antes en `null`) con detección de tempo
  estándar (`medir_bpm.py`, reproducible, no un número tipeado a
  mano). Limitación real documentada: el método puede confundir el
  doble/mitad del tempo real (`aceleracion-planificando` dio 178.2
  BPM, plausible pero no verificado de oído).

**PRÓXIMO PASO real, ya registrado**: conectar el BPM real recién
medido con la técnica de `beat-sync-editing` -- ajustar el timing de
los golpes de `directores/audio.ts` a la grilla de beats del track de
`musicaFondo` elegido. No implementado todavía (necesita un video de
prueba dedicado para validar que se sienta bien, no solo que compile).

## Bloque anterior: R7-25 (2026-09-03)

Pedido explícito del operador: seguir paso a paso la "capa de
exploración agresiva" (skills/Remotion/MCP/arsenal audiovisual),
segunda pasada más profunda que R7-18.

**HECHO:**
- `registry.npmjs.org` devuelve **71 paquetes oficiales `@remotion/*`**
  (antes solo se habían evaluado 32) -- se investigaron todos los
  nuevos: `noise`, `starburst`, `rounded-text-box`, `gsap`, `maptiler`,
  `rive`, `lottie`, `skia`, `canvas`, `timeline-utils`,
  `animated-emoji`, `light-leaks`, `media`.
- **Integrado a producción**: `CamaraOrganica.tsx` (`@remotion/noise`,
  MIT, cero dependencias) -- temblor de cámara orgánico y sutil para
  momentos de máxima energía, técnica nunca antes investigada
  ("cámaras" era un hueco explícito del prompt). Verificado con una
  resta real entre 2 frames del video renderizado (9.16% de píxeles
  cambiaron), no solo supuesto.
- **Probado y confirmado con render real, sin forzar integración sin
  necesidad concreta**: `@remotion/rounded-text-box` (cajas de texto
  TikTok-style) y `@remotion/gsap` (timelines complejos, licencia
  gratis confirmada desde 2024) -- ambos funcionan, ninguno reemplaza
  algo que ya funciona bien hoy.
- **Hallazgo real de "no duplicar"**: `@remotion/starburst` y
  `@remotion/light-leaks` son paquetes standalone DEPRECADOS -- su
  propio código fuente redirige a `@remotion/effects`, que ya
  tenemos. Se confirmó instalándolos y leyendo el código, no
  asumiendo por el nombre.
- `fabrica/docs/ARSENAL_AUDIOVISUAL.md` actualizado con 7 capacidades
  nuevas documentadas (cámara, texto redondeado, timelines, mapas,
  Rive/Lottie, motor gráfico Skia, emojis animados) con el criterio
  INTEGRAR/PROBAR/REFERENCIA/DESCARTAR/BLOQUEADO pedido.
- **Segundo efecto real integrado a producción**: `PulsoRevelacion.tsx`
  (`@remotion/effects/rings`) -- un pulso expansivo tipo onda de radar
  en el momento exacto de `intencion='revelar'` (ya calculado por el
  Director de Edición). Probado en `fabrica-demo-07`, confirmado
  visualmente, QA duro 100% limpio.
- **Hallazgo arquitectónico real** (probando `shine`, comparado contra
  `rings`/`vignette`): los 66 efectos de `@remotion/effects` se
  dividen en GENERATIVOS (dibujan su propio contenido, sirven como
  overlay universal -- vignette/lightLeak/rings, confirmados) y
  MODULADORES (necesitan píxeles reales debajo para transformarlos --
  chromaticAberration/glow/scanlines/shine, confirmado que `shine`
  sobre transparente no produce ningún cambio, 8 frames idénticos).
  Usar los moduladores exigiría tocar cada componente de contenido
  para exponer un prop `effects` -- cambio de arquitectura mayor, no
  se hace sin necesidad concreta.

**BLOQUEADO/NO CONFIRMADO:** mapas (`@remotion/maptiler`, necesita
cuenta de MapTiler Cloud); Rive/Lottie (necesitan un archivo de
animación real que no tenemos, fabricar uno sintético no demuestra
nada útil); Skia (dependencia pesada, WASM no probado en este sandbox,
sin necesidad concreta que lo justifique).

**PRÓXIMO PASO:** de los 66 efectos reales de `@remotion/effects`
confirmados, siguen sin evaluar ~58 (glitch/scanlines/zoom-blur/
halftone son candidatos reales para momentos de "impacto"/
"contradicción"). El techo de fondo sigue siendo el mismo: sin datos
reales de resultado, todo esto es capacidad técnica probada, no
verificada contra retención/ventas reales.

## Bloque anterior: R7-24 (2026-09-03)

Pedido del operador: agotar la solución para la investigación de
patrones antes de seguir, y después avanzar en los puntos visuales/
gráficos del prompt.

**Investigación (postura resolutiva, exhaustiva antes de reportar
bloqueado):**
- Se probó `WebFetch` (canal de red separado del proxy del sandbox,
  usado ya con éxito para `WebSearch`) directo contra YouTube -- **sí
  está bloqueado igual que el resto** (`EGRESS_BLOCKED`). Se probaron
  además 6 espejos/alternativas sin cuenta (Invidious, Piped,
  noembed.com, returnyoutubedislike.com) -- las 6 bloqueadas.
- Se confirmó con una llamada real (no supuesta) que `googleapis.com`
  **no está bloqueado por la red** -- el error real es de Google
  ("Method doesn't allow unregistered callers"), un tema de
  credencial, no de acceso. Confirma que R7-20 (cliente de YouTube
  Data API) funcionaría apenas haya una API key -- no hay ningún
  problema técnico de por medio, solo falta la clave del operador.
  **No se buscó ni se usó ninguna clave ajena/compartida** -- usar una
  credencial que no es del operador está fuera de lo que este proyecto
  hace, sea o no "gratis" encontrarla.
- Con eso genuinamente agotado, se sumó investigación cualitativa real
  vía `WebSearch` (que sí funciona): un caso real con nombre y cifra
  concreta (C.M. de la Vega, $13.322,71 en 7 días vendiendo un curso)
  agregado al Knowledge Engine con nivel de confianza bajo y
  limitaciones explícitas (un solo caso, no verificado, no se sabe qué
  video/formato usó).

**Visual/gráfico:**
- **`vignette` (@remotion/effects) conectado a producción de verdad**
  -- ya se había probado y confirmado en R6-9 pero nunca se conectó a
  ninguna escena real. Ahora se dispara automáticamente cuando la
  unidad tiene el estilo `cinematico` (que el Director de Edición YA
  calculaba). Probado en `fabrica-demo-07`, confirmado visualmente en
  2 frames reales.
- **`@remotion/sfx` probado e instalado real** (versión exacta
  alineada, sin conflicto de dependencias) -- descartado con evidencia
  real, no solo por el bloqueo de este sandbox: cada sonido es una URL
  remota a `remotion.media`, una dependencia de red en cada render que
  nuestra biblioteca propia (`assets/sfx/`, archivos locales) no
  necesita. Desinstalado limpio tras confirmar el hallazgo.

**PRÓXIMO PASO:** con el patrón "resultado primero" (R7-23) y la
viñeta (R7-24) ya conectados a producción, quedan ~58 efectos del
catálogo de `@remotion/effects` sin evaluar individualmente
(glitch/chromatic aberration ya probados aislados en R6-7, nunca
conectados). El techo de fondo sigue siendo el mismo de siempre: sin
datos reales de resultado, todo esto es teoría bien fundada aplicada,
no verificada contra retención/ventas reales.

## Bloque anterior: R7-23 (2026-09-03)

Pedido explícito del operador: priorizar la investigación para
detectar patrones virales, y que el sistema los use automáticamente
("que detecte patrones... y luego haga todo").

**HECHO:**
- Verificado (de nuevo, con curl real, no de memoria) que TikTok,
  Social Blade, Google Trends, Exploding Topics y vidIQ siguen
  bloqueados desde este sandbox -- los datos REALES de vistas/
  engagement de contenido real siguen dependiendo de que el operador
  consiga la clave gratis de YouTube Data API (R7-20, ya lista) o
  habilite vidIQ. Registrado explícitamente en
  `research/investigacion_necesaria.ts` como bloqueo real, no
  abandonado.
- Mientras tanto, investigación SÍ posible con `WebSearch`: 3 patrones
  cualitativos que convergen en múltiples fuentes independientes de
  2026 se agregaron al Knowledge Engine (`conocimiento/base.ts`,
  items 15-17) -- "resultado primero" (abrir con el desenlace),
  "especificidad numérica" (formaliza algo que la fábrica ya hacía
  intuitivamente), y una tensión real sin resolver (crudo vs.
  producido). Las cifras puntuales sin fuente primaria verificable
  (ej. "1.3 segundos", "34.635 clips", "+138% conversión") se
  descartaron explícitamente, mismo criterio que Ronda 7 original.
- **"Resultado primero" agregado como patrón nuevo real a
  `hooks/catalogo.ts`** -- no quedó solo documentado: se verificó que
  el Director de Edición ya puede elegirlo de verdad (probado forzando
  la elección, evitando los otros 4 patrones de apertura) sin cablear
  nada más, gracias a que R7-15 ya conecta el catálogo completo a la
  elección automática.
- **Bug de cobertura real encontrado y arreglado**: 13 archivos de
  test de Ronda 7 (`hooks/`, `conocimiento/`, `research/`, `skills/`,
  `ventas/`, `carrusel/`, `datos/`, `decision_engine/`,
  `ecosistema_producto/`, `mcp/`, `directores/edicion/test_tecnicas.ts`)
  nunca se habían agregado a `package.json`/`test-todo` -- corrían
  bien sueltos pero jamás como parte de la batería estándar. Ahora
  `npm run test-todo` corre las 32 suites reales del proyecto, no 19.

**PRÓXIMO PASO:** con el patrón nuevo ya disponible, ejercitarlo en un
video real (mismo patrón que R7-21) cuando se genere el próximo demo.
El techo de fondo sigue siendo el mismo: sin la clave de YouTube o
vidIQ, no hay forma de saber si estos patrones correlacionan con
retención/ventas reales -- son teoría bien fundada, no datos propios.

## Bloque anterior: R7-22 (2026-09-03)

Tras archivar "El Corte" (Fase 1 original, decisión del operador) y
confirmar que `fabrica/` pasa a ser la prioridad explícita del
proyecto (ver CLAUDE.md), se siguió con el segundo hallazgo más
importante de la auditoría de puntos débiles (R7-19): música de fondo
en `null` desde Ronda 1.

**HECHO:**
- `fabrica/musica/biblioteca.json` poblado con 9 tracks reales CC0 1.0
  Universal (repo público `effacestudios/Royalty-Free-Music-Pack`,
  clonado con `git clone` -- canal de red confirmado funcional en este
  sandbox -- y licencia verificada leyendo el `LICENSE` real del repo,
  no solo la descripción). Postura resolutiva real: la vía "oficial"
  (GitHub Actions + Jamendo/FMA, ya preparada desde antes) había
  fallado (FMA cambió de API, Jamendo pide una key que el operador no
  configuró) -- en vez de reportar bloqueado, se buscó y verificó una
  alternativa real con las herramientas disponibles en esta sesión.
  Metadata de mood/intensidad marcada honestamente como "primer pase"
  (inferido de nombre + volumen real medido con ffmpeg, no de
  escuchar el track completo) -- mismo patrón que ya se usa para voz.
- `directores/audio.ts`: `intensidadMusicaPromedio()` nuevo (escala
  separada de `VOLUMEN_POR_NIVEL`, que es para SFX). `composicion/tipos.ts`:
  campo `musicaFondo` nuevo en `ArbolComposicion`.
- `fabrica-demo-07` generado: MISMO guion/voz/edición que
  `fabrica-demo-06` (experimento A/B real, única variable: música) --
  render completo, QA duro 100% limpio, y evidencia cuantitativa real
  de que la música se escucha en los huecos de silencio (-42.6dB)
  sin competir con la narración (volumen medio del video casi
  idéntico a demo_06: -17.1dB vs -17.2dB).
- `remotion-spike/src/fabrica_bridge/FabricaVideo.tsx`: `<Audio>` de
  fondo nuevo, fuera del `TransitionSeries`, volumen fijo 0.12.

**LIMITACIÓN REAL, no resuelta (documentada en ARQUITECTURA.md):** sin
loop de audio (se corta si un video supera la duración del track,
~90-100s) y sin ducking dinámico (volumen fijo, no baja solo durante
la narración) -- suficiente para los videos cortos de hoy, no para un
formato más largo.

**PRÓXIMO PASO:** con retención (R7-15) y música ya probadas en video
real, el techo que queda es siempre el mismo: cero dato de resultado
real (nada publicado todavía). Candidatos incrementales: probar más
efectos de `@remotion/effects` (solo se usó 1 de ~60), o resolver el
bug recurrente de props por categoría de raíz.

## Bloque anterior: R7-21 (2026-09-03)

Pedido del operador: buscar una solución 100% gratis para investigación
de contenido, y seguir con la línea de "exploración agresiva" -- se
priorizó cerrar el hallazgo más grande de la auditoría R7-19 (ver
`ARQUITECTURA.md` > PUNTOS DÉBILES): R7-15 nunca se había ejercitado en
un video real.

**HECHO:**
- `fabrica-demo-06` (7 unidades) regenerado con
  `directorEdicion.planificar(ctx, golpe, evitarPatrones)` real (antes
  el generador no pasaba el 3er parámetro) -- anti-repetición de
  patrones de retención confirmada con datos reales: 7 patrones
  distintos, uno por unidad, mapa coherente
  (hook->desarrollo->escalada(climax)->pausa->revelacion->escalada->cierre).
- Render completo real (1150/1150 frames, 38.4s) + QA duro 100% limpio
  (`problemas: []`, `alertas: []`) + 3 frames extraídos e inspeccionados
  visualmente (hook, Torre3D a los 18s, cierre) -- confirmados
  correctos.
- Bug real encontrado y arreglado en el camino (postura resolutiva,
  no estaba planeado): `Torre3D` (R6-10) nunca tenía caso en
  `propsParaCifra()` -- se agregó, con test dedicado.
- Video registrado en memoria (`--confirmar`, primera vez que
  `patronesRetencionUsadosEnEsteVideo` se persiste de verdad en
  `patrones_usados.json` desde un video completo, no un test).
- Detalle completo de R7-20 (cliente real de YouTube Data API v3,
  confirmado 100% gratis sin tarjeta ni tope de pago, sin necesidad de
  vidIQ/Gemini) en el bloque siguiente.

**PRÓXIMO PASO:** con R7-15 ya probado en video real, el techo más
grande que queda es el de siempre: cero dato de resultado real
(ninguna publicación todavía). El resto son mejoras incrementales
(probar más efectos de `@remotion/effects`, música de fondo real).

## Bloque anterior: R7-20 (2026-09-03)

**HECHO:**
- `fabrica/research/youtube_api.ts` -- cliente real de YouTube Data
  API v3 (`buscarVideos`, `estadisticasDeVideos`), confirmado con
  `WebSearch` (múltiples fuentes 2026) que es 100% gratis: no pide
  tarjeta para generar la key, y a diferencia de vidIQ/Gemini NO EXISTE
  un tier pago -- solo un formulario gratis para pedir más cuota.
  Reemplaza la ambigüedad de costo de vidIQ/Gemini con una opción de
  costo cero verificado.
- Tests con `fetch` mockeado, fixtures iguales a la forma real
  documentada de la API.
- Guía de 5 pasos para que el operador saque su key gratis, agregada a
  `PENDIENTES_OPERADOR.md`.

**BLOQUEADO (requiere al operador):** la key de YouTube Data API v3
(`FABRICA_YOUTUBE_API_KEY`) -- el cliente nunca inventa datos si falta,
tira error explícito.

## Bloque anterior: R7-19 (2026-09-03)

El operador señaló (correctamente) que la investigación venía siendo
demasiado literal: se reportaba "bloqueado" ante el primer `WebFetch`
fallido en vez de buscar rutas alternativas, y no se había ido a
buscar el universo amplio de skills/comunidades que el operador pedía
explícitamente investigar.

**HECHO:**
- Confirmado con pruebas reales que este sandbox usa una lista
  BLANCA de dominios (ni Google ni Bing responden por curl directo) --
  ningún proxy/espejo la esquiva desde adentro. Pero `WebSearch` tiene
  su propio camino de red (no pasa por el mismo proxy) y SÍ funciona
  ampliamente -- es la herramienta real para investigación externa.
  Documentado como decisión permanente en `DECISIONES.md`.
- Con `WebSearch` + lectura de código fuente real (`raw.githubusercontent.com`)
  se encontraron y evaluaron a fondo: `coreyhaines31/marketingskills`
  (50 skills de marketing, MIT) -- se instalaron 10 relevantes a Fase 1
  en `.claude/skills/`; `chuk-motion` (MCP de Remotion, Apache-2.0);
  `tiktok-trends-mcp`/`viral-app-mcp`/`video-url-analyzer-mcp` (MCP de
  contenido, cada uno con su licencia/costo real verificado, no
  asumido).
- Primera vez que la fábrica tiene criterio experto de VENTAS
  instalado (antes `fabrica/ventas/` era solo arquitectura vacía).

**BLOQUEADO (requiere al operador):** activar `video-url-analyzer-mcp`
(usa API de Google Gemini, no 100% gratis) -- registrado en
`PENDIENTES_OPERADOR.md`.

**PRÓXIMO PASO:** seguir la línea de descubrimiento amplio si el
operador lo pide (más MCP de contenido, más skills del catálogo de
marketing según necesidad real, no instalación preventiva).

## Bloque anterior: R7-17 (2026-09-03)

**HECHO:**
- `fabrica/mcp/` -- primer registro real de conectores MCP (4 items:
  vidIQ, Trends MCP, OpusClip, cluster de SaaS de video pagos).
- `fabrica/docs/AUDITORIA_PROMPT_MAESTRO_3.md` -- mapeo del pedido
  "capa de inteligencia" contra el estado real; decisión de NO crear
  `fabrica/inteligencia/` porque duplicaría 11 de 13 carpetas pedidas.
- Confirmados y registrados los 3 Agent Skills de Remotion ya
  disponibles en este entorno (`remotion-markup`, `remotion-render`,
  `remotion-captions`) en `fabrica/skills/`.
- Este documento (`ESTADO.md`).

**CONFIRMADO (evidencia real, no supuesto):**
- `Interactive`, `CanvasImage`, `AnimatedImage` existen en
  `remotion@4.0.518` (versión instalada) -- la skill `remotion-markup`
  es compatible con la versión fijada del proyecto.
- Existe un conector MCP **vidIQ** instalado a nivel de organización
  con herramientas reales de investigación de YouTube/Instagram/
  TikTok (outliers, trending, stats de canal) -- confirmado con
  `ListConnectors`/`SearchMcpRegistry`, no inventado.

**BLOQUEADO (requiere al operador, ver `PENDIENTES_OPERADOR.md`):**
- Conectar vidIQ -- no se puede confirmar si el plan asociado tiene
  costo sin habilitarlo, y habilitar un conector de terceros no es una
  decisión reversible tomable sin autorización (regla de $0).
- Agregar Trends MCP como conector personalizado (candidato gratis
  según su propia fuente, no verificado de forma independiente).

**NO CONFIRMADO todavía:**
- Si vidIQ (una vez conectado) realmente da acceso gratis a
  `vidiq_outliers`/`vidiq_earnings_estimate`, o si esas herramientas
  específicas requieren el plan pago de la plataforma.

**PRÓXIMO PASO:** esperar la decisión del operador sobre vidIQ/Trends
MCP. Mientras tanto, seguir extendiendo los módulos ya existentes
(Knowledge Engine, Viral/Retention Engine, Advanced Editing Engine)
con lo que SÍ se puede investigar sin conectores nuevos (búsqueda web
de fuentes oficiales/académicas, como ya se hizo en R7-1).

## Bloques anteriores (resumen, detalle completo en cada `MEJORAS_RONDA*.md`)

- **R7-16:** Subtítulos -- whisper.cpp compila real, modelo bloqueado
  por política de red (huggingface.co + mirror, ambos denegados).
- **R7-15:** Viral/Retention Engine conectado a la elección automática
  del Director de Edición (con anti-repetición).
- **R7-14:** Generador completo de carruseles (6-10 slides desde una
  fuente del Knowledge Engine), carrusel real de 7 slides renderizado.
- **R7-0 a R7-13:** construcción completa del "sistema operativo de
  contenido + ventas" (Knowledge/Research/Skill Intelligence/Viral-
  Retention/Advanced Editing/Sales/Product Ecosystem/Carousel/Data/
  Decision Engine) -- ver `MEJORAS_RONDA7.md`.
- **Rondas 1-6:** pipeline completo de video (guion→voz→visual→
  audio→edición→retención→render→QA→memoria) -- ver
  `docs/ARQUITECTURA.md`.
