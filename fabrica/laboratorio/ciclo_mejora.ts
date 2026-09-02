/**
 * Ciclo de mejora controlado (Ronda 4, orden maestra seccion 20).
 *
 * GENERAR -> QA (composicion + critica editorial) -> DETECTAR PROBLEMAS
 * -> PROPONER MEJORAS -> APLICAR CAMBIOS SEGUROS -> GENERAR DE NUEVO ->
 * COMPARAR, con un limite de iteraciones y un criterio de parada
 * explicito -- NUNCA un loop infinito, nunca "una IA decide que
 * cambiar" sin poder explicar el cambio.
 *
 * DECISION DE ALCANCE, documentada (seccion 35: "evitar
 * sobreingenieria"): este ciclo opera sobre el ARBOL DE COMPOSICION
 * (el JSON), no sobre el video renderizado -- volver a renderizar con
 * Remotion en cada iteracion es costoso (minutos, no segundos) y el
 * QA tecnico que de verdad necesita el mp4 (checks_duros.py: silencios,
 * pantallas negras, volumen) no cambia por reordenar golpes/evitar
 * componentes, asi que no aporta nada nuevo iterar sobre eso. El
 * render final (una sola vez, sobre el arbol que gano el ciclo) sigue
 * pasando por checks_duros.py como siempre.
 *
 * QUE SE CONSIDERA UNA "CORRECCION SEGURA" (unica clase implementada
 * hoy, deliberadamente conservador -- seccion 20: "si no puede
 * determinar que una modificacion mejora algo, no hacerla
 * arbitrariamente"): un golpe de transicion repetido consecutivo
 * (`verificar_golpe_repetido_consecutivo` en checks_composicion.py) es
 * mecanico y reversible -- agregarlo a `evitarGolpesExtra` para el
 * proximo intento usa el mismo camino ya real y testeado de
 * DirectorAudio.decidirParaUnidad(evitarGolpes). Otras alertas
 * (cifra repetida en texto, categoria repetida, energia plana, etc.)
 * NO se "corrigen" automaticamente aca -- requieren una decision de
 * contenido/guion que este ciclo no esta en condiciones de tomar
 * solo, y quedan reportadas en el historial para revision humana.
 */
import {execSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import type {ArbolComposicion} from '../composicion/tipos';
import type {TipoGolpe} from '../directores/audio';

const RAIZ = path.resolve(__dirname, '..', '..');
const QA_COMPOSICION = path.join(RAIZ, 'fabrica/qa/checks_composicion.py');
const CRITICA_EDITORIAL = path.join(RAIZ, 'fabrica/qa/critica_editorial.py');

export type ParametrosGeneracion = {
  evitarComponentesExtra: string[];
  evitarGolpesExtra: TipoGolpe[];
};

export type ResultadoIteracion = {
  intento: number;
  arbol: ArbolComposicion;
  alertasComposicion: string[];
  alertasCritica: string[];
  correccionesPropuestas: string[];
  seAplicaronCorrecciones: boolean;
};

const RE_GOLPE_REPETIDO = /mismo golpe de transicion \(['"]([a-z]+)['"]\)/;

/** Analiza las alertas de una iteracion y devuelve SOLO las
 * correcciones de la clase "segura" (ver docstring del archivo).
 * Exportada aparte para poder testearla sin shell-out a python. */
export function extraerCorreccionesSeguras(alertas: string[]): {golpes: TipoGolpe[]; razones: string[]} {
  const golpes = new Set<TipoGolpe>();
  const razones: string[] = [];
  for (const alerta of alertas) {
    const m = alerta.match(RE_GOLPE_REPETIDO);
    if (m) {
      golpes.add(m[1] as TipoGolpe);
      razones.push(`golpe '${m[1]}' repetido consecutivo -> se agrega a evitarGolpesExtra para el proximo intento`);
    }
  }
  return {golpes: [...golpes], razones};
}

function ejecutarJson(cmd: string): any {
  try {
    return JSON.parse(execSync(cmd, {encoding: 'utf-8'}));
  } catch (e: any) {
    // checks_composicion.py sale con codigo 1 si hay PROBLEMAS duros
    // (no alertas) -- igual imprime el JSON completo por stdout antes
    // de salir, asi que lo leemos del error en vez de tratarlo como
    // una falla real del ciclo.
    if (e.stdout) return JSON.parse(e.stdout.toString());
    throw e;
  }
}

/**
 * Corre el ciclo. `generar` es la funcion real del generador de un
 * video (ej. generar_demo_05.ts expone `generarArbol(params)`) --
 * este modulo NO sabe nada de guiones/voz/componentes especificos,
 * solo orquesta QA -> correccion -> reintento sobre lo que `generar`
 * le devuelva.
 */
export function correrCicloMejora(
  generar: (params: ParametrosGeneracion) => ArbolComposicion,
  opciones: {maxIteraciones?: number; rutaTemporal: string; publicDir?: string}
): ResultadoIteracion[] {
  const maxIteraciones = opciones.maxIteraciones ?? 2;
  const historial: ResultadoIteracion[] = [];
  let params: ParametrosGeneracion = {evitarComponentesExtra: [], evitarGolpesExtra: []};

  for (let intento = 1; intento <= maxIteraciones; intento++) {
    const arbol = generar(params);
    writeFileSync(opciones.rutaTemporal, JSON.stringify(arbol, null, 2));

    const argPublicDir = opciones.publicDir ? ` --public-dir "${opciones.publicDir}"` : '';
    const composicion = ejecutarJson(`python3 "${QA_COMPOSICION}" "${opciones.rutaTemporal}"${argPublicDir}`);
    const critica = ejecutarJson(`python3 "${CRITICA_EDITORIAL}" "${opciones.rutaTemporal}"`);

    const alertasComposicion: string[] = composicion.alertas ?? [];
    const alertasCritica: string[] = [
      ...critica.repeticion, ...critica.ritmo, ...critica.visual,
      ...critica.narrativa, ...critica.audiovisual, ...critica.coherencia,
    ];

    const {golpes, razones} = extraerCorreccionesSeguras([...alertasComposicion, ...alertasCritica]);
    const golpesNuevos = golpes.filter((g) => !params.evitarGolpesExtra.includes(g));
    const hayMasIntentos = intento < maxIteraciones;
    const seAplicaran = golpesNuevos.length > 0 && hayMasIntentos;

    historial.push({
      intento, arbol, alertasComposicion, alertasCritica,
      correccionesPropuestas: razones,
      seAplicaronCorrecciones: seAplicaran,
    });

    // Criterio de parada (seccion 20, explicito): sin correcciones
    // seguras NUEVAS que aplicar, o se llego al tope de iteraciones.
    if (!seAplicaran) break;

    params = {
      evitarComponentesExtra: params.evitarComponentesExtra,
      evitarGolpesExtra: [...params.evitarGolpesExtra, ...golpesNuevos],
    };
  }
  return historial;
}
