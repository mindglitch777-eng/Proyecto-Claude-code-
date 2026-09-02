/**
 * Tests reales de la memoria -- escriben y leen los archivos JSON de
 * verdad, y los dejan limpios ([]) al terminar para no ensuciar el
 * repo con datos de prueba.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {
  agregarHipotesis, componentesUsadosRecientes, entradasEsperandoDatos,
  leerHistorial, leerLaboratorio, registrarResultadoReal, registrarVideo,
} from './api';

const HISTORIAL_PATH = path.join(__dirname, 'historial_componentes.json');
const LABORATORIO_PATH = path.join(__dirname, 'laboratorio.json');
const backupHistorial = readFileSync(HISTORIAL_PATH, 'utf-8');
const backupLaboratorio = readFileSync(LABORATORIO_PATH, 'utf-8');

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

function restaurar() {
  writeFileSync(HISTORIAL_PATH, backupHistorial);
  writeFileSync(LABORATORIO_PATH, backupLaboratorio);
}

try {
  // ─── anti-repeticion ───
  check('historial arranca vacio (o como estaba)', Array.isArray(leerHistorial()));
  registrarVideo('video-test-1', ['cronologia', 'contador']);
  registrarVideo('video-test-2', ['balanza']);
  registrarVideo('video-test-3', ['cronologia', 'diagrama']);

  const recientes2 = componentesUsadosRecientes(2);
  check('recientes(2) incluye lo de los ultimos 2 videos', recientes2.includes('balanza') && recientes2.includes('cronologia') && recientes2.includes('diagrama'));
  check('recientes(2) NO incluye lo del video mas viejo (fuera de la ventana)', !recientes2.includes('contador'));

  const recientes10 = componentesUsadosRecientes(10);
  check('recientes(10) SI incluye contador (ventana mas grande)', recientes10.includes('contador'));

  // ─── laboratorio: separacion hipotesis vs resultado real ───
  const entrada = agregarHipotesis({
    id: 'exp-test-1',
    hipotesis: 'Un hook con cifra de dinero grande retiene mas que uno con pregunta abierta',
    experimento: 'caso-05 usa CifraSeCae en el hook en vez de pregunta',
  });
  check('nueva entrada arranca con resultadoReal null', entrada.resultadoReal === null);
  check('nueva entrada arranca en estado esperando_datos', entrada.estado === 'esperando_datos');
  check('aparece en entradasEsperandoDatos()', entradasEsperandoDatos().some((e) => e.id === 'exp-test-1'));

  let exploto = false;
  try {
    agregarHipotesis({id: 'exp-test-1', hipotesis: 'x', experimento: 'y'});
  } catch {
    exploto = true;
  }
  check('no permite ids duplicados', exploto);

  registrarResultadoReal('exp-test-1', {
    retencionPct: 42, vistasTotales: 5000, fuente: 'TikTok Analytics (prueba)',
    fechaMedicion: new Date().toISOString(),
  }, 'La retencion fue mayor a la del promedio de la serie -- hipotesis parcialmente confirmada');

  const actualizada = leerLaboratorio().find((e) => e.id === 'exp-test-1')!;
  check('resultadoReal quedo escrito', actualizada.resultadoReal !== null);
  check('estado paso a evaluado_real', actualizada.estado === 'evaluado_real');
  check('ya NO aparece en entradasEsperandoDatos()', !entradasEsperandoDatos().some((e) => e.id === 'exp-test-1'));

  let exploto2 = false;
  try {
    registrarResultadoReal('id-que-no-existe', {fuente: 'x', fechaMedicion: 'y'}, 'z');
  } catch {
    exploto2 = true;
  }
  check('registrar resultado de un id inexistente explota (no crea uno nuevo silenciosamente)', exploto2);

  // ─── experimentos A/B (Ronda 5) ───
  const entradaAB = agregarHipotesis({
    id: 'exp-test-ab-1',
    hipotesis: 'Una revelacion progresiva de una cifra genera mas interes que mostrarla inmediatamente',
    experimento: 'variante A (cifra completa de una) vs variante B (cifra progresiva)',
    experimentoAB: {
      variableModificada: 'forma de revelar la informacion',
      variablesControladas: ['guion', 'voz', 'duracion aproximada'],
      variantes: [
        {nombre: 'A', descripcion: 'cifra completa desde el primer frame'},
        {nombre: 'B', descripcion: 'cifra progresiva (contador animado)'},
      ],
    },
  });
  check('experimentoAB queda guardado con sus 2 variantes', entradaAB.experimentoAB?.variantes.length === 2);
  check('experimentoAB guarda la variable modificada', entradaAB.experimentoAB?.variableModificada === 'forma de revelar la informacion');
  const leidaAB = leerLaboratorio().find((e) => e.id === 'exp-test-ab-1')!;
  check('experimentoAB persiste al releer el archivo', leidaAB.experimentoAB?.variantes[1].nombre === 'B');

  // Una hipotesis SIN experimentoAB sigue funcionando exactamente
  // igual que antes (campo opcional, no rompe nada existente).
  check('una entrada sin experimentoAB no tiene el campo (o es undefined)', entrada.experimentoAB === undefined);
} finally {
  restaurar();
}

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests de memoria/laboratorio pasaron OK.');
