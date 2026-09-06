import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {PALETA} from '../identidad';

/**
 * R7-25: pulso expansivo tipo "onda de radar" en el momento exacto de
 * una revelacion -- refuerza visualmente el mismo instante que ya
 * marca `intencion='revelar'` del Director de Edicion.
 *
 * Reescrito en esta ronda (2026-09-06): usaba `@remotion/effects/rings`
 * (WebGL2). Se saco por el mismo motivo real que Vineta.tsx y
 * golpes.tsx ('cortina'): un video con varios efectos WebGL2 activos
 * puede agotar el limite de contextos por pestaña de Chrome. 3 anillos
 * concentricos de CSS puro (border-radius:50%, escalando y
 * desvaneciendose) dan el mismo efecto de "onda expansiva", cero WebGL.
 */
const ANILLOS = 3;
const RETRASO_FRAMES = 6; // stagger entre anillos, misma sensacion de onda que 'offset' del rings() original

export const PulsoRevelacion: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      {Array.from({length: ANILLOS}).map((_, i) => {
        const f = frame - i * RETRASO_FRAMES;
        const tamano = interpolate(f, [0, 45], [0, 700], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const opacidad = interpolate(f, [0, 10, 35, 45], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: tamano,
              height: tamano,
              borderRadius: '50%',
              border: `6px solid ${PALETA.acento}`,
              opacity: opacidad,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
