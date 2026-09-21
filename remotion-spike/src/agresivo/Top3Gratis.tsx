import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, Solid, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useGsapTimeline} from '@remotion/gsap';
import {glow} from '@remotion/effects/glow';
import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {PALETA, GROTESCA, SERIF, ANCHO, ALTO} from '../identidad';

// "Top 3 gratis" -- pieza nueva pedida por el operador tras el pedido
// explicito de moverse de "noticia suelta" a un angulo de ranking
// honesto (12 herramientas de IA investigadas de verdad esta sesion,
// 9 descartadas, 3 sirven). Primer componente que usa:
//   1. @remotion/gsap real en produccion (antes solo probado aislado en
//      pruebas-r7/PruebaGsap.tsx) -- pop elastico en el montaje de
//      descarte y en las 3 tarjetas ganadoras, algo que interpolate()
//      a mano no da sin escribir curvas bezier a ojo.
//   2. Logos reales de marca (Regla de logos reales, CLAUDE.md
//      2026-09-21) en vez de la chapita de color de LogosHerramientas
//      -- si `logo` no esta seteado (la marca no tenia ficha confiable
//      en Wikidata), cae en texto solo, nunca un logo inventado.
const ROJO_ALARMA = '#E53E2E';
const VERDE_OK = '#3DDC6E';

export type Top3GratisTiempos = {
  hookIntro: number;
  hookImpacto: number;
  aclaracion: number;
  rechazadosDesde: number;
  rechazadosDuracion: number;
  transicion: number;
  ganador1: number;
  ganador2: number;
  ganador3: number;
  cierre: number;
  cta: number;
};

export type Rechazado = {nombre: string; logo?: string};
export type Ganador = {nombre: string; dato: string; detalle: string; logo?: string};

const Chip: React.FC<{r: Rechazado}> = ({r}) => (
  <div
    className="chip"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: '#151517',
      border: '1px solid #2A2A2E',
      borderRadius: 14,
      padding: '14px 8px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {r.logo ? (
      // Los logos reales bajados via Wikidata son wordmarks anchos (ej.
      // 1280x110px) -- una caja cuadrada los aplasta a casi nada. Se
      // fija la ALTURA y se deja el ancho libre (con tope), no al reves.
      <Img src={staticFile(r.logo)} style={{height: 28, maxWidth: 100, objectFit: 'contain', opacity: 0.8}} />
    ) : (
      <div style={{width: 48, height: 48, borderRadius: 10, background: '#2A2A2E'}} />
    )}
    <div
      style={{
        fontFamily: GROTESCA,
        fontWeight: 700,
        fontSize: 15,
        color: '#B8B8B4',
        textAlign: 'center',
        lineHeight: 1.15,
      }}
    >
      {r.nombre}
    </div>
    {/* Tachado real -- una linea diagonal, no un emoji */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{width: '115%', height: 4, background: ROJO_ALARMA, transform: 'rotate(-18deg)', opacity: 0.92, borderRadius: 2}} />
    </div>
  </div>
);

const MontajeDescarte: React.FC<{rechazados: Rechazado[]}> = ({rechazados}) => {
  const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
    timeline.from(selector('.chip'), {
      opacity: 0,
      scale: 0.3,
      rotation: -10,
      duration: 0.35,
      ease: 'back.out(2.4)',
      stagger: 0.09,
    });
  });

  return (
    <div
      ref={scope}
      style={{
        position: 'absolute',
        top: '30%',
        left: '10%',
        right: '10%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12,
      }}
    >
      {rechazados.slice(0, 9).map((r, i) => (
        <Chip key={r.nombre + i} r={r} />
      ))}
    </div>
  );
};

const TarjetaGanador: React.FC<{g: Ganador; numero: number}> = ({g, numero}) => {
  const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
    timeline.from(selector('.tarjeta-ganador'), {
      opacity: 0,
      scale: 0.6,
      rotation: -4,
      y: 30,
      duration: 0.55,
      ease: 'elastic.out(1, 0.55)',
    });
  });

  return (
    <div ref={scope} style={{width: '100%'}}>
      <div
        className="tarjeta-ganador"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: '#12160F',
          border: `2px solid ${VERDE_OK}`,
          borderRadius: 18,
          padding: '18px 20px',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: VERDE_OK,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 16, color: '#0A0A0C'}}>{numero}</div>
        </div>
        {g.logo ? (
          <Img src={staticFile(g.logo)} style={{height: 38, maxWidth: 130, objectFit: 'contain', flexShrink: 0}} />
        ) : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0}}>
          <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 26, color: PALETA.texto}}>{g.nombre}</div>
          <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 22, color: VERDE_OK}}>{g.dato}</div>
          <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 17, color: '#B8B8B4', lineHeight: 1.3}}>{g.detalle}</div>
        </div>
      </div>
    </div>
  );
};

export const Top3Gratis: React.FC<{
  hookIntro: string;
  hookImpacto: string;
  aclaracion: string;
  rechazados: Rechazado[];
  transicion: string;
  ganadores: [Ganador, Ganador, Ganador];
  cierre: string;
  cta: string;
  t: Top3GratisTiempos;
}> = ({hookIntro, hookImpacto, aclaracion, rechazados, transicion, ganadores, cierre, cta, t}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seg = frame / fps;
  const ent = (t0: number, dur: number) =>
    interpolate(seg, [t0, t0 + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // -- fondo con pulso sutil (mismo lenguaje visual que noticia-ia/auto-arreglo) --
  const pulso = 0.05 + 0.04 * Math.abs(Math.sin(seg * 1.3));

  // -- hook --
  const opIntro = ent(t.hookIntro, 0.3);
  const opImpacto = ent(t.hookImpacto, 0.35);
  const escalaImpacto = interpolate(seg, [t.hookImpacto, t.hookImpacto + 0.18, t.hookImpacto + 0.35], [0.7, 1.08, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opAclaracion = ent(t.aclaracion, 0.3);
  const opHookGrupo = interpolate(seg, [t.rechazadosDesde - 0.4, t.rechazadosDesde - 0.05], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const flashImpacto = interpolate(seg, [t.hookImpacto - 0.03, t.hookImpacto + 0.03, t.hookImpacto + 0.22], [0, 0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // -- montaje de descarte --
  const opRechazados = interpolate(
    seg,
    [t.rechazadosDesde - 0.1, t.rechazadosDesde, t.transicion - 0.35, t.transicion - 0.05],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  // -- transicion ("solo 3 sirven") --
  const flashTransicion = interpolate(seg, [t.transicion - 0.03, t.transicion + 0.03, t.transicion + 0.2], [0, 0.7, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opTransicion = interpolate(seg, [t.transicion, t.transicion + 0.3, t.ganador1 - 0.3, t.ganador1 - 0.05], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const escalaTransicion = interpolate(seg, [t.transicion, t.transicion + 0.25], [0.85, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // -- ganadores (se acumulan, quedan visibles hasta el cierre) --
  const opGanadoresGrupo = interpolate(seg, [t.ganador1 - 0.1, t.ganador1, t.cierre - 0.3, t.cierre], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tGanadores = [t.ganador1, t.ganador2, t.ganador3];

  // -- cierre + cta --
  const opCierre = ent(t.cierre, 0.4);
  const opCta = ent(t.cta, 0.45);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <AbsoluteFill
        style={{background: `radial-gradient(circle at 50% 25%, rgba(255,78,36,${pulso.toFixed(3)}) 0%, rgba(10,10,12,0) 60%)`}}
      />

      {flashImpacto > 0.01 && (
        <Solid width={ANCHO} height={ALTO} color={ROJO_ALARMA} style={{opacity: flashImpacto}} effects={[glow({intensity: flashImpacto}), chromaticAberration({amount: flashImpacto * 14, angle: 0})]} />
      )}
      {flashTransicion > 0.01 && (
        <Solid width={ANCHO} height={ALTO} color={VERDE_OK} style={{opacity: flashTransicion}} effects={[glow({intensity: flashTransicion * 0.75}), chromaticAberration({amount: flashTransicion * 9, angle: 90})]} />
      )}

      {/* Barra de alerta */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 64, background: ROJO_ALARMA, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.92}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 24, letterSpacing: '0.12em', color: '#0A0A0C'}}>PROBADO DE VERDAD</div>
      </div>

      {/* SFX */}
      <Sequence from={Math.max(0, Math.round((t.hookImpacto - 0.5) * fps))} durationInFrames={Math.round(1.4 * fps)}>
        <Audio src={staticFile('sfx/riser.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={Math.max(0, Math.round(t.hookImpacto * fps))} durationInFrames={Math.round(0.55 * fps)}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={Math.max(0, Math.round(t.rechazadosDesde * fps))} durationInFrames={Math.round(0.7 * fps)}>
        <Audio src={staticFile('sfx/sub.wav')} volume={0.55} />
      </Sequence>
      <Sequence from={Math.max(0, Math.round(t.transicion * fps))} durationInFrames={Math.round(1.1 * fps)}>
        <Audio src={staticFile('sfx/campana.wav')} volume={0.55} />
      </Sequence>
      {tGanadores.map((tg, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(tg * fps))} durationInFrames={Math.round(0.35 * fps)}>
          <Audio src={staticFile('sfx/tick.wav')} volume={0.45} />
        </Sequence>
      ))}

      {/* Hook */}
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 7%', textAlign: 'center', opacity: opHookGrupo}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 34, color: PALETA.texto, opacity: opIntro}}>{hookIntro}</div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 108,
            lineHeight: 0.98,
            // Blanco, no ROJO_ALARMA: el flash de golpe pinta la pantalla
            // entera de ese mismo rojo en este instante exacto -- texto
            // rojo sobre flash rojo queda invisible (mismo tipo de bug de
            // legibilidad ya corregido antes en noticia-ia).
            color: PALETA.texto,
            opacity: opImpacto,
            marginTop: 16,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            transform: `scale(${escalaImpacto})`,
          }}
        >
          {hookImpacto}
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, color: PALETA.texto, opacity: opAclaracion, marginTop: 20}}>{aclaracion}</div>
      </div>

      {/* Montaje de descarte -- 9 chips reales con gsap */}
      {opRechazados > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: opRechazados}}>
          <MontajeDescarte rechazados={rechazados} />
        </div>
      )}

      {/* Transicion */}
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%', opacity: opTransicion}}>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 72,
            lineHeight: 1.05,
            // Blanco, mismo motivo que hookImpacto: el flash verde de
            // este instante pintaria texto verde invisible sobre fondo verde.
            color: PALETA.texto,
            textAlign: 'center',
            textTransform: 'uppercase',
            transform: `scale(${escalaTransicion})`,
          }}
        >
          {transicion}
        </div>
      </div>

      {/* Ganadores -- 3 tarjetas apiladas, cada una entra con gsap elastico */}
      <div style={{position: 'absolute', top: '20%', left: '7%', right: '7%', display: 'flex', flexDirection: 'column', gap: 16, opacity: opGanadoresGrupo}}>
        {ganadores.map((g, i) => (
          <Sequence key={g.nombre} from={Math.max(0, Math.round(tGanadores[i] * fps))} layout="none">
            <TarjetaGanador g={g} numero={i + 1} />
          </Sequence>
        ))}
      </div>

      {/* Cierre + CTA */}
      <div style={{position: 'absolute', bottom: '5%', left: 0, right: 0, padding: '0 8%', textAlign: 'center'}}>
        <div
          style={{
            background: '#1A1113',
            border: `2px solid ${ROJO_ALARMA}`,
            borderRadius: 18,
            padding: '20px 22px',
            opacity: opCierre,
          }}
        >
          <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 23, lineHeight: 1.3, color: PALETA.texto}}>{cierre}</div>
        </div>
        <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 24, color: PALETA.acento, opacity: opCta, marginTop: 16}}>{cta}</div>
      </div>
    </AbsoluteFill>
  );
};
