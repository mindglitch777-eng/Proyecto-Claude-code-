# Efectos Cinematográficos Avanzados para Remotion

5 efectos de nivel cinematográfico construidos con Remotion, TypeScript y Framer Motion. Cada efecto está optimizado para video vertical (9:16) y puede llamarse desde cualquier composición con props simples.

## Efectos Disponibles

### 1. **Arquitectura de Neón**
**Archivo:** `ArquitecturaNeon.tsx`

Construye una palabra clave con efecto de neón puro. El esqueleto wireframe aparece primero, luego las placas de neón se ensamblan con chispas de soldadura.

**Props:**
- `text: string` — Palabra a construir (ej: "ACTIVOS")
- `mainColor: string` — Color del neón (ej: "#FF0055")
- `sparkColor: string` — Color de las chispas (ej: "#FFD700")
- `duration?: number` — Duración en segundos (default: 2.0)

**Uso:**
```tsx
<ArquitecturaNeon
  text="ACTIVOS"
  mainColor="#FF0055"
  sparkColor="#FFD700"
  duration={2.0}
/>
```

---

### 2. **Cápsula Holográfica 3D**
**Archivo:** `CapsulaHolografica.tsx`

Holograma 3D futurista con plataforma circular, silueta rotante, barra que crece, sello de verificación y onda de choque. Incluye efecto Dolly Zoom (Hitchcock).

**Props:**
- `caseName: string` — Nombre del caso (ej: "Juan Pérez")
- `finalAmount: string` — Cantidad final (ej: "$10,000")
- `hologramColor: string` — Color del holograma (ej: "#00BFFF")
- `duration?: number` — Duración en segundos (default: 2.0)

**Uso:**
```tsx
<CapsulaHolografica
  caseName="Juan Pérez"
  finalAmount="$10,000"
  hologramColor="#00BFFF"
  duration={2.0}
/>
```

---

### 3. **Cataclismo de Datos**
**Archivo:** `CataclimoData.tsx`

Implosión gravitacional de un número seguida de explosión de partículas doradas que se recomponen en un número nuevo. Efecto de punto negro absorbedor en el centro.

**Props:**
- `oldNumber: string` — Número inicial (ej: "98%")
- `newNumber: string` — Número final (ej: "2%")
- `explosionColor: string` — Color de las partículas (ej: "#FFD700")
- `duration?: number` — Duración en segundos (default: 1.5)

**Uso:**
```tsx
<CataclismoDatos
  oldNumber="98%"
  newNumber="2%"
  explosionColor="#FFD700"
  duration={1.5}
/>
```

---

### 4. **Devorador de Realidad**
**Archivo:** `DevoradorRealidad.tsx`

Vórtice líquido metálico que absorbe un objeto mientras el otro se solidifica con brillo pulsante. Las partículas orbitan alrededor del ganador.

**Props:**
- `loserObject: string` — Objeto que será absorbido (ej: "Tiempo")
- `winnerObject: string` — Objeto que gana (ej: "Activos")
- `neonColor: string` — Color del vórtice/brillo (ej: "#00FFFF")
- `duration?: number` — Duración en segundos (default: 1.8)

**Uso:**
```tsx
<DevoradorRealidad
  loserObject="Tiempo"
  winnerObject="Activos"
  neonColor="#00FFFF"
  duration={1.8}
/>
```

---

### 5. **Mercurio Revelador**
**Archivo:** `MercurioRevelador.tsx`

Líquido metálico reflectante barre sobre una imagen en B&N revelando color. Al final, el líquido explota en millones de gotas plateadas que se congelan.

**Props:**
- `logoImage: string` — Ruta o URL de la imagen (ej: "logo.png")
- `highlightColor: string` — Color del mercurio/revelación (ej: "#FFD700")
- `duration?: number` — Duración en segundos (default: 2.2)

**Uso:**
```tsx
<MercurioRevelador
  logoImage="logo.png"
  highlightColor="#FFD700"
  duration={2.2}
/>
```

---

## Cómo Usar en Remotion Studio

1. **Ver en vivo:**
   ```bash
   npm run studio
   ```
   Luego selecciona la composición `efecto-*` del dropdown.

2. **Renderizar desde CLI:**
   ```bash
   remotion render efecto-arquitectura-neon output.mp4
   ```

3. **Modificar props en runtime:**
   ```bash
   remotion render efecto-cataclismo-datos --props '{"oldNumber":"50%","newNumber":"10%","explosionColor":"#FF6B35"}' output.mp4
   ```

---

## Características Técnicas

- ✅ Totalmente responsivos (formato vertical 9:16 por defecto)
- ✅ Sin dependencias externas pesadas (solo Remotion + Framer Motion)
- ✅ Duración controlable (1.2s - 2.2s máximo)
- ✅ Props tipados en TypeScript
- ✅ Animaciones suaves con easing orgánico
- ✅ Luminosidad y sombras cinematográficas
- ✅ Aptos para ser llamados desde cualquier composición padre

---

## Integración en la Fábrica

Para usar estos efectos en guiones de la fábrica, agrégalos al `DirectorVisual` como componentes más disponibles:

```typescript
// En fabrica/directores/visual/catálogo.ts
export const COMPONENTES_CINEMATOGRAFICOS = [
  {
    id: 'arquitectura-neon',
    categoria: 'efecto-avanzado',
    mapear: (metadata) => ({
      text: metadata.texto,
      mainColor: '#FF0055',
      sparkColor: '#FFD700',
    }),
  },
  // ... más efectos
];
```

---

## Notas sobre Rendimiento

- Cada efecto se renderiza a 30fps (estándar de Remotion)
- Las partículas están optimizadas (máx. 30 partículas por efecto)
- Los shaders (SVG filters) se aplican solo cuando es necesario
- Para produción, reduce el número de partículas en dispositivos lentos

---

Creado: 2026-09-04  
Versión: R8 - Efectos Cinematográficos Avanzados
