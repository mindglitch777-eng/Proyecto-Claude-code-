# Música de fondo — infraestructura (sin depender de un servicio pago)

Regla del proyecto: $0 hasta que haya ventas. Esto descarta cualquier
librería de música por suscripción (Epidemic Sound, Artlist, etc.)
como dependencia obligatoria — quedan documentadas más abajo como
opción futura, no como parte del sistema.

## Qué existe hoy (R7-22 — catálogo real, ya no vacío)

- **`biblioteca.json`** — 9 tracks reales, con audio de verdad en
  `biblioteca/*.mp3` (~38MB en total). Vienen de
  [`effacestudios/Royalty-Free-Music-Pack`](https://github.com/effacestudios/Royalty-Free-Music-Pack)
  (GitHub), que declara **CC0 1.0 Universal (dominio público)** en su
  propio `LICENSE` — copiado acá como
  `biblioteca/LICENSE-effacestudios-royalty-free-music-pack.txt` para
  trazabilidad. CC0 no exige atribución (`atribucion: null` en las 9
  entradas es correcto, no un faltante).
  - Cómo se llegó a este repo: bloqueado usar Jamendo/Free Music
    Archive directo desde este sandbox (ver más abajo) y la corrida ya
    hecha del workflow de GitHub Actions falló (FMA cambió su API,
    404; Jamendo necesita un `JAMENDO_CLIENT_ID` que el operador
    todavía no configuró) — en vez de reportar "bloqueado", se buscó
    con `WebSearch` (canal de red que sí funciona en este sandbox, ver
    `fabrica/decisions/DECISIONES.md`) un repositorio de GitHub con
    música real ya licenciada CC0, y se verificó `git clone` +
    lectura directa del `LICENSE` del repo (no se confió en la
    descripción de la búsqueda sola).
  - **Honestidad sobre `mood`/`intensidad`**: estos 9 valores son un
    PRIMER PASE, inferido del nombre de archivo + el volumen medio/pico
    real medido con `ffmpeg -af volumedetect` (dato real, no
    inventado) + inspección visual de espectrograma — NO de escuchar
    el track de principio a fin. Mismo patrón honesto que ya se usa
    para voz ("necesito que lo escuches vos para confirmar") — ver
    `PENDIENTES_OPERADOR.md`.
  - **`bpm` medido de verdad en R7-26** (antes en `null`): se instaló
    `librosa` (`pip install librosa`, MIT/BSD, $0) y se midió el tempo
    real de los 9 tracks con detección de beat estándar (onset-strength
    + programación dinámica) -- ver `medir_bpm.py`. Limitación real y
    conocida del método (no un bug): puede confundir el doble/mitad
    del tempo real ("octave error") -- `aceleracion-planificando` dio
    178.2 BPM, plausible pero no verificado de oído. `resolver_musica.py`
    todavía no usa `bpm` para puntuar (ver "Conectado al Director de
    Audio" más abajo, motivado por la skill real `beat-sync-editing`).
- **`resolver_musica.py`** — sin cambios en su lógica (dado intensidad
  deseada + mood opcional + duración mínima, elige el mejor track por
  puntaje). Con el catálogo ahora poblado, deja de devolver siempre
  FALTANTE — los tests de "biblioteca vacía" se separaron de los de
  "biblioteca real" en `test_resolver_musica.py`.
- **`.github/workflows/investigar-musica-fabrica.yml`** — sigue
  disponible para sumar MÁS candidatos (Jamendo, una vez que el
  operador configure `JAMENDO_CLIENT_ID`) — no es la única vía, como
  demuestra este mismo catálogo.

## Cómo se agrega un track nuevo

1. Bajar el archivo (mp3, licencia verificada) a
   `fabrica/musica/biblioteca/<id>.mp3`.
2. Agregar una entrada a `biblioteca.json` (mismo formato que las 9
   entradas actuales).
3. Correr `python3 fabrica/musica/test_resolver_musica.py`.

## Conectado al Director de Audio (R7-22)

`directores/audio.ts` sigue decidiendo únicamente **golpes** y volumen
de SFX por unidad — la música de fondo se resuelve UNA sola vez por
video (no por unidad, sería un cambio de track constante y ruidoso),
a partir de la intensidad promedio de todas las decisiones de audio
del video. Ver `ejemplos/generar_demo_07.ts` para el ejemplo real
end-to-end: llama a `resolver_musica.py` con la intensidad promedio,
guarda el resultado en `ArbolFabrica.musicaFondo` (tipo nuevo en
`composicion/tipos.ts`), y el puente de render
(`remotion-spike/src/FabricaVideo.tsx`) agrega un `<Audio>` en loop a
volumen bajo (0.12) si ese campo no es null.

## Pendiente real (R7-26): sincronizar cortes al BPM de la música

La skill real `beat-sync-editing` (de
[`iart-ai/motion-design-skills`](https://github.com/iart-ai/motion-design-skills),
MIT -- ver `fabrica/skills/registro.ts`) formaliza una técnica real que
la fábrica no usa: cortar en la grilla del compás
(`framesPerBeat = (60/BPM)*fps`), no en tiempos arbitrarios. Ahora que
`bpm` es un dato real (no `null`), el candidato concreto para una
próxima ronda es: que `directores/audio.ts` ajuste el timing de los
golpes de una unidad para caer sobre la grilla de beats del track de
`musicaFondo` elegido -- no implementado todavía, registrado como
pendiente real, no forzado sin un video de prueba que lo justifique.

## Opciones de pago para más adelante (NO parte del sistema hoy)

Si después de la primera venta se decide invertir en esto: Epidemic
Sound / Artlist (suscripción mensual, catálogo curado, sin problemas
de licencia) son la opción estándar de la industria. Quedan anotadas
acá únicamente para no perder la referencia — no se integra nada de
esto mientras la regla de $0 siga vigente.
