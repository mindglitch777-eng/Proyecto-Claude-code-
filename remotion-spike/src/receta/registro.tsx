import React from 'react';
import {Punch} from '../agresivo/Punch';
import {Diagrama} from '../dibujo/Diagrama';
import type {NombreFigura} from '../dibujo/figuras';
import {AntesDespues, Balanza, Cronologia, ListaTachada, Pasos} from '../escenas/explica';
import {Buscador, Chat, Notificaciones} from '../escenas/pantallas';
import {Contador, Duelo, Ranking, Recibo} from '../escenas/plata';
import {DosVidas, Congelado, DatoVivo, EstoSosVos, LetraVentana} from '../escenas/metraje';
import {CifraSeCae, Embudo, Encuesta, RelojQueCorre, TresVerdades} from '../escenas/mas';
import type {Parte} from './compilar';
import {resolverClip} from './resolverClip';

// EL REGISTRO
//
// Esto es lo que hace que "el sistema adapte todos los guiones con la
// biblioteca de formatos" sea cierto y no una frase. compilar() ya
// decidio QUE formato le toca a cada parte del guion (por ejemplo
// "niega" -> "listaTachada"); esto es lo que convierte esa decision en
// una pieza de React de verdad.
//
// LA REGLA DE ORO DE CADA ADAPTADOR: tiene que armar algo coherente
// usando SOLO 'parte.dice' (las lineas que el autor escribio) e
// 'imagen' (lo que pidio ver). 'datos' es una mejora opcional -- el
// autor del guion no sabe de antemano que formato le va a tocar, asi
// que no puede escribir 'datos' pensando en un formato especifico. Los
// formatos que necesitan datos con una forma exacta (encuesta, ranking,
// cifraSeCae, contador, recibo) ya fueron filtrados por el compilador
// si esos datos no estaban -- si llegaron hasta aca es porque SI estan.

const ICONOS: NombreFigura[] = ['documento', 'lupa', 'persona', 'notebook', 'etiqueta', 'chip', 'robot', 'barras', 'reloj', 'candado'];
const iconoPara = (i: number) => ICONOS[i % ICONOS.length];

const claveImagen = (p: Parte, tema: string) => p.imagen || tema;

type Adaptador = (p: Parte, dur: number, tema: string) => React.ReactNode;

const punch: Adaptador = (p, dur, tema) => {
  const paso = (dur * 0.75) / Math.max(1, p.dice.length);
  return (
    <Punch
      lineas={p.dice}
      entra={p.dice.map((_, i) => i * paso)}
      clip={p.imagen ? (resolverClip(claveImagen(p, tema)) ?? undefined) : undefined}
      tam={p.dice.some((l) => l.length > 22) ? 84 : 112}
    />
  );
};

const tresVerdades: Adaptador = (p) => (
  <TresVerdades frases={p.dice.length ? p.dice : ['—']} />
);

const estoSosVos: Adaptador = (p, dur, tema) => {
  const clip = resolverClip(claveImagen(p, tema));
  if (!clip) return punch(p, dur, tema);
  return (
    <EstoSosVos
      clip={clip}
      lineas={p.dice.length > 1 ? p.dice.slice(0, -1) : p.dice}
      cierre={p.dice.length > 1 ? p.dice[p.dice.length - 1] : undefined}
    />
  );
};

const congelado: Adaptador = (p, dur, tema) => {
  const clip = resolverClip(claveImagen(p, tema));
  if (!clip) return punch(p, dur, tema);
  const sello = p.dice[p.dice.length - 1] || 'MIRÁ';
  const pie = p.dice.length > 1 ? p.dice.slice(0, -1).join(' ') : undefined;
  return <Congelado clip={clip} sello={sello} pie={pie} cuando={Math.min(1.4, dur * 0.35)} />;
};

const datoVivo: Adaptador = (p, dur, tema) => {
  const clip = resolverClip(claveImagen(p, tema));
  if (!clip) return punch(p, dur, tema);
  const tieneDatoNumerico = p.datos && ((p.datos as any).hasta !== undefined || (p.datos as any).a !== undefined);
  const cifra = p.datos && (p.datos as any).hasta !== undefined
    ? String((p.datos as any).hasta)
    : p.datos && (p.datos as any).a !== undefined
      ? String((p.datos as any).a)
      : p.dice[p.dice.length - 1] || '';
  // Si la cifra sale de un dato numerico, dice[1] es una linea aparte
  // y puede ir de "abajo". Si la cifra salio de la ultima linea de
  // dice (no habia datos), esa linea YA se esta mostrando como cifra
  // -- mostrarla otra vez como "abajo" la duplicaria en pantalla.
  const abajo = tieneDatoNumerico ? p.dice[1] : undefined;
  return <DatoVivo clip={clip} arriba={p.dice[0] || ''} cifra={cifra} abajo={abajo} />;
};

const letraVentana: Adaptador = (p, dur, tema) => {
  const clip = resolverClip(claveImagen(p, tema));
  const palabra = [...p.dice].sort((a, b) => a.length - b.length)[0] || p.dice[0] || '';
  if (!clip) return punch(p, dur, tema);
  return <LetraVentana clip={clip} texto={palabra.toUpperCase()} pie={p.dice.find((l) => l !== palabra)} />;
};

const dosVidas: Adaptador = (p, dur, tema) => {
  const clip = resolverClip(claveImagen(p, tema)) || 'dinero-00.mp4';
  return (
    <DosVidas
      arriba={{clip, rotulo: 'ANTES', frase: p.dice[0] || ''}}
      abajo={{clip, rotulo: 'AHORA', frase: p.dice[1] || p.dice[0] || ''}}
      remate={p.dice[2]}
    />
  );
};

const diagrama: Adaptador = (p) => {
  const n = Math.min(4, Math.max(2, p.dice.length));
  const items = p.dice.slice(0, n);
  const vertical = n > 3;
  const nodos = items.map((txt, i) => ({
    fig: iconoPara(i),
    x: vertical ? 0.5 : 0.16 + (0.68 * i) / Math.max(1, n - 1),
    y: vertical ? 0.14 + (0.72 * i) / Math.max(1, n - 1) : 0.42,
    tam: vertical ? 160 : 200,
    rotulo: txt,
    t: 0.2 + i * 0.75,
    acento: i === 0 || i === n - 1,
  }));
  const flechas = nodos.slice(1).map((_, i) => ({de: i, a: i + 1, t: 0.55 + i * 0.75, acento: true}));
  return <Diagrama d={{nodos, flechas}} />;
};

const pasos: Adaptador = (p) => (
  <Pasos pasos={p.dice.map((txt, i) => ({fig: iconoPara(i), txt}))} />
);

const cronologia: Adaptador = (p) => (
  <Cronologia
    hitos={p.dice.map((que, i) => ({
      cuando: i === p.dice.length - 1 ? 'HOY' : `PASO ${i + 1}`,
      que,
      acento: i === p.dice.length - 1,
    }))}
  />
);

const listaTachada: Adaptador = (p) => {
  const datos = p.datos as {items?: string[]; queda?: string} | undefined;
  const items = datos?.items ?? p.dice.slice(0, -1);
  const queda = datos?.queda ?? p.dice[p.dice.length - 1] ?? '';
  return <ListaTachada items={items.length ? items : p.dice} queda={queda} />;
};

const embudo: Adaptador = (p) => {
  // El guion puede traer los pisos reales del embudo en 'datos'
  // ([etiqueta, cantidad] por piso). Si no los trajo, se arma un
  // embudo ilustrativo con 'dice' y una escala pareja.
  const datos = p.datos as {pisos?: [string, string][]} | undefined;
  if (datos?.pisos?.length) {
    return <Embudo pisos={datos.pisos.map(([txt, cuantos]) => ({txt, cuantos}))} />;
  }
  const escala = ['100', '60', '30', '10', '4'];
  return (
    <Embudo
      pisos={p.dice.map((txt, i) => ({txt, cuantos: escala[Math.min(i, escala.length - 1)]}))}
    />
  );
};

const balanza: Adaptador = (p) => {
  const datos = p.datos as {izqPeso?: number; derPeso?: number} | undefined;
  return (
    <Balanza
      izq={{txt: p.dice[0] || '', peso: datos?.izqPeso ?? 1}}
      der={{txt: p.dice[1] || p.dice[0] || '', peso: datos?.derPeso ?? 3}}
      pie={p.dice[2]}
    />
  );
};

const antesDespues: Adaptador = (p) => (
  <AntesDespues
    antes={{rotulo: 'ANTES', txt: p.dice[0] || ''}}
    despues={{rotulo: 'AHORA', txt: p.dice[1] || p.dice[0] || ''}}
  />
);

const chat: Adaptador = (p) => {
  const paso = 1.4;
  return (
    <Chat
      mensajes={p.dice.map((txt, i) => ({
        de: i % 2 === 0 ? 'ellos' : 'vos',
        txt,
        t: 0.3 + i * paso,
        acento: i === p.dice.length - 1,
      }))}
    />
  );
};

const buscador: Adaptador = (p) => (
  <Buscador
    consulta={p.dice[0] || ''}
    sugerencias={p.dice.slice(1).map((txt, i) => ({txt, t: 2.1 + i * 0.4, acento: i === p.dice.length - 2}))}
  />
);

const notificaciones: Adaptador = (p) => (
  <Notificaciones
    items={p.dice.map((txt, i) => ({app: 'AHORA', txt, t: 0.3 + i * 0.5, acento: i === p.dice.length - 1}))}
  />
);

const contador: Adaptador = (p) => {
  const d = p.datos as {hasta: number; prefijo?: string; sufijo?: string; desde?: number};
  return <Contador arriba={p.dice[0]} hasta={d.hasta} abajo={p.dice[1]} prefijo={d.prefijo} sufijo={d.sufijo} desde={d.desde} />;
};

const cifraSeCae: Adaptador = (p) => {
  const d = p.datos as {de: string; a: string};
  return <CifraSeCae arriba={p.dice[0] || ''} de={d.de} a={d.a} abajo={p.dice[1]} />;
};

const ranking: Adaptador = (p) => {
  const d = p.datos as {filas: {txt: string; valor: number; acento?: boolean}[]; unidad?: string};
  return <Ranking titulo={p.dice[0]} filas={d.filas} unidad={d.unidad} />;
};

const encuesta: Adaptador = (p) => {
  const d = p.datos as {aTxt: string; aPct: number; bTxt: string; bPct: number};
  return (
    <Encuesta
      pregunta={p.dice[0] || ''}
      a={{txt: d.aTxt, pct: d.aPct}}
      b={{txt: d.bTxt, pct: d.bPct}}
      remate={p.dice[1]}
    />
  );
};

const recibo: Adaptador = (p) => {
  const d = p.datos as {conceptos: {txt: string; monto: number}[]};
  return (
    <Recibo
      titulo={p.dice[0] || ''}
      entra={d.conceptos.filter((c) => c.monto >= 0).map((c, i) => ({txt: c.txt, monto: c.monto, t: 0.4 + i * 0.8}))}
      sale={d.conceptos.filter((c) => c.monto < 0).map((c, i) => ({txt: c.txt, monto: Math.abs(c.monto), t: 1.6 + i * 0.8}))}
      total={{txt: p.dice[1] || 'Total', t: 0.6 + d.conceptos.length * 0.8}}
    />
  );
};

const duelo: Adaptador = (p) => {
  const d = p.datos as {izq?: string; der?: string} | undefined;
  return (
    <Duelo
      izq={{rotulo: p.dice[0] || 'A', valor: d?.izq ?? ''}}
      der={{rotulo: p.dice[1] || 'B', valor: d?.der ?? ''}}
      remate={p.dice[2]}
    />
  );
};

const relojQueCorre: Adaptador = (p) => {
  const d = p.datos as {desde?: number} | undefined;
  return <RelojQueCorre arriba={p.dice[0] || ''} desde={d?.desde ?? 24} hasta={0} abajo={p.dice[1]} unidad="h" />;
};

export const REGISTRO: Record<string, Adaptador> = {
  punch, tresVerdades, estoSosVos, congelado, datoVivo, letraVentana,
  dosVidas, diagrama, pasos, cronologia, listaTachada, embudo, balanza,
  antesDespues, chat, buscador, notificaciones, contador, cifraSeCae,
  ranking, encuesta, recibo, duelo, relojQueCorre,
};
