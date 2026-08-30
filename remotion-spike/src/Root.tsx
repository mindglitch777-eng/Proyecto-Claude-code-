import React from 'react';
import {Composition} from 'remotion';
import {ALTO, ANCHO, FPS} from './identidad';
import {DUR_TOTAL, GUION} from './guion';
import {Pieza} from './Pieza';

const cuadros = Math.round(DUR_TOTAL * FPS);

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="pieza"
        component={Pieza}
        durationInFrames={cuadros}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{conVideo: true}}
      />
      {/* Solo el hook, para iterar sin renderizar los 26s enteros. */}
      <Composition
        id="hook"
        component={Pieza}
        durationInFrames={Math.round(GUION[0].dur * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{conVideo: true}}
      />
    </>
  );
};
