import {generarCarrusel} from './generar';
import {validarEstructura, validarReferencias} from './armar';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

// Genera desde 3 items reales distintos del Knowledge Engine (con y
// sin `ejemplos` cargados) para confirmar que el generador se comporta
// bien en ambos casos.
const IDS_REALES = ['brunson-value-ladder', 'lead-magnet-tripwire-funnel', 'storytelling-storybrand-pas-pixar'];

for (const idFuente of IDS_REALES) {
  const carrusel = generarCarrusel(`test-${idFuente}`, idFuente, 'Mirá el link en la bio para más', {patronPortadaId: 'cifra-inmediata'});

  check(`[${idFuente}] arranca con portada`, carrusel.slides[0].tipo === 'portada');
  check(`[${idFuente}] termina con cta`, carrusel.slides[carrusel.slides.length - 1].tipo === 'cta');
  check(`[${idFuente}] tiene entre 6 y 10 slides (rango del patrón observado)`, carrusel.slides.length >= 6 && carrusel.slides.length <= 10);
  check(`[${idFuente}] ningún slide tiene texto vacío`, carrusel.slides.every((s) => s.texto.trim().length > 0));
  check(`[${idFuente}] cita la fuente real como único item de conocimiento`, carrusel.fuenteConocimientoIds.length === 1 && carrusel.fuenteConocimientoIds[0] === idFuente);
  check(`[${idFuente}] validarEstructura no encuentra advertencias`, validarEstructura(carrusel).length === 0);
  check(`[${idFuente}] validarReferencias no lanza`, (() => {
    try {
      validarReferencias(carrusel);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  })());
  check(`[${idFuente}] el slide de portada cita el patrón de retención pasado`, carrusel.slides[0].patronRetencionId === 'cifra-inmediata');
}

// No duplica el mismo texto dos veces cuando `ejemplos` está vacío
// (lead-magnet-tripwire-funnel no tiene ejemplos cargados, solo
// comoUtilizarlo -- no debe aparecer como desarrollo DOS veces).
const carruselSinEjemplos = generarCarrusel('test-sin-ejemplos', 'lead-magnet-tripwire-funnel', 'CTA de prueba');
const textosDesarrollo = carruselSinEjemplos.slides.filter((s) => s.tipo === 'desarrollo').map((s) => s.texto);
check('no repite el mismo texto de comoUtilizarlo dos veces cuando no hay ejemplos', new Set(textosDesarrollo).size === textosDesarrollo.length);

// Fuente inexistente -- debe lanzar, nunca generar contenido inventado.
check('lanza con un id de conocimiento inexistente', (() => {
  try {
    generarCarrusel('test-invalido', 'esto-no-existe', 'CTA');
    return false;
  } catch {
    return true;
  }
})());

// Patrón de retención inexistente -- debe lanzar antes de armar nada.
check('lanza con un patrón de retención de portada inexistente', (() => {
  try {
    generarCarrusel('test-invalido-2', 'brunson-value-ladder', 'CTA', {patronPortadaId: 'esto-no-existe'});
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
console.log('Todos los tests del generador de carruseles (fabrica/carrusel/generar.ts) pasaron OK.');
