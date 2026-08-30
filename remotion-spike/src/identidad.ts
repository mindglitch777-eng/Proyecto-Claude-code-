// Los MISMOS valores que estilos.py (estilo VS / lenguaje EDITORIAL) y
// animador_v9.py. Si la prueba usara otra paleta u otras fuentes, la
// comparacion mediria mi gusto y no el motor.

export const PALETA = {
  fondo: '#0A0A0C', // [10, 10, 12]
  texto: '#F6F6F4', // [246, 246, 244]
  acento: '#FF4E24', // [255, 78, 36]
} as const;

export const ANCHO = 1080;
export const ALTO = 1920;
export const FPS = 30;

// §1. Zona segura: TikTok y Shorts dibujan su interfaz encima.
export const SEGURA_ARRIBA = 0.08;
export const SEGURA_ABAJO = 0.2;

// Las mismas familias que fnt() en animador_v9.py.
export const SERIF = '"Playfair Display", Georgia, serif';
export const GROTESCA = '"Archivo", "Helvetica Neue", Arial, sans-serif';

// Grading: la version en CSS de gradear() -- igualar exposicion,
// desaturar y virar. filter() hace en una linea lo que alla son tres
// pasadas de pixeles con una LUT.
export const GRADING =
  'saturate(0.68) contrast(1.06) brightness(0.82) sepia(0.12)';
