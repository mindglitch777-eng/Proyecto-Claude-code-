import {MCP_INVESTIGADOS} from './registro';
import type {DecisionMcp, EstadoConexionMcp, McpInvestigado} from './tipos';

export function porId(id: string): McpInvestigado | undefined {
  return MCP_INVESTIGADOS.find((m) => m.id === id);
}

export function porDecision(decision: DecisionMcp): McpInvestigado[] {
  return MCP_INVESTIGADOS.filter((m) => m.decision === decision);
}

export function porEstadoConexion(estado: EstadoConexionMcp): McpInvestigado[] {
  return MCP_INVESTIGADOS.filter((m) => m.estadoConexion === estado);
}

/** Lo que espera una decisión real del operador (nunca se conecta
 * unilateralmente algo que pueda tener costo o requiera una cuenta
 * nueva -- regla de $0 + CLAUDE.md). */
export function esperandoOperador(): McpInvestigado[] {
  return porDecision('esperar_autorizacion_operador');
}

/** Ningún MCP puede declararse 'usar' (integrado de verdad) sin estar
 * realmente conectado -- evita que el registro diga "en uso" de algo
 * que en realidad nunca se habilitó. */
export function validarRegistro(): void {
  for (const m of MCP_INVESTIGADOS) {
    if (m.decision === 'usar' && m.estadoConexion !== 'conectado') {
      throw new Error(`MCP "${m.id}" está marcado decision='usar' pero estadoConexion es '${m.estadoConexion}' -- inconsistente.`);
    }
    if (m.esGratis === true && m.riesgo.trim().length === 0) {
      throw new Error(`MCP "${m.id}" declara esGratis=true sin ningún riesgo documentado -- revisar antes de confiar en el dato.`);
    }
  }
}
