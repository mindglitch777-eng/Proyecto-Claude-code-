# Ficha de venta — El Corte (Hotmart)

## Exclusividad: decidido — Área de Membros de Hotmart

Para que un comprador no pueda pasar el link y que cualquiera use el
producto gratis, la entrega NO va a ser "un link suelto a una URL
pública". Va a ser vía **Área de Membros de Hotmart**: cada
comprador tiene login propio (usuario/contraseña) que gestiona
Hotmart, y adentro accede a `el-corte-v7.html`. Esto lo configurás
vos en el panel de Hotmart al crear el producto — Claude Code no
tiene cuenta ahí y no puede hacerlo.

**Qué falta para que esto funcione (pendiente, en orden):**

1. `el-corte-v7.html` todavía tiene que estar en ALGUNA URL para que
   el Área de Membros la enlace/embeba (Hotmart no aloja el archivo
   HTML en sí, aloja la clase/lección que apunta a él). La opción
   gratuita más simple sigue siendo **GitHub Pages** — pero como es
   publicar algo en internet, necesito tu ok explícito antes de
   activarlo (regla de oro de `CLAUDE.md`). La diferencia ahora es
   que esa URL no se va a repartir directamente: solo va a estar
   enlazada DENTRO del Área de Membros, detrás del login de Hotmart.
2. Al crear la cuenta de Hotmart, elegir tipo de producto **"Área de
   Membros"** (no "producto con entrega por link" simple) al cargar
   El Corte.
3. Adentro del Área de Membros, crear un módulo/clase único con un
   botón o iframe que apunte a la URL de GitHub Pages del punto 1.

---

## 1. Qué necesitás juntar para crear la cuenta de Hotmart

- **Tipo de cuenta**: Productor (no Afiliado).
- **Datos personales**: nombre completo, DNI/CUIT, fecha de
  nacimiento, país (Argentina).
- **Datos de contacto**: email, teléfono.
- **Datos de cobro**: cuenta bancaria a tu nombre (Hotmart paga por
  transferencia; los medios exactos dependen de tu país — confirmalo
  en el alta, cambia seguido).
- **Verificación de identidad**: foto del documento + selfie (te la
  van a pedir en el proceso de alta).

## 2. Datos del producto para cargar en Hotmart

| Campo | Valor sugerido |
|---|---|
| Nombre | El Corte |
| Tipo de producto | **Área de Membros** (no "producto con entrega por link" simple) |
| Categoría | Desarrollo Personal *(alternativa: Salud y Bienestar)* |
| Precio | USD $15 (ajustable — Hotmart muestra el equivalente en moneda local) |
| Garantía | 7 días (estándar del nicho, baja fricción de compra) |
| Entrega | Login propio por comprador → Área de Membros → acceso a la app (ver sección de exclusividad arriba) |
| Idioma | Español |

## 3. Descripción corta (para el listado, ~200 caracteres)

> Herramienta para cortar el bucle mental a las 3 AM. Dos toques,
> sabés qué hacer. Pago único, sin cuenta, sin suscripción.

## 4. Descripción larga (página de venta)

```
¿TE COMÉS LA CABEZA Y NO PARÁS?

El Corte no es otro PDF de "consejos para la ansiedad" que abrís
una vez y nunca más. Es una herramienta que usás en el momento real
en que la cabeza no te suelta.

QUÉ HACE:

→ Te preguntás "¿qué me está dando vueltas?" y en dos toques tenés
  la práctica exacta para tu situación — no un consejo genérico.
→ No podés dormir por algo que pasó → la secuencia de las 3 AM.
→ Tenés que decidir y no podés → se convierte en una acción con
  fecha, no en más vueltas.
→ Alguien no te respondió y ya inventaste diez finales → método
  para cortarlo en el momento.
→ Respiración guiada real (no un video de 10 minutos que no vas a
  mirar), cierre del día estilo Séneca, registro de tus propios
  patrones.

LO QUE NO ES:

No es terapia. No reemplaza a un profesional. No promete curarte.
Te da una acción concreta para el momento en que la cabeza no para
— eso es todo, y es más de lo que hace cualquier consejo genérico.

CÓMO FUNCIONA:

Pago único. Sin cuenta, sin suscripción, sin datos en la nube — todo
queda en tu teléfono. Accedés por un link, funciona en cualquier
navegador, no hay que instalar nada.

Si en 7 días sentís que no te sirve, te devolvemos el dinero. Sin
preguntas.
```

## 5. Bullets cortos (para redes sociales / banner de la ficha)

- Pago único. Nada de $30-90/año como las apps de meditación genéricas.
- Sin cuenta. Sin datos en la nube. Todo en tu teléfono.
- No es inspiración. Es una acción concreta para el momento exacto
  en que la cabeza no para.

## 6. Público objetivo (para configurar campañas/afiliados después)

20-40 años, hispanohablante (foco LatAm/Argentina), se come la
cabeza a la noche o en momentos puntuales del día, ya probó apps de
meditación genéricas y no le alcanzaron, busca algo concreto y
rápido — no un curso, no una comunidad, no una suscripción.

## 7. Imagen de portada

Falta — Hotmart pide una imagen de portada (formato apaisado, típico
1280×720). Puedo generarla por código en la paleta de marca (`marca/`)
cuando quieras, o decime si preferís usar una captura real de la app.
