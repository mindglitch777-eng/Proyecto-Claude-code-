import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

interface SplitScreenProps {
  beforeText: string;
  afterText: string;
  beforeColor?: string;
  afterColor?: string;
  duration?: number;
}

/**
 * Distinto de 'antes-despues' (escenas/explica.tsx): ese es una
 * cortina que CRUZA la pantalla y revela un despues distinto del
 * antes (una sola cara visible a la vez). Este es un split literal de
 * dos mitades SIMULTANEAS lado a lado con linea central animada --
 * mecanica visual distinta, aunque el rol narrativo (antes/despues)
 * se superponga. Ver AUDITORIA_FABRICA.md sobre por que no se duplico
 * el componente existente sin necesidad.
 */
export const SplitScreen: React.FC<SplitScreenProps> = ({
  beforeText,
  afterText,
  beforeColor = '#FF0044',
  afterColor = '#00FF88',
  duration = 2.0,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const durationFrames = duration * fps;
  const progress = Math.min(frame / durationFrames, 1);

  // linea central: crece de 0 a 100% de alto en el primer 35% del tiempo
  const lineaProgress = Math.min(progress / 0.35, 1);

  // en la segunda mitad, el lado "despues" gana terreno sobre el "antes"
  const expansionProgress = Math.max(0, (progress - 0.5) / 0.5);
  const anchoDespues = 50 + 10 * expansionProgress; // 50% -> 60%
  const opacidadAntes = 1 - 0.4 * expansionProgress;

  return (
    <AbsoluteFill style={{ background: '#0A0A0C', overflow: 'hidden' }}>
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div
          style={{
            width: `${100 - anchoDespues}%`,
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: `${beforeColor}18`,
            opacity: opacidadAntes,
            transition: 'width 0.1s linear',
          }}
        >
          <div style={{ textAlign: 'center', padding: '0 24px' }}>
            <div
              style={{
                fontFamily: '"Archivo", sans-serif',
                fontWeight: 700,
                fontSize: '32px',
                letterSpacing: '4px',
                color: beforeColor,
                opacity: 0.7,
                marginBottom: '16px',
              }}
            >
              ANTES
            </div>
            <div
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 700,
                fontSize: '52px',
                color: beforeColor,
                textShadow: `0 0 20px ${beforeColor}80`,
              }}
            >
              {beforeText}
            </div>
          </div>
        </div>
        <div
          style={{
            width: `${anchoDespues}%`,
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: `${afterColor}18`,
            transition: 'width 0.1s linear',
          }}
        >
          <div style={{ textAlign: 'center', padding: '0 24px' }}>
            <div
              style={{
                fontFamily: '"Archivo", sans-serif',
                fontWeight: 700,
                fontSize: '32px',
                letterSpacing: '4px',
                color: afterColor,
                marginBottom: '16px',
              }}
            >
              DESPUÉS
            </div>
            <div
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 700,
                fontSize: '52px',
                color: afterColor,
                textShadow: `0 0 30px ${afterColor}`,
              }}
            >
              {afterText}
            </div>
          </div>
        </div>
      </div>

      {/* linea neon central, crece de arriba a abajo */}
      <div
        style={{
          position: 'absolute',
          left: `${100 - anchoDespues}%`,
          top: 0,
          width: '4px',
          height: `${lineaProgress * 100}%`,
          marginLeft: '-2px',
          background: `linear-gradient(180deg, transparent, #F6F6F4, transparent)`,
          boxShadow: '0 0 24px #F6F6F4, 0 0 48px #F6F6F4',
        }}
      />
    </AbsoluteFill>
  );
};

export default SplitScreen;
