/**
 * Vuelca CARRUSELES_42 (lote_42_datos.ts) a un JSON plano con solo lo
 * que necesita el generador del calendario (metadata de publicacion),
 * sin depender de que render-lote42-carruseles.yml ya haya commiteado
 * lote_42_resumen.json con los campos nuevos (categoria/musica) --
 * evita un round-trip de CI para poder armar el calendario ya mismo.
 *
 * Uso: npx tsx carrusel/dump_calendario_datos.ts <archivo_salida.json>
 */
import * as fs from 'fs';
import {CARRUSELES_42} from './lote_42_datos';

const salida = process.argv[2];
if (!salida) {
  console.error('Uso: npx tsx dump_calendario_datos.ts <archivo_salida.json>');
  process.exit(1);
}

const datos = CARRUSELES_42.map((c) => ({
  numero: c.numero,
  id: c.id,
  titulo: c.titulo,
  hashtags: c.hashtags,
  descripcion: c.descripcion,
  dia: c.dia,
  horario: c.horario,
  horaSugerida: c.horaSugerida,
  categoria: c.categoria,
  musica: c.musica,
}));

fs.writeFileSync(salida, JSON.stringify(datos, null, 2));
console.log(`${datos.length} carruseles volcados a ${salida}`);
