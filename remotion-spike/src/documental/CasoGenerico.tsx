import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DatosDiagrama, Diagrama} from '../dibujo/Diagrama';
import {Figura, NombreFigura} from '../dibujo/figuras';
import {LluviaDinero, Resplandor} from '../escenas/dinero-fx';
import {AntesDespues, Balanza, Cronologia, ListaTachada} from '../escenas/explica';
import {Golpe, Grano, Pulso} from '../escenas/golpes';
import {Fondo} from '../escenas/metraje';
import {CifraSeCae} from '../escenas/mas';
import {Contador} from '../escenas/plata';
import {cargarFuentes} from '../fuentes';
import {GRADING, GROTESCA, PALETA, SERIF} from '../identidad';
import {golpeSeco} from '../stress/duro';
import mapaAudioDocRaw from './mapa_audio_documental.json';

// ============================================== AUDIO REAL (Qwen3-TTS)
//
// mapaAudioDocRaw se genera con mapear_audio_documental.ts a partir de
// capturas_voz/manifest_voz_documental.json + los mp3 en
// capturas_voz/audio_documental/ (copiados a public/audio_documental/
// para que staticFile los encuentre). Un caso sin entrada aca (por
// ahora, ninguno de los 19 -- ver mapear_audio_documental.ts) cae en
// las duraciones "adivinadas" de siempre, para no romper si algun dia
// se agrega un caso nuevo antes de generarle la voz.

type CampoAudioDoc = {campo: 'hook' | 'centro' | 'cifra' | 'final'; texto: string; archivo: string; duracion: number};
const mapaAudioDoc = mapaAudioDocRaw as Record<string, {campos: CampoAudioDoc[]}>;

// Aire despues de que termina de sonar cada linea, antes de cortar a
// la siguiente -- sin esto el corte visual queda pegado al final de
// la palabra, se siente atropellado.
const AIRE_LINEA = 0.25;

const audiosDe = (slug: string, campo: CampoAudioDoc['campo']): CampoAudioDoc[] =>
  (mapaAudioDoc[slug]?.campos ?? []).filter((c) => c.campo === campo);

// MOTOR GENERICO PARA LA SERIE DOCUMENTAL (20 casos)
//
// RebeccaBeach.tsx (caso 1) se armo a mano porque el operador dio un
// guion segundo a segundo. Los casos 2 a 20 vienen con libertad de
// formato -- en vez de escribir 19 archivos casi iguales, este motor
// arma cada video a partir de DATOS (casos.ts), reusando exactamente
// los mismos componentes de la biblioteca (Cronologia, Diagrama,
// Balanza, AntesDespues, CifraSeCae, Contador, ListaTachada) mas el
// mismo patron de "golpe seco" que ya se uso y verifico en Rebecca.
//
// Las fotos de estos casos son imagenes generadas por IA que el
// operador proveyo como ilustracion (ver CREDITOS.md en cada carpeta
// de assets/personas/) -- se muestran de fondo sin afirmar ni explicar
// nada sobre su origen, tal cual pidio el operador.

const FPS = 30;
const seg = (s: number) => Math.round(s * FPS);

const ConGolpe: React.FC<{t0: number; color?: string; children: React.ReactNode}> = ({t0, color = '#fff', children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const g = golpeSeco(t, t0);
  if (t < t0) return null;
  return (
    <>
      <div style={{opacity: g.opacity, transform: `scale(${g.escala}) rotate(${g.giro}deg)`}}>{children}</div>
      {g.lavado > 0 ? <AbsoluteFill style={{background: color, opacity: g.lavado * 0.85, pointerEvents: 'none'}} /> : null}
    </>
  );
};

const tamPorLargo = (s: string) => (s.length <= 16 ? 104 : s.length <= 32 ? 78 : s.length <= 52 ? 60 : s.length <= 75 ? 50 : 42);

const LineaImpacto: React.FC<{txt: string; acento?: boolean}> = ({txt, acento}) => (
  <div
    style={{
      fontFamily: GROTESCA, fontWeight: 800, fontStretch: '80%', fontSize: tamPorLargo(txt), lineHeight: 1.08,
      letterSpacing: '-0.03em', textTransform: 'uppercase', textAlign: 'center',
      color: acento ? PALETA.acento : PALETA.texto, textShadow: '0 6px 40px rgba(0,0,0,0.85)',
    }}
  >
    {txt}
  </div>
);

const ConIcono: React.FC<{t0: number; fig: NombreFigura; txt: string; acento?: boolean; color?: string}> = ({t0, fig, txt, acento, color = '#fff'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const g = golpeSeco(t, t0);
  if (t < t0) return null;
  const trazo = Math.max(0, Math.min(1, (t - t0) / 0.4));
  return (
    <>
      <div style={{opacity: g.opacity, transform: `scale(${g.escala}) rotate(${g.giro}deg)`, display: 'flex', alignItems: 'center', gap: 22}}>
        <Figura nombre={fig} p={trazo} col={acento ? PALETA.acento : '#fff'} tam={48} grosor={5} />
        <LineaImpacto txt={txt} acento={acento} />
      </div>
      {g.lavado > 0 ? <AbsoluteFill style={{background: color, opacity: g.lavado * 0.85, pointerEvents: 'none'}} /> : null}
    </>
  );
};

// ============================================================ TIPOS

export type CentroVisual =
  | {tipo: 'cronologia'; hitos: {cuando: string; que: string; acento?: boolean}[]}
  | {tipo: 'diagrama'; d: DatosDiagrama; narracion?: string[]}
  | {tipo: 'lista'; items: string[]; queda: string}
  | {tipo: 'balanza'; izq: {txt: string; peso: number}; der: {txt: string; peso: number}; pie?: string}
  | {tipo: 'antesDespues'; antes: {rotulo: string; txt: string}; despues: {rotulo: string; txt: string}}
  | {tipo: 'lineas'; items: {txt: string; fig?: NombreFigura}[]}
  | {tipo: 'montaje'; items: {clip: string; texto: string; estilo?: 'marco' | 'tarjeta'}[]};

export type CifraVisual =
  | {tipo: 'cifraSeCae'; arriba: string; de: string; a: string; abajo?: string}
  | {tipo: 'contador'; arriba?: string; hasta: number; prefijo?: string; sufijo?: string; abajo?: string};

export type CasoConfig = {
  slug: string;
  foto?: string;
  clip?: string;
  hook: string[];
  hookDinero?: boolean;
  centro: CentroVisual;
  cifra?: CifraVisual;
  cifraDinero?: boolean;
  final: string[];
};

// ==================================================== DURACION POR BLOQUE
//
// Con audio real (ver AUDIO REAL arriba): la duracion de un bloque es
// la SUMA de sus clips + un respiro de aire por linea + un margen de
// cierre. Sin audio para ese bloque (solo montaje, que no lleva
// narracion propia -- ver mapear_audio_documental.ts) se mantiene la
// duracion "adivinada" de siempre, calculada a partir de la
// cantidad/forma del contenido.

const sumaAudio = (audios: CampoAudioDoc[], margenFinal: number): number =>
  audios.reduce((acc, a) => acc + a.duracion + AIRE_LINEA, 0) + margenFinal;

const duracionCentro = (cv: CentroVisual, audiosCentro: CampoAudioDoc[]): number => {
  if (audiosCentro.length > 0) return sumaAudio(audiosCentro, 0.6);
  switch (cv.tipo) {
    case 'cronologia':
      return 1.6 + cv.hitos.length * 1.6;
    case 'diagrama': {
      const ultimo = Math.max(...cv.d.nodos.map((n) => n.t));
      return ultimo + 2.6;
    }
    case 'lista':
      return 2.2 + cv.items.length * 1.15;
    case 'balanza':
      return 6.0;
    case 'antesDespues':
      return 5.5;
    case 'lineas':
      return 1.0 + cv.items.length * 0.42 + 1.6;
    case 'montaje':
      return cv.items.length * 0.78 + 0.4;
  }
};

const duracionesBloques = (cfg: CasoConfig) => {
  const audiosHook = audiosDe(cfg.slug, 'hook');
  const audiosCentro = audiosDe(cfg.slug, 'centro');
  const audiosCifra = audiosDe(cfg.slug, 'cifra');
  const audiosFinal = audiosDe(cfg.slug, 'final');

  const durHook = audiosHook.length > 0 ? sumaAudio(audiosHook, 0.4) : cfg.hook.length * 1.6 + 0.5;
  const durCentro = duracionCentro(cfg.centro, audiosCentro);
  const durCifra = cfg.cifra ? (audiosCifra.length > 0 ? sumaAudio(audiosCifra, 0.6) : 5.6) : 0;
  const durFinal = audiosFinal.length > 0 ? sumaAudio(audiosFinal, 0.5) : cfg.final.length * 1.75 + 0.5;
  return {durHook, durCentro, durCifra, durFinal};
};

export const duracionCaso = (cfg: CasoConfig): number => {
  const {durHook, durCentro, durCifra, durFinal} = duracionesBloques(cfg);
  return durHook + durCentro + durCifra + durFinal + 3;
};

// ==================================================================== BEATS

// Con audios: cada linea vive en su propio Sequence, con su Audio real
// adentro -- el corte visual pasa exactamente cuando termina de sonar
// esa linea (+ AIRE_LINEA), nunca antes ni despues. Sin audios (caso
// sin voz generada todavia) cae al reparto viejo por "ventana" fija.
const Secuencia: React.FC<{lineas: string[]; ventana: number; audios?: CampoAudioDoc[]}> = ({lineas, ventana, audios}) => {
  if (audios && audios.length === lineas.length) {
    let cursor = 0;
    return (
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 9%'}}>
        {lineas.map((linea, i) => {
          const dur = audios[i].duracion + AIRE_LINEA;
          const desde = cursor;
          cursor += dur;
          const esUltima = i === lineas.length - 1;
          return (
            <Sequence key={i} from={seg(desde)} durationInFrames={seg(dur)}>
              <ConGolpe t0={0.08} color={esUltima ? PALETA.acento : '#fff'}>
                <LineaImpacto txt={linea} acento={esUltima} />
              </ConGolpe>
              <Audio src={staticFile(`audio_documental/${audios[i].archivo}`)} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    );
  }
  // Fallback sin audio: comportamiento original (ventana fija).
  return <SecuenciaSinAudio lineas={lineas} ventana={ventana} />;
};

const SecuenciaSinAudio: React.FC<{lineas: string[]; ventana: number}> = ({lineas, ventana}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const i = Math.min(lineas.length - 1, Math.floor(t / ventana));
  const t0 = i * ventana + 0.08;
  const esUltima = i === lineas.length - 1;
  return (
    <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 9%'}}>
      <ConGolpe key={i} t0={t0} color={esUltima ? PALETA.acento : '#fff'}>
        <LineaImpacto txt={lineas[i]} acento={esUltima} />
      </ConGolpe>
    </AbsoluteFill>
  );
};

const HookBeat: React.FC<{cfg: CasoConfig}> = ({cfg}) => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    {cfg.foto || cfg.clip ? <Fondo foto={cfg.foto} clip={cfg.clip} velo={0.6} duotono zoom={[1.04, 1.16]} /> : null}
    {cfg.hookDinero ? <Resplandor fuerza={0.5} /> : null}
    {cfg.hookDinero ? <LluviaDinero intensidad={0.85} /> : null}
    <Secuencia lineas={cfg.hook} ventana={1.6} audios={audiosDe(cfg.slug, 'hook')} />
    <Pulso cada={0.9} largo={0.05} fuerza={0.3} />
  </AbsoluteFill>
);

const StackImpacto: React.FC<{items: {txt: string; fig?: NombreFigura}[]; audios: CampoAudioDoc[]}> = ({items, audios}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const conAudio = audios.length === items.length;
  // t0 acumulado de duracion real si hay audio; "paso" fijo si no
  const t0s: number[] = [];
  let cursor = 0.3;
  for (let i = 0; i < items.length; i++) {
    t0s.push(cursor);
    cursor += conAudio ? audios[i].duracion + AIRE_LINEA : 0.42;
  }
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 6%'}}>
      {items.map((it, i) => {
        const t0 = t0s[i];
        if (t < t0) return null;
        return (
          <React.Fragment key={i}>
            {it.fig ? (
              <ConIcono t0={t0} fig={it.fig} txt={it.txt} acento={i % 2 === 1} color={PALETA.acento} />
            ) : (
              <ConGolpe t0={t0} color={i % 2 ? PALETA.acento : '#fff'}>
                <LineaImpacto txt={it.txt} acento={i % 2 === 1} />
              </ConGolpe>
            )}
            {conAudio ? <Sequence from={seg(t0)}><Audio src={staticFile(`audio_documental/${audios[i].archivo}`)} /></Sequence> : null}
          </React.Fragment>
        );
      })}
      <Pulso cada={0.6} largo={0.04} fuerza={0.2} />
    </AbsoluteFill>
  );
};

// MONTAJE VELOZ
//
// Formato nuevo, calcado del estilo que el operador mostro como
// referencia: metraje real cambiando cada fraccion de segundo, una
// palabra o frase corta por corte, con un marco de color solido que
// cambia en cada corte -- el color hace de puntuacion, no el texto.
// Alterna dos tratamientos: pantalla completa con marco grueso
// (titular abajo) y tarjeta tipo postal (recorte redondeado, leyenda
// en italica abajo). Los colores del marco salen de la paleta de
// marca (acento + variantes), nunca un color nuevo sin relacion.

const MARCO_COLORES = [PALETA.acento, '#141414', PALETA.texto, '#7A2410'];
const PASO_MONTAJE = 0.78;

const ItemMarco: React.FC<{clip: string; texto: string; color: string}> = ({clip, texto, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const g = golpeSeco(frame / fps, 0);
  return (
    <AbsoluteFill style={{background: color}}>
      <div style={{position: 'absolute', inset: 22, overflow: 'hidden', borderRadius: 6}}>
        <OffthreadVideo src={staticFile(`video/${clip}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADING}} />
        <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent 45%)'}} />
      </div>
      <AbsoluteFill style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 9% 15% 9%'}}>
        <div
          style={{
            opacity: g.opacity, transform: `scale(${g.escala}) rotate(${g.giro}deg)`,
            fontFamily: GROTESCA, fontWeight: 800, fontStretch: '82%', lineHeight: 1.04,
            fontSize: tamPorLargo(texto) * 0.62, color: '#fff', textTransform: 'uppercase',
            letterSpacing: '-0.02em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)',
          }}
        >
          {texto}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ItemTarjeta: React.FC<{clip: string; texto: string; oscuro: boolean}> = ({clip, texto, oscuro}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const g = golpeSeco(frame / fps, 0);
  const fondo = oscuro ? PALETA.fondo : PALETA.texto;
  const contraste = oscuro ? PALETA.texto : PALETA.fondo;
  return (
    <AbsoluteFill style={{background: fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <div
        style={{
          opacity: g.opacity, transform: `scale(${g.escala}) rotate(${g.giro}deg)`,
          width: '76%', aspectRatio: '4 / 5', borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}
      >
        <OffthreadVideo src={staticFile(`video/${clip}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{opacity: g.opacity, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 46, color: contraste}}>
        {texto}
      </div>
    </AbsoluteFill>
  );
};

const MontajeVeloz: React.FC<{items: {clip: string; texto: string; estilo?: 'marco' | 'tarjeta'}[]}> = ({items}) => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    {items.map((it, i) => {
      const estilo = it.estilo ?? (i % 2 === 0 ? 'marco' : 'tarjeta');
      return (
        <Sequence key={i} from={seg(i * PASO_MONTAJE)} durationInFrames={seg(PASO_MONTAJE)}>
          {estilo === 'marco' ? (
            <ItemMarco clip={it.clip} texto={it.texto} color={MARCO_COLORES[i % MARCO_COLORES.length]} />
          ) : (
            <ItemTarjeta clip={it.clip} texto={it.texto} oscuro={i % 4 < 2} />
          )}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

// Superpone el audio real de cada linea del centro en su offset
// acumulado -- el contenido visual (Cronologia/Balanza/AntesDespues)
// sigue animandose proporcionalmente segun la duracion TOTAL del
// Sequence padre (que ya es la suma real de estos mismos audios, ver
// duracionCentro), asi que ambos quedan alineados en el total aunque
// el reparto visual interno entre hitos sea aproximado, no al frame.
const AudioCentro: React.FC<{audios: CampoAudioDoc[]}> = ({audios}) => {
  let cursor = 0;
  return (
    <>
      {audios.map((a, i) => {
        const from = cursor;
        cursor += a.duracion + AIRE_LINEA;
        return (
          <Sequence key={i} from={seg(from)}>
            <Audio src={staticFile(`audio_documental/${a.archivo}`)} />
          </Sequence>
        );
      })}
    </>
  );
};

const CentroBeat: React.FC<{slug: string; cv: CentroVisual; foto?: string; clip?: string}> = ({slug, cv, foto, clip}) => {
  const audios = audiosDe(slug, 'centro');
  if (cv.tipo === 'cronologia') {
    return (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <Cronologia hitos={cv.hitos} />
        <Pulso cada={1.3} largo={0.05} fuerza={0.22} />
        <AudioCentro audios={audios} />
      </AbsoluteFill>
    );
  }
  if (cv.tipo === 'diagrama') {
    return (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <Diagrama d={cv.d} />
        <Pulso cada={1.6} largo={0.05} fuerza={0.2} />
        <AudioCentro audios={audios} />
      </AbsoluteFill>
    );
  }
  if (cv.tipo === 'lista') {
    return (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        {foto || clip ? <Fondo foto={foto} clip={clip} velo={0.78} duotono zoom={[1.0, 1.08]} /> : null}
        <ListaTachada items={cv.items} queda={cv.queda} />
        <Pulso cada={1.1} largo={0.05} fuerza={0.26} />
        <AudioCentro audios={audios} />
      </AbsoluteFill>
    );
  }
  if (cv.tipo === 'balanza') {
    return (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <Balanza izq={cv.izq} der={cv.der} pie={cv.pie} />
        <Pulso cada={0.95} largo={0.05} fuerza={0.18} />
        <AudioCentro audios={audios} />
      </AbsoluteFill>
    );
  }
  if (cv.tipo === 'antesDespues') {
    return (
      <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
        <AntesDespues antes={cv.antes} despues={cv.despues} />
        <Pulso cada={0.85} largo={0.05} fuerza={0.2} />
        <AudioCentro audios={audios} />
      </AbsoluteFill>
    );
  }
  if (cv.tipo === 'montaje') {
    return <MontajeVeloz items={cv.items} />;
  }
  return <StackImpacto items={cv.items} audios={audios} />;
};

const CifraBeat: React.FC<{slug: string; cv: CifraVisual; dinero?: boolean}> = ({slug, cv, dinero}) => (
  <AbsoluteFill style={{backgroundColor: dinero ? '#000' : PALETA.fondo}}>
    {dinero ? <Fondo clip="dinero-00.mp4" velo={0.66} zoom={[1.0, 1.12]} /> : null}
    {dinero ? <Resplandor fuerza={0.45} /> : null}
    {dinero ? <LluviaDinero intensidad={1} /> : null}
    {!dinero ? <Pulso cada={1.3} largo={0.05} fuerza={0.16} /> : null}
    {cv.tipo === 'cifraSeCae' ? (
      <CifraSeCae arriba={cv.arriba} de={cv.de} a={cv.a} abajo={cv.abajo} />
    ) : (
      <Contador arriba={cv.arriba} hasta={cv.hasta} prefijo={cv.prefijo} sufijo={cv.sufijo} abajo={cv.abajo} />
    )}
    <AudioCentro audios={audiosDe(slug, 'cifra')} />
  </AbsoluteFill>
);

const FinalBeat: React.FC<{slug: string; lineas: string[]}> = ({slug, lineas}) => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <Secuencia lineas={lineas} ventana={1.75} audios={audiosDe(slug, 'final')} />
    <Pulso cada={1.0} largo={0.05} fuerza={0.24} />
  </AbsoluteFill>
);

// El mismo CTA, con los mismos colores fijos, en los 20 videos de la
// serie -- nunca cambia de color: es lo que pidio el operador para no
// perder coherencia de marca.
export const CtaBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const ap = (a: number, b: number, max = 1) => interpolate(t, [a, b], [0, max], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 8%'}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '84%', fontSize: 74, color: PALETA.texto, letterSpacing: '-0.03em', textTransform: 'uppercase', textAlign: 'center', opacity: ap(0, 0.35)}}>
        Comentá «<span style={{color: PALETA.acento}}>MÉTODO</span>»
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 400, fontSize: 38, color: PALETA.texto, opacity: ap(0.4, 0.75, 0.75)}}>
        y te paso cómo armar el tuyo
      </div>
    </AbsoluteFill>
  );
};

// ==================================================================== ROOT

export const Caso: React.FC<{cfg: CasoConfig}> = ({cfg}) => {
  cargarFuentes();
  const {durHook, durCentro, durCifra, durFinal} = duracionesBloques(cfg);

  let cursor = 0;
  type GolpeTipo = Parameters<typeof Golpe>[0]['tipo'];
  const bloques: {desde: number; hasta: number; golpe: GolpeTipo; el: React.ReactNode}[] = [];

  bloques.push({desde: cursor, hasta: cursor + durHook, golpe: 'ninguno', el: <HookBeat cfg={cfg} />});
  cursor += durHook;

  bloques.push({
    desde: cursor,
    hasta: cursor + durCentro,
    golpe: 'corte',
    el: (
      <CentroBeat
        slug={cfg.slug}
        cv={cfg.centro}
        foto={cfg.centro.tipo === 'lista' ? cfg.foto : undefined}
        clip={cfg.centro.tipo === 'lista' ? cfg.clip : undefined}
      />
    ),
  });
  cursor += durCentro;

  if (cfg.cifra) {
    bloques.push({desde: cursor, hasta: cursor + durCifra, golpe: 'fogonazo', el: <CifraBeat slug={cfg.slug} cv={cfg.cifra} dinero={cfg.cifraDinero} />});
    cursor += durCifra;
  }

  bloques.push({desde: cursor, hasta: cursor + durFinal, golpe: 'sacudon', el: <FinalBeat slug={cfg.slug} lineas={cfg.final} />});
  cursor += durFinal;

  bloques.push({desde: cursor, hasta: cursor + 3, golpe: 'fogonazo', el: <CtaBeat />});

  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {bloques.map((b, i) => (
        <Sequence key={i} from={seg(b.desde)} durationInFrames={seg(b.hasta) - seg(b.desde)}>
          <Golpe tipo={b.golpe}>{b.el}</Golpe>
        </Sequence>
      ))}
      <Grano fuerza={0.045} />
    </AbsoluteFill>
  );
};
