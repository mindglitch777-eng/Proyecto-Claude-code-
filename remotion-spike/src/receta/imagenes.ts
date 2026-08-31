// EL DICCIONARIO: DE LA FRASE DEL GUION A LA CATEGORIA DE METRAJE
//
// resolverClip.ts puede adivinar la categoria por palabras en comun,
// pero adivinar falla en casos reales: "barbero cortando pelo cliente"
// no comparte NINGUNA palabra literal con la categoria "barberia"
// (barbero vs barberia no son la misma cadena), y el video terminaba
// mostrando metraje de veterinaria para una escena de barberia. Eso es
// exactamente la queja original: "usamos metraje que no tiene nada que
// ver".
//
// Esto es la solucion de fondo: cuando un guion pide una frase que YA
// esta aca, la categoria es exacta, no una adivinanza. Cuando escribas
// un guion nuevo con una frase que no esta en este diccionario,
// listar-pendientes.js lo va a avisar en vez de dejar que
// resolverClip.ts adivine mal en silencio.
//
// La categoria es la carpeta en assets/metraje_video/<categoria>/ y el
// prefijo del archivo (<categoria>-00.mp4). El texto de busqueda en
// INGLES para pedirle a Pexels vive en descargar_metraje.py (NICHOS) --
// una sola fuente de verdad para la consulta, esto solo dice a que
// categoria pertenece cada frase.
export const IMAGENES: Record<string, string> = {
  'hombre cansado taller de noche': 'taller',
  'mujer joven trabajando taller manos': 'taller',
  'barbero cortando pelo cliente': 'barberia',
  'persona trabajando computadora oficina noche': 'oficina',
  'dos personas trabajando comparacion oficina': 'oficina',
  'dos profesionales oficina comparacion': 'oficina',
  'freelance computadora trabajo escritorio': 'freelance',
  'persona joven estudiando celular': 'celular',
  'pequeno comercio emprendedor latino': 'comercio',
  'comerciante atendiendo cliente local': 'comercio',
  'emprendedor digital trabajando computadora': 'freelance',
  'emprendedor digital trabajando computadora manos': 'freelance',
};

function normalizar(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Categoria exacta para una frase, si el diccionario la conoce. */
export function categoriaConocida(frase: string): string | null {
  return IMAGENES[normalizar(frase)] ?? null;
}
