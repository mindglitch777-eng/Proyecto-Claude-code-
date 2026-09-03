# Carousel Engine — primer render real (R7-10)

`CarruselSlide.tsx` es el primer componente real del Carousel Engine
(`fabrica/carrusel/`, Ronda 7) — reutiliza la MISMA identidad visual
(`PALETA`/`GROTESCA` de `identidad.ts`) que el motor de video, en vez
de inventar una paleta nueva por formato.

A diferencia del video (timeline, `npx remotion render`), un carrusel
es un conjunto de imágenes ESTÁTICAS — se renderiza con
`npx remotion still <id> out.png`, una composición por slide.

## Resultado real (2026-09-03)

Se renderizaron 3 stills reales de un carrusel de prueba de 8 slides
(`fabrica/carrusel/test_carrusel.ts`, carrusel "c1"):

- `carrusel-slide-portada` — fondo de acento, texto oscuro, slide 1/8.
- `carrusel-slide-desarrollo` — fondo oscuro, texto claro, slide 3/8.
- `carrusel-slide-cta` — fondo de acento (mismo tratamiento que
  portada, para que el CTA se note igual de fuerte).

Los 3 PNG confirman visualmente el diseño (texto legible, contraste
correcto, indicador de posición `N / total`).

## Pendiente honesto

- Solo 3 de los 8 slides del carrusel de prueba se renderizaron como
  evidencia (portada/desarrollo/cta) — no los 8, para no gastar tiempo
  de render en algo ya confirmado visualmente con los 3 tipos
  distintos de slide que existen (`portada`/`cta` comparten
  tratamiento, `hook`/`desarrollo`/`ejemplo` comparten el otro).
- No hay todavía un componente de tipo `ejemplo` con tratamiento
  visual distinto (imagen/captura real) -- el slide "ejemplo" hoy
  se ve igual que "desarrollo" (mismo texto plano). Cuando haya un
  caso real con una captura/imagen para mostrar, vale la pena
  diferenciarlo visualmente.
