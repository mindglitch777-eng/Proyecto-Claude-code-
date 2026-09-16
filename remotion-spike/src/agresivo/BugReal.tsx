import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALETA, GROTESCA, SERIF, ANCHO, ALTO} from '../identidad';

// Primera pieza de la sub-serie "El error real": un bug real encontrado
// y arreglado en la fabrica, contado con el mismo lenguaje visual que
// el documental (linea curva continua, sin cortes) pero con una
// correccion de enfoque pedida por el operador: "nadie va a mirar los
// logs y entender que hubo un problema" -- el NUMERO real es el gancho
// dramatico (grande, rojo, kinetico), el log/prueba real queda como
// evidencia breve y secundaria, no como protagonista.
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function caminoCurvo(x: number, y0: number, y1: number, amplitud: number): string {
  const midY = y0 + (y1 - y0) * 0.5;
  return `M ${x} ${y0} C ${x + amplitud} ${y0 + (y1 - y0) * 0.22}, ${x - amplitud} ${midY - (y1 - y0) * 0.05}, ${x} ${y1}`;
}

export type BugRealTiempos = {
  hookNumero: number;
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
  numeroGrande: string;
  numeroEtiqueta: string;
  aclaracion: string;
  pruebaTitulo: string;
  pruebaLineas: string[];
  resultadoNumero: number;
  resultadoDetalle: string;
  verificacion: string;
  cierre: string;
  t: BugRealTiempos;
}> = ({
  numeroGrande,
  numeroEtiqueta,
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

  const opNumero = ent(t.hookNumero, 0.5);
  const opEtiqueta = ent(t.hookNumero + 0.15, 0.5);
  const opAclaracion = ent(t.hookAclaracion, 0.5);

  // -- camino curvo, en 2 tramos, igual que Revelacion.tsx --
  const yLineaInicio = 0.32 * ALTO;
  const yLineaPrueba = 0.5 * ALTO;
  const camino1 = caminoCurvo(ANCHO / 2, yLineaInicio, yLineaPrueba, -140);
  const progreso1 = clamp01((seg - t.pruebaAparece + 0.3) / 0.7);

  const yLineaFin = 0.9 * ALTO;
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

      {/* El gancho -- el numero real, grande y en rojo, protagonista */}
      <div style={{position: 'absolute', top: '10%', left: 0, right: 0, padding: '0 8%', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 118,
            lineHeight: 0.95,
            color: PALETA.acento,
            opacity: opNumero,
            letterSpacing: '-0.02em',
          }}
        >
          {numeroGrande}
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 46,
            lineHeight: 1.1,
            color: PALETA.texto,
            opacity: opEtiqueta,
            marginTop: 6,
            textTransform: 'uppercase',
          }}
        >
          {numeroEtiqueta}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 32,
            color: PALETA.texto,
            opacity: opAclaracion,
            marginTop: 18,
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
