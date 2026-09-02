import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Figura, NombreFigura} from '../dibujo/figuras';
import {GROTESCA, PALETA, SERIF} from '../identidad';

// ─────────────────────────────────────────── 1. PASOS
// Uno, dos, tres. Numerado, con su dibujito. Lo mas simple que hay y de
// lo que mas se guarda: la gente guarda lo que puede repetir.

export const Pasos: React.FC<{
  titulo?: string;
  pasos: {fig: NombreFigura; txt: string}[];
}> = ({titulo, pasos}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const paso = (dur * 0.72) / Math.max(1, pasos.length);

  return (
    <AbsoluteFill
      style={{backgroundColor: PALETA.fondo, padding: '0 7%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}
    >
      {titulo ? (
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: PALETA.texto, marginBottom: 56}}>{titulo}</div>
      ) : null}
      <div style={{display: 'flex', flexDirection: 'column', gap: 46}}>
        {pasos.map((p, i) => {
          const t0 = 0.35 + i * paso;
          if (t < t0) return null;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 16, stiffness: 195, mass: 0.55}});
          const trazo = Math.max(0, Math.min(1, (t - t0) / 0.5));
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 34,
                opacity: Math.min(1, s * 2),
                transform: `translateX(${interpolate(s, [0, 1], [-36, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: GROTESCA,
                  fontWeight: 800,
                  fontStretch: '82%',
                  fontSize: 92,
                  lineHeight: 1,
                  color: PALETA.acento,
                  minWidth: 76,
                }}
              >
                {i + 1}
              </div>
              <Figura nombre={p.fig} p={trazo} col={PALETA.texto} tam={104} grosor={4.6} />
              <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 52, lineHeight: 1.15, color: PALETA.texto, flex: 1}}>
                {p.txt}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────── 2. LISTA TACHADA
// Todo lo que probaste y no funciono, tachandose de a uno, y lo ultimo
// queda en pie. Genera alivio: "no era vos, era el metodo".

export const ListaTachada: React.FC<{
  titulo?: string;
  items: string[];
  queda: string;
}> = ({titulo, items, queda}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const paso = (dur * 0.6) / Math.max(1, items.length);

  return (
    <AbsoluteFill
      style={{backgroundColor: PALETA.fondo, padding: '0 7%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}
    >
      {titulo ? (
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 62, color: PALETA.texto, marginBottom: 50}}>{titulo}</div>
      ) : null}
      {items.map((it, i) => {
        const tEntra = 0.2 + i * paso * 0.55;
        const tTacha = tEntra + paso * 0.55;
        if (t < tEntra) return null;
        const s = spring({frame: frame - tEntra * fps, fps, config: {damping: 18, stiffness: 200}});
        const p = Math.max(0, Math.min(1, (t - tTacha) / 0.28));
        return (
          <div key={i} style={{position: 'relative', marginBottom: 30, opacity: Math.min(1, s * 2) * (1 - p * 0.55)}}>
            <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 60, color: PALETA.texto}}>{it}</div>
            <svg width="100%" height={10} style={{position: 'absolute', left: 0, top: '52%'}} preserveAspectRatio="none">
              <line
                x1={0} y1={5} x2="100%" y2={5}
                stroke={PALETA.acento}
                strokeWidth={7}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - p}
              />
            </svg>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 40,
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontStretch: '82%',
          fontSize: 88,
          lineHeight: 1.05,
          letterSpacing: '-0.035em',
          textTransform: 'uppercase',
          color: PALETA.acento,
          opacity: interpolate(t, [dur * 0.68, dur * 0.78], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          transform: `scale(${interpolate(t, [dur * 0.68, dur * 0.78], [0.86, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`,
          transformOrigin: 'left center',
        }}
      >
        {queda}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────── 3. BALANZA
// Dos platos que se inclinan. Sirve para "esto pesa mas que aquello"
// sin poner un solo numero.

export const Balanza: React.FC<{
  titulo?: string;
  izq: {txt: string; peso: number};
  der: {txt: string; peso: number};
  pie?: string;
}> = ({titulo, izq, der, pie}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const total = izq.peso + der.peso || 1;
  // se inclina hacia el que pesa mas
  const objetivo = ((der.peso - izq.peso) / total) * 16;
  const s = spring({frame: frame - 1.0 * fps, fps, config: {damping: 12, stiffness: 60, mass: 1.5}});
  const ang = objetivo * s;
  const rad = (ang * Math.PI) / 180;
  const brazo = 300;               // medio largo de la barra, en px
  const cx = 540;                  // centro horizontal del cuadro
  const cy = 980;                  // altura del eje
  const punta = (lado: -1 | 1) => ({
    x: cx + lado * brazo * Math.cos(rad),
    y: cy + lado * brazo * Math.sin(rad),
  });

  const Plato = ({d, lado, gana}: {d: {txt: string; peso: number}; lado: -1 | 1; gana: boolean}) => {
    const {x, y} = punta(lado);
    return (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-50%, 0)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* la cuerda */}
        <div style={{width: 4, height: 90, background: PALETA.texto, opacity: 0.45}} />
        {/* el plato */}
        <div
          style={{
            width: 300,
            height: 12,
            borderRadius: 6,
            background: gana ? PALETA.acento : PALETA.texto,
            opacity: gana ? 1 : 0.7,
          }}
        />
        <div
          style={{
            marginTop: 22,
            fontFamily: GROTESCA,
            fontWeight: 700,
            fontSize: 48,
            lineHeight: 1.14,
            textAlign: 'center',
            maxWidth: 360,
            color: gana ? PALETA.acento : PALETA.texto,
            opacity: gana ? 1 : 0.6,
          }}
        >
          {d.txt}
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {titulo ? (
        <div style={{position: 'absolute', top: '13%', left: '7%', right: '7%', fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: PALETA.texto}}>
          {titulo}
        </div>
      ) : null}

      {/* el pie y el eje */}
      <div style={{position: 'absolute', left: cx, top: cy, width: 10, height: 260, background: PALETA.texto, opacity: 0.5, transform: 'translateX(-50%)'}} />
      <div style={{position: 'absolute', left: cx, top: cy + 260, width: 240, height: 12, borderRadius: 6, background: PALETA.texto, opacity: 0.5, transform: 'translateX(-50%)'}} />

      {/* la barra que se inclina */}
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          width: brazo * 2,
          height: 12,
          borderRadius: 6,
          background: PALETA.texto,
          transform: `translate(-50%, -50%) rotate(${ang}deg)`,
        }}
      />

      <Plato d={izq} lado={-1} gana={izq.peso > der.peso} />
      <Plato d={der} lado={1} gana={der.peso > izq.peso} />

      {pie ? (
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '7%',
            right: '7%',
            textAlign: 'center',
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontStretch: '84%',
            fontSize: 66,
            textTransform: 'uppercase',
            color: PALETA.acento,
            opacity: interpolate(t, [dur - 2.2, dur - 1.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {pie}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────── 4. LINEA DE TIEMPO
// Se dibuja de arriba hacia abajo y van cayendo los hitos. Es el
// formato de los documentales: "y entonces paso esto, y esto".

export const Cronologia: React.FC<{
  titulo?: string;
  hitos: {cuando: string; que: string; acento?: boolean}[];
}> = ({titulo, hitos}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const paso = (dur * 0.72) / Math.max(1, hitos.length);
  const linea = Math.max(0, Math.min(1, (t - 0.2) / (dur * 0.72)));

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, padding: '14% 7% 16% 7%'}}>
      {titulo ? (
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: PALETA.texto, marginBottom: 44}}>{titulo}</div>
      ) : null}
      <div style={{position: 'relative', flex: 1}}>
        <div
          style={{
            position: 'absolute',
            left: 26,
            top: 0,
            width: 5,
            height: `${linea * 100}%`,
            background: PALETA.texto,
            opacity: 0.5,
          }}
        />
        {hitos.map((h, i) => {
          const t0 = 0.4 + i * paso;
          if (t < t0) return null;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 16, stiffness: 200, mass: 0.55}});
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                paddingLeft: 92,
                marginBottom: 44,
                opacity: Math.min(1, s * 2),
                transform: `translateX(${interpolate(s, [0, 1], [-26, 0])}px)`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 16,
                  top: 14,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: h.acento ? PALETA.acento : PALETA.texto,
                  transform: `scale(${interpolate(s, [0, 1], [0, 1])})`,
                }}
              />
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 34, letterSpacing: '0.08em', color: h.acento ? PALETA.acento : PALETA.texto, opacity: h.acento ? 1 : 0.55, marginBottom: 6}}>
                {h.cuando}
              </div>
              <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 52, lineHeight: 1.15, color: PALETA.texto}}>
                {h.que}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────── 5. ANTES / DESPUES
// Una cortina que cruza la pantalla y cambia el mundo. Es el formato
// que mas se comparte porque el cambio se VE, no se cuenta.

export const AntesDespues: React.FC<{
  antes: {rotulo: string; txt: string};
  despues: {rotulo: string; txt: string};
  /** Ronda 4: en que segundo (relativo al inicio de la escena) debe
   * ocurrir el cambio de cara -- pensado para recibir el offset REAL
   * del audio que empieza a hablar del "despues" (ver
   * fabrica/directores/edicion/microeventos.ts, microevento
   * 'se_revela_comparacion'), no una fraccion arbitraria de la
   * duracion total. Sin este prop, se comporta EXACTAMENTE igual que
   * antes (52% de la duracion total, ventana de 20%) -- hallazgo real
   * documentado en MEJORAS_RONDA4.md: sin este anclaje, hubo un
   * desfasaje medido de ~1.6s entre lo que la voz ya decia y lo que la
   * pantalla todavia mostraba en fabrica-demo-04. */
  momentoCambioSeg?: number;
  anchoCambioSeg?: number;
}> = ({antes, despues, momentoCambioSeg, anchoCambioSeg}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const anchoCambio = anchoCambioSeg ?? dur * 0.2;
  const centroCambio = momentoCambioSeg ?? dur * 0.52;
  const inicioCambio = Math.max(0, centroCambio - anchoCambio / 2);
  const finCambio = Math.min(dur, centroCambio + anchoCambio / 2);
  const corte = interpolate(t, [inicioCambio, finCambio], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });

  const Cara = ({d, acento}: {d: {rotulo: string; txt: string}; acento?: boolean}) => (
    <AbsoluteFill
      style={{
        background: acento ? PALETA.acento : PALETA.fondo,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 8%',
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 700,
          fontSize: 42,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: acento ? PALETA.fondo : PALETA.texto,
          opacity: 0.65,
        }}
      >
        {d.rotulo}
      </div>
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontStretch: '82%',
          fontSize: 104,
          lineHeight: 1.02,
          letterSpacing: '-0.04em',
          textTransform: 'uppercase',
          color: acento ? PALETA.fondo : PALETA.texto,
        }}
      >
        {d.txt}
      </div>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <Cara d={antes} />
      <AbsoluteFill style={{clipPath: `inset(0 0 ${100 - corte}% 0)`}}>
        <Cara d={despues} acento />
      </AbsoluteFill>
      {corte > 0 && corte < 100 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: `${corte}%`, height: 6, background: PALETA.texto}} />
      ) : null}
    </AbsoluteFill>
  );
};
