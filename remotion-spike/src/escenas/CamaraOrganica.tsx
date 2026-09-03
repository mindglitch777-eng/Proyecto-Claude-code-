import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';

/**
 * R7-25: tecnica de "camara" (seccion 3/10 del prompt de exploracion
 * agresiva -- "camaras" nunca se habia investigado). @remotion/noise
 * (MIT, funciones puras de ruido tipo Perlin, sin dependencias) se usa
 * para simular un temblor de camara en mano sutil y organico -- no un
 * shake al azar (frame a frame descorrelacionado se ve como ruido de
 * video roto, no como una camara real), sino una funcion de ruido
 * CONTINUA en el tiempo, que es exactamente para lo que sirve
 * noise2D(semilla, tiempo, 0).
 *
 * amplitudPx: cuanto se mueve el contenido, en pixeles (valor bajo a
 * proposito -- esto es "en mano sutil", no "terremoto").
 */
export const CamaraOrganica: React.FC<{children: React.ReactNode; amplitudPx?: number; velocidad?: number}> = ({
  children,
  amplitudPx = 6,
  velocidad = 0.04,
}) => {
  const frame = useCurrentFrame();
  const t = frame * velocidad;
  // -0.5..0.5 -> centrado en 0, simetrico en ambas direcciones.
  const dx = (noise2D('camara-organica-x', t, 0) - 0.5) * 2 * amplitudPx;
  const dy = (noise2D('camara-organica-y', t, 0) - 0.5) * 2 * amplitudPx;
  const rot = (noise2D('camara-organica-rot', t, 0) - 0.5) * 2 * 0.4; // grados, minimo

  return (
    <AbsoluteFill style={{transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`}}>
      {children}
    </AbsoluteFill>
  );
};
