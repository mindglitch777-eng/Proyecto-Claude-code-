import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface DevoradorRealidadProps {
  loserObject: string;
  winnerObject: string;
  neonColor: string;
  duration?: number;
}

const DevoradorRealidad: React.FC<DevoradorRealidadProps> = ({
  loserObject,
  winnerObject,
  neonColor,
  duration = 1.8,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases:
  // 0.0-0.3: objetos en posición, ganador comienza a fluir
  // 0.3-0.7: vórtice absorbe objeto perdedor (estiramiento pixelizado)
  // 0.7-1.0: ganador solidificado con brillo y partículas orbitando

  const absorptionProgress = Math.max(0, progress - 0.3) / 0.4;
  const solidifyProgress = Math.max(0, progress - 0.7) / 0.3;

  // Objeto perdedor: se estira y pixeliza
  const loserStretchX = 1 - absorptionProgress * 0.8;
  const loserStretchY = 1 + absorptionProgress * 1.5;
  const loserPixelization = absorptionProgress * 40; // blur para efecto de pixelización
  const loserOpacity = 1 - absorptionProgress * 0.9;
  const loserX = absorptionProgress * 150; // se mueve hacia el vórtice

  // Vórtice (ganador en estado líquido)
  const vortexRotation = progress * 720; // gira rápidamente
  const vortexScale = 0.7 + absorptionProgress * 0.3;
  const vortexOpacity = Math.min(1, absorptionProgress * 1.5);

  // Ganador solidificado
  const solidScale = 0.8 + solidifyProgress * 0.3;
  const pulseGlow = Math.sin(solidifyProgress * Math.PI * 3) * 0.5 + 0.5;

  // Partículas orbitando
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2 + progress * Math.PI * 2 * 2; // órbita rápida
      const distance = 80 + Math.sin(progress * Math.PI * 2 + i) * 20;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    });
  }, [progress]);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.9)',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Objeto perdedor (izquierda) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `calc(25% + ${loserX}px)`,
            transform: `translate(-50%, -50%) scaleX(${loserStretchX}) scaleY(${loserStretchY})`,
            fontSize: '60px',
            fontWeight: 'bold',
            color: '#444',
            opacity: loserOpacity,
            textShadow: `0 0 15px rgba(255, 255, 255, 0.5)`,
            filter: `blur(${loserPixelization}px) brightness(${1 - absorptionProgress * 0.6})`,
            fontFamily: 'Arial, sans-serif',
            transition: 'all 0.05s linear',
          }}
        >
          {loserObject}
        </div>

        {/* Vórtice líquido metálico (centro) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '150px',
            height: '150px',
            transform: `translate(-50%, -50%) rotate(${vortexRotation}deg) scale(${vortexScale})`,
            opacity: vortexOpacity,
          }}
        >
          {/* Forma de vórtice con SVG */}
          <svg
            width="150"
            height="150"
            viewBox="0 0 150 150"
            style={{
              filter: `drop-shadow(0 0 ${15 + absorptionProgress * 20}px ${neonColor})`,
            }}
          >
            {/* Espiral del vórtice */}
            <defs>
              <radialGradient id="vortexGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={neonColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={neonColor} stopOpacity="0.1" />
              </radialGradient>
            </defs>

            <circle cx="75" cy="75" r="60" fill="url(#vortexGrad)" />

            {/* Líneas espirales */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const x1 = 75 + Math.cos(angle) * 30;
              const y1 = 75 + Math.sin(angle) * 30;
              const x2 = 75 + Math.cos(angle) * 60;
              const y2 = 75 + Math.sin(angle) * 60;

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={neonColor}
                  strokeWidth="2"
                  opacity="0.6"
                />
              );
            })}

            {/* Punto central oscuro (agujero) */}
            <circle cx="75" cy="75" r="15" fill="#000" opacity="0.8" />
          </svg>
        </div>

        {/* Ganador solidificado (derecha) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '75%',
            transform: `translate(-50%, -50%) scale(${solidScale})`,
            fontSize: '60px',
            fontWeight: 'bold',
            color: neonColor,
            opacity: 0.8 + solidifyProgress * 0.2,
            textShadow: `
              0 0 10px ${neonColor},
              0 0 20px ${neonColor},
              0 0 ${10 + pulseGlow * 30}px ${neonColor}
            `,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {winnerObject}
        </div>

        {/* Partículas orbitando ganador */}
        {solidifyProgress > 0 &&
          particles.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                top: 'calc(50% + 0px)', // ajustar según posición del ganador
                left: 'calc(75% + 0px)',
                width: '6px',
                height: '6px',
                background: neonColor,
                borderRadius: '50%',
                transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
                opacity: solidifyProgress * 0.7,
                boxShadow: `0 0 8px ${neonColor}`,
              }}
            />
          ))}

        {/* Onda de absorción */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${150 + absorptionProgress * 200}px`,
            height: `${150 + absorptionProgress * 200}px`,
            transform: 'translate(-50%, -50%)',
            border: `1px solid ${neonColor}`,
            borderRadius: '50%',
            opacity: Math.max(0, absorptionProgress * 0.8 - absorptionProgress * absorptionProgress),
            boxShadow: `inset 0 0 ${20 + absorptionProgress * 30}px ${neonColor}40`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default DevoradorRealidad;
