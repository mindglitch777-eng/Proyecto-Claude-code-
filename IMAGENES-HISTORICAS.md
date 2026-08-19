# Imágenes de figuras históricas — cómo conseguirlas bien

## La buena noticia legal
Las esculturas y bustos de la Antigüedad (Marco Aurelio, Séneca,
Epicteto, Aristóteles, Sócrates) están en **dominio público** por su
antigüedad. Las pinturas anteriores a ~1900 también.

**El matiz que importa**: la escultura es de dominio público, pero
*la fotografía de esa escultura* puede tener derechos propios del
fotógrafo. Por eso hay que sacarlas de fuentes que declaren la
licencia explícitamente.

## Fuentes recomendadas (en orden)

1. **Wikimedia Commons** — la mejor opción. Cada archivo declara su
   licencia. Filtrar por "dominio público" o CC0. Buscar por ejemplo
   "Marcus Aurelius bust" y revisar la licencia del archivo puntual.
2. **Museos con colección abierta** — varios liberan sus fotos:
   - The Met (Open Access, CC0)
   - Rijksmuseum
   - Getty Open Content
   - Art Institute of Chicago
3. **Generadas con IA** (ver `IMAGENES.md`) — para escenas abstractas,
   texturas de mármol, fondos. **No para representar a la figura
   histórica**: puede salir inexacta y se nota.

## Regla que no se rompe
Cada imagen descargada se anota en `assets/LICENCIAS.txt` con:
- URL de origen
- Licencia declarada
- Fecha de descarga

Sin ese registro no hay defensa si algún día llega un reclamo.

## Cómo el pipeline las convierte en algo elegante
El formato `retrato` de `animador_v9.py` aplica automáticamente:

1. **Encuadre inteligente** — recorta al centro conservando
   proporción. Nunca deforma la imagen.
2. **Duotono a la paleta** — mapea la foto a los dos colores de la
   marca. Esto es lo que hace que cualquier imagen, venga de donde
   venga, se vea parte del mismo sistema visual y no "pegada".
3. **Viñeta** — oscurece bordes, enfoca la mirada al centro.
4. **Marco en arco** de medio punto con contorno dorado — lenguaje
   visual clásico, no un rectángulo recortado.
5. **Ken Burns muy lento** — el nicho pide ritmo meditativo.

Uso:
```json
{
  "formato": "retrato",
  "nombre": "Marco Aurelio",
  "fechas": "121 - 180 d.C.",
  "imagen": "assets/marco-aurelio.jpg",
  "texto": "No es lo que te pasa, es como respondes"
}
```

Formato `galeria` para varias figuras a la vez:
```json
{
  "formato": "galeria",
  "texto": "Los tres estoicos",
  "figuras": [
    {"imagen": "assets/seneca.jpg", "nombre": "Seneca", "nota": "el rico"},
    {"imagen": "assets/epicteto.jpg", "nombre": "Epicteto", "nota": "el esclavo"},
    {"imagen": "assets/marco.jpg", "nombre": "Marco", "nota": "el emperador"}
  ]
}
```

## Lista de imágenes a conseguir (primera tanda)
- Marco Aurelio (busto)
- Séneca (busto)
- Epicteto (grabado o representación)
- Zenón de Citio
- Textura de mármol (para fondos)
- Columna / ruina clásica

Con esas seis ya se cubre el 80% del contenido del nicho.
