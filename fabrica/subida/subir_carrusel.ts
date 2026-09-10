/**
 * CLI: sube un carrusel del lote42 a TikTok via Zernio (foto post, no
 * hay equivalente en YouTube). Uso:
 *   npx tsx subida/subir_carrusel.ts carrusel-01 [scheduledForISO]
 *
 * Modo borrador (Creator Inbox) por default, mismo criterio ya
 * validado con los videos: TikTok sigue con cupo limitado para posteo
 * directo en apps sin auditar.
 */
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {publicarCarrusel, type ResultadoPlataforma} from './zernio';
import {CARRUSELES_42} from '../carrusel/lote_42_datos';

const RAIZ = resolve(__dirname, '../..');
const ACCOUNT_ID_TIKTOK = '6aa1ce18726ebfe037cfddd1';
const LOG_PATH = resolve(RAIZ, 'state/carruseles.json');

type EntradaLog = {
  id: string;
  fecha: string;
  ok: boolean;
  postId?: string;
  error?: string;
  plataformas?: ResultadoPlataforma[];
  scheduledFor?: string;
  respuestaCruda?: unknown;
};

function leerLog(): EntradaLog[] {
  if (!existsSync(LOG_PATH)) return [];
  return JSON.parse(readFileSync(LOG_PATH, 'utf-8'));
}

function guardarEnLog(entrada: EntradaLog): void {
  const log = leerLog();
  log.push(entrada);
  mkdirSync(dirname(LOG_PATH), {recursive: true});
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + '\n');
}

async function main(): Promise<void> {
  const id = process.argv[2];
  const scheduledFor = process.argv[3]; // opcional, ISO UTC -- si falta, publica ya
  if (!id) {
    console.error('Uso: npx tsx subida/subir_carrusel.ts <id> [scheduledForISO]  (ej: carrusel-01 2026-09-11T00:15:00Z)');
    process.exit(1);
  }

  const carrusel = CARRUSELES_42.find((c) => c.id === id);
  if (!carrusel) {
    throw new Error(`No se encontro metadata para "${id}" en lote_42_datos.ts.`);
  }

  const carpetaImagenes = resolve(RAIZ, `imagenes/lote42/${id}`);
  if (!existsSync(carpetaImagenes)) {
    throw new Error(`No existe ${carpetaImagenes} -- ¿el carrusel ya esta renderizado y commiteado?`);
  }
  const rutasImagenes = readdirSync(carpetaImagenes)
    .filter((f) => f.endsWith('.png'))
    .sort()
    .map((f) => resolve(carpetaImagenes, f));
  if (rutasImagenes.length !== carrusel.slides.length) {
    throw new Error(
      `${id}: se esperaban ${carrusel.slides.length} slides (segun lote_42_datos.ts) pero se encontraron ${rutasImagenes.length} PNG en ${carpetaImagenes}.`
    );
  }

  // OJO real: en un post de fotos el `content` de nivel superior es el
  // TITULO del slideshow (TikTok lo capa a 90 caracteres) -- el caption
  // largo (descripcion + hashtags) va en platformSpecificData.description.
  if (carrusel.titulo.length > 90) {
    throw new Error(`${id}: el titulo "${carrusel.titulo}" pesa ${carrusel.titulo.length} caracteres, supera el limite de 90 de TikTok para el titulo del slideshow.`);
  }
  const captionLargo = `${carrusel.descripcion}\n\n${carrusel.hashtags.join(' ')}`;

  console.log(`Subiendo ${id} ("${carrusel.titulo}", ${rutasImagenes.length} slides) a TikTok${scheduledFor ? ` (programado para ${scheduledFor})` : ''}...`);

  const resultado = await publicarCarrusel({
    rutasImagenes,
    contenido: carrusel.titulo,
    scheduledFor,
    cuentaTikTok: {
      accountId: ACCOUNT_ID_TIKTOK,
      datos: {
        privacyLevel: 'PUBLIC_TO_EVERYONE',
        allowComment: true,
        allowDuet: true,
        allowStitch: true,
        contentPreviewConfirmed: true,
        expressConsentGiven: true,
        photoCoverIndex: 0,
        description: captionLargo,
        draft: true,
        tiktokSettings: {draft: true},
      },
    },
  });

  guardarEnLog({
    id,
    fecha: new Date().toISOString(),
    ok: resultado.ok,
    postId: resultado.ok ? resultado.postId : undefined,
    error: resultado.ok ? undefined : resultado.error,
    plataformas: resultado.plataformas,
    scheduledFor,
    respuestaCruda: resultado.respuestaCruda,
  });

  console.log('Respuesta cruda de Zernio:');
  console.log(JSON.stringify(resultado.respuestaCruda, null, 2));

  if (resultado.plataformas) {
    console.log('Estado por plataforma:');
    for (const p of resultado.plataformas) {
      console.log(`  - ${p.platform}: ${p.status}${p.error ? ` -- ${p.error}` : ''}`);
    }
  }

  if (!resultado.ok) {
    console.error(`FALLO la subida de ${id}: ${resultado.error}`);
    process.exit(1);
  }
  console.log(`OK -- ${id} ${scheduledFor ? 'programado' : 'publicado'}. postId: ${resultado.postId ?? '(no informado)'}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
