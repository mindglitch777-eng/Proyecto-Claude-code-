#!/usr/bin/env node
// Escribe out/<id>.json con lo que un humano (o el conector de subida
// que el operador conecte mas adelante) necesita para publicar el
// video: titulo, CTA, duracion, que formatos uso y que paleta de marca
// eligio el sistema para el contenido de ese guion en particular.
//
// Uso: node metadata-video.js g01
require('tsx/cjs');
const fs = require('fs');
const path = require('path');

const {compilar} = require('./src/receta/compilar.ts');
const {GUIONES} = require('./src/receta/guiones.ts');
const {elegirPaleta} = require('./src/receta/paletas.ts');

const id = process.argv[2];
if (!id) {
  console.error('Uso: node metadata-video.js <id>');
  process.exit(1);
}

const guion = GUIONES.find((g) => g.id === id);
if (!guion) {
  console.error(`No existe el guion '${id}' en receta/guiones.ts`);
  process.exit(1);
}

const plan = compilar(guion);
const textoCompleto = guion.tema + ' ' + guion.titulo + ' ' + guion.partes.map((p) => p.dice.join(' ')).join(' ');
const paleta = elegirPaleta(textoCompleto);

const metadata = {
  id: guion.id,
  titulo: guion.titulo,
  cta: guion.cta,
  duracionSegundos: Number(plan.duracion.toFixed(1)),
  paleta: paleta.id,
  formatosUsados: plan.bloques.map((b) => b.formato),
  busquedasDeMetraje: plan.busquedas,
};

const salida = path.join(__dirname, 'out', `${id}.json`);
fs.mkdirSync(path.dirname(salida), {recursive: true});
fs.writeFileSync(salida, JSON.stringify(metadata, null, 1));
console.log(`${salida} escrito.`);
