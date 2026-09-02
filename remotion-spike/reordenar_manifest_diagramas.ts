/**
 * Repara el orden del manifest para los casos que le sumamos narracion
 * al diagrama (agregar_manifest_diagramas.ts): esas lineas nuevas se
 * agregaron con index = ultimo+1, es decir AL FINAL de cada slug --
 * pero el orden real de un caso es hook -> centro -> cifra -> final, y
 * en caso-03/05/06 (que tienen cifra) o en cualquiera con "final" la
 * narracion del diagrama (parte de "centro") tiene que ir ANTES de
 * esas, no despues.
 *
 * Reordena el manifest segun textosDeCaso(cfg) (la fuente de verdad) y
 * renombra los mp3 en disco para que el indice de archivo vuelva a
 * coincidir con la posicion en esa secuencia -- el emparejamiento
 * texto->archivo viejo se hace por el TEXTO exacto, no por el indice
 * viejo, asi que no importa donde haya quedado antes.
 *
 * Uso: npx tsx reordenar_manifest_diagramas.ts
 */
import {existsSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {CASOS} from './src/documental/casos';
import {textosDeCaso} from './mapear_audio_documental';

const RAIZ = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(RAIZ, 'capturas_voz/manifest_voz_documental.json');
const AUDIO_DIR = path.join(RAIZ, 'capturas_voz/audio_documental');

type Linea = {slug: string; index: number; texto: string};

const AFECTADOS = ['caso-03', 'caso-05', 'caso-06', 'caso-13', 'caso-18', 'caso-20'];

function archivoDe(slug: string, index: number) {
  return path.join(AUDIO_DIR, `${slug}_${String(index).padStart(2, '0')}.mp3`);
}

function main() {
  const manifest: Linea[] = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  const otros = manifest.filter((l) => !AFECTADOS.includes(l.slug));
  const reordenadas: Linea[] = [];

  for (const slug of AFECTADOS) {
    const cfg = CASOS.find((c) => c.slug === slug);
    if (!cfg) throw new Error(`${slug}: no esta en CASOS`);
    const ordenCorrecto = textosDeCaso(cfg);
    const actuales = manifest.filter((l) => l.slug === slug);
    if (ordenCorrecto.length !== actuales.length) {
      throw new Error(`${slug}: ${ordenCorrecto.length} textos reconstruidos vs ${actuales.length} en el manifest`);
    }
    const porTexto = new Map<string, Linea>();
    for (const l of actuales) {
      if (porTexto.has(l.texto)) throw new Error(`${slug}: texto duplicado ${JSON.stringify(l.texto)}`);
      porTexto.set(l.texto, l);
    }

    // Paso 1: sacar todos los archivos de este slug a un nombre
    // temporal, para no pisar un indice con otro a mitad de camino.
    const temporales: {tmp: string; nuevoIndex: number; texto: string}[] = [];
    ordenCorrecto.forEach((texto, i) => {
      const actual = porTexto.get(texto);
      if (!actual) throw new Error(`${slug}: no se encontro en el manifest actual el texto ${JSON.stringify(texto)}`);
      const viejo = archivoDe(slug, actual.index);
      if (!existsSync(viejo)) throw new Error(`${slug}: falta el archivo ${viejo}`);
      const tmp = viejo + `.tmp`;
      renameSync(viejo, tmp);
      temporales.push({tmp, nuevoIndex: i, texto});
    });

    // Paso 2: de temporal al nombre final (indice = posicion correcta).
    for (const t of temporales) {
      renameSync(t.tmp, archivoDe(slug, t.nuevoIndex));
      reordenadas.push({slug, index: t.nuevoIndex, texto: t.texto});
    }
    console.log(`${slug}: ${reordenadas.filter((l) => l.slug === slug).length} lineas reordenadas`);
  }

  const salida = [...otros, ...reordenadas];
  writeFileSync(MANIFEST_PATH, JSON.stringify(salida, null, 2), 'utf-8');
  console.log(`\nManifest reescrito: ${salida.length} lineas totales.`);
}

main();
