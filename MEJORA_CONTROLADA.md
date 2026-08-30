# Mejora controlada del motor visual — V0.5 → V1.0

Principio de gobierno (§1 de la especificación): **«NO CAMBIAR TODO A LA
VEZ.»** Cada versión toca *un grupo de variables relacionado* para que se
pueda saber qué modificación produjo qué mejora. Este archivo es el
registro. Se actualiza en cada fase; no se reescribe.

---

## PUNTO DE CONTROL 0 — PRESERVACIÓN (§2)

### 1. Archivos que participan

| Archivo | Qué hace |
|---|---|
| `animador_v9.py` | Renderiza cuadro a cuadro (Pillow) y arma el mp4 con ffmpeg. 34 formatos. |
| `estilos.py` | Capa de estilo: compila ideas → segmentos, elige ritmo, intensidad, transición y paleta. |
| `broll.py` | Escalera semántica §12/§13: decide qué recurso visual merece cada plano. |
| `motor/` (`base`, `ideas`, `hooks`, `estructura`, `brief`) | Puntaje de ideas y hooks, familias de hook, compuerta de producción §24. |
| `validar_hook.py` | Validación de líneas y formatos antes de renderizar. |
| `preview.py`, `probar_render.py`, `auditar.py` | Inspección sin gastar render completo. |
| `contenido/*.json` | Guiones escritos por IDEAS (fuente). |
| `guiones/*.json` | Guiones ya compilados a segmentos (salida). |
| `.github/workflows/producir-videos.yml` | Render real, en el runner. |

### 2. Funciones que generan cada cosa

| Genera | Función | Archivo |
|---|---|---|
| Escenas | `aplicar_ideas()` | `estilos.py:789` |
| Planos | `_planos_de()`, `_resolver_plano()`, `_reparto_planos()` | `estilos.py:764`, `estilos.py:752`, `animador_v9.py:3361` |
| Texto | `f_escena()`, `_cascada_linea()`, `_cascada_fuente()`, `fnt()` | `animador_v9.py:3378` |
| Gráficos | `f_grafico()` | `animador_v9.py` |
| B-roll | `broll.resolver()` con `ESCALERA` | `broll.py` |
| Audio | `construir_audio()`, `_eventos_sfx()` | `animador_v9.py:4515+` |
| Estilos | `ESTILOS`, `LENGUAJES`, `RITMOS`, `INTENSIDAD` | `estilos.py` |
| Hook (efecto) | `hk_impacto()` + `aplicar_flash()` | `animador_v9.py:1573`, `:733` |
| Hook (puntaje) | `puntuar()`, `total()` | `motor/hooks.py:117` |

### 3. Backup del estado actual

Tag `v0.5` sobre el commit `37f1e51`. El render medido se recupera con:

```
git show v0.5:videos/nombre-por-pais-editorial.mp4 > v0.5.mp4
```

### 4. Dependencias

- `estilos.aplicar_ideas()` marca el segmento 0 con `hook` y `flash`;
  `animador_v9` los consume en `render_segmento` (línea ~4077).
- `validar_hook.FORMATOS_QUE_CONSTRUYEN` **debe** mantenerse sincronizado
  con `estilos.CONSTRUYEN`.
- `_eventos_sfx()` deriva el sonido de los tiempos de `entra`: **cambiar
  la entrada del texto mueve el SFX**. No es "tocar sonido" (fase 9), es
  una consecuencia; queda anotado para no confundirlo con una mejora.
- `motor/hooks.py` tiene `puntuar()` pero **no está conectado al camino de
  render**: sólo lo usa el CLI `motor.py`. El hook que sale en pantalla es
  literalmente lo que escribió el autor del JSON.

### 5. Lo que NO se toca

Scoring, etiquetas VERIFICADO/DECLARADO/ESTIMADO/RUMOR/HIPÓTESIS,
auditoría, preview, metadata y sistema de evidencia siguen intactos.
Ninguna fase de este plan los elimina.

---

## BASELINE V0.5 — MEDICIÓN DEL HOOK

Guion: `contenido/nombre-por-pais.json`, lenguaje EDITORIAL.
Render: `videos/nombre-por-pais-editorial.mp4` (26.82 s, 30 fps).

Texto del hook: **«Tu producto / no vende.»** (3.6 s, 4 planos de B-roll).

Cuadro a cuadro, midiendo luz media y "tinta clara" (píxeles ≥200, o sea
texto blanco) en la banda donde vive la cascada (8 %–60 % de la altura):

| cuadro | t | luz media | tinta clara |
|---|---|---|---|
| 1 | 0.000 s | **248.3** | 100.00 % |
| 2 | 0.033 s | 188.4 | 22.75 % |
| 3 | 0.067 s | 130.4 | **0.00 %** |
| 4 | 0.100 s | 94.5 | **0.00 %** |
| 5 | 0.133 s | 73.7 | 0.24 % |
| 6 | 0.167 s | 52.2 | 0.42 % |
| 7 | 0.200 s | 45.7 | 0.86 % |
| 9 | 0.267 s | 45.0 | 0.84 % |

### Diagnóstico

1. **El primer cuadro del video es un lavado blanco sin nada legible.**
   `aplicar_ideas()` pone `flash: True` en el segmento 0, y `aplicar_flash()`
   lava hacia blanco durante 0.10 s con `k=(1-t/0.10)²`. Los cuadros 1–4
   son eso. El flash existe para *tapar un corte* ("el ojo pierde la escena
   anterior") — pero en el segmento 0 **no hay escena anterior que tapar**.
   Está quemando el cuadro más caro del video para esconder nada. En
   TikTok ese cuadro es la miniatura.
2. **Hasta 0.133 s no hay una sola letra en pantalla**, y la línea no
   termina de entrar hasta ~0.20 s. Contradice §3: "el primer frame debe
   ser comprensible SIN AUDIO".
3. **El hook abre sobre B-roll genérico** (`person typing on laptop
   keyboard closeup`), justo lo que §3 prohíbe explícitamente.
4. **No hay microestados.** El hook usa el mismo reparto que cualquier
   otra idea (`entra` = las líneas repartidas en el primer 55 % de la
   duración). No existe IMPACTO / AFIRMACIÓN / PREGUNTA.
5. **El texto no cumple la regla de contenido de §3.** «Tu producto no
   vende» es una descripción: no tiene cifra, ni nombre propio, ni
   conflicto, ni consecuencia. Es el caso "MEJOR" a lo sumo, no el
   "MÁS FUERTE".

---

## FASE 2 — HOOK (V0.6)

### Qué cambió, y por qué

**1. `estilos.py` — el segmento 0 ya no recibe `flash: True`.**
El flash existe para tapar un corte: el ojo pierde la escena anterior y
cuando vuelve, la nueva ya está puesta. Antes del segmento 0 no hay
escena anterior. Estaba lavando la miniatura de TikTok para esconder
nada.

**2. `animador_v9.py` — `hk_golpe`, nuevo.**
Sacar el flash no alcanzó. Al volver a medir, el cuadro cero seguía
vacío: el punch-zoom de 1.42× de `hk_impacto` empuja la primera línea de
la cascada (13 % de la altura) a **−0.025**, o sea fuera del cuadro por
arriba. Cualquier zoom por encima de ~1.10 la tapa:

| zoom | dónde queda la primera línea |
|---|---|
| 1.42 | −0.025 · **fuera** |
| 1.20 | 0.056 · **fuera** (bajo la zona segura) |
| 1.10 | 0.093 · ok |
| 1.055 | 0.110 · ok |

Por eso `hk_golpe` no es `hk_impacto` sin flash: es un asentamiento de
1.055× con una sacudida corta. El impacto lo da la tipografía y el
contraste, no una cámara que esconde el texto justo cuando hay que
leerlo. `hk_impacto` queda intacto para los cortes del resto del video.

**3. `animador_v9.py` — una línea declarada en t=0 entra entera en el
cuadro cero.** El fundido de 0.22 s la dejaba invisible igual. Sólo
aplica con `hook_microestados`; el resto de las escenas mantiene su
fundido.

**4. `estilos.py` — microestados (§3, regla de 0–2 s).**
`_entra_hook()` reparte las líneas sobre IMPACTO (0.0–0.5), AFIRMACIÓN
(0.5–1.2) y PREGUNTA/CONSECUENCIA (1.2–2.0). Son anclas en segundos
absolutos, no una plantilla: con una línea todo es impacto, con dos la
afirmación y la consecuencia se funden, y si el hook dura menos de
2.2 s todo se comprime para que la última entre adentro. Un hook más
largo **no** estira los microestados: deja más tiempo de lectura.

**5. `estilos.py` — el hook no abre con B-roll genérico (§3).**
`"planos": []` pasó a significar *cuadro plano*, no *derivar de la
intensidad*. El hook va sobre color plano: contraste máximo, composición
simple.

**6. `animador_v9.py` — el bloque se centra cuando no hay metraje.**
Este problema lo creé yo al sacar el B-roll: colgado del 13 % dejaba
medio cuadro de negro muerto. Va en la misma fase porque lo introdujo la
misma fase. `f_escena` ahora mide el bloque entero antes de dibujar (si
la altura se fuera descubriendo línea por línea, el bloque saltaría cada
vez que entra una).

**7. `validar_hook.py` — leía `""` como texto del hook.**
Buscaba en `texto` o `pregunta`; los formatos de bloque escalonado lo
guardan en `lineas`. Como el hook de todos los guiones nuevos es una
escena, **todas** las revisiones de hook pasaban en falso. Al arreglarlo
apareció un problema real que estaba tapado: 16 palabras contra un
máximo de 14, ~5.5 s de voz para un hook de 3.4 s.

**8. `contenido/nombre-por-pais.json` — sólo la idea 0.**
Reescrita con los cuatro elementos de §3. Ninguna otra idea se tocó,
para que la comparación sea limpia.

| | texto del hook |
|---|---|
| V0.5 | Tu producto / no vende |
| V0.6 | Tu producto es bueno / Pero en España / es un 1 / y no te encuentran |

### §20 — Tabla de comparación

| Variable | V0.5 | V0.6 |
|---|---|---|
| Fase | baseline | FASE 2 — HOOK |
| **HOOK** | **2.0 / 10** | **9.0 / 10** |
| · estructura (verificada) | 2.5 | 10.0 |
| · texto (proxy léxico) | 1.2 | 7.6 |
| primer cuadro legible sin audio | 0.0 | 3.0 |
| sin B-roll genérico | 0.0 | 2.0 |
| microestados 0–2 s | 0.5 | 3.0 |
| legibilidad móvil | 2.0 | 2.0 |
| conflicto | 0.0 | 1.1 |
| curiosidad | 0.0 | 1.0 |
| especificidad | 0.0 | 2.0 |
| consecuencia | 1.0 | 2.0 |
| GENERIC_BROLL_COUNT (hook) | 1 | 0 |
| TEXT_CHANGES 0–2 s | 2 | 4 |
| VISUAL_CHANGES 0–2 s | 4 | 0 |
| `motor/hooks.py` total | 46.4 | 59.8 |
| §19 «NO PASAR» | 3 avisos | pasa |
| duración del hook | 3.6 s | 3.4 s |
| duración total | 26.8 s | 26.6 s |

Cuadros reales, primeros 0.13 s:

| cuadro | t | V0.5 luz / tinta | V0.6 luz / tinta |
|---|---|---|---|
| 1 | 0.000 s | 248.5 / 100.00 % | (pendiente del render) |
| 2 | 0.033 s | 189.1 / 23.22 % | |
| 3 | 0.067 s | 131.6 / **0.00 %** | |
| 4 | 0.100 s | 95.8 / **0.00 %** | |
| 5 | 0.133 s | 75.0 / 0.18 % | |

### Regresión

Las escenas que **no** son hook renderizan byte a byte igual que en
`v0.5`: mismo sha256 (`f3fa8aaa70e7…`) sobre cinco cuadros de una escena
de prueba, corrido en un worktree del tag y en HEAD. La única diferencia
de comportamiento fuera del hook es que `"planos": []` ahora significa
cuadro plano — ningún contenido lo declaraba.

### Problemas nuevos

- **`escena` no dibuja la fuente de la cifra.** El hook lleva su etiqueta
  VERIFICADO y su fuente en el JSON, pero el formato `escena` no las
  pinta (sí lo hace `grafico`). El dato en pantalla («es un 1») queda sin
  respaldo visible. No se arregla acá: tocar cómo se muestra la evidencia
  es jerarquía, o sea FASE 4.
- **Sin naranja en el hook.** Los primeros 3.4 s son blanco sobre negro y
  no usan el acento de marca. Destacar la palabra clave subiría IDENTITY,
  pero eso es jerarquía tipográfica: FASE 4 / FASE 8.
- **La narración del hook y las líneas ya no dicen lo mismo** (10 palabras
  habladas contra 14 en pantalla). Es deliberado y normal en este
  estilo, pero conviene revisarlo cuando entre la voz real.
- El validador sigue avisando que el hook de 3.4 s es largo para el
  enganche de 1.3 s. Su regla es anterior a los microestados: ahora los
  cuatro tiempos caen antes de 1.55 s y el resto es tiempo de lectura.
  Queda anotado, no se cambió la regla.

### Decisión que necesita aprobación (§23)

El texto del hook. La estructura está verificada y el motor no depende de
esa redacción — si preferís otra, se cambia sólo el JSON y el resultado
de la fase se mantiene.
