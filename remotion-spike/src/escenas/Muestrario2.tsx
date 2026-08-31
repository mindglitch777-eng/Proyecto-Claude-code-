import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {cargarFuentes} from '../fuentes';
import {PALETA} from '../identidad';
import {Golpe, Grano, TipoGolpe} from './golpes';
import {CifraSeCae, Embudo, Encuesta, RelojQueCorre, TresVerdades} from './mas';
import {Congelado, DatoVivo, DosVidas, EstoSosVos} from './metraje';

// Segunda tanda: formatos con gente de verdad y formatos pensados para
// que nadie se vaya. Cada escena entra con su propio golpe.

const B: {dur: number; golpe: TipoGolpe; el: React.ReactNode}[] = [
  {
    dur: 4.2,
    golpe: 'corte',
    el: <TresVerdades frases={['Laburás todo el mes', 'No te queda nada', 'Y no es por vago']} />,
  },
  {
    dur: 5,
    golpe: 'fogonazo',
    el: (
      <DosVidas
        arriba={{clip: 'barberia-03.mp4', rotulo: 'El que cobra por hora', frase: 'Cobra menos cada mes'}}
        abajo={{clip: 'dinero-00.mp4', rotulo: 'El que cobra por trabajo', frase: 'Cobra lo mismo en la mitad'}}
        remate="Misma máquina"
      />
    ),
  },
  {
    dur: 4.6,
    golpe: 'sacudon',
    el: (
      <Congelado
        clip="unias-01.mp4"
        sello="Perdiste"
        pie="el cliente ya contrató a otro"
        cuando={1.3}
      />
    ),
  },
  {
    dur: 4.4,
    golpe: 'raya',
    el: <CifraSeCae arriba="Lo que te pagaban por ese trabajo" de="$20.000" a="$5.000" abajo="mismo trabajo, cuatro veces más rápido" />,
  },
  {
    dur: 4.6,
    golpe: 'fogonazo',
    el: (
      <DatoVivo
        clip="gimnasio-01.mp4"
        arriba="Tu hora ya te cuesta"
        cifra="$2.500"
        abajo="antes de agarrar una herramienta"
      />
    ),
  },
  {
    dur: 5,
    golpe: 'corte',
    el: (
      <Embudo
        titulo="De cada 100 que arrancan"
        pisos={[
          {txt: 'Arrancan', cuantos: '100'},
          {txt: 'Siguen a los 6 meses', cuantos: '30'},
          {txt: 'Viven de esto', cuantos: '4'},
        ]}
        pie="No es suerte, es método"
      />
    ),
  },
  {
    dur: 4.8,
    golpe: 'negro',
    el: (
      <Encuesta
        pregunta="¿Qué mira primero el cliente?"
        a={{txt: 'El precio', pct: 22}}
        b={{txt: 'Quién contesta antes', pct: 78}}
        remate="Gana el primero"
      />
    ),
  },
  {
    dur: 4.6,
    golpe: 'sacudon',
    el: <RelojQueCorre arriba="Tardás en contestar" desde={48} hasta={0} unidad="h" abajo="Ya se lo llevó otro" />,
  },
  {
    dur: 5.2,
    golpe: 'fogonazo',
    el: (
      <EstoSosVos
        clip="veterinaria-02.mp4"
        lineas={['Terminás el día cansado', 'Mirás la caja', 'Y no entendés dónde se fue']}
        cierre="Se fue en tu hora"
      />
    ),
  },
];

export const DUR_M2 = B.reduce((a, b) => a + b.dur, 0);

export const Muestrario2: React.FC = () => {
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
      {/* el grano va encima de todo, para que no se vea hecho en la compu */}
      <Grano fuerza={0.05} />
    </AbsoluteFill>
  );
};
