#!/usr/bin/env node
// Arma el mapa de que video/foto hay disponible, leyendo remotion-spike/public
// (que preparar-public.sh llena desde assets/). El compilador de guiones
// pide videos por TEMA ("oficio taller argentina"), no por nombre de
// archivo -- este manifiesto es el puente entre las dos cosas.
//
// Se corre DESPUES de preparar-public.sh y ANTES de renderizar. Escribe
// src/receta/manifiesto.json, que resolverClip.ts importa en tiempo de
// compilacion (no puede leer el filesystem: el render corre en un
// navegador sin disco).
const fs = require('fs');
const path = require('path');

const DIR_VIDEO = path.join(__dirname, 'public', 'video');
const SALIDA = path.join(__dirname, 'src', 'receta', 'manifiesto.json');

const archivos = fs.existsSync(DIR_VIDEO)
  ? fs.readdirSync(DIR_VIDEO).filter((f) => f.endsWith('.mp4'))
  : [];

// Agrupa "dinero-00.mp4", "dinero-01.mp4"... bajo la categoria "dinero".
const categorias = {};
for (const f of archivos) {
  const cat = f.replace(/-\d+\.mp4$/, '');
  (categorias[cat] ||= []).push(f);
}

fs.mkdirSync(path.dirname(SALIDA), {recursive: true});
fs.writeFileSync(SALIDA, JSON.stringify({categorias, total: archivos.length}, null, 1));
console.log(`manifiesto: ${archivos.length} clips en ${Object.keys(categorias).length} categorias`);
