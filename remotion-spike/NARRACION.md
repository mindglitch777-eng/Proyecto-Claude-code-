# Narración — "Tu hora vale menos que nada"

Para generar en ElevenLabs y sincronizar con `agresivo.mp4` (31.9 s).

---

## TEXTO PARA PEGAR

Pegá esto tal cual. Los saltos de línea y los puntos son los que le dan
el ritmo: no los saques.

```
Laburaste todo el mes. Y no te quedó un peso.

No es que trabajes poco. Trabajás de más.

¿Sabés cuánto te cuesta una hora tuya?

Sumá todo lo que pagás sin trabajar. El alquiler, la luz, el teléfono. Dividilo por las horas que trabajás. Eso vale tu hora.

Cobrás cinco mil por dos horas. Te costaron cinco mil. No ganaste nada.

Vos no vendés cortes. Vendés tu hora. Y la estás regalando.

Sacá la cuenta una sola vez. Va a doler. Y no cobrás igual nunca más.
```

**85 palabras.** A ritmo hablado son ~29 s, y el video dura 31.9 s: entra
con aire de sobra. Es a propósito — la voz nunca tiene que ir apretada
contra el final.

---

## Cómo queda contra la imagen

| t | dura | en pantalla | lo que dice la voz |
|---|---|---|---|
| 0.0 | 2.9 s | LABURASTE TODO EL MES / Y NO TE QUEDÓ UN PESO | Laburaste todo el mes. Y no te quedó un peso. |
| 2.9 | 3.0 s | NO ES QUE TRABAJES POCO / TRABAJÁS DE MÁS | No es que trabajes poco. Trabajás de más. |
| 5.9 | 2.4 s | ¿CUÁNTO TE CUESTA UNA HORA TUYA? | ¿Sabés cuánto te cuesta una hora tuya? |
| 8.3 | 8.2 s | la cuenta: 300.000 + 100.000 = 400.000 ÷ 160 h = **$2.500** | Sumá todo lo que pagás sin trabajar. El alquiler, la luz, el teléfono. Dividilo por las horas que trabajás. Eso vale tu hora. |
| 16.5 | 4.2 s | COBRÁS $5.000 · POR 2 HORAS · TE COSTARON $5.000 → **$0** | Cobrás cinco mil por dos horas. Te costaron cinco mil. No ganaste nada. |
| 20.7 | 4.4 s | NO VENDÉS CORTES / VENDÉS TU HORA / Y LA ESTÁS REGALANDO | Vos no vendés cortes. Vendés tu hora. Y la estás regalando. |
| 25.1 | 4.4 s | SACÁ LA CUENTA UNA SOLA VEZ / VA A DOLER / Y NO VAS A COBRAR IGUAL NUNCA MÁS | Sacá la cuenta una sola vez. Va a doler. Y no cobrás igual nunca más. |
| 29.5 | 2.4 s | cierre de marca | *(silencio)* |

**En el bloque de la cuenta la voz NO lee los números.** La pantalla ya
los muestra. La voz da el método, la imagen da la aritmética: si los dos
dicen lo mismo al mismo tiempo, uno de los dos sobra.

---

## Ajustes en ElevenLabs

- **Voz:** masculina, grave, adulta. Que suene a alguien que ya pasó por
  eso, no a locutor de radio.
- **Idioma:** el texto es rioplatense (*laburaste*, *sacá*, *vendés*).
  Verificá que la voz no lo lea en neutro con seseo, porque se rompe.
- **Stability:** medio-alta. Con stability baja mete demasiada
  interpretación y en frases cortas suena raro.
- **Speed:** normal o apenas más lento. El texto ya está calculado con
  aire; si lo acelerás, pierde el peso.
- **Formato:** mp3 o wav, lo que te sea más fácil. Un solo archivo con
  todo seguido.

---

## Qué hago yo cuando me lo mandes

1. Lo mido y comparo con los tiempos de arriba.
2. Muevo la duración de cada bloque para que la imagen caiga con la voz
   — no al revés: la voz manda, los cortes se acomodan.
3. Agrego el `<Audio>` a la pieza y renderizo.
4. Mido sonoridad (objetivo −14 LUFS, pico bajo 0 dBTP) y te lo mando.

Si podés, mandámelo **sin música ni efectos**: la mezcla la armo yo
después, así puedo mover la voz sin arrastrar el fondo.
