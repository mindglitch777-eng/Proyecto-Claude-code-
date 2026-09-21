# Sistema de Ingresos Pasivos — Constitución del Proyecto

## Contexto
Operador humano trabaja solo desde celular (sin computadora). Toda ejecución
de código ocurre a través de Claude Code (terminal remoto vía app móvil).
No hay infraestructura propia: usar servicios cloud gratuitos/baratos
(Supabase, Google Sheets como DB ligera, GitHub Actions para scheduling).

## Regla de oro
Ninguna acción que gaste dinero real, envíe mensajes a terceros reales,
o publique contenido públicamente se ejecuta sin confirmación explícita
del operador en esa sesión. Nada corre "solo" sin que un cron/GitHub Action
lo dispare — no existe un proceso en segundo plano indefinido.

## Postura resolutiva (regla permanente, agregada tras R7-21)
Nunca paralizarse ante un bloqueo. Si algo falla o parece imposible:
1. Buscar TODAS las soluciones alternativas antes de reportar "bloqueado"
   (otro canal de red, otra herramienta, otro enfoque, leer el código
   fuente en vez de asumir, probar en chico antes de descartar).
2. Si de verdad no existe una solución lista, crearla (un adaptador, un
   fix, un cliente propio) en vez de resignarse.
3. Solo se reporta "BLOQUEADO — NO CONFIRMADO" cuando se agotaron esas
   vías y el bloqueo depende de algo que solo el operador puede decidir
   (plata, cuentas, credenciales) — nunca como primera respuesta.
4. Siempre buscar sumar valor real al proyecto en el camino (un bug
   encontrado se arregla ahí mismo, no solo se documenta), sin perder de
   vista la Regla de oro (nunca gastar, publicar ni contactar terceros
   sin confirmación explícita).

## Test de ángulo comercial (regla permanente, agregada tras "El error real" #1, 2026-09-16)
Ejecución técnica perfecta no salva un ángulo que a nadie le importa. Precedente real: "El error
real" #1 tenía calidad gráfica y de guion aprobadas, pero el ángulo ("casi pierdo 27 videos") es un
drama 100% interno -- el operador lo resumió así: *"a quién le va a interesar que casi se me
pierden 27 videos, a nadie, absolutamente a nadie"*. Se corrigió la tipografía/lenguaje dos veces
antes de identificar que el problema real era el ángulo, no la ejecución -- eso no puede volver a
pasar.

**Ningún guion se escribe sin pasar antes por este test** (antes de tocar Remotion, no después de
renderizar):
1. ¿A quién le importa esto sin conocer el contexto interno de la fábrica? Si la historia solo
   tiene peso para alguien que ya sabe cómo funcionamos por dentro, no es contenido -- es un log de
   trabajo con música.
2. ¿Qué se lleva el espectador -- FOMO real, curiosidad resuelta con un premio, o un resultado que
   puede imaginar para sí mismo? Tiene que ganar algo, no solo enterarse de algo nuestro.
3. ¿De quién son las apuestas (stakes)? Tienen que ser del espectador (su tiempo, su plata, su
   duda sobre si esto funciona), nunca solo nuestras.
4. ¿Qué patrón de gancho/retención ya documentado en `fabrica/hooks/catalogo.ts` (con nivel de
   evidencia real, ver `fabrica/research/retencion.md`) se está usando? Un ángulo inventado sin
   apoyo en ese catálogo es sospechoso -- no se descarta de plano, pero se marca y se discute.
5. Comparación directa contra el piloto documental 1 (`fabrica/ejemplos/generar_piloto_documental.ts`,
   el primer video con ángulo aprobado: "le pedí a mi sistema que arme un mes de contenido, en 1:30
   armé 41 piezas"): si el ángulo nuevo no genera el mismo nivel de "yo también quiero esto", no se
   construye todavía -- se debate el ángulo con el operador primero.

Igual que con la evidencia de retención (`fabrica/research/retencion.md`), esto es un filtro
cualitativo para decidir QUÉ se construye, nunca un "score de viralidad" numérico inventado -- la
única forma real de confirmar que un ángulo funciona es publicarlo y medirlo.

## Regla de logos reales (regla permanente, agregada 2026-09-21)
Cada vez que un video nombra una marca o herramienta (TikTok, Google Flow, Hugging Face, la que
sea), se busca y se muestra su **logo real** -- nunca un ícono genérico ni texto solo por defecto.
Esto vale para todos los videos de acá en adelante, no solo el que lo motivó. La herramienta ya
existe: `descargar_logo_empresa.py` (Wikidata P154 + Wikimedia Commons, mismo criterio de confianza
que `buscar_foto.py` -- **mejor sin logo que con el logo equivocado**: si no encuentra una fuente
confiable, no baja nada, nunca inventa ni adivina). Se corre desde un runner de GitHub Actions (este
sandbox tiene bloqueado el acceso a Wikidata/Commons). Si una marca es demasiado nueva/nicho y
todavía no tiene ficha en Wikidata, esa marca puntual queda con texto solo -- eso es una limitación
real de la fuente, no una excusa para saltear la búsqueda en el resto.

## Arquitectura de publicación (2026-09-14, reemplaza toda automatización previa)
TikTok y YouTube se publican SIEMPRE a mano por el operador, vía las apps nativas de
cada plataforma (TikTok Studio, YouTube Studio) -- programación propia de cada app
(TikTok hasta 10+ días, YouTube hasta ~1 año), confirmado real por el operador (tiene
TikTok Studio instalado y probó que la programación funciona desde el celular). Zernio
DEJÓ de usarse para publicar -- nuestro sistema solo genera el contenido y se lo
entrega al operador (archivo + tema + horario sugerido + descripción + hashtags +
música) vía el Buzón (artifact de GitHub Actions + aviso por ntfy.sh). Motivo del
cambio: Zernio tenía un bug de presign sin arreglo posible de nuestro lado, límites de
tamaño, rate limits de TikTok, y exigía sondeo periódico (ver regla de abajo) solo para
confirmar que un post llegó a destino -- la programación nativa no necesita nada de eso.

## Reglas rígidas de publicación (información fija, no reinterpretar)
Confirmadas por el operador el 2026-09-11 y reconfirmadas el 2026-09-14 ("guarda eso
para siempre como información rígida y recta") — no son sugerencias, son datos de
negocio fijos:
- **TikTok**: franja "viral" 18:00 a 23:00 ART (UTC-3) corrida, SIN hueco adentro. Es
  el horario SUGERIDO que se muestra en el Buzón/panel -- el operador elige la hora
  real al programar en TikTok Studio, no hay automatización que la fuerce.
- **YouTube**: sin restricción horaria — publica bien a cualquier hora.
- **Nunca sondear en bucle corto ni "todo el día" sin necesidad** ("cada 15/20 minutos
  al pedo" y "eso tiene que morir" — cita textual del operador). Ante cualquier
  necesidad de chequeo periódico futura: primero investigar si el servicio externo
  ofrece webhooks/callbacks (postura resolutiva); si de verdad no hay alternativa,
  acotar el cron a la ventana real donde puede pasar algo, nunca "24hs por las dudas".
  Y si esto ya se corrigió una vez en un workflow, auditar que valga para todos los
  workflows parecidos, no solo el que motivó el pedido. Precedente real 2026-09-14: el
  sondeo de `notificar-box.yml` (cada 20 min, confirmaba publicaciones de Zernio) se
  intentó primero espaciar, y terminó borrado del todo al mover la publicación a
  programación nativa -- la solución real casi siempre es sacar la necesidad de
  sondear, no ajustarle la frecuencia.

## Prioridad actual: La Nueva Fábrica Audiovisual (`fabrica/`)
"El Corte" (producto de Hotmart de la Fase 1 original, publicado el 20/08) fue
**eliminado del repositorio por decisión explícita del operador (20/09/2026,
tras quedar archivado sin uso real desde el 03/09): no se vuelve a construir,
mencionar como próximo paso, ni recuperar.** Se borraron sus ~25 scripts
Python, ~22 documentos de marca/nicho/estrategia, `netlify.toml` y las
carpetas `producto/`, `marca/`, `contenido/`, `guiones/`, `muestras_voz/`,
`demos/`, `capturas/`, `herramientas/` y `archivado/` (el orchestrator
original de Fase 1 vivía ahí). Los scripts que El Corte originó pero que la
fábrica reutiliza de verdad (`buscar_foto.py`, `descargar_foto_persona.py`,
`descargar_logo_empresa.py`, `descargar_metraje.py`,
`generar_voz_documental_qwen.py`, `voz_piper.py`) NO se tocaron -- siguen
siendo infraestructura compartida real, no reliquias. El sitio de Netlify
(el-corte-v7.html) puede seguir desplegado externamente; borrar el repo no
lo da de baja solo -- eso es una decisión y una acción aparte si el operador
la pide.

**Bug real encontrado el 21/09/2026 por este borrado**: `muestras_voz/referencias-candidatas/librivox-11.mp3`
(la muestra de voz real que clona TODA la voz de la fábrica, usada como `--ref-audio` por los 19
workflows `generar-voz-*.yml`) se fue con el resto de la carpeta sin que nadie notara que seguía en
uso real. Se restauró SOLO ese archivo puntual desde el historial de git (`clones/`,
`comparacion_customvoice/`, `prueba_normalizacion/` siguen borrados -- eran salidas de experimentos
de El Corte, ningún workflow los necesita como input). Lección real: antes de borrar una carpeta
completa "porque es de El Corte", grepear su ruta contra `.github/workflows/*.yml` primero.

La prioridad actual es seguir desarrollando `fabrica/` (motor de
generación de video con Remotion + directores de Voz/Visual/Audio/
Edición/Retención + memoria/laboratorio de experimentos) -- ver
`fabrica/ESTADO.md` (estado vivo, se lee al iniciar sesión) y
`fabrica/docs/ARQUITECTURA.md` (puntos débiles reales conocidos).

## Principios de diseño
- Modularidad: cada módulo falla independiente, no tumba el resto.
- MVP primero: lanzar rápido, iterar con datos reales, no con suposiciones.
- Cost-conscious: registrar costo de cada llamada a API externa en
  `state/costs.json`.
- Seguridad: ninguna clave de API en código. Todo vía variables de entorno
  (`.env`, nunca commiteado).

## Estado del proyecto
El estado vivo real vive en `fabrica/ESTADO.md` (ver "Cómo debe
comportarse" más abajo). El `orchestrator.py` de la Fase 1 original (El
Corte) fue eliminado el 20/09/2026 (ver "Prioridad actual" más arriba).
`state/` sigue existiendo pero hoy solo contiene `uploads.json` /
`carruseles.json` / los archivos de Zernio, usados por el panel Torre de
Control (`fabrica/subida/`) -- infraestructura real de `fabrica/`, no un
resto de Fase 1.

## Cómo debe comportarse Claude Code en este proyecto
1. Al iniciar sesión: leer `fabrica/ESTADO.md` primero (estado vivo real
   del proyecto) -- es la única fuente de verdad del estado del proyecto.
2. Proponer un solo siguiente paso concreto, no un rediseño completo.
3. Antes de cualquier integración con API externa (Hotmart, YouTube, etc.),
   confirmar con el operador qué cuenta/credenciales usar.
4. Documentar en `fabrica/ESTADO.md` (bloque nuevo arriba de todo) cada
   bloque de trabajo real y su resultado -- reemplaza a `state/log.md`,
   que quedó como historial congelado de la era pre-`fabrica/`.
