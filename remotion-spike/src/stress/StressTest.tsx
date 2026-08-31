import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Diagrama} from '../dibujo/Diagrama';
import {Golpe, Grano, Pulso} from '../escenas/golpes';
import {cargarFuentes} from '../fuentes';
import {GRADING, PALETA} from '../identidad';
import {CadenaTexto, CartasColapsan, NumeroConEscala, PanelFalso, TextoDuro, VentanaApp} from './piezas';
import {golpeSeco} from './duro';

// STRESS TEST v2 — misma estructura de tiempos que v1 (el guion del
// operador, literal), pero corrigiendo lo que el propio operador vio
// mal en la primera pasada:
//
//   "el ritmo es muy lento"              -> Pulso corriendo todo el
//                                           video + golpe con giro y
//                                           escala en cada texto, no
//                                           solo opacidad
//   "no vi cambio de color"              -> lavado de color (blanco Y
//                                           acento alternados) en cada
//                                           golpe, no solo al entrar
//                                           al segmento
//   "no hubo transicion, cortes feos"    -> golpeSeco() en TODOS los
//                                           textos, no solo en el
//                                           borde de cada segmento
//   "no usamos dibujos ni fotos ni video" -> Diagrama (los 28 dibujos
//                                           que se trazan solos) en
//                                           Giro y Demostracion; video
//                                           real de fondo en Rompe y
//                                           Contraste
//
// SIN AUDIO todavia (bloque de voz pendiente).

const FPS = 30;
const seg = (s: number) => Math.round(s * FPS);

const Fondo: React.FC<{clip: string; oscuro?: number; zoom?: [number, number]}> = ({clip, oscuro = 0.72, zoom = [1.15, 1.0]}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], zoom, {extrapolateRight: 'clamp'});
  return (
    <>
      <AbsoluteFill style={{filter: GRADING, transform: `scale(${z})`}}>
        <OffthreadVideo src={staticFile(`video/${clip}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(0,0,0,${oscuro})`}} />
    </>
  );
};

// Envuelve un texto con el golpe de verdad: giro + escala en linea
// recta (no spring) + un lavado de color que tapa el cuadro un
// instante. Sin esto un texto "aparece"; con esto "pega".
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

// ============================================================ A. HOOK
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const corteA = t < 1.6;
  return (
    <AbsoluteFill style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
      {t < 0.3 ? null : corteA ? (
        <div style={{textAlign: 'center'}}>
          <ConGolpe t0={0.3}>
            <TextoDuro txt="TE ESTÁN ENSEÑANDO" tam={92} />
          </ConGolpe>
          <ConGolpe t0={0.44} color={PALETA.acento}>
            <TextoDuro txt="MAL." tam={92} acento />
          </ConGolpe>
        </div>
      ) : (
        <ConGolpe t0={1.6} color={PALETA.acento}>
          <div style={{textAlign: 'center', width: '100%'}}>
            <div style={{fontFamily: 'Archivo', fontWeight: 800, fontStretch: '82%', fontSize: 100, color: PALETA.texto, letterSpacing: '-0.04em'}}>
              IA ≠
            </div>
            <div style={{fontFamily: 'Archivo', fontWeight: 800, fontStretch: '68%', fontSize: 190, color: PALETA.acento, letterSpacing: '-0.05em', lineHeight: 0.95}}>
              DINERO
            </div>
          </div>
        </ConGolpe>
      )}
    </AbsoluteFill>
  );
};

// ================================================ B. ROMPER EXPECTATIVA
const APPS = ['GEN·IMG', 'DOC', 'LOGO', 'AUTO'];
const ROMPE = ['IMÁGENES', 'POSTS', 'LOGOS', 'AUTOMATIZACIONES'];
const TAM_ROMPE = [108, 128, 128, 72];

const Rompe: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / FPS;
  const dur = durationInFrames / FPS;
  const tPregunta = dur - 1.6;
  const posiciones = [
    {x: 18, y: 22, r: -8}, {x: 80, y: 30, r: 6}, {x: 24, y: 78, r: 4}, {x: 78, y: 76, r: -5},
  ];

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* video real de fondo: es lo que el guion pide para "asi es como
          se ve hoy" -- interfaces reales de gente laburando, no negro
          plano. Se usa dinero-00 porque el tema de este video es
          plata/oportunidad. */}
      {t < tPregunta ? <Fondo clip="dinero-00.mp4" oscuro={0.8} zoom={[1.08, 1.18]} /> : null}
      {t < tPregunta ? (
        <>
          {APPS.map((a, i) => {
            const t0 = 0.15 + i * 0.5;
            const visible = t >= t0 && t < t0 + 0.9;
            if (!visible) return null;
            const p = posiciones[i];
            const g = golpeSeco(t, t0);
            return (
              <div key={a} style={{position: 'absolute', inset: 0, transform: `scale(${g.escala})`}}>
                <VentanaApp rotulo={a} x={p.x} y={p.y} girar={p.r} escala={0.9} />
              </div>
            );
          })}
          <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
            {ROMPE.map((r, i) => {
              const t0 = 0.35 + i * 0.55;
              return (
                <ConGolpe key={r} t0={t0} color={i % 2 ? PALETA.acento : '#fff'}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                    <div style={{fontFamily: 'Archivo', fontWeight: 800, fontStretch: '78%', fontSize: TAM_ROMPE[i], color: PALETA.texto, letterSpacing: '-0.03em'}}>
                      {r}
                    </div>
                    <div style={{fontSize: TAM_ROMPE[i] * 0.85, color: PALETA.acento, fontWeight: 800}}>✓</div>
                  </div>
                </ConGolpe>
              );
            })}
          </AbsoluteFill>
        </>
      ) : (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={tPregunta} color={PALETA.acento}>
            <div style={{fontFamily: 'Archivo', fontWeight: 800, fontStretch: '80%', fontSize: 96, color: PALETA.texto, letterSpacing: '-0.03em', textAlign: 'center'}}>
              ¿Y QUIÉN PAGA?
            </div>
          </ConGolpe>
        </AbsoluteFill>
      )}
      <Pulso cada={1.1} largo={0.05} fuerza={0.28} />
    </AbsoluteFill>
  );
};

// ============================================================ C. GIRO
const Giro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const corte1 = t < 1.9;
  const cadena = t >= 3.3;

  return (
    <AbsoluteFill style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 7%'}}>
      {corte1 ? (
        <ConGolpe t0={0}>
          <TextoDuro txt="NO VENDAS IA." tam={86} />
        </ConGolpe>
      ) : !cadena ? (
        <ConGolpe t0={1.9} color={PALETA.acento}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontFamily: 'Archivo', fontWeight: 700, fontSize: 46, color: PALETA.texto, opacity: 0.5}}>IA</div>
            <div style={{fontFamily: 'Archivo', fontWeight: 800, fontStretch: '68%', fontSize: 150, color: PALETA.acento, letterSpacing: '-0.04em', lineHeight: 0.95}}>
              VENDE UNA
              <br />
              SOLUCIÓN.
            </div>
          </div>
        </ConGolpe>
      ) : (
        // los DIBUJOS de verdad: cada palabra tiene su icono, trazado a
        // mano, conectado con una flecha que crece.
        <Diagrama
          d={{
            nodos: [
              {fig: 'lupa', x: 0.24, y: 0.42, tam: 210, rotulo: 'PROBLEMA', t: 3.3, acento: true},
              {fig: 'documento', x: 0.5, y: 0.42, tam: 210, rotulo: 'PRODUCTO', t: 3.9},
              {fig: 'persona', x: 0.76, y: 0.42, tam: 210, rotulo: 'CLIENTE', t: 4.5},
            ],
            flechas: [
              {de: 0, a: 1, t: 3.75, acento: true},
              {de: 1, a: 2, t: 4.35, acento: true},
            ],
          }}
        />
      )}
      <Pulso cada={1.3} largo={0.05} fuerza={0.24} color={PALETA.acento} />
    </AbsoluteFill>
  );
};

// ===================================================== D. DEMOSTRACION
const Demostracion: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Diagrama
      d={{
        nodos: [
          {fig: 'lupa', x: 0.5, y: 0.2, tam: 180, rotulo: 'PROBLEMA', t: 0.2, acento: true},
          {fig: 'barras', x: 0.5, y: 0.42, tam: 170, rotulo: 'INVESTIGACIÓN', t: 1.8},
          {fig: 'notebook', x: 0.5, y: 0.64, tam: 170, rotulo: 'PRODUCTO DIGITAL', t: 3.4},
          {fig: 'etiqueta', x: 0.5, y: 0.86, tam: 170, rotulo: 'OFERTA', t: 5.0, acento: true},
        ],
        flechas: [
          {de: 0, a: 1, t: 1.5},
          {de: 1, a: 2, t: 3.1},
          {de: 2, a: 3, t: 4.7},
        ],
      }}
    />
    <Pulso cada={1.6} largo={0.05} fuerza={0.22} />
  </AbsoluteFill>
);

// ======================================================== E. CONTRASTE
const Contraste: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {t < 0.6 ? null : t < 1.8 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
          <ConGolpe t0={0.6}>
            <TextoDuro txt="Crear el producto puede ser rápido." tam={70} serif />
          </ConGolpe>
        </AbsoluteFill>
      ) : t < 2.8 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
          <ConGolpe t0={1.8}>
            <TextoDuro txt="Conseguir que alguien lo compre…" tam={66} serif />
          </ConGolpe>
        </AbsoluteFill>
      ) : t < 4.0 ? (
        // esta SI es lenta a proposito -- contraste contra todo lo demas
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{opacity: interpolate(t, [2.8, 3.9], [0, 1])}}>
            <TextoDuro txt="ES OTRA HISTORIA." tam={82} acento />
          </div>
        </AbsoluteFill>
      ) : t < 5.6 ? (
        <>
          {/* video real: "representacion visual de una transaccion",
              tal cual lo pide el guion -- no una foto generica */}
          <Fondo clip="dinero-03.mp4" oscuro={0.78} zoom={[1.0, 1.1]} />
          <PanelFalso visitas={1247} ventas={0} />
        </>
      ) : t < 6.3 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <ConGolpe t0={5.6} color={PALETA.acento}>
            <TextoDuro txt="PROBLEMA ≠ HERRAMIENTA" tam={62} />
          </ConGolpe>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <CadenaTexto items={['PROBLEMA', 'OFERTA', 'DISTRIBUCIÓN']} entra={[0, 0.2, 0.4]} tam={46} />
        </AbsoluteFill>
      )}
      <Pulso cada={1.4} largo={0.05} fuerza={0.22} />
    </AbsoluteFill>
  );
};

// ========================================================= F. ESCALADA
const CARTAS = ['HOOK', 'NICHO', 'PRODUCTO', 'OFERTA', 'PRECIO', 'CONTENIDO', 'DATOS'];
const Escalada: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / FPS;
  const dur = durationInFrames / FPS;
  const tColapsa = dur * 0.58;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <CartasColapsan cartas={CARTAS} queda="DATOS" />
      {t >= tColapsa + 0.4 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '18%'}}>
          <CadenaTexto
            items={['PROBAR', 'MEDIR', 'CAMBIAR', 'REPETIR']}
            entra={[tColapsa + 0.5, tColapsa + 0.85, tColapsa + 1.2, tColapsa + 1.55].map((x) => x - tColapsa - 0.4)}
            tam={42}
          />
        </AbsoluteFill>
      ) : null}
      <Pulso cada={0.9} largo={0.045} fuerza={0.2} color={PALETA.acento} />
    </AbsoluteFill>
  );
};

// =========================================================== G. PAYOFF
const Payoff: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <NumeroConEscala numero="100" etiquetas={['IDEA 01', 'IDEA 07', 'IDEA 18', 'IDEA 34', 'IDEA 51', 'IDEA 73', 'IDEA 100']} />
    <Pulso cada={1.7} largo={0.06} fuerza={0.3} color={PALETA.acento} />
  </AbsoluteFill>
);

// ==================================================== H. CIERRE / LOOP
const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
      {t < 2.6 ? (
        <ConGolpe t0={0.15}>
          <TextoDuro txt="¿Y SI ENCONTRAMOS UNA?" tam={78} />
        </ConGolpe>
      ) : (
        <ConGolpe t0={2.6} color={PALETA.acento}>
          <TextoDuro txt="TE ESTÁN ENSEÑANDO MAL." tam={72} />
        </ConGolpe>
      )}
    </AbsoluteFill>
  );
};

// ================================================================ ROOT
const SEGMENTOS: {desde: number; hasta: number; golpe: Parameters<typeof Golpe>[0]['tipo']; el: React.ReactNode}[] = [
  {desde: 0, hasta: 3, golpe: 'ninguno', el: <Hook />},
  {desde: 3, hasta: 8, golpe: 'ninguno', el: <Rompe />},
  {desde: 8, hasta: 13, golpe: 'negro', el: <Giro />},
  {desde: 13, hasta: 20, golpe: 'ninguno', el: <Demostracion />},
  {desde: 20, hasta: 27, golpe: 'negro', el: <Contraste />},
  {desde: 27, hasta: 34, golpe: 'corte', el: <Escalada />},
  {desde: 34, hasta: 41, golpe: 'fogonazo', el: <Payoff />},
  {desde: 41, hasta: 45, golpe: 'negro', el: <Cierre />},
];

export const DUR_STRESS = 45;

export const StressTest: React.FC = () => {
  cargarFuentes();
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {SEGMENTOS.map((s, i) => (
        <Sequence key={i} from={seg(s.desde)} durationInFrames={seg(s.hasta) - seg(s.desde)}>
          <Golpe tipo={s.golpe}>{s.el}</Golpe>
        </Sequence>
      ))}
      <Grano fuerza={0.045} />
    </AbsoluteFill>
  );
};
