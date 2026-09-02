// Tipos del registro de componentes (ver schema.json -- este archivo
// es el equivalente TypeScript del mismo contrato, para que
// directores/visual.ts tenga tipado real en vez de `any`).

export type Categoria =
  | 'texto' | 'cifra' | 'comparacion' | 'timeline' | 'diagrama'
  | 'lista' | 'logos' | 'encuesta' | 'cuenta_regresiva' | 'montaje' | 'otro';

export type Ritmo = 'estatico' | 'dinamico' | 'muy_dinamico';
export type CapacidadTexto = 'ninguna' | 'corta' | 'media' | 'larga';
export type TipoAsset = 'ninguno' | 'foto' | 'video' | 'icono';
export type EstadoComponente = 'validado' | 'sin_validar';

export type RequiereAssets = {
  tipo: TipoAsset;
  obligatorio: boolean;
};

export type ComponenteRegistrado = {
  id: string;
  archivo: string;
  exportacion: string;
  categoria: Categoria;
  funcion: string;
  intensidad: number; // 0-1
  ritmo: Ritmo;
  capacidadTexto: CapacidadTexto;
  requiereAssets: RequiereAssets;
  duracionMinMaxSeg: [number, number];
  compatibleCon: Categoria[];
  soportaAudioSincronizado: boolean;
  props?: Record<string, string>;
  estado: EstadoComponente;
  notas?: string;
};
