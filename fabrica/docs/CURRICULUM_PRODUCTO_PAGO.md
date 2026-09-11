# Currículum — La Máquina de Activos (sistema + curso + comunidad)

**Nombre propuesto (2026-09-11, pendiente de confirmación final del
operador):** *La Máquina de Activos* — sale directo de la propia definición
ya escrita en `.agents/product-marketing.md` ("armar tu propia máquina de
contenido y venta automatizada"), no es un nombre inventado aparte.
Alternativas consideradas: *La Fábrica de Activos* (usa el nombre real del
motor interno, `fabrica/`), *El Motor de Activos*.

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

## Diferenciación: herramientas reales, no solo plantillas (2026-09-11)

Decisión del operador: no alcanza con "plantillas" — eso es lo que ya vende
todo el mundo en Hotmart (ver "Panorama competitivo" en
`product-marketing.md`). El diferencial real es entregar **herramientas que
ya hacen el trabajo**, como El Buscador de Activos, no documentos para
llenar a mano. Se convierten 3 de los entregables:

- **Módulo 1:** en vez de una ficha de validación para completar → **Validador
  de Activos** (herramienta): la persona ingresa su idea de nicho y la
  herramienta la evalúa con el mismo criterio real ya usado (fuente,
  esfuerzo/ingreso, plata inicial) — no un formulario en blanco.
- **Módulo 2:** en vez de una plantilla de guion en blanco → **Generador de
  Ganchos y Guiones** (herramienta): elige nicho + ángulo y arma el guion —
  extensión directa de El Buscador de Activos, pero para cualquier nicho que
  la persona escriba, no solo los 12 ya precargados.
- **Módulo 4:** en vez de un calendario para completar a mano → **Planificador
  de Publicaciones** (herramienta): ingresa frecuencia deseada y arma el
  calendario con los horarios reales ya investigados (18:00/20:30 ART).

Los demás entregables (checklist de grabación, banco de música, checklist
antes de publicar, checklist de Hotmart) siguen como documentos/checklists —
no todo necesita ser una herramienta interactiva, pero los 3 puntos de
mayor fricción para el comprador (validar nicho, escribir guion, armar
calendario) sí la tienen.

**Construidas y probadas (2026-09-11):** las 3 herramientas existen como
preview interactiva real — Artifact "La Máquina de Activos"
(`https://claude.ai/code/artifact/f8551d68-399e-48d5-914e-2034e232cc74`).
Se probaron con Playwright (no solo revisión de código) y se corrigieron 2
bugs reales encontrados así: falso-positivo del matcher de nichos por
substring naive, y highlight de chip que nunca se aplicaba. Iteración
directa con feedback del operador:
- *Validador de Activos:* el operador marcó la primera versión como "muy
  mala" (sin veredicto final, sin ideas, sin guía de diferenciación ni de
  ejecución) — se rehízo con veredicto explícito, 2 ideas concretas por
  nicho (`ejemplo` + `idea2`), bloque "cómo diferenciarte de la multitud"
  (`OPORTUNIDAD_INFO.diferenciacion`) y "los 3 pasos, sin vueltas"
  (`OPORTUNIDAD_INFO.pasos`), manteniendo la fuente citada.
- *Generador de Ganchos y Guiones:* ganchos reescritos con tono más
  agresivo/confrontativo (los 12 nichos + los 4 ángulos en modo tema
  libre), y se agregó un toggle "sin mostrar la cara" / "mostrando la
  cara" que cambia, por línea de guion, el ícono de encuadre y la
  indicación de grabación (mirada a cámara vs. pantalla/manos en off).

Libertad de elegir / personalizado ya está en las 3: Validador acepta
cualquier texto libre con fallback honesto (checklist de 3 preguntas si no
hay dato propio), Guiones tiene modo "tema libre" con estructura genérica
declarada como tal, Calendario permite tocar día por día además de los
presets 3/5/7.

## "Mi Proyecto" — capa que amarra las 3 herramientas (2026-09-11)

El operador marcó que 3 herramientas sueltas (cada una se resetea al
volver a entrar) no alcanzan para que esto se sienta "de todos los días".
Se debatió y se agregó una 4ta pieza que conecta las otras 3 a un proyecto
propio y persistente, en vez de que cada visita empiece de cero:

- **Varios proyectos en paralelo:** el comprador puede tener más de un
  proyecto activo (ej. probando 2 nichos a la vez), cada uno con su
  propio nicho, ángulo recomendado, calendario y banco de guiones.
- **"Hoy te toca":** un bloque único que lee el calendario del proyecto y
  dice, sin ambigüedad, si hoy corresponde publicar, si ya se armó el
  guion de hoy, y si ya se marcó como publicado — con un botón directo a
  generar el guion faltante.
- **Racha visible:** 🔥 días seguidos publicando en los días programados,
  calculada de verdad a partir del historial guardado (no un contador que
  se pueda desincronizar) + total acumulado de publicaciones.
- **Banco de guiones acumulado:** cada guion generado dentro de un
  proyecto se guarda con fecha, nicho, ángulo y formato — no se pisa el
  anterior.
- **Ángulo recomendado por nicho:** el Validador ahora sugiere un ángulo
  concreto (de los 4 ya existentes) con la razón puntual de por qué ese
  ángulo funciona mejor para ese nicho/oportunidad — en vez de que el
  comprador elija a ciegas entre 4 opciones. Vinculado también al
  proyecto activo si hay uno abierto.

**Detalle técnico honesto:** esto usa la capability `db` real de la
plataforma de Artifacts (no una simulación) — el proyecto, el calendario
y el banco de guiones sobreviven de verdad al cerrar y volver a abrir el
link. Se verificó la lógica completa (crear proyecto, generar guion,
marcar publicado, cálculo de racha, vínculo de nicho, calendario
persistente) con Playwright contra un mock fiel al contrato real de la
capability, más el camino sin `db` (archivo local / vista sin sesión), sin
errores. Lo que NO se pudo verificar desde acá es el guardado en vivo
contra el link real de claude.ai (el sandbox no tiene salida de red hacia
ese dominio) — falta abrir el Artifact publicado con sesión real y probar
cerrar/reabrir para confirmarlo en producción.

**Límite real de esta capability, para que quede honesto:** un Artifact
con `db` declarado deja de poder compartirse públicamente — solo lo puede
abrir un miembro con sesión en la misma organización de Claude del
operador. Esto no afecta al producto final (que va a vivir en Notion +
Hotmart, no en este Artifact), pero sí significa que esta vista previa,
tal cual está, solo la puede probar el operador mismo — no sirve todavía
para mandarle el link a un comprador real.

## Auditoría técnica + más variedad y personalización (2026-09-11)

El operador pidió tres cosas: (1) una revisión técnica real de todo, (2)
más personalización en los nichos/alternativas de producto — no solo 12
nichos fijos ni una sola idea por nicho, con opciones que apliquen
"con o sin Claude" — y (3) que los guiones dejen de sentirse casi
idénticos entre sí.

**Auditoría técnica:** se revisó el código completo (cross-check de cada
`onclick` contra su función, ids duplicados, todas las combinaciones de
nicho×ángulo×formato en Guiones, los 12 nichos + texto libre en el
Validador, los 3 presets + calendario totalmente apagado en el
Planificador, y el ciclo completo de Mi Proyecto) con Playwright — 0
bugs encontrados al cierre, salvo el que sigue.

**Bug real encontrado y corregido:** en el modo "de la lista" del
Generador, el ángulo elegido cambiaba la etiqueta pero NUNCA el
contenido real — el hook y las 3 líneas del guion eran idénticos sin
importar qué ángulo se tocara (verificado comparando los 4 ángulos con
el mismo nicho, texto byte-por-byte igual). Es la causa concreta de "los
guiones son casi exactamente iguales". Se arregló escribiendo, para cada
uno de los 12 nichos, un gancho+guion propio para "Herramienta como
gancho", "Mito desmentido" y "Resultado crudo" (el original ya escrito
queda para "Construcción en vivo") — 36 guiones nuevos, todos partiendo
de los mismos datos reales del nicho (porQue/esfuerzo/oportunidad), solo
con el enfoque narrativo del ángulo elegido. Verificado con Playwright:
los 4 ángulos ahora dan hooks distintos para el mismo nicho.

**Modo "tema libre" también repetía estructura** (un solo template fijo
por ángulo, la palabra del tema era lo único que cambiaba). Se
expandió a 3 variantes reales de tono/estructura por ángulo (12 en
total), elegidas de forma determinística por un hash del tema escrito —
mismo tema da siempre el mismo resultado, temas distintos caen en
variantes distintas. Verificado: 15 temas de prueba se repartieron
razonablemente entre las 3 variantes de cada ángulo.

**Kit universal de formatos (para "no solo 12 nichos"):** el Validador
reutiliza los 7 tipos de oportunidad ya investigados
(`OPORTUNIDAD_INFO`, con fuente citada en `INVESTIGACION_NICHOS_SIN_CLAUDE.md`)
como banco aplicable a CUALQUIER idea, no solo a los 12 nichos
precargados. Cuando el texto libre no matchea ningún nicho conocido, en
vez de solo el checklist de 3 preguntas, ahora también se muestran 4 de
esos 7 formatos — personalizados por una heurística simple de palabras
clave sobre lo que la persona escribió (no una lista fija en el mismo
orden siempre), cada uno con diferenciación real. Para los 12 nichos
matcheados se sumó una 3ra idea (un formato universal distinto al
investigado para ese nicho) — de 2 ideas a 3 en todos los casos.

**"Con Claude" / "sin IA" (interpretado de "con o sin cloud" — se
entendió como refiriéndose a Claude, dado el contexto del proyecto):**
cada uno de los 7 formatos universales tiene ahora una diferenciación
para el camino manual y una nota honesta de dónde ayuda Claude de
verdad y dónde no reemplaza el criterio propio (nunca vendiendo humo —
ej. en UGC se aclara que la IA no reemplaza nada, uno es el que graba).
Se muestra en el Validador tanto para nichos matcheados como para el
kit universal.

## Contenido exacto — qué archivo/plantilla recibe la persona en cada módulo

Primera baja a tierra (2026-09-11). Cada entregable sale de algo que ya
existe y funciona en la fábrica real, no se inventa de cero — se traduce a
formato entregable (Notion / doc / PDF).

**Módulo 1 — Encontrá tu activo**
- *Ficha de validación de nicho* (plantilla nueva a armar): criterios reales
  ya usados en la investigación — fuente citada, esfuerzo/ingreso, plata
  inicial — para que la persona evalúe SU propio nicho, no solo copie los 12.
- *Los 12 nichos ya investigados* como ejemplo de referencia (`INVESTIGACION_NICHOS_SIN_CLAUDE.md` + `MAPEO_NICHOS_INTERES.md`), pasados a Notion.

**Módulo 2 — Armá el gancho y el guion**
- *Plantilla de guion en blanco* (hook → desarrollo → escalada → payoff →
  cierre), sacada del formato real de `lote_21_publicacion.ts`.
- *Banco de 21+ ideas reales* (`BANCO_IDEAS_CONTENIDO.md`) como ejemplos ya
  resueltos, no genéricos.
- *Hoja de voz de marca* (1 página): las frases reales, palabras a
  usar/evitar, ya escritas en `product-marketing.md`.

**Módulo 3 — Producí sin saber editar**
- *Checklist de grabación con celular* (nuevo, a redactar: luz, encuadre,
  audio — lo mínimo real que ya se usa).
- *Plantilla de Canva* con el sistema de color por categoría ya definido
  (dinero=dorado, ia=azul, alerta=rojo, regalo=magenta — `lote_42_datos.ts`).
- *Banco de música/SFX gratis*, mismos links CC0 que ya usa la fábrica.

**Módulo 4 — Programá y automatizá**
- *Plantilla de calendario de contenido* con los horarios reales
  investigados (18:00 / 20:30 ART, picos confirmados, franjas a evitar).
- *Guía paso a paso* de herramienta no-code de programación (Buffer/
  Metricool o similar) — a redactar, es la traducción del rol que hoy
  cumplen Zernio + GitHub Actions.
- *Checklist "antes de publicar"* — nace directo de la lección real del
  comentario sin sistema listo (`fabrica/ESTADO.md`), para no repetirla.

**Módulo 5 — Convertí en venta**
- *El Buscador de Activos* en sí, como ejercicio: se enseña a adaptar la
  misma herramienta al nicho propio del alumno.
- *Guía de la mecánica comentario → acceso* (Ángulo 2), con la advertencia
  real ya aprendida: no publicar sin el mecanismo de entrega listo.
- *Checklist de conexión con Hotmart* (cuenta, ficha de producto, área de
  miembros) — mismo proceso ya documentado para "El Corte".

**Anexo técnico (opcional):** acceso de solo lectura a fragmentos reales del
código (`zernio.ts`, `subir_video.ts`, los workflows de GitHub Actions) para
quien quiera automatizar a ese nivel — no es requisito para nada de arriba.

## Pendiente
Redactar el contenido real de los 5-6 entregables marcados como "a
redactar" arriba (checklist de grabación, guía no-code de programación,
checklist antes de publicar, checklist de Hotmart). Confirmar el nombre
final del sistema (*La Máquina de Activos* u otra opción).
