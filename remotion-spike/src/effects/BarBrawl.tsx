import React from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface BarBrawlProps {
  labelA: string;
  labelB: string;
  winner: 'A' | 'B';
  colorA?: string;
  colorB?: string;
  duration?: number;
}

export const BarBrawl: React.FC<BarBrawlProps> = ({
  labelA,
  labelB,
  winner,
  colorA = '#FF0044',
  colorB = '#00FF88',
  duration = 1.8,
}) => {
  const { fps, width } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.35 barras entran y crecen, 0.35-0.55 choque, 0.55-1.0 ganador crece y perdedor se rompe
  const enterProgress = Math.min(progress / 0.35, 1);
  const clashProgress = Math.max(0, Math.min((progress - 0.35) / 0.2, 1));
  const resolveProgress = Math.max(0, progress - 0.55) / 0.45;

  const barMaxWidth = width * 0.38;
  const shake = clashProgress > 0 && clashProgress < 1 ? Math.sin(clashProgress * Math.PI * 8) * 10 * (1 - clashProgress) : 0;

  const aIsWinner = winner === 'A';
  const winnerColor = aIsWinner ? colorA : colorB;
  const winnerLabel = aIsWinner ? labelA : labelB;
  const loserColor = aIsWinner ? colorB : colorA;
  const loserLabel = aIsWinner ? labelB : labelA;

  const aWidth = barMaxWidth * enterProgress * (aIsWinner ? 1 + resolveProgress * 0.6 : Math.max(0.15, 1 - resolveProgress));
  const bWidth = barMaxWidth * enterProgress * (!aIsWinner ? 1 + resolveProgress * 0.6 : Math.max(0.15, 1 - resolveProgress));

  const loserOpacity = Math.max(0, 1 - resolveProgress * 1.4);
  const loserShatter = resolveProgress * 40;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '50px',
          transform: `translateX(${shake}px)`,
        }}
      >
        {/* Barra A (izquierda) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: `${barMaxWidth + 40}px` }}>
          <div
            style={{
              width: `${aWidth}px`,
              height: '90px',
              background: `linear-gradient(90deg, ${colorA}30, ${colorA})`,
              borderRadius: '12px',
              boxShadow: `0 0 ${20 + clashProgress * 30}px ${colorA}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '24px',
              opacity: aIsWinner ? 1 : loserOpacity,
              filter: aIsWinner ? 'none' : `blur(${loserShatter * 0.15}px)`,
              transform: aIsWinner ? 'none' : `translateX(${loserShatter}px) rotateZ(${loserShatter * 0.3}deg)`,
            }}
          >
            <span
              style={{
                fontSize: '38px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                fontFamily: 'Arial, sans-serif',
                whiteSpace: 'nowrap',
                textShadow: `0 0 10px ${colorA}`,
              }}
            >
              {labelA}
            </span>
          </div>
        </div>

        {/* Barra B (derecha) */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', width: `${barMaxWidth + 40}px` }}>
          <div
            style={{
              width: `${bWidth}px`,
              height: '90px',
              background: `linear-gradient(270deg, ${colorB}30, ${colorB})`,
              borderRadius: '12px',
              boxShadow: `0 0 ${20 + clashProgress * 30}px ${colorB}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: '24px',
              opacity: !aIsWinner ? 1 : loserOpacity,
              filter: !aIsWinner ? 'none' : `blur(${loserShatter * 0.15}px)`,
              transform: !aIsWinner ? 'none' : `translateX(-${loserShatter}px) rotateZ(-${loserShatter * 0.3}deg)`,
            }}
          >
            <span
              style={{
                fontSize: '38px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                fontFamily: 'Arial, sans-serif',
                whiteSpace: 'nowrap',
                textShadow: `0 0 10px ${colorB}`,
              }}
            >
              {labelB}
            </span>
          </div>
        </div>

        {/* Destello de choque en el centro */}
        {clashProgress > 0 && clashProgress < 1 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${120 * (1 - clashProgress) + 40}px`,
              height: `${120 * (1 - clashProgress) + 40}px`,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.8)',
              opacity: 1 - clashProgress,
              filter: 'blur(6px)',
            }}
          />
        )}

        {/* Texto del ganador */}
        {resolveProgress > 0.3 && (
          <div
            style={{
              position: 'absolute',
              bottom: '-100px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '46px',
              fontWeight: 'bold',
              color: winnerColor,
              opacity: Math.min(1, (resolveProgress - 0.3) * 3),
              textShadow: `0 0 20px ${winnerColor}, 0 0 40px ${winnerColor}`,
              fontFamily: 'Arial, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {winnerLabel} GANA
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default BarBrawl;
