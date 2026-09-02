# Pendientes y bloqueos — Nueva Fábrica

**Ver también `PENDIENTES_OPERADOR.md`** — solo lo que necesita que el
operador haga o decida algo, extraído de este archivo más completo.

Este archivo es la lista concreta de lo que necesita intervención,
investigación o decisión humana. Se actualiza a medida que se
construye, nunca se inventa una solución para cerrar un ítem acá.

Formato de cada ítem: problema / parte afectada / por qué no se
resolvió / qué necesitamos / qué hacer después / si bloquea el resto
del sistema o no.

---

## 1. Timestamps palabra-por-palabra de Qwen3-TTS — RESUELTO (investigación), pendiente de implementar

- **Confirmado leyendo el repo `gabriele-mastrapasqua/qwen3-tts`
  (README + referencia de flags del CLI), 2026-09-02:** el motor NO
  expone timestamps ni alineación de ningún tipo. El `qwen_tts` CLI
  solo acepta salida a WAV (24kHz/16-bit/mono), PCM crudo a stdout, o
  streaming -- ninguna de las tres trae metadata de tiempo por
  palabra/fonema. La documentación completa (voice cloning, control de
  emoción, cuantización, rendimiento) no menciona "timestamp",
  "alignment", "word boundary" ni "subtitle" en ningún lado. Esto es
  ahora un hecho confirmado, no una suposición.
- **Afecta a:** Fase 3 (Voz) — sincronización fina palabra-por-palabra
  dentro de una unidad narrativa larga (hoy la sincronización es por
  UNIDAD completa, no por palabra dentro de la unidad).
- **Alternativa gratis/local investigada:** `faster-whisper` con
  `word_timestamps=True` -- corre 100% local, sin GPU (2x más rápido
  que Whisper original en CPU, con cuantización INT8), sin necesitar
  token de Hugging Face ni dependencias extra, y Whisper es
  multilingüe con soporte real de español. Es la opción recomendada
  para $0 presupuesto en un runner de GitHub Actions (CPU solamente).
  Existe una alternativa de mayor precisión (`WhisperX`, que agrega
  alineación forzada con wav2vec2, <100ms de error) pero requiere GPU
  para ser práctica con modelos grandes y un token de Hugging Face --
  no es la primera opción mientras el presupuesto sea $0 y no haya
  necesidad medida de esa precisión extra.
- **Qué falta para cerrar esto del todo:** implementar el paso de
  forced-alignment con faster-whisper SOBRE un audio real ya generado
  por Qwen3-TTS (necesita que primero exista ese audio -- ver ítem 3
  más abajo, la prueba de normalización) y medir si la precisión
  alcanza para sincronizar palabra por palabra dentro de un componente
  como Punch. No se implementó todavía porque no hay audio real nuevo
  generado en esta sesión para probarlo encima (Qwen3-TTS no corre en
  este sandbox).
- **¿Bloquea el resto?** NO. El sistema funciona con sincronización por
  unidad completa (ya probado en los 20 videos documentales y en
  fabrica-demo-02). Palabra por palabra es una mejora, no un requisito
  para operar.

## 2. Licencia comercial de Qwen3-TTS (motor + modelo) — RESUELTO (2026-09-02)

- **Motor C** (`gabriele-mastrapasqua/qwen3-tts`): **MIT** — confirmado
  leyendo el archivo `LICENSE` del repo directamente. Permisivo, uso
  comercial sin restricciones.
- **Modelo** (`Qwen/Qwen3-TTS-12Hz-1.7B-Base`, el checkpoint que
  usamos): **Apache 2.0** — confirmado leyendo el `LICENSE` del repo
  `QwenLM/Qwen3-TTS` en GitHub (permite uso comercial, redistribución y
  derivados, con atribución y sin garantía). El model card de Hugging
  Face para ese checkpoint específico también aparece etiquetado
  `apache-2.0` en los resultados de búsqueda, pero **no pude confirmar
  esto último leyendo la página directamente**: `huggingface.co` está
  bloqueado por el proxy de red del sandbox (mismo límite que ya
  documentamos para otras búsquedas esta sesión). La evidencia
  converge (repo del modelo en GitHub = Apache 2.0, motor = MIT, y el
  buscador reporta lo mismo para la página de Hugging Face) pero
  técnicamente falta esa última confirmación directa.
- **Aparte del motor/modelo: la VOZ que clonamos** (LibriVox, variante
  "enérgico 2") es una grabación de dominio público leída por un
  narrador voluntario que la publicó específicamente para reutilización
  — esto ya se investigó y aprobó ANTES de esta sesión (no es lo mismo
  que la licencia del software/modelo, es la licencia de la grabación
  de referencia).
- **Qué falta, si se quiere el 100%:** que alguien con acceso a
  huggingface.co confirme visualmente el tag de licencia en
  `https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base` — 2 minutos,
  no requiere leer nada legal complejo, solo mirar el badge de licencia
  en la página.
- **¿Bloquea el resto?** NO. Con MIT (motor) + Apache 2.0 (modelo,
  confirmado por 2 fuentes independientes aunque no 3) + grabación de
  referencia de dominio público, no hay ninguna señal de restricción de
  uso comercial. Riesgo residual bajo, no cero.
  permite — es un riesgo de negocio, no de ingeniería.

## 3. Calidad de Qwen3-TTS con números/monedas/fechas en español — DISPARADO, falta escuchar

- **Actualizado 2026-09-02 (Ronda 2):** el workflow SÍ se disparó y
  terminó bien -- se resolvió el bloqueo de rama con un truco real (ver
  ítem 11 más abajo), no hizo falta esperar ningún merge. Los 8 mp3
  reales ya están en `muestras_voz/prueba_normalizacion/` (prefijo
  `produccion-`), generados con la voz clonada real (librivox-11) y la
  configuración exacta de producción.
- **Falta:** que el operador los escuche (ver `PENDIENTES_OPERADOR.md`
  ítem 2) -- en particular las líneas `05_nombre_propio_con_tilde_ene`
  y `06_numero_suelto_dias`, que generaron la MISMA duración exacta
  (110592 samples, 72 frames) con textos completamente distintos. Sin
  escuchar el contenido real no puedo confirmar si es una coincidencia
  real del motor (ambos textos tienen una cantidad de tokens similar)
  o un problema de generación.
- **¿Bloquea el resto?** NO. El normalizador ya produce el texto
  hablado correcto según reglas de español (con tests); falta solo la
  validación auditiva real.

## 4. Límite real de minutos gratis de GitHub Actions en volumen alto

- **Problema:** no se midió cuántos minutos gratis quedan disponibles
  ni cuánto tardaría escalar de 20 a cientos de renders.
- **Afecta a:** Fase 10 (Producción en volumen).
- **Qué necesitamos:** revisar el uso actual de Actions en la cuenta de
  GitHub del operador (Settings → Billing) cuando se acerque ese
  volumen.
- **¿Bloquea el resto?** NO, es un problema de escala futura, no de la
  fábrica en sí.

## 5. Ideación automática (Fase 1 — Guion) requiere un LLM

- **Problema:** convertir una idea/brief en unidades narrativas
  tipadas con buen hook/ángulo es una tarea de lenguaje natural — no
  es algo que un script determinista pueda hacer bien solo. La
  especificación pide "$0 hasta ventas", y usar la API de un LLM de
  pago para esto de forma automática y desatendida violaría esa regla.
- **Afecta a:** Fase 1 (Guion / ideación).
- **Por qué no se resolvió como script automático:** decidí NO
  construir una llamada automática a un LLM pago dentro de la fábrica
  sin autorización explícita de gasto (regla 23 del prompt maestro).
- **Qué necesitamos:** decidir si el "Guion" se sigue escribiendo
  conversando conmigo (gratis, ya lo hacemos así) o si en algún
  momento se autoriza gastar en una API de generación de texto para
  automatizarlo del todo.
- **Qué se construyó igual:** los TIPOS y el CONTRATO de una unidad
  narrativa (`fabrica/guion/tipos.ts`), para que cuando el guion se
  escriba (a mano o conmigo) ya tenga la forma correcta que el resto
  de la fábrica espera.
- **¿Bloquea el resto?** NO bloquea Voz/Directores/Assets/QA (todos
  reciben unidades narrativas ya armadas, sin importar cómo se
  generaron). Sí bloquea la automatización end-to-end sin intervención
  humana en el primer paso, que además es justo lo que la
  especificación pide (autonomía PROGRESIVA, no total desde el día 1).

## 6. Composición → Render (Fase 8/8b) — RESUELTO: multi-audio generalizado, dos renders reales de punta a punta

- **Estado real (actualizado 2026-09-02):** el patrón `AudioCentro` de
  la serie documental (varios audios superpuestos dentro de UN mismo
  bloque visual) YA ESTÁ GENERALIZADO en `fabrica/composicion/armar.ts`
  -- cualquier unidad narrativa puede traer un array `ClipAudio[]`, y
  Composición calcula el offset acumulado exacto de cada clip dentro
  de la escena (probado con tests unitarios de offsets exactos, y con
  2 renders reales: `fabrica-demo-01`, 2 unidades, hasta 3 clips por
  unidad; `fabrica-demo-02`, 4 unidades con multi-audio en 3 de ellas,
  con asset de fondo resuelto por el resolver real y anti-repetición
  cruzando memoria entre videos). Ambos renders pasaron el QA duro sin
  problemas ni alertas.
- **Lo que sigue faltando:** ambos ejemplos usan audio YA EXISTENTE de
  la serie documental (no generan voz nueva, porque Qwen3-TTS no corre
  en este sandbox) y las unidades siguen armadas a mano en un script
  (no desde un guion nuevo real escrito para esto). Ver ítem 5 (Guion)
  y el ítem 3 de arriba (prueba de Qwen3-TTS ya preparada, falta que
  el operador la dispare).
- **Afecta a:** Fase 8 (Composición/Render) y, en menor medida, Fase 1
  (Guion — ver ítem 5).
- **¿Bloquea el resto?** NO. El caso multi-audio está resuelto y
  probado con render real; lo único que falta es contenido nuevo de
  verdad (guion + voz nueva), no una limitación técnica del sistema.

## 7. Datos reales / Aprendizaje (Fases 10-12) — sin datos todavía

- **Problema:** estas fases necesitan videos publicados con métricas
  reales (retención, vistas, ventas). No existen todavía para la serie
  nueva.
- **Afecta a:** Fases 10, 11, 12.
- **Qué necesitamos:** publicar contenido y esperar datos reales.
- **Qué se construyó igual:** el esquema de datos completo
  (`fabrica/memoria/laboratorio.json` + tipos) para que en cuanto haya
  el primer dato real, se pueda cargar sin rediseñar nada.
- **¿Bloquea el resto?** NO. Es esperable no tener esto todavía.

## 8. Qwen3-TTS avisa que `--instruct` + `--ref-audio` en el modelo Base no está oficialmente soportado — CONFIRMADO, sin resolver

- **Hecho confirmado (aparece en TODOS los logs de generación de esta
  ronda, tanto para el guion nuevo como para la prueba de
  normalización):**
  ```
  Warning: --instruct with voice cloning on a Base model is not
  officially supported. For best results, extract the voice with the
  Base model and use it with CustomVoice:
    ./qwen_tts -d qwen3-tts-1.7b-base --ref-audio ref.wav --save-voice voice.bin
    ./qwen_tts -d qwen3-tts-1.7b --load-voice voice.bin --instruct "..." --text "..."
  ```
- **Afecta a:** toda la generación de voz de la fábrica -- esta es la
  MISMA combinación de flags que ya usa `generar_voz_documental_qwen.py`
  (el script que generó la voz de los 20 videos documentales ya
  entregados), así que esto no es nuevo de esta sesión, solo ahora
  quedó documentado con evidencia directa del motor.
- **Por qué no se resuelve ahora:** el audio se sigue generando sin
  errores con la configuración actual, y no hay evidencia (todavía) de
  que la calidad esté degradada -- resolver esto requeriría escuchar
  primero (ver `PENDIENTES_OPERADOR.md` ítem 3) para saber si vale la
  pena migrar al patrón CustomVoice de dos pasos.
- **Qué hacer después, si hace falta:** extraer la voz UNA VEZ con
  `--save-voice` sobre el modelo Base, y usar ese archivo con
  `--load-voice` sobre el modelo CustomVoice (no-Base) en las
  generaciones futuras -- evita el warning y es el camino "soportado"
  según la propia documentación del motor.
- **¿Bloquea el resto?** NO. Genera audio utilizable hoy; es una
  posible mejora de calidad, no un error duro.

## 9. Bug real: un `while read ... done < archivo` con un comando que lee stdin adentro se desincroniza — RESUELTO

- **Encontrado corriendo por primera vez `prueba-normalizacion-qwen3-tts.yml`
  (Ronda 2):** de 8 frases a generar, solo se generó la primera --
  `qwen_tts` consumía parte del mismo file descriptor de stdin que el
  `while read` estaba iterando, desincronizando la lectura de la
  siguiente línea (sus campos aparecían mezclados: el índice numérico
  desaparecía, el id se corría al lugar del texto).
- **Fix aplicado** en `prueba-normalizacion-qwen3-tts.yml` y (desde el
  arranque) en `generar-voz-demo-03.yml`: cargar todas las líneas con
  `mapfile` primero (sin file descriptor compartido con el comando de
  adentro del loop) y redirigir el stdin de `qwen_tts` a `/dev/null`
  por las dudas. Confirmado con una segunda corrida exitosa (8/8
  frases generadas).
- **Lección para cualquier script futuro que llame a un binario externo
  dentro de un loop de bash que lee de un archivo:** nunca usar
  `while read ... done < archivo` si el comando de adentro puede tocar
  stdin -- usar `mapfile` + `for` es el patrón seguro.
- **¿Bloquea el resto?** NO, ya está resuelto.

## 10. Limitación real: componentes de la MISMA categoría tienen props completamente distintas

- **Encontrado corriendo `generar_demo_03.ts` por primera vez:** el
  Director Visual eligió "recibo" y "antes-despues" en vez de
  "grafico" y "balanza" -- prueba real de que el scoring por metadata
  funciona de verdad (no estaba hardcodeado), pero reveló que el
  script generador todavía necesita saber armar la forma de props
  correcta SEGÚN QUIÉN GANÓ, porque dos componentes de la categoría
  "cifra" (o "comparacion") pueden tener contratos de props
  completamente distintos (`grafico` espera una serie de puntos
  neutral; `recibo` espera un balance de dinero entra/sale con
  timings fijos por renglón).
- **Cómo se resolvió PARA ESTE video:** con un `if` sobre el id
  ganador dentro de `generar_demo_03.ts`, documentado inline como
  limitación conocida -- no con un generador de props 100% genérico
  (quedaría fuera del alcance de "fortalecer, no reescribir" de esta
  ronda).
- **Qué haría falta para una solución real:** un "adaptador de datos"
  por categoría (no por componente) que sepa transformar un modelo de
  datos neutral (ej. "una serie de {etiqueta, valor}") a la forma de
  props de CUALQUIER componente de esa categoría -- trabajo real de
  diseño para una próxima ronda si se agregan guiones con contenido
  variable, no una prueba puntual como esta.
- **¿Bloquea el resto?** NO. El caso puntual de este video quedó
  resuelto; la generalización es una mejora de robustez futura.

## 11. Cómo disparar un workflow que solo existe en una rama no-default (sin mergear a main)

- **Confirmado en esta ronda:** la API de GitHub para
  `workflow_dispatch` (por nombre de archivo o UI de Actions) solo
  reconoce un workflow si ya está registrado en la rama por defecto --
  un intento devuelve 404 si el archivo solo existe en una rama de
  trabajo.
- **Truco real (no un hack frágil, ya usado antes en este mismo repo
  para el mismo problema, ver commits de `remotion-diez.yml`):** un
  evento `push` SÍ lee el workflow desde la rama que recibió el push,
  sin depender de cuál es la rama por defecto. Agregar un trigger
  `push` acotado a la rama de trabajo, con `paths` apuntando al PROPIO
  archivo del workflow (para que el commit de resultados que el job
  hace al final -- que toca otros archivos -- nunca dispare un loop),
  soluciona esto sin necesitar ningún merge.
- **¿Bloquea el resto?** NO, ya resuelto y usado con éxito 3 veces
  esta ronda (música, prueba de normalización, voz del guion nuevo).
