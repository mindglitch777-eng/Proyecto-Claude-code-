# Sistema de Ingresos Pasivos — Constitución del Proyecto

## Contexto
Operador humano trabaja solo desde celular (sin computadora). Toda ejecución
de código ocurre a través de Claude Code (terminal remoto vía app móvil).
No hay infraestructura propia: usar servicios cloud gratuitos/baratos
(Supabase, Google Sheets como DB ligera, GitHub Actions para scheduling).

## Regla de oro
Ninguna acción que gaste dinero real, envíe mensajes a terceros reales,
o publique contenido públicamente se ejecuta sin confirmación explícita
del operador en esa sesión. Nada corre "solo" sin que un cron/GitHub Action
lo dispare — no existe un proceso en segundo plano indefinido.

## Postura resolutiva (regla permanente, agregada tras R7-21)
Nunca paralizarse ante un bloqueo. Si algo falla o parece imposible:
1. Buscar TODAS las soluciones alternativas antes de reportar "bloqueado"
   (otro canal de red, otra herramienta, otro enfoque, leer el código
   fuente en vez de asumir, probar en chico antes de descartar).
2. Si de verdad no existe una solución lista, crearla (un adaptador, un
   fix, un cliente propio) en vez de resignarse.
3. Solo se reporta "BLOQUEADO — NO CONFIRMADO" cuando se agotaron esas
   vías y el bloqueo depende de algo que solo el operador puede decidir
   (plata, cuentas, credenciales) — nunca como primera respuesta.
4. Siempre buscar sumar valor real al proyecto en el camino (un bug
   encontrado se arregla ahí mismo, no solo se documenta), sin perder de
   vista la Regla de oro (nunca gastar, publicar ni contactar terceros
   sin confirmación explícita).

## Prioridad actual: Fase 1 — Productos Digitales
Objetivo: 1 producto digital vendible en Hotmart en los primeros 7 días
(se eligió Hotmart sobre Gumroad: mejor fit para pago en español/LatAm).
No empezar YouTube, ropa, ni agencia hasta que Fase 1 tenga al menos
una venta real o 30 días de intento documentado.

## Principios de diseño
- Modularidad: cada módulo falla independiente, no tumba el resto.
- MVP primero: lanzar rápido, iterar con datos reales, no con suposiciones.
- Cost-conscious: registrar costo de cada llamada a API externa en
  `state/costs.json`.
- Seguridad: ninguna clave de API en código. Todo vía variables de entorno
  (`.env`, nunca commiteado).

## Estado del proyecto
El estado vivo del sistema (tareas, proyectos activos, métricas) vive en
`state/state.json`, gestionado por `orchestrator.py`. Cada sesión nueva de
Claude Code debe leer ese archivo antes de proponer next steps.

## Cómo debe comportarse Claude Code en este proyecto
1. Al iniciar sesión: correr `python orchestrator.py status` primero.
2. Proponer un solo siguiente paso concreto, no un rediseño completo.
3. Antes de cualquier integración con API externa (Hotmart, YouTube, etc.),
   confirmar con el operador qué cuenta/credenciales usar.
4. Documentar en `state/log.md` cada decisión importante y su resultado
   (esto reemplaza la idea de "motor de metacognición": es simplemente
   un log que la siguiente sesión lee antes de decidir).
