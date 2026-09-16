import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALETA, GROTESCA, SERIF, ANCHO, ALTO} from '../identidad';

// Primera pieza de la sub-serie "El error real": un bug real encontrado
// y arreglado en la fabrica, contado con el mismo lenguaje visual que
// el documental (linea curva continua, sin cortes) pero con dos
// correcciones reales pedidas por el operador tras ver la v1:
//   1. "Nadie va a mirar los logs y entender que hubo un problema" --
//      el gancho tiene que pegar en palabras de todos los dias, no en
//      jerga de programador ("registros", rutas de archivo).
//   2. "El hook tiene que ser mas potente, tipo 'asi fue como casi
//      pierdo 27 videos', que ocupe toda la pantalla" -- el hook pasa
//      de un bloque chico arriba a dominar la pantalla completa, en 3
//      escalones de tipografia (chico -> mediano -> gigante y rojo).
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function caminoCurvo(x: number, y0: number, y1: number, amplitud: number): string {
  const midY = y0 + (y1 - y0) * 0.5;
  return `M ${x} ${y0} C ${x + amplitud} ${y0 + (y1 - y0) * 0.22}, ${x - amplitud} ${midY - (y1 - y0) * 0.05}, ${x} ${y1}`;
}

export type BugRealTiempos = {
  hookIntro: number;
  hookMedio: number;
  hookImpacto: number;
  hookAclaracion: number;
  pruebaAparece: number;
  lineaSigue: number;
  resultadoCountDesde: number;
  resultadoCountDuracion: number;
  resultadoDetalle: number;
  verificacion: number;
  cierre: number;
};

export const BugReal: React.FC<{
  hookIntro: string;
  hookMedio: string;
  hookImpacto: string;
  aclaracion: string;
  pruebaTitulo: string;
  pruebaLineas: string[];
  resultadoNumero: number;
  resultadoDetalle: string;
  verificacion: string;
  cierre: string;
  t: BugRealTiempos;
}> = ({
  hookIntro,
  hookMedio,
  hookImpacto,
  aclaracion,
  pruebaTitulo,
  pruebaLineas,
  resultadoNumero,
  resultadoDetalle,
  verificacion,
  cierre,
  t,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seg = frame / fps;
  const ent = (t0: number, dur: number) =>
    interpolate(seg, [t0, t0 + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const opIntro = ent(t.hookIntro, 0.4);
  const opMedio = ent(t.hookMedio, 0.4);
  const opImpacto = ent(t.hookImpacto, 0.5);
  const escalaImpacto = interpolate(seg, [t.hookImpacto, t.hookImpacto + 0.5], [0.88, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opAclaracion = ent(t.hookAclaracion, 0.5);
  // El gancho ocupa toda la pantalla mientras se lee, y se retira
  // (fade-out) justo antes de que arranque la prueba -- asi domina el
  // arranque sin quedar superpuesto con el resto del video.
  const opHookContainer = interpolate(seg, [t.pruebaAparece - 0.5, t.pruebaAparece], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // -- camino curvo, en 2 tramos, igual que Revelacion.tsx --
  const yLineaInicio = 0.16 * ALTO;
  const yLineaPrueba = 0.44 * ALTO;
  const camino1 = caminoCurvo(ANCHO / 2, yLineaInicio, yLineaPrueba, -140);
  const progreso1 = clamp01((seg - t.pruebaAparece + 0.3) / 0.7);

  const yLineaFin = 0.88 * ALTO;
  const camino2 = caminoCurvo(ANCHO / 2, yLineaPrueba, yLineaFin, 130);
  const progreso2 = clamp01((seg - t.lineaSigue) / 0.8);

  const opPrueba = ent(t.pruebaAparece, 0.4);

  const numeroContado = Math.round(
    interpolate(seg, [t.resultadoCountDesde, t.resultadoCountDesde + t.resultadoCountDuracion], [0, resultadoNumero], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const opResultado = ent(t.resultadoCountDesde, 0.3);
  const opDetalle = ent(t.resultadoDetalle, 0.4);
  const opVerificacion = ent(t.verificacion, 0.4);
  const opCierre = ent(t.cierre, 0.5);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <svg width="100%" height="100%" viewBox={`0 0 ${ANCHO} ${ALTO}`} style={{position: 'absolute', inset: 0}}>
        <path d={camino1} fill="none" stroke={PALETA.acento} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progreso1} />
        <path d={camino2} fill="none" stroke={PALETA.acento} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progreso2} />
      </svg>

      {/* El gancho -- a pantalla completa, 3 escalones de tipografia:
          chico (contexto) -> mediano (tension) -> gigante y rojo (el golpe) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 7%',
          textAlign: 'center',
          opacity: opHookContainer,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 40,
            color: PALETA.texto,
            opacity: opIntro,
          }}
        >
          {hookIntro}
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 64,
            lineHeight: 1,
            color: PALETA.texto,
            opacity: opMedio,
            marginTop: 8,
            textTransform: 'uppercase',
          }}
        >
          {hookMedio}
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 132,
            lineHeight: 0.92,
            color: PALETA.acento,
            opacity: opImpacto,
            marginTop: 14,
            letterSpacing: '-0.02em',
            transform: `scale(${escalaImpacto})`,
          }}
        >
          {hookImpacto}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 28,
            color: PALETA.texto,
            opacity: opAclaracion,
            marginTop: 22,
          }}
        >
          {aclaracion}
        </div>
      </div>

      {/* La prueba -- breve, secundaria, estetica de log/terminal real */}
      <div
        style={{
          position: 'absolute',
          top: `${(yLineaPrueba / ALTO) * 100}%`,
          left: '12%',
          right: '12%',
          transform: 'translateY(-50%)',
          opacity: opPrueba,
        }}
      >
        <div
          style={{
            background: '#111114',
            border: '1px solid #2A2A2E',
            borderRadius: 16,
            padding: '18px 20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              fontFamily: GROTESCA,
              fontWeight: 700,
              fontSize: 15,
              color: PALETA.acento,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 10,
            }}
          >
            {pruebaTitulo}
          </div>
          {pruebaLineas.map((l, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                fontSize: 20,
                lineHeight: 1.5,
                color: '#D8D6CE',
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Resultado -- count-up real + detalle + verificacion */}
      <div style={{position: 'absolute', bottom: '6%', left: 0, right: 0, padding: '0 8%', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 100,
            color: PALETA.texto,
            opacity: opResultado,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {numeroContado}
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 600,
            fontSize: 26,
            color: PALETA.texto,
            opacity: opDetalle,
            marginTop: 4,
          }}
        >
          {resultadoDetalle}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 24,
            color: '#8FE3A6',
            opacity: opVerificacion,
            marginTop: 14,
          }}
        >
          {verificacion}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 22,
            color: PALETA.texto,
            opacity: opCierre * 0.75,
            marginTop: 22,
          }}
        >
          {cierre}
        </div>
      </div>
    </AbsoluteFill>
  );
};
