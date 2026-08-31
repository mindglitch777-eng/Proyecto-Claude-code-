import React from 'react';
import {Composition} from 'remotion';
import {ALTO, ANCHO, FPS} from './identidad';
import {DUR_TOTAL, GUION} from './guion';
import {Pieza} from './Pieza';
import {PiezaAgresiva} from './agresivo/PiezaAgresiva';
import {DUR_AGRESIVO} from './guion-agresivo';
import {Diez} from './agresivo/Diez';
import {StressTest, DUR_STRESS} from './stress/StressTest';
import {RebeccaBeach, DUR_REBECCA} from './documental/RebeccaBeach';
import {Caso, duracionCaso} from './documental/CasoGenerico';
import {CASOS} from './documental/casos';
import {Video} from './receta/Video';
import {GUIONES} from './receta/guiones';
import {compilar} from './receta/compilar';
import {VIDEOS, durDe} from './guiones10';
import {Catalogo} from './dibujo/Catalogo';
import {Muestrario, DUR_MUESTRARIO} from './escenas/Muestrario';
import {Muestrario2, DUR_M2} from './escenas/Muestrario2';
import {Muestrario3, DUR_M3} from './escenas/Muestrario3';
import {FormatoA, DUR_FA, FormatoB, DUR_FB} from './escenas/FormatoCompleto';
import {Muestrario4, DUR_M4} from './escenas/Muestrario4';

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
      <Composition id="rebecca-beach" component={RebeccaBeach} durationInFrames={Math.round(DUR_REBECCA * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      {/* Casos 2 a 20 de la serie documental: uno por entrada en
          casos.ts, todos sobre el mismo motor generico (CasoGenerico). */}
      {CASOS.map((c, i) => (
        <Composition
          key={c.slug}
          id={`caso-${String(i + 2).padStart(2, '0')}`}
          component={Caso}
          durationInFrames={Math.round(duracionCaso(c) * FPS)}
          fps={FPS}
          width={ANCHO}
          height={ALTO}
          defaultProps={{cfg: c}}
        />
      ))}
      <Composition id="muestrario3" component={Muestrario3} durationInFrames={Math.round(DUR_M3 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      {/* Formatos de video completos (gancho + desarrollo mezclado a
          corte rapido + cierre con pregunta abierta + CTA), no piezas
          sueltas -- lo que el operador pidio despues de ver Muestrario3. */}
      <Composition id="formato-a" component={FormatoA} durationInFrames={Math.round(DUR_FA * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="formato-b" component={FormatoB} durationInFrames={Math.round(DUR_FB * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="muestrario4" component={Muestrario4} durationInFrames={Math.round(DUR_M4 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
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
