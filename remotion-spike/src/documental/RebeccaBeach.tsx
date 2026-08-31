import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Diagrama} from '../dibujo/Diagrama';
import {CifraSeCae} from '../escenas/mas';
import {Cronologia, ListaTachada} from '../escenas/explica';
import {Golpe, Grano, Pulso} from '../escenas/golpes';
import {LogosHerramientas} from '../escenas/herramientas';
import {Fondo} from '../escenas/metraje';
import {Contador} from '../escenas/plata';
import {cargarFuentes} from '../fuentes';
import {GROTESCA, PALETA} from '../identidad';
import {golpeSeco} from '../stress/duro';

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

const Grande: React.FC<{txt: string; tam?: number; acento?: boolean}> = ({txt, tam = 130, acento}) => (
  <div
    style={{
      fontFamily: GROTESCA, fontWeight: 800, fontStretch: '76%', fontSize: tam, lineHeight: 0.96,
      letterSpacing: '-0.045em', textTransform: 'uppercase', textAlign: 'center',
      color: acento ? PALETA.acento : PALETA.texto,
    }}
  >
    {txt}
  </div>
);

const FOTO = 'becky-beach.jpg';

// ============================================================ 1. HOOK (0-3s)
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {t < 1.7 ? (
        <>
          <Fondo foto={FOTO} velo={0.5} zoom={[1.08, 1.0]} />
          <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6%'}}>
            <ConGolpe t0={0.1} color={PALETA.acento}>
              <Grande txt="$20.000/MES" tam={118} acento />
            </ConGolpe>
          </AbsoluteFill>
        </>
      ) : t < 2.5 ? (
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
          {['IA', 'PRODUCTOS', 'DINERO'].map((w, i) => (
            <ConGolpe key={w} t0={1.7 + i * 0.22} color={i % 2 ? PALETA.acento : '#fff'}>
              <Grande txt={w} tam={92} acento={i === 2} />
            </ConGolpe>
          ))}
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={2.5} color={PALETA.acento}>
            <Grande txt="¿CÓMO?" tam={150} />
          </ConGolpe>
        </AbsoluteFill>
      )}
      <Pulso cada={0.9} largo={0.05} fuerza={0.3} />
    </AbsoluteFill>
  );
};

// ================================================ 2. ROMPER EXPECTATIVA (3-7s)
const Rompe: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <ListaTachada items={['Prompts', 'Cursos de IA', 'Señales de trading']} queda="Productos digitales" />
    <Pulso cada={1.1} largo={0.05} fuerza={0.26} />
  </AbsoluteFill>
);

// ========================================================= 3. QUIÉN ES (7-12s)
const QuienEs: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {t < 2.2 ? (
        <>
          <Fondo foto={FOTO} velo={0.42} zoom={[1.0, 1.1]} />
          <AbsoluteFill style={{display: 'flex', alignItems: 'flex-end', padding: '0 7% 20% 7%'}}>
            <ConGolpe t0={0.15}>
              <div style={{fontFamily: GROTESCA, fontWeight: 700, fontSize: 62, color: PALETA.texto, textShadow: '0 6px 40px rgba(0,0,0,0.9)'}}>
                Becky Beach
              </div>
            </ConGolpe>
          </AbsoluteFill>
        </>
      ) : (
        <Cronologia
          hitos={[
            {cuando: '2018', que: 'Empieza a vender productos digitales'},
            {cuando: 'DESPUÉS', que: 'Suma IA para crearlos más rápido'},
            {cuando: 'HOY', que: 'Vende en su web, Etsy y Teachers Pay Teachers', acento: true},
          ]}
        />
      )}
      <Pulso cada={1.3} largo={0.05} fuerza={0.22} />
    </AbsoluteFill>
  );
};

// ==================================================== 4. EL PRIMER GIRO (12-18s)
const PrimerGiro: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <CifraSeCae arriba="Antes, un producto tardaba" de="Semanas o meses" a="< 20 minutos" abajo="Con IA" />
    <Pulso cada={1.2} largo={0.05} fuerza={0.24} color={PALETA.acento} />
  </AbsoluteFill>
);

// ========================================================= 5. CATÁLOGO (18-24s)
const CATEGORIAS = ['PLANNERS', 'WORKBOOKS', 'JOURNALS', 'TEMPLATES', 'STICKERS', 'CLIPART', 'APPS'];
const Catalogo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const paso = 0.42;
  const tNumero = 0.4 + CATEGORIAS.length * paso;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {t < tNumero ? (
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
          {CATEGORIAS.map((c, i) => {
            const t0 = 0.4 + i * paso;
            if (t < t0 || t >= t0 + paso * 2.4) return null;
            return (
              <ConGolpe key={c} t0={t0} color={i % 2 ? PALETA.acento : '#fff'}>
                <Grande txt={c} tam={70} />
              </ConGolpe>
            );
          })}
        </AbsoluteFill>
      ) : (
        <Contador arriba="Productos digitales creados" hasta={1500} sufijo="+" abajo="Y sigue subiendo" />
      )}
      <Pulso cada={0.55} largo={0.04} fuerza={0.2} />
    </AbsoluteFill>
  );
};

// =========================================================== 6. MÉTODO (24-30s)
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
  </AbsoluteFill>
);

// ==================================================== 7. HERRAMIENTAS (30-36s)
const Herramientas: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
    <LogosHerramientas
      titulo="Con qué acelera"
      items={[
        {nombre: 'ChatGPT', color: '#10A37F', texto: 'idea y texto'},
        {nombre: 'Midjourney', color: '#4C6EF5', texto: 'imagen'},
        {nombre: 'Ideogram', color: '#B4844B', texto: 'imagen con texto'},
        {nombre: 'Canva', color: '#00C4CC', texto: 'diseño final'},
      ]}
      pie="Cuatro herramientas. No una idea genial."
    />
    <Pulso cada={0.8} largo={0.05} fuerza={0.24} color={PALETA.acento} />
  </AbsoluteFill>
);

// ====================================================== 8. EL DINERO (36-42s)
const ElDinero: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spring({frame: frame - 0.3 * fps, fps, config: {damping: 11, stiffness: 200, mass: 0.5}});
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {t < 3.4 ? (
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              fontFamily: GROTESCA, fontWeight: 800, fontStretch: '70%', fontSize: 200, color: PALETA.acento,
              letterSpacing: '-0.05em', transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, opacity: Math.min(1, s * 2),
            }}
          >
            $20.000
          </div>
          <div style={{fontFamily: GROTESCA, fontWeight: 600, fontSize: 40, color: PALETA.texto, opacity: interpolate(t, [1.2, 1.7], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            / MES
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={3.4}>
            <Grande txt="No fue magia." tam={90} />
          </ConGolpe>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ================================================ 9. EL VERDADERO GIRO (42-48s)
const VerdaderoGiro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {t < 2.0 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={0.1}>
            <Grande txt="IA ≠ NEGOCIO" tam={78} />
          </ConGolpe>
        </AbsoluteFill>
      ) : t < 4.0 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={2.0} color={PALETA.acento}>
            <Grande txt="IA = VELOCIDAD" tam={82} acento />
          </ConGolpe>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
          {['PROBAR MÁS', 'CREAR MÁS', 'MEDIR MÁS'].map((w, i) => (
            <ConGolpe key={w} t0={4.0 + i * 0.32} color={i % 2 ? PALETA.acento : '#fff'}>
              <Grande txt={w} tam={64} />
            </ConGolpe>
          ))}
        </AbsoluteFill>
      )}
      <Pulso cada={1.0} largo={0.05} fuerza={0.26} />
    </AbsoluteFill>
  );
};

// =========================================================== 10. CIERRE (48-55s)
const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{backgroundColor: PALETA.fondo}}>
      {t < 3.0 ? (
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
                {c}
              </div>
            );
          })}
        </AbsoluteFill>
      ) : t < 5.2 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
          <ConGolpe t0={3.0} color={PALETA.acento}>
            <Grande txt="¿QUÉ PODÉS VENDER?" tam={82} />
          </ConGolpe>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={5.2}>
            <Grande txt="Este es el juego." tam={78} />
          </ConGolpe>
        </AbsoluteFill>
      )}
      <Pulso cada={1.4} largo={0.05} fuerza={0.22} />
    </AbsoluteFill>
  );
};

// ============================================================= 11. CTA (55-58s)
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
      <div style={{fontFamily: GROTESCA, fontWeight: 400, fontSize: 38, color: PALETA.texto, opacity: ap(0.4, 0.75, 0.75)}}>
        y te paso cómo armar el tuyo
      </div>
    </AbsoluteFill>
  );
};

// ================================================================ ROOT
const SEGMENTOS: {desde: number; hasta: number; golpe: Parameters<typeof Golpe>[0]['tipo']; sonido?: boolean; el: React.ReactNode}[] = [
  {desde: 0, hasta: 3, golpe: 'ninguno', el: <Hook />},
  {desde: 3, hasta: 7, golpe: 'sacudon', el: <Rompe />},
  {desde: 7, hasta: 12, golpe: 'corte', el: <QuienEs />},
  {desde: 12, hasta: 18, golpe: 'raya', el: <PrimerGiro />},
  {desde: 18, hasta: 24, golpe: 'fogonazo', el: <Catalogo />},
  {desde: 24, hasta: 30, golpe: 'negro', el: <Metodo />},
  {desde: 30, hasta: 36, golpe: 'corte', el: <Herramientas />},
  {desde: 36, hasta: 42, golpe: 'negro', sonido: false, el: <ElDinero />},
  {desde: 42, hasta: 48, golpe: 'fogonazo', el: <VerdaderoGiro />},
  {desde: 48, hasta: 55, golpe: 'sacudon', el: <Cierre />},
  {desde: 55, hasta: 58, golpe: 'fogonazo', el: <Cta />},
];

export const DUR_REBECCA = 58;

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
