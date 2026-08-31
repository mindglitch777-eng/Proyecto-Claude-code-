import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {cargarFuentes} from '../fuentes';
import {PALETA} from '../identidad';
import {
  Certificado, ConstelacionGrande, CortinaTeatro, Estrellas, FiguraCallouts,
  FlechaCrecimiento, GrabadoraVoz, LupaRevela, NarracionVertical, NivelCarga,
  ParallaxCapas, Rompecabezas, Ruleta, TablaComparativa, Velocimetro,
} from './formatosNuevos4';
import {Golpe, Grano, TipoGolpe} from './golpes';

// SEXTA TANDA: 15 mecanismos mas -- entre ellos, el que pidio el
// operador explicitamente: el texto de la narracion (lo que dice la
// voz) apareciendo en pantalla como una cinta que sube o baja, en vez
// de cortar de golpe entre frases.

const B: {dur: number; golpe: TipoGolpe; el: React.ReactNode}[] = [
  {dur: 6.6, golpe: 'fundido', el: (
    <NarracionVertical lineas={['Este método logró muchas ventas...', 'pero nadie sabe lo peor:', 'que la IA preparó todo.']} />
  )},
  {dur: 5.0, golpe: 'fundido', el: (
    <ConstelacionGrande
      titulo="Todo lo que conecta el método"
      nodos={[
        {fig: 'lupa', txt: 'Investigar', x: 22, y: 20}, {fig: 'notebook', txt: 'Crear', x: 72, y: 26},
        {fig: 'cohete', txt: 'Publicar', x: 30, y: 55}, {fig: 'ojo', txt: 'Atención', x: 74, y: 60},
        {fig: 'billete', txt: 'Vender', x: 50, y: 85},
      ]}
    />
  )},
  {dur: 4.6, golpe: 'corte', el: (
    <Rompecabezas
      piezas={[{fig: 'lupa', txt: 'Problema'}, {fig: 'notebook', txt: 'Producto'}, {fig: 'cohete', txt: 'Publicación'}, {fig: 'billete', txt: 'Venta'}]}
      resultado="MÉTODO COMPLETO"
    />
  )},
  {dur: 4.6, golpe: 'cortina', el: <ParallaxCapas fondo="oficina-01.mp4" medio="celular-02.mp4" texto="Todo empezó en una pantalla chica" />},
  {dur: 4.2, golpe: 'iris', el: <Certificado titulo="Método Digital Completo" nombre="Certificado de finalización" />},
  {dur: 4.8, golpe: 'fundido', el: (
    <TablaComparativa
      colA={{titulo: 'Antes', filas: [{txt: 'Vendía su tiempo', ok: false}, {txt: 'Dependía de un jefe', ok: false}, {txt: 'Sin producto propio', ok: false}]}}
      colB={{titulo: 'Ahora', filas: [{txt: 'Vende un sistema', ok: true}, {txt: 'Es su propio jefe', ok: true}, {txt: 'Tiene un método propio', ok: true}]}}
    />
  )},
  {dur: 4.0, golpe: 'corte', el: <Velocimetro titulo="Retención del video" hasta={82} />},
  {dur: 4.4, golpe: 'sacudon', el: <Ruleta segmentos={['Suerte', 'Contactos', 'Estudios', 'El método', 'Magia']} ganador={3} />},
  {dur: 3.8, golpe: 'fundido', el: <CortinaTeatro texto="$8.200 el mes pasado" />},
  {dur: 3.6, golpe: 'desliza', el: <Estrellas titulo="Lo que opinan los que ya lo usan" puntaje={5} subtitulo="+400 reseñas" />},
  {dur: 4.8, golpe: 'fundido', el: (
    <FiguraCallouts callouts={[
      {txt: 'Antes: 60 hs/semana', x: 20, y: 30}, {txt: 'Ahora: 10 hs/semana', x: 82, y: 34},
      {txt: 'Un producto propio', x: 18, y: 82}, {txt: 'Ingresos todo el mes', x: 82, y: 86},
    ]} />
  )},
  {dur: 4.4, golpe: 'fundido', el: <FlechaCrecimiento titulo="Ventas por mes" puntos={[2, 5, 9, 14, 22, 34]} />},
  {dur: 4.4, golpe: 'desliza', el: <GrabadoraVoz cita="Lo armé en un fin de semana y ya vendí 3." autor="Marcela R." />},
  {dur: 3.6, golpe: 'corte', el: <NivelCarga etapas={['Analizando el problema...', 'Armando el producto...', 'Publicando...', 'Listo']} />},
  {dur: 4.6, golpe: 'fundido', el: <LupaRevela fondoTexto={['ideas', 'contenido', 'seguidores', 'views', 'likes', 'algoritmo', 'contenido', 'ideas']} dato="$8.200/mes reales" />},
];

export const DUR_M6 = B.reduce((a, b) => a + b.dur, 0);

export const Muestrario6: React.FC = () => {
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
