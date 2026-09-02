import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Diagrama} from '../dibujo/Diagrama';
import {Figura, NombreFigura} from '../dibujo/figuras';
import {LogoEtsy, LogoIdeogram, LogoMidjourney, LogoOpenAI} from '../dibujo/logos';
import {LluviaDinero, Resplandor} from '../escenas/dinero-fx';
import {CifraSeCae} from '../escenas/mas';
import {Cronologia, ListaTachada} from '../escenas/explica';
import {Golpe, Grano, Pulso} from '../escenas/golpes';
import {LogosHerramientas} from '../escenas/herramientas';
import {Fondo} from '../escenas/metraje';
import {Contador} from '../escenas/plata';
import {cargarFuentes} from '../fuentes';
import {GROTESCA, PALETA} from '../identidad';
import {golpeSeco} from '../stress/duro';
import duracionesRaw from './mapa_audio_rebecca.json';

const FOTO = 'becky-beach.jpg';

// GUION LITERAL DEL OPERADOR: "GENERÓ $20.000/MES CON IA"
//
// Caso real: Becky (Rebecca) Beach, becybeach.co / beckybeach.ai --
// vendedora de productos digitales desde antes de la IA, escalo con
// IA. La cifra de $20.000/mes y el uso de IA para acelerar la
// creacion estan confirmados en Side Hustle Nation y su propio sitio.
// El numero de "1.500+ productos" tambien sale de esas fuentes.
//
// Esto NO pasa por el compilador de recetas (receta/compilar.ts): el
// guion del operador viene con tiempos y texto en pantalla exactos,
// segundo a segundo -- pasarlo por el compilador (que elige formato al
// azar) rompería esa coreografia. Se arma literal, como el stress
// test, reusando los mismos componentes de la biblioteca.
//
// AUDIO REAL: las 35 lineas de capturas_voz/audio_documental/
// rebecca-beach_00..34.mp3 se corresponden 1 a 1, en orden, con cada
// palabra/frase que este guion ya mostraba en pantalla. La duracion
// original (escrita a mano, ~58s) era mas corta que lo que tarda esa
// narracion real, asi que los tiempos de abajo salen de la duracion
// MEDIDA de cada clip (mapa_audio_rebecca.json, generado por
// mapear_audio_rebecca.ts) en vez de estar fijos -- igual que
// CasoGenerico.tsx, pero calculado a mano porque este video no pasa
// por ese motor. La animacion interna de los bloques compartidos
// (Cronologia, CifraSeCae, Contador, ListaTachada, LogosHerramientas)
// sigue siendo proporcional a la duracion del bloque, no al frame
// exacto de cada linea -- mismo tradeoff que AudioCentro en
// CasoGenerico.tsx.

const FPS = 30;
const seg = (s: number) => Math.round(s * FPS);
const AIRE = 0.25;
const DUR: number[] = duracionesRaw as number[];

const archivoDe = (idx: number) => `rebecca-beach_${String(idx).padStart(2, '0')}.mp3`;

type Beat = {idx: number; t0: number};

function secuencial(indices: number[], inicio = 0.1): {items: Beat[]; fin: number} {
  const items: Beat[] = [];
  let t = inicio;
  for (const idx of indices) {
    items.push({idx, t0: t});
    t += DUR[idx] + AIRE;
  }
  return {items, fin: t};
}

const AudioBeats: React.FC<{items: Beat[]}> = ({items}) => (
  <>
    {items.map((b, i) => (
      <Sequence key={i} from={seg(b.t0)}>
        <Audio src={staticFile(`audio_documental/${archivoDe(b.idx)}`)} />
      </Sequence>
    ))}
  </>
);

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

const Grande: React.FC<{txt: string; tam?: number; acento?: boolean}> = ({txt, tam = 130, acento}) => (
  <div
    style={{
      fontFamily: GROTESCA, fontWeight: 800, fontStretch: '76%', fontSize: tam, lineHeight: 0.96,
      letterSpacing: '-0.045em', textTransform: 'uppercase', textAlign: 'center',
      color: acento ? PALETA.acento : PALETA.texto,
      textShadow: '0 6px 40px rgba(0,0,0,0.85)',
    }}
  >
    {txt}
  </div>
);

// Como ConGolpe pero con un dibujo (Figura) al lado de la palabra --
// para no explicar todo con texto solo, como pidio el operador.
const ConIcono: React.FC<{t0: number; fig: NombreFigura; txt: string; tam?: number; acento?: boolean; color?: string}> = (
  {t0, fig, txt, tam = 92, acento, color = '#fff'},
) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const g = golpeSeco(t, t0);
  if (t < t0) return null;
  const trazo = Math.max(0, Math.min(1, (t - t0) / 0.4));
  return (
    <>
      <div
        style={{
          opacity: g.opacity, transform: `scale(${g.escala}) rotate(${g.giro}deg)`,
          display: 'flex', alignItems: 'center', gap: 26,
        }}
      >
        <Figura nombre={fig} p={trazo} col={acento ? PALETA.acento : '#fff'} tam={tam * 0.85} grosor={5} />
        <Grande txt={txt} tam={tam} acento={acento} />
      </div>
      {g.lavado > 0 ? <AbsoluteFill style={{background: color, opacity: g.lavado * 0.85, pointerEvents: 'none'}} /> : null}
    </>
  );
};

// ============================================================ 1. HOOK
// 0: "$20.000 al mes." | 1: "IA" | 2: "Productos" | 3: "Dinero" | 4: "¿Cómo?"
const H_finNumero = 0.1 + DUR[0] + AIRE;
const H_iconos = secuencial([1, 2, 3], H_finNumero);
const H_comoT0 = H_iconos.fin;
export const HOOK_DUR = H_comoT0 + DUR[4] + 0.45;

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const conDinero = t < H_finNumero;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <Fondo foto={FOTO} velo={0.6} duotono zoom={[1.04, 1.16]} />
      {conDinero ? <Resplandor fuerza={0.5} /> : null}
      {conDinero ? <LluviaDinero intensidad={0.85} /> : null}
      {t < H_finNumero ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6%'}}>
          <ConGolpe t0={0.1} color={PALETA.acento}>
            <Grande txt="$20.000/MES" tam={118} acento />
          </ConGolpe>
        </AbsoluteFill>
      ) : t < H_iconos.fin ? (
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
          <ConIcono t0={H_iconos.items[0].t0} fig="chip" txt="IA" tam={76} />
          <ConIcono t0={H_iconos.items[1].t0} fig="notebook" txt="PRODUCTOS" tam={76} />
          <ConIcono t0={H_iconos.items[2].t0} fig="billete" txt="DINERO" tam={76} acento color={PALETA.acento} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={H_comoT0} color={PALETA.acento}>
            <Grande txt="¿CÓMO?" tam={150} />
          </ConGolpe>
        </AbsoluteFill>
      )}
      <Pulso cada={0.9} largo={0.05} fuerza={0.3} />
      <AudioBeats items={[{idx: 0, t0: 0.1}, ...H_iconos.items, {idx: 4, t0: H_comoT0}]} />
    </AbsoluteFill>
  );
};

// ================================================ 2. ROMPER EXPECTATIVA
// 5: "Prompts." | 6: "Cursos de IA." | 7: "Señales de trading." | 8: "Productos digitales."
const R_beats = secuencial([5, 6, 7, 8], 0.1);
export const ROMPE_DUR = R_beats.fin + 0.4;

const Rompe: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <ListaTachada items={['Prompts', 'Cursos de IA', 'Señales de trading']} queda="Productos digitales" />
    <Pulso cada={1.1} largo={0.05} fuerza={0.26} />
    <AudioBeats items={R_beats.items} />
  </AbsoluteFill>
);

// ========================================================= 3. QUIÉN ES
// 9: "Becky Beach" | 10-12: los 3 hitos de la Cronologia
const Q_finNombre = 0.15 + DUR[9] + AIRE;
const Q_crono = secuencial([10, 11, 12], Q_finNombre);
const Q_logoT0 = Q_finNombre + 0.8;
export const QUIENES_DUR = Q_crono.fin + 0.4;

const QuienEs: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const mostrarLogo = t > Q_logoT0;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {t < Q_finNombre ? <Fondo foto={FOTO} velo={0.5} zoom={[1.0, 1.1]} /> : null}
      {t < Q_finNombre ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={0.15}>
            <Grande txt="Becky Beach" tam={84} />
          </ConGolpe>
        </AbsoluteFill>
      ) : (
        <Cronologia
          hitos={[
            {cuando: '2018', que: 'Empieza a vender productos digitales'},
            {cuando: 'DESPUÉS', que: 'Suma IA para crearlos más rápido'},
            {cuando: 'HOY', que: 'Vende en su web, Etsy y Teachers Pay Teachers', acento: true},
          ]}
        />
      )}
      {mostrarLogo ? (
        <div
          style={{
            position: 'absolute', right: '7%', bottom: '9%', display: 'flex', alignItems: 'center', gap: 16,
            opacity: Math.min(1, (t - Q_logoT0) * 2.4),
          }}
        >
          <LogoEtsy size={54} />
          <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 34, color: PALETA.texto}}>Etsy</div>
        </div>
      ) : null}
      <Pulso cada={1.3} largo={0.05} fuerza={0.22} />
      <AudioBeats items={[{idx: 9, t0: 0.15}, ...Q_crono.items]} />
    </AbsoluteFill>
  );
};

// ==================================================== 4. EL PRIMER GIRO
// 13: "Antes, un producto tardaba" | 14: "Semanas o meses" | 15: "Menos de 20 minutos" | 16: "Con IA"
const PG_beats = secuencial([13, 14, 15, 16], 0.1);
export const PRIMERGIRO_DUR = PG_beats.fin + 0.4;

const PrimerGiro: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <CifraSeCae arriba="Antes, un producto tardaba" de="Semanas o meses" a="< 20 minutos" abajo="Con IA" />
    <Pulso cada={1.2} largo={0.05} fuerza={0.24} color={PALETA.acento} />
    <AudioBeats items={PG_beats.items} />
  </AbsoluteFill>
);

// ========================================================= 5. CATÁLOGO
// 17: "Planners. Workbooks... Apps." (un solo clip para las 7 categorias)
// 18: "Productos digitales creados" | 19: "Más de 1500" | 20: "Y sigue subiendo"
const CATEGORIAS: {txt: string; fig: NombreFigura}[] = [
  {txt: 'PLANNERS', fig: 'calendario'},
  {txt: 'WORKBOOKS', fig: 'notebook'},
  {txt: 'JOURNALS', fig: 'documento'},
  {txt: 'TEMPLATES', fig: 'carpeta'},
  {txt: 'STICKERS', fig: 'etiqueta'},
  {txt: 'CLIPART', fig: 'foco'},
  {txt: 'APPS', fig: 'telefono'},
];
const CAT_finIconos = 0.1 + DUR[17] + AIRE;
const CAT_contador = secuencial([18, 19, 20], CAT_finIconos);
export const CATALOGO_DUR = CAT_contador.fin + 0.4;
// paso/inicio originales (0.4 + 7*0.42) se reescalan para llenar la
// ventana real que da el audio de la lista completa (linea 17).
const CAT_ESCALA = (CAT_finIconos - 0.1) / (CATEGORIAS.length * 0.42);
const CAT_paso = 0.42 * CAT_ESCALA;

const Catalogo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <Fondo clip="freelance-00.mp4" velo={0.78} duotono zoom={[1.0, 1.08]} />
      {t < CAT_finIconos ? (
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
          {CATEGORIAS.map((c, i) => {
            const t0 = 0.1 + i * CAT_paso;
            if (t < t0 || t >= t0 + CAT_paso * 2.4) return null;
            return <ConIcono key={c.txt} t0={t0} fig={c.fig} txt={c.txt} tam={62} acento={i % 2 === 1} color={PALETA.acento} />;
          })}
        </AbsoluteFill>
      ) : (
        <Contador arriba="Productos digitales creados" hasta={1500} sufijo="+" abajo="Y sigue subiendo" />
      )}
      <Pulso cada={0.55} largo={0.04} fuerza={0.2} />
      <AudioBeats items={[{idx: 17, t0: 0.1}, ...CAT_contador.items]} />
    </AbsoluteFill>
  );
};

// =========================================================== 6. MÉTODO
// 35: "Todo arranca de un problema." | 36: "Investigación..." | 37: "De ahí, el producto."
// 38: "Publicación..." | 39: "Y venta..." -- una linea por nodo del diagrama.
const MET_beats = secuencial([35, 36, 37, 38, 39], 0.1);
export const METODO_DUR = MET_beats.fin + 0.4;

const Metodo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <Diagrama
      d={{
        nodos: [
          {fig: 'lupa', x: 0.5, y: 0.13, tam: 150, rotulo: 'PROBLEMA', t: 0.2, acento: true},
          {fig: 'barras', x: 0.5, y: 0.34, tam: 140, rotulo: 'INVESTIGACIÓN', t: 1.3},
          {fig: 'notebook', x: 0.5, y: 0.55, tam: 140, rotulo: 'PRODUCTO', t: 2.4},
          {fig: 'cohete', x: 0.5, y: 0.76, tam: 140, rotulo: 'PUBLICACIÓN', t: 3.5},
          {fig: 'billete', x: 0.5, y: 0.94, tam: 140, rotulo: 'VENTA', t: 4.6, acento: true},
        ],
        flechas: [
          {de: 0, a: 1, t: 1.0}, {de: 1, a: 2, t: 2.1}, {de: 2, a: 3, t: 3.2}, {de: 3, a: 4, t: 4.3, acento: true},
        ],
      }}
    />
    <Pulso cada={1.6} largo={0.05} fuerza={0.2} />
    <AudioBeats items={MET_beats.items} />
  </AbsoluteFill>
);

// ==================================================== 7. HERRAMIENTAS
// 21: "Con qué acelera: ChatGPT..." (lista completa en un clip) | 22: "Cuatro herramientas..."
const HER_beats = secuencial([21, 22], 0.1);
export const HERRAMIENTAS_DUR = HER_beats.fin + 0.4;

const Herramientas: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <Fondo clip="celular-00.mp4" velo={0.76} duotono zoom={[1.02, 1.1]} />
    <Resplandor fuerza={0.22} />
    <LogosHerramientas
      titulo="Con qué acelera"
      items={[
        {nombre: 'ChatGPT', color: '#10A37F', texto: 'idea y texto', logo: <LogoOpenAI color={PALETA.texto} size={54} />},
        {nombre: 'Midjourney', color: '#4C6EF5', texto: 'imagen', logo: <LogoMidjourney color={PALETA.texto} size={54} />},
        {nombre: 'Ideogram', color: '#B4844B', texto: 'imagen con texto', logo: <LogoIdeogram color={PALETA.texto} size={54} />},
        {nombre: 'Canva', color: '#00C4CC', texto: 'diseño final'},
      ]}
      pie="Cuatro herramientas. No una idea genial."
    />
    <Pulso cada={0.8} largo={0.05} fuerza={0.24} color={PALETA.acento} />
    <AudioBeats items={HER_beats.items} />
  </AbsoluteFill>
);

// ====================================================== 8. EL DINERO
// 23: "$20.000" | 24: "Por mes." | 25: "No fue magia. Fue método."
const ED_num = secuencial([23, 24], 0.3);
const ED_finFase1 = ED_num.fin + 0.3;
const ED_25t0 = ED_finFase1;
export const ELDINERO_DUR = ED_25t0 + DUR[25] + 0.45;

const ElDinero: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spring({frame: frame - 0.3 * fps, fps, config: {damping: 11, stiffness: 200, mass: 0.5}});
  const tagT0 = ED_num.items[1].t0;
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Fondo clip="dinero-00.mp4" velo={0.66} zoom={[1.0, 1.12]} />
      <Resplandor fuerza={0.45} />
      <LluviaDinero intensidad={t < ED_finFase1 ? 1.1 : 0.35} />
      {t < ED_finFase1 ? (
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              fontFamily: GROTESCA, fontWeight: 800, fontStretch: '70%', fontSize: 200, color: PALETA.acento,
              letterSpacing: '-0.05em', transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, opacity: Math.min(1, s * 2),
              textShadow: '0 10px 60px rgba(0,0,0,0.9)',
            }}
          >
            $20.000
          </div>
          <div
            style={{
              fontFamily: GROTESCA, fontWeight: 600, fontSize: 40, color: PALETA.texto,
              opacity: interpolate(t, [tagT0, tagT0 + 0.5], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              textShadow: '0 4px 30px rgba(0,0,0,0.9)',
            }}
          >
            / MES
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={ED_finFase1}>
            <Grande txt="No fue magia. Fue método." tam={80} />
          </ConGolpe>
        </AbsoluteFill>
      )}
      <AudioBeats items={[...ED_num.items, {idx: 25, t0: ED_25t0}]} />
    </AbsoluteFill>
  );
};

// ================================================ 9. EL VERDADERO GIRO
// 26: "IA no es negocio." | 27: "IA es velocidad." | 28-30: "Probar/Crear/Medir más."
const VG_27t0 = 0.1 + DUR[26] + AIRE;
const VG_palabras = secuencial([28, 29, 30], VG_27t0 + DUR[27] + AIRE);
export const VERDADEROGIRO_DUR = VG_palabras.fin + 0.4;

const VerdaderoGiro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      <Resplandor fuerza={0.18} />
      {t < VG_27t0 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={0.1}>
            <Grande txt="IA ≠ NEGOCIO" tam={78} />
          </ConGolpe>
        </AbsoluteFill>
      ) : t < VG_palabras.items[0].t0 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={VG_27t0} color={PALETA.acento}>
            <Grande txt="IA = VELOCIDAD" tam={82} acento />
          </ConGolpe>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
          {['PROBAR MÁS', 'CREAR MÁS', 'MEDIR MÁS'].map((w, i) => (
            <ConGolpe key={w} t0={VG_palabras.items[i].t0} color={i % 2 ? PALETA.acento : '#fff'}>
              <Grande txt={w} tam={64} />
            </ConGolpe>
          ))}
        </AbsoluteFill>
      )}
      <Pulso cada={1.0} largo={0.05} fuerza={0.26} />
      <AudioBeats items={[{idx: 26, t0: 0.1}, {idx: 27, t0: VG_27t0}, ...VG_palabras.items]} />
    </AbsoluteFill>
  );
};

// =========================================================== 10. CIERRE
// 31: "¿Qué podés vender?" | 32: "Este es el juego real."
const CI_finBadges = 1.5;
const CI_32t0 = CI_finBadges + DUR[31] + AIRE;
export const CIERRE_DUR = CI_32t0 + DUR[32] + 0.45;

const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {t < CI_finBadges ? (
        <AbsoluteFill style={{display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 14, padding: '10% 8%'}}>
          {CATEGORIAS.concat(CATEGORIAS).map((c, i) => {
            const t0 = 0.05 + i * 0.11;
            const s = spring({frame: frame - t0 * FPS, fps: FPS, config: {damping: 14, stiffness: 200, mass: 0.4}});
            return (
              <div
                key={i}
                style={{
                  fontFamily: GROTESCA, fontWeight: 700, fontSize: 30, color: PALETA.texto,
                  border: `2px solid ${PALETA.texto}44`, borderRadius: 8, padding: '10px 18px',
                  opacity: Math.min(0.7, s), transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})`,
                }}
              >
                {c.txt}
              </div>
            );
          })}
        </AbsoluteFill>
      ) : t < CI_32t0 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
          <ConGolpe t0={CI_finBadges} color={PALETA.acento}>
            <Grande txt="¿QUÉ PODÉS VENDER?" tam={82} />
          </ConGolpe>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={CI_32t0}>
            <Grande txt="Este es el juego real." tam={70} />
          </ConGolpe>
        </AbsoluteFill>
      )}
      <Pulso cada={1.4} largo={0.05} fuerza={0.22} />
      <AudioBeats items={[{idx: 31, t0: CI_finBadges}, {idx: 32, t0: CI_32t0}]} />
    </AbsoluteFill>
  );
};

// ============================================================= 11. CTA
// 33: "Comentá «método»" | 34: "y te paso cómo armar el tuyo."
const CTA_34t0 = 0.1 + DUR[33] + AIRE;
export const CTA_DUR = CTA_34t0 + DUR[34] + 0.4;

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ap = (a: number, b: number, max = 1) =>
    interpolate(t, [a, b], [0, max], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 8%'}}>
      <div style={{fontFamily: GROTESCA, fontWeight: 800, fontStretch: '84%', fontSize: 74, color: PALETA.texto, letterSpacing: '-0.03em', textTransform: 'uppercase', textAlign: 'center', opacity: ap(0, 0.35)}}>
        Comentá «<span style={{color: PALETA.acento}}>MÉTODO</span>»
      </div>
      <div style={{fontFamily: GROTESCA, fontWeight: 400, fontSize: 38, color: PALETA.texto, opacity: ap(CTA_34t0, CTA_34t0 + 0.35, 0.75)}}>
        y te paso cómo armar el tuyo
      </div>
      <AudioBeats items={[{idx: 33, t0: 0.1}, {idx: 34, t0: CTA_34t0}]} />
    </AbsoluteFill>
  );
};

// ================================================================ ROOT
const SEGMENTOS: {desde: number; hasta: number; golpe: Parameters<typeof Golpe>[0]['tipo']; sonido?: boolean; el: React.ReactNode}[] = [];
{
  let cursor = 0;
  const agregar = (dur: number, golpe: Parameters<typeof Golpe>[0]['tipo'], el: React.ReactNode, sonido?: boolean) => {
    SEGMENTOS.push({desde: cursor, hasta: cursor + dur, golpe, sonido, el});
    cursor += dur;
  };
  agregar(HOOK_DUR, 'ninguno', <Hook />);
  agregar(ROMPE_DUR, 'sacudon', <Rompe />);
  agregar(QUIENES_DUR, 'corte', <QuienEs />);
  agregar(PRIMERGIRO_DUR, 'raya', <PrimerGiro />);
  agregar(CATALOGO_DUR, 'fogonazo', <Catalogo />);
  agregar(METODO_DUR, 'negro', <Metodo />);
  agregar(HERRAMIENTAS_DUR, 'corte', <Herramientas />);
  agregar(ELDINERO_DUR, 'negro', <ElDinero />, false);
  agregar(VERDADEROGIRO_DUR, 'fogonazo', <VerdaderoGiro />);
  agregar(CIERRE_DUR, 'sacudon', <Cierre />);
  agregar(CTA_DUR, 'fogonazo', <Cta />);
}

export const DUR_REBECCA = SEGMENTOS[SEGMENTOS.length - 1].hasta;

export const RebeccaBeach: React.FC = () => {
  cargarFuentes();
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {SEGMENTOS.map((s, i) => (
        <Sequence key={i} from={seg(s.desde)} durationInFrames={seg(s.hasta) - seg(s.desde)}>
          <Golpe tipo={s.golpe} sonido={s.sonido}>{s.el}</Golpe>
        </Sequence>
      ))}
      <Grano fuerza={0.045} />
    </AbsoluteFill>
  );
};
