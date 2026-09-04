import React from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface HeartbeatPulseProps {
  text: string;
  pulseColor: string;
  beats?: number;
  duration?: number;
}

export const HeartbeatPulse: React.FC<HeartbeatPulseProps> = ({
  text,
  pulseColor,
  beats = 3,
  duration = 2.0,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Ciclo de latidos
  const beatCycle = progress * beats; // 0 a beats
  const currentBeat = Math.floor(beatCycle);
  const beatProgress = beatCycle - currentBeat; // 0 a 1 dentro de cada latido

  // Cada latido: crece → se encoge → pausa
  const isLastBeat = currentBeat >= beats - 1;
  let pulseScale = 0.2;

  if (beatProgress < 0.3) {
    // Crece rápido
    pulseScale = 0.2 + (beatProgress / 0.3) * 0.6;
  } else if (beatProgress < 0.6) {
    // Se encoge
    pulseScale = 0.8 - ((beatProgress - 0.3) / 0.3) * 0.4;
  } else {
    // Pausa pequeño
    pulseScale = 0.4;
  }

  // Último latido es disparado hacia la cámara (zoom violento)
  const finalZoom = isLastBeat ? 1 + beatProgress * 0.8 : 1;
  const motionBlur = isLastBeat ? beatProgress * 0.15 : 0;

  // Glow intenso con cada latido
  const glowIntensity = Math.sin(beatProgress * Math.PI) * 0.8;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.95)',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Pulsación principal */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${pulseScale * finalZoom})`,
            fontSize: '120px',
            fontWeight: 'bold',
            color: pulseColor,
            opacity: Math.max(0, 1 - motionBlur * 2),
            textShadow: `
              0 0 20px ${pulseColor},
              0 0 ${40 + glowIntensity * 60}px ${pulseColor},
              0 0 ${80 + glowIntensity * 100}px ${pulseColor}
            `,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '3px',
            filter: `blur(${motionBlur * 8}px)`,
          }}
        >
          {text}
        </div>

        {/* Aura pulsante alrededor */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${200 + pulseScale * 200}px`,
            height: `${200 + pulseScale * 200}px`,
            transform: `translate(-50%, -50%) scale(${finalZoom})`,
            border: `3px solid ${pulseColor}`,
            borderRadius: '50%',
            opacity: glowIntensity * 0.6,
            boxShadow: `0 0 ${30 + glowIntensity * 60}px ${pulseColor}`,
          }}
        />

        {/* Aura secundaria (más grande, más tenue) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${400 + pulseScale * 300}px`,
            height: `${400 + pulseScale * 300}px`,
            transform: `translate(-50%, -50%) scale(${finalZoom})`,
            border: `2px solid ${pulseColor}`,
            borderRadius: '50%',
            opacity: glowIntensity * 0.3,
            boxShadow: `0 0 ${50 + glowIntensity * 80}px ${pulseColor}40`,
          }}
        />

        {/* Líneas de energía radiantes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <svg
            key={`line-${i}`}
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: glowIntensity * 0.5,
            }}
          >
            <line
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${Math.cos((i / 8) * Math.PI * 2) * 200 * (1 + pulseScale)}px)`}
              y2={`calc(50% + ${Math.sin((i / 8) * Math.PI * 2) * 200 * (1 + pulseScale)}px)`}
              stroke={pulseColor}
              strokeWidth="2"
              opacity={glowIntensity * 0.7}
            />
          </svg>
        ))}

        {/* Destello final en el último latido */}
        {isLastBeat && beatProgress > 0.7 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `rgba(255, 255, 255, ${(beatProgress - 0.7) * 0.5})`,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

export default HeartbeatPulse;
