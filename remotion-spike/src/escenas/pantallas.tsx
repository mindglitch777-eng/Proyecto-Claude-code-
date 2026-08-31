import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {GROTESCA, PALETA} from '../identidad';

// PANTALLAS
//
// Lo que mas para el pulgar en vertical no es una foto linda: es algo
// que el que mira YA SABE leer. Un chat, un buscador, una notificacion.
// El cerebro lo entiende sin pensar porque lo ve cien veces por dia.

// ─────────────────────────────────────────── 1. CHAT
// Mensajes que entran uno por uno, con los puntitos de "esta
// escribiendo" antes de cada respuesta. El puntito es lo que genera la
// espera: es tension gratis.

export type Mensaje = {de: 'ellos' | 'vos'; txt: string; t: number; acento?: boolean};

export const Chat: React.FC<{titulo?: string; mensajes: Mensaje[]}> = ({titulo, mensajes}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, padding: '13% 7% 20% 7%'}}>
      {titulo ? (
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 700,
            fontSize: 44,
            color: PALETA.texto,
            opacity: 0.55,
            marginBottom: 44,
            borderBottom: `2px solid ${PALETA.texto}22`,
            paddingBottom: 22,
          }}
        >
          {titulo}
        </div>
      ) : null}
      <div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
        {mensajes.map((m, i) => {
          // los puntitos aparecen 0.6s antes del mensaje
          const escribiendo = t >= m.t - 0.6 && t < m.t;
          if (t < m.t - 0.6) return null;
          const s = spring({
            frame: frame - m.t * fps,
            fps,
            config: {damping: 15, stiffness: 190, mass: 0.5},
          });
          const mio = m.de === 'vos';
          if (escribiendo) {
            return (
              <div key={i} style={{alignSelf: mio ? 'flex-end' : 'flex-start'}}>
                <div
                  style={{
                    background: mio ? PALETA.acento : '#1e1e22',
                    borderRadius: 30,
                    padding: '26px 32px',
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  {[0, 1, 2].map((k) => (
                    <div
                      key={k}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        background: PALETA.texto,
                        opacity: 0.35 + 0.55 * Math.abs(Math.sin((t * 4 + k * 0.5) * Math.PI)),
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div
              key={i}
              style={{
                alignSelf: mio ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                background: m.acento ? PALETA.acento : mio ? '#2a2a30' : '#1a1a1e',
                color: m.acento ? PALETA.fondo : PALETA.texto,
                borderRadius: 30,
                borderBottomRightRadius: mio ? 8 : 30,
                borderBottomLeftRadius: mio ? 30 : 8,
                padding: '26px 32px',
                fontFamily: GROTESCA,
                fontWeight: m.acento ? 700 : 500,
                fontSize: 44,
                lineHeight: 1.25,
                opacity: Math.min(1, s * 2),
                transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
                transformOrigin: mio ? 'right bottom' : 'left bottom',
              }}
            >
              {m.txt}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────── 2. BUSCADOR
// Alguien escribe en Google letra por letra y aparecen las sugerencias.
// Sirve para mostrar "esto es lo que la gente realmente pregunta".

export const Buscador: React.FC<{
  consulta: string;
  sugerencias?: {txt: string; t: number; acento?: boolean}[];
  pie?: string;
}> = ({consulta, sugerencias = [], pie}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // se tipea en 1.4 segundos
  const letras = Math.floor(interpolate(t, [0.3, 1.7], [0, consulta.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));
  const escrito = consulta.slice(0, letras);
  const cursor = t < 1.9 && Math.floor(t * 2.5) % 2 === 0;

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
          border: `3px solid ${PALETA.texto}33`,
          borderRadius: 60,
          padding: '34px 44px',
          display: 'flex',
          alignItems: 'center',
          gap: 26,
        }}
      >
        <svg width={44} height={44} viewBox="0 0 100 100">
          <circle cx={44} cy={44} r={28} fill="none" stroke={PALETA.texto} strokeWidth={9} opacity={0.6} />
          <path d="M64 64 L90 90" stroke={PALETA.texto} strokeWidth={9} strokeLinecap="round" opacity={0.6} />
        </svg>
        <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 50, color: PALETA.texto}}>
          {escrito}
          {cursor ? <span style={{opacity: 0.8}}>|</span> : null}
        </div>
      </div>

      <div style={{marginTop: 20}}>
        {sugerencias.map((s, i) => {
          if (t < s.t) return null;
          const sp = spring({frame: frame - s.t * fps, fps, config: {damping: 18, stiffness: 200}});
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                padding: '26px 44px',
                fontFamily: GROTESCA,
                fontWeight: s.acento ? 700 : 400,
                fontSize: 46,
                color: s.acento ? PALETA.acento : PALETA.texto,
                opacity: Math.min(1, sp * 2) * (s.acento ? 1 : 0.72),
                transform: `translateX(${interpolate(sp, [0, 1], [-24, 0])}px)`,
              }}
            >
              <span style={{opacity: 0.4}}>↗</span>
              {s.txt}
            </div>
          );
        })}
      </div>

      {pie ? (
        <div
          style={{
            marginTop: 60,
            fontFamily: GROTESCA,
            fontWeight: 700,
            fontSize: 52,
            color: PALETA.acento,
            opacity: interpolate(t, [2.6, 3.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {pie}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────── 3. NOTIFICACIONES
// Van cayendo una arriba de otra y se apilan. Sirve para "te llegan
// veinte y ninguna te deja plata" o para mostrar avalancha.

export const Notificaciones: React.FC<{
  titulo?: string;
  items: {app: string; txt: string; t: number; acento?: boolean}[];
  remate?: string;
}> = ({titulo, items, remate}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETA.fondo,
        padding: '0 6%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      {titulo ? (
        <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 50, color: PALETA.texto, opacity: 0.6, marginBottom: 16}}>
          {titulo}
        </div>
      ) : null}
      {items.map((n, i) => {
        if (t < n.t) return null;
        const s = spring({frame: frame - n.t * fps, fps, config: {damping: 13, stiffness: 210, mass: 0.5}});
        return (
          <div
            key={i}
            style={{
              background: n.acento ? PALETA.acento : '#17171b',
              borderRadius: 28,
              padding: '28px 34px',
              opacity: Math.min(1, s * 2),
              transform: `translateY(${interpolate(s, [0, 1], [-40, 0])}px) scale(${interpolate(s, [0, 1], [0.94, 1])})`,
            }}
          >
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: n.acento ? PALETA.fondo : PALETA.texto,
                opacity: n.acento ? 0.8 : 0.45,
                marginBottom: 8,
              }}
            >
              {n.app}
            </div>
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: n.acento ? 800 : 500,
                fontSize: 42,
                lineHeight: 1.2,
                color: n.acento ? PALETA.fondo : PALETA.texto,
              }}
            >
              {n.txt}
            </div>
          </div>
        );
      })}
      {remate ? (
        <div
          style={{
            marginTop: 34,
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontStretch: '84%',
            fontSize: 76,
            textTransform: 'uppercase',
            letterSpacing: '-0.03em',
            color: PALETA.acento,
            opacity: interpolate(t, [dur - 2.0, dur - 1.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {remate}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
