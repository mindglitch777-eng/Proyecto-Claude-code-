# Prueba de motores de voz

Guion de prueba (69 palabras), el mismo para los tres:

> Si cobrás por hora, tenés un problema y todavía no lo viste. La inteligencia artificial no te bajó el precio. Te bajó las horas. Lo que antes te llevaba una tarde, ahora sale en veinte minutos. Cobrás por hora: acabás de cobrar cuatro veces menos por el mismo trabajo. Al cliente no le importa cuánto tardaste. Le importa que esté resuelto. Dejá de vender tiempo. Vendé el problema resuelto.

Todo corrido en una maquina de GitHub, sin placa de video.

| Motor | Anduvo | Tardo | Dura el audio | Por segundo de audio | RAM | Peso del modelo |
|---|---|---|---|---|---|---|
| NeuTTS Nano | **NO** | — | — | — | — | — |
| NeuTTS Air | **NO** | — | — | — | — | — |
| Qwen3-TTS 0.6B | **NO** | — | — | — | — | — |

## Los que no anduvieron

**NeuTTS Nano**

```
RuntimeError: no se pudo instalar neuttsair: ERROR: Could not find a version that satisfies the requirement neuttsair (from versions: none)
ERROR: No matching distribution found for neuttsair

```

**NeuTTS Air**

```
RuntimeError: no se pudo instalar neuttsair: ERROR: Could not find a version that satisfies the requirement neuttsair (from versions: none)
ERROR: No matching distribution found for neuttsair

```

**Qwen3-TTS 0.6B**

```
OSError: Qwen/Qwen3-TTS-0.6B is not a local folder and is not a valid model identifier listed on 'https://huggingface.co/models'
If this is a private repository, make sure to pass a token having permission to this repo either by logging in with `hf auth login` or by passing `token=<your_token>`
```


## Como se lee esto

- **Tardo**: lo que demoro en fabricar el audio.
- **Por segundo de audio**: si dice 2x, tarda 2 segundos en hacer 1 segundo de voz. Menos es mejor. Abajo de 1 es mas rapido que escucharlo.
- **Peso del modelo**: lo que hay que bajar la primera vez.

## Falta escucharlos

La calidad no la puede medir un numero. Los audios quedan en `capturas_voz/benchmark/`, ya pasados por la misma cadena de sonido que usa la fabrica, para poder compararlos parejos.

**No se integro ninguno todavia.**