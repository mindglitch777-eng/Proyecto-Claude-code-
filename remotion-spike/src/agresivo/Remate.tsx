import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Remate as Datos} from '../contenido10';
import {GROTESCA, PALETA} from '../identidad';

// Version generica de Veredicto: tres lineas cortas que se apilan y
// despues la cifra o la frase que remata, sobre metraje oscurecido.

export const Remate: React.FC<{d: Datos; clip: string}> = ({d, clip}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;

  const ent = (t0: number) =>
    spring({frame: frame - t0 * fps, fps, config: {damping: 16, stiffness: 200, mass: 0.5}});

  const tLinea = (i: number) => i * dur * 0.16;
  const tGrande = dur * 0.55;
  const zoom = interpolate(frame, [0, durationInFrames], [1.12, 1.0]);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <AbsoluteFill
        style={{filter: 'saturate(0.5) brightness(0.5) contrast(1.1)', transform: `scale(${zoom})`}}
      >
        <OffthreadVideo
          src={staticFile(`video/${clip}`)}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: 'rgba(0,0,0,0.58)'}} />

      <AbsoluteFill
        style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 7%', gap: 14}}
      >
        {d.lineas.map((l, i) => {
          if (t < tLinea(i)) return null;
          const s = ent(tLinea(i));
          return (
            <div
              key={i}
              style={{
                fontFamily: GROTESCA,
                fontWeight: 700,
                fontStretch: '86%',
                fontSize: 78,
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: PALETA.texto,
                opacity: Math.min(1, s * 2.2),
                transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
                textShadow: '0 6px 40px rgba(0,0,0,0.9)',
              }}
            >
              {l}
            </div>
          );
        })}

        {t >= tGrande ? (
          <div style={{marginTop: 42, opacity: Math.min(1, ent(tGrande) * 2)}}>
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: 800,
                fontStretch: '80%',
                fontSize: 128,
                lineHeight: 1.0,
                letterSpacing: '-0.045em',
                color: PALETA.acento,
                transform: `scale(${interpolate(ent(tGrande), [0, 1], [0.74, 1])})`,
                transformOrigin: 'left center',
                textShadow: '0 6px 40px rgba(0,0,0,0.9)',
              }}
            >
              {d.grande}
            </div>
            <div
              style={{
                marginTop: 18,
                fontFamily: GROTESCA,
                fontWeight: 500,
                fontSize: 42,
                color: PALETA.texto,
                opacity: interpolate(t, [tGrande + 0.5, tGrande + 0.9], [0, 0.9], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
                textShadow: '0 4px 30px rgba(0,0,0,0.9)',
              }}
            >
              {d.pie}
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
