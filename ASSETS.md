# Assets: musica, efectos, imagenes y voz

## REGLA DE ORO
Nunca descargar audio de YouTube/TikTok con conversores (y2mate,
savefrom, etc.). Viola los terminos de servicio y puede derivar en un
strike de Content ID, perder la monetizacion, o el cierre del canal
a los 3 strikes. Existen fuentes gratuitas legales de calidad
equivalente -- no hay razon para arriesgar el activo.

---

## MUSICA GRATUITA (verificado 2026)

### Las mas seguras
| Fuente | Costo | Atribucion | Nota importante |
|---|---|---|---|
| **Pixabay Music** | Gratis | No requiere | Mejor opcion general. Uso comercial permitido. Tiene seccion "tiktok" con tracks de feel viral |
| **YouTube Audio Library** | Gratis | No requiere | Garantia total de Content ID **en YouTube**. OJO: puede generar reclamos si se usa en Instagram/Facebook |
| **Uppbeat** | Gratis (3/mes) | Si, en tier gratis | Su fuerte: whitelisting cross-platform (YouTube, IG, TikTok, FB) |
| **Mixkit** | Gratis | No requiere | Buen fit para Reels/Shorts, BPM claro |
| **Free Music Archive** | Gratis | Varia por track | Verificar licencia de CADA track |
| **Bensound / Incompetech** | Gratis con credito | Si | Calidad cinematica |
| **NCS** | Gratis | Si, obligatoria | EDM/hype, muy usado en edits |

### Advertencia sobre la YouTube Audio Library
Es la mas segura EN YouTube, pero como este proyecto publica tambien
en TikTok (Fase 6), conviene priorizar **Pixabay** o **Uppbeat** que
cubren varias plataformas -- asi el mismo video sirve en las dos sin
riesgo.

### Tipos de licencia (leer siempre la del archivo puntual)
- **CC0 / Dominio publico**: uso libre sin credito. La mas comoda.
- **CC-BY**: gratis pero exige credito visible.
- **Royalty-free**: no significa "gratis" -- significa que se paga una
  vez y se usa muchas veces. Puede exigir credito o prohibir
  modificaciones.

---

## EFECTOS DE SONIDO (SFX)
- **Freesound.org** — enorme, pero cada archivo tiene licencia propia:
  verificar una por una (hay CC0 y CC-BY mezclados).
- **Pixabay SFX** — gratis, sin atribucion.
- **Mixkit SFX** — gratis, buena seleccion de whoosh/impacto/riser.

Los tres tipos que mas rinden en video corto: **whoosh** (transiciones),
**impacto/boom** (el hook), **riser** (antes de una revelacion).

---

## IMAGENES Y B-ROLL
- **Pexels** y **Unsplash** — fotos y video gratis, uso comercial.
- **Pixabay** — las tres cosas en un solo lugar.
- Evitar: imagenes de Google Images (casi siempre con derechos).

---

## VOZ (TTS) — Piper, open source y gratis
Instalacion y uso verificados:
```
pip install piper-tts
python3 -m piper.download_voices es_ES-davefx-medium
echo "tu texto" | python3 -m piper -m es_ES-davefx-medium -f voz.wav
```
Voces en español disponibles:
- `es_ES-davefx-medium` — masculina, España, buena base
- `es_ES-sharvard-medium` — alternativa España
- `es_MX-ald-medium` — mexicana
- `es_AR-daniela-high` — argentina/rioplatense, calidad alta

`animador_v3.py` ya lo integra: con `"tts": true` en el guion, genera
la voz Y ajusta la duracion de cada segmento a la duracion real del
audio -- o sea que el texto queda sincronizado con la voz solo.

Nota: los modelos de voz se descargan de HuggingFace. Si el entorno
tiene la red restringida, hay que permitir ese dominio o descargar el
modelo una vez y commitearlo al repo.

---

## ORGANIZACION EN EL REPO
```
assets/
  musica/      (con un LICENCIAS.txt indicando fuente y licencia)
  sfx/
  imagenes/
  voces/       (modelos .onnx de Piper si se commitean)
```
Regla: por cada archivo descargado, anotar en `assets/LICENCIAS.txt`
de donde salio y bajo que licencia. Si mas adelante llega un reclamo,
esa lista es la defensa. Sin eso, no hay forma de probar nada.
