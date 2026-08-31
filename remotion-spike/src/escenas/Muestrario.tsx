import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {Diagrama} from '../dibujo/Diagrama';
import {cargarFuentes} from '../fuentes';
import {PALETA} from '../identidad';
import {AntesDespues, Balanza, Cronologia, ListaTachada, Pasos} from './explica';
import {Buscador, Chat, Notificaciones} from './pantallas';
import {Contador, Duelo, Ranking, Recibo} from './plata';

// Todos los formatos nuevos, uno atras del otro, con contenido de
// verdad. Sirve para mirar de una sola vez que tenemos y decidir cual
// va en cual video.

const B: {dur: number; el: React.ReactNode}[] = [
  {
    dur: 5.5,
    el: (
      <Diagrama
        d={{
          titulo: 'No te reemplaza la máquina',
          nodos: [
            {fig: 'persona', x: 0.26, y: 0.38, tam: 300, rotulo: 'Vos', t: 0.2},
            {fig: 'chip', x: 0.72, y: 0.38, tam: 290, rotulo: 'La máquina', t: 1.0, tachar: 2.6},
            {fig: 'gente', x: 0.5, y: 0.68, tam: 320, rotulo: 'El que la usa', t: 1.8, acento: true},
          ],
          flechas: [{de: 0, a: 2, t: 3.2, rotulo: 'te compite', acento: true}],
          pie: 'Competís contra alguien igual que vos.',
        }}
      />
    ),
  },
  {
    dur: 5.5,
    el: (
      <Chat
        titulo="Cliente · hace 2 días"
        mensajes={[
          {de: 'ellos', txt: 'Hola, me pasás presupuesto?', t: 0.4},
          {de: 'vos', txt: 'Sí, te lo mando mañana', t: 1.9},
          {de: 'ellos', txt: 'Ya contraté a otro. Gracias igual', t: 3.6, acento: true},
        ]}
      />
    ),
  },
  {
    dur: 5,
    el: (
      <Buscador
        consulta="cuánto cobrar por hora"
        sugerencias={[
          {txt: 'cuánto cobrar por hora argentina', t: 2.0},
          {txt: 'cuánto cobrar sin perder clientes', t: 2.4},
          {txt: 'cómo saber si gano o pierdo', t: 2.8, acento: true},
        ]}
      />
    ),
  },
  {
    dur: 4.5,
    el: <Contador arriba="Cada hora tuya ya cuesta" hasta={2500} abajo="antes de tocar una herramienta" />,
  },
  {
    dur: 6,
    el: (
      <Recibo
        titulo="El trabajo que aceptaste"
        entra={[{txt: 'Te pagaron', monto: 5000, t: 0.4}]}
        sale={[
          {txt: 'Materiales', monto: 1800, t: 1.5},
          {txt: 'Tus 2 horas', monto: 5000, t: 2.6},
        ]}
        total={{txt: 'Te quedó', t: 3.8}}
      />
    ),
  },
  {
    dur: 5,
    el: (
      <Duelo
        izq={{rotulo: 'Contestás', valor: 'En 2 días', detalle: 'cuando podés'}}
        der={{rotulo: 'El otro', valor: 'En 5 min', detalle: 'con la máquina'}}
        remate="Gana el primero"
      />
    ),
  },
  {
    dur: 5.5,
    el: (
      <Ranking
        titulo="Lo que buscan de verdad"
        filas={[
          {txt: '«cuánto cobrar»', valor: 68},
          {txt: '«calcular precio»', valor: 12},
          {txt: '«calcular rentabilidad»', valor: 1, acento: true},
        ]}
      />
    ),
  },
  {
    dur: 6,
    el: (
      <Pasos
        titulo="Cómo se saca"
        pasos={[
          {fig: 'documento', txt: 'Sumá todo lo que pagás sin trabajar'},
          {fig: 'reloj', txt: 'Contá las horas que trabajás de verdad'},
          {fig: 'moneda', txt: 'Dividí. Eso vale tu hora'},
        ]}
      />
    ),
  },
  {
    dur: 5.5,
    el: (
      <ListaTachada
        titulo="Lo que probaste"
        items={['Bajar el precio', 'Trabajar más horas', 'Poner más publicidad']}
        queda="Nunca sacaste la cuenta"
      />
    ),
  },
  {
    dur: 5,
    el: (
      <Balanza
        titulo="Lo que el cliente mira"
        izq={{txt: 'Cuánto tardaste', peso: 1}}
        der={{txt: 'Que esté resuelto', peso: 5}}
        pie="Vendé el resultado"
      />
    ),
  },
  {
    dur: 6,
    el: (
      <Cronologia
        titulo="Doce meses"
        hitos={[
          {cuando: 'MES 1', que: 'Doce proyectos arrancados'},
          {cuando: 'MES 6', que: 'Casi todos fracasaron'},
          {cuando: 'HOY', que: 'Uno paga a los once', acento: true},
        ]}
      />
    ),
  },
  {
    dur: 4.5,
    el: (
      <AntesDespues
        antes={{rotulo: 'Antes', txt: 'Vendés tu tiempo'}}
        despues={{rotulo: 'Después', txt: 'Vendés el resultado'}}
      />
    ),
  },
  {
    dur: 5,
    el: (
      <Notificaciones
        titulo="Tu teléfono, hoy"
        items={[
          {app: 'Instagram', txt: '3 personas vieron tu historia', t: 0.3},
          {app: 'Correo', txt: 'Newsletter de IA nº 47', t: 1.0},
          {app: 'Banco', txt: 'Sin movimientos este mes', t: 1.9, acento: true},
        ]}
        remate="Ruido no es plata"
      />
    ),
  },
];

export const DUR_MUESTRARIO = B.reduce((a, b) => a + b.dur, 0);

export const Muestrario: React.FC = () => {
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
            {b.el}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
