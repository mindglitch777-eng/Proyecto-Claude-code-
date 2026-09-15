/**
 * Calcula qué videos y carruseles le tocan a HOY (ritmo confirmado por
 * el operador 2026-09-15: 3 videos + 6 carruseles por día, lunes a
 * viernes) y arma la matriz que entregar-diario.yml usa para disparar
 * subir_video.ts/subir_carrusel.ts de forma automática -- sin
 * contador separado: se deriva de lo que YA está en
 * state/uploads.json y state/carruseles.json, así que es seguro
 * volver a correrlo (nunca repite un id ya entregado).
 *
 * - Videos: los primeros 3 de VIDEOS (v01..v21, en orden) que todavía
 *   no tengan entrada en uploads.json. Horarios sugeridos fijos --
 *   18:30/20:00/21:30 ART, dentro de la franja 18-23 sin hueco
 *   (regla rígida de CLAUDE.md).
 * - Carruseles: lote_42_datos.ts ya trae cada uno con un campo `dia`
 *   (1-7, ciclo repetido) y su propio horaSugerida -- se entrega el
 *   grupo completo (6 carruseles, uno por franja) del `dia` más chico
 *   que todavía no esté en carruseles.json.
 *
 * Uso: npx tsx subida/preparar_entrega_diaria.ts
 * Escribe en GITHUB_OUTPUT: matrix=<json>, hayContenido=true|false
 */
import {appendFileSync} from 'fs';
import {RUTA_UPLOADS, RUTA_CARRUSELES, leerLog} from './publicacion';
import {VIDEOS} from '../ejemplos/lote_21_datos';
import {CARRUSELES_42} from '../carrusel/lote_42_datos';

const HORARIOS_VIDEO_ART = ['18:30', '20:00', '21:30'];

function fechaHoyART(): string {
  // en-CA formatea como YYYY-MM-DD directo, sin tener que reordenar.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

type ItemMatriz = {tipo: 'video' | 'carrusel'; id: string; scheduledFor: string};

function main(): void {
  const hoy = fechaHoyART();
  const items: ItemMatriz[] = [];

  const idsVideoEntregados = new Set(leerLog(RUTA_UPLOADS).map((e) => e.id));
  const videosPendientes = VIDEOS.filter((v) => !idsVideoEntregados.has(v.id)).slice(0, 3);
  videosPendientes.forEach((v, i) => {
    items.push({tipo: 'video', id: v.id, scheduledFor: `${hoy}T${HORARIOS_VIDEO_ART[i]}:00-03:00`});
  });

  const idsCarruselEntregados = new Set(leerLog(RUTA_CARRUSELES).map((e) => e.id));
  const carruselesPendientes = CARRUSELES_42.filter((c) => !idsCarruselEntregados.has(c.id));
  if (carruselesPendientes.length > 0) {
    const diaMinimo = Math.min(...carruselesPendientes.map((c) => c.dia));
    const carruselesHoy = carruselesPendientes.filter((c) => c.dia === diaMinimo);
    carruselesHoy.forEach((c) => {
      items.push({tipo: 'carrusel', id: c.id, scheduledFor: `${hoy}T${c.horaSugerida}:00-03:00`});
    });
  }

  const matrizJson = JSON.stringify(items);
  const rutaOutput = process.env.GITHUB_OUTPUT;
  if (rutaOutput) {
    appendFileSync(rutaOutput, `matrix=${matrizJson}\n`);
    appendFileSync(rutaOutput, `hayContenido=${items.length > 0 ? 'true' : 'false'}\n`);
  }
  const nVideos = items.filter((i) => i.tipo === 'video').length;
  const nCarruseles = items.filter((i) => i.tipo === 'carrusel').length;
  console.log(`Hoy (${hoy}): ${nVideos} video(s) + ${nCarruseles} carrusel(es).`);
  if (items.length === 0) console.log('Nada pendiente -- se entregó todo el lote (21 videos + 42 carruseles).');
  console.log(matrizJson);
}

main();
