#!/usr/bin/env bash
# Arma remotion-spike/public/ con las fuentes, fotos y metraje que la
# pieza pide. No se versiona: se regenera aca y en el runner.
set -euo pipefail
raiz="$(cd "$(dirname "$0")/.." && pwd)"
dst="$raiz/remotion-spike/public"
rm -rf "$dst"; mkdir -p "$dst/fuentes" "$dst/fotos" "$dst/video" "$dst/sfx" "$dst/audio_documental"

cp "$raiz/assets/fuentes/PlayfairDisplay-Variable.ttf" "$dst/fuentes/"
cp "$raiz/assets/fuentes/PlayfairDisplay-Italic.ttf"   "$dst/fuentes/"
cp "$raiz/assets/fuentes/Archivo-Variable.ttf"         "$dst/fuentes/"

# Fotos: las mismas que ya usa el guion en el motor actual.
for d in "$raiz"/assets/biblioteca/*/; do
  n="$(basename "$d")"
  [ -f "$d/00.jpg" ] && cp "$d/00.jpg" "$dst/fotos/$n.jpg"
done

# Fotos de personas reales (casos documentales), bajadas por
# descargar_foto_persona.py. Van a la misma carpeta fotos/ que usa
# staticFile('fotos/...'), con el slug como nombre.
for d in "$raiz"/assets/personas/*/; do
  n="$(basename "$d")"
  [ -f "$d/00.jpg" ] && cp "$d/00.jpg" "$dst/fotos/$n.jpg"
done

# Metraje en movimiento: lo que haya. La pieza elige por nombre y si
# falta un clip cae a la foto equivalente.
for f in "$raiz"/assets/metraje_video/*/*.mp4; do
  [ -e "$f" ] || continue
  cp "$f" "$dst/video/$(basename "$f")"
done

# Efectos de sonido: sintetizados con sfx.py, sin problema de licencia
# (son ondas generadas, no grabaciones bajadas de ningun lado).
for f in "$raiz"/assets/sfx/*.wav; do
  [ -e "$f" ] || continue
  cp "$f" "$dst/sfx/$(basename "$f")"
done

# Audio narrado de los 20 documentales (Qwen3-TTS, voz clonada) --
# generado por generar_voz_documental_qwen.py, commiteado en
# capturas_voz/ (a diferencia de public/, que no se versiona).
for f in "$raiz"/capturas_voz/audio_documental/*.mp3; do
  [ -e "$f" ] || continue
  cp "$f" "$dst/audio_documental/$(basename "$f")"
done

echo "public/ armado:"
echo "  fuentes $(ls "$dst/fuentes" | wc -l)  fotos $(ls "$dst/fotos" | wc -l)  video $(ls "$dst/video" | wc -l)  sfx $(ls "$dst/sfx" | wc -l)  audio_documental $(ls "$dst/audio_documental" | wc -l)"
