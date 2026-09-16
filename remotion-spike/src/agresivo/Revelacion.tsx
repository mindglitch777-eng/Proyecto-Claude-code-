import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALETA, GROTESCA, SERIF, ANCHO, ALTO} from '../identidad';

// PIEZA 1 de 2 del documental (ver ResultadosVivos.tsx para la 2da).
// Reescrita tras el 2do feedback real del operador (7.5/10, "no cumple
// la idea original"): la v2 dibujaba una linea RECTA -- pedido
// explicito: "no puede ser recto, tiene que hacer curvas, como un
// mapa del tesoro que se va desviando". Y el "pedido real" tenia mi
// propio cuadrito de texto en vez de algo que se lea como una captura
// real de Claude -- "no genera confianza". Las dos cosas se corrigen
// aca: un trazo curvo de verdad (bezier, mismo truco de pathLength=1
// que Diagrama.tsx para que se dibuje con el tiempo) y una tarjeta que
// replica la interfaz real de Claude (logo, fondo claro, burbuja),
// con zoom + foco progresivo en vez de un blur generico.
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type RevelacionTiempos = {
  hook: number;
  tiro: number;
  lineaEmpieza: number;
  pedidoLlega: number;
  promptBorroso: number;
  promptEnfoca: number;
  lineaSigue: number;
};

// Curva en S entre dos puntos (misma X, distinta Y) -- se desvia a la
// derecha y despues a la izquierda, como un camino, no una regla.
function caminoCurvo(x: number, y0: number, y1: number, amplitud: number): string {
  const midY = y0 + (y1 - y0) * 0.5;
  return `M ${x} ${y0} C ${x + amplitud} ${y0 + (y1 - y0) * 0.22}, ${x - amplitud} ${midY - (y1 - y0) * 0.05}, ${x} ${y1}`;
}

export const Revelacion: React.FC<{
  lineaHook: string;
  lineaTiro: string;
  prompt: string;
  t: RevelacionTiempos;
}> = ({lineaHook, lineaTiro, prompt, t}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seg = frame / fps;
  const ent = (t0: number, dur: number) =>
    interpolate(seg, [t0, t0 + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const opHook = ent(t.hook, 0.5);
  const yHook = interpolate(seg, [t.hook, t.hook + 0.6], [24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opTiro = ent(t.tiro, 0.5);

  // -- Camino curvo 1: del texto hasta la tarjeta del prompt --
  const yLineaInicio = 0.28 * ALTO;
  const yLineaPedido = 0.56 * ALTO;
  const camino1 = caminoCurvo(ANCHO / 2, yLineaInicio, yLineaPedido, 150);
  const progreso1 = clamp01((seg - t.lineaEmpieza) / Math.max(0.01, t.pedidoLlega - t.lineaEmpieza));

  // -- Camino curvo 2: sigue despues de la tarjeta, hacia abajo --
  const yLineaFin = 0.86 * ALTO;
  const camino2 = caminoCurvo(ANCHO / 2, yLineaPedido, yLineaFin, -130);
  const progreso2 = clamp01((seg - t.lineaSigue) / Math.max(0.01, 0.9));

  // -- La tarjeta del prompt: zoom + foco progresivo --
  const opCard = ent(t.pedidoLlega, 0.4);
  const zoom = interpolate(seg, [t.pedidoLlega, t.lineaSigue + 0.6], [0.92, 1.04], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const blurPrompt = interpolate(seg, [t.promptBorroso, t.promptEnfoca], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <svg width="100%" height="100%" viewBox={`0 0 ${ANCHO} ${ALTO}`} style={{position: 'absolute', inset: 0}}>
        <path
          d={camino1}
          fill="none"
          stroke={PALETA.acento}
          strokeWidth={5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progreso1}
        />
        <path
          d={camino2}
          fill="none"
          stroke={PALETA.acento}
          strokeWidth={5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progreso2}
        />
      </svg>

      {/* Texto de entrada -- tipografias mezcladas, no todo la misma fuente */}
      <div style={{position: 'absolute', top: '8%', left: 0, right: 0, padding: '0 8%', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 46,
            lineHeight: 1.15,
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
            fontSize: 92,
            lineHeight: 1,
            color: PALETA.acento,
            opacity: opTiro,
            marginTop: 20,
            letterSpacing: '-0.02em',
          }}
        >
          {lineaTiro}
        </div>
      </div>

      {/* La tarjeta -- replica visual de la interfaz real de Claude */}
      <div
        style={{
          position: 'absolute',
          top: `${(yLineaPedido / ALTO) * 100}%`,
          left: '10%',
          right: '10%',
          transform: `translateY(-50%) scale(${zoom})`,
          opacity: opCard,
        }}
      >
        <div
          style={{
            background: '#F7F4EE',
            borderRadius: 22,
            padding: '22px 24px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16}}>
            <svg width="26" height="26" viewBox="0 0 24 24">
              <path
                d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z"
                fill="#D97757"
              />
            </svg>
            <span style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 20, color: '#3D3929'}}>Claude</span>
          </div>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '16px 18px',
              filter: `blur(${blurPrompt}px)`,
            }}
          >
            <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 27, lineHeight: 1.35, color: '#141413'}}>
              {prompt}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
