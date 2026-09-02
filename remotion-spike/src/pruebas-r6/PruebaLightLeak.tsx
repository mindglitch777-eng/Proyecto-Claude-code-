import React from 'react';
import {AbsoluteFill, Solid, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {lightLeak} from '@remotion/effects/light-leak';
import {PALETA, GROTESCA} from '../identidad';

// R6-9: a diferencia de vignette() (ver PruebaVineta.tsx -- resulto
// mas opaco de lo esperado sobre un Solid transparente, descartado
// para "cortina"), lightLeak() esta documentado explicitamente como
// usable "como capa decorativa encima de MyContent" -- se prueba en
// aislado antes de reemplazar el golpe 'cortina' real.
export const DUR_PRUEBA_LIGHTLEAK = 60;

export const PruebaLightLeak: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{color: PALETA.texto, fontFamily: GROTESCA, fontSize: 70, fontWeight: 700}}>CONTENIDO DEBAJO</div>
      <Solid
        width={width}
        height={height}
        color="transparent"
        style={{position: 'absolute', top: 0, left: 0}}
        effects={[lightLeak({progress, hueShift: 20})]}
      />
    </AbsoluteFill>
  );
};
