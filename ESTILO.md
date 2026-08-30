# ESTILO — el motor visual, medido sobre la referencia

Análisis de 5 videos de **@ventasilenciosa** que pasó el operador
(grabaciones de pantalla, 480×1104, 30 fps, 38 a 79 segundos).
Todo lo de acá abajo está **medido**, no supuesto. Lo que es
interpretación va dicho como tal.

---

## 1. RITMO DE CORTE — medido

Detección de cambio de plano (`scene > 0.25`, recortando la UI de
TikTok):

| video | duración | cortes | 1 cada | hueco mín | mediana | máx |
|---|---|---|---|---|---|---|
| 1 | 50,6 s | 24 | 2,11 s | 0,50 s | 1,63 s | 7,07 s |
| 2 | 70,2 s | 67 | 1,05 s | 0,03 s | 0,47 s | 7,10 s |
| 3 | 58,8 s | 62 | 0,95 s | 0,03 s | 0,60 s | 3,67 s |
| 4 | 38,1 s | 19 | 2,00 s | 0,10 s | 1,80 s | 4,90 s |
| 5 | 78,7 s | 37 | 2,13 s | 0,10 s | 1,20 s | 10,7 s |

**El hallazgo importante: la cadencia NO es pareja.** El mínimo de
0,03 s (un cuadro) contra máximos de 7 a 10 segundos significa
ráfagas de cortes casi por cuadro mezcladas con planos largos que se
sostienen. Nuestro animador venía con segmentos de 1,5 a 3 s bastante
uniformes; eso se lee como metrónomo y es justo lo que la referencia
no hace.

También: **los videos duran 38 a 79 segundos**, no 20. La regla de
"bajo 25 s" que traía `validar_hook.py` no es lo que hace esta cuenta.

## 2. AUDIO — medido

| video | integrado | pico real | rango (LRA) |
|---|---|---|---|
| 1 | −13,9 LUFS | −2,5 dBTP | 3,3 LU |
| 2 | −13,2 LUFS | −2,6 dBTP | 5,7 LU |
| 5 | −13,4 LUFS | −2,6 dBTP | 1,5 LU |

Narración continua, muy comprimida. Un LRA de 1,5 a 5,7 es la voz
"pegada al micrófono" que no baja nunca. Nuestra mezcla terminaba en
`alimiter` sin normalizar; ahora cierra en
`loudnorm=I=-14:TP=-1.5:LRA=4`.

---

## 3. LAS DOS CAPAS DE TEXTO

Corren **al mismo tiempo** y no compiten:

### Capa 1 — el bloque escalonado (`formato: "cascada"`)

Es el efecto que da nombre a todo esto. **No** son palabras cayendo:
es un bloque de líneas que **se acumula y se queda** mientras el
metraje corta debajo.

```
Por $0.50 centavos          serif, pegado a la izquierda
              más...        sans pesada y apretada, corrida a la derecha
Agrandas también            sans liviana, izquierda otra vez
         la bebida          sans pesada, centrada
```

Las cuatro cosas que lo hacen ese efecto y no otro:

1. **Las líneas entran de a una y no se van.** Al final del plano
   están las cuatro. Eso deja leer la frase entera mientras la voz ya
   pasó a otra cosa.
2. **Cada línea tiene otra tipografía.** Serif, sans liviana y sans
   pesada alternadas. El contraste es lo que se ve caro, no el
   movimiento.
3. **Cada línea tiene otra sangría.** Izquierda, derecha, centro. El
   escalonado *es* la cascada.
4. **Van de a pares:** dos líneas juntas, hueco grande, dos líneas
   juntas. Sin ese hueco se lee como lista y se pierde el remate.

El texto va directo sobre el metraje, sin caja ni franja: solo un halo
difuminado. La sombra dura desplazada es el tic de plantilla.

### Capa 2 — la palabra suelta (`captions_estilo: "chico"`)

Una sola palabra, **chica** (~4 % del ancho), fina, centrada, a media
altura baja, sin franja oscura y sin rebote. Solo confirma lo que la
voz acaba de decir. Nada que ver con el caption grande que teníamos.

---

## 4. TRATAMIENTO DEL METRAJE (`encuadre`)

| valor | qué es |
|---|---|
| `sangre` | a pantalla completa |
| `tarjeta` | tarjeta redondeada centrada sobre color plano. El negro alrededor deja respirar al texto de arriba y abajo |
| `plano` | sin metraje: solo color y tipografía |

Y `"claro": true` da vuelta el cartel: fondo claro, letra oscura.

**El salto entre negro pleno y blanco pleno ES la transición.** La
referencia alterna los dos todo el tiempo y no usa ningún efecto: el
ojo ya lo lee como un golpe. Por eso `corte_duro` alcanza casi siempre.

## 5. LA CARTA DE PRECIOS (`formato: "menu"`)

Filas que se acumulan, cada una con texto chico a un lado y una
**miniatura redondeada** del producto al otro, escalonadas y no
alineadas en grilla. Es la forma más barata de mostrar "esto cuesta
tanto y viene con esto" sin filmar nada.

---

## 6. LO QUE FALTA PARA QUE SEA IGUAL

Honesto, en orden de cuánto se nota:

1. **La serif.** La referencia usa una serif de display tipo Playfair
   (contraste alto, remates finos). Nosotros caemos en Liberation
   Serif, que es un Times y se ve genérico. Se arregla bajando
   Playfair Display (licencia OFL, uso comercial libre) — el operador
   frenó la descarga, queda pendiente su visto bueno.
2. **La sans pesada.** La referencia es una grotesca geométrica muy
   apretada y muy pesada. Space Grotesk Bold con tracking −3 % se
   acerca pero no llega. Archivo variable (peso + ancho) sería el
   reemplazo.
3. **Ilustraciones de silueta blanca sobre negro** — dos personas en
   una mesa, íconos de hamburguesa/papas/bebida. Las usa para explicar
   sin filmar. No las tenemos y no salen de un banco de fotos: hay que
   dibujarlas.
4. **La cadencia irregular.** El motor ya puede hacer planos de
   cualquier duración; lo que falta es escribir los guiones con
   ráfagas y sostenidos en vez de todo a 2 s.
