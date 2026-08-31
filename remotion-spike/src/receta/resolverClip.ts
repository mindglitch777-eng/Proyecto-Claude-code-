import manifiesto from './manifiesto.json';
import {semilla} from './intenciones';

// EL PUENTE ENTRE "QUE QUIERO VER" Y "QUE ARCHIVO USO"
//
// El guion pide filmacion por TEMA: "oficio taller argentina
// trabajando". Pexels (via fabrica.yml) baja clips y los agrupa en
// carpetas por categoria. Este archivo no sabe nada de Pexels: solo
// mira el manifiesto (generado por generar-manifiesto.js) y elige.
//
// Si la categoria que el guion pidio TODAVIA no se bajo -- porque es
// la primera vez que se usa ese tema, y el fetch de esta noche
// todavia no corrio para el -- no se rompe el render: elige la mejor
// categoria disponible por palabras en comun, y si no hay ninguna
// coincidencia, cae a una eleccion estable (misma consulta -> mismo
// clip siempre) para que el guion sea reproducible.

type Manifiesto = {categorias: Record<string, string[]>; total: number};
const M = manifiesto as Manifiesto;
const CATEGORIAS = Object.keys(M.categorias);

function categoriaPorPalabras(consulta: string): string | null {
  const palabras = consulta.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  let mejor: {cat: string; puntos: number} | null = null;
  for (const cat of CATEGORIAS) {
    const puntos = palabras.filter((w) => cat.includes(w) || w.includes(cat)).length;
    if (puntos > 0 && (!mejor || puntos > mejor.puntos)) mejor = {cat, puntos};
  }
  return mejor?.cat ?? null;
}

/** Dado lo que el guion pide ver, devuelve un nombre de archivo real
 *  bajo remotion-spike/public/video/. Nunca devuelve vacio: si no hay
 *  absolutamente nada bajado, no hay nada que mostrar y el que llama
 *  debe caer a un formato sin filmacion (eso lo maneja el registro). */
export function resolverClip(consulta: string): string | null {
  if (!CATEGORIAS.length) return null;
  const directa = categoriaPorPalabras(consulta);
  const cat = directa ?? CATEGORIAS[semilla(consulta) % CATEGORIAS.length];
  const clips = M.categorias[cat];
  return clips[semilla(consulta + cat) % clips.length];
}

export const HAY_ASSETS = M.total > 0;
