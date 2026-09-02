# Experimento 001 — Revelación progresiva vs. cifra directa

Formalización de un experimento A/B real (orden maestra sección 18),
usando el contrato `ExperimentoAB` de `fabrica/memoria/tipos.ts`
(Ronda 5). **Estado: diseñado, NO ejecutado todavía** — no hay ninguna
variante generada ni publicada. Este documento es el diseño, no un
resultado.

## Hipótesis

Una revelación progresiva de una cifra (contador animado, la cifra
"sube" hasta el valor final) genera más interés/retención que
mostrarla completa desde el primer frame.

**Base de la hipótesis:** `fabrica/research/retencion.md`, sección 1
(Loewenstein 1994) — la curiosidad se activa por una brecha de
información, no por informacion completa de una. Es una base
académica real, pero la hipótesis en sí (aplicada a ESTE formato de
video) sigue siendo una hipótesis, no un hecho — solo publicar y medir
lo confirma o lo descarta.

## Variable modificada

Forma de revelar la información (única cosa que cambia entre A y B).

## Variables controladas

- Guion (mismo texto, misma narración).
- Voz (mismo clip de audio real, mismo timing).
- Duración aproximada de la escena.
- Golpe de transición de entrada/salida.
- Estilo editorial combinado.

## Variantes

| Variante | Descripción | Componente candidato |
|---|---|---|
| A | Cifra completa desde el primer frame | `cifra-se-cae` o `recibo` (revelan de golpe) |
| B | Cifra progresiva (contador animado) | `contador` (ya sube de 0/desde hasta el valor final) |

## Cómo se ejecutaría (próxima ronda con datos)

1. Generar dos árboles de composición idénticos salvo por el
   componente de la unidad en cuestión (A: uno de revelación directa,
   B: `contador`).
2. Publicar ambos (mismo tema, misma cuenta, separados en el tiempo o
   como contenido A/B si la plataforma lo permite).
3. Cargar `resultadoReal` de cada uno en `laboratorio.json` con
   `registrarResultadoReal()`.
4. Solo entonces escribir una `conclusion` — nunca antes.

## Resultado

**Sin datos todavía.** No inventar — este campo se completa
únicamente cuando exista una publicación real medida.
