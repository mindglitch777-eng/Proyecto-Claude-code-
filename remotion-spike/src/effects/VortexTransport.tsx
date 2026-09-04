import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface VortexTransportProps {
  text: string;
  vortexColor?: string;
  duration?: number;
}

export const VortexTransport: React.FC<VortexTransportProps> = ({
  text,
  vortexColor = '#FF00FF',
  duration = 2.2,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.4 texto rota hacia vórtice, 0.4-0.8 vórtice máximo, 0.8-1.0 emerges
  const suckProgress = Math.min(progress / 0.4, 1);
  const vortexProgress = Math.max(0, (progress - 0.4) / 0.4);
  const emergeProgress = Math.max(0, progress - 0.8) / 0.2;

  const circles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      radius: 120 + (i / 16) * 480,
      initialRotation: (i / 16) * Math.PI * 2,
    }));
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 400 + 120,
      size: Math.random() * 10 + 3,
    }));
  }, []);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle, rgba(30,0,60,0.95) 0%, rgba(0,0,0,0.98) 100%)',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="vortexGlow">
            <feGaussianBlur stdDeviation={vortexProgress * 15} />
          </filter>
          <radialGradient id="vortexGrad">
            <stop offset="0%" stopColor={vortexColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={vortexColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Círculos de vórtice */}
        {circles.map((circle) => {
          const rotation = circle.initialRotation + vortexProgress * Math.PI * 4;
          const radiusMultiplier = 1 - vortexProgress * 0.5;

          return (
            <circle
              key={`circle-${circle.id}`}
              cx={width / 2}
              cy={height / 2}
              r={circle.radius * radiusMultiplier}
              fill="none"
              stroke={vortexColor}
              strokeWidth="2"
              opacity={vortexProgress * 0.6 * (1 - circle.id / 16)}
              strokeDasharray="50 10"
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: `${width / 2}px ${height / 2}px`,
                transition: 'none',
              }}
            />
          );
        })}

        {/* Partículas en vórtice */}
        {particles.map((particle) => {
          const spiralRadius = particle.radius * (1 - vortexProgress);
          const rotation = vortexProgress * Math.PI * 6;
          const x = width / 2 + Math.cos(particle.angle + rotation) * spiralRadius;
          const y = height / 2 + Math.sin(particle.angle + rotation) * spiralRadius;

          return (
            <circle
              key={`particle-${particle.id}`}
              cx={x}
              cy={y}
              r={particle.size * (1 - vortexProgress * 0.8)}
              fill={vortexColor}
              opacity={vortexProgress * 0.7}
              filter="url(#vortexGlow)"
            />
          );
        })}

        {/* Núcleo del vórtice */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={Math.max(20, 180 * (1 - vortexProgress))}
          fill="url(#vortexGrad)"
          opacity={vortexProgress}
        />
      </svg>

      {/* Texto siendo absorbido */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%)
                       rotateZ(${suckProgress * 720}deg)
                       scale(${1 - suckProgress * 0.6})`,
          fontSize: '100px',
          fontWeight: 'bold',
          color: vortexColor,
          opacity: Math.max(0, 1 - suckProgress - vortexProgress * 0.8 + emergeProgress),
          textShadow: `0 0 20px ${vortexColor}`,
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '2px',
          filter: `blur(${suckProgress * 10}px) drop-shadow(0 0 ${suckProgress * 30}px ${vortexColor})`,
        }}
      >
        {text}
      </div>

      {/* Texto emergiendo */}
      {emergeProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${emergeProgress})`,
            fontSize: '100px',
            fontWeight: 'bold',
            color: vortexColor,
            opacity: emergeProgress,
            textShadow: `
              0 0 15px ${vortexColor},
              0 0 30px ${vortexColor}
            `,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px',
            filter: `drop-shadow(0 0 ${emergeProgress * 25}px ${vortexColor})`,
          }}
        >
          {text}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default VortexTransport;
