import * as fs from 'fs';
import * as path from 'path';
import {generarCarrusel} from './generar';
import {validarEstructura, validarReferencias} from './armar';

/**
 * CLI real: genera un carrusel completo con generarCarrusel() y
 * escribe un archivo de props por slide, listo para
 * `npx remotion still carrusel-slide <out.png> --props=<archivo>`
 * (remotion-spike/src/Root.tsx, composición "carrusel-slide", R7-14).
 *
 * Uso: npx tsx exportar_props.ts <fuenteConocimientoId> <cta> <dirSalida>
 */
const [fuenteConocimientoId, cta, dirSalida] = process.argv.slice(2);
if (!fuenteConocimientoId || !cta || !dirSalida) {
  console.error('Uso: npx tsx exportar_props.ts <fuenteConocimientoId> <cta> <dirSalida>');
  process.exit(1);
}

const carrusel = generarCarrusel(`carrusel-${fuenteConocimientoId}`, fuenteConocimientoId, cta, {patronPortadaId: 'cifra-inmediata'});

const advertencias = validarEstructura(carrusel);
validarReferencias(carrusel); // lanza si algo no es real -- nunca exportar props de un carrusel inválido.

fs.mkdirSync(dirSalida, {recursive: true});
carrusel.slides.forEach((slide, i) => {
  const props = {tipo: slide.tipo, texto: slide.texto, subtexto: slide.subtexto, numero: i + 1, total: carrusel.slides.length};
  fs.writeFileSync(path.join(dirSalida, `slide-${String(i + 1).padStart(2, '0')}.json`), JSON.stringify(props, null, 2));
});

console.log(`Carrusel "${carrusel.id}" (${carrusel.slides.length} slides) exportado a ${dirSalida}`);
if (advertencias.length > 0) {
  console.log('Advertencias de validarEstructura:', advertencias);
}
