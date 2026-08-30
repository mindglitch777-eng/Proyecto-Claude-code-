import React from 'react';
import {Composition} from 'remotion';
import {ALTO, ANCHO, FPS} from './identidad';
import {DUR_TOTAL, GUION} from './guion';
import {Pieza} from './Pieza';
import {PiezaAgresiva} from './agresivo/PiezaAgresiva';
import {DUR_AGRESIVO} from './guion-agresivo';
import {Diez} from './agresivo/Diez';
import {VIDEOS, durDe} from './guiones10';
import {Catalogo} from './dibujo/Catalogo';

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
      <Composition
        id="agresivo"
        component={PiezaAgresiva}
        durationInFrames={Math.round(DUR_AGRESIVO * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition id="catalogo" component={Catalogo} durationInFrames={130} fps={FPS} width={ANCHO} height={ALTO} />
      {/* Los 10 videos de prueba. Uno por composicion: asi el workflow
          los renderiza en paralelo, un runner cada uno. */}
      {VIDEOS.map((v) => (
        <Composition
          key={v.id}
          id={v.id}
          component={Diez}
          durationInFrames={Math.round(durDe(v) * FPS)}
          fps={FPS}
          width={ANCHO}
          height={ALTO}
          defaultProps={{id: v.id}}
        />
      ))}
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
