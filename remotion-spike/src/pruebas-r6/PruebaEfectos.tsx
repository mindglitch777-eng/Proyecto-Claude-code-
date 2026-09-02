import React from 'react';
import {AbsoluteFill, Solid, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {glow} from '@remotion/effects/glow';
import {vignette} from '@remotion/effects/vignette';
import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {PALETA, GROTESCA} from '../identidad';

// R6-7: prueba aislada de @remotion/effects. Esta es la pregunta de
// mayor riesgo real de la tanda: necesita WebGL2 en el headless_shell.
// remotion.config.ts ya tiene setChromiumOpenGlRenderer('angle') puesto
// de antes -- si esta composicion renderiza sin pantalla negra/error,
// queda confirmado que el entorno actual soporta el motor de efectos
// sin cambios adicionales.
export const DUR_PRUEBA_EFECTOS = 60;

export const PruebaEfectos: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const progreso = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, justifyContent: 'center', alignItems: 'center'}}>
      <Solid
        width={width}
        height={height}
        color={PALETA.acento}
        effects={[
          glow({intensity: progreso}),
          vignette({radius: 0.8, amount: 0.6}),
          chromaticAberration({amount: progreso * 8, angle: 0}),
        ]}
      />
      <div
        style={{
          position: 'absolute',
          color: PALETA.texto,
          fontFamily: GROTESCA,
          fontSize: 70,
          fontWeight: 700,
        }}
      >
        EFECTOS WEBGL2
      </div>
    </AbsoluteFill>
  );
};
