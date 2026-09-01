import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Figura, NombreFigura} from '../dibujo/figuras';
import {GROTESCA, PALETA, SERIF} from '../identidad';

// SEXTA TANDA (14): mas grande, mas rico visualmente (menos
// minimalista), con cambios de color y mas dibujo/diagrama -- el
// operador pidio sacar Certificado, agrandar todo, que las
// transiciones sean fluidas pero no lentas, y usar algunos iconos de
// apps para dar sensacion de plataformas reales (generico, sin copiar
// un logo exacto de nadie).

// Iconos de "app" genericos -- no son el logo real de ninguna marca,
// son la FORMA que cada tipo de app usa (camara = fotos, nota musical
// = video corto, cohete = ecommerce, etc.) para que se lea como
// plataforma real sin imitar a una en particular.
const IconoApp: React.FC<{tipo: 'foto' | 'video' | 'chat' | 'compra' | 'reproductor'; tam: number; color: string}> = ({tipo, tam, color}) => {
  const svgs: Record<typeof tipo, React.ReactNode> = {
    foto: (
      <>
        <rect x={3} y={5} width={18} height={14} rx={3} fill="none" stroke={color} strokeWidth={1.6} />
        <circle cx={12} cy={12} r={4} fill="none" stroke={color} strokeWidth={1.6} />
        <circle cx={17.5} cy={8} r={0.9} fill={color} />
      </>
    ),
    video: (
      <>
        <rect x={3} y={5} width={14} height={14} rx={4} fill="none" stroke={color} strokeWidth={1.6} />
        <path d="M 21 9 L 17 11.5 L 21 14 Z" fill={color} />
      </>
    ),
    chat: (
      <path d="M 3 5 H 21 V 15 H 9 L 5 19 V 15 H 3 Z" fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    ),
    compra: (
      <>
        <path d="M 4 8 H 20 L 18 18 H 6 Z" fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M 8 8 V 6 a 4 4 0 0 1 8 0 V 8" fill="none" stroke={color} strokeWidth={1.6} />
      </>
    ),
    reproductor: <circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.6} />,
  };
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24">
      {svgs[tipo]}
      {tipo === 'reproductor' ? <path d="M 10 8 L 16 12 L 10 16 Z" fill={color} /> : null}
    </svg>
  );
};

// ────────────────────────────────────────── 1. LLUVIA DE NOTIFICACIONES
// Varias tarjetas de distintas apps (cada una con su icono generico y
// su propio color) cayendo y apilandose -- "todo un dia de avisos".

export const LluviaNotificaciones: React.FC<{titulo: string; items: {app: string; tipo: 'foto' | 'video' | 'chat' | 'compra' | 'reproductor'; texto: string; color: string}[]}> = ({titulo, items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#0c0c10', padding: '8% 7%', display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 52, color: '#fff', marginBottom: 10}}>{titulo}</div>
      {items.map((it, i) => {
        const t0 = 0.25 + i * 0.32;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 13, stiffness: 200, mass: 0.7}});
        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 20, background: '#17171d', borderRadius: 18, padding: '20px 24px',
              borderLeft: `6px solid ${it.color}`, opacity: Math.min(1, s * 2), transform: `translateY(${interpolate(s, [0, 1], [-60, 0])}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
            }}
          >
            <div style={{width: 72, height: 72, borderRadius: 18, background: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <IconoApp tipo={it.tipo} tam={40} color="#0c0c10" />
            </div>
            <div>
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 32, color: '#fff'}}>{it.app}</div>
              <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 28, color: '#9aa3b0'}}>{it.texto}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 2. MAPA MENTAL GRANDE
// Un tema central con ramas de colores distintos hacia cada idea --
// mas rico y grande que ConstelacionGrande, con color por rama.

export const MapaMental: React.FC<{centro: string; ramas: {fig: NombreFigura; txt: string; color: string}[]}> = ({centro, ramas}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const n = ramas.length;
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0c', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width="100%" height="100%" viewBox="0 0 100 178" style={{position: 'absolute', inset: 0}}>
        {ramas.map((r, i) => {
          const ang = (360 / n) * i - 90;
          const rad = (ang * Math.PI) / 180;
          const ex = 50 + Math.cos(rad) * 34;
          const ey = 89 + Math.sin(rad) * 34;
          const t0 = 0.4 + i * 0.25;
          const trazo = Math.max(0, Math.min(1, (t - t0) / 0.4));
          return <line key={i} x1={50} y1={89} x2={50 + (ex - 50) * trazo} y2={89 + (ey - 89) * trazo} stroke={r.color} strokeWidth={0.9} />;
        })}
      </svg>
      <div style={{position: 'relative', zIndex: 2, width: 250, height: 250, borderRadius: '50%', background: PALETA.acento, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${PALETA.acento}66`}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 38, color: '#1a0a04', textAlign: 'center', padding: '0 16px'}}>{centro}</div>
      </div>
      {ramas.map((r, i) => {
        const ang = (360 / n) * i - 90;
        const rad = (ang * Math.PI) / 180;
        const ex = 50 + Math.cos(rad) * 34;
        const ey = 89 + Math.sin(rad) * 34;
        const t0 = 0.4 + i * 0.25 + 0.3;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 12, stiffness: 200}});
        return (
          <div key={i} style={{position: 'absolute', left: `${ex}%`, top: `${ey}%`, transform: `translate(-50%,-50%) scale(${interpolate(s, [0, 1], [0.4, 1])})`, opacity: Math.min(1, s * 2), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: '#17171d', border: `2px solid ${r.color}`, borderRadius: 16, padding: '14px 16px'}}>
            <Figura nombre={r.fig} p={1} col={r.color} tam={52} grosor={4.5} />
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 25, color: '#fff', whiteSpace: 'nowrap'}}>{r.txt}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 3. DIAGRAMA DE FLUJO
// Cajas y una decision en rombo con dos caminos (si/no) -- la
// gramatica de flowchart clasica, grande y a color.

export const DiagramaFlujo: React.FC<{inicio: string; pregunta: string; si: string; no: string}> = ({inicio, pregunta, si, no}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const Caja: React.FC<{txt: string; t0: number; color: string; x: string; y: string}> = ({txt, t0, color, x, y}) => {
    const s = spring({frame: frame - t0 * fps, fps, config: {damping: 13, stiffness: 190}});
    return (
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${interpolate(s, [0, 1], [0.5, 1])})`, opacity: Math.min(1, s * 2), background: color, borderRadius: 14, padding: '18px 22px', maxWidth: 220}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 29, color: '#fff', textAlign: 'center'}}>{txt}</div>
      </div>
    );
  };
  const trazo1 = Math.max(0, Math.min(1, (t - 0.9) / 0.4));
  const trazo2 = Math.max(0, Math.min(1, (t - 1.6) / 0.4));
  const trazo3 = Math.max(0, Math.min(1, (t - 1.6) / 0.4));
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <svg width="100%" height="100%" viewBox="0 0 100 178" style={{position: 'absolute', inset: 0}}>
        <line x1={50} y1={22} x2={50} y2={22 + 20 * trazo1} stroke={PALETA.texto} strokeWidth={0.7} opacity={0.6} />
        <line x1={45} y1={62} x2={45 - 20 * trazo2} y2={62 + 25 * trazo2} stroke="#e74c3c" strokeWidth={0.9} />
        <line x1={55} y1={62} x2={55 + 20 * trazo3} y2={62 + 25 * trazo3} stroke="#2ecc71" strokeWidth={0.9} />
      </svg>
      <Caja txt={inicio} t0={0.2} color="#3a3a40" x="50%" y="12%" />
      <div style={{position: 'absolute', left: '50%', top: '35%', transform: 'translate(-50%,-50%) rotate(45deg)', width: 175, height: 175, background: PALETA.acento, opacity: Math.min(1, spring({frame: frame - 0.6 * fps, fps, config: {damping: 13, stiffness: 190}}) * 2), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: 'rotate(-45deg)', fontFamily: GROTESCA, fontWeight: 800, fontSize: 25, color: '#1a0a04', textAlign: 'center', padding: '0 10px'}}>{pregunta}</div>
      </div>
      <Caja txt={no} t0={1.9} color="#c0392b" x="22%" y="58%" />
      <Caja txt={si} t0={1.9} color="#1e8449" x="78%" y="58%" />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 4. COMPARADOR DE APPS
// Dos telefonos lado a lado, cada uno con el icono de su app y una
// metrica -- comparacion visual entre plataformas o entre metodos.

export const ComparadorApps: React.FC<{
  izq: {app: string; tipo: 'foto' | 'video' | 'chat' | 'compra' | 'reproductor'; color: string; valor: string};
  der: {app: string; tipo: 'foto' | 'video' | 'chat' | 'compra' | 'reproductor'; color: string; valor: string};
}> = ({izq, der}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const Tel: React.FC<{d: typeof izq; t0: number}> = ({d, t0}) => {
    const s = spring({frame: frame - t0 * fps, fps, config: {damping: 14, stiffness: 160}});
    return (
      <div style={{opacity: Math.min(1, s * 2), transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px)`, width: 320, height: 560, borderRadius: 36, border: '9px solid #222', background: '#0d0d0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
        <div style={{width: 96, height: 96, borderRadius: 24, background: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <IconoApp tipo={d.tipo} tam={52} color="#0d0d0f" />
        </div>
        <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 30, color: '#fff'}}>{d.app}</div>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '78%', fontSize: 60, color: d.color}}>{d.valor}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36}}>
      <Tel d={izq} t0={0.25} />
      <Tel d={der} t0={0.55} />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 5. ANILLOS DE PROGRESO
// Tres anillos concentricos de colores llenandose, tipo reloj de
// actividad -- varias metricas a la vez, mucho mas rico que una barra.

export const AnillosProgreso: React.FC<{titulo: string; anillos: {txt: string; hasta: number; color: string}[]}> = ({titulo, anillos}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.3, dur * 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 3)});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 34, color: PALETA.texto, opacity: 0.85}}>{titulo}</div>
      <svg width={460} height={460} viewBox="0 0 100 100">
        {anillos.map((a, i) => {
          const r = 42 - i * 13;
          const circun = 2 * Math.PI * r;
          return (
            <g key={i}>
              <circle cx={50} cy={50} r={r} fill="none" stroke={`${a.color}33`} strokeWidth={9} />
              <circle cx={50} cy={50} r={r} fill="none" stroke={a.color} strokeWidth={9} strokeLinecap="round" strokeDasharray={circun} strokeDashoffset={circun * (1 - (a.hasta / 100) * p)} transform="rotate(-90 50 50)" />
            </g>
          );
        })}
      </svg>
      <div style={{display: 'flex', gap: 28}}>
        {anillos.map((a, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={{width: 16, height: 16, borderRadius: '50%', background: a.color}} />
            <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 22, color: PALETA.texto}}>{a.txt}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 6. DIAGRAMA DE CAPAS
// Un bloque "explota" en capas horizontales de colores distintos --
// de que esta hecho el sistema, mostrado como estratos.

export const DiagramaCapas: React.FC<{capas: {txt: string; color: string}[]}> = ({capas}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
      {capas.map((c, i) => {
        const t0 = 0.3 + i * 0.28;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 14, stiffness: 150}});
        const desde = i % 2 === 0 ? -1 : 1;
        return (
          <div key={i} style={{width: `${82 - i * 5}%`, height: 100, background: c.color, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: Math.min(1, s * 2), transform: `translateX(${interpolate(s, [0, 1], [desde * 200, 0])}px)`, boxShadow: '0 10px 26px rgba(0,0,0,0.4)'}}>
            <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 38, color: '#fff'}}>{c.txt}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 7. BARRAS QUE COMPITEN
// Barras horizontales de colores distintos creciendo a la vez, como
// una carrera -- mas dinamico que un ranking estatico.

export const BarrasCompiten: React.FC<{titulo: string; filas: {txt: string; valor: number; color: string}[]}> = ({titulo, filas}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const max = Math.max(...filas.map((f) => f.valor));
  const p = interpolate(t, [0.3, dur * 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 3)});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, padding: '10% 8%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 36, color: PALETA.texto, opacity: 0.85}}>{titulo}</div>
      {filas.map((f, i) => (
        <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 26, color: PALETA.texto}}>{f.txt}</div>
            <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 30, color: f.color}}>{Math.round(f.valor * p)}</div>
          </div>
          <div style={{height: 24, borderRadius: 12, background: `${f.color}22`, overflow: 'hidden'}}>
            <div style={{width: `${(f.valor / max) * 100 * p}%`, height: '100%', background: f.color, borderRadius: 12}} />
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 8. EMBUDO A COLOR
// Un embudo grande con cada piso de un color distinto -- version mas
// rica y grande del embudo clasico, con degrade entre pisos.

export const EmbudoColor: React.FC<{titulo?: string; pisos: {txt: string; cuantos: string; color: string}[]}> = ({titulo, pisos}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0c', padding: '8% 8%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
      {titulo ? <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 38, color: '#fff', marginBottom: 24}}>{titulo}</div> : null}
      {pisos.map((p, i) => {
        const t0 = 0.3 + i * 0.35;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 16, stiffness: 170}});
        // antes se angostaba hasta el 20% del ancho -- con textos largos
        // el ultimo piso (el mas angosto) hacia que la etiqueta y el
        // numero se pisaran entre si. Se angosta menos (minimo ~46%) y
        // si aun asi no entra en una fila, se apilan verticalmente.
        const ancho = 92 - i * (46 / Math.max(1, pisos.length - 1));
        const estrecho = ancho < 55;
        return (
          <div
            key={i}
            style={{
              width: `${ancho * s}%`, background: p.color, borderRadius: 10, padding: '20px 26px',
              display: 'flex', flexDirection: estrecho ? 'column' : 'row', gap: estrecho ? 4 : 0,
              justifyContent: 'space-between', alignItems: estrecho ? 'flex-start' : 'center', opacity: Math.min(1, s * 2),
            }}
          >
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 28, color: '#fff', whiteSpace: 'nowrap'}}>{p.txt}</div>
            <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 36, color: '#fff', whiteSpace: 'nowrap'}}>{p.cuantos}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 9. RED DE AVATARES
// Un icono central con muchos circulos-avatar chicos conectandose --
// comunidad/alcance, mas vivo que puntos pelados.

export const RedAvatares: React.FC<{centro: string; cantidad: number}> = ({centro, cantidad}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const colores = [PALETA.acento, '#2ecc71', '#3498db', '#f1c40f', '#e74c3c'];
  const puntos = Array.from({length: cantidad}).map((_, i) => {
    const ang = (360 / cantidad) * i;
    const rad = (ang * Math.PI) / 180;
    const r = 34 + (i % 3) * 6;
    return {x: 50 + Math.cos(rad) * r, y: 89 + Math.sin(rad) * r * 1.15, color: colores[i % colores.length]};
  });
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0c'}}>
      <svg width="100%" height="100%" viewBox="0 0 100 178" style={{position: 'absolute', inset: 0}}>
        {puntos.map((p, i) => {
          const t0 = 0.2 + i * 0.08;
          const trazo = Math.max(0, Math.min(1, (frame / fps - t0) / 0.3));
          return <line key={i} x1={50} y1={89} x2={50 + (p.x - 50) * trazo} y2={89 + (p.y - 89) * trazo} stroke={p.color} strokeWidth={0.4} opacity={0.5} />;
        })}
      </svg>
      {puntos.map((p, i) => {
        const t0 = 0.25 + i * 0.08;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 12, stiffness: 220}});
        return <div key={i} style={{position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: 28, height: 28, borderRadius: '50%', background: p.color, transform: `translate(-50%,-50%) scale(${interpolate(s, [0, 1], [0, 1])})`, opacity: Math.min(1, s * 2)}} />;
      })}
      <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 200, height: 200, borderRadius: '50%', background: PALETA.acento, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${PALETA.acento}77`}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 34, color: '#1a0a04', textAlign: 'center', padding: '0 14px'}}>{centro}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 10. RELOJ ANALOGICO RAPIDO
// Un reloj de agujas grande girando rapido -- el paso del tiempo,
// dibujado, no un numero solo.

export const RelojAnalogico: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const horas = t * 40;
  const minutos = t * 220;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <svg width={460} height={460} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={44} fill="none" stroke={PALETA.texto} strokeWidth={3} />
        {Array.from({length: 12}).map((_, i) => {
          const ang = (i * 30 * Math.PI) / 180;
          return <line key={i} x1={50 + 38 * Math.sin(ang)} y1={50 - 38 * Math.cos(ang)} x2={50 + 42 * Math.sin(ang)} y2={50 - 42 * Math.cos(ang)} stroke={PALETA.texto} strokeWidth={1.6} />;
        })}
        <line x1={50} y1={50} x2={50 + 22 * Math.sin((horas * Math.PI) / 180)} y2={50 - 22 * Math.cos((horas * Math.PI) / 180)} stroke={PALETA.texto} strokeWidth={4} strokeLinecap="round" />
        <line x1={50} y1={50} x2={50 + 32 * Math.sin((minutos * Math.PI) / 180)} y2={50 - 32 * Math.cos((minutos * Math.PI) / 180)} stroke={PALETA.acento} strokeWidth={2.6} strokeLinecap="round" />
        <circle cx={50} cy={50} r={2.6} fill={PALETA.acento} />
      </svg>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 46, color: PALETA.texto, textAlign: 'center', padding: '0 10%'}}>{texto}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 11. CARA QUE CAMBIA
// Una cara dibujada que pasa de preocupada a sonriente -- la emocion
// como diagrama, sin depender solo de texto.

export const CaraCambia: React.FC<{antes: string; despues: string}> = ({antes, despues}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [dur * 0.35, dur * 0.65], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bocaY = interpolate(p, [0, 1], [58, 46]);
  const bocaCurva = interpolate(p, [0, 1], [8, -10]);
  const color = `rgb(${interpolate(p, [0, 1], [231, 46])}, ${interpolate(p, [0, 1], [76, 204])}, ${interpolate(p, [0, 1], [60, 113])})`;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36}}>
      <svg width={380} height={380} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={40} fill="none" stroke={color} strokeWidth={4} />
        <circle cx={36} cy={42} r={4} fill={color} />
        <circle cx={64} cy={42} r={4} fill={color} />
        <path d={`M 32 ${bocaY} Q 50 ${bocaY + bocaCurva} 68 ${bocaY}`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
      </svg>
      <div style={{position: 'relative', height: 60}}>
        <div style={{position: 'absolute', inset: 0, fontFamily: GROTESCA, fontWeight: 700, fontSize: 38, color: PALETA.texto, opacity: interpolate(p, [0, 0.3], [1, 0], {extrapolateRight: 'clamp'})}}>{antes}</div>
        <div style={{position: 'absolute', inset: 0, fontFamily: GROTESCA, fontWeight: 800, fontSize: 42, color: '#2ecc71', opacity: interpolate(p, [0.7, 1], [0, 1], {extrapolateLeft: 'clamp'})}}>{despues}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 12. BALANZA GRANDE A COLOR
// Una balanza grande con iconos de colores en cada platillo -- version
// mas rica y grande de la comparacion clasica de pesos.

export const BalanzaColor: React.FC<{
  izq: {fig: NombreFigura; txt: string; color: string};
  der: {fig: NombreFigura; txt: string; color: string};
  gana: 'izq' | 'der';
}> = ({izq, der, gana}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 70, mass: 1}});
  const inclinacion = (gana === 'izq' ? -1 : 1) * s * 9;
  const Platillo: React.FC<{d: typeof izq; x: number; y: number; ganador: boolean}> = ({d, x, y, ganador}) => (
    <div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
      <div style={{width: 160, height: 160, borderRadius: '50%', background: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: ganador ? `0 0 40px ${d.color}88` : 'none'}}>
        <Figura nombre={d.fig} p={1} col="#fff" tam={82} grosor={5} />
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 26, color: PALETA.texto, textAlign: 'center'}}>{d.txt}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}>
        <line x1={50} y1={30} x2={50} y2={70} stroke={PALETA.texto} strokeWidth={2} />
        <line x1={22} y1={38 + inclinacion * 0.5} x2={78} y2={38 - inclinacion * 0.5} stroke={PALETA.texto} strokeWidth={2.4} />
      </svg>
      <Platillo d={izq} x={22} y={45 + inclinacion} ganador={gana === 'izq'} />
      <Platillo d={der} x={78} y={45 - inclinacion} ganador={gana === 'der'} />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 13. VARIAS PANTALLAS
// Tres celulares chicos en fila, cada uno con el icono de una app --
// "probo de todo antes de encontrar lo que funcionaba".

export const VariasPantallas: React.FC<{apps: {app: string; tipo: 'foto' | 'video' | 'chat' | 'compra' | 'reproductor'; color: string}[]; remate: string}> = ({apps, remate}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const remateOp = interpolate(t, [dur * 0.7, dur * 0.88], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '9% 0'}}>
      <div style={{display: 'flex', gap: 22}}>
        {apps.map((a, i) => {
          const t0 = 0.25 + i * 0.2;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 13, stiffness: 200}});
          return (
            <div key={i} style={{opacity: Math.min(1, s * 2), transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px) rotate(${(i - 1) * 6}deg)`, width: 270, height: 920, borderRadius: 36, border: '10px solid #262626', background: '#0d0d0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
              <div style={{width: 148, height: 148, borderRadius: 32, background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <IconoApp tipo={a.tipo} tam={80} color="#0d0d0f" />
              </div>
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 38, color: '#fff'}}>{a.app}</div>
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 62, lineHeight: 1.15, color: PALETA.acento, textAlign: 'center', padding: '0 8%', opacity: remateOp}}>{remate}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 14. ARBOL DE DECISION
// Un diagrama de si/no que se ramifica dos veces -- una decision con
// consecuencias, dibujada como arbol logico a color.

export const ArbolDecision: React.FC<{raiz: string; opciones: {txt: string; resultado: string; color: string}[]}> = ({raiz, opciones}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = opciones.length;
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0c', padding: '9% 6%', display: 'flex', flexDirection: 'column'}}>
      <div style={{textAlign: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 48, color: '#fff', marginBottom: 20}}>{raiz}</div>
      <div style={{flex: 1, position: 'relative'}}>
        <svg width="100%" height="62%" viewBox="0 0 100 60" preserveAspectRatio="none" style={{position: 'absolute', top: 0, left: 0}}>
          {opciones.map((_, i) => {
            const x = 15 + i * (70 / (n - 1));
            const t0 = 0.3 + i * 0.2;
            const trazo = Math.max(0, Math.min(1, (frame / fps - t0) / 0.4));
            return <line key={i} x1={50} y1={0} x2={50 + (x - 50) * trazo} y2={40 * trazo} stroke={opciones[i].color} strokeWidth={1.6} />;
          })}
        </svg>
        <div style={{position: 'absolute', top: '58%', left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'space-evenly', padding: '0 2%'}}>
            {opciones.map((o, i) => {
              const t0 = 0.5 + i * 0.2;
              const s = spring({frame: frame - t0 * fps, fps, config: {damping: 13, stiffness: 190}});
              return (
                <div key={i} style={{opacity: Math.min(1, s * 2), transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: `${88 / n}%`}}>
                  <div style={{background: o.color, borderRadius: 18, padding: '30px 20px', width: '100%'}}>
                    <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 32, color: '#fff', textAlign: 'center', lineHeight: 1.15}}>{o.txt}</div>
                  </div>
                  <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 28, color: '#9aa3b0', textAlign: 'center'}}>{o.resultado}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
