import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Highlight, Circle, Underline, StrikeThrough} from '@remotion/rough-notation';

// R6-11: "Information Emphasis Engine" -- primitiva reusable para
// marcar a mano (rough-notation, WebGL no hace falta aca, es SVG/canvas
// 2D puro) una porcion de texto como la INFORMACION que importa de la
// escena. Confirmado con render real en R6-7
// (remotion-spike/src/pruebas-r6/PruebaHighlights.tsx) que las 4
// anotaciones dibujan bien.
//
// Deliberadamente generico (no atado a Contador ni a ningun
// componente puntual): cualquier componente de la fabrica puede
// envolver un pedazo de su propio texto con esto. La decision de QUE
// destacar y CUANDO sigue siendo del componente que lo usa -- esto
// solo resuelve el COMO (el trazo a mano, con su timing).
export type TipoEnfasis = 'circulo' | 'subrayado' | 'resaltado' | 'tachado';

export const Enfasis: React.FC<{
  tipo?: TipoEnfasis;
  color?: string;
  /** segundos (relativos al frame ACTUAL del padre) en que arranca el trazo */
  activarEnSeg?: number;
  /** cuanto tarda en dibujarse una vez que arranca */
  duracionSeg?: number;
  children: React.ReactNode;
}> = ({tipo = 'circulo', color, activarEnSeg = 0, duracionSeg = 0.5, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const desde = activarEnSeg * fps;
  const hasta = desde + duracionSeg * fps;
  const progress = interpolate(frame, [desde, hasta], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (tipo === 'resaltado') {
    return (
      <Highlight color={color ?? 'rgba(255, 78, 36, 0.55)'} progress={progress}>
        {children}
      </Highlight>
    );
  }
  if (tipo === 'subrayado') {
    return (
      <Underline color={color ?? '#F6F6F4'} progress={progress}>
        {children}
      </Underline>
    );
  }
  if (tipo === 'tachado') {
    return (
      <StrikeThrough color={color ?? '#F6F6F4'} progress={progress}>
        {children}
      </StrikeThrough>
    );
  }
  return (
    <Circle color={color ?? '#FF4E24'} progress={progress}>
      {children}
    </Circle>
  );
};
