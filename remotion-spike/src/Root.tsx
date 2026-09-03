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
import pruebaR68 from './fabrica_bridge/prueba_r6_8.json';
import pruebaR610 from './fabrica_bridge/prueba_r6_10.json';
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
import {Prueba3D, DUR_PRUEBA_3D} from './pruebas-r6/Prueba3D';
import {PruebaHighlights, DUR_PRUEBA_HIGHLIGHTS} from './pruebas-r6/PruebaHighlights';
import {PruebaVineta, DUR_PRUEBA_VINETA} from './pruebas-r6/PruebaVineta';
import {PruebaLightLeak, DUR_PRUEBA_LIGHTLEAK} from './pruebas-r6/PruebaLightLeak';
import {CarruselSlide, ANCHO_CARRUSEL, ALTO_CARRUSEL} from './carrusel/CarruselSlide';
import {PruebaCortina, DUR_PRUEBA_CORTINA} from './pruebas-r6/PruebaCortina';
import {Torre3D} from './tres/Torre3D';
import {PruebaEnfasis} from './pruebas-r6/PruebaEnfasis';

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
      <Composition id="prueba-3d" component={Prueba3D} durationInFrames={DUR_PRUEBA_3D} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-highlights" component={PruebaHighlights} durationInFrames={DUR_PRUEBA_HIGHLIGHTS} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-vineta" component={PruebaVineta} durationInFrames={DUR_PRUEBA_VINETA} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-lightleak" component={PruebaLightLeak} durationInFrames={DUR_PRUEBA_LIGHTLEAK} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-cortina" component={PruebaCortina} durationInFrames={DUR_PRUEBA_CORTINA} fps={FPS} width={ANCHO} height={ALTO} />
      <Composition id="prueba-enfasis" component={PruebaEnfasis} durationInFrames={Math.round(6 * FPS)} fps={FPS} width={ANCHO} height={ALTO} />
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
    </>
  );
};
