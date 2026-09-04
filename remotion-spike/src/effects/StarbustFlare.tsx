import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface StarbustFlareProps {
  text: string;
  starColor?: string;
  duration?: number;
}

const StarbustFlare: React.FC<StarbustFlareProps> = ({
  text,
  starColor = '#FFFF00',
  duration = 2.0,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.4 rayos explotan, 0.4-0.8 máximo resplandor, 0.8-1.0 se desvanece
  const burstProgress = Math.min(progress / 0.4, 1);
  const glowProgress = Math.max(0, (progress - 0.4) / 0.4);
  const fadeProgress = Math.max(0, progress - 0.8) / 0.2;

  const rays = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      angle: (i / 24) * Math.PI * 2,
      length: 300 + Math.random() * 200,
      width: 4 + Math.random() * 6,
    }));
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * 400 + 100,
      size: Math.random() * 8 + 3,
      delay: Math.random() * 0.2,
    }));
  }, []);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.9)',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="starGrad">
            <stop offset="0%" stopColor={starColor} stopOpacity="1" />
            <stop offset="100%" stopColor={starColor} stopOpacity="0" />
          </radialGradient>
          <filter id="starGlow">
            <feGaussianBlur stdDeviation={glowProgress * 20} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rayos principales */}
        {rays.map((ray) => {
          const startX = width / 2;
          const startY = height / 2;
          const endX = startX + Math.cos(ray.angle) * ray.length * burstProgress;
          const endY = startY + Math.sin(ray.angle) * ray.length * burstProgress;

          return (
            <line
              key={`ray-${ray.id}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={starColor}
              strokeWidth={ray.width}
              opacity={burstProgress * (1 - glowProgress * 0.5)}
              filter="url(#starGlow)"
            />
          );
        })}

        {/* Estrellas volantes */}
        {stars.map((star) => {
          const actualProgress = Math.max(0, burstProgress - star.delay);
          const x = width / 2 + Math.cos(star.angle) * star.distance * actualProgress;
          const y = height / 2 + Math.sin(star.angle) * star.distance * actualProgress;

          return (
            <circle
              key={`star-${star.id}`}
              cx={x}
              cy={y}
              r={star.size * actualProgress}
              fill={starColor}
              opacity={actualProgress * (1 - fadeProgress)}
              filter="url(#starGlow)"
            />
          );
        })}

        {/* Círculo de expansión */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={burstProgress * 300}
          fill="none"
          stroke={starColor}
          strokeWidth="2"
          opacity={burstProgress * 0.6 * (1 - glowProgress)}
          filter="url(#starGlow)"
        />
      </svg>

      {/* Texto central */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          fontSize: '100px',
          fontWeight: 'bold',
          color: starColor,
          opacity: Math.min(1, glowProgress * 1.5 * (1 - fadeProgress)),
          textShadow: `
            0 0 20px ${starColor},
            0 0 40px ${starColor},
            0 0 60px ${starColor},
            0 0 80px ${starColor}
          `,
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '3px',
          filter: `drop-shadow(0 0 ${glowProgress * 40}px ${starColor})`,
          transform: `translate(-50%, -50%) scale(${1 + glowProgress * 0.2})`,
        }}
      >
        {text}
      </div>

      {/* Destello blanco */}
      {glowProgress > 0.3 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle at center, ${starColor}60 0%, transparent 70%)`,
            opacity: Math.max(0, glowProgress - 0.3),
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default StarbustFlare;
