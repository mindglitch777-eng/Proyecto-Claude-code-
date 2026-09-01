import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Figura, NombreFigura} from '../dibujo/figuras';
import {ALTO, ANCHO, GRADING, GROTESCA, PALETA, SERIF} from '../identidad';
import {Fondo} from './metraje';

// CUARTA TANDA (15): el operador pidio seguir sumando formatos (el
// objetivo es pasar los 100), con dos pedidos puntuales -- que el
// texto de la narracion (lo que dice la voz) aparezca en pantalla
// desplazandose de arriba a abajo o de abajo a arriba en vez de
// cortar de golpe (NarracionVertical, el primero de esta tanda), y
// que se sigan usando dibujos grandes con movimiento fluido.

// ────────────────────────────────────────── 1. NARRACION VERTICAL
// El texto que dice la voz en off toma TODA la pantalla, una frase a
// la vez, en una cinta continua sin huecos: la frase entra con un
// golpe rapido, ocupa toda la pantalla mientras dura, y en el mismo
// instante en que se va entra la siguiente -- nunca hay un vacio en
// el medio. Cada frase cambia de tipografia (familia, peso, ancho,
// cursiva, mayusculas) para que la seguidilla tenga variedad visual
// en vez de verse siempre igual.

const ESTILOS_NARRACION: React.CSSProperties[] = [
  {fontFamily: GROTESCA, fontWeight: 900, fontStretch: '64%', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '-0.02em'},
  {fontFamily: SERIF, fontWeight: 700, fontStyle: 'italic', textTransform: 'none', letterSpacing: '0em'},
  {fontFamily: GROTESCA, fontWeight: 300, fontStretch: '122%', fontStyle: 'normal', textTransform: 'none', letterSpacing: '0.02em'},
  {fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.03em'},
  {fontFamily: SERIF, fontWeight: 900, fontStyle: 'normal', textTransform: 'none', letterSpacing: '-0.01em'},
];

export const NarracionVertical: React.FC<{lineas: string[]; direccion?: 'sube' | 'baja'}> = ({lineas, direccion = 'sube'}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const franja = dur / lineas.length;
  const idx = Math.min(lineas.length - 1, Math.floor(t / franja));
  const localT = t - idx * franja;
  const signo = direccion === 'sube' ? 1 : -1;
  // entra con un golpe rapido (0.14s) y se va con otro (0.16s) -- como
  // las dos ventanas coinciden justo en el limite de cada franja, la
  // frase que sale y la que entra se cruzan ahi mismo, sin hueco.
  const entra = interpolate(localT, [0, 0.14], [0, 1], {extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 2)});
  const sale = interpolate(localT, [franja - 0.16, franja], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const escala = interpolate(entra, [0, 1], [0.7, 1]) * (1 + sale * 0.18);
  const desplazamiento = signo * (interpolate(entra, [0, 1], [70, 0]) - sale * 80);
  const opacidad = Math.min(entra, 1 - sale);
  const estilo = ESTILOS_NARRACION[idx % ESTILOS_NARRACION.length];
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5%', overflow: 'hidden'}}>
      <div
        style={{
          ...estilo, fontSize: 96, lineHeight: 1.02, width: '100%', textAlign: 'center',
          color: idx % 2 === 0 ? PALETA.acento : PALETA.texto,
          transform: `translateY(${desplazamiento}px) scale(${escala})`, opacity: opacidad,
        }}
      >
        {lineas[idx]}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 2. CONSTELACION GRANDE
// Una red de ideas conectadas, grande, ocupando casi toda la pantalla
// -- cada nodo es un dibujo de la biblioteca, no un punto pelado.

export const ConstelacionGrande: React.FC<{titulo?: string; nodos: {fig: NombreFigura; txt: string; x: number; y: number}[]}> = ({titulo, nodos}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const paso = 0.5;
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0c'}}>
      {titulo ? <div style={{position: 'absolute', top: '6%', left: 0, right: 0, textAlign: 'center', fontFamily: GROTESCA, fontWeight: 700, fontSize: 36, color: PALETA.texto, opacity: 0.75}}>{titulo}</div> : null}
      <svg width="100%" height="100%" viewBox="0 0 100 178" style={{position: 'absolute', inset: 0}}>
        {nodos.slice(1).map((n, idx) => {
          const a = nodos[idx];
          const t0 = 0.5 + idx * paso;
          const trazo = Math.max(0, Math.min(1, (t - t0) / 0.5));
          if (trazo <= 0) return null;
          return <line key={idx} x1={a.x} y1={a.y} x2={a.x + (n.x - a.x) * trazo} y2={a.y + (n.y - a.y) * trazo} stroke={PALETA.acento} strokeWidth={0.4} opacity={0.55} />;
        })}
      </svg>
      {nodos.map((n, i) => {
        const t0 = 0.3 + i * paso;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 13, stiffness: 170}});
        return (
          <div key={i} style={{position: 'absolute', left: `${n.x}%`, top: `${n.y}%`, transform: `translate(-50%,-50%) scale(${interpolate(s, [0, 1], [0.3, 1])})`, opacity: Math.min(1, s * 2), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            <Figura nombre={n.fig} p={1} col={i === nodos.length - 1 ? PALETA.acento : '#fff'} tam={64} grosor={4.4} />
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 24, color: '#fff', textAlign: 'center', maxWidth: 150}}>{n.txt}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 3. ROMPECABEZAS
// Piezas que llegan de los bordes y encastran formando la palabra
// clave -- el "todo tiene su lugar" hecho animacion.

export const Rompecabezas: React.FC<{piezas: {fig: NombreFigura; txt: string}[]; resultado: string}> = ({piezas, resultado}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const bordes: [number, number][] = [[-40, -30], [140, -30], [-40, 130], [140, 130]];
  const tResultado = 0.5 + piezas.length * 0.4;
  const resOp = interpolate(t, [tResultado, tResultado + 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${Math.min(2, piezas.length)}, 1fr)`, gap: 24}}>
        {piezas.map((p, i) => {
          const t0 = 0.3 + i * 0.4;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 14, stiffness: 130, mass: 0.9}});
          const borde = bordes[i % bordes.length];
          const dx = interpolate(s, [0, 1], [borde[0] * 3, 0]);
          const dy = interpolate(s, [0, 1], [borde[1] * 3, 0]);
          return (
            <div key={i} style={{width: 170, height: 170, borderRadius: 22, background: '#17171c', border: `2px solid ${PALETA.acento}55`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: Math.min(1, s * 2), transform: `translate(${dx}px, ${dy}px) rotate(${interpolate(s, [0, 1], [borde[0] > 50 ? 30 : -30, 0])}deg)`}}>
              <Figura nombre={p.fig} p={1} col={PALETA.texto} tam={56} grosor={4.5} />
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 22, color: PALETA.texto, textAlign: 'center', padding: '0 10px'}}>{p.txt}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: '12%', fontFamily: GROTESCA, fontWeight: 800, fontSize: 56, color: PALETA.acento, textAlign: 'center', padding: '0 8%', opacity: resOp, transform: `scale(${interpolate(resOp, [0, 1], [0.7, 1])})`}}>{resultado}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 4. PARALLAX CAPAS
// Tres capas de metraje real moviendose a distinta velocidad -- la
// sensacion de profundidad del cine, no un video plano.

export const ParallaxCapas: React.FC<{fondo: string; medio: string; texto: string}> = ({fondo, medio, texto}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', inset: -20, transform: `translateX(${Math.sin(t * 0.4) * 12}px) scale(1.15)`}}>
        <OffthreadVideo src={staticFile(`video/${fondo}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: `${GRADING} blur(3px) brightness(0.55)`}} />
      </div>
      <div style={{position: 'absolute', inset: -40, transform: `translateX(${Math.sin(t * 0.7 + 1) * 26}px) scale(1.08)`}}>
        <OffthreadVideo src={staticFile(`video/${medio}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADING, opacity: 0.9}} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%)'}} />
      <AbsoluteFill style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 8% 14%'}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 54, color: '#fff', textAlign: 'center', textShadow: '0 6px 26px rgba(0,0,0,0.9)'}}>{texto}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 5. CERTIFICADO
// ────────────────────────────────────────── 6. TABLA COMPARATIVA
// Dos columnas de filas que se van tildando o tachando -- comparacion
// clara, mas grande y legible que un simple duelo de numeros.

export const TablaComparativa: React.FC<{
  colA: {titulo: string; filas: {txt: string; ok: boolean}[]};
  colB: {titulo: string; filas: {txt: string; ok: boolean}[]};
}> = ({colA, colB}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const Col: React.FC<{c: typeof colA; acento?: boolean; retraso: number}> = ({c, acento, retraso}) => (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 32, color: acento ? PALETA.acento : PALETA.texto, textAlign: 'center', marginBottom: 8}}>{c.titulo}</div>
      {c.filas.map((f, i) => {
        const t0 = retraso + i * 0.35;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 16, stiffness: 190}});
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: Math.min(1, s * 2), transform: `translateX(${interpolate(s, [0, 1], [acento ? 20 : -20, 0])}px)`}}>
            <div style={{width: 26, height: 26, borderRadius: '50%', background: f.ok ? PALETA.acento : '#3a3a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: GROTESCA, fontWeight: 800, fontSize: 16, color: f.ok ? '#1a0a04' : '#888'}}>
              {f.ok ? '✓' : '✕'}
            </div>
            <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 26, color: PALETA.texto}}>{f.txt}</div>
          </div>
        );
      })}
    </div>
  );
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, padding: '10% 7%', display: 'flex', flexDirection: 'row', gap: 30}}>
      <Col c={colA} retraso={0.3} />
      <div style={{width: 2, background: `${PALETA.texto}22`}} />
      <Col c={colB} acento retraso={0.6} />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 7. VELOCIMETRO
// Una aguja de tablero que salta hasta el valor -- lectura instantanea
// de "que tan alto llega esto", con marcas grandes.

export const Velocimetro: React.FC<{titulo: string; hasta: number; max?: number; sufijo?: string}> = ({titulo, hasta, max = 100, sufijo = '%'}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.4, dur * 0.75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 3)});
  const valor = Math.round(hasta * p);
  const angulo = -120 + (hasta / max) * p * 240;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 34, color: PALETA.texto, opacity: 0.8}}>{titulo}</div>
      <svg width={400} height={260} viewBox="0 0 200 130">
        <path d="M 20 120 A 80 80 0 1 1 180 120" fill="none" stroke={`${PALETA.texto}22`} strokeWidth={14} />
        <path d="M 20 120 A 80 80 0 1 1 180 120" fill="none" stroke={PALETA.acento} strokeWidth={14} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - (hasta / max) * p} />
        <line x1={100} y1={120} x2={100 + 65 * Math.cos((angulo * Math.PI) / 180)} y2={120 + 65 * Math.sin((angulo * Math.PI) / 180)} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
        <circle cx={100} cy={120} r={8} fill="#fff" />
      </svg>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '78%', fontSize: 84, color: PALETA.acento, marginTop: -30}}>{valor}{sufijo}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 8. RULETA
// Una ruleta que gira y frena en el segmento premiado -- la sorpresa
// de un sorteo, aplicada a un resultado real.

export const Ruleta: React.FC<{segmentos: string[]; ganador: number}> = ({segmentos, ganador}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const porSegmento = 360 / segmentos.length;
  const anguloFinal = 360 * 4 - ganador * porSegmento - porSegmento / 2;
  const giro = interpolate(t, [0.3, dur * 0.72], [0, anguloFinal], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 4)});
  const colores = [PALETA.acento, '#232323'];
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative', width: 460, height: 460}}>
        <div style={{position: 'absolute', left: '50%', top: -14, transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '26px solid #fff', zIndex: 2}} />
        <svg width={460} height={460} viewBox="0 0 100 100" style={{transform: `rotate(${giro}deg)`}}>
          {segmentos.map((s, i) => {
            const a0 = (i * porSegmento - 90) * (Math.PI / 180);
            const a1 = ((i + 1) * porSegmento - 90) * (Math.PI / 180);
            const x0 = 50 + 48 * Math.cos(a0);
            const y0 = 50 + 48 * Math.sin(a0);
            const x1 = 50 + 48 * Math.cos(a1);
            const y1 = 50 + 48 * Math.sin(a1);
            const mid = (a0 + a1) / 2;
            // el texto radial se lee al reves (boca abajo) cuando su
            // orientacion REAL EN PANTALLA (el angulo del segmento MAS el
            // giro actual de toda la ruleta, que cambia todo el tiempo)
            // cae en el semicirculo de abajo -- por eso hay que sumar
            // `giro` antes de decidir si voltear 180, no solo mirar el
            // angulo estatico del segmento (eso fue lo que fallo la
            // primera vez: un segmento "derecho" al arrancar se da vuelta
            // en pantalla apenas la ruleta gira).
            let rotDeg = (mid * 180) / Math.PI + 90;
            const enPantalla = ((rotDeg + giro) % 360 + 360) % 360;
            if (enPantalla > 90 && enPantalla < 270) rotDeg += 180;
            return (
              <g key={i}>
                <path d={`M 50 50 L ${x0} ${y0} A 48 48 0 0 1 ${x1} ${y1} Z`} fill={colores[i % 2]} stroke={PALETA.fondo} strokeWidth={0.6} />
                <text x={50 + 30 * Math.cos(mid)} y={50 + 30 * Math.sin(mid)} fontSize={5} fill="#fff" fontFamily={GROTESCA} fontWeight={700} textAnchor="middle" transform={`rotate(${rotDeg} ${50 + 30 * Math.cos(mid)} ${50 + 30 * Math.sin(mid)})`}>
                  {s}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 9. CORTINA DE TEATRO
// Dos cortinas rojas que se abren, como en el teatro -- para presentar
// el "resultado final" con pompa.

export const CortinaTeatro: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const abre = interpolate(t, [0.4, dur * 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 3)});
  const pliegue = (i: number) => `linear-gradient(${90 + i * 4}deg, rgba(0,0,0,0.25), transparent 40%, rgba(0,0,0,0.15))`;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 62, color: PALETA.texto, textAlign: 'center', padding: '0 12%', opacity: abre}}>{texto}</div>
      <AbsoluteFill style={{left: 0, width: `${50 - abre * 50}%`, background: `#7a1010 ${pliegue(0)}`, boxShadow: '20px 0 40px rgba(0,0,0,0.4)'}} />
      <AbsoluteFill style={{left: 'auto', right: 0, width: `${50 - abre * 50}%`, background: `#7a1010 ${pliegue(1)}`, boxShadow: '-20px 0 40px rgba(0,0,0,0.4)'}} />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 10. ESTRELLAS
// Cinco estrellas que se llenan una por una -- calificacion tipo
// review, prueba social directa y reconocible.

export const Estrellas: React.FC<{titulo: string; puntaje: number; subtitulo?: string}> = ({titulo, puntaje, subtitulo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const Estrella: React.FC<{lleno: boolean; t0: number}> = ({lleno, t0}) => {
    const s = spring({frame: frame - t0 * fps, fps, config: {damping: 10, stiffness: 220, mass: 0.5}});
    return (
      <svg width={64} height={64} viewBox="0 0 24 24" style={{transform: `scale(${interpolate(s, [0, 1], [0.3, 1])})`, opacity: Math.min(1, s * 2)}}>
        <path d="M12 2 L14.9 8.6 L22 9.3 L16.7 14 L18.2 21 L12 17.3 L5.8 21 L7.3 14 L2 9.3 L9.1 8.6 Z" fill={lleno ? PALETA.acento : 'none'} stroke={PALETA.acento} strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    );
  };
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 36, color: PALETA.texto, opacity: 0.8, textAlign: 'center', padding: '0 10%'}}>{titulo}</div>
      <div style={{display: 'flex', gap: 14}}>
        {Array.from({length: 5}).map((_, i) => <Estrella key={i} lleno={i < puntaje} t0={0.3 + i * 0.22} />)}
      </div>
      {subtitulo ? <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 30, color: PALETA.texto, opacity: 0.65}}>{subtitulo}</div> : null}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 11. FIGURA CON CALLOUTS
// Una persona dibujada, grande, con lineas que salen hacia etiquetas
// -- como una ficha tecnica de "lo que cambio en ella".

export const FiguraCallouts: React.FC<{callouts: {txt: string; x: number; y: number}[]}> = ({callouts}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const trazoPersona = Math.max(0, Math.min(1, (t - 0.3) / 0.7));
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Figura nombre="persona" p={trazoPersona} col={PALETA.texto} tam={340} grosor={3.2} />
      </AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 100 178" style={{position: 'absolute', inset: 0}}>
        {callouts.map((c, i) => {
          const t0 = 0.9 + i * 0.4;
          const trazo = Math.max(0, Math.min(1, (t - t0) / 0.4));
          if (trazo <= 0) return null;
          const cx = 50 + (c.x - 50) * 0.35;
          const cy = 89 + (c.y - 89) * 0.35;
          return <line key={i} x1={cx} y1={cy} x2={cx + (c.x - cx) * trazo} y2={cy + (c.y - cy) * trazo} stroke={PALETA.acento} strokeWidth={0.5} />;
        })}
      </svg>
      {callouts.map((c, i) => {
        const t0 = 0.9 + i * 0.4 + 0.35;
        const op = interpolate(t, [t0, t0 + 0.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{position: 'absolute', left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%,-50%)', opacity: op, background: '#17171c', border: `1px solid ${PALETA.acento}66`, borderRadius: 10, padding: '10px 16px'}}>
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 24, color: PALETA.texto, whiteSpace: 'nowrap'}}>{c.txt}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 12. FLECHA DE CRECIMIENTO
// Una linea de crecimiento gigante, dibujada, que atraviesa la
// pantalla de punta a punta y se dispara hacia arriba.

export const FlechaCrecimiento: React.FC<{titulo: string; puntos: number[]}> = ({titulo, puntos}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const max = Math.max(...puntos);
  const coords = puntos.map((p, i) => ({x: 10 + (i / (puntos.length - 1)) * 80, y: 130 - (p / max) * 90}));
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const trazo = interpolate(t, [0.4, dur * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const puntaOp = interpolate(trazo, [0.92, 1], [0, 1], {extrapolateLeft: 'clamp'});
  const ultimo = coords[coords.length - 1];
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, padding: '8% 6%'}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 38, color: PALETA.texto, opacity: 0.75, marginBottom: 20}}>{titulo}</div>
      <svg width="100%" height="70%" viewBox="0 0 100 140" style={{overflow: 'visible'}}>
        <path d={path} fill="none" stroke={PALETA.acento} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trazo} />
        <path d={`M ${ultimo.x - 4} ${ultimo.y + 6} L ${ultimo.x} ${ultimo.y - 4} L ${ultimo.x + 4} ${ultimo.y + 6}`} fill="none" stroke={PALETA.acento} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" opacity={puntaOp} />
      </svg>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 13. GRABADORA DE VOZ
// Una onda de audio (waveform) que "habla" -- para citar algo que
// alguien dijo, con la sensacion de escucharlo en vivo.

export const GrabadoraVoz: React.FC<{cita: string; autor: string}> = ({cita, autor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const barras = 40;
  return (
    <AbsoluteFill style={{backgroundColor: '#151517', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, padding: '0 9%'}}>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 46, color: '#fff', textAlign: 'center', lineHeight: 1.3}}>&ldquo;{cita}&rdquo;</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 3, height: 70}}>
        {Array.from({length: barras}).map((_, i) => {
          const alto = 14 + Math.abs(Math.sin(frame * 0.25 + i * 0.7)) * 56;
          return <div key={i} style={{width: 5, height: alto, borderRadius: 3, background: PALETA.acento, opacity: 0.85}} />;
        })}
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 26, color: '#8a95a3'}}>{autor}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 14. NIVEL DE CARGA
// Una barra de "cargando" que se llena mostrando etapas -- la espera
// que crea ansiedad por ver el resultado.

export const NivelCarga: React.FC<{etapas: string[]}> = ({etapas}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.3, dur - 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const etapaActual = Math.min(etapas.length - 1, Math.floor(p * etapas.length));
  return (
    <AbsoluteFill style={{backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34}}>
      <div style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 30, color: PALETA.acento}}>{etapas[etapaActual]}</div>
      <div style={{width: '70%', height: 14, borderRadius: 8, background: '#222', overflow: 'hidden'}}>
        <div style={{width: `${p * 100}%`, height: '100%', background: PALETA.acento}} />
      </div>
      <div style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 44, color: '#fff'}}>{Math.round(p * 100)}%</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 15. LUPA QUE REVELA
// Una lupa (dibujo grande) se desliza sobre un fondo de texto chico y
// amplia el dato importante -- literalmente "mirar de cerca".

export const LupaRevela: React.FC<{fondoTexto: string[]; dato: string}> = ({fondoTexto, dato}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const cx = interpolate(t, [0.4, dur - 0.6], [25, 62], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cy = 55;
  // el radio de la mascara tiene que alcanzar para el ancho del dato,
  // sino la lupa "revela" un dato cortado a la mitad -- por eso queda
  // grande (26%) y el texto chico (28px) en vez de al reves.
  const mascara = `radial-gradient(circle at ${cx}% ${cy}%, black 0%, black 25%, transparent 26%)`;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap', alignContent: 'center', gap: 14, padding: '0 8%', opacity: 0.35}}>
        {fondoTexto.map((f, i) => <div key={i} style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 30, color: PALETA.texto}}>{f}</div>)}
      </div>
      <AbsoluteFill style={{WebkitMaskImage: mascara, maskImage: mascara, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{background: PALETA.acento, borderRadius: 16, padding: '14px 22px'}}>
          <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 28, color: '#1a0a04', whiteSpace: 'nowrap'}}>{dato}</div>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none'}}>
        <Figura nombre="lupa" p={1} col={PALETA.texto} tam={120} grosor={4} />
      </div>
    </AbsoluteFill>
  );
};
