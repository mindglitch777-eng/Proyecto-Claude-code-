/**
 * API minima de lectura/escritura de la memoria del proyecto
 * (secciones 16 y 18-20 del prompt maestro). $0: son archivos JSON
 * versionados en git, sin base de datos externa (ver decision
 * pendiente P.2 en NUEVA_FABRICA.md sobre si esto se muda a Supabase
 * mas adelante).
 */
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import type {EntradaLaboratorio, EstadoExperimento, RegistroVideo, ResultadoReal} from './tipos';

const HISTORIAL_PATH = path.join(__dirname, 'historial_componentes.json');
const LABORATORIO_PATH = path.join(__dirname, 'laboratorio.json');

function leerJson<T>(ruta: string): T {
  try {
    return JSON.parse(readFileSync(ruta, 'utf-8'));
  } catch {
    return [] as unknown as T;
  }
}

function escribirJson(ruta: string, datos: unknown) {
  writeFileSync(ruta, JSON.stringify(datos, null, 2) + '\n', 'utf-8');
}

// ─────────────────────────────── ANTI-REPETICION ───────────────────────────────

export function leerHistorial(): RegistroVideo[] {
  return leerJson<RegistroVideo[]>(HISTORIAL_PATH);
}

export function registrarVideo(videoId: string, componentesUsados: string[]) {
  const historial = leerHistorial();
  historial.push({videoId, fecha: new Date().toISOString(), componentesUsados});
  escribirJson(HISTORIAL_PATH, historial);
}

/** Ids de componentes usados en los ultimos N videos, para pasar como
 * `evitar` al Director Visual (seccion 16: resta puntos, no prohibe). */
export function componentesUsadosRecientes(n = 5): string[] {
  const historial = leerHistorial();
  const recientes = historial.slice(-n);
  const ids = new Set<string>();
  for (const r of recientes) for (const c of r.componentesUsados) ids.add(c);
  return [...ids];
}

// ─────────────────────────────── LABORATORIO ───────────────────────────────

export function leerLaboratorio(): EntradaLaboratorio[] {
  return leerJson<EntradaLaboratorio[]>(LABORATORIO_PATH);
}

export function agregarHipotesis(datos: {
  id: string;
  hipotesis: string;
  experimento: string;
  videoId?: string;
}): EntradaLaboratorio {
  const laboratorio = leerLaboratorio();
  if (laboratorio.some((e) => e.id === datos.id)) {
    throw new Error(`Ya existe una entrada de laboratorio con id ${datos.id}`);
  }
  const entrada: EntradaLaboratorio = {
    ...datos,
    resultadoReal: null,
    conclusion: null,
    estado: 'esperando_datos',
    fechaCreacion: new Date().toISOString(),
  };
  laboratorio.push(entrada);
  escribirJson(LABORATORIO_PATH, laboratorio);
  return entrada;
}

/** Unico punto de entrada para escribir un resultado REAL -- exige
 * pasar `fuente` (de donde salio el dato) para que quede trazable que
 * no es un invento (seccion 19: nunca mezclar hipotesis con resultado
 * real). */
export function registrarResultadoReal(id: string, resultado: ResultadoReal, conclusion: string) {
  const laboratorio = leerLaboratorio();
  const entrada = laboratorio.find((e) => e.id === id);
  if (!entrada) throw new Error(`No existe entrada de laboratorio con id ${id}`);
  entrada.resultadoReal = resultado;
  entrada.conclusion = conclusion;
  entrada.estado = 'evaluado_real' as EstadoExperimento;
  escribirJson(LABORATORIO_PATH, laboratorio);
}

export function entradasEsperandoDatos(): EntradaLaboratorio[] {
  return leerLaboratorio().filter((e) => e.estado === 'esperando_datos');
}
