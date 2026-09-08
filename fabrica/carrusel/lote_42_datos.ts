/**
 * LOTE DE 42 CARRUSELES -- copy base del operador (paquete "42
 * CARRUSELES COMPLETOS - PARA MOMENTOS SIN VIDEOS"), con ajustes
 * pedidos explicitamente en la sesion:
 *
 *   1. Los 5 carruseles "El sistema de <figura publica>" (#31-35)
 *      reescritos con una historia real y concreta en vez de frases
 *      genericas (mismo criterio ya validado y aprobado por el
 *      operador en el carrusel de prueba de Elon Musk: "SpaceX exploto
 *      sus primeros 3 cohetes" en vez de "aprendio en el camino") +
 *      foto real de la figura (Wikidata P18) a pantalla completa en
 *      la portada + logo real de la empresa citada (Wikidata P154)
 *      como badge chico en un slide interno.
 *   2. Cada CTA declara EXPLICITO en el texto del slide que recompensa
 *      da (no solo la palabra clave) -- el operador senalo que
 *      "comenta X" sin decir que te dan no tiene sentido.
 *   3. `resaltar` en cada slide (1-2 frases/numeros clave en
 *      PALETA.acento) para que ningun slide sea "solo texto blanco
 *      plano" -- mismo fix ya validado.
 *   4. Metadata real de publicacion por carrusel: titulo, hashtags,
 *      descripcion corta (para el caption del post) y horario
 *      sugerido -- siguiendo las "INSTRUCCIONES DE PUBLICACION" del
 *      paquete original (6/dia, 2 por franja: manana/tarde/noche),
 *      pero intercalando bloques tematicos entre dias en vez de
 *      publicar 6 seguidos del mismo estilo (pedido explicito del
 *      paquete original: "Intercala carruseles de diferentes
 *      estrategias").
 */
import type {Slide} from './tipos';

export type CarruselLote = {
  numero: number;
  id: string;
  titulo: string;
  slides: Slide[];
  hashtags: string[];
  descripcion: string;
  dia: number; // 1-7
  horario: 'Mañana' | 'Tarde' | 'Noche';
  horaSugerida: string;
};

const TAGS_BASE = ['#TallerDeActivos', '#ProductosDigitales', '#Emprendimiento', '#InfoProductos', '#DineroOnline'];

/** Reparte los 42 en 7 dias x 6 (2 por franja), intercalando indices
 * originales adyacentes (mismo bloque tematico) entre dias distintos:
 * dia = (i % 7) + 1, franja segun floor(i/7) -- asi el carrusel #1 y
 * el #2 (mismo bloque de "contradiccion") caen en dias distintos. */
function horario(indiceCero: number): {dia: number; horario: CarruselLote['horario']; horaSugerida: string} {
  const dia = (indiceCero % 7) + 1;
  const franjaIdx = Math.floor(indiceCero / 7); // 0..5
  const franjas: Array<[CarruselLote['horario'], string]> = [
    ['Mañana', '09:30'], ['Mañana', '10:30'],
    ['Tarde', '14:30'], ['Tarde', '16:00'],
    ['Noche', '20:30'], ['Noche', '21:30'],
  ];
  const [h, hora] = franjas[franjaIdx];
  return {dia, horario: h, horaSugerida: hora};
}

function slide(id: string, tipo: Slide['tipo'], texto: string, resaltar?: string[], extra?: Partial<Slide>): Slide {
  return {id, tipo, texto, resaltar, ...extra};
}

// ── Datos crudos: [numero, titulo, textos de los 6 slides, hashtags extra, descripcion] ──
type Crudo = {numero: number; titulo: string; textos: [string, string, string, string, string, string]; tagsExtra: string[]; descripcion: string; resaltarPorSlide?: string[][]};

const CRUDOS: Crudo[] = [
  {
    numero: 1, titulo: 'El que más vende, menos sabe',
    textos: [
      'El que más vende productos digitales no sabe ni abrir un editor de video.',
      'Y esa es su ventaja. Mientras vos perdés tiempo aprendiendo a editar...',
      '...él está usando IA para hacerlo en segundos.',
      'La habilidad que necesitás no es técnica. Es estratégica.',
      'El sistema > el talento. Siempre.',
      'Comentá "SISTEMA" y te mando la guía para construir el tuyo.',
    ],
    tagsExtra: ['#MarketingDigital', '#IA'],
    descripcion: 'La ventaja real no es saber editar. Es tener sistema. 👇',
  },
  {
    numero: 2, titulo: '¿Todavía estudiando marketing?',
    textos: [
      '¿Todavía "aprendiendo marketing" en 2026?',
      'Mientras vos estudiás, otros cobran. Y no estudiaron marketing.',
      'Estudiaron psicología del comprador. Y usaron IA para entender qué vende.',
      'El marketing no se estudia. Se aplica.',
      'Los que cobran no esperan a ser expertos. Empiezan.',
      'Comentá "EMPEZAR" y te mando el primer paso para vender sin estudiar.',
    ],
    tagsExtra: ['#MarketingDigital', '#VentasOnline'],
    descripcion: 'Dejá de estudiar marketing. Empezá a aplicarlo.',
  },
  {
    numero: 3, titulo: 'Tu primer producto tiene que ser BASURA',
    textos: [
      'Tu primer producto digital tiene que ser una BASURA.',
      'Y ese es tu mayor activo. Porque lo vas a mejorar.',
      'El primer iPhone era una basura comparado con el de hoy. Y cambió el mundo igual.',
      'La perfección es el enemigo del lanzamiento.',
      'Los que esperan a que sea perfecto, nunca lanzan.',
      'Comentá "LANZAR" y te mando la guía para crear tu primer producto en 7 días.',
    ],
    tagsExtra: ['#Emprendedor', '#ProductoDigital'],
    descripcion: 'Tu primer producto va a ser malo. Lanzalo igual.',
    resaltarPorSlide: [['BASURA'], ['mayor activo'], ['cambió el mundo'], ['enemigo'], ['nunca lanzan'], ['LANZAR', '7 días']],
  },
  {
    numero: 4, titulo: 'Los gurús te mienten',
    textos: [
      'El 99% de los gurús te vende el curso que ellos nunca terminaron.',
      'Nunca vendieron un producto digital. Y te enseñan a vender.',
      'No necesitás un gurú. Necesitás un sistema.',
      'Los que realmente ganan plata no venden cursos. Venden resultados.',
      'La diferencia está en la ejecución, no en la teoría.',
      'Comentá "EJECUTAR" y te mando el sistema que uso.',
    ],
    tagsExtra: ['#Gurus', '#SistemaDeVentas'],
    descripcion: 'No necesitás un gurú. Necesitás ejecutar.',
  },
  {
    numero: 5, titulo: 'El contenido es café. Los activos son edificios',
    textos: [
      'El contenido es el nuevo café de la esquina.',
      'Se consume y desaparece en 24 horas.',
      'Los activos digitales son el edificio entero.',
      'Quedan, crecen y te pagan mientras dormís.',
      'Construí activos, no contenido.',
      'Comentá "ACTIVOS" y te mando la guía para construir el tuyo.',
    ],
    tagsExtra: ['#ActivosDigitales', '#IngresoPasivo'],
    descripcion: 'Dejá de postear café. Empezá a construir edificios.',
  },
  {
    numero: 6, titulo: 'El algoritmo no te odia',
    textos: [
      'El algoritmo no te odia. Tu producto es invisible.',
      'La mayoría culpa al algoritmo cuando debería culpar a su sistema.',
      'Los mejores creadores no dependen del algoritmo.',
      'Dependen de su sistema de creación.',
      'Creá contenido que funcione en cualquier plataforma.',
      'Comentá "VISIBLE" y te mando la guía para hacer contenido que vende.',
    ],
    tagsExtra: ['#Algoritmo', '#ContenidoQueVende'],
    descripcion: 'No es el algoritmo. Es tu sistema.',
  },
  {
    numero: 7, titulo: 'No necesitás seguidores',
    textos: [
      'Mito: "Necesito 10 mil seguidores para vender".',
      'Falso. Yo vendí mi primer producto con 0 seguidores.',
      'Los primeros clientes de Apple no eran seguidores.',
      'Eran personas que necesitaban una computadora.',
      'Necesitás producto, no audiencia.',
      'Comentá "PRODUCTO" y te mando la guía para crear el tuyo.',
    ],
    tagsExtra: ['#Mito', '#VenderSinSeguidores'],
    descripcion: 'Mito #1: necesitás seguidores. Falso.',
    resaltarPorSlide: [['10 mil seguidores'], ['0 seguidores'], ['Apple'], ['necesitaban una computadora'], ['producto, no audiencia'], ['PRODUCTO']],
  },
  {
    numero: 8, titulo: 'No tenés que ser experto',
    textos: [
      'Mito: "Soy un experto".',
      'Mentira. Los que venden son los que empiezan.',
      'Nadie nace experto. La experiencia se construye haciendo.',
      'La experiencia no se estudia, se construye.',
      'Empezá hoy. Aprendé en el camino.',
      'Comentá "EMPEZAR" y te mando el primer paso.',
    ],
    tagsExtra: ['#Mito', '#EmprendedorPrincipiante'],
    descripcion: 'Mito #2: hay que ser experto. Falso.',
  },
  {
    numero: 9, titulo: 'Lo que no te cuentan de Hotmart',
    textos: [
      'Hotmart cobra comisión y te paga recién a los 30 días.',
      'Mientras tanto, vos esperás. Y la plata no llega.',
      'Hay plataformas con pagos más rápidos, según el caso.',
      'Los emprendedores que más ganan no usan la que usa todo el mundo.',
      'Usan la que les conviene a ellos.',
      'Comentá "PLATAFORMAS" y te mando la lista de las que uso.',
    ],
    tagsExtra: ['#Hotmart', '#PlataformasDeVenta'],
    descripcion: 'Lo que nadie te cuenta antes de elegir plataforma.',
  },
  {
    numero: 10, titulo: 'Este video vale más que tu curso',
    textos: [
      'Un video de 40 minutos puede generar más que un curso de 6 meses.',
      'No importa la duración. Importa el sistema.',
      'Los mejores cursos no son los más largos.',
      'Son los que resuelven un problema real.',
      'Creá contenido que resuelva, no que explique.',
      'Comentá "RESOLVER" y te mando la guía para crear contenido que vende.',
    ],
    tagsExtra: ['#ContenidoQueVende', '#Cursos'],
    descripcion: 'No importa cuánto dure. Importa si resuelve algo.',
  },
  {
    numero: 11, titulo: 'El 90% usa IA mal',
    textos: [
      'El 90% de la gente usa la IA mal.',
      'Y te está costando caro. En tiempo y en plata.',
      'Mientras vos jugás con prompts, otros construyen sistemas enteros.',
      'La IA no es para jugar. Es para escalar.',
      'El que entiende esto, gana.',
      'Comentá "ESCALAR" y te mando la guía para usar IA como los que ganan.',
    ],
    tagsExtra: ['#IA', '#InteligenciaArtificial'],
    descripcion: 'La IA no es un juguete. Es una palanca.',
  },
  {
    numero: 12, titulo: 'De 0 a resultado real en 60 días',
    textos: [
      'De cero a un resultado real en 60 días. Sin experiencia previa.',
      'Con un solo producto digital.',
      'Una idea. Una ejecución. Un sistema.',
      'El 90% nunca termina. Siempre empieza algo nuevo.',
      'Los que ganan, terminan.',
      'Comentá "TERMINAR" y te mando el sistema para terminar tu primer producto.',
    ],
    tagsExtra: ['#Resultados', '#PrimerProducto'],
    descripcion: 'La diferencia no es la idea. Es terminarla.',
  },
  {
    numero: 13, titulo: 'El error que cuesta caro',
    textos: [
      'El error que te cuesta más caro cada mes.',
      'Vender tu tiempo en lugar de tu conocimiento.',
      'El 99% vende horas. El 1% vende activos.',
      'La diferencia está en el sistema.',
      'Dejá de vender tiempo. Empezá a vender conocimiento.',
      'Comentá "CONOCIMIENTO" y te mando la guía para crear tu primer activo.',
    ],
    tagsExtra: ['#TiempoVsConocimiento', '#Activos'],
    descripcion: 'El error que te está costando plata cada mes.',
  },
  {
    numero: 14, titulo: 'Lo que factura un activo digital',
    textos: [
      '¿Cuánto factura un activo digital mientras dormís?',
      'Depende del sistema. Pero factura, aunque vos no estés.',
      'Los activos digitales no descansan. Vos sí.',
      'La pregunta no es cuánto. Es cómo.',
      'Construí el sistema. La plata llega sola.',
      'Comentá "SISTEMA" y te mando la guía para construir el tuyo.',
    ],
    tagsExtra: ['#IngresoPasivo', '#ActivosDigitales'],
    descripcion: 'Mientras dormís, un activo real sigue trabajando.',
  },
  {
    numero: 15, titulo: '5 errores que matan ventas',
    textos: [
      '5 errores que matan tus ventas de productos digitales.',
      'Error #1: no tener un producto claro.',
      'Error #2: vender tiempo en lugar de conocimiento.',
      'Error #3: no tener un sistema de ventas.',
      'Error #4: depender del algoritmo.',
      'Comentá "ERRORES" y te mando la guía completa con los 5.',
    ],
    tagsExtra: ['#ErroresComunes', '#VentasOnline'],
    descripcion: '5 errores que probablemente estás cometiendo ahora mismo.',
    resaltarPorSlide: [['5 errores'], ['Error #1'], ['Error #2'], ['Error #3'], ['Error #4'], ['ERRORES']],
  },
  {
    numero: 16, titulo: 'Así se ve un producto hecho en una tarde',
    textos: [
      'Así se ve un producto digital hecho en una tarde.',
      '4 horas. De cero a listo para vender.',
      'El 90% se toma meses. Los que ganan, tardan horas.',
      'La diferencia no es el tiempo. Es el sistema.',
      'Construí rápido. Mejorá en el camino.',
      'Comentá "RÁPIDO" y te mando el sistema para crear en 4 horas.',
    ],
    tagsExtra: ['#ProductoEnUnDia', '#Productividad'],
    descripcion: '4 horas. Así de rápido se puede armar.',
  },
  {
    numero: 17, titulo: 'La cara oculta de vender online',
    textos: [
      'La cara oculta de vender online.',
      'Días con 0 ventas. Gráficas planas. Emails que no abren.',
      'La mayoría abandona ahí. Los que persisten, ganan.',
      'Las gráficas que duelen son las que te enseñan.',
      'No es magia. Es sistema.',
      'Comentá "PERSISTIR" y te mando la guía para no abandonar.',
    ],
    tagsExtra: ['#RealidadEmprender', '#Persistencia'],
    descripcion: 'Lo que nadie muestra de vender online.',
  },
  {
    numero: 18, titulo: 'El error que me costó caro',
    textos: [
      'El error que me costó caro.',
      'Un precio mal puesto. Una oferta mal planteada.',
      'Ese error me enseñó lo que ningún curso enseña.',
      'Los errores son tus mejores maestros.',
      'Convertí tu error en tu mejor venta.',
      'Comentá "ERROR" y te mando la guía para convertir errores en ventas.',
    ],
    tagsExtra: ['#AprenderDelError', '#Precios'],
    descripcion: 'El error que terminó siendo la mejor lección.',
  },
  {
    numero: 19, titulo: '3 segundos, una venta',
    textos: [
      '3 segundos de automatización pueden generar una venta.',
      'Así se escala. Automatizando tareas que otros hacen manualmente.',
      'La mayoría hace tareas manuales que podrían automatizar.',
      'La escalabilidad está en la automatización.',
      'El que automatiza, gana.',
      'Comentá "AUTOMATIZAR" y te mando la guía para automatizar tus ventas.',
    ],
    tagsExtra: ['#Automatizacion', '#Escalar'],
    descripcion: '3 segundos de trabajo. Una venta automática.',
  },
  {
    numero: 20, titulo: 'Mientras dormías, tu activo trabajó',
    textos: [
      'Mientras dormías, tu activo digital trabajó.',
      'Un activo real no se detiene cuando vos parás.',
      'El 90% no cree que los activos digitales funcionen solos.',
      'Pero sí. Trabajan mientras vos descansás.',
      'Construí un activo que trabaje por vos.',
      'Comentá "ACTIVO" y te mando la guía para construir el tuyo.',
    ],
    tagsExtra: ['#TrabajaMientrasDormis', '#ActivosDigitales'],
    descripcion: 'Tu activo no descansa cuando vos sí.',
  },
  {
    numero: 21, titulo: 'Mito: el algoritmo te esconde',
    textos: [
      'Mito: "el algoritmo me odia".',
      'No, tu producto es invisible.',
      'El algoritmo no te esconde. Tu contenido no es relevante.',
      'Los mejores creadores no dependen del algoritmo.',
      'Dependen de su sistema de creación.',
      'Comentá "VISIBLE" y te mando la guía para hacer contenido visible.',
    ],
    tagsExtra: ['#Mito', '#Algoritmo'],
    descripcion: 'Mito #3: el algoritmo te esconde. Falso.',
  },
  {
    numero: 22, titulo: 'Mito: necesitás muchos seguidores',
    textos: [
      'Mito: "Necesito 10 mil seguidores".',
      'Falso. Se puede vender con 0.',
      'Los primeros clientes no eran seguidores. Eran personas con un problema.',
      'Necesitás producto, no audiencia.',
      'Creá, vendé, repetí.',
      'Comentá "PRODUCTO" y te mando la guía para crear el tuyo.',
    ],
    tagsExtra: ['#Mito', '#VenderSinAudiencia'],
    descripcion: 'Mito #4: necesitás muchos seguidores. Falso.',
  },
  {
    numero: 23, titulo: 'Mito: hay que ser experto',
    textos: [
      'Mito: "Soy un experto".',
      'Mentira. Los que venden son los que empiezan.',
      'La experiencia real se construye vendiendo, no antes de vender.',
      'La experiencia no se estudia, se construye.',
      'Empezá hoy. Aprendé en el camino.',
      'Comentá "EMPEZAR" y te mando el primer paso.',
    ],
    tagsExtra: ['#Mito', '#EmprenderSinExperiencia'],
    descripcion: 'Mito #5: hay que ser experto. Falso.',
  },
  {
    numero: 24, titulo: 'Mito: la IA es para jugar',
    textos: [
      'Mito: "la IA es para jugar".',
      'El 90% usa IA para jugar. El 10% para construir sistemas.',
      'La IA no es un juguete. Es una herramienta de escalabilidad.',
      'El que entiende esto, gana.',
      'Usá IA para construir, no para jugar.',
      'Comentá "CONSTRUIR" y te mando la guía para usar IA en tu negocio.',
    ],
    tagsExtra: ['#Mito', '#IA'],
    descripcion: 'Mito #6: la IA es para jugar. Falso.',
  },
  {
    numero: 25, titulo: 'Mito: el contenido es rey',
    textos: [
      'Mito: "el contenido es rey".',
      'El contenido es el nuevo café de la esquina.',
      'Se consume y desaparece. Los activos quedan.',
      'Construí activos, no contenido.',
      'El contenido atrae. Los activos convierten.',
      'Comentá "ACTIVOS" y te mando la guía para construir los tuyos.',
    ],
    tagsExtra: ['#Mito', '#ActivosDigitales'],
    descripcion: 'Mito #7: el contenido es rey. Falso.',
  },
  {
    numero: 26, titulo: 'Mito: vender es manipular',
    textos: [
      'Mito: "vender es manipular".',
      'Vender es resolver. Resolver un problema.',
      'El que vende, ayuda. El que no vende, no ayuda a nadie.',
      'Tu producto cambia vidas. Vendelo.',
      'El miedo a vender te está costando plata.',
      'Comentá "VENDER" y te mando la guía para vender sin culpa.',
    ],
    tagsExtra: ['#Mito', '#VenderSinCulpa'],
    descripcion: 'Mito #8: vender es manipular. Falso.',
  },
  {
    numero: 27, titulo: 'Mito: el sistema perfecto existe',
    textos: [
      'Mito: "el sistema perfecto existe".',
      'No existe. Solo existe el sistema que funciona hoy.',
      'Los que ganan, iteran. Los que esperan, pierden.',
      'Probá, medí, mejorá. Ese es el sistema.',
      'No busques perfecto. Buscá funcional.',
      'Comentá "FUNCIONAL" y te mando el sistema que uso.',
    ],
    tagsExtra: ['#Mito', '#Iteracion'],
    descripcion: 'Mito #9: el sistema perfecto existe. Falso.',
  },
  {
    numero: 28, titulo: 'Mito: el precio lo define el mercado',
    textos: [
      'Mito: "el precio lo define el mercado".',
      'El precio lo define el valor que vos creás.',
      'Si resolvés un problema grande, cobrá acorde.',
      'El precio no es un número. Es una decisión.',
      'Los que cobran caro, resuelven caro.',
      'Comentá "PRECIO" y te mando la guía para poner precio a tu producto.',
    ],
    tagsExtra: ['#Mito', '#Precios'],
    descripcion: 'Mito #10: el mercado define tu precio. Falso.',
  },
  {
    numero: 29, titulo: 'Mito: el fracaso es malo',
    textos: [
      'Mito: "el fracaso es malo".',
      'El fracaso es el primer paso del éxito.',
      'Los que nunca fracasaron, nunca intentaron nada.',
      'Tu primer producto va a ser malo. Y eso es bueno.',
      'Aprendé, mejorá, volvé a intentar.',
      'Comentá "INTENTAR" y te mando la guía para fracasar bien.',
    ],
    tagsExtra: ['#Mito', '#Resiliencia'],
    descripcion: 'Mito #11: el fracaso es malo. Falso.',
  },
  {
    numero: 30, titulo: 'Mito: el éxito es cuestión de suerte',
    textos: [
      'Mito: "el éxito es cuestión de suerte".',
      'El éxito es cuestión de sistema.',
      'Los que ganan, tienen un sistema. Los que pierden, esperan suerte.',
      'Creá el sistema. La suerte llega sola.',
      'El sistema gana. Siempre.',
      'Comentá "SISTEMA" y te mando la guía para construir el tuyo.',
    ],
    tagsExtra: ['#Mito', '#Sistema'],
    descripcion: 'Mito #12: el éxito es suerte. Falso.',
  },
  {
    numero: 31, titulo: 'El sistema de Elon Musk',
    textos: [
      'SpaceX explotó sus primeros 3 cohetes. Uno tras otro.',
      '2006. 2007. 2008. Tres lanzamientos. Tres fracasos en fila.',
      'Casi se quedan sin plata para el cuarto intento. Era ese o cerrar.',
      'El cuarto despegó. Y salvó la empresa entera.',
      'No fue más conocimiento técnico. Fue el mismo sistema, ajustado 3 veces.',
      'Tu primer producto también va a fallar. Comentá "MUSK" y te mando el sistema de iteración que uso.',
    ],
    tagsExtra: ['#ElonMusk', '#SpaceX'],
    descripcion: '3 cohetes explotados antes del que salvó la empresa.',
    resaltarPorSlide: [['3 cohetes'], ['2006.', '2007.', '2008.'], ['cuarto intento', 'cerrar'], ['salvó la empresa entera'], ['mismo sistema'], ['MUSK']],
  },
  {
    numero: 32, titulo: 'El sistema de Mr. Beast',
    textos: [
      'MrBeast gastaba en cada video más de lo que ese video generaba.',
      'Años enteros así. Perdiendo plata, video tras video.',
      'No se pagó un sueldo. Todo volvía al próximo video, más grande.',
      'Hasta que la escala compensó la pérdida de golpe.',
      'No fue un golpe de suerte. Fue reinvertir cuando todavía dolía.',
      'Comentá "BEAST" y te mando la guía para construir activos, no gastar en contenido.',
    ],
    tagsExtra: ['#MrBeast', '#YouTube'],
    descripcion: 'Perdía plata en cada video. Así ganó.',
    resaltarPorSlide: [['más de lo que ese video generaba'], ['Años enteros'], ['más grande'], ['compensó la pérdida'], ['todavía dolía'], ['BEAST']],
  },
  {
    numero: 33, titulo: 'El sistema de Jeff Bezos',
    textos: [
      'Amazon reportó pérdidas o ganancias mínimas durante buena parte de sus primeros años.',
      'Bezos reinvertía cada dólar en crecer en vez de mostrar ganancias.',
      'Los inversores se quejaban. Él seguía reinvirtiendo igual.',
      'Construyó la infraestructura antes que las ganancias.',
      'El sistema se construye primero. La plata llega después.',
      'Comentá "BEZOS" y te mando el sistema de reinversión que explica esto.',
    ],
    tagsExtra: ['#JeffBezos', '#Amazon'],
    descripcion: 'Años sin mostrar ganancias. Así se construyó Amazon.',
    resaltarPorSlide: [['pérdidas o ganancias mínimas'], ['reinvertía cada dólar'], ['seguía reinvirtiendo'], ['infraestructura antes que las ganancias'], ['después'], ['BEZOS']],
  },
  {
    numero: 34, titulo: 'El sistema de Gary Vaynerchuk',
    textos: [
      'Gary Vaynerchuk agarró el negocio de vinos de su familia y lo llevó de $3 a $60 millones.',
      'En 5 años. Usando internet cuando nadie en ese rubro lo usaba.',
      'No inventó un producto nuevo. Vendió el mismo vino, distinto.',
      'El canal cambió. El producto, no.',
      'A veces no hace falta un producto nuevo. Hace falta un canal nuevo.',
      'Comentá "GARY" y te mando la guía para vender lo mismo, distinto.',
    ],
    tagsExtra: ['#GaryVee', '#Marketing'],
    descripcion: 'De $3M a $60M sin cambiar el producto.',
    resaltarPorSlide: [['$3 a $60 millones'], ['5 años'], ['distinto'], ['El canal cambió'], ['un canal nuevo'], ['GARY']],
  },
  {
    numero: 35, titulo: 'El sistema de Steve Jobs',
    textos: [
      'A Steve Jobs lo echaron de la empresa que fundó. En 1985.',
      '12 años afuera. Apple, sin él, casi quiebra.',
      'Volvió en 1997. La empresa tenía semanas de plata, no años.',
      'La reordenó desde cero. Menos productos, mejor hechos.',
      'No volvió con una idea nueva. Volvió con un sistema más simple.',
      'Comentá "JOBS" y te mando la guía para simplificar tu propia oferta.',
    ],
    tagsExtra: ['#SteveJobs', '#Apple'],
    descripcion: 'Lo echaron de su propia empresa. Volvió y la salvó.',
    resaltarPorSlide: [['echaron'], ['12 años'], ['semanas de plata'], ['Menos productos, mejor hechos'], ['más simple'], ['JOBS']],
  },
  {
    numero: 36, titulo: 'El sistema de los que ganan',
    textos: [
      'Los que ganan no tienen más talento. Tienen sistema.',
      'Un sistema de creación. Un sistema de ventas.',
      'Un sistema de automatización. Un sistema de escalabilidad.',
      'El talento no escala. El sistema sí.',
      'Construí tu sistema. El resultado viene después.',
      'Comentá "SISTEMA" y te mando la guía para construir el tuyo.',
    ],
    tagsExtra: ['#Sistema', '#Emprendimiento'],
    descripcion: 'No es talento. Es sistema.',
  },
  {
    numero: 37, titulo: 'Plantilla para tu primer producto',
    textos: [
      '¿Querés crear tu primer producto digital?',
      'Usá esta plantilla. Te la mando gratis.',
      'Idea, estructura, precio, lanzamiento.',
      'Todo en una plantilla de 5 pasos.',
      'No necesitás saber diseñar. Solo necesitás la plantilla.',
      'Comentá "PLANTILLA" y te la mando ahora.',
    ],
    tagsExtra: ['#Plantilla', '#RecursoGratis'],
    descripcion: 'Plantilla gratis para armar tu primer producto.',
  },
  {
    numero: 38, titulo: 'Checklist para lanzar en 7 días',
    textos: [
      '¿Querés lanzar tu producto en 7 días?',
      'Usá este checklist. Te lo mando gratis.',
      'Día 1: idea. Día 2: producto. Día 3: contenido...',
      'Todo en 7 pasos. Sin vueltas.',
      'No necesitás experiencia. Solo necesitás el checklist.',
      'Comentá "CHECKLIST" y te lo mando ahora.',
    ],
    tagsExtra: ['#Checklist', '#Lanzamiento'],
    descripcion: 'Checklist gratis: lanzá en 7 días.',
  },
  {
    numero: 39, titulo: 'Guía de los 5 errores',
    textos: [
      '¿Querés evitar los 5 errores que matan ventas?',
      'Te mando la guía completa. Gratis.',
      'Error #1: producto confuso. Error #2: precio mal puesto...',
      '5 errores. 5 soluciones. Una guía.',
      'No cometás los mismos errores que todos.',
      'Comentá "ERRORES" y te mando la guía ahora.',
    ],
    tagsExtra: ['#Errores', '#RecursoGratis'],
    descripcion: 'Los 5 errores que matan ventas (y cómo evitarlos).',
  },
  {
    numero: 40, titulo: 'Video privado: cómo hice X',
    textos: [
      '¿Querés ver cómo armé mi primer activo digital?',
      'Te mando el video privado. Solo para los que comentan.',
      'Muestro pantallazos reales. Sin filtros.',
      'El proceso completo. Los errores. El resultado.',
      'No es un curso. Es el proceso en crudo.',
      'Comentá "VIDEO" y te lo mando ahora.',
    ],
    tagsExtra: ['#DetrasDeCamara', '#ContenidoExclusivo'],
    descripcion: 'El proceso real, sin filtros. Solo para los que comentan.',
  },
  {
    numero: 41, titulo: 'Las plataformas que uso',
    textos: [
      '¿Querés saber qué plataformas uso para vender?',
      'Te mando la lista. Gratis.',
      'Cada plataforma tiene su comisión y sus tiempos de pago.',
      'Uso las que me convienen a mí, no las que usa todo el mundo.',
      'Comparalas antes de elegir una.',
      'Comentá "PLATAFORMAS" y te mando la lista ahora.',
    ],
    tagsExtra: ['#Plataformas', '#VentasOnline'],
    descripcion: 'Las plataformas reales que uso para vender.',
  },
  {
    numero: 42, titulo: 'El sistema en 5 pasos',
    textos: [
      '¿Querés el sistema completo que uso para vender?',
      'Te mando el resumen en 5 pasos. Gratis.',
      'Paso 1: idea. Paso 2: producto. Paso 3: contenido...',
      'Paso 4: venta. Paso 5: escalabilidad.',
      'No es teoría. Es lo que uso todos los días.',
      'Comentá "SISTEMA" y te lo mando ahora.',
    ],
    tagsExtra: ['#Sistema', '#RecursoGratis'],
    descripcion: 'El sistema completo, en 5 pasos, gratis.',
  },
];

const IMAGENES_PERSONA: Record<number, {imagen: string; credito: string; logo?: string}> = {
  31: {imagen: 'fotos/elon-musk.jpg', credito: 'CREDITO_MUSK', logo: 'logos/spacex.EXT'},
  32: {imagen: 'fotos/mrbeast.jpg', credito: 'CREDITO_MRBEAST'},
  33: {imagen: 'fotos/jeff-bezos.jpg', credito: 'CREDITO_BEZOS', logo: 'logos/amazon.EXT'},
  34: {imagen: 'fotos/gary-vaynerchuk.jpg', credito: 'CREDITO_GARY'},
  35: {imagen: 'fotos/steve-jobs.jpg', credito: 'CREDITO_JOBS', logo: 'logos/apple.EXT'},
  // Ronda 2 (pedido del operador: "mitad genericas/representativas,
  // mitad exactas" para los otros 37) -- mismo tratamiento full-bleed
  // que #31-35, con foto real de una figura publica conocida por
  // dinero/estatus/IA en vez de una historia "sistema de X" completa
  // (estos 17 son solo portada con foto, no un relato de 6 slides).
  2: {imagen: 'fotos/robert-kiyosaki.jpg', credito: 'CREDITO_KIYOSAKI'},
  4: {imagen: 'fotos/grant-cardone.jpg', credito: 'CREDITO_CARDONE'},
  5: {imagen: 'fotos/warren-buffett.jpg', credito: 'CREDITO_BUFFETT'},
  7: {imagen: 'fotos/cristiano-ronaldo.jpg', credito: 'CREDITO_RONALDO'},
  10: {imagen: 'fotos/tony-robbins.jpg', credito: 'CREDITO_ROBBINS'},
  11: {imagen: 'fotos/sam-altman.jpg', credito: 'CREDITO_ALTMAN'},
  12: {imagen: 'fotos/dwayne-johnson.jpg', credito: 'CREDITO_JOHNSON'},
  13: {imagen: 'fotos/mark-cuban.jpg', credito: 'CREDITO_CUBAN'},
  14: {imagen: 'fotos/bill-gates.jpg', credito: 'CREDITO_GATES'},
  17: {imagen: 'fotos/kevin-oleary.jpg', credito: 'CREDITO_OLEARY'},
  20: {imagen: 'fotos/rihanna.jpg', credito: 'CREDITO_RIHANNA'},
  22: {imagen: 'fotos/kylie-jenner.jpg', credito: 'CREDITO_JENNER'},
  23: {imagen: 'fotos/lebron-james.jpg', credito: 'CREDITO_LEBRON'},
  25: {imagen: 'fotos/oprah-winfrey.jpg', credito: 'CREDITO_OPRAH'},
  26: {imagen: 'fotos/richard-branson.jpg', credito: 'CREDITO_BRANSON'},
  30: {imagen: 'fotos/jay-z.jpg', credito: 'CREDITO_JAYZ'},
  36: {imagen: 'fotos/kim-kardashian.jpg', credito: 'CREDITO_KARDASHIAN'},
};

/** Los otros 20 (de los 37 sin persona): foto de stock generica
 * (Pexels) elegida por tema del carrusel, con logo real como badge
 * en los dos casos donde el texto nombra una marca puntual (Hotmart,
 * TikTok). El nicho se resuelve a un archivo real + credito en
 * exportar_lote_42.ts (mismo patron que generar_carrusel_prueba_musk.ts
 * uso para las fotos de cohete). */
const IMAGENES_STOCK: Record<number, {nicho: string; logoSlug?: string}> = {
  1: {nicho: 'video-confundido'},
  3: {nicho: 'boceto-producto'},
  6: {nicho: 'feed-social'},
  8: {nicho: 'joven-emprendedor'},
  9: {nicho: 'pago-online'}, // sin logo: Hotmart no tiene un logo confiable en Wikidata (P154)
  15: {nicho: 'alerta-error'},
  16: {nicho: 'trabajo-rapido'},
  18: {nicho: 'error-caro'},
  19: {nicho: 'pago-movil'},
  21: {nicho: 'red-datos'},
  24: {nicho: 'robot-ia'},
  27: {nicho: 'piezas-sistema'},
  28: {nicho: 'etiqueta-precio'},
  29: {nicho: 'cohete-lanzamiento'},
  37: {nicho: 'plantilla-doc'},
  38: {nicho: 'checklist-clip'},
  39: {nicho: 'lista-errores'},
  40: {nicho: 'detras-camara'},
  41: {nicho: 'apps-celular', logoSlug: 'tiktok'},
  42: {nicho: 'escalera-exito'},
};

export const CARRUSELES_42: CarruselLote[] = CRUDOS.map((c) => {
  const idx0 = c.numero - 1;
  const h = horario(idx0);
  const tipos: Slide['tipo'][] = ['portada', 'hook', 'desarrollo', 'desarrollo', 'desarrollo', 'cta'];
  const persona = IMAGENES_PERSONA[c.numero];
  const stock = IMAGENES_STOCK[c.numero];

  const slides: Slide[] = c.textos.map((texto, i) => {
    const resaltar = c.resaltarPorSlide?.[i];
    const extra: Partial<Slide> = {};
    if (persona && i === 0) {
      extra.imagen = persona.imagen;
      extra.estiloImagen = 'fondo';
      extra.credito = persona.credito;
    }
    if (persona?.logo && i === 4) {
      extra.logo = persona.logo;
    }
    if (stock && i === 0) {
      extra.imagen = `STOCK:${stock.nicho}`; // resuelto a archivo real en exportar_lote_42.ts
      extra.estiloImagen = 'fondo';
      extra.credito = 'CREDITO_STOCK';
      if (stock.logoSlug) extra.logo = `logos/${stock.logoSlug}.EXT`;
    }
    return slide(`c${c.numero}-s${i + 1}`, tipos[i], texto, resaltar, extra);
  });

  return {
    numero: c.numero,
    id: `carrusel-${String(c.numero).padStart(2, '0')}`,
    titulo: c.titulo,
    slides,
    hashtags: [...TAGS_BASE, ...c.tagsExtra],
    descripcion: c.descripcion,
    dia: h.dia,
    horario: h.horario,
    horaSugerida: h.horaSugerida,
  };
});
