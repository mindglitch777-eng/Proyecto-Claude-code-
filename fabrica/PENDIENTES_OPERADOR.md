# Pendientes que necesitan al operador — Ronda 2 (fortalecimiento + prueba integral)

Solo lo que de verdad necesita que vos hagas algo o decidas algo. El
detalle técnico completo de cada tema está en `fabrica/PENDIENTES.md`.

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
