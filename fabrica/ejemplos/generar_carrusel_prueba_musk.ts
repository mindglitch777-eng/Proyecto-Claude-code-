/**
 * Carrusel de PRUEBA (pedido explicito del operador para evaluar
 * calidad antes del lote de 42): "El sistema de Elon Musk" (carrusel
 * #31 de la lista que paso), con foto real de Musk (Wikimedia
 * Commons/Wikidata, licencia libre, bajada por descargar_foto_persona.py
 * -- ver assets/personas/elon-musk/CREDITOS.md), fotos representativas
 * de cohete (Pexels, descargar_metraje.py, nicho "cohete-lanzamiento")
 * y el logo real de SpaceX (Wikidata P154 + Commons,
 * descargar_logo_empresa.py) -- pedido explicito del operador tras ver
 * la v1 ("solo texto blanco no llama la atencion, faltan imagenes
 * representativas y el logo de spacex").
 *
 * Slides escritos a mano (no derivados del Knowledge Engine) -- usa
 * armarCarrusel() directo, no generarCarrusel(). fuenteConocimientoIds
 * vacio a proposito: este es copy de marketing del operador, no un
 * dato respaldado por fabrica/conocimiento/base.ts.
 */
import * as fs from 'fs';
import * as path from 'path';
import {armarCarrusel, validarEstructura} from '../carrusel/armar';
import type {Slide} from '../carrusel/tipos';
import {IDENTIDAD_DEFECTO} from '../carrusel/generar';

const RAIZ = path.join(__dirname, '..', '..');

function leerCredito(creditosPath: string, comoFalta: string): string {
  if (!fs.existsSync(creditosPath)) {
    throw new Error(`Falta ${creditosPath} -- ${comoFalta}`);
  }
  const txt = fs.readFileSync(creditosPath, 'utf-8');
  const autor = /Autor: (.+)/.exec(txt)?.[1]?.trim() ?? 'Wikimedia Commons';
  const licencia = /Licencia: (.+)/.exec(txt)?.[1]?.trim() ?? '';
  return `${autor}${licencia ? ` · ${licencia}` : ''}`;
}

const creditoMusk = `Foto: ${leerCredito(
  path.join(RAIZ, 'assets/personas/elon-musk/CREDITOS.md'),
  'correr foto-persona.yml (nombre="Elon Musk", slug="elon-musk") primero.'
)} · Wikimedia Commons`;

const dirCohete = path.join(RAIZ, 'assets/metraje/cohete-lanzamiento');
if (!fs.existsSync(dirCohete)) {
  throw new Error(`Falta ${dirCohete} -- correr descargar_metraje.py cohete-lanzamiento 3 primero (via GitHub Actions).`);
}
const fotosCohete = fs.readdirSync(dirCohete).filter((f) => f.endsWith('.jpg')).sort();
if (fotosCohete.length < 2) {
  throw new Error(`Hacen falta al menos 2 fotos de cohete en ${dirCohete}, hay ${fotosCohete.length}.`);
}
const creditoCoheteTxt = fs.readFileSync(path.join(dirCohete, 'CREDITOS.md'), 'utf-8');

function creditoDeArchivo(nombreArchivo: string): string {
  const linea = creditoCoheteTxt.split('\n').find((l) => l.includes(nombreArchivo));
  const m = linea ? /foto de ([^(]+)\(/.exec(linea) : null;
  return `Foto: ${m ? m[1].trim() : 'Pexels'} · Pexels`;
}

const dirLogo = path.join(RAIZ, 'assets/logos/spacex');
if (!fs.existsSync(dirLogo)) {
  throw new Error(`Falta ${dirLogo} -- correr descargar_logo_empresa.py "SpaceX" spacex primero (via GitHub Actions).`);
}
const archivoLogo = fs.readdirSync(dirLogo).find((f) => f.startsWith('logo.'));
if (!archivoLogo) throw new Error(`No hay logo.* en ${dirLogo}`);
const logoSpaceX = `logos/spacex.${archivoLogo.split('.').pop()}`;

const slides: Slide[] = [
  {id: 's1', tipo: 'portada', texto: 'SpaceX explotó sus primeros 3 cohetes. Uno tras otro.'},
  {id: 's2', tipo: 'hook', texto: '2006. 2007. 2008. Tres lanzamientos. Tres fracasos en fila.'},
  {id: 's3', tipo: 'desarrollo', texto: 'Casi se quedan sin plata para el cuarto intento. Era ese o cerrar.'},
  {id: 's4', tipo: 'desarrollo', texto: 'El cuarto despegó. Y salvó la empresa entera.'},
  {id: 's5', tipo: 'desarrollo', texto: 'No fue más conocimiento técnico. Fue el mismo sistema, ajustado 3 veces.'},
  {id: 's6', tipo: 'cta', texto: 'Tu primer producto también va a fallar. ¿Vas a tener un cuarto intento? Comentá "MUSK".'},
];

const carrusel = armarCarrusel('carrusel-prueba-musk', 'El sistema de Elon Musk', slides, IDENTIDAD_DEFECTO, []);
const advertencias = validarEstructura(carrusel);

const dirSalida = path.join(RAIZ, 'remotion-spike/props_carrusel/prueba-musk');
fs.mkdirSync(dirSalida, {recursive: true});

const porSlide: Record<string, Record<string, unknown>> = {
  s1: {imagen: 'fotos/elon-musk.jpg', estiloImagen: 'fondo', credito: creditoMusk},
  s2: {
    imagen: `fotos/${fotosCohete[0]}`,
    estiloImagen: 'fondo',
    credito: creditoDeArchivo(fotosCohete[0]),
    resaltar: ['2006.', '2007.', '2008.'],
  },
  s3: {resaltar: ['cuarto intento', 'cerrar']},
  s4: {
    imagen: `fotos/${fotosCohete[1]}`,
    estiloImagen: 'fondo',
    credito: creditoDeArchivo(fotosCohete[1]),
    resaltar: ['salvó la empresa entera'],
  },
  s5: {logo: logoSpaceX, resaltar: ['mismo sistema']},
  s6: {resaltar: ['MUSK']},
};

carrusel.slides.forEach((slide, i) => {
  const props: Record<string, unknown> = {
    tipo: slide.tipo,
    texto: slide.texto,
    subtexto: slide.subtexto,
    numero: i + 1,
    total: carrusel.slides.length,
    ...porSlide[slide.id],
  };
  fs.writeFileSync(path.join(dirSalida, `slide-${String(i + 1).padStart(2, '0')}.json`), JSON.stringify(props, null, 2));
});

console.log(`Carrusel "${carrusel.id}" (${carrusel.slides.length} slides) exportado a ${dirSalida}`);
console.log(`Fotos de cohete usadas: ${fotosCohete.slice(0, 2).join(', ')}`);
console.log(`Logo SpaceX: ${logoSpaceX}`);
if (advertencias.length > 0) console.log('Advertencias:', advertencias);
