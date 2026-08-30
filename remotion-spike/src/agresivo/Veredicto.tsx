import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COBRAS, COSTO_HORA, HORAS_TRABAJO} from '../guion-agresivo';
import {GROTESCA, PALETA} from '../identidad';

const plata = (n: number) => '$' + n.toLocaleString('es-AR');

// El veredicto. Cobra 5.000 por un trabajo de 2 horas que ya le costo
// 5.000 en costos fijos: le quedo cero, y todavia no pago materiales.
//
// El "CERO" lleva el metraje adentro de las letras (background-clip:
// text). Es el efecto que en Pillow habria que hacer componiendo una
// mascara a mano pixel por pixel.

export const Veredicto: React.FC<{clip: string}> = ({clip}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const costo = COSTO_HORA * HORAS_TRABAJO;
  const queda = COBRAS - costo;

  const ent = (t0: number) =>
    spring({frame: frame - t0 * fps, fps, config: {damping: 16, stiffness: 200, mass: 0.5}});

  const zoom = interpolate(frame, [0, durationInFrames], [1.12, 1.0]);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <AbsoluteFill style={{filter: 'saturate(0.5) brightness(0.5) contrast(1.1)', transform: `scale(${zoom})`}}>
        <OffthreadVideo
          src={staticFile(`video/${clip}`)}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: 'rgba(0,0,0,0.55)'}} />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 7%',
          gap: 18,
        }}
      >
        {[
          {txt: `Cobrás ${plata(COBRAS)}`, t0: 0.0},
          {txt: `Por ${HORAS_TRABAJO} horas`, t0: 0.7},
          {txt: `Te costaron ${plata(costo)}`, t0: 1.4},
        ].map((l, i) => {
          if (t < l.t0) return null;
          const s = ent(l.t0);
          return (
            <div
              key={i}
              style={{
                fontFamily: GROTESCA,
                fontWeight: 700,
                fontStretch: '86%',
                fontSize: 86,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: PALETA.texto,
                opacity: Math.min(1, s * 2.2),
                transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
                textShadow: '0 6px 40px rgba(0,0,0,0.9)',
              }}
            >
              {l.txt}
            </div>
          );
        })}

        {t >= 2.3 ? (
          <div style={{marginTop: 40, opacity: Math.min(1, ent(2.3) * 2)}}>
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: 500,
                fontSize: 48,
                color: PALETA.texto,
                opacity: 0.8,
              }}
            >
              Te quedó
            </div>
            {/* el metraje se ve ADENTRO de las letras */}
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: 800,
                fontStretch: '80%',
                fontSize: 300,
                lineHeight: 0.92,
                letterSpacing: '-0.05em',
                color: PALETA.acento,
                transform: `scale(${interpolate(ent(2.3), [0, 1], [0.7, 1])})`,
                transformOrigin: 'left center',
              }}
            >
              {plata(queda)}
            </div>
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: 500,
                fontSize: 46,
                color: PALETA.texto,
                opacity: interpolate(t, [3.0, 3.4], [0, 0.9], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              y todavía no pagaste los materiales
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
