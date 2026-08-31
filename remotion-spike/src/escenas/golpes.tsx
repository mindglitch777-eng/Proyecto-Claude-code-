import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALETA} from '../identidad';

// GOLPES DE CORTE
//
// Esto no es adorno. Cuando una escena cambia de golpe -- un fogonazo,
// un sacudon, la pantalla que se parte un cuadro -- el ojo pierde el
// hilo por dos o tres cuadros y tiene que volver a mirar. Ese "volver a
// mirar" es medio segundo mas de atencion, y en vertical medio segundo
// es todo.
//
// Se envuelve cualquier escena con esto y listo.
//
// El sonido va pegado al mismo lugar: cada tipo de golpe dispara SU
// efecto (sfx.py, sintetizado, sin licencia que pagar). No hay que
// escribirlo en el guion -- sale solo con el tipo de golpe que ya
// elige el compilador, asi que TODOS los videos lo tienen, no solo el
// que se acuerde de pedirlo.
const SONIDO: Record<TipoGolpe, {archivo: string; volumen: number} | null> = {
  fogonazo: {archivo: 'impacto', volumen: 0.9},
  sacudon: {archivo: 'impacto', volumen: 0.85},
  corte: {archivo: 'tick', volumen: 0.55},
  negro: {archivo: 'whoosh', volumen: 0.7},
  raya: {archivo: 'whoosh', volumen: 0.8},
  fundido: null,
  desliza: {archivo: 'tick', volumen: 0.35},
  iris: null,
  cortina: {archivo: 'whoosh', volumen: 0.45},
  ninguno: null,
};

export type TipoGolpe = 'fogonazo' | 'sacudon' | 'corte' | 'negro' | 'raya' | 'fundido' | 'desliza' | 'iris' | 'cortina' | 'ninguno';

export const Golpe: React.FC<{
  tipo?: TipoGolpe;
  /** cuanto dura el golpe, en segundos */
  largo?: number;
  /** el primer golpe del video no suena: no hay corte que marcar */
  sonido?: boolean;
  children: React.ReactNode;
}> = ({tipo = 'fogonazo', largo = 0.14, sonido = true, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = t / largo; // 0 al empezar, 1 cuando termina el golpe

  const s = sonido ? SONIDO[tipo] : null;
  const efecto = s ? (
    <Audio src={staticFile(`sfx/${s.archivo}.wav`)} volume={s.volumen} />
  ) : null;

  if (tipo === 'ninguno' || p >= 1) {
    return <AbsoluteFill>{efecto}{children}</AbsoluteFill>;
  }

  // cae al cuadrado: pega fuerte y se va rapido
  const k = Math.pow(1 - Math.max(0, Math.min(1, p)), 2);

  if (tipo === 'sacudon') {
    const dx = (random(`x${frame}`) - 0.5) * 90 * k;
    const dy = (random(`y${frame}`) - 0.5) * 60 * k;
    return (
      <AbsoluteFill style={{transform: `translate(${dx}px,${dy}px) scale(${1 + 0.07 * k})`}}>
        {efecto}
        {children}
      </AbsoluteFill>
    );
  }

  if (tipo === 'corte') {
    // la imagen entra ya puesta pero agrandada, y se asienta
    return (
      <AbsoluteFill style={{transform: `scale(${1 + 0.13 * k})`}}>
        {efecto}
        {children}
      </AbsoluteFill>
    );
  }

  if (tipo === 'negro') {
    return (
      <AbsoluteFill>
        {efecto}
        {children}
        <AbsoluteFill style={{background: '#000', opacity: k}} />
      </AbsoluteFill>
    );
  }

  if (tipo === 'fundido') {
    // sin flash, sin sacudida: la escena entra subiendo de opacidad
    // nomas -- para diagramas y dibujos, que se ven mejor apareciendo
    // continuos que cortando en seco.
    return <AbsoluteFill style={{opacity: 1 - k}}>{children}</AbsoluteFill>;
  }

  if (tipo === 'desliza') {
    // entra deslizando desde la derecha, sin rebote ni sacudida -- el
    // cambio de plano "fluido" que pidio el operador, en vez de un
    // corte seco.
    const suave = Math.pow(1 - Math.max(0, Math.min(1, p)), 3);
    return <AbsoluteFill style={{transform: `translateX(${suave * 100}%)`}}>{children}</AbsoluteFill>;
  }

  if (tipo === 'iris') {
    // el clasico "iris" de cine mudo: un circulo que se abre desde el
    // centro y va revelando la escena nueva.
    const radio = (1 - k) * 75;
    return (
      <AbsoluteFill style={{clipPath: `circle(${radio}% at 50% 50%)`, background: '#000'}}>
        {efecto}
        {children}
      </AbsoluteFill>
    );
  }

  if (tipo === 'cortina') {
    // un lavado calido en diagonal que cruza la pantalla, como un
    // "light leak" de camara analogica -- mas suave que el fogonazo
    // blanco, para escenas que no quieren golpear sino acariciar.
    const y = interpolate(p, [0, 1], [-40, 140]);
    return (
      <AbsoluteFill>
        {efecto}
        {children}
        <AbsoluteFill
          style={{
            background: `linear-gradient(115deg, transparent, ${PALETA.acento}, transparent)`,
            opacity: 0.75 * k,
            clipPath: `polygon(0 ${y - 30}%, 100% ${y - 55}%, 100% ${y + 25}%, 0 ${y + 50}%)`,
            filter: 'blur(4px)',
          }}
        />
      </AbsoluteFill>
    );
  }

  if (tipo === 'raya') {
    // una banda de color cruza la pantalla de un lado al otro
    const y = interpolate(p, [0, 1], [-30, 130]);
    return (
      <AbsoluteFill>
        {efecto}
        {children}
        <AbsoluteFill
          style={{
            background: PALETA.acento,
            clipPath: `polygon(0 ${y - 22}%, 100% ${y - 34}%, 100% ${y + 6}%, 0 ${y + 18}%)`,
          }}
        />
      </AbsoluteFill>
    );
  }

  // fogonazo: lava el cuadro hacia blanco + un empujon de escala
  return (
    <AbsoluteFill style={{transform: `scale(${1 + 0.05 * k})`}}>
      {efecto}
      {children}
      <AbsoluteFill style={{background: '#fff', opacity: 0.92 * k}} />
    </AbsoluteFill>
  );
};

// PULSO
//
// Fogonazos cortos que corren por todo el video, cada tantos segundos,
// aunque no haya corte. Marca un pulso, como el bombo de una cancion.

export const Pulso: React.FC<{cada?: number; largo?: number; fuerza?: number; color?: string}> = ({
  cada = 2.4,
  largo = 0.07,
  fuerza = 0.55,
  color = '#fff',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const desde = Math.floor(t / cada) * cada;
  const dentro = t - desde;
  if (desde <= 0 || dentro > largo) return null;
  const k = Math.pow(1 - dentro / largo, 2);
  return <AbsoluteFill style={{background: color, opacity: fuerza * k, pointerEvents: 'none'}} />;
};

// GRANO
//
// Ruido finito encima de todo. Le saca el aspecto de "hecho en la
// compu" y lo acerca a algo filmado.

export const Grano: React.FC<{fuerza?: number}> = ({fuerza = 0.055}) => {
  const frame = useCurrentFrame();
  // se mueve cada cuadro para que no se vea como una textura pegada
  const dx = Math.floor(random(`gx${frame}`) * 100);
  const dy = Math.floor(random(`gy${frame}`) * 100);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: fuerza,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='0.9'/></svg>\")",
        backgroundPosition: `${dx}px ${dy}px`,
        mixBlendMode: 'overlay',
      }}
    />
  );
};
