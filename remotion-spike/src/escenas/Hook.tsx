import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bloque} from '../Bloque';
import type {Idea} from '../guion';
import {PALETA} from '../identidad';

export const Hook: React.FC<{idea: Extract<Idea, {tipo: 'hook'}>}> = ({idea}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // El mismo asentamiento de hk_golpe: 1.055 -> 1.000 en 0.22s, sin
  // lavado blanco y sin recortar la primera linea fuera del cuadro.
  const z = interpolate(frame, [0, 0.22 * fps], [1.055, 1.0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: 'center'}}>
        <Bloque lineas={idea.lineas} entra={idea.entra} centrado tam={100} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
