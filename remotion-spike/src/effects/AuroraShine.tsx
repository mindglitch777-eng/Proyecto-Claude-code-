import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface AuroraShineProps {
  text: string;
  auroraColor1?: string;
  auroraColor2?: string;
  duration?: number;
}

const AuroraShine: React.FC<AuroraShineProps> = ({
  text,
  auroraColor1 = '#00FF88',
  auroraColor2 = '#FF00FF',
  duration = 2.3,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.4 aurora sube, 0.4-0.9 máximo brillo, 0.9-1.0 estela
  const auroraProgress = Math.min(progress / 0.4, 1);
  const peakProgress = Math.max(0, (progress - 0.4) / 0.5);
  const trailProgress = Math.max(0, progress - 0.9) / 0.1;

  const waves = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      amplitude: 100 + (i % 4) * 50,
      frequency: 0.5 + (i % 3) * 0.3,
      phase: (i / 8) * Math.PI * 2,
      color: i % 2 === 0 ? auroraColor1 : auroraColor2,
    }));
  }, [auroraColor1, auroraColor2]);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(20,0,40,0.95) 0%, rgba(0,0,20,0.98) 100%)',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <linearGradient id="auroraGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={auroraColor1} stopOpacity="0.8" />
            <stop offset="50%" stopColor={auroraColor2} stopOpacity="0.4" />
            <stop offset="100%" stopColor={auroraColor1} stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="auroraGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={auroraColor2} stopOpacity="0.8" />
            <stop offset="50%" stopColor={auroraColor1} stopOpacity="0.4" />
            <stop offset="100%" stopColor={auroraColor2} stopOpacity="0.1" />
          </linearGradient>

          <filter id="auroraBlur">
            <feGaussianBlur stdDeviation={peakProgress * 30} />
          </filter>
        </defs>

        {/* Ondas de aurora */}
        {waves.map((wave, idx) => {
          const points = Array.from({ length: 100 }).map((_, i) => {
            const x = (i / 99) * width;
            const yOffset =
              Math.sin(
                (x / 200) * wave.frequency + wave.phase + auroraProgress * Math.PI * 2
              ) * wave.amplitude;
            const y =
              height / 2 -
              auroraProgress * 150 +
              yOffset * (0.3 + peakProgress * 0.7);
            return `${x},${y}`;
          });

          return (
            <polyline
              key={`aurora-wave-${wave.id}`}
              points={points.join(' ')}
              fill="none"
              stroke={wave.color}
              strokeWidth={idx % 2 === 0 ? 8 : 6}
              opacity={auroraProgress * peakProgress * (1 - (idx / waves.length) * 0.3)}
              filter="url(#auroraBlur)"
            />
          );
        })}

        {/* Nubes de aurora rellenas */}
        {Array.from({ length: 5 }).map((_, i) => (
          <ellipse
            key={`cloud-${i}`}
            cx={width / 2 + (i - 2) * 200}
            cy={height / 2 - auroraProgress * 200}
            rx={300 + i * 50}
            ry={150 + i * 30}
            fill={i % 2 === 0 ? 'url(#auroraGrad1)' : 'url(#auroraGrad2)'}
            opacity={auroraProgress * peakProgress * (1 - i * 0.15)}
            filter="url(#auroraBlur)"
          />
        ))}

        {/* Destello central */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={peakProgress * 400}
          fill="none"
          stroke={auroraColor1}
          strokeWidth="2"
          opacity={peakProgress * 0.4}
          filter="url(#auroraBlur)"
        />
      </svg>

      {/* Texto brillante */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${-auroraProgress * 50}px)`,
          fontSize: '100px',
          fontWeight: 'bold',
          color: auroraColor1,
          opacity: Math.min(1, peakProgress * 1.5),
          textShadow: `
            0 0 15px ${auroraColor1},
            0 0 30px ${auroraColor2},
            0 0 45px ${auroraColor1},
            0 0 60px ${auroraColor2}
          `,
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '2px',
          filter: `drop-shadow(0 0 ${peakProgress * 35}px ${auroraColor2})`,
          transition: 'none',
        }}
      >
        {text}
      </div>

      {/* Estela de luz */}
      {trailProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '80%',
            background: `linear-gradient(180deg,
              ${auroraColor1}80 0%,
              ${auroraColor2}40 25%,
              ${auroraColor1}20 50%,
              transparent 100%)`,
            opacity: trailProgress * 0.5,
            pointerEvents: 'none',
            filter: `blur(${trailProgress * 60}px)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default AuroraShine;
