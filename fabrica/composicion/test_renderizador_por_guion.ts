/**
 * Prueba de humo real de renderizador_por_guion.ts -- NO renderiza
 * video (eso corre en GitHub Actions, nunca en la sesion de Claude
 * Code), solo verifica que el orquestador arma un ArbolComposicion
 * valido a partir de un guion script-driven con audio real, y que
 * rechaza con errores explicitos los dos casos invalidos que el
 * contrato promete rechazar (componenteId inexistente, golpe
 * inventado).
 *
 * Usa audio YA GRABADO de una tanda anterior (capturas_voz/audio_demo_04)
 * en vez de generar voz nueva -- esta prueba es sobre el orquestador,
 * no sobre el motor de voz.
 */
import {existsSync, mkdirSync, copyFileSync, rmSync} from 'node:fs';
import path from 'node:path';
import {renderizarPorGuion, type EscenaGuion} from './renderizador_por_guion';

const RAIZ = path.join(__dirname, '..', '..');
const AUDIO_REAL_ORIGEN = path.join(RAIZ, 'capturas_voz/audio_demo_04');
const AUDIO_TEST_DIR = path.join(RAIZ, 'capturas_voz/.tmp_test_renderizador');
const CARPETA_PUBLICA = 'fabrica_test_renderizador';

function prepararFixture() {
  mkdirSync(AUDIO_TEST_DIR, {recursive: true});
  copyFileSync(path.join(AUDIO_REAL_ORIGEN, 'hook_0.wav'), path.join(AUDIO_TEST_DIR, 'escena_1.wav'));
  copyFileSync(path.join(AUDIO_REAL_ORIGEN, 'cierre_1.wav'), path.join(AUDIO_TEST_DIR, 'escena_2.wav'));
}

function limpiarFixture() {
  rmSync(AUDIO_TEST_DIR, {recursive: true, force: true});
  rmSync(path.join(RAIZ, 'remotion-spike/public', CARPETA_PUBLICA), {recursive: true, force: true});
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FALLO: ${msg}`);
  console.log(`OK: ${msg}`);
}

function correr() {
  prepararFixture();
  try {
    const escenas: EscenaGuion[] = [
      {
        id: 'escena_1',
        textoVoz: 'La misma herramienta tiene otro nombre en cada pais.',
        componenteId: 'punch',
        props: {lineas: ['Mismo problema.', 'Otro nombre.']},
        intensidad: 8,
        transicionSalida: {tipo: 'fogonazo'},
        esPrimera: true,
      },
      {
        id: 'transicion_tap',
        textoVoz: '',
        componenteId: 'tap-to-cut',
        props: {},
        intensidad: 6,
      },
      {
        id: 'escena_2',
        textoVoz: 'Antes perdias horas. Ahora es automatico.',
        componenteId: 'antes-despues',
        props: {antes: 'horas perdidas', despues: 'minutos'},
        intensidad: 5,
        esCierre: true,
      },
    ];

    const resultado = renderizarPorGuion('test-renderizador', escenas, {
      audioOrigenDir: 'capturas_voz/.tmp_test_renderizador',
      carpetaPublica: CARPETA_PUBLICA,
    }, RAIZ);

    assert(resultado.arbol.escenas.length === 3, 'el arbol tiene las 3 escenas del guion (incluida la transicion sin narracion)');
    assert(resultado.arbol.escenas[0].componenteId === 'punch', 'escena 1 uso el componente EXACTO del guion (punch), no uno elegido por scoring');
    assert(resultado.arbol.escenas[1].componenteId === 'tap-to-cut', 'la transicion uso tap-to-cut como escena propia (no un golpe)');
    assert(resultado.arbol.escenas[1].audios.length === 0, 'la escena sin narracion NO tiene audio (no exigio un .wav que no existe)');
    assert(resultado.arbol.escenas[1].duracionSeg > 0, 'la escena sin narracion igual tiene una duracion real (del rango del componente)');
    assert(resultado.arbol.escenas[2].componenteId === 'antes-despues', 'escena final uso el componente EXACTO del guion (antes-despues)');
    assert(resultado.resumen[0].golpe === 'fogonazo' && resultado.resumen[0].golpeExplicito, 'escena 1 respeto el golpe explicito del guion (fogonazo), no el que hubiera sugerido DirectorAudio');
    assert(!resultado.resumen[2].golpeExplicito, 'escena final (sin transicionSalida) uso el golpe automatico de DirectorAudio');
    assert(resultado.arbol.escenas[0].estrategiaEdicion !== undefined, 'DirectorEdicion SI corrio (estrategiaEdicion presente) -- pipeline completo, no el basico de generar_lote_ventas.ts');
    assert(resultado.arbol.analisisRetencion !== undefined, 'DirectorRetencion SI corrio sobre el arbol completo');
    assert(resultado.arbol.duracionTotalSeg > 0, 'duracion total real calculada a partir del audio real');
    assert(existsSync(path.join(RAIZ, 'remotion-spike/public', CARPETA_PUBLICA, 'escena_1.wav')), 'el audio real se copio a public/ (Remotion puede servirlo)');

    console.log('\narbol.duracionTotalSeg =', resultado.arbol.duracionTotalSeg);
    console.log('resumen:', JSON.stringify(resultado.resumen, null, 2));

    // ── casos invalidos que el contrato promete rechazar ──
    let rechazoComponente = false;
    try {
      renderizarPorGuion('test-invalido-1', [{...escenas[0], componenteId: 'no-existe-este-componente'}], {
        audioOrigenDir: 'capturas_voz/.tmp_test_renderizador', carpetaPublica: CARPETA_PUBLICA,
      }, RAIZ);
    } catch (e) {
      rechazoComponente = (e as Error).message.includes('no existe en fabrica/componentes/registro.json');
    }
    assert(rechazoComponente, 'componenteId inexistente se rechaza con error explicito (no elige uno solo)');

    let rechazoGolpe = false;
    try {
      renderizarPorGuion('test-invalido-2', [{...escenas[0], transicionSalida: {tipo: 'pixel-burst'}}], {
        audioOrigenDir: 'capturas_voz/.tmp_test_renderizador', carpetaPublica: CARPETA_PUBLICA,
      }, RAIZ);
    } catch (e) {
      rechazoGolpe = (e as Error).message.includes('no es un golpe real');
    }
    assert(rechazoGolpe, '"pixel-burst" como transicionSalida.tipo se rechaza (es un componente, no un golpe)');

    console.log('\nTODAS LAS PRUEBAS PASARON.');
  } finally {
    limpiarFixture();
  }
}

correr();
