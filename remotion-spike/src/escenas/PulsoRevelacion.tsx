import React from 'react';
import {AbsoluteFill, Solid, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {rings} from '@remotion/effects/rings';
import {PALETA} from '../identidad';

/**
 * R7-25: segundo efecto real de @remotion/effects conectado a
 * produccion (despues de vignette). `rings` (a diferencia de `shine`,
 * probado y descartado el mismo dia -- ver PruebaShine.tsx) es
 * GENERATIVO de verdad: dibuja sus propios anillos, no necesita
 * pixeles reales debajo (confirmado con render real,
 * pruebas-r7/PruebaRings.tsx). Un pulso expansivo tipo "onda de
 * radar" en el momento exacto de una revelacion -- refuerza
 * visualmente el mismo instante que ya marca `intencion='revelar'`
 * del Director de Edicion, sin inventar un campo nuevo.
 */
export const PulsoRevelacion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  // Un solo pulso a lo largo de la escena, no un loop continuo -- se
  // apaga (opacity a 0) al llegar al final para no dejar un anillo
  // enorme congelado en pantalla el resto de la escena.
  const progreso = interpolate(frame, [0, Math.min(durationInFrames - 1, 45)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacidad = interpolate(frame, [0, 10, 35, 45], [0, 1, 1, 0], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: opacidad}}>
      <Solid
        width={width}
        height={height}
        color="transparent"
        style={{position: 'absolute', top: 0, left: 0}}
        effects={[rings({colors: [PALETA.acento, 'transparent'], thickness: 6, gap: 60, offset: progreso * 700})]}
      />
    </AbsoluteFill>
  );
};
