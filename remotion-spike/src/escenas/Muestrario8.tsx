import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {cargarFuentes} from '../fuentes';
import {PALETA} from '../identidad';
import {
  AnillosProgreso, ArbolDecision, BalanzaColor, BarrasCompiten, CaraCambia,
  ComparadorApps, DiagramaCapas, DiagramaFlujo, EmbudoColor, LluviaNotificaciones,
  MapaMental, RedAvatares, RelojAnalogico, VariasPantallas,
} from './formatosNuevos6';
import {Golpe, Grano, TipoGolpe} from './golpes';

// OCTAVA TANDA: 14 mecanismos mas grandes, ricos y a color -- mas
// dibujo/diagrama, iconos genericos de apps, transiciones fluidas
// pero rapidas (nada de espera lenta).

const B: {dur: number; golpe: TipoGolpe; el: React.ReactNode}[] = [
  {dur: 4.6, golpe: 'fundido', el: (
    <LluviaNotificaciones titulo="Su celular ese día" items={[
      {app: 'Fotos', tipo: 'foto', texto: '3 personas comentaron', color: '#e1306c'},
      {app: 'Video corto', tipo: 'video', texto: '+200 reproducciones', color: '#000'},
      {app: 'Mensajes', tipo: 'chat', texto: '"¿cómo lo compro?"', color: '#25d366'},
      {app: 'Pagos', tipo: 'compra', texto: 'Recibiste $247', color: '#2ecc71'},
    ]} />
  )},
  {dur: 4.8, golpe: 'fundido', el: (
    <MapaMental centro="El método" ramas={[
      {fig: 'lupa', txt: 'Investigar', color: '#3498db'}, {fig: 'notebook', txt: 'Crear', color: '#2ecc71'},
      {fig: 'cohete', txt: 'Publicar', color: PALETA.acento}, {fig: 'billete', txt: 'Cobrar', color: '#f1c40f'},
    ]} />
  )},
  {dur: 4.4, golpe: 'corte', el: <DiagramaFlujo inicio="¿Tenés un problema real?" pregunta="¿Alguien más lo tiene?" si="Armá el producto" no="Buscá otro problema" />},
  {dur: 4.4, golpe: 'desliza', el: (
    <ComparadorApps
      izq={{app: 'Antes', tipo: 'reproductor', color: '#e74c3c', valor: '12 vistas'}}
      der={{app: 'Ahora', tipo: 'reproductor', color: '#2ecc71', valor: '48.000 vistas'}}
    />
  )},
  {dur: 4.2, golpe: 'fundido', el: (
    <AnillosProgreso titulo="Cómo le fue este mes" anillos={[
      {txt: 'Ventas', hasta: 90, color: PALETA.acento}, {txt: 'Contenido', hasta: 70, color: '#3498db'}, {txt: 'Tiempo libre', hasta: 55, color: '#2ecc71'},
    ]} />
  )},
  {dur: 4.4, golpe: 'fundido', el: (
    <DiagramaCapas capas={[
      {txt: 'Un problema real', color: '#8e44ad'}, {txt: 'Una solución simple', color: '#2980b9'},
      {txt: 'Contenido que atrae', color: '#16a085'}, {txt: 'Un sistema que cobra', color: PALETA.acento},
    ]} />
  )},
  {dur: 4.6, golpe: 'corte', el: (
    <BarrasCompiten titulo="De qué vive cada uno" filas={[
      {txt: 'Sueldo fijo', valor: 40, color: '#7f8c8d'}, {txt: 'Freelance', valor: 65, color: '#3498db'}, {txt: 'Producto propio', valor: 100, color: PALETA.acento},
    ]} />
  )},
  {dur: 4.6, golpe: 'fundido', el: (
    <EmbudoColor titulo="De cada 100 que ven esto" pisos={[
      {txt: 'Ven el video', cuantos: '100', color: '#3498db'}, {txt: 'Prueban el método', cuantos: '12', color: '#8e44ad'}, {txt: 'Venden algo', cuantos: '3', color: PALETA.acento},
    ]} />
  )},
  {dur: 4.2, golpe: 'iris', el: <RedAvatares centro="+3.400 personas" cantidad={22} />},
  {dur: 4.0, golpe: 'desliza', el: <RelojAnalogico texto="El tiempo pasa igual, elegís en qué" />},
  {dur: 4.4, golpe: 'fundido', el: <CaraCambia antes="Agotado de vender su tiempo" despues="Tranquilo con un sistema" />},
  {dur: 4.6, golpe: 'sacudon', el: (
    <BalanzaColor
      izq={{fig: 'reloj', txt: 'Trabajar más horas', color: '#7f8c8d'}}
      der={{fig: 'engranaje', txt: 'Un sistema que trabaja solo', color: PALETA.acento}}
      gana="der"
    />
  )},
  {dur: 4.6, golpe: 'corte', el: (
    <VariasPantallas
      apps={[{app: 'Fotos', tipo: 'foto', color: '#e1306c'}, {app: 'Video', tipo: 'video', color: '#000'}, {app: 'Compras', tipo: 'compra', color: '#f39c12'}]}
      remate="Hasta que encontró lo que funcionaba"
    />
  )},
  {dur: 4.8, golpe: 'fundido', el: (
    <ArbolDecision raiz="¿Qué hacer con el contenido?" opciones={[
      {txt: 'Solo entretener', resultado: 'Views sin ventas', color: '#7f8c8d'},
      {txt: 'Entretener + vender', resultado: 'Views con ingresos', color: PALETA.acento},
      {txt: 'Solo vender', resultado: 'Nadie mira', color: '#c0392b'},
    ]} />
  )},
];

export const DUR_M8 = B.reduce((a, b) => a + b.dur, 0);

export const Muestrario8: React.FC = () => {
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
