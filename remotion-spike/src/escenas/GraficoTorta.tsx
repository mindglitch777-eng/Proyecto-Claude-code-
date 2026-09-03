import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pie} from '@remotion/shapes';
import {GROTESCA, PALETA, SERIF} from '../identidad';

// R7-18 ("Prompt Maestro 4" -- exploración agresiva de skills/Remotion):
// primer grafico de TORTA/DONUT real de la fabrica -- Grafico.tsx
// (existente) ya cubre barras, esto cubre un tipo de dato distinto
// (proporcion de un total), nunca antes disponible. Usa @remotion/shapes
// (MIT, oficial de Remotion, confirmado real -- ver
// fabrica/skills/registro.ts, id remotion-shapes-paths).
export type SegmentoTorta = {etiqueta: string; valor: number};

const RADIO = 260;
const GROSOR_DONUT = 90;

export const GraficoTorta: React.FC<{titulo: string; segmentos: SegmentoTorta[]}> = ({titulo, segmentos}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const total = segmentos.reduce((acc, s) => acc + s.valor, 0);
  const colores = [PALETA.acento, PALETA.texto, '#8A8A85', '#4A4A46'];

  let acumulado = 0;
  const slices = segmentos.map((s, i) => {
    const rotacionInicio = (acumulado / total) * Math.PI * 2;
    acumulado += s.valor;
    const t0 = (0.25 + i * 0.35) * fps;
    const s0 = spring({frame: frame - t0, fps, config: {damping: 200, stiffness: 90, mass: 1.1}});
    const progresoFinal = s.valor / total;
    return {...s, rotacionInicio, progreso: progresoFinal * s0, color: colores[i % colores.length]};
  });

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10% 8%'}}>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 64,
          color: PALETA.texto,
          marginBottom: 50,
          textAlign: 'center',
          opacity: interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        {titulo}
      </div>
      {/* makePie() ya devuelve el path centrado en (radio, radio) --
          NO en (0,0) -- el viewBox arranca en 0 0, no en -radio -radio
          (bug real encontrado probando: con -radio el circulo quedaba
          desplazado fuera de cuadro, R7-18). */}
      <svg width={RADIO * 2} height={RADIO * 2} viewBox={`0 0 ${RADIO * 2} ${RADIO * 2}`}>
        {slices.map((s, i) => (
          <Pie key={i} radius={RADIO} progress={s.progreso} rotation={s.rotacionInicio} fill="none" stroke={s.color} strokeWidth={GROSOR_DONUT} closePath={false} />
        ))}
      </svg>
      <div style={{display: 'flex', gap: 36, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center'}}>
        {segmentos.map((s, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: interpolate(frame, [(0.25 + i * 0.35) * fps, (0.25 + i * 0.35) * fps + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            <div style={{width: 22, height: 22, borderRadius: 4, backgroundColor: colores[i % colores.length]}} />
            <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 34, color: PALETA.texto}}>
              {s.etiqueta} ({Math.round((s.valor / total) * 100)}%)
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
