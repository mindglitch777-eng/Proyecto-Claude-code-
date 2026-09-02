# Pendientes y bloqueos — Nueva Fábrica

Este archivo es la lista concreta de lo que necesita intervención,
investigación o decisión humana. Se actualiza a medida que se
construye, nunca se inventa una solución para cerrar un ítem acá.

Formato de cada ítem: problema / parte afectada / por qué no se
resolvió / qué necesitamos / qué hacer después / si bloquea el resto
del sistema o no.

---

## 1. Timestamps palabra-por-palabra de Qwen3-TTS — NO CONFIRMADO

- **Problema:** no se sabe si el motor `qwen3-tts` (C,
  gabriele-mastrapasqua/qwen3-tts) expone alineación interna
  (timestamps por palabra o fonema) o si solo entrega el WAV final.
- **Afecta a:** Fase 3 (Voz) — sincronización fina palabra-por-palabra
  dentro de una unidad narrativa larga (hoy la sincronización es por
  UNIDAD completa, no por palabra dentro de la unidad).
- **Por qué no se resolvió:** requiere leer el código fuente del motor
  a fondo o instrumentarlo directamente; no se hizo en esta sesión por
  prioridad (se avanzó todo lo demás primero).
- **Qué necesitamos:** que alguien lea el repo
  `gabriele-mastrapasqua/qwen3-tts` (o yo lo haga en una próxima
  sesión) buscando específicamente flags de alineación/timestamps.
- **Qué hacer después:** si no expone alineación, evaluar correr un
  forced-aligner gratuito (ej. whisper con timestamps) como paso
  posterior sobre el audio ya generado.
- **¿Bloquea el resto?** NO. El sistema funciona con sincronización por
  unidad completa (ya probado en los 20 videos documentales). Palabra
  por palabra es una mejora, no un requisito para operar.

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

## 3. Calidad de Qwen3-TTS con números/monedas/fechas en español — NO MEDIDO

- **Problema:** no se midió específicamente cómo pronuncia el modelo
  números grandes, monedas y fechas ya normalizados por
  `fabrica/voz/normalizador.py` (sí se probó con frases narrativas
  comunes en la serie documental).
- **Afecta a:** Fase 3 (Voz) — calidad real del resultado final.
- **Qué necesitamos:** escuchar un lote de muestras generadas con el
  normalizador nuevo (se puede armar apenas se corra el motor en
  GitHub Actions).
- **¿Bloquea el resto?** NO. El normalizador ya produce el texto
  hablado correcto según reglas de español; falta solo la validación
  auditiva.

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

## 6. Composición → Render (Fase 8/8b) — probado de punta a punta solo con un ejemplo de 2 unidades

- **Estado real:** SÍ se probó de punta a punta y SÍ funcionó al
  primer render (`fabrica/ejemplos/generar_demo_01.ts` →
  `remotion-spike/src/fabrica_bridge/FabricaVideo.tsx`, composición
  `fabrica-demo-01`): el Director Visual eligió "cronologia" y
  "contador" sin que nadie los nombrara a mano, el Director de Audio
  decidió los golpes, Composición calculó los offsets desde audio real
  (clips reales ya generados de la serie documental, concatenados con
  ffmpeg), y Remotion renderizó un mp4 real de 17.56s con video+audio,
  verificado con el propio QA duro de la fábrica.
- **Lo que falta para llamarlo "completo":** el ejemplo tiene 2
  unidades armadas a mano (no un guion real nuevo de punta a punta con
  hook+desarrollo+cierre), y usa audio YA EXISTENTE en vez de generar
  voz nueva (el motor Qwen3-TTS no corre en este sandbox). Tampoco
  prueba componentes que llevan MÁS DE UN audio superpuesto dentro de
  un mismo bloque (patrón `AudioCentro` de `CasoGenerico.tsx` — ver
  nota abajo).
- **Afecta a:** Fase 8 (Composición/Render) y, en menor medida, Fase 1
  (Guion — ver ítem 5).
- **Qué necesitamos:** el primer guion real completo (a mano o
  conversando conmigo) para correr la fábrica con contenido nuevo de
  verdad, generando voz nueva vía GitHub Actions.
- **Limitación de diseño encontrada (no un bug, una decisión pendiente):**
  `fabrica/composicion/armar.ts` modela 1 unidad = 1 audio = 1 escena.
  El patrón `AudioCentro` de la serie documental (varios audios
  superpuestos dentro de UN bloque visual, ej. una Cronología con 3
  hitos cada uno con su propio clip) es más rico y NO está generalizado
  todavía en la fábrica nueva -- el demo de esta sesión usó un truco
  legítimo pero manual (concatenar los 3 clips en un solo archivo) en
  vez de resolver el caso general. Generalizar esto es trabajo real de
  una próxima sesión si se necesitan bloques multi-audio.
- **¿Bloquea el resto?** NO. El caso simple (1 unidad = 1 audio) que sí
  está resuelto cubre highlight/hook/cierre de un video perfectamente;
  el caso multi-audio-por-bloque es una mejora, no un bloqueo.

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
