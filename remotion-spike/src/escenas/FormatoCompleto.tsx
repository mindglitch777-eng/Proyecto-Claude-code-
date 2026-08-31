import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {CtaBeat} from '../documental/CasoGenerico';
import {DatosDiagrama, Diagrama} from '../dibujo/Diagrama';
import {LluviaDinero, Resplandor} from './dinero-fx';
import {AntesDespues, Balanza, Cronologia, ListaTachada} from './explica';
import {Anillo, Cascada, Documento, Ensamble, RedNodos} from './formatosNuevos';
import {Golpe, Grano, TipoGolpe} from './golpes';
import {CifraSeCae, Embudo, Encuesta, TresVerdades} from './mas';
import {cargarFuentes} from '../fuentes';
import {GROTESCA, PALETA, SERIF} from '../identidad';
import {Duelo} from './plata';

// FORMATOS DE VIDEO COMPLETOS (no piezas sueltas)
//
// Lo que el operador pidio despues de ver Muestrario3: esos 20 eran
// MECANISMOS visuales, no formatos de video. Un formato de video es la
// estructura entera -- gancho, desarrollo que mezcla varios mecanismos
// a corte rapido, y un cierre que deja una pregunta sin responder antes
// del CTA. Estos dos archivos (FormatoA, FormatoB) son dos estructuras
// completas y DISTINTAS entre si, armadas mezclando piezas ya
// existentes (receta/explica, receta/mas, formatosNuevos) mas la
// LluviaDinero cada vez que se habla de plata, tal cual se pidio.
//
// Regla de transicion: los bloques tipo "dibujo/diagrama" (Ensamble,
// ListaTachada, Balanza, Cronologia, RedNodos, Documento, Embudo,
// Anillo, Diagrama) entran con golpe 'fundido' -- continuo, sin corte
// en seco. Los bloques de impacto (numeros, frases, sorpresas, el
// cierre con la pregunta) siguen con golpe duro (corte/sacudon/
// fogonazo), que es lo que les da el pulso.

const armar = (fps: number, bloques: {dur: number; golpe: TipoGolpe; el: React.ReactNode}[]) => {
  let acc = 0;
  return bloques.map((b, i) => {
    const desde = Math.round(acc * fps);
    acc += b.dur;
    return (
      <Sequence key={i} from={desde} durationInFrames={Math.round(b.dur * fps)}>
        <Golpe tipo={b.golpe}>{b.el}</Golpe>
      </Sequence>
    );
  });
};

const BeatDinero: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {children}
    <Resplandor fuerza={0.45} />
    <LluviaDinero intensidad={1} />
  </AbsoluteFill>
);

// ════════════════════════════════════════════════════ FORMATO A
// "La pregunta sin responder": arranca con contraste (por que unos
// venden y otros no), arma el metodo pieza por pieza, muestra la
// plata, y cierra dejando la duda abierta -- no la contesta, empuja al
// CTA para que la pregunten en los comentarios.

const DIAGRAMA_A: DatosDiagrama = {
  nodos: [
    {fig: 'lupa', x: 0.28, y: 0.32, tam: 110, rotulo: 'Encontrar el problema', t: 0.3},
    {fig: 'notebook', x: 0.72, y: 0.32, tam: 110, rotulo: 'Armar el producto', t: 1.4},
    {fig: 'cohete', x: 0.28, y: 0.66, tam: 110, rotulo: 'Publicarlo', t: 2.5},
    {fig: 'billete', x: 0.72, y: 0.66, tam: 110, rotulo: 'Cobrarlo solo', t: 3.6, acento: true},
  ],
  flechas: [
    {de: 0, a: 1, t: 1.6},
    {de: 1, a: 2, t: 2.7},
    {de: 2, a: 3, t: 3.8},
  ],
};

const BLOQUES_A = (): {dur: number; golpe: TipoGolpe; el: React.ReactNode}[] => [
  {
    dur: 5.1, golpe: 'ninguno',
    el: <TresVerdades frases={['¿Por qué unos venden', 'todos los días,', 'y vos publicás y no pasa nada?']} />,
  },
  {
    dur: 4.6, golpe: 'fundido',
    el: <Diagrama d={DIAGRAMA_A} />,
  },
  {
    dur: 4.2, golpe: 'fundido',
    el: (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <ListaTachada titulo="Antes de esto, probó..." items={['Publicidad paga', 'Ser "influencer"']} queda="Un sistema que vende solo" />
      </AbsoluteFill>
    ),
  },
  {
    dur: 3.4, golpe: 'corte',
    el: <Cascada resultado="$8.200/MES" />,
  },
  {
    dur: 4.4, golpe: 'fogonazo',
    el: <BeatDinero><CifraSeCae arriba="Lo que facturaba antes" de="$0" a="$8.200" abajo="Por mes, en piloto automático" /></BeatDinero>,
  },
  {
    dur: 4.4, golpe: 'fundido',
    el: (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <Balanza izq={{txt: 'Trabajar más horas', peso: 25}} der={{txt: 'Un sistema que trabaja solo', peso: 75}} pie="Se elige una sola vez" />
      </AbsoluteFill>
    ),
  },
  {
    dur: 4.6, golpe: 'fundido',
    el: (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <Cronologia hitos={[
          {cuando: 'SEMANA 1', que: 'Armó el producto'},
          {cuando: 'SEMANA 2', que: 'Lo publicó'},
          {cuando: 'SEMANA 4', que: 'Primera venta', acento: true},
        ]} />
      </AbsoluteFill>
    ),
  },
  {
    dur: 3.4, golpe: 'sacudon',
    el: (
      <AbsoluteFill style={{backgroundColor: PALETA.acento, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10%'}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 78, lineHeight: 1.05, color: '#1a0a04', textAlign: 'center', textTransform: 'uppercase'}}>
          ¿Y si ya tenés la pieza que te falta?
        </div>
      </AbsoluteFill>
    ),
  },
  {dur: 3.0, golpe: 'fogonazo', el: <CtaBeat />},
];

export const DUR_FA = BLOQUES_A().reduce((a, b) => a + b.dur, 0);

export const FormatoA: React.FC = () => {
  cargarFuentes();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {armar(fps, BLOQUES_A())}
      <Grano fuerza={0.045} />
    </AbsoluteFill>
  );
};

// ════════════════════════════════════════════════════ FORMATO B
// "El error común": arranca desmintiendo un mito con un duelo lado a
// lado, muestra alcance y prueba social, mete una encuesta para que el
// espectador conteste en la cabeza, la plata, y cierra con una frase
// tipo neon que no responde nada -- fuerza la pregunta en comentarios.

const BLOQUES_B = (): {dur: number; golpe: TipoGolpe; el: React.ReactNode}[] => [
  {
    dur: 4.6, golpe: 'ninguno',
    el: (
      <Duelo
        izq={{rotulo: 'LO QUE CREE LA GENTE', valor: '"Hay que tener suerte"'}}
        der={{rotulo: 'LO QUE PASÓ EN REALIDAD', valor: 'Siguió 4 pasos'}}
        ganador="der"
        remate="Y funcionó"
      />
    ),
  },
  {
    dur: 3.8, golpe: 'fundido',
    el: (
      <RedNodos
        titulo="Y ese método ya llegó a..."
        puntos={[{x: 20, y: 22, etiqueta: 'AR'}, {x: 55, y: 16, etiqueta: 'MX'}, {x: 80, y: 32, etiqueta: 'ES'}, {x: 62, y: 58, etiqueta: 'CO'}, {x: 30, y: 68, etiqueta: 'CL'}]}
      />
    ),
  },
  {
    dur: 3.8, golpe: 'fundido',
    el: (
      <Documento
        firma="M. Duarte"
        lineas={[
          {txt: 'Depender de un jefe', tachado: true},
          {txt: 'Vivir de comisiones', tachado: true},
          {txt: 'Vender un producto propio', tachado: false},
        ]}
      />
    ),
  },
  {
    dur: 4.0, golpe: 'fundido',
    el: (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <Embudo
          titulo="De cada 100 que ven esto"
          pisos={[{txt: 'Ven el video', cuantos: '100'}, {txt: 'Prueban el método', cuantos: '12'}, {txt: 'Ya tuvieron su 1ra venta', cuantos: '3'}]}
          pie="¿Vos serías de los 3?"
        />
      </AbsoluteFill>
    ),
  },
  {
    dur: 3.8, golpe: 'corte',
    el: (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <Encuesta pregunta="¿Vos creés que hay que ser bueno vendiendo?" a={{txt: 'Sí', pct: 22}} b={{txt: 'No, hay un sistema', pct: 78}} remate="La mayoría ya lo sabe" />
      </AbsoluteFill>
    ),
  },
  {
    dur: 4.2, golpe: 'fogonazo',
    el: <BeatDinero><Cascada resultado="$8.200/MES" /></BeatDinero>,
  },
  {
    dur: 4.0, golpe: 'fundido',
    el: (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <Anillo centro="Ya completó" items={['Encontró el problema', 'Armó el producto', 'Lo publicó', 'Vendió']} />
      </AbsoluteFill>
    ),
  },
  {
    dur: 3.2, golpe: 'sacudon',
    el: (
      <AbsoluteFill style={{backgroundColor: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 68, color: PALETA.acento, textAlign: 'center', textShadow: `0 0 10px ${PALETA.acento}, 0 0 26px ${PALETA.acento}, 0 0 50px ${PALETA.acento}`}}>
          ¿vos cuál vas a elegir?
        </div>
      </AbsoluteFill>
    ),
  },
  {dur: 3.0, golpe: 'fogonazo', el: <CtaBeat />},
];

export const DUR_FB = BLOQUES_B().reduce((a, b) => a + b.dur, 0);

export const FormatoB: React.FC = () => {
  cargarFuentes();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {armar(fps, BLOQUES_B())}
      <Grano fuerza={0.045} />
    </AbsoluteFill>
  );
};
