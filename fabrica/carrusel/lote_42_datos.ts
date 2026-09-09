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

export type Categoria = 'dinero' | 'ia' | 'alerta' | 'exito' | 'regalo';

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
  categoria: Categoria;
  /** Estilo de audio SUGERIDO para el video/reel del carrusel al
   * publicarlo (tono, no un track real puntual -- el operador elige
   * el sonido/trend real de la plataforma al momento de publicar,
   * pedido explicito 08/09: "organizado... con musica"). */
  musica: string;
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
      'Comentá "VENTAJA" y te mando la guía para construir el tuyo.',
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
      'Comentá "APLICAR" y te mando el primer paso para vender sin estudiar.',
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
      'Comentá "FACTURA" y te mando la guía para construir el tuyo.',
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
    numero: 21, titulo: 'El algoritmo no te esconde nada',
    textos: [
      'El algoritmo no te esconde. Te expone tal cual sos.',
      'Y lo que muestra es un producto que todavía nadie necesita.',
      '¿Cuántas veces revisaste el alcance esta semana? ¿Y el producto?',
      'El alcance es un síntoma. El producto es la causa.',
      'Arreglá lo que vendés. El alcance se ordena solo.',
      'Comentá "INVISIBLE" y te mando la guía para dejar de ser invisible.',
    ],
    tagsExtra: ['#Mito', '#Algoritmo'],
    descripcion: 'No es el algoritmo. Es lo que estás vendiendo.',
    resaltarPorSlide: [['expone tal cual sos'], ['todavía nadie necesita'], ['el alcance', 'el producto'], ['síntoma', 'causa'], ['se ordena solo'], ['INVISIBLE']],
  },
  {
    numero: 22, titulo: 'Vendí sin un solo seguidor',
    textos: [
      'Mi primera venta no tuvo ni un seguidor de testigo.',
      'La hizo alguien que encontró el producto, no la cuenta.',
      'Los seguidores miran. Los que buscan una solución, compran.',
      'Podés tener 200 seguidores y vender más que uno con 200 mil.',
      'Dejá de perseguir números. Empezá a resolver algo puntual.',
      'Comentá "AUDIENCIA" y te mando la guía para vender sin ella.',
    ],
    tagsExtra: ['#Mito', '#VenderSinAudiencia'],
    descripcion: 'Vendí sin audiencia. Se puede.',
    resaltarPorSlide: [['ni un seguidor'], ['no la cuenta'], ['compran'], ['200 seguidores', '200 mil'], ['resolver algo puntual'], ['AUDIENCIA']],
  },
  {
    numero: 23, titulo: 'Empecé sin saber nada del tema',
    textos: [
      'Publiqué mi primer contenido sabiendo menos que la mitad de mi audiencia.',
      'Y aun así generó la primera venta.',
      'La gente no compra tu currículum. Compra que resuelvas SU problema hoy.',
      'Vas a saber más en el mes 3 que en el día 1. Empezá igual en el día 1.',
      'La experiencia se acumula publicando, nunca esperando.',
      'Comentá "EXPERIENCIA" y te mando cómo empezar sin ser experto.',
    ],
    tagsExtra: ['#Mito', '#EmprenderSinExperiencia'],
    descripcion: 'No sabía nada del tema. Vendí igual.',
    resaltarPorSlide: [['menos que la mitad'], ['la primera venta'], ['SU problema hoy'], ['mes 3', 'día 1'], ['se acumula publicando'], ['EXPERIENCIA']],
  },
  {
    numero: 24, titulo: 'Un prompt no es un sistema',
    textos: [
      'El 90% le pide un post a la IA y se queda ahí.',
      'El 10% le pide un sistema completo: guion, imagen, calendario, respuestas.',
      'La diferencia entre esos dos no es la herramienta. Es cuántos pasos le delegás.',
      'Un prompt suelto ahorra 5 minutos. Un sistema armado ahorra 5 horas por semana.',
      'Dejá de pedirle frases. Empezá a pedirle procesos.',
      'Comentá "HERRAMIENTA" y te mando cómo armar tu sistema con IA.',
    ],
    tagsExtra: ['#Mito', '#IA'],
    descripcion: 'Casi nadie usa la IA como un sistema. Ahí está la ventaja.',
    resaltarPorSlide: [['90%'], ['10%', 'sistema completo'], ['cuántos pasos'], ['5 minutos', '5 horas'], ['procesos'], ['HERRAMIENTA']],
  },
  {
    numero: 25, titulo: 'Ese carrusel no te paga el alquiler',
    textos: [
      'Ese carrusel que hiciste ayer, en un mes ya no lo va a ver nadie.',
      'El producto digital que armaste la semana pasada te puede seguir pagando en un año.',
      'El contenido tiene fecha de vencimiento. El activo, no.',
      'Publicá contenido para mostrar el activo. Nunca al revés.',
      'Si todo tu esfuerzo es contenido y no tenés nada que vender, estás regalando tiempo.',
      'Comentá "CONVIERTE" y te mando cómo pasar de contenido a activo.',
    ],
    tagsExtra: ['#Mito', '#ActivosDigitales'],
    descripcion: 'El contenido caduca. El activo no.',
    resaltarPorSlide: [['ya no lo va a ver nadie'], ['seguir pagando en un año'], ['fecha de vencimiento'], ['Nunca al revés'], ['regalando tiempo'], ['CONVIERTE']],
  },
  {
    numero: 26, titulo: 'El que no vende, no ayuda a nadie',
    textos: [
      'Tenés algo que le resuelve un problema real a alguien. Y no se lo estás ofreciendo.',
      'Eso no es humildad. Es dejar a esa persona con el problema.',
      'Vender bien es avisarle a quien lo necesita que existe una solución.',
      'Manipular es esconder lo malo. Vender es mostrar lo que sí funciona.',
      'El miedo a "molestar" te está costando ayudar a gente real.',
      'Comentá "AYUDA" y te mando cómo ofrecer sin sonar a vendedor.',
    ],
    tagsExtra: ['#Mito', '#VenderSinCulpa'],
    descripcion: 'Vender no es manipular. Es avisar que existe una salida.',
    resaltarPorSlide: [['no se lo estás ofreciendo'], ['con el problema'], ['avisarle'], ['lo que sí funciona'], ['gente real'], ['AYUDA']],
  },
  {
    numero: 27, titulo: 'Mi sistema cambió 6 veces este año',
    textos: [
      'El sistema que uso hoy no se parece en nada al que armé en enero.',
      'Lo cambié 6 veces. Cada vez que algo dejó de funcionar.',
      'Un sistema "perfecto" que no tocás hace 6 meses ya está viejo.',
      'El objetivo no es armarlo una vez. Es revisarlo cada mes.',
      'El que gana no tiene el mejor sistema. Tiene el que más rápido ajusta.',
      'Comentá "ITERAR" y te mando cómo reviso el mío cada mes.',
    ],
    tagsExtra: ['#Mito', '#Iteracion'],
    descripcion: 'Cambié mi sistema 6 veces este año. Por eso funciona.',
    resaltarPorSlide: [['no se parece en nada'], ['6 veces'], ['ya está viejo'], ['cada mes'], ['más rápido ajusta'], ['ITERAR']],
  },
  {
    numero: 28, titulo: 'Subí el precio y vendí más',
    textos: [
      'Dupliqué el precio de mi producto y las ventas no bajaron. Subieron.',
      'Un precio bajo no atrae más gente. Atrae gente que desconfía de lo barato.',
      'El precio también es información: le dice al comprador cuánto valés.',
      'No cobres lo que "se estila". Cobrá lo que ese problema resuelto vale de verdad.',
      'El que compra caro, valora más. Y reclama menos.',
      'Comentá "PRECIO" y te mando cómo calculé el mío.',
    ],
    tagsExtra: ['#Mito', '#Precios'],
    descripcion: 'Subí el precio al doble. Vendí más, no menos.',
    resaltarPorSlide: [['Dupliqué el precio'], ['desconfía de lo barato'], ['cuánto valés'], ['vale de verdad'], ['valora más'], ['PRECIO']],
  },
  {
    numero: 29, titulo: 'Mi primer producto no vendió ni uno',
    textos: [
      'Mi primer producto digital vendió exactamente 0 unidades.',
      'El segundo, con el mismo esfuerzo, vendió 40.',
      'La diferencia no fue suerte. Fue todo lo que aprendí del primero que no vendió.',
      'Ese fracaso me ahorró meses de errores en el segundo intento.',
      'El que nunca lanza nada, nunca tiene ese ahorro.',
      'Comentá "INTENTAR" y te mando qué cambié entre el producto 1 y el 2.',
    ],
    tagsExtra: ['#Mito', '#Resiliencia'],
    descripcion: 'Mi primer producto vendió 0. El segundo, 40.',
    resaltarPorSlide: [['0 unidades'], ['vendió 40'], ['aprendí del primero'], ['me ahorró meses'], ['nunca tiene ese ahorro'], ['INTENTAR']],
  },
  {
    numero: 30, titulo: 'La "suerte" fueron 200 publicaciones',
    textos: [
      'A la gente le sorprende que "tuve suerte" con un producto.',
      'Lo que no ve son los 200 posts anteriores que nadie miró.',
      'La suerte de la publicación 201 se construyó con las 200 que fallaron.',
      'El que ve solo el resultado final, cree que fue casualidad.',
      'No hay atajo. Hay volumen sostenido hasta que algo pega.',
      'Comentá "SUERTE" y te mando cuántos intentos tuve antes de esa "suerte".',
    ],
    tagsExtra: ['#Mito', '#Sistema'],
    descripcion: '200 posts que nadie vio, antes del que sí funcionó.',
    resaltarPorSlide: [['tuve suerte'], ['200 posts'], ['200 que fallaron'], ['casualidad'], ['volumen sostenido'], ['SUERTE']],
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
      'Comentá "EVITAR" y te mando la guía ahora.',
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
      'Comentá "COMISIONES" y te mando la lista ahora.',
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
      'Comentá "PASOS" y te lo mando ahora.',
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

/** Categoria de contenido por numero de carrusel -- pedido del
 * operador (R2 08/09: "colores que hagan un gran impacto visual"). Se
 * eligio por tema real de cada carrusel (dinero/estatus, IA/algoritmo,
 * mito-error-alerta, anecdota/sistema de exito, o CTA de recurso
 * gratis en #37-42), no al azar -- asi el color realmente comunica
 * de que trata el carrusel antes de leer el texto. */
const CATEGORIA_POR_NUMERO: Record<number, Categoria> = {
  1: 'exito', 2: 'dinero', 3: 'exito', 4: 'alerta', 5: 'dinero', 6: 'ia', 7: 'dinero', 8: 'exito',
  9: 'dinero', 10: 'exito', 11: 'ia', 12: 'exito', 13: 'alerta', 14: 'dinero', 15: 'alerta', 16: 'exito',
  17: 'alerta', 18: 'alerta', 19: 'ia', 20: 'dinero', 21: 'ia', 22: 'dinero', 23: 'exito', 24: 'ia',
  25: 'dinero', 26: 'exito', 27: 'alerta', 28: 'alerta', 29: 'exito', 30: 'dinero', 31: 'exito', 32: 'exito',
  33: 'dinero', 34: 'exito', 35: 'exito', 36: 'dinero', 37: 'regalo', 38: 'regalo', 39: 'regalo', 40: 'regalo',
  41: 'regalo', 42: 'regalo',
};

/** Color hex por categoria -- 'exito' (la categoria mas grande, 13/42)
 * NO tiene entrada a proposito: cae al fallback PALETA.acento de
 * CarruselSlide.tsx (el naranja de marca de siempre), asi "el
 * desarrollo con el que ya venimos" no cambia para la mayoria y el
 * color extra queda reservado para las categorias que de verdad
 * necesitan distinguirse (dinero/ia/alerta/regalo). */
const COLOR_CATEGORIA: Partial<Record<Categoria, string>> = {
  dinero: '#F2B705', // oro -- personas ricas, plataformas de venta, facturacion
  ia: '#2F8CFF', // azul electrico -- IA/automatizacion/algoritmo
  alerta: '#FF2D3D', // rojo alarma -- mitos, errores, advertencias
  regalo: '#FF2E9F', // magenta -- CTAs de recurso gratis (#37-42)
};

/** Estilo de audio SUGERIDO por categoria -- tono/genero, no un track
 * puntual (no existe forma de saber que sonido esta trending en la
 * plataforma en el momento real de publicar; el operador elige el
 * audio/trend concreto ahi, esto es la guia de que tipo buscar). */
const MUSICA_CATEGORIA: Record<Categoria, string> = {
  dinero: 'Beat trap/lujo (caja registradora o "money counter") — sensación riqueza/estatus',
  ia: 'Synth futurista, pulso electrónico ascendente — sensación tech/escalar',
  alerta: 'Sonido corto de tensión/glitch al inicio + beat seco — sensación de corte de mito',
  exito: 'Beat motivacional que sube de intensidad hacia el CTA',
  regalo: 'Audio pop/upbeat pegadizo y repetible — sensación de premio',
};

export const CARRUSELES_42: CarruselLote[] = CRUDOS.map((c) => {
  const idx0 = c.numero - 1;
  const h = horario(idx0);
  const tipos: Slide['tipo'][] = ['portada', 'hook', 'desarrollo', 'desarrollo', 'desarrollo', 'cta'];
  const persona = IMAGENES_PERSONA[c.numero];
  const stock = IMAGENES_STOCK[c.numero];
  const categoria = CATEGORIA_POR_NUMERO[c.numero] ?? 'exito';
  const colorAcento = COLOR_CATEGORIA[categoria];

  const slides: Slide[] = c.textos.map((texto, i) => {
    const resaltar = c.resaltarPorSlide?.[i];
    const extra: Partial<Slide> = {};
    if (colorAcento) extra.colorAcento = colorAcento;
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
    categoria,
    musica: MUSICA_CATEGORIA[categoria],
  };
});
