import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {GROTESCA, PALETA, SERIF} from '../identidad';
import {Figura, NombreFigura} from './figuras';

// EL EXPLICADOR DIBUJADO
//
// Esto es lo que hacen los canales que miran millones de personas: no te
// muestran una foto de archivo, te DIBUJAN la idea. Un monito, una
// flecha, otro monito, y entendiste.
//
// Lo que hace esta escena:
//   - los dibujos se trazan solos, uno despues del otro
//   - las flechas CRECEN de un dibujo al otro, no aparecen
//   - un dibujo se puede tachar con una cruz (esto no funciona)
//   - un dibujo se puede convertir en otro (esto se transforma en esto)
//
// Todo se declara con datos, asi que cada video arma el suyo distinto.

export type Nodo = {
  fig: NombreFigura;
  /** posicion en la pantalla, 0..1 */
  x: number;
  y: number;
  /** tamaño en pixeles */
  tam: number;
  rotulo?: string;
  /** segundo en que empieza a dibujarse */
  t: number;
  acento?: boolean;
  /** segundo en que le cae la cruz encima */
  tachar?: number;
  /** se convierte en otra figura a partir de este segundo */
  seVuelve?: {fig: NombreFigura; t: number};
};

export type Flecha = {
  de: number;
  a: number;
  t: number;
  rotulo?: string;
  /** curvatura: 0 recta, positivo arquea hacia arriba */
  curva?: number;
  acento?: boolean;
};

export type DatosDiagrama = {
  titulo?: string;
  pie?: string;
  nodos: Nodo[];
  flechas?: Flecha[];
};

const W = 1080;
const H = 1920;

export const Diagrama: React.FC<{d: DatosDiagrama}> = ({d}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;

  // cuanto lleva dibujado algo que empezo en t0 (tarda 'dura' segundos)
  const trazo = (t0: number, dura = 0.55) =>
    Math.max(0, Math.min(1, (t - t0) / dura));

  const pos = (n: Nodo) => ({x: n.x * W, y: n.y * H});

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {d.titulo ? (
        <div
          style={{
            position: 'absolute',
            top: '11%',
            left: '7%',
            right: '7%',
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 68,
            lineHeight: 1.08,
            color: PALETA.texto,
            opacity: interpolate(t, [0, 0.35], [0, 1], {extrapolateRight: 'clamp'}),
          }}
        >
          {d.titulo}
        </div>
      ) : null}

      {/* las flechas van DEBAJO de los dibujos */}
      <svg
        width={W}
        height={H}
        style={{position: 'absolute', inset: 0}}
        viewBox={`0 0 ${W} ${H}`}
      >
        {(d.flechas || []).map((f, i) => {
          const p = trazo(f.t, 0.45);
          if (p <= 0) return null;
          const A = pos(d.nodos[f.de]);
          const B = pos(d.nodos[f.a]);
          const rA = d.nodos[f.de].tam / 2;
          const rB = d.nodos[f.a].tam / 2;
          // se recorta en los bordes de cada dibujo para no pisarlos
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const largo = Math.hypot(dx, dy) || 1;
          const ux = dx / largo;
          const uy = dy / largo;
          const x1 = A.x + ux * (rA + 26);
          const y1 = A.y + uy * (rA + 26);
          const x2 = B.x - ux * (rB + 44);
          const y2 = B.y - uy * (rB + 44);
          const curva = f.curva || 0;
          const mx = (x1 + x2) / 2 - uy * curva * 200;
          const my = (y1 + y2) / 2 + ux * curva * 200;
          const col = f.acento ? PALETA.acento : PALETA.texto;
          // punta
          const ang = Math.atan2(y2 - my, x2 - mx);
          const pa = 26;
          const punta = `M${x2 - pa * Math.cos(ang - 0.42)} ${y2 - pa * Math.sin(ang - 0.42)} L${x2} ${y2} L${x2 - pa * Math.cos(ang + 0.42)} ${y2 - pa * Math.sin(ang + 0.42)}`;
          return (
            <g key={i}>
              <path
                d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
                fill="none"
                stroke={col}
                strokeWidth={7}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - p}
              />
              <path
                d={punta}
                fill="none"
                stroke={col}
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={interpolate(p, [0.8, 1], [0, 1], {extrapolateLeft: 'clamp'})}
              />
              {f.rotulo ? (
                <text
                  x={mx}
                  y={my - 22}
                  textAnchor="middle"
                  fill={col}
                  style={{
                    fontFamily: GROTESCA,
                    fontWeight: 700,
                    fontSize: 38,
                    opacity: interpolate(p, [0.7, 1], [0, 1], {extrapolateLeft: 'clamp'}),
                  }}
                >
                  {f.rotulo}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {d.nodos.map((n, i) => {
        const p = trazo(n.t);
        if (p <= 0) return null;
        const {x, y} = pos(n);
        const col = n.acento ? PALETA.acento : PALETA.texto;
        // el dibujo aterriza con un rebotecito cuando termina de trazarse
        const aterriza = spring({
          frame: frame - (n.t + 0.5) * fps,
          fps,
          config: {damping: 14, stiffness: 180, mass: 0.6},
        });
        const escala = 0.94 + 0.06 * aterriza;

        // transformacion: se desvanece el viejo y se traza el nuevo
        const mut = n.seVuelve ? trazo(n.seVuelve.t, 0.5) : 0;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%,-50%) scale(${escala})`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div style={{position: 'relative', width: n.tam, height: n.tam}}>
              <div style={{position: 'absolute', inset: 0, opacity: 1 - mut}}>
                <Figura nombre={n.fig} p={p} col={col} tam={n.tam} grosor={4.2} />
              </div>
              {n.seVuelve && mut > 0 ? (
                <div style={{position: 'absolute', inset: 0}}>
                  <Figura
                    nombre={n.seVuelve.fig}
                    p={mut}
                    col={PALETA.acento}
                    tam={n.tam}
                    grosor={4.2}
                  />
                </div>
              ) : null}
              {/* la cruz de "esto no va" */}
              {n.tachar !== undefined && t >= n.tachar ? (
                <svg
                  width={n.tam}
                  height={n.tam}
                  viewBox="0 0 100 100"
                  style={{position: 'absolute', inset: 0}}
                >
                  {['M14 14 L86 86', 'M86 14 L14 86'].map((dd, k) => (
                    <path
                      key={k}
                      d={dd}
                      stroke={PALETA.acento}
                      strokeWidth={9}
                      strokeLinecap="round"
                      fill="none"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={
                        1 - Math.max(0, Math.min(1, (t - n.tachar! - k * 0.12) / 0.22))
                      }
                    />
                  ))}
                </svg>
              ) : null}
            </div>
            {n.rotulo ? (
              <div
                style={{
                  fontFamily: GROTESCA,
                  fontWeight: 700,
                  fontSize: 40,
                  letterSpacing: '-0.02em',
                  color: col,
                  textAlign: 'center',
                  maxWidth: n.tam * 2.1,
                  lineHeight: 1.1,
                  opacity: interpolate(p, [0.55, 1], [0, 1], {extrapolateLeft: 'clamp'}),
                }}
              >
                {n.rotulo}
              </div>
            ) : null}
          </div>
        );
      })}

      {d.pie ? (
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '7%',
            right: '7%',
            fontFamily: GROTESCA,
            fontWeight: 500,
            fontSize: 46,
            lineHeight: 1.2,
            color: PALETA.texto,
            opacity: interpolate(
              t,
              [durationInFrames / fps - 2.2, durationInFrames / fps - 1.7],
              [0, 0.85],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
            ),
          }}
        >
          {d.pie}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
