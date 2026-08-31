import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {GROTESCA, PALETA, SERIF} from '../identidad';

// ─────────────────────────────── 1. RELOJ QUE CORRE
// Un numero que baja. El que mira no puede irse hasta ver en cuanto
// termina. Es la trampa mas vieja del mundo y sigue funcionando.

export const RelojQueCorre: React.FC<{
  arriba: string;
  desde: number;
  hasta?: number;
  abajo?: string;
  unidad?: string;
}> = ({arriba, desde, hasta = 0, abajo, unidad = ''}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.4, dur * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const valor = Math.round(desde + (hasta - desde) * p);
  const llego = p >= 1;
  const late = llego ? 1 + 0.05 * Math.abs(Math.sin(t * 7)) : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: llego ? PALETA.acento : PALETA.fondo,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '0 6%',
      }}
    >
      <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 52, color: llego ? PALETA.fondo : PALETA.texto, opacity: 0.85, textAlign: 'center'}}>
        {arriba}
      </div>
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontStretch: '78%',
          fontSize: 300,
          lineHeight: 1,
          letterSpacing: '-0.06em',
          color: llego ? PALETA.fondo : PALETA.texto,
          transform: `scale(${late})`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {valor}
        {unidad}
      </div>
      {abajo ? (
        <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 50, color: llego ? PALETA.fondo : PALETA.texto, opacity: llego ? 1 : 0.5, textAlign: 'center'}}>
          {abajo}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────── 2. LA CIFRA SE CAE
// El numero grande se desploma y abajo queda el chiquito. Es la
// sensacion de perder, dibujada.

export const CifraSeCae: React.FC<{
  arriba: string;
  de: string;
  a: string;
  abajo?: string;
}> = ({arriba, de, a, abajo}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const tCae = dur * 0.42;
  const cae = spring({frame: frame - tCae * fps, fps, config: {damping: 9, stiffness: 120, mass: 1.2}});

  return (
    <AbsoluteFill
      style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 6%'}}
    >
      <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 50, color: PALETA.texto, opacity: 0.8, textAlign: 'center'}}>
        {arriba}
      </div>
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontStretch: '78%',
          fontSize: 190,
          lineHeight: 1,
          letterSpacing: '-0.05em',
          color: PALETA.texto,
          opacity: Math.max(0, 1 - cae * 1.6),
          transform: `translateY(${cae * 260}px) rotate(${cae * -11}deg) scale(${1 - cae * 0.4})`,
          position: 'absolute',
        }}
      >
        {de}
      </div>
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontStretch: '78%',
          fontSize: 240,
          lineHeight: 1,
          letterSpacing: '-0.05em',
          color: PALETA.acento,
          opacity: Math.min(1, cae * 1.6),
          transform: `scale(${interpolate(cae, [0, 1], [0.5, 1])})`,
        }}
      >
        {a}
      </div>
      {abajo ? (
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 600,
            fontSize: 46,
            color: PALETA.texto,
            opacity: interpolate(t, [tCae + 0.7, tCae + 1.1], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            textAlign: 'center',
          }}
        >
          {abajo}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────── 3. EMBUDO
// De cien arrancan, diez siguen, uno llega. Se ve como se angosta.

export const Embudo: React.FC<{
  titulo?: string;
  pisos: {txt: string; cuantos: string}[];
  pie?: string;
}> = ({titulo, pisos, pie}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const paso = (dur * 0.66) / Math.max(1, pisos.length);

  return (
    <AbsoluteFill
      style={{backgroundColor: PALETA.fondo, padding: '0 6%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18}}
    >
      {titulo ? (
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: PALETA.texto, marginBottom: 30}}>{titulo}</div>
      ) : null}
      {pisos.map((p, i) => {
        const t0 = 0.3 + i * paso;
        if (t < t0) return null;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 17, stiffness: 190}});
        const ancho = 100 - (i / Math.max(1, pisos.length - 1)) * 62;
        const ultimo = i === pisos.length - 1;
        return (
          <div key={i} style={{display: 'flex', justifyContent: 'center'}}>
            <div
              style={{
                width: `${ancho * s}%`,
                background: ultimo ? PALETA.acento : PALETA.texto,
                opacity: ultimo ? 1 : 0.42 + i * 0.16,
                borderRadius: 10,
                padding: '26px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 20,
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontFamily: GROTESCA,
                  fontWeight: 700,
                  fontSize: 42,
                  whiteSpace: 'nowrap',
                  color: PALETA.fondo,
                }}
              >
                {p.txt}
              </span>
              <span
                style={{
                  fontFamily: GROTESCA,
                  fontWeight: 800,
                  fontSize: 58,
                  whiteSpace: 'nowrap',
                  color: PALETA.fondo,
                }}
              >
                {p.cuantos}
              </span>
            </div>
          </div>
        );
      })}
      {pie ? (
        <div
          style={{
            marginTop: 30,
            textAlign: 'center',
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 60,
            textTransform: 'uppercase',
            color: PALETA.acento,
            opacity: interpolate(t, [dur * 0.74, dur * 0.84], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {pie}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────── 4. ENCUESTA
// Dos opciones y una barra que se llena. La gente contesta en la
// cabeza antes de leer el resultado: eso la deja enganchada.

export const Encuesta: React.FC<{
  pregunta: string;
  a: {txt: string; pct: number};
  b: {txt: string; pct: number};
  remate?: string;
}> = ({pregunta, a, b, remate}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const tRes = dur * 0.45;
  const s = spring({frame: frame - tRes * fps, fps, config: {damping: 200, stiffness: 80, mass: 1.1}});

  const Op = ({o, gana, retraso}: {o: {txt: string; pct: number}; gana: boolean; retraso: number}) => {
    const e = spring({frame: frame - retraso * fps, fps, config: {damping: 18, stiffness: 200}});
    return (
      <div
        style={{
          position: 'relative',
          borderRadius: 20,
          border: `4px solid ${PALETA.texto}33`,
          overflow: 'hidden',
          opacity: Math.min(1, e * 2),
          transform: `translateY(${interpolate(e, [0, 1], [22, 0])}px)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${o.pct * s}%`,
            background: gana ? PALETA.acento : `${PALETA.texto}22`,
          }}
        />
        <div style={{position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 34px', gap: 20}}>
          <span style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 50, color: gana && s > 0.4 ? PALETA.fondo : PALETA.texto}}>
            {o.txt}
          </span>
          <span
            style={{
              fontFamily: GROTESCA,
              fontWeight: 800,
              fontSize: 60,
              color: gana && s > 0.4 ? PALETA.fondo : PALETA.texto,
              opacity: s,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(o.pct * s)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{backgroundColor: PALETA.fondo, padding: '0 7%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26}}
    >
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 68, lineHeight: 1.1, color: PALETA.texto, marginBottom: 20}}>
        {pregunta}
      </div>
      <Op o={a} gana={a.pct >= b.pct} retraso={0.3} />
      <Op o={b} gana={b.pct > a.pct} retraso={0.55} />
      {remate ? (
        <div
          style={{
            marginTop: 30,
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 58,
            textTransform: 'uppercase',
            color: PALETA.acento,
            opacity: interpolate(t, [tRes + 0.8, tRes + 1.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {remate}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────── 5. TRES VERDADES
// Tres frases cortas, una por vez, pantalla llena, sin nada mas. Cada
// una tapa a la anterior. Es puro ritmo.

export const TresVerdades: React.FC<{frases: string[]}> = ({frases}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const paso = dur / Math.max(1, frases.length);
  const i = Math.min(frases.length - 1, Math.floor(t / paso));
  const local = t - i * paso;
  const s = spring({frame: Math.round(local * fps), fps, config: {damping: 13, stiffness: 230, mass: 0.45}});
  const ultima = i === frases.length - 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: ultima ? PALETA.acento : PALETA.fondo,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 7%',
      }}
    >
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontStretch: '80%',
          fontSize: 128,
          lineHeight: 0.98,
          letterSpacing: '-0.045em',
          textTransform: 'uppercase',
          textAlign: 'center',
          color: ultima ? PALETA.fondo : PALETA.texto,
          transform: `scale(${interpolate(s, [0, 1], [0.72, 1])})`,
          opacity: Math.min(1, s * 3),
        }}
      >
        {frases[i]}
      </div>
    </AbsoluteFill>
  );
};
