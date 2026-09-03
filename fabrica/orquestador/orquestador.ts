/**
 * Orquestador (R7-30, prompt "Construí una máquina, no piezas
 * sueltas"). Responde a la sección 2/19 del prompt: un punto de
 * entrada real que conecta QA -> Data Engine con datos REALES (no solo
 * el tipo preparado en R7-29) -- corre los checks de Python que ya
 * existen sobre un render real y arma el `RegistroVideoCompleto`
 * (fabrica/datos/) listo para registrar.
 *
 * Auditoría previa (regla dura: no duplicar): `laboratorio/ciclo_mejora.ts`
 * YA orquesta generación->QA->corrección->re-render (ver su propio
 * archivo) -- este módulo NO reemplaza eso, cubre el paso que faltaba
 * DESPUÉS de que el ciclo de mejora ya terminó y el video YA se
 * renderizó de verdad: correr QA sobre el .mp4 real (ciclo_mejora solo
 * corre QA de COMPOSICIÓN sobre el árbol, no ffprobe sobre el archivo
 * final) y dejar un `RegistroVideoCompleto` real, no un ejemplo de test.
 */
import {execSync} from 'node:child_process';
import path from 'node:path';
import type {ArbolComposicion} from '../composicion/tipos';
import type {RegistroVideoCompleto} from '../datos/tipos';

const RAIZ = path.resolve(__dirname, '../..');

export type DecisionLog = {
  paso: string;
  decision: string;
  razon: string;
};

/** Corre `qa/checks_duros.py` (ffprobe/ffmpeg real sobre el .mp4 ya
 * renderizado: silencios, negros, volumen) -- NO inventa el resultado,
 * si el script no puede correr (ej. ffmpeg no instalado, archivo no
 * existe) lo refleja como problema explícito, nunca como "ok". */
function correrQaDuro(rutaMp4: string): {ok: boolean; problemas: string[]} {
  try {
    const salida = execSync(`python3 "${path.join(RAIZ, 'fabrica/qa/checks_duros.py')}" "${rutaMp4}"`, {encoding: 'utf-8'});
    const r = JSON.parse(salida);
    return {ok: r.ok === true, problemas: r.problemas ?? []};
  } catch (e: unknown) {
    // execSync tira si el proceso sale con exit code != 0 -- checks_duros.py
    // sale 1 cuando HAY problemas duros, pero su stdout sigue siendo JSON
    // válido con el detalle real. Solo si ni siquiera hay stdout parseable
    // es un fallo real de la herramienta (no del video).
    const stdout = (e as {stdout?: Buffer | string}).stdout?.toString();
    if (stdout) {
      try {
        const r = JSON.parse(stdout);
        return {ok: r.ok === true, problemas: r.problemas ?? []};
      } catch {
        /* cae al catch general de abajo */
      }
    }
    return {ok: false, problemas: [`checks_duros.py no pudo correr: ${e}`]};
  }
}

/** Corre `qa/checks_composicion.py` (estructura del árbol: assets,
 * capacidad de texto, repetición, duración esperada vs real). */
function correrQaComposicion(rutaArbolJson: string, publicDir: string): {ok: boolean; problemas: string[]} {
  try {
    const salida = execSync(
      `python3 "${path.join(RAIZ, 'fabrica/qa/checks_composicion.py')}" "${rutaArbolJson}" --public-dir "${publicDir}"`,
      {encoding: 'utf-8'}
    );
    const r = JSON.parse(salida);
    const problemas: string[] = r.problemas ?? [];
    return {ok: problemas.length === 0, problemas};
  } catch (e: unknown) {
    const stdout = (e as {stdout?: Buffer | string}).stdout?.toString();
    if (stdout) {
      try {
        const r = JSON.parse(stdout);
        const problemas: string[] = r.problemas ?? [];
        return {ok: problemas.length === 0, problemas};
      } catch {
        /* cae abajo */
      }
    }
    return {ok: false, problemas: [`checks_composicion.py no pudo correr: ${e}`]};
  }
}

/**
 * Corre AMBOS QA reales (duro + composición) sobre un video ya
 * renderizado y arma el `qaResumen` real de `RegistroVideoCompleto`
 * (fabrica/datos/tipos.ts, R7-29) -- esto es lo que faltaba para que
 * ese campo deje de ser solo plumbing y tenga un dato real de verdad.
 *
 * NO llama a `registrarVideo()` por sí mismo -- devuelve el registro
 * armado para que el llamador decida el destino (mismo principio que
 * el resto de la fábrica: quien orquesta decide, los módulos no
 * escriben solos en almacenes compartidos sin que alguien lo pida
 * explícitamente).
 */
export function armarRegistroConQaReal(params: {
  rutaMp4: string;
  rutaArbolJson: string;
  publicDir: string;
  registroBase: Omit<RegistroVideoCompleto, 'qaResumen' | 'metricas'>;
}): {registro: RegistroVideoCompleto; log: DecisionLog[]} {
  const log: DecisionLog[] = [];

  const qaDuro = correrQaDuro(params.rutaMp4);
  log.push({
    paso: 'qa_duro', decision: qaDuro.ok ? 'sin problemas duros' : `${qaDuro.problemas.length} problema(s)`,
    razon: 'ffprobe/ffmpeg real sobre el .mp4 renderizado (silencios, negros, volumen)',
  });

  const qaComposicion = correrQaComposicion(params.rutaArbolJson, params.publicDir);
  log.push({
    paso: 'qa_composicion', decision: qaComposicion.ok ? 'sin problemas de estructura' : `${qaComposicion.problemas.length} problema(s)`,
    razon: 'validación de estructura del árbol (assets/capacidad de texto/repetición/duración)',
  });

  const ok = qaDuro.ok && qaComposicion.ok;
  const problemas = [...qaDuro.problemas.map((p) => `[duro] ${p}`), ...qaComposicion.problemas.map((p) => `[composicion] ${p}`)];

  const registro: RegistroVideoCompleto = {
    ...params.registroBase,
    metricas: null, // honesto: sin datos reales de audiencia todavía, nunca inventado
    qaResumen: {ok, problemas, fuente: 'orquestador.ts (checks_duros.py + checks_composicion.py)'},
  };

  log.push({
    paso: 'registro_data_engine', decision: `qaResumen.ok=${ok}`,
    razon: 'RegistroVideoCompleto armado con datos reales, listo para que el llamador lo registre en fabrica/datos/',
  });

  return {registro, log};
}

/** Extrae el árbol ya armado desde su JSON -- helper chico para no
 * repetir `JSON.parse(readFileSync(...))` en cada script. */
export function leerArbol(rutaArbolJson: string): ArbolComposicion {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {readFileSync} = require('node:fs');
  return JSON.parse(readFileSync(rutaArbolJson, 'utf-8'));
}
