import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {cargarFuentes} from '../fuentes';
import {PALETA} from '../identidad';
import {
  Corcho, Deslizador, GrabacionPantalla, MapaRecorrido, MarcadorFluo,
  MonitorCardiaco, Odometro, Polaroids, PrecioTachado, SplitDiopter,
  VhsRewind, VistaExplotada,
} from './formatosNuevos2';
import {Golpe, Grano, TipoGolpe} from './golpes';

// CUARTA TANDA: 12 mecanismos mas, para que el operador vea cada uno
// funcionando y elija que sirve.

const B: {dur: number; golpe: TipoGolpe; el: React.ReactNode}[] = [
  {dur: 5.6, golpe: 'corte', el: (
    <Corcho
      titulo="Conectando los puntos"
      notas={[
        {x: 22, y: 22, clip: 'freelance-01.mp4'}, {x: 62, y: 18, txt: 'Encontró el nicho'},
        {x: 30, y: 55, txt: '3 intentos fallidos'}, {x: 72, y: 58, clip: 'dinero-02.mp4'},
        {x: 50, y: 82, txt: 'Primera venta'},
      ]}
      conexiones={[[0, 1], [1, 3], [0, 2], [2, 4], [3, 4]]}
    />
  )},
  {dur: 4.6, golpe: 'sacudon', el: <VhsRewind clip="oficina-01.mp4" texto="Volvamos al principio" />},
  {dur: 4.6, golpe: 'corte', el: <SplitDiopter izq={{clip: 'freelance-02.mp4', rotulo: 'El problema'}} der={{clip: 'celular-01.mp4', rotulo: 'La solución'}} />},
  {dur: 4.8, golpe: 'fundido', el: <Deslizador antes={{clip: 'oficina-02.mp4', rotulo: 'Antes'}} despues={{clip: 'dinero-01.mp4', rotulo: 'Después'}} />},
  {dur: 4.4, golpe: 'fundido', el: (
    <VistaExplotada titulo="De qué está hecho el método" piezas={[
      {txt: 'Encontrar el problema', y: 0}, {txt: 'Armar el producto', y: 0},
      {txt: 'Publicarlo', y: 0}, {txt: 'Cobrarlo', y: 0},
    ]} />
  )},
  {dur: 3.6, golpe: 'fogonazo', el: <PrecioTachado antes="$400" ahora="$29" leyenda="Solo por hoy" />},
  {dur: 3.8, golpe: 'sacudon', el: <MonitorCardiaco texto="Ahí cambió todo" />},
  {dur: 5.6, golpe: 'corte', el: (
    <Polaroids items={[
      {clip: 'freelance-03.mp4', leyenda: 'El caos'}, {clip: 'celular-02.mp4', leyenda: 'La idea'}, {clip: 'dinero-03.mp4', leyenda: 'El resultado'},
    ]} />
  )},
  {dur: 3.6, golpe: 'fundido', el: <MarcadorFluo frase="No vendas tu tiempo. Vendé un sistema." />},
  {dur: 3.6, golpe: 'corte', el: <Odometro arriba="Ventas este mes" hasta={247} />},
  {dur: 4.2, golpe: 'fundido', el: <MapaRecorrido desde="Freelancer" hasta="Dueño de un método" />},
  {dur: 5.0, golpe: 'corte', el: (
    <GrabacionPantalla titulo="Cómo se arma" pasos={['1. Elegís el problema', '2. Grabás la solución', '3. Lo subís y cobrás']} />
  )},
];

export const DUR_M4 = B.reduce((a, b) => a + b.dur, 0);

export const Muestrario4: React.FC = () => {
  cargarFuentes();
  const {fps} = useVideoConfig();
  let acc = 0;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {B.map((b, i) => {
        const desde = Math.round(acc * fps);
        acc += b.dur;
        return (
          <Sequence key={i} from={desde} durationInFrames={Math.round(b.dur * fps)}>
            <Golpe tipo={b.golpe}>{b.el}</Golpe>
          </Sequence>
        );
      })}
      <Grano fuerza={0.05} />
    </AbsoluteFill>
  );
};
