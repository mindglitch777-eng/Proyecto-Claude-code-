/**
 * CLI de corrida periódica (pensado para cron cada 15-20 min, mismo
 * patrón que notificar-box.yml): revisa state/uploads.json y hace dos
 * cosas, cada vez que corre --
 *
 * 1) Marca como "vencido" (nunca silenciosamente perdido) un video del
 *    buzón que ya fue avisado hace más de 3 días (los mismos 3 días de
 *    retention-days del artifact de GitHub) y nunca se confirmó subido.
 * 2) Busca EL PRIMER video pendiente cuyo horario programado (scheduledFor)
 *    ya llegó, y lo imprime en $GITHUB_OUTPUT para que el workflow suba
 *    su artifact y mande el aviso -- a propósito, procesa uno por corrida
 *    (no todos a la vez): con el cron cada 15-20 min alcanza, y evita la
 *    complejidad de subir varios artifacts distintos en un mismo job.
 *
 * Uso: npx tsx subida/chequear_buzon.ts
 * No manda nada por ntfy ni sube ningún artifact -- solo lee/escribe
 * state/uploads.json y decide. El aviso real lo manda avisar_buzon.ts,
 * llamado por el workflow SOLO si este script encontró algo pendiente.
 */
import {existsSync, readFileSync, writeFileSync, appendFileSync} from 'fs';
import {resolve} from 'path';

const RAIZ = resolve(__dirname, '../..');
const LOG_PATH = resolve(RAIZ, 'state/uploads.json');
const DIAS_VENCIMIENTO = 3; // igual al retention-days del artifact

type EntradaLog = {
  id: string;
  manual?: boolean;
  estado?: 'pendiente' | 'subido' | 'vencido';
  tema?: string;
  scheduledFor?: string;
  avisadoBuzon?: boolean;
  avisadoBuzonEn?: string;
  rutaVideo?: string;
  [k: string]: unknown;
};

function leer(): EntradaLog[] {
  if (!existsSync(LOG_PATH)) return [];
  return JSON.parse(readFileSync(LOG_PATH, 'utf-8'));
}

function guardar(entradas: EntradaLog[]): void {
  writeFileSync(LOG_PATH, JSON.stringify(entradas, null, 2) + '\n');
}

function escribirOutput(clave: string, valor: string): void {
  const rutaOutput = process.env.GITHUB_OUTPUT;
  if (!rutaOutput) {
    console.log(`(sin GITHUB_OUTPUT en el entorno -- ${clave}=${valor})`);
    return;
  }
  appendFileSync(rutaOutput, `${clave}=${valor}\n`);
}

function main(): void {
  const entradas = leer();
  const ahora = Date.now();
  let cambios = 0;

  // 1) Vencidos: avisado hace mas de DIAS_VENCIMIENTO sin confirmar subido.
  for (const e of entradas) {
    if (!e.manual || e.estado !== 'pendiente' || !e.avisadoBuzon || !e.avisadoBuzonEn) continue;
    const diasDesdeAviso = (ahora - new Date(e.avisadoBuzonEn).getTime()) / (1000 * 60 * 60 * 24);
    if (diasDesdeAviso >= DIAS_VENCIMIENTO) {
      e.estado = 'vencido';
      cambios++;
      console.log(`${e.id}: vencido -- se avisó hace ${diasDesdeAviso.toFixed(1)} días y nunca se marcó subido.`);
    }
  }

  // 2) El primer pendiente cuyo horario ya llegó (o nunca tuvo horario,
  // no debería pasar -- subir_video.ts ya lo maneja aparte).
  const listo = entradas.find(
    (e) => e.manual && e.estado === 'pendiente' && !e.avisadoBuzon && e.scheduledFor && new Date(e.scheduledFor).getTime() <= ahora,
  );

  if (cambios > 0) guardar(entradas);

  if (listo) {
    console.log(`Pendiente listo para avisar: ${listo.id} (programado ${listo.scheduledFor}).`);
    escribirOutput('hayPendiente', 'true');
    escribirOutput('id', listo.id);
    escribirOutput('rutaVideo', listo.rutaVideo ?? '');
    escribirOutput('tema', listo.tema ?? '');
    escribirOutput('horario', listo.scheduledFor ?? '');
  } else {
    console.log('Nada pendiente para avisar en esta corrida.');
    escribirOutput('hayPendiente', 'false');
  }
}

main();
