import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

/**
 * R7-31 (prompt "que la fábrica piense la edición", sección 2/3):
 * wrapper GENÉRICO (funciona con cualquier `children`, no depende de
 * que un componente conozca este concepto) que aplica un cambio de
 * encuadre real -- un pulso de escala anclado a un frame exacto,
 * traduciendo el microevento `cambia_encuadre` (declarado en
 * `tipos.ts`/`estilos.ts` desde hace rondas, pero nunca antes emitido
 * ni consumido -- ver `directores/edicion/microeventos.ts`, hallazgo
 * real R7-31) en algo que de verdad se VE en el video.
 *
 * `enFrame` viene de un microevento con timing real (offset de audio
 * real, o una pausa de voz real medida con ffmpeg -- nunca un número
 * inventado, ver `composicion/pausas.ts`). El pulso es breve (12
 * frames a 30fps = 0.4s) y sutil (8% de escala) para que se sienta
 * como un "cambio de encuadre" real de cámara, no como un error visual.
 */
export const CambioEncuadre: React.FC<{children: React.ReactNode; enFrame: number; ventanaFrames?: number}> = ({
  children,
  enFrame,
  ventanaFrames = 12,
}) => {
  const frame = useCurrentFrame();
  const mitad = ventanaFrames / 2;
  const escala = interpolate(
    frame,
    [enFrame - mitad, enFrame, enFrame + mitad],
    [1, 1.08, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill style={{transform: `scale(${escala.toFixed(4)})`}}>
      {children}
    </AbsoluteFill>
  );
};
