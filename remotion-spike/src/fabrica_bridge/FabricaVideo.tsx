import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Cronologia, ListaTachada, Balanza, AntesDespues, Pasos} from '../escenas/explica';
import {Contador, Recibo, Duelo, Ranking, Crecimiento} from '../escenas/plata';
import {CifraSeCae, RelojQueCorre, Embudo, Encuesta, TresVerdades} from '../escenas/mas';
import {Diagrama} from '../dibujo/Diagrama';
import {LogosHerramientas} from '../escenas/herramientas';
import {Punch} from '../agresivo/Punch';
import {Rafaga} from '../agresivo/Rafaga';
import {Explicador} from '../agresivo/Explicador';
import {Remate} from '../agresivo/Remate';
import {Chat, Buscador, Notificaciones} from '../escenas/pantallas';
import {Grafico} from '../escenas/Grafico';
import {Silueta} from '../escenas/Silueta';
import {Golpe, TipoGolpe} from '../escenas/golpes';
import {PALETA} from '../identidad';

// PUENTE DE RENDER de la nueva fabrica (fabrica/composicion/). Esto NO
// es el Director Visual -- esa decision (que componente usar para
// cada unidad narrativa) ya se tomo antes, en
// fabrica/directores/visual.ts, y viaja serializada en el arbol de
// composicion (JSON). Este archivo es el unico lugar donde hace falta
// un mapa id -> import real, porque Remotion/webpack necesitan
// imports estaticos para bundlear -- es infraestructura tecnica, no
// una decision de contenido.
//
// Agregar un componente nuevo al registro de la fabrica requiere
// agregar UNA linea aca (el import + la entrada del mapa). El resto
// del sistema (Director Visual, Composicion) no se entera de que este
// archivo existe.
const IMPLEMENTACIONES: Record<string, React.FC<any>> = {
  cronologia: Cronologia,
  'lista-tachada': ListaTachada,
  balanza: Balanza,
  'antes-despues': AntesDespues,
  pasos: Pasos,
  contador: Contador,
  recibo: Recibo,
  duelo: Duelo,
  ranking: Ranking,
  crecimiento: Crecimiento,
  'cifra-se-cae': CifraSeCae,
  'reloj-que-corre': RelojQueCorre,
  embudo: Embudo,
  encuesta: Encuesta,
  'tres-verdades': TresVerdades,
  diagrama: Diagrama,
  'logos-herramientas': LogosHerramientas,
  punch: Punch,
  rafaga: Rafaga,
  explicador: Explicador,
  remate: Remate,
  chat: Chat,
  buscador: Buscador,
  notificaciones: Notificaciones,
  grafico: Grafico,
  silueta: Silueta,
};

export type EscenaFabrica = {
  unidadId: string;
  desdeSeg: number;
  duracionSeg: number;
  componenteId: string;
  props: Record<string, unknown>;
  /** MULTI-AUDIO: 0, 1 o varios clips superpuestos DENTRO de esta
   * misma escena/componente (patron generalizado de AudioCentro). Los
   * offsets son relativos al INICIO de la escena, no del video. */
  audios: {archivo: string; desdeSegRelativo: number; duracionSeg: number}[];
  golpe: TipoGolpe;
  volumenSfx: number;
};

export type ArbolFabrica = {
  id: string;
  fps: number;
  escenas: EscenaFabrica[];
  duracionTotalSeg: number;
};

const seg = (s: number, fps: number) => Math.round(s * fps);

export const FabricaVideo: React.FC<{arbol: ArbolFabrica}> = ({arbol}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {arbol.escenas.map((e, i) => {
        const Comp = IMPLEMENTACIONES[e.componenteId];
        const desde = seg(e.desdeSeg, fps);
        const duracion = seg(e.duracionSeg, fps);
        if (!Comp) {
          // Preferible mostrar el faltante que ocultarlo (seccion 14,
          // mismo principio que "asset faltante > asset incorrecto"
          // aplicado a un componente sin implementacion registrada).
          return (
            <Sequence key={i} from={desde} durationInFrames={duracion}>
              <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#900'}}>
                <div style={{color: '#fff', fontSize: 40, fontFamily: 'sans-serif', textAlign: 'center', padding: '0 8%'}}>
                  FALTA IMPLEMENTACION: {e.componenteId}
                </div>
              </AbsoluteFill>
            </Sequence>
          );
        }
        return (
          <Sequence key={i} from={desde} durationInFrames={duracion}>
            <Golpe tipo={e.golpe} sonido={i > 0}>
              <Comp {...e.props} />
            </Golpe>
            {/* MULTI-AUDIO: cada clip se superpone en su propio offset
                relativo dentro de esta misma escena -- el componente
                visual se monta una sola vez arriba, no una vez por
                clip. Generaliza AudioCentro de CasoGenerico.tsx. */}
            {e.audios.map((a, j) => (
              <Sequence key={j} from={seg(a.desdeSegRelativo, fps)}>
                <Audio src={staticFile(a.archivo)} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
