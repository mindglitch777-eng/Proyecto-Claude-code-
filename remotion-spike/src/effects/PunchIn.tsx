import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

interface PunchInProps {
  text: string;
  scale?: number;
  color?: string;
  duration?: number; // segundos que tarda el zoom de entrada
  holdDuration?: number; // segundos que se mantiene arriba antes de volver
}

// easeOutBack: pasa de 0 a 1 con un leve sobregiro por encima de 1 cerca
// del final -- es el "rebote"/"vibra" que pide la carta, sin sumar
// ninguna libreria de animacion nueva (Remotion ya trae `spring()`,
// pero para un solo pico de sobregiro esta formula cerrada es mas
// facil de leer que ajustar damping/stiffness a mano).
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = Math.min(Math.max(t, 0), 1);
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function lerpBack(a: number, b: number, t: number): number {
  return a + (b - a) * easeOutBack(t);
}

export const PunchIn: React.FC<PunchInProps> = ({
  text,
  scale = 1.8,
  color = '#FF4E24',
  duration = 0.3,
  holdDuration = 0.5,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const zoomFrames = duration * fps;
  const holdFrames = holdDuration * fps;
  const holdEndFrame = zoomFrames + holdFrames;
  const returnFrames = Math.max(10, 0.35 * fps);

  let currentScale: number;
  if (frame <= zoomFrames) {
    currentScale = lerpBack(1, scale, frame / zoomFrames);
  } else if (frame <= holdEndFrame) {
    currentScale = scale;
  } else {
    currentScale = lerpBack(scale, 1, (frame - holdEndFrame) / returnFrames);
  }

  // vibracion breve justo en el pico del zoom (ultimos frames del sobregiro)
  const enZoom = frame > zoomFrames * 0.75 && frame <= zoomFrames;
  const vibracion = enZoom ? Math.sin(frame * 3.2) * 4 : 0;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
      }}
    >
      <div
        style={{
          transform: `scale(${currentScale}) translateX(${vibracion}px)`,
          fontFamily: '"Archivo", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 900,
          fontSize: '140px',
          color,
          textShadow: `0 0 40px ${color}, 0 0 90px ${color}80`,
          textAlign: 'center',
          padding: '0 40px',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export default PunchIn;
