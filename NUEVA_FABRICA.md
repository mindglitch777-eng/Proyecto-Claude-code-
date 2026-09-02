# Nueva Fábrica Audiovisual — Especificación y Propuesta de Arquitectura

Estado: **FASE 0/1 — Comprensión y diseño. No implementado.**
Fecha: 2026-09-02.

Este documento existe porque la sesión anterior donde se discutió esto
no quedó guardada en ningún archivo (solo en el chat), y se perdió al
compactarse el contexto. Regla para las próximas sesiones: **cualquier
cambio a la visión/arquitectura de la nueva fábrica se edita en este
archivo, no solo se conversa.**

---

## 0. Especificación original del operador (prompt maestro, verbatim)

> PROMPT MAESTRO — NUEVA FÁBRICA AUDIOVISUAL
>
> **0. TU PAPEL**
>
> A partir de este momento no quiero que actúes simplemente como un
> programador que recibe tareas y escribe código. Quiero que actúes
> como arquitecto principal, ingeniero principal y socio técnico de
> diseño de una nueva fábrica audiovisual basada en IA. Tu
> responsabilidad no es solamente implementar funcionalidades. Tu
> responsabilidad es ayudarnos a construir, de manera progresiva y
> ordenada, un ecosistema de creación audiovisual preparado para
> producir contenido de altísima calidad, experimentar, aprender de
> resultados reales y evolucionar continuamente.
>
> Regla fundamental: **NO empieces a programar inmediatamente.**
> Primero tenés que comprender esta especificación, inspeccionar el
> estado actual del proyecto y devolvernos tu interpretación y
> propuesta. Nosotros vamos a decidir contigo.
>
> **1. VISIÓN GENERAL** — "Crear un sistema operativo audiovisual capaz
> de transformar ideas en videos diseñados para maximizar atención,
> retención, comprensión, impacto y, cuando corresponda,
> conversión/ventas." No una herramienta que convierte guion en MP4,
> sino un ecosistema de sistemas especializados: IDEA → INVESTIGACIÓN →
> SELECCIÓN DE ÁNGULO → HOOK → DESARROLLO NARRATIVO → GUION → DIRECCIÓN
> DE NARRACIÓN → VOZ → ANÁLISIS DE VOZ → DIRECTOR DE RETENCIÓN →
> DIRECTOR VISUAL → DIRECTOR DE AUDIO → ASSETS → COMPOSICIÓN →
> ANIMACIÓN → RENDER → QA → VIDEO FINAL → PUBLICACIÓN → DATOS REALES →
> ANÁLISIS → APRENDIZAJE → NUEVOS EXPERIMENTOS → NUEVAS IDEAS (ciclo).
>
> **2. OBJETIVO REAL** — no producir muchos videos malos rápido; construir
> una máquina que produzca videos interesantes, visualmente
> excepcionales, narrativamente fuertes, con hooks agresivos cuando
> corresponda, ritmo variable, variedad visual, sincronización
> audiovisual excelente, identidad reconocible, capacidad de
> experimentar y (eventualmente) de aprender de resultados reales. La
> cantidad viene después de construir bien el sistema.
>
> **3. AMBICIÓN** — diseñar para escalar de 20 a 100 a 500 a 1.000 a
> 10.000+ videos sin reconstruir la arquitectura. No "500 formatos"
> sino una biblioteca enorme de **componentes combinables** (texto,
> cifra, gráfico, mapa, foto, video, persona, ilustración, diagrama,
> comparación, timeline, indicador, zoom, movimiento, transición,
> efecto, elemento cinematográfico/informativo/humorístico/de
> tensión/de impacto, etc.). 500 componentes deben habilitar muchas más
> de 500 combinaciones.
>
> **4. NO CONFUNDIR COMPONENTES CON FORMATOS** — jerarquía clara:
> **COMPONENTE** (pieza reutilizable: contador, mapa, gráfico, texto
> gigante, foto con movimiento, comparación, timeline, pantalla
> dividida, aparición de palabras, zoom, partículas, diagrama, etc.) →
> **COMPOSICIÓN** (combinación de componentes, ej. FOTO+TEXTO+CIFRA+
> ZOOM+SFX) → **ESCENA** (unidad narrativa audiovisual) → **SECUENCIA**
> (escenas conectadas) → **VIDEO** (resultado completo). El Director
> Visual combina componentes de forma inteligente.
>
> **5. DIRECTOR VISUAL** — no una lista rígida "si intención=X → usar
> componente Y" (techo artificial). Cada componente se autodescribe con
> metadata estructurada: función, categoría, intensidad, ritmo, tipo de
> contenido, necesidad de assets, cantidad de texto soportada,
> compatibilidad con contextos/otros componentes, duración aproximada,
> comportamiento, características visuales, etc. El Director Visual
> pregunta conceptualmente ("necesito representar una cifra importante
> en una escena de alta tensión") y busca entre los componentes
> disponibles, sin conocer manualmente cada nombre. Agregar un
> componente debe ampliar posibilidades, no obligar a reescribir el
> cerebro del Director.
>
> **6. DINAMISMO** — no "cambiar de escena cada segundo"; el dinamismo
> es multidimensional (una escena larga puede ser dinámica si cambian
> distintos elementos dentro de ella: texto, imagen, cifra, zoom,
> gráfico, movimiento, SFX, comparación, música, revelación...).
> Dimensiones a analizar: VISUAL, TEXTUAL, SONORA, ESPACIAL,
> INFORMATIVA, NARRATIVA. Todo movimiento debe tener función, no ser
> gratuito.
>
> **7. RETENCIÓN** — pregunta continua: "¿por qué alguien seguiría
> mirando?". Mecanismos a representar estructuralmente: promesa,
> pregunta abierta, curiosidad, anticipación, contradicción, escalada,
> revelación, giro, comparación, recompensa, información incompleta,
> tensión, sorpresa, cambio de perspectiva. No trucos psicológicos
> vacíos — retención = curiosidad + información + desarrollo +
> recompensa + ritmo + sorpresa + claridad.
>
> **8. HOOK** — agresivo cuando el contenido lo requiera, pero
> "agresivo" no es solo texto grande/sonido fuerte/zoom/frase
> exagerada: debe dar una razón concreta para quedarse. El sistema debe
> poder desarrollar distintos tipos de hook y (con datos reales)
> descubrir cuáles funcionan mejor. **No inventar que algo funciona**:
> antes de tener resultados reales, toda evaluación automática de
> calidad es HEURÍSTICA/HIPÓTESIS, nunca RESULTADO REAL.
>
> **9. NARRACIÓN Y VOZ** — la voz es parte central de la identidad: no
> cambiar de voz al azar entre videos, encontrar una voz principal de
> marca y construir alrededor. Qwen3-TTS es candidata importante (ya
> probamos que la calidad puede ser buena) pero no asumir que es la
> solución definitiva. Investigar cuando corresponda: calidad, español
> latino, pronunciación, números, monedas, porcentajes, nombres,
> pausas, velocidad, entonación, control de expresión, timestamps,
> alineación, requisitos reales, ejecución local, hardware, licencias,
> límites, alternativas gratuitas. Si no se puede verificar algo: **NO
> INVENTAR**, marcar "NO CONFIRMADO — NECESITA INVESTIGACIÓN" y decir
> exactamente qué información hace falta.
>
> **10. LA VOZ NO ES SOLO UN AUDIO** — la narración debe poder
> representarse como información estructurada. Ejemplo: texto "Generó
> 1.629 dólares" → internamente `{numero: 1629, tipo: dinero, moneda:
> USD}`, narración "mil seiscientos veintinueve dólares", visual
> "$1.629". Así se evitan errores de pronunciación/representación.
>
> **11. NORMALIZACIÓN DE NARRACIÓN** — contemplar números, monedas,
> porcentajes, fechas, años, abreviaturas, siglas, nombres propios,
> palabras extranjeras, símbolos, cantidades grandes, decimales. "cómo
> se muestra" y "cómo se pronuncia" deben estar definidos explícitamente,
> nunca a criterio de un TTS.
>
> **12. SINCRONIZACIÓN** — idealmente palabra→timestamp, para coordinar
> texto, cifras, imágenes, gráficos, animaciones, SFX, transiciones,
> énfasis. La voz real debe ser fuente de timing cuando sea técnicamente
> posible, no estimar todo contando caracteres.
>
> **13. DIRECTOR DE AUDIO** — capa responsable de voz, música, SFX,
> silencios, golpes, transiciones, intensidad, sincronización. Audio no
> arbitrario: música/efectos acompañan la narrativa; la intensidad
> evoluciona (calma → tensión → aceleración → impacto → pausa →
> revelación).
>
> **14. ASSETS** — sistema real de assets: no elegir una imagen
> arbitraria "porque algo tiene que aparecer". El sistema debe
> interpretar qué necesita la escena, buscar, evaluar relevancia,
> aceptar/rechazar, buscar alternativa, o marcar faltante si no existe
> algo suficientemente bueno. **Preferible ASSET FALTANTE a ASSET
> INCORRECTO** — nunca ocultar un asset incorrecto con un fallback
> arbitrario.
>
> **15. IA COMO RECURSO VISUAL** — imágenes generadas, ilustraciones,
> recreaciones, diagramas, mapas, fotos, videos, gráficos, vectoriales,
> composiciones híbridas. Cuando se necesite representar una persona
> real (caso histórico/empresarial), investigar qué material real
> existe; si no hay material adecuado, debe existir una estrategia de
> reemplazo visual. No asumir que todo tiene que ser foto real.
>
> **16. ANTI-REPETICIÓN (obligatorio)** — memoria de lo usado
> recientemente: componentes, composiciones, transiciones,
> estructuras, hooks, recursos visuales, patrones narrativos, estilos.
> Pero anti-repetición NO significa prohibir reusar algo que funciona
> — la reutilización debe basarse progresivamente en resultados.
>
> **17. IDENTIDAD VS VARIEDAD** — el contenido debe sentirse de la
> misma marca sin que ningún video se sienta "el anterior con otras
> palabras". Identidad viene de calidad, tipografía, principios de
> composición, lenguaje audiovisual, tratamiento sonoro, narrativa,
> criterios de edición; la estructura visual puede variar mucho.
>
> **18. LABORATORIO DE EXPERIMENTOS** — plantear "¿qué pasa si
> combinamos estos elementos?" (ej. DOCUMENTAL + EDICIÓN AGRESIVA +
> DATOS + MAPA + VOZ INTENSA = experimento). Ciclo: IDEA → CANDIDATO →
> EXPERIMENTO → PRODUCCIÓN → RESULTADO → EVALUACIÓN → CONSERVAR /
> MODIFICAR / DESCARTAR. Antes de datos reales, evaluación humana;
> después, progresivamente, resultados reales.
>
> **19. APRENDIZAJE** — separar estrictamente HIPÓTESIS (lo que
> creemos que puede funcionar), EXPERIMENTO (lo que probamos),
> RESULTADO REAL (lo que ocurrió tras publicar), CONCLUSIÓN (lo que
> aprendemos). Nunca mezclar categorías — un score de fórmula no es una
> métrica de viralidad real.
>
> **20. DATOS QUE QUEREMOS APRENDER** — relacionar VIDEO → IDEA → TEMA
> → ÁNGULO → HOOK → ESTRUCTURA → NARRACIÓN → VOZ → ESTILO →
> COMPONENTES → COMPOSICIONES → AUDIO → DURACIÓN → RESULTADO, y
> analizar retención, % visto, reproducciones, clics, leads,
> conversiones, ventas. Sin conclusiones inventadas.
>
> **21. QA** — comprobar automáticamente todo lo objetivamente
> comprobable: duración, resolución, FPS, audio, clipping, volumen,
> pantalla negra, archivo corrupto, sincronización, assets faltantes,
> texto fuera de pantalla, elementos superpuestos mal, timing, errores
> de render. Más una capa de alertas creativas (exceso de repetición,
> falta de dinamismo, tramo sin mecanismo de retención, demasiada
> información) — sin fingir que una fórmula determina perfectamente si
> una historia es buena.
>
> **22. CAPACIDAD DE CRÍTICA** — el sistema no debe obedecer
> ciegamente; debe poder señalar problemas concretos (repetitivo, asset
> no representa el concepto, hook promete algo que no se entrega,
> escena sobrecargada, pronunciación problemática, componente inútil,
> experimento que no vale la pena) siempre indicando si es hecho,
> regla, heurística, hipótesis, resultado real o recomendación.
>
> **23. PRESUPUESTO** — regla absoluta: **$0 hasta conseguir ventas.**
> No depender obligatoriamente de servicios pagos. Si existe una
> solución paga mejor: documentarla, investigar alternativa gratuita,
> dejar interfaz preparada, no convertirla en dependencia obligatoria,
> pedir autorización antes de cualquier gasto. Ningún proceso
> automático gasta dinero real sin autorización explícita.
>
> **24. INVESTIGACIÓN EXTERNA** — no inventar, no suponer, no
> implementar basándose en una posibilidad. Decir "necesito investigar
> X porque no puedo confirmar Y" y esperar la información; incorporarla
> luego a la documentación del proyecto. Especialmente para nuevas
> tecnologías, modelos TTS, APIs, licencias, capacidades de
> herramientas, requisitos de hardware, servicios externos,
> limitaciones técnicas.
>
> **25. MEMORIA DEL PROYECTO** — memoria documental de toda decisión
> importante: visión, arquitectura, decisiones, principios, módulos,
> contratos, experimentos, resultados, problemas, soluciones,
> decisiones rechazadas, investigaciones, dependencias, estado de cada
> fase. No depender solo de la memoria de una conversación. El proyecto
> debe poder explicar qué somos, qué construimos, por qué así, qué está
> hecho, qué falta, qué decidimos NO hacer.
>
> **26. TRABAJO POR FASES** — Fase 0 Comprensión, 1 Diseño, 2
> Fundaciones, 3 Narración+Voz, 4 Director Visual, 5 Componentes, 6
> Assets, 7 Audio, 8 QA, 9 Laboratorio, 10 Producción, 11 Datos, 12
> Aprendizaje. El orden puede cambiar con una razón técnica explicada
> antes.
>
> **27. REGLA DE NO DESTRUIR** — no borrar/sobrescribir/destruir
> sistemas anteriores sin autorización. Código antiguo: identificar,
> evaluar, documentar, decidir si se reusa, aislar si corresponde. La
> nueva arquitectura puede vivir en carpetas/módulos nuevos.
>
> **28. REGLA DE NO SOBREINGENIERÍA** — cada pieza debe tener una
> razón: qué problema resuelve, por qué ahora, qué habilita a futuro,
> si se puede simplificar, qué riesgo introduce.
>
> **29. REGLA DE ESCALABILIDAD** — diseñar para poder crecer
> (componentes, estilos, escenas, guiones, voces, assets,
> experimentos, videos, resultados) sin inventar infraestructura
> innecesaria para el estado actual.
>
> **30. AUTONOMÍA PROGRESIVA** — de "Claude propone → humano revisa →
> Claude implementa" a "Claude propone → humano aprueba → sistema
> ejecuta" a "sistema experimenta → registra → humano supervisa" a
> "sistema crea → experimenta → analiza → aprende → propone nuevas
> direcciones", siempre con control sobre gastos y acciones
> irreversibles.
>
> **31. LO QUE QUEREMOS EVITAR** — código duplicado sin razón, 5
> sistemas haciendo lo mismo, scores falsamente precisos, assets
> aleatorios, componentes aislados que nunca llegan a producción, una
> tabla gigante editable a mano, depender de una sola API sin
> necesidad, depender obligatoriamente de servicios pagos, videos
> repetitivos, voces inconsistentes, narraciones mal pronunciadas,
> números mal interpretados, animaciones sin función, edición caótica,
> automatización que esconda errores, features solo porque "quedan
> bien".
>
> **32. PRINCIPIO DE CALIDAD** — calidad = IDEA + NARRATIVA + VOZ +
> INFORMACIÓN + VISUAL + AUDIO + RITMO + RETENCIÓN + COHERENCIA
> trabajando para la misma intención — no complejidad, no efectos, no
> cortes por cortar, no voz artificialmente perfecta.
>
> **33. CREATIVIDAD SIN TECHO** — 500 componentes es una referencia
> inicial de ambición, no un límite; la arquitectura debe permitir
> 1.000/5.000+ si tiene sentido, pero cada componente nuevo debe
> aportar una posibilidad real (diversidad real, no cantidad vacía).
>
> **34. REGLA DE DECISIÓN** — ante varias alternativas, no elegir
> automáticamente la más fácil ni la más compleja: presentar Opción A
> (qué hace, ventajas, desventajas, riesgos), Opción B (ídem),
> Recomendación (cuál y por qué). La decisión final es del operador.
>
> **35. PRIMER TRABAJO** — NO implementar todavía. Leer y comprender la
> especificación; inspeccionar el repo actual; identificar qué sirve
> para la nueva fábrica (sin obsesionarse con conservar el diseño
> anterior); identificar capacidades a construir desde cero;
> identificar dependencias externas que necesiten investigación;
> proponer arquitectura completa, estructura de carpetas, sistemas
> principales, cómo se comunican, cómo se guarda estado/memoria, cómo
> viaja un video de idea a render, cómo se resuelve específicamente
> narración/voz/números/pronunciación/timestamps/sincronización/
> componentes/Director Visual/dinamismo/retención/assets/
> anti-repetición/QA/experimentos/aprendizaje; marcar qué necesita
> investigación y qué se puede hacer ya con presupuesto cero.
>
> **36. FORMATO DE RESPUESTA** — A. Interpretación, B. Principios, C.
> Arquitectura propuesta, D. Sistemas, E. Flujo completo, F. Voz y
> narración, G. Director Visual, H. Dinamismo y retención, I. Memoria y
> anti-repetición, J. Experimentación, K. Datos y aprendizaje, L.
> Presupuesto cero, M. Investigación necesaria, N. Riesgos, O. Plan de
> implementación, P. Decisiones que necesitás de nosotros (solo
> preguntas que cambien la arquitectura, nada ya respondido acá).
>
> **37. REGLA FINAL** — no impresionar con miles de líneas de código;
> construir algo que pueda ser una fábrica audiovisual de nueva
> generación real. Pensar a largo plazo, ser ambicioso y creativo, pero
> diferenciar siempre lo que se sabe / se infiere / se propone / se
> necesita investigar / está comprobado / es hipótesis. Si hay una
> forma mejor de hacer algo, proponerla — no hay obligación de seguir
> cada detalle literal, sí de respetar el objetivo. **NO IMPLEMENTAR
> TODAVÍA.**

---

## Respuesta (Fase 0/1 — sin implementar)

### A. Interpretación

Lo que están pidiendo no es "una herramienta mejor para hacer los 20
videos que ya hicimos". Es reemplazar el patrón de trabajo que usé
para construirlos: **un archivo de datos + un componente gigante con
switch-case por tipo de contenido, mantenido a mano** (`casos.ts` +
`CasoGenerico.tsx`), por un sistema donde:

1. El contenido visual se describe con **datos**, no con código nuevo
   por video.
2. Los bloques audiovisuales (componentes) **se autodescriben**, y un
   Director elige entre ellos por lo que necesitan cumplir, no por
   nombre.
3. La voz es la **fuente de verdad del tiempo** en todo momento, nunca
   una capa que se agrega después sobre un timeline ya fijado a mano
   (el bug de `RebeccaBeach.tsx` de esta sesión es exactamente el caso
   que esto debe volver estructuralmente imposible).
4. Cada decisión de "esto es mejor que aquello" queda **separada** de
   si en verdad demostró serlo con datos reales — nada de inventar que
   algo funciona.
5. El sistema recuerda lo que ya hizo, para variar sin perder
   identidad.
6. Todo esto crece por FASES, con costo $0, sin tirar lo que ya
   funciona (el motor viejo de "El Corte" y el motor de la serie
   documental siguen produciendo mientras la nueva fábrica se construye
   al lado).

### B. Principios que voy a respetar como no negociables

1. Componente ≠ Formato (sección 4). Un componente no sabe para qué
   video se usa.
2. El Director Visual filtra por metadata, nunca por `if tipo === 'x'`.
3. Heurística ≠ Resultado real. Todo score que yo calcule antes de
   tener datos de publicación se etiqueta `HEURISTICA`.
4. Asset faltante > asset incorrecto.
5. La voz manda el tiempo. Nunca al revés.
6. $0 hasta la primera venta real de esta línea de producto.
7. No borrar nada del motor viejo ni del motor documental sin permiso.
8. No construir infraestructura para 10.000 videos antes de tener 3
   funcionando con el patrón nuevo.
9. Toda decisión de arquitectura relevante se escribe en un archivo,
   no solo se conversa (esto — irónicamente — es la falla que causó
   que tengamos que reescribir este documento).
10. Cuando no pueda confirmar algo (licencia, capacidad de un modelo,
    hardware), lo digo así de explícito, no lo relleno con una
    suposición razonable.

### C. Arquitectura propuesta (vista general)

```
IDEA/BRIEF
    │
    ▼
GUION ESTRUCTURADO (no texto plano: unidades tipadas)
    │
    ▼
VOZ (por unidad, nunca un bloque continuo a cortar)
    │
    ▼
NORMALIZACIÓN + (si es posible) ALINEACIÓN
    │
    ▼
DIRECTORES (Visual · Audio · Retención) ── consultan ──► REGISTRO DE COMPONENTES
    │                                                     (metadata, no código)
    ▼
ÁRBOL DE COMPOSICIÓN (Secuencia → Escena → Composición → Componente)
    │
    ▼
RESOLUCIÓN DE ASSETS (falta ≠ incorrecto)
    │
    ▼
RENDER (Remotion, igual que hoy)
    │
    ▼
QA (automático + alertas heurísticas)
    │
    ▼
VIDEO FINAL ──► PUBLICACIÓN ──► DATOS REALES ──► ANÁLISIS ──► APRENDIZAJE
    ▲                                                              │
    └──────────────────── LABORATORIO DE EXPERIMENTOS ◄────────────┘
```

Todo esto necesita un lugar donde vivir. Estructura de carpetas
propuesta (nueva, al lado de lo que ya existe — nada se mueve todavía):

```
fabrica/
  guion/            # ideación, ángulo, hook, guion estructurado
  voz/              # motor TTS, normalización, alineación
  componentes/      # el registro: metadata + implementación Remotion
    registro.json   # (o .ts) — un componente = una entrada autodescripta
    render/         # los .tsx que Remotion realmente monta
  directores/       # visual.ts, audio.ts, retencion.ts
  assets/           # buscador/evaluador, NO una carpeta de archivos
  composicion/      # arma el árbol Secuencia/Escena/Composición
  qa/               # checks automáticos + alertas heurísticas
  laboratorio/      # hipótesis, experimentos, resultados, conclusiones
  memoria/          # anti-repetición + histórico + datos reales
  docs/             # este archivo y los que sigan (decisiones, ADRs)
```

`remotion-spike/` no desaparece: pasa a ser el motor de RENDER que
`fabrica/componentes/render/` y `fabrica/composicion/` terminan
invocando. Lo que sí cambia es que `CasoGenerico.tsx` deja de ser "el
único componente gigante con toda la lógica adentro" — su lógica de
timing/armado se vuelve la función genérica de `composicion/`, y cada
bloque visual (Cronologia, CifraSeCae, Contador, ListaTachada,
Diagrama, StackImpacto...) pasa a tener una entrada en
`componentes/registro.json` con su metadata. Es una refactorización,
no una reescritura desde cero: ya existen casi todos los componentes
visuales que hacen falta, dispersos sin catálogo en
`remotion-spike/src/escenas/`, `dibujo/`, `agresivo/` y `receta/`.

**Dato relevante que encontré inspeccionando el repo:**
`remotion-spike/src/receta/` (compilar.ts, guiones.ts, intenciones.ts,
manifiesto.json, personas.ts, resolverClip.ts) ya es un intento previo
de exactamente esto — un compilador de guion a video con "intenciones"
como concepto. No lo conocía en detalle antes de este documento. Antes
de diseñar el Director Visual desde cero, la Fase 1 real incluye leer
ese sistema a fondo: puede que la mitad del trabajo ya esté hecha ahí,
abandonada a medio camino.

### D. Sistemas y responsabilidad de cada uno

- **Guion (`fabrica/guion/`):** convierte una idea/brief en una lista
  de **unidades narrativas tipadas** (hook, dato, comparación,
  revelación, cta...), cada una con su texto Y su rol retórico. No
  produce "texto plano a partir del cual adivinar estructura después"
  — la estructura se decide ACÁ, una sola vez.
- **Voz (`fabrica/voz/`):** motor TTS + normalizador + (si se puede)
  alineador. Entrada: unidades del guion. Salida: un archivo de audio
  POR UNIDAD (nunca un continuo a cortar — la lección de
  `dividir_voz_completo.py` de la sesión del 20/8, que tuvo que inventar
  una alineación por programación dinámica para cortar un audio
  continuo, no debería repetirse) + duración real medida + (si existe)
  timestamps internos.
- **Directores (`fabrica/directores/`):** tres roles separados:
  - *Visual*: para cada unidad, consulta el registro de componentes y
    elige (o arma una composición de varios) según metadata, no
    nombre.
  - *Audio*: decide música/SFX/intensidad por tramo.
  - *Retención*: anota qué mecanismo de retención cubre cada tramo
    (puede detectar huecos: "este tramo de 8s no tiene ningún
    mecanismo de retención activo" como alerta, no como bloqueo).
- **Registro de componentes (`fabrica/componentes/registro.json` +
  `render/*.tsx`):** la metadata vive separada del código Remotion que
  la implementa. Agregar un componente = agregar una entrada +
  opcionalmente un `.tsx` nuevo; nunca tocar el Director.
- **Assets (`fabrica/assets/`):** dado "necesito representar X", busca
  en `assets/biblioteca`, `assets/personas`, `assets/metraje_video` (ya
  existen y están curados), evalúa relevancia, y si no hay nada que
  cumpla un umbral, **marca faltante** en vez de devolver cualquier
  cosa.
- **Composición (`fabrica/composicion/`):** arma el árbol
  Secuencia→Escena→Composición→Componente con los tiempos reales de
  voz ya resueltos, y se lo entrega a Remotion.
- **QA (`fabrica/qa/`):** checks duros (ffprobe: duración, audio
  presente, resolución, silencios raros, clipping) + una lista de
  alertas heurísticas explícitamente marcadas como tales.
- **Laboratorio (`fabrica/laboratorio/`):** registra
  hipótesis→experimento→producción→resultado→conclusión.
- **Memoria (`fabrica/memoria/`):** un store simple (JSON o SQLite,
  $0) con lo usado recientemente (para anti-repetición) y, más
  adelante, los resultados reales de publicación.

### E. Flujo completo de un video

1. Brief/idea entra (manual al principio).
2. Guion genera unidades narrativas tipadas.
3. Voz genera un audio + duración real por unidad.
4. Normalización resuelve cómo se dice/muestra cada número/cifra/fecha
   ANTES de mandarlo al TTS (no después).
5. Director de Retención anota qué mecanismo cubre cada unidad.
6. Director Visual, unidad por unidad, consulta el registro y arma la
   composición (puede ser 1 componente o varios).
7. Director de Audio decide música/SFX/intensidad por tramo.
8. Assets resuelve lo que cada componente elegido necesita (foto,
   video, ícono...) o marca faltante.
9. Composición arma el árbol final con los tiempos reales de voz.
10. Render (Remotion) monta y renderiza (igual que hoy, en GitHub
    Actions, matrix + commit).
11. QA corre checks duros + heurísticos.
12. Publicación (manual al principio, con confirmación explícita —
    regla de oro del proyecto).
13. Datos reales entran cuando existan (retención, vistas, etc.).
14. Análisis compara resultado real contra lo que el Director de
    Retención había anotado como hipótesis.
15. Laboratorio propone el próximo experimento con esa evidencia.

### F. Voz y narración — cómo evito que se repita el bug de Rebecca

El problema real que tuvimos no fue de calidad de voz: fue que un
guion armado con **tiempos fijos, decididos antes de que existiera
audio real**, es incompatible con narración real (hablar una oración
completa siempre tarda más que lo que el ojo necesita para leer un
golpe de texto en pantalla). La arquitectura nueva lo previene por
diseño, no por revisión:

- **Regla dura:** ningún componente ni escena define su propia
  duración en segundos. La duración de una unidad = duración real de
  su audio (medida, no estimada) + un margen fijo de aire. Esto ya es
  así en `CasoGenerico.tsx` (`AIRE_LINEA`, `sumaAudio`) — se vuelve
  ley general, no una excepción de un componente.
- **Un archivo de audio por unidad narrativa**, nunca un audio
  continuo a cortar por silencios (eso ya lo aprendimos dos veces:
  ElevenLabs continuo + `dividir_voz_completo.py`, y de nuevo con la
  reindexación de esta sesión). Cada unidad = su propio archivo, su
  propia duración medida, su propio índice — sin ambigüedad de dónde
  empieza/termina.
- **Normalización antes de la síntesis, no después:** todo número,
  moneda, porcentaje, fecha pasa por un normalizador que produce
  `{valor, tipo, texto_hablado, texto_visual}` ANTES de llamar al TTS.
  Hoy esto se hace a mano, caso por caso, en `casos.ts` (ej. "Más de
  1500" como string literal). Formalizarlo es trabajo real de Fase 3,
  no trivial, pero acotado.
- **Timestamps palabra-por-palabra: NO CONFIRMADO.** No sé si el motor
  C de `qwen3-tts` expone alineación interna (probablemente no — es un
  motor de inferencia, no de alineación). Alternativa gratuita
  conocida: correr un forced-aligner sobre el audio ya generado
  (ej. Whisper con timestamps, local, gratis) como paso posterior. Esto
  es investigación pendiente (ver sección M), no until entonces asumo
  que existe.

### G. Director Visual — cómo evito el monstruo inmanejable

El riesgo real con cientos/miles de componentes no es tenerlos: es que
alguien (yo) tenga que acordarse de todos para elegir. Por eso:

- Cada componente es una entrada de **datos** (JSON), no una decisión
  de código. Campos mínimos: `id`, `categoria` (texto/cifra/gráfico/
  comparación/...), `funcion` (qué comunica), `intensidad` (0-1),
  `ritmo` (estático/dinámico/muy dinámico), `capacidadTexto`
  (cuánto texto soporta bien), `requiereAssets` (sí/no + tipo),
  `duracionMinMax`, `compatibleCon` (categorías con las que combina
  bien), `implementacion` (qué componente Remotion lo renderiza).
- El Director Visual no itera "si esto entonces aquello": arma una
  consulta (categoría necesaria + intensidad deseada + si hay asset
  disponible + qué no se usó hace poco) y **filtra + puntúa** el
  registro. Agregar un componente 501 es agregar una fila; el
  Director no cambia.
- Esto es exactamente lo que `receta/manifiesto.json` (ya existente)
  empieza a intentar — hay que leerlo a fondo antes de re-inventarlo.

### H. Dinamismo y retención — cómo lo modelo

Cada unidad de composición (no cada escena entera) lleva un vector de
cambios: `{visual: bool, textual: bool, sonoro: bool, espacial: bool,
informativo: bool, narrativo: bool}`. Una escena de 8 segundos con
cambios en 4 de esas 6 dimensiones a distintos momentos cuenta como
dinámica aunque no corte de plano. El Director de Retención, aparte,
etiqueta cada unidad con el mecanismo de retención que se supone que
cubre (`promesa`, `pregunta_abierta`, `escalada`, `revelacion`, `giro`,
...) — y el QA heurístico puede alertar "hay 12 segundos seguidos sin
ningún mecanismo etiquetado", que es información útil aunque no sea
una garantía de que el tramo aburre.

### I. Memoria y anti-repetición

Un store simple ($0: JSON versionado en git, o SQLite si crece)
registra por video: componentes usados, composiciones, hooks,
estructura narrativa, voz, estilo. El Director Visual, al puntuar
candidatos, resta puntos a lo usado en los últimos N videos — pero esa
penalización se anula si ese mismo patrón ya tiene un resultado real
demostrado como bueno (cuando exista ese dato). Al principio (sin
datos reales todavía) el anti-repetición es la única señal; con
datos reales, ambas señales conviven.

### J. Experimentación

El Laboratorio es una tabla más en la misma memoria: cada fila es
`{hipotesis, experimento, video_producido, resultado_real|null,
conclusion|null, estado}`. Mientras no haya resultado real, el estado
es `esperando_datos`; la evaluación mientras tanto es manual/humana
(el operador mira el video y opina). Nada se marca "exitoso" solo
porque a mí me pareció bueno.

### K. Datos y aprendizaje

Tipos separados y nunca mezclados, ni siquiera en el nombre de campo:
`Hipotesis`, `Experimento`, `ResultadoReal`, `Conclusion`. Un score
heurístico mío se guarda como `hipotesis.score_estimado`, nunca como
`resultado.metrica`. Solo cuando `resultado_real` existe se puede
escribir una `conclusion`.

### L. Qué se puede hacer ya, con $0

- Render: Remotion en runners gratis de GitHub Actions (ya funciona).
- Voz: Qwen3-TTS motor C, local/CPU, sin costo (ya funciona).
- Registro de componentes + Director Visual: son datos y lógica propia,
  sin dependencia externa.
- Memoria/Laboratorio: JSON en el repo (o SQLite) — sin servicio pago.
- QA duro: ffprobe/ffmpeg, ya instalado en los runners.
- Assets: las carpetas `assets/biblioteca`, `assets/personas`,
  `assets/metraje_video` ya curadas, sin costo adicional.
- Normalización de números/monedas: lógica propia (reglas), sin
  servicio pago.

Nada de la Fase 2-8 requiere gastar dinero. Recién en volumen alto
(cientos de renders simultáneos, un TTS mejor pago, un banco de assets
pago) aparecería un costo real — y ahí aplica la regla de pedir
autorización antes.

### M. Investigación necesaria (NO CONFIRMADO — no voy a inventarlo)

1. ¿El motor `qwen3-tts` (C) expone timestamps por palabra o por
   fonema? No lo verifiqué — necesito revisar su documentación/código
   a fondo o probarlo explícitamente.
2. Calidad de Qwen3-TTS específicamente con números grandes, monedas y
   fechas en español (no lo medí — solo probé frases narrativas
   normales).
3. Licencia exacta de uso comercial del motor `gabriele-mastrapasqua/
   qwen3-tts` y del checkpoint del modelo Base 1.7B que bajamos de
   Hugging Face (usé el modelo asumiendo que era libre para este uso,
   pero no leí los términos de licencia línea por línea).
4. Si conviene un forced-aligner gratuito corrido en GitHub Actions
   (ej. whisper con timestamps) como paso posterior para conseguir
   alineación palabra-por-palabra, y qué tan pesado es en tiempo de
   runner.
5. Límite real de minutos gratis de GitHub Actions Actions al escalar
   de 20 a cientos de videos (relevante para el plan de fases 10+).

### N. Riesgos

- **Explosión de componentes sin catálogo:** ya está pasando —
  `remotion-spike/src/escenas/` tiene ~26 archivos con nombres tipo
  `formatosNuevos3.tsx`, `Muestrario7.tsx` sin metadata que los
  describa. Si la Fase 2 no arranca por ahí, el problema empeora con
  cada componente nuevo.
- **Asset incorrecto representando a una persona real:** ya lo
  discutimos esta sesión (rechacé clonar una voz sin consentimiento);
  el mismo cuidado aplica a fotos/videos de "personas" en casos
  reales — un asset visual que sugiera algo falso de una persona real
  identificable es un riesgo, no solo un problema de calidad.
- **Drift de contrato de voz/timing** si no se formaliza: el bug de
  reordenamiento de esta sesión pasó por hacer el mapeo "a mano, una
  vez más" en vez de tener una función única y probada.
- **Sobreingeniería:** el prompt pide explícitamente evitarla (regla
  28) — el riesgo concreto es empezar por el Director Visual "perfecto"
  antes de tener 3 componentes reales registrados para probarlo.
- **Cuota de minutos de GitHub Actions** en volumen alto (no medido
  todavía, ver sección M).

### O. Plan de implementación (fases, concreto)

- **Fase 0 (hecha):** esta lectura + inspección del repo.
- **Fase 1 (siguiente, sin código):** leer a fondo `receta/` (puede
  ahorrar la mitad de la Fase 4); decidir con ustedes las preguntas de
  la sección P.
- **Fase 2 — Fundaciones:** esquema de datos del registro de
  componentes (JSON schema) + memoria mínima (JSON en git). Sin migrar
  nada todavía, solo el esquema y un validador.
- **Fase 3 — Narración + voz:** formalizar normalización
  número/moneda/fecha como módulo único; confirmar timestamps (sección
  M); un archivo por unidad narrativa como regla dura.
- **Fase 4 — Director Visual:** sobre el registro de la Fase 2, migrar
  2-3 componentes existentes (ej. `Cronologia`, `Contador`) como
  prueba de que el Director los elige sin código nuevo.
- **Fase 5 — Componentes:** ampliar el registro con lo que ya existe en
  `escenas/`/`dibujo/`/`agresivo/` (catalogar, no reescribir).
- **Fase 6 — Assets:** formalizar el buscador/evaluador sobre las
  carpetas ya curadas.
- **Fase 7 — Audio:** Director de Audio sobre lo que ya hace
  `Golpe`/SFX hoy.
- **Fase 8 — QA:** automatizar los checks duros que hoy hago a mano
  (ffprobe, duración, audio presente).
- **Fase 9 — Laboratorio:** primeras hipótesis reales sobre la serie
  documental ya producida.
- **Fase 10-12:** producción en volumen, datos reales, aprendizaje —
  no antes de tener publicaciones con métricas reales.

### P. Decisiones que necesito de ustedes (solo las que cambian la arquitectura)

1. **¿La nueva fábrica reemplaza la serie documental actual
   (`CasoGenerico.tsx`) o la extiende hacia adelante?** Si reemplaza,
   los 20 videos ya entregados quedan como están (no se re-renderizan)
   y el próximo video ya usa el patrón nuevo. Si extiende, tengo que
   migrar `CasoGenerico.tsx` a componentes registrados sin romper lo
   que ya funciona.
2. **¿Dónde vive la memoria/laboratorio/datos reales?** Opción A: JSON
   versionado en el propio repo (más simple, $0, sin límite de
   servicio, pero no apto para consultas complejas ni para que la app
   móvil del operador escriba resultados directo). Opción B: Supabase
   (ya mencionado como opción gratuita en `CLAUDE.md` — sí permite
   consultas/escritura desde cualquier lado, pero es una dependencia
   externa nueva). Mi recomendación: A para memoria de decisiones/
   componentes (poco volumen, versionado importa), B si el operador va
   a cargar resultados reales de ventas/vistas desde el celular sin
   pasar por Claude Code.
3. **¿Confirman que `receta/` (el sistema previo con "intenciones")
   se investiga primero antes de diseñar el Director Visual desde
   cero?** Cambia el orden de la Fase 1/4 — si ya saben que ese sistema
   se abandonó por una razón específica, ahorra tiempo que me lo digan
   ahora.
4. **¿Alguien va a poder confirmar la licencia del modelo/motor de
   Qwen3-TTS** (sección M.3), o investigo yo mismo con lo que el
   sandbox me permite alcanzar?
