import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import { motion } from 'framer-motion';

interface ArquitecturaNeonProps {
  text: string;
  mainColor: string;
  sparkColor: string;
  duration?: number;
}

const ArquitecturaNeon: React.FC<ArquitecturaNeonProps> = ({
  text,
  mainColor,
  sparkColor,
  duration = 2.0,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;

  const progress = Math.min(frame / durationFrames, 1);

  // Wireframe inicial: mostrar el esqueleto
  const wireframeOpacity = Math.max(0, 1 - progress * 1.2);
  const neonOpacity = Math.max(0, progress - 0.3);
  const sparkleOpacity = Math.max(0, Math.sin(progress * Math.PI * 3) * (progress > 0.4 ? 1 : 0));

  const glowIntensity = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Wireframe phase */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: wireframeOpacity,
          }}
        >
          <svg
            width="400"
            height="200"
            viewBox="0 0 400 200"
            style={{
              stroke: mainColor,
              fill: 'none',
              strokeWidth: 2,
              opacity: 0.4,
            }}
          >
            {/* Wireframe letters (simplified boxes) */}
            {text.split('').map((_, i) => (
              <g key={i}>
                <rect
                  x={50 + i * 50}
                  y={50}
                  width="40"
                  height="100"
                  style={{
                    opacity: Math.max(0, wireframeOpacity - i * 0.1),
                  }}
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Neon text phase */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${0.8 + progress * 0.4})`,
            opacity: neonOpacity,
            fontFamily: 'Arial, sans-serif',
            fontSize: '72px',
            fontWeight: 'bold',
            letterSpacing: '8px',
            color: mainColor,
            textShadow: `
              0 0 10px ${mainColor},
              0 0 20px ${mainColor},
              0 0 40px ${mainColor},
              0 0 80px ${mainColor},
              0 0 120px ${sparkColor}
            `,
            filter: `blur(${Math.max(0, 2 - progress * 4)}px)`,
          }}
        >
          {text}
        </div>

        {/* Sparkles/chispas */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const distance = 100 + Math.sin(progress * Math.PI * 2 + i) * 30;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;

          return (
            <div
              key={`spark-${i}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '8px',
                height: '8px',
                background: sparkColor,
                borderRadius: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                opacity: Math.max(0, sparkleOpacity * (1 - Math.abs(progress - 0.5) * 2)),
                boxShadow: `0 0 12px ${sparkColor}`,
              }}
            />
          );
        })}

        {/* Glow pulse en el fondo */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '500px',
            height: '500px',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${mainColor}${Math.floor(glowIntensity * 30).toString(16).padStart(2, '0')}, transparent 70%)`,
            opacity: neonOpacity * 0.3,
            filter: 'blur(40px)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default ArquitecturaNeon;
