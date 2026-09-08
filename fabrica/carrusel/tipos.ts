/**
 * Carousel Engine (Ronda 7, directiva FASE NUEVA 8): "sistema
 * equivalente al motor audiovisual pero para carruseles... debe
 * reutilizar el Knowledge Engine y los mismos principios de
 * retención."
 *
 * Un carrusel es un formato de IMÁGENES ESTÁTICAS (no timeline) --
 * arquitectura deliberadamente distinta a la del video (fabrica/composicion/),
 * pero compartiendo las mismas dos fuentes de verdad: el Knowledge
 * Engine (fabrica/conocimiento/) para respaldo real, y el
 * Viral/Retention Engine (fabrica/hooks/) para qué patrón narrativo
 * usa cada slide.
 */
export type TipoSlide = 'portada' | 'hook' | 'desarrollo' | 'ejemplo' | 'cta';

export type Slide = {
  id: string;
  tipo: TipoSlide;
  texto: string;
  subtexto?: string;
  /** id opcional de fabrica/hooks/catalogo.ts si este slide en
   * particular ejecuta un patrón de retención concreto (ej. el slide
   * de portada usando 'cifra-inmediata'). */
  patronRetencionId?: string;
  /** Espejo directo de los props visuales de CarruselSlide.tsx
   * (remotion-spike/src/carrusel/CarruselSlide.tsx) -- se pasan tal
   * cual al renderizar. Viven aca (no en un mapa aparte) para que un
   * lote grande (ej. 42 carruseles) se escriba slide por slide sin
   * indireccion extra. Ver CarruselSlide.tsx para el significado real
   * de cada uno (fix real de contraste + resaltado aplicado ahi). */
  imagen?: string;
  estiloImagen?: 'circular' | 'fondo';
  credito?: string;
  resaltar?: string[];
  logo?: string;
};

export type IdentidadMarca = {
  /** referencia a PALETA de remotion-spike/src/identidad.ts -- el
   * carrusel reutiliza la MISMA identidad visual que el video, no
   * inventa una paleta nueva por formato. */
  paletaRef: string;
  fuenteRef: string;
};

export type Carrusel = {
  id: string;
  tema: string;
  slides: Slide[];
  identidadMarca: IdentidadMarca;
  /** ids reales de fabrica/conocimiento/base.ts que respaldan el
   * contenido de este carrusel -- la misma fuente de verdad que
   * fabrica/ecosistema_producto/ trackea como "ya derivada a formato carrusel". */
  fuenteConocimientoIds: string[];
};
