import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import {PALETA, GROTESCA} from '../identidad';

// R7-34: reemplazo pedido por el operador para GlitchShatter ("se ve
// bastante mal") -- subtitulos que van apareciendo palabra por palabra
// A MEDIDA QUE LA VOZ LAS DICE, en texto gigante que ocupa la pantalla,
// no una barra de subtitulos chica en un borde.
//
// Reusa createTikTokStyleCaptions() (mismo paquete oficial que
// TikTokCaptions.tsx de subtitulos/, probado real en R7-16) para
// agrupar el Caption[] medido por forced-alignment en "paginas". La
// diferencia con TikTokCaptions: esto NO muestra la pagina entera de
// una -- la recorta en bloques de `maxPalabrasPorPantalla` palabras y,
// DENTRO de cada bloque, solo dibuja las palabras cuyo `fromMs` ya paso
// (se van agregando una por una), en tipografia gigante y centrada.
//
// Igual que TikTokCaptions: recibe Caption[] ya armado. De donde sale
// ese Caption[] (whisper.cpp/faster-whisper corriendo en GitHub
// Actions sobre el audio REAL de la escena, ver
// remotion-spike/src/subtitulos/README.md) es responsabilidad de quien
// arma la composicion -- este componente no inventa ningun timestamp.
export const SubtitulosGrandes: React.FC<{
  captions: Caption[];
  combinarPalabrasDentroDeMs?: number;
  maxPalabrasPorPantalla?: number;
  color?: string;
  colorActivo?: string;
}> = ({
  captions,
  combinarPalabrasDentroDeMs = 350,
  maxPalabrasPorPantalla = 3,
  color = PALETA.texto,
  colorActivo = PALETA.acento,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tMs = (frame / fps) * 1000;

  const {pages} = useMemo(
    () => createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: combinarPalabrasDentroDeMs}),
    [captions, combinarPalabrasDentroDeMs]
  );

  const pagina = pages.find((p) => tMs >= p.startMs && tMs < p.startMs + p.durationMs);
  if (!pagina) return null;

  // recorta la pagina (que puede traer una frase entera) en bloques
  // chicos -- las "pantallas" de palabras gigantes que van cambiando.
  const bloques: typeof pagina.tokens[] = [];
  for (let i = 0; i < pagina.tokens.length; i += maxPalabrasPorPantalla) {
    bloques.push(pagina.tokens.slice(i, i + maxPalabrasPorPantalla));
  }

  const bloqueActivo =
    bloques.find((b, i) => {
      const desde = b[0].fromMs;
      const siguiente = bloques[i + 1];
      const hasta = siguiente ? siguiente[0].fromMs : pagina.startMs + pagina.durationMs;
      return tMs >= desde && tMs < hasta;
    }) ?? bloques[bloques.length - 1];

  if (!bloqueActivo) return null;

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.1em',
          maxWidth: '92%',
          textAlign: 'center',
        }}
      >
        {bloqueActivo.map((token, i) => {
          if (tMs < token.fromMs) return null; // todavia no se dijo -- no aparece
          const activo = tMs >= token.fromMs && tMs < token.toMs;
          return (
            <span
              key={i}
              style={{
                fontFamily: GROTESCA,
                fontWeight: 900,
                fontSize: tamanoFuente(token.text),
                lineHeight: 1.05,
                color: activo ? colorActivo : color,
                textShadow: '0 4px 24px rgba(0,0,0,0.85)',
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

// tamano dinamico segun largo de palabra -- "mucho mas grande" (pedido
// del operador) para palabras cortas, pero sin desbordar el 92% de
// ancho seguro del canvas (1080px) con una palabra larga tipo
// "inteligencia" o "artificial".
function tamanoFuente(texto: string): number {
  const largo = texto.length;
  if (largo <= 4) return 220;
  if (largo <= 7) return 185;
  if (largo <= 10) return 155;
  if (largo <= 14) return 125;
  return 100;
}

export default SubtitulosGrandes;
