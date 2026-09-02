/**
 * Corrección real (Ronda 5): `directores/audio.ts` menciona desde
 * Ronda 2 un campo `mecanismoRetencion` en "fabrica/guion/tipos.ts" --
 * ese archivo NUNCA se llegó a escribir (la carpeta existía vacía, sin
 * historial en git). `PENDIENTES.md` (ítem 5, Ronda 1) afirmaba que
 * "los TIPOS y el CONTRATO de una unidad narrativa" ya estaban
 * construidos -- era una afirmación incorrecta, encontrada auditando
 * el estado real de `fabrica/` para esta ronda. Se documenta la
 * corrección en `PENDIENTES.md`, no se oculta.
 *
 * Este archivo es intencionalmente MÍNIMO: no inventa un pipeline de
 * ideación automática (eso sigue bloqueado por la regla de $0, ver
 * PENDIENTES.md ítem 5) -- solo define el contrato mínimo que
 * `fabrica/directores/retencion/` necesita para poder mapear un video
 * completo (qué función narrativa cumple cada unidad), reusando la
 * intención que YA decide `DirectorEdicion` en vez de inventar un
 * campo paralelo que nadie llenaría.
 */
import type {IntencionEdicion} from '../directores/edicion/tipos';

/** Mecanismo de retención declarado para una unidad narrativa --
 * hoy se deriva de `EstrategiaEdicion.intencion` (Ronda 4), no se
 * escribe a mano en un guion aparte. Se mantiene como alias
 * documentado para que el comentario histórico en `directores/audio.ts`
 * deje de referenciar un archivo inexistente. */
export type MecanismoRetencion = IntencionEdicion;
