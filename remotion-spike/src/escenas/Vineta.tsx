import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * R7-24: primera integración a producción de una viñeta (oscurecer los
 * bordes, dejar el centro limpio) para el estilo 'cinematico' que el
 * Director de Edición asigna automáticamente.
 *
 * Reescrito en esta ronda (2026-09-06): la versión original usaba
 * `@remotion/effects/vignette`, que crea un contexto WebGL2 por
 * instancia montada. Un guion real (prueba-efectos-nuevos, 5 de 9
 * escenas con estilo 'cinematico' -- más denso que cualquier video
 * anterior) agotó el límite de contextos WebGL2 que Chrome permite por
 * pestaña, y el render falló de forma determinística ("Failed to
 * acquire WebGL2 context") -- no fue un flake, se reprodujo dos veces
 * seguidas. Riesgo real preexistente para CUALQUIER video con varias
 * escenas 'cinematico', no solo este. Reemplazado por un
 * radial-gradient de CSS puro -- mismo resultado visual (esquinas
 * oscurecidas, centro transparente), cero contextos WebGL, cero
 * riesgo de agotar el límite del navegador.
 *
 * Traducción de los parámetros originales de `vignette({mode:'color',
 * color:'#000000', amount:0.55, radius:0.6, feather:0.4})`: radius=0.6
 * es donde empieza a oscurecer (como fracción del radio del
 * radial-gradient), radius+feather=1.0 es donde llega a `amount` de
 * opacidad -- coincide con el 100% del gradiente, así que se traduce
 * directo sin aproximar nada.
 */
export const Vineta: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.55) 100%)',
    }}
  />
);
