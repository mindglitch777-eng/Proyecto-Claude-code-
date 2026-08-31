import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {cargarFuentes} from '../fuentes';
import {PALETA} from '../identidad';
import {
  Anillo, Cascada, Comic, Diagonal, Documento, Ensamble, Feed, Filmstrip,
  Flip3D, Glitch, Grieta, GrillaInfinita, Linterna, Mockups, Neon, Radar,
  RedNodos, Reflector, Termometro, Ticker,
} from './formatosNuevos';
import {Golpe, Grano, TipoGolpe} from './golpes';

// TERCERA TANDA: 20 formatos nuevos, uno atras del otro, para que el
// operador vea el mecanismo de cada uno y elija que sirve, que hay
// que retocar y que no. Contenido de prueba (no de un guion real).

const B: {dur: number; golpe: TipoGolpe; el: React.ReactNode}[] = [
  {dur: 5.5, golpe: 'corte', el: (
    <Diagonal
      arriba={{clip: 'freelance-02.mp4', rotulo: 'Antes', frase: 'Vendías tu hora'}}
      abajo={{clip: 'dinero-01.mp4', rotulo: 'Ahora', frase: 'Vendés un sistema'}}
    />
  )},
  {dur: 5, golpe: 'fogonazo', el: (
    <Feed posts={[
      {nombre: '@compradora_23', texto: '¿esto sirve para principiantes?'},
      {nombre: '@marce.ok', texto: 'lo compré ayer, ya lo usé 2 veces'},
      {nombre: '@vende_mas', texto: 'facturé $400 con esto en una semana'},
    ]} />
  )},
  {dur: 5.4, golpe: 'sacudon', el: (
    <RedNodos titulo="De un país a seis" puntos={[
      {x: 20, y: 20, etiqueta: 'AR'}, {x: 55, y: 15, etiqueta: 'MX'}, {x: 80, y: 30, etiqueta: 'ES'},
      {x: 65, y: 55, etiqueta: 'CO'}, {x: 30, y: 65, etiqueta: 'CL'}, {x: 50, y: 85, etiqueta: 'PE'},
    ]} />
  )},
  {dur: 4.6, golpe: 'corte', el: (
    <Ensamble titulo="Las piezas del método" piezas={[
      {fig: 'lupa', txt: 'Investigar'}, {fig: 'notebook', txt: 'Crear'},
      {fig: 'cohete', txt: 'Publicar'}, {fig: 'billete', txt: 'Vender'},
    ]} />
  )},
  {dur: 4.5, golpe: 'negro', el: (
    <Radar items={[
      {fig: 'chip', txt: 'IA', angulo: 20}, {fig: 'etiqueta', txt: 'Precio', angulo: 110},
      {fig: 'ojo', txt: 'Atención', angulo: 200}, {fig: 'billete', txt: 'Venta', angulo: 300},
    ]} />
  )},
  {dur: 4, golpe: 'sacudon', el: <Grieta antes="Parecía imposible" despues="Era un método" />},
  {dur: 4.8, golpe: 'fogonazo', el: (
    <Documento
      firma="B. Beach"
      lineas={[
        {txt: 'Trabajar más horas', tachado: true},
        {txt: 'Bajar el precio', tachado: true},
        {txt: 'Automatizar la creación', tachado: false},
      ]}
    />
  )},
  {dur: 4.2, golpe: 'corte', el: <Ticker items={['ETSY', 'HOTMART', 'SHOPIFY', 'GUMROAD', 'TEACHABLE']} destacado={2} />},
  {dur: 4.4, golpe: 'negro', el: <Cascada resultado="$20.000/MES" />},
  {dur: 4.2, golpe: 'raya', el: <Termometro arriba="Retención del video" hasta={78} abajo="Por encima del piso del algoritmo" />},
  {dur: 4.8, golpe: 'fogonazo', el: (
    <Reflector items={[
      {fig: 'lupa', txt: 'El problema'}, {fig: 'chip', txt: 'La IA'},
      {fig: 'notebook', txt: 'El producto'}, {fig: 'billete', txt: 'La venta'},
    ]} />
  )},
  {dur: 3.6, golpe: 'sacudon', el: (
    <Comic vinetas={[
      {clip: 'freelance-03.mp4', txt: 'ANTES'}, {clip: 'oficina-02.mp4', txt: 'AHORA'},
      {clip: 'celular-02.mp4', txt: 'PROBÓ'}, {clip: 'dinero-02.mp4', txt: 'GANÓ'},
    ]} />
  )},
  {dur: 2.2, golpe: 'corte', el: <Glitch texto="Error de sistema" />},
  {dur: 4, golpe: 'fogonazo', el: <Flip3D frente="¿Cuánto factura?" dorso="$300.000" />},
  {dur: 3.6, golpe: 'negro', el: <Neon texto="método real" />},
  {dur: 5.2, golpe: 'corte', el: (
    <Filmstrip cuadros={[
      {clip: 'freelance-04.mp4', txt: 'Investiga'}, {clip: 'celular-03.mp4', txt: 'Crea'},
      {clip: 'comercio-01.mp4', txt: 'Publica'}, {clip: 'dinero-03.mp4', txt: 'Cobra'},
    ]} />
  )},
  {dur: 4.6, golpe: 'sacudon', el: <Anillo centro="Pasos completados" items={['Investigó', 'Creó', 'Publicó', 'Vendió']} />},
  {dur: 4.4, golpe: 'fogonazo', el: <Linterna clip="oficina-03.mp4" oculto="No fue suerte" revelado="Fue método" />},
  {dur: 4, golpe: 'corte', el: <Mockups izq={{titulo: 'Mes 1', valor: '$400'}} der={{titulo: 'Mes 6', valor: '$8.200'}} />},
  {dur: 4.4, golpe: 'negro', el: (
    <GrillaInfinita titulo="Cada semana, más productos" items={[
      {fig: 'documento', txt: 'Ebook'}, {fig: 'notebook', txt: 'Planner'}, {fig: 'etiqueta', txt: 'Template'},
      {fig: 'telefono', txt: 'App'}, {fig: 'carpeta', txt: 'Bundle'}, {fig: 'chip', txt: 'Prompt'},
    ]} />
  )},
];

export const DUR_M3 = B.reduce((a, b) => a + b.dur, 0);

export const Muestrario3: React.FC = () => {
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
