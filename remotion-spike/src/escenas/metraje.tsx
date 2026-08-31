import React from 'react';
import {AbsoluteFill, Freeze, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {GRADING, GROTESCA, PALETA, SERIF} from '../identidad';

// ESCENAS CON GENTE DE VERDAD
//
// Los dibujos explican, pero no emocionan. Una cara sí. Estas escenas
// usan las filmaciones que baja Pexels y se apoyan en algo que el que
// mira reconoce: alguien como él.

export const Fondo: React.FC<{
  clip?: string;
  foto?: string;
  zoom?: [number, number];
  velo?: number;
  duotono?: boolean;
}> = ({clip, foto, zoom = [1.0, 1.1], velo = 0.5, duotono}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], zoom, {extrapolateRight: 'clamp'});
  return (
    <>
      <AbsoluteFill
        style={{
          filter: duotono ? 'grayscale(1) contrast(1.25) brightness(0.72)' : GRADING,
          transform: `scale(${z})`,
          transformOrigin: 'center',
        }}
      >
        {clip ? (
          <OffthreadVideo src={staticFile(`video/${clip}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : foto ? (
          <Img src={staticFile(`fotos/${foto}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : null}
      </AbsoluteFill>
      {duotono ? (
        <AbsoluteFill style={{background: PALETA.acento, mixBlendMode: 'color', opacity: 0.55}} />
      ) : null}
      <AbsoluteFill style={{background: `rgba(0,0,0,${velo})`}} />
    </>
  );
};

// ─────────────────────────────── 1. DOS VIDAS
// Dos personas, misma pantalla, partida al medio. Uno arriba, uno
// abajo. No hace falta decir cual es cual: se ve.

export const DosVidas: React.FC<{
  arriba: {clip: string; rotulo: string; frase: string};
  abajo: {clip: string; rotulo: string; frase: string};
  remate?: string;
}> = ({arriba, abajo, remate}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;

  const Mitad = ({d, gana, retraso}: {d: typeof arriba; gana: boolean; retraso: number}) => {
    const s = spring({frame: frame - retraso * fps, fps, config: {damping: 18, stiffness: 180}});
    return (
      <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
        <Fondo clip={d.clip} velo={gana ? 0.42 : 0.68} duotono={!gana} zoom={[1.0, 1.08]} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 7%',
            gap: 14,
            opacity: Math.min(1, s * 2),
            transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: GROTESCA,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: gana ? PALETA.acento : PALETA.texto,
              opacity: 0.9,
            }}
          >
            {d.rotulo}
          </div>
          <div
            style={{
              fontFamily: GROTESCA,
              fontWeight: 800,
              fontStretch: '84%',
              fontSize: 78,
              lineHeight: 1.02,
              letterSpacing: '-0.035em',
              textTransform: 'uppercase',
              color: PALETA.texto,
              textShadow: '0 6px 40px rgba(0,0,0,0.9)',
            }}
          >
            {d.frase}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column'}}>
      <Mitad d={arriba} gana={false} retraso={0.15} />
      <div style={{height: 5, background: PALETA.texto}} />
      <Mitad d={abajo} gana retraso={0.5} />
      {remate ? (
        <div
          style={{
            position: 'absolute',
            top: '48.5%',
            left: 0,
            right: 0,
            textAlign: 'center',
            transform: 'translateY(-50%)',
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontSize: 54,
            textTransform: 'uppercase',
            color: PALETA.fondo,
            background: PALETA.acento,
            padding: '14px 0',
            opacity: interpolate(t, [dur * 0.5, dur * 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {remate}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────── 2. CONGELADO
// El video corre y de golpe se para. Encima cae un sello. Es el "pará
// un segundo" mas barato y mas efectivo que hay.

export const Congelado: React.FC<{
  clip: string;
  sello: string;
  pie?: string;
  /** en que segundo se congela */
  cuando?: number;
}> = ({clip, sello, pie, cuando = 1.2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const frio = t >= cuando;
  const s = spring({frame: frame - cuando * fps, fps, config: {damping: 11, stiffness: 240, mass: 0.4}});

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <AbsoluteFill
        style={{
          filter: frio ? 'grayscale(1) contrast(1.3) brightness(0.6)' : GRADING,
          transform: `scale(${frio ? 1.06 : interpolate(frame, [0, cuando * fps], [1.0, 1.05], {extrapolateRight: 'clamp'})})`,
        }}
      >
        {/* <Freeze> deja el cuadro clavado. Antes usaba endAt, que no
            congela: CORTA el clip y deja la pantalla en negro. */}
        <Freeze frame={Math.round(cuando * fps)} active={frio}>
          <OffthreadVideo
            src={staticFile(`video/${clip}`)}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </Freeze>
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(0,0,0,${frio ? 0.55 : 0.3})`}} />

      {frio ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6%'}}>
          <div
            style={{
              transform: `scale(${interpolate(s, [0, 1], [1.6, 1])}) rotate(${interpolate(s, [0, 1], [-7, -3])}deg)`,
              opacity: Math.min(1, s * 3),
              border: `9px solid ${PALETA.acento}`,
              padding: '30px 50px',
            }}
          >
            <div
              style={{
                fontFamily: GROTESCA,
                fontWeight: 800,
                fontStretch: '82%',
                fontSize: 104,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                color: PALETA.acento,
                textAlign: 'center',
              }}
            >
              {sello}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {pie && frio ? (
        <div
          style={{
            position: 'absolute',
            bottom: '17%',
            left: '7%',
            right: '7%',
            textAlign: 'center',
            fontFamily: GROTESCA,
            fontWeight: 600,
            fontSize: 46,
            color: PALETA.texto,
            opacity: interpolate(t, [cuando + 0.5, cuando + 0.9], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            textShadow: '0 4px 30px rgba(0,0,0,0.9)',
          }}
        >
          {pie}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────── 3. LETRAS CON VIDEO ADENTRO
// El texto es una ventana: por dentro de las letras se ve la
// filmacion. Es lo mas caro que se ve y no cuesta nada.

export const LetraVentana: React.FC<{clip: string; texto: string; pie?: string}> = ({clip, texto, pie}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const s = spring({frame, fps, config: {damping: 15, stiffness: 130, mass: 0.8}});
  const z = interpolate(frame, [0, durationInFrames], [1.15, 1.0]);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4%',
          transform: `scale(${interpolate(s, [0, 1], [1.25, 1])})`,
        }}
      >
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontStretch: '78%',
            fontSize: 200,
            lineHeight: 0.92,
            letterSpacing: '-0.055em',
            textTransform: 'uppercase',
            textAlign: 'center',
            // el video se ve DENTRO de las letras
            backgroundImage: 'none',
            color: 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            position: 'relative',
          }}
        >
          <span style={{position: 'relative', display: 'inline-block'}}>
            {texto}
            <AbsoluteFill
              style={{
                mixBlendMode: 'screen',
                pointerEvents: 'none',
              }}
            />
          </span>
        </div>
      </AbsoluteFill>

      {/* el video, recortado por la forma del texto */}
      <AbsoluteFill
        style={{
          WebkitMaskImage: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '92%',
            height: '46%',
            transform: `scale(${interpolate(s, [0, 1], [1.25, 1])})`,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 920 500" style={{position: 'absolute', inset: 0}}>
            <defs>
              <clipPath id="recorte">
                <text
                  x="460"
                  y="330"
                  textAnchor="middle"
                  style={{
                    fontFamily: GROTESCA,
                    fontWeight: 800,
                    fontSize: 250,
                    letterSpacing: '-12px',
                  }}
                >
                  {texto}
                </text>
              </clipPath>
            </defs>
            <foreignObject x="0" y="0" width="920" height="500" clipPath="url(#recorte)">
              <div style={{width: 920, height: 500, overflow: 'hidden'}}>
                <div style={{width: '100%', height: '100%', transform: `scale(${z})`}}>
                  <OffthreadVideo
                    src={staticFile(`video/${clip}`)}
                    muted
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  />
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>
      </AbsoluteFill>

      {pie ? (
        <div
          style={{
            position: 'absolute',
            bottom: '22%',
            left: '7%',
            right: '7%',
            textAlign: 'center',
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 52,
            color: PALETA.texto,
            opacity: interpolate(t, [0.9, 1.4], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {pie}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ─────────────────────────────── 4. DATO SOBRE LA CARA
// Una filmacion de alguien trabajando y encima una sola cifra enorme.
// La cara pone la emocion, el numero pone el argumento.

export const DatoVivo: React.FC<{
  /** filmacion generica, o 'foto' para un caso real con cara conocida */
  clip?: string;
  foto?: string;
  arriba: string;
  cifra: string;
  abajo?: string;
}> = ({clip, foto, arriba, cifra, abajo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spring({frame: frame - 0.5 * fps, fps, config: {damping: 12, stiffness: 210, mass: 0.5}});

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <Fondo clip={clip} foto={foto} velo={0.56} zoom={[1.12, 1.0]} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 7%', gap: 10}}>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 600,
            fontSize: 52,
            color: PALETA.texto,
            opacity: interpolate(t, [0.1, 0.5], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            textShadow: '0 4px 30px rgba(0,0,0,0.9)',
          }}
        >
          {arriba}
        </div>
        <div
          style={{
            fontFamily: GROTESCA,
            fontWeight: 800,
            fontStretch: '78%',
            fontSize: 220,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            color: PALETA.acento,
            transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
            transformOrigin: 'left center',
            opacity: Math.min(1, s * 2),
            textShadow: '0 8px 50px rgba(0,0,0,0.95)',
          }}
        >
          {cifra}
        </div>
        {abajo ? (
          <div
            style={{
              fontFamily: GROTESCA,
              fontWeight: 500,
              fontSize: 46,
              color: PALETA.texto,
              opacity: interpolate(t, [1.1, 1.5], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              textShadow: '0 4px 30px rgba(0,0,0,0.9)',
            }}
          >
            {abajo}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─────────────────────────────── 5. ESTO SOS VOS
// Filmacion de alguien en la situacion, y el texto lo señala. Es el
// formato que mas comentarios genera porque la gente se siente vista.

export const EstoSosVos: React.FC<{
  /** filmacion generica, o 'foto' para un caso real con cara conocida */
  clip?: string;
  foto?: string;
  lineas: string[];
  cierre?: string;
}> = ({clip, foto, lineas, cierre}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const paso = (dur * 0.62) / Math.max(1, lineas.length);

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <Fondo clip={clip} foto={foto} velo={0.46} zoom={[1.0, 1.12]} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 7% 26% 7%', gap: 18}}>
        {lineas.map((l, i) => {
          const t0 = 0.25 + i * paso;
          if (t < t0) return null;
          const s = spring({frame: frame - t0 * fps, fps, config: {damping: 14, stiffness: 210, mass: 0.5}});
          return (
            <div
              key={i}
              style={{
                fontFamily: GROTESCA,
                fontWeight: 700,
                fontStretch: '86%',
                fontSize: 66,
                lineHeight: 1.08,
                color: PALETA.texto,
                opacity: Math.min(1, s * 2),
                transform: `translateX(${interpolate(s, [0, 1], [-26, 0])}px)`,
                textShadow: '0 6px 40px rgba(0,0,0,0.95)',
              }}
            >
              {l}
            </div>
          );
        })}
        {cierre ? (
          <div
            style={{
              marginTop: 22,
              fontFamily: GROTESCA,
              fontWeight: 800,
              fontStretch: '82%',
              fontSize: 86,
              textTransform: 'uppercase',
              letterSpacing: '-0.035em',
              color: PALETA.acento,
              opacity: interpolate(t, [dur * 0.7, dur * 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              textShadow: '0 6px 40px rgba(0,0,0,0.95)',
            }}
          >
            {cierre}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
