import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

interface TapToCutProps {
  duration?: number;
  flashColor?: string;
}

/**
 * Transicion de "toque" -- montaje puro, sin texto, categoria 'montaje'
 * (mismo patron que PixelBurst: una escena breve y autocontenida entre
 * dos unidades, no una superposicion literal de la escena anterior).
 */
export const TapToCut: React.FC<TapToCutProps> = ({
  duration = 0.5,
  flashColor = '#FFFFFF',
}) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // 0-40%: el destello se expande desde el centro hasta cubrir todo.
  // 40-100%: se desvanece, revelando la escena siguiente.
  const expandProgress = Math.min(progress / 0.4, 1);
  const fadeProgress = Math.max(0, (progress - 0.4) / 0.6);

  const diagonal = Math.sqrt(width * width + height * height);
  const radius = diagonal * expandProgress;

  return (
    <AbsoluteFill style={{ background: 'transparent', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: radius * 2,
          height: radius * 2,
          marginLeft: -radius,
          marginTop: -radius,
          borderRadius: '50%',
          background: flashColor,
          opacity: 1 - fadeProgress,
        }}
      />
    </AbsoluteFill>
  );
};

export default TapToCut;
