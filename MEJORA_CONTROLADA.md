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

## §20 — TABLA DE COMPARACIÓN

| Variable | V0.5 | V0.6 |
|---|---|---|
| Fase | baseline | FASE 2 — HOOK |
| (se completa al medir V0.6) | | |
