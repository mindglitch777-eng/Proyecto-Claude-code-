import React from 'react';
import {AbsoluteFill, Solid, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {shine} from '@remotion/effects/shine';
import {PALETA, GROTESCA} from '../identidad';

// R7-25: pregunta real -- ¿`shine` (barrido de brillo) es GENERATIVO
// (se dibuja solo, como lightLeak) o necesita pixeles reales de abajo
// (como chromaticAberration/scanlines, que SI necesitan contenido
// visible)? Mismo truco que PruebaVineta.tsx: Solid transparente +
// texto real DEBAJO -- si el barrido se ve pasar sobre el texto sin
// taparlo de negro, es generativo y usable como overlay universal.
export const DUR_PRUEBA_SHINE = 60;

export const PruebaShine: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const progreso = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{color: PALETA.texto, fontFamily: GROTESCA, fontSize: 80, fontWeight: 700}}>$3.560</div>
      <Solid
        width={width}
        height={height}
        color="transparent"
        style={{position: 'absolute', top: 0, left: 0}}
        effects={[shine({progress: progreso, angle: 30, haloIntensity: 0.5, coreIntensity: 0.7})]}
      />
    </AbsoluteFill>
  );
};
