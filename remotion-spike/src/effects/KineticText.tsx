import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

interface KineticTextProps {
  lines: string[]; // hasta 3 lineas
  color?: string;
  impactColor?: string;
  duration?: number;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = Math.min(Math.max(t, 0), 1);
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// easeInQuad: arranca lento y acelera -- la entrada "a alta velocidad"
// que pide la carta, antes del golpe.
function easeInQuad(t: number): number {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x;
}

export const KineticText: React.FC<KineticTextProps> = ({
  lines,
  color = '#F6F6F4',
  impactColor = '#FF4E24',
  duration = 1.0,
}) => {
  const { fps, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const impactFrame = Math.round(duration * fps * 0.55); // fase de vuelo hasta el choque
  const settleFrames = Math.max(6, Math.round(duration * fps * 0.2)); // rebote post-impacto
  const glitchFrames = Math.max(4, Math.round(fps * 0.12)); // chispa/glitch en el impacto

  const enVuelo = frame < impactFrame;
  const enRebote = frame >= impactFrame && frame < impactFrame + settleFrames;

  let translateY: number;
  if (enVuelo) {
    const t = frame / impactFrame;
    translateY = -height * 0.7 * (1 - easeInQuad(t));
  } else if (enRebote) {
    const t = (frame - impactFrame) / settleFrames;
    translateY = -20 * (1 - easeOutBack(t));
  } else {
    translateY = 0;
  }

  const enGlitch = frame >= impactFrame && frame < impactFrame + glitchFrames;
  const glitchT = enGlitch ? 1 - (frame - impactFrame) / glitchFrames : 0;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          textAlign: 'center',
          fontFamily: '"Archivo", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 900,
          fontSize: '96px',
          lineHeight: 1.05,
          color: enGlitch ? impactColor : color,
          textShadow: enGlitch
            ? `${8 * glitchT}px 0 0 #00FFFF, ${-8 * glitchT}px 0 0 #FF00AA, 0 0 40px ${impactColor}`
            : `0 0 30px ${color}40`,
        }}
      >
        {lines.slice(0, 3).map((linea, i) => (
          <div key={i}>{linea}</div>
        ))}
      </div>

      {/* chispa de impacto: destello breve en toda la pantalla */}
      {enGlitch && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: impactColor,
            opacity: glitchT * 0.25,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default KineticText;
