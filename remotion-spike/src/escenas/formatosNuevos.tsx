import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Figura, NombreFigura} from '../dibujo/figuras';
import {ALTO, ANCHO, GRADING, GROTESCA, PALETA, SERIF} from '../identidad';
import {Fondo} from './metraje';

// 20 FORMATOS NUEVOS
//
// Tanda pedida por el operador para explotar variedad -- mecanismos
// que no existian en ningun lado del proyecto todavia (ni en el motor
// documental ni en receta/registro.tsx). Cada uno es un componente
// generico y reusable, igual que los de escenas/explica.tsx o
// escenas/mas.tsx: recibe datos por props, no sabe nada del guion que
// lo va a usar. Se prueban juntos en Muestrario3.tsx antes de
// conectarlos al motor de la serie documental.

const RotuloFrase: React.FC<{rotulo: string; frase: string; acento?: boolean}> = ({rotulo, frase, acento}) => (
  <div>
    <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 30, letterSpacing: '0.14em', textTransform: 'uppercase', color: acento ? PALETA.acento : PALETA.texto, opacity: 0.85, marginBottom: 10}}>
      {rotulo}
    </div>
    <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '82%', fontSize: 52, lineHeight: 1.05, color: PALETA.texto, textShadow: '0 6px 30px rgba(0,0,0,0.85)'}}>
      {frase}
    </div>
  </div>
);

// ────────────────────────────────────────── 1. DIAGONAL
// Dos filmaciones separadas por una linea diagonal que gira despacio,
// en vez de la division horizontal fija que ya existe (DosVidas).

export const Diagonal: React.FC<{
  arriba: {clip: string; rotulo: string; frase: string};
  abajo: {clip: string; rotulo: string; frase: string};
}> = ({arriba, abajo}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const ang = interpolate(t, [0, dur], [-6, 10]);
  const desplazamiento = Math.tan((ang * Math.PI) / 180) * 60;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fondo clip={abajo.clip} velo={0.5} duotono zoom={[1.05, 1.15]} />
      <div style={{position: 'absolute', inset: 0, clipPath: `polygon(0 0, 100% 0, 100% ${50 - desplazamiento}%, 0 ${50 + desplazamiento}%)`}}>
        <Fondo clip={arriba.clip} velo={0.5} zoom={[1.1, 1.0]} />
      </div>
      <div style={{position: 'absolute', left: '-10%', right: '-10%', top: `calc(50% - 3px)`, height: 6, background: PALETA.acento, transform: `rotate(${-ang}deg)`}} />
      <div style={{position: 'absolute', top: '12%', left: 0, right: 0, textAlign: 'center', padding: '0 8%'}}>
        <RotuloFrase rotulo={arriba.rotulo} frase={arriba.frase} />
      </div>
      <div style={{position: 'absolute', bottom: '12%', left: 0, right: 0, textAlign: 'center', padding: '0 8%'}}>
        <RotuloFrase rotulo={abajo.rotulo} frase={abajo.frase} acento />
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 2. FEED
// Un feed de posts desplazandose que frena justo en el que importa.

export const Feed: React.FC<{posts: {nombre: string; texto: string}[]}> = ({posts}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const alturaPost = 190;
  const avance = interpolate(t, [0.4, 0.4 + Math.max(1, posts.length - 1) * 0.9], [0, (posts.length - 1) * alturaPost], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{backgroundColor: '#111318', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: ALTO * 0.5 - avance, display: 'flex', flexDirection: 'column', gap: 20, padding: '0 8%'}}>
        {posts.map((p, i) => {
          const activo = Math.abs(i * alturaPost - avance) < 30;
          return (
            <div key={i} style={{background: activo ? PALETA.acento : '#1B1E26', borderRadius: 16, padding: '22px 26px', opacity: activo ? 1 : 0.55, transform: `scale(${activo ? 1 : 0.94})`}}>
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 28, color: activo ? '#1a0a04' : PALETA.texto, opacity: 0.8, marginBottom: 6}}>{p.nombre}</div>
              <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 36, color: activo ? '#1a0a04' : PALETA.texto, lineHeight: 1.2}}>{p.texto}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 3. RED DE NODOS
// Puntos conectados que se van encendiendo -- expansion, alcance, red.

export const RedNodos: React.FC<{puntos: {x: number; y: number; etiqueta: string}[]; titulo?: string}> = ({puntos, titulo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const paso = 0.7;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, padding: '10% 8%'}}>
      {titulo ? <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 40, color: PALETA.texto, opacity: 0.7, marginBottom: 20}}>{titulo}</div> : null}
      <svg width="100%" height="70%" viewBox="0 0 100 100" style={{overflow: 'visible'}}>
        {puntos.map((p, i) => {
          if (i === 0) return null;
          const anterior = puntos[i - 1];
          const t0 = 0.3 + i * paso;
          const trazo = Math.max(0, Math.min(1, (t - t0) / 0.4));
          return (
            <line key={i} x1={anterior.x} y1={anterior.y} x2={anterior.x + (p.x - anterior.x) * trazo} y2={anterior.y + (p.y - anterior.y) * trazo} stroke={PALETA.texto} strokeOpacity={0.4} strokeWidth={0.6} />
          );
        })}
        {puntos.map((p, i) => {
          const t0 = 0.2 + i * paso;
          if (t < t0) return null;
          const s = Math.min(1, (t - t0) / 0.3);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={2.2 * s} fill={i === puntos.length - 1 ? PALETA.acento : PALETA.texto} />
              <text x={p.x} y={p.y - 4} fontSize={3.6} fill={PALETA.texto} textAnchor="middle" opacity={s} fontFamily={GROTESCA} fontWeight={700}>
                {p.etiqueta}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 4. ENSAMBLE
// Piezas deslizando desde los bordes hasta encastrar en una grilla.

export const Ensamble: React.FC<{piezas: {fig: NombreFigura; txt: string}[]; titulo?: string}> = ({piezas, titulo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cols = piezas.length > 4 ? 3 : 2;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34}}>
      {titulo ? <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 38, color: PALETA.texto, opacity: 0.7}}>{titulo}</div> : null}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 26}}>
        {piezas.map((p, i) => {
          const t0 = 0.3 + i * 0.35;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 14, stiffness: 170}});
          const desdeX = (i % 2 === 0 ? -1 : 1) * 220;
          return (
            <div
              key={i}
              style={{
                width: 150, height: 150, borderRadius: 20, background: '#15151a', border: `2px solid ${PALETA.acento}55`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: Math.min(1, s * 2), transform: `translateX(${interpolate(s, [0, 1], [desdeX, 0])}px) scale(${interpolate(s, [0, 1], [0.6, 1])})`,
              }}
            >
              <Figura nombre={p.fig} p={1} col={PALETA.texto} tam={50} grosor={4.5} />
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 22, color: PALETA.texto, textAlign: 'center', padding: '0 8px'}}>{p.txt}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 5. RADAR
// Barrido circular que "detecta" items a su paso.

export const Radar: React.FC<{items: {fig: NombreFigura; txt: string; angulo: number}[]}> = ({items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const giro = (t * 70) % 360;
  return (
    <AbsoluteFill style={{backgroundColor: '#050506', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative', width: 640, height: 640}}>
        {[1, 2, 3].map((r) => (
          <div key={r} style={{position: 'absolute', inset: (3 - r) * 80, borderRadius: '50%', border: `1px solid ${PALETA.texto}22`}} />
        ))}
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: `conic-gradient(from ${giro}deg, ${PALETA.acento}66, transparent 55deg)`}} />
        {items.map((it, i) => {
          const detectado = (giro - it.angulo + 360) % 360 < 180;
          const rad = (it.angulo * Math.PI) / 180;
          const x = 320 + Math.cos(rad) * 230;
          const y = 320 + Math.sin(rad) * 230;
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: detectado ? 1 : 0}}>
              <Figura nombre={it.fig} p={1} col={PALETA.acento} tam={40} grosor={4} />
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 20, color: PALETA.texto}}>{it.txt}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 6. GRIETA
// La pantalla se raja al medio y revela otra capa detras.

const GRIETA_IZQ = 'polygon(0% 0%, 50% 0%, 46% 10%, 54% 20%, 44% 32%, 56% 45%, 45% 58%, 55% 70%, 47% 82%, 52% 90%, 50% 100%, 0% 100%)';
const GRIETA_DER = 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 52% 90%, 47% 82%, 55% 70%, 45% 58%, 56% 45%, 44% 32%, 54% 20%, 46% 10%)';

export const Grieta: React.FC<{antes: string; despues: string}> = ({antes, despues}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [dur * 0.3, dur * 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const gap = p * 140;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.acento, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', fontFamily: GROTESCA, fontWeight: 800, fontStretch: '80%', fontSize: 66, color: '#1a0a04', textAlign: 'center', padding: '0 12%', opacity: p}}>{despues}</div>
      <AbsoluteFill style={{background: PALETA.fondo, clipPath: GRIETA_IZQ, transform: `translateX(${-gap}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '80%', fontSize: 58, color: PALETA.texto, textAlign: 'center', padding: '0 6% 0 12%'}}>{antes}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: PALETA.fondo, clipPath: GRIETA_DER, transform: `translateX(${gap}px)`}} />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 7. DOCUMENTO
// Lineas que aparecen (algunas se tachan) y una firma que se traza.

export const Documento: React.FC<{lineas: {txt: string; tachado?: boolean}[]; firma: string}> = ({lineas, firma}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const paso = 0.55;
  const tFirma = 0.25 + lineas.length * paso;
  return (
    <AbsoluteFill style={{backgroundColor: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: '82%', background: PALETA.texto, borderRadius: 10, padding: '46px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
        {lineas.map((l, i) => {
          const t0 = 0.25 + i * paso;
          if (t < t0) return null;
          const s = Math.min(1, (t - t0) / 0.3);
          const pTacha = l.tachado ? Math.max(0, Math.min(1, (t - (t0 + 0.35)) / 0.3)) : 0;
          return (
            <div key={i} style={{position: 'relative', marginBottom: 20, opacity: s}}>
              <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 32, color: '#111'}}>{l.txt}</div>
              {l.tachado ? (
                <svg width="100%" height={6} style={{position: 'absolute', left: 0, top: '50%'}}>
                  <line x1={0} y1={3} x2="100%" y2={3} stroke={PALETA.acento} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pTacha} />
                </svg>
              ) : null}
            </div>
          );
        })}
        <div style={{marginTop: 34, display: 'flex', justifyContent: 'flex-end'}}>
          <svg width={220} height={70}>
            <path
              d="M10,50 C40,10 60,60 90,30 C120,0 140,55 170,25 C190,10 200,40 210,20"
              fill="none" stroke={PALETA.acento} strokeWidth={4} strokeLinecap="round"
              pathLength={1} strokeDasharray={1}
              strokeDashoffset={interpolate(t, [tFirma, tFirma + 0.6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
            />
          </svg>
        </div>
        <div style={{textAlign: 'right', fontFamily: SERIF, fontStyle: 'italic', fontSize: 24, color: '#333'}}>{firma}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 8. TICKER
// Cinta horizontal continua, tipo bolsa, con el dato clave resaltado.

export const Ticker: React.FC<{items: string[]; destacado?: number}> = ({items, destacado = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const velocidad = 90;
  const anchoItem = 320;
  const total = items.length * anchoItem;
  const x = -((t * velocidad) % total);
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: `linear-gradient(to right, ${PALETA.fondo}, transparent)`, zIndex: 2}} />
      <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: `linear-gradient(to left, ${PALETA.fondo}, transparent)`, zIndex: 2}} />
      <div style={{display: 'flex', transform: `translateX(${x}px)`}}>
        {[...items, ...items, ...items].map((txt, i) => (
          <div key={i} style={{width: anchoItem, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <div
              style={{
                fontFamily: GROTESCA, fontWeight: 800, fontStretch: '82%', textTransform: 'uppercase',
                fontSize: i % items.length === destacado ? 58 : 44,
                color: i % items.length === destacado ? PALETA.acento : PALETA.texto,
                opacity: i % items.length === destacado ? 1 : 0.5,
              }}
            >
              {txt}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 9. CASCADA
// Caracteres cayendo estilo matrix que se resuelven en la respuesta.

export const Cascada: React.FC<{resultado: string; simbolos?: string}> = ({resultado, simbolos = '01$#%&AI01'}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const columnas = 14;
  const resuelto = interpolate(t, [dur * 0.55, dur * 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      {Array.from({length: columnas}).map((_, c) => {
        const semilla = c * 97;
        const vel = 4 + (c % 5);
        return (
          <div key={c} style={{position: 'absolute', left: `${(c / columnas) * 100}%`, top: 0, width: `${100 / columnas}%`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {Array.from({length: 20}).map((_, r) => {
              const ch = simbolos[(semilla + r * 7 + Math.floor(t * vel)) % simbolos.length];
              return (
                <div key={r} style={{fontFamily: 'monospace', fontSize: 26, color: PALETA.acento, opacity: Math.max(0.05, 1 - r * 0.05)}}>
                  {ch}
                </div>
              );
            })}
          </div>
        );
      })}
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: resuelto, background: PALETA.fondo, padding: '20px 40px', borderRadius: 12, fontFamily: GROTESCA, fontWeight: 800, fontSize: 56, color: PALETA.texto, textAlign: 'center'}}>
          {resultado}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 10. TERMOMETRO
// Barra vertical que se llena -- progreso dramatico, sin ser un anillo.

export const Termometro: React.FC<{arriba?: string; hasta: number; sufijo?: string; abajo?: string}> = ({arriba, hasta, sufijo = '%', abajo}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.4, dur * 0.75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
  const valor = Math.round(hasta * p);
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      {arriba ? <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 40, color: PALETA.texto, opacity: 0.8}}>{arriba}</div> : null}
      <div style={{width: 90, height: 420, borderRadius: 45, border: `5px solid ${PALETA.texto}44`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end'}}>
        <div style={{width: '100%', height: `${p * 100}%`, background: PALETA.acento}} />
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '78%', fontSize: 90, color: PALETA.acento}}>
        {valor}{sufijo}
      </div>
      {abajo ? <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 38, color: PALETA.texto, opacity: 0.75}}>{abajo}</div> : null}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 11. REFLECTOR
// Foco de luz en la oscuridad que salta de un item al siguiente.

export const Reflector: React.FC<{items: {fig: NombreFigura; txt: string}[]}> = ({items}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const paso = dur / items.length;
  const idx = Math.min(items.length - 1, Math.floor(t / paso));
  const it = items[idx];
  const posiciones: [number, number][] = [[28, 32], [70, 30], [30, 68], [68, 66], [50, 50]];
  const pos = posiciones[idx % posiciones.length];
  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${pos[0]}% ${pos[1]}%, rgba(255,255,255,0.14) 0%, rgba(0,0,0,0.95) 20%)`}} />
      <div style={{position: 'absolute', left: `${pos[0]}%`, top: `${pos[1]}%`, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <Figura nombre={it.fig} p={1} col={PALETA.texto} tam={64} grosor={4} />
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 38, color: PALETA.texto, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{it.txt}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 12. COMIC
// Grilla de vinetas tipo historieta, cada una entra con su golpe.

export const Comic: React.FC<{vinetas: {clip?: string; txt: string}[]}> = ({vinetas}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#000', padding: 14, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10}}>
      {vinetas.map((v, i) => {
        const t0 = 0.2 + i * 0.5;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 16, stiffness: 180}});
        return (
          <div
            key={i}
            style={{
              position: 'relative', border: `4px solid ${PALETA.texto}`, borderRadius: 6, overflow: 'hidden',
              opacity: Math.min(1, s * 2), transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
            }}
          >
            {v.clip ? (
              <OffthreadVideo src={staticFile(`video/${v.clip}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADING}} />
            ) : (
              <AbsoluteFill style={{backgroundColor: PALETA.acento}} />
            )}
            <div style={{position: 'absolute', left: 8, top: 8, background: PALETA.texto, color: '#000', fontFamily: GROTESCA, fontWeight: 800, fontSize: 20, padding: '4px 10px', borderRadius: 4, transform: 'rotate(-3deg)'}}>
              {v.txt}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 13. GLITCH
// Quiebre visual estilo VHS -- para un momento de giro o error.

export const Glitch: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const salto = frame % 6 < 2;
  const dx = ((frame * 37) % 11) - 5;
  return (
    <AbsoluteFill style={{backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative'}}>
        <div style={{position: 'absolute', transform: `translate(${dx}px,0)`, color: '#0ff', opacity: 0.7, fontFamily: GROTESCA, fontWeight: 800, fontSize: 70, textTransform: 'uppercase', mixBlendMode: 'screen'}}>
          {texto}
        </div>
        <div style={{position: 'absolute', transform: `translate(${-dx}px,0)`, color: '#f0f', opacity: 0.7, fontFamily: GROTESCA, fontWeight: 800, fontSize: 70, textTransform: 'uppercase', mixBlendMode: 'screen'}}>
          {texto}
        </div>
        <div style={{position: 'relative', color: '#fff', fontFamily: GROTESCA, fontWeight: 800, fontSize: 70, textTransform: 'uppercase', opacity: salto ? 0.4 : 1}}>{texto}</div>
      </div>
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 14. FLIP 3D
// Una tarjeta gira y revela el resultado del otro lado.

export const Flip3D: React.FC<{frente: string; dorso: string}> = ({frente, dorso}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const giro = interpolate(t, [dur * 0.35, dur * 0.65], [0, 180], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200}}>
      <div style={{width: '70%', aspectRatio: '3 / 4', position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${giro}deg)`}}>
        <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: '#17171c', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${PALETA.texto}33`}}>
          <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 50, color: PALETA.texto, textAlign: 'center', padding: '0 10%'}}>{frente}</div>
        </div>
        <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: PALETA.acento, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotateY(180deg)'}}>
          <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 56, color: '#1a0a04', textAlign: 'center', padding: '0 10%'}}>{dorso}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 15. NEON
// Texto tipo cartel de neon que se enciende de izquierda a derecha.

export const Neon: React.FC<{texto: string; color?: string}> = ({texto, color = PALETA.acento}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  // el "encendido" es un par de flickers cortos antes de quedar prendido
  // fijo -- evita el clip-path de ancho variable, que en un texto
  // shrink-to-fit centrado puede terminar recortando el propio texto.
  const encendido = interpolate(t, [0.2, 0.45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flicker = t < 0.7 ? (Math.floor(t * 14) % 3 === 0 ? 0.25 : 1) : 1;
  const parpadeo = t > dur * 0.75 ? (Math.sin(t * 30) > 0.85 ? 0.65 : 1) : 1;
  return (
    <AbsoluteFill style={{backgroundColor: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
      <div
        style={{
          fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 76, color, textAlign: 'center',
          textShadow: `0 0 10px ${color}, 0 0 26px ${color}, 0 0 50px ${color}`,
          opacity: encendido * flicker * parpadeo,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 16. FILMSTRIP
// Tira de fotogramas tipo rollo de pelicula deslizando horizontal.

export const Filmstrip: React.FC<{cuadros: {clip: string; txt: string}[]}> = ({cuadros}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const anchoCuadro = 340;
  const total = cuadros.length * anchoCuadro;
  const x = interpolate(t, [0.3, Math.max(0.31, dur - 0.6)], [0, -(total - ANCHO)], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <div style={{display: 'flex', transform: `translateX(${x}px)`, gap: 14, padding: '0 14px'}}>
        {cuadros.map((c, i) => (
          <div key={i} style={{position: 'relative', width: anchoCuadro - 14, height: 520, flexShrink: 0, border: '10px solid #111', borderRadius: 4, overflow: 'hidden'}}>
            <OffthreadVideo src={staticFile(`video/${c.clip}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.3) contrast(1.1)'}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', padding: '12px 16px'}}>
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 26, color: '#fff'}}>{c.txt}</div>
            </div>
          </div>
        ))}
      </div>
      {(['top', 'bottom'] as const).map((borde) => (
        <div key={borde} style={{position: 'absolute', left: 0, right: 0, [borde]: 8, display: 'flex', gap: 16, padding: '0 20px'}}>
          {Array.from({length: 24}).map((_, i) => (
            <div key={i} style={{width: 16, height: 16, background: '#000', borderRadius: 3}} />
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 17. ANILLO
// Anillo de progreso que se llena mientras se acumulan items.

export const Anillo: React.FC<{items: string[]; centro?: string}> = ({items, centro}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.4, dur * 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const radio = 42;
  const circun = 2 * Math.PI * radio;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={420} height={420} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={radio} fill="none" stroke={`${PALETA.texto}22`} strokeWidth={6} />
        <circle
          cx={50} cy={50} r={radio} fill="none" stroke={PALETA.acento} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circun} strokeDashoffset={circun * (1 - p)} transform="rotate(-90 50 50)"
        />
      </svg>
      <div style={{position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '78%', fontSize: 70, color: PALETA.texto}}>
          {Math.round(p * items.length)}/{items.length}
        </div>
        {centro ? <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 28, color: PALETA.texto, opacity: 0.75}}>{centro}</div> : null}
      </div>
      <div style={{position: 'absolute', bottom: '14%', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center'}}>
        {items.map((it, i) => {
          const listo = p * items.length >= i + 1;
          return (
            <div key={i} style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 26, color: listo ? PALETA.texto : `${PALETA.texto}44`}}>
              {it}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 18. LINTERNA
// Un agujero de luz que se mueve y revela una capa oculta debajo.

export const Linterna: React.FC<{clip: string; oculto: string; revelado: string}> = ({clip, oculto, revelado}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const cx = interpolate(t, [0.3, Math.max(0.31, dur - 0.5)], [22, 78], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cy = 46 + Math.sin(t * 1.3) * 10;
  const mascara = `radial-gradient(circle at ${cx}% ${cy}%, transparent 0%, transparent 15%, black 17%)`;
  // los dos textos comparten la misma posicion central -- si se muestran
  // los dos a la vez (uno por la mascara, el otro por fuera) se leen
  // pisados entre si cuando el foco pasa cerca del medio. En vez de eso,
  // "oculto" y "revelado" se cruzan por opacidad segun que tan cerca esta
  // el foco del centro: nunca estan los dos visibles al mismo tiempo.
  const distAlCentro = Math.hypot(cx - 50, cy - 46);
  const cerca = interpolate(distAlCentro, [12, 22], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Fondo clip={clip} velo={0.3} zoom={[1.0, 1.1]} />
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 58, color: '#fff', textAlign: 'center', padding: '0 10%', textShadow: '0 6px 30px rgba(0,0,0,0.9)', opacity: cerca}}>{revelado}</div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: PALETA.fondo,
          WebkitMaskImage: mascara,
          maskImage: mascara,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 58, color: PALETA.texto, textAlign: 'center', padding: '0 10%', opacity: 1 - cerca}}>{oculto}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 19. MOCKUPS
// Dos pantallas de celular comparando una metrica.

export const Mockups: React.FC<{izq: {titulo: string; valor: string}; der: {titulo: string; valor: string}}> = ({izq, der}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const Telefono: React.FC<{d: {titulo: string; valor: string}; t0: number; acento?: boolean}> = ({d, t0, acento}) => {
    const s = spring({frame: frame - t0 * fps, fps, config: {damping: 15, stiffness: 170}});
    return (
      <div
        style={{
          opacity: Math.min(1, s * 2), transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
          width: 220, height: 440, borderRadius: 28, border: '6px solid #222', background: '#0d0d0f',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20,
        }}
      >
        <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 20, color: PALETA.texto, opacity: 0.7, textAlign: 'center'}}>{d.titulo}</div>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '78%', fontSize: 44, color: acento ? PALETA.acento : PALETA.texto}}>{d.valor}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <Telefono d={izq} t0={0.3} />
      <Telefono d={der} t0={0.7} acento />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 20. GRILLA INFINITA
// Una grilla de items que se va llenando -- catalogo creciendo.

export const GrillaInfinita: React.FC<{items: {fig?: NombreFigura; txt: string}[]; titulo?: string}> = ({items, titulo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const paso = 0.16;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, padding: '8% 6%', display: 'flex', flexDirection: 'column', gap: 20}}>
      {titulo ? <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 38, color: PALETA.texto, opacity: 0.75}}>{titulo}</div> : null}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, flex: 1}}>
        {items.map((it, i) => {
          const t0 = 0.25 + i * paso;
          const s = Math.max(0, Math.min(1, (t - t0) / 0.35));
          return (
            <div
              key={i}
              style={{
                background: '#16161b', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10,
                opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})`,
              }}
            >
              {it.fig ? <Figura nombre={it.fig} p={1} col={PALETA.acento} tam={30} grosor={4} /> : null}
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 18, color: PALETA.texto, textAlign: 'center'}}>{it.txt}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
