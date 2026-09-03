import React from 'react';
import {AbsoluteFill} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {createRoundedTextBox} from '@remotion/rounded-text-box';
import {PALETA, GROTESCA} from '../identidad';

// R7-25: @remotion/rounded-text-box genera el PATH de un fondo con
// esquinas redondeadas ajustado al texto real (estilo caption de
// TikTok) -- no dibuja el texto, solo la forma del fondo. Necesita
// measureText() de @remotion/layout-utils (medicion real en el DOM
// del renderer, por eso esto es una prueba renderizada, no un script
// de Node suelto).
export const DUR_PRUEBA_ROUNDED_TEXT_BOX = 60;

const LINEAS = ['Cuarenta ventas', 'en una semana.'];
const FONT_SIZE = 64;
const FONT_FAMILY = GROTESCA;

export const PruebaRoundedTextBox: React.FC = () => {
  const medidas = LINEAS.map((linea) =>
    measureText({text: linea, fontFamily: FONT_FAMILY, fontSize: FONT_SIZE, fontWeight: 700})
  );
  const {d, boundingBox} = createRoundedTextBox({
    textMeasurements: medidas,
    textAlign: 'center',
    horizontalPadding: 28,
    borderRadius: 24,
  });

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{position: 'relative'}}>
        <svg
          width={boundingBox.x2 - boundingBox.x1}
          height={boundingBox.y2 - boundingBox.y1}
          style={{position: 'absolute', top: boundingBox.y1, left: boundingBox.x1}}
        >
          <path d={d} fill={PALETA.acento} />
        </svg>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: FONT_SIZE,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.15,
            position: 'relative',
            padding: '4px 0',
          }}
        >
          {LINEAS.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
