import {CasoConfig} from './CasoGenerico';

// DATOS DE LA SERIE (casos 2 a 20)
//
// Contenido condensado a partir del guion que dio el operador para
// cada video -- se recorta a las lineas mas fuertes (libertad de
// formato que el operador dio explicitamente) pero sin inventar
// ningun numero: cada cifra que aparece es la misma que trajo el
// guion original.
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
    hook: ['Dejó un trabajo de $50.000 al año.', '4 meses después, una tienda facturó $175.194.'],
    hookDinero: true,
    centro: {
      tipo: 'lineas',
      items: [
        {txt: 'Qué producto atraía', fig: 'lupa'},
        {txt: 'Qué diseño funcionaba', fig: 'ojo'},
        {txt: 'Qué precio tenía sentido', fig: 'etiqueta'},
        {txt: 'Qué imagen conseguía clics', fig: 'foco'},
      ],
    },
    cifra: {tipo: 'cifraSeCae', arriba: 'De esos $175.194 facturados', de: 'Ganancia real', a: '$48.000', abajo: 'Esa diferencia es la que importa'},
    cifraDinero: true,
    final: ['Facturar no es ganar.', 'Los números importan cuando entendés qué parte del sistema produce dinero.'],
  },
  // 03 -- (ebook, 15/30 dias)
  {
    slug: 'caso-03',
    foto: 'nicolas-gomez.jpg',
    hook: ['Generó $4.699 en 15 días vendiendo un producto digital.', 'Y lo hizo desde Latinoamérica.'],
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
    cifra: {tipo: 'cifraSeCae', arriba: 'A los 15 días', de: '$4.699', a: '$6.116 a los 30 días', abajo: 'El PDF no era la máquina: era todo lo de alrededor'},
    cifraDinero: true,
    final: ['Crear un PDF puede ser fácil.', 'Conseguir que alguien saque la tarjeta es otra historia.'],
  },
  // 04 -- ($35k, un producto)
  {
    slug: 'caso-04',
    foto: 'joan-carreno.jpg',
    hook: ['Facturó más de $35.000 con un solo producto digital.', 'Pero mirá cómo llegó hasta ahí.'],
    hookDinero: true,
    centro: {
      tipo: 'lineas',
      items: [
        {txt: 'Conocimiento convertido en oferta', fig: 'notebook'},
        {txt: 'Contenido alrededor del problema', fig: 'mensaje'},
        {txt: 'El contenido atrae gente', fig: 'gente'},
        {txt: 'Se vende una y otra vez', fig: 'billete'},
      ],
    },
    cifra: {tipo: 'contador', arriba: 'Facturación con un solo producto', hasta: 35000, sufijo: '+', abajo: 'Costo de reproducirlo: casi cero'},
    cifraDinero: true,
    final: ['Bajo costo de reproducción no significa ventas automáticas.', 'La batalla es conseguir atención y convertirla.'],
  },
  // 05 -- (2 socios, IA + infraestructura, $1M/6 meses)
  {
    slug: 'caso-05',
    foto: 'denise-encinas.jpg',
    hook: ['Construyeron un negocio de productos digitales.', 'Después construyeron una IA para escalarlo.'],
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
    cifra: {tipo: 'contador', arriba: 'En sus primeros 6 meses', hasta: 1000000, sufijo: '+', abajo: 'Ya no vendían un producto: vendían la infraestructura'},
    cifraDinero: true,
    final: ['Hay una diferencia enorme entre usar una herramienta...', '...y construir una alrededor de un problema que ya sabés que existe.'],
  },
  // 06 -- (arte IA en Etsy, $7k/mes, equipo)
  {
    slug: 'caso-06',
    foto: 'jai-rodriguez.jpg',
    hook: ['Más de $7.000 de beneficio en un mes vendiendo imágenes con IA.', 'Pero no lo hizo solo.'],
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
    cifra: {tipo: 'contador', arriba: 'Beneficio en un solo mes', hasta: 7000, sufijo: '+', abajo: 'El equipo, no la IA sola, fue lo que escaló'},
    cifraDinero: true,
    final: ['Una herramienta puede ayudarte a crear.', 'Un sistema es lo que permite escalar.'],
  },
  // 07 -- (Canva, $12k, listing)
  {
    slug: 'caso-07',
    foto: 'kiana-bonollo.jpg',
    hook: ['Convirtió plantillas de Canva en casi $12.000 de revenue.', 'Pero estás mirando la parte equivocada.'],
    hookDinero: true,
    centro: {
      tipo: 'balanza',
      izq: {txt: 'Mismo producto, listing débil', peso: 2},
      der: {txt: 'Mismo producto, listing optimizado', peso: 8},
      pie: 'El listing vende antes que vos',
    },
    final: ['Antes de crear otro producto...', '...mejorá cómo estás vendiendo el que ya tenés.'],
  },
  // 08 -- (12 meses, datos)
  {
    slug: 'caso-08',
    foto: 'patryk.jpg',
    hook: ['Alguien probó el mismo modelo durante un año entero.', 'Sin atajos.'],
    centro: {
      tipo: 'cronologia',
      hitos: [
        {cuando: 'MES 1', que: 'Primeras ventas'},
        {cuando: 'MES 3', que: 'Empieza a aparecer información real'},
        {cuando: 'MES 12', que: 'Ya no tenés una opinión: tenés datos', acento: true},
      ],
    },
    final: ['Una semana puede demostrar que algo es posible.', 'Un año puede demostrar cómo funciona realmente.'],
  },
  // 09 -- (40 packs de prompts)
  {
    slug: 'caso-09',
    foto: 'juan-londono.jpg',
    hook: ['Convirtió algo que podés generar con ChatGPT en más de 40 productos.', 'Ahí está el detalle.'],
    centro: {
      tipo: 'lineas',
      items: [
        {txt: 'No un prompt genérico', fig: 'chip'},
        {txt: 'Una solución para cada problema', fig: 'etiqueta'},
      ],
    },
    cifra: {tipo: 'contador', hasta: 40, prefijo: '', sufijo: '+', abajo: 'El secreto no era la cantidad: era la especificidad'},
    final: ['Un prompt genérico compite con millones.', 'Una solución específica compite con muchos menos.'],
  },
  // 10 -- (escalera $7/$47/$97)
  {
    slug: 'caso-10',
    foto: 'imran-kabir.jpg',
    hook: ['¿Y si tu primer producto no necesitara hacerte rico?', '¿Y si su trabajo fuera conseguirte tu primer comprador?'],
    centro: {
      tipo: 'cronologia',
      hitos: [
        {cuando: '$7', que: 'Tu primer comprador'},
        {cuando: '$47', que: 'Ya sabés qué le falta'},
        {cuando: '$97', que: 'La solución completa', acento: true},
      ],
    },
    final: ['El primer dólar no demuestra que encontraste un negocio.', 'Demuestra que alguien estuvo dispuesto a pagarte.'],
  },
  // 11 -- (producto especifico)
  {
    slug: 'caso-11',
    foto: 'matt-par.jpg',
    hook: ['Este tipo de producto parece demasiado chico para ser un negocio.', 'Por eso puede funcionar.'],
    centro: {
      tipo: 'balanza',
      izq: {txt: 'Un producto para todo el mundo', peso: 3},
      der: {txt: 'Un problema específico, bien resuelto', peso: 8},
      pie: 'La especificidad no es debilidad: es posicionamiento',
    },
    final: ['El mercado más grande no siempre es el más interesante.', 'A veces el dinero está en un problema chico que nadie resuelve bien.'],
  },
  // 12 -- (error de la IA: saturacion)
  {
    slug: 'caso-12',
    foto: 'chase-reiner.jpg',
    hook: ['Hay un problema con vender productos hechos con IA.', 'Ahora cualquiera puede hacerlo.'],
    centro: {
      tipo: 'antesDespues',
      antes: {rotulo: 'ANTES', txt: 'Producir era la barrera'},
      despues: {rotulo: 'AHORA', txt: 'Producir es gratis. Elegir es la ventaja'},
    },
    final: ['La IA bajó el costo de crear.', 'Ahora la pregunta es quién crea algo que realmente importe.'],
  },
  // 13 -- (una pregunta -> negocio)
  {
    slug: 'caso-13',
    foto: 'isabella-kotsias.jpg',
    hook: ['Una pregunta de un cliente puede valer más que 100 horas inventando un producto.'],
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
    final: ['El primer cliente no solo te da dinero.', 'Puede darte la idea del próximo producto.'],
  },
  // 14 -- (orden equivocado vs correcto)
  {
    slug: 'caso-14',
    foto: 'helena-di-biase.jpg',
    hook: ['El error más caro de este negocio:', 'crear 30 días y descubrir que nadie quería comprarlo.'],
    centro: {
      tipo: 'antesDespues',
      antes: {rotulo: 'ORDEN EQUIVOCADO', txt: '30 días creando, 0 ventas'},
      despues: {rotulo: 'ORDEN CORRECTO', txt: 'Buscar demanda. Recién ahí crear'},
    },
    final: ['No construyas para descubrir si existe demanda.', 'Descubrí la demanda. Después construí.'],
  },
  // 15 -- ($300k, ecosistema)
  {
    slug: 'caso-15',
    foto: 'cara-torchia.jpg',
    hook: ['Superó los $300.000 vendiendo productos digitales.', 'Mirá la cantidad de modelos que hay detrás.'],
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
    final: ['El objetivo no es vender una cosa.', 'Es construir un sistema donde cada venta te acerque a la siguiente.'],
  },
  // 16 -- (1.500 productos = sistema)
  {
    slug: 'caso-16',
    foto: 'fabian-noguera.jpg',
    hook: ['1.500 productos.', '¿Cuánto trabajo imaginás? Probablemente demasiado.'],
    centro: {
      tipo: 'lineas',
      items: [
        {txt: 'Una categoría', fig: 'carpeta'},
        {txt: 'Una audiencia', fig: 'gente'},
        {txt: 'Variaciones y bundles', fig: 'etiqueta'},
      ],
    },
    cifra: {tipo: 'contador', arriba: 'No son 1.500 ideas distintas', hasta: 1500, prefijo: '', sufijo: '+', abajo: 'Es una idea, multiplicada en variaciones'},
    final: ['Escalar no siempre significa trabajar más.', 'A veces significa encontrar qué partes de tu trabajo pueden ser sistemas.'],
  },
  // 17 -- (producto que nadie queria)
  {
    slug: 'caso-17',
    clip: 'comercio-00.mp4',
    hook: ['Este producto parecía una idea horrible.', 'Tan específico que nadie pensaría en venderlo.'],
    centro: {
      tipo: 'balanza',
      izq: {txt: 'Producto mediocre para millones', peso: 3},
      der: {txt: 'Solución excelente para pocos', peso: 8},
      pie: 'No necesitás que millones lo quieran',
    },
    final: ['Un producto mediocre para millones puede vender menos...', '...que una solución excelente para un grupo pequeño.'],
  },
  // 18 -- (la fabrica de productos)
  {
    slug: 'caso-18',
    clip: 'taller-00.mp4',
    hook: ['Imaginá una fábrica que convierte una idea en un producto digital en horas.', 'No meses. Horas.'],
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
    final: ['Producir rápido una mala idea solo te permite fracasar más rápido.', 'La fábrica real es la que aprende qué merece ser producido.'],
  },
  // 19 -- (20 personas, 20 modelos -- meta resumen)
  {
    slug: 'caso-19',
    hook: ['Analizamos personas que hacen dinero con productos digitales.', 'Casi ninguna lo hace igual.'],
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
    final: ['No existe un único camino. Existe un proceso.', 'Probar. Medir. Aprender. Repetir.'],
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
    final: ['El objetivo nunca fue crear cien productos.', 'Era encontrar uno que mereciera convertirse en cien.'],
  },
];
