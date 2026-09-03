import {REGISTROS_VIDEO, REGISTROS_PRODUCTO} from './datos';
import type {RegistroVideoCompleto, RegistroProducto} from './tipos';
import registroComponentesRaw from '../componentes/registro.json';
import type {ComponenteRegistrado} from '../componentes/tipos';
import {porId as patronPorId} from '../hooks/consultar';

const IDS_COMPONENTES = new Set((registroComponentesRaw as unknown as ComponenteRegistrado[]).map((c) => c.id));

/** Valida integridad referencial real -- componentesUsados deben
 * existir en el registro real de componentes, hookPatronId debe
 * existir en el Viral/Retention Engine. Lanza si algo no existe. */
export function validarRegistroVideo(r: RegistroVideoCompleto): void {
  for (const compId of r.componentesUsados) {
    if (!IDS_COMPONENTES.has(compId)) throw new Error(`Registro de video "${r.videoId}" cita un componente inexistente: ${compId}`);
  }
  if (r.hookPatronId && !patronPorId(r.hookPatronId)) {
    throw new Error(`Registro de video "${r.videoId}" cita un patrón de retención inexistente: ${r.hookPatronId}`);
  }
}

/** Carga manual -- valida antes de agregar, nunca acepta un registro
 * con referencias inventadas. */
export function registrarVideo(r: RegistroVideoCompleto, destino: RegistroVideoCompleto[] = REGISTROS_VIDEO): void {
  validarRegistroVideo(r);
  destino.push(r);
}

export function registrarProducto(r: RegistroProducto, destino: RegistroProducto[] = REGISTROS_PRODUCTO): void {
  destino.push(r);
}

export function videosConMetricasReales(registros: RegistroVideoCompleto[] = REGISTROS_VIDEO): RegistroVideoCompleto[] {
  return registros.filter((r) => r.metricas !== null);
}

/**
 * R7-29: videos cuyo QA real (guardado en `qaResumen`, ver tipos.ts)
 * encontró al menos un problema -- conecta QA -> Data Engine, el
 * eslabón que la auditoría de madurez (docs/MAPA_MADUREZ_SISTEMA.md)
 * marcó como roto: antes de esto, ningún resultado de QA sobrevivía
 * más allá de un solo render. Devuelve vacío si no hay ningún registro
 * con QA corrido todavía -- no confunde "sin dato" con "sin problemas".
 */
export function videosConProblemasDeQa(registros: RegistroVideoCompleto[] = REGISTROS_VIDEO): RegistroVideoCompleto[] {
  return registros.filter((r) => r.qaResumen !== undefined && r.qaResumen.ok === false);
}

/**
 * Retención promedio agrupada por patrón de hook -- SOLO sobre videos
 * con `metricas.retencionPct` real. Devuelve un mapa vacío si no hay
 * ningún dato real todavía (honesto: sin datos, no hay promedio que
 * inventar, no un 0 disfrazado de resultado).
 */
export function retencionPromedioPorHook(registros: RegistroVideoCompleto[] = REGISTROS_VIDEO): Record<string, number> {
  const porHook = new Map<string, number[]>();
  for (const r of registros) {
    const pct = r.metricas?.retencionPct;
    if (r.hookPatronId && pct !== undefined) {
      const lista = porHook.get(r.hookPatronId) ?? [];
      lista.push(pct);
      porHook.set(r.hookPatronId, lista);
    }
  }
  const resultado: Record<string, number> = {};
  for (const [hookId, valores] of porHook) {
    resultado[hookId] = valores.reduce((s, v) => s + v, 0) / valores.length;
  }
  return resultado;
}
