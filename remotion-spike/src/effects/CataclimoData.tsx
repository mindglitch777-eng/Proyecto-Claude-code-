import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface CataclismoDatosProps {
  oldNumber: string;
  newNumber: string;
  explosionColor: string;
  duration?: number;
}

export const CataclismoDatos: React.FC<CataclismoDatosProps> = ({
  oldNumber,
  newNumber,
  explosionColor,
  duration = 1.5,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases:
  // 0.0-0.4: aparece número viejo, comienza implosión
  // 0.4-0.7: pico de implosión (estiramiento espagueti)
  // 0.7-1.0: explosión, nueva partículas y número nuevo

  const oldNumberOpacity = Math.max(0, 1 - progress * 1.3);

  // Implosión: el número se distorsiona hacia el centro
  const implosionIntensity = Math.sin(Math.max(0, progress - 0.2) * Math.PI) * 1.5;
  const implosionX = Math.sin(progress * Math.PI * 2) * implosionIntensity * 30;
  const implosionY = Math.cos(progress * Math.PI * 2) * implosionIntensity * 30;
  const implosionScale = 1 - Math.max(0, progress - 0.3) * 0.6;

  // Nueva partículas (explosión dorada)
  const explosionStart = 0.6;
  const explosionProgress = Math.max(0, progress - explosionStart) / (1 - explosionStart);

  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const speed = 150 + Math.random() * 100;
      const distance = explosionProgress * speed;
      const scale = 1 - explosionProgress * 0.8;

      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale,
        angle,
      };
    });
  }, [explosionProgress]);

  // Números nuevos se recomponen desde partículas
  const newNumberOpacity = Math.max(0, explosionProgress * 1.5);
  const newNumberScale = 0.3 + explosionProgress * 0.7;

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
        {/* Número viejo con implosión */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${implosionX}px), calc(-50% + ${implosionY}px)) scale(${implosionScale})`,
            fontSize: '120px',
            fontWeight: 'bold',
            color: '#FF4444',
            opacity: oldNumberOpacity,
            textShadow: `0 0 20px #FF4444`,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '4px',
          }}
        >
          {oldNumber}
        </div>

        {/* Punto negro (agujero negro) en el centro */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${40 + implosionIntensity * 20}px`,
            height: `${40 + implosionIntensity * 20}px`,
            transform: 'translate(-50%, -50%)',
            background: '#000',
            borderRadius: '50%',
            opacity: Math.min(1, progress * 1.5),
            boxShadow: `
              0 0 20px rgba(0, 0, 0, 0.8),
              inset 0 0 20px rgba(255, 215, 0, 0.3)
            `,
          }}
        />

        {/* Partículas doradas explosión */}
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${8 * p.scale}px`,
              height: `${8 * p.scale}px`,
              background: explosionColor,
              borderRadius: '50%',
              transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px)) scale(${p.scale})`,
              opacity: Math.max(0, explosionProgress > 0 ? 1 - explosionProgress * 0.5 : 0),
              boxShadow: `0 0 12px ${explosionColor}`,
            }}
          />
        ))}

        {/* Número nuevo aparecieno desde partículas */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${newNumberScale})`,
            fontSize: '120px',
            fontWeight: 'bold',
            color: explosionColor,
            opacity: newNumberOpacity,
            textShadow: `0 0 20px ${explosionColor}`,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '4px',
          }}
        >
          {newNumber}
        </div>

        {/* Onda de choque luminosa */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${100 + explosionProgress * 300}px`,
            height: `${100 + explosionProgress * 300}px`,
            transform: 'translate(-50%, -50%)',
            border: `2px solid ${explosionColor}`,
            borderRadius: '50%',
            opacity: Math.max(0, 1 - explosionProgress * 2),
            boxShadow: `0 0 30px ${explosionColor}`,
          }}
        />

        {/* Destello blanco de impacto */}
        {explosionProgress > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `rgba(255, 255, 255, ${Math.max(0, 0.3 - explosionProgress * 0.4)})`,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

export default CataclismoDatos;
