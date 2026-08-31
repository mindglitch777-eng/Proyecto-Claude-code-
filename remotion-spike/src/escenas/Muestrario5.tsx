import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {cargarFuentes} from '../fuentes';
import {PALETA} from '../identidad';
import {
  ArbolCreciendo, Candado, CheckGigante, ComentarioReal, DibujoSobreVideo,
  Engranajes, FotoAntigua, Fuegos, LibroPagina, MapaSubte, MorphBlob,
  MultitudCreciendo, Obturador, PasosHormiga, Pizarron, PruebaPago,
  RayosX, RelojArena,
} from './formatosNuevos3';
import {Golpe, Grano, TipoGolpe} from './golpes';

// QUINTA TANDA: 18 mecanismos mas, con transiciones sobre todo
// FLUIDAS (fundido, desliza, iris, cortina) en vez de corte seco --
// lo que el operador pidio despues de ver Muestrario4: mas grande, mas
// dibujado, mas cinematografico, casi nada de pantalla vacia.

const B: {dur: number; golpe: TipoGolpe; el: React.ReactNode}[] = [
  {dur: 4.4, golpe: 'ninguno', el: <FotoAntigua clip="freelance-00.mp4" leyenda="Su primer escritorio, 2019" anio="2019" />},
  {dur: 4.6, golpe: 'fundido', el: <DibujoSobreVideo clip="oficina-04.mp4" texto="Ahí fue donde encontró el problema" marca="circulo" />},
  {dur: 3.8, golpe: 'desliza', el: <PruebaPago app="Hotmart" monto="+$247" detalle="Venta de Método Digital" />},
  {dur: 4.6, golpe: 'desliza', el: <ComentarioReal nombre="Marcela R." texto="Lo armé en un fin de semana y ya vendí 3." tiempo="hace 2 días" />},
  {dur: 5.6, golpe: 'fundido', el: <PasosHormiga pasos={['Elegís el problema', 'Armás la solución', 'Lo publicás', 'Cobrás']} />},
  {dur: 5.0, golpe: 'fundido', el: <ArbolCreciendo raiz="Un problema" ramas={['Ebook', 'Curso', 'Plantilla', 'Comunidad']} />},
  {dur: 4.2, golpe: 'iris', el: <MorphBlob antes="Freelancer" despues="Dueño de un método" />},
  {dur: 4.4, golpe: 'corte', el: <Obturador clip="taller-00.mp4" texto="Así arranca todo" />},
  {dur: 5.4, golpe: 'fundido', el: <Pizarron titulo="La ecuación real" lineas={['Un problema real', '+ una solución simple', '= algo que se vende solo']} />},
  {dur: 4.2, golpe: 'desliza', el: <LibroPagina capitulo="Capítulo 2" titulo="Cuando encontró el método" />},
  {dur: 4.4, golpe: 'fundido', el: <Candado texto="Lo que nadie te cuenta" />},
  {dur: 4.8, golpe: 'fundido', el: <MapaSubte estaciones={['Idea', 'Producto', 'Publicación', 'Primera venta']} />},
  {dur: 4.2, golpe: 'corte', el: <Engranajes texto="El contenido atrae. El método vende." />},
  {dur: 4.6, golpe: 'fundido', el: <RelojArena arriba={{txt: 'Horas vendidas', valor: '160 hs/mes'}} abajo={{txt: 'Horas que factura ahora', valor: '10 hs/mes'}} />},
  {dur: 4.4, golpe: 'iris', el: <MultitudCreciendo titulo="Personas que ya lo usan" hasta={3400} />},
  {dur: 3.4, golpe: 'fogonazo', el: <CheckGigante texto="Método armado" />},
  {dur: 3.4, golpe: 'fogonazo', el: <Fuegos texto="$8.200" />},
  {dur: 4.8, golpe: 'cortina', el: (
    <RayosX clip="comercio-02.mp4" anotacion={[{fig: 'lupa', txt: 'Encuentra el problema'}, {fig: 'billete', txt: 'Cobra por resolverlo'}]} />
  )},
];

export const DUR_M5 = B.reduce((a, b) => a + b.dur, 0);

export const Muestrario5: React.FC = () => {
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
