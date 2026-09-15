/**
 * CLI: aplica UNA entrada pendiente (un archivo JSON con un solo
 * objeto Publicacion) al log real (state/uploads.json o
 * state/carruseles.json), de forma idempotente -- si el id ya existe
 * en el log no hace nada (evita duplicar si se reintenta).
 *
 * Uso: npx tsx subida/aplicar_pendiente.ts <rutaPendiente.json> <rutaLog.json>
 *
 * Existe para resolver de raíz la carrera de git real (2026-09-15,
 * descubierta al entregar 32 items casi en simultáneo -- 28 de 32
 * avisos salieron bien pero el registro en el log se perdió porque
 * cada corrida leía/escribía el archivo COMPLETO desde una foto vieja
 * en memoria: dos corridas concurrentes calculaban cada una "el
 * archivo + mi item" desde la MISMA base, y la que perdía la carrera
 * de `git push` reintentaba el mismo diff viejo una y otra vez -- eso
 * SIEMPRE queda en conflicto/desactualizado contra lo que ya empujó la
 * otra, así que tras agotar los reintentos el commit se perdía del
 * todo (el job igual reportaba "success" por el continue-on-error).
 * La solución real no es reintentar el mismo diff más veces: es que
 * cada intento parta de la versión MÁS FRESCA del remoto (git fetch +
 * reset --hard) y recién ahí aplique el único item pendiente de ESTA
 * corrida -- así nunca compite por las mismas líneas que otra corrida
 * pueda haber tocado mientras tanto. Ver subir-video.yml/
 * subir-carrusel.yml/entregar-diario.yml, step "Commitear".
 */
import {existsSync, readFileSync, unlinkSync} from 'fs';
import {leerLog, guardarLog, Publicacion} from './publicacion';

async function main(): Promise<void> {
  const rutaPendiente = process.argv[2];
  const rutaLog = process.argv[3];
  if (!rutaPendiente || !rutaLog) {
    console.error('Uso: npx tsx subida/aplicar_pendiente.ts <rutaPendiente.json> <rutaLog.json>');
    process.exit(1);
  }
  if (!existsSync(rutaPendiente)) {
    console.log(`No existe ${rutaPendiente} -- nada que aplicar (¿ya se aplicó y se borró en un intento anterior?).`);
    return;
  }

  const entrada = JSON.parse(readFileSync(rutaPendiente, 'utf-8')) as Publicacion;
  const log = leerLog(rutaLog);

  if (log.some((e) => e.id === entrada.id)) {
    console.log(`${entrada.id} ya está en ${rutaLog} -- no se duplica (idempotente).`);
    return;
  }

  log.push(entrada);
  guardarLog(rutaLog, log);
  console.log(`OK -- ${entrada.id} aplicado a ${rutaLog}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
