import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {PALETA, GROTESCA} from '../identidad';

// R7-10: primer render REAL del Carousel Engine (fabrica/carrusel/) --
// un carrusel es imagenes ESTATICAS (no timeline), por eso esto se
// renderiza con `npx remotion still`, no con `render` como los videos.
// Reutiliza la MISMA identidad visual (PALETA/GROTESCA de identidad.ts)
// que el motor de video -- ninguna paleta nueva inventada por formato.
export type TipoSlideCarrusel = 'portada' | 'hook' | 'desarrollo' | 'ejemplo' | 'cta';

export const ANCHO_CARRUSEL = 1080;
export const ALTO_CARRUSEL = 1350; // 4:5, formato estandar de carrusel

/** Parte `texto` por las substrings de `resaltar` (si hay) y devuelve
 * los tramos coincidentes en `colorResaltado` -- la forma real de
 * "que haya colores que llamen la atencion" sin depender de que TODOS
 * los slides tengan una foto. */
function ConResaltado({
  texto,
  resaltar,
  colorBase,
  colorResaltado,
}: {
  texto: string;
  resaltar?: string[];
  colorBase: string;
  colorResaltado: string;
}) {
  if (!resaltar || resaltar.length === 0) return <>{texto}</>;
  const patron = resaltar
    .filter(Boolean)
    .sort((a, b) => b.length - a.length) // el mas largo primero, para no partir un match mas chico adentro de uno mas largo
    .map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  if (!patron) return <>{texto}</>;
  const partes = texto.split(new RegExp(`(${patron})`, 'g'));
  const esResaltado = new Set(resaltar);
  return (
    <>
      {partes.map((parte, i) =>
        esResaltado.has(parte) ? (
          <span key={i} style={{color: colorResaltado}}>
            {parte}
          </span>
        ) : (
          <span key={i} style={{color: colorBase}}>
            {parte}
          </span>
        )
      )}
    </>
  );
}

export const CarruselSlide: React.FC<{
  tipo: TipoSlideCarrusel;
  texto: string;
  subtexto?: string;
  numero: number;
  total: number;
  /** Ruta relativa a public/ (ej. "fotos/elon-musk.jpg"), opcional --
   * cuando el slide necesita mostrar una figura publica real (ver
   * assets/personas/, bajado por descargar_foto_persona.py con
   * licencia verificada) o una foto representativa del punto (ver
   * assets/metraje/, Pexels via descargar_metraje.py). */
  imagen?: string;
  /** 'circular' (default): retrato/foto chica, referencia visual.
   * 'fondo': la foto ocupa TODO el slide (duotono en la paleta de
   * marca + degrade oscuro abajo para que el texto quede legible) --
   * tratamiento tipo poster, mucho mas fuerte. */
  estiloImagen?: 'circular' | 'fondo';
  /** Credito real de la foto (fuente/autor/licencia), obligatorio si
   * hay `imagen` -- nunca se usa una imagen real sin su atribucion. */
  credito?: string;
  /** Palabras/frases exactas de `texto` que se pintan en
   * PALETA.acento en vez del color base -- para que un slide de solo
   * texto tambien tenga un punto de color que llame la atencion. */
  resaltar?: string[];
  /** Logo/marca chica opcional (ej. logo real de una empresa citada,
   * con su propio credito si hace falta) -- badge en una esquina, NUNCA
   * a tamano dominante, para que no lea como co-branding/auspicio. */
  logo?: string;
}> = ({tipo, texto, subtexto, numero, total, imagen, estiloImagen = 'circular', credito, resaltar, logo}) => {
  const esPortadaOCta = tipo === 'portada' || tipo === 'cta';
  const imagenDeFondo = Boolean(imagen) && estiloImagen === 'fondo';

  if (imagenDeFondo) {
    return (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <Img
          src={staticFile(imagen as string)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(1) contrast(1.15) brightness(0.85)',
          }}
        />
        {/* duotono real en la paleta de marca -- multiply tiñe las
            sombras de naranja/negro, no un filtro generico de stock */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${PALETA.acento}55 0%, transparent 35%, transparent 55%, rgba(10,10,12,0.55) 78%, rgba(10,10,12,0.96) 100%)`,
            mixBlendMode: 'multiply',
          }}
        />
        <AbsoluteFill
          style={{
            background: 'linear-gradient(0deg, rgba(10,10,12,0.98) 0%, rgba(10,10,12,0.55) 32%, transparent 58%)',
          }}
        />
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '0 8% 12%',
          }}
        >
          <div
            style={{
              fontFamily: GROTESCA,
              fontWeight: 900,
              fontSize: 88,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              textShadow: '0 4px 24px rgba(0,0,0,0.6)',
            }}
          >
            <ConResaltado texto={texto} resaltar={resaltar} colorBase={PALETA.texto} colorResaltado={PALETA.acento} />
          </div>
          {subtexto ? (
            <div
              style={{
                marginTop: 24,
                fontFamily: GROTESCA,
                fontWeight: 500,
                fontSize: 36,
                color: PALETA.texto,
                opacity: 0.85,
              }}
            >
              {subtexto}
            </div>
          ) : null}
        </AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: '8%',
            fontFamily: GROTESCA,
            fontWeight: 700,
            fontSize: 26,
            color: PALETA.texto,
            opacity: 0.7,
            letterSpacing: '0.08em',
          }}
        >
          {numero} / {total}
        </div>
        {logo ? (
          <div
            style={{
              position: 'absolute',
              top: '5%',
              right: '8%',
              height: 46,
              display: 'flex',
              alignItems: 'center',
              filter: 'brightness(0) invert(1)', // logo siempre blanco solido, chico, discreto
              opacity: 0.9,
            }}
          >
            <Img src={staticFile(logo)} style={{height: '100%', width: 'auto'}} />
          </div>
        ) : null}
        {credito ? (
          <div
            style={{
              position: 'absolute',
              bottom: '2%',
              right: '8%',
              fontFamily: GROTESCA,
              fontWeight: 500,
              fontSize: 16,
              color: PALETA.texto,
              opacity: 0.5,
            }}
          >
            {credito}
          </div>
        ) : null}
      </AbsoluteFill>
    );
  }

  const colorBase = esPortadaOCta ? PALETA.fondo : PALETA.texto;

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
      {imagen ? (
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: '50%',
            overflow: 'hidden',
            marginBottom: 40,
            border: `4px solid ${colorBase}`,
            flexShrink: 0,
          }}
        >
          <Img src={staticFile(imagen)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      ) : null}
      {logo && !imagen ? (
        <div style={{height: 64, marginBottom: 36, display: 'flex', alignItems: 'center', opacity: 0.92}}>
          <Img
            src={staticFile(logo)}
            style={{height: '100%', width: 'auto', filter: esPortadaOCta ? 'brightness(0) invert(1)' : 'none'}}
          />
        </div>
      ) : null}
      <div
        style={{
          fontFamily: GROTESCA,
          fontWeight: 800,
          fontSize: tipo === 'portada' ? (imagen ? 72 : 92) : 62,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          textAlign: 'center',
        }}
      >
        <ConResaltado texto={texto} resaltar={resaltar} colorBase={colorBase} colorResaltado={esPortadaOCta ? PALETA.texto : PALETA.acento} />
      </div>
      {subtexto ? (
        <div
          style={{
            marginTop: 28,
            fontFamily: GROTESCA,
            fontWeight: 500,
            fontSize: 38,
            color: colorBase,
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
          color: colorBase,
          opacity: 0.55,
          letterSpacing: '0.05em',
        }}
      >
        {numero} / {total}
      </div>
      {credito ? (
        <div
          style={{
            position: 'absolute',
            bottom: '2.2%',
            fontFamily: GROTESCA,
            fontWeight: 500,
            fontSize: 16,
            color: colorBase,
            opacity: 0.4,
            letterSpacing: '0.02em',
          }}
        >
          {credito}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
