import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {GROTESCA, PALETA, SERIF} from '../identidad';

const plata = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

// ─────────────────────────────────────────── 1. CONTADOR
// Un numero que sube solo. Es de lo mas viejo que hay y sigue
// funcionando: el ojo NO se despega de un numero que se mueve.
//
// Regla de la casa: el numero arranca en 0 y llega al real. Nunca
// muestra una cifra intermedia como si fuera el dato -- se lee como
// contador, no como afirmacion.

export const Contador: React.FC<{
  arriba?: string;
  hasta: number;
  abajo?: string;
  prefijo?: string;
  sufijo?: string;
  desde?: number;
}> = ({arriba, hasta, abajo, prefijo = '$', sufijo, desde = 0}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  // sube rapido y frena: asi el final se siente como aterrizaje
  const p = interpolate(t, [0.35, dur * 0.62], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const valor = desde + (hasta - desde) * p;
  const golpe = spring({frame: frame - dur * 0.62 * fps, fps, config: {damping: 12, stiffness: 200, mass: 0.5}});

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETA.fondo,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 6%',
        gap: 14,
      }}
    >
      {arriba ? (
        <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 52, color: PALETA.texto, opacity: 0.75, textAlign: 'center'}}>
          {arriba}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontStretch: '80%',
          fontSize: 210,
          lineHeight: 1,
          letterSpacing: '-0.05em',
          color: PALETA.acento,
          transform: `scale(${1 + 0.06 * golpe})`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {prefijo}
        {Math.round(valor).toLocaleString('es-AR')}
        {sufijo}
      </div>
      {abajo ? (
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 500,
            fontSize: 46,
            color: PALETA.texto,
            opacity: interpolate(t, [dur * 0.66, dur * 0.78], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            textAlign: 'center',
          }}
        >
          {abajo}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────── 2. RECIBO
// La cuenta que va sumando y al final RESTA. El renglon en rojo que se
// lleva todo es el golpe: cada uno mira su propio bolsillo.

export const Recibo: React.FC<{
  titulo: string;
  entra: {txt: string; monto: number; t: number}[];
  sale: {txt: string; monto: number; t: number}[];
  total: {txt: string; t: number};
}> = ({titulo, entra, sale, total}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const suma = entra.reduce((a, x) => a + x.monto, 0) - sale.reduce((a, x) => a + x.monto, 0);
  const ent = (t0: number) => spring({frame: frame - t0 * fps, fps, config: {damping: 18, stiffness: 200, mass: 0.6}});

  const Renglon = ({x, signo}: {x: {txt: string; monto: number; t: number}; signo: 1 | -1}) => {
    if (t < x.t) return null;
    const s = ent(x.t);
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 22,
          marginBottom: 24,
          opacity: Math.min(1, s * 2),
          transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
        }}
      >
        <span style={{fontFamily: GROTESCA, fontWeight: 400, fontSize: 50, color: PALETA.texto, opacity: 0.82}}>
          {x.txt}
        </span>
        <span
          style={{
            fontFamily: GROTESCA,
            fontWeight: 700,
            fontSize: 62,
            whiteSpace: 'nowrap',
            color: signo < 0 ? PALETA.acento : PALETA.texto,
          }}
        >
          {signo < 0 ? '−' : ''}
          {plata(x.monto)}
        </span>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETA.fondo,
        padding: '0 7%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: PALETA.texto, marginBottom: 50, opacity: 0.9}}>
        {titulo}
      </div>
      {entra.map((x, i) => <Renglon key={'e' + i} x={x} signo={1} />)}
      {sale.map((x, i) => <Renglon key={'s' + i} x={x} signo={-1} />)}
      <div
        style={{
          height: 4,
          background: PALETA.texto,
          opacity: 0.3,
          margin: '18px 0 30px',
          transform: `scaleX(${ent(total.t).toFixed(3)})`,
          transformOrigin: 'left',
        }}
      />
      {t >= total.t ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 22,
            opacity: Math.min(1, ent(total.t) * 2),
          }}
        >
          <span style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 58, color: PALETA.texto}}>{total.txt}</span>
          <span
            style={{
              fontFamily: GROTESCA,
              fontWeight: 800,
              fontStretch: '82%',
              fontSize: 130,
              letterSpacing: '-0.04em',
              whiteSpace: 'nowrap',
              color: suma <= 0 ? PALETA.acento : PALETA.texto,
              transform: `scale(${interpolate(ent(total.t), [0, 1], [0.8, 1])})`,
              display: 'inline-block',
            }}
          >
            {suma < 0 ? '−' : ''}
            {plata(Math.abs(suma))}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────── 3. DUELO
// Pantalla partida al medio. Dos caminos, dos numeros. El de abajo gana
// y el de arriba se apaga. Es comparacion sin explicar nada.

export const Duelo: React.FC<{
  izq: {rotulo: string; valor: string; detalle?: string};
  der: {rotulo: string; valor: string; detalle?: string};
  ganador?: 'izq' | 'der';
  remate?: string;
}> = ({izq, der, ganador = 'der', remate}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const tGana = dur * 0.55;

  const Lado = ({d, lado}: {d: typeof izq; lado: 'izq' | 'der'}) => {
    const s = spring({frame: frame - (lado === 'izq' ? 0.2 : 0.5) * fps, fps, config: {damping: 18, stiffness: 190}});
    const gana = t >= tGana && ganador === lado;
    const pierde = t >= tGana && ganador !== lado;
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          background: gana ? `${PALETA.acento}14` : 'transparent',
          opacity: Math.min(1, s * 2) * (pierde ? 0.32 : 1),
          transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
          transition: 'none',
        }}
      >
        <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 44, letterSpacing: '0.06em', textTransform: 'uppercase', color: PALETA.texto, opacity: 0.6}}>
          {d.rotulo}
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontStretch: '80%',
            fontSize: 132,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: gana ? PALETA.acento : PALETA.texto,
            textAlign: 'center',
          }}
        >
          {d.valor}
        </div>
        {d.detalle ? (
          <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 40, color: PALETA.texto, opacity: 0.7, textAlign: 'center', maxWidth: '80%'}}>
            {d.detalle}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column'}}>
      <Lado d={izq} lado="izq" />
      <div style={{height: 4, background: PALETA.texto, opacity: 0.22}} />
      <Lado d={der} lado="der" />
      {remate ? (
        <div
          style={{
            position: 'absolute',
            bottom: '13%',
            left: '6%',
            right: '6%',
            textAlign: 'center',
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontStretch: '84%',
            fontSize: 62,
            textTransform: 'uppercase',
            color: PALETA.acento,
            opacity: interpolate(t, [tGana + 0.4, tGana + 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {remate}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────── 4. BARRAS QUE CORREN
// Ranking que se ordena solo. Sirve para paises, rubros, precios.

export const Ranking: React.FC<{
  titulo?: string;
  filas: {txt: string; valor: number; acento?: boolean}[];
  unidad?: string;
}> = ({titulo, filas, unidad = ''}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const max = Math.max(...filas.map((f) => f.valor));

  return (
    <AbsoluteFill
      style={{backgroundColor: PALETA.fondo, padding: '0 7%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}
    >
      {titulo ? (
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 62, color: PALETA.texto, marginBottom: 54}}>{titulo}</div>
      ) : null}
      <div style={{display: 'flex', flexDirection: 'column', gap: 40}}>
        {filas.map((f, i) => {
          const t0 = 0.3 + i * 0.42;
          if (t < t0) return null;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 200, stiffness: 85, mass: 1.1}});
          return (
            <div key={i}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14}}>
                <span style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 46, color: PALETA.texto, opacity: 0.86}}>{f.txt}</span>
                <span
                  style={{
                    fontFamily: GROTESCA,
                    fontWeight: 800,
                    fontSize: 68,
                    color: f.acento ? PALETA.acento : PALETA.texto,
                    opacity: s,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Math.round(f.valor * s).toLocaleString('es-AR')}
                  {unidad}
                </span>
              </div>
              <div
                style={{
                  height: 26,
                  borderRadius: 4,
                  width: `${(f.valor / max) * 100 * s}%`,
                  minWidth: 5,
                  background: f.acento ? PALETA.acento : PALETA.texto,
                  opacity: f.acento ? 1 : 0.75,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────── 6. CRECIMIENTO
// A diferencia de Ranking (una comparacion sin orden), esto es una
// LINEA DE TIEMPO: barras que crecen de izquierda a derecha, cada una
// mas alta que la anterior. Es para casos reales con numeros
// verificables -- por eso lleva 'fuente', chico y sin qeu compita con
// el dato, pero visible: un numero real sin de donde salio es tan
// creible como uno inventado.

export const Crecimiento: React.FC<{
  titulo?: string;
  puntos: {cuando: string; etiqueta: string; valor: number}[];
  fuente?: string;
}> = ({titulo, puntos, fuente}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const max = Math.max(...puntos.map((p) => p.valor));

  return (
    <AbsoluteFill
      style={{backgroundColor: PALETA.fondo, padding: '0 7%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 54}}
    >
      {titulo ? (
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 58, color: PALETA.texto}}>{titulo}</div>
      ) : null}
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 22, height: 620}}>
        {puntos.map((p, i) => {
          const ultimo = i === puntos.length - 1;
          const t0 = 0.35 + i * 0.5;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 16, stiffness: 130, mass: 0.7}});
          const alto = Math.max(6, (p.valor / max) * 100 * Math.max(0, s));
          return (
            <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%'}}>
              <div
                style={{
                  fontFamily: GROTESCA,
                  fontWeight: 800,
                  fontSize: ultimo ? 46 : 32,
                  color: ultimo ? PALETA.acento : PALETA.texto,
                  opacity: Math.min(1, s * 2),
                  marginBottom: 14,
                  textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {p.etiqueta}
              </div>
              <div
                style={{
                  width: '68%',
                  height: `${alto}%`,
                  borderRadius: '6px 6px 0 0',
                  background: ultimo ? PALETA.acento : PALETA.texto,
                  opacity: ultimo ? 1 : 0.55,
                }}
              />
              <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 30, color: PALETA.texto, opacity: 0.65, marginTop: 16, textAlign: 'center'}}>
                {p.cuando}
              </div>
            </div>
          );
        })}
      </div>
      {fuente ? (
        <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 24, color: PALETA.texto, opacity: 0.45}}>
          Fuente: {fuente}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
