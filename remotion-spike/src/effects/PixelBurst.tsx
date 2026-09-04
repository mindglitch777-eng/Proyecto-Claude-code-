import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface PixelBurstProps {
  pixelSize?: number;
  burstColor?: string;
  duration?: number;
}

const PixelBurst: React.FC<PixelBurstProps> = ({
  pixelSize = 20,
  burstColor = '#00FFFF',
  duration = 1.2,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases: 0-0.3 pixeliza, 0.3-0.7 explota, 0.7-1.0 se reensambla
  const pixelizeProgress = Math.min(progress / 0.3, 1);
  const burstProgress = Math.max(0, (progress - 0.3) / 0.4);
  const reassembleProgress = Math.max(0, progress - 0.7) / 0.3;

  const pixels = useMemo(() => {
    const cols = Math.ceil(width / pixelSize);
    const rows = Math.ceil(height / pixelSize);
    const result = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        result.push({
          x,
          y,
          angle: Math.random() * Math.PI * 2,
          speed: 180 + Math.random() * 420,
        });
      }
    }

    return result;
  }, [width, height, pixelSize]);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.95)',
        overflow: 'hidden',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Pixeles */}
        {pixels.map((p, i) => {
          const centerX = width / 2;
          const centerY = height / 2;
          const pixelX = p.x * pixelSize + pixelSize / 2;
          const pixelY = p.y * pixelSize + pixelSize / 2;

          let currentX = pixelX;
          let currentY = pixelY;

          if (burstProgress > 0) {
            // Explotar desde el centro
            const distance = p.speed * burstProgress;
            currentX = centerX + Math.cos(p.angle) * distance;
            currentY = centerY + Math.sin(p.angle) * distance;
          }

          if (reassembleProgress > 0) {
            // Regresar a posición original
            currentX = currentX + (pixelX - currentX) * reassembleProgress;
            currentY = currentY + (pixelY - currentY) * reassembleProgress;
          }

          const opacity =
            pixelizeProgress > 0.5
              ? 1
              : burstProgress > 0
                ? 1 - burstProgress * 0.5
                : pixelizeProgress * 2;

          return (
            <rect
              key={i}
              x={currentX - pixelSize / 2}
              y={currentY - pixelSize / 2}
              width={pixelSize}
              height={pixelSize}
              fill={burstColor}
              opacity={opacity}
            />
          );
        })}
      </svg>

      {/* Destello blanco en el pico de la explosión */}
      {burstProgress > 0 && burstProgress < 0.3 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `rgba(255, 255, 255, ${(0.3 - burstProgress) * 0.8})`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default PixelBurst;
