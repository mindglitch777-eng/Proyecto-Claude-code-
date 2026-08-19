# Estrategia de Nicho: Filosofía Aplicada / Psicología Práctica

---

# BLOQUE 1 — ADAPTACIÓN DEL PIPELINE

## El hallazgo estratégico
La fórmula dominante del nicho es: B-roll cinematográfico (estatuas de
mármol, tormentas, ruinas antiguas) + música orquestal dramática +
cita en tipografía serif + voz lenta (una palabra por segundo).
Genera millones de vistas y **la ejecuta absolutamente todo el mundo**.

Además requiere metraje de stock que nuestro pipeline no produce.

## La grieta que sí podemos ocupar
Los datos del nicho muestran que los formatos de MAYOR rendimiento no
son las citas cinematográficas, sino los **explicativos estructurados**:

- **Listas numeradas**: "el formato de mayor rendimiento del nicho",
  con revelados de texto animado y cada punto explicado en menos de
  5 segundos.
- **Diagramas de dos columnas** (ej. controlable vs. incontrolable):
  "los conceptos centrales explicados de forma simple obtienen
  guardados masivos de los recién llegados".
- **Categorización visual de emociones** (cuáles los estoicos actúan
  vs. observan) — desmiente el mito de "sin emociones".
- **Comparación estoicismo vs. terapia CBT** en formato pantalla
  partida (comparten raíces históricas reales).
- **Tier list** de pensadores estoicos por dureza del consejo.

**Todos estos son formatos que `animador_v9.py` YA tiene**:
`lista`, `division`, `comparar`, `pasos`, `panel`, `cronologia`.

## Posicionamiento del pipeline
No competimos en "cita bonita sobre estatua" (saturado, y no es
nuestra fuerza). Competimos en **claridad visual de conceptos**:
somos el canal que EXPLICA con diagramas, no el que INSPIRA con
metraje. Eso genera guardados y compartidos, que es señal algorítmica
más fuerte que el like.

## Mapa formato → contenido
| Formato v9 | Uso en el nicho |
|---|---|
| `division` | Controlable vs incontrolable (el concepto núcleo) |
| `lista` | "3 reglas de Marco Aurelio para X" |
| `comparar` | Estoicismo vs terapia moderna / reacción vs respuesta |
| `pasos` | Práctica de reflexión nocturna de Séneca |
| `panel` | Categorización de emociones |
| `cronologia` | Vida de un filósofo / evolución de una idea |
| `declaracion` | La cita, cuando la cita se sostiene sola |
| `pregunta` | "¿Qué harías?" + pausa + respuesta estoica |

## Ajustes técnicos a hacer
1. **Paleta**: el nicho usa mármol/piedra/sepia. Crear un tema nuevo
   (`clasico`) con fondo piedra oscura, acento dorado apagado, texto
   hueso.
2. **Tipografía**: el nicho espera serif para las citas. Agregar
   soporte de fuente serif (DejaVu Serif está disponible).
3. **Ritmo**: el nicho usa ritmo LENTO y meditativo, al revés que el
   resto de TikTok. Los segmentos pueden durar más (3-4s) y la cámara
   debe moverse muy despacio.
4. **Música**: orquestal cinematográfica desde Pixabay (ver ASSETS.md).

---

# BLOQUE 2 — MARCA Y BRANDING

## Posicionamiento
No "otra cuenta de citas estoicas". La marca es:
**filosofía explicada con claridad visual, para gente que quiere
entenderla, no solo sentirla.**

## Diferenciadores de marca
1. **Explicativo, no inspiracional.** Diagramas y estructuras, no
   frases sobre atardeceres.
2. **Honesto sobre el origen.** El nicho está lleno de contenido que
   distorsiona el estoicismo hacia "no sientas nada" o lo mezcla con
   contenido de manipulación. Posicionarse como la fuente que corrige
   eso es un ángulo real y defendible.
3. **Aplicado a problemas concretos** (trabajo, discusiones, ansiedad
   por el futuro), no abstracto.

## Advertencia importante detectada
En TikTok, el estoicismo aparece asociado a etiquetas de "dark
psychology", manipulación y contenido de masculinidad tóxica. También
está "ampliamente malentendido" según el propio discurso del nicho.

**Decisión de marca: alejarse explícitamente de eso.** No usar esas
etiquetas, no usar el encuadre "domina a los demás". Además de ser lo
correcto, es un diferenciador: la audiencia educada con poder
adquisitivo (nuestro comprador) rechaza ese encuadre.

## Elementos a definir (completar en brand.md)
- **Nombre**: evitar "stoic/estoico" literal (saturadísimo). Buscar
  algo que evoque claridad/estructura.
- **Tono**: sereno, preciso, sin gritar. Nunca "gurú".
- **Paleta**: piedra, hueso, dorado apagado. Alto contraste para mute.
- **Qué NO somos**: no somos motivación, no somos autoayuda genérica,
  no somos "psicología oscura", no vendemos superioridad.

---

# BLOQUE 3 — EL PRODUCTO DIFERENCIADOR

## Qué existe hoy (competencia real, verificada)
- Diarios de shadow work: muchos listados, baja tracción individual
  (un listado de marzo 2026 con 4 favoritos).
- "200 prompts de auto-descubrimiento", "100+ prompts": **listas de
  preguntas sueltas sin estructura ni progresión**.
- Excepción que sí funciona: "The Stoic Path — 52 semanas", con
  prompts semanales Y acciones concretas. La estructura es lo que
  lo separa.

## El diagnóstico
El mercado vende **contenido** (montones de prompts). Nadie vende
**sistema** (un recorrido con progresión, diagnóstico y aplicación).
Es el mismo patrón que encontramos en TDAH: la gente compra y no usa,
porque una lista de 200 preguntas no le dice por dónde empezar.

## El producto propuesto
Un **sistema de práctica estructurado**, no un cuaderno de prompts:

1. **Diagnóstico inicial** — cuestionario corto que identifica dónde
   está el problema del usuario (reacción emocional, ansiedad por
   futuro, resentimiento, indecisión) y le dice **qué módulo empezar**.
   Esto ataca directo el "no sé por dónde empezar".
2. **Módulos por problema**, no por filósofo. Cada módulo:
   - el concepto explicado en una página con diagrama
   - la práctica concreta (qué hacer hoy)
   - 7 días de aplicación con registro
3. **Fichas de emergencia** — una página por situación real:
   "me van a echar", "discutí con alguien", "no puedo dormir por algo
   que dije". Esto es lo que la gente busca a las 2 AM.
4. **Sistema de registro simple** que muestre progresión visible.
5. **Versión imprimible + digital** (GoodNotes/Notability), que es lo
   que el mercado espera.

## Por qué esto se diferencia
| Mercado actual | Nuestro producto |
|---|---|
| Lista de prompts | Sistema con diagnóstico y ruta |
| Organizado por tema abstracto | Organizado por problema real |
| Empezás por la página 1 | Empezás donde te duele |
| Sin progresión | Progresión visible |
| "Reflexioná" | "Hacé esto hoy" |

## Escalera de precios (validada contra el mercado)
- **Entrada gratis**: 1 ficha de emergencia (captura de email).
- **Producto principal**: $12-19 (rango del nicho verificado).
- **Bundle**: sistema completo + fichas + versión digital, $27-39.
La lógica: el objetivo no es ganancia en la primera venta, es el
primer "sí" y después subir el ticket.

---

# ORDEN DE EJECUCIÓN (manual primero)

1. **Semana 1**: definir marca (nombre, paleta, tono) + adaptar
   pipeline (tema `clasico`, serif, ritmo lento).
2. **Semana 1-2**: publicar 5 videos con los formatos explicativos.
   NO construir el producto todavía.
3. **Criterio de continuación**: si ningún video supera 1.000 vistas
   en una semana, revisar hook o nicho. Si alguno pega, seguir.
4. **Semana 3**: construir la ficha de emergencia gratuita, ofrecerla
   en los comentarios de los videos que funcionaron. Medir cuántos
   la piden.
5. **Semana 4+**: construir el producto pago SOLO si hubo demanda
   real por la ficha gratuita.

Regla que no se rompe: el producto se construye después de la señal,
nunca antes.
