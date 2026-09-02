/**
 * Anti-repeticion inteligente (Ronda 4, orden maestra seccion 22).
 * Evolucion de la anti-repeticion existente (que trabaja por
 * componentId puntual, ver `componentesUsadosRecientes` en api.ts):
 * esto trabaja por PATRON (categoria + combinacion de estilos + golpe)
 * -- "este patron se uso recientemente" en vez de "este componente se
 * uso", y agrega el mecanismo real que faltaba: si el laboratorio
 * (fabrica/memoria/laboratorio.json) tiene un `resultadoReal` real
 * asociado a un video que uso ese patron y ese resultado indica que
 * funciono, la penalizacion se levanta -- "recuperar prioridad" en vez
 * de "prohibido para siempre".
 *
 * HONESTIDAD REQUERIDA (orden maestra, seccion 21: nunca mezclar
 * heuristica con resultado real): hoy (2026-09-02) NO existe ningun
 * `resultadoReal` cargado en laboratorio.json -- todas las entradas
 * estan en estado 'esperando_datos'. Esto significa que la rama de
 * "recuperar prioridad" de este modulo esta IMPLEMENTADA y TESTEADA
 * (con datos sinteticos en test_patrones.ts) pero NUNCA se va a
 * ejercitar con datos reales hasta que haya una publicacion con
 * metricas reales. Documentado en PENDIENTES.md, no oculto.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import type {EntradaLaboratorio} from './tipos';

const PATRONES_PATH = path.join(__dirname, 'patrones_usados.json');

/** Umbral heuristico y DECLARADO como tal (no una cifra de negocio
 * real): "retencion >= 40% se interpreta como evidencia de que el
 * patron funciono". Debe revisarse en cuanto haya datos reales de
 * verdad -- ver PENDIENTES.md. */
const RETENCION_MINIMA_FUNCIONA_PCT = 40;

/** Cuantos registros de patrones (no videos) mirar hacia atras al
 * evaluar si algo "se uso recientemente". */
const VENTANA_PATRONES_DEFAULT = 15;

export type PatronEdicion = {
  categoria: string;
  /** Orden no importa para comparar -- se normaliza ordenando alfabeticamente. */
  estilos: string[];
  golpe: string;
};

export type RegistroPatron = {
  videoId: string;
  fecha: string;
  patron: PatronEdicion;
};

export type DecisionPrioridadPatron = {
  penalizacion: number; // 0 = sin penalizacion (nunca usado, o prioridad recuperada)
  razon: string;
};

function clavePatron(p: PatronEdicion): string {
  return `${p.categoria}|${[...p.estilos].sort().join(',')}|${p.golpe}`;
}

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

export function leerPatronesUsados(): RegistroPatron[] {
  return leerJson<RegistroPatron[]>(PATRONES_PATH);
}

export function registrarPatronUsado(videoId: string, patron: PatronEdicion) {
  const historial = leerPatronesUsados();
  historial.push({videoId, fecha: new Date().toISOString(), patron});
  escribirJson(PATRONES_PATH, historial);
}

/**
 * Decide cuanto penalizar un patron candidato, dado el historial de
 * patrones usados y (si existen) resultados reales del laboratorio.
 *
 * Logica (seccion 22, textual):
 *   REPETICION -> penalizacion inicial -> RESULTADOS REALES -> ¿funciona?
 *   si -> permitir reutilizacion (penalizacion 0) ; no -> mantener penalizacion.
 */
export function decidirPrioridadPatron(params: {
  patron: PatronEdicion;
  historial?: RegistroPatron[];
  laboratorio?: EntradaLaboratorio[];
  ventana?: number;
}): DecisionPrioridadPatron {
  const historial = params.historial ?? leerPatronesUsados();
  const laboratorio = params.laboratorio ?? [];
  const ventana = params.ventana ?? VENTANA_PATRONES_DEFAULT;
  const clave = clavePatron(params.patron);

  const recientes = historial.slice(-ventana);
  const usosRecientes = recientes.filter((r) => clavePatron(r.patron) === clave);

  if (usosRecientes.length === 0) {
    return {penalizacion: 0, razon: 'patron no usado recientemente -- sin penalizacion'};
  }

  const videoIdsConPatron = new Set(usosRecientes.map((r) => r.videoId));
  const entradasConDatoReal = laboratorio.filter(
    (e) => e.videoId && videoIdsConPatron.has(e.videoId) && e.resultadoReal !== null
  );

  if (entradasConDatoReal.length > 0) {
    const funciona = entradasConDatoReal.some(
      (e) => (e.resultadoReal?.retencionPct ?? 0) >= RETENCION_MINIMA_FUNCIONA_PCT
    );
    if (funciona) {
      return {
        penalizacion: 0,
        razon: `patron usado recientemente (${usosRecientes.length}x) pero tiene resultadoReal real ` +
          `asociado (video(s): ${[...videoIdsConPatron].join(', ')}) que indica que funciono -- prioridad recuperada`,
      };
    }
    return {
      penalizacion: usosRecientes.length,
      razon: `patron usado ${usosRecientes.length} vez/veces recientemente Y tiene resultadoReal real ` +
        `asociado que NO alcanza el umbral de ${RETENCION_MINIMA_FUNCIONA_PCT}% de retencion -- se mantiene la penalizacion`,
    };
  }

  return {
    penalizacion: usosRecientes.length,
    razon: `patron usado ${usosRecientes.length} vez/veces recientemente, sin ningun resultadoReal real ` +
      `todavia para confirmar o descartar si funciona -- penalizado por defecto`,
  };
}
