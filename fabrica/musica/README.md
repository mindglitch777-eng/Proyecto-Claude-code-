# Música de fondo — infraestructura (sin depender de un servicio pago)

Regla del proyecto: $0 hasta que haya ventas. Esto descarta cualquier
librería de música por suscripción (Epidemic Sound, Artlist, etc.)
como dependencia obligatoria — quedan documentadas más abajo como
opción futura, no como parte del sistema.

## Qué existe hoy

- **`biblioteca.json`** — el catálogo de tracks reales. **Está vacío a
  propósito.** No se inventó ni un solo track falso para "completar"
  esto — sería peor que no tener nada, porque un córdigo que confía en
  esa lista rompería en producción de una forma más difícil de
  detectar que un `FALTANTE` explícito.
- **`resolver_musica.py`** — dado (intensidad deseada, duración
  mínima, mood opcional), elige el mejor track del catálogo por
  puntaje (misma filosofía que `fabrica/assets/resolver.py`: preferible
  FALTANTE explícito a "lo más parecido aunque sea malo"). Con el
  catálogo vacío de hoy, **siempre** devuelve FALTANTE — es el
  comportamiento correcto, no un bug (probado en
  `test_resolver_musica.py`, incluyendo un fixture con tracks de
  mentira que prueba que el scoring en sí funciona).
- **`.github/workflows/investigar-musica-fabrica.yml`** — busca
  candidatos reales de música libre de derechos (Free Music Archive,
  sin necesitar API key; Jamendo, si el operador registra una API key
  gratis) desde un runner de GitHub Actions (Jamendo/FMA están
  bloqueados desde este sandbox, igual que huggingface.co para
  Qwen3-TTS). Escribe `fabrica/musica/CANDIDATOS.md` con los
  resultados y su licencia — el operador escucha y decide cuáles bajar
  y agregar de verdad al catálogo.

## Cómo se agrega un track real

1. Bajar el archivo (mp3, licencia verificada) a
   `fabrica/musica/biblioteca/<id>.mp3`.
2. Agregar una entrada a `biblioteca.json`:
   ```json
   {
     "id": "<id>",
     "archivo": "biblioteca/<id>.mp3",
     "mood": ["motivacional", "energico"],
     "intensidad": 0.7,
     "bpm": 120,
     "duracionSeg": 95.0,
     "licencia": "CC-BY 4.0",
     "atribucion": "Nombre del autor (si la licencia lo exige; null si no)"
   }
   ```
3. Correr `python3 fabrica/musica/test_resolver_musica.py` — no debería
   romper nada (los tests de biblioteca vacía dejan de aplicar
   automáticamente en cuanto agregues el primer track real, hay que
   ajustarlos entonces).

## Por qué no está conectado todavía al Director de Audio

`fabrica/directores/audio.ts` decide **golpes** (duro/suave/ninguno) y
volumen de SFX por unidad — nunca tocó música de fondo porque no había
ninguna disponible. Conectar `resolver_musica` como una consulta más
del Director de Audio (elegir un track para todo el video según la
intensidad promedio, no por unidad) es agregar ~10 líneas una vez que
el catálogo tenga al menos un track real — no tiene sentido cablear
esa decisión hoy contra un catálogo vacío.

## Opciones de pago para más adelante (NO parte del sistema hoy)

Si después de la primera venta se decide invertir en esto: Epidemic
Sound / Artlist (suscripción mensual, catálogo curado, sin problemas
de licencia) son la opción estándar de la industria. Quedan anotadas
acá únicamente para no perder la referencia — no se integra nada de
esto mientras la regla de $0 siga vigente.
