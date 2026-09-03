import path from 'path';
import fs from 'fs';
import {installWhisperCpp, downloadWhisperModel, transcribe, toCaptions} from '@remotion/install-whisper-cpp';

/**
 * R7-16: CLI real que compila whisper.cpp, descarga un modelo y
 * transcribe un audio real de la fábrica a Caption[]
 * (@remotion/captions) -- el camino OFICIALMENTE soportado por
 * Remotion para el pendiente mas antiguo del proyecto (timestamps
 * palabra-por-palabra, PENDIENTES.md item 1, desde Ronda 2).
 *
 * Estado real confirmado en este entorno (2026-09-03):
 * - `installWhisperCpp()` SI funciona -- clona y compila whisper.cpp
 *   de verdad (usa git, permitido por la política de red de este
 *   sandbox). Confirmado con un build manual identico (whisper-cli
 *   compilo y corre).
 * - `downloadWhisperModel()` NO funciona en este sandbox -- descarga
 *   el modelo desde huggingface.co, que la política de red de este
 *   entorno BLOQUEA explícitamente (403, "organization policy"). Se
 *   probo tambien el mirror alternativo `ggml.ggerganov.com` (tambien
 *   bloqueado). Sin modelo no hay transcripcion real posible ACA.
 *
 * Por eso este script existe pero NO se pudo correr de punta a punta
 * en este sandbox -- queda listo para correrse en un entorno con
 * salida a internet sin esa restriccion (candidato real: un runner de
 * GitHub Actions, que normalmente tiene salida abierta -- igual que ya
 * se documento para WebGL2 en Ronda 6, pendiente de confirmar ahi
 * mismo, no en este sandbox). Ver fabrica/research/ para el registro
 * formal de este bloqueo.
 *
 * Uso: npx tsx transcribir.ts <audio.wav> <salida.json>
 */
async function main() {
  const [audioPath, salidaPath] = process.argv.slice(2);
  if (!audioPath || !salidaPath) {
    console.error('Uso: npx tsx transcribir.ts <audio.wav> <salida.json>');
    process.exit(1);
  }

  const whisperDir = path.join(__dirname, '.whisper-cpp');
  const modelFolder = path.join(whisperDir, 'models');

  console.log('Instalando whisper.cpp (git clone + make)...');
  await installWhisperCpp({version: '1.5.5', to: whisperDir, printOutput: true});

  console.log('Descargando modelo "tiny"...');
  await downloadWhisperModel({model: 'tiny', folder: modelFolder, printOutput: true});

  console.log('Transcribiendo audio real...');
  const whisperCppOutput = await transcribe({
    inputPath: audioPath,
    whisperPath: whisperDir,
    whisperCppVersion: '1.5.5',
    model: 'tiny',
    modelFolder,
    tokenLevelTimestamps: true,
    language: 'es',
  });

  const {captions} = toCaptions({whisperCppOutput});
  fs.writeFileSync(salidaPath, JSON.stringify(captions, null, 2));
  console.log(`Transcripcion real escrita en ${salidaPath} (${captions.length} captions).`);
}

main().catch((e) => {
  console.error('Fallo la transcripcion:', e.message ?? e);
  process.exit(1);
});
