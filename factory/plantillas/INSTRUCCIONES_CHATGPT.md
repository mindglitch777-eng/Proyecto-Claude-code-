# Instrucciones para ChatGPT — Product Factory

Copiá y pegá este documento entero en ChatGPT cuando le pidas investigación.

---

## Qué estamos haciendo

Buscamos **oportunidades de productos digitales** para el mercado hispanohablante.
El modelo: nosotros investigamos y fabricamos el producto; otras personas lo
venden con contenido orgánico desde el celular y cobran comisión.

**No buscamos ideas.** Buscamos problemas con evidencia de que alguien ya paga
por resolverlos.

---

## La regla más importante

**No intentes demostrar que una oportunidad es buena. Intentá demostrar que es
mala.** Buscá activamente competencia que no habíamos visto, ausencia de
demanda, alternativas gratuitas, saturación, dependencia de plataformas.

Una oportunidad que sobrevive a un intento honesto de destruirla vale mucho
más que una que nadie cuestionó.

---

## Nunca mezcles hechos con suposiciones

Cada afirmación lleva un `evidence_type`:

| Tipo | Significa | ¿Necesita URL? |
|---|---|---|
| `DIRECT` | Lo viste vos en la fuente | **Sí, obligatoria** |
| `INDIRECT` | Alguien confiable lo reporta | **Sí, obligatoria** |
| `INFERENCE` | Deducción a partir de datos que sí tenemos | No |
| `HYPOTHESIS` | Suposición sin verificar | No |

**Si no tenés la URL, no lo marques como DIRECT o INDIRECT.** El sistema
degrada automáticamente a `INFERENCE` cualquier cosa que venga sin fuente, y
queda anotado que vino mal.

Preferimos 3 oportunidades con evidencia real que 50 inventadas.

---

## Si no pudiste consultar algo, decilo

No dejes un hueco silencioso. Usá el campo `blocked`:

```json
"blocked": [
  {"target": "catálogo de Hotmart", "reason": "requiere login"}
]
```

**"No encontré competencia" y "no pude mirar" son cosas distintas.** Confundirlas
nos hace tomar decisiones sobre datos falsos.

---

## Formato de entrega

Devolveme **un array JSON**. Una entrada por oportunidad. Este es el formato
completo — los campos que no puedas llenar, omitilos (no inventes):

```json
[
  {
    "opportunity": "Nombre corto y descriptivo",
    "niche": "Mercado grande (ej: Mascotas, Fotografía, Trámites)",
    "subniche": "Segmento dentro del nicho",
    "hypersubniche": "Nicho todavía más específico, si aplica",

    "problem": "El problema concreto, en una frase. OBLIGATORIO.",
    "target_buyer": "Quién tiene este problema, específico",
    "buyer_context": "Cuándo y dónde le aparece el problema",
    "pain": "Qué le cuesta hoy: plata, tiempo, vergüenza, riesgo",
    "frequency": "diaria | semanal | mensual | puntual | estacional",
    "current_solution": "Qué hace hoy sin nuestro producto",

    "product_concept": "Qué le venderíamos",
    "product_format": "herramienta web | calculadora | generador | kit | plantillas | curso corto | biblioteca",
    "market": "AR | MX | ES | CO | CL | PE | LATAM | GLOBAL",

    "source": "chatgpt",
    "notes": "Cualquier cosa relevante que no entre en los otros campos",

    "evidence": [
      {
        "dimension": "demand",
        "claim": "Qué se afirma",
        "evidence": "Qué lo respalda: número, cita textual, dato",
        "evidence_type": "DIRECT",
        "url": "https://...",
        "confidence": 0.8,
        "notes": ""
      }
    ],

    "competitors": [
      {
        "name": "Nombre del producto o empresa",
        "url": "https://...",
        "language": "es | en",
        "country": "US | ES | AR...",
        "product_type": "SaaS | PDF | curso | plantillas",
        "price": 29,
        "visible_sales_signal": "Lo único parecido a ventas que se ve: cantidad de reseñas, ranking, seguidores",
        "strengths": ["..."],
        "weaknesses": ["..."],
        "source": "chatgpt",
        "confidence": 0.7
      }
    ],

    "signals": [
      {
        "signal_type": "reddit_discussions | youtube_views | search_result_count | marketplace_reviews | community_activity",
        "value": "42",
        "source_url": "https://...",
        "source": "chatgpt",
        "evidence_type": "DIRECT",
        "notes": ""
      }
    ],

    "prices": [19, 29, 49],

    "blocked": [
      {"target": "qué quisiste mirar", "reason": "por qué no pudiste"}
    ]
  }
]
```

### Campos mínimos aceptables

Solo `problem` es obligatorio. Pero una oportunidad **sin ninguna evidencia con
URL no puede salir de `DISCOVERED`** en nuestro sistema — se queda como
hipótesis hasta que alguien la verifique.

---

## Dimensiones de evidencia

Usá estas en el campo `dimension` para que el sistema sepa qué lado está
verificado:

- `demand` — gente buscando o pagando por esto
- `pain` — qué tan grave es el problema
- `competition` — quién lo resuelve ya
- `price` — a cuánto se vende
- `gap` — qué falta en español

Una oportunidad con 10 evidencias de `demand` y nada más está medida de un solo
lado. Tratá de cubrir varias dimensiones.

---

## Dónde buscar (esto es lo que nosotros NO podemos)

Tenemos bloqueado el acceso a TikTok, Instagram, Hotmart, y varios sitios más.
**Lo más valioso que nos podés traer es justamente eso:**

- **Reddit** — hilos donde la gente describe el problema con sus palabras
- **Marketplaces** — Etsy, Gumroad, Amazon KDP, Creative Market: qué se vende y
  cuántas reseñas tiene
- **Comunidades** — foros, Discord, Facebook Groups del nicho
- **Reviews y comentarios** — sobre todo las **quejas** de productos existentes:
  ahí está el hueco
- **YouTube** — qué tutoriales tienen muchas vistas (señal de problema real)
- **Productos anglosajones** que funcionan y no tienen equivalente en español

---

## Lo que NO queremos

- Listas genéricas de "100 productos digitales"
- Planners, ebooks genéricos, prompts genéricos
- Cursos de marketing, "cómo ganar dinero"
- Plantillas de Canva genéricas
- Productividad genérica
- Cualquier cosa donde el comprador pueda pedírselo a ChatGPT gratis en dos
  minutos

Queremos oportunidades **menos obvias**.

---

## Ojo con esto

**Que no exista en español NO significa que haya oportunidad.** Puede significar
que nadie lo quiere. Si encontrás un hueco, buscá evidencia de que la demanda
existe igual — si no, marcalo como `LOW_DEMAND` y avisá.
