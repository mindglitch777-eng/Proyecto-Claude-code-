/**
 * Agrega al manifest de voz las lineas de narracion de los bloques
 * "diagrama" (antes mudos: solo rotulos en pantalla con flechas, sin
 * nadie explicandolos). Lee `narracion` directo de cada CasoConfig en
 * casos.ts (fuente unica del texto) y le suma las 5 lineas del bloque
 * "Metodo" de RebeccaBeach (no vive en casos.ts, se hardcodea aca).
 *
 * Es aditivo, no reemplaza nada: cada linea nueva sigue el ultimo
 * indice ya usado por ese slug, asi generar_voz_documental_qwen.py
 * (que salta lineas cuyo wav ya existe) genera SOLO lo nuevo al
 * volver a correr, sin tocar las 177 lineas ya generadas.
 *
 * Uso: npx tsx agregar_manifest_diagramas.ts
 */
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {CASOS} from './src/documental/casos';

const RAIZ = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(RAIZ, 'capturas_voz/manifest_voz_documental.json');

type Linea = {slug: string; index: number; texto: string};

const NARRACION_METODO_REBECCA = [
  'Todo arranca de un problema.',
  'Investigación: entender bien qué hace falta.',
  'De ahí, el producto.',
  'Publicación: sacarlo al mundo.',
  'Y venta: que alguien lo compre.',
];

function main() {
  const manifest: Linea[] = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  const porSlug = new Map<string, Linea[]>();
  for (const l of manifest) {
    if (!porSlug.has(l.slug)) porSlug.set(l.slug, []);
    porSlug.get(l.slug)!.push(l);
  }
  const maxIndex = (slug: string) => Math.max(-1, ...(porSlug.get(slug) ?? []).map((l) => l.index));
  const yaTiene = (slug: string, texto: string) => (porSlug.get(slug) ?? []).some((l) => l.texto === texto);

  const nuevas: Linea[] = [];

  const agregarTanda = (slug: string, textos: string[]) => {
    let idx = maxIndex(slug) + 1;
    for (const texto of textos) {
      if (yaTiene(slug, texto)) continue; // ya corrio esto antes, no duplicar
      nuevas.push({slug, index: idx++, texto});
    }
  };

  for (const cfg of CASOS) {
    if (cfg.centro.tipo === 'diagrama' && cfg.centro.narracion?.length) {
      agregarTanda(cfg.slug, cfg.centro.narracion);
    }
  }
  agregarTanda('rebecca-beach', NARRACION_METODO_REBECCA);

  if (nuevas.length === 0) {
    console.log('Nada nuevo para agregar (el manifest ya tiene estas lineas).');
    return;
  }

  const salida = [...manifest, ...nuevas];
  writeFileSync(MANIFEST_PATH, JSON.stringify(salida, null, 2), 'utf-8');
  console.log(`${nuevas.length} lineas nuevas agregadas a ${MANIFEST_PATH}:`);
  nuevas.forEach((l) => console.log(`  ${l.slug}[${l.index}] ${JSON.stringify(l.texto)}`));
}

main();
