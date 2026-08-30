import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {EXPLICADOR, REMATE} from '../contenido10';
import {cargarFuentes} from '../fuentes';
import {VIDEOS} from '../guiones10';
import {GROTESCA, PALETA, SERIF} from '../identidad';
import {Explicador} from './Explicador';
import {Punch} from './Punch';
import {Rafaga} from './Rafaga';
import {Remate} from './Remate';

const Cierre: React.FC<{cta: string}> = ({cta}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const ap = (a: number, b: number, max = 1) =>
    interpolate(t, [a, b], [0, max], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETA.fondo,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        padding: '0 8%',
      }}
    >
      {/* El CTA primero: es lo que tiene que hacer el que llego hasta aca */}
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontStretch: '84%',
          fontSize: 78,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          color: PALETA.acento,
          textAlign: 'center',
          lineHeight: 1.05,
          opacity: ap(0, 0.35),
          transform: `scale(${interpolate(t, [0, 0.35], [0.88, 1], {extrapolateRight: 'clamp'})})`,
        }}
      >
        Comentá «{cta}»
      </div>
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 400,
          fontSize: 40,
          color: PALETA.texto,
          opacity: ap(0.4, 0.75, 0.75),
          textAlign: 'center',
        }}
      >
        y te lo paso
      </div>

      <div style={{width: interpolate(t, [0.9, 1.3], [0, 200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), height: 4, backgroundColor: PALETA.texto, opacity: 0.4, marginTop: 34}} />
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 800,
          fontSize: 62,
          color: PALETA.texto,
          opacity: ap(1.1, 1.5, 0.9),
          letterSpacing: '-0.02em',
        }}
      >
        El Corte
      </div>
    </AbsoluteFill>
  );
};

export const Diez: React.FC<{id: string}> = ({id}) => {
  cargarFuentes();
  const {fps} = useVideoConfig();
  const v = VIDEOS.find((x) => x.id === id);
  if (!v) {
    return <AbsoluteFill style={{backgroundColor: PALETA.fondo}} />;
  }
  let acc = 0;

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {v.bloques.map((b, i) => {
        const desde = Math.round(acc * fps);
        const largo = Math.round(b.dur * fps);
        acc += b.dur;
        // Los documentales respiran: menos rebote, tipografia mas chica.
        const doc = v.registro === 'documental';
        return (
          <Sequence key={i} from={desde} durationInFrames={largo}>
            {b.tipo === 'hook' ? (
              <Punch lineas={b.lineas} entra={b.entra} tam={doc ? 104 : 124} />
            ) : b.tipo === 'niega' || b.tipo === 'verdad' ? (
              <Punch
                lineas={b.lineas}
                entra={b.entra}
                clip={b.clip}
                tam={doc ? 96 : 110}
                velo={b.tipo === 'verdad' ? 0.6 : 0.52}
              />
            ) : b.tipo === 'rafaga' ? (
              <Rafaga clips={b.clips} sello={b.sello} />
            ) : b.tipo === 'cuenta' ? (
              <Explicador d={EXPLICADOR[v.id]} />
            ) : b.tipo === 'veredicto' ? (
              <Remate d={REMATE[v.id]} clip={b.clip} />
            ) : b.tipo === 'payoff' ? (
              <Punch lineas={b.lineas} entra={b.entra} tam={doc ? 92 : 100} />
            ) : (
              <Cierre cta={v.cta} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
