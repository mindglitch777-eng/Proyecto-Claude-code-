# Plan Maestro — Sistema de Ingresos Digitales

## Como usar este documento
Este es el mapa COMPLETO del proyecto, todas las fases de principio a fin.
No significa ejecutar todo ahora ni en una sola sesion. En cada sesion de
Claude Code se indica solo la fase y bloque activo. Para bloques de
investigacion, tomate el tiempo real de buscar e investigar a fondo
-- no un resumen superficial de dos lineas. Prioridad: profundidad sobre
velocidad en cada bloque de investigacion, aunque tome varias sesiones.

Regla de oro: ninguna fase nueva empieza sin que la anterior haya
completado su bloque de "revision de resultados reales" con datos
reales (ventas, vistas, respuestas), no supuestos. Ese bloque tambien
alimenta el Sistema de auto-mejora continua (ver mas abajo), que aplica
igual a las 6 fases, no solo a una.

## Fase 0 — Fundacion (completa)
- [x] CLAUDE.md
- [x] orchestrator.py (con cola de aprobaciones + notificaciones)
- [x] .github/workflows/orquestador-diario.yml
- [x] accounts.md (registro de cuentas)

## Fase 0.5 — Prueba end-to-end (hacer ANTES de Fase 1, no saltear)
Nunca confirmamos que la cadena completa funciona sola. Antes de
confiarle el proyecto real:
1. Crear el bot de Telegram (gratis, via @BotFather) y guardar
   TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID como secrets del repo.
2. Correr manualmente el workflow (boton "Run workflow" en GitHub,
   desde el celular) y confirmar que llega la notificacion a Telegram.
3. Confirmar que el commit automatico aparece en el repo.
4. Probar `python3 orchestrator.py request-approval "prueba"` y
   confirmar que notifica.
Si algo de esto falla, se arregla ANTES de empezar la Fase 1 -- no
tiene sentido construir el negocio sobre una cadena sin probar.

---

## Fase 1 — Productos Digitales (primera fase a ejecutar)
Objetivo: 1 producto digital vendible en 7-14 dias.

- **1.1 Investigacion de nicho + canal de distribucion**: identificar
  3-5 subnichos rentables. Investigar demanda real (busquedas,
  productos existentes y sus resenas/ventas visibles, precio promedio,
  quejas comunes de compradores sobre productos similares). ADEMAS,
  para cada subnicho: donde esta esa gente y como llega a comprar.
  Un subnicho rentable sin canal de acceso claro NO se elige.
  Salida esperada: subnicho recomendado + canal principal de trafico
  elegido y por que.
- **1.2 Diseno del producto**: definir y construir el contenido/codigo
  real del producto para el subnicho elegido.
- **1.3 Empaquetado, ficha de venta y lanzamiento**: archivo final,
  descripcion, keywords, precio con justificacion. Preparar la ficha
  para DOS plataformas (Etsy para descubrimiento, Gumroad para venta
  directa y captura de email) -- misma construccion, dos listados.
  Preparar tambien los primeros 30 dias de contenido del canal de
  trafico elegido en 1.1 (ej. 30 pines de Pinterest), porque publicar
  el producto sin plan de trafico es garantia de cero ventas.
  *Gate: cuentas y verificacion de identidad en Etsy/Gumroad las hago
  yo.*
- **1.4 Revision de resultado real**: tras 1-2 semanas, registrar
  ventas reales en state/costs.json. Decidir: iterar o pasar a Fase 2.

---

## Fase 2 — Micro-SaaS y Tiny AI Tools
Objetivo: una herramienta chica que resuelve un problema especifico.

- **2.1 Investigacion de dolor especifico**: buscar en foros/comunidades
  (Reddit, grupos, reviews de competidores) una queja repetida que una
  herramienta simple resuelva. No inventar el problema, encontrarlo.
- **2.2 Diseno tecnico minimo**: arquitectura simple, un solo flujo
  central, sin sobre-ingenieria.
- **2.3 Construccion del MVP**: Claude Code construye y prueba.
- **2.4 Despliegue y cobro**:
  *Gate: cuenta de hosting (Vercel/Render/etc) y de cobro (Stripe) las
  creo y verifico yo.*
- **2.5 Revision real**: tras 2-4 semanas, uso/ventas reales. Decidir
  continuar, pivotar o archivar.

---

## Fase 3 — Canal de YouTube Automatizado
Objetivo: validar un canal con contenido consistente antes de escalar.

- **3.1 Investigacion de nicho y formato**: temas con demanda probada,
  analizar 5-10 canales similares (que les funciona, que no).
- **3.2 Investigacion de stack open source**: investigar a fondo (no
  superficial) las opciones actuales, separando dos categorias que se
  confunden facil:
  - Editores de escritorio con interfaz grafica (Shotcut, Kdenlive,
    OpenShot, Blender) -- NO sirven para esto, necesitan pantalla y
    mouse, no se pueden correr en un sandbox headless.
  - Herramientas programables/headless (FFmpeg, MoviePy, Remotion,
    MLT/melt via linea de comandos, GStreamer) -- esta es la categoria
    que si sirve, porque Claude Code las controla por codigo/comando.
  Comparar calidad, licencia real de cada una (Remotion no es MIT puro
  para todo uso -- verificar terminos vigentes), y sobre todo cuanto
  computo real necesitan, porque el render corre en la sandbox en la
  nube o en GitHub Actions -- sin GPU y con minutos limitados.
  Para voz: Piper, Coqui XTTS, CosyVoice, edge-tts, mismo criterio de
  computo.
  Decision explicita a tomar: NO tiene sentido reconstruir un motor de
  render desde cero (FFmpeg ya lo resuelve, gratis). Lo que si vale la
  pena construir a medida es un script propio de ensamblado (toma
  guion + voz + imagenes/clips y arma el video final en el estilo de
  `brand.md`) sobre estas herramientas -- eso es lo que se construye en
  el bloque 3.3, no un editor nuevo.
  Salida esperada de este bloque: stack recomendado y por que, incluido
  si algo puntual amerita un servicio de pago (decision mia).
- **3.3 Produccion del primer lote**: guiones con Claude Code, voz con
  el TTS open source elegido, ensamblado con el stack elegido,
  subtitulos con Whisper (open source).
  Estilo de animacion: priorizar kinetic typography (texto sincronizado
  con la voz) -- es la tecnica con mejor relacion tiempo/resultado en
  2026, no una opcion "facil de menos". Investigar si existen paquetes
  de skills open source ya armados para agentes de codigo (Claude Code)
  sobre Remotion antes de construir componentes desde cero -- existen
  paquetes especificos para esto (motion graphics, kinetic typography,
  clips verticales) que pueden ahorrar tiempo real. Evitar herramientas
  de video con IA tipo Runway/Pika -- son de pago, no open source, y la
  calidad en 2026 sigue siendo "pasable, no perfecta" -- no vale el
  gasto para el volumen que necesitamos.
- **3.4 Publicacion y SEO**:
  *Gate: cuenta de YouTube es mia.*
- **3.5 Revision real**: tras 30 dias, metricas reales de vistas/
  retencion. Decidir continuar o pausar antes de invertir en mas video.

---

## Fase 4 — Contenido, Cursos y Afiliados
Objetivo: contenido con alto RPM y baja competencia.

- **4.1 Investigacion de nicho de contenido/afiliados**: buscar temas
  con alta intencion de compra y RPM estimado, revisar competencia SEO
  real (no solo volumen de busqueda).
- **4.2 Creacion de contenido**: ebook/guia o serie de posts SEO.
- **4.3 Publicacion y enlaces de afiliado**:
  *Gate: cuentas de programas de afiliados requieren mi aprobacion y
  a veces verificacion de identidad/pago.*
- **4.4 Revision real**: trafico y conversiones reales tras 30 dias.

---

## Fase 5 — Servicios Freelance / Agencia Automatizada
Objetivo: primer servicio vendido con ejecucion asistida por IA.

- **5.1 Definir servicio concreto**: un solo servicio ofertable (ej.
  "landing page en 48h"), con precio y alcance claro.
- **5.2 Preparar portafolio/propuesta tipo**: Claude Code redacta
  ejemplos y plantilla de propuesta.
- **5.3 Busqueda de primeros clientes**:
  *Gate fuerte: cualquier contacto real a un cliente potencial lo
  reviso y envio yo. Nunca se manda un mensaje real a una persona real
  sin que yo lo vea primero.*
- **5.4 Ejecucion del primer proyecto**: con supervision directa mia
  en cada entrega. Cobro por cuenta de pago mia.

---

## Fase 6 — Marca de Ropa (Print on Demand)
Objetivo: validar demanda de un diseno/nicho antes de gastar en ads.
No es dropshipping (revender catalogo generico) -- es imprimir disenos
propios sobre producto en blanco via un proveedor POD, sin inventario,
con marca y diseno diferenciados.

- **6.1 Investigacion de tendencias y disenos que funcionan**: analizar
  que disenos/temas/estilos estan vendiendo bien hoy en POD y redes
  (colores, tipografias, temas culturales del momento, por que le
  importan al comprador). Limite legal claro: se investiga el ESTILO
  y la razon de exito, nunca se copia un diseno protegido por derechos
  de autor ni se usa una marca/logo/personaje registrado. La salida es
  inspiracion de tendencia (paleta, tema, tono), no una plantilla para
  calcar -- el diseno final del bloque 6.2 tiene que ser original.
- **6.2 Generacion de disenos**: con IA generativa de imagenes, a
  partir de la inspiracion de tendencia del 6.1.
  *Gate: yo apruebo cada diseno antes de usarlo (derechos de imagen).*
- **6.3 Configuracion de tienda y proveedor POD**: comparar Printful,
  Printify, Gelato (calidad de impresion, tiempos de envio, margenes).
  *Gate: cuenta de tienda (Shopify/Etsy) y de proveedor POD son mias.*
- **6.4 Canal de TikTok de la marca**: plan de contenido mostrando los
  disenos/productos de la marca (no contenido generico), pensado para
  generar pedidos directos a la tienda.
  *Gate: la cuenta de TikTok es mia, y reviso cada video antes de
  publicarlo -- ningun contenido sale sin que yo lo vea primero.*
- **6.5 Campana inicial pequena**: presupuesto de ads chico y acotado
  primero. Revision real de resultados (tienda + TikTok) antes de
  escalar el gasto.

---

## Sistema de auto-mejora continua (aplica a TODAS las fases, no a una sola)
No es una IA que se reprograma sola — es un mecanismo simple y real,
el mismo en cada fase:

1. El ultimo bloque de CADA fase ("revision real") no solo registra el
   resultado puntual (ventas, vistas, respuestas) — tambien registra el
   APRENDIZAJE general en `state/log.md`: que funciono, que no, y por
   que. Ejemplos: "el precio bajo vendio mas rapido que el precio alto",
   "el nicho X tenia busqueda alta pero cero intencion de compra real".
2. Antes de empezar el Bloque 1 de CUALQUIER fase (la primera vez o una
   repeticion), Claude Code debe leer `state/log.md` completo y aplicar
   los aprendizajes acumulados de TODAS las fases anteriores a esa
   investigacion — no solo los de la fase mas parecida.
3. Asi cada fase nueva arranca mas informada que la anterior, sin que
   yo tenga que repetir contexto a mano cada vez. Esta regla ya esta
   incorporada en cada bloque de "revision real" de este documento —
   no hace falta repetirla fase por fase.

## Sistema de replicacion de exito (aplica a TODAS las fases)
Si un activo especifico (un canal, un diseno, un producto) supera un
umbral de exito real, se activa este protocolo en vez de asumir que
"si funciono una vez, va a funcionar de nuevo solo":

1. **Umbral definido de antemano**: un numero concreto fijado ANTES de
   lanzar, no despues (ej. "10,000 vistas reales + ingresos de AdSense
   documentados en 30 dias" o "50 ventas reales de un diseno en 2
   semanas"). Sin umbral previo no hay replicacion — evita perseguir
   ruido o un golpe de suerte puntual.
2. **Se replica la FORMULA, no el activo exacto**: mismo formato/
   estructura/estilo que funciono (tipo de guion, edicion, estilo de
   diseno) aplicado a un nicho o tema NUEVO. Nunca copiar el contenido
   o diseno original literal a otro canal/producto.
3. **Cada replica es una fase nueva completa**, con sus propios bloques
   de investigacion, gate humano y revision real. El exito anterior no
   exime de validar de nuevo — un formato que funciono en un nicho
   puede fallar en otro, y los datos de la replica mandan, no la
   expectativa.
4. **Maximo 1 replica nueva en progreso a la vez**, hasta que valide o
   se archive — para no diluir tiempo/atencion en demasiados activos
   a medias.
5. **Criterio de abandono (kill switch)**: si una replica no alcanza
   el umbral en el plazo fijado, se archiva en `state/log.md` con el
   motivo. No se mantiene viva "por si acaso".

Ejemplos concretos:
- *YouTube*: el canal de nicho "dinero" llega al umbral -> se investiga
  un nicho nuevo con la MISMA estructura de guion/edicion que funciono,
  no el mismo contenido repetido.
- *Ropa POD*: un diseno (ej. tema capibara) llega al umbral de ventas
  -> se busca el siguiente tema/tendencia con el mismo proceso de
  investigacion+validacion del bloque 6.1 — nunca se asume "los
  animales venden" sin volver a investigar cada vez.

## Cruce entre activos (sinergia real de dinero y audiencia)
Las fases no viven aisladas. En CADA bloque de "revision real", ademas
de registrar el aprendizaje (ver Sistema de auto-mejora), Claude Code
debe preguntarse explicitamente: ¿este resultado sirve como insumo
para otro activo activo? Ejemplos concretos, no teoricos:
- Un diseno de ropa que se vuelve viral -> contenido gratis y ya
  validado para el TikTok de la marca (bloque 6.4).
- Una audiencia de YouTube que ya confia en el canal -> el mejor lugar
  para promocionar un producto digital de la Fase 1, en vez de buscar
  audiencia nueva desde cero.
- Un aprendizaje de que copy/precio funciono en Fase 1 -> se prueba
  primero (no se asume) en la ficha de un producto de otra fase.
Esto se registra en `state/log.md` igual que el aprendizaje general,
con una nota tipo "cruce: [activo A] -> [activo B]".

## Techo de activos activos simultaneos
Maximo 3 activos activos en total al mismo tiempo, contando TODAS las
fases juntas (no 3 por fase). Antes de arrancar cualquier fase nueva o
cualquier replica (ver Sistema de replicacion de exito), Claude Code
revisa `state/state.json`: si ya hay 3 activos activos, no arranca uno
mas — primero hay que cerrar o archivar alguno con datos reales. Esto
no es por desconfianza en el sistema: es porque cada activo activo
tiene al menos un gate que solo yo puedo aprobar (gastar, publicar,
contactar), y mi atencion real para revisar esos gates bien es el
recurso mas limitado de todo el proyecto, no el computo ni el dinero.

## Sistema de emergencia (COMPLEMENTA los gates, no los reemplaza)
Limite duro de gasto acumulado, definido por mi en CLAUDE.md (ej. "si
el gasto total registrado en state/costs.json supera $X en un dia,
todo workflow automatico se pausa y me notifica" -- implementable como
un chequeo al inicio de cada corrida del GitHub Action). Sirve para
detener un problema que ya empezo. No sustituye los gates de "revisar
antes de publicar/gastar/contactar", que existen para que el problema
no empiece.

## Voz del cliente real (no solo numeros)
En cada bloque de "revision real", ademas de numeros (ventas, vistas),
Claude Code recopila y resume señal cualitativa real: reseñas,
comentarios, mensajes de soporte, comentarios en video. Que dice la
gente con sus propias palabras sobre por que compro, por que no, que
le falto. Se registra en `state/log.md` junto al aprendizaje
cuantitativo -- los numeros dicen QUE paso, los comentarios dicen POR
QUE, y sin el "por que" el Sistema de replicacion tiende a copiar la
superficie en vez de la razon real del exito.

## Audiencia propia (mitigar depender de una sola plataforma)
Riesgo real de largo plazo: una cuenta de YouTube/TikTok/Gumroad puede
suspenderse, o una plataforma puede cambiar su algoritmo de un dia
para el otro -- eso esta fuera de nuestro control. La mitigacion real
es un canal que no depende de ninguna plataforma: una lista de email.
En cuanto una fase de contenido (3, 4 o 6) tenga trafico real, se
agrega un punto de captura simple (ej. "descarga gratis a cambio de tu
email") como practica estandar del bloque de lanzamiento de esa fase,
no como fase aparte.

## Identidad de marca compartida
Para que el Cruce entre activos funcione en la practica -- que la
audiencia de un activo confie en otro -- los activos de cara al
publico (YouTube, TikTok, tienda) comparten un hilo de identidad
reconocible: nombre, tono, estilo visual minimo. Se define UNA vez en
`brand.md` (nombre, tono de voz en 2-3 adjetivos, paleta si aplica) y
las Fases 3, 4 y 6 lo leen antes de producir contenido publico.

## Nota sobre impuestos y contabilidad
Esto no es algo que el sistema pueda resolver de forma segura por si
solo: a medida que las fases generan ingresos reales, hay obligaciones
fiscales/contables que dependen del pais y la situacion particular de
cada uno -- ni Claude ni Claude Code son asesores fiscales. Practica
minima: mantener el registro de ingresos reales por fase (ya lo hace
`state/costs.json`) y consultar a un contador local antes de que el
volumen crezca -- mas facil prevenir esto temprano que resolverlo tarde.

## Sistema de distribucion (el agujero mas grande de cualquier plan asi)
Regla central: ninguna fase se considera "lista para lanzar" sin un plan
de distribucion escrito. Un producto excelente sin trafico vende cero.
La mayoria de proyectos como este no fracasan por mal producto --
fracasan porque nadie se entero de que existia.

**Correccion importante a la Fase 1**: Gumroad NO trae compradores. Es
un escaparate propio, no un marketplace con busqueda. Publicar ahi y
esperar es garantia de cero ventas. La estrategia correcta es doble
canal con UNA sola construccion:
- **Etsy** (u otro marketplace con buscador real): para trafico de
  descubrimiento -- gente que ya esta buscando lo que vendes.
- **Gumroad**: como destino de tu propia audiencia. Su ventaja real es
  que te entrega el email de cada comprador (Etsy no); Gumroad cobra
  menos comision en venta directa.
Mismo producto, dos listados, dos fuentes de ingreso.

**Canales de trafico gratuitos a investigar en el bloque 1.1** (elegir
1-2 y ser constante, no estar en todos a medias):
- Pinterest: historicamente el mejor fit para productos digitales
  visuales (plantillas, planners).
- Contenido/SEO (blog, Medium): trafico lento pero acumulativo -- un
  articulo que rankea sigue trayendo gente meses despues.
- Reddit/foros del nicho: solo aportando valor real, no spameando
  links -- el spam se banea rapido y quema el nicho.
- TikTok/Shorts: ya cubierto para Fase 6, aplicable a otras.

**Regla anti-dispersion**: elegir UN canal principal por activo y
sostenerlo minimo 30 dias antes de juzgarlo. Rotar de canal cada
semana es la forma mas comun de no construir traccion en ninguno.

## Definicion de fracaso a nivel proyecto (no solo por activo)
Los umbrales por activo ya existen. Falta el del proyecto entero, para
no seguir por inercia:
- **Checkpoint a los 3 meses**: si no hubo NINGUNA venta/ingreso real
  en ninguna fase, no se agrega una fase nueva -- se para y se revisa
  que esta fallando (producto, distribucion, o eleccion de nicho).
  Casi siempre es distribucion.
- **Checkpoint a los 6 meses**: si el ingreso total sigue siendo
  cercano a cero, se replantea el enfoque completo -- no se sigue
  ejecutando el mismo plan esperando un resultado distinto.
- Estos checkpoints se anotan en `state/log.md` con la fecha de inicio
  real del proyecto, para que no se difuminen.
- Fracasar rapido y barato es un exito del sistema, no una derrota:
  el costo real aca es tiempo, y detectarlo a los 3 meses en vez de a
  los 18 es lo que permite intentar otra cosa con lo aprendido.

## Presupuesto de tiempo real del operador
Disponibilidad declarada: mayormente libre durante el dia, con gym y
futbol como actividades fijas. Eso es una ventaja real -- el cuello de
botella de este proyecto NO va a ser tiempo, va a ser constancia.
Implicancia practica: el limite de 3 activos simultaneos se mantiene
igual (la atencion de calidad para los gates sigue siendo limitada),
pero SI hay margen para sostener un canal de distribucion diario
(publicar en Pinterest/TikTok, responder comentarios), que es
justamente el trabajo que mas se abandona y mas rinde a largo plazo.
Regla: 1 bloque de trabajo profundo por dia + 20-30 min de
distribucion constante, todos los dias, incluso cuando no hay nada
nuevo que lanzar.

## Capa de subagentes (automatizacion real, con limites reales)
Dos subagentes definidos en `.claude/agents/`, ambos de SOLO LECTURA:
- **investigador-mercado**: hace el bloque 1 (investigacion) de
  cualquier fase, en su propio contexto. Devuelve un reporte corto y
  estructurado en vez de volcar 50 paginas leidas en la sesion
  principal.
- **revisor-calidad**: revisa cada entregable contra las reglas del
  proyecto ANTES de que llegue a mi. Atrapa errores obvios para que mi
  atencion se gaste en decisiones, no en correcciones.

Beneficio real: aislamiento de contexto. La sesion principal se
mantiene limpia y enfocada mientras el trabajo pesado de lectura
ocurre aparte.

Costos y limites que NO se ignoran:
- Los flujos multi-agente consumen aproximadamente 4-7x los tokens de
  una sesion simple. En plan Pro/Max, generar muchos agentes en
  paralelo es la via mas rapida a chocar con el limite de uso.
- Por eso: NO se agregan mas agentes hasta que estos dos demuestren
  que se ganaron su lugar en uso real.
- Ambos son de solo lectura a proposito. Ningun subagente escribe
  archivos, gasta dinero, ni publica nada -- los gates humanos siguen
  intactos y no se delegan a un agente.
- Para tareas chicas o secuenciales, la sesion principal directa es
  mas rapida: delegar tiene costo de latencia. No usar subagentes por
  usarlos.

## Capa de automatizacion SIN tokens (logica determinista)
Principio: todo lo que se pueda resolver con un script, NO lo hace un
LLM. Un script que cuenta, compara fechas y aplica reglas fijas cuesta
cero tokens, corre gratis en GitHub Actions, y es MAS confiable que un
modelo para eso (no alucina un numero). Cada cosa que se mueve de
"Claude piensa" a "un script calcula" libera limite de uso para las
decisiones que si requieren criterio.

`guardian.py` -- ya implementado, cero costo:
- Verifica el techo de 3 activos simultaneos.
- Avisa si un gate lleva 3+ dias sin atender.
- Dispara los checkpoints de fracaso de 3 y 6 meses automaticamente.

Candidatos futuros para mover a script (sin IA):
- Consolidar ingresos/costos por activo y ordenarlos por rendimiento.
- Recordatorio de publicacion diaria del canal de distribucion.
- Detectar activos sin actividad hace X dias.

## Nota honesta sobre agentes locales (Ollama y similares)
Se evaluaron y NO aplican a este proyecto por una razon concreta:
son gratis en inferencia pero corren en hardware propio, y requieren
GPU para ser practicos. Este proyecto opera desde un celular, sin
computadora -- ese es su punto de partida. En GitHub Actions tampoco
sirven: sin GPU y con minutos limitados. Ademas, los modelos locales
chicos (7-8B) sirven para automatizaciones de 1-3 pasos, no para
trabajo abierto de investigacion y estrategia.
Si en el futuro hay una computadora con GPU disponible, se puede
reevaluar -- pero hoy la via real de "cero costo" es logica
determinista (guardian.py), no un modelo local.

## Capacidad transversal — Investigacion de productos/formatos ganadores
Aplica al bloque de diseno/construccion de CUALQUIER fase, no solo
ropa. Antes de crear un producto o formato nuevo, investigar que ya
esta funcionando en esa categoria (bestsellers, reviews, formatos con
mas vistas) y extraer la FORMULA de por que funciona. Mismo limite
legal que en la Fase 6: se investiga el patron/formula, nunca se copia
contenido protegido por derechos de autor literal ni marcas/logos
registrados. El resultado siempre es un producto propio, informado por
lo que ya demostro funcionar en el mercado -- no una copia.

## Capacidad transversal — Investigacion de nichos
No es una fase aparte: se usa dentro del bloque 1 de cada fase de
arriba. Se invoca cuando una fase la necesita, no corre "todo el
tiempo" de fondo sin proposito.

## Reglas que no cambian (definidas en CLAUDE.md)
- Ninguna accion real (gastar dinero, publicar, contactar a alguien)
  sin mi aprobacion explicita en esa sesion.
- Autenticacion solo via CLAUDE_CODE_OAUTH_TOKEN -- nunca ANTHROPIC_API_KEY.
- Un bloque a la vez, por sesion. Si Claude Code propone saltarse el
  orden o adelantarse a una fase sin datos reales de la anterior, se
  le recuerda este documento.
