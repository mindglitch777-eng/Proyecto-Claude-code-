# Pendientes que necesitan al operador

Solo lo que de verdad necesita que vos hagas algo o decidas algo. El
detalle técnico completo de cada tema está en `fabrica/PENDIENTES.md`.

## Ronda 7 (R7-20) — API de YouTube gratis, lista para usar (falta solo tu clave)

Pediste una solución 100% gratis sin cargos para investigar contenido
real -- la encontré: la **API oficial de YouTube** (no vidIQ, no
Gemini). Confirmado con dos fuentes independientes: es gratis sin
excepción, no pide tarjeta, y ni siquiera existe un plan pago que se
pueda comprar (solo hay un límite diario gratis que alcanza de sobra
para investigación manual). Ya escribí el código
(`fabrica/research/youtube_api.ts`), probado y listo -- solo falta que
generes la clave y me la pases.

**Cómo conseguirla (gratis, ~10 minutos, sin tarjeta):**
1. Andá a https://console.cloud.google.com/ con tu cuenta de Google.
2. Creá un proyecto nuevo (cualquier nombre).
3. Buscá "YouTube Data API v3" en la biblioteca de APIs y activala.
4. Andá a "Credenciales" → "Crear credenciales" → "Clave de API".
5. Copiá esa clave y pasámela -- yo la guardo como variable de entorno
   (`FABRICA_YOUTUBE_API_KEY`), nunca en el código.

Con eso puedo buscar videos reales por tema y traer vistas/likes/
comentarios/duración reales -- la primera fuente de datos real de qué
funciona, sin gastar un peso.

## Ronda 7 (R7-17) — conectores MCP, decisión de cuenta/costo

### ¿Habilitamos el conector vidIQ?

Ya está instalado a nivel de tu organización en claude.ai (lo
encontré al revisar qué conectores existen), pero está DESCONECTADO
en esta conversación. vidIQ da herramientas reales de investigación
de YouTube/Instagram/TikTok: qué videos son "outliers" (mucho mejor
que el promedio del canal), qué está en tendencia, estadísticas de
canal, estimación de ganancias. Sería la primera forma real de ver
qué contenido funciona de verdad en el nicho -- hoy la fábrica no
tiene ningún acceso a eso.

**Por qué no lo conecté solo:** no puedo confirmar si tu plan de
vidIQ tiene costo, ni si funciones como "outliers" o "estimación de
ganancias" están en el plan gratuito o requieren pago -- conectarlo
sin saber eso podría violar la regla de $0. Si querés probarlo,
habilitalo en la configuración de conectores de este chat y avisame
si tu plan es gratuito o pago.

### ¿Agregamos "Trends MCP" como conector nuevo?

Encontrado por búsqueda (no es un conector tuyo existente): declara
un plan gratuito de 20 consultas/día sin tarjeta, con tendencias de
Google/YouTube/TikTok/Reddit/X unificadas. No lo verifiqué
conectándolo -- si te interesa, implicaría crear una cuenta en un
servicio externo (`trendsmcp.io` o similar) y agregarlo vos como
conector personalizado. Detalle completo en `fabrica/mcp/registro.ts`.

### ¿Autorizamos usar Google Gemini para analizar videos reales de la competencia?

Encontré un MCP (`video-url-analyzer-mcp`) que transcribe y analiza con IA cualquier video de YouTube/TikTok/Instagram por URL -- sería una forma real de estudiar qué hace la competencia. Pero usa la API de Google Gemini, que tiene un plan gratis con límites reales (no "gratis sin condiciones"). No lo activé porque implica una cuenta de Google Cloud y gestionar una clave que podría generar costo. Si querés probarlo, decime y lo dejamos listo -- mientras tanto queda solo documentado.

### Herramientas descartadas sin preguntarte (no requieren tu decisión)

OpusClip, Tella, Cloudinary, Adobe for creativity, HyperFrames y
Riverside aparecieron en el catálogo de conectores -- las descarté
directamente porque son servicios de edición/grabación con costo real
y ninguna resuelve algo que Remotion (ya integrado, gratis) no
resuelva para nuestro caso de uso (generamos video desde cero, no
editamos grabaciones existentes). No hace falta que decidas nada acá.

## Ronda 4 (Director de Edición)

### Escuchar/ver `fabrica-demo-05.mp4` (la entrega de esta ronda)

Guion nuevo (Mica, edición de video), voz real, generado llamando de
verdad al Director de Edición para las 7 escenas. Todo lo técnico salió
limpio (QA duro, QA de composición, crítica editorial nueva, todo
verificado con frames reales -- ver `fabrica/ESTADO_ACTUAL.md`,
sección "RESULTADOS"). Lo que no puedo evaluar yo: si el cambio de
lenguaje visual entre "desarrollo" y "aceleración" (que la crítica
editorial marcó sola, sin que yo se lo pidiera puntualmente) se siente
como una decisión de dirección o como un salto brusco.

### Sin decisiones pendientes de gasto/cuentas esta ronda

Todo lo construido es interno a la fábrica (ninguna API nueva, ningún
servicio pago, ninguna integración externa) -- no hay nada que
necesite tu aprobación de presupuesto o de cuenta esta vez.

## Ronda 3 (calidad audiovisual)

### Escuchar/ver `fabrica-demo-04.mp4` (la entrega de esta ronda)

Es un video nuevo, con guion nuevo y voz real, hecho específicamente
para probar las 4 mejoras de esta ronda (golpes variados, anticipo
antes de un golpe fuerte, no repetir una cifra ya mostrada, QA
creativo). Todo lo técnico ya salió limpio (QA duro, QA de composición,
inspección de frames, análisis de luminancia — ver
`fabrica/MEJORAS_RONDA3.md`, sección "RESULTADO DEL NUEVO VIDEO"). Lo
que no puedo verificar yo es cómo se SIENTE al mirarlo/escucharlo de
corrido: si el ritmo mejoró de verdad respecto a `fabrica-demo-03.mp4`,
si la pausa antes de la revelación se siente como un respiro real o
como un bache, si el anticipo antes del golpe final se nota o es
demasiado sutil.

### Qué quedó sin construir esta ronda (a propósito, no por olvido)

El pedido original tenía 24 puntos; se les dio profundidad real a 4
(los de arriba) y se dejaron documentados como pendientes 6 más
(escenas que evolucionan internamente, un motor de "composiciones" en
capas, jerarquía visual centralizada, microanimaciones en los 26
componentes existentes, continuidad visual entre escenas, Director de
Retención con etiquetas cualitativas) — ver la sección "PROBLEMAS QUE
SIGUEN ABIERTOS" de `fabrica/MEJORAS_RONDA3.md` para el detalle de cada
uno y por qué se priorizó así. Si alguno de estos te importa más que
los otros para la próxima ronda, decímelo y arranco por ahí.

## Ronda 2 (fortalecimiento + prueba integral)

## 1. Escuchar `fabrica-demo-03.mp4` (el video de prueba)

Es la entrega principal de esta ronda. Todo lo técnico (QA, duración,
resolución, sincronización) ya está verificado automáticamente y salió
limpio. Lo que **no puedo verificar yo** es cómo suena y se siente de
verdad: ritmo, si la voz convence, si el gráfico/timeline/comparación
se entienden al vuelo, si algo se siente genérico. Ver la sección
"Evaluación audiovisual" en mi mensaje de entrega para mi lectura, pero
la tuya es la que importa.

## 2. Escuchar las 8 muestras de `muestras_voz/prueba_normalizacion/`

Cubren números, dinero, porcentajes, fecha completa, nombre propio con
tilde/ñ, abreviaturas, decimales y números sueltos — todas con la voz
real de producción. Puntos concretos a confirmar con el oído:

- **Las líneas 05 (nombre propio) y 06 (número suelto) generaron la
  MISMA duración exacta** (110592 samples, 72 frames, 4.61s) a pesar de
  tener textos completamente distintos ("Isabella Kotsias y Nicolás
  Gómez..." vs "Publicó tres videos por semana..."). Puede ser
  coincidencia real del motor (textos de longitud de tokens similar) o
  puede indicar un problema de generación. **Necesito que las
  escuches** para confirmar si cada una dice lo que corresponde o si
  hay algo mal.
- Cómo suenan los nombres propios con tilde/ñ (Nicolás Gómez, Isabella
  Kotsias) — si el motor los pronuncia bien o los "traga".
- Si las fechas y números grandes suenan naturales o mecánicos.
  (Dato a favor, no una confirmación completa: corrí un
  reconocedor de voz automático sobre el audio real de la fecha del
  video -- "15 de marzo de 2024" -- y la reconoció como fecha completa
  sin problema, señal indirecta de que se pronuncia bien. Pero un
  reconocedor automático no reemplaza tu oído.)

## 3. Escuchar la comparación A/B del método de voz (ya generada)

El motor de Qwen3-TTS avisa en todas las corridas que el método actual
de producción (voz clonada + `--instruct` sobre el modelo Base) "no
está oficialmente soportado", y sugiere un método alternativo de dos
pasos. Ya generé la MISMA frase con ambos métodos para que los
compares directo:

- `muestras_voz/comparacion_customvoice/metodo-actual.mp3` — el que ya
  usan los 20 videos entregados.
- `muestras_voz/comparacion_customvoice/metodo-customvoice.mp3` — el
  método "oficialmente soportado".

Si te suenan parecidos o el actual te convence, no hace falta tocar
nada. Si el de CustomVoice suena mejor (más natural, mejor energía),
avisame y migro `generar_voz_documental_qwen.py` a ese método (implica
generar y commitear un archivo de voz reusable de ~25MB una sola vez).

## 4. Opcional: cuenta gratis de Jamendo para música

`fabrica/musica/` está lista para recibir una biblioteca real, pero
Free Music Archive (la única fuente sin necesitar cuenta) devuelve 404
en su API — parece deprecada. Si querés sumar música de fondo más
adelante, registrate gratis en developer.jamendo.com y pasame el
`client_id` (se guarda como secret del repo, `JAMENDO_CLIENT_ID`) para
disparar la investigación de candidatos reales. No es necesario para
nada de lo hecho hasta ahora.

## 5. Repositorio: la rama de trabajo sigue sin mergear a `main`

Todo lo de esta sesión (y la anterior) vive en
`claude/organize-repo-duplicates-xl042t`. Encontré una forma de correr
los workflows de GitHub Actions sin necesitar el merge (un truco real
con el evento `push`, no un hack frágil), así que esto ya NO bloquea
nada operativo. Pero en algún momento conviene mergear esa rama a
`main` para que quede como el estado "oficial" del repo, cuando vos lo
decidas.
