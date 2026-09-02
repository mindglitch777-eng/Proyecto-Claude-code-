import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {PALETA, GROTESCA} from '../identidad';

// R6-7: prueba aislada de @remotion/transitions -- NO toca golpes.tsx ni
// FabricaVideo.tsx. Objetivo unico: confirmar que TransitionSeries
// renderiza sin error con el mismo motor headless que ya usamos, y que
// el calculo de duracion total (superposicion real, no overlay falso)
// se comporta como documenta la skill oficial.
const Escena: React.FC<{color: string; texto: string}> = ({color, texto}) => (
  <AbsoluteFill style={{backgroundColor: color, justifyContent: 'center', alignItems: 'center'}}>
    <div style={{color: PALETA.texto, fontFamily: GROTESCA, fontSize: 90, fontWeight: 700}}>{texto}</div>
  </AbsoluteFill>
);

export const DUR_PRUEBA_TRANSICIONES = 30 + 30 + 30 + 30 - 15 - 15 - 15; // 75 cuadros

export const PruebaTransiciones: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={30}>
        <Escena color="#0A0A0C" texto="ESCENA A" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 15})} />
      <TransitionSeries.Sequence durationInFrames={30}>
        <Escena color="#1B1B22" texto="ESCENA B" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({direction: 'from-right'})}
        timing={springTiming({config: {damping: 200}, durationInFrames: 15})}
      />
      <TransitionSeries.Sequence durationInFrames={30}>
        <Escena color="#FF4E24" texto="ESCENA C" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe()} timing={linearTiming({durationInFrames: 15})} />
      <TransitionSeries.Sequence durationInFrames={30}>
        <Escena color="#2563EB" texto="ESCENA D" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
