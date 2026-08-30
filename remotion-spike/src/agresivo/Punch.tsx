import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {GRADING, GROTESCA, PALETA} from '../identidad';

// Lineas que entran de golpe, no con un fundido suave. La entrada es un
// spring con poco damping: pasa apenas de largo y vuelve. Eso es lo que
// se lee como "golpe" en vez de "aparecio".
//
// La ultima linea va en el acento: es la que corta.

export const Punch: React.FC<{
  lineas: string[];
  entra: number[];
  clip?: string;
  tam?: number;
  acentoUltima?: boolean;
  centrado?: boolean;
  velo?: number;
}> = ({lineas, entra, clip, tam = 118, acentoUltima = true, centrado = true, velo = 0.52}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.09]);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {clip ? (
        <>
          <AbsoluteFill
            style={{filter: GRADING, transform: `scale(${zoom})`, transformOrigin: 'center'}}
          >
            <OffthreadVideo
              src={staticFile(`video/${clip}`)}
              muted
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </AbsoluteFill>
          <AbsoluteFill style={{backgroundColor: `rgba(0,0,0,${velo})`}} />
        </>
      ) : null}

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: centrado ? 'center' : 'flex-end',
          alignItems: 'flex-start',
          padding: '0 6% 24% 6%',
          gap: tam * 0.1,
        }}
      >
        {lineas.map((l, i) => {
          const t0 = (entra[i] ?? 0) * fps;
          const instante = t0 <= 0.001;
          if (!instante && frame < t0) {
            return null;
          }
          // damping bajo -> se pasa y vuelve. Ese rebote es el golpe.
          const s = instante
            ? 1
            : spring({frame: frame - t0, fps, config: {damping: 14, stiffness: 220, mass: 0.5}});
          const ultima = i === lineas.length - 1;
          return (
            <div
              key={i}
              style={{
                fontFamily: GROTESCA,
                fontWeight: 800,
                fontStretch: '84%',
                fontSize: tam,
                lineHeight: 0.98,
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
                color: ultima && acentoUltima ? PALETA.acento : PALETA.texto,
                transform: `scale(${interpolate(s, [0, 1], [0.86, 1])})`,
                transformOrigin: 'left center',
                opacity: instante ? 1 : Math.min(1, s * 2.2),
                textShadow: clip ? '0 6px 46px rgba(0,0,0,0.9)' : undefined,
              }}
            >
              {l}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
