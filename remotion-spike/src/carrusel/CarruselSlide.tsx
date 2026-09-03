import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PALETA, GROTESCA} from '../identidad';

// R7-10: primer render REAL del Carousel Engine (fabrica/carrusel/) --
// un carrusel es imagenes ESTATICAS (no timeline), por eso esto se
// renderiza con `npx remotion still`, no con `render` como los videos.
// Reutiliza la MISMA identidad visual (PALETA/GROTESCA de identidad.ts)
// que el motor de video -- ninguna paleta nueva inventada por formato.
export type TipoSlideCarrusel = 'portada' | 'hook' | 'desarrollo' | 'ejemplo' | 'cta';

export const ANCHO_CARRUSEL = 1080;
export const ALTO_CARRUSEL = 1350; // 4:5, formato estandar de carrusel

export const CarruselSlide: React.FC<{
  tipo: TipoSlideCarrusel;
  texto: string;
  subtexto?: string;
  numero: number;
  total: number;
}> = ({tipo, texto, subtexto, numero, total}) => {
  const esPortadaOCta = tipo === 'portada' || tipo === 'cta';
  return (
    <AbsoluteFill
      style={{
        backgroundColor: esPortadaOCta ? PALETA.acento : PALETA.fondo,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10% 8%',
      }}
    >
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontSize: tipo === 'portada' ? 92 : 62,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: esPortadaOCta ? PALETA.fondo : PALETA.texto,
          textAlign: 'center',
        }}
      >
        {texto}
      </div>
      {subtexto ? (
        <div
          style={{
            marginTop: 28,
            fontFamily: GROTESCA,
            fontWeight: 500,
            fontSize: 38,
            color: esPortadaOCta ? PALETA.fondo : PALETA.texto,
            opacity: 0.75,
            textAlign: 'center',
          }}
        >
          {subtexto}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          bottom: '6%',
          fontFamily: GROTESCA,
          fontWeight: 600,
          fontSize: 28,
          color: esPortadaOCta ? PALETA.fondo : PALETA.texto,
          opacity: 0.55,
          letterSpacing: '0.05em',
        }}
      >
        {numero} / {total}
      </div>
    </AbsoluteFill>
  );
};
