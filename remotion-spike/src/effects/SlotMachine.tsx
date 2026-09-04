import React from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface SlotMachineProps {
  finalNumber: string;
  metalColor?: string;
  duration?: number;
}

const SlotMachine: React.FC<SlotMachineProps> = ({
  finalNumber,
  metalColor = '#FFD700',
  duration = 1.8,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.7 rodillo girando rápido, 0.7-0.9 frena y se detiene, 0.9-1.0 chispas
  const rollingProgress = Math.min(progress / 0.7, 1);
  const stopProgress = Math.max(0, progress - 0.7) / 0.2;
  const sparkProgress = Math.max(0, progress - 0.9) / 0.1;

  // Simular dígitos (mostrar rotando)
  const digits = finalNumber.split('');
  const rollingOffset = rollingProgress * 500; // simula rotación rápida

  // Vibración al parar
  const vibration = stopProgress > 0 ? Math.sin(stopProgress * Math.PI * 5) * 8 * (1 - stopProgress) : 0;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle, rgba(40,40,40,1) 0%, rgba(0,0,0,1) 100%)',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          transform: `translate(${vibration}px, ${vibration * 0.5}px)`,
        }}
      >
        {/* Caja metálica de la máquina tragamonedas */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '300px',
            background: `linear-gradient(135deg, ${metalColor}40, ${metalColor}20)`,
            border: `4px solid ${metalColor}`,
            borderRadius: '20px',
            boxShadow: `0 0 40px ${metalColor}, inset 0 0 30px ${metalColor}20`,
            opacity: 0.7,
          }}
        />

        {/* Dígitos rodando */}
        <div style={{ position: 'relative', display: 'flex', gap: '30px' }}>
          {digits.map((digit, i) => (
            <div
              key={i}
              style={{
                width: '100px',
                height: '150px',
                overflow: 'hidden',
                border: `3px solid ${metalColor}`,
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: `inset 0 0 20px rgba(0, 0, 0, 0.9), 0 0 15px ${metalColor}`,
              }}
            >
              <div
                style={{
                  fontSize: '120px',
                  fontWeight: 'bold',
                  color: metalColor,
                  transform: `translateY(${
                    progress < 0.7 ? -rollingOffset + i * 30 : -Math.min(i * 50, 150)
                  }px)`,
                  transition: progress > 0.7 ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                  textShadow: `0 0 20px ${metalColor}`,
                  fontFamily: 'monospace',
                }}
              >
                {/* Simular rueda: números del 0-9 */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, idx) => (
                  <div key={idx} style={{ height: '120px', lineHeight: '120px' }}>
                    {n}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Chispas de metal al parar */}
        {sparkProgress > 0 &&
          Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 80 * sparkProgress;
            return (
              <div
                key={`spark-${i}`}
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '6px',
                  background: metalColor,
                  borderRadius: '50%',
                  left: `calc(50% + ${Math.cos(angle) * distance}px)`,
                  top: `calc(50% + ${Math.sin(angle) * distance}px)`,
                  opacity: Math.max(0, 1 - sparkProgress),
                  boxShadow: `0 0 10px ${metalColor}`,
                }}
              />
            );
          })}

        {/* Golpe metálico visual (flash blanco) */}
        {stopProgress > 0 && stopProgress < 0.1 && (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'rgba(255, 255, 255, 0.6)',
              opacity: 1 - stopProgress * 10,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

export default SlotMachine;
