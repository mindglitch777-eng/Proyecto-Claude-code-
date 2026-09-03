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

## Pendiente honesto (R7-10)

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

## Generador completo real (R7-14)

`fabrica/carrusel/generar.ts` (`generarCarrusel()`) arma un carrusel
COMPLETO a partir de una sola fuente real del Knowledge Engine — sin
inventar contenido: usa el `concepto`/`descripcion`/`ejemplos`/
`comoUtilizarlo`/`fuente`/`limitaciones` que el item YA tiene. El único
texto que decide un humano es el CTA.

Composición nueva `carrusel-slide` (genérica, `Root.tsx`) reemplaza
las 3 fijas cuando se genera contenido real: se renderiza una vez por
slide con `--props=<archivo.json>` distinto (`fabrica/carrusel/
exportar_props.ts` escribe esos archivos a partir de un `Carrusel`
real).

**Evidencia real (2026-09-03):** carrusel completo de 7 slides
generado desde `brunson-value-ladder` (portada/hook/fuente-citada/
2 slides de desarrollo/límites-honestos/cta), renderizado de punta a
punta con `npx remotion still` — los 7 PNG reales viven en
`fabrica/salidas/carrusel_001/`. Inspección visual de 3 slides
(portada, desarrollo con subtexto de fuente/nivel, cta) confirma
texto legible, contraste correcto e indicador `N / total` correcto.
Registrado como primera derivación real del Product Ecosystem
(`fabrica/ecosistema_producto/datos.ts`, id
`d-carrusel-brunson-value-ladder`), estado `en_progreso` -- el
artefacto existe pero no se publicó en ninguna red (eso requiere
confirmación explícita del operador, regla de oro de CLAUDE.md).
