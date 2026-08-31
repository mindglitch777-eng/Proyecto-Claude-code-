import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {cargarFuentes} from '../fuentes';
import {PALETA} from '../identidad';
import {
  AvionPapel, Bateria, BuzonCartas, ContadorLikes, Escalera, Faro,
  FlashCamara, GraficoTorta, LineaMeta, NudoDesatado, OjoAbre,
  PlantaCreciendo, PuertaAbre, SelloAprobado, Trofeo,
} from './formatosNuevos5';
import {Golpe, Grano, TipoGolpe} from './golpes';

// SEPTIMA TANDA: 15 mecanismos mas (van 80 en total entre las 5
// tandas), con foco en dibujo y metaforas, movimientos fluidos.

const B: {dur: number; golpe: TipoGolpe; el: React.ReactNode}[] = [
  {dur: 4.6, golpe: 'fundido', el: <PuertaAbre clip="oficina-02.mp4" texto="Del otro lado, un método" />},
  {dur: 5.0, golpe: 'fundido', el: (
    <GraficoTorta titulo="En qué se le va el día" porciones={[
      {txt: 'Cliente actual', valor: 40}, {txt: 'Buscar más clientes', valor: 35}, {txt: 'Crear el producto', valor: 25, acento: true},
    ]} />
  )},
  {dur: 3.8, golpe: 'corte', el: <Bateria titulo="Nivel de avance del método" hasta={100} />},
  {dur: 4.8, golpe: 'fundido', el: <Escalera pasos={['Problema', 'Producto', 'Publicación', 'Primera venta']} />},
  {dur: 4.0, golpe: 'fogonazo', el: <Trofeo texto="Método completo" />},
  {dur: 4.2, golpe: 'desliza', el: <AvionPapel texto="Una idea que despegó" />},
  {dur: 4.2, golpe: 'fundido', el: <NudoDesatado antes="Todo parecía complicado" despues="Eran 4 pasos" />},
  {dur: 4.6, golpe: 'cortina', el: <Faro texto="Ahí estaba la respuesta" />},
  {dur: 3.6, golpe: 'corte', el: <LineaMeta texto="Meta cumplida" />},
  {dur: 5.0, golpe: 'fundido', el: (
    <PlantaCreciendo etapas={[
      {altura: 20, txt: 'Primera idea'}, {altura: 45, txt: 'Primer producto'},
      {altura: 70, txt: 'Primera venta'}, {altura: 100, txt: 'Ingreso mensual'},
    ]} />
  )},
  {dur: 4.4, golpe: 'desliza', el: <BuzonCartas titulo="Mensajes preguntando cómo" hasta={128} />},
  {dur: 3.4, golpe: 'sacudon', el: <SelloAprobado subtitulo="El método funciona" />},
  {dur: 4.2, golpe: 'fundido', el: <OjoAbre texto="Ahí se dio cuenta" />},
  {dur: 4.0, golpe: 'corte', el: <ContadorLikes clip="celular-03.mp4" hasta={3200} />},
  {dur: 4.4, golpe: 'fogonazo', el: <FlashCamara clip="dinero-02.mp4" leyenda="El día de la primera venta" />},
];

export const DUR_M7 = B.reduce((a, b) => a + b.dur, 0);

export const Muestrario7: React.FC = () => {
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
