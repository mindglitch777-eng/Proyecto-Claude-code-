import React from 'react';
import {AbsoluteFill, Audio, Sequence, Solid, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {glow} from '@remotion/effects/glow';
import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {PALETA, GROTESCA, SERIF, ANCHO, ALTO} from '../identidad';

// v2 (2026-09-20) -- reescritura completa tras feedback directo del
// operador sobre la v1: "súper aburrida... sin sonido y sin colores
// fuertes... las letras apenas se leen... no cuenta una historia o una
// utilidad". Se ataca cada punto con infraestructura REAL que ya
// existia en el repo sin usar (Postura resolutiva: reusar antes de
// inventar), grounded en la skill real `beat-sync-editing`:
//   1. SONIDO: musica de fondo real (fabrica/musica/biblioteca.json,
//      CC0, $0) -- 'tension-alarmante' (126 BPM, mood tenso/urgente,
//      calza con una noticia de IA con ventana de tiempo limitada) +
//      SFX reales de assets/sfx/ (riser/whoosh/campana/tick, ya
//      sintetizados, sin licencia) en los golpes clave, sincronizados
//      a la grilla de beat (framesPerBeat = (60/126)*fps) en vez de a
//      ojo.
//   2. COLOR: barra de alerta superior + flash de pantalla completa en
//      el golpe del hook + fondo con pulso radial sutil en vez de
//      negro plano estatico.
//   3. LEGIBILIDAD: verificacion y cierre pasan de texto italico
//      flotando sobre negro a tarjetas solidas de alto contraste.
//   4. HISTORIA/UTILIDAD: nuevo bloque "asi lo probas hoy" (3 pasos
//      reales, sin inventar que ya se probo la herramienta) -- el
//      espectador se lleva algo para HACER, no solo para saber.
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function caminoCurvo(x: number, y0: number, y1: number, amplitud: number): string {
  const midY = y0 + (y1 - y0) * 0.5;
  return `M ${x} ${y0} C ${x + amplitud} ${y0 + (y1 - y0) * 0.22}, ${x - amplitud} ${midY - (y1 - y0) * 0.05}, ${x} ${y1}`;
}

const ROJO_ALARMA = '#E53E2E';
const BPM = 126;

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
  utilidadAparece: number;
  utilidadPaso1: number;
  utilidadPaso2: number;
  utilidadPaso3: number;
  cierre: number;
};

export const NoticiaIA: React.FC<{
  alertaEtiqueta: string;
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
  utilidadTitulo: string;
  utilidadPasos: string[];
  cierre: string;
  t: NoticiaIATiempos;
}> = ({
  alertaEtiqueta,
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
  utilidadTitulo,
  utilidadPasos,
  cierre,
  t,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seg = frame / fps;
  const ent = (t0: number, dur: number) =>
    interpolate(seg, [t0, t0 + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // -- fondo con pulso radial sutil, tempado al BPM real de la musica
  // (no decorativo al azar: un pulso por beat, mismo criterio que
  // beat-sync-editing) --
  const framesPorBeat = (60 / BPM) * fps;
  const fasePulso = (frame % framesPorBeat) / framesPorBeat; // 0..1 dentro de cada beat
  const pulso = 0.05 + 0.05 * (1 - fasePulso); // decae dentro del beat, salta al siguiente

  // -- hook --
  const opIntro = ent(t.hookIntro, 0.3);
  const escalaIntro = interpolate(seg, [t.hookIntro, t.hookIntro + 0.3], [0.9, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opMedio = ent(t.hookMedio, 0.28);
  const escalaMedio = interpolate(seg, [t.hookMedio, t.hookMedio + 0.28], [0.85, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opImpacto = ent(t.hookImpacto, 0.3);
  const escalaImpacto = interpolate(seg, [t.hookImpacto, t.hookImpacto + 0.15, t.hookImpacto + 0.3], [0.7, 1.06, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opAclaracion = ent(t.aclaracion, 0.4);
  const opHookContainer = interpolate(seg, [t.hechosAparece - 0.5, t.hechosAparece], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Flash de pantalla completa + shake, pegado al golpe del hook (el
  // "punch" real, no un fade mas) -- mismo criterio de "cobertura
  // visual" que GOLPES_FUERTES en FabricaVideo.tsx.
  const flashImpacto = interpolate(seg, [t.hookImpacto - 0.03, t.hookImpacto + 0.03, t.hookImpacto + 0.22], [0, 0.85, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shakeImpacto = interpolate(seg, [t.hookImpacto, t.hookImpacto + 0.09, t.hookImpacto + 0.18], [0, -6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Golpe secundario en el aterrizaje del count-up (la revelacion real
  // de la cifra) -- mismo lenguaje visual, flash mas corto y en verde.
  const tAterrizaje = t.resultadoCountDesde + t.resultadoCountDuracion;
  const flashAterrizaje = interpolate(seg, [tAterrizaje - 0.02, tAterrizaje + 0.02, tAterrizaje + 0.16], [0, 0.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // -- linea curva: hook -> tarjetas (region fija, las 3 fases de
  // abajo se funden entre si en el mismo lugar en vez de agregar mas
  // curva) --
  const yLineaInicio = 0.14 * ALTO;
  const yLineaTarjetas = 0.44 * ALTO;
  const camino1 = caminoCurvo(ANCHO / 2, yLineaInicio, yLineaTarjetas, -130);
  const progreso1 = clamp01((seg - t.hechosAparece + 0.3) / 0.7);

  const yLineaFin = 0.62 * ALTO;
  const camino2 = caminoCurvo(ANCHO / 2, yLineaTarjetas, yLineaFin, 90);
  const progreso2 = clamp01((seg - t.lineaSigue) / 0.6);

  // -- fase 1 (hechos + climax de la cifra) --
  const opHechosGrupo = interpolate(
    seg,
    [t.hechosAparece - 0.2, t.hechosAparece, t.utilidadAparece - 0.4, t.utilidadAparece],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const numeroContado = Math.round(
    interpolate(seg, [t.resultadoCountDesde, t.resultadoCountDesde + t.resultadoCountDuracion], [0, resultadoNumero], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const opResultado = ent(t.resultadoCountDesde, 0.25);
  const opDetalle = ent(t.resultadoDetalle, 0.3);
  const opVerificacion = ent(t.verificacion, 0.3);

  // -- fase 2 (utilidad: 3 pasos reales) --
  const opUtilidadGrupo = interpolate(
    seg,
    [t.utilidadAparece - 0.3, t.utilidadAparece, t.cierre - 0.4, t.cierre],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const tPasos = [t.utilidadPaso1, t.utilidadPaso2, t.utilidadPaso3];

  // -- fase 3 (cierre honesto, se sostiene hasta el final) --
  const opCierreGrupo = ent(t.cierre, 0.35);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {/* Fondo con pulso radial tempado al beat -- reemplaza el negro
          plano estatico, sin competir con el texto. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 30%, rgba(255,78,36,${pulso.toFixed(3)}) 0%, rgba(10,10,12,0) 62%)`,
        }}
      />
      {/* Flashes de golpe -- hook y aterrizaje de la cifra */}
      {/* Flashes con @remotion/effects real (glow + aberracion cromatica
          via WebGL2, confirmado funcionando headless en Ronda 6 --
          pruebas-r6/PruebaEfectos.tsx) en vez de un opacity plano CSS.
          Mismo lenguaje de golpe, ahora con impacto cinematografico real,
          no solo un tinte de color. */}
      {flashImpacto > 0.01 && (
        <Solid
          width={ANCHO}
          height={ALTO}
          color={ROJO_ALARMA}
          style={{opacity: flashImpacto}}
          effects={[glow({intensity: flashImpacto}), chromaticAberration({amount: flashImpacto * 14, angle: 0})]}
        />
      )}
      {flashAterrizaje > 0.01 && (
        <Solid
          width={ANCHO}
          height={ALTO}
          color="#3DDC6E"
          style={{opacity: flashAterrizaje}}
          effects={[glow({intensity: flashAterrizaje * 0.7}), chromaticAberration({amount: flashAterrizaje * 8, angle: 90})]}
        />
      )}

      {/* Barra de alerta -- senal de genero inmediata, color fuerte
          desde el frame 0 (antes el arranque era negro liso). */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: ROJO_ALARMA,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.92,
        }}
      >
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 24, letterSpacing: '0.12em', color: '#0A0A0C'}}>
          {alertaEtiqueta}
        </div>
      </div>

      {/* SFX: riser entrando al golpe, whoosh en el golpe, campana en
          el aterrizaje de la cifra, tick en cada paso de utilidad --
          cada uno en su propio Sequence para que arranque en SU frame,
          no en el frame 0 con el inicio recortado (asi es como
          golpes.tsx ya monta el Audio real de cada golpe). */}
      <Sequence from={Math.max(0, Math.round((t.hookImpacto - 0.6) * fps))} durationInFrames={Math.round(1.6 * fps)}>
        <Audio src={staticFile('sfx/riser.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={Math.max(0, Math.round(t.hookImpacto * fps))} durationInFrames={Math.round(0.55 * fps)}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={Math.max(0, Math.round(tAterrizaje * fps))} durationInFrames={Math.round(1.26 * fps)}>
        <Audio src={staticFile('sfx/campana.wav')} volume={0.55} />
      </Sequence>
      {tPasos.map((tp, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(tp * fps))} durationInFrames={Math.round(0.08 * fps) + 1}>
          <Audio src={staticFile('sfx/tick.wav')} volume={0.4} />
        </Sequence>
      ))}

      {/* Sin z-index explicito a proposito: tiene que quedar DETRAS de
          las tarjetas de hechos/utilidad/cierre (orden natural del DOM,
          pintadas despues) -- con z-index:5 la linea se dibujaba ENCIMA
          del texto en las fases de utilidad/cierre, exactamente el tipo
          de problema de legibilidad que el operador señalo. */}
      <svg width="100%" height="100%" viewBox={`0 0 ${ANCHO} ${ALTO}`} style={{position: 'absolute', inset: 0}}>
        <path d={camino1} fill="none" stroke={PALETA.acento} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progreso1} />
        <path d={camino2} fill="none" stroke={PALETA.acento} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progreso2} />
      </svg>

      {/* Hook -- 3 escalones con pop kinetico (scale+opacity, no solo
          fade) + golpe de flash/shake en el impacto. */}
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
          transform: `translateY(${shakeImpacto}px)`,
        }}
      >
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 38, color: PALETA.texto, opacity: opIntro, transform: `scale(${escalaIntro})`}}>
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
            transform: `scale(${escalaMedio})`,
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
            color: ROJO_ALARMA,
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

      {/* FASE 1: hechos + climax de la cifra */}
      <div style={{position: 'absolute', inset: 0, opacity: opHechosGrupo}}>
        <div
          style={{
            position: 'absolute',
            top: `${(yLineaTarjetas / ALTO) * 100}%`,
            left: '10%',
            right: '10%',
            transform: 'translateY(-50%)',
          }}
        >
          <div style={{background: '#111114', border: '1px solid #2A2A2E', borderRadius: 20, padding: '24px 26px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)'}}>
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 16, color: ROJO_ALARMA, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12}}>
              {hechosTitulo}
            </div>
            {hechosLineas.map((l, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: i === 0 ? 0 : 9}}>
                <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 19, color: ROJO_ALARMA, lineHeight: 1.4}}>→</div>
                <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 23, lineHeight: 1.35, color: '#EFEFEA'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{position: 'absolute', bottom: '18%', left: 0, right: 0, padding: '0 8%', textAlign: 'center'}}>
          <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 84, color: PALETA.texto, opacity: opResultado, fontVariantNumeric: 'tabular-nums'}}>
            {resultadoPrefijo ?? ''}
            {numeroContado.toLocaleString('es-AR')}
          </div>
          <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 24, color: PALETA.texto, opacity: opDetalle, marginTop: 4}}>
            {resultadoDetalle}
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 14,
              padding: '8px 18px',
              borderRadius: 10,
              background: 'rgba(61,220,110,0.14)',
              border: '1px solid rgba(61,220,110,0.4)',
              opacity: opVerificacion,
            }}
          >
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 19, color: '#8FE3A6'}}>{verificacion}</div>
          </div>
        </div>
      </div>

      {/* FASE 2: utilidad real -- 3 pasos, con pop y tick por paso */}
      <div style={{position: 'absolute', inset: 0, opacity: opUtilidadGrupo}}>
        <div style={{position: 'absolute', top: '38%', left: '8%', right: '8%', transform: 'translateY(-50%)'}}>
          <div
            style={{
              fontFamily: GROTESCA,
              fontWeight: 800,
              fontSize: 34,
              color: PALETA.acento,
              textAlign: 'center',
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            {utilidadTitulo}
          </div>
          {utilidadPasos.map((p, i) => {
            const opPaso = interpolate(seg, [tPasos[i], tPasos[i] + 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const escalaPaso = interpolate(seg, [tPasos[i], tPasos[i] + 0.25], [0.85, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  marginTop: i === 0 ? 0 : 22,
                  opacity: opPaso,
                  transform: `scale(${escalaPaso})`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: PALETA.acento,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 26, color: '#0A0A0C'}}>{i + 1}</div>
                </div>
                <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 27, lineHeight: 1.25, color: PALETA.texto}}>{p}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FASE 3: cierre honesto -- tarjeta solida, no italico flotando */}
      <div style={{position: 'absolute', inset: 0, opacity: opCierreGrupo, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 9%'}}>
        <div
          style={{
            background: '#1A1113',
            border: `2px solid ${ROJO_ALARMA}`,
            borderRadius: 20,
            padding: '30px 28px',
          }}
        >
          <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 28, lineHeight: 1.35, color: PALETA.texto, textAlign: 'center'}}>
            {cierre}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
