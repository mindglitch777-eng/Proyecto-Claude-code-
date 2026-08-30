import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {Escena} from './escenas/Escena';
import {Grafico} from './escenas/Grafico';
import {Hook} from './escenas/Hook';
import {Silueta} from './escenas/Silueta';
import {cargarFuentes} from './fuentes';
import {GUION} from './guion';
import {PALETA} from './identidad';

export const Pieza: React.FC<{conVideo: boolean}> = ({conVideo}) => {
  cargarFuentes();
  const {fps} = useVideoConfig();

  let acumulado = 0;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {GUION.map((idea, i) => {
        const desde = Math.round(acumulado * fps);
        const largo = Math.round(idea.dur * fps);
        acumulado += idea.dur;
        return (
          <Sequence key={i} from={desde} durationInFrames={largo}>
            {idea.tipo === 'hook' ? (
              <Hook idea={idea} />
            ) : idea.tipo === 'escena' ? (
              <Escena idea={idea} conVideo={conVideo} />
            ) : idea.tipo === 'silueta' ? (
              <Silueta idea={idea} />
            ) : (
              <Grafico idea={idea} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
