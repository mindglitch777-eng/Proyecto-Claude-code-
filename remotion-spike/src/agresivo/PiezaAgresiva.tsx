import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {cargarFuentes} from '../fuentes';
import {AGRESIVO} from '../guion-agresivo';
import {GROTESCA, PALETA, SERIF} from '../identidad';
import {Cuenta} from './Cuenta';
import {Punch} from './Punch';
import {Rafaga} from './Rafaga';
import {Veredicto} from './Veredicto';

const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETA.fondo,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
      }}
    >
      <div
        style={{
          width: interpolate(t, [0, 0.5], [0, 260], {extrapolateRight: 'clamp'}),
          height: 5,
          backgroundColor: PALETA.acento,
        }}
      />
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 800,
          fontSize: 96,
          color: PALETA.texto,
          opacity: interpolate(t, [0.3, 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          letterSpacing: '-0.02em',
        }}
      >
        El Corte
      </div>
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 400,
          fontSize: 42,
          color: PALETA.texto,
          opacity: interpolate(t, [0.8, 1.3], [0, 0.65], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      >
        números que no te mienten
      </div>
    </AbsoluteFill>
  );
};

export const PiezaAgresiva: React.FC = () => {
  cargarFuentes();
  const {fps} = useVideoConfig();
  let acc = 0;

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {AGRESIVO.map((b, i) => {
        const desde = Math.round(acc * fps);
        const largo = Math.round(b.dur * fps);
        acc += b.dur;
        return (
          <Sequence key={i} from={desde} durationInFrames={largo}>
            {b.tipo === 'hook' ? (
              <Punch lineas={b.lineas} entra={b.entra} tam={128} />
            ) : b.tipo === 'niega' ? (
              <Punch lineas={b.lineas} entra={b.entra} clip={b.clip} tam={112} />
            ) : b.tipo === 'rafaga' ? (
              <Rafaga clips={b.clips} sello={b.sello} />
            ) : b.tipo === 'cuenta' ? (
              <Cuenta />
            ) : b.tipo === 'veredicto' ? (
              <Veredicto clip={b.clip} />
            ) : b.tipo === 'verdad' ? (
              <Punch lineas={b.lineas} entra={b.entra} clip={b.clip} tam={112} velo={0.6} />
            ) : b.tipo === 'payoff' ? (
              <Punch lineas={b.lineas} entra={b.entra} tam={104} />
            ) : (
              <Cierre />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
