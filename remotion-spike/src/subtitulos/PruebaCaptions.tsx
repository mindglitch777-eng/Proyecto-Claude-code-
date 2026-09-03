import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {TikTokCaptions} from './TikTokCaptions';
import {PALETA} from '../identidad';
import fixture from './fixture_sintetica.json';
import type {Caption} from '@remotion/captions';

// R7-16: prueba real de renderizado -- audio REAL de la fabrica
// (fabrica_demo_05/hook_0.wav) + captions de la fixture SINTETICA
// (fixture_sintetica.json, ver README.md de esta carpeta). Esto prueba
// que TikTokCaptions.tsx renderiza Caption[] de verdad; NO prueba que
// whisper.cpp transcriba bien -- eso sigue bloqueado en este sandbox
// por la descarga del modelo (huggingface.co/ggml.ggerganov.com
// denegados por politica de red).
export const PruebaCaptions: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <Audio src={staticFile('fabrica_demo_05/hook_0.wav')} />
    <TikTokCaptions captions={fixture.captions as Caption[]} />
  </AbsoluteFill>
);
