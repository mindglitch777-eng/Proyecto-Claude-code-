import React from 'react';
import {AbsoluteFill, Solid, useVideoConfig} from 'remotion';
import {vignette} from '@remotion/effects/vignette';
import {PALETA, GROTESCA} from '../identidad';

// R6-9: pregunta a responder con un render real ANTES de prometer un
// "vinieta cinematica sobre la escena" en la fabrica -- @remotion/effects
// aplica los efectos a los pixeles PROPIOS del elemento etiquetado
// (Video/Solid/CanvasImage), no al contenido debajo de el. Un <Solid
// color="transparent"> es realmente transparente en su base (Solid.color
// default = "transparent", confirmado leyendo Solid.d.ts) -- la duda
// real es si vignette({mode:'color'}) oscurece los BORDES dejando el
// CENTRO transparente (por lo tanto el contenido de abajo se veria a
// traves), o si el resultado queda opaco en toda el area.
export const DUR_PRUEBA_VINETA = 60;

export const PruebaVineta: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{color: PALETA.texto, fontFamily: GROTESCA, fontSize: 70, fontWeight: 700}}>CONTENIDO DEBAJO</div>
      <Solid
        width={width}
        height={height}
        color="transparent"
        style={{position: 'absolute', top: 0, left: 0}}
        effects={[vignette({mode: 'color', color: '#000000', amount: 0.75, radius: 0.55, feather: 0.4})]}
      />
    </AbsoluteFill>
  );
};
