import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Linea} from './guion';
import {GROTESCA, PALETA, SERIF} from './identidad';

// El bloque escalonado. Es el mismo comportamiento que f_escena():
// las lineas entran por tiempo y NO se van, alternando serif/grotesca
// e izquierda/derecha.
//
// La diferencia con la version de Pillow no es como se ve sino cuanto
// codigo cuesta: alla hay que medir cada linea con textbbox, achicar
// el cuerpo en un while hasta que entre en el ancho, sumar el
// interlineado a mano y calcular la altura total del bloque para
// poder centrarlo. Aca eso es flex + un tamaño en vw que el navegador
// resuelve solo.

export const Bloque: React.FC<{
  lineas: Linea[];
  entra: number[];
  centrado?: boolean;
  tam?: number;
  sombra?: boolean;
}> = ({lineas, entra, centrado = false, tam = 96, sombra = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        // Centrado vertical real. En el motor actual esto es una suma
        // de alturas de linea calculada antes de dibujar.
        justifyContent: centrado ? 'center' : 'flex-start',
        paddingTop: centrado ? 0 : '13%',
        paddingLeft: '5.5%',
        paddingRight: '7.5%',
        gap: tam * 0.28,
      }}
    >
      {lineas.map((l, i) => {
        const t0 = (entra[i] ?? entra[entra.length - 1] ?? 0) * fps;
        // Una linea declarada en t=0 esta ENTERA en el cuadro cero:
        // la misma regla de §3 que hook_microestados.
        const instante = t0 <= 0.001;
        const s = instante
          ? 1
          : spring({
              frame: frame - t0,
              fps,
              config: {damping: 200, stiffness: 140, mass: 0.6},
            });
        if (!instante && frame < t0) {
          return <div key={i} style={{height: tam}} />;
        }
        return (
          <div
            key={i}
            style={{
              alignSelf: l.alinea === 'der' ? 'flex-end' : 'flex-start',
              fontFamily: l.estilo === 'serif' ? SERIF : GROTESCA,
              fontWeight: l.estilo === 'serif' ? 800 : 700,
              fontStretch: l.estilo === 'serif' ? undefined : '88%',
              fontSize: tam,
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: PALETA.texto,
              opacity: interpolate(s, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
              textShadow: sombra ? '0 4px 40px rgba(0,0,0,0.85)' : undefined,
              whiteSpace: 'nowrap',
            }}
          >
            {l.t}
          </div>
        );
      })}
    </div>
  );
};
