import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface GlitchShatterProps {
  text: string;
  glitchColor: string;
  fragmentCount?: number;
  duration?: number;
}

export const GlitchShatter: React.FC<GlitchShatterProps> = ({
  text,
  glitchColor,
  fragmentCount = 50,
  duration = 1.2,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Tiembla → glitch → explosión
  const shake = Math.sin(progress * Math.PI * 8) * (1 - progress) * 15;
  const glitchIntensity = Math.sin(progress * Math.PI * 4) * 0.7;
  const explosionProgress = Math.max(0, progress - 0.4) / 0.6;

  const fragments = useMemo(() => {
    return Array.from({ length: fragmentCount }).map((_, i) => {
      const angle = (i / fragmentCount) * Math.PI * 2;
      const distance = 100 + Math.random() * 200;
      const finalX = Math.cos(angle) * distance;
      const finalY = Math.sin(angle) * distance;

      return {
        id: i,
        x: finalX * explosionProgress,
        y: finalY * explosionProgress,
        rotation: explosionProgress * 720,
        scale: Math.max(0, 1 - explosionProgress * 0.8),
      };
    });
  }, [explosionProgress, fragmentCount]);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.9)',
        transform: `translate(${shake}px, ${shake * 0.5}px)`,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Líneas de glitch */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`glitch-${i}`}
            style={{
              position: 'absolute',
              top: `${(i / 8) * 100}%`,
              left: 0,
              width: `${100 + glitchIntensity * 50}%`,
              height: '4px',
              background: `linear-gradient(90deg, ${glitchColor}00, ${glitchColor}80, ${glitchColor}00)`,
              opacity: Math.max(0, glitchIntensity),
              filter: `blur(${Math.abs(glitchIntensity) * 4}px)`,
            }}
          />
        ))}

        {/* Texto principal */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scaleX(${1 + glitchIntensity * 0.2})`,
            fontSize: '80px',
            fontWeight: 'bold',
            color: glitchColor,
            opacity: Math.max(0, 1 - explosionProgress * 0.8),
            textShadow: `
              ${glitchIntensity * 20}px 0px 0px rgba(0, 255, 255, 0.5),
              ${-glitchIntensity * 20}px 0px 0px rgba(255, 0, 255, 0.5)
            `,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '4px',
          }}
        >
          {text}
        </div>

        {/* Fragmentos que explotan */}
        {fragments.map((frag) => (
          <div
            key={frag.id}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '40px',
              height: '40px',
              background: glitchColor,
              transform: `translate(calc(-50% + ${frag.x}px), calc(-50% + ${frag.y}px)) rotate(${frag.rotation}deg) scale(${frag.scale})`,
              opacity: Math.max(0, explosionProgress),
              boxShadow: `0 0 10px ${glitchColor}`,
            }}
          />
        ))}

        {/* Pantalla de interferencia */}
        <svg
          width={width}
          height={height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: glitchIntensity * 0.5,
          }}
        >
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
          </filter>
          <rect width={width} height={height} fill={glitchColor} opacity="0.2" filter="url(#noise)" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export default GlitchShatter;
