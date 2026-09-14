/**
 * CLI de corrida diaria (NO cada 15 minutos -- cambio 2026-09-14 a
 * pedido explícito del operador: "que me avise en el momento exacto,
 * no que revise cada 20 minutos al pedo, es gasto técnico que no nos
 * conviene"). Desde que subir_video.ts programa el aviso directo en
 * ntfy.sh con el header `At` (entrega programada real, min 10s/max 3
 * días), este script YA NO dispara el aviso en el momento -- eso lo
 * hace ntfy.sh solo. Lo único que le queda a esta corrida diaria:
 *
 * 1) Marcar como "vencido" un video avisado hace más de 3 días que
 *    nunca se confirmó subido (nunca silenciosamente perdido).
 * 2) Encontrar UN pendiente que todavía no se pudo avisar porque
 *    faltaban más de 3 días (límite real de ntfy.sh) y que YA entró en
 *    esa ventana -- para programarle recién ahora el aviso real.
 *
 * Uso: npx tsx subida/chequear_buzon.ts
 */
import {appendFileSync} from 'fs';
import {RUTA_UPLOADS, leerLog, guardarLog} from './publicacion';

const DIAS_VENCIMIENTO = 3; // igual al retention-days del artifact
const MAX_DELAY_NTFY_MS = 3 * 24 * 60 * 60 * 1000; // limite real de ntfy.sh

function escribirOutput(clave: string, valor: string): void {
  const rutaOutput = process.env.GITHUB_OUTPUT;
  if (!rutaOutput) {
    console.log(`(sin GITHUB_OUTPUT en el entorno -- ${clave}=${valor})`);
    return;
  }
  appendFileSync(rutaOutput, `${clave}=${valor}\n`);
}

function main(): void {
  const entradas = leerLog(RUTA_UPLOADS);
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

  // 2) El primer pendiente sin avisar que YA entró en la ventana de 3
  // días de ntfy.sh (cuando subir_video.ts lo registró, todavía faltaba
  // demasiado para programarlo).
  const listo = entradas.find((e) => {
    if (!e.manual || e.estado !== 'pendiente' || e.avisadoBuzon || !e.scheduledFor) return false;
    return new Date(e.scheduledFor).getTime() - ahora <= MAX_DELAY_NTFY_MS;
  });

  if (cambios > 0) guardarLog(RUTA_UPLOADS, entradas);

  if (listo) {
    console.log(`Ahora entra en ventana para programar: ${listo.id} (${listo.scheduledFor}).`);
    escribirOutput('hayPendiente', 'true');
    escribirOutput('id', listo.id);
    escribirOutput('rutaVideo', listo.rutaVideo ?? '');
    escribirOutput('tema', listo.tema ?? '');
    escribirOutput('horario', listo.scheduledFor ?? '');
  } else {
    console.log('Nada para programar en esta corrida.');
    escribirOutput('hayPendiente', 'false');
  }
}

main();
