import {CasoConfig} from './CasoGenerico';

// DATOS DE LA SERIE (casos 2 a 20)
//
// Contenido condensado a partir del guion que dio el operador para
// cada video -- se recorta a las lineas mas fuertes (libertad de
// formato que el operador dio explicitamente) pero sin inventar
// ningun numero: cada cifra que aparece es la misma que trajo el
// guion original.
//
// Reescrito a pedido del operador con un tono mas agresivo y
// confrontativo (2026-09-01): misma cantidad de lineas/items por
// bloque que la version anterior -- eso es lo que fija cuanto dura
// cada animacion (duracionCentro/duracionCaso) -- solo cambia el
// texto, nunca las cifras ni la estructura.
//
// Las fotos son ilustrativas (ver CREDITOS.md en assets/personas/) y
// se muestran solo como fondo, sin afirmar de quien son.

const flechaCadena = (n: number) =>
  Array.from({length: n - 1}, (_, i) => ({de: i, a: i + 1, t: 1.0 + i * 1.1, acento: i === n - 2}));

export const CASOS: CasoConfig[] = [
  // 02 -- Taylor Posada
  {
    slug: 'taylor-posada',
    foto: 'taylor-posada.jpg',
    hook: ['Renunció a un sueldo de $50.000 al año.', 'Cuatro meses después facturó $175.194.'],
    hookDinero: true,
    centro: {
      tipo: 'lineas',
      items: [
        {txt: 'Qué producto hacía parar el scroll', fig: 'lupa'},
        {txt: 'Qué diseño vendía sin decir una palabra', fig: 'ojo'},
        {txt: 'Qué precio no espantaba al comprador', fig: 'etiqueta'},
        {txt: 'Qué imagen paraba el pulgar', fig: 'foco'},
      ],
    },
    cifra: {tipo: 'cifraSeCae', arriba: 'De esos $175.194 facturados', de: 'Ganancia real', a: '$48.000', abajo: 'Esa es la plata que se lleva a casa. La otra es humo'},
    cifraDinero: true,
    final: ['Facturar no es ganar. Dejá de confundirlos.', 'La plata real está en entender qué parte del sistema la produce.'],
  },
  // 03 -- (ebook, 15/30 dias)
  {
    slug: 'caso-03',
    foto: 'nicolas-gomez.jpg',
    hook: ['Generó $4.699 en 15 días con un PDF.', 'Sentado en Latinoamérica. No en Silicon Valley.'],
    hookDinero: true,
    centro: {
      tipo: 'diagrama',
      d: {
        nodos: [
          {fig: 'chip', rotulo: 'IDEA', x: 0.5, y: 0.13, tam: 140, t: 0.2},
          {fig: 'lupa', rotulo: 'INVESTIGACIÓN', x: 0.5, y: 0.34, tam: 140, t: 1.3},
          {fig: 'notebook', rotulo: 'CREACIÓN', x: 0.5, y: 0.55, tam: 140, t: 2.4},
          {fig: 'etiqueta', rotulo: 'OFERTA', x: 0.5, y: 0.76, tam: 140, t: 3.5},
          {fig: 'cohete', rotulo: 'TRÁFICO', x: 0.5, y: 0.94, tam: 140, t: 4.6, acento: true},
        ],
        flechas: flechaCadena(5),
      },
    },
    cifra: {tipo: 'cifraSeCae', arriba: 'A los 15 días', de: '$4.699', a: '$6.116 a los 30 días', abajo: 'El PDF no vendió nada solo: vendió todo lo de alrededor'},
    cifraDinero: true,
    final: ['Crear el PDF es lo fácil. Lo hace cualquiera en una tarde.', 'Conseguir que alguien saque la tarjeta es el negocio real.'],
  },
  // 04 -- ($35k, un producto)
  {
    slug: 'caso-04',
    foto: 'joan-carreno.jpg',
    hook: ['Facturó más de $35.000 con UN solo producto.', 'Y no, no fue suerte. Mirá el camino.'],
    hookDinero: true,
    centro: {
      tipo: 'lineas',
      items: [
        {txt: 'Lo que ya sabía, convertido en oferta', fig: 'notebook'},
        {txt: 'Contenido que hablaba del problema, no del producto', fig: 'mensaje'},
        {txt: 'Ese contenido atrajo gente sola', fig: 'gente'},
        {txt: 'El producto se vendió una y otra vez, dormido', fig: 'billete'},
      ],
    },
    cifra: {tipo: 'contador', arriba: 'Facturación con un solo producto', hasta: 35000, sufijo: '+', abajo: 'Costo de venderlo de nuevo: casi cero'},
    cifraDinero: true,
    final: ['Bajo costo de reproducción no significa ventas automáticas.', 'La verdadera pelea es por la atención, no por el producto.'],
  },
  // 05 -- (2 socios, IA + infraestructura, $1M/6 meses)
  {
    slug: 'caso-05',
    foto: 'denise-encinas.jpg',
    hook: ['Armaron un negocio de productos digitales.', 'Y cuando funcionó, construyeron una IA para multiplicarlo.'],
    centro: {
      tipo: 'diagrama',
      d: {
        nodos: [
          {fig: 'chip', rotulo: 'IA', x: 0.5, y: 0.13, tam: 140, t: 0.2, acento: true},
          {fig: 'engranaje', rotulo: 'AUTOMATIZACIÓN', x: 0.5, y: 0.34, tam: 140, t: 1.3},
          {fig: 'notebook', rotulo: 'CREACIÓN', x: 0.5, y: 0.55, tam: 140, t: 2.4},
          {fig: 'nube', rotulo: 'DISTRIBUCIÓN', x: 0.5, y: 0.76, tam: 140, t: 3.5},
          {fig: 'billete', rotulo: 'MONETIZACIÓN', x: 0.5, y: 0.94, tam: 140, t: 4.6, acento: true},
        ],
        flechas: flechaCadena(5),
      },
    },
    cifra: {tipo: 'contador', arriba: 'En sus primeros 6 meses', hasta: 1000000, sufijo: '+', abajo: 'Dejaron de vender un producto: empezaron a vender la máquina'},
    cifraDinero: true,
    final: ['Hay una diferencia enorme entre usar una herramienta...', '...y construir un negocio alrededor de un problema real.'],
  },
  // 06 -- (arte IA en Etsy, $7k/mes, equipo)
  {
    slug: 'caso-06',
    foto: 'jai-rodriguez.jpg',
    hook: ['Más de $7.000 de ganancia en un mes vendiendo imágenes con IA.', 'Y no, no lo hizo solo. Ese es el dato que nadie cuenta.'],
    hookDinero: true,
    centro: {
      tipo: 'diagrama',
      d: {
        nodos: [
          {fig: 'notebook', rotulo: 'CREACIÓN', x: 0.5, y: 0.18, tam: 150, t: 0.2},
          {fig: 'cohete', rotulo: 'PUBLICACIÓN', x: 0.5, y: 0.42, tam: 150, t: 1.3},
          {fig: 'foco', rotulo: 'OPTIMIZACIÓN', x: 0.5, y: 0.66, tam: 150, t: 2.4},
          {fig: 'ojo', rotulo: 'ATENCIÓN', x: 0.5, y: 0.9, tam: 150, t: 3.5, acento: true},
        ],
        flechas: flechaCadena(4),
      },
    },
    cifra: {tipo: 'contador', arriba: 'Beneficio en un solo mes', hasta: 7000, sufijo: '+', abajo: 'El equipo escaló esto. La IA sola nunca lo hubiera hecho'},
    cifraDinero: true,
    final: ['Una herramienta te ayuda a crear más rápido.', 'Un sistema con gente es lo único que te hace escalar.'],
  },
  // 07 -- (Canva, $12k, listing)
  {
    slug: 'caso-07',
    foto: 'kiana-bonollo.jpg',
    hook: ['Convirtió plantillas de Canva en casi $12.000.', 'Y estás a punto de mirar la parte equivocada de esta historia.'],
    hookDinero: true,
    centro: {
      tipo: 'balanza',
      izq: {txt: 'El mismo producto con un listing débil', peso: 2},
      der: {txt: 'El mismo producto con un listing que vende', peso: 8},
      pie: 'El listing vende antes de que vos digas una palabra',
    },
    final: ['Antes de inventar otro producto...', '...arreglá cómo estás vendiendo el que ya tenés.'],
  },
  // 08 -- (12 meses, datos)
  {
    slug: 'caso-08',
    foto: 'patryk.jpg',
    hook: ['Alguien probó el mismo modelo durante un año entero.', 'Sin atajos, sin trucos, sin excusas.'],
    centro: {
      tipo: 'cronologia',
      hitos: [
        {cuando: 'MES 1', que: 'Las primeras ventas, más flojas de lo que esperaba'},
        {cuando: 'MES 3', que: 'Empieza a aparecer información real, no ilusiones'},
        {cuando: 'MES 12', que: 'Ya no opina: tiene datos', acento: true},
      ],
    },
    final: ['Una semana demuestra que algo es posible.', 'Un año demuestra si de verdad funciona.'],
  },
  // 09 -- (40 packs de prompts)
  {
    slug: 'caso-09',
    foto: 'juan-londono.jpg',
    hook: ['Convirtió algo que ChatGPT hace gratis en más de 40 productos pagos.', 'Ahí está la trampa que nadie ve.'],
    centro: {
      tipo: 'lineas',
      items: [
        {txt: 'No vendió un prompt genérico', fig: 'chip'},
        {txt: 'Vendió una solución distinta para cada problema', fig: 'etiqueta'},
      ],
    },
    cifra: {tipo: 'contador', hasta: 40, prefijo: '', sufijo: '+', abajo: 'El secreto nunca fue la cantidad: fue la especificidad'},
    final: ['Un prompt genérico compite contra millones de prompts iguales.', 'Una solución específica casi no tiene competencia.'],
  },
  // 10 -- (escalera $7/$47/$97)
  {
    slug: 'caso-10',
    foto: 'imran-kabir.jpg',
    hook: ['¿Y si tu primer producto no necesitara hacerte rico?', '¿Y si su único trabajo fuera conseguirte el primer comprador?'],
    centro: {
      tipo: 'cronologia',
      hitos: [
        {cuando: '$7', que: 'Tu primer comprador'},
        {cuando: '$47', que: 'Ya sabés qué le falta'},
        {cuando: '$97', que: 'La solución completa', acento: true},
      ],
    },
    final: ['El primer dólar no demuestra que encontraste un negocio.', 'Demuestra que alguien, al fin, estuvo dispuesto a pagarte.'],
  },
  // 11 -- (producto especifico)
  {
    slug: 'caso-11',
    foto: 'matt-par.jpg',
    hook: ['Este producto parece demasiado chico para ser un negocio.', 'Por eso funciona.'],
    centro: {
      tipo: 'balanza',
      izq: {txt: 'Un producto pensado para todo el mundo', peso: 3},
      der: {txt: 'Un problema específico, bien resuelto', peso: 8},
      pie: 'La especificidad no te achica: te posiciona',
    },
    final: ['El mercado más grande no siempre es el más interesante.', 'A veces la plata está en el problema chico que nadie quiere resolver.'],
  },
  // 12 -- (error de la IA: saturacion)
  {
    slug: 'caso-12',
    foto: 'chase-reiner.jpg',
    hook: ['Hay un problema con vender productos hechos con IA.', 'Ahora cualquiera puede hacerlo. Cualquiera.'],
    centro: {
      tipo: 'antesDespues',
      antes: {rotulo: 'ANTES', txt: 'Producir era la barrera'},
      despues: {rotulo: 'AHORA', txt: 'Producir ya es gratis. Ahora la ventaja es saber elegir'},
    },
    final: ['La IA bajó el costo de crear a cero.', 'La única pregunta que queda es quién crea algo que valga la pena.'],
  },
  // 13 -- (una pregunta -> negocio)
  {
    slug: 'caso-13',
    foto: 'isabella-kotsias.jpg',
    hook: ['Una sola pregunta de un cliente vale más que 100 horas inventando un producto de la nada.'],
    centro: {
      tipo: 'diagrama',
      d: {
        nodos: [
          {fig: 'mensaje', rotulo: 'PREGUNTA', x: 0.5, y: 0.13, tam: 140, t: 0.2},
          {fig: 'lupa', rotulo: 'INVESTIGACIÓN', x: 0.5, y: 0.34, tam: 140, t: 1.3},
          {fig: 'notebook', rotulo: 'PRODUCTO', x: 0.5, y: 0.55, tam: 140, t: 2.4},
          {fig: 'carpeta', rotulo: 'COLECCIÓN', x: 0.5, y: 0.76, tam: 140, t: 3.5},
          {fig: 'edificio', rotulo: 'NEGOCIO', x: 0.5, y: 0.94, tam: 140, t: 4.6, acento: true},
        ],
        flechas: flechaCadena(5),
      },
    },
    final: ['El primer cliente no solo te paga.', 'Te puede regalar la idea de tu próximo producto.'],
  },
  // 14 -- (orden equivocado vs correcto)
  {
    slug: 'caso-14',
    foto: 'helena-di-biase.jpg',
    hook: ['El error más caro de este negocio:', 'pasar 30 días creando algo que nadie iba a comprar.'],
    centro: {
      tipo: 'antesDespues',
      antes: {rotulo: 'ORDEN EQUIVOCADO', txt: '30 días creando, 0 ventas'},
      despues: {rotulo: 'ORDEN CORRECTO', txt: 'Buscar demanda. Recién ahí crear'},
    },
    final: ['No construyas para ver si hay demanda.', 'Encontrá la demanda primero. Después construí.'],
  },
  // 15 -- ($300k, ecosistema)
  {
    slug: 'caso-15',
    foto: 'cara-torchia.jpg',
    hook: ['Superó los $300.000 vendiendo productos digitales.', 'Y no fue con un solo producto: mirá todo lo que armó detrás.'],
    centro: {
      tipo: 'lineas',
      items: [
        {txt: 'Ebooks', fig: 'documento'},
        {txt: 'Mini-apps', fig: 'telefono'},
        {txt: 'Shopify', fig: 'carrito'},
        {txt: 'Automatizaciones con IA', fig: 'chip'},
      ],
    },
    cifra: {tipo: 'contador', arriba: 'El resultado', hasta: 300000, sufijo: '+', abajo: 'No un producto: una escalera de valor'},
    cifraDinero: true,
    final: ['El objetivo nunca fue vender una sola cosa.', 'Fue construir un sistema donde cada venta empuja a la siguiente.'],
  },
  // 16 -- (1.500 productos = sistema)
  {
    slug: 'caso-16',
    foto: 'fabian-noguera.jpg',
    hook: ['1.500 productos.', '¿Cuánto trabajo imaginás? Casi seguro que estás exagerando.'],
    centro: {
      tipo: 'lineas',
      items: [
        {txt: 'Una categoría', fig: 'carpeta'},
        {txt: 'Una audiencia', fig: 'gente'},
        {txt: 'Variaciones y bundles', fig: 'etiqueta'},
      ],
    },
    cifra: {tipo: 'contador', arriba: 'No son 1.500 ideas distintas', hasta: 1500, prefijo: '', sufijo: '+', abajo: 'Es una idea, multiplicada en variaciones'},
    final: ['Escalar no siempre significa trabajar más.', 'A veces significa encontrar qué parte de tu trabajo se puede repetir sola.'],
  },
  // 17 -- (producto que nadie queria)
  {
    slug: 'caso-17',
    clip: 'comercio-00.mp4',
    hook: ['Este producto parecía una idea horrible.', 'Tan específico que nadie lo iba a comprar. Eso pensaban.'],
    centro: {
      tipo: 'balanza',
      izq: {txt: 'Producto mediocre para millones', peso: 3},
      der: {txt: 'Solución excelente para pocos', peso: 8},
      pie: 'No necesitás que millones lo quieran',
    },
    final: ['Un producto mediocre para millones vende menos...', '...que una solución excelente para un grupo chico que sí lo necesita.'],
  },
  // 18 -- (la fabrica de productos)
  {
    slug: 'caso-18',
    clip: 'taller-00.mp4',
    hook: ['Imaginate una fábrica que convierte una idea en producto en horas.', 'No meses. Horas.'],
    centro: {
      tipo: 'diagrama',
      d: {
        nodos: [
          {fig: 'chip', rotulo: 'IDEA + IA', x: 0.5, y: 0.13, tam: 140, t: 0.2},
          {fig: 'notebook', rotulo: 'PRODUCTO', x: 0.5, y: 0.34, tam: 140, t: 1.3},
          {fig: 'nube', rotulo: 'LANDING', x: 0.5, y: 0.55, tam: 140, t: 2.4},
          {fig: 'cohete', rotulo: 'TRÁFICO', x: 0.5, y: 0.76, tam: 140, t: 3.5},
          {fig: 'billete', rotulo: 'VENTA', x: 0.5, y: 0.94, tam: 140, t: 4.6, acento: true},
        ],
        flechas: flechaCadena(5),
      },
    },
    final: ['Producir rápido una mala idea solo te hace fracasar más rápido.', 'La fábrica de verdad es la que sabe qué merece ser producido.'],
  },
  // 19 -- (20 personas, 20 modelos -- meta resumen)
  {
    slug: 'caso-19',
    hook: ['Analizamos a gente que hace dinero con productos digitales.', 'Casi ninguno lo hace de la misma forma.'],
    centro: {
      tipo: 'lineas',
      items: [
        {txt: 'Etsy', fig: 'etiqueta'},
        {txt: 'Hotmart', fig: 'billete'},
        {txt: 'Shopify', fig: 'carrito'},
        {txt: 'Cursos', fig: 'notebook'},
        {txt: 'IA', fig: 'chip'},
        {txt: 'Afiliación', fig: 'nube'},
      ],
    },
    final: ['No hay un único camino. Hay un proceso.', 'Probar. Medir. Aprender. Repetir. Ese es el verdadero secreto.'],
  },
  // 20 -- (el juego completo -- cierre de la serie)
  {
    slug: 'caso-20',
    hook: ['Si empezara de cero mañana...', 'no empezaría creando un producto.'],
    centro: {
      tipo: 'diagrama',
      d: {
        nodos: [
          {fig: 'lupa', rotulo: 'PROBLEMA', x: 0.5, y: 0.13, tam: 140, t: 0.2, acento: true},
          {fig: 'mapa', rotulo: 'MERCADO', x: 0.5, y: 0.34, tam: 140, t: 1.3},
          {fig: 'notebook', rotulo: 'PRODUCTO MÍNIMO', x: 0.5, y: 0.55, tam: 140, t: 2.4},
          {fig: 'cohete', rotulo: 'TRÁFICO', x: 0.5, y: 0.76, tam: 140, t: 3.5},
          {fig: 'billete', rotulo: 'ESCALA', x: 0.5, y: 0.94, tam: 140, t: 4.6, acento: true},
        ],
        flechas: flechaCadena(5),
      },
    },
    final: ['El objetivo nunca fue crear cien productos.', 'Era encontrar UNO que mereciera convertirse en cien.'],
  },
];
