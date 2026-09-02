import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Highlight, Circle, Underline} from '@remotion/rough-notation';
import {PALETA, GROTESCA} from '../identidad';

// R6-7: prueba aislada de @remotion/rough-notation, candidato directo
// para el "Information Emphasis Engine" pedido en Prompt Maestro 2.
// De las 4 herramientas de esta tanda es la de menor riesgo tecnico
// (dibujo SVG/canvas 2D puro, sin WebGL) -- se prueba igual por
// disciplina antes de tocar produccion.
export const DUR_PRUEBA_HIGHLIGHTS = 90;

export const PruebaHighlights: React.FC = () => {
  const frame = useCurrentFrame();
  const p1 = interpolate(frame, [15, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const p2 = interpolate(frame, [40, 65], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const p3 = interpolate(frame, [65, 85], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{color: PALETA.texto, fontFamily: GROTESCA, fontSize: 64, fontWeight: 700, textAlign: 'center', lineHeight: 1.5}}>
        Ganó{' '}
        <Highlight color="rgba(255, 78, 36, 0.55)" progress={p1}>
          $3.560
        </Highlight>{' '}
        en{' '}
        <Circle color={PALETA.texto} progress={p2}>
          una semana
        </Circle>{' '}
        con{' '}
        <Underline color={PALETA.acento} progress={p3}>
          40 ventas
        </Underline>
        .
      </div>
    </AbsoluteFill>
  );
};
