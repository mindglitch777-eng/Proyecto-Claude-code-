import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Figura, NombreFigura} from '../dibujo/figuras';
import {ALTO, ANCHO, GRADING, GROTESCA, PALETA, SERIF} from '../identidad';
import {Fondo} from './metraje';

// QUINTA TANDA (15): mas dibujo, mas metaforas, movimientos fluidos --
// el operador pidio seguir sumando hasta pasar los 100 formatos.

// ────────────────────────────────────────── 1. PUERTA QUE SE ABRE
// Una puerta dibujada se abre en perspectiva y revela lo que hay del
// otro lado -- metafora directa de "una oportunidad que se abre".

export const PuertaAbre: React.FC<{clip: string; texto: string}> = ({clip, texto}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const abre = interpolate(t, [0.4, dur * 0.65], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 3)});
  const anchoPuerta = 62 * (1 - abre);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fondo clip={clip} velo={0.25} zoom={[1.08, 1.15]} />
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 52, color: '#fff', textAlign: 'center', textShadow: '0 4px 20px rgba(0,0,0,0.9)', opacity: abre}}>{texto}</div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${anchoPuerta}%`, background: '#1c1c1e', boxShadow: '20px 0 40px rgba(0,0,0,0.6)', transformOrigin: 'left center', transform: `perspective(800px) rotateY(-${abre * 55}deg)`}}>
        <div style={{position: 'absolute', right: 14, top: '50%', width: 10, height: 10, borderRadius: '50%', background: PALETA.acento, transform: 'translateY(-50%)'}} />
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 2. GRAFICO DE TORTA
// Una torta que se arma trazo a trazo, porcion por porcion -- el
// reparto de algo (tiempo, ingresos) hecho dibujo.

export const GraficoTorta: React.FC<{titulo?: string; porciones: {txt: string; valor: number; acento?: boolean}[]}> = ({titulo, porciones}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const total = porciones.reduce((a, p) => a + p.valor, 0);
  let acumulado = 0;
  const arcos = porciones.map((p) => {
    const desde = (acumulado / total) * 360;
    acumulado += p.valor;
    const hasta = (acumulado / total) * 360;
    return {...p, desde, hasta};
  });
  const polar = (ang: number, r: number) => {
    const rad = ((ang - 90) * Math.PI) / 180;
    return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
  };
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      {titulo ? <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 36, color: PALETA.texto, opacity: 0.8}}>{titulo}</div> : null}
      <svg width={380} height={380} viewBox="0 0 100 100">
        {arcos.map((a, i) => {
          const t0 = 0.3 + i * 0.4;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 16, stiffness: 130}});
          const hastaAnim = a.desde + (a.hasta - a.desde) * s;
          const [x0, y0] = polar(a.desde, 42);
          const [x1, y1] = polar(hastaAnim, 42);
          const largo = hastaAnim - a.desde > 180 ? 1 : 0;
          if (s <= 0) return null;
          return <path key={i} d={`M 50 50 L ${x0} ${y0} A 42 42 0 ${largo} 1 ${x1} ${y1} Z`} fill={a.acento ? PALETA.acento : `${PALETA.texto}${33 + i * 22}`} stroke={PALETA.fondo} strokeWidth={0.6} />;
        })}
      </svg>
      <div style={{display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: '0 10%'}}>
        {porciones.map((p, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={{width: 16, height: 16, borderRadius: 4, background: p.acento ? PALETA.acento : `${PALETA.texto}${33 + i * 22}`}} />
            <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 24, color: PALETA.texto}}>{p.txt}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 3. BATERIA
// Un icono de bateria que se carga -- nivel de energia/avance, con
// rayo cuando llega al 100.

export const Bateria: React.FC<{titulo: string; hasta: number}> = ({titulo, hasta}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.4, dur * 0.75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 3)});
  const valor = Math.round(hasta * p);
  const lleno = valor >= hasta - 1;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 34, color: PALETA.texto, opacity: 0.8, textAlign: 'center', padding: '0 10%'}}>{titulo}</div>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <div style={{width: 260, height: 130, border: `6px solid ${PALETA.texto}`, borderRadius: 14, padding: 8, display: 'flex', alignItems: 'center'}}>
          <div style={{width: `${(valor / 100) * 100}%`, height: '100%', background: lleno ? '#2ecc71' : PALETA.acento, borderRadius: 6, transition: 'none'}} />
        </div>
        <div style={{width: 16, height: 50, background: PALETA.texto, borderRadius: '0 6px 6px 0'}} />
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '78%', fontSize: 76, color: lleno ? '#2ecc71' : PALETA.acento}}>{valor}%</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 4. ESCALERA
// Un punto sube escalones dibujados, uno por uno -- el progreso
// literal, paso a paso, hacia arriba.

export const Escalera: React.FC<{pasos: string[]}> = ({pasos}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const n = pasos.length;
  const anchoEscalon = 70 / n;
  const altoEscalon = 62 / n;
  const avance = interpolate(t, [0.3, dur - 0.6], [0, n - 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 2)});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, padding: '9% 8%'}}>
      <svg width="100%" height="78%" viewBox="0 0 100 100" style={{overflow: 'visible'}}>
        {pasos.map((_, i) => {
          // el escalon i ocupa desde el piso (90) hasta su propio
          // "techo" -- (i+1) escalones de alto, nunca 0 -- antes el
          // primero quedaba con altura cero y los del medio, del mismo
          // color, se fundian en un solo bloque sin separacion visible.
          const x = 10 + i * anchoEscalon;
          const y = 90 - (i + 1) * altoEscalon;
          const t0 = 0.15 + i * 0.18;
          const s = Math.max(0, Math.min(1, (t - t0) / 0.3));
          return (
            <rect
              key={i} x={x} y={y} width={anchoEscalon} height={90 - y}
              fill={i <= avance + 0.01 ? PALETA.acento : '#26262a'}
              stroke={PALETA.fondo} strokeWidth={1.2}
              opacity={s}
            />
          );
        })}
        {(() => {
          const idx = Math.min(n - 1, avance);
          const i0 = Math.floor(idx);
          const i1 = Math.min(n - 1, i0 + 1);
          const f = idx - i0;
          const cx = (i: number) => 10 + i * anchoEscalon + anchoEscalon / 2;
          const cy = (i: number) => 90 - (i + 1) * altoEscalon - 7;
          return <circle cx={cx(i0) + (cx(i1) - cx(i0)) * f} cy={cy(i0) + (cy(i1) - cy(i0)) * f} r={5} fill="#fff" stroke={PALETA.acento} strokeWidth={1.5} />;
        })()}
      </svg>
      <div style={{display: 'flex', justifyContent: 'space-between', padding: '0 2%'}}>
        {pasos.map((p, i) => (
          <div key={i} style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 24, color: i <= avance + 0.01 ? PALETA.texto : `${PALETA.texto}55`, textAlign: 'center', width: `${anchoEscalon}%`}}>{p}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 5. TROFEO
// Una copa dibujada que se eleva con un resplandor -- el remate de
// "esto es un logro", sin depender de texto solo.

export const Trofeo: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 100, mass: 0.9}});
  const trazo = Math.max(0, Math.min(1, s * 1.3));
  return (
    <AbsoluteFill style={{backgroundColor: '#0d0d10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <div style={{position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${PALETA.acento}44, transparent 65%)`, opacity: Math.min(1, s * 1.5)}} />
      <svg width={200} height={220} viewBox="0 0 100 110" style={{transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) scale(${interpolate(s, [0, 1], [0.7, 1])})`, opacity: Math.min(1, s * 2)}}>
        <path d="M 30 10 L 70 10 L 68 40 Q 68 58 50 58 Q 32 58 32 40 Z" fill="none" stroke={PALETA.acento} strokeWidth={3} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trazo} />
        <path d="M 30 14 C 14 14 14 34 30 34" fill="none" stroke={PALETA.acento} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trazo} />
        <path d="M 70 14 C 86 14 86 34 70 34" fill="none" stroke={PALETA.acento} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trazo} />
        <line x1={50} y1={58} x2={50} y2={78} stroke={PALETA.acento} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trazo} />
        <line x1={34} y1={94} x2={66} y2={94} stroke={PALETA.acento} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trazo} />
        <path d="M 30 78 L 70 78 L 66 94 L 34 94 Z" fill="none" stroke={PALETA.acento} strokeWidth={3} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trazo} />
      </svg>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 48, color: '#fff', textAlign: 'center', padding: '0 10%', opacity: Math.min(1, s * 2)}}>{texto}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 6. AVION DE PAPEL
// Un avioncito de papel vuela en arco dejando una estela punteada --
// la idea que despega, liviana y directa.

export const AvionPapel: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.3, dur * 0.75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x = 12 + p * 76;
  const y = 70 - Math.sin(p * Math.PI) * 45;
  const angulo = -40 + p * 30;
  const textoOp = interpolate(p, [0.75, 1], [0, 1], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 24}).map((_, i) => {
          const f = i / 23;
          if (f > p) return null;
          const ex = 12 + f * 76;
          const ey = 70 - Math.sin(f * Math.PI) * 45;
          return <circle key={i} cx={ex} cy={ey} r={0.5} fill={PALETA.texto} opacity={0.3} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) rotate(${angulo}deg)`}}>
        <svg width={100} height={100} viewBox="0 0 24 24">
          <path d="M2 12 L22 3 L14 22 L11 14 L2 12 Z" fill={PALETA.acento} stroke={PALETA.acento} strokeLinejoin="round" />
          <path d="M11 14 L22 3" stroke={PALETA.fondo} strokeWidth={0.6} />
        </svg>
      </div>
      <div style={{position: 'absolute', bottom: '14%', left: 0, right: 0, textAlign: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 46, color: PALETA.texto, padding: '0 10%', opacity: textoOp}}>{texto}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 7. NUDO QUE SE DESATA
// Un nudo dibujado se afloja hasta quedar en una linea recta -- el
// problema complicado que se simplifica.

export const NudoDesatado: React.FC<{antes: string; despues: string}> = ({antes, despues}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.4, dur * 0.72], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nudo = 'M 10 50 C 25 20, 35 80, 50 50 C 65 20, 75 80, 90 50';
  const recta = 'M 10 50 L 90 50';
  const textoOp1 = interpolate(p, [0, 0.3], [1, 0], {extrapolateRight: 'clamp'});
  const textoOp2 = interpolate(p, [0.7, 1], [0, 1], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <svg width="80%" height={140} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={p < 1 ? nudo : recta} fill="none" stroke={PALETA.acento} strokeWidth={3} strokeLinecap="round" style={{transition: 'none'}} opacity={1} strokeDasharray={p < 1 ? undefined : undefined} />
      </svg>
      <div style={{position: 'relative', height: 60}}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROTESCA, fontWeight: 700, fontSize: 40, color: PALETA.texto, opacity: textoOp1}}>{antes}</div>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 44, color: PALETA.acento, opacity: textoOp2}}>{despues}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 8. FARO
// Un faro dibujado con el haz de luz girando -- guia en medio de la
// confusion, barre la pantalla y "encuentra" el texto.

export const Faro: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const giro = (t * 55) % 360;
  const encontrado = Math.abs(((giro - 200 + 540) % 360) - 180) < 30;
  return (
    <AbsoluteFill style={{backgroundColor: '#04070d', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: '15%', bottom: 0, transformOrigin: 'bottom center'}}>
        <svg width={140} height={260} viewBox="0 0 60 120">
          <path d="M 20 20 L 40 20 L 44 110 L 16 110 Z" fill="#1c2530" stroke="#3a4656" strokeWidth={1.5} />
          <rect x={18} y={8} width={24} height={14} fill="#f4d35e" stroke="#3a4656" strokeWidth={1.5} />
          <path d="M 14 8 L 46 8 L 40 0 L 20 0 Z" fill="#7a1010" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: '19%', bottom: '76%', width: 1200, height: 90, transformOrigin: 'left center', transform: `rotate(${giro}deg)`, background: 'linear-gradient(to right, rgba(244,211,94,0.5), transparent)', clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)'}} />
      <div style={{position: 'absolute', bottom: '18%', left: 0, right: 0, textAlign: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 48, color: '#fff', padding: '0 10%', opacity: encontrado ? 1 : 0.15, textShadow: '0 4px 20px rgba(0,0,0,0.9)'}}>{texto}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 9. LINEA DE META
// Una bandera a cuadros dibujandose y una linea de meta -- el cierre
// de una carrera, para un "listo, se llego".

export const LineaMeta: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const ondea = Math.sin(t * 3) * 6;
  const cuadros = 6;
  const filas = 4;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <div style={{width: 220, height: 150, position: 'relative', transform: `perspective(400px) rotateY(${ondea}deg)`}}>
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${cuadros}, 1fr)`, width: '100%', height: '100%'}}>
          {Array.from({length: cuadros * filas}).map((_, i) => {
            const col = i % cuadros;
            const fila = Math.floor(i / cuadros);
            const negro = (col + fila) % 2 === 0;
            return <div key={i} style={{background: negro ? '#111' : '#fff'}} />;
          })}
        </div>
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 52, color: PALETA.acento, textAlign: 'center', padding: '0 10%'}}>{texto}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 10. PLANTA CRECIENDO
// Un tallo con hojas se dibuja creciendo desde una maceta -- metafora
// organica de crecimiento sostenido, no de golpe.

export const PlantaCreciendo: React.FC<{etapas: {altura: number; txt: string}[]}> = ({etapas}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const maxAltura = Math.max(...etapas.map((e) => e.altura));
  const p = interpolate(t, [0.4, dur - 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const alturaTallo = p * 70;
  const etapaActual = etapas.filter((e) => (e.altura / maxAltura) * 70 <= alturaTallo).length - 1;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '10%'}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 34, color: PALETA.acento, marginBottom: 20, opacity: etapaActual >= 0 ? 1 : 0}}>
        {etapaActual >= 0 ? etapas[etapaActual].txt : ''}
      </div>
      <svg width={200} height={360} viewBox="0 0 100 180">
        <line x1={50} y1={160} x2={50} y2={160 - alturaTallo} stroke="#3a8f52" strokeWidth={3} strokeLinecap="round" />
        {etapas.map((e, i) => {
          const y = 160 - (e.altura / maxAltura) * 70;
          if (alturaTallo < 160 - y - 5) return null;
          const s = Math.min(1, (alturaTallo - (160 - y - 5)) / 8);
          return (
            <g key={i} opacity={Math.max(0, s)}>
              <path d={`M 50 ${y} Q ${38 - i * 2} ${y - 8} 34 ${y - 4}`} fill="none" stroke="#3a8f52" strokeWidth={2.5} strokeLinecap="round" />
              <path d={`M 50 ${y} Q ${62 + i * 2} ${y - 10} 66 ${y - 6}`} fill="none" stroke="#3a8f52" strokeWidth={2.5} strokeLinecap="round" />
            </g>
          );
        })}
        <path d="M 30 160 L 70 160 L 66 178 L 34 178 Z" fill="#7a4a2a" />
      </svg>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 11. BUZON DE CARTAS
// Sobres cayendo dentro de un buzon dibujado, con contador -- la
// bandeja de entrada llenandose de gente interesada.

export const BuzonCartas: React.FC<{titulo: string; hasta: number}> = ({titulo, hasta}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.3, dur * 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const valor = Math.round(hasta * p);
  const sobres = 5;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 34, color: PALETA.texto, opacity: 0.8, textAlign: 'center'}}>{titulo}</div>
      <div style={{position: 'relative', width: 260, height: 220}}>
        {Array.from({length: sobres}).map((_, i) => {
          const t0 = 0.3 + i * (dur * 0.12);
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 12, stiffness: 140}});
          const y = interpolate(s, [0, 1], [-140, 40 + i * 6]);
          return (
            <div key={i} style={{position: 'absolute', left: '50%', top: y, transform: `translateX(-50%) rotate(${(i - 2) * 4}deg)`, opacity: Math.min(1, s * 2)}}>
              <svg width={90} height={60} viewBox="0 0 60 40">
                <rect x={1} y={1} width={58} height={38} rx={3} fill="#f4f4f6" stroke="#999" strokeWidth={1.4} />
                <path d="M 1 3 L 30 24 L 59 3" fill="none" stroke="#999" strokeWidth={1.4} />
              </svg>
            </div>
          );
        })}
        <svg width={260} height={110} viewBox="0 0 140 60" style={{position: 'absolute', bottom: 0}}>
          <rect x={4} y={10} width={132} height={46} rx={8} fill="#1c1c1e" stroke={PALETA.acento} strokeWidth={2} />
          <rect x={4} y={10} width={132} height={16} rx={8} fill="#111" />
        </svg>
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '78%', fontSize: 70, color: PALETA.acento}}>+{valor}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 12. SELLO DE APROBADO
// Un sello de goma golpea el papel y deja estampado "APROBADO" -- el
// veredicto final, con el golpe y la marca ligeramente torcida.

export const SelloAprobado: React.FC<{texto?: string; subtitulo: string}> = ({texto = 'APROBADO', subtitulo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 7, stiffness: 260, mass: 0.6}});
  const golpeado = s > 0.5;
  return (
    <AbsoluteFill style={{backgroundColor: '#efe9db', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: '20%', left: 0, right: 0, textAlign: 'center', fontFamily: GROTESCA, fontWeight: 600, fontSize: 30, color: '#5a4d38', opacity: golpeado ? 1 : 0}}>{subtitulo}</div>
      <div
        style={{
          border: '6px solid #7a1010', borderRadius: 16, padding: '18px 40px', transform: `translateY(${interpolate(s, [0, 0.5], [-300, 0], {extrapolateRight: 'clamp'})}px) rotate(-8deg) scale(${golpeado ? 1 : 1.4})`,
          opacity: Math.min(1, s * 2),
        }}
      >
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 50, color: '#7a1010', letterSpacing: '0.08em'}}>{texto}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 13. OJO QUE SE ABRE
// Un ojo grande, dibujado, se abre despacio -- el momento exacto de
// "darse cuenta" de algo.

export const OjoAbre: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const abre = interpolate(t, [0.3, dur * 0.55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const textoOp = interpolate(t, [dur * 0.6, dur * 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <svg width={420} height={240} viewBox="0 0 100 60">
        <path d={`M 5 30 Q 50 ${30 - abre * 26} 95 30 Q 50 ${30 + abre * 26} 5 30 Z`} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinejoin="round" />
        <circle cx={50} cy={30} r={abre * 11} fill={PALETA.acento} opacity={abre} />
        <circle cx={50} cy={30} r={abre * 4.5} fill="#000" opacity={abre} />
      </svg>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 48, color: '#fff', textAlign: 'center', padding: '0 10%', opacity: textoOp}}>{texto}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 14. CONTADOR DE ME GUSTA
// Un marco tipo red social con un corazon que late y un contador que
// sube -- prueba social directa, formato reconocible al toque.

export const ContadorLikes: React.FC<{clip: string; hasta: number}> = ({clip, hasta}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const p = interpolate(t, [0.3, dur * 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const valor = Math.round(hasta * p);
  const latido = 1 + Math.max(0, Math.sin(t * 6)) * 0.12;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fondo clip={clip} velo={0.35} zoom={[1.05, 1.12]} />
      <div style={{position: 'absolute', bottom: '16%', left: '8%', display: 'flex', alignItems: 'center', gap: 16}}>
        <svg width={56} height={56} viewBox="0 0 24 24" style={{transform: `scale(${latido})`}}>
          <path d="M12 21 C 6 15, 2 11, 2 7.5 C 2 4.5, 4.5 2, 7.5 2 C 9.5 2, 11 3, 12 4.5 C 13 3, 14.5 2, 16.5 2 C 19.5 2, 22 4.5, 22 7.5 C 22 11, 18 15, 12 21 Z" fill={PALETA.acento} />
        </svg>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 46, color: '#fff', textShadow: '0 4px 16px rgba(0,0,0,0.8)'}}>{valor.toLocaleString('es-AR')}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 15. FLASH DE CAMARA
// Una sola foto instantanea: flash blanco y la imagen "eyectandose"
// hacia abajo -- distinto del stack de Polaroids, esto es UNA captura
// puntual, para marcar "esto quedo registrado".

export const FlashCamara: React.FC<{clip: string; leyenda: string}> = ({clip, leyenda}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const flash = interpolate(t, [0.15, 0.35], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const eyeccion = interpolate(t, [0.35, dur * 0.6], [-10, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 3)});
  return (
    <AbsoluteFill style={{backgroundColor: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 360, background: '#fafafa', padding: '16px 16px 60px 16px', borderRadius: 4, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', transform: `translateY(${eyeccion}%)`}}>
        <div style={{width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', background: '#000'}}>
          <OffthreadVideo src={staticFile(`video/${clip}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADING}} />
        </div>
        <div style={{marginTop: 18, fontFamily: SERIF, fontStyle: 'italic', fontSize: 26, color: '#222', textAlign: 'center'}}>{leyenda}</div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
