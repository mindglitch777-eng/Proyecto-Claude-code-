import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame, Img } from 'remotion';

interface MercurioReveladorProps {
  logoImage: string;
  highlightColor: string;
  duration?: number;
}

const MercurioRevelador: React.FC<MercurioReveladorProps> = ({
  logoImage,
  highlightColor,
  duration = 2.2,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Fases:
  // 0.0-0.7: líquido mercurial barre y revela color
  // 0.7-1.0: explosión de gotas que congelan

  const sweepProgress = Math.min(progress / 0.7, 1);
  const explosionStart = 0.7;
  const explosionProgress = Math.max(0, progress - explosionStart) / (1 - explosionStart);

  // Posición del "frente" del mercurio (barre de izq a der)
  const sweepX = -width / 2 + sweepProgress * width * 1.2;
  const sweepWavy = Math.sin(sweepProgress * Math.PI * 3) * 30;

  // Gotas que explotan
  const drops = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 200;
      const finalX = Math.cos(angle) * distance;
      const finalY = Math.sin(angle) * distance;

      // Las gotas aparecen después de cierto punto
      const dropStart = 0.65 + Math.random() * 0.1;
      const dropProgress = Math.max(0, progress - dropStart) / (1 - dropStart);

      return {
        id: i,
        x: finalX * dropProgress,
        y: finalY * dropProgress,
        scale: Math.max(0, 1 - dropProgress * 1.2),
        startTime: dropStart,
      };
    });
  }, [progress]);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#1a1a1a',
        overflow: 'hidden',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <defs>
          {/* Filtro para desaturar (B&W) */}
          <filter id="bw">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues="0 0.3 0.59 0.8 1" />
              <feFuncG type="discrete" tableValues="0 0.3 0.59 0.8 1" />
              <feFuncB type="discrete" tableValues="0 0.3 0.59 0.8 1" />
            </feComponentTransfer>
          </filter>

          {/* Máscara para el barrido */}
          <mask id="mercuryMask">
            <rect width={width} height={height} fill="black" />
            {/* Área que revela color (blanca) */}
            <ellipse
              cx={sweepX + sweepWavy}
              cy={height / 2}
              rx="150"
              ry={height}
              fill="white"
              opacity={sweepProgress}
            />
            {/* Ondas del mercurio */}
            <path
              d={`M ${sweepX + sweepWavy} 0
                   Q ${sweepX + sweepWavy + 20} ${height / 4}, ${sweepX + sweepWavy} ${height / 2}
                   Q ${sweepX + sweepWavy - 20} ${(height * 3) / 4}, ${sweepX + sweepWavy} ${height}`}
              stroke="white"
              strokeWidth="40"
              fill="none"
              opacity={sweepProgress * 0.6}
            />
          </mask>

          {/* Patrón de gotitas */}
          <pattern id="dropPattern" patternUnits="userSpaceOnUse" width="40" height="40">
            <circle cx="20" cy="20" r="8" fill={highlightColor} opacity="0.6" />
          </pattern>
        </defs>

        {/* Versión B&N (fondo) */}
        <g filter="url(#bw)" opacity={1 - sweepProgress * 0.8}>
          <rect width={width} height={height} fill="#333" />
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="80"
            fontWeight="bold"
            fill="#666"
            fontFamily="Arial, sans-serif"
          >
            LOGO
          </text>
        </g>

        {/* Versión a color (revelada por máscara) */}
        <g mask="url(#mercuryMask)">
          <rect width={width} height={height} fill={highlightColor} opacity="0.2" />
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="80"
            fontWeight="bold"
            fill={highlightColor}
            fontFamily="Arial, sans-serif"
          >
            LOGO
          </text>
        </g>

        {/* Mercurio líquido (reflejo metálico) */}
        <ellipse
          cx={sweepX + sweepWavy}
          cy={height / 2}
          rx="100"
          ry={height}
          fill="url(#dropPattern)"
          opacity={sweepProgress * 0.7}
        />

        {/* Brillo del mercurio */}
        <ellipse
          cx={sweepX + sweepWavy - 50}
          cy={height / 2}
          rx="40"
          ry={height * 0.6}
          fill="white"
          opacity={sweepProgress * 0.3}
          filter="url(#blur)"
        />
      </svg>

      {/* Gotas plateadas congeladas (explosión) */}
      {drops.map((drop) => (
        <div
          key={drop.id}
          style={{
            position: 'absolute',
            top: `calc(50% + ${drop.y}px)`,
            left: `calc(50% + ${drop.x}px)`,
            width: `${12 * drop.scale}px`,
            height: `${12 * drop.scale}px`,
            background: highlightColor,
            borderRadius: '50%',
            transform: `translate(-50%, -50%) scale(${drop.scale})`,
            opacity: Math.max(0, explosionProgress > 0 ? 1 - explosionProgress * 0.8 : 0),
            boxShadow: `0 0 15px ${highlightColor}`,
          }}
        />
      ))}

      {/* Flash final cuando explota */}
      {explosionProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `rgba(255, 255, 255, ${Math.max(0, 0.5 - explosionProgress * 0.8)})`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Filtro blur reutilizable */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};

export default MercurioRevelador;
