import React from 'react';
import {Composition} from 'remotion';
import {ALTO, ANCHO, FPS} from './identidad';
import {DUR_TOTAL, GUION} from './guion';
import {Pieza} from './Pieza';
import {PiezaAgresiva} from './agresivo/PiezaAgresiva';
import {DUR_AGRESIVO} from './guion-agresivo';
import {Diez} from './agresivo/Diez';
import {StressTest, DUR_STRESS} from './stress/StressTest';
import {Video} from './receta/Video';
import {GUIONES} from './receta/guiones';
import {compilar} from './receta/compilar';
import {VIDEOS, durDe} from './guiones10';
import {Catalogo} from './dibujo/Catalogo';
import {Muestrario, DUR_MUESTRARIO} from './escenas/Muestrario';
import {Muestrario2, DUR_M2} from './escenas/Muestrario2';

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
      {/* LA FABRICA. Una composicion por cada guion en receta/guiones.ts,
          generada sola: agregar un guion ahi (o en un JSON que la
          fabrica lea) alcanza para tener un video nuevo, sin tocar
          este archivo. */}
      {GUIONES.map((g) => (
        <Composition
          key={g.id}
          id={`f-${g.id}`}
          component={Video}
          durationInFrames={Math.round(compilar(g).duracion * FPS)}
          fps={FPS}
          width={ANCHO}
          height={ALTO}
          defaultProps={{id: g.id, guiones: GUIONES}}
        />
      ))}
      <Composition id="stress" component={StressTest} durationInFrames={Math.round(DUR_STRESS * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="muestrario2" component={Muestrario2} durationInFrames={Math.round(DUR_M2 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="muestrario" component={Muestrario} durationInFrames={Math.round(DUR_MUESTRARIO * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
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
