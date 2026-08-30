# ESTILOS — cómo se opera la fábrica

## La idea en una línea

El **contenido** dice *qué se cuenta y qué evidencia hay*.
El **estilo** decide *cómo se ve*.
Se compilan y sale un guion que el animador ya sabe renderizar.

```
contenido/tema.json  +  estilo  ──▶  guiones/tema-<estilo>.json  ──▶  video
```

## Por qué existe esta capa

Medido sobre los 32 guiones que había antes, 246 planos:

| | |
|---|---|
| Paletas distintas | **3** (28 de 32 comparten una) |
| Planos sin `formato` declarado | 66 de 246 |
| Duración de plano | p25 1,7 s · mediana **2,3 s** · p75 3,0 s |
| Planos en ráfaga (<0,8 s) | **3 de 246** |
| CTA | 32 de 32 dicen "Seguime" |

No era falta de ganas del autor. Un "estilo" era lo que alguien tipeaba
a mano en ~90 campos por segmento, quince veces por video. Nadie
sostiene eso variando: se copia el guion anterior y se cambia el texto.

---

## Operación

```bash
python3 estilos.py listar                       # estilos, narrativas, ritmos
python3 estilos.py aplicar contenido/x.json --estilo MONEY
python3 estilos.py todos contenido/x.json       # los seis de una
```

Después, como siempre:

```bash
# Actions:  abastecer.yml   -> baja de Pexels lo que pide cada plano
# Actions:  producir-videos.yml --patron "guiones/x-*.json"
```

## Escribir contenido

```json
{
  "tema": "...",
  "narrativa": "money_story",
  "golpes": [
    {"rol": "hook",
     "texto": ["línea 1", "línea 2"],
     "narracion": "lo que dice la voz",
     "necesita": "consulta de Pexels en inglés"},

    {"rol": "prueba",
     "texto": ["la afirmación"],
     "cifra": {"valor": "67", "etiqueta": "VERIFICADO",
               "fuente": "Google Trends AR, 12 meses, 28/08/2026"},
     "evidencia": {"imagen": "capturas/trends.png",
                   "resaltado": [0.1, 0.5, 0.7, 0.9]}}
  ]
}
```

Campos por golpe: `rol`, `texto` (lista de líneas), `narracion`,
`necesita`, `imagen`, `cifra`, `evidencia`, `duracion`, `ritmo`,
`densidad`, `transicion`, `extra` (cualquier campo del animador).

**Si un golpe trae evidencia real, el compilador cambia la maqueta a
`prueba` aunque el estilo pidiera otra.** Una prueba no se reemplaza
por B-roll genérico.

---

## Los seis estilos

Comparten familia tipográfica y color de acento — eso los hace del
mismo canal. Se diferencian en fondo, maqueta por rol, cámara y densidad.

| id | qué es | cámara | metraje |
|---|---|---|---|
| `VS` | Editorial. Bloques escalonados sobre negro y blanco plenos. **Baseline.** | 0,35 | sí |
| `MONEY` | La cifra manda. Números enormes, comparaciones, pulso de flashes. | 1,15 | sí |
| `INVEST` | Evidencia primero. Grafito azulado, planos largos, frío. | 0,55 | sí |
| `SCREEN` | La captura es el video. Casi sin tipografía propia, cámara fija. | 0,0 | sí |
| `BRUTAL` | Solo tipografía. **Cero fotos.** El más barato de producir. | 0,0 | **no** |
| `DOC` | Metraje a sangre, cámara que deriva, texto mínimo abajo. | 1,35 | sí |

## Narrativas

`money_story` · `investigation` · `experiment` · `case_study` · `opportunity`

Cada una es una secuencia de **roles**. El estilo dice con qué maqueta
se dibuja cada rol, así narrativa y estilo se combinan sin conocerse.

## Ritmo

Cuatro registros, medidos de la referencia:

| | rango |
|---|---|
| `BURST` | 0,35–0,80 s |
| `FAST` | 0,80–1,50 s |
| `NORMAL` | 1,50–3,00 s |
| `SUSTAINED` | 3,00–8,00 s |

Cinco perfiles los secuencian: `irregular_a`, `irregular_b`,
`creciente`, `decreciente`, `parejo` (el de antes, para comparar).

**Techo por maqueta:** las que construyen (cascada, menu, lista, flujo,
prueba…) llegan a 8,5 s; las estáticas cortan en 4,8 s. Un `pleno` de
9 segundos es pantalla muerta; una `cascada` de 9 no, porque sigue
entrando texto.

## Densidad

`LOW` · `MEDIUM` · `HIGH` · `EXTREME`, y **cambia durante el video**:
el estilo la declara por rol. Típico: hook EXTREME, evidencia HIGH,
conclusión LOW.

## Reproducibilidad

La semilla sale del tema + estilo + ritmo. El mismo contenido con el
mismo estilo da **siempre** el mismo video; dos contenidos distintos no
caen en el mismo reparto de ritmo.


---

# ESCENA — una idea, varios planos

## El error que corrige

Hasta acá **"un golpe de contenido" y "un plano" eran la misma cosa**.
Cada vez que cortaba la imagen cambiaba también la idea. Con nueve
ideas en veinte segundos nadie termina de leer ninguna: se siente
rápido y mezclado. Fue la causa de que los seis videos de la prueba
anterior no sirvieran.

En la referencia pasa lo contrario: el bloque de texto se sostiene seis
u ocho segundos y lo que corta debajo es el **metraje**.

```json
{"formato": "escena", "duracion": 7.0,
 "lineas": ["Te escribieron", "a las diez", "Contestaste", "al otro día"],
 "entra":  [0.0, 0.9, 3.3, 4.2],
 "planos": [
   {"imagen": "...", "dur": 2.6,  "mov": "SUBTLE"},
   {"imagen": "...", "dur": 0.4,  "mov": "BURST"},
   {"imagen": "...", "dur": 0.35, "mov": "BURST"},
   {"imagen": "...", "dur": 3.65, "mov": "STATIC"}],
 "velo": 0.44}
```

## Estados de movimiento

| | qué hace | cuándo |
|---|---|---|
| `STATIC` | nada. Ni zoom ni paneo. | evidencia, pausa. **La ausencia de movimiento es intencional.** |
| `SUBTLE` | 100 → 103 % | no tiene que parecer un efecto |
| `ACTIVE` | 100 → 112 %, o paneo visible | información nueva |
| `BURST` | plano corto sin movimiento | el golpe es el corte |

## Regla de largo de línea

Medido sobre los cuadros de la referencia:

| | mediana | máx | líneas >20 car |
|---|---|---|---|
| Referencia | **9** | 18 | **0 de 17** |
| Lo que yo escribía | 18 | 25 | 3 de 8 |

Una línea larga obliga al motor a achicar la tipografía para que entre,
y ahí se pierde el golpe. `validar_hook.py` ahora avisa por encima de
20 caracteres.

## Lo que NO está resuelto

- **La ráfaga es decoración, no información.** El motor la ejecuta
  bien, pero en la demo los planos de ráfaga son B-roll genérico
  (una persona de noche, un reloj) que no agregan nada. §30 dice que
  una ráfaga *condensa información* — imagen, número, screenshot. Falta
  una regla que exija que cada plano de ráfaga aporte algo que el plano
  sostenido no tenga.
- **La correspondencia semántica del B-roll (§22).** La consulta
  "man reading phone message at night" devolvió un teléfono con
  escritura en otro idioma. El motor no puede juzgar eso; hay que
  revisar lo que baja Pexels antes de usarlo.
- **`escena` todavía no está enganchado a `estilos.py`.** Los seis
  estilos siguen compilando un plano por golpe. Ese es el paso
  siguiente y es el que hace que el arreglo llegue a los videos.


---

# TIPOGRAFÍA Y COLOR

## Las dos familias

| | fuente | para qué |
|---|---|---|
| Serif display | **Playfair Display** | el aire editorial. Contraste alto entre trazo grueso y fino |
| Grotesca | **Archivo** | variable en peso (100–900) **y en ancho** (62–125) |

Las dos son licencia **OFL**: uso comercial libre, sin atribución
obligatoria. Los `OFL.txt` están en `assets/fuentes/`.

Antes se caía en **Liberation Serif**, que es un clon de Times, y en
Space Grotesk Bold. Era la diferencia más grande contra la referencia:
la serif se veía genérica y la grotesca no llegaba al negro apretado
del titular.

Pesos con nombre, para no repartir números por el código:

```python
fnt(80, serif=True, peso="fina")      # Playfair 400
fnt(80, serif=True, italica=True)     # Playfair Italic
fnt(80, peso="titular")               # Archivo 860, ancho 88 — el titular
fnt(40, peso="fina")                  # Archivo 300
```

`fnt()` se llama miles de veces por segundo de video, así que ahora
cachea: abrir el `.ttf` y fijar los ejes de variación en cada llamada
costaba más que dibujar.

## Grading — por qué existe

Las fotos de un banco vienen cada una con su temperatura y su
exposición. Cuatro seguidas se ven como cuatro videos pegados — que es
literalmente lo que se describió como *"se mezcla con otros
contenidos"*. Ningún efecto arregla eso; lo arregla pasar todo el
metraje por la misma corrección.

**1. Igualar exposición.** Medido sobre las fotos que usa el proyecto:
venían entre **44 y 172** de luminancia media, casi 4× de diferencia.
Se lleva cada una hacia 104 con una curva de gamma — gamma y no
ganancia, porque multiplicar levanta los negros y quema los blancos.

| | mínimo | máximo | dispersión |
|---|---|---|---|
| antes | 44,3 | 172,3 | **3,89×** |
| después | 38,4 | 82,8 | **2,16×** |

No queda en 1,0× **a propósito**: hay un tope de gamma (0,70–1,55) para
que una foto que es oscura por decisión no termine pareciendo de día.
Las dos fotos más extremas chocan contra ese tope.

**2. Split-tone.** Sombras hacia el fondo de la paleta con un empujón
al azul, luces hacia un crema. Dos fotos con temperatura opuesta
terminan con el mismo negro y el mismo blanco.

**3. Saturación al 68 %.** El banco viene más saturado de lo que
conviene, y el acento de marca tiene que ser lo más saturado del cuadro.

## Lo que NO se gradea

**La evidencia.** Una captura que se muestra en `prueba` no pasa por la
corrección: corregirle el color a una prueba es alterarla. §18 pide
priorizar la legibilidad de la evidencia, no su estética.
