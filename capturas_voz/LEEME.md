# Audios de voz (ElevenLabs)

Acá van los .mp3 exportados de ElevenLabs, con el nombre exacto que
espera `sincronizar_voz.py`:

```
<nombre-del-guion>-vozN.mp3
```

Donde `N` es el índice del segmento dentro de `guiones/<nombre>.json`
(0-based, contando TODOS los segmentos incluidos los de captura —
esos se saltean solos). Para la estructura estándar de 6 segmentos
(situación, error, mecanismo, captura, captura, cierre), eso es
`voz0`, `voz1`, `voz2`, `voz5`.

Ejemplo para `guiones/01-no-dormir.json`:
```
capturas_voz/01-no-dormir-voz0.mp3   (situación)
capturas_voz/01-no-dormir-voz1.mp3   (error)
capturas_voz/01-no-dormir-voz2.mp3   (mecanismo)
capturas_voz/01-no-dormir-voz5.mp3   (cierre)
```

El texto exacto de cada línea está en el campo `elevenlabs.lineas` de
cada guion (mismo orden).

No hace falta correr nada a mano: `producir_lote.py` (vía el GitHub
Action `producir-videos.yml`) detecta solo qué guiones tienen sus
audios completos acá y los renderiza.
