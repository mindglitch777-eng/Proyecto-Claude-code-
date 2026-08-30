import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Idea} from '../guion';
import {GROTESCA, PALETA, SERIF} from '../identidad';

// Barras que crecen de a una. Mismo comportamiento que f_grafico():
// la cifra es SIEMPRE el valor final (§17 -- un numero que se anima
// muestra en pantalla cifras que no existen), lo que entra es la
// opacidad.

export const Grafico: React.FC<{idea: Extract<Idea, {tipo: 'grafico'}>}> = ({idea}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const max = Math.max(...idea.datos.map((d) => d.valor));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETA.fondo,
        padding: '14% 8% 22% 8%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 78,
          color: PALETA.texto,
          marginBottom: 70,
          opacity: interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        {idea.titulo}
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 72, flex: 1, justifyContent: 'center'}}>
        {idea.datos.map((d, i) => {
          const t0 = (0.35 + i * 0.55) * fps;
          const s = spring({
            frame: frame - t0,
            fps,
            config: {damping: 200, stiffness: 90, mass: 1.1},
          });
          const ancho = (d.valor / max) * 100 * s;
          // El acento va en la barra MAS ALTA, igual que f_grafico().
          const lider = d.valor === max;
          return (
            <div key={i} style={{opacity: frame < t0 ? 0 : 1}}>
              <div
                style={{
                  fontFamily: GROTESCA,
                  fontWeight: 500,
                  fontSize: 46,
                  color: PALETA.texto,
                  opacity: 0.82,
                  marginBottom: 16,
                }}
              >
                {d.etiqueta}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
                <div
                  style={{
                    height: 76,
                    width: `${ancho}%`,
                    minWidth: 6,
                    backgroundColor: lider ? PALETA.acento : PALETA.texto,
                    borderRadius: 3,
                  }}
                />
                <div
                  style={{
                    fontFamily: GROTESCA,
                    fontWeight: 700,
                    fontSize: 88,
                    color: lider ? PALETA.acento : PALETA.texto,
                    opacity: s,
                  }}
                >
                  {d.valor}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Etiqueta y fuente. En el motor actual esto vive solo en
          'grafico'; en 'escena' la cifra queda sin respaldo visible. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          opacity: interpolate(frame, [fps * 0.8, fps * 1.3], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <span
          style={{
            fontFamily: GROTESCA,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: '0.14em',
            color: PALETA.fondo,
            backgroundColor: PALETA.acento,
            padding: '8px 16px',
          }}
        >
          {idea.etiqueta}
        </span>
        <span
          style={{
            fontFamily: GROTESCA,
            fontWeight: 400,
            fontSize: 26,
            color: PALETA.texto,
            opacity: 0.66,
          }}
        >
          {idea.fuente}
        </span>
      </div>
    </AbsoluteFill>
  );
};
