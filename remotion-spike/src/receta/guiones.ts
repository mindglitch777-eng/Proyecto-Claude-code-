import {Guion} from './compilar';

// Los guiones no dicen como se ven. Dicen que hace cada parte, que
// dice, y que se tiene que ver. El compilador hace el resto.
//
// Todas las cifras en 'datos' son de ejemplo (aritmetica redonda para
// explicar un mecanismo), salvo donde diga lo contrario.
//
// (disparo de prueba de fabrica.yml -- ver si el pipeline anda solo)

export const GUIONES: Guion[] = [
  {
    id: 'g01',
    tema: 'oficio taller argentina trabajando',
    titulo: 'Tu hora ya cuesta plata',
    cta: 'HORA',
    partes: [
      {hace: 'golpe', dice: ['Laburaste todo el mes', 'y no te quedó un peso'],
       imagen: 'hombre cansado taller de noche'},
      {hace: 'niega', dice: ['No es que trabajes poco', 'Trabajás de más']},
      {hace: 'pregunta', dice: ['¿Sabés cuánto te cuesta una hora tuya?']},
      {hace: 'cuenta', dice: ['Lo que pagás sin trabajar'],
       datos: {conceptos: [
         {txt: 'Cobrás por el trabajo', monto: 5000},
         {txt: 'Alquiler del local', monto: -1800},
         {txt: 'Gastos fijos', monto: -700},
       ]}},
      {hace: 'consecuencia', dice: ['Cobrás cinco mil por dos horas'],
       datos: {de: '$5.000', a: '$0'}, imagen: 'barbero cortando pelo cliente'},
      {hace: 'giro', dice: ['No vendés cortes', 'Vendés tu hora', 'Y la estás regalando']},
      {hace: 'cierre', dice: ['Sacá la cuenta una vez']},
    ],
  },
  {
    id: 'g02',
    tema: 'freelance computadora trabajo escritorio',
    titulo: 'Si cobrás por hora, la IA te fundió',
    cta: 'PRECIO',
    partes: [
      {hace: 'golpe', dice: ['Si cobrás por hora', 'ya perdiste'],
       imagen: 'persona trabajando computadora oficina noche'},
      {hace: 'niega', dice: ['No te bajó el precio', 'Te bajó las horas']},
      {hace: 'comparar', dice: ['Antes una tarde', 'Ahora veinte minutos'],
       datos: {izq: 'Una tarde', der: '20 min'}},
      {hace: 'dato', dice: ['Por el mismo trabajo'], datos: {de: '$20.000', a: '$5.000'}},
      {hace: 'prueba', dice: ['Al cliente no le importa cuánto tardaste']},
      {hace: 'giro', dice: ['Dejá de vender tiempo', 'Vendé el problema resuelto']},
      {hace: 'cierre', dice: ['Te paso cómo se arma']},
    ],
  },
  {
    id: 'g03',
    tema: 'persona joven estudiando celular',
    titulo: 'Cuarenta videos guardados',
    cta: 'EMPEZAR',
    partes: [
      {hace: 'golpe', dice: ['Guardaste cuarenta videos', 'No abriste ninguno']},
      {hace: 'niega', dice: ['No te falta información', 'Te sobra']},
      {hace: 'descarte', dice: ['Todo lo que guardaste'],
       datos: {items: ['Cursos', 'Newsletters', 'Hilos', 'Videos']}},
      {hace: 'dato', dice: ['Lo que cambió'], datos: {hasta: 0}},
      {hace: 'proceso', dice: ['Lo que hace el que sí gana']},
      {hace: 'giro', dice: ['Lo usó una vez', 'para algo real'],
       imagen: 'mujer joven trabajando taller manos'},
      {hace: 'cierre', dice: ['Te digo con cuál empezar']},
    ],
  },
  {
    id: 'g04',
    tema: 'pequeno comercio emprendedor latino',
    titulo: 'Cero por mil sigue siendo cero',
    cta: 'CLIENTES',
    partes: [
      {hace: 'golpe', dice: ['La inteligencia artificial', 'no te va a conseguir', 'un solo cliente']},
      {hace: 'niega', dice: ['No crea nada', 'Multiplica lo que ya hay']},
      {hace: 'proceso', dice: ['Cómo funciona de verdad']},
      {hace: 'descarte', dice: ['De cada cien que arrancan'],
       datos: {pisos: [['Arrancan', '100'], ['Siguen', '30'], ['Viven de esto', '4']]}},
      {hace: 'consecuencia', dice: ['Cero por mil'], datos: {de: '0 × 1000', a: '0'}},
      {hace: 'giro', dice: ['Primero uno que te pague', 'Después automatizá'],
       imagen: 'comerciante atendiendo cliente local'},
      {hace: 'cierre', dice: ['Te paso el primer paso']},
    ],
  },
  {
    id: 'g05',
    tema: 'dos profesionales oficina comparacion',
    titulo: 'Entrega antes',
    cta: 'RAPIDO',
    partes: [
      {hace: 'golpe', dice: ['Tu competencia', 'no es más inteligente'],
       imagen: 'dos personas trabajando comparacion oficina'},
      {hace: 'prueba', dice: ['El cliente pidió a tres']},
      {hace: 'comparar', dice: ['Vos en dos días', 'El otro en cinco minutos'],
       datos: {izq: '2 días', der: '5 min'}},
      {hace: 'consecuencia', dice: ['Perdiste trabajos', 'que ya tenías ganados']},
      {hace: 'dato', dice: ['Los que perdiste sin enterarte'], datos: {hasta: 12}},
      {hace: 'giro', dice: ['No sos más lento', 'Contestás más tarde']},
      {hace: 'cierre', dice: ['Te paso cómo contestar en cinco minutos']},
    ],
  },
  {
    // CASO DOCUMENTAL -- distinto a los de arriba: no es un mecanismo
    // ilustrativo, es un caso real con nombre, apellido y numeros
    // verificables. Cada cifra tiene fuente (se cita en el propio
    // video, en el formato 'crecimiento') porque un numero real sin
    // de donde salio es tan creible como uno inventado.
    //
    // Fuentes consultadas: Indie Hackers ("Photo AI by Pieter Levels:
    // Complete Deep Dive Case Study"), ppc.land, founderreality.com,
    // jesse-qin.medium.com (todas nov. 2025). PhotoAI lanzo el
    // 10/feb/2023. Las herramientas (Stable Diffusion -> DreamBooth ->
    // Flux) estan confirmadas en esas mismas notas.
    id: 'doc01',
    tema: 'emprendedor digital trabajando computadora',
    titulo: 'De 40 productos a uno que le cambió todo',
    cta: 'METODO',
    partes: [
      {hace: 'golpe', formato: 'estoSosVos',
       dice: ['Este es Pieter Levels', 'Ya había construido más de 40 productos', 'Casi ninguno funcionó como este'],
       imagen: 'foto de pieter levels'},
      {hace: 'niega', dice: ['No fue un golpe de suerte', 'Fue método, repetido muchas veces']},
      {hace: 'historia', dice: [
        'Armó audiencia 10 años antes de lanzar',
        'Lanzó rápido y en público',
        'Cobró desde el primer día',
        'Iteró con datos reales, no con opiniones',
      ]},
      {hace: 'proceso', formato: 'herramientas',
       dice: ['Con qué lo construyó', 'Sin herramienta propia. Estas tres, bien usadas.'],
       datos: {items: [
         {nombre: 'Stable Diffusion', color: '#00A67E'},
         {nombre: 'DreamBooth', color: '#4285F4'},
         {nombre: 'Flux', color: '#F2F2F2'},
       ]}},
      {hace: 'dato', formato: 'crecimiento', dura: 7,
       dice: ['Así creció PhotoAI, mes a mes'],
       datos: {
         puntos: [
           {cuando: 'Semana 1', etiqueta: '$5,4K', valor: 5400},
           {cuando: 'Mes 2', etiqueta: '$28K', valor: 28000},
           {cuando: 'Día 60', etiqueta: '$40K', valor: 40000},
           {cuando: 'Mes 18', etiqueta: '$132K', valor: 132000},
         ],
         fuente: 'Indie Hackers, ppc.land, founderreality.com (nov. 2025)',
       }},
      {hace: 'consecuencia', dice: ['Ese producto solo', 'hoy es el 70% de todo lo que factura']},
      {hace: 'giro', dice: ['No inventó una idea genial', 'Inventó probar rápido, en público, con audiencia ya armada']},
      {hace: 'cierre', dice: ['Te paso el método completo']},
    ],
  },
];
