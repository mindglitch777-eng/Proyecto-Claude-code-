import React from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface FlipCardsProps {
  items: string[];
  cardColor?: string;
  textColor?: string;
  duration?: number;
}

export const FlipCards: React.FC<FlipCardsProps> = ({
  items,
  cardColor = '#003366',
  textColor = '#FFFFFF',
  duration = 2.0,
}) => {
  const { fps, width } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  const cardWidth = Math.min(240, (width - 80) / items.length - 20);
  const staggerSpan = 0.5; // fraccion del tiempo total usada para el stagger de entrada
  const perCardDelay = items.length > 1 ? staggerSpan / items.length : 0;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#050505',
        perspective: '1200px',
      }}
    >
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {items.map((item, i) => {
          const delay = i * perCardDelay;
          const cardProgress = Math.max(0, Math.min((progress - delay) / (1 - staggerSpan), 1));
          // 0 -> 1: rotacion de perfil (90deg) a de frente (0deg), con leve overshoot
          const rotation = 90 * (1 - cardProgress);
          const settle = cardProgress > 0.85 ? Math.sin((cardProgress - 0.85) * Math.PI * 6) * 6 * (1 - cardProgress) * 6 : 0;
          const opacity = Math.min(1, cardProgress * 2.5);
          const glow = Math.max(0, cardProgress - 0.7) / 0.3;

          return (
            <div
              key={i}
              style={{
                width: `${cardWidth}px`,
                height: `${cardWidth * 1.3}px`,
                borderRadius: '18px',
                background: `linear-gradient(145deg, ${cardColor}, ${cardColor}CC)`,
                border: `2px solid ${cardColor}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '12px',
                opacity,
                boxShadow: `0 0 ${10 + glow * 30}px ${cardColor}`,
                transform: `rotateY(${rotation + settle}deg)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <span
                style={{
                  fontSize: `${Math.max(22, cardWidth * 0.15)}px`,
                  fontWeight: 'bold',
                  color: textColor,
                  fontFamily: 'Arial, sans-serif',
                  opacity: Math.max(0, (cardProgress - 0.5) * 2),
                  textShadow: `0 0 ${glow * 15}px ${textColor}`,
                }}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default FlipCards;
