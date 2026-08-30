# Prueba de Remotion — no es parte del pipeline

Esto es un **spike**: el mismo guion (`contenido/nombre-por-pais.json`),
la misma paleta y las mismas fuentes, renderizado con Remotion en vez de
`animador_v9.py`. Sirve para decidir con números si conviene cambiar de
motor. **No toca nada del sistema de producción.**

```
./preparar-public.sh          # arma public/ desde assets/
npx remotion render pieza out/pieza.mp4 \
  --browser-executable=<ruta a headless_shell> --concurrency=4
```

## Qué se mantuvo igual a propósito

Paleta (`#0A0A0C` / `#F6F6F4` / `#FF4E24`), Playfair Display + Archivo,
1080×1920 a 30 fps, x264 CRF 18, las mismas cifras con su etiqueta
VERIFICADO y su fuente, los mismos cuatro estados de movimiento, y el
mismo hook con microestados. Si la prueba usara otra identidad estaría
midiendo mi gusto, no el motor.

## Lo que se midió

Misma máquina, 4 núcleos, mismo guion de 26.6 s:

| | motor actual (Pillow) | Remotion |
|---|---|---|
| tiempo de render | **39.7 s** | **57–62 s** |
| peso del mp4 | 2.0 MB | 7.5 MB |
| instalación | ya está | 252 paquetes, 19 s |
| tinta en el cuadro 0 | 1.42 % | 1.91 % |
| licencia | — | gratis hasta 3 empleados |

Remotion es ~1.5× más lento. El mp4 pesa más porque tiene metraje real
en movimiento, que es más información: no es peor compresión.

## Lo que Remotion hace que el motor actual NO puede

**Metraje en movimiento.** Es la única diferencia de *capacidad*, y es
real. `animador_v9.py` no decodifica video: pega un jpg y le hace zoom.
Acá `<OffthreadVideo>` compone el clip de verdad.

## Lo que resultó ser más barato de lo que yo pensaba

- **Layout de texto.** El centrado vertical del bloque, que en Pillow es
  medir cada línea, achicar el cuerpo en un `while` hasta que entre y
  sumar interlineados, acá es `justifyContent: 'center'`.
- **Fuentes variables.** El navegador resuelve los ejes solo; no hace
  falta `set_variation_by_axes` ni cachear el resultado.
- **Grading.** Tres pasadas de píxeles con LUT contra una línea de
  `filter: saturate() contrast() brightness() sepia()`.
- **Diagramas.** SVG con `stroke-dashoffset` animado en vez de calcular
  coordenadas de primitivas a mano.

## Lo que NO probó

- **Que se vea mejor.** La primera versión del gráfico me salió peor que
  la de Pillow (medio cuadro vacío, números chicos). La arreglé, pero
  eso mismo es el dato: el motor actual tiene meses de ajuste encima que
  acá habría que rehacer 34 veces, una por formato.
- **Audio.** El spike es sólo visual. El diseño sonoro por evento
  (`_eventos_sfx`), el `loudnorm` y la cadena de mezcla no están.
- **Las 34 maquetas.** Están cuatro: hook, escena, silueta y gráfico.
- **Validación y auditoría.** `validar_hook.py`, `auditar_hook.py`,
  `broll.py` y el sistema de evidencia siguen siendo del motor Python.

## El metraje de esta prueba es prestado

Se usaron clips de `assets/metraje_video/dinero/` como relleno, que no
son del tema del guion (el motor actual usa fotos correctas: el cartel
de San Telmo, la calle de Madrid). Para una comparación justa del
resultado final habría que bajar metraje de las consultas reales.
