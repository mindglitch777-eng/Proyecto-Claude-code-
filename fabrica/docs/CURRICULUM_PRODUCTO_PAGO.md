# Currículum — producto pago (sistema + curso + comunidad)

Primer esqueleto de módulos del curso, decidido con el operador (2026-09-11):
**"las dos versiones"** — un curso no-code para la mayoría (herramientas que
cualquiera puede tocar: Notion, Canva, CapCut, Buffer/Metricool) + un anexo
técnico opcional para quien sepa o quiera programar (la fábrica real:
TypeScript, GitHub Actions, Zernio, Remotion). Nadie queda bloqueado por no
saber programar, y quien sí sabe puede ir más a fondo.

Cada módulo sigue el recorrido real que ya usa el operador para construir y
vender — no es teoría inventada, es el proceso documentado en
`fabrica/ESTADO.md` y `fabrica/docs/ARQUITECTURA.md`, traducido a algo que se
pueda enseñar sin código.

---

## Módulo 1 — Encontrá tu activo
Cómo elegir un nicho con demanda real, no un nicho "que suena bien".
- Método de investigación replicable: cómo confirmar que algo se vende de
  verdad antes de invertir tiempo (con fuente citada, no intuición).
- Ejercicio práctico: los 12 nichos ya investigados
  (`fabrica/docs/INVESTIGACION_NICHOS_SIN_CLAUDE.md` y
  `fabrica/docs/MAPEO_NICHOS_INTERES.md`) como punto de partida real, no
  como lista cerrada — se enseña a hacer esa misma investigación con
  cualquier nicho nuevo.

## Módulo 2 — Armá el gancho y el guion
Cómo escribir contenido que se sostiene en la voz de marca real (rioplatense,
directo, anti-gurú — ver sección "Voz de marca" de
`.agents/product-marketing.md`).
- Los 4 ángulos ya en uso (construcción en vivo, herramienta como gancho,
  mitos desmentidos, resultados crudos) — `fabrica/docs/BANCO_IDEAS_CONTENIDO.md`
  como banco de ejemplos reales, no genéricos.
- Plantilla de guion reutilizable (hook → desarrollo → cierre) sacada del
  formato real que ya usa `fabrica/ejemplos/lote_21_publicacion.ts`.
- Regla explícita del Módulo 3 (matriz de contenido): nunca quedarse en el
  gancho genérico sin bajar a algo concreto — ver
  `fabrica/docs/MATRIZ_CONTENIDO.md`.

## Módulo 3 — Producí sin saber editar
La versión no-code de lo que la fábrica hace con Remotion + Directores.
- Grabar con celular, armar carruseles en Canva, editar video corto en
  CapCut — sin equipo caro, sin software profesional.
- Banco de música/SFX gratis y de dónde sacarlos legalmente.
- Qué NO hace falta saber (edición avanzada, diseño, motion graphics) y por
  qué el sistema no lo requiere.

## Módulo 4 — Programá y automatizá la publicación
La versión no-code de lo que la fábrica hace con Zernio + GitHub Actions.
- Calendario de contenido semanal (mismo criterio de horarios investigado:
  picos reales 18-22h, evitar franjas sin evidencia).
- Cómo programar publicaciones con herramientas accesibles (tipo
  Buffer/Metricool) en vez de quedarse pegado al celular subiendo a mano.
- Sistema de aviso/recordatorio simple para revisar antes de que algo salga
  mal programado (el mismo problema real que motivó `notificar-box` en la
  fábrica, resuelto acá con herramientas que no requieren programar).

## Módulo 5 — Convertí en venta
Cómo conectar el contenido con el producto digital real.
- La mecánica de comentario → acceso (Ángulo 2), con el mismo cuidado de
  tener el mecanismo de entrega listo ANTES de publicar (lección real,
  documentada en `fabrica/ESTADO.md`, bloque del primer comentario real sin
  sistema listo).
- El Buscador de Activos como puerta de entrada gratuita, y cómo se conecta
  con la venta en Hotmart.
- Honestidad de expectativas: mismo estándar que ya usa todo el proyecto —
  mostrar el dato real aunque sea bajo, nunca inflar cifras.

## Transversal — Comunidad exclusiva
No es un módulo aparte, acompaña a los 5: espacio para mostrar guiones
propios, pedir revisión, resolver dudas puntuales de cada módulo mientras se
va construyendo el propio activo.

## Anexo técnico (opcional, no bloquea a nadie)
Para quien sabe o quiere aprender a programar: cómo se ve la versión
avanzada real que usa el operador — TypeScript, GitHub Actions, la API de
Zernio, Remotion para generación de video. Mismo resultado que los módulos
1-5, pero corriendo solo, sin intervención manual. No es requisito para
completar el curso ni para que el sistema no-code funcione.

---

## Pendiente (próximo paso, no resuelto todavía)
Definir el contenido EXACTO de "el sistema" — qué plantillas/archivos
concretos recibe la persona en cada módulo (ej: la plantilla de Notion real
del calendario, el doc de la plantilla de guion, etc.). Se define después de
confirmar que esta estructura de 5 módulos + comunidad + anexo está bien.
