import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import {PALETA, GROTESCA} from '../identidad';

// R7-16: componente REAL de subtitulos estilo TikTok -- reusa
// createTikTokStyleCaptions() (paquete oficial @remotion/captions) para
// agrupar Caption[] en "paginas" (fragmentos que caben en pantalla a
// la vez), y resalta la palabra que esta sonando en el frame actual.
// Recibe Caption[] ya armado -- de donde salen esos Caption[] (whisper.cpp
// real vs. una fixture sintetica de prueba) es responsabilidad de quien
// arma la composicion, no de este componente. Ver README.md de esta
// carpeta para el estado real (build de whisper.cpp confirmado,
// descarga de modelo bloqueada en este sandbox).
export const TikTokCaptions: React.FC<{
  captions: Caption[];
  combinarPalabrasDentroDeMs?: number;
}> = ({captions, combinarPalabrasDentroDeMs = 400}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tMs = (frame / fps) * 1000;

  const {pages} = useMemo(
    () => createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: combinarPalabrasDentroDeMs}),
    [captions, combinarPalabrasDentroDeMs]
  );

  const pagina = pages.find((p) => tMs >= p.startMs && tMs < p.startMs + p.durationMs);
  if (!pagina) return null;

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '18%'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.35em', maxWidth: '85%'}}>
        {pagina.tokens.map((token, i) => {
          const activo = tMs >= token.fromMs && tMs < token.toMs;
          return (
            <span
              key={i}
              style={{
                fontFamily: GROTESCA,
                fontWeight: 800,
                fontSize: 56,
                lineHeight: 1.2,
                color: activo ? PALETA.acento : PALETA.texto,
                textShadow: '0 2px 10px rgba(0,0,0,0.85)',
                transform: activo ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.1s',
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
