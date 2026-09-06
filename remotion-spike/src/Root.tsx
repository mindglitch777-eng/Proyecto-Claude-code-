import React from 'react';
import {Composition} from 'remotion';
import {ALTO, ANCHO, FPS} from './identidad';
import {DUR_TOTAL, GUION} from './guion';
import {Pieza} from './Pieza';
import {PiezaAgresiva} from './agresivo/PiezaAgresiva';
import {DUR_AGRESIVO} from './guion-agresivo';
import {Diez} from './agresivo/Diez';
import {StressTest, DUR_STRESS} from './stress/StressTest';
import {RebeccaBeach, DUR_REBECCA} from './documental/RebeccaBeach';
import {Caso, duracionCaso} from './documental/CasoGenerico';
import {CASOS} from './documental/casos';
import {FabricaVideo, ArbolFabrica} from './fabrica_bridge/FabricaVideo';
import demo01 from './fabrica_bridge/demo_01.json';
import demo02 from './fabrica_bridge/demo_02.json';
import demo03 from './fabrica_bridge/demo_03.json';
import demo04 from './fabrica_bridge/demo_04.json';
import demo05 from './fabrica_bridge/demo_05.json';
import demo06 from './fabrica_bridge/demo_06.json';
import demo07 from './fabrica_bridge/demo_07.json';
import demo08 from './fabrica_bridge/demo_08.json';
import demo09 from './fabrica_bridge/demo_09.json';
import demo10 from './fabrica_bridge/demo_10.json';
import demo11 from './fabrica_bridge/demo_11.json';
import demo12 from './fabrica_bridge/demo_12.json';
import pruebaR68 from './fabrica_bridge/prueba_r6_8.json';
import pruebaR610 from './fabrica_bridge/prueba_r6_10.json';
import venta01 from './fabrica_bridge/venta_01.json';
import venta02 from './fabrica_bridge/venta_02.json';
import venta03 from './fabrica_bridge/venta_03.json';
import venta04 from './fabrica_bridge/venta_04.json';
import venta05 from './fabrica_bridge/venta_05.json';
import venta06 from './fabrica_bridge/venta_06.json';
import venta07 from './fabrica_bridge/venta_07.json';
import venta08 from './fabrica_bridge/venta_08.json';
import venta09 from './fabrica_bridge/venta_09.json';
import venta10 from './fabrica_bridge/venta_10.json';
import pruebaEfectosNuevos from './fabrica_bridge/prueba-efectos-nuevos.json';
import {Video} from './receta/Video';
import {GUIONES} from './receta/guiones';
import {compilar} from './receta/compilar';
import {VIDEOS, durDe} from './guiones10';
import {Catalogo} from './dibujo/Catalogo';
import {Muestrario, DUR_MUESTRARIO} from './escenas/Muestrario';
import {Muestrario2, DUR_M2} from './escenas/Muestrario2';
import {Muestrario3, DUR_M3} from './escenas/Muestrario3';
import {FormatoA, DUR_FA, FormatoB, DUR_FB} from './escenas/FormatoCompleto';
import {Muestrario4, DUR_M4} from './escenas/Muestrario4';
import {Muestrario5, DUR_M5} from './escenas/Muestrario5';
import {Muestrario6, DUR_M6} from './escenas/Muestrario6';
import {Muestrario7, DUR_M7} from './escenas/Muestrario7';
import {Muestrario8, DUR_M8} from './escenas/Muestrario8';
import {PruebaTransiciones, DUR_PRUEBA_TRANSICIONES} from './pruebas-r6/PruebaTransiciones';
import {PruebaEfectos, DUR_PRUEBA_EFECTOS} from './pruebas-r6/PruebaEfectos';
import {PruebaEfectosVirales, DUR_PRUEBA_EFECTOS_VIRALES} from './pruebas-r6/PruebaEfectosVirales';
import {Prueba3D, DUR_PRUEBA_3D} from './pruebas-r6/Prueba3D';
import {PruebaHighlights, DUR_PRUEBA_HIGHLIGHTS} from './pruebas-r6/PruebaHighlights';
import {PruebaVineta, DUR_PRUEBA_VINETA} from './pruebas-r6/PruebaVineta';
import {PruebaLightLeak, DUR_PRUEBA_LIGHTLEAK} from './pruebas-r6/PruebaLightLeak';
import {CarruselSlide, ANCHO_CARRUSEL, ALTO_CARRUSEL} from './carrusel/CarruselSlide';
import {PruebaCortina, DUR_PRUEBA_CORTINA} from './pruebas-r6/PruebaCortina';
import {Torre3D} from './tres/Torre3D';
import {PruebaEnfasis} from './pruebas-r6/PruebaEnfasis';
import {PruebaRoundedTextBox, DUR_PRUEBA_ROUNDED_TEXT_BOX} from './pruebas-r7/PruebaRoundedTextBox';
import {PruebaGsap, DUR_PRUEBA_GSAP} from './pruebas-r7/PruebaGsap';
import {PruebaShine, DUR_PRUEBA_SHINE} from './pruebas-r7/PruebaShine';
import {PruebaRings, DUR_PRUEBA_RINGS} from './pruebas-r7/PruebaRings';
import {PruebaCaptions} from './subtitulos/PruebaCaptions';
import {PruebaSubtitulosGrandes} from './subtitulos/PruebaSubtitulosGrandes';
import {GraficoTorta} from './escenas/GraficoTorta';
import {
  ArquitecturaNeon,
  CapsulaHolografica,
  CataclismoDatos,
  DevoradorRealidad,
  MercurioRevelador,
  GlitchShatter,
  HeartbeatPulse,
  TextRevealFire,
  CircleOfTruth,
  PixelBurst,
  GoldRush,
  LiquidMetal,
  SpotlightReveal,
  ChromaticShift,
  WaveDistortion,
  StarbustFlare,
  VortexTransport,
  AuroraShine,
  NeonRipple,
  BarBrawl,
  FlipCards,
} from './effects';

const cuadros = Math.round(DUR_TOTAL * FPS);

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="pieza"
        component={Pieza}
        durationInFrames={cuadros}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{conVideo: true}}
      />
      <Composition
        id="agresivo"
        component={PiezaAgresiva}
        durationInFrames={Math.round(DUR_AGRESIVO * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
      />
      {/* LA FABRICA. Una composicion por cada guion en receta/guiones.ts,
          generada sola: agregar un guion ahi (o en un JSON que la
          fabrica lea) alcanza para tener un video nuevo, sin tocar
          este archivo. */}
      {GUIONES.map((g) => (
        <Composition
          key={g.id}
          id={`f-${g.id}`}
          component={Video}
          durationInFrames={Math.round(compilar(g).duracion * FPS)}
          fps={FPS}
          width={ANCHO}
          height={ALTO}
          defaultProps={{id: g.id, guiones: GUIONES}}
        />
      ))}
      <Composition id="stress" component={StressTest} durationInFrames={Math.round(DUR_STRESS * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      {/* Prueba de punta a punta de la nueva fabrica (fabrica/ en la
          raiz del repo, independiente de todo lo demas en este
          archivo): el arbol sale de fabrica/ejemplos/generar_demo_01.ts,
          que ya corrio el Director Visual + Director de Audio +
          Composicion reales -- esto solo renderiza lo que esos
          sistemas decidieron. Ver fabrica/README.md. */}
      <Composition
        id="fabrica-demo-01"
        component={FabricaVideo}
        durationInFrames={Math.round((demo01 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo01 as ArbolFabrica}}
      />
      {/* Segundo ejemplo de la nueva fabrica: 4 unidades, multi-audio
          en 3 de ellas, anti-repeticion real (ver
          fabrica/ejemplos/generar_demo_02.ts). */}
      <Composition
        id="fabrica-demo-02"
        component={FabricaVideo}
        durationInFrames={Math.round((demo02 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo02 as ArbolFabrica}}
      />
      {/* Ronda 2 de fortalecimiento: video de prueba integral con voz
          REAL de Qwen3-TTS (no reciclada), 5 categorias de componente
          distintas elegidas por metadata real (hook/desarrollo/
          escalada/payoff/cierre). Ver fabrica/ejemplos/generar_demo_03.ts
          y fabrica/PENDIENTES_OPERADOR.md. */}
      <Composition
        id="fabrica-demo-03"
        component={FabricaVideo}
        durationInFrames={Math.round((demo03 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo03 as ArbolFabrica}}
      />
      {/* Ronda 3 de calidad audiovisual: golpes con variedad real +
          anti-repeticion, Anticipo antes de un golpe fuerte,
          tratamiento explicito de un valor repetido ($47 -> consecuencia
          derivada $2.209 en vez de repetirlo), QA creativo. Ver
          fabrica/ejemplos/generar_demo_04.ts y fabrica/MEJORAS_RONDA3.md. */}
      <Composition
        id="fabrica-demo-04"
        component={FabricaVideo}
        durationInFrames={Math.round((demo04 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo04 as ArbolFabrica}}
      />
      {/* Ronda 4: Director de Edicion (intencion/energia/estilos/
          microeventos/transicion motivada) decidiendo de verdad para
          las 7 unidades, mas el ciclo de mejora controlado corrido en
          serio. Ver fabrica/ejemplos/generar_demo_05.ts y
          fabrica/ESTADO_ACTUAL.md. */}
      <Composition
        id="fabrica-demo-05"
        component={FabricaVideo}
        durationInFrames={Math.round((demo05 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo05 as ArbolFabrica}}
      />
      {/* R7-21: primer video real que ejercita la eleccion AUTOMATICA
          de patrones de retencion (R7-15) -- generar_demo_06.ts ya no
          pasa patronesRetencion a mano, el Director de Edicion los
          elige solo con anti-repeticion real entre las 7 unidades.
          Ver fabrica/ejemplos/generar_demo_06.ts. */}
      <Composition
        id="fabrica-demo-06"
        component={FabricaVideo}
        durationInFrames={Math.round((demo06 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo06 as ArbolFabrica}}
      />
      {/* R7-22: MISMO guion/voz/edicion que fabrica-demo-06 -- la unica
          variable nueva es musica de fondo real (arbol.musicaFondo),
          resuelta por fabrica/musica/resolver_musica.py contra la
          biblioteca CC0 real. Experimento A/B a proposito: comparar el
          perfil de audio (QA duro) de este video contra demo_06. Ver
          fabrica/ejemplos/generar_demo_07.ts. */}
      <Composition
        id="fabrica-demo-07"
        component={FabricaVideo}
        durationInFrames={Math.round((demo07 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo07 as ArbolFabrica}}
      />
      {/* R7-30: PRUEBA REAL del Orquestador -- mismo guion/voz que
          fabrica-demo-07, UNICA variable nueva: perfil de estilo
          "financiero_directo" (directores/edicion/configuracion.ts,
          R7-29) aplicado uniformemente por primera vez por un
          generador real. Ver fabrica/ejemplos/generar_demo_08.ts. */}
      <Composition
        id="fabrica-demo-08"
        component={FabricaVideo}
        durationInFrames={Math.round((demo08 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo08 as ArbolFabrica}}
      />
      {/* R7-31: PRUEBA REAL de "que la fabrica piense la edicion" --
          mismo guion/voz/preset que fabrica-demo-08, UNICAS variables
          nuevas: (1) Rhythm Engine real (curva_energia.ts) empujando la
          energia de cada unidad segun su posicion en el arco completo,
          (2) cambios de encuadre reales anclados a pausas de voz medidas
          por ffmpeg silencedetect (composicion/pausas.ts) en las
          unidades de un solo clip de audio que en demo_08 quedaban
          estaticas. Ver fabrica/ejemplos/generar_demo_09.ts. */}
      <Composition
        id="fabrica-demo-09"
        component={FabricaVideo}
        durationInFrames={Math.round((demo09 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo09 as ArbolFabrica}}
      />
      {/* R7-32: "Benchmark audiovisual agresivo" -- guion NUEVO ("La IA
          no es el negocio") y direccion visual escena-por-escena
          entregados explicitamente por el operador (no interpretados
          libremente), 14 unidades (una por linea de guion), Rhythm
          Engine con curva propia (CURVA_BENCHMARK_AGRESIVO), pausas
          reales + forced-alignment real (palabra "no" del hook) para
          anclar cambios visuales sin inventar timing. Ver
          fabrica/ejemplos/generar_demo_10.ts y
          fabrica/docs/PROMPT_BENCHMARK_AGRESIVO.md. */}
      <Composition
        id="fabrica-demo-10"
        component={FabricaVideo}
        durationInFrames={Math.round((demo10 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo10 as ArbolFabrica}}
      />
      <Composition
        id="fabrica-demo-11"
        component={FabricaVideo}
        durationInFrames={Math.round((demo11 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo11 as ArbolFabrica}}
      />
      <Composition
        id="fabrica-demo-12"
        component={FabricaVideo}
        durationInFrames={Math.round((demo12 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: demo12 as ArbolFabrica}}
      />
      <Composition
        id="fabrica-demo-12-horizontal"
        component={FabricaVideo}
        durationInFrames={Math.round((demo12 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ALTO}
        height={ANCHO}
        defaultProps={{arbol: demo12 as ArbolFabrica}}
      />
      {/* R6-8: prueba de punta a punta de la transicion real
          (@remotion/transitions) con 2 audios REALES -- ver
          fabrica/composicion/prueba_r6_8.ts y
          remotion-spike/src/pruebas-r6/README.md. No es un video de
          produccion. */}
      <Composition
        id="prueba-r6-8"
        component={FabricaVideo}
        durationInFrames={Math.round((pruebaR68 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: pruebaR68 as ArbolFabrica}}
      />
      {/* R6-10: prueba de punta a punta del componente "torre-3d"
          (primer componente 3D real del catalogo) a traves del
          pipeline real armarComposicion -> FabricaVideo.tsx, con audio
          real. Ver fabrica/composicion/prueba_r6_10.ts. */}
      <Composition
        id="prueba-r6-10"
        component={FabricaVideo}
        durationInFrames={Math.round((pruebaR610 as ArbolFabrica).duracionTotalSeg * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arbol: pruebaR610 as ArbolFabrica}}
      />
      {/* R8: lote de 10 videos de venta ("sistema de ingresos con IA").
          venta_01 a venta_05: Director Visual real eligiendo componente
          por escena (guion en texto plano). venta_06 a venta_10:
          componentes fijos del guion original de DeepSeek. Ver
          fabrica/ejemplos/generar_lote_ventas.ts. */}
      <Composition id="venta-01" component={FabricaVideo} durationInFrames={Math.round((venta01 as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: venta01 as ArbolFabrica}} />
      <Composition id="venta-02" component={FabricaVideo} durationInFrames={Math.round((venta02 as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: venta02 as ArbolFabrica}} />
      <Composition id="venta-03" component={FabricaVideo} durationInFrames={Math.round((venta03 as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: venta03 as ArbolFabrica}} />
      <Composition id="venta-04" component={FabricaVideo} durationInFrames={Math.round((venta04 as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: venta04 as ArbolFabrica}} />
      <Composition id="venta-05" component={FabricaVideo} durationInFrames={Math.round((venta05 as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: venta05 as ArbolFabrica}} />
      <Composition id="venta-06" component={FabricaVideo} durationInFrames={Math.round((venta06 as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: venta06 as ArbolFabrica}} />
      <Composition id="venta-07" component={FabricaVideo} durationInFrames={Math.round((venta07 as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: venta07 as ArbolFabrica}} />
      <Composition id="venta-08" component={FabricaVideo} durationInFrames={Math.round((venta08 as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: venta08 as ArbolFabrica}} />
      <Composition id="venta-09" component={FabricaVideo} durationInFrames={Math.round((venta09 as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: venta09 as ArbolFabrica}} />
      <Composition id="venta-10" component={FabricaVideo} durationInFrames={Math.round((venta10 as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: venta10 as ArbolFabrica}} />
      <Composition id="prueba-efectos-nuevos" component={FabricaVideo} durationInFrames={Math.round((pruebaEfectosNuevos as ArbolFabrica).duracionTotalSeg * FPS)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{arbol: pruebaEfectosNuevos as ArbolFabrica}} />
      <Composition id="rebecca-beach" component={RebeccaBeach} durationInFrames={Math.round(DUR_REBECCA * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      {/* Casos 2 a 20 de la serie documental: uno por entrada en
          casos.ts, todos sobre el mismo motor generico (CasoGenerico). */}
      {CASOS.map((c, i) => (
        <Composition
          key={c.slug}
          id={`caso-${String(i + 2).padStart(2, '0')}`}
          component={Caso}
          durationInFrames={Math.round(duracionCaso(c) * FPS)}
          fps={FPS}
          width={ANCHO}
          height={ALTO}
          defaultProps={{cfg: c}}
        />
      ))}
      <Composition id="muestrario3" component={Muestrario3} durationInFrames={Math.round(DUR_M3 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      {/* Formatos de video completos (gancho + desarrollo mezclado a
          corte rapido + cierre con pregunta abierta + CTA), no piezas
          sueltas -- lo que el operador pidio despues de ver Muestrario3. */}
      <Composition id="formato-a" component={FormatoA} durationInFrames={Math.round(DUR_FA * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="formato-b" component={FormatoB} durationInFrames={Math.round(DUR_FB * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="muestrario4" component={Muestrario4} durationInFrames={Math.round(DUR_M4 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="muestrario5" component={Muestrario5} durationInFrames={Math.round(DUR_M5 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="muestrario6" component={Muestrario6} durationInFrames={Math.round(DUR_M6 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="muestrario7" component={Muestrario7} durationInFrames={Math.round(DUR_M7 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="muestrario8" component={Muestrario8} durationInFrames={Math.round(DUR_M8 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="muestrario2" component={Muestrario2} durationInFrames={Math.round(DUR_M2 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="muestrario" component={Muestrario} durationInFrames={Math.round(DUR_MUESTRARIO * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="catalogo" component={Catalogo} durationInFrames={130} fps={FPS} width={ANCHO} height={ALTO} />
      {/* Los 10 videos de prueba. Uno por composicion: asi el workflow
          los renderiza en paralelo, un runner cada uno. */}
      {VIDEOS.map((v) => (
        <Composition
          key={v.id}
          id={v.id}
          component={Diez}
          durationInFrames={Math.round(durDe(v) * FPS)}
          fps={FPS}
          width={ANCHO}
          height={ALTO}
          defaultProps={{id: v.id}}
        />
      ))}
      {/* R6-7: pruebas aisladas de los 4 paquetes nuevos investigados en
          fabrica/skills/INVESTIGACION_HERRAMIENTAS.md, ANTES de integrar
          nada a la fabrica de verdad -- ver fabrica/docs/AUDITORIA_PROMPT_MAESTRO_2.md.
          Ninguna de estas 4 composiciones se usa en produccion todavia. */}
      <Composition id="prueba-transiciones" component={PruebaTransiciones} durationInFrames={DUR_PRUEBA_TRANSICIONES} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-efectos" component={PruebaEfectos} durationInFrames={DUR_PRUEBA_EFECTOS} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-efectos-virales" component={PruebaEfectosVirales} durationInFrames={DUR_PRUEBA_EFECTOS_VIRALES} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-3d" component={Prueba3D} durationInFrames={DUR_PRUEBA_3D} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-highlights" component={PruebaHighlights} durationInFrames={DUR_PRUEBA_HIGHLIGHTS} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-vineta" component={PruebaVineta} durationInFrames={DUR_PRUEBA_VINETA} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-lightleak" component={PruebaLightLeak} durationInFrames={DUR_PRUEBA_LIGHTLEAK} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-cortina" component={PruebaCortina} durationInFrames={DUR_PRUEBA_CORTINA} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-enfasis" component={PruebaEnfasis} durationInFrames={Math.round(6 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      {/* R7-25: exploracion agresiva del ecosistema Remotion (segunda
          pasada) -- @remotion/rounded-text-box y @remotion/gsap,
          ninguno usado en produccion todavia, ver docs/ARSENAL_AUDIOVISUAL.md. */}
      <Composition id="prueba-rounded-text-box" component={PruebaRoundedTextBox} durationInFrames={DUR_PRUEBA_ROUNDED_TEXT_BOX} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-gsap" component={PruebaGsap} durationInFrames={DUR_PRUEBA_GSAP} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-shine" component={PruebaShine} durationInFrames={DUR_PRUEBA_SHINE} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-rings" component={PruebaRings} durationInFrames={DUR_PRUEBA_RINGS} fps={FPS} width={ANCHO} height={ALTO} />
      {/* R7-16: subtitulos estilo TikTok reales (@remotion/captions) sobre
          audio REAL de fabrica_demo_05, con una fixture SINTETICA de
          Caption[] (whisper.cpp compila real en este sandbox pero la
          descarga del modelo esta bloqueada por politica de red -- ver
          remotion-spike/src/subtitulos/README.md). */}
      <Composition id="prueba-captions" component={PruebaCaptions} durationInFrames={Math.round(3.52 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      {/* R7-34: misma fixture/audio, componente nuevo SubtitulosGrandes
          (recorte en bloques chicos + revelacion palabra por palabra en
          tipografia gigante -- reemplazo de GlitchShatter pedido por el
          operador). */}
      <Composition id="prueba-subtitulos-grandes" component={PruebaSubtitulosGrandes} durationInFrames={Math.round(3.52 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
      {/* R7-18: primer grafico de torta/donut real de la fabrica,
          usando @remotion/shapes (MIT, oficial de Remotion) -- tipo de
          dato que Grafico.tsx (barras) nunca cubrio. */}
      <Composition
        id="prueba-grafico-torta"
        component={GraficoTorta}
        durationInFrames={Math.round(3 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{titulo: 'De donde vienen las ventas', segmentos: [{etiqueta: 'Orgánico', valor: 52}, {etiqueta: 'Referidos', valor: 31}, {etiqueta: 'Pago', valor: 17}]}}
      />
      {/* R7-10: Carousel Engine -- primer render REAL (still, no
          video) de 3 slides de un carrusel de prueba
          (fabrica/carrusel/test_carrusel.ts, carrusel "c1"). Se
          renderiza con `npx remotion still`, no `render`. */}
      <Composition
        id="carrusel-slide-portada"
        component={CarruselSlide}
        durationInFrames={1}
        fps={FPS}
        width={ANCHO_CARRUSEL}
        height={ALTO_CARRUSEL}
        defaultProps={{tipo: 'portada', texto: '¿Sabías que podés vender un curso sin gastar un peso en ads?', numero: 1, total: 8}}
      />
      <Composition
        id="carrusel-slide-desarrollo"
        component={CarruselSlide}
        durationInFrames={1}
        fps={FPS}
        width={ANCHO_CARRUSEL}
        height={ALTO_CARRUSEL}
        defaultProps={{tipo: 'desarrollo', texto: 'Paso 1: definir el problema real que resuelve tu curso', numero: 3, total: 8}}
      />
      <Composition
        id="carrusel-slide-cta"
        component={CarruselSlide}
        durationInFrames={1}
        fps={FPS}
        width={ANCHO_CARRUSEL}
        height={ALTO_CARRUSEL}
        defaultProps={{tipo: 'cta', texto: 'Mirá el link en la bio para el mini-curso completo', numero: 8, total: 8}}
      />
      {/* R7-14: composicion GENERICA para el generador completo
          (fabrica/carrusel/generar.ts) -- a diferencia de las 3 de
          arriba (fijas, solo para la evidencia de R7-10), esta se
          renderiza N veces por carrusel con `--props=<archivo.json>`
          distinto en cada llamada, una por slide real generado. */}
      <Composition
        id="carrusel-slide"
        component={CarruselSlide}
        durationInFrames={1}
        fps={FPS}
        width={ANCHO_CARRUSEL}
        height={ALTO_CARRUSEL}
        defaultProps={{tipo: 'portada', texto: '(prop de ejemplo -- se pisa con --props en cada render real)', numero: 1, total: 1}}
      />
      <Composition
        id="prueba-torre3d"
        component={Torre3D}
        durationInFrames={Math.round(6 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{arriba: 'GENERASTE', hasta: 3560, prefijo: '$', abajo: 'esta semana'}}
      />
      {/* Solo el hook, para iterar sin renderizar los 26s enteros. */}
      <Composition
        id="hook"
        component={Pieza}
        durationInFrames={Math.round(GUION[0].dur * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{conVideo: true}}
      />

      {/* EFECTOS AVANZADOS CINEMATOGRAFICOS (R8) */}
      <Composition
        id="efecto-arquitectura-neon"
        component={ArquitecturaNeon as any}
        durationInFrames={Math.round(2.0 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: 'ACTIVOS',
          mainColor: '#FF0055',
          sparkColor: '#FFD700',
          duration: 2.0,
        }}
      />
      <Composition
        id="efecto-capsula-holografica"
        component={CapsulaHolografica as any}
        durationInFrames={Math.round(2.0 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          caseName: 'Juan Pérez',
          finalAmount: '$10,000',
          hologramColor: '#00BFFF',
          duration: 2.0,
        }}
      />
      <Composition
        id="efecto-cataclismo-datos"
        component={CataclismoDatos as any}
        durationInFrames={Math.round(1.5 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          oldNumber: '98%',
          newNumber: '2%',
          explosionColor: '#FFD700',
          duration: 1.5,
        }}
      />
      <Composition
        id="efecto-devorador-realidad"
        component={DevoradorRealidad as any}
        durationInFrames={Math.round(1.8 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          loserObject: 'Tiempo',
          winnerObject: 'Activos',
          neonColor: '#00FFFF',
          duration: 1.8,
        }}
      />
      <Composition
        id="efecto-mercurio-revelador"
        component={MercurioRevelador as any}
        durationInFrames={Math.round(2.2 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          logoImage: '',
          highlightColor: '#FFD700',
          duration: 2.2,
        }}
      />

      {/* FASE 2: 15+ EFECTOS ADICIONALES CINEMATOGRAFICOS */}
      <Composition
        id="efecto-glitch-shatter"
        component={GlitchShatter as any}
        durationInFrames={Math.round(1.2 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: '¡CRASH!',
          glitchColor: '#FF00FF',
          fragmentCount: 50,
          duration: 1.2,
        }}
      />
      <Composition
        id="efecto-heartbeat-pulse"
        component={HeartbeatPulse as any}
        durationInFrames={Math.round(2.0 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: 'GANASTE',
          pulseColor: '#FF0055',
          beats: 3,
          duration: 2.0,
        }}
      />
      <Composition
        id="efecto-text-reveal-fire"
        component={TextRevealFire as any}
        durationInFrames={Math.round(2.0 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: '¡REVELADO!',
          fireColor: '#FF6B35',
          textColor: '#FFFFFF',
          duration: 2.0,
        }}
      />
      <Composition
        id="efecto-circle-of-truth"
        component={CircleOfTruth as any}
        durationInFrames={Math.round(1.8 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          content: '✓',
          circleColor: '#00FF00',
          duration: 1.8,
        }}
      />
      <Composition
        id="efecto-pixel-burst"
        component={PixelBurst as any}
        durationInFrames={Math.round(1.2 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          pixelSize: 20,
          burstColor: '#00FFFF',
          duration: 1.2,
        }}
      />
      <Composition
        id="efecto-gold-rush"
        component={GoldRush as any}
        durationInFrames={Math.round(2.5 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          achievementText: 'LOGRO',
          goldColor: '#FFD700',
          coinCount: 100,
          duration: 2.5,
        }}
      />
      <Composition
        id="efecto-liquid-metal"
        component={LiquidMetal as any}
        durationInFrames={Math.round(1.5 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: 'FORMANDO',
          metalColor: '#C0C0C0',
          glowColor: '#00FFFF',
          duration: 1.5,
        }}
      />
      <Composition
        id="efecto-spotlight-reveal"
        component={SpotlightReveal as any}
        durationInFrames={Math.round(1.8 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: 'FOCO',
          spotColor: '#FFFF00',
          textColor: '#FFFFFF',
          duration: 1.8,
        }}
      />
      <Composition
        id="efecto-chromatic-shift"
        component={ChromaticShift as any}
        durationInFrames={Math.round(1.6 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: 'CAMBIO',
          duration: 1.6,
        }}
      />
      <Composition
        id="efecto-wave-distortion"
        component={WaveDistortion as any}
        durationInFrames={Math.round(1.9 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: 'ONDAS',
          waveColor: '#00FFFF',
          duration: 1.9,
        }}
      />
      <Composition
        id="efecto-starburst-flare"
        component={StarbustFlare as any}
        durationInFrames={Math.round(2.0 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: '⭐',
          starColor: '#FFFF00',
          duration: 2.0,
        }}
      />
      <Composition
        id="efecto-vortex-transport"
        component={VortexTransport as any}
        durationInFrames={Math.round(2.2 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: 'PORTAL',
          vortexColor: '#FF00FF',
          duration: 2.2,
        }}
      />
      <Composition
        id="efecto-aurora-shine"
        component={AuroraShine as any}
        durationInFrames={Math.round(2.3 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: 'AURORA',
          auroraColor1: '#00FF88',
          auroraColor2: '#FF00FF',
          duration: 2.3,
        }}
      />
      <Composition
        id="efecto-neon-ripple"
        component={NeonRipple as any}
        durationInFrames={Math.round(1.7 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          text: 'ONDA',
          rippleColor: '#00FFFF',
          coreColor: '#FF00FF',
          duration: 1.7,
        }}
      />
      <Composition
        id="efecto-bar-brawl"
        component={BarBrawl as any}
        durationInFrames={Math.round(1.8 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          labelA: 'TIEMPO',
          labelB: 'ACTIVOS',
          winner: 'B',
          colorA: '#FF0044',
          colorB: '#00FF88',
          duration: 1.8,
        }}
      />
      <Composition
        id="efecto-flip-cards"
        component={FlipCards as any}
        durationInFrames={Math.round(2.0 * FPS)}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
        defaultProps={{
          items: ['IDEA', 'PRODUCTO', 'CONTENIDO', 'VENTA'],
          cardColor: '#003366',
          textColor: '#FFFFFF',
          duration: 2.0,
        }}
      />
    </>
  );
};
