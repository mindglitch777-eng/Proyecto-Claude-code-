/**
 * Carrusel de PRUEBA (pedido explicito del operador para evaluar
 * calidad antes del lote de 42): "El sistema de Elon Musk" (carrusel
 * #31 de la lista que paso), con foto real de Musk (Wikimedia
 * Commons/Wikidata, licencia libre, bajada por descargar_foto_persona.py
 * -- ver assets/personas/elon-musk/CREDITOS.md para la atribucion real).
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
const creditosPath = path.join(RAIZ, 'assets/personas/elon-musk/CREDITOS.md');
if (!fs.existsSync(creditosPath)) {
  throw new Error(`Falta ${creditosPath} -- correr foto-persona.yml (nombre="Elon Musk", slug="elon-musk") primero.`);
}
const creditosTxt = fs.readFileSync(creditosPath, 'utf-8');
const autor = /Autor: (.+)/.exec(creditosTxt)?.[1]?.trim() ?? 'Wikimedia Commons';
const licencia = /Licencia: (.+)/.exec(creditosTxt)?.[1]?.trim() ?? '';
const credito = `Foto: ${autor}${licencia ? ` · ${licencia}` : ''} · Wikimedia Commons`;

const slides: Slide[] = [
  {id: 's1', tipo: 'portada', texto: 'El sistema de Elon Musk: construir rápido, fracasar rápido, aprender rápido.'},
  {id: 's2', tipo: 'hook', texto: 'No sabía hacer cohetes. Aprendió en el camino.'},
  {id: 's3', tipo: 'desarrollo', texto: 'Creó SpaceX con un sistema de iteración constante.'},
  {id: 's4', tipo: 'desarrollo', texto: 'Vos no necesitás saber todo. Necesitás empezar.'},
  {id: 's5', tipo: 'desarrollo', texto: 'El sistema > El conocimiento.'},
  {id: 's6', tipo: 'cta', texto: 'Comentá "MUSK" y te mando el sistema que uso.'},
];

const carrusel = armarCarrusel('carrusel-prueba-musk', 'El sistema de Elon Musk', slides, IDENTIDAD_DEFECTO, []);
const advertencias = validarEstructura(carrusel);

const dirSalida = path.join(RAIZ, 'remotion-spike/props_carrusel/prueba-musk');
fs.mkdirSync(dirSalida, {recursive: true});
carrusel.slides.forEach((slide, i) => {
  const props: Record<string, unknown> = {
    tipo: slide.tipo,
    texto: slide.texto,
    subtexto: slide.subtexto,
    numero: i + 1,
    total: carrusel.slides.length,
  };
  if (slide.tipo === 'portada') {
    props.imagen = 'fotos/elon-musk.jpg';
    props.credito = credito;
  }
  fs.writeFileSync(path.join(dirSalida, `slide-${String(i + 1).padStart(2, '0')}.json`), JSON.stringify(props, null, 2));
});

console.log(`Carrusel "${carrusel.id}" (${carrusel.slides.length} slides) exportado a ${dirSalida}`);
console.log(`Credito real: ${credito}`);
if (advertencias.length > 0) console.log('Advertencias:', advertencias);
