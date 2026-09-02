import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {GROTESCA, PALETA} from '../identidad';

// R6-10: primer componente REALMENTE 3D del catalogo (Three.js/React
// Three Fiber via @remotion/three) -- respuesta directa al pedido del
// operador de motion design "hasta 3D". Mismo rol narrativo que
// Contador/Crecimiento (categoria 'cifra': una cifra de dinero que
// crece), pero con profundidad, camara y luz reales en vez de CSS.
//
// Regla dura de @remotion/three respetada al pie de la letra: TODA la
// animacion sale de useCurrentFrame() (nunca useFrame() de
// @react-three/fiber, que rompe la determinismo del render -- ver
// fabrica/skills/INVESTIGACION_HERRAMIENTAS.md item 9 y
// remotion-spike/src/pruebas-r6/Prueba3D.tsx, la prueba aislada de
// R6-7 que confirmo que esto renderiza sin GPU dedicada).
const MAX_BLOQUES = 7;

const Bloque: React.FC<{y: number; opacidad: number; escala: number; color: string}> = ({y, opacidad, escala, color}) => (
  <mesh position={[0, y, 0]} scale={[escala, escala, escala]}>
    <boxGeometry args={[1.3, 0.28, 1.3]} />
    <meshStandardMaterial color={color} transparent opacity={opacidad} />
  </mesh>
);

export const Torre3D: React.FC<{
  arriba?: string;
  hasta: number;
  abajo?: string;
  prefijo?: string;
  sufijo?: string;
}> = ({arriba, hasta, abajo, prefijo = '$', sufijo}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;

  // misma curva que Contador (escenas/plata.tsx): sube rapido y frena,
  // para que el aterrizaje del numero coincida con el ultimo bloque
  // asentandose -- no son dos animaciones independientes por casualidad.
  const p = interpolate(t, [0.35, dur * 0.62], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const valor = hasta * p;
  const bloquesVisibles = p * MAX_BLOQUES;
  // rotacion sutil y constante (no un giro completo, seria mareante en
  // vertical) para que se note que hay profundidad real, no una imagen plana.
  const rotacionY = interpolate(t, [0, dur], [-0.35, 0.35]);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {arriba ? (
        <div
          style={{
            position: 'absolute',
            top: '9%',
            width: '100%',
            textAlign: 'center',
            fontFamily: GROTESCA,
            fontWeight: 500,
            fontSize: 52,
            color: PALETA.texto,
            opacity: 0.75,
          }}
        >
          {arriba}
        </div>
      ) : null}
      <ThreeCanvas width={width} height={height}>
        <Sequence layout="none">
          <ambientLight intensity={0.55} />
          <pointLight position={[4, 6, 6]} intensity={1.1} />
          <pointLight position={[-4, -1, 4]} intensity={0.5} color={PALETA.acento} />
          <group rotation={[0.12, rotacionY, 0]}>
            {Array.from({length: MAX_BLOQUES}).map((_, i) => {
              const local = bloquesVisibles - i;
              if (local <= 0) return null;
              const opacidad = Math.max(0, Math.min(1, local));
              const escala = Math.max(0, Math.min(1, local * 2));
              const y = (i - (MAX_BLOQUES - 1) / 2) * 0.62;
              return <Bloque key={i} y={y} opacidad={opacidad} escala={escala} color={PALETA.acento} />;
            })}
          </group>
        </Sequence>
      </ThreeCanvas>
      <div style={{position: 'absolute', bottom: '13%', width: '100%', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontStretch: '80%',
            fontSize: 130,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            color: PALETA.texto,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {prefijo}
          {Math.round(valor).toLocaleString('es-AR')}
          {sufijo}
        </div>
        {abajo ? (
          <div
            style={{
              fontFamily: GROTESCA,
              fontWeight: 500,
              fontSize: 44,
              color: PALETA.texto,
              opacity: interpolate(t, [dur * 0.66, dur * 0.78], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              marginTop: 10,
            }}
          >
            {abajo}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
