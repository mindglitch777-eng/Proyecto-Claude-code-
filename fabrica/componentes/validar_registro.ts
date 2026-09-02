/**
 * Valida fabrica/componentes/registro.json contra dos cosas:
 *   1. La forma (todos los campos requeridos del schema, tipos y
 *      enums correctos) -- validacion manual, sin agregar ajv como
 *      dependencia (regla de $0 y de no sobreingenieria: el schema es
 *      chico y estable).
 *   2. La REALIDAD del repo: que `archivo` exista en
 *      remotion-spike/src/ y que `exportacion` sea de verdad un
 *      `export const <nombre>` en ese archivo. Esto es lo que evita
 *      que el registro se desincronice del codigo real con el tiempo
 *      (ej. si alguien borra o renombra un componente).
 *
 * Uso: npx tsx validar_registro.ts
 */
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import type {ComponenteRegistrado, Categoria, Ritmo, CapacidadTexto, TipoAsset} from './tipos';

const RAIZ_FABRICA = __dirname;
const RAIZ_REMOTION_SRC = path.resolve(RAIZ_FABRICA, '../../remotion-spike/src');

const CATEGORIAS: Categoria[] = ['texto', 'cifra', 'comparacion', 'timeline', 'diagrama', 'lista', 'logos', 'encuesta', 'cuenta_regresiva', 'montaje', 'otro'];
const RITMOS: Ritmo[] = ['estatico', 'dinamico', 'muy_dinamico'];
const CAPACIDADES: CapacidadTexto[] = ['ninguna', 'corta', 'media', 'larga'];
const TIPOS_ASSET: TipoAsset[] = ['ninguno', 'foto', 'video', 'icono'];

const errores: string[] = [];
const advertencias: string[] = [];

function err(id: string, msg: string) {
  errores.push(`[${id}] ${msg}`);
}
function warn(id: string, msg: string) {
  advertencias.push(`[${id}] ${msg}`);
}

function validarForma(c: any, idx: number) {
  const id = c.id ?? `(sin id, indice ${idx})`;
  const requeridos = ['id', 'archivo', 'exportacion', 'categoria', 'funcion', 'intensidad', 'ritmo', 'capacidadTexto', 'requiereAssets', 'duracionMinMaxSeg', 'compatibleCon', 'soportaAudioSincronizado', 'estado'];
  for (const campo of requeridos) {
    if (c[campo] === undefined) err(id, `falta el campo requerido "${campo}"`);
  }
  if (c.categoria && !CATEGORIAS.includes(c.categoria)) err(id, `categoria invalida: ${c.categoria}`);
  if (c.ritmo && !RITMOS.includes(c.ritmo)) err(id, `ritmo invalido: ${c.ritmo}`);
  if (c.capacidadTexto && !CAPACIDADES.includes(c.capacidadTexto)) err(id, `capacidadTexto invalida: ${c.capacidadTexto}`);
  if (typeof c.intensidad === 'number' && (c.intensidad < 0 || c.intensidad > 1)) err(id, `intensidad fuera de rango 0-1: ${c.intensidad}`);
  if (c.requiereAssets && !TIPOS_ASSET.includes(c.requiereAssets.tipo)) err(id, `requiereAssets.tipo invalido: ${c.requiereAssets.tipo}`);
  if (c.duracionMinMaxSeg && (!Array.isArray(c.duracionMinMaxSeg) || c.duracionMinMaxSeg.length !== 2)) {
    err(id, 'duracionMinMaxSeg debe ser [min, max]');
  } else if (c.duracionMinMaxSeg && c.duracionMinMaxSeg[0] > c.duracionMinMaxSeg[1]) {
    err(id, 'duracionMinMaxSeg: el minimo es mayor que el maximo');
  }
  if (c.estado !== 'validado' && c.estado !== 'sin_validar') err(id, `estado invalido: ${c.estado}`);
}

function validarContraElRepo(c: ComponenteRegistrado) {
  const rutaArchivo = path.join(RAIZ_REMOTION_SRC, c.archivo);
  if (!existsSync(rutaArchivo)) {
    err(c.id, `el archivo no existe: remotion-spike/src/${c.archivo}`);
    return;
  }
  const contenido = readFileSync(rutaArchivo, 'utf-8');
  const patron = new RegExp(`export const ${c.exportacion}\\b`);
  if (!patron.test(contenido)) {
    err(c.id, `no se encontro "export const ${c.exportacion}" en ${c.archivo} -- el registro esta desincronizado del codigo real`);
  }
  if (c.estado === 'sin_validar') {
    warn(c.id, 'estado=sin_validar: la metadata es una primera aproximacion, no se leyo el codigo a fondo (ver notas)');
  }
}

function main() {
  const registro: ComponenteRegistrado[] = JSON.parse(readFileSync(path.join(RAIZ_FABRICA, 'registro.json'), 'utf-8'));

  const ids = new Set<string>();
  for (const [idx, c] of registro.entries()) {
    validarForma(c, idx);
    if (c.id) {
      if (ids.has(c.id)) err(c.id, 'id duplicado en el registro');
      ids.add(c.id);
    }
    if (errores.filter((e) => e.startsWith(`[${c.id}]`)).length === 0) {
      validarContraElRepo(c);
    }
  }

  const validados = registro.filter((c) => c.estado === 'validado').length;
  console.log(`${registro.length} componentes en el registro (${validados} validados, ${registro.length - validados} sin_validar).`);

  if (advertencias.length) {
    console.log(`\n${advertencias.length} advertencia(s):`);
    advertencias.forEach((a) => console.log('  ' + a));
  }

  if (errores.length) {
    console.error(`\n${errores.length} ERROR(ES):`);
    errores.forEach((e) => console.error('  ' + e));
    process.exit(1);
  }
  console.log('\nRegistro valido: forma correcta y todos los componentes existen de verdad en remotion-spike/src/.');
}

main();
