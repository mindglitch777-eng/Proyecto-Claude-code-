import React, { useRef, useEffect } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface CapsulaHolograficaProps {
  caseName: string;
  finalAmount: string;
  hologramColor: string;
  duration?: number;
}

export const CapsulaHolografica: React.FC<CapsulaHolograficaProps> = ({
  caseName,
  finalAmount,
  hologramColor,
  duration = 2.0,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Dolly zoom effect (Hitchcock): la cámara se acerca mientras la barra crece
  const zoomFactor = 1 + progress * 0.5;
  const platformScale = 0.8 + progress * 0.4;

  // Barra que crece desde el piso
  const barHeight = Math.max(0, progress) * 200;
  const fireIntensity = Math.sin(progress * Math.PI * 3) * 0.5 + 0.5;

  // Sello que se estampa
  const sealScale = Math.max(0, (progress - 0.6) * 5);
  const shockwaveRadius = Math.max(0, (progress - 0.6) * 200);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at center, rgba(0, 20, 40, 1) 0%, rgba(0, 0, 0, 1) 100%)',
        perspective: '1200px',
        transform: `scale(${zoomFactor})`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '400px',
          height: '400px',
        }}
      >
        {/* Plataforma circular futurista */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '300px',
            height: '300px',
            transform: `translate(-50%, -50%) rotateX(60deg) scale(${platformScale})`,
            background: `conic-gradient(from 0deg, ${hologramColor}40, ${hologramColor}20, ${hologramColor}40)`,
            borderRadius: '50%',
            border: `3px solid ${hologramColor}80`,
            boxShadow: `
              0 0 30px ${hologramColor},
              inset 0 0 20px ${hologramColor}40
            `,
          }}
        />

        {/* Silueta humana 3D */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: `translate(-50%, -50%) rotateY(${progress * 180}deg)`,
            width: '60px',
            height: '100px',
            opacity: 0.7,
          }}
        >
          <svg
            width="60"
            height="100"
            viewBox="0 0 60 100"
            style={{
              stroke: hologramColor,
              fill: `${hologramColor}40`,
              filter: `drop-shadow(0 0 10px ${hologramColor})`,
            }}
          >
            <circle cx="30" cy="15" r="10" />
            <rect x="20" y="28" width="20" height="35" rx="5" />
            <line x1="20" y1="40" x2="10" y2="65" strokeWidth="3" />
            <line x1="40" y1="40" x2="50" y2="65" strokeWidth="3" />
          </svg>
        </div>

        {/* Barra 3D que crece */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '50%',
            width: '50px',
            height: `${barHeight}px`,
            transform: 'translateX(-50%)',
            background: `linear-gradient(to top, ${hologramColor}, #FF6B35)`,
            borderRadius: '4px',
            boxShadow: `
              0 0 20px ${hologramColor},
              0 0 40px #FF6B35
            `,
          }}
        />

        {/* Fuego en la punta de la barra */}
        <div
          style={{
            position: 'absolute',
            bottom: `${60 + barHeight}px`,
            left: '50%',
            width: '60px',
            height: '40px',
            transform: 'translateX(-50%)',
            opacity: fireIntensity * 0.8,
          }}
        >
          <svg
            width="60"
            height="40"
            viewBox="0 0 60 40"
            style={{
              filter: `drop-shadow(0 0 15px #FF6B35)`,
            }}
          >
            <path
              d="M 30 40 Q 15 20, 20 0 Q 25 15, 30 5 Q 35 15, 40 0 Q 45 20, 30 40"
              fill="#FF6B35"
              opacity="0.8"
            />
            <path
              d="M 30 30 Q 22 20, 25 10 Q 28 18, 30 12 Q 32 18, 35 10 Q 38 20, 30 30"
              fill="#FFD700"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* Sello VERIFICADO */}
        <div
          style={{
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: '80px',
            height: '80px',
            transform: `scale(${sealScale}) rotateZ(-15deg)`,
            opacity: Math.max(0, progress - 0.6),
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            style={{
              filter: `drop-shadow(0 0 12px ${hologramColor})`,
            }}
          >
            <circle cx="40" cy="40" r="35" fill="none" stroke={hologramColor} strokeWidth="2" />
            <path
              d="M 28 42 L 38 52 L 58 32"
              stroke={hologramColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="40"
              y="70"
              textAnchor="middle"
              fill={hologramColor}
              fontSize="10"
              fontWeight="bold"
            >
              VERIFICADO
            </text>
          </svg>
        </div>

        {/* Onda de choque (shockwave) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${shockwaveRadius * 2}px`,
            height: `${shockwaveRadius * 2}px`,
            transform: 'translate(-50%, -50%)',
            border: `2px solid ${hologramColor}`,
            borderRadius: '50%',
            opacity: Math.max(0, 1 - (progress - 0.6) * 3),
            boxShadow: `0 0 20px ${hologramColor}`,
          }}
        />

        {/* Información */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            opacity: 0.8,
          }}
        >
          <div
            style={{
              color: hologramColor,
              fontSize: '14px',
              fontWeight: 'bold',
              textShadow: `0 0 10px ${hologramColor}`,
            }}
          >
            {caseName}
          </div>
          <div
            style={{
              color: '#FFD700',
              fontSize: '20px',
              fontWeight: 'bold',
              textShadow: `0 0 15px #FFD700`,
              marginTop: '5px',
            }}
          >
            {finalAmount}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default CapsulaHolografica;
