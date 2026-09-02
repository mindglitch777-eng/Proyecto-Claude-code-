# Pendientes y bloqueos — Nueva Fábrica

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

## 3. Calidad de Qwen3-TTS con números/monedas/fechas en español — PREPARADO, falta que el operador lo dispare

- **Qué se construyó esta sesión:** `fabrica/voz/preparar_prueba_qwen.py`
  arma un lote de 8 frases reales que cubren dinero, porcentaje, fecha
  completa (con barras y en palabras), cantidad grande, nombre propio
  (personas reales de `assets/personas/`), abreviatura, año, decimal y
  número suelto -- cada una ya pasada por el normalizador real, en
  `capturas_voz/manifest_prueba_normalizacion.json`. El workflow
  `.github/workflows/prueba-normalizacion-qwen3-tts.yml` ya está listo
  para generar audio real de esas 8 frases con la MISMA configuración
  de producción (modelo Base 1.7B, voz clonada librivox-11, mismo
  instruct + rate 1.25 que `generar_voz_documental_qwen.py`), con
  variantes opcionales calmo/urgente para probar distintas
  intensidades, y calcula la duración real de cada wav para compararla
  contra la duración estimada del manifest.
- **Por qué no lo disparé yo mismo:** el workflow solo existe en la
  rama de trabajo de esta sesión (`claude/organize-repo-duplicates-xl042t`).
  La API de GitHub para disparar un workflow_dispatch por nombre de
  archivo solo lo reconoce si el workflow ya está en la rama por
  defecto (`main`) -- lo confirmé al intentarlo (404). Esta sesión
  tiene instrucción explícita de NUNCA pushear a una rama distinta de
  la asignada, así que mergear a `main` yo mismo está fuera de lo que
  puedo decidir solo.
- **Qué necesita el operador (acción concreta, 2 minutos):** mergear
  esta rama (o al menos el archivo del workflow) a `main`, y despues
  disparar "prueba-normalizacion-qwen3-tts" desde la pestaña Actions
  de GitHub (o pedirme que lo dispare yo vía API una vez mergeado).
  Tarda unos 15-30 minutos en correr (baja el modelo, ~3GB) y al
  terminar comitea los mp3 en `muestras_voz/prueba_normalizacion/`.
- **Qué hacer con el resultado:** escuchar los 8 mp3 (pronunciación de
  números/fechas/nombres) y comparar la duración real que loguea el
  workflow contra `duracion_estimada_seg` del manifest.
- **¿Bloquea el resto?** NO. El normalizador ya produce el texto
  hablado correcto según reglas de español (con tests); falta solo la
  validación auditiva real, que depende de que el operador dispare el
  workflow.

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
