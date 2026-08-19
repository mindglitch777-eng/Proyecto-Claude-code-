# Sistema Anti-Fracaso

No es motivación. Es una lista de las formas concretas en que este
proyecto puede morir, y qué lo evita en cada caso. Se revisa una vez por
mes junto con el reporte de portafolio.

---

## RIESGO 1 — Construir herramientas en vez de publicar
**Es el riesgo más probable de todos, y ya está ocurriendo.**
A la fecha hay ~20 archivos de herramientas y 0 videos publicados,
0 nichos investigados, 0 datos reales.

Por qué pasa: construir es entretenido, medible y se siente productivo.
Publicar expone a que nadie mire. El cerebro elige lo primero.

**Contramedida — regla del 1:1**
Después de este documento, por cada mejora nueva al pipeline tiene que
haber **una pieza de contenido real publicada**. Sin excepción.
Si hay 3 mejoras seguidas sin publicar nada, el sistema está fallando
por este riesgo, no por falta de herramientas.

**Señal de alarma**: pensar "cuando esté un poco más pulido, arranco".
Nunca va a estar. Publicar con lo que hay es la única salida.

---

## RIESGO 2 — Producir sin distribuir
Ya corregido en el plan (Gumroad no trae compradores), pero vuelve solo.

**Contramedida**: ninguna fase se marca como lanzada sin un plan de
distribución escrito Y ejecutado 30 días seguidos. `validar_hook.py` y
el `revisor-calidad` lo chequean.

---

## RIESGO 3 — Rotar de canal / nicho antes de tiempo
Cambiar de estrategia a los 10 días porque "no funcionó" es la causa
número uno de que nada funcione nunca. Ningún canal muestra resultados
reales antes de 30 días de constancia.

**Contramedida**: compromiso mínimo de 30 días por canal, escrito en
`state/log.md` con fecha de inicio. Antes de esa fecha no se evalúa ni
se cambia. `guardian.py` puede vigilarlo.

---

## RIESGO 4 — Quedarse sin combustible (motivación)
Este es real y nadie lo planifica. Van a pasar semanas sin una venta.

**Contramedida — métricas de proceso, no solo de resultado**
Las ventas no dependen solo de vos; la constancia sí. Medir y celebrar:
"publiqué 30 días seguidos" es un logro real aunque las ventas sean 0,
porque es lo único que garantiza que el experimento fue válido.
Si a los 30 días con ejecución real no hay resultado, el problema es la
hipótesis (nicho/oferta), no el esfuerzo — y eso es información útil,
no fracaso.

---

## RIESGO 5 — Dependencia total de una sola persona
Si te enfermás, te quemás o perdés 3 semanas, el sistema entero para.

**Contramedida — modo mínimo**
Definir de antemano qué es lo mínimo indispensable para que un activo
no muera en una semana mala (ej: 1 publicación por semana en vez de
diaria). Escribirlo ahora, cuando estás con energía, no en la semana
mala. El modo mínimo no es fracaso: es lo que evita volver a cero.

---

## RIESGO 6 — Una plataforma te cierra la cuenta
Puede pasar sin aviso y sin explicación: TikTok, Gumroad, YouTube.

**Contramedidas**:
- Lista de email propia desde el primer día (ya está en el plan).
- Backup del contenido y del repo fuera de GitHub.
- No poner los 3 activos activos en la misma plataforma.

---

## RIESGO 7 — Problema legal por assets o diseños
Copyright de música, imágenes, o un diseño demasiado parecido a otro.

**Contramedidas**: `ASSETS.md` e `IMAGENES.md` con las fuentes
verificadas, `assets/LICENCIAS.txt` con el origen de cada archivo, y el
gate humano de aprobar cada diseño antes de publicarlo.

---

## RIESGO 8 — Gasto que se escapa
**Contramedida**: `guardian.py` con límite duro de gasto + nunca
configurar `ANTHROPIC_API_KEY` (sin tarjeta conectada no hay cobro
sorpresa posible) + presupuesto de ads acotado y aprobado por vos.

---

## REVISIÓN MENSUAL (15 minutos, una vez por mes)
Responder por escrito en `state/log.md`:
1. ¿Publiqué más de lo que construí este mes? (Si no → Riesgo 1 activo)
2. ¿Sostuve el canal de distribución 30 días? (Si no → Riesgo 3)
3. ¿Hay algún activo con más de 20 horas y 0 resultado? (`reporte.py`)
4. ¿Cuál fue el aprendizaje real del mes, no la actividad?
5. ¿Sigo en fecha respecto de los checkpoints de 3 y 6 meses?

## LA REGLA QUE RESUME TODO
Un sistema perfecto sin contenido publicado vale exactamente cero.
Un sistema mediocre con 30 publicaciones reales y datos genera
aprendizaje, y el aprendizaje es lo único que compone con el tiempo.
