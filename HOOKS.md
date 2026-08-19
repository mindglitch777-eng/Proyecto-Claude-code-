# Psicologia del Hook — referencia para escribir guiones

## ACTUALIZACION Q2 2026 (lo mas importante de este documento)

**TikTok cambio la prioridad: ahora manda la retencion a 3 segundos
por encima de todo lo demas.**
- Los videos que retienen 60% pasando los 3s obtienen **4x mas alcance**.
- Creadores fuertes logran **70%+ de retencion de intro**. Por debajo
  de 40%, el video muere en ~300 vistas: el algoritmo no lo expande.
- El efecto cascada: hook debil -> baja retencion de intro -> baja
  tasa de completado -> el algoritmo no distribuye. El video no muere
  por mal contenido, muere porque nadie se quedo.

**FATIGA DE PATRON — el dato que obliga a rotar:**
- Vida util de un formato de hook: 8 semanas en 2023 -> **3,5 semanas
  en 2025**. La audiencia aprende a reconocerlo y saltearlo.
- La tasa de scroll subio de 62% a 78% entre 2024 y 2025.
- Textual: "la pausa dramatica con zoom lento que generaba tension en
  2024 se lee como manipulacion en 2026".
- **Conclusion operativa**: una lista fija de hooks queda vieja en un
  mes. Por eso existe `hooks.py`, que rota los 9 patrones.

**Formato duro**: 8 a 15 palabras. Los mejores caen bajo 2 segundos.
**La palanca es la ESPECIFICIDAD**: "si sos creador" es debil; una
situacion nombrada es fuerte.

**Contrapeso honesto**: el contenido crudo, tipo grabado con el
telefono, obtiene 31% mas engagement que el contenido de produccion
pesada. En nuestro nicho (faceless, filosofia) la produccion cuidada
es la norma, pero conviene no asumir que mas pulido = mas vistas.

---

## Los 4 disparadores cognitivos
Todo hook que funciona activa al menos uno. Los mejores apilan DOS O
MAS en una sola frase:

1. **Curiosidad (curiosity gap)** — informacion incompleta que el
   cerebro necesita resolver. OJO: la curiosidad generica ya no
   funciona, se lee como clickbait. La ESPECIFICA si.
   - Mal: "No vas a creer lo que pasa despues"
   - Bien: "Publique 47 productos. Solo 3 vendieron. Estos son."
2. **Pattern interrupt** — el cerebro navega el feed en piloto
   automatico y saltea todo lo que coincide con el ritmo esperado.
   Hay que romperlo: movimiento brusco, corte seco, afirmacion
   contraintuitiva, una pausa larga en un feed ruidoso.
3. **Auto-relevancia** — que el espectador sienta que le hablan a el.
   "Si vendes en Gumroad y no vendiste nada este mes, es por esto."
4. **Activacion emocional** — sorpresa, indignacion justificada,
   alivio, esperanza. La emocion alta hace el contenido mas
   compartible.

## Los numeros que importan
- **1.3 segundos** para enganchar en TikTok. **2.1 segundos** en
  Reels. Los videos que fallan ahi tienen 89% mas de abandono.
- El hook VISUAL tiene que pegar en el **primer frame**. El hablado,
  en los primeros 3 segundos (10-14 palabras).
- Si tu tasa de "swiped away" supera el 40%, el problema son los
  primeros 3 segundos -- no importa que tan bueno sea el resto.
- **Regla de los 5 segundos**: escanea el video. ¿Hay algun bloque de
  5 segundos donde no cambia NADA (ni corte, ni zoom, ni texto, ni
  sonido)? Eso es una fuga de retencion. Se tapa con un pattern
  interrupt.

## Estructura de retencion
```
Hook -> Valor -> Interrupt -> Valor -> Interrupt -> CTA
```
El hook abre el loop, los interrupts sostienen la atencion, los loops
abiertos empujan a completar el video.

## ARQUITECTURA DE RETENCION (mas alla del hook)

### El loop: la tecnica de mayor impacto
Un video en loop termina de forma que conecta con el frame inicial. El
espectador lo reinicia sin darse cuenta. Desde marzo 2025, **YouTube
cuenta cada loop como una vista adicional** -- infla vistas y señal
algoritmica al mismo tiempo. Retenciones arriba del 100% son posibles.

Funciona **especialmente bien en contenido sin cara**: la ausencia de
un rostro elimina la señal de que empezo una escena nueva, asi que
volver al inicio se siente invisible. Nuestro caso exacto.

Implementado: `"loop": true` en el guion de `animador_v5.py`.

### Las 3 curvas de retencion
- **Acantilado**: caida del 30-50% en los primeros 3s. Mata el alcance.
- **Joroba**: sostenida arriba del 60% en el medio. Alta tasa de
  compartidos. Ideal para tutoriales y sorpresas.
- **Meseta**: plana arriba del 70% con final que loopea. **La favorita
  del algoritmo.** Los formatos de lista numerada ("3 errores...",
  "5 formas...") la logran de forma mas confiable, porque cada punto
  es un mini-payoff auto-contenido.

Implementado: estilo `"lista"` en `animador_v5.py`.

### Ritmo de corte
- TikTok: un cambio visual cada **1.5-3 segundos**. Shorts: 1.5-2s.
- **Variar el ritmo a proposito**: el mismo ritmo de corte del segundo
  1 al 60 se siente predecible y genera baja activacion. Agrupar
  cortes rapidos en los momentos de mayor energia.
- Videos bajo **20-25 segundos** tienen la mayor tasa de completado.

### Estructura de tres actos (energia creciente)
1. **Hook (0-3s)**: energia maxima desde el frame 1.
2. **Valor (3-40s)**: interes escalando hacia un segundo pico.
3. **Payoff + CTA**: cierra el loop que abrio el hook.
Cada acto debe tener un techo de energia mas alto que el anterior. Si
el pico llega al 30% y despues hay 6 segundos de explicacion lenta, la
curva se derrumba.

### Errores que cuestan retencion
- El arranque lento: "Hoy quiero hablarles de algo que..." -- esas
  palabras te cuestan el espectador. Empeza en el medio de la accion.
- Payoff atrasado: adelantalo a la primera mitad.
- Cierre con "gracias por ver" y fundido lento: no gana nada. Un
  cierre limpio que loopea o abre la proxima entrega si.

### Loops internos
Cada 10-15 segundos se puede abrir un mini-loop para reenganchar a
quien empieza a irse ("y en un segundo te muestro el numero real").
Solo funciona si DESPUES lo cumplis -- el tease vacio ya se detecta y
se castiga.

## Formulas mas consistentes (2026)
Los creadores que mejor rinden ROTAN entre 5 y 10 formulas, no usan
siempre la misma:
1. **Afirmacion contraintuitiva** — "Bajar el precio me hizo vender
   menos."
2. **Advertencia de error** — "Estas cometiendo este error y te esta
   costando ventas."
3. **Lista con tease** — "3 razones por las que nadie compra tu
   producto. La tercera duele."
4. **POV** — formato dominante en 2026 (23% de los videos que se
   vuelven virales).
5. **Confesion/numero especifico** — "Perdi 4 meses en un nicho sin
   compradores. Asi lo detecto ahora."

## CASO DE FRACASO (estudiar este, vale mas que los exitos)
Una marca lanzo un hook que cumplia las 3 reglas: pattern interrupt +
curiosity gap + trigger emocional con dato especifico. Retencion a 3
segundos: **38%** -- por debajo del piso de TikTok. El algoritmo mato
la distribucion.

**Por que fallo**: la afirmacion requeria contexto previo que la
audiencia no tenia (mencionaba un marco de referencia que solo el 12%
de esa audiencia conocia).

**Leccion**: un hook tecnicamente perfecto falla si asume conocimiento
que el espectador frio no tiene. El hook tiene que funcionar para
alguien que no sabe NADA de tu nicho.

## Reglas practicas de produccion
- Sin intro, sin logo, sin "hola que tal". El valor arranca en el
  frame 1.
- Tiene que funcionar **con el sonido apagado** -- texto en pantalla
  desde el primer frame.
- Nunca hagas una pregunta que el espectador pueda responder mentalmente
  al instante: eso elimina la tension.
- Prueba: mira tu propio video en mute. Si el hook no te frena a vos,
  no va a frenar a nadie.

## Como se testea (esto es lo que separa a los que crecen)
El hook NO es una decision creativa de una sola vez -- es una
variable que se testea sistematicamente. Protocolo para este proyecto:
1. Por cada video, escribir 3 hooks distintos (formulas distintas).
2. Publicar el mismo contenido con hooks diferentes en dias distintos.
3. Registrar retencion a 3 segundos en `state/log.md`.
4. Construir una **biblioteca de hooks** organizada por formula y por
   nicho. Con el tiempo, esa biblioteca es la ventaja competitiva
   real -- se acumula, no se gasta.

## Nota final honesta
La tecnica del hook importa mas que la produccion: contenido visualmente
simple con hooks bien ejecutados retiene mejor que produccion cara con
hooks debiles. Nuestro pipeline de video ya es mas que suficiente --
el cuello de botella real esta en la escritura, y por eso el guion
sigue siendo trabajo de Claude Code, no de un script.
