import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {GROTESCA, PALETA, SERIF} from '../identidad';

// Piezas para el stress test. La regla del guion es "entrada seca, sin
// animacion suave" para los golpes de texto -- eso es lo opuesto a
// spring(): un texto que aparece en 1-2 cuadros, sin curva.

export const apareceDuro = (t: number, t0: number) => (t >= t0 ? 1 : 0);

export const TextoDuro: React.FC<{
  txt: string;
  tam?: number;
  serif?: boolean;
  acento?: boolean;
  align?: 'center' | 'left';
}> = ({txt, tam = 130, serif, acento, align = 'center'}) => (
  <div
    style={{
      fontFamily: serif ? SERIF : GROTESCA,
      fontWeight: serif ? 800 : 800,
      fontStretch: serif ? undefined : '78%',
      fontSize: tam,
      lineHeight: 0.98,
      letterSpacing: '-0.045em',
      textTransform: serif ? 'none' : 'uppercase',
      color: acento ? PALETA.acento : PALETA.texto,
      textAlign: align,
    }}
  >
    {txt}
  </div>
);

// ─────────────────────── CADENA DE PALABRAS
// Palabra -> flecha que CRECE -> palabra. Nada de flecha generica de
// PowerPoint: es una linea que se dibuja con su punta, igual criterio
// que Diagrama.tsx pero sin dibujos, solo texto.

export const CadenaTexto: React.FC<{
  items: string[];
  entra: number[]; // segundos locales en que aparece cada item
  vertical?: boolean;
  tam?: number;
  activo?: number; // indice iluminado; los demas se atenuan
}> = ({items, entra, vertical, tam = 62, activo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: vertical ? 8 : 22,
      }}
    >
      {items.map((it, i) => {
        const t0 = entra[i] ?? 0;
        if (t < t0) return null;
        const atenuado = activo !== undefined && activo !== i;
        return (
          <React.Fragment key={i}>
            {i > 0 ? (
              <Flecha vertical={!!vertical} p={Math.min(1, (t - (entra[i - 1] ?? 0)) / 0.35)} />
            ) : null}
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: 800,
                fontStretch: '82%',
                fontSize: tam,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: atenuado ? PALETA.texto : PALETA.acento,
                opacity: atenuado ? 0.32 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {it}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Flecha: React.FC<{vertical: boolean; p: number}> = ({vertical, p}) => {
  const largo = vertical ? 46 : 64;
  return (
    <svg width={vertical ? 24 : largo + 20} height={vertical ? largo + 20 : 24} style={{overflow: 'visible'}}>
      <path
        d={vertical ? `M12 4 L12 ${largo}` : `M4 12 L${largo} 12`}
        stroke={PALETA.texto}
        strokeWidth={5}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.max(0, Math.min(1, p))}
        opacity={0.75}
      />
      <path
        d={
          vertical
            ? `M4 ${largo - 10} L12 ${largo} L20 ${largo - 10}`
            : `M${largo - 10} 4 L${largo} 12 L${largo - 10} 20`
        }
        stroke={PALETA.texto}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={interpolate(p, [0.75, 1], [0, 0.75], {extrapolateLeft: 'clamp'})}
      />
    </svg>
  );
};

// ─────────────────────── VENTANA DE APP (mockup generico)
// En vez de logos reales: una ventanita con un rotulo. Monocromo, dos
// colores nomas, para no romper la paleta que pide el guion.

export const VentanaApp: React.FC<{rotulo: string; x: number; y: number; girar?: number; escala?: number}> = ({
  rotulo,
  x,
  y,
  girar = 0,
  escala = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(-50%,-50%) rotate(${girar}deg) scale(${escala})`,
      border: `4px solid ${PALETA.texto}`,
      borderRadius: 14,
      background: '#141418',
      boxShadow: '0 0 60px rgba(0,0,0,0.7)',
      width: 300,
      overflow: 'hidden',
    }}
  >
    <div style={{display: 'flex', gap: 10, padding: '14px 18px', borderBottom: `2px solid ${PALETA.texto}55`}}>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{width: 13, height: 13, borderRadius: 7, background: `${PALETA.texto}88`}} />
      ))}
    </div>
    <div
      style={{
        padding: '34px 18px',
        fontFamily: GROTESCA,
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: '0.06em',
        color: PALETA.texto,
        textAlign: 'center',
      }}
    >
      {rotulo}
    </div>
  </div>
);

// ─────────────────────── PANEL FALSO (dashboard de ventas)

export const PanelFalso: React.FC<{visitas: number; ventas: number}> = ({visitas, ventas}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 14, stiffness: 220, mass: 0.4}});
  return (
    <AbsoluteFill
      style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 9%', gap: 48}}
    >
      <div style={{opacity: Math.min(1, s * 2.5)}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 40, color: PALETA.texto, opacity: 0.6, letterSpacing: '0.1em'}}>
          VISITAS
        </div>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '80%', fontSize: 110, color: PALETA.texto, fontVariantNumeric: 'tabular-nums'}}>
          {visitas.toLocaleString('es-AR')}
        </div>
      </div>
      <div style={{opacity: Math.min(1, apareceDuro(frame / fps, 0.5))}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 40, color: PALETA.texto, opacity: 0.6, letterSpacing: '0.1em'}}>
          VENTAS
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontStretch: '76%',
            fontSize: 260,
            lineHeight: 1,
            color: PALETA.acento,
            transform: `scale(${1 + 0.06 * Math.max(0, spring({frame: frame - 0.5 * fps, fps, config: {damping: 10, stiffness: 260}}))})`,
          }}
        >
          {ventas}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────── TARJETAS QUE COLAPSAN

export const CartasColapsan: React.FC<{cartas: string[]; queda: string}> = ({cartas, queda}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const tColapsa = dur * 0.58;
  const paso = tColapsa / cartas.length;

  return (
    <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {cartas.map((c, i) => {
        const t0 = i * paso;
        if (t < t0) return null;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 13, stiffness: 240, mass: 0.4}});
        const esQueda = c === queda;
        const seFue = t >= tColapsa && !esQueda;
        const angulo = (i / cartas.length) * 300 - 150;
        const radio = 260;
        if (seFue) return null;
        const x = esQueda && t >= tColapsa ? 0 : Math.cos((angulo * Math.PI) / 180) * radio * Math.min(1, s);
        const y = esQueda && t >= tColapsa ? 0 : Math.sin((angulo * Math.PI) / 180) * radio * 0.5 * Math.min(1, s);
        const golpe = esQueda ? spring({frame: frame - tColapsa * fps, fps, config: {damping: 11, stiffness: 260, mass: 0.4}}) : 0;
        return (
          <div
            key={c}
            style={{
              position: 'absolute',
              transform: `translate(${x}px, ${y}px) scale(${esQueda && t >= tColapsa ? 1 + 0.25 * Math.max(0, 1 - golpe) : Math.min(1, s)})`,
              background: esQueda && t >= tColapsa ? PALETA.acento : 'transparent',
              border: `3px solid ${esQueda && t >= tColapsa ? PALETA.acento : PALETA.texto + '77'}`,
              borderRadius: 14,
              padding: esQueda && t >= tColapsa ? '30px 54px' : '18px 28px',
              opacity: Math.min(1, s * 2),
            }}
          >
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: 800,
                fontStretch: '80%',
                fontSize: esQueda && t >= tColapsa ? 78 : 34,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: esQueda && t >= tColapsa ? PALETA.fondo : PALETA.texto,
                whiteSpace: 'nowrap',
              }}
            >
              {c}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ─────────────────────── NUMERO GIGANTE + ETIQUETAS QUE ESCALAN
// El "100" se queda quieto (quietud) mientras etiquetas chicas
// aparecen y desaparecen rapido alrededor (rafaga). No hay que
// enumerar 100 cosas -- unas pocas alcanzan para transmitir escala.

export const NumeroConEscala: React.FC<{numero: string; etiquetas: string[]}> = ({numero, etiquetas}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 210, mass: 0.5}});

  return (
    <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontStretch: '74%',
          fontSize: 340,
          lineHeight: 1,
          color: PALETA.acento,
          transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})`,
        }}
      >
        {numero}
      </div>
      {etiquetas.map((e, i) => {
        // cada etiqueta tiene su propia ventana de aparicion, corta
        const ciclo = 0.55;
        const t0 = 0.5 + i * 0.34;
        const t = frame / fps;
        const local = t - t0;
        if (local < 0 || local > ciclo) return null;
        const p = local / ciclo;
        const alpha = p < 0.25 ? p / 0.25 : p > 0.75 ? (1 - p) / 0.25 : 1;
        const ang = random(`a${i}`) * 360;
        const rad = 210 + random(`r${i}`) * 190;
        const x = 50 + (Math.cos((ang * Math.PI) / 180) * rad) / 10.8;
        const y = 50 + (Math.sin((ang * Math.PI) / 180) * rad) / 10.8;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%,-50%)',
              fontFamily: GROTESCA,
              fontWeight: 700,
              fontSize: 34,
              color: PALETA.texto,
              opacity: alpha * 0.85,
              whiteSpace: 'nowrap',
            }}
          >
            {e}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
