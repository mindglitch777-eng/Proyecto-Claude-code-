# Identidad de marca

Completado (ver `MARCA.md` para el detalle completo de posicionamiento,
paleta y estructura de contenido). Las fases 3, 4 y 6 leen este archivo
antes de producir cualquier contenido de cara al publico, para que
TikTok, la tienda y el producto se sientan como la misma marca.

- **Nombre**: El Corte
- **Tono de voz**: directo, seco, sin gurú (2da persona, frases de
  6-10 palabras, cero emojis en video)
- **Público objetivo**: 20-40 años, se comen la cabeza a la noche o
  en momentos puntuales del día, buscan una acción concreta ya --
  no una charla motivacional ni un diagnóstico
- **Paleta de color**: fondo #0F0F10 (negro cálido), texto #F2EFE9
  (hueso), acento #4ADE80 (verde señal), apagado #6B6B70
- **Tipografía**: Space Grotesk (sans-serif geométrica) para todo lo
  de marca/video. Nunca serif -- eso es "el uniforme del nicho"
  (cita sobre estatua de mármol) y decíamos explícitamente que no
  competimos ahí.
- **Qué NO somos**: no somos gurú, no somos motivación vacía, no
  somos psicología oscura, no vendemos un diagnóstico ("tenés
  ansiedad"). Vendemos una acción concreta y contable.
- **Logo**: `marca/icono.png` (avatar) y `marca/lockup.png` (marca +
  wordmark horizontal, para outro de video / banners). Generados por
  código (`marca/generar_logo.py`), sin derechos de terceros.

## Bio para el perfil (TikTok/IG)

Elegir una según el largo que permita la plataforma. Sin poesía --
qué es y para quién en una línea (regla de `FOCO-VENTA.md`).

1. **Corta (para bio de TikTok, ~80 car.)**
   > Herramienta para cortar el bucle mental. Pago único, sin cuenta.

2. **Con CTA directo**
   > No te inspiramos. Te sacamos del bucle. 2 toques y sabés qué hacer → link

3. **Con especificidad (mejor conversión esperada, misma lógica que
   los hooks: números > adjetivos)**
   > Te comés la cabeza a las 3 AM. Nosotros no. Herramienta, no charla.

## Nota — inconsistencia real detectada

`producto/el-corte-v7.html` (la app) todavía usa **su propia paleta
interna** (dorado #c9a464 sobre negro, tipografía Georgia serif en
headers) -- el mismo lenguaje visual "mármol y dorado" que `MARCA.md`
descarta explícitamente para todo lo público. Hoy no es un problema
grave porque el usuario ve la app DESPUÉS de decidir instalarla (la
demo en video ya la enmarca en verde/negro), pero si el operador
quiere consistencia total marca↔producto en algún momento, el CSS de
la app es el lugar a tocar -- no se tocó en esta sesión porque
cambiar el producto en sí es una decisión de mayor alcance que agregar
assets de marketing.
