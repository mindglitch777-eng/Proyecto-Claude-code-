import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALETA, GROTESCA, SERIF, ANCHO, ALTO} from '../identidad';

// Segunda vuelta de "El error real" #1 -- mismo caso real (la carrera
// de git de 2026-09-15, 27 entradas en riesgo, 26+1 recuperadas,
// verificado a mano), pero angulo y visual reescritos de punta a punta
// tras debatir con el operador (ver fabrica/ESTADO.md):
//   1. El angulo anterior ("casi pierdo 27 videos") era un drama
//      100% interno, sin apuesta real para el espectador. Nuevo
//      angulo: la fabrica se rompe en vivo y se autogestiona sola --
//      apela a la duda real de cualquiera que evalue automatizar algo
//      ("¿puedo confiar en que esto no me rompa todo?").
//   2. La tarjeta de log/evidencia tenia texto tecnico aunque
//      estuviera en criollo -- reemplazada por una grilla de
//      miniaturas REALES que se ponen en rojo y se autoreparan a
//      verde, sin una sola palabra tecnica en pantalla.
//   3. Hook mas agresivo, directo, sin aclaracion que le baje el tono:
//      "SE ROMPIO EN VIVO." Pedido textual: "armé un sistema que se
//      autogestiona solo... y recuperé todos" + CTA real a la
//      comunidad (20 cupos gratis).
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function caminoCurvo(x: number, y0: number, y1: number, amplitud: number): string {
  const midY = y0 + (y1 - y0) * 0.5;
  return `M ${x} ${y0} C ${x + amplitud} ${y0 + (y1 - y0) * 0.22}, ${x - amplitud} ${midY - (y1 - y0) * 0.05}, ${x} ${y1}`;
}

const IconoAlerta: React.FC<{opacidad: number}> = ({opacidad}) => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: opacidad, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))'}}
  >
    <circle cx="12" cy="12" r="11" fill="#E53E2E" />
    <rect x="10.6" y="5.5" width="2.8" height="8.5" rx="1.4" fill="#0A0A0C" />
    <circle cx="12" cy="17" r="1.7" fill="#0A0A0C" />
  </svg>
);

const IconoCheck: React.FC<{opacidad: number}> = ({opacidad}) => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: opacidad, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))'}}
  >
    <circle cx="12" cy="12" r="11" fill="#3DDC6E" />
    <path d="M7 12.5 L10.3 15.8 L17 8.5" stroke="#0A0A0C" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GrillaAutoarreglo: React.FC<{clips: string[]; seg: number; gridAparece: number; autoarregloDesde: number}> = ({
  clips,
  seg,
  gridAparece,
  autoarregloDesde,
}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr 1fr',
      gap: 3,
    }}
  >
    {clips.slice(0, 6).map((c, i) => {
      const tRoja0 = gridAparece;
      const tArregloLocal = autoarregloDesde + i * 0.18;
      const opRoja = interpolate(seg, [tRoja0, tRoja0 + 0.3, tArregloLocal, tArregloLocal + 0.3], [0, 0.8, 0.8, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const opIconoRojo = interpolate(seg, [tRoja0, tRoja0 + 0.3, tArregloLocal, tArregloLocal + 0.2], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const opVerde = interpolate(seg, [tArregloLocal, tArregloLocal + 0.35], [0, 0.55], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const opIconoVerde = interpolate(seg, [tArregloLocal + 0.1, tArregloLocal + 0.35], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      return (
        <div key={c + i} style={{overflow: 'hidden', position: 'relative'}}>
          {/* Blur + oscurecido a proposito: los clips reales tienen su propio
              texto/branding (son videos promocionales, no b-roll neutro) --
              sin esto compite con el icono y rompe el "sin texto tecnico". */}
          <OffthreadVideo
            src={staticFile(`video/${c}`)}
            muted
            loop
            style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(9px) brightness(0.45) saturate(1.15)', transform: 'scale(1.12)'}}
          />
          <div style={{position: 'absolute', inset: 0, background: '#E53E2E', opacity: opRoja * 0.55}} />
          <div style={{position: 'absolute', inset: 0, background: '#3DDC6E', opacity: opVerde * 0.5}} />
          <IconoAlerta opacidad={opIconoRojo} />
          <IconoCheck opacidad={opIconoVerde} />
        </div>
      );
    })}
  </div>
);

export type AutoArregloTiempos = {
  hookIntro: number;
  hookImpacto: number;
  gridAparece: number;
  autoarregloDesde: number;
  lineaSigue: number;
  resultadoCountDesde: number;
  resultadoCountDuracion: number;
  resultadoDetalle: number;
  verificacion: number;
  cierre: number;
  cta: number;
};

export const AutoArreglo: React.FC<{
  hookIntro: string;
  hookImpacto: string;
  clipsGrid: string[];
  resultadoNumero: number;
  resultadoDetalle: string;
  verificacion: string;
  cierre: string;
  cta: string;
  t: AutoArregloTiempos;
}> = ({hookIntro, hookImpacto, clipsGrid, resultadoNumero, resultadoDetalle, verificacion, cierre, cta, t}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seg = frame / fps;
  const ent = (t0: number, dur: number) =>
    interpolate(seg, [t0, t0 + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const opIntro = ent(t.hookIntro, 0.35);
  const opImpacto = ent(t.hookImpacto, 0.45);
  const escalaImpacto = interpolate(seg, [t.hookImpacto, t.hookImpacto + 0.45], [0.88, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opHookContainer = interpolate(seg, [t.gridAparece - 0.45, t.gridAparece - 0.05], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const yLineaInicio = 0.14 * ALTO;
  const yLineaGrid = 0.28 * ALTO;
  const camino1 = caminoCurvo(ANCHO / 2, yLineaInicio, yLineaGrid, -130);
  const progreso1 = clamp01((seg - t.gridAparece + 0.35) / 0.7);

  const yLineaFin = 0.86 * ALTO;
  const yGridFin = 0.62 * ALTO;
  const camino2 = caminoCurvo(ANCHO / 2, yGridFin, yLineaFin, 120);
  const progreso2 = clamp01((seg - t.lineaSigue) / 0.8);

  const opGrid = ent(t.gridAparece, 0.35);

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
  const opCta = ent(t.cta, 0.5);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <svg width="100%" height="100%" viewBox={`0 0 ${ANCHO} ${ALTO}`} style={{position: 'absolute', inset: 0, zIndex: 5}}>
        <path d={camino1} fill="none" stroke={PALETA.acento} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progreso1} />
        <path d={camino2} fill="none" stroke={PALETA.acento} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progreso2} />
      </svg>

      {/* Hook -- pantalla completa, 2 escalones (chico -> gigante rojo), sin aclaracion que le baje el tono */}
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
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 40, color: PALETA.texto, opacity: opIntro}}>
          {hookIntro}
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 118,
            lineHeight: 0.96,
            color: PALETA.acento,
            opacity: opImpacto,
            marginTop: 16,
            letterSpacing: '-0.02em',
            transform: `scale(${escalaImpacto})`,
            textTransform: 'uppercase',
          }}
        >
          {hookImpacto}
        </div>
      </div>

      {/* Grilla real que se rompe (rojo) y se autorepara (verde), sin texto tecnico */}
      {opGrid > 0.01 && (
        <div style={{position: 'absolute', top: '28%', bottom: '38%', left: 0, right: 0, opacity: opGrid}}>
          <GrillaAutoarreglo clips={clipsGrid} seg={seg} gridAparece={t.gridAparece} autoarregloDesde={t.autoarregloDesde} />
        </div>
      )}

      {/* Resultado -- count-up real + detalle + verificacion + cierre + CTA */}
      <div style={{position: 'absolute', bottom: '3%', left: 0, right: 0, padding: '0 8%', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 96,
            color: PALETA.texto,
            opacity: opResultado,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {numeroContado}
        </div>
        <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 25, color: PALETA.texto, opacity: opDetalle, marginTop: 2}}>
          {resultadoDetalle}
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, color: '#8FE3A6', opacity: opVerificacion, marginTop: 12}}>
          {verificacion}
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 20, color: PALETA.texto, opacity: opCierre * 0.85, marginTop: 16}}>
          {cierre}
        </div>
        <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 24, color: PALETA.acento, opacity: opCta, marginTop: 14}}>
          {cta}
        </div>
      </div>
    </AbsoluteFill>
  );
};
