/**
 * CLI de corrida diaria: marca como "vencido" un contenido (video o
 * carrusel) avisado hace más de 3 días que nunca se confirmó subido --
 * el artifact de GitHub Actions que lo contiene expira a esos 3 días
 * (retention-days), así que el link deja de servir y hay que
 * re-generar el aviso a mano si todavía hace falta subirlo.
 *
 * Desde que subir_video.ts/subir_carrusel.ts entregan el aviso
 * SIEMPRE de inmediato (arquitectura 2026-09-14: TikTok/YouTube pasan
 * a programarse a mano desde las apps nativas -- TikTok Studio/
 * YouTube Studio -- en vez de vía Zernio), ya no hace falta "esperar a
 * que entre en ventana" para nada -- este script solo hace la
 * limpieza de vencidos.
 *
 * Uso: npx tsx subida/chequear_buzon.ts
 */
import {RUTA_UPLOADS, RUTA_CARRUSELES, leerLog, guardarLog} from './publicacion';

const DIAS_VENCIMIENTO = 3; // igual al retention-days del artifact

function marcarVencidos(ruta: string): number {
  const entradas = leerLog(ruta);
  const ahora = Date.now();
  let cambios = 0;

  for (const e of entradas) {
    if (e.estado !== 'pendiente' || !e.avisadoBuzon || !e.avisadoBuzonEn) continue;
    const diasDesdeAviso = (ahora - new Date(e.avisadoBuzonEn).getTime()) / (1000 * 60 * 60 * 24);
    if (diasDesdeAviso >= DIAS_VENCIMIENTO) {
      e.estado = 'vencido';
      cambios++;
      console.log(`${e.id}: vencido -- se avisó hace ${diasDesdeAviso.toFixed(1)} días y nunca se marcó subido.`);
    }
  }

  if (cambios > 0) guardarLog(ruta, entradas);
  return cambios;
}

function main(): void {
  const cambiosUploads = marcarVencidos(RUTA_UPLOADS);
  const cambiosCarruseles = marcarVencidos(RUTA_CARRUSELES);
  console.log(`Listo. ${cambiosUploads} video(s) + ${cambiosCarruseles} carrusel(es) marcados vencidos esta corrida.`);
}

main();
