import type {RegistroVideoCompleto, RegistroProducto} from './tipos';

/**
 * R7-30 (prompt "Construí una máquina, no piezas sueltas"): primera
 * entrada real -- `fabrica-demo-08`, generado por
 * `fabrica/ejemplos/generar_demo_08.ts` y renderizado de verdad
 * (`fabrica/salidas/fabrica-demo-08.mp4`, 38.32s). `qaResumen` es el
 * resultado REAL de correr `fabrica/orquestador/orquestador.ts`
 * (checks_duros.py + checks_composicion.py) sobre ese archivo -- no un
 * ejemplo de test. `metricas: null` porque este video NUNCA se
 * publicó -- ningún dato de audiencia inventado, mismo principio que
 * `memoria/laboratorio.json` (10 hipótesis en `esperando_datos`).
 *
 * IMPORTANTE (hallazgo real de esta ronda): a diferencia de
 * `memoria/api.ts` (que persiste a `memoria/laboratorio.json` con
 * `readFileSync`/`writeFileSync` reales), este archivo es código TS
 * literal, no un almacén respaldado por archivo -- `registrarVideo()`
 * (`datos/consultar.ts`) solo hace `push()` en memoria durante la
 * ejecución de un proceso, no persiste nada solo. Por eso esta entrada
 * se agregó a mano después de correr el orquestador de verdad, mismo
 * patrón ya usado en `ecosistema_producto/datos.ts` (`DERIVACIONES`).
 */
export const REGISTROS_VIDEO: RegistroVideoCompleto[] = [
  {
    videoId: 'fabrica-demo-08',
    idea: 'Curso online de Tomás: de 6 a 40 ventas por semana con el mismo precio.',
    tema: 'productos digitales / cursos online',
    angulo: 'resultado de negocio real (mismo precio, más alcance)',
    hookPatronId: 'contexto-parcial',
    estructura: 'hook-desarrollo-aceleracion-pausa-impacto-desarrollo2-cierre',
    duracionSeg: 38.322065,
    voz: 'Qwen3-TTS',
    componentesUsados: ['punch', 'cronologia', 'contador', 'silueta', 'antes-despues', 'lista-tachada'],
    formato: 'vertical 1080x1920, perfil de estilo "financiero_directo"',
    fecha: '2026-09-03',
    metricas: null,
    qaResumen: {
      ok: true,
      problemas: [],
      fuente: 'orquestador.ts (checks_duros.py + checks_composicion.py)',
    },
  },
];
export const REGISTROS_PRODUCTO: RegistroProducto[] = [];
