import {armarCarrusel, validarEstructura, validarReferencias} from './armar';
import type {IdentidadMarca, Slide} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

const identidad: IdentidadMarca = {paletaRef: 'remotion-spike/src/identidad.ts PALETA', fuenteRef: 'GROTESCA'};

// Carrusel bien formado: portada + 6 slides + cta = 8, dentro del rango 6-10.
const slidesBien: Slide[] = [
  {id: 's1', tipo: 'portada', texto: '¿Sabías que podés vender un curso sin gastar un peso en ads?', patronRetencionId: 'cifra-inmediata'},
  {id: 's2', tipo: 'hook', texto: 'Tomás lo hizo con $89 de curso y esto pasó...'},
  {id: 's3', tipo: 'desarrollo', texto: 'Paso 1: definir el problema real que resuelve tu curso'},
  {id: 's4', tipo: 'desarrollo', texto: 'Paso 2: armar una oferta simple, sin vueltas'},
  {id: 's5', tipo: 'ejemplo', texto: 'Ejemplo real: 40 ventas en una semana'},
  {id: 's6', tipo: 'desarrollo', texto: 'Paso 3: contenido que genera confianza antes de vender'},
  {id: 's7', tipo: 'desarrollo', texto: 'Paso 4: seguimiento simple de leads'},
  {id: 's8', tipo: 'cta', texto: 'Mirá el link en la bio para el mini-curso completo'},
];
const carruselBien = armarCarrusel('c1', 'Cómo vender un curso online', slidesBien, identidad, ['loewenstein-1994-brecha-curiosidad']);

check('armarCarrusel arma el objeto tal cual', carruselBien.slides.length === 8);
check('validarEstructura sin advertencias en un carrusel bien formado', validarEstructura(carruselBien).length === 0);
check('validarReferencias no lanza (ids reales)', (() => {
  try {
    validarReferencias(carruselBien);
    return true;
  } catch {
    return false;
  }
})());

// Carrusel mal formado: sin portada, sin cta, muy corto.
const slidesMal: Slide[] = [
  {id: 'm1', tipo: 'hook', texto: 'algo'},
  {id: 'm2', tipo: 'desarrollo', texto: ''},
];
const carruselMal = armarCarrusel('c2', 'test', slidesMal, identidad);
const advertenciasMal = validarEstructura(carruselMal);
check('detecta que no empieza con portada', advertenciasMal.some((a) => a.includes('portada')));
check('detecta que no tiene CTA', advertenciasMal.some((a) => a.includes('cta')));
check('detecta que esta fuera del rango de slides recomendado', advertenciasMal.some((a) => a.includes('6-10')));
check('detecta un slide sin texto', advertenciasMal.some((a) => a.includes('m2')));

// Integridad referencial real.
check('validarReferencias lanza con una fuente de conocimiento inventada', (() => {
  try {
    validarReferencias(armarCarrusel('c3', 'test', slidesBien, identidad, ['esto-no-existe']));
    return false;
  } catch {
    return true;
  }
})());
check('validarReferencias lanza con un patron de retencion inventado', (() => {
  try {
    validarReferencias(armarCarrusel('c4', 'test', [{...slidesBien[0], patronRetencionId: 'esto-no-existe'}], identidad));
    return false;
  } catch {
    return true;
  }
})());

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Carousel Engine (fabrica/carrusel) pasaron OK.');
