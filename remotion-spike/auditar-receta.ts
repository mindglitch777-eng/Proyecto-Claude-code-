import {compilar} from './src/receta/compilar';
import {GUIONES} from './src/receta/guiones';
import {FORMATOS, CON_METRAJE} from './src/receta/intenciones';

const planes = GUIONES.map(compilar);

console.log('=== 1. CUANTAS COMBINACIONES PUEDE HACER ===');
let techo = 1;
for (const [intencion, fs] of Object.entries(FORMATOS)) {
  if (intencion === 'cierre') continue;
  techo *= fs.length;
  console.log(`  ${intencion.padEnd(13)} ${fs.length} formatos posibles`);
}
console.log(`  Un guion de 12 partes distintas: ${techo.toLocaleString('es-AR')} combinaciones`);

console.log('\n=== 2. FORMATOS QUE NUNCA SE USARON ===');
const todos = new Set(Object.values(FORMATOS).flat());
const usados = new Set(planes.flatMap((p) => p.bloques.map((b) => b.formato)));
const nunca = [...todos].filter((f) => !usados.has(f));
console.log(`  ${usados.size} usados de ${todos.size}`);
console.log(`  nunca salieron: ${nunca.join(', ') || 'ninguno'}`);

console.log('\n=== 3. REPARTO: cuantas veces salio cada uno ===');
const cuenta: Record<string, number> = {};
planes.forEach((p) => p.bloques.forEach((b) => {cuenta[b.formato] = (cuenta[b.formato]||0)+1;}));
Object.entries(cuenta).sort((a,b)=>b[1]-a[1]).forEach(([f,n])=>console.log(`  ${f.padEnd(15)} ${'#'.repeat(n)} ${n}`));

console.log('\n=== 4. CONTROLES ===');
planes.forEach((p) => {
  const fs = p.bloques.map((b)=>b.formato);
  const rep = fs.filter((f,i)=>fs.indexOf(f)!==i);
  const met = fs.filter((f)=>CON_METRAJE.has(f)).length;
  const primerBloque = p.bloques[0];
  console.log(`  ${p.id}  dur ${p.duracion.toFixed(1)}s  repetidos:${rep.length}  con filmacion:${met}  abre con: ${primerBloque.formato}`);
});

console.log('\n=== 5. DURACIONES POR BLOQUE ===');
const durs = planes.flatMap((p)=>p.bloques.map((b)=>b.dura));
durs.sort((a,b)=>a-b);
console.log(`  mas corto ${durs[0].toFixed(1)}s | mediana ${durs[Math.floor(durs.length/2)].toFixed(1)}s | mas largo ${durs[durs.length-1].toFixed(1)}s`);
const totales = planes.map((p)=>p.duracion);
console.log(`  videos: ${totales.map((d)=>d.toFixed(0)+'s').join(' · ')}`);
