import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {GROTESCA, PALETA} from '../identidad';

// LOGOS DE HERRAMIENTAS
//
// No hay archivos de logo reales adentro del render (serian marcas
// registradas de terceros pegadas como imagen) -- en cambio cada
// herramienta es una chapita con SU color de marca real y su nombre.
// Es lo mismo que ya se aprobo para el stress test: mostrar que
// herramienta se uso, con su color, sin vender nada con eso.

export type Herramienta = {nombre: string; color: string; texto?: string};

export const LogosHerramientas: React.FC<{
  titulo?: string;
  items: Herramienta[];
  pie?: string;
}> = ({titulo, items, pie}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;

  return (
    <AbsoluteFill
      style={{backgroundColor: PALETA.fondo, padding: '0 7%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 46}}
    >
      {titulo ? (
        <div
          style={{
            fontFamily: GROTESCA, fontWeight: 700, fontSize: 44, color: PALETA.texto, opacity: 0.6,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}
        >
          {titulo}
        </div>
      ) : null}
      <div style={{display: 'flex', flexDirection: 'column', gap: 28}}>
        {items.map((h, i) => {
          const t0 = 0.25 + i * 0.4;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 15, stiffness: 220, mass: 0.5}});
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 26,
                opacity: Math.min(1, s * 2),
                transform: `translateX(${interpolate(s, [0, 1], [-36, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 20, height: 20, borderRadius: 6, background: h.color,
                  transform: `scale(${interpolate(s, [0, 1], [0.4, 1])})`,
                  flexShrink: 0,
                }}
              />
              <div style={{fontFamily: GROTESCA, fontWeight: 800, fontSize: 58, color: PALETA.texto}}>
                {h.nombre}
              </div>
              {h.texto ? (
                <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 34, color: PALETA.texto, opacity: 0.55}}>
                  {h.texto}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {pie ? (
        <div
          style={{
            fontFamily: GROTESCA, fontWeight: 600, fontSize: 36, color: PALETA.texto,
            opacity: interpolate(t, [dur * 0.55, dur * 0.7], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {pie}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
