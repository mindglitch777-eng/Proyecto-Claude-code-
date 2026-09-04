import React from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface SpotlightRevealProps {
  text: string;
  spotColor?: string;
  textColor?: string;
  duration?: number;
}

const SpotlightReveal: React.FC<SpotlightRevealProps> = ({
  text,
  spotColor = '#FFFF00',
  textColor = '#FFFFFF',
  duration = 1.8,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.5 foco barre, 0.5-1.0 texto brilla
  const sweepProgress = Math.min(progress / 0.5, 1);
  const glowProgress = Math.max(0, progress - 0.5) / 0.5;

  const spotX = -width / 2 + sweepProgress * (width * 1.5);
  const spotY = height / 2;
  const spotRadius = 200 + sweepProgress * 100;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.98)',
        overflow: 'hidden',
      }}
    >
      {/* SVG para máscara de spotlight */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="spotlightGrad" cx={`${(spotX / width) * 100}%`} cy="50%">
            <stop offset="0%" stopColor={spotColor} stopOpacity="0.8" />
            <stop offset="40%" stopColor={spotColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={spotColor} stopOpacity="0" />
          </radialGradient>

          <mask id="spotMask">
            <rect width={width} height={height} fill="black" />
            <circle cx={spotX} cy={spotY} r={spotRadius} fill="white" />
          </mask>
        </defs>

        {/* Rectángulo con máscara de spotlight */}
        <rect
          width={width}
          height={height}
          fill={spotColor}
          fillOpacity={sweepProgress * 0.4}
          mask="url(#spotMask)"
        />

        {/* Glow del spotlight */}
        <circle
          cx={spotX}
          cy={spotY}
          r={spotRadius * 1.2}
          fill="none"
          stroke={spotColor}
          strokeWidth={30}
          opacity={sweepProgress * 0.5}
          filter="blur(10px)"
        />

        {/* Haz de luz visible */}
        <circle
          cx={spotX}
          cy={spotY}
          r={spotRadius}
          fill="url(#spotlightGrad)"
          opacity={sweepProgress}
        />
      </svg>

      {/* Texto revelado */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          fontSize: '100px',
          fontWeight: 'bold',
          color: textColor,
          opacity: Math.min(1, sweepProgress * 1.5),
          textShadow: `
            0 0 20px ${spotColor},
            0 0 40px ${spotColor},
            0 0 60px ${spotColor}
          `,
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '2px',
          filter: `drop-shadow(0 0 ${glowProgress * 30}px ${spotColor})`,
          transform: `translate(-50%, -50%) scale(${1 + glowProgress * 0.1})`,
          transition: 'none',
        }}
      >
        {text}
      </div>

      {/* Destello final */}
      {glowProgress > 0.5 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle at center, ${spotColor}80 0%, transparent 70%)`,
            opacity: Math.max(0, (glowProgress - 0.5) * 1.5),
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default SpotlightReveal;
