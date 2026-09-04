import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill, useCurrentFrame } from 'remotion';

interface MindMapConnectProps {
  items: string[];
  lineColor?: string;
  nodeGlow?: string;
  duration?: number;
}

const MindMapConnect: React.FC<MindMapConnectProps> = ({
  items,
  lineColor = '#00FFFF',
  nodeGlow = '#FF00FF',
  duration = 2.5,
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // Posiciones aleatorias iniciales
  const positions = useMemo(() => {
    return items.map((_, i) => ({
      id: i,
      initialX: Math.random() * (width - 300) + 150,
      initialY: Math.random() * (height - 300) + 150,
    }));
  }, [items, width, height]);

  // Posiciones finales (distribuidas en línea)
  const finalPositions = useMemo(() => {
    const centerX = width / 2;
    const spacing = Math.min(width - 400, items.length * 150) / Math.max(1, items.length - 1);

    return items.map((_, i) => ({
      id: i,
      x: centerX - (spacing * (items.length - 1)) / 2 + i * spacing,
      y: height / 2,
    }));
  }, [items, width, height]);

  // Fases: 0-0.6 dibuja rayos, 0.6-1.0 organiza nodos
  const rayProgress = Math.min(progress / 0.6, 1);
  const organizationProgress = Math.max(0, progress - 0.6) / 0.4;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.95)',
      }}
    >
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rayos conectando nodos */}
        {items.map((_, i) => {
          if (i === 0) return null;

          const prevPos = positions[i - 1];
          const currentPos = positions[i];

          // Interpolar hacia posición final
          const startX = prevPos.initialX + (finalPositions[i - 1].x - prevPos.initialX) * organizationProgress;
          const startY = prevPos.initialY + (finalPositions[i - 1].y - prevPos.initialY) * organizationProgress;
          const endX = currentPos.initialX + (finalPositions[i].x - currentPos.initialX) * organizationProgress;
          const endY = currentPos.initialY + (finalPositions[i].y - currentPos.initialY) * organizationProgress;

          return (
            <line
              key={`ray-${i}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={lineColor}
              strokeWidth="3"
              opacity={rayProgress}
              filter="url(#glow)"
              strokeDasharray={`${Math.hypot(endX - startX, endY - startY)}`}
              strokeDashoffset={`${Math.hypot(endX - startX, endY - startY) * (1 - rayProgress)}`}
            />
          );
        })}

        {/* Nodos (palabras) */}
        {items.map((item, i) => {
          const pos = positions[i];
          const finalPos = finalPositions[i];

          const currentX = pos.initialX + (finalPos.x - pos.initialX) * organizationProgress;
          const currentY = pos.initialY + (finalPos.y - pos.initialY) * organizationProgress;

          return (
            <g key={`node-${i}`}>
              {/* Círculo de nodo */}
              <circle
                cx={currentX}
                cy={currentY}
                r={40}
                fill={nodeGlow}
                opacity={0.2 + rayProgress * 0.3}
                filter="url(#glow)"
              />
              <circle
                cx={currentX}
                cy={currentY}
                r={35}
                fill="none"
                stroke={nodeGlow}
                strokeWidth="2"
                opacity={rayProgress}
                filter="url(#glow)"
              />

              {/* Texto del item */}
              <text
                x={currentX}
                y={currentY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="14"
                fill={lineColor}
                fontWeight="bold"
                opacity={organizationProgress > 0.5 ? 1 : 0}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  filter: 'drop-shadow(0 0 8px ' + nodeGlow + ')',
                }}
              >
                {item}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export default MindMapConnect;
