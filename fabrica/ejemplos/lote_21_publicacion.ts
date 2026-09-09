/**
 * Metadata de PUBLICACION del lote de 21 videos (lote_21_datos.ts trae
 * el guion/escenas, no esto) -- mismo patron que CarruselLote en
 * fabrica/carrusel/lote_42_datos.ts: hashtags, descripcion corta
 * (caption del post), categoria (color/musica) y el gancho de CTA
 * ("seguime y te muestro...", a diferencia de los carruseles que usan
 * "comenta X"). Se agrega separado para no tocar lote_21_datos.ts
 * (guion ya validado y renderizado).
 */
import type {Categoria} from '../carrusel/lote_42_datos';

export type PublicacionVideo = {
  id: string; // vNN, matchea VIDEOS[].id de lote_21_datos.ts
  hashtags: string[];
  descripcion: string;
  categoria: Categoria;
  cta: string;
};

const TAGS_BASE = ['#TallerDeActivos', '#ProductosDigitales', '#Emprendimiento', '#InfoProductos', '#DineroOnline'];

export const PUBLICACION_LOTE21: PublicacionVideo[] = [
  {id: 'v01', categoria: 'exito', cta: 'Construí tu sistema sin saber editar.',
    descripcion: 'El que más vende productos digitales no sabe ni abrir un editor de video. Esa es su ventaja.',
    hashtags: [...TAGS_BASE, '#MarketingDigital', '#IA']},
  {id: 'v02', categoria: 'exito', cta: 'Vendé sin el título de marketing.',
    descripcion: '¿Todavía "aprendiendo marketing" en 2026? Mientras vos estudiás, otros cobran.',
    hashtags: [...TAGS_BASE, '#MarketingDigital', '#VentasOnline']},
  {id: 'v03', categoria: 'exito', cta: 'Lanzá tu primera basura que vende.',
    descripcion: 'Tu primer producto digital tiene que ser una basura. Y ese es tu mayor activo.',
    hashtags: [...TAGS_BASE, '#Emprendedor', '#ProductoDigital']},
  {id: 'v04', categoria: 'alerta', cta: 'El sistema real, sin gurús.',
    descripcion: 'El 99% de los gurús te vende el curso que ellos nunca terminaron. Y vos lo sabés.',
    hashtags: [...TAGS_BASE, '#Gurus', '#SistemaDeVentas']},
  {id: 'v05', categoria: 'dinero', cta: 'Construí el activo, no el post de hoy.',
    descripcion: 'El contenido es el nuevo café de la esquina. Los activos son el edificio entero.',
    hashtags: [...TAGS_BASE, '#ActivosDigitales', '#IngresoPasivo']},
  {id: 'v06', categoria: 'exito', cta: 'Tu primera tarde puede pagar algo real.',
    descripcion: 'Una tarde. Cuatro horas. Un producto que me pagó el alquiler.',
    hashtags: [...TAGS_BASE, '#ProductoEnUnDia', '#Productividad']},
  {id: 'v07', categoria: 'alerta', cta: 'Aguantá 27 días. Después, cambia.',
    descripcion: 'La cara oculta de vender online: pantallazos que duelen y una cuenta que no miente.',
    hashtags: [...TAGS_BASE, '#RealidadEmprender', '#Persistencia']},
  {id: 'v08', categoria: 'alerta', cta: 'Usá el error. Es información, no fracaso.',
    descripcion: 'El error que me costó mil dólares y cómo lo convertí en mi mejor venta.',
    hashtags: [...TAGS_BASE, '#AprenderDelError', '#Precios']},
  {id: 'v09', categoria: 'ia', cta: 'Automatizá una vez. Cobrá siempre.',
    descripcion: 'Tres segundos de automatización, cincuenta dólares en tu bolsillo. Así se escala.',
    hashtags: [...TAGS_BASE, '#Automatizacion', '#Escalar']},
  {id: 'v10', categoria: 'dinero', cta: 'Construí algo que venda solo.',
    descripcion: 'Mientras dormías, tu activo digital trabajó. Acá la prueba, en crudo.',
    hashtags: [...TAGS_BASE, '#TrabajaMientrasDormis', '#ActivosDigitales']},
  {id: 'v11', categoria: 'ia', cta: 'Armá tu equipo de IA. Sin nómina.',
    descripcion: 'Tres IA que te ahorran dos sueldos y trabajan las veinticuatro horas.',
    hashtags: [...TAGS_BASE, '#IA', '#Herramientas']},
  {id: 'v12', categoria: 'exito', cta: 'Diseñá sin saber. La idea vende.',
    descripcion: '¿Diseñar? Yo ni sé poner un filtro. Así creo productos que se venden solos.',
    hashtags: [...TAGS_BASE, '#DiseñoSinExperiencia', '#Herramientas']},
  {id: 'v13', categoria: 'ia', cta: 'Dejá de pagar de más.',
    descripcion: 'Este sitio me hizo olvidar que los diseñadores existen. Y es gratis.',
    hashtags: [...TAGS_BASE, '#Herramientas', '#RecursoGratis']},
  {id: 'v14', categoria: 'dinero', cta: 'Armá el flujo. Después, es automático.',
    descripcion: 'Backend abierto: así configuré mi curso para que se venda mientras yo como.',
    hashtags: [...TAGS_BASE, '#Automatizacion', '#VentasOnline']},
  {id: 'v15', categoria: 'exito', cta: '5 minutos reales. Sin trucos de edición.',
    descripcion: 'Cinco minutos. De un mockup de PowerPoint a un producto que vende. Sin cortes.',
    hashtags: [...TAGS_BASE, '#ProductoEnUnDia', '#Productividad']},
  {id: 'v16', categoria: 'exito', cta: 'Ordená el caos. Ahí está tu producto.',
    descripcion: 'Abro mi caos. Organizo treinta y siete carpetas en tres. Y aparece un producto nuevo.',
    hashtags: [...TAGS_BASE, '#Organizacion', '#ProductoDigital']},
  {id: 'v17', categoria: 'alerta', cta: 'Vendé sin audiencia. El producto hace el trabajo.',
    descripcion: 'Mito uno: "necesito diez mil seguidores". Falso. Yo vendí con cero.',
    hashtags: [...TAGS_BASE, '#Mito', '#VenderSinSeguidores']},
  {id: 'v18', categoria: 'alerta', cta: 'Empezá sin serlo. El título llega después.',
    descripcion: 'Mito dos: "soy un experto". Mentira. Los que venden son los que empiezan.',
    hashtags: [...TAGS_BASE, '#Mito', '#EmprendedorPrincipiante']},
  {id: 'v19', categoria: 'alerta', cta: 'Sé visible. Con sistema, no con suerte.',
    descripcion: 'Mito tres: "el algoritmo me odia". No. Tu producto es invisible.',
    hashtags: [...TAGS_BASE, '#Mito', '#Algoritmo']},
  {id: 'v20', categoria: 'dinero', cta: 'No uses la default. Usá la que te conviene.',
    descripcion: 'Hotmart te cobra comisión y te paga a los treinta días. Acá lo que nadie te dice.',
    hashtags: [...TAGS_BASE, '#Hotmart', '#PlataformasDeVenta']},
  {id: 'v21', categoria: 'exito', cta: 'Resolvé, no alargues. Eso es lo que vende.',
    descripcion: 'Este video de cuarenta minutos me generó más ingresos que un curso de seis meses.',
    hashtags: [...TAGS_BASE, '#ContenidoQueVende', '#Cursos']},
];
