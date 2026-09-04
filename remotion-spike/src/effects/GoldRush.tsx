import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface GoldRushProps {
  achievementText: string;
  goldColor?: string;
  coinCount?: number;
  duration?: number;
}

export const GoldRush: React.FC<GoldRushProps> = ({
  achievementText,
  goldColor = '#FFD700',
  coinCount = 100,
  duration = 2.5,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  const coins = useMemo(() => {
    return Array.from({ length: coinCount }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      delay: (i / coinCount) * 0.3,
      rotation: Math.random() * 360,
      bounce: Math.sin(Math.random() * Math.PI) * 0.3,
    }));
  }, [coinCount, width]);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        {/* Monedas cayendo */}
        {coins.map((coin) => {
          const coinProgress = Math.max(0, (progress - coin.delay) / (1 - coin.delay));
          const fallDistance = coinProgress * (height + 100);
          const bounceOffset = coin.bounce * Math.sin(coinProgress * Math.PI * 3) * 50;

          return (
            <div
              key={coin.id}
              style={{
                position: 'absolute',
                top: fallDistance - height / 2 + bounceOffset,
                left: coin.x,
                width: '30px',
                height: '30px',
                background: `radial-gradient(circle at 30% 30%, ${goldColor}, #CC9500)`,
                borderRadius: '50%',
                opacity: Math.min(1, coinProgress * 2),
                boxShadow: `0 0 15px ${goldColor}, inset -2px -2px 5px rgba(0,0,0,0.5)`,
                transform: `rotateZ(${coin.rotation + coinProgress * 720}deg)`,
              }}
            />
          );
        })}

        {/* Pila de monedas en la base */}
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '4px',
          }}
        >
          {Array.from({ length: Math.ceil(coinCount / 10) }).map((_, i) => (
            <div
              key={`pile-${i}`}
              style={{
                width: '40px',
                height: `${Math.min(100, (i + 1) * 10)}px`,
                background: `linear-gradient(135deg, ${goldColor}, #CC9500)`,
                borderRadius: '4px',
                opacity: Math.max(0, progress - 0.7),
                boxShadow: `0 0 20px ${goldColor}40`,
              }}
            />
          ))}
        </div>

        {/* Texto de logro */}
        <div
          style={{
            position: 'absolute',
            bottom: '200px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '80px',
            fontWeight: 'bold',
            color: goldColor,
            opacity: Math.max(0, progress - 0.5),
            textShadow: `
              0 0 20px ${goldColor},
              0 0 40px ${goldColor}
            `,
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            letterSpacing: '2px',
          }}
        >
          {achievementText}
        </div>

        {/* Destello de impacto (breve, solo al tocar la base) */}
        {progress > 0.7 && progress < 0.78 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `rgba(255, 215, 0, ${Math.max(0, 0.12 - (progress - 0.7) * 1.5)})`,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

export default GoldRush;
