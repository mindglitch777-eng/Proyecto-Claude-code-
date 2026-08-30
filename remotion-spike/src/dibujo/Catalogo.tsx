import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {cargarFuentes} from '../fuentes';
import {GROTESCA, PALETA} from '../identidad';
import {Figura, LISTA_FIGURAS} from './figuras';

// Muestrario: todos los dibujos trazandose. Sirve para mirar de una sola
// vez que tenemos, sin renderizar un video entero por figura.

export const Catalogo: React.FC = () => {
  cargarFuentes();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cols = 4;

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, padding: '6% 5%'}}>
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontStretch: '84%',
          fontSize: 62,
          textTransform: 'uppercase',
          color: PALETA.acento,
          marginBottom: 44,
        }}
      >
        {LISTA_FIGURAS.length} dibujos
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 30,
        }}
      >
        {LISTA_FIGURAS.map((f, i) => {
          // se van trazando en cascada, uno cada 0.09s
          const p = Math.max(0, Math.min(1, (t - 0.2 - i * 0.09) / 0.5));
          return (
            <div key={f} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
              <Figura nombre={f} p={p} col={PALETA.texto} tam={170} grosor={4.2} />
              <div style={{fontFamily: GROTESCA, fontWeight: 500, fontSize: 26, color: PALETA.texto, opacity: 0.6}}>
                {f}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
