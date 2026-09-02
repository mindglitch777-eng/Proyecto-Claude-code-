/**
 * R6-8: prueba de punta a punta (no un demo de produccion) de la
 * transicion real con superposicion (@remotion/transitions) integrada
 * en armarComposicion() + FabricaVideo.tsx. Usa 2 audios REALES (los
 * mismos .wav ya generados con Qwen3-TTS para fabrica-demo-06, solo
 * copiados a remotion-spike/public/pruebas-r6/) para poder confirmar
 * con un render real que el crossfade no se come ni un cuadro de
 * narracion real. Ver remotion-spike/src/pruebas-r6/README.md para el
 * resultado.
 *
 * No registra nada en memoria/laboratorio -- es una prueba tecnica
 * aislada, no un video de la fabrica.
 */
import {armarComposicion} from './armar';
import type {UnidadResuelta} from './tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import registroRaw from '../componentes/registro.json';
import {writeFileSync, mkdirSync, copyFileSync} from 'fs';
import {join} from 'path';

// remotion-spike/public/ esta en .gitignore (igual que
// fabrica_demo_0N/ de los generadores reales) -- se copian los 2 .wav
// REALES ya commiteados en capturas_voz/ para que esta prueba sea
// reproducible con un solo comando, sin depender de una copia manual.
const RAIZ = join(__dirname, '../..');
const PUBLIC_DIR = join(RAIZ, 'remotion-spike/public/pruebas-r6');
mkdirSync(PUBLIC_DIR, {recursive: true});
copyFileSync(join(RAIZ, 'capturas_voz/audio_demo_06/hook_0.wav'), join(PUBLIC_DIR, 'audio_a.wav'));
copyFileSync(join(RAIZ, 'capturas_voz/audio_demo_06/hook_1.wav'), join(PUBLIC_DIR, 'audio_b.wav'));

const registro = registroRaw as unknown as ComponenteRegistrado[];
const contador = registro.find((c) => c.id === 'contador');
if (!contador) throw new Error('componente "contador" no esta en el registro');

const unidades: UnidadResuelta[] = [
  {
    id: 'u1',
    componente: contador,
    props: {hasta: 89, prefijo: '$', arriba: 'EL CURSO CUESTA'},
    audios: [{archivo: 'pruebas-r6/audio_a.wav', duracionSeg: 3.136009}],
    golpe: 'corte',
    volumenSfx: 0.7,
  },
  {
    id: 'u2',
    componente: contador,
    props: {hasta: 3560, prefijo: '$', arriba: 'Y GENERA POR SEMANA'},
    audios: [{archivo: 'pruebas-r6/audio_b.wav', duracionSeg: 2.111995}],
    // 'fundido': el golpe que armar.ts reconoce como transicion real
    // -- la unidad anterior SI tiene audio real, asi que esto debe
    // activar el camino nuevo (transicionSalienteSeg en u1).
    golpe: 'fundido',
    volumenSfx: 0.7,
  },
];

const arbol = armarComposicion('prueba-r6-8', unidades, 30);
console.log(JSON.stringify(arbol, null, 2));

const destino = join(__dirname, '../../remotion-spike/src/fabrica_bridge/prueba_r6_8.json');
writeFileSync(destino, JSON.stringify(arbol, null, 2));
console.log(`\nEscrito en ${destino}`);
