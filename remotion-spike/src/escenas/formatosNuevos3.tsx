import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Figura, NombreFigura} from '../dibujo/figuras';
import {ALTO, ANCHO, GRADING, GROTESCA, PALETA, SERIF} from '../identidad';
import {Fondo} from './metraje';

// TERCERA TANDA DE MECANISMOS (18): mas grandes, mas dibujados, mas
// fluidos -- lo que el operador pidio despues de ver Muestrario4:
// fotos mas grandes, mezclar dibujo con video real cuando el metraje
// de stock no puede ser especifico, ejemplos reales de gente que gano
// plata (no documentales), transiciones fluidas, y usar mas la
// biblioteca de dibujos (dibujo/figuras.tsx) con composiciones mas
// grandes y elaboradas -- nada de pantalla negra con un icono chico.

// ────────────────────────────────────────── 1. FOTO ANTIGUA
// Una foto grande, casi de borde a borde, con flash de camara y grano
// sepia -- mas grande e imponente que el "photo dump" de Polaroids.

export const FotoAntigua: React.FC<{clip: string; leyenda: string; anio?: string}> = ({clip, leyenda, anio}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flash = spring({frame, fps, config: {damping: 200, stiffness: 100}});
  const flashOp = interpolate(flash, [0, 0.15, 1], [1, 0.9, 0]);
  return (
    <AbsoluteFill style={{backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative', width: '92%', aspectRatio: '4 / 5', boxShadow: '0 40px 90px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
        <OffthreadVideo src={staticFile(`video/${clip}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.45) contrast(1.1) saturate(1.15)'}} />
        <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent 40%)'}} />
        {anio ? (
          <div style={{position: 'absolute', top: 22, right: 26, fontFamily: 'monospace', fontWeight: 700, fontSize: 30, color: '#ffcf7a'}}>{anio}</div>
        ) : null}
        <div style={{position: 'absolute', bottom: 30, left: 28, right: 28, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 42, color: '#fff', textShadow: '0 4px 16px rgba(0,0,0,0.8)'}}>
          {leyenda}
        </div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flashOp, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 2. DIBUJO SOBRE VIDEO
// Metraje real con una anotacion DIBUJADA encima (circulo o flecha
// trazandose) -- para cuando el video de stock no puede ser tan
// especifico como hace falta y hay que señalar a mano lo que importa.

export const DibujoSobreVideo: React.FC<{clip: string; texto: string; marca?: 'circulo' | 'flecha'}> = ({clip, texto, marca = 'circulo'}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const trazo = interpolate(t, [0.5, 1.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const textoOp = interpolate(t, [1.4, 1.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fondo clip={clip} velo={0.15} zoom={[1.05, 1.15]} />
      <svg width="100%" height="100%" viewBox="0 0 100 178" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {marca === 'circulo' ? (
          <ellipse cx={58} cy={70} rx={26} ry={20} fill="none" stroke={PALETA.acento} strokeWidth={1.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trazo} />
        ) : (
          <path d="M 20 130 Q 45 90 62 78" fill="none" stroke={PALETA.acento} strokeWidth={1.6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trazo} />
        )}
      </svg>
      <div style={{position: 'absolute', bottom: '14%', left: '8%', right: '8%', fontFamily: GROTESCA, fontWeight: 800, fontSize: 50, color: '#fff', textAlign: 'center', textShadow: '0 4px 20px rgba(0,0,0,0.9)', opacity: textoOp}}>
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 3. PRUEBA DE PAGO
// Notificacion de celular tipo "Recibiste $X" -- ejemplificacion real
// de plata entrando, no una animacion abstracta.

export const PruebaPago: React.FC<{app: string; monto: string; detalle: string}> = ({app, monto, detalle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 0.3 * fps, fps, config: {damping: 16, stiffness: 220, mass: 0.6}});
  return (
    <AbsoluteFill style={{backgroundColor: '#e9e9ee', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
      <div
        style={{
          width: '100%', background: '#fff', borderRadius: 22, padding: '28px 30px', display: 'flex', alignItems: 'center', gap: 20,
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)', opacity: Math.min(1, s * 2),
          transform: `translateY(${interpolate(s, [0, 1], [-60, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        }}
      >
        <div style={{width: 64, height: 64, borderRadius: 16, background: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Figura nombre="billete" p={1} col="#fff" tam={34} grosor={5} />
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 26, color: '#111'}}>{app}</div>
          <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 24, color: '#555'}}>{detalle}</div>
        </div>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 34, color: '#1a8f4c'}}>{monto}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 4. COMENTARIO REAL
// Una captura de mensaje/comentario, sola y grande en pantalla, como
// prueba social -- distinto del Feed (que desplaza varios): esto es
// UNA sola captura, quieta, para que se lea como testimonio real.

export const ComentarioReal: React.FC<{nombre: string; texto: string; tiempo?: string}> = ({nombre, texto, tiempo = 'ahora'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 15, stiffness: 160}});
  return (
    <AbsoluteFill style={{backgroundColor: '#0b1015', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 9%'}}>
      <div
        style={{
          width: '100%', background: '#1c2530', borderRadius: 26, padding: '34px 32px', display: 'flex', flexDirection: 'column', gap: 18,
          opacity: Math.min(1, s * 2), transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`, boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 56, height: 56, borderRadius: '50%', background: PALETA.acento, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 26, color: '#1a0a04'}}>
            {nombre.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 28, color: '#fff'}}>{nombre}</div>
            <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 20, color: '#8a95a3'}}>{tiempo}</div>
          </div>
        </div>
        <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 34, color: '#e8ecf0', lineHeight: 1.3}}>{texto}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 5. PASOS HORMIGA
// Un camino de puntitos (como un rastro de hormigas) conectando pasos
// numerados grandes, ocupando casi toda la pantalla -- no un dibujo
// chico solo en el centro.

export const PasosHormiga: React.FC<{pasos: string[]}> = ({pasos}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const puntosPorTramo = 14;
  const posiciones = pasos.map((_, i) => ({
    x: i % 2 === 0 ? 26 : 74,
    y: 16 + i * (68 / Math.max(1, pasos.length - 1)),
  }));
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, padding: '4% 6%'}}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {posiciones.slice(1).map((p, idx) => {
          const a = posiciones[idx];
          const b = p;
          const t0 = 0.4 + idx * 0.7;
          const avance = Math.max(0, Math.min(1, (t - t0) / 0.6));
          return Array.from({length: puntosPorTramo}).map((_, k) => {
            const f = k / (puntosPorTramo - 1);
            if (f > avance) return null;
            return <circle key={k} cx={a.x + (b.x - a.x) * f} cy={a.y + (b.y - a.y) * f} r={0.55} fill={PALETA.texto} opacity={0.55} />;
          });
        })}
      </svg>
      {posiciones.map((p, i) => {
        const t0 = 0.2 + i * 0.7;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 13, stiffness: 190}});
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-50%,-50%) scale(${interpolate(s, [0, 1], [0.4, 1])})`,
              opacity: Math.min(1, s * 2), display: 'flex', alignItems: 'center', gap: 18, flexDirection: p.x > 50 ? 'row' : 'row-reverse',
            }}
          >
            <div style={{width: 86, height: 86, borderRadius: '50%', background: i === posiciones.length - 1 ? PALETA.acento : '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 40, color: i === posiciones.length - 1 ? '#1a0a04' : '#fff', flexShrink: 0}}>
              {i + 1}
            </div>
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 32, color: PALETA.texto, maxWidth: 260}}>{pasos[i]}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 6. ARBOL CRECIENDO
// Ramas que se bifurcan desde un tronco -- una idea que se ramifica en
// varias, dibujada grande, ocupando casi toda la pantalla.

export const ArbolCreciendo: React.FC<{raiz: string; ramas: string[]}> = ({raiz, ramas}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const tronco = Math.max(0, Math.min(1, (t - 0.3) / 0.5));
  const baseX = 50;
  const baseY = 86;
  const topY = 52;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}>
        <line x1={baseX} y1={baseY} x2={baseX} y2={baseY - (baseY - topY) * tronco} stroke={PALETA.texto} strokeWidth={1.2} strokeLinecap="round" />
        {ramas.map((_, i) => {
          const n = ramas.length;
          const angulo = -90 + (i - (n - 1) / 2) * (100 / n);
          const rad = (angulo * Math.PI) / 180;
          const largo = 34;
          const ex = baseX + Math.cos(rad) * largo;
          const ey = topY + Math.sin(rad) * largo;
          const t0 = 0.9 + i * 0.35;
          const p = Math.max(0, Math.min(1, (t - t0) / 0.5));
          if (tronco < 1) return null;
          return <line key={i} x1={baseX} y1={topY} x2={baseX + (ex - baseX) * p} y2={topY + (ey - topY) * p} stroke={PALETA.texto} strokeWidth={0.9} strokeLinecap="round" opacity={0.85} />;
        })}
        {ramas.map((_, i) => {
          const n = ramas.length;
          const angulo = -90 + (i - (n - 1) / 2) * (100 / n);
          const rad = (angulo * Math.PI) / 180;
          const largo = 34;
          const ex = baseX + Math.cos(rad) * largo;
          const ey = topY + Math.sin(rad) * largo;
          const t0 = 0.9 + i * 0.35 + 0.5;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 12, stiffness: 200}});
          return <circle key={'h' + i} cx={ex} cy={ey} r={2.6 * Math.min(1, s * 1.4)} fill={PALETA.acento} />;
        })}
      </svg>
      <div style={{position: 'absolute', bottom: '6%', left: 0, right: 0, textAlign: 'center', fontFamily: GROTESCA, fontWeight: 700, fontSize: 34, color: PALETA.texto, opacity: 0.75}}>{raiz}</div>
      {ramas.map((r, i) => {
        const n = ramas.length;
        const angulo = -90 + (i - (n - 1) / 2) * (100 / n);
        const rad = (angulo * Math.PI) / 180;
        const largo = 34;
        const ex = baseX + Math.cos(rad) * largo;
        const ey = topY + Math.sin(rad) * largo;
        const t0 = 0.9 + i * 0.35 + 0.6;
        const op = interpolate(t, [t0, t0 + 0.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{position: 'absolute', left: `${ex}%`, top: `${ey}%`, transform: 'translate(-50%,-140%)', fontFamily: GROTESCA, fontWeight: 700, fontSize: 24, color: PALETA.texto, opacity: op, textAlign: 'center', width: 160}}>
            {r}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 7. MORPH BLOB
// Una mancha liquida que cambia de forma sin cortar -- conecta dos
// estados (palabra/valor) con una transicion fluida en vez de un corte.

export const MorphBlob: React.FC<{antes: string; despues: string}> = ({antes, despues}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [dur * 0.35, dur * 0.65], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const radios = [
    [42, 58, 60, 40], // circular-ish
    [30, 70, 45, 65], // deformado
  ];
  const mezcla = (a: number, b: number) => a + (b - a) * p;
  const r = [0, 1, 2, 3].map((i) => mezcla(radios[0][i], radios[1][i]));
  const borderRadius = `${r[0]}% ${100 - r[0]}% ${100 - r[1]}% ${r[1]}% / ${r[2]}% ${r[3]}% ${100 - r[3]}% ${100 - r[2]}%`;
  // la forma (blob) se mezcla continuo, pero el texto NO: si los dos
  // textos se cruzan por opacidad al mismo tiempo (ambos a ~50%) en el
  // mismo lugar, se leen pisados y garabateados entre si. Se secuencia
  // en cambio: "antes" se apaga del todo antes de que "despues" empiece
  // a aparecer, con un hueco breve sin texto (solo la mancha) en el medio.
  const opAntes = interpolate(t, [dur * 0.3, dur * 0.42], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opDespues = interpolate(t, [dur * 0.58, dur * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 420, height: 420, background: PALETA.acento, borderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30}}>
        <div style={{position: 'relative', width: '100%', height: 80}}>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 46, color: '#1a0a04', textAlign: 'center', opacity: opAntes}}>{antes}</div>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 46, color: '#1a0a04', textAlign: 'center', opacity: opDespues}}>{despues}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 8. OBTURADOR
// El diafragma de una camara de cine abriendose -- hojas triangulares
// que giran y se abren revelando la escena. Un recurso de apertura
// clasico, no un simple fundido.

export const Obturador: React.FC<{clip: string; texto: string}> = ({clip, texto}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 18, stiffness: 60, mass: 1}});
  const hojas = 8;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fondo clip={clip} velo={0.35} zoom={[1.1, 1.02]} />
      <div style={{position: 'absolute', bottom: '13%', left: 0, right: 0, textAlign: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 48, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.9)', opacity: Math.min(1, p * 1.6)}}>{texto}</div>
      <svg width="100%" height="100%" viewBox="0 0 100 178" style={{position: 'absolute', inset: 0}}>
        {Array.from({length: hojas}).map((_, i) => {
          const ang = (360 / hojas) * i;
          const apertura = interpolate(p, [0, 1], [0, 130]);
          return (
            <polygon
              key={i}
              points="50,89 90,89 50,-40"
              fill="#000"
              transform={`rotate(${ang} 50 89) translate(0 ${-apertura})`}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 9. PIZARRON
// Un pizarron negro donde el texto se "escribe" con tiza, trazo a
// trazo -- para una explicacion tipo profesor.

export const Pizarron: React.FC<{titulo: string; lineas: string[]}> = ({titulo, lineas}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{backgroundColor: '#1b3a2e', padding: '10% 9%'}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.05), transparent 60%)'}} />
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 54, color: '#fff', opacity: 0.92, marginBottom: 46, borderBottom: '3px solid rgba(255,255,255,0.25)', paddingBottom: 20}}>
        {titulo}
      </div>
      {lineas.map((l, i) => {
        const t0 = 0.6 + i * 0.9;
        const trazo = Math.max(0, Math.min(1, (t - t0) / 0.7));
        if (trazo <= 0) return null;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30}}>
            <div style={{width: 16, height: 16, borderRadius: '50%', border: '3px solid #fff', flexShrink: 0, opacity: 0.85}} />
            <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 40, color: '#f4f4f4', clipPath: `inset(0 ${100 - trazo * 100}% 0 0)`}}>{l}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 10. LIBRO / PAGINA
// Una pagina de libro que gira revelando el "capitulo" siguiente --
// util para marcar un cambio de etapa dentro del video.

export const LibroPagina: React.FC<{capitulo: string; titulo: string}> = ({capitulo, titulo}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const giro = interpolate(t, [dur * 0.3, dur * 0.62], [0, 180], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 3)});
  // el giro va DIRECTO en el div con perspective como padre inmediato --
  // sin una capa "plana" de por medio -- porque anidar preserve-3d
  // detras de un contenedor sin transform-style hace que Chromium
  // headless no componga bien las dos caras (la trasera nunca llega a
  // mostrarse). El giro tambien queda centrado (no en el borde
  // izquierdo, como un lomo de libro real): con el eje corrido a la
  // izquierda, Chromium headless se confunde entre las 90 y 180
  // grados y la cara trasera nunca termina de asomar. Mismo patron
  // (centrado) que ya esta probado y funciona en Flip3D.
  return (
    <AbsoluteFill style={{backgroundColor: '#efe9db', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1400}}>
      <div style={{width: '78%', aspectRatio: '3 / 4', position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${giro}deg)`}}>
        <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: '#f7f2e6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, boxShadow: '0 20px 50px rgba(0,0,0,0.2)'}}>
          <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 26, color: '#8a7a5c', letterSpacing: '0.2em', textTransform: 'uppercase'}}>{capitulo}</div>
        </div>
        <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: '#f7f2e6', transform: 'rotateY(180deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'}}>
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: '#2b2416', textAlign: 'center', lineHeight: 1.2}}>{titulo}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 11. CANDADO
// Un candado (de la biblioteca de dibujos) se dibuja y luego se abre,
// revelando el texto detras -- metafora directa de "desbloquear".

export const Candado: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const trazo = interpolate(t, [0.25, 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const abre = spring({frame: frame - dur * 0.5 * fps, fps, config: {damping: 10, stiffness: 140, mass: 0.8}});
  const textoOp = interpolate(abre, [0.3, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <div style={{transform: `translateY(${-abre * 60}px) rotate(${abre * -18}deg) scale(${1 + abre * 0.15})`}}>
        <Figura nombre="candado" p={trazo} col={abre > 0.1 ? PALETA.acento : PALETA.texto} tam={160} grosor={5} />
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 52, color: PALETA.texto, textAlign: 'center', padding: '0 10%', opacity: textoOp}}>{texto}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 12. MAPA SUBTE
// Un mapa de linea de metro esquematico: estaciones = pasos, un tren
// (punto) recorriendolas en orden -- mas grafico y grande que una
// linea de tiempo comun.

export const MapaSubte: React.FC<{estaciones: string[]}> = ({estaciones}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const avance = interpolate(t, [0.4, dur - 0.6], [0, estaciones.length - 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = (i: number) => 18 + i * (64 / Math.max(1, estaciones.length - 1));
  const trenY = 18 + avance * (64 / Math.max(1, estaciones.length - 1));
  return (
    <AbsoluteFill style={{backgroundColor: '#111', padding: '4% 10%'}}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <line x1={20} y1={y(0)} x2={20} y2={y(estaciones.length - 1)} stroke={PALETA.acento} strokeWidth={1.4} />
        {estaciones.map((_, i) => (
          <circle key={i} cx={20} cy={y(i)} r={2.2} fill={i <= avance + 0.01 ? PALETA.acento : '#333'} stroke="#111" strokeWidth={0.8} />
        ))}
        <circle cx={20} cy={trenY} r={3.4} fill="#fff" stroke={PALETA.acento} strokeWidth={1} />
      </svg>
      {estaciones.map((e, i) => (
        <div key={i} style={{position: 'absolute', left: '28%', top: `${y(i)}%`, transform: 'translateY(-50%)', fontFamily: GROTESCA, fontWeight: 700, fontSize: 32, color: i <= avance + 0.01 ? '#fff' : '#666'}}>{e}</div>
      ))}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 13. ENGRANAJES
// Dos engranajes (de la biblioteca de dibujos) girando encastrados --
// metafora de mecanismo, de "esto engrana con esto otro".

export const Engranajes: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const giro = t * 40;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <div style={{display: 'flex', alignItems: 'center', gap: -10}}>
        <div style={{transform: `rotate(${giro}deg)`, marginRight: -36}}>
          <Figura nombre="engranaje" p={1} col={PALETA.texto} tam={150} grosor={5} />
        </div>
        <div style={{transform: `rotate(${-giro}deg)`}}>
          <Figura nombre="engranaje" p={1} col={PALETA.acento} tam={110} grosor={5} />
        </div>
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 48, color: PALETA.texto, textAlign: 'center', padding: '0 10%'}}>{texto}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 14. RELOJ DE ARENA
// Arena cayendo de una mitad a la otra, con dos valores -- metafora de
// tiempo (o plata) que pasa de un lado al otro.

export const RelojArena: React.FC<{arriba: {txt: string; valor: string}; abajo: {txt: string; valor: string}}> = ({arriba, abajo}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.4, dur * 0.75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 32, color: PALETA.texto, opacity: 0.6 - p * 0.4}}>{arriba.txt}</div>
      <div style={{position: 'relative', width: 200, height: 280}}>
        <svg width={200} height={280} viewBox="0 0 100 140">
          <path d="M 15 5 L 85 5 L 55 70 L 85 135 L 15 135 L 45 70 Z" fill="none" stroke={PALETA.texto} strokeWidth={3} strokeLinejoin="round" />
          <clipPath id="arribaClip"><path d="M 15 5 L 85 5 L 55 70 L 45 70 Z" /></clipPath>
          <clipPath id="abajoClip"><path d="M 45 70 L 55 70 L 85 135 L 15 135 Z" /></clipPath>
          {/* la arena de arriba se drena hacia el cuello (ancla abajo del
              cuadrilatero, y encoge hacia arriba); la de abajo llena desde
              el cuello hacia el fondo (ancla abajo, crece hacia arriba) */}
          <rect x={15} y={5 + 65 * p} width={70} height={65 * (1 - p)} fill={PALETA.acento} clipPath="url(#arribaClip)" />
          <rect x={15} y={135 - 65 * p} width={70} height={65 * p} fill={PALETA.acento} clipPath="url(#abajoClip)" />
        </svg>
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 56, color: PALETA.acento}}>{p < 0.5 ? arriba.valor : abajo.valor}</div>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 32, color: PALETA.texto, opacity: 0.2 + p * 0.6}}>{abajo.txt}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 15. MULTITUD CRECIENDO
// Puntos-silueta que van apareciendo hasta llenar una grilla -- prueba
// social de "cada vez mas gente", con un contador al lado.

export const MultitudCreciendo: React.FC<{titulo: string; hasta: number}> = ({titulo, hasta}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const cols = 12;
  const filas = 6;
  const total = cols * filas;
  const p = interpolate(t, [0.3, dur * 0.78], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const activos = Math.round(total * p);
  const valor = Math.round(hasta * p);
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 36, color: PALETA.texto, opacity: 0.8}}>{titulo}</div>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, width: '80%'}}>
        {Array.from({length: total}).map((_, i) => (
          <div key={i} style={{width: '100%', aspectRatio: '1 / 1', borderRadius: '50%', background: i < activos ? PALETA.acento : `${PALETA.texto}22`, transition: 'none'}} />
        ))}
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '80%', fontSize: 90, color: PALETA.acento, fontVariantNumeric: 'tabular-nums'}}>+{valor.toLocaleString('es-AR')}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 16. CHECK GIGANTE
// Un tilde enorme dibujandose sobre un circulo que se llena -- el
// "listo" mas directo que existe.

export const CheckGigante: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const circulo = spring({frame, fps, config: {damping: 200, stiffness: 90}});
  const check = interpolate(frame / fps, [0.5, 1.0], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pop = spring({frame: frame - 1.0 * fps, fps, config: {damping: 10, stiffness: 200, mass: 0.5}});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <div style={{transform: `scale(${1 + pop * 0.12})`}}>
        <svg width={280} height={280} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={44} fill="none" stroke={`${PALETA.texto}33`} strokeWidth={5} />
          <circle cx={50} cy={50} r={44} fill="none" stroke={PALETA.acento} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circulo} transform="rotate(-90 50 50)" />
          <path d="M 30 52 L 44 66 L 72 34" fill="none" stroke={PALETA.acento} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
        </svg>
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 52, color: PALETA.texto, textAlign: 'center', padding: '0 10%', opacity: check}}>{texto}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 17. FUEGOS
// Un texto/numero que estalla con lineas radiantes tipo fuego
// artificial -- reveal energico para un dato que hay que celebrar.

export const Fuegos: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = spring({frame: frame - 0.3 * fps, fps, config: {damping: 9, stiffness: 140, mass: 0.6}});
  const rayos = 16;
  return (
    <AbsoluteFill style={{backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width="100%" height="100%" viewBox="0 0 100 178" style={{position: 'absolute', inset: 0}}>
        {Array.from({length: rayos}).map((_, i) => {
          const ang = (360 / rayos) * i;
          const largo = interpolate(Math.min(1, p * 1.3), [0, 1], [0, 55]);
          const rad = (ang * Math.PI) / 180;
          const x2 = 50 + Math.cos(rad) * largo;
          const y2 = 89 + Math.sin(rad) * largo;
          return <line key={i} x1={50} y1={89} x2={x2} y2={y2} stroke={PALETA.acento} strokeWidth={0.6} opacity={Math.max(0, 1 - p * 0.6)} />;
        })}
      </svg>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '78%', fontSize: 90, color: '#fff', textAlign: 'center', padding: '0 8%', transform: `scale(${interpolate(Math.min(1, p), [0, 1], [0.3, 1])})`, opacity: Math.min(1, p * 2)}}>
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 18. RAYOS X
// Una linea de escaner baja sobre metraje real, y detras de la linea
// aparece una "capa" anotada con dibujo -- dibujo + video real en el
// mismo cuadro, cada uno mostrando lo que el otro no puede.

export const RayosX: React.FC<{clip: string; anotacion: {fig: NombreFigura; txt: string}[]}> = ({clip, anotacion}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const y = interpolate(t, [0.4, dur - 0.5], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fondo clip={clip} velo={0.2} zoom={[1.05, 1.12]} />
      <AbsoluteFill style={{clipPath: `inset(0 0 ${100 - y}% 0)`}}>
        <AbsoluteFill style={{background: '#04121c'}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36}}>
          {anotacion.map((a, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <Figura nombre={a.fig} p={1} col="#5ad1ff" tam={44} grosor={4} />
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 30, color: '#5ad1ff'}}>{a.txt}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: `${y}%`, height: 4, background: '#5ad1ff', boxShadow: '0 0 20px #5ad1ff', transform: 'translateY(-50%)'}} />
    </AbsoluteFill>
  );
};
