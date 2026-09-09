/**
 * Vuelca metadata de PUBLICACION unificada de los 21 videos
 * (lote_21_datos.ts + lote_21_publicacion.ts) y los 42 carruseles
 * (fabrica/carrusel/lote_42_datos.ts) a un solo JSON plano, listo para
 * que el generador del calendario (Python, fuera del repo) arme el
 * cronograma real -- sin depender de otra corrida de CI.
 *
 * Uso: npx tsx ejemplos/dump_calendario_unificado.ts <archivo_salida.json>
 */
import * as fs from 'fs';
import {VIDEOS} from './lote_21_datos';
import {PUBLICACION_LOTE21} from './lote_21_publicacion';
import {CARRUSELES_42, COLOR_CATEGORIA, MUSICA_CATEGORIA} from '../carrusel/lote_42_datos';

const salida = process.argv[2];
if (!salida) {
  console.error('Uso: npx tsx dump_calendario_unificado.ts <archivo_salida.json>');
  process.exit(1);
}

const videos = VIDEOS.map((v) => {
  const pub = PUBLICACION_LOTE21.find((p) => p.id === v.id);
  if (!pub) throw new Error(`Falta metadata de publicacion para el video ${v.id}`);
  return {
    tipo: 'video' as const,
    id: v.id,
    titulo: v.titulo,
    hashtags: pub.hashtags,
    descripcion: pub.descripcion,
    cta: pub.cta,
    categoria: pub.categoria,
    colorAcento: COLOR_CATEGORIA[pub.categoria] ?? null,
    musica: MUSICA_CATEGORIA[pub.categoria],
  };
});

const carruseles = CARRUSELES_42.map((c) => ({
  tipo: 'carrusel' as const,
  id: c.id,
  numero: c.numero,
  titulo: c.titulo,
  hashtags: c.hashtags,
  descripcion: c.descripcion,
  categoria: c.categoria,
  colorAcento: COLOR_CATEGORIA[c.categoria] ?? null,
  musica: c.musica,
}));

fs.writeFileSync(salida, JSON.stringify({videos, carruseles}, null, 2));
console.log(`${videos.length} videos + ${carruseles.length} carruseles volcados a ${salida}`);
