import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {PALETA} from '../identidad';

// R6-7: primer momento verdaderamente 3D de la fabrica (prueba aislada,
// no registrado todavia como componente de produccion). Regla explicita
// de la doc oficial que se respeta al pie de la letra: la animacion se
// deriva SOLO de useCurrentFrame(), nunca de useFrame() de
// @react-three/fiber -- eso rompe la determinismo del render (frames
// que dependen del reloj real en vez del numero de frame).
const Cubo: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const rotacion = interpolate(frame, [0, fps * 2], [0, Math.PI * 2]);
  return (
    <mesh rotation={[rotacion * 0.6, rotacion, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={PALETA.acento} />
    </mesh>
  );
};

export const DUR_PRUEBA_3D = 60;

export const Prueba3D: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <ThreeCanvas width={width} height={height}>
        <Sequence layout="none">
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={1.2} />
          <Cubo frame={frame} fps={fps} />
        </Sequence>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
