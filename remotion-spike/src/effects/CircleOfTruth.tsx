import React from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface CircleOfTruthProps {
  content: string;
  circleColor?: string;
  duration?: number;
}

export const CircleOfTruth: React.FC<CircleOfTruthProps> = ({
  content,
  circleColor = '#00FF00',
  duration = 1.8,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.6 dibuja círculo, 0.6-0.9 muestra contenido, 0.9-1.0 pulsa
  const drawProgress = Math.min(progress / 0.6, 1);
  const contentOpacity = Math.max(0, (progress - 0.6) / 0.3);
  const pulsePhase = Math.max(0, progress - 0.6);

  const pulseScale = 1 + Math.sin(pulsePhase * Math.PI * 4) * 0.1;
  const pulseGlow = Math.sin(pulsePhase * Math.PI * 3) * 0.5 + 0.5;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.95)',
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="circle-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Círculo que se dibuja (stroke-dasharray animation) */}
        <circle
          cx="500"
          cy="500"
          r="250"
          fill="none"
          stroke={circleColor}
          strokeWidth="4"
          filter="url(#circle-glow)"
          opacity={drawProgress}
          strokeDasharray="1570"
          strokeDashoffset={`${1570 * (1 - drawProgress)}`}
          style={{
            transition: drawProgress < 1 ? 'none' : 'all 0.2s ease-out',
          }}
        />

        {/* Pulsos interiores (más ciclos) */}
        {Array.from({ length: 3 }).map((_, i) => (
          <circle
            key={`pulse-${i}`}
            cx="500"
            cy="500"
            r={150 - i * 50}
            fill="none"
            stroke={circleColor}
            strokeWidth="2"
            opacity={drawProgress * 0.4}
            filter="url(#circle-glow)"
          />
        ))}

        {/* Centro pulsante (glow) */}
        <circle
          cx="500"
          cy="500"
          r="100"
          fill={circleColor}
          opacity={contentOpacity * pulseGlow * 0.3}
          filter="url(#circle-glow)"
        />

        {/* Contenido de texto */}
        <text
          x="500"
          y="500"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="60"
          fill={circleColor}
          fontWeight="bold"
          opacity={contentOpacity}
          style={{
            fontFamily: 'Arial, sans-serif',
            filter: `drop-shadow(0 0 ${10 + pulseGlow * 20}px ${circleColor})`,
            transform: `scale(${pulseScale})`,
            transformOrigin: '500px 500px',
            transition: 'none',
          }}
        >
          {content}
        </text>
      </svg>
    </AbsoluteFill>
  );
};

export default CircleOfTruth;
