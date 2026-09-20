import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALETA, GROTESCA, SERIF, ANCHO, ALTO} from '../identidad';

// Primera pieza del Pilar A ("tips faciles"/noticias reales de IA en
// tiempo real) -- ver debate de angulo en fabrica/ESTADO.md (2026-09-20):
// tras decidir alejarse del lenguaje "gurú de IA que te hace rico" hacia
// una posicion de educacion honesta, esta pieza cuenta una noticia real
// (Higgsfield AI: ronda Serie B de 400M USD, valuacion 5.400M USD,
// lanzamiento de API el 16/09/2026 con promo de acceso gratis por
// tiempo limitado) sin CTA a la comunidad (todavia sin definir/lanzar).
//
// Test de angulo comercial (CLAUDE.md) aplicado:
//   1. Le importa a cualquiera que use o mire IA, no requiere contexto
//      interno de la fabrica.
//   2. El espectador se lleva FOMO real (ventana de lanzamiento) + un
//      dato verificable que puede usar el mismo.
//   3. Las apuestas son del espectador: su oportunidad de probar la
//      herramienta mientras dura la promo.
//   4. Patrones usados de fabrica/hooks/catalogo.ts: 'cifra-inmediata'
//      (GRATIS como golpe inicial) + 'expectativa-violada' (una IA de
//      video hiperrealista, normalmente cara, gratis) + 'loop-abierto'
//      ("investigue por que", se resuelve en la tarjeta de hechos).
//   5. Honestidad: NUNCA se dice "todo gratis para siempre" -- el
//      cierre aclara explicitamente que el plan gratis permanente tiene
//      marca de agua y pocos creditos, y que esto es la promo de
//      lanzamiento, distinta y limitada.
//
// Mismo lenguaje visual que BugReal/AutoArreglo (linea curva continua,
// hook de pantalla completa en escalones, count-up real), pero sin
// asset de video (no hay footage propio de Higgsfield) -- la "prueba"
// es una tarjeta de hechos en lenguaje llano (sin estetica de
// log/terminal, a diferencia de bug-real, que probo que esa estetica
// no se entiende).
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function caminoCurvo(x: number, y0: number, y1: number, amplitud: number): string {
  const midY = y0 + (y1 - y0) * 0.5;
  return `M ${x} ${y0} C ${x + amplitud} ${y0 + (y1 - y0) * 0.22}, ${x - amplitud} ${midY - (y1 - y0) * 0.05}, ${x} ${y1}`;
}

export type NoticiaIATiempos = {
  hookIntro: number;
  hookMedio: number;
  hookImpacto: number;
  aclaracion: number;
  hechosAparece: number;
  lineaSigue: number;
  resultadoCountDesde: number;
  resultadoCountDuracion: number;
  resultadoDetalle: number;
  verificacion: number;
  cierre: number;
};

export const NoticiaIA: React.FC<{
  hookIntro: string;
  hookMedio: string;
  hookImpacto: string;
  aclaracion: string;
  hechosTitulo: string;
  hechosLineas: string[];
  resultadoNumero: number;
  resultadoPrefijo?: string;
  resultadoDetalle: string;
  verificacion: string;
  cierre: string;
  t: NoticiaIATiempos;
}> = ({
  hookIntro,
  hookMedio,
  hookImpacto,
  aclaracion,
  hechosTitulo,
  hechosLineas,
  resultadoNumero,
  resultadoPrefijo,
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
  const opAclaracion = ent(t.aclaracion, 0.5);
  const opHookContainer = interpolate(seg, [t.hechosAparece - 0.5, t.hechosAparece], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const yLineaInicio = 0.16 * ALTO;
  const yLineaHechos = 0.46 * ALTO;
  const camino1 = caminoCurvo(ANCHO / 2, yLineaInicio, yLineaHechos, -140);
  const progreso1 = clamp01((seg - t.hechosAparece + 0.3) / 0.7);

  const yLineaFin = 0.88 * ALTO;
  const camino2 = caminoCurvo(ANCHO / 2, yLineaHechos, yLineaFin, 130);
  const progreso2 = clamp01((seg - t.lineaSigue) / 0.8);

  const opHechos = ent(t.hechosAparece, 0.4);

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

      {/* Hook -- pantalla completa, 3 escalones (chico -> mediano -> gigante rojo) */}
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
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 38, color: PALETA.texto, opacity: opIntro}}>
          {hookIntro}
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 60,
            lineHeight: 1,
            color: PALETA.texto,
            opacity: opMedio,
            marginTop: 10,
            textTransform: 'uppercase',
          }}
        >
          {hookMedio}
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 138,
            lineHeight: 0.92,
            color: PALETA.acento,
            opacity: opImpacto,
            marginTop: 14,
            letterSpacing: '-0.02em',
            transform: `scale(${escalaImpacto})`,
            textTransform: 'uppercase',
          }}
        >
          {hookImpacto}
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 27, color: PALETA.texto, opacity: opAclaracion, marginTop: 22}}>
          {aclaracion}
        </div>
      </div>

      {/* Hechos -- lenguaje llano, sin estetica de log (esa fallo en bug-real) */}
      <div
        style={{
          position: 'absolute',
          top: `${(yLineaHechos / ALTO) * 100}%`,
          left: '10%',
          right: '10%',
          transform: 'translateY(-50%)',
          opacity: opHechos,
        }}
      >
        <div
          style={{
            background: '#111114',
            border: '1px solid #2A2A2E',
            borderRadius: 20,
            padding: '26px 26px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              fontFamily: GROTESCA,
              fontWeight: 700,
              fontSize: 16,
              color: PALETA.acento,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 14,
            }}
          >
            {hechosTitulo}
          </div>
          {hechosLineas.map((l, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: i === 0 ? 0 : 10}}>
              <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 20, color: PALETA.acento, lineHeight: 1.4}}>→</div>
              <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 25, lineHeight: 1.4, color: '#EFEFEA'}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resultado -- count-up real (cifra verificable) + detalle + verificacion + cierre honesto */}
      <div style={{position: 'absolute', bottom: '4%', left: 0, right: 0, padding: '0 8%', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 88,
            color: PALETA.texto,
            opacity: opResultado,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {resultadoPrefijo ?? ''}
          {numeroContado.toLocaleString('es-AR')}
        </div>
        <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 25, color: PALETA.texto, opacity: opDetalle, marginTop: 4}}>
          {resultadoDetalle}
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 23, color: '#8FE3A6', opacity: opVerificacion, marginTop: 14}}>
          {verificacion}
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 21, color: PALETA.texto, opacity: opCierre * 0.85, marginTop: 20}}>
          {cierre}
        </div>
      </div>
    </AbsoluteFill>
  );
};
