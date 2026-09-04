/**
 * Lote de 10 videos de venta ("sistema de ingresos con IA") -- a
 * diferencia de generar_demo_XX.ts que arma un solo video, este script
 * genera los 10 arboles de una corrida, uno por archivo JSON.
 *
 * Mitad y mitad, a pedido explicito del operador tras la duda real de
 * si el Director Visual "respetaba" las animaciones que ya se habian
 * elegido a mano (guion original de DeepSeek) o decidia de cero:
 *   - venta_01 a venta_05: guion en TEXTO PLANO (categoria + intensidad
 *     + contenido neutral por escena) -- el Director Visual real elige
 *     el componente ganador, compitiendo los 23 efectos nuevos contra
 *     los legacy de la misma categoria. Puede NO coincidir con lo que
 *     elegiria un humano a mano.
 *   - venta_06 a venta_10: componente y props EXACTOS del guion
 *     original de DeepSeek (VIDEOS_MANUAL), sin pasar por
 *     director.consultar() -- garantiza la animacion pedida escena por
 *     escena.
 *
 * Motivo de la primera mitad: ejercitar de verdad la integracion de
 * los 23 componentes nuevos de remotion-spike/src/effects/ al catalogo
 * real de la fabrica (recien registrados), no solo dejarlos
 * documentados sin uso.
 *
 * Requiere que la voz real YA este generada en
 * capturas_voz/audio_lote_ventas/v{N}_s{M}.wav (ver
 * .github/workflows/generar-voz-lote-ventas.yml y
 * capturas_voz/manifest_lote_ventas.json) -- si un archivo no existe
 * todavia, este script para con un error claro en vez de inventar una
 * duracion.
 *
 * Uso: npx tsx ejemplos/generar_lote_ventas.ts
 */
import {execSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {DirectorVisual} from '../directores/visual';
import {DirectorAudio} from '../directores/audio';
import {armarComposicion} from '../composicion/armar';
import type {ClipAudio, UnidadResuelta} from '../composicion/tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import type {ConsultaVisual} from '../directores/tipos';
import {
  propsParaTexto, propsParaCifra, propsParaComparacion, propsParaLista,
  propsParaLogos, type DatosProgresion, type DatosComparacion, type DatosLista, type DatosLogo,
} from '../composicion/adaptadores';
import registroRaw from '../componentes/registro.json';

const RAIZ = path.resolve(__dirname, '../..');
const AUDIO_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_lote_ventas');
const PUBLIC_DIR = path.join(RAIZ, 'remotion-spike/public/fabrica_venta');
const BRIDGE_DIR = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge');

mkdirSync(PUBLIC_DIR, {recursive: true});

function clipReal(id: string): ClipAudio {
  const origen = path.join(AUDIO_ORIGEN, `${id}.wav`);
  if (!existsSync(origen)) {
    throw new Error(
      `Falta el audio real de "${id}" en ${origen} -- todavia no genero la voz real ` +
        `(ver .github/workflows/generar-voz-lote-ventas.yml). No se inventa una duracion.`
    );
  }
  const duracionSeg = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${origen}"`).toString().trim()
  );
  copyFileSync(origen, path.join(PUBLIC_DIR, `${id}.wav`));
  return {archivo: `fabrica_venta/${id}.wav`, duracionSeg};
}

/** Tipo de contenido neutral de una escena -- el mismo modelo que
 * esperan los adaptadores de composicion/adaptadores.ts, mas los dos
 * casos sin adaptador (diagrama/mindmap, logos) que hoy tienen un
 * unico candidato viable (los demas de esa categoria requieren assets
 * que este lote no tiene: iconos/fotos). */
type ContenidoEscena =
  | {tipo: 'texto'; frase: string; colorPrincipal?: string; colorSecundario?: string}
  | {tipo: 'cifra'; datos: DatosProgresion}
  | {tipo: 'comparacion'; datos: DatosComparacion}
  | {tipo: 'lista'; datos: DatosLista}
  | {tipo: 'diagrama'; items: string[]; lineColor?: string; nodeGlow?: string}
  | {tipo: 'logos'; datos: DatosLogo};

const CATEGORIA_DE: Record<ContenidoEscena['tipo'], ConsultaVisual['categorias']> = {
  texto: ['texto'],
  cifra: ['cifra'],
  comparacion: ['comparacion'],
  lista: ['lista'],
  diagrama: ['diagrama'],
  logos: ['logos'],
};

function propsPara(id: string, c: ContenidoEscena): Record<string, unknown> {
  switch (c.tipo) {
    case 'texto':
      return propsParaTexto(id, {frase: c.frase, colorPrincipal: c.colorPrincipal, colorSecundario: c.colorSecundario});
    case 'cifra':
      return propsParaCifra(id, c.datos);
    case 'comparacion':
      return propsParaComparacion(id, c.datos);
    case 'lista':
      return propsParaLista(id, c.datos);
    case 'logos':
      return propsParaLogos(id, c.datos);
    case 'diagrama':
      if (id !== 'mindmap-connect') {
        throw new Error(`sin adaptador para diagrama "${id}" en este lote (solo mindmap-connect no requiere assets)`);
      }
      return {items: c.items, lineColor: c.lineColor ?? '#00BFFF', nodeGlow: c.nodeGlow ?? '#0088FF'};
  }
}

type EscenaGuion = {
  contenido: ContenidoEscena;
  intensidadDeseada: number;
  capacidadTextoNecesaria: 'ninguna' | 'corta' | 'media' | 'larga';
  esRevelacion?: boolean;
  esCierre?: boolean;
};

type VideoGuion = {id: string; escenas: [EscenaGuion, EscenaGuion, EscenaGuion, EscenaGuion, EscenaGuion, EscenaGuion]};

const t = (frase: string, c1?: string, c2?: string): ContenidoEscena => ({tipo: 'texto', frase, colorPrincipal: c1, colorSecundario: c2});
const cmp = (izq: string, der: string, pesoIzq = 3, pesoDer = 8): ContenidoEscena => ({
  tipo: 'comparacion', datos: {izquierda: {rotulo: izq, texto: izq, peso: pesoIzq}, derecha: {rotulo: der, texto: der, peso: pesoDer}},
});
const dia = (items: string[], lineColor?: string, nodeGlow?: string): ContenidoEscena => ({tipo: 'diagrama', items, lineColor, nodeGlow});
const lst = (items: string[], color?: string): ContenidoEscena => ({tipo: 'lista', datos: {items, color}});
const cif = (de: number, a: number, titulo: string, etiqueta: string, esDinero = false): ContenidoEscena => ({
  tipo: 'cifra', datos: {titulo, puntos: [{etiqueta: 'antes', valor: de}, {etiqueta: 'ahora', valor: a}], etiqueta, esDinero},
});
const cta = (texto: string, color: string): ContenidoEscena => ({tipo: 'logos', datos: {texto, colorDestacado: color}});

const VIDEOS: VideoGuion[] = [
  {
    id: 'venta_01',
    escenas: [
      {contenido: t('98% PIERDE', '#FF0044'), intensidadDeseada: 0.85, capacidadTextoNecesaria: 'corta'},
      {contenido: t('NO SABEN POR QUÉ', '#FF4400'), intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta'},
      {contenido: cmp('TIEMPO', 'ACTIVOS'), intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta'},
      {contenido: dia(['IDEA', 'PRODUCTO', 'CONTENIDO', 'VENTA']), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media'},
      {contenido: t('RESULTADOS', '#FFD700'), intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta', esRevelacion: true},
      {contenido: cta('SEGUIME', '#FFD700'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'corta', esCierre: true},
    ],
  },
  {
    id: 'venta_02',
    escenas: [
      {contenido: t('ES UN MARTILLO', '#00FFFF'), intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta'},
      {contenido: t('DECORA LA PARED', '#FF6600'), intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta'},
      {contenido: t('CONSTRUYE UN NEGOCIO', '#FF0055', '#FFD700'), intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta'},
      {contenido: lst(['IDEA', 'PRODUCTO', 'CONTENIDO', 'VENTA'], '#003366'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media'},
      {contenido: t('MEJOR EMPLEADO', '#FF6600'), intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta', esRevelacion: true},
      {contenido: cta('SEGUIME', '#FFD700'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'corta', esCierre: true},
    ],
  },
  {
    id: 'venta_03',
    escenas: [
      {contenido: t('MERCADO GIGANTE', '#00FF88'), intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta'},
      {contenido: lst(['EBOOKS', 'PLANTILLAS', 'CURSOS', 'EMBUDOS'], '#003366'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media'},
      {contenido: cmp('EQUIPO', 'IA'), intensidadDeseada: 0.65, capacidadTextoNecesaria: 'corta'},
      {contenido: dia(['PRODUCTO', 'CONTENIDO', 'VENTA'], '#00FF88', '#00FF44'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media'},
      {contenido: cif(0, 10000, 'RESULTADOS', 'en 90 días', true), intensidadDeseada: 0.75, capacidadTextoNecesaria: 'corta', esRevelacion: true},
      {contenido: cta('SEGUIME', '#00FF88'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'corta', esCierre: true},
    ],
  },
  {
    id: 'venta_04',
    escenas: [
      {contenido: t('ERROR', '#FF0044'), intensidadDeseada: 0.85, capacidadTextoNecesaria: 'ninguna'},
      {contenido: cmp('CONTENIDO', 'VENTAS'), intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta'},
      {contenido: dia(['CONTENIDO', 'PRODUCTO', 'IA'], '#00BFFF', '#0088FF'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media'},
      {contenido: lst(['CONTENIDO', 'PRODUCTO', 'PLATA'], '#003366'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media'},
      {contenido: t('PLATA LLEGA SOLA', '#FFD700'), intensidadDeseada: 0.7, capacidadTextoNecesaria: 'corta', esRevelacion: true},
      {contenido: cta('SEGUIME', '#FFD700'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'corta', esCierre: true},
    ],
  },
  {
    id: 'venta_05',
    escenas: [
      {contenido: t('MIEDO', '#FF0044'), intensidadDeseada: 0.8, capacidadTextoNecesaria: 'ninguna'},
      {contenido: cmp('MIEDO', 'PRODUCTO'), intensidadDeseada: 0.6, capacidadTextoNecesaria: 'corta'},
      {contenido: t('EL ACTIVO MÁS VALIOSO', '#FF0055', '#FFD700'), intensidadDeseada: 0.55, capacidadTextoNecesaria: 'corta'},
      {contenido: dia(['IDEA', 'PRODUCTO'], '#00BFFF', '#0088FF'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'media'},
      {contenido: t('PLATA FLUYE', '#FF6600'), intensidadDeseada: 0.65, capacidadTextoNecesaria: 'corta', esRevelacion: true},
      {contenido: cta('SEGUIME', '#FFD700'), intensidadDeseada: 0.5, capacidadTextoNecesaria: 'corta', esCierre: true},
    ],
  },
];

/** Videos 6-10: el operador pidio explicitamente que estos usen los
 * componentes EXACTOS que ya habia elegido el guion original de
 * DeepSeek (props literales, sin pasar por el Director Visual) --
 * mitad y mitad con los primeros 5 (que si dejan elegir al Director).
 * `duration` se pisa igual con la duracion real del audio mas abajo. */
type EscenaManual = {componenteId: string; props: Record<string, unknown>; esRevelacion?: boolean; esCierre?: boolean};
type VideoManual = {id: string; escenas: [EscenaManual, EscenaManual, EscenaManual, EscenaManual, EscenaManual, EscenaManual]};

const VIDEOS_MANUAL: VideoManual[] = [
  {
    id: 'venta_06',
    escenas: [
      {componenteId: 'slot-machine', props: {finalNumber: '$5.000', metalColor: '#FFD700'}},
      {componenteId: 'flip-cards', props: {items: ['PRODUCTO', 'IDEA', 'EJECUCIÓN'], cardColor: '#003366', textColor: '#FFD700'}},
      {componenteId: 'mindmap-connect', props: {items: ['EMPEZAR', 'DEJAR', 'EMPEZAR', 'DEJAR', 'TERMINAR'], lineColor: '#FF0044', nodeGlow: '#FF0088'}},
      {componenteId: 'mindmap-connect', props: {items: ['PRODUCTO', 'CONTENIDO', 'VENTA'], lineColor: '#00FF88', nodeGlow: '#00FF44'}},
      {componenteId: 'gold-rush', props: {achievementText: 'DUEÑO DE NEGOCIO', goldColor: '#FFD700', coinCount: 120}, esRevelacion: true},
      {componenteId: 'spotlight-reveal', props: {text: 'SEGUIME', spotColor: '#FFD700'}, esCierre: true},
    ],
  },
  {
    id: 'venta_07',
    escenas: [
      {componenteId: 'text-reveal-fire', props: {text: 'PÉRDIDA DE TIEMPO', fireColor: '#FF4400', textColor: '#FFFFFF'}},
      {componenteId: 'flip-cards', props: {items: ['RESUELVE', 'CREA', 'GENERA', 'AUTOMATIZA'], cardColor: '#003366', textColor: '#00FF88'}},
      {componenteId: 'bar-brawl', props: {labelA: '100 HERRAMIENTAS', labelB: '1 SISTEMA', winner: 'B', colorA: '#FF0044', colorB: '#00FF88'}},
      {componenteId: 'mindmap-connect', props: {items: ['IDEA', 'PRODUCTO', 'CONTENIDO', 'VENTA'], lineColor: '#00BFFF', nodeGlow: '#0088FF'}},
      {componenteId: 'gold-rush', props: {achievementText: 'PLATA ENTRA SOLA', goldColor: '#FFD700', coinCount: 120}, esRevelacion: true},
      {componenteId: 'mercurio-revelador', props: {logoImage: '', highlightColor: '#FFD700'}, esCierre: true},
    ],
  },
  {
    id: 'venta_08',
    escenas: [
      {componenteId: 'glitch-shatter', props: {text: 'NO VENDE NADA', glitchColor: '#FF0044', fragmentCount: 50}},
      {componenteId: 'bar-brawl', props: {labelA: 'ENTRETENIMIENTO', labelB: 'CONVERSIÓN', winner: 'B', colorA: '#FF0044', colorB: '#00FF88'}},
      {componenteId: 'flip-cards', props: {items: ['HOOK', 'RETENCIÓN', 'REWARD'], cardColor: '#003366', textColor: '#FFD700'}},
      {componenteId: 'mindmap-connect', props: {items: ['HOOK', 'RETENCIÓN', 'REWARD', 'VENTA'], lineColor: '#00BFFF', nodeGlow: '#0088FF'}},
      {componenteId: 'gold-rush', props: {achievementText: 'CONVIERTE', goldColor: '#FFD700', coinCount: 120}, esRevelacion: true},
      {componenteId: 'spotlight-reveal', props: {text: 'SEGUIME', spotColor: '#00FF88'}, esCierre: true},
    ],
  },
  {
    id: 'venta_09',
    escenas: [
      {componenteId: 'slot-machine', props: {finalNumber: '99%', metalColor: '#FFD700'}},
      {componenteId: 'flip-cards', props: {items: ['PRODUCTO', 'AUTOMATIZACIÓN', 'IA', 'VENTA'], cardColor: '#003366', textColor: '#00FF88'}},
      {componenteId: 'mindmap-connect', props: {items: ['ESCRIBIR', 'EDITAR', 'PUBLICAR', 'RESPONDER'], lineColor: '#00BFFF', nodeGlow: '#0088FF'}},
      {componenteId: 'text-reveal-fire', props: {text: 'VENDIENDO MIENTRAS DORMÍS', fireColor: '#FF6600', textColor: '#FFFFFF'}},
      {componenteId: 'gold-rush', props: {achievementText: 'SOCIO IA', goldColor: '#FFD700', coinCount: 120}, esRevelacion: true},
      {componenteId: 'mercurio-revelador', props: {logoImage: '', highlightColor: '#FFD700'}, esCierre: true},
    ],
  },
  {
    id: 'venta_10',
    escenas: [
      {componenteId: 'heartbeat-pulse', props: {text: 'SISTEMA', pulseColor: '#00FFFF', beats: 3}},
      {componenteId: 'mindmap-connect', props: {items: ['IDEA', 'PRODUCTO'], lineColor: '#00BFFF', nodeGlow: '#0088FF'}},
      {componenteId: 'mindmap-connect', props: {items: ['CONTENIDO', 'VENTA'], lineColor: '#00FF88', nodeGlow: '#00FF44'}},
      {componenteId: 'arquitectura-neon', props: {text: 'SISTEMA COMPLETO', mainColor: '#00FFFF', sparkColor: '#FFD700'}},
      {componenteId: 'gold-rush', props: {achievementText: 'TRABAJA PARA VOS', goldColor: '#FFD700', coinCount: 120}, esRevelacion: true},
      {componenteId: 'spotlight-reveal', props: {text: 'SEGUIME', spotColor: '#FFD700'}, esCierre: true},
    ],
  },
];

function main() {
  const registro = registroRaw as unknown as ComponenteRegistrado[];
  const director = new DirectorVisual(registro);
  const directorAudio = new DirectorAudio();

  const resumen: {video: string; elecciones: {escena: number; id: string; score: number}[]}[] = [];

  for (const video of VIDEOS) {
    const usadosEnEsteVideo: string[] = [];
    const unidades: UnidadResuelta[] = [];
    const elecciones: {escena: number; id: string; score: number}[] = [];

    video.escenas.forEach((escena, i) => {
      const clipId = `v${parseInt(video.id.replace('venta_', ''), 10)}_s${i + 1}`;
      const clip = clipReal(clipId);

      const consulta: ConsultaVisual = {
        categorias: CATEGORIA_DE[escena.contenido.tipo],
        intensidadDeseada: escena.intensidadDeseada,
        capacidadTextoNecesaria: escena.capacidadTextoNecesaria,
        assetsDisponibles: [], // sin fotos/videos/iconos reales todavia en este lote
        duracionDisponibleSeg: clip.duracionSeg,
        evitar: usadosEnEsteVideo,
        requiereAudioSincronizado: true,
      };

      const candidatos = director.consultar(consulta, 8);
      if (candidatos.length === 0) {
        throw new Error(`${video.id} escena ${i + 1}: el Director Visual no encontro ningun candidato para ${JSON.stringify(consulta)}`);
      }

      // Probar candidatos en orden hasta que uno tenga adaptador real
      // (algunos ids de la categoria no estan cubiertos a proposito,
      // ver composicion/adaptadores.ts).
      let elegido: {componente: ComponenteRegistrado; score: number; props: Record<string, unknown>} | null = null;
      for (const c of candidatos) {
        try {
          const props = propsPara(c.componente.id, escena.contenido);
          elegido = {componente: c.componente, score: c.score, props};
          break;
        } catch {
          continue; // este candidato no tiene adaptador, probar el siguiente
        }
      }
      if (!elegido) {
        throw new Error(
          `${video.id} escena ${i + 1}: ninguno de los ${candidatos.length} candidatos tiene adaptador ` +
            `(${candidatos.map((c) => c.componente.id).join(', ')})`
        );
      }

      usadosEnEsteVideo.push(elegido.componente.id);
      elecciones.push({escena: i + 1, id: elegido.componente.id, score: Math.round(elegido.score * 100) / 100});

      const golpe = directorAudio.decidirParaUnidad({
        indice: i,
        total: video.escenas.length,
        intensidadVisual: elegido.componente.intensidad,
        esRevelacion: escena.esRevelacion,
        esCierre: escena.esCierre,
      });

      // Pasar la duracion REAL del audio como prop "duration" -- todos
      // los componentes nuevos (y los legacy que la aceptan) la usan
      // para pacear su propia animacion interna al largo real de la
      // escena, en vez de quedarse cortos y congelarse mucho tiempo.
      const props = {...elegido.props, duration: clip.duracionSeg};

      unidades.push({
        id: clipId,
        componente: elegido.componente,
        props,
        audios: [clip],
        golpe: golpe.golpeSugerido,
        volumenSfx: golpe.volumenSfxSugerido,
      });
    });

    const arbol = armarComposicion(video.id, unidades);
    const destino = path.join(BRIDGE_DIR, `${video.id}.json`);
    writeFileSync(destino, JSON.stringify(arbol, null, 2));
    console.log(`${video.id}: ${arbol.duracionTotalSeg.toFixed(1)}s -> ${destino}`);
    resumen.push({video: video.id, elecciones});
  }

  // Videos 6-10: componente ya elegido (guion original de DeepSeek),
  // sin pasar por director.consultar() -- solo se busca la ficha del
  // registro para tener un ComponenteRegistrado real (intensidad,
  // soportaAudioSincronizado, etc.) y se arma la unidad directo.
  for (const video of VIDEOS_MANUAL) {
    const unidades: UnidadResuelta[] = [];

    video.escenas.forEach((escena, i) => {
      const clipId = `v${parseInt(video.id.replace('venta_', ''), 10)}_s${i + 1}`;
      const clip = clipReal(clipId);

      const componente = registro.find((c) => c.id === escena.componenteId);
      if (!componente) {
        throw new Error(`${video.id} escena ${i + 1}: "${escena.componenteId}" no existe en el registro`);
      }

      const golpe = directorAudio.decidirParaUnidad({
        indice: i,
        total: video.escenas.length,
        intensidadVisual: componente.intensidad,
        esRevelacion: escena.esRevelacion,
        esCierre: escena.esCierre,
      });

      unidades.push({
        id: clipId,
        componente,
        props: {...escena.props, duration: clip.duracionSeg},
        audios: [clip],
        golpe: golpe.golpeSugerido,
        volumenSfx: golpe.volumenSfxSugerido,
      });
    });

    const arbol = armarComposicion(video.id, unidades);
    const destino = path.join(BRIDGE_DIR, `${video.id}.json`);
    writeFileSync(destino, JSON.stringify(arbol, null, 2));
    console.log(`${video.id}: ${arbol.duracionTotalSeg.toFixed(1)}s -> ${destino} (componentes fijos, guion original)`);
  }

  console.log('\n=== Elecciones del Director Visual (auditable, solo venta_01 a venta_05) ===');
  for (const r of resumen) {
    console.log(`\n${r.video}:`);
    for (const e of r.elecciones) console.log(`  escena ${e.escena}: ${e.id} (score ${e.score})`);
  }
}

main();
