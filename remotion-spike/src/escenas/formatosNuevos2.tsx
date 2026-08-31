import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALTO, ANCHO, GRADING, GROTESCA, PALETA, SERIF} from '../identidad';
import {Fondo} from './metraje';

// SEGUNDA TANDA: 12 mecanismos mas
//
// Distintos de los 20 de formatosNuevos.tsx y de la biblioteca de
// receta/. Inspirados en recursos de edicion profesional actual
// (tablero de corcho, VHS, split-diopter, exploded view, slider de
// comparacion, odometro, etc.), no en decoracion -- cada uno es una
// forma de MOSTRAR una idea, para usarse como pieza dentro de un
// formato de video completo (ver FormatoCompleto.tsx), no solo)."

// ────────────────────────────────────────── 1. TABLERO DE CORCHO
// Fotos y notas clavadas con chinches, unidas por hilo -- el recurso de
// "investigacion" que tanto se ve en true crime y en contenido de
// negocios ("conectando los puntos").

export const Corcho: React.FC<{
  titulo?: string;
  notas: {x: number; y: number; txt?: string; clip?: string}[];
  conexiones?: [number, number][];
}> = ({titulo, notas, conexiones = []}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{backgroundColor: '#3b2a1d'}}>
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 2px, transparent 2px, transparent 4px)'}} />
      {titulo ? (
        <div style={{position: 'absolute', top: '6%', left: '8%', right: '8%', fontFamily: GROTESCA, fontWeight: 800, fontSize: 44, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,0.6)'}}>
          {titulo}
        </div>
      ) : null}
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}} viewBox="0 0 100 178">
        {conexiones.map(([a, b], i) => {
          const t0 = 0.5 + i * 0.4;
          const trazo = Math.max(0, Math.min(1, (t - t0) / 0.5));
          if (trazo <= 0) return null;
          const A = notas[a];
          const B = notas[b];
          return (
            <line
              key={i} x1={A.x} y1={A.y * 1.78} x2={A.x + (B.x - A.x) * trazo} y2={(A.y + (B.y - A.y) * trazo) * 1.78}
              stroke="#c0392b" strokeWidth={0.5} opacity={0.85}
            />
          );
        })}
      </svg>
      {notas.map((n, i) => {
        const t0 = 0.2 + i * 0.4;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 14, stiffness: 170}});
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: `${n.x}%`, top: `${n.y}%`, transform: `translate(-50%,-50%) rotate(${(i % 2 ? -4 : 3)}deg) scale(${interpolate(s, [0, 1], [0.5, 1])})`,
              opacity: Math.min(1, s * 2), display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            <div style={{width: 14, height: 14, borderRadius: 7, background: '#d64545', boxShadow: '0 2px 4px rgba(0,0,0,0.5)', position: 'absolute', top: -8, zIndex: 2}} />
            {n.clip ? (
              <div style={{width: 200, height: 140, background: '#fff', padding: 8, boxShadow: '0 8px 18px rgba(0,0,0,0.5)'}}>
                <OffthreadVideo src={staticFile(`video/${n.clip}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
            ) : (
              <div style={{width: 200, background: '#fdf6d8', padding: '18px 16px', boxShadow: '0 8px 18px rgba(0,0,0,0.5)'}}>
                <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 24, color: '#2a2a2a', lineHeight: 1.15}}>{n.txt}</div>
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 2. VHS REWIND
// Rebobinado de cinta: barras de tracking, timecode corriendo para
// atras, franjas de ruido -- para un "volvamos un poco atras".

export const VhsRewind: React.FC<{clip: string; texto: string}> = ({clip, texto}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const tc = Math.max(0, 3600 - Math.floor(t * 90));
  const hh = String(Math.floor(tc / 3600)).padStart(2, '0');
  const mm = String(Math.floor((tc % 3600) / 60)).padStart(2, '0');
  const ss = String(tc % 60).padStart(2, '0');
  const salto = frame % 5 < 1;
  return (
    <AbsoluteFill style={{backgroundColor: '#000', filter: 'saturate(1.3) contrast(1.05)'}}>
      <Fondo clip={clip} velo={0.25} zoom={[1.15, 1.0]} />
      {[18, 52, 81].map((y, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: `${y + Math.sin(t * 3 + i) * 1.5}%`, height: 10, background: 'rgba(255,255,255,0.15)', mixBlendMode: 'overlay'}} />
      ))}
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, transparent 1px, transparent 3px)'}} />
      <div style={{position: 'absolute', top: '6%', left: '7%', display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{display: 'flex', gap: 3}}>
          {[0, 1, 2].map((i) => <div key={i} style={{width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderRight: '14px solid #fff', opacity: 0.9}} />)}
        </div>
        <div style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 30, color: '#fff'}}>REW</div>
      </div>
      <div style={{position: 'absolute', bottom: '8%', left: '7%', fontFamily: 'monospace', fontWeight: 700, fontSize: 34, color: '#fff', opacity: salto ? 0.4 : 1}}>
        {hh}:{mm}:{ss}
      </div>
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10%'}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 58, color: '#fff', textAlign: 'center', textShadow: '0 4px 20px rgba(0,0,0,0.9)', opacity: interpolate(t, [dur * 0.35, dur * 0.55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          {texto}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 3. SPLIT-DIOPTER
// Dos planos nítidos a la vez, separados por una costura vertical con
// blur -- el truco de foco partido que usa el cine para "dos cosas
// importan al mismo tiempo", sin cortar la pantalla en dos mitades
// iguales y aburridas.

export const SplitDiopter: React.FC<{
  izq: {clip: string; rotulo: string};
  der: {clip: string; rotulo: string};
}> = ({izq, der}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 20, stiffness: 90}});
  const corte = interpolate(s, [0, 1], [50, 42]);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - corte}% 0 0)`}}>
        <Fondo clip={izq.clip} velo={0.35} zoom={[1.1, 1.18]} />
      </div>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${corte}%)`}}>
        <Fondo clip={der.clip} velo={0.35} zoom={[1.18, 1.1]} />
      </div>
      <div style={{position: 'absolute', left: `${corte}%`, top: 0, bottom: 0, width: 40, transform: 'translateX(-50%)', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.55), transparent)', filter: 'blur(6px)'}} />
      <div style={{position: 'absolute', bottom: '11%', left: '5%', maxWidth: `${corte - 8}%`}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 42, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.9)'}}>{izq.rotulo}</div>
      </div>
      <div style={{position: 'absolute', bottom: '11%', right: '5%', maxWidth: `${98 - corte}%`, textAlign: 'right'}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 42, color: PALETA.acento, textShadow: '0 4px 20px rgba(0,0,0,0.9)'}}>{der.rotulo}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 4. DESLIZADOR ANTES/DESPUES
// El slider de comparacion que todo el mundo reconoce de las fotos de
// reformas -- aca la manija se mueve sola, no hace falta arrastrar.

export const Deslizador: React.FC<{antes: {clip: string; rotulo: string}; despues: {clip: string; rotulo: string}}> = ({antes, despues}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const x = interpolate(t, [0.5, dur - 0.6], [14, 86], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 2)});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fondo clip={despues.clip} velo={0.3} zoom={[1.05, 1.12]} />
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - x}% 0 0)`}}>
        <Fondo clip={antes.clip} velo={0.3} duotono zoom={[1.05, 1.12]} />
      </div>
      <div style={{position: 'absolute', left: `${x}%`, top: 0, bottom: 0, width: 5, background: '#fff', transform: 'translateX(-50%)', boxShadow: '0 0 20px rgba(0,0,0,0.6)'}} />
      <div style={{position: 'absolute', left: `${x}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 64, height: 64, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.5)'}}>
        <div style={{display: 'flex', gap: 4}}>
          <div style={{width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '10px solid #111'}} />
          <div style={{width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '10px solid #111'}} />
        </div>
      </div>
      <div style={{position: 'absolute', top: '9%', left: '6%', fontFamily: GROTESCA, fontWeight: 700, fontSize: 32, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', opacity: interpolate(x, [14, 30], [1, 0], {extrapolateRight: 'clamp'})}}>{antes.rotulo}</div>
      <div style={{position: 'absolute', top: '9%', right: '6%', fontFamily: GROTESCA, fontWeight: 700, fontSize: 32, letterSpacing: '0.1em', textTransform: 'uppercase', color: PALETA.acento, opacity: interpolate(x, [70, 86], [0, 1], {extrapolateLeft: 'clamp'})}}>{despues.rotulo}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 5. VISTA EXPLOTADA
// Las piezas de algo se separan para mostrar de que esta hecho por
// dentro -- el recurso de video de producto/tech, aplicado a un
// "metodo" en vez de un objeto.

export const VistaExplotada: React.FC<{titulo?: string; piezas: {txt: string; y: number}[]}> = ({titulo, piezas}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 15, stiffness: 60, mass: 1.1}});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0}}>
      {titulo ? <div style={{position: 'absolute', top: '9%', fontFamily: GROTESCA, fontWeight: 700, fontSize: 40, color: PALETA.texto, opacity: 0.75}}>{titulo}</div> : null}
      {piezas.map((p, i) => {
        const centro = (piezas.length - 1) / 2;
        const despl = (i - centro) * 90 * s;
        return (
          <div
            key={i}
            style={{
              width: '62%', height: 64, marginTop: i === 0 ? 0 : -8, background: i % 2 ? PALETA.acento : '#232323',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `translateY(${despl}px)`, boxShadow: '0 10px 26px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 30, color: i % 2 ? '#1a0a04' : '#fff'}}>{p.txt}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 6. PRECIO TACHADO
// Cartel de oferta: precio grande tachado y el nuevo precio golpeando
// al lado -- codigo visual universal de "esto vale mucho mas".

export const PrecioTachado: React.FC<{antes: string; ahora: string; leyenda?: string}> = ({antes, ahora, leyenda}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const tacha = Math.max(0, Math.min(1, (t - 0.5) / 0.35));
  const s = spring({frame: frame - 0.9 * fps, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.acento, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
      <div style={{position: 'relative'}}>
        <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 74, color: '#1a0a04', opacity: 0.55}}>{antes}</div>
        <svg width="100%" height={10} style={{position: 'absolute', left: 0, top: '50%'}}>
          <line x1={0} y1={5} x2="100%" y2={5} stroke="#1a0a04" strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tacha} />
        </svg>
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '76%', fontSize: 168, lineHeight: 1, color: '#1a0a04', transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, opacity: Math.min(1, s * 2)}}>
        {ahora}
      </div>
      {leyenda ? <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 36, color: '#1a0a04', opacity: 0.75}}>{leyenda}</div> : null}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 7. MONITOR CARDIACO
// Una linea de latidos plana que de golpe pega un pico -- la metafora
// visual mas directa que hay para "esto cambio todo de golpe".

export const MonitorCardiaco: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const avance = interpolate(t, [0.2, dur - 0.3], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tPico = dur * 0.5;
  const path = (() => {
    let d = 'M 0 50';
    const pasos = 60;
    for (let i = 1; i <= pasos; i++) {
      const x = (i / pasos) * 100;
      const esPico = Math.abs(x - 50) < 3;
      const y = esPico ? (i % 2 === 0 ? 8 : 92) : 50 + Math.sin(i * 0.9) * 1.5;
      d += ` L ${x} ${y}`;
    }
    return d;
  })();
  return (
    <AbsoluteFill style={{backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width="90%" height={220} viewBox="0 0 100 100" preserveAspectRatio="none" style={{overflow: 'visible'}}>
        <path d={path} fill="none" stroke="#2ecc71" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - avance / 100} />
      </svg>
      <div style={{position: 'absolute', bottom: '26%', fontFamily: GROTESCA, fontWeight: 800, fontSize: 60, color: '#fff', textAlign: 'center', padding: '0 10%', opacity: interpolate(t, [tPico + 0.1, tPico + 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 8. POLAROIDS
// Fotos tipo polaroid cayendo una sobre otra en una mesa, cada una con
// su leyenda escrita abajo -- el "photo dump" que domina hoy el feed.

export const Polaroids: React.FC<{items: {clip: string; leyenda: string}[]}> = ({items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {items.map((it, i) => {
        const t0 = 0.25 + i * 0.7;
        const s = spring({frame: frame - t0 * fps, fps, config: {damping: 11, stiffness: 140, mass: 0.9}});
        const rot = (i % 2 === 0 ? -1 : 1) * (6 + i * 2.4);
        const offX = (i - (items.length - 1) / 2) * 46;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', width: 320, background: '#fafafa', padding: '18px 18px 60px 18px', borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              transform: `translate(${offX}px, ${interpolate(s, [0, 1], [-500, 0])}px) rotate(${rot * s}deg)`,
              opacity: Math.min(1, s * 2),
            }}
          >
            <div style={{width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', background: '#000'}}>
              <OffthreadVideo src={staticFile(`video/${it.clip}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADING}} />
            </div>
            <div style={{marginTop: 16, fontFamily: SERIF, fontStyle: 'italic', fontSize: 24, color: '#222', textAlign: 'center'}}>{it.leyenda}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 9. MARCADOR FLUO
// Una frase se subraya con marcador fluorescente, trazo a trazo, como
// resaltar lo importante de un apunte -- para una cita o definicion.

export const MarcadorFluo: React.FC<{frase: string; color?: string}> = ({frase, color = '#fff85e'}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const trazo = interpolate(t, [dur * 0.35, dur * 0.62], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10%'}}>
      <div style={{position: 'relative', display: 'inline-block'}}>
        <div style={{position: 'absolute', left: 0, top: '18%', height: '64%', width: `${trazo}%`, background: color, opacity: 0.75, borderRadius: 4}} />
        <div style={{position: 'relative', fontFamily: SERIF, fontWeight: 700, fontSize: 62, lineHeight: 1.2, color: '#f4f4f4', textAlign: 'center'}}>{frase}</div>
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 10. ODOMETRO
// Digitos que giran como ruleta mecanica hasta frenar en el numero
// final -- mas "aparato viejo" que el contador liso, mas dramatico.

export const Odometro: React.FC<{arriba?: string; hasta: number; sufijo?: string}> = ({arriba, hasta, sufijo = ''}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const digitos = String(hasta).split('');
  const p = interpolate(t, [0.3, dur * 0.75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (k) => 1 - Math.pow(1 - k, 3)});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      {arriba ? <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 40, color: PALETA.texto, opacity: 0.8}}>{arriba}</div> : null}
      <div style={{display: 'flex', gap: 8, background: '#111', padding: '20px 26px', borderRadius: 10}}>
        {digitos.map((d, i) => {
          const objetivo = Number(d);
          // la fila k de la tira muestra el digito (k % 10) en orden normal;
          // se elige como fila FINAL 30+objetivo (siempre dentro de la tira
          // de 40 filas) para que el indice de llegada sea exacto, en vez de
          // calcularlo con modulo -- eso es lo que antes hacia que la rueda
          // frenara en un numero distinto del pedido.
          const filaFinal = 30 + (Number.isNaN(objetivo) ? 0 : objetivo);
          const fila = interpolate(p, [0, 1], [0, filaFinal]);
          const y = -fila * 74;
          return (
            <div key={i} style={{width: 56, height: 74, overflow: 'hidden', position: 'relative'}}>
              {Number.isNaN(objetivo) ? (
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 60, color: PALETA.acento}}>{d}</div>
              ) : (
                <div style={{position: 'absolute', left: 0, top: y, transition: 'none'}}>
                  {Array.from({length: 41}).map((_, k) => (
                    <div key={k} style={{height: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 60, color: PALETA.texto, fontVariantNumeric: 'tabular-nums'}}>
                      {k % 10}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {sufijo ? <div style={{display: 'flex', alignItems: 'center', fontFamily: GROTESCA, fontWeight: 800, fontSize: 44, color: PALETA.acento}}>{sufijo}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 11. MAPA RECORRIDO
// Una linea de ruta se traza sobre un mapa estilizado (sin tiles
// reales) hasta un pin que cae en el destino -- "de un punto A a un B".

export const MapaRecorrido: React.FC<{desde: string; hasta: string}> = ({desde, hasta}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const trazo = interpolate(t, [0.4, dur * 0.68], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pin = spring({frame: frame - dur * 0.68 * fps, fps, config: {damping: 10, stiffness: 200, mass: 0.7}});
  const path = 'M 15 75 C 30 40, 45 90, 60 55 S 80 25, 85 20';
  return (
    <AbsoluteFill style={{backgroundColor: '#0d1a14'}}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, opacity: 0.35}}>
        {Array.from({length: 8}).map((_, i) => <line key={'h' + i} x1={0} y1={i * 13} x2={100} y2={i * 13} stroke="#2c5c46" strokeWidth={0.3} />)}
        {Array.from({length: 8}).map((_, i) => <line key={'v' + i} x1={i * 13} y1={0} x2={i * 13} y2={100} stroke="#2c5c46" strokeWidth={0.3} />)}
      </svg>
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={path} fill="none" stroke={PALETA.acento} strokeWidth={1.4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trazo} />
        <circle cx={15} cy={75} r={1.6} fill="#fff" />
      </svg>
      <div style={{position: 'absolute', left: '15%', top: '75%', transform: 'translate(-50%,120%)', fontFamily: GROTESCA, fontWeight: 700, fontSize: 26, color: '#fff'}}>{desde}</div>
      <div style={{position: 'absolute', left: '85%', top: '20%', transform: `translate(-50%, ${interpolate(pin, [0, 1], [-140, -40])}%)`, opacity: trazo > 0.9 ? 1 : 0}}>
        <div style={{width: 26, height: 26, borderRadius: '50% 50% 50% 0', background: PALETA.acento, transform: 'rotate(-45deg)'}} />
      </div>
      <div style={{position: 'absolute', left: '85%', top: '20%', transform: 'translate(-50%,30px)', fontFamily: GROTESCA, fontWeight: 700, fontSize: 26, color: PALETA.acento, opacity: interpolate(trazo, [0.9, 1], [0, 1], {extrapolateLeft: 'clamp'})}}>{hasta}</div>
    </AbsoluteFill>
  );
};

// ────────────────────────────────────────── 12. GRABACION DE PANTALLA
// Mockup de celular con un "toque" fantasma recorriendo una pantalla de
// app -- el recurso de screen-recording que domina los tutoriales.

export const GrabacionPantalla: React.FC<{titulo: string; pasos: string[]}> = ({titulo, pasos}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const paso = dur / pasos.length;
  const activo = Math.min(pasos.length - 1, Math.floor(t / paso));
  const localT = (t - activo * paso) / paso;
  const toqueY = interpolate(localT, [0.3, 0.6], [1, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const escalaToque = localT > 0.35 && localT < 0.55 ? 0.7 : 1;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 400, height: 760, borderRadius: 44, border: '10px solid #1c1c1e', background: '#fff', overflow: 'hidden', position: 'relative', boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
        <div style={{background: '#f4f4f6', padding: '26px 24px 18px', borderBottom: '1px solid #e2e2e6'}}>
          <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 22, color: '#111'}}>{titulo}</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 14, padding: 22}}>
          {pasos.map((p, i) => (
            <div
              key={i}
              style={{
                padding: '18px 20px', borderRadius: 14, background: i === activo ? PALETA.acento : '#f1f1f3',
                fontFamily: GROTESCA, fontWeight: 700, fontSize: 22, color: i === activo ? '#1a0a04' : '#222',
                transform: `scale(${i === activo ? 1.02 : 1})`,
              }}
            >
              {p}
            </div>
          ))}
        </div>
        <div
          style={{
            position: 'absolute', left: '50%', top: 92 + activo * 76 + 22, width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(0,0,0,0.28)', border: '2px solid rgba(0,0,0,0.4)',
            transform: `translate(-50%,-50%) scale(${escalaToque})`, opacity: toqueY,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
