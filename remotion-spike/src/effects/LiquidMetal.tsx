import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface LiquidMetalProps {
  text: string;
  metalColor?: string;
  glowColor?: string;
  duration?: number;
}

const LiquidMetal: React.FC<LiquidMetalProps> = ({
  text,
  metalColor = '#C0C0C0',
  glowColor = '#00FFFF',
  duration = 1.5,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.4 forma metal líquido, 0.4-0.8 solidifica, 0.8-1.0 pulsa
  const formProgress = Math.min(progress / 0.4, 1);
  const solidifyProgress = Math.max(0, (progress - 0.4) / 0.4);
  const pulsePhase = Math.max(0, progress - 0.8) / 0.2;

  const waves = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      offset: (i / 12) * Math.PI * 2,
      amplitude: Math.random() * 30 + 20,
      frequency: Math.random() * 2 + 1,
    }));
  }, []);

  const textWidth = text.length * 45;
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(30,30,40,0.95) 0%, rgba(10,10,20,0.95) 100%)',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Ondas de metal líquido (SVG) */}
        <svg
          width={width}
          height={height}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={metalColor} stopOpacity="0.9" />
              <stop offset="50%" stopColor={glowColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={metalColor} stopOpacity="0.6" />
            </linearGradient>
            <filter id="metalBlur">
              <feGaussianBlur stdDeviation={formProgress * 10} />
            </filter>
          </defs>

          {/* Fondo ondulante */}
          {waves.map((wave) => {
            const points = Array.from({ length: 40 }).map((_, i) => {
              const x = (i / 39) * width;
              const y =
                centerY +
                Math.sin(x / 100 + wave.offset + formProgress * Math.PI * 2) *
                  wave.amplitude *
                  formProgress;
              return `${x},${y}`;
            });

            return (
              <polyline
                key={`wave-${wave.id}`}
                points={points.join(' ')}
                fill="none"
                stroke={metalColor}
                strokeWidth={2}
                opacity={formProgress * 0.6}
                filter="url(#metalBlur)"
              />
            );
          })}

          {/* Esfera de metal central */}
          <circle
            cx={centerX}
            cy={centerY - 40}
            r={60 * formProgress}
            fill="url(#metalGrad)"
            opacity={formProgress * 0.8}
            filter="url(#metalBlur)"
          />

          {/* Reflejo */}
          <ellipse
            cx={centerX - 20}
            cy={centerY - 60}
            rx={30 * formProgress}
            ry={40 * formProgress}
            fill={glowColor}
            opacity={formProgress * 0.4}
          />
        </svg>

        {/* Texto solidificándose */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            fontSize: '120px',
            fontWeight: 'bold',
            color: metalColor,
            opacity: Math.min(1, solidifyProgress * 2),
            textShadow: `
              0 0 20px ${glowColor},
              0 0 40px ${glowColor},
              inset -2px -2px 10px rgba(0, 0, 0, 0.8)
            `,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '3px',
            filter: `drop-shadow(0 0 ${solidifyProgress * 20}px ${glowColor})`,
            transform: `translate(-50%, -50%) scaleY(${1 + formProgress * 0.3})`,
          }}
        >
          {text}
        </div>

        {/* Pulsación final */}
        {solidifyProgress > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${textWidth + 100}px`,
              height: '150px',
              border: `3px solid ${glowColor}`,
              borderRadius: '20px',
              opacity: Math.max(0, pulsePhase * 0.6),
              boxShadow: `0 0 ${pulsePhase * 40}px ${glowColor}, inset 0 0 20px ${glowColor}40`,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

export default LiquidMetal;
