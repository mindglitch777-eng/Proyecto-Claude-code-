// EL SISTEMA ELIGE LA PALETA SEGUN CONVENGA
//
// Esto es lo que el operador pidio: "una marca y paleta ya elegida
// dependiendo de que convenga", sin que el tenga que decidirlo video
// por video.
//
// IMPORTANTE, para no prometer de mas: esta primera version elige y
// DEJA REGISTRADA la decision (en el plan del video, y en el archivo
// de metadata que arma la fabrica). Lo que todavia NO hace esta noche
// es cambiar el color de cada componente segun la paleta elegida --
// eso significa que cada una de las ~25 piezas visuales tiene que leer
// la paleta de un contexto en vez de importar el color fijo de
// identidad.ts, y es un cambio que toca todos los archivos del
// bloque 1. Tocarlo apurado esta noche, sin poder mirar cada resultado
// renderizado, es mas riesgo que valor: mejor la decision este tomada
// y documentada, y mañana se aplica con tiempo de revisar cada pieza.

export type Paleta = {
  id: string;
  fondo: string;
  texto: string;
  acento: string;
};

export const PALETAS: Paleta[] = [
  {id: 'editorial', fondo: '#0A0A0C', texto: '#F6F6F4', acento: '#FF4E24'}, // la de siempre: negro, hueso, naranja
  {id: 'urgencia', fondo: '#0A0A0C', texto: '#F6F6F4', acento: '#FF2D3D'}, // rojo -- perdida, riesgo, plazo
  {id: 'confianza', fondo: '#0A0F0C', texto: '#F0F4F2', acento: '#3ED88C'}, // verde -- plata que entra, resultado
  {id: 'frio', fondo: '#08090F', texto: '#EEF2FF', acento: '#4E8BFF'}, // azul -- datos, tecnologia, analisis
];

// Palabras que inclinan la eleccion. Se buscan en el tema + titulo del
// guion. Si nada matchea, cae a 'editorial' -- la identidad de base.
const SEÑALES: {paleta: string; palabras: string[]}[] = [
  {paleta: 'urgencia', palabras: ['perdes', 'perder', 'riesgo', 'urgente', 'fundio', 'fundido', 'no vas a', 'ultimo']},
  {paleta: 'confianza', palabras: ['gana', 'ganar', 'factura', 'plata', 'dinero', 'cobra', 'vender', 'venta', 'oferta']},
  {paleta: 'frio', palabras: ['dato', 'ia', 'inteligencia artificial', 'algoritmo', 'sistema', 'analisis', 'medir']},
];

function normalizar(t: string) {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function elegirPaleta(textoGuion: string): Paleta {
  const t = normalizar(textoGuion);
  let mejor: {paleta: string; puntos: number} | null = null;
  for (const s of SEÑALES) {
    const puntos = s.palabras.filter((p) => t.includes(normalizar(p))).length;
    if (puntos > 0 && (!mejor || puntos > mejor.puntos)) mejor = {paleta: s.paleta, puntos};
  }
  return PALETAS.find((p) => p.id === (mejor?.paleta ?? 'editorial')) ?? PALETAS[0];
}
