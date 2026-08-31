import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Golpe, Grano, Pulso, TipoGolpe} from '../escenas/golpes';
import {cargarFuentes} from '../fuentes';
import {compilar, Guion} from './compilar';
import {elegirPaleta} from './paletas';
import {REGISTRO} from './registro';

// EL RENDERIZADOR GENERICO
//
// Esto es lo que hace que "el sistema vea todos los guiones propuestos
// y los adapte con la biblioteca de formatos" sea un hecho: agarra
// CUALQUIER Guion (compilar.ts), lo compila a un Plan, y dibuja cada
// bloque con el componente que le toco. No hay nada especifico de un
// video en particular aca -- por eso Root.tsx puede registrar una
// composicion por cada guion en receta/guiones.ts sin que nadie tenga
// que tocar este archivo cada vez que se agrega un guion nuevo.

const FPS = 30;

const CierreGenerico: React.FC<{cta: string; texto: string; acento: string}> = ({cta, texto, acento}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ap = (a: number, b: number, max = 1) =>
    interpolate(t, [a, b], [0, max], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 22, padding: '0 8%',
      }}
    >
      <div
        style={{
          fontFamily: 'Archivo', fontWeight: 800, fontStretch: '84%', fontSize: 78, color: texto,
          letterSpacing: '-0.03em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.05,
          opacity: ap(0, 0.35), transform: `scale(${interpolate(t, [0, 0.35], [0.88, 1], {extrapolateRight: 'clamp'})})`,
        }}
      >
        Comentá «<span style={{color: acento}}>{cta}</span>»
      </div>
      <div style={{fontFamily: 'Archivo', fontWeight: 400, fontSize: 40, color: texto, opacity: ap(0.4, 0.75, 0.75)}}>
        y te lo paso
      </div>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{id: string; guiones: Guion[]}> = ({id, guiones}) => {
  cargarFuentes();
  const {fps} = useVideoConfig();
  const guion = guiones.find((g) => g.id === id);
  if (!guion) return <AbsoluteFill style={{background: '#000'}} />;

  const plan = compilar(guion);
  const paleta = elegirPaleta(guion.tema + ' ' + guion.titulo + ' ' + guion.partes.map((p) => p.dice.join(' ')).join(' '));

  let acc = 0;
  return (
    <AbsoluteFill style={{backgroundColor: paleta.fondo}}>
      {plan.bloques.map((b, i) => {
        const desde = Math.round(acc * fps);
        const largo = Math.round(b.dura * fps);
        acc += b.dura;
        const golpe = (b.golpe || 'corte') as TipoGolpe;
        const adaptador = REGISTRO[b.formato];
        return (
          <Sequence key={i} from={desde} durationInFrames={Math.max(1, largo)}>
            <Golpe tipo={golpe}>
              {b.parte.hace === 'cierre' ? (
                <CierreGenerico cta={guion.cta} texto={paleta.texto} acento={paleta.acento} />
              ) : adaptador ? (
                adaptador(b.parte, b.dura, guion.tema)
              ) : (
                <AbsoluteFill style={{background: paleta.fondo}} />
              )}
            </Golpe>
          </Sequence>
        );
      })}
      <Pulso cada={1.8} largo={0.05} fuerza={0.22} />
      <Grano fuerza={0.045} />
    </AbsoluteFill>
  );
};
