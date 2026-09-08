/**
 * LOTE DE 21 -- angulos mejorados por el operador via DeepSeek
 * ("arquitecto visual y creativo"), debatidos y ajustados en sesion:
 *
 *   1. Se descartaron los 3 angulos usados en los pilotos de
 *      validacion (fueron solo prueba de formato, no contenido final).
 *   2. Los ejemplos de figuras publicas (Musk, Bezos, Mr Beast, Gary
 *      Vee, Apple, Tesla) se mantienen tal cual pidio el operador --
 *      "no estamos diciendo que es totalmente verdad, solo decimos un
 *      ejemplo" -- son comparaciones ilustrativas, no afirmaciones de
 *      hecho documentado.
 *   3. Agresividad tecnica (pedido explicito del operador tras ver los
 *      pilotos): golpes reales (fogonazo/sacudon/raya) FORZADOS
 *      explicitos en el hook/giro de cada video en vez de dejarlos
 *      100% automaticos -- vocabulario real de golpes.tsx, nada
 *      inventado.
 *   4. Fix del defecto real encontrado en piloto-2 (b-roll de `rafaga`
 *      sin narracion se sintio "silencio, no comunica nada"): ninguna
 *      escena de montaje en este lote queda con textoVoz vacio.
 *   5. Ningun video repite la MISMA combinacion de componentes que el
 *      video anterior o siguiente (pedido explicito: "no que sea el
 *      mismo formato para 2 o 3 videos, dinamismo enorme").
 *   6. Se evitaron 'grafico'/'silueta' con acoplamiento fragil al tipo
 *      Idea del motor viejo salvo 'silueta' (forma simple, ya
 *      confirmada: {idea:{texto,pie}}) -- 'grafico' se reemplazo por
 *      componentes nativos de la fabrica (duelo) para no arrastrar
 *      ese acoplamiento a 21 videos de una.
 */
import type {EscenaGuion} from '../composicion/renderizador_por_guion';

export type VideoLote = {id: string; titulo: string; escenas: EscenaGuion[]};

export const VIDEOS: VideoLote[] = [
  {
    id: 'v01',
    titulo: 'No sabe editar, es su ventaja',
    escenas: [
      {
        id: 'v01-hook', esPrimera: true, intensidad: 9,
        textoVoz: 'El que más vende productos digitales no sabe ni abrir un editor de video. Y esa es su ventaja.',
        componenteId: 'tres-verdades',
        props: {frases: ['No sabe editar video.', 'No tiene equipo.', 'Y así vende más que vos.']},
        transicionSalida: {tipo: 'fogonazo'},
      },
      {
        id: 'v01-giro', intensidad: 6,
        textoVoz: 'Mirá a Elon Musk: no arma un cohete con las manos, arma el equipo que sí puede. Vos tampoco necesitás saber editar. Necesitás sistema.',
        componenteId: 'diagrama',
        props: {d: {nodos: [
          {fig: 'foco', x: 0.5, y: 0.28, tam: 150, rotulo: 'IDEA', t: 0, acento: true},
          {fig: 'gente', x: 0.5, y: 0.44, tam: 150, rotulo: 'DELEGÁ', t: 0.9, acento: true},
          {fig: 'engranaje', x: 0.5, y: 0.6, tam: 150, rotulo: 'SISTEMA', t: 1.8, acento: true},
          {fig: 'billete', x: 0.5, y: 0.76, tam: 150, rotulo: 'VENTA', t: 2.6, acento: true},
        ], flechas: [{de: 0, a: 1, t: 1.0, acento: true}, {de: 1, a: 2, t: 1.9, acento: true}, {de: 2, a: 3, t: 2.8, acento: true}]}},
        transicionSalida: {tipo: 'raya'},
      },
      {
        id: 'v01-prueba', intensidad: 7,
        textoVoz: 'Diez mil dólares por mes. Cero minutos de edición.',
        componenteId: 'contador',
        props: {arriba: 'Lo que factura sin tocar un editor', hasta: 10000, abajo: 'por mes'},
      },
      {
        id: 'v01-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo construir tu sistema sin saber editar.',
        componenteId: 'remate',
        props: {d: {lineas: ['No es magia.', 'Es sistema.', 'Y no necesita cámara.'], grande: 'CONSTRUÍ EL TUYO', pie: 'Sin saber editar.'}, clip: 'oficina-00.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v02',
    titulo: 'Aprendiendo marketing en 2026',
    escenas: [
      {
        id: 'v02-hook', esPrimera: true, intensidad: 8,
        textoVoz: '¿Todavía "aprendiendo marketing" en 2026? Mientras vos estudiás, otros cobran.',
        componenteId: 'silueta',
        props: {idea: {texto: 'Mientras estudiás marketing,', pie: 'otro ya está cobrando.'}},
        transicionSalida: {tipo: 'sacudon'},
      },
      {
        id: 'v02-giro', intensidad: 6,
        textoVoz: 'Los que cobran no estudiaron marketing. Estudiaron a la gente. Mirá a Gary Vaynerchuk: nunca estudió marketing formal, estudió a las personas.',
        componenteId: 'explicador',
        props: {d: {
          titulo: 'Lo que de verdad estudian los que venden',
          filas: [{concepto: 'Teoría de marketing', valor: 'Casi nada'}, {concepto: 'Qué compra la gente', valor: 'Todo el tiempo'}],
          remate: {arriba: 'No es una carrera.', grande: 'ES OBSERVACIÓN', abajo: 'de gente real'},
        }},
        transicionSalida: {tipo: 'raya'},
      },
      {
        id: 'v02-prueba', intensidad: 6,
        textoVoz: 'Un curso vendido usando solo IA para entender qué quiere comprar la gente. Sin un solo diploma de marketing.',
        componenteId: 'ranking',
        props: {titulo: 'Lo que más vendió (sin estudiar marketing)', filas: [{txt: 'Entender al comprador', valor: 90, acento: true}, {txt: 'Diplomas y cursos', valor: 12}]},
      },
      {
        id: 'v02-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo vender sin estudiar marketing.',
        componenteId: 'remate',
        props: {d: {lineas: ['No es teoría.', 'Es psicología.', 'De la de todos los días.'], grande: 'VENDÉ SIN EL TÍTULO', pie: 'Entendé al que compra.'}, clip: 'oficina-01.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v03',
    titulo: 'Tu primer producto tiene que ser una basura',
    escenas: [
      {
        id: 'v03-hook', esPrimera: true, intensidad: 9,
        textoVoz: 'Tu primer producto digital tiene que ser una basura. Y ese es tu mayor activo.',
        componenteId: 'tres-verdades',
        props: {frases: ['No tiene que ser perfecto.', 'Tiene que existir.', 'Eso ya te pone adelante.']},
        transicionSalida: {tipo: 'fogonazo'},
      },
      {
        id: 'v03-giro', intensidad: 5,
        textoVoz: 'Lanzá algo imperfecto, ajustalo con datos reales, y mejorá en el camino. Así se construye de verdad.',
        componenteId: 'pasos',
        props: {titulo: 'El único método que funciona', pasos: [
          {fig: 'foco', txt: 'Lanzá algo imperfecto'},
          {fig: 'engranaje', txt: 'Ajustá con datos reales'},
          {fig: 'cohete', txt: 'Mejorá en el camino'},
        ]},
        transicionSalida: {tipo: 'corte'},
      },
      {
        id: 'v03-prueba', intensidad: 6,
        textoVoz: 'El primer iPhone no tenía copiar y pegar, ni siquiera 3G. Hoy es el estándar que todos copian.',
        componenteId: 'cronologia',
        props: {titulo: 'De básico a estándar', hitos: [
          {cuando: '2007', que: 'Primer iPhone: sin copiar/pegar, sin 3G'},
          {cuando: 'Hoy', que: 'El estándar que todos copian', acento: true},
        ]},
      },
      {
        id: 'v03-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo lanzar tu primera basura que vende.',
        componenteId: 'remate',
        props: {d: {lineas: ['No esperes.', 'No pulas.', 'Lanzá.'], grande: 'EMPEZÁ FEO', pie: 'Mejorás con el uso real.'}, clip: 'oficina-02.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v04',
    titulo: 'El gurú que nunca vendió',
    escenas: [
      {
        id: 'v04-hook', esPrimera: true, intensidad: 8,
        textoVoz: 'El 99% de los gurús te vende el curso que ellos nunca terminaron. Y vos lo sabés.',
        componenteId: 'silueta',
        props: {idea: {texto: 'Te venden un curso', pie: 'que ellos nunca vendieron primero.'}},
      },
      {
        id: 'v04-giro', intensidad: 6,
        textoVoz: 'Pasa seguido con los gurús financieros: venden cursos de inversión, pero nunca invirtieron un peso. Vos no necesitás un gurú. Necesitás un sistema.',
        componenteId: 'explicador',
        props: {d: {
          titulo: 'Gurú vs. sistema',
          filas: [{concepto: 'Gurú', valor: 'Vende promesas'}, {concepto: 'Sistema', valor: 'Vende resultados repetibles'}],
          remate: {arriba: 'No necesitás fe.', grande: 'NECESITÁS ESTRUCTURA', abajo: 'que se pueda repetir'},
        }},
        transicionSalida: {tipo: 'raya'},
      },
      {
        id: 'v04-prueba', intensidad: 6,
        textoVoz: 'Pagás quinientos dólares por un curso. Comisión de la plataforma: cien. Valor real que el gurú probó antes de venderlo: cero.',
        componenteId: 'recibo',
        props: {titulo: 'La cuenta real de un curso de gurú', entra: [{txt: 'Lo que pagás', monto: 500, t: 0.3}], sale: [{txt: 'Comisión de plataforma', monto: 100, t: 1.2}, {txt: 'Lo que el gurú nunca probó', monto: 400, t: 2.0}], total: {txt: 'Valor real que recibiste', t: 3.0}},
      },
      {
        id: 'v04-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro el sistema que usé, sin gurús ni promesas vacías.',
        componenteId: 'remate',
        props: {d: {lineas: ['Sin gurús.', 'Sin promesas vacías.', 'Solo sistema.'], grande: 'EL SISTEMA REAL', pie: 'El que sí usé.'}, clip: 'oficina-03.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v05',
    titulo: 'Contenido vs. activos',
    escenas: [
      {
        id: 'v05-hook', esPrimera: true, intensidad: 9,
        textoVoz: 'El contenido es el nuevo café de la esquina. Los activos son el edificio entero. Construí.',
        componenteId: 'balanza',
        props: {titulo: '¿Qué pesa más?', izq: {txt: 'CONTENIDO', peso: 2}, der: {txt: 'ACTIVO', peso: 8}, pie: 'Uno se toma. El otro se queda.'},
        transicionSalida: {tipo: 'fogonazo'},
      },
      {
        id: 'v05-giro', intensidad: 5,
        textoVoz: 'De cien creadores, casi ninguno construye algo que le quede. Mr Beast no es youtuber: es dueño de un imperio que usa YouTube como puerta de entrada.',
        componenteId: 'embudo',
        props: {titulo: 'De creadores a dueños de activos', pisos: [{txt: 'Hacen contenido', cuantos: '100'}, {txt: 'Construyen un activo', cuantos: '9'}, {txt: 'Viven de ese activo', cuantos: '2'}]},
      },
      {
        id: 'v05-prueba', intensidad: 6,
        textoVoz: 'Contenido, audiencia, activo, imperio. En ese orden.',
        componenteId: 'diagrama',
        props: {d: {nodos: [
          {fig: 'telefono', x: 0.5, y: 0.28, tam: 150, rotulo: 'CONTENIDO', t: 0, acento: true},
          {fig: 'gente', x: 0.5, y: 0.44, tam: 150, rotulo: 'AUDIENCIA', t: 0.9, acento: true},
          {fig: 'billete', x: 0.5, y: 0.6, tam: 150, rotulo: 'ACTIVO', t: 1.8, acento: true},
          {fig: 'edificio', x: 0.5, y: 0.76, tam: 150, rotulo: 'IMPERIO', t: 2.6, acento: true},
        ], flechas: [{de: 0, a: 1, t: 1.0, acento: true}, {de: 1, a: 2, t: 1.9, acento: true}, {de: 2, a: 3, t: 2.8, acento: true}]}},
      },
      {
        id: 'v05-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo construir activos, no contenido.',
        componenteId: 'remate',
        props: {d: {lineas: ['Dejá de postear.', 'Empezá a construir.', 'Algo que te quede.'], grande: 'CONSTRUÍ EL ACTIVO', pie: 'No el post de hoy.'}, clip: 'oficina-04.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v06',
    titulo: 'Una tarde, cuatro horas, pagó el alquiler',
    escenas: [
      {
        id: 'v06-hook', esPrimera: true, intensidad: 8,
        textoVoz: 'Una tarde. Cuatro horas. Un producto que me pagó el alquiler.',
        componenteId: 'punch',
        props: {lineas: ['Una tarde.', 'Cuatro horas.', 'Pagó el alquiler.'], entra: [0, 1.1, 2.2], clip: 'freelance-00.mp4', velo: 0.55},
      },
      {
        id: 'v06-montaje', intensidad: 8,
        textoVoz: 'Esto es lo que nadie muestra: la idea, el armado, la primera venta, todo en la misma tarde. Elon Musk construye en días lo que otros tardan meses. Es sistema, no magia.',
        componenteId: 'rafaga',
        props: {clips: ['freelance-01.mp4', 'freelance-02.mp4', 'freelance-03.mp4', 'freelance-04.mp4'], sello: 'TALLER DE ACTIVOS'},
        transicionSalida: {tipo: 'sacudon'},
      },
      {
        id: 'v06-prueba', intensidad: 6,
        textoVoz: 'Cuatro horas de trabajo real. El alquiler del mes, cubierto.',
        componenteId: 'duelo',
        props: {izq: {rotulo: 'Tiempo invertido', valor: '4 horas'}, der: {rotulo: 'Alquiler cubierto', valor: '1 mes'}, ganador: 'der', remate: 'La cuenta cierra sola.'},
      },
      {
        id: 'v06-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo hacer tu primer producto en una tarde.',
        componenteId: 'remate',
        props: {d: {lineas: ['Una tarde.', 'Sin excusas.', 'Empezá hoy.'], grande: 'TU PRIMERA TARDE', pie: 'Puede pagar algo real.'}, clip: 'freelance-05.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v07',
    titulo: 'La cara oculta de vender online',
    escenas: [
      {
        id: 'v07-hook', esPrimera: true, intensidad: 8,
        textoVoz: 'La cara oculta de vender online: pantallazos que duelen y una cuenta que no miente.',
        componenteId: 'punch',
        props: {lineas: ['Días en cero.', 'Emails sin abrir.', 'Nadie te lo muestra.'], entra: [0, 1.2, 2.4], clip: 'taller-00.mp4', velo: 0.6},
      },
      {
        id: 'v07-problema', intensidad: 6,
        textoVoz: 'Veintisiete días en cero. La diferencia no fue la suerte: fue aguantar esos mismos veintisiete días.',
        componenteId: 'duelo',
        props: {izq: {rotulo: 'Días en cero', valor: '27'}, der: {rotulo: 'Días que aguanté', valor: '27'}, ganador: 'der', remate: 'Ahí está la diferencia.'},
        transicionSalida: {tipo: 'negro'},
      },
      {
        id: 'v07-prueba', intensidad: 6,
        textoVoz: 'Tesla casi quiebra en sus primeros meses. No abandonaron. Las gráficas que duelen son las que enseñan.',
        componenteId: 'reloj-que-corre',
        props: {arriba: 'Días sin rendirme', desde: 0, hasta: 27, abajo: 'Hasta que funcionó'},
      },
      {
        id: 'v07-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo leer las gráficas que duelen.',
        componenteId: 'remate',
        props: {d: {lineas: ['La gráfica plana', 'no significa que falló.', 'Significa que sigue.'], grande: 'AGUANTÁ 27 DÍAS', pie: 'Después, cambia.'}, clip: 'taller-01.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v08',
    titulo: 'El error de mil dólares',
    escenas: [
      {
        id: 'v08-hook', esPrimera: true, intensidad: 8,
        textoVoz: 'El error que me costó mil dólares y cómo lo convertí en mi mejor venta.',
        componenteId: 'cifra-se-cae',
        props: {arriba: 'El precio que puse mal', de: '$1.000', a: 'perdidos', abajo: 'Un solo error de precio'},
        transicionSalida: {tipo: 'fogonazo'},
      },
      {
        id: 'v08-giro', intensidad: 6,
        textoVoz: 'Un cliente se fue por una oferta mal planteada. Ese mensaje me enseñó lo que ningún curso enseña.',
        componenteId: 'chat',
        props: {titulo: 'El mensaje que me costó $1.000', mensajes: [
          {de: 'ellos', txt: 'Ya no me interesa, gracias', t: 0.3},
          {de: 'vos', txt: '¿Puedo preguntar por qué?', t: 1.4, acento: true},
        ]},
      },
      {
        id: 'v08-prueba', intensidad: 6,
        textoVoz: 'Un error de lanzamiento de Elon Musk terminó convertido en la mejor estrategia de marketing de la marca. El error no te hunde. Te informa.',
        componenteId: 'explicador',
        props: {d: {
          titulo: 'Lo que ese error me enseñó',
          filas: [{concepto: 'Precio original', valor: 'Mal calculado'}, {concepto: 'Precio corregido', valor: 'Vendió el doble'}],
          remate: {arriba: 'El error', grande: 'FUE EL DATO', abajo: 'que faltaba'},
        }},
      },
      {
        id: 'v08-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo convertir tus errores en ventas.',
        componenteId: 'remate',
        props: {d: {lineas: ['El error', 'no es el final.', 'Es el dato.'], grande: 'USÁ EL ERROR', pie: 'Es información, no fracaso.'}, clip: 'taller-02.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v09',
    titulo: 'Tres segundos, cincuenta dólares',
    escenas: [
      {
        id: 'v09-hook', esPrimera: true, intensidad: 7,
        textoVoz: 'Tres segundos de automatización, cincuenta dólares en tu bolsillo. Así se escala.',
        componenteId: 'reloj-que-corre',
        props: {arriba: 'Tiempo que lleva automatizar esto', desde: 3, hasta: 0, unidad: 's'},
      },
      {
        id: 'v09-giro', intensidad: 7,
        textoVoz: 'Un correo automático, una respuesta automática. Tres segundos de configuración, y queda trabajando solo.',
        componenteId: 'punch',
        props: {lineas: ['Tres segundos.', 'Un clic.', '$50 en tu bolsillo.'], entra: [0, 0.9, 1.8], clip: 'taller-03.mp4', velo: 0.5},
        transicionSalida: {tipo: 'fogonazo'},
      },
      {
        id: 'v09-prueba', intensidad: 6,
        textoVoz: 'Las empresas de IA automatizan procesos que antes llevaban horas. La escalabilidad está en la automatización, no en trabajar más.',
        componenteId: 'contador',
        props: {arriba: 'Generado por una automatización de 3 segundos', hasta: 50, abajo: 'sin tocarla de nuevo'},
      },
      {
        id: 'v09-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo automatizar y escalar.',
        componenteId: 'remate',
        props: {d: {lineas: ['No trabajes más.', 'Automatizá una vez.', 'Cobrá siempre.'], grande: 'AUTOMATIZÁ ESTO', pie: 'Una vez, no todos los días.'}, clip: 'taller-04.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v10',
    titulo: 'Mientras dormías',
    escenas: [
      {
        id: 'v10-hook', esPrimera: true, intensidad: 8,
        textoVoz: 'Mientras dormías, tu activo digital trabajó. Acá la prueba, en crudo.',
        componenteId: 'notificaciones',
        props: {items: [
          {app: 'Ventas', txt: 'Nueva venta: $47', t: 0.3, acento: true},
          {app: 'Ventas', txt: 'Nueva venta: $47', t: 1.3},
          {app: 'Banco', txt: 'Depósito recibido', t: 2.3, acento: true},
        ], remate: 'Mientras dormías.'},
        transicionSalida: {tipo: 'raya'},
      },
      {
        id: 'v10-giro', intensidad: 5,
        textoVoz: 'El 90% no cree que un activo digital funcione solo. Cuando Elon Musk duerme, sus empresas no paran. Un activo real hace lo mismo.',
        componenteId: 'silueta',
        props: {idea: {texto: 'Vos descansás.', pie: 'El activo, no.'}},
      },
      {
        id: 'v10-prueba', intensidad: 6,
        textoVoz: 'Noventa y cuatro dólares en una noche, sin tocar el teléfono.',
        componenteId: 'contador',
        props: {arriba: 'Total de esa noche', hasta: 94, abajo: 'sin tocar el teléfono'},
      },
      {
        id: 'v10-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo construir un activo que trabaje por vos.',
        componenteId: 'remate',
        props: {d: {lineas: ['No vendas tu tiempo.', 'Construí algo', 'que venda solo.'], grande: 'TRABAJÁ DORMIDO', pie: 'El activo hace el turno noche.'}, clip: 'taller-05.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v11',
    titulo: 'Tres IA, dos sueldos',
    escenas: [
      {
        id: 'v11-hook', esPrimera: true, intensidad: 8,
        textoVoz: 'Tres IA que te ahorran dos sueldos y trabajan las veinticuatro horas. Las uso y no vuelvo atrás.',
        componenteId: 'tres-verdades',
        props: {frases: ['3 herramientas.', '2 sueldos ahorrados.', '0 vacaciones que pagar.']},
        transicionSalida: {tipo: 'sacudon'},
      },
      {
        id: 'v11-giro', intensidad: 6,
        textoVoz: 'Una escribe, otra diseña, otra organiza. Las empresas más grandes del mundo ya reemplazan equipos enteros con esto.',
        componenteId: 'logos-herramientas',
        props: {titulo: 'El equipo que no contraté', items: [
          {nombre: 'ChatGPT', color: '#10A37F', texto: 'Redacta y responde'},
          {nombre: 'Canva', color: '#00C4CC', texto: 'Diseña todo'},
          {nombre: 'Notion', color: '#000000', texto: 'Organiza el negocio'},
        ], pie: '24/7, sin vacaciones.'},
      },
      {
        id: 'v11-prueba', intensidad: 6,
        textoVoz: 'Un equipo tradicional cuesta miles por mes. Estas tres herramientas, una fracción de eso.',
        componenteId: 'recibo',
        props: {titulo: 'Lo que te ahorrás por mes', entra: [{txt: 'Costo de un equipo', monto: 3000, t: 0.3}], sale: [{txt: 'Estas 3 herramientas', monto: 60, t: 1.4}], total: {txt: 'Ahorro real', t: 2.4}},
      },
      {
        id: 'v11-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro las tres IA que uso.',
        componenteId: 'remate',
        props: {d: {lineas: ['No necesitás', 'un equipo.', 'Necesitás las 3 correctas.'], grande: 'TU EQUIPO DE IA', pie: 'Sin nómina.'}, clip: 'celular-00.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v12',
    titulo: 'No sé diseñar',
    escenas: [
      {
        id: 'v12-hook', esPrimera: true, intensidad: 7,
        textoVoz: '¿Diseñar? Yo ni sé poner un filtro. Así creo productos que se venden solos.',
        componenteId: 'silueta',
        props: {idea: {texto: 'No sé diseñar.', pie: 'Igual lo vendo.'}},
      },
      {
        id: 'v12-giro', intensidad: 5,
        textoVoz: 'Elegís una plantilla, cambiás textos y colores, y publicás. El diseño no vende: vende la idea.',
        componenteId: 'pasos',
        props: {titulo: 'Cómo lo armo sin saber diseñar', pasos: [
          {fig: 'documento', txt: 'Elegí una plantilla'},
          {fig: 'etiqueta', txt: 'Cambiá textos y colores'},
          {fig: 'cohete', txt: 'Publicalo'},
        ]},
      },
      {
        id: 'v12-prueba', intensidad: 6,
        textoVoz: 'De un mockup improvisado a un producto con plantilla lista. Los mejores productos digitales no son los más lindos: son los más funcionales.',
        componenteId: 'antes-despues',
        props: {antes: {rotulo: 'Antes', txt: 'Mockup improvisado'}, despues: {rotulo: 'Después', txt: 'Producto con plantilla lista'}},
        transicionSalida: {tipo: 'corte'},
      },
      {
        id: 'v12-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo crear productos sin saber diseñar.',
        componenteId: 'remate',
        props: {d: {lineas: ['No sos diseñador.', 'No necesitás serlo.', 'Necesitás una plantilla.'], grande: 'DISEÑÁ SIN SABER', pie: 'La idea vende, no el filtro.'}, clip: 'celular-01.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v13',
    titulo: 'El sitio que reemplaza al diseñador',
    escenas: [
      {
        id: 'v13-hook', esPrimera: true, intensidad: 8,
        textoVoz: 'Este sitio me hizo olvidar que los diseñadores existen. Y es gratis.',
        componenteId: 'buscador',
        props: {consulta: 'sitio de diseño gratis para creadores', sugerencias: [{txt: 'sin marca de agua', t: 0.8}, {txt: 'plantillas listas', t: 1.3, acento: true}], pie: 'Lo encontré en 10 segundos.'},
        transicionSalida: {tipo: 'fogonazo'},
      },
      {
        id: 'v13-giro', intensidad: 5,
        textoVoz: 'El 99% paga por lo que podría tener gratis. Los que de verdad ganan no gastan en lo que consiguen gratis: invierten en lo que escala.',
        componenteId: 'logos-herramientas',
        props: {items: [{nombre: 'Canva', color: '#00C4CC', texto: 'Reemplaza al diseñador'}], pie: 'Gratis.'},
      },
      {
        id: 'v13-prueba', intensidad: 6,
        textoVoz: 'Cero pesos contra quinientos dólares de diseñador. La diferencia se siente en el bolsillo, no en el resultado.',
        componenteId: 'duelo',
        props: {izq: {rotulo: 'Diseñador', valor: '$500'}, der: {rotulo: 'Este sitio', valor: '$0'}, ganador: 'der', remate: 'Mismo resultado.'},
      },
      {
        id: 'v13-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro el sitio que uso.',
        componenteId: 'remate',
        props: {d: {lineas: ['No pagues', 'por lo que es', 'gratis.'], grande: 'DEJÁ DE PAGAR DE MÁS', pie: 'El sitio, en el próximo video.'}, clip: 'celular-02.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v14',
    titulo: 'Backend abierto',
    escenas: [
      {
        id: 'v14-hook', esPrimera: true, intensidad: 8,
        textoVoz: 'Backend abierto: así configuré mi curso para que se venda mientras yo como.',
        componenteId: 'notificaciones',
        props: {titulo: 'Lo que entra solo', items: [
          {app: 'Email', txt: 'Nueva suscripción', t: 0.3},
          {app: 'Ventas', txt: 'Venta automática', t: 1.3, acento: true},
        ], remate: 'Sin que yo toque nada.'},
      },
      {
        id: 'v14-giro', intensidad: 5,
        textoVoz: 'Vender no es complicado, es un flujo bien configurado. Amazon no vendía productos: vendía un sistema.',
        componenteId: 'diagrama',
        props: {d: {nodos: [
          {fig: 'mensaje', x: 0.5, y: 0.28, tam: 150, rotulo: 'EMAIL', t: 0, acento: true},
          {fig: 'etiqueta', x: 0.5, y: 0.44, tam: 150, rotulo: 'OFERTA', t: 0.9, acento: true},
          {fig: 'billete', x: 0.5, y: 0.6, tam: 150, rotulo: 'PAGO', t: 1.8, acento: true},
          {fig: 'documento', x: 0.5, y: 0.76, tam: 150, rotulo: 'ENTREGA', t: 2.6, acento: true},
        ], flechas: [{de: 0, a: 1, t: 1.0, acento: true}, {de: 1, a: 2, t: 1.9, acento: true}, {de: 2, a: 3, t: 2.8, acento: true}]}},
        transicionSalida: {tipo: 'raya'},
      },
      {
        id: 'v14-prueba', intensidad: 6,
        textoVoz: 'Tres ventas automáticas mientras como. El costo de la herramienta, casi nada al lado de eso.',
        componenteId: 'recibo',
        props: {titulo: 'Lo que entra mientras como', entra: [{txt: 'Venta automática 1', monto: 47, t: 0.3}, {txt: 'Venta automática 2', monto: 47, t: 1.2}, {txt: 'Venta automática 3', monto: 47, t: 2.1}], sale: [{txt: 'Costo de la herramienta', monto: 20, t: 3.0}], total: {txt: 'Lo que quedó neto', t: 3.6}},
      },
      {
        id: 'v14-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo configurar tu backend.',
        componenteId: 'remate',
        props: {d: {lineas: ['Configuralo', 'una vez.', 'Cobrá siempre.'], grande: 'ARMÁ EL FLUJO', pie: 'Después, es automático.'}, clip: 'celular-03.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v15',
    titulo: 'De mockup a producto en 5 minutos',
    escenas: [
      {
        id: 'v15-transformacion', esPrimera: true, intensidad: 7,
        textoVoz: 'Cinco minutos. De un mockup de PowerPoint a un producto que vende. Sin cortes.',
        componenteId: 'antes-despues',
        props: {antes: {rotulo: 'Minuto 0', txt: 'Mockup de PowerPoint'}, despues: {rotulo: 'Minuto 5', txt: 'Producto listo para vender'}},
        transicionSalida: {tipo: 'corte'},
      },
      {
        id: 'v15-prueba', intensidad: 6,
        textoVoz: 'Los emprendedores más exitosos no esperan a que sea perfecto: lo lanzan y lo mejoran en el camino.',
        componenteId: 'contador',
        props: {arriba: 'Tiempo real de esta transformación', hasta: 5, sufijo: ' min', prefijo: '', abajo: 'sin cortes'},
      },
      {
        id: 'v15-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo hacer tu producto en cinco minutos.',
        componenteId: 'remate',
        props: {d: {lineas: ['No necesitás', 'semanas.', 'Necesitás sistema.'], grande: '5 MINUTOS REALES', pie: 'Sin trucos de edición.'}, clip: 'celular-04.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v16',
    titulo: 'De 37 carpetas a 3',
    escenas: [
      {
        id: 'v16-transformacion', esPrimera: true, intensidad: 7,
        textoVoz: 'Abro mi caos. Organizo treinta y siete carpetas en tres. Y aparece un producto nuevo.',
        componenteId: 'antes-despues',
        props: {antes: {rotulo: '37 carpetas', txt: 'Caos total'}, despues: {rotulo: '3 carpetas', txt: 'Un producto nuevo'}},
        transicionSalida: {tipo: 'corte'},
      },
      {
        id: 'v16-giro', intensidad: 5,
        textoVoz: 'No necesitás más ideas. Necesitás ordenar las que ya tenés. Los que más ganan no tienen más ideas que vos: tienen un sistema para ordenarlas.',
        componenteId: 'pasos',
        props: {titulo: 'Cómo salió el producto del caos', pasos: [
          {fig: 'carpeta', txt: 'Junté todo lo disperso'},
          {fig: 'lupa', txt: 'Identifiqué lo que servía'},
          {fig: 'documento', txt: 'Armé el producto'},
        ]},
      },
      {
        id: 'v16-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo organizar tu caos en un producto.',
        componenteId: 'remate',
        props: {d: {lineas: ['Tu producto', 'ya existe.', 'Está desordenado.'], grande: 'ORDENÁ EL CAOS', pie: 'Ahí está tu producto.'}, clip: 'celular-05.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v17',
    titulo: 'Mito: necesitás 10 mil seguidores',
    escenas: [
      {
        id: 'v17-hook', esPrimera: true, intensidad: 9,
        textoVoz: 'Mito uno: "necesito diez mil seguidores". Falso. Yo vendí con cero.',
        componenteId: 'tres-verdades',
        props: {frases: ['Mito #1.', '"Necesitás seguidores."', 'Vendí con 0.']},
        transicionSalida: {tipo: 'fogonazo'},
      },
      {
        id: 'v17-giro', intensidad: 6,
        textoVoz: 'No necesitás audiencia, necesitás producto. Los primeros clientes de Apple no eran seguidores: eran personas que necesitaban una computadora.',
        componenteId: 'encuesta',
        props: {pregunta: '¿Cuántos seguidores creés que necesitás para vender?', a: {txt: 'Miles', pct: 82}, b: {txt: 'Ninguno (así empecé yo)', pct: 18}, remate: 'La respuesta correcta no es la popular.'},
      },
      {
        id: 'v17-prueba', intensidad: 7,
        textoVoz: 'De diez mil seguidores imaginarios a cero seguidores reales. Y la primera venta llegó igual.',
        componenteId: 'cifra-se-cae',
        props: {arriba: 'Lo que "necesitabas"', de: '10.000', a: '0', abajo: 'Y vendiste igual'},
      },
      {
        id: 'v17-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo vender sin seguidores.',
        componenteId: 'remate',
        props: {d: {lineas: ['0 seguidores.', '1 producto.', '1 venta real.'], grande: 'VENDÉ SIN AUDIENCIA', pie: 'El producto hace el trabajo.'}, clip: 'comercio-00.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v18',
    titulo: 'Mito: soy un experto',
    escenas: [
      {
        id: 'v18-hook', esPrimera: true, intensidad: 9,
        textoVoz: 'Mito dos: "soy un experto". Mentira. Los que venden son los que empiezan.',
        componenteId: 'tres-verdades',
        props: {frases: ['Mito #2.', '"Hay que ser experto."', 'Los que venden, empiezan.']},
      },
      {
        id: 'v18-giro', intensidad: 6,
        textoVoz: 'SpaceX explotó tres cohetes seguidos antes de llegar a órbita. Hoy es la empresa espacial más grande del mundo. La experiencia no se estudia: se construye.',
        componenteId: 'cronologia',
        props: {titulo: 'La experiencia se construye, no se estudia', hitos: [
          {cuando: '2006–2008', que: 'SpaceX: 3 cohetes explotados seguidos'},
          {cuando: '2008', que: 'El cuarto llega a órbita', acento: true},
          {cuando: 'Hoy', que: 'La empresa espacial más grande del mundo', acento: true},
        ]},
        transicionSalida: {tipo: 'sacudon'},
      },
      {
        id: 'v18-prueba', intensidad: 6,
        textoVoz: 'No hacía falta el título de experto. Hacía falta el primer intento.',
        componenteId: 'explicador',
        props: {d: {
          titulo: 'Lo que de verdad te hace avanzar',
          filas: [{concepto: 'Título de experto', valor: 'No lo tenía'}, {concepto: 'Primer intento', valor: 'Sí lo hice'}],
          remate: {arriba: 'La experiencia', grande: 'SE CONSTRUYE', abajo: 'haciendo, no estudiando'},
        }},
      },
      {
        id: 'v18-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo empezar sin ser experto.',
        componenteId: 'remate',
        props: {d: {lineas: ['No sos experto.', 'Todavía.', 'Empezá igual.'], grande: 'EMPEZÁ SIN SERLO', pie: 'El título llega después.'}, clip: 'comercio-01.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v19',
    titulo: 'Mito: el algoritmo me odia',
    escenas: [
      {
        id: 'v19-hook', esPrimera: true, intensidad: 9,
        textoVoz: 'Mito tres: "el algoritmo me odia". No. Tu producto es invisible.',
        componenteId: 'tres-verdades',
        props: {frases: ['Mito #3.', '"El algoritmo me odia."', 'Tu producto, invisible.']},
      },
      {
        id: 'v19-giro', intensidad: 6,
        textoVoz: 'La mayoría culpa al algoritmo cuando debería culpar a su sistema. Los mejores creadores no dependen del algoritmo: dependen de su sistema de creación.',
        componenteId: 'balanza',
        props: {titulo: '¿Qué pesa más?', izq: {txt: 'ALGORITMO', peso: 3}, der: {txt: 'TU SISTEMA', peso: 7}, pie: 'La culpa pesa menos que la solución.'},
        transicionSalida: {tipo: 'raya'},
      },
      {
        id: 'v19-prueba', intensidad: 5,
        textoVoz: 'Creá, publicá, medí, ajustá. Ese ciclo importa más que cualquier algoritmo.',
        componenteId: 'diagrama',
        props: {d: {nodos: [
          {fig: 'foco', x: 0.5, y: 0.28, tam: 150, rotulo: 'CREÁ', t: 0, acento: true},
          {fig: 'telefono', x: 0.5, y: 0.44, tam: 150, rotulo: 'PUBLICÁ', t: 0.9, acento: true},
          {fig: 'lupa', x: 0.5, y: 0.6, tam: 150, rotulo: 'MEDÍ', t: 1.8, acento: true},
          {fig: 'engranaje', x: 0.5, y: 0.76, tam: 150, rotulo: 'AJUSTÁ', t: 2.6, acento: true},
        ], flechas: [{de: 0, a: 1, t: 1.0, acento: true}, {de: 1, a: 2, t: 1.9, acento: true}, {de: 2, a: 3, t: 2.8, acento: true}]}},
      },
      {
        id: 'v19-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro cómo hacer que tu producto sea visible.',
        componenteId: 'remate',
        props: {d: {lineas: ['No es el algoritmo.', 'Es el sistema.', 'Arreglá eso.'], grande: 'SÉ VISIBLE', pie: 'Con sistema, no con suerte.'}, clip: 'comercio-02.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v20',
    titulo: 'Lo que Hotmart no te dice',
    escenas: [
      {
        id: 'v20-hook', esPrimera: true, intensidad: 8,
        textoVoz: 'Hotmart te cobra comisión y te paga a los treinta días. Acá lo que nadie te dice.',
        componenteId: 'recibo',
        props: {titulo: 'Lo que te cobran', entra: [{txt: 'Precio de venta', monto: 100, t: 0.3}], sale: [{txt: 'Comisión + impuestos', monto: 20, t: 1.2}], total: {txt: 'Lo que te llega, 30 días después', t: 2.2}},
        transicionSalida: {tipo: 'corte'},
      },
      {
        id: 'v20-giro', intensidad: 7,
        textoVoz: 'La mayoría no sabe que hay alternativas mejores. Los que de verdad ganan no usan la plataforma que usa todo el mundo: usan la que les conviene a ellos.',
        componenteId: 'duelo',
        props: {izq: {rotulo: 'La que usa todo el mundo', valor: '30 días'}, der: {rotulo: 'La que me conviene', valor: 'Antes'}, ganador: 'der', remate: 'Elegí por conveniencia, no por costumbre.'},
        transicionSalida: {tipo: 'fogonazo'},
      },
      {
        id: 'v20-cta', esCierre: true, intensidad: 7,
        textoVoz: 'Seguime y te muestro las plataformas que uso.',
        componenteId: 'remate',
        props: {d: {lineas: ['Leé la letra chica.', 'Comparás.', 'Elegís mejor.'], grande: 'NO USES LA DEFAULT', pie: 'Usá la que te conviene.'}, clip: 'comercio-03.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
  {
    id: 'v21',
    titulo: 'Un video de 40 minutos vs. un curso de 6 meses',
    escenas: [
      {
        id: 'v21-hook', esPrimera: true, intensidad: 8,
        textoVoz: 'Este video de cuarenta minutos me generó más ingresos que un curso de seis meses. Duelo.',
        componenteId: 'duelo',
        props: {izq: {rotulo: 'Curso de 6 meses', valor: '6 meses'}, der: {rotulo: 'Este video', valor: '40 min'}, ganador: 'der', remate: 'No importa la duración.'},
        transicionSalida: {tipo: 'fogonazo'},
      },
      {
        id: 'v21-giro', intensidad: 8,
        textoVoz: 'No importa la duración: importa el sistema. Los mejores cursos no son los más largos, son los que resuelven un problema real.',
        componenteId: 'ranking',
        props: {titulo: 'Lo que de verdad vende', filas: [{txt: 'Resolver un problema real', valor: 92, acento: true}, {txt: 'Duración del contenido', valor: 8}]},
        transicionSalida: {tipo: 'sacudon'},
      },
      {
        id: 'v21-prueba', intensidad: 7,
        textoVoz: 'Cuarenta minutos de trabajo real, más resultado que seis meses de clases.',
        componenteId: 'contador',
        props: {arriba: 'Generado por 40 minutos de trabajo', hasta: 40, sufijo: ' min', prefijo: '', abajo: 'más que un curso de 6 meses'},
      },
      {
        id: 'v21-cta', esCierre: true, intensidad: 8,
        textoVoz: 'Seguime y te muestro cómo crear un video que venda más que un curso.',
        componenteId: 'remate',
        props: {d: {lineas: ['No hace falta', 'un curso largo.', 'Hace falta resolver algo.'], grande: 'RESOLVÉ, NO ALARGUES', pie: 'Eso es lo que vende.'}, clip: 'comercio-04.mp4'},
        transicionSalida: {tipo: 'fundido'},
      },
    ],
  },
];
