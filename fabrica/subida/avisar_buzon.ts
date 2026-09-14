/**
 * CLI: manda el aviso real del buzón para UN id puntual (llamado por el
 * workflow chequear-buzon.yml solo cuando chequear_buzon.ts encontró un
 * pendiente listo, DESPUÉS de que el workflow ya subió el video como
 * artifact -- así el link que arma enviar_para_subida_manual.ts apunta
 * a una corrida que de verdad tiene el archivo adjunto).
 *
 * Marca avisadoBuzon:true + avisadoBuzonEn en state/uploads.json -- el
 * commit de ese cambio lo hace el workflow (mismo patrón de reintento
 * por carrera de git que subir-video.yml/notificar-box.yml).
 *
 * Uso: npx tsx subida/avisar_buzon.ts <id> <tema> <horario>
 * Env: NTFY_TOPIC (existente)
 */
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {resolve} from 'path';
import {enviarAvisoParaSubidaManual} from './enviar_para_subida_manual';

const RAIZ = resolve(__dirname, '../..');
const LOG_PATH = resolve(RAIZ, 'state/uploads.json');

type EntradaLog = {
  id: string;
  avisadoBuzon?: boolean;
  avisadoBuzonEn?: string;
  [k: string]: unknown;
};

async function main(): Promise<void> {
  const id = process.argv[2];
  const tema = process.argv[3];
  const horario = process.argv[4];
  if (!id || !tema || !horario) {
    console.error('Uso: npx tsx subida/avisar_buzon.ts <id> <tema> <horario>');
    process.exit(1);
  }
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    console.error('Falta NTFY_TOPIC en el entorno.');
    process.exit(1);
  }

  await enviarAvisoParaSubidaManual(topic, `${id}.mp4`, tema, horario, `Video programado: ${tema}`);
  console.log(`Aviso mandado para ${id}.`);

  if (!existsSync(LOG_PATH)) {
    console.error(`No existe ${LOG_PATH} -- no se pudo marcar avisadoBuzon.`);
    process.exit(1);
  }
  const entradas: EntradaLog[] = JSON.parse(readFileSync(LOG_PATH, 'utf-8'));
  const entrada = entradas.find((e) => e.id === id);
  if (!entrada) {
    console.error(`No se encontró "${id}" en ${LOG_PATH} -- el aviso ya salió, pero no se pudo marcar.`);
    process.exit(1);
  }
  entrada.avisadoBuzon = true;
  entrada.avisadoBuzonEn = new Date().toISOString();
  writeFileSync(LOG_PATH, JSON.stringify(entradas, null, 2) + '\n');
  console.log(`${id} marcado avisadoBuzon:true en ${LOG_PATH}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
