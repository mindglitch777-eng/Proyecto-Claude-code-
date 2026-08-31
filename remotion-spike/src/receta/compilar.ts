import {CON_METRAJE, FORMATOS, GOLPES, Intencion, REQUIERE_DATOS, SOLO_TEXTO, semilla} from './intenciones';

// Un guion se escribe asi: cada parte dice QUE HACE y QUE DICE.
// Nada de formatos, nada de tiempos. Eso lo pone el compilador.
export type Parte = {
  hace: Intencion;
  /** las lineas que van en pantalla */
  dice: string[];
  /** cifras, filas, pasos... lo que el formato elegido necesite */
  datos?: Record<string, unknown>;
  /** que se tiene que VER. De aca salen las busquedas a Pexels. */
  imagen?: string;
  /** forzar un formato, cuando el operador quiere ese y no otro */
  formato?: string;
  /** segundos; si no se pone, lo calcula por cantidad de texto */
  dura?: number;
};

export type Guion = {
  id: string;
  titulo: string;
  cta: string;
  /** De que se trata, en palabras que sirvan para buscar filmacion.
   *  Es el respaldo cuando una parte necesita imagen y no la declaro. */
  tema: string;
  partes: Parte[];
};

export type Bloque = {
  formato: string;
  golpe: string;
  dura: number;
  parte: Parte;
};

export type Plan = {
  id: string;
  titulo: string;
  cta: string;
  bloques: Bloque[];
  duracion: number;
  /** todo lo que hay que bajar de Pexels para este video */
  busquedas: string[];
};

// Un generador de numeros que siempre da lo mismo para la misma
// semilla. Hace falta para que el video no cambie en cada render.
function dado(s: number) {
  let x = s || 1;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return Math.abs(x) / 2147483647;
  };
}

/** Cuanto dura una parte segun lo que dice. Leer lleva tiempo. */
function calcularDuracion(p: Parte): number {
  const palabras = p.dice.join(' ').split(/\s+/).filter(Boolean).length;
  const extra = p.datos ? Object.keys(p.datos).length * 0.5 : 0;
  // ~2.7 palabras por segundo hablado, con piso y techo
  return Math.max(2.6, Math.min(9, 1.4 + palabras / 2.7 + extra));
}

/**
 * Convierte un guion en un plan de video: elige formato y golpe para
 * cada parte, sin repetir, alternando pantallas de texto con
 * pantallas con imagen, y garantizando metraje de verdad.
 */
export function compilar(g: Guion): Plan {
  const rnd = dado(semilla(g.id + g.titulo));
  const usados = new Set<string>();
  const bloques: Bloque[] = [];

  // Primera pasada: elegir formato para cada parte.
  g.partes.forEach((p, i) => {
    if (p.formato) {
      usados.add(p.formato);
      bloques.push({formato: p.formato, golpe: '', dura: 0, parte: p});
      return;
    }
    const posibles = FORMATOS[p.hace] || ['punch'];
    const anterior = bloques[bloques.length - 1]?.formato;

    // Un formato que necesita datos con una forma especifica (una
    // encuesta necesita porcentajes, un ranking necesita una lista) se
    // saca de la lista si el guion no los trajo. Mejor un formato mas
    // simple que uno a medias mostrando "undefined".
    const capaces = posibles.filter((f) => {
      const necesita = REQUIERE_DATOS[f];
      return !necesita || necesita(p.datos);
    });
    // Si NINGUNO de los formatos de esta intencion tiene lo que
    // necesita (el guion no trajo esos datos), no se cae en la lista
    // completa -- eso podria volver a elegir un formato que exige
    // datos y romper el render. 'punch' funciona siempre con solo
    // 'dice', asi que es el piso de seguridad real.
    const base = capaces.length ? capaces : ['punch'];

    // Se descartan: los ya usados en este video, y un segundo texto
    // plano seguido.
    let libres = base.filter((f) => !usados.has(f));
    if (anterior && SOLO_TEXTO.has(anterior)) {
      const conImagen = libres.filter((f) => !SOLO_TEXTO.has(f));
      if (conImagen.length) libres = conImagen;
    }
    // Si una parte pide imagen, se prefiere un formato que la use.
    if (p.imagen) {
      const conMetraje = libres.filter((f) => CON_METRAJE.has(f));
      if (conMetraje.length) libres = conMetraje;
    }
    if (!libres.length) libres = base;

    const elegido = libres[Math.floor(rnd() * libres.length) % libres.length];
    usados.add(elegido);
    bloques.push({formato: elegido, golpe: '', dura: 0, parte: p});
  });

  // Segunda pasada: si no quedaron al menos dos escenas con filmacion,
  // se cambian las que se pueda. El operador pidio metraje real en
  // todos los videos, no solo en los que lo declaran.
  let conMetraje = bloques.filter((b) => CON_METRAJE.has(b.formato)).length;
  for (let i = 0; conMetraje < 2 && i < bloques.length; i++) {
    const b = bloques[i];
    if (b.parte.formato || CON_METRAJE.has(b.formato)) continue;
    const alternativa = (FORMATOS[b.parte.hace] || []).find(
      (f) => CON_METRAJE.has(f) && !usados.has(f),
    );
    if (alternativa) {
      usados.delete(b.formato);
      usados.add(alternativa);
      b.formato = alternativa;
      conMetraje++;
    }
  }

  // Tercera pasada: golpe de entrada y duracion.
  bloques.forEach((b, i) => {
    const opciones = GOLPES[b.parte.hace] || ['corte'];
    b.golpe = i === 0 ? 'corte' : opciones[Math.floor(rnd() * opciones.length) % opciones.length];
    b.dura = b.parte.dura ?? calcularDuracion(b.parte);
  });

  // Si a una parte le toco un formato con filmacion y no declaro que
  // queria ver, cae al tema del video.
  //
  // La primera version armaba la busqueda juntando palabras sueltas de
  // la frase, y salia ensalada: "persona dias otro cinco trabajo". Con
  // eso Pexels no devuelve nada util. El tema del guion es una frase
  // pensada para buscar, asi que sirve mucho mejor de respaldo.
  let variante = 0;
  bloques.forEach((b) => {
    if (!CON_METRAJE.has(b.formato) || b.parte.imagen) return;
    // se le agrega una vuelta distinta a cada una para que dos escenas
    // del mismo video no pidan exactamente lo mismo
    const vueltas = ['', ' manos', ' retrato', ' local'];
    b.parte = {...b.parte, imagen: g.tema + vueltas[variante % vueltas.length]};
    variante++;
  });

  const busquedas = bloques
    .map((b) => b.parte.imagen)
    .filter((x): x is string => Boolean(x));

  return {
    id: g.id,
    titulo: g.titulo,
    cta: g.cta,
    bloques,
    duracion: bloques.reduce((a, b) => a + b.dura, 0),
    busquedas: Array.from(new Set(busquedas)),
  };
}

/** Para revisar de un vistazo que le toco a cada video. */
export function resumir(p: Plan): string {
  const L = [`${p.id} · ${p.titulo} · ${p.duracion.toFixed(1)}s`];
  p.bloques.forEach((b) => {
    L.push(`   ${b.parte.hace.padEnd(13)} ${b.formato.padEnd(14)} ${b.golpe.padEnd(9)} ${b.dura.toFixed(1)}s`);
  });
  if (p.busquedas.length) L.push(`   imagenes: ${p.busquedas.join(' · ')}`);
  return L.join('\n');
}
