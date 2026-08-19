# MARCA, FOCO Y LANZAMIENTO

---

# 1. LA MARCA

## Nombre
**El Corte**

Por qué funciona:
- Es el verbo, no la etiqueta. No dice "estoico" (saturadísimo) ni
  "mindful" ni "zen". Dice lo que hace.
- Sirve como nombre de cuenta Y de producto sin fricción.
- Se entiende sin explicación: cortar el bucle.

Handle sugerido: `@elcorte.app` o `@elcorte.diario`

## Posicionamiento en una frase
> No te inspiramos. Te sacamos del bucle.

## Paleta — la decisión importante

**Descarto el oro sobre negro con mármol.** Es exactamente lo que usan
TODAS las cuentas del nicho: estatua + dorado + música orquestal. Si lo
usamos, nos vemos iguales aunque el contenido sea mejor.

**La paleta es editorial, no mística:**

```
Fondo      #0F0F10   negro cálido, casi tinta
Texto      #F2EFE9   hueso
Acento     #4ADE80   verde señal   ← el diferenciador
Apagado    #6B6B70   gris para lo secundario
Alerta     #E8654A   naranja, solo para el "mito"
```

Por qué **verde señal** y no dorado:
- Ninguna cuenta del nicho lo usa. Se reconoce a distancia en el feed.
- Comunica "funciona / correcto / salida", no "sabiduría antigua".
- Coincide con el posicionamiento: somos herramienta, no templo.
- Alto contraste sobre negro = se lee en mute, que es el 85% de la gente.

**Tipografía:** sans-serif para todo. El serif es el uniforme del nicho
(citas de mármol). Sans dice "esto es una herramienta".

## Tono
- Directo, corto, sin adornos. Frases de 6-10 palabras.
- Segunda persona: "te pasa", "hacé esto".
- Nunca "gurú", nunca "amigo", nunca emojis en el video.
- Sin promesas de curación. Sí promesas de acción concreta.

## Qué NO somos
No somos motivación. No somos autoayuda. No somos psicología oscura.
No somos "domina a los demás". No vendemos superioridad.

---

# 2. EL FOCO (decidido)

## La tesis
**TikTok es un buscador.** Las vistas por hashtag crecieron 114% y la
búsqueda genera ~4% de las impresiones. Un video optimizado para una
búsqueda sigue trayendo gente meses después de morir en el FYP.

**No apuntamos a viralidad. Apuntamos a ser el resultado que aparece
cuando alguien busca su problema a las 3 AM.**

## El formato único: "Qué hacer cuando..."
Una serie. Cada video = UNA situación + UNA salida concreta.

Los primeros 15:
1. Discutiste y no podés dormir
2. Mandaste un mensaje y no responden
3. Te acordás de algo que dijiste hace años
4. Tenés que decidir y no podés
5. Te dejaron en visto
6. Mañana tenés algo importante
7. Alguien te dijo algo hace días y sigue dando vueltas
8. Pensás la respuesta perfecta tarde
9. Te despertás ya acelerado
10. No sabés si mandar ese mensaje
11. Te obsesionaste con un error del trabajo
12. Alguien no te agradeció algo que hiciste
13. Te comparás con alguien y no podés parar
14. Dijiste que sí y querías decir que no
15. Te enteraste de algo por terceros

## Por qué esta serie y no videos sueltos
- **Se busca**: cada video apunta a una búsqueda real
- **Se guarda**: "lo guardo para cuando me pase" (los guardados pesan
  más que los likes)
- **Da motivo para seguir**: hay más situaciones, querés la tuya
- **Es repetible**: mismo molde × 50, y el pipeline los hace en lote

## Estructura fija de cada video (14-18s)
```
0-2s   SITUACIÓN   "Mandaste un mensaje. No responden."
2-5s   EL ERROR    "Y ya inventaste 4 explicaciones."
5-10s  MECANISMO   [diagrama] Lo que sabés / lo que inventaste
10-15s LA SALIDA   Una acción concreta, no un consejo
15-18s LOOP        Vuelve a la situación inicial
```

## Reglas operativas (datos 2026)
- 1-3 videos por día, **de calidad**. Videos apurados que mueren le
  enseñan al algoritmo que tu cuenta retiene poco.
- **1-2 hashtags**, nunca más de 5. Nada de #fyp ni #viral.
- Texto en pantalla siempre (85% mira sin sonido).
- El caption es SEO: escribí la búsqueda que querés capturar.
- **Viralidad relativa**: con 1.000 seguidores, 10.000 vistas ya es
  una victoria. No apuntes al millón.
- Responder comentarios con video: contenido gratis y ya validado.

---

# 3. LA DIFERENCIACIÓN

| El resto del nicho | El Corte |
|---|---|
| Cita sobre estatua de mármol | Diagrama que explica un mecanismo |
| Inspiración | Instrucción |
| Dorado, serif, orquesta | Verde señal, sans, sin música épica |
| Vende PDF de 30 páginas | Vende herramienta que se usa a las 3 AM |
| "Descubrí el poder del estoicismo" | "Qué hacer cuando no podés dormir" |
| Genérico | Una situación por video |
| Suscripción $30-90/año | Pago único |
| Datos en la nube | Datos solo en tu teléfono |

**La ventaja estructural:** ellos producen a mano y por eso publican
poco y repiten. Nosotros tenemos un pipeline que genera lotes con 16
formatos, 12 transiciones y validación de retención automática. Podemos
sostener 3 videos diarios con variedad real durante meses.

---

# 4. TRASPASO A CLAUDE CODE

## Qué subir al repo (y nada más)
```
CLAUDE.md              constitución del proyecto
PROJECT_PLAN.md        el plan por fases
ESTRATEGIA-NICHO.md    la estrategia del nicho
MARCA.md               este documento
CONTENIDO.md           sistema de contenido → venta
HOOKS.md               psicología del hook + datos 2026
ASSETS.md              fuentes de música y sfx
ANTI-FRACASO.md        los 8 riesgos y sus contramedidas
INVESTIGACION-NICHO.md el informe de decisión

animador_v9.py         el renderizador
hooks.py               generador de hooks
validar_hook.py        validador de retención
graficos.py            gráficos explicativos
sfx.py                 efectos de sonido sintéticos
fabrica.py             producción en lote
imagen_ia.py           imágenes vía Cloudflare (opcional)
orchestrator.py        cola de tareas y estado
guardian.py            reglas del proyecto
reporte.py             portafolio por rendimiento

.github/workflows/orquestador-diario.yml
assets/                imágenes, música, sfx
producto/el-corte-v7.html
```

**Borrar:** animador.py, animador_pro.py, animador_v3-v8.py,
variaciones.py, y las versiones viejas del producto. Solo confunden.

## El primer mensaje a Claude Code
```
Lee CLAUDE.md, MARCA.md y CONTENIDO.md completos antes de responder.

Tarea: generar el lote de los primeros 10 videos de la serie
"Qué hacer cuando..." usando animador_v9.py y fabrica.py.

Antes de renderizar:
1. Escribí los 10 guiones en JSON siguiendo la estructura fija
   de MARCA.md (situación → error → mecanismo → salida → loop).
2. Pasá cada uno por validar_hook.py. Si alguno falla, corregilo.
3. Usá la paleta de MARCA.md, no la dorada.
4. Rotá formatos y transiciones: ningún video igual al anterior.

Mostrame los 10 guiones ANTES de renderizar. No renderices sin
mi aprobación.
```

## División del trabajo de acá en adelante
- **Este chat**: decisiones de estrategia, escritura de guiones que
  requieren criterio, análisis de resultados.
- **Claude Code**: producción en lote, mantenimiento del pipeline,
  ajustes técnicos, todo lo repetible.

Regla: si lo vas a necesitar más de una vez, es trabajo de Claude Code.
