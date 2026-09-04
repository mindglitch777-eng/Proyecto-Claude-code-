import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface WaveDistortionProps {
  text: string;
  waveColor?: string;
  duration?: number;
}

export const WaveDistortion: React.FC<WaveDistortionProps> = ({
  text,
  waveColor = '#00FFFF',
  duration = 1.9,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.5 ondas barrren, 0.5-1.0 solidifica
  const waveProgress = Math.min(progress / 0.5, 1);
  const solidifyProgress = Math.max(0, progress - 0.5) / 0.5;

  const waves = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      frequency: 1 + (i % 5) * 0.3,
      amplitude: 20 - (i % 5) * 3,
      phase: (i / 20) * Math.PI * 2,
    }));
  }, []);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(10,20,40,0.95) 0%, rgba(0,0,0,0.95) 100%)',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="waveDistort">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={waveProgress * 0.05}
              numOctaves="3"
              result="noise"
              seed={frame}
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={waveProgress * 50}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* Ondas visuales */}
        {waves.map((wave) => {
          const points = Array.from({ length: 100 }).map((_, i) => {
            const x = (i / 99) * width;
            const y =
              height / 2 +
              Math.sin(
                (x / 100) * wave.frequency + wave.phase + waveProgress * Math.PI * 4
              ) *
                wave.amplitude *
                waveProgress;
            return `${x},${y}`;
          });

          return (
            <polyline
              key={`wave-${wave.id}`}
              points={points.join(' ')}
              fill="none"
              stroke={waveColor}
              strokeWidth="2"
              opacity={waveProgress * 0.4 * (1 - wave.id / 20)}
            />
          );
        })}
      </svg>

      {/* Texto distorsionado */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          fontSize: '100px',
          fontWeight: 'bold',
          color: waveColor,
          opacity: Math.min(1, waveProgress * 1.5),
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '2px',
          filter: `blur(${Math.max(0, waveProgress - 0.3) * 15}px)
                   drop-shadow(0 0 ${waveProgress * 20}px ${waveColor})`,
          transform: `translate(-50%, -50%) skewY(${waveProgress * 5}deg) scale(${1 + waveProgress * 0.1})`,
        }}
      >
        {text}
      </div>

      {/* Aura que se estabiliza */}
      {solidifyProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '100px',
            fontWeight: 'bold',
            color: waveColor,
            opacity: solidifyProgress,
            textShadow: `
              0 0 15px ${waveColor},
              0 0 30px ${waveColor},
              0 0 45px ${waveColor}
            `,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px',
            filter: `drop-shadow(0 0 ${solidifyProgress * 25}px ${waveColor})`,
          }}
        >
          {text}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default WaveDistortion;
