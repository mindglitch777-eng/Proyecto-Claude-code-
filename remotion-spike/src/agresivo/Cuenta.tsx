import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COSTO_HORA, CUENTA, CUENTA_TOTAL, HORAS_MES} from '../guion-agresivo';
import {GROTESCA, PALETA, SERIF} from '../identidad';

const plata = (n: number) => '$' + n.toLocaleString('es-AR');

// El explicador. Es el corazon del video: la cuenta que nadie hace.
// Los renglones se suman a la vista, aparece el total, y recien
// entonces se divide por las horas. El orden importa -- si el costo
// por hora apareciera primero seria un dato; asi es una conclusion.

export const Cuenta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const ent = (t0: number, cfg = {damping: 18, stiffness: 200, mass: 0.6}) =>
    spring({frame: frame - t0 * fps, fps, config: cfg});

  const sTotal = ent(3.2);
  const sHoras = ent(4.6);
  const sHora = ent(6.0);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETA.fondo,
        padding: '0 7%',
        display: 'flex',
        flexDirection: 'column',
        // Centrado: colgado de arriba dejaba medio cuadro negro muerto,
        // el mismo error que ya habia cometido en el hook del motor.
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 68,
          color: PALETA.texto,
          opacity: interpolate(t, [0, 0.25], [0, 0.8], {extrapolateRight: 'clamp'}),
          marginBottom: 62,
        }}
      >
        Lo que pagás sin trabajar
      </div>

      {/* los dos costos fijos */}
      {CUENTA.map((c, i) => {
        const s = ent(c.t);
        if (t < c.t) return null;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 34,
              opacity: Math.min(1, s * 2),
              transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
            }}
          >
            <span style={{fontFamily: GROTESCA, fontWeight: 400, fontSize: 62, color: PALETA.texto, opacity: 0.85}}>
              {c.concepto}
            </span>
            <span style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 76, color: PALETA.texto}}>
              {plata(c.monto)}
            </span>
          </div>
        );
      })}

      {/* la linea de suma y el total */}
      <div
        style={{
          height: 4,
          backgroundColor: PALETA.texto,
          opacity: 0.35,
          marginTop: 14,
          marginBottom: 30,
          transform: `scaleX(${interpolate(sTotal, [0, 1], [0, 1])})`,
          transformOrigin: 'left',
        }}
      />
      {t >= 3.2 ? (
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: Math.min(1, sTotal * 2)}}>
          <span style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 62, color: PALETA.texto}}>
            Todos los meses
          </span>
          <span style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 112, color: PALETA.texto}}>
            {plata(CUENTA_TOTAL)}
          </span>
        </div>
      ) : null}

      {/* dividido por las horas que realmente trabajas */}
      {t >= 4.6 ? (
        <div
          style={{
            marginTop: 60,
            fontFamily: GROTESCA,
            fontWeight: 400,
            fontSize: 62,
            color: PALETA.texto,
            opacity: Math.min(1, sHoras * 2) * 0.85,
          }}
        >
          Trabajás {HORAS_MES} horas
        </div>
      ) : null}

      {/* la conclusion */}
      {t >= 6.0 ? (
        <div
          style={{
            marginTop: 46,
            transform: `scale(${interpolate(sHora, [0, 1], [0.8, 1])})`,
            transformOrigin: 'left bottom',
            opacity: Math.min(1, sHora * 2),
          }}
        >
          <div style={{fontFamily: GROTESCA, fontWeight: 400, fontSize: 52, color: PALETA.texto, opacity: 0.7}}>
            Cada hora tuya ya cuesta
          </div>
          <div
            style={{
              fontFamily: GROTESCA,
              fontWeight: 800,
              fontStretch: '84%',
              fontSize: 215,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: PALETA.acento,
            }}
          >
            {plata(COSTO_HORA)}
          </div>
          <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 50, color: PALETA.texto, opacity: 0.8}}>
            antes de tocar una herramienta
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
