// Corre el compilador sobre los guiones y muestra que le toco a cada uno.
//   npx tsx probar-receta.ts
import {compilar, resumir} from './src/receta/compilar';
import {GUIONES} from './src/receta/guiones';

const planes = GUIONES.map(compilar);
for (const p of planes) console.log(resumir(p) + '\n');

// control: ¿se repite alguna combinacion entre videos?
const firmas = planes.map((p) => p.bloques.map((b) => b.formato).join('>'));
const repetidas = firmas.filter((f, i) => firmas.indexOf(f) !== i);
console.log('videos:', planes.length);
console.log('combinaciones repetidas entre videos:', repetidas.length);
const todos = planes.flatMap((p) => p.bloques.map((b) => b.formato));
console.log('formatos distintos usados:', new Set(todos).size);
for (const p of planes) {
  const dup = p.bloques.map((b) => b.formato);
  const rep = dup.filter((f, i) => dup.indexOf(f) !== i);
  if (rep.length) console.log(`  OJO ${p.id} repite formato:`, rep);
}
