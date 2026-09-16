import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALETA, GROTESCA, SERIF, ANCHO, ALTO} from '../identidad';

// Pieza UNICA y continua (pedido explicito del operador: nada de
// cortarla en escenas separadas -- eso fue justo lo que salio mal la
// primera vez: un cuadrito de "chat" y un "diagrama" de iconos,
// desconectados entre si). Ac'a todo pasa en el mismo lienzo:
// texto de entrada -> logo suave -> UNA linea que se DIBUJA con el
// paso del tiempo (mismo truco de trazo que dibujo/Diagrama.tsx,
// pathLength=1) -> el pedido real, montado ENCIMA de esa linea,
// arranca borroso y se enfoca -> la misma linea sigue hasta el
// bloque de resultados.
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type RevelacionTiempos = {
  hook: number;
  tiro: number;
  logo: number;
  lineaEmpieza: number;
  pedidoLlega: number;
  promptBorroso: number;
  promptEnfoca: number;
  lineaLlegaResultado: number;
  resultadoAparece: number;
};

export const Revelacion: React.FC<{
  lineaHook: string;
  lineaTiro: string;
  logoTexto?: string;
  etiquetaPedido: string;
  prompt: string;
  etiquetaResultado: string;
  t: RevelacionTiempos;
}> = ({lineaHook, lineaTiro, logoTexto = 'Claude', etiquetaPedido, prompt, etiquetaResultado, t}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seg = frame / fps;
  const ent = (t0: number, dur: number) =>
    interpolate(seg, [t0, t0 + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const opHook = ent(t.hook, 0.5);
  const yHook = interpolate(seg, [t.hook, t.hook + 0.6], [24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opTiro = ent(t.tiro, 0.45);
  const opLogo = ent(t.logo, 1.1);

  // La linea: se dibuja de lineaEmpieza a lineaLlegaResultado, pasando
  // por la altura del pedido en el camino -- un solo trazo, no dos.
  const yLineaInicio = 0.3;
  const yLineaPedido = 0.5;
  const yLineaFin = 0.8;
  const progresoLinea = clamp01((seg - t.lineaEmpieza) / Math.max(0.01, t.lineaLlegaResultado - t.lineaEmpieza));
  const yLineaActual = yLineaInicio + (yLineaFin - yLineaInicio) * progresoLinea;

  const opPedido = ent(t.pedidoLlega, 0.4);
  const opPrompt = ent(t.promptBorroso, 0.3);
  const blurPrompt = interpolate(seg, [t.promptBorroso, t.promptEnfoca], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opResultado = ent(t.resultadoAparece, 0.4);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <svg width="100%" height="100%" viewBox={`0 0 ${ANCHO} ${ALTO}`} style={{position: 'absolute', inset: 0}}>
        {progresoLinea > 0 && (
          <line
            x1={ANCHO / 2}
            y1={yLineaInicio * ALTO}
            x2={ANCHO / 2}
            y2={yLineaActual * ALTO}
            stroke={PALETA.acento}
            strokeWidth={4}
            strokeLinecap="round"
          />
        )}
      </svg>

      <div style={{position: 'absolute', top: '9%', left: 0, right: 0, padding: '0 8%', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 60,
            lineHeight: 1.05,
            color: PALETA.texto,
            opacity: opHook,
            transform: `translateY(${yHook}px)`,
          }}
        >
          {lineaHook}
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 84,
            lineHeight: 1.02,
            color: PALETA.acento,
            opacity: opTiro,
            marginTop: 18,
          }}
        >
          {lineaTiro}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 38,
            color: PALETA.texto,
            opacity: opLogo * 0.85,
            marginTop: 26,
          }}
        >
          {logoTexto}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: `${yLineaPedido * 100}%`,
          left: 0,
          right: 0,
          padding: '0 10%',
          textAlign: 'center',
          opacity: opPedido,
        }}
      >
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: '0.02em',
            color: PALETA.acento,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          {etiquetaPedido}{' '}
          <span style={{fontFamily: SERIF, fontStyle: 'italic', textTransform: 'none'}}>{logoTexto}</span>
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 600,
            fontSize: 36,
            lineHeight: 1.25,
            color: PALETA.texto,
            opacity: opPrompt,
            filter: `blur(${blurPrompt}px)`,
          }}
        >
          {prompt}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: `${yLineaFin * 100}%`,
          left: 0,
          right: 0,
          padding: '0 10%',
          textAlign: 'center',
          opacity: opResultado,
        }}
      >
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 40, color: PALETA.texto}}>
          {etiquetaResultado}
        </div>
      </div>
    </AbsoluteFill>
  );
};
