import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Idea} from '../guion';
import {GROTESCA, PALETA, SERIF} from '../identidad';

// La misma idea que f_silueta(): un diagrama dibujado, no una foto.
// "el mismo producto con otro nombre segun el pais" no se puede buscar
// en un banco de imagenes.
//
// En Pillow esto son primitivas (ellipse, rounded_rectangle) con las
// coordenadas calculadas a mano. Acá es SVG, que ademas se puede
// animar por trazo.

export const Silueta: React.FC<{idea: Extract<Idea, {tipo: 'silueta'}>}> = ({idea}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ent = (retraso: number) =>
    spring({frame: frame - retraso * fps, fps, config: {damping: 200, stiffness: 110}});

  const caja = ent(0.3);
  const flecha = ent(1.0);
  const caja2 = ent(1.5);

  // El trazo de la flecha se dibuja: dash offset animado.
  const largo = 260;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETA.fondo,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 8%',
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 84,
          color: PALETA.texto,
          marginBottom: 90,
          opacity: interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        {idea.texto}
      </div>

      <svg width={860} height={300} viewBox="0 0 860 300">
        {/* etiqueta izquierda */}
        <g opacity={caja} transform={`translate(0 ${interpolate(caja, [0, 1], [18, 0])})`}>
          <rect x={20} y={90} width={250} height={120} rx={10} fill="none" stroke={PALETA.texto} strokeWidth={7} />
          <line x1={60} y1={130} x2={230} y2={130} stroke={PALETA.texto} strokeWidth={7} strokeLinecap="round" />
          <line x1={60} y1={170} x2={175} y2={170} stroke={PALETA.texto} strokeWidth={7} strokeLinecap="round" />
        </g>

        {/* flecha: se dibuja sola */}
        <g opacity={flecha > 0 ? 1 : 0}>
          <line
            x1={300}
            y1={150}
            x2={560}
            y2={150}
            stroke={PALETA.acento}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={largo}
            strokeDashoffset={interpolate(flecha, [0, 1], [largo, 0])}
          />
          <polygon
            points="560,132 596,150 560,168"
            fill={PALETA.acento}
            opacity={interpolate(flecha, [0.75, 1], [0, 1], {extrapolateLeft: 'clamp'})}
          />
        </g>

        {/* etiqueta derecha, distinta */}
        <g opacity={caja2} transform={`translate(0 ${interpolate(caja2, [0, 1], [18, 0])})`}>
          <rect x={620} y={90} width={220} height={120} rx={10} fill="none" stroke={PALETA.acento} strokeWidth={7} strokeDasharray="16 12" />
          <line x1={655} y1={130} x2={805} y2={130} stroke={PALETA.acento} strokeWidth={7} strokeLinecap="round" />
          <line x1={655} y1={170} x2={740} y2={170} stroke={PALETA.acento} strokeWidth={7} strokeLinecap="round" />
        </g>
      </svg>

      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 400,
          fontSize: 46,
          color: PALETA.texto,
          opacity: interpolate(frame, [fps * 1.9, fps * 2.4], [0, 0.75], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          marginTop: 80,
        }}
      >
        {idea.pie}
      </div>
    </AbsoluteFill>
  );
};
