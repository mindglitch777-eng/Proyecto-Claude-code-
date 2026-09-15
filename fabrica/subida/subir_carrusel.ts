/**
 * CLI: entrega un carrusel del lote42 al operador para que lo suba a
 * mano vía TikTok Studio (programación nativa, hasta 10+ días) --
 * arquitectura 2026-09-14, ya no publica vía Zernio. Las imágenes se
 * suben como artifact de GitHub Actions y el operador arma el post de
 * fotos él mismo desde la app.
 *
 * Uso: npx tsx subida/subir_carrusel.ts carrusel-01 [scheduledForISO]
 */
import {existsSync, readdirSync, appendFileSync, mkdirSync, writeFileSync} from 'fs';
import {resolve} from 'path';
import {enviarAvisoParaSubidaManual} from './enviar_para_subida_manual';
import {Publicacion} from './publicacion';
import {CARRUSELES_42} from '../carrusel/lote_42_datos';

const RAIZ = resolve(__dirname, '../..');

async function main(): Promise<void> {
  const id = process.argv[2];
  const scheduledFor = process.argv[3]; // opcional, ISO UTC -- horario SUGERIDO, el operador programa la hora real en TikTok Studio
  if (!id) {
    console.error('Uso: npx tsx subida/subir_carrusel.ts <id> [scheduledForISO]  (ej: carrusel-01 2026-09-16T21:00:00Z)');
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
    .sort();
  if (rutasImagenes.length !== carrusel.slides.length) {
    throw new Error(
      `${id}: se esperaban ${carrusel.slides.length} slides (segun lote_42_datos.ts) pero se encontraron ${rutasImagenes.length} PNG en ${carpetaImagenes}.`
    );
  }

  const caption = `${carrusel.titulo}\n\n${carrusel.descripcion}\n\n${carrusel.hashtags.join(' ')}`;
  const captionConMusica = `${caption}\n\n🎵 Música sugerida: ${carrusel.musica}`;

  const topic = process.env.NTFY_TOPIC;
  if (!topic) throw new Error('Falta NTFY_TOPIC en el entorno para avisar.');
  const rutaOutput = process.env.GITHUB_OUTPUT;
  if (rutaOutput) appendFileSync(rutaOutput, `carpetaImagenesBuzon=${carpetaImagenes}\n`);

  const link = await enviarAvisoParaSubidaManual(topic, `${id}.zip`, carrusel.titulo, scheduledFor ?? '(programalo vos en TikTok Studio)', captionConMusica, 'carrusel');
  const entrada: Publicacion = {
    id,
    fecha: new Date().toISOString(),
    ok: true,
    estado: 'pendiente',
    tema: carrusel.titulo,
    scheduledFor,
    link,
    avisadoBuzon: true,
    avisadoBuzonEn: new Date().toISOString(),
  };
  // Ver aplicar_pendiente.ts: no se escribe directo a state/carruseles.json
  // aca -- pierde la carrera de git con varias entregas simultaneas
  // (confirmado real 2026-09-15). Queda en un archivo propio por id, que el
  // workflow aplica de forma reintentable contra la version mas fresca.
  const carpetaPendientes = resolve(RAIZ, 'state/pendientes');
  mkdirSync(carpetaPendientes, {recursive: true});
  const rutaPendiente = resolve(carpetaPendientes, `${id}.json`);
  writeFileSync(rutaPendiente, JSON.stringify(entrada, null, 2) + '\n');
  if (rutaOutput) appendFileSync(rutaOutput, `rutaPendiente=${rutaPendiente}\n`);
  console.log(`OK -- ${id} entregado al operador (aviso mandado, ${rutasImagenes.length} imágenes como artifact).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
