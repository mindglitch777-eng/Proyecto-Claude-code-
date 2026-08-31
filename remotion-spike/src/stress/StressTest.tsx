import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {cargarFuentes} from '../fuentes';
import {Golpe, Grano} from '../escenas/golpes';
import {PALETA} from '../identidad';
import {CadenaTexto, CartasColapsan, NumeroConEscala, PanelFalso, TextoDuro, VentanaApp} from './piezas';

// STRESS TEST — sigue el guion del operador segundo a segundo, tal
// como lo escribio. No pasa por el compilador de recetas: ese sistema
// es para cuando el guion dice "que hace" cada parte y el motor elige
// el formato. Aca el operador ya eligio TODO -- texto exacto, tiempos
// exactos, tipo de corte -- asi que se sigue literal.
//
// SIN AUDIO todavia (bloque de voz pendiente). Los golpes de sub-bass
// que pide el guion en el 0:00 y otros puntos no estan: se agregan
// cuando haya voz real para sincronizar contra ella.
//
// Los "logos" son ventanas de app genericas monocromas, no marcas
// reales -- el guion pide paleta de un solo acento, y un logo real
// trae sus propios colores.

const FPS = 30;
const seg = (s: number) => Math.round(s * FPS);

// ============================================================ A. HOOK
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS; // 0..3

  // Entrada seca: opacidad en un salto de 2 cuadros, no una curva.
  const duro = (t0: number) => interpolate(t, [t0, t0 + 0.06], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const corteA = t < 1.6; // "TE ESTAN ENSEÑANDO MAL"
  return (
    <AbsoluteFill style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
      {t < 0.3 ? null : corteA ? (
        <div style={{textAlign: 'center'}}>
          <span style={{opacity: duro(0.3)}}>
            <TextoDuro txt="TE ESTÁN ENSEÑANDO" tam={92} />
          </span>{' '}
          <span style={{opacity: duro(0.45), color: PALETA.acento}}>
            <TextoDuro txt="MAL." tam={92} acento />
          </span>
        </div>
      ) : (
        <div style={{textAlign: 'center', width: '100%'}}>
          <div style={{fontFamily: 'Archivo', fontWeight: 800, fontStretch: '82%', fontSize: 100, color: PALETA.texto, letterSpacing: '-0.04em'}}>
            IA ≠
          </div>
          <div style={{fontFamily: 'Archivo', fontWeight: 800, fontStretch: '68%', fontSize: 190, color: PALETA.acento, letterSpacing: '-0.05em', lineHeight: 0.95}}>
            DINERO
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ================================================ B. ROMPER EXPECTATIVA
const APPS = ['GEN·IMG', 'DOC', 'LOGO', 'AUTO'];
const ROMPE = ['IMÁGENES', 'POSTS', 'LOGOS', 'AUTOMATIZACIONES'];
// Palabras cortas ocupan grande; la mas larga se achica lo justo para
// entrar en el ancho seguro. "Nunca texto chico para info importante".
const TAM_ROMPE = [108, 128, 128, 72];

const Rompe: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / FPS;
  const dur = durationInFrames / FPS;
  const tPregunta = dur - 1.6;

  // las ventanas de fondo destellan una por una, rapido
  const posiciones = [
    {x: 18, y: 22, r: -8}, {x: 80, y: 30, r: 6}, {x: 24, y: 78, r: 4}, {x: 78, y: 76, r: -5},
  ];

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {t < tPregunta ? (
        <>
          {APPS.map((a, i) => {
            const t0 = 0.15 + i * 0.5;
            const visible = t >= t0 && t < t0 + 0.9;
            if (!visible) return null;
            const p = posiciones[i];
            return <VentanaApp key={a} rotulo={a} x={p.x} y={p.y} girar={p.r} escala={0.9} />;
          })}
          <AbsoluteFill style={{background: 'rgba(0,0,0,0.5)'}} />
          <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
            {ROMPE.map((r, i) => {
              const t0 = 0.35 + i * 0.55;
              if (t < t0) return null;
              return (
                <div key={r} style={{display: 'flex', alignItems: 'center', gap: 24}}>
                  <div style={{fontFamily: 'Archivo', fontWeight: 800, fontStretch: '78%', fontSize: TAM_ROMPE[i], color: PALETA.texto, letterSpacing: '-0.03em'}}>
                    {r}
                  </div>
                  <div style={{fontSize: TAM_ROMPE[i] * 0.85, color: PALETA.acento, fontWeight: 800}}>✓</div>
                </div>
              );
            })}
          </AbsoluteFill>
        </>
      ) : (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              fontFamily: 'Archivo', fontWeight: 800, fontStretch: '80%', fontSize: 96,
              color: PALETA.texto, letterSpacing: '-0.03em', textAlign: 'center',
              opacity: interpolate(t, [tPregunta, tPregunta + 0.08], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          >
            ¿Y QUIÉN PAGA?
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================ C. GIRO
const Giro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const corte1 = t < 1.9; // NO VENDAS IA / VENDE UNA SOLUCION
  const cadena = t >= 3.3;

  return (
    <AbsoluteFill style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 7%'}}>
      {corte1 ? (
        <div style={{opacity: interpolate(t, [0, 0.06], [0, 1], {extrapolateRight: 'clamp'})}}>
          <TextoDuro txt="NO VENDAS IA." tam={86} />
        </div>
      ) : !cadena ? (
        <div style={{textAlign: 'center'}}>
          <div style={{fontFamily: 'Archivo', fontWeight: 700, fontSize: 46, color: PALETA.texto, opacity: 0.5}}>IA</div>
          <div style={{fontFamily: 'Archivo', fontWeight: 800, fontStretch: '68%', fontSize: 150, color: PALETA.acento, letterSpacing: '-0.04em', lineHeight: 0.95}}>
            VENDE UNA
            <br />
            SOLUCIÓN.
          </div>
        </div>
      ) : (
        <CadenaTexto items={['PROBLEMA', 'PRODUCTO', 'CLIENTE']} entra={[0, 0.5, 1.0]} tam={54} />
      )}
    </AbsoluteFill>
  );
};

// ===================================================== D. DEMOSTRACION
const PASOS_D = ['PROBLEMA', 'INVESTIGACIÓN', 'PRODUCTO DIGITAL', 'OFERTA'];
const Demostracion: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const activo = Math.min(PASOS_D.length - 1, Math.floor(t / 1.6));
  return (
    <AbsoluteFill style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <CadenaTexto items={PASOS_D} entra={[0.2, 0.2, 0.2, 0.2]} vertical tam={52} activo={activo} />
    </AbsoluteFill>
  );
};

// ======================================================== E. CONTRASTE
const Contraste: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // 0-0.6 negro | 0.6-1.8 frase1 | 1.8-2.8 frase2 | 2.8-4.0 "ES OTRA HISTORIA" | 4.0-5.6 panel | 5.6-6.3 !=  | 6.3-7.0 cadena
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {t < 0.6 ? null : t < 1.8 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
          <div style={{opacity: interpolate(t, [0.6, 0.66], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            <TextoDuro txt="Crear el producto puede ser rápido." tam={70} serif />
          </div>
        </AbsoluteFill>
      ) : t < 2.8 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
          <div style={{opacity: interpolate(t, [1.8, 1.86], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            <TextoDuro txt="Conseguir que alguien lo compre…" tam={66} serif />
          </div>
        </AbsoluteFill>
      ) : t < 4.0 ? (
        // esta SI es lenta -- "el texto aparece lentamente", contraste
        // deliberado contra todos los cortes secos de alrededor.
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{opacity: interpolate(t, [2.8, 3.9], [0, 1])}}>
            <TextoDuro txt="ES OTRA HISTORIA." tam={82} acento />
          </div>
        </AbsoluteFill>
      ) : t < 5.6 ? (
        <PanelFalso visitas={1247} ventas={0} />
      ) : t < 6.3 ? (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <TextoDuro txt="PROBLEMA ≠ HERRAMIENTA" tam={62} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <CadenaTexto items={['PROBLEMA', 'OFERTA', 'DISTRIBUCIÓN']} entra={[0, 0.2, 0.4]} tam={46} />
        </AbsoluteFill>
      )}
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
    </AbsoluteFill>
  );
};

// =========================================================== G. PAYOFF
const Payoff: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <NumeroConEscala numero="100" etiquetas={['IDEA 01', 'IDEA 07', 'IDEA 18', 'IDEA 34', 'IDEA 51', 'IDEA 73', 'IDEA 100']} />
  </AbsoluteFill>
);

// ==================================================== H. CIERRE / LOOP
const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8%'}}>
      {t < 2.6 ? (
        <div style={{opacity: interpolate(t, [0.15, 0.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          <TextoDuro txt="¿Y SI ENCONTRAMOS UNA?" tam={78} />
        </div>
      ) : (
        // vuelve a la MISMA composicion que el cuadro 1 del hook, para
        // que el corte de loop no se sienta artificial
        <div style={{opacity: interpolate(t, [2.6, 2.75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          <TextoDuro txt="TE ESTÁN ENSEÑANDO MAL." tam={72} />
        </div>
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
