import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALETA, GROTESCA, SERIF, ANCHO, ALTO} from '../identidad';

// PIEZA 2 de 2 del documental (ver Revelacion.tsx para la 1ra). Pedido
// real del operador tras el 2do feedback: "los resultados, que es lo
// mas importante, quedan en segundo plano" -- ademas de rafaga
// secuencial (un clip atras de otro), pidio la pantalla partida en 6
// con 6 videos reales EN SIMULTANEO (no uno atras del otro), mismo
// tratamiento para los carruseles, un texto que entra cambiando de
// tipografia palabra por palabra con "resultados" en verde, y una
// lluvia de billetes detras de las metricas. Nada de esto existia en
// el catalogo -- es una pieza nueva de punta a punta.
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Pseudo-random determinista (mismo frame = mismo resultado siempre,
// imprescindible para que Remotion renderice igual en cada pasada).
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function caminoCurvo(x: number, y0: number, y1: number, amplitud: number): string {
  const midY = y0 + (y1 - y0) * 0.5;
  return `M ${x} ${y0} C ${x + amplitud} ${y0 + (y1 - y0) * 0.22}, ${x - amplitud} ${midY - (y1 - y0) * 0.05}, ${x} ${y1}`;
}

const Grilla6: React.FC<{clips: string[]; opacidad: number}> = ({clips, opacidad}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr 1fr',
      gap: 3,
      opacity: opacidad,
    }}
  >
    {clips.slice(0, 6).map((c, i) => (
      <div key={c + i} style={{overflow: 'hidden', position: 'relative'}}>
        <OffthreadVideo
          src={staticFile(`video/${c}`)}
          muted
          loop
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </div>
    ))}
  </div>
);

const LluviaDeBilletes: React.FC<{segDesde: number; segActual: number; cantidad?: number}> = ({
  segDesde,
  segActual,
  cantidad = 26,
}) => {
  if (segActual < segDesde) return null;
  const t = segActual - segDesde;
  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      {Array.from({length: cantidad}).map((_, i) => {
        const xPct = pseudoRandom(i * 3.1) * 100;
        const retraso = pseudoRandom(i * 7.7) * 1.4;
        const duracion = 2.2 + pseudoRandom(i * 5.3) * 1.6;
        const local = t - retraso;
        if (local < 0) return null;
        const progreso = (local % duracion) / duracion;
        const y = interpolate(progreso, [0, 1], [-60, ALTO + 60]);
        const rot = interpolate(progreso, [0, 1], [pseudoRandom(i) * 60 - 30, pseudoRandom(i) * 60 - 30 + 200]);
        const escala = 0.7 + pseudoRandom(i * 9.1) * 0.6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${xPct}%`,
              top: y,
              fontSize: 34 * escala,
              transform: `rotate(${rot}deg)`,
              opacity: 0.9,
            }}
          >
            💵
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export type ResultadosVivosTiempos = {
  lineaSube: number;
  gridVideosDesde: number;
  gridVideosHasta: number;
  gridCarrusDesde: number;
  gridCarrusHasta: number;
  lineaBaja: number;
  textoDesde: number;
  dineroDesde: number;
  metricasDesde: number;
};

export const ResultadosVivos: React.FC<{
  textoGrid: string;
  clipsVideos: string[];
  clipsCarruseles: string[];
  fraseAntes: string;
  fraseResaltada: string;
  fraseDespues: string;
  clipMetricas: string;
  t: ResultadosVivosTiempos;
}> = ({textoGrid, clipsVideos, clipsCarruseles, fraseAntes, fraseResaltada, fraseDespues, clipMetricas, t}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const seg = frame / fps;
  const ent = (t0: number, dur: number) =>
    interpolate(seg, [t0, t0 + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const opVideos = clamp01(
    interpolate(seg, [t.gridVideosDesde, t.gridVideosDesde + 0.3, t.gridCarrusDesde, t.gridCarrusDesde + 0.35], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const opCarrus = clamp01(
    interpolate(seg, [t.gridCarrusDesde, t.gridCarrusDesde + 0.35, t.gridCarrusHasta, t.gridCarrusHasta + 0.35], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const opGrids = interpolate(seg, [t.gridVideosDesde, t.gridVideosDesde + 0.3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) * (1 - interpolate(seg, [t.gridCarrusHasta, t.gridCarrusHasta + 0.35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  const opCaption = interpolate(seg, [t.gridVideosDesde, t.gridVideosDesde + 0.3, t.gridCarrusHasta - 0.1, t.gridCarrusHasta + 0.3], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // -- linea curva, antes y despues de la grilla --
  const yA0 = 0.02 * ALTO;
  const yA1 = 0.14 * ALTO;
  const caminoArriba = caminoCurvo(ANCHO / 2, yA0, yA1, 120);
  const progresoArriba = clamp01((seg - t.lineaSube) / 0.7);

  const yB0 = 0.86 * ALTO;
  const yB1 = 0.98 * ALTO;
  const caminoAbajo = caminoCurvo(ANCHO / 2, yB0, yB1, -110);
  const progresoAbajo = clamp01((seg - t.lineaBaja) / 0.7);

  // -- texto kinetico, palabra por palabra, tipografia alternada --
  const palabras = [
    ...fraseAntes.trim().split(' ').map((w) => ({w, resaltada: false})),
    {w: fraseResaltada, resaltada: true},
    ...fraseDespues.trim().split(' ').map((w) => ({w, resaltada: false})),
  ];

  const opMetricas = ent(t.metricasDesde, 0.6);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <svg width="100%" height="100%" viewBox={`0 0 ${ANCHO} ${ALTO}`} style={{position: 'absolute', inset: 0, zIndex: 5}}>
        <path d={caminoArriba} fill="none" stroke={PALETA.acento} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progresoArriba} />
        <path d={caminoAbajo} fill="none" stroke={PALETA.acento} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progresoAbajo} />
      </svg>

      {opGrids > 0.01 && (
        <div style={{position: 'absolute', top: '16%', bottom: '16%', left: 0, right: 0, opacity: opGrids}}>
          <Grilla6 clips={clipsVideos} opacidad={opVideos} />
          <div style={{position: 'absolute', inset: 0, opacity: opCarrus}}>
            <Grilla6 clips={clipsCarruseles} opacidad={1} />
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: 0,
          right: 0,
          padding: '0 8%',
          textAlign: 'center',
          opacity: opCaption,
        }}
      >
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 40,
            lineHeight: 1.2,
            color: PALETA.texto,
            textShadow: '0 4px 20px rgba(0,0,0,0.9)',
          }}
        >
          {textoGrid}
        </div>
      </div>

      <LluviaDeBilletes segDesde={t.dineroDesde} segActual={seg} />

      <div style={{position: 'absolute', top: '20%', left: 0, right: 0, padding: '0 8%', textAlign: 'center', zIndex: 6}}>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 14px'}}>
          {palabras.map((p, i) => {
            const t0 = t.textoDesde + i * 0.16;
            const op = interpolate(seg, [t0, t0 + 0.45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const y = interpolate(seg, [t0, t0 + 0.45], [-30, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const impar = i % 2 === 0;
            return (
              <span
                key={i}
                style={{
                  fontFamily: p.resaltada ? SERIF : impar ? GROTESCA : SERIF,
                  fontStyle: p.resaltada || !impar ? 'italic' : 'normal',
                  fontWeight: p.resaltada ? 800 : 700,
                  fontSize: p.resaltada ? 58 : 40,
                  color: p.resaltada ? '#3DDC6E' : PALETA.texto,
                  opacity: op,
                  transform: `translateY(${y}px)`,
                }}
              >
                {p.w}
              </span>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '42%',
          bottom: '4%',
          left: '10%',
          right: '10%',
          borderRadius: 20,
          overflow: 'hidden',
          opacity: opMetricas,
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        <OffthreadVideo src={staticFile(`video/${clipMetricas}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};
