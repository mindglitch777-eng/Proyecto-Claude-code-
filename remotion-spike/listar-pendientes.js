#!/usr/bin/env node
// EL SISTEMA QUE VE QUE VIDEOS NECESITA CADA GUION
//
// Compila TODOS los guiones de receta/guiones.ts (la misma funcion que
// usa el render, compilar()) y junta cada frase que pidieron ver. Para
// cada frase mira el diccionario de receta/imagenes.ts (que categoria
// de metraje le corresponde) y el manifiesto actual (que categorias ya
// tienen clips bajados). Lo que falta se escribe en pendientes.json,
// listo para que descargar_metraje.py lo baje.
//
// Si una frase NO esta en el diccionario, no se adivina en silencio:
// se avisa por consola. Un guion nuevo con una frase nueva necesita
// una linea nueva en imagenes.ts (que categoria le toca) y, si esa
// categoria tampoco existe, una consulta en ingles en NICHOS dentro de
// descargar_metraje.py. Las dos cosas las escribe quien redacta el
// guion -- es la unica parte de "que video se necesita" que no se
// puede adivinar sola, porque es una decision de contenido.
require('tsx/cjs');
const fs = require('fs');
const path = require('path');

const {compilar} = require('./src/receta/compilar.ts');
const {GUIONES} = require('./src/receta/guiones.ts');
const {categoriaConocida} = require('./src/receta/imagenes.ts');

const MANIFIESTO = path.join(__dirname, 'src', 'receta', 'manifiesto.json');
const SALIDA = path.join(__dirname, 'pendientes.json');

const manifiesto = fs.existsSync(MANIFIESTO)
  ? JSON.parse(fs.readFileSync(MANIFIESTO, 'utf-8'))
  : {categorias: {}};

const todasLasFrases = new Set();
GUIONES.forEach((g) => compilar(g).busquedas.forEach((f) => todasLasFrases.add(f)));

const sinTraduccion = [];
const faltantes = new Set();
for (const frase of todasLasFrases) {
  const cat = categoriaConocida(frase);
  if (!cat) {
    sinTraduccion.push(frase);
    continue;
  }
  const tieneClips = (manifiesto.categorias[cat] || []).length > 0;
  if (!tieneClips) faltantes.add(cat);
}

if (sinTraduccion.length) {
  console.log('AVISO: frases sin categoria en src/receta/imagenes.ts (no se van a bajar solas):');
  sinTraduccion.forEach((f) => console.log(`  - "${f}"`));
}

const lista = Array.from(faltantes).sort();
fs.writeFileSync(SALIDA, JSON.stringify(lista, null, 1));
console.log(
  lista.length
    ? `pendientes.json: ${lista.length} categoria(s) por bajar -> ${lista.join(', ')}`
    : 'pendientes.json: nada por bajar, todo lo que piden los guiones ya esta.',
);
