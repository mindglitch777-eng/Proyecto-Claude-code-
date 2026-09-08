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
    props.estiloImagen = 'fondo';
    props.credito = credito;
  }
  fs.writeFileSync(path.join(dirSalida, `slide-${String(i + 1).padStart(2, '0')}.json`), JSON.stringify(props, null, 2));
});

console.log(`Carrusel "${carrusel.id}" (${carrusel.slides.length} slides) exportado a ${dirSalida}`);
console.log(`Credito real: ${credito}`);
if (advertencias.length > 0) console.log('Advertencias:', advertencias);
