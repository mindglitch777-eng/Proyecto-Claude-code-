# Sistema de Scripts — Inventario y Protocolo

## Criterio de decision: ¿script o Claude Code?

**Va a SCRIPT si la respuesta es la misma siempre dada la misma
entrada.** Contar, sumar, comparar fechas, buscar texto, validar
formato, generar variaciones de una plantilla, ordenar por un numero.
Cero tokens, corre gratis, y NO alucina.

**Va a CLAUDE CODE si requiere juicio.** Evaluar si un nicho vale la
pena, escribir el contenido de un producto, decidir por que algo
fallo, redactar copy que persuada, elegir estrategia.

Regla practica: si lo vas a necesitar mas de una vez, no pidas el
resultado -- pedi la herramienta que produce el resultado.

---

## YA IMPLEMENTADOS
- `orchestrator.py` — cola de tareas, estado, gates, notificaciones
- `guardian.py` — techo de activos, gates olvidados, checkpoints
- `reporte.py` — portafolio por rendimiento real, señales accionables
- `variaciones.py` — genera N variantes de titulos desde una plantilla
- `animador.py` — video vertical basico (kinetic typography)
- `animador_pro.py` — version profesional: imagenes con Ken Burns,
  easing real, sombras, estilo de hook diferenciado, musica de fondo
  y efectos de sonido sincronizados

### AVISO LEGAL sobre assets (imagenes, musica, sfx)
Todo asset debe ser propio o de licencia libre verificada (Pexels,
Unsplash, Pixabay, Freesound -- revisando la licencia especifica de
cada archivo, no asumiendo). Usar material con derechos ajenos puede
costar un strike de copyright, la desmonetizacion, o el cierre del
canal. Este riesgo es real y no lo cubre ningun script: es un gate
humano mas.

---

## INVENTARIO DE SCRIPTS PENDIENTES
Ordenados por utilidad real. NO construir todos de una: uno por vez,
verificado, y solo si se va a usar de verdad.

### Prioridad alta (usar desde Fase 1)
1. **generador-variaciones.py** — toma una plantilla de titulo y una
   lista de keywords, genera N variaciones para pines/listados/videos.
   (El copy base lo escribe Claude una vez; las 200 variaciones las
   hace el script gratis.)
2. **validador-entregable.py** — chequea que un producto este completo
   antes de publicarlo: archivos presentes, tamaños razonables,
   descripcion con longitud minima, precio definido, sin campos
   placeholder tipo "TODO" o "XXX".
3. **recordatorio-distribucion.py** — detecta si pasaron X dias sin
   publicar en el canal principal y avisa por Telegram. (La constancia
   es el punto que mas se abandona.)

### Prioridad media (cuando haya varios activos)
4. **consolidador-log.py** — arma el resumen mensual leyendo
   `state/log.md`, sin que Claude tenga que releer todo el historico.
5. **detector-inactividad.py** — lista activos sin movimiento hace
   X dias, para decidir archivar o retomar.
6. **backup.py** — empaqueta el estado del proyecto para respaldo
   fuera de GitHub (elimina el punto unico de falla).

### Prioridad baja (solo si el volumen lo justifica)
7. **renombrador-assets.py** — normaliza nombres de archivos de
   diseños/videos segun una convencion.
8. **comparador-precios.py** — dado un CSV de precios de competencia,
   calcula rangos y posicionamiento sugerido.

### Lo que NO se scriptea (requiere criterio real)
- Decidir que nicho perseguir
- Escribir el contenido de un producto o guion
- Evaluar por que un lanzamiento fallo
- Redactar copy de venta
- Decidir si un diseño es bueno

---

## PIPELINE DE VIDEO: que es script y que es Claude

Este es el desglose que mas tokens ahorra, porque el video es la fase
mas repetitiva de todo el proyecto.

**SCRIPT (cero tokens, infinitas veces):**
- Renderizar el video completo → `animador.py` (YA IMPLEMENTADO)
- Animar texto palabra por palabra (kinetic typography)
- Fondos animados, gradientes, transiciones, barra de progreso
- Sincronizar subtitulos con audio (Whisper genera timestamps, un
  script los aplica)
- Concatenar clips, agregar musica de fondo, normalizar audio (ffmpeg)
- Exportar el mismo video en varios formatos (vertical/horizontal)
- Generar 50 miniaturas variando texto/color sobre una plantilla
- Renderizar un lote entero de videos de una vez

**CLAUDE CODE (requiere criterio, se paga una vez por pieza):**
- Escribir el guion: el hook, el ritmo, que hace que alguien no
  deslice hacia abajo
- Elegir el tema del video segun lo que funciono antes
- Decidir el estilo visual de la marca (una vez, va a `brand.md`)
- Evaluar por que un video no retuvo audiencia

**Regla del pipeline**: Claude escribe el guion en JSON, el script lo
renderiza. Un video nuevo = un guion nuevo (barato), no un render
nuevo pensado desde cero (caro).

**Objetivo de calidad visual**: el estandar es que el video se vea
profesional por si solo -- que alguien no pueda distinguirlo de uno
hecho en un editor de escritorio. Claude Code debe empujar el limite
tecnico de Python aca (composicion por capas, easing, particulas,
mascaras, transiciones, sincronizacion con audio), porque el techo de
lo que se puede hacer con codigo es MUY alto y el costo por render es
cero. Mejoras concretas a implementar cuando la Fase 3 arranque:
transiciones entre segmentos, voz TTS (Piper) con subtitulos
sincronizados via Whisper, B-roll de video (no solo fotos), y
plantillas visuales reutilizables definidas en `brand.md`.

**Pero ojo con el orden de importancia**: en video corto, el HOOK
(los primeros 2 segundos y que tan bien esta escrita la primera frase)
pesa mas en retencion que cualquier efecto visual. Un video hermoso
con mal hook no retiene; uno simple con gran hook si. La calidad
visual hace que se vea creible y profesional -- el guion hace que se
quede. Por eso el guion sigue siendo trabajo de Claude Code y no se
scriptea nunca.

**Librerias Python para animacion, todas open source:**
- **Pillow + ffmpeg** — lo que usa `animador.py`. Liviano, sin GPU,
  corre en cualquier lado. Suficiente para kinetic typography.
- **Manim** — la libreria con la que 3Blue1Brown hace sus videos.
  Nivel profesional para explicaciones tecnicas/matematicas. Mas
  pesada (requiere Cairo, y LaTeX si se usan formulas).
- **MoviePy** — edicion no lineal por codigo: cortar, concatenar,
  componer capas, efectos. Buena para armar videos desde clips
  existentes.
- **matplotlib.animation** — para graficos de datos animados.

---

## PROTOCOLO: como pedirle un script a Claude Code

Plantilla a usar (no improvisar el pedido):

```
Escribi el script `<nombre>.py` para este proyecto.

QUE TIENE QUE HACER:
[descripcion en una o dos frases]

ENTRADA: [de donde saca los datos]
SALIDA: [que devuelve exactamente]

REQUISITOS OBLIGATORIOS:
- Cero dependencias externas si es posible (solo libreria estandar).
- No usa ningun LLM ni API paga. Logica determinista pura.
- No borra ni sobreescribe datos existentes sin confirmacion.
- Falla de forma clara y explicita si algo esta mal, en vez de
  devolver un resultado silenciosamente incorrecto.
- Docstring arriba explicando uso, con ejemplos de comandos.

ANTES DE DARMELO POR TERMINADO:
1. Corrélo con datos de ejemplo realistas y mostrame la salida.
2. Corrélo con un caso limite (archivo vacio, dato faltante,
   numero cero) y mostrame que no se rompe.
3. Decime explicitamente que verificaste y que NO verificaste.
```

## PROTOCOLO: como verificar que el script sirve

Un script no esta terminado porque corre sin error. Chequear:

1. **¿La salida es correcta, no solo presente?** Calcular a mano un
   caso chico y comparar con lo que devuelve el script. Si no
   coinciden, el script miente con confianza -- que es peor que no
   tenerlo.
2. **¿Que hace con datos faltantes?** Un script que asume 0 cuando
   falta un dato puede hacerte tomar una decision equivocada.
3. **¿Es reversible?** Si escribe archivos, ¿se puede deshacer?
4. **¿Lo vas a usar realmente?** Un script que nadie corre es deuda
   tecnica, no una herramienta. Si no lo usaste en 2 semanas, borralo.

## Regla de mantenimiento
Todo script vive en la raiz del repo y se documenta en una linea en
este archivo cuando se crea. Si un script deja de usarse, se borra --
no se acumulan herramientas muertas que confunden a la proxima sesion.
