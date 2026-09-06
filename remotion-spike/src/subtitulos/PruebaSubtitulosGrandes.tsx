import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {SubtitulosGrandes} from '../effects/SubtitulosGrandes';
import {PALETA} from '../identidad';
import fixture from './fixture_sintetica.json';
import type {Caption} from '@remotion/captions';

// R7-34: misma logica de prueba que PruebaCaptions.tsx (audio REAL +
// fixture SINTETICA, ver README.md de esta carpeta) pero para el
// componente nuevo SubtitulosGrandes -- confirma visualmente el
// recorte en bloques chicos y la revelacion palabra por palabra.
export const PruebaSubtitulosGrandes: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <Audio src={staticFile('fabrica_demo_05/hook_0.wav')} />
    <SubtitulosGrandes captions={fixture.captions as Caption[]} />
  </AbsoluteFill>
);
