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
