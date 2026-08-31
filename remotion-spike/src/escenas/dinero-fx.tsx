import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {ANCHO, ALTO, PALETA} from '../identidad';

// LLUVIA DE DINERO
//
// Billetes ($ estilizados) cayendo, cada uno con su propia velocidad,
// balanceo y rotacion -- semilla fija por indice (random() de Remotion
// es determinista) para que sea reproducible, no se recalcule distinto
// cada vez que se renderiza.

const CANTIDAD = 22;

export const LluviaDinero: React.FC<{intensidad?: number}> = ({intensidad = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const billetes = Array.from({length: Math.round(CANTIDAD * intensidad)}, (_, i) => {
    const semilla = `billete-${i}`;
    const x = random(semilla + 'x') * ANCHO;
    const velocidad = 340 + random(semilla + 'v') * 260;
    const retraso = random(semilla + 'r') * 3;
    const balanceo = 40 + random(semilla + 'b') * 60;
    const periodoBalanceo = 1.1 + random(semilla + 'p') * 0.9;
    const giroBase = random(semilla + 'g') * 360;
    const velGiro = (random(semilla + 'vg') - 0.5) * 140;
    const tam = 40 + random(semilla + 't') * 30;
    const tLocal = t + retraso;
    const y = ((tLocal * velocidad) % (ALTO + 200)) - 100;
    const dx = Math.sin(tLocal * periodoBalanceo * Math.PI) * balanceo;
    const giro = giroBase + tLocal * velGiro;
    return {x: x + dx, y, giro, tam, key: i};
  });

  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {billetes.map((b) => (
        <div
          key={b.key}
          style={{
            position: 'absolute',
            left: b.x,
            top: b.y,
            width: b.tam * 1.6,
            height: b.tam,
            borderRadius: b.tam * 0.14,
            background: '#2E7D4F',
            border: `${Math.max(2, b.tam * 0.05)}px solid #1E5A38`,
            transform: `rotate(${b.giro}deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
          }}
        >
          <span style={{fontFamily: 'Archivo', fontWeight: 800, fontSize: b.tam * 0.55, color: '#BFF0D2'}}>$</span>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// RESPLANDOR
//
// Un fondo negro plano lee "no terminado". Esto le pone un brillo
// radial que respira lento en el centro, mas una linea que fluye --
// el mismo recurso que usan los canales de trading para que la
// pantalla nunca se sienta vacia aunque el texto sea corto.

export const Resplandor: React.FC<{color?: string; fuerza?: number}> = ({color = PALETA.acento, fuerza = 0.35}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const pulso = 0.85 + Math.sin(t * 1.1) * 0.15;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, ${color}55 0%, ${color}22 28%, transparent 62%)`,
          opacity: fuerza * pulso,
        }}
      />
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.5}}>
        <path
          d={`M -50 ${ALTO * 0.62 + Math.sin(t * 0.7) * 40} C ${ANCHO * 0.3} ${ALTO * 0.5 + Math.cos(t * 0.5) * 60}, ${ANCHO * 0.6} ${ALTO * 0.75 + Math.sin(t * 0.6) * 50}, ${ANCHO + 50} ${ALTO * 0.55 + Math.cos(t * 0.8) * 40}`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeOpacity={0.4}
        />
      </svg>
    </AbsoluteFill>
  );
};
