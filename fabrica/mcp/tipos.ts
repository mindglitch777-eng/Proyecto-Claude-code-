/**
 * Registro MCP (Ronda 7, "Prompt Maestro 3", sección 10). Primera
 * capa formal de conectores MCP -- no existía nada análogo antes de
 * esta ronda (a diferencia de Skill Intelligence, que ya cubría
 * herramientas de código). Mismo espíritu que
 * `fabrica/skills/tipos.ts`: un índice consultable, nunca inventa
 * capacidades de un conector que no se haya confirmado.
 */
export type EstadoConexionMcp =
  | 'instalado_no_conectado' // existe en la org de claude.ai pero no habilitado en este chat
  | 'no_instalado' // encontrado por investigación, nunca agregado
  | 'conectado'; // habilitado y usable en esta sesión

export type DecisionMcp =
  | 'usar' // ya conectado y en uso real
  | 'probar' // gratis o sin riesgo claro, candidato a que el operador lo conecte
  | 'descartar' // no aporta nada que no tengamos, o riesgo/costo no justificado
  | 'esperar_autorizacion_operador'; // podría aportar mucho, pero conectar requiere una decisión de cuenta/costo que solo el operador puede tomar

export type McpInvestigado = {
  id: string;
  nombre: string;
  fuente: string;
  funcion: string;
  licencia: string;
  requiereCuenta: boolean;
  requiereApiKey: boolean;
  /** true = confirmado gratis; false = confirmado pago; 'no_confirmado'
   * = no se pudo verificar sin conectarlo -- nunca asumir gratis por
   * default (regla de $0). */
  esGratis: boolean | 'no_confirmado';
  limites?: string;
  riesgo: string;
  utilidad: string;
  estadoConexion: EstadoConexionMcp;
  decision: DecisionMcp;
  fecha: string;
};
