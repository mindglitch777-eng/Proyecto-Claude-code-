import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface NeonRippleProps {
  text: string;
  rippleColor?: string;
  coreColor?: string;
  duration?: number;
}

const NeonRipple: React.FC<NeonRippleProps> = ({
  text,
  rippleColor = '#00FFFF',
  coreColor = '#FF00FF',
  duration = 1.7,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.5 ondas explotan, 0.5-1.0 se solidifica
  const waveProgress = Math.min(progress / 0.5, 1);
  const solidifyProgress = Math.max(0, progress - 0.5) / 0.5;

  const ripples = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      delay: (i / 12) * 0.3,
      initialRadius: 50 + i * 30,
    }));
  }, []);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(5, 5, 15, 0.98)',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={coreColor} stopOpacity="1" />
            <stop offset="100%" stopColor={rippleColor} stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Ondas de neon */}
        {ripples.map((ripple) => {
          const actualProgress = Math.max(0, waveProgress - ripple.delay);
          const radius = ripple.initialRadius + actualProgress * 400;
          const opacity = Math.max(0, 1 - actualProgress) * 0.8;

          return (
            <circle
              key={`ripple-${ripple.id}`}
              cx={width / 2}
              cy={height / 2}
              r={radius}
              fill="none"
              stroke={ripple.id % 2 === 0 ? rippleColor : coreColor}
              strokeWidth="3"
              opacity={opacity}
              filter="url(#neonGlow)"
              strokeDasharray={`${radius * 0.1} ${radius * 0.05}`}
            />
          );
        })}

        {/* Núcleo pulsante */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={80 + Math.sin(waveProgress * Math.PI * 3) * 30}
          fill="url(#coreGrad)"
          opacity={waveProgress * 0.7}
          filter="url(#neonGlow)"
        />

        {/* Anillo interior */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={50}
          fill="none"
          stroke={coreColor}
          strokeWidth="2"
          opacity={waveProgress}
          filter="url(#neonGlow)"
        />
      </svg>

      {/* Texto central */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${1 + waveProgress * 0.15})`,
          fontSize: '100px',
          fontWeight: 'bold',
          color: rippleColor,
          opacity: Math.min(1, (waveProgress * 1.5 + solidifyProgress) / 2),
          textShadow: `
            0 0 10px ${rippleColor},
            0 0 20px ${coreColor},
            0 0 30px ${rippleColor},
            0 0 40px ${coreColor}
          `,
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '2px',
          filter: `drop-shadow(0 0 ${waveProgress * 25 + solidifyProgress * 15}px ${coreColor})`,
          transition: 'none',
        }}
      >
        {text}
      </div>

      {/* Aura solidificada */}
      {solidifyProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: `2px solid ${rippleColor}`,
            boxShadow: `
              0 0 20px ${rippleColor},
              0 0 40px ${coreColor},
              inset 0 0 30px ${coreColor}40
            `,
            opacity: solidifyProgress * 0.6,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default NeonRipple;
