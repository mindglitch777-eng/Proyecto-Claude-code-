import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Explicador as Datos} from '../contenido10';
import {GROTESCA, PALETA, SERIF} from '../identidad';

// Version generica de Cuenta: la tabla se arma a la vista y recien
// despues aparece la conclusion. El orden importa -- si la conclusion
// apareciera primero seria un dato, asi es una consecuencia.

export const Explicador: React.FC<{d: Datos}> = ({d}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;

  // Los tiempos se reparten sobre la duracion real del bloque, asi el
  // mismo componente sirve para un bloque de 7s y uno de 8.4s.
  const tFila = (i: number) => 0.3 + i * dur * 0.17;
  const tTotal = dur * 0.42;
  const tRemate = dur * 0.62;

  const ent = (t0: number) =>
    spring({frame: frame - t0 * fps, fps, config: {damping: 18, stiffness: 200, mass: 0.6}});

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETA.fondo,
        padding: '0 7%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 66,
          color: PALETA.texto,
          opacity: interpolate(t, [0, 0.25], [0, 0.85], {extrapolateRight: 'clamp'}),
          marginBottom: 56,
        }}
      >
        {d.titulo}
      </div>

      {d.filas.map((f, i) => {
        if (t < tFila(i)) return null;
        const s = ent(tFila(i));
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 24,
              marginBottom: 32,
              opacity: Math.min(1, s * 2),
              transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
            }}
          >
            <span style={{fontFamily: GROTESCA, fontWeight: 400, fontSize: 54, color: PALETA.texto, opacity: 0.85}}>
              {f.concepto}
            </span>
            <span style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 68, color: PALETA.texto, whiteSpace: 'nowrap'}}>
              {f.valor}
            </span>
          </div>
        );
      })}

      {d.total ? (
        <>
          <div
            style={{
              height: 4,
              backgroundColor: PALETA.texto,
              opacity: 0.35,
              marginTop: 10,
              marginBottom: 28,
              transform: `scaleX(${interpolate(ent(tTotal), [0, 1], [0, 1])})`,
              transformOrigin: 'left',
            }}
          />
          {t >= tTotal ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 24,
                opacity: Math.min(1, ent(tTotal) * 2),
              }}
            >
              <span style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 56, color: PALETA.texto}}>
                {d.total.concepto}
              </span>
              <span style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 92, color: PALETA.texto, whiteSpace: 'nowrap'}}>
                {d.total.valor}
              </span>
            </div>
          ) : null}
        </>
      ) : null}

      {t >= tRemate ? (
        <div
          style={{
            marginTop: 58,
            opacity: Math.min(1, ent(tRemate) * 2),
            transform: `scale(${interpolate(ent(tRemate), [0, 1], [0.84, 1])})`,
            transformOrigin: 'left bottom',
          }}
        >
          <div style={{fontFamily: GROTESCA, fontWeight: 400, fontSize: 46, color: PALETA.texto, opacity: 0.7}}>
            {d.remate.arriba}
          </div>
          <div
            style={{
              fontFamily: GROTESCA,
              fontWeight: 800,
              fontStretch: '82%',
              fontSize: 132,
              lineHeight: 1.02,
              letterSpacing: '-0.04em',
              color: PALETA.acento,
            }}
          >
            {d.remate.grande}
          </div>
          <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 44, color: PALETA.texto, opacity: 0.8}}>
            {d.remate.abajo}
          </div>
        </div>
      ) : null}

      {/* etiqueta de dato, cuando corresponde */}
      {d.etiqueta ? (
        <div
          style={{
            position: 'absolute',
            left: '7%',
            right: '7%',
            bottom: '9%',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            opacity: interpolate(t, [dur * 0.3, dur * 0.45], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <span
            style={{
              fontFamily: GROTESCA,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: '0.14em',
              color: PALETA.fondo,
              backgroundColor: PALETA.acento,
              padding: '7px 14px',
            }}
          >
            {d.etiqueta}
          </span>
          {d.fuente ? (
            <span style={{fontFamily: GROTESCA, fontWeight: 400, fontSize: 24, color: PALETA.texto, opacity: 0.62}}>
              {d.fuente}
            </span>
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
