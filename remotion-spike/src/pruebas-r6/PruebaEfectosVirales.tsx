import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PALETA, GROTESCA} from '../identidad';
import {PunchIn} from '../effects/PunchIn';
import {SplitScreen} from '../effects/SplitScreen';
import {KineticText} from '../effects/KineticText';
import {TapToCut} from '../effects/TapToCut';

// Prueba de humo visual (still real, no solo tipos) de los 4 efectos
// de la "Carta tecnica - efectos virales" (2026-09-04). Cada uno en su
// propio Sequence, con una etiqueta chica arriba para identificar cual
// esta en pantalla al mirar un frame suelto.
export const DUR_PRUEBA_EFECTOS_VIRALES = 210; // 7s a 30fps

const Etiqueta: React.FC<{texto: string}> = ({texto}) => (
  <div
    style={{
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: PALETA.texto,
      fontFamily: GROTESCA,
      fontSize: 28,
      opacity: 0.6,
      zIndex: 10,
    }}
  >
    {texto}
  </div>
);

export const PruebaEfectosVirales: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <Sequence from={0} durationInFrames={60}>
      <Etiqueta texto="punch-in" />
      <PunchIn text="98%" />
    </Sequence>
    <Sequence from={60} durationInFrames={75}>
      <Etiqueta texto="split-screen" />
      <SplitScreen beforeText="Perdía $1.000/mes" afterText="Gana $5.000/mes" />
    </Sequence>
    <Sequence from={135} durationInFrames={45}>
      <Etiqueta texto="kinetic-text" />
      <KineticText lines={['EL 98%', 'PIERDE PLATA']} />
    </Sequence>
    <Sequence from={180} durationInFrames={30}>
      <Etiqueta texto="tap-to-cut" />
      <TapToCut />
    </Sequence>
  </AbsoluteFill>
);
