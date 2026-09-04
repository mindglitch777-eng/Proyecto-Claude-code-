import React from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface ChromaticShiftProps {
  text: string;
  duration?: number;
}

export const ChromaticShift: React.FC<ChromaticShiftProps> = ({
  text,
  duration = 1.6,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.3 aberración crece, 0.3-0.8 vibración máxima, 0.8-1.0 estabiliza
  const aberrationProgress = Math.min(progress / 0.3, 1);
  const vibrationProgress = Math.max(0, (progress - 0.3) / 0.5);
  const stabilizeProgress = Math.max(0, progress - 0.8) / 0.2;

  const shiftAmount = aberrationProgress * 15 * Math.sin(vibrationProgress * Math.PI * 4);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(10, 10, 20, 0.95)',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Capa roja */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${shiftAmount}px), -50%)`,
            fontSize: '100px',
            fontWeight: 'bold',
            color: '#FF0000',
            opacity: 0.8,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px',
            mixBlendMode: 'screen',
            filter: `blur(${aberrationProgress * 3}px)`,
          }}
        >
          {text}
        </div>

        {/* Capa verde */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${shiftAmount * 0.6}px), -50%)`,
            fontSize: '100px',
            fontWeight: 'bold',
            color: '#00FF00',
            opacity: 0.6,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px',
            mixBlendMode: 'screen',
            filter: `blur(${aberrationProgress * 2}px)`,
          }}
        >
          {text}
        </div>

        {/* Capa azul */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% - ${shiftAmount * 1.2}px), -50%)`,
            fontSize: '100px',
            fontWeight: 'bold',
            color: '#0099FF',
            opacity: 0.7,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px',
            mixBlendMode: 'screen',
            filter: `blur(${aberrationProgress * 2.5}px)`,
          }}
        >
          {text}
        </div>

        {/* Capa blanca estabilizada */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '100px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            opacity: stabilizeProgress,
            textShadow: `
              0 0 10px #FF0000,
              0 0 10px #00FF00,
              0 0 10px #0099FF
            `,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px',
            filter: `drop-shadow(0 0 ${stabilizeProgress * 20}px rgba(255, 0, 255, 0.8))`,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default ChromaticShift;
