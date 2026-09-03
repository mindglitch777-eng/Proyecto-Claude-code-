import React from 'react';
import {AbsoluteFill, Solid, useVideoConfig} from 'remotion';
import {vignette} from '@remotion/effects/vignette';

/**
 * R7-24: primera integración REAL a producción de @remotion/effects
 * más allá de lightLeak (golpes.tsx) -- la pregunta de diseño ya se
 * había respondido en R6-9 (`pruebas-r6/PruebaVineta.tsx`, frame real
 * `remotion-spike/out/frame-vineta2.png`): `vignette({mode:'color'})`
 * sobre un `<Solid color="transparent">` oscurece los bordes dejando
 * el CENTRO transparente -- el contenido de abajo se ve normal, solo
 * se oscurecen las esquinas. Quedó probado pero nunca conectado a
 * ninguna escena real -- este componente es exactamente eso, listo
 * para usar como overlay.
 */
export const Vineta: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Solid
        width={width}
        height={height}
        color="transparent"
        style={{position: 'absolute', top: 0, left: 0}}
        effects={[vignette({mode: 'color', color: '#000000', amount: 0.55, radius: 0.6, feather: 0.4})]}
      />
    </AbsoluteFill>
  );
};
