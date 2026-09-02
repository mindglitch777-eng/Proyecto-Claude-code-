import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Golpe} from '../escenas/golpes';
import {PALETA, GROTESCA} from '../identidad';

// R6-9: confirma el golpe 'cortina' REAL (ya con lightLeak() adentro
// de golpes.tsx, no una copia aislada del efecto) sobre contenido real
// de escena -- no solo el Solid+texto generico de PruebaLightLeak.tsx.
export const DUR_PRUEBA_CORTINA = 45;

export const PruebaCortina: React.FC = () => (
  <Golpe tipo="cortina" largo={0.9} sonido={false}>
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{color: PALETA.texto, fontFamily: GROTESCA, fontSize: 70, fontWeight: 700}}>ESCENA REAL</div>
    </AbsoluteFill>
  </Golpe>
);
