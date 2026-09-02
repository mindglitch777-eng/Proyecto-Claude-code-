/**
 * Reconstruye, para cada caso documental, la secuencia exacta de textos
 * hablados (mismo orden y mismo armado de string que generó el manifest
 * de voz), la valida contra manifest_voz_documental.json linea por linea,
 * y mide la duracion real de cada clip de audio ya generado con
 * Qwen3-TTS. Escribe un JSON consolidado que es el insumo para
 * reescribir CasoGenerico.tsx con audio real sincronizado.
 *
 * Uso: npx tsx mapear_audio_documental.ts
 */
import {execSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {CASOS} from './src/documental/casos';
import type {CasoConfig, CentroVisual} from './src/documental/CasoGenerico';

const RAIZ = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(RAIZ, 'capturas_voz/manifest_voz_documental.json');
const AUDIO_DIR = path.join(RAIZ, 'capturas_voz/audio_documental');

type LineaManifest = {slug: string; index: number; texto: string};

function textosDeCentro(c: CentroVisual): string[] {
  switch (c.tipo) {
    case 'lineas':
      return c.items.map((it) => it.txt);
    case 'cronologia':
      return c.hitos.map((h) => `${h.cuando}: ${h.que}`);
    case 'balanza':
      return c.pie ? [c.izq.txt, c.der.txt, c.pie] : [c.izq.txt, c.der.txt];
    case 'antesDespues':
      return [`${c.antes.rotulo}: ${c.antes.txt}`, `${c.despues.rotulo}: ${c.despues.txt}`];
    case 'diagrama':
      return []; // rotulos en pantalla, sin audio propio
    case 'montaje':
      return []; // no se usa en los 20 casos documentales actuales
    default:
      return [];
  }
}

function textosDeCaso(cfg: CasoConfig): string[] {
  const salida: string[] = [...cfg.hook];
  salida.push(...textosDeCentro(cfg.centro));
  if (cfg.cifra) {
    if (cfg.cifra.tipo === 'contador') {
      if (cfg.cifra.arriba) salida.push(cfg.cifra.arriba);
      salida.push(`${cfg.cifra.prefijo ?? ''}${cfg.cifra.hasta}${cfg.cifra.sufijo ?? ''}`);
      if (cfg.cifra.abajo) salida.push(cfg.cifra.abajo);
    } else if (cfg.cifra.tipo === 'cifraSeCae') {
      if (cfg.cifra.arriba) salida.push(cfg.cifra.arriba);
      salida.push(cfg.cifra.de);
      salida.push(cfg.cifra.a);
      if (cfg.cifra.abajo) salida.push(cfg.cifra.abajo);
    }
  }
  salida.push(...cfg.final);
  return salida;
}

function duracionSegundos(archivo: string): number {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${archivo}"`,
    {encoding: 'utf-8'}
  );
  return parseFloat(out.trim());
}

function main() {
  const manifest: LineaManifest[] = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  const manifestPorSlug = new Map<string, LineaManifest[]>();
  for (const l of manifest) {
    if (!manifestPorSlug.has(l.slug)) manifestPorSlug.set(l.slug, []);
    manifestPorSlug.get(l.slug)!.push(l);
  }

  const resultado: Record<string, {
    campos: {campo: 'hook' | 'centro' | 'cifra' | 'final'; texto: string; archivo: string; duracion: number}[];
  }> = {};

  const errores: string[] = [];

  for (const cfg of CASOS) {
    const textos = textosDeCaso(cfg);
    const lineasManifest = (manifestPorSlug.get(cfg.slug) ?? []).sort((a, b) => a.index - b.index);

    if (textos.length !== lineasManifest.length) {
      errores.push(
        `${cfg.slug}: ${textos.length} textos reconstruidos vs ${lineasManifest.length} en el manifest`
      );
      continue;
    }

    const campos: typeof resultado[string]['campos'] = [];
    let ok = true;
    // Reconstruir a que "campo" pertenece cada texto, en el mismo orden
    const nHook = cfg.hook.length;
    const textosCentro = textosDeCentro(cfg.centro);
    const nCentro = textosCentro.length;
    let nCifra = 0;
    if (cfg.cifra) {
      nCifra = cfg.cifra.tipo === 'contador'
        ? (cfg.cifra.arriba ? 1 : 0) + 1 + (cfg.cifra.abajo ? 1 : 0)
        : (cfg.cifra.arriba ? 1 : 0) + 2 + (cfg.cifra.abajo ? 1 : 0);
    }

    for (let i = 0; i < textos.length; i++) {
      const esperado = textos[i];
      const real = lineasManifest[i].texto;
      if (esperado !== real) {
        errores.push(`${cfg.slug}[${i}]: reconstruido ${JSON.stringify(esperado)} != manifest ${JSON.stringify(real)}`);
        ok = false;
        continue;
      }
      const campo: 'hook' | 'centro' | 'cifra' | 'final' =
        i < nHook ? 'hook' : i < nHook + nCentro ? 'centro' : i < nHook + nCentro + nCifra ? 'cifra' : 'final';
      const nombreArchivo = `${cfg.slug}_${lineasManifest[i].index.toString().padStart(2, '0')}.mp3`;
      const rutaArchivo = path.join(AUDIO_DIR, nombreArchivo);
      let duracion = 0;
      try {
        duracion = duracionSegundos(rutaArchivo);
      } catch (e) {
        errores.push(`${cfg.slug}[${i}]: no se pudo medir ${nombreArchivo}: ${e}`);
        ok = false;
      }
      campos.push({campo, texto: real, archivo: nombreArchivo, duracion});
    }

    if (ok) resultado[cfg.slug] = {campos};
  }

  if (errores.length) {
    console.error('ERRORES DE VALIDACION:');
    errores.forEach((e) => console.error('  ' + e));
  }

  const destino = path.join(RAIZ, 'capturas_voz/mapa_audio_documental.json');
  writeFileSync(destino, JSON.stringify(resultado, null, 2), 'utf-8');
  console.log(`\n${Object.keys(resultado).length}/${CASOS.length} casos mapeados OK -> ${destino}`);
  if (errores.length) process.exit(1);
}

main();
