import {Guion} from './compilar';

// Los guiones no dicen como se ven. Dicen que hace cada parte, que
// dice, y que se tiene que ver. El compilador hace el resto.
//
// Todas las cifras en 'datos' son de ejemplo (aritmetica redonda para
// explicar un mecanismo), salvo donde diga lo contrario.

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
       datos: {alquiler: 300000, gastos: 100000, horas: 160, hora: 2500}},
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
      {hace: 'dato', dice: ['Lo que cambió'], datos: {valor: 0}},
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
      {hace: 'dato', dice: ['Los que perdiste sin enterarte'], datos: {valor: 12}},
      {hace: 'giro', dice: ['No sos más lento', 'Contestás más tarde']},
      {hace: 'cierre', dice: ['Te paso cómo contestar en cinco minutos']},
    ],
  },
];
