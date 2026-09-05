/**
 * Renderizador por guion (orden de auditoria del operador, Parte 2,
 * 2026-09-04). Declara al Director Visual y su scoring automatico
 * (`directores/visual.ts` + `registro.json` como fuente de eleccion)
 * DEPRECADOS para el flujo de produccion principal -- no se borran (el
 * operador pidio explicitamente no borrarlos), pero este orquestador
 * NUNCA los llama.
 *
 * La razon real de este cambio esta documentada en AUDITORIA_FABRICA.md
 * (Parte 1 de la misma orden): el scoring automatico penaliza -0.75 a
 * todo componente `sin_validar`, asi que los 23 efectos cinematograficos
 * nuevos casi nunca ganaban contra los componentes legacy simples
 * (`punch`, `antes-despues`, etc.) -- de 30 escenas de un lote real
 * generado con el Director Visual, solo 5 usaron un efecto nuevo. La
 * decision del operador es que, mientras no haya evidencia real de que
 * el scoring produce mejores resultados que un guionista (humano o LLM
 * externo) eligiendo el componente a proposito, el guionista elige.
 *
 * Lo que SI sigue siendo automatico -- exactamente lo que
 * `generar_lote_ventas.ts` se salteo y que la auditoria identifico como
 * la causa real de la caida de calidad del lote de 10 videos de venta:
 *
 *   1. DirectorAudio.decidirParaUnidad(): golpe/transicion e intensidad
 *      de SFX por unidad, salvo que la escena declare `transicionSalida`
 *      explicito (en ese caso gana el guion, igual que en todo el resto
 *      de la fabrica: "sugerido, no dictado" es al reves aca a proposito
 *      -- el golpe explicito SI dicta, porque este es el pipeline
 *      script-driven).
 *   2. DirectorEdicion.planificar() + curva de energia opcional:
 *      intencion narrativa, estilos, microeventos, patron de retencion
 *      elegido automaticamente del Viral/Retention Engine.
 *   3. forced-alignment real (`palabraClave`) si existe un resultado de
 *      faster-whisper para el audio de esa escena -- nunca inventa un
 *      timestamp si no existe medicion real (mismo principio que
 *      `voz/alineacion.ts`).
 *   4. DirectorRetencion.analizarVideo() sobre el arbol ya armado
 *      completo, igual que en generar_demo_10/11/12.
 *
 * Lo que este orquestador NO hace (limitaciones reales, no ocultas):
 *   - No soporta multi-audio por escena (una unidad = un textoVoz = un
 *     clip). Si un guion necesita varios audios en una misma escena
 *     (patron AudioCentro de `armar.ts`), no usar este orquestador
 *     todavia -- usar `armarComposicion` directo como hacen los
 *     generadores viejos.
 *   - `transicionSalida.tipo` tiene que ser un TipoGolpe REAL de
 *     `golpes.tsx` (fogonazo/sacudon/corte/negro/raya/fundido/desliza/
 *     iris/cortina/ninguno) -- NO el id de un efecto visual como
 *     "pixel-burst" o "liquid-metal". Son dos sistemas distintos: un
 *     "golpe" es la transicion ENTRE escenas (overlay/corte/fundido);
 *     un efecto como "pixel-burst" es el COMPONENTE VISUAL de la
 *     escena siguiente (eso va en `componenteId`, no en
 *     `transicionSalida`). Pedir un tipo que no existe tira un error
 *     explicito con la lista real, nunca reinterpreta en silencio.
 *   - `transicionSalida.duracion` no tiene efecto todavia: golpes.tsx
 *     no soporta duracion variable por instancia hoy (queda documentado
 *     como limitacion real, no simulado).
 */
import {existsSync, mkdirSync, copyFileSync} from 'node:fs';
import {execSync} from 'node:child_process';
import path from 'node:path';
import {DirectorAudio, type TipoGolpe} from '../directores/audio';
import {DirectorEdicion} from '../directores/edicion/edicion';
import type {ContextoUnidad, EstiloId, NivelEnergia} from '../directores/edicion/tipos';
import type {CurvaEnergia} from '../directores/edicion/curva_energia';
import {DirectorRetencion} from '../directores/retencion/retencion';
import {buscarPalabraAlineada, type PalabraAlineada} from '../voz/alineacion';
import {armarComposicion} from './armar';
import type {ArbolComposicion, ClipAudio, UnidadResuelta} from './tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import registroRaw from '../componentes/registro.json';

const registro = registroRaw as unknown as ComponenteRegistrado[];

const GOLPES_VALIDOS: TipoGolpe[] = [
  'fogonazo', 'sacudon', 'corte', 'negro', 'raya', 'fundido', 'desliza', 'iris', 'cortina', 'ninguno',
];

export type TransicionExplicita = {
  /** Debe ser un TipoGolpe real (ver GOLPES_VALIDOS) -- no el id de un
   * componente/efecto visual. Ver docstring del archivo. */
  tipo: string;
  /** Reservado, sin efecto todavia (golpes.tsx no soporta duracion
   * variable por instancia). Se acepta para no romper el contrato que
   * pidio el operador, pero se ignora -- ver limitaciones arriba. */
  duracion?: number;
};

export interface EscenaGuion {
  id: string;
  /** El texto que dice la voz. Informativo para este orquestador (el
   * audio real ya tiene que existir grabado, ver OpcionesRenderizado);
   * se conserva en el resultado para que el llamador pueda armar
   * manifests/QA sin tener que volver a buscar el guion original. */
  textoVoz: string;
  /** El ID EXACTO del componente en registro.json (ej. "punch-in").
   * Si no existe, tira error explicito -- este orquestador no elige
   * componentes por vos. */
  componenteId: string;
  /** Props especificas para ese componente (ej. {finalNumber: "98%"}).
   * Se pasan tal cual, sin pasar por ningun adaptador -- el guionista
   * ya sabe que componente eligio, no hace falta el sistema de
   * `adaptadores.ts` (ese existe para cuando el ganador no se conoce de
   * antemano, que es exactamente lo que este orquestador evita). */
  props: Record<string, unknown>;
  /** 0-10 (se normaliza a 0-1 para DirectorAudio/DirectorEdicion, que
   * usan esa escala en todo el resto de la fabrica). */
  intensidad: number;
  /** Palabra exacta para forced-alignment, opcional. Requiere que
   * `OpcionesRenderizado.rutaAlineacionDir` tenga un
   * `${escena.id}.json` real generado por
   * `probar-alineacion-faster-whisper.yml` -- si no existe o la
   * palabra no aparece, queda sin ancla (nunca se inventa un timestamp). */
  palabraClave?: string;
  transicionSalida?: TransicionExplicita;
  /** Campos opcionales de contexto narrativo -- si no se declaran, se
   * infieren por posicion (primera/ultima unidad), igual que hacian los
   * generadores manuales anteriores a este orquestador. */
  esPrimera?: boolean;
  esRevelacion?: boolean;
  esCierre?: boolean;
  estilosSugeridos?: EstiloId[];
}

export type OpcionesRenderizado = {
  /** Carpeta con el audio real ya generado, un .wav por escena
   * (`${escena.id}.wav`) -- ej. "capturas_voz/audio_demo_13". */
  audioOrigenDir: string;
  /** Nombre de carpeta bajo remotion-spike/public/ donde se copia el
   * audio para que Remotion lo sirva (ej. "fabrica_demo_13") -- se crea
   * si no existe. `remotion-spike/public/` esta en .gitignore completo,
   * asi que esta copia tiene que pasar SIEMPRE por aca, nunca a mano. */
  carpetaPublica: string;
  /** Carpeta con resultados de forced-alignment
   * (`fabrica/voz/resultados_alineacion`), opcional -- solo hace falta
   * si alguna escena declara `palabraClave`. */
  rutaAlineacionDir?: string;
  /** Curva de energia objetivo para todo el video (curva_energia.ts).
   * Opcional -- sin esto, la energia de cada escena sale solo de su
   * propia intensidad (comportamiento identico al Director de Edicion
   * sin R7-31). */
  curvaEnergia?: CurvaEnergia;
  fps?: number;
};

export type ResultadoUnidad = {
  id: string;
  componenteId: string;
  golpe: TipoGolpe;
  golpeExplicito: boolean;
  intencion: string;
  energia: NivelEnergia;
  patronRetencionId?: string;
  palabraAncla?: PalabraAlineada;
};

export type ResultadoRenderizado = {
  arbol: ArbolComposicion;
  resumen: ResultadoUnidad[];
};

function componenteRegistrado(id: string): ComponenteRegistrado {
  const c = registro.find((r) => r.id === id);
  if (!c) {
    const disponibles = registro.map((r) => r.id).sort().join(', ');
    throw new Error(
      `renderizador_por_guion: "${id}" no existe en fabrica/componentes/registro.json. ` +
      `Este orquestador no elige componentes por vos -- el guion tiene que nombrar un id real ` +
      `del catalogo. IDs disponibles: ${disponibles}`
    );
  }
  return c;
}

function golpeExplicito(t: TransicionExplicita | undefined): TipoGolpe | undefined {
  if (!t) return undefined;
  if (!GOLPES_VALIDOS.includes(t.tipo as TipoGolpe)) {
    throw new Error(
      `renderizador_por_guion: transicionSalida.tipo="${t.tipo}" no es un golpe real. ` +
      `El vocabulario real de golpes.tsx es: ${GOLPES_VALIDOS.join(', ')}. Si lo que se quiere es un ` +
      `EFECTO visual (ej. "pixel-burst", "liquid-metal"), eso es el componenteId de la ESCENA, no un ` +
      `tipo de golpe -- son dos sistemas distintos (transicion ENTRE escenas vs. componente DENTRO de ` +
      `una escena). Ver docstring de renderizador_por_guion.ts.`
    );
  }
  return t.tipo as TipoGolpe;
}

/** Copia el audio real de `audioOrigenDir/${id}.wav` a
 * `remotion-spike/public/${carpetaPublica}/${id}.wav` y mide su
 * duracion real con ffprobe -- misma logica que `clipReal()` de
 * `generar_lote_ventas.ts`, generalizada para cualquier guion. */
function prepararAudio(raiz: string, audioOrigenDir: string, carpetaPublica: string, id: string): ClipAudio {
  const origen = path.join(raiz, audioOrigenDir, `${id}.wav`);
  if (!existsSync(origen)) {
    throw new Error(`renderizador_por_guion: falta el audio real de "${id}" en ${origen}.`);
  }
  const destinoDir = path.join(raiz, 'remotion-spike/public', carpetaPublica);
  mkdirSync(destinoDir, {recursive: true});
  const destino = path.join(destinoDir, `${id}.wav`);
  copyFileSync(origen, destino);
  const duracionSeg = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim()
  );
  return {archivo: `${carpetaPublica}/${id}.wav`, duracionSeg};
}

/**
 * Arma el ArbolComposicion completo de un video a partir de un guion
 * script-driven (componente + props explicitos por escena). Ejecuta el
 * pipeline completo de edicion/audio/retencion sobre esas elecciones
 * -- no reemplaza el criterio del guionista, lo enriquece con lo que
 * ya sabia hacer la fabrica.
 *
 * @param raiz raiz del repo (para resolver audioOrigenDir/carpetaPublica
 * de forma absoluta, igual que RAIZ en los generadores existentes).
 */
export function renderizarPorGuion(
  id: string,
  escenas: EscenaGuion[],
  opciones: OpcionesRenderizado,
  raiz: string = process.cwd()
): ResultadoRenderizado {
  if (escenas.length === 0) {
    throw new Error('renderizador_por_guion: el guion no tiene escenas.');
  }

  const directorAudio = new DirectorAudio();
  const directorEdicion = new DirectorEdicion();
  const fps = opciones.fps ?? 30;

  const golpesUsados: TipoGolpe[] = [];
  const patronesUsados: string[] = [];
  const unidades: UnidadResuelta[] = [];
  const resumen: ResultadoUnidad[] = [];

  escenas.forEach((escena, indice) => {
    const componente = componenteRegistrado(escena.componenteId);
    const clip = prepararAudio(raiz, opciones.audioOrigenDir, opciones.carpetaPublica, escena.id);
    const intensidadNorm = Math.max(0, Math.min(1, escena.intensidad / 10));
    const esPrimera = escena.esPrimera ?? indice === 0;
    const esCierre = escena.esCierre ?? indice === escenas.length - 1;

    const decisionAudio = directorAudio.decidirParaUnidad({
      indice,
      total: escenas.length,
      intensidadVisual: intensidadNorm,
      esRevelacion: escena.esRevelacion,
      esCierre,
      evitarGolpes: golpesUsados.slice(-3),
    });
    const golpeManual = golpeExplicito(escena.transicionSalida);
    const golpe = golpeManual ?? decisionAudio.golpeSugerido;
    golpesUsados.push(golpe);

    let palabraAncla: PalabraAlineada | undefined;
    if (escena.palabraClave) {
      if (!opciones.rutaAlineacionDir) {
        console.warn(
          `[renderizador_por_guion] "${escena.id}": palabraClave="${escena.palabraClave}" pedida pero ` +
          `no se paso rutaAlineacionDir -- sigue sin ancla.`
        );
      } else {
        const ruta = path.join(raiz, opciones.rutaAlineacionDir, `${escena.id}.json`);
        palabraAncla = buscarPalabraAlineada(ruta, escena.palabraClave);
        if (!palabraAncla) {
          console.warn(
            `[renderizador_por_guion] "${escena.id}": palabraClave="${escena.palabraClave}" pedida pero no ` +
            `hay alineacion real en ${ruta} (o la palabra no aparece) -- sigue sin ancla, no se inventa un timestamp.`
          );
        }
      }
    }

    const ctx: ContextoUnidad = {
      unidadId: escena.id,
      categoria: componente.categoria,
      intensidadComponente: intensidadNorm,
      indice,
      total: escenas.length,
      duracionSegTotal: clip.duracionSeg,
      offsetsAudioSeg: [0],
      esPrimera,
      esRevelacion: escena.esRevelacion,
      esCierre,
      estilosSugeridos: escena.estilosSugeridos,
    };

    const estrategia = directorEdicion.planificar(ctx, golpe, patronesUsados.slice(-3), opciones.curvaEnergia);
    if (estrategia.patronRetencionId) patronesUsados.push(estrategia.patronRetencionId);

    unidades.push({
      id: escena.id,
      componente,
      props: escena.props,
      audios: [clip],
      golpe,
      volumenSfx: decisionAudio.volumenSfxSugerido,
      estrategiaEdicion: estrategia,
    });

    resumen.push({
      id: escena.id,
      componenteId: componente.id,
      golpe,
      golpeExplicito: golpeManual !== undefined,
      intencion: estrategia.intencion,
      energia: estrategia.energia,
      patronRetencionId: estrategia.patronRetencionId,
      palabraAncla,
    });
  });

  const arbol = armarComposicion(id, unidades, fps);
  arbol.analisisRetencion = new DirectorRetencion().analizarVideo(arbol);

  return {arbol, resumen};
}
