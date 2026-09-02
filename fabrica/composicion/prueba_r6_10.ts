/**
 * R6-10: prueba de punta a punta del componente "torre-3d" (primer
 * componente realmente 3D del catalogo) a traves del pipeline REAL de
 * la fabrica (armarComposicion -> FabricaVideo.tsx), no solo como
 * composicion aislada (ver remotion-spike/src/Root.tsx "prueba-torre3d"
 * para esa prueba mas simple). Usa audio real de demo_06.
 */
import {armarComposicion} from './armar';
import type {UnidadResuelta} from './tipos';
import type {ComponenteRegistrado} from '../componentes/tipos';
import registroRaw from '../componentes/registro.json';
import {writeFileSync, mkdirSync, copyFileSync} from 'fs';
import {join} from 'path';

const RAIZ = join(__dirname, '../..');
const PUBLIC_DIR = join(RAIZ, 'remotion-spike/public/pruebas-r6');
mkdirSync(PUBLIC_DIR, {recursive: true});
copyFileSync(join(RAIZ, 'capturas_voz/audio_demo_06/impacto_1.wav'), join(PUBLIC_DIR, 'audio_c.wav'));

const registro = registroRaw as unknown as ComponenteRegistrado[];
const torre = registro.find((c) => c.id === 'torre-3d');
if (!torre) throw new Error('componente "torre-3d" no esta en el registro');

const unidades: UnidadResuelta[] = [
  {
    id: 'u1',
    componente: torre,
    props: {hasta: 3560, prefijo: '$', arriba: 'GENERASTE', abajo: 'esta semana'},
    audios: [{archivo: 'pruebas-r6/audio_c.wav', duracionSeg: 5.568005}],
    golpe: 'fogonazo',
    volumenSfx: 0.7,
  },
];

const arbol = armarComposicion('prueba-r6-10', unidades, 30);
console.log(JSON.stringify(arbol, null, 2));

const destino = join(__dirname, '../../remotion-spike/src/fabrica_bridge/prueba_r6_10.json');
writeFileSync(destino, JSON.stringify(arbol, null, 2));
console.log(`\nEscrito en ${destino}`);
