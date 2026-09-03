import React from 'react';
import {AbsoluteFill, Solid, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {rings} from '@remotion/effects/rings';
import {PALETA, GROTESCA} from '../identidad';

// R7-25: `rings` (maskToSourceAlpha default false) deberia ser
// GENERATIVO como vignette/lightLeak -- pregunta real: ¿se dibuja
// solo sobre un Solid transparente, con el texto real DEBAJO
// visible? (mismo test que fallo con `shine`, que resulto necesitar
// pixeles reales -- esto confirma si `rings` es la excepcion o la
// regla).
export const DUR_PRUEBA_RINGS = 60;

export const PruebaRings: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const offset = interpolate(frame, [0, durationInFrames - 1], [0, 500], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{color: PALETA.texto, fontFamily: GROTESCA, fontSize: 80, fontWeight: 700, zIndex: 1}}>$3.560</div>
      <Solid
        width={width}
        height={height}
        color="transparent"
        style={{position: 'absolute', top: 0, left: 0}}
        effects={[rings({colors: [PALETA.acento, 'transparent'], thickness: 30, gap: 40, offset})]}
      />
    </AbsoluteFill>
  );
};
