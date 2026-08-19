# Imágenes: cómo conseguirlas sin pagar y sin riesgo legal

## La conclusión primero
Para este proyecto conviene **generar** las imágenes con IA gratuita en
vez de descargarlas de bancos de fotos. Razones concretas:
- Son únicas: nadie más tiene esa imagen (los bancos gratis los usa todo
  el mundo, y se nota).
- Se ajustan exactamente al guión, no al revés.
- El riesgo de derechos es menor si elegís bien la herramienta.

---

## OPCIÓN A — Generar desde el celular (manual, cero setup)

| Herramienta | Límite gratis | Derechos comerciales | Fuerte en |
|---|---|---|---|
| **Nano Banana 2** (en Google Gemini) | Límite diario, no créditos | Permitido con restricciones de plataforma | Mejor calidad general en 2026 y el mejor renderizado de texto |
| **GPT Image** (en ChatGPT) | Límite diario | **Derechos comerciales explícitos** | El más claro legalmente |
| **Ideogram** | 10 créditos/semana | Sí | Texto dentro de la imagen |
| **Bing Image Creator / Microsoft Designer** | Sin límite duro | Comercialmente seguro (entrenado con contenido licenciado) | Volumen |
| **Playground AI** | 100 imágenes/día | Sí | El tier gratis más generoso |

**Recomendación práctica**: Nano Banana 2 para calidad, GPT Image cuando
necesites la máxima seguridad legal (es el único que concede derechos
comerciales de forma explícita).

---

## OPCIÓN B — Automatizado dentro del pipeline (lo que nos interesa)

**Cloudflare Workers AI** es la mejor API gratuita de generación de
imágenes: da una cuota diaria recurrente y acceso serverless a modelos
hospedados. Sirve el modelo **FLUX.1 [schnell]**, que genera en 1-4 pasos
y usa **licencia Apache 2.0** — la más permisiva que existe, sin
ambigüedad sobre uso comercial.

Esto es lo importante: **se puede llamar desde GitHub Actions**, o sea
que el pipeline podría generar sus propias imágenes automáticamente,
sin GPU y sin costo, dentro de la cuota diaria.

Pasos (cuando llegue el momento de implementarlo):
1. Cuenta gratis en Cloudflare.
2. Sacar el token de API de Workers AI.
3. Guardarlo como secret del repo (igual que el de Claude).
4. Un script pide la imagen, la guarda en `assets/`, y el animador la usa.

---

## OPCIÓN C — Local (descartada por ahora)
FLUX.2, Stable Diffusion 3.5, SANA: calidad excelente y gratis, pero
requieren **GPU con 8-12GB de VRAM** para ser prácticos. No aplica
mientras el proyecto opere desde el celular. Reevaluable si aparece una
computadora con GPU.

---

## REGLAS DE LICENCIA (leer antes de publicar)
- **Verificar siempre los términos vigentes** antes de usar una imagen
  en algo comercial. Las políticas cambian.
- OpenAI concede derechos comerciales de forma explícita; Google, Canva
  y la mayoría permiten uso comercial pero con restricciones propias de
  cada plataforma; los modelos open source (FLUX Apache 2.0, SD) son los
  más libres.
- **Midjourney en tier gratis NO permite uso comercial** (y ya no tiene
  prueba gratis).
- Registrar en `assets/LICENCIAS.txt` de dónde salió cada imagen y bajo
  qué condición. Si algún día llega un reclamo, esa lista es la defensa.

## LÍMITE QUE NO CAMBIA
Nunca generar imágenes que imiten a una persona real identificable, un
logo, una marca registrada o un personaje con derechos (Disney, Marvel,
etc.). Que la herramienta lo permita técnicamente no lo hace legal.
