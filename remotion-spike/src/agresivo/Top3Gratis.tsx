import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, Solid, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useGsapTimeline} from '@remotion/gsap';
import {glow} from '@remotion/effects/glow';
import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {PALETA, GROTESCA, SERIF, ANCHO, ALTO} from '../identidad';

// "Top 3 gratis" v2 (2026-09-21, mismo dia) -- reescritura de fondo
// tras feedback directo del operador sobre la v1: "muy pequeño... no
// tiene ninguna palabra interesante... usaste los mismos componentes
// que veniamos usando en vez de crear algo nuevo". Cambios reales:
//   1. Gancho reescrito y mas agresivo: "LA INTELIGENCIA ARTIFICIAL
//      TE ESTAFA." en vez de "te estan mintiendo".
//   2. Montaje de descarte con HUMO real (filtro SVG feTurbulence
//      animado frame a frame, tecnica nueva en la fabrica -- no hay
//      stock de humo real con licencia libre, se genera desde cero) +
//      sello rojo "NO SIRVE" en vez de una linea tachada fina.
//   3. Las 3 ganadoras dejan de ser tarjetas apiladas chicas y pasan a
//      ser "vidrieras" de pantalla completa (fondo claro, igual al
//      formato de referencia que mando el operador: icono real + nombre
//      gigante + captura REAL de la pantalla de la herramienta a pantalla
//      completa, objectFit cover) -- componente nuevo, primera vez que
//      la fabrica muestra una captura de sitio real en vez de una
//      tarjeta de texto.
//   4. Texto mas grande en todo el video, no solo el hook.
const ROJO_ALARMA = '#E53E2E';
const VERDE_OK = '#3DDC6E';
const BLANCO = '#FFFFFF';
const NEGRO = '#0B0B0D';

export type Top3GratisTiempos = {
  hookLinea1: number;
  hookImpacto: number;
  aclaracion: number;
  introRechazo: number;
  rechazadosDesde: number;
  transicion: number;
  ganador1: number;
  ganador2: number;
  ganador3: number;
  cierre: number;
  cta: number;
};

export type Rechazado = {nombre: string};
export type Vidriera = {nombre: string; dato: string; detalle: string; icono?: string; captura?: string};

// -- Humo real: filtro SVG feTurbulence animado por frame (deterministico
// -- nunca Math.random()/Date.now(), asi el render es siempre igual).
// mixBlendMode 'screen' para que aclare sin tapar del todo lo que hay
// debajo (los chips siguen legibles).
const Humo: React.FC<{opacidad: number}> = ({opacidad}) => {
  const frame = useCurrentFrame();
  if (opacidad <= 0.01) return null;
  const baseFrequency = 0.007 + 0.0025 * Math.sin(frame / 35);
  const seed = Math.floor(frame / 2) % 9999;
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: opacidad, mixBlendMode: 'screen'}}>
      <defs>
        <filter id="humo-filtro" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves={3} seed={seed} result="ruido" />
          <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0.72  0 0 0 0 0.72  0 0 0 0 0.75  0 0 0 0.65 0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#humo-filtro)" />
    </svg>
  );
};

const Sello: React.FC = () => (
  <div
    className="sello"
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-16deg)',
      border: `4px solid ${ROJO_ALARMA}`,
      borderRadius: 10,
      padding: '4px 10px',
      background: 'rgba(229,62,46,0.14)',
    }}
  >
    <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 22, letterSpacing: '0.04em', color: ROJO_ALARMA}}>NO SIRVE</div>
  </div>
);

const Chip: React.FC<{r: Rechazado}> = ({r}) => (
  <div
    className="chip"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      background: '#151517',
      border: '1px solid #2A2A2E',
      borderRadius: 14,
      padding: '18px 8px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 92,
    }}
  >
    <div
      style={{
        fontFamily: GROTESCA,
        fontWeight: 700,
        fontSize: 19,
        color: '#D8D8D4',
        textAlign: 'center',
        lineHeight: 1.2,
      }}
    >
      {r.nombre}
    </div>
    <Sello />
  </div>
);

const MontajeDescarte: React.FC<{rechazados: Rechazado[]}> = ({rechazados}) => {
  const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
    timeline
      .from(selector('.chip'), {opacity: 0, scale: 0.3, rotation: -10, duration: 0.35, ease: 'back.out(2.4)', stagger: 0.09})
      .from(selector('.sello'), {opacity: 0, scale: 2, duration: 0.2, ease: 'power2.out', stagger: 0.09}, '<0.1');
  });

  return (
    <div
      ref={scope}
      style={{
        position: 'absolute',
        top: '28%',
        left: '8%',
        right: '8%',
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

// -- Vidriera de pantalla completa: icono real + nombre gigante + dato
// + captura REAL de la herramienta (objectFit cover, "acapara" el
// grueso de la pantalla, no una miniatura metida en una tarjeta).
const VidrieraSlide: React.FC<{v: Vidriera; numero: number}> = ({v, numero}) => {
  const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
    timeline.from(selector('.vidriera-cabecera'), {opacity: 0, y: -24, duration: 0.4, ease: 'back.out(1.8)'});
    if (selector('.vidriera-captura').length) {
      timeline.from(selector('.vidriera-captura'), {opacity: 0, scale: 1.06, duration: 0.5, ease: 'power2.out'}, '<0.05');
    }
  });

  return (
    <AbsoluteFill ref={scope} style={{backgroundColor: BLANCO}}>
      <div className="vidriera-cabecera" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 100, paddingBottom: 20}}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 22,
            background: '#F0F0EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            marginBottom: 18,
          }}
        >
          {v.icono ? (
            <Img src={staticFile(v.icono)} style={{width: '78%', height: '78%', objectFit: 'contain'}} />
          ) : (
            <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 40, color: NEGRO}}>{v.nombre[0]}</div>
          )}
        </div>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 64, color: NEGRO, textAlign: 'center', lineHeight: 1}}>{v.nombre}</div>
        <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 30, color: '#1F8A4C', textAlign: 'center', marginTop: 12}}>{v.dato}</div>
        <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 24, color: '#5B5B58', textAlign: 'center', marginTop: 6, padding: '0 8%'}}>{v.detalle}</div>
      </div>
      {v.captura ? (
        <div className="vidriera-captura" style={{position: 'absolute', left: 0, right: 0, bottom: 0, top: 470, overflow: 'hidden', boxShadow: '0 -8px 30px rgba(0,0,0,0.12)'}}>
          <Img src={staticFile(v.captura)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center'}} />
        </div>
      ) : (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, top: 470, background: '#F0F0EE', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 22, color: '#8A8A86'}}>captura no disponible</div>
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: NEGRO,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 20, color: BLANCO}}>{numero}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Top3Gratis: React.FC<{
  hookLinea1: string;
  hookImpacto: string;
  aclaracion: string;
  introRechazo: string;
  rechazados: Rechazado[];
  transicion: string;
  ganadores: [Vidriera, Vidriera, Vidriera];
  cierre: string;
  cta: string;
  t: Top3GratisTiempos;
}> = ({hookLinea1, hookImpacto, aclaracion, introRechazo, rechazados, transicion, ganadores, cierre, cta, t}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seg = frame / fps;
  const ent = (t0: number, dur: number) =>
    interpolate(seg, [t0, t0 + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const pulso = 0.05 + 0.04 * Math.abs(Math.sin(seg * 1.3));

  // -- hook --
  const opLinea1 = ent(t.hookLinea1, 0.3);
  const opImpacto = ent(t.hookImpacto, 0.35);
  const escalaImpacto = interpolate(seg, [t.hookImpacto, t.hookImpacto + 0.18, t.hookImpacto + 0.35], [0.7, 1.08, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opAclaracion = ent(t.aclaracion, 0.3);
  const opIntroRechazo = ent(t.introRechazo, 0.3);
  const opHookGrupo = interpolate(seg, [t.rechazadosDesde - 0.4, t.rechazadosDesde - 0.05], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const flashImpacto = interpolate(seg, [t.hookImpacto - 0.03, t.hookImpacto + 0.03, t.hookImpacto + 0.22], [0, 0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // -- montaje de descarte + humo --
  const opRechazados = interpolate(
    seg,
    [t.rechazadosDesde - 0.1, t.rechazadosDesde, t.transicion - 0.35, t.transicion - 0.05],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const opHumo = interpolate(
    seg,
    [t.rechazadosDesde, t.rechazadosDesde + 0.5, t.transicion - 0.3, t.transicion],
    [0, 0.55, 0.55, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  // -- transicion --
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

  // -- vidrieras: pantalla completa, una reemplaza a la anterior --
  const tGanadores = [t.ganador1, t.ganador2, t.ganador3];
  const finGanadores = t.cierre;
  const durVidriera = (i: number) => (i < 2 ? tGanadores[i + 1] - tGanadores[i] : finGanadores - tGanadores[i]);

  // -- cierre + cta (vuelve al tema oscuro) --
  const opCierreGrupo = ent(t.cierre, 0.3);
  const opCierre = ent(t.cierre, 0.4);
  const opCta = ent(t.cta, 0.45);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 25%, rgba(255,78,36,${pulso.toFixed(3)}) 0%, rgba(10,10,12,0) 60%)`}} />
          {flashImpacto > 0.01 && (
            <Solid width={ANCHO} height={ALTO} color={ROJO_ALARMA} style={{opacity: flashImpacto}} effects={[glow({intensity: flashImpacto}), chromaticAberration({amount: flashImpacto * 14, angle: 0})]} />
          )}
          {flashTransicion > 0.01 && (
            <Solid width={ANCHO} height={ALTO} color={VERDE_OK} style={{opacity: flashTransicion}} effects={[glow({intensity: flashTransicion * 0.75}), chromaticAberration({amount: flashTransicion * 9, angle: 90})]} />
          )}

          {/* Hook */}
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 7%', textAlign: 'center', opacity: opHookGrupo}}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 40, color: PALETA.texto, opacity: opLinea1}}>{hookLinea1}</div>
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: 800,
                fontSize: 128,
                lineHeight: 0.95,
                color: PALETA.texto,
                opacity: opImpacto,
                marginTop: 18,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                transform: `scale(${escalaImpacto})`,
              }}
            >
              {hookImpacto}
            </div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 32, color: PALETA.texto, opacity: opAclaracion, marginTop: 26}}>{aclaracion}</div>
            <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 26, color: '#B8B8B4', opacity: opIntroRechazo, marginTop: 18}}>{introRechazo}</div>
          </div>

          {/* Montaje de descarte + humo real */}
          {opRechazados > 0.01 && (
            <div style={{position: 'absolute', inset: 0, opacity: opRechazados}}>
              <Humo opacidad={opHumo} />
              <MontajeDescarte rechazados={rechazados} />
            </div>
          )}

          {/* Transicion */}
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%', opacity: opTransicion}}>
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: 800,
                fontSize: 80,
                lineHeight: 1.05,
                color: PALETA.texto,
                textAlign: 'center',
                textTransform: 'uppercase',
                transform: `scale(${escalaTransicion})`,
              }}
            >
              {transicion}
            </div>
          </div>

          {/* Vidrieras: una reemplaza a la otra, pantalla completa */}
          {ganadores.map((g, i) => (
            <Sequence key={g.nombre} from={Math.max(0, Math.round(tGanadores[i] * fps))} durationInFrames={Math.max(1, Math.round(durVidriera(i) * fps))} layout="none">
              <VidrieraSlide v={g} numero={i + 1} />
            </Sequence>
          ))}

      {/* Barra de alerta -- constante en toda la pieza */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: ROJO_ALARMA, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.94, zIndex: 20}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 22, letterSpacing: '0.12em', color: '#0A0A0C'}}>PROBADO DE VERDAD</div>
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

      {/* Cierre + CTA -- vuelve al tema oscuro */}
      {opCierreGrupo > 0.01 && (
        <AbsoluteFill style={{backgroundColor: PALETA.fondo, opacity: opCierreGrupo, zIndex: 10}}>
          <AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, rgba(255,78,36,${pulso.toFixed(3)}) 0%, rgba(10,10,12,0) 60%)`}} />
          <div style={{position: 'absolute', bottom: '8%', left: 0, right: 0, padding: '0 8%', textAlign: 'center'}}>
            <div style={{background: '#1A1113', border: `2px solid ${ROJO_ALARMA}`, borderRadius: 18, padding: '22px 24px', opacity: opCierre}}>
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 28, lineHeight: 1.3, color: PALETA.texto}}>{cierre}</div>
            </div>
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 28, color: PALETA.acento, opacity: opCta, marginTop: 18}}>{cta}</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
