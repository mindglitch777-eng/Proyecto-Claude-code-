import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
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
import {Torre3D} from '../tres/Torre3D';
import {Golpe, TipoGolpe, Anticipo} from '../escenas/golpes';
import {Vineta} from '../escenas/Vineta';
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
  'torre-3d': Torre3D,
};

/** Forma MINIMA de un microevento, duck-tipada a proposito (Ronda 4):
 * el contrato completo (MicroEvento, EstrategiaEdicion) vive en
 * fabrica/directores/edicion/tipos.ts, un paquete Node sin React que
 * remotion-spike NO importa como dependencia de build -- mismo
 * principio ya establecido para TipoGolpe (ver el comentario en
 * fabrica/directores/audio.ts). Este bridge solo necesita leer
 * `tipo` + `enSegRelativo` de los microeventos que llegan serializados
 * en el JSON del arbol, nada mas. */
type MicroEventoFabrica = {enSegRelativo: number; tipo: string};

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
  /** R6-8: espejo de EscenaComposicion.transicionSalienteSeg (ver
   * fabrica/composicion/armar.ts) -- presente SOLO si esta escena
   * reservo margen de silencio real para que la PROXIMA entre con una
   * superposicion de verdad. Ausente = un arbol viejo (demo_01..06) o
   * una escena sin ese margen, misma ruta de siempre. */
  transicionSalienteSeg?: number;
  /** Ronda 4: estrategia del Director de Edicion, si el generador la
   * calculo. Opcional -- un arbol viejo (demo_01..04) sigue siendo
   * valido sin esto. `estilos` se agrega en R7-24 (antes solo se leia
   * `microeventos` aca) -- ver Vineta abajo. */
  estrategiaEdicion?: {microeventos?: MicroEventoFabrica[]; estilos?: string[]};
};

/** Traduce el microevento 'se_revela_comparacion' (si existe) al prop
 * real `momentoCambioSeg` de AntesDespues -- la UNICA traduccion
 * microevento->prop que existe hoy, deliberadamente puntual (seccion
 * 24 de la orden maestra: no construir un sistema generico de
 * "cualquier componente puede declarar que lee microeventos" antes de
 * tener un segundo caso real que lo justifique). Ver
 * fabrica/directores/edicion/microeventos.ts para el porque de este
 * microevento especifico. */
function propsDesdeMicroeventos(e: EscenaFabrica): Record<string, unknown> {
  if (e.componenteId !== 'antes-despues') return {};
  const revelacion = e.estrategiaEdicion?.microeventos?.find((m) => m.tipo === 'se_revela_comparacion');
  return revelacion ? {momentoCambioSeg: revelacion.enSegRelativo} : {};
}

export type ArbolFabrica = {
  id: string;
  fps: number;
  escenas: EscenaFabrica[];
  duracionTotalSeg: number;
  /** R7-22: espejo de ArbolComposicion.musicaFondo (ver
   * fabrica/composicion/tipos.ts) -- una sola musica de fondo para
   * TODO el video, no por escena. */
  musicaFondo?: {archivo: string; volumen: number};
};

const seg = (s: number, fps: number) => Math.round(s * fps);

// Golpes que cubren la pantalla entera o la sacuden -- verificado
// extrayendo frames reales de fabrica-demo-03 (Ronda 3): el corte
// "especialmente fuerte" que senalo el operador a los ~36.5s resulto
// ser el golpe "negro" (blackout total), no "sacudon" como hubiera
// asumido solo mirando el nivel de intensidad -- "negro" es
// tecnicamente nivel "pausa", pero visualmente es tan abrupto como un
// impacto porque tapa TODA la pantalla de golpe. Por eso esta lista
// se arma por COBERTURA VISUAL real (fogonazo=blanco total,
// negro=negro total, sacudon=shake+scale fuerte), no por el nombre
// del nivel de intensidad.
const GOLPES_FUERTES: TipoGolpe[] = ['fogonazo', 'sacudon', 'negro'];

/** R6-8: presentacion real de @remotion/transitions para cada golpe
 * "continuo" (ver fabrica/composicion/armar.ts,
 * GOLPES_TRANSICION_REAL) -- 'fundido' ya era conceptualmente un
 * crossfade y 'desliza' ya entraba desde la derecha en CSS
 * (golpes.tsx), esto es la MISMA idea con superposicion real de dos
 * escenas en vez de una sola escena animandose sola. */
function presentacionTransicion(golpe: TipoGolpe) {
  if (golpe === 'desliza') return slide({direction: 'from-right'});
  return fade();
}
function timingTransicion(golpe: TipoGolpe, durationInFrames: number) {
  if (golpe === 'desliza') return springTiming({config: {damping: 200}, durationInFrames});
  return linearTiming({durationInFrames});
}

export const FabricaVideo: React.FC<{arbol: ArbolFabrica}> = ({arbol}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {/* R7-22: musica de fondo, UNA sola vez para todo el video, fuera
          del TransitionSeries para que no se corte ni se reinicie con
          cada escena. `trimAfter` recorta al largo real del video en
          vez de loopear -- simplificacion real y documentada: los 9
          tracks del catalogo (~90-100s) ya cubren cualquier video corto
          de la fabrica hasta hoy, ver fabrica/musica/README.md. Si
          algun dia un video supera la duracion del track, esto se
          corta en seco -- todavia no hay loop real, queda anotado. */}
      {arbol.musicaFondo && (
        <Audio
          src={staticFile(arbol.musicaFondo.archivo)}
          volume={arbol.musicaFondo.volumen}
          trimAfter={seg(arbol.duracionTotalSeg, fps)}
        />
      )}
      <TransitionSeries>
        {arbol.escenas.map((e, i) => {
          const Comp = IMPLEMENTACIONES[e.componenteId];
          const duracion = seg(e.duracionSeg, fps);
          // R6-8: si la escena ANTERIOR reservo margen real de
          // silencio para esta, se inserta una TransitionSeries.Transition
          // de verdad (superposicion real) antes de montar esta escena
          // -- ver el comentario largo en fabrica/composicion/armar.ts
          // sobre por que esto es seguro (no se come audio real de
          // ninguna de las dos escenas).
          const anterior = arbol.escenas[i - 1];
          const transicionEntranteSeg = anterior?.transicionSalienteSeg;
          const sinEfectoVisualCSS = Boolean(transicionEntranteSeg);
          const siguiente = arbol.escenas[i + 1];
          const preparaGolpeFuerte = siguiente && GOLPES_FUERTES.includes(siguiente.golpe);

          const contenido = !Comp ? (
            // Preferible mostrar el faltante que ocultarlo (seccion 14,
            // mismo principio que "asset faltante > asset incorrecto"
            // aplicado a un componente sin implementacion registrada).
            <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#900'}}>
              <div style={{color: '#fff', fontSize: 40, fontFamily: 'sans-serif', textAlign: 'center', padding: '0 8%'}}>
                FALTA IMPLEMENTACION: {e.componenteId}
              </div>
            </AbsoluteFill>
          ) : (
            <>
              <Golpe tipo={e.golpe} sonido={i > 0} sinEfectoVisual={sinEfectoVisualCSS}>
                <Comp {...e.props} {...propsDesdeMicroeventos(e)} />
              </Golpe>
              {/* R7-24: primera conexion real a produccion de
                  @remotion/effects mas alla de lightLeak -- la vinieta
                  ya se habia probado y confirmado en R6-9
                  (pruebas-r6/PruebaVineta.tsx) pero nunca se conecto a
                  ninguna escena real. Se dispara con el estilo
                  'cinematico' que el Director de Edicion YA calcula
                  (directores/edicion/estilos.ts) -- no es un campo
                  nuevo que haya que decidir aparte. */}
              {e.estrategiaEdicion?.estilos?.includes('cinematico') && <Vineta />}
              {/* ANTICIPO (Ronda 3): si la escena que sigue corta con un
                  golpe fuerte, los ultimos instantes de ESTA escena
                  muestran pulsos que se aceleran -- prepara el impacto
                  en vez de que salte de la nada (pedido explicito del
                  operador viendo fabrica-demo-03). */}
              {preparaGolpeFuerte && <Anticipo />}
              {/* MULTI-AUDIO: cada clip se superpone en su propio offset
                  relativo dentro de esta misma escena -- el componente
                  visual se monta una sola vez arriba, no una vez por
                  clip. Generaliza AudioCentro de CasoGenerico.tsx. */}
              {e.audios.map((a, j) => (
                <Sequence key={j} from={seg(a.desdeSegRelativo, fps)}>
                  <Audio src={staticFile(a.archivo)} />
                </Sequence>
              ))}
            </>
          );

          return (
            <React.Fragment key={i}>
              {transicionEntranteSeg && (
                <TransitionSeries.Transition
                  presentation={presentacionTransicion(e.golpe)}
                  timing={timingTransicion(e.golpe, seg(transicionEntranteSeg, fps))}
                />
              )}
              <TransitionSeries.Sequence durationInFrames={duracion}>{contenido}</TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
