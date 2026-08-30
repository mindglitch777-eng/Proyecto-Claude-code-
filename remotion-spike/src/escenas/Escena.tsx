import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bloque} from '../Bloque';
import type {Idea} from '../guion';
import {GRADING, PALETA} from '../identidad';

// Los mismos cuatro estados que MOVIMIENTO en animador_v9.py.
const MOV = {
  STATIC: [1.0, 1.0],
  SUBTLE: [1.0, 1.03],
  ACTIVE: [1.0, 1.12],
  BURST: [1.045, 1.045],
} as const;

export const Escena: React.FC<{idea: Extract<Idea, {tipo: 'escena'}>; conVideo: boolean}> = ({
  idea,
  conVideo,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const p = idea.planos[0];
  const [z0, z1] = MOV[p.mov];
  const zoom = interpolate(frame, [0, durationInFrames], [z0, z1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <AbsoluteFill
        style={{
          filter: GRADING,
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
        }}
      >
        {conVideo && p.clip ? (
          // ESTA es la diferencia estructural. El motor actual no puede
          // decodificar video: pega un jpg y le hace zoom. Acá el plano
          // se mueve de verdad.
          <OffthreadVideo
            src={staticFile(`video/${p.clip}`)}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        ) : p.foto ? (
          <Img
            src={staticFile(`fotos/${p.foto}`)}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        ) : null}
      </AbsoluteFill>

      {/* El velo, para que el texto se lea sobre el metraje. */}
      <AbsoluteFill style={{backgroundColor: 'rgba(0,0,0,0.44)'}} />

      <Bloque lineas={idea.lineas} entra={idea.entra} tam={92} sombra />
    </AbsoluteFill>
  );
};
