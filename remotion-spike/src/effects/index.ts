export { default as ArquitecturaNeon } from './ArquitecturaNeon';
export { default as CapsulaHolografica } from './CapsulaHolografica';
export { default as CataclismoDatos } from './CataclimoData';
export { default as DevoradorRealidad } from './DevoradorRealidad';
export { default as MercurioRevelador } from './MercurioRevelador';

// Props interfaces
export interface ArquitecturaNeonProps {
  text: string;
  mainColor: string;
  sparkColor: string;
  duration?: number;
}

export interface CapsulaHolograficaProps {
  caseName: string;
  finalAmount: string;
  hologramColor: string;
  duration?: number;
}

export interface CataclismoDatosProps {
  oldNumber: string;
  newNumber: string;
  explosionColor: string;
  duration?: number;
}

export interface DevoradorRealidadProps {
  loserObject: string;
  winnerObject: string;
  neonColor: string;
  duration?: number;
}

export interface MercurioReveladorProps {
  logoImage: string;
  highlightColor: string;
  duration?: number;
}
