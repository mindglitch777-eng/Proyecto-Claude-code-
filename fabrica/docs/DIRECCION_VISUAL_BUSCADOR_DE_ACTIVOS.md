# Dirección visual — El Buscador de Activos

Documento de dirección de arte para la landing page del producto gratuito.
Se arma después de varias iteraciones reales con el operador (2026-09-11),
incluyendo una ronda donde se probó "más animación" y no funcionó — quedó
documentado el porqué para no repetirlo.

## Tipografía
- **Títulos:** Fraunces (serif variable, óptico grande) — con más carácter
  editorial que un serif genérico, sin caer en Playfair Display a secas.
- **Cuerpo / UI:** Archivo — el mismo grotesco que ya usa `identidad.ts`
  (la fábrica real de video), así la página queda consistente con el resto
  de la marca.
- **Etiquetas / fuentes / mono:** JetBrains Mono, solo para caps pequeñas y
  citas de fuente.
- Explícitamente prohibido: Inter, Roboto, Arial u otra fuente "segura" por
  default — se nota como hecho por IA sin criterio propio.

## Paleta
Sacada del código real de la fábrica (`remotion-spike/src/identidad.ts`),
no inventada — es la misma paleta que usan los 21 videos y 42 carruseles
ya publicados:
- Fondo: `#0A0A0C`
- Texto: `#F6F6F4`
- Acento (único): `#FF4E24`

**Un solo acento.** Nada de degradados multicolor, nada de tonos neón
cian/magenta — esa versión anterior (con azul "IA", dorado "dinero", rojo
"alerta", magenta "regalo") se probó y quedó descartada para esta página:
sumaba ruido, no jerarquía. Esos colores por categoría siguen vivos donde
corresponden — carruseles/videos reales — pero acá la regla es un acento
solo.

## Principio de animación
**"Restraint reads as premium."** Se probaron tres niveles antes de llegar
a este:
1. Scroll con pin + crossfade + inercia — técnicamente funcionaba pero se
   sentía "atascado" (el usuario quedaba a mitad de camino entre capítulos,
   sin entender qué pasaba). Se descartó.
2. Scroll con pin + anillo giratorio + orbes de luz + flash + golpe de
   escala en cada transición — demasiado ruido, seguía sin leerse como
   premium, al contrario.
3. **Versión actual:** scroll normal de toda la vida. Cada bloque anima su
   entrada UNA sola vez, al entrar en pantalla (blur + escala sutil que se
   asienta), disparado por scroll real del usuario — nunca scroll-jacking.
   Fondo con una única respiración lenta (26s, sin rotar). Cursor
   minimalista en desktop. Nada más.

Regla operativa: si una animación no ayuda a guiar la atención o a contar
la historia, se saca — aunque "se vea piola".

## Estructura de la página (orden real)
1. Secuencia de 4 capítulos (hero, quién está atrás, datos con fuente, cita
   de cierre) — scroll normal, sin pin.
2. Franja corta "sin humo" (transición).
3. **El problema** — 3 puntos de dolor reales, sacados de
   `.agents/product-marketing.md` (desconfianza de gurús, falta de plata,
   falta de conocimiento técnico) — no inventados.
4. Cómo funciona (4 pasos).
5. Por qué esto (comparación lo de siempre / esto).
6. La herramienta interactiva (elegir nicho → situación → camino → resultado).
7. Preguntas frecuentes.
8. Footer con handles reales.

## Qué NO se agregó, a propósito
- **Prueba social / testimonios:** no hay alumnos ni clientes reales
  todavía (`fabrica/ventas/datos.ts` vacío a propósito) — poner iniciales
  o citas inventadas rompería la regla de "sin humo" que es el eje de todo
  el proyecto. Se agrega cuando haya casos reales, no antes.
- **Precio:** pospuesto a propósito por decisión explícita del operador
  (ver `.agents/product-marketing.md`, "Modelo de negocio y precio").
- **Stack Next.js / Tailwind / librerías de animación por `npx`:** la
  página sigue siendo una vista previa (Artifact), no el build final. No
  se instalaron paquetes sin poder verificar que existen de verdad — un
  prompt de otra IA sugería ejecutar `npx ppv-skills` y
  `npx claude-skill-3d-animation-landing`, que no se pudieron confirmar
  como reales; correr instaladores no verificados es un riesgo de
  seguridad, no una decisión de diseño.

## Extensión a "La Máquina de Activos" (2026-09-11)

El operador probó el Artifact de "La Máquina de Activos" (las 3 herramientas +
Mi Proyecto) y lo marcó como visualmente "triste" — funcionalmente eficiente
pero sin vida, sin ganas de usarlo. Pidió algo más profesional/minimalista
que además transmita energía con pocas palabras (dio de ejemplo un estilo
tipo "tu [pequeño] imperio digital, hoy"). Se mantuvo la misma paleta y
tipografía documentadas arriba (nada de colores nuevos ni fuentes nuevas —
el problema no era la identidad, era la ejecución) y se ajustó:

- **Brillo sutil de marca:** un `radial-gradient` muy suave del mismo acento
  copper detrás del header, en vez de fondo plano — dentro del principio de
  "un solo acento", no rompe la regla, le da atmósfera.
- **Tabs rediseñadas:** de una grilla de botones con bordes (se leía
  "spreadsheet") a tabs tipo subrayado — más liviano, más de app real.
- **Saludo dinámico y personalizado:** el header ahora es un saludo que
  cambia según el estado real del usuario (sin proyectos → invita a crear
  el primero; con proyectos sin abrir → pregunta cuál sigue; con proyecto
  activo → "`{nombre}`, en marcha." + racha como frase, no como número
  repetido). Reemplaza el copy estático genérico de antes.
- **Racha con tratamiento de "big number":** una sola vez, en un tile
  grande dedicado (`.stat-hero`), no repetida en el saludo + el bloque de
  hoy + el tile (se corrigió esa triplicación real que apareció al
  revisar el primer intento con captura de pantalla).
- **Disclosure movido:** el aviso "vista previa interna, no publicada" ya
  no es lo primero que ve el usuario (competía con el saludo) — pasó al
  footer, donde sigue siendo honesto pero no es la bienvenida.

Verificado con Playwright (los 3 flujos de herramientas sin romper nada) +
capturas de pantalla reales en oscuro/claro/mobile antes de publicar — no
solo descripción, se miró el resultado.

## Fuentes de esta dirección
- Referencia visual del operador: captura de video mostrando un sitio tipo
  agencia (parallax GSAP/ScrollTrigger, tipografía serif grande, fondo
  cinematográfico oscuro) — se tomó el espíritu (movimiento con propósito,
  tipografía con carácter), no la técnica literal de scroll-jacking, que
  se probó y no funcionó bien en la práctica.
- Brief de dirección de arte compartido por el operador (con aportes de
  otra IA) — se adoptaron paleta/tipografía/principio de restraint, se
  descartaron los pasos de instalación no verificables y las secciones que
  requerían inventar datos.
