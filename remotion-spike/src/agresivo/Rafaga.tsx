import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {GRADING, GROTESCA, PALETA} from '../identidad';

// Cortes duros, sin transicion, uno cada ~0.48s. Sirve para decir "esto
// pasa en todos los rubros" sin gastar un plano por rubro.
//
// Encima, una sola frase fija: si el texto tambien cortara, no se lee
// nada. El corte es del metraje, no de la idea.

export const Rafaga: React.FC<{clips: string[]; sello: string}> = ({clips, sello}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const porClip = durationInFrames / clips.length;
  const i = Math.min(clips.length - 1, Math.floor(frame / porClip));
  const local = frame - i * porClip;

  // Cada corte entra con un golpe de escala que se calma enseguida.
  const golpe = interpolate(local, [0, 4], [1.14, 1.0], {extrapolateRight: 'clamp'});
  // Un destello corto en el corte: lava el cuadro dos o tres cuadros.
  const flash = interpolate(local, [0, 3], [0.5, 0], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <AbsoluteFill style={{filter: GRADING, transform: `scale(${golpe})`}}>
        <OffthreadVideo
          key={clips[i]}
          src={staticFile(`video/${clips[i]}`)}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: 'rgba(0,0,0,0.5)'}} />
      <AbsoluteFill style={{backgroundColor: `rgba(255,255,255,${flash})`}} />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 8%',
        }}
      >
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontStretch: '82%',
            fontSize: 122,
            lineHeight: 0.96,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: PALETA.texto,
            textAlign: 'center',
            textShadow: '0 8px 50px rgba(0,0,0,0.95)',
          }}
        >
          {sello}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
