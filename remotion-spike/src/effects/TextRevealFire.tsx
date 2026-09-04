import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface TextRevealFireProps {
  text: string;
  fireColor?: string;
  textColor?: string;
  duration?: number;
}

export const TextRevealFire: React.FC<TextRevealFireProps> = ({
  text,
  fireColor = '#FF6B35',
  textColor = '#FFFFFF',
  duration = 2.0,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.3 humo inicial, 0.3-0.8 fuego barre, 0.8-1.0 cenizas caen
  const smokeOpacity = Math.max(0, 1 - progress * 2);
  const fireProgress = Math.max(0, (progress - 0.3) / 0.5);
  const ashProgress = Math.max(0, progress - 0.8) / 0.2;

  const ashParticles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 400 - 200,
      y: 0,
      delay: Math.random() * 0.2,
    }));
  }, []);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(20, 20, 20, 0.95)',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Humo inicial (blur y oscuridad) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '100px',
            fontWeight: 'bold',
            color: textColor,
            opacity: smokeOpacity,
            filter: `blur(${smokeOpacity * 30}px) brightness(${0.3 + smokeOpacity * 0.7})`,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px',
          }}
        >
          {text}
        </div>

        {/* Línea de fuego barriendo */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `calc(-50% + ${fireProgress * 100}%)`,
            width: '200px',
            height: '200px',
            transform: 'translateY(-50%)',
            background: `linear-gradient(90deg, transparent, ${fireColor}, transparent)`,
            filter: 'blur(20px)',
            opacity: fireProgress * 0.8,
            boxShadow: `0 0 60px ${fireColor}`,
          }}
        />

        {/* Texto revelado (nítido, brillante) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '100px',
            fontWeight: 'bold',
            color: textColor,
            opacity: Math.min(1, fireProgress * 1.5),
            textShadow: `
              0 0 10px ${fireColor},
              0 0 20px ${fireColor},
              0 0 30px ${fireColor}
            `,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px',
            filter: `drop-shadow(0 0 ${fireProgress * 30}px ${fireColor})`,
          }}
        >
          {text}
        </div>

        {/* Cenizas cayendo */}
        {ashProgress > 0 &&
          ashParticles.map((ash) => {
            const actualProgress = Math.max(0, ashProgress - ash.delay);
            return (
              <div
                key={ash.id}
                style={{
                  position: 'absolute',
                  top: `calc(50% + ${actualProgress * 300}px)`,
                  left: `calc(50% + ${ash.x}px)`,
                  width: `${4 + Math.random() * 4}px`,
                  height: `${4 + Math.random() * 4}px`,
                  background: 'rgba(200, 100, 50, 0.6)',
                  borderRadius: '50%',
                  opacity: Math.max(0, 1 - actualProgress * 1.5),
                  boxShadow: `0 0 4px ${fireColor}40`,
                }}
              />
            );
          })}
      </div>
    </AbsoluteFill>
  );
};

export default TextRevealFire;
