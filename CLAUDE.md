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
"El Corte" (producto de Hotmart de la Fase 1 original, publicado el
20/08) queda **archivado por decisión explícita del operador (03/09):
no se vuelve a tocar ni a mencionar como próximo paso.** No borrar su
código sin que el operador lo pida aparte -- solo se dejó de priorizar.

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
comportarse" más abajo). `state/state.json` + `orchestrator.py` fueron
el sistema de la Fase 1 original (El Corte) y quedaron congelados sin
uso real desde que el trabajo se mudó a `fabrica/`.

## Cómo debe comportarse Claude Code en este proyecto
1. Al iniciar sesión: leer `fabrica/ESTADO.md` primero (estado vivo real
   del proyecto). `orchestrator.py status`/`state/state.json` quedaron
   obsoletos desde que el trabajo real se mudó a `fabrica/` (Ronda 2+)
   -- no reflejan el estado real, no confiar en ellos.
2. Proponer un solo siguiente paso concreto, no un rediseño completo.
3. Antes de cualquier integración con API externa (Hotmart, YouTube, etc.),
   confirmar con el operador qué cuenta/credenciales usar.
4. Documentar en `fabrica/ESTADO.md` (bloque nuevo arriba de todo) cada
   bloque de trabajo real y su resultado -- reemplaza a `state/log.md`,
   que quedó como historial congelado de la era pre-`fabrica/`.
