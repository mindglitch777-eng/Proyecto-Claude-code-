import {continueRender, delayRender, staticFile} from 'remotion';

// Las mismas variables que usa fnt() en animador_v9.py, pero acá el
// navegador resuelve los ejes de variacion solo: en Pillow hay que
// llamar a set_variation_by_axes y cachear el resultado a mano.
const CSS = `
@font-face {
  font-family: 'Playfair Display';
  src: url('${staticFile('fuentes/PlayfairDisplay-Variable.ttf')}') format('truetype');
  font-weight: 400 900;
  font-style: normal;
}
@font-face {
  font-family: 'Playfair Display';
  src: url('${staticFile('fuentes/PlayfairDisplay-Italic.ttf')}') format('truetype');
  font-weight: 400 900;
  font-style: italic;
}
@font-face {
  font-family: 'Archivo';
  src: url('${staticFile('fuentes/Archivo-Variable.ttf')}') format('truetype');
  font-weight: 100 900;
  font-stretch: 62% 125%;
  font-style: normal;
}
`;

let puesto = false;

export const cargarFuentes = () => {
  if (puesto) {
    return;
  }
  puesto = true;
  const el = document.createElement('style');
  el.textContent = CSS;
  document.head.appendChild(el);

  // Sin esto el primer cuadro puede salir con la fuente de reserva --
  // exactamente el tipo de error que en el motor actual no existe
  // porque las fuentes se abren de forma sincronica.
  const espera = delayRender('cargando fuentes');
  document.fonts.ready.then(() => continueRender(espera));
};
