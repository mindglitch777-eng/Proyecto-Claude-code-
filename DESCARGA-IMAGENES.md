# Descarga de imágenes — lista lista para usar

**Por qué esto lo hacés vos y no yo**: mi entorno tiene la red
restringida a una lista de dominios (GitHub, npm, PyPI). Wikimedia
devuelve `host_not_allowed`. No es una decisión mía ni una limitación
del pipeline — es la configuración de red del sandbox. Desde tu
celular tardás dos minutos.

---

## MARCO AURELIO

**Opción recomendada — dominio público, sin atribución obligatoria:**
- `File:Marcus Aurelius Metropolitan Museum.png`
- Busto de mármol, período antonino, 161-180 d.C., Metropolitan
  Museum of Art, Nueva York
- Licencia: **PD-self (dominio público)**
- URL: https://commons.wikimedia.org/wiki/File:Marcus_Aurelius_Metropolitan_Museum.png

**Alternativa PD — de la colección del Louvre:**
- `File:Roman Marble Bust of Emperor Marcus Aurelius (AD 161-180)`
- Licencia: **CC-Zero (CC0)**
- URL: https://commons.wikimedia.org/wiki/File:Roman_Marble_Bust_of_Emperor_Marcus_Aurelius_(AD_161-180),_c._161_AD_(28204008722).jpg

**Alternativa alta resolución (1.200 × 1.600) — British Museum:**
- `File:Marcus Aurelius (bust).jpg`
- URL: https://commons.wikimedia.org/wiki/File:Marcus_Aurelius_(bust).jpg

⚠️ **Evitar para uso comercial cómodo**: las versiones con licencia
**CC BY-SA 4.0** (busto dorado de Aventicum, "Bust of Marcus Aurelius
(2)"). Share-Alike obliga a distribuir tu obra derivada bajo la misma
licencia — un dolor de cabeza para un producto pago. Usá las PD/CC0.

---

## CÓMO BAJARLAS (desde el celular)
1. Abrí la URL en el navegador.
2. Tocá la imagen para ver el archivo original.
3. Mantené presionado → "Descargar imagen".
4. Subila al repo en `assets/imagenes/`.

## LO QUE FALTA CONSEGUIR (mismo método)
Buscá en `commons.wikimedia.org` y **filtrá por licencia PD o CC0**:
- `Seneca bust`
- `Epictetus`
- `Zeno of Citium`
- `Socrates bust`
- `Aristotle bust`
- `marble texture` (para fondos)

## REGISTRO OBLIGATORIO
Por cada imagen, anotá en `assets/LICENCIAS.txt`:
```
marco-aurelio.png | commons.wikimedia.org/.../Marcus_Aurelius_Metropolitan_Museum.png | PD-self | 2026-08-18
```
Sin ese registro no hay defensa ante un reclamo. Toma 10 segundos por
archivo y vale la pena.

## USO EN EL PIPELINE
Una vez en `assets/imagenes/`, se usan así:
```json
{
  "formato": "retrato",
  "nombre": "Marco Aurelio",
  "fechas": "121 - 180 d.C.",
  "imagen": "assets/imagenes/marco-aurelio.png",
  "texto": "No es lo que te pasa, es como respondes"
}
```
El pipeline aplica solo: encuadre, duotono a la paleta, viñeta, marco
en arco dorado y Ken Burns lento.
