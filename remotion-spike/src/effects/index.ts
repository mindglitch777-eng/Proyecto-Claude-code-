export { default as ArquitecturaNeon } from './ArquitecturaNeon';
export { default as CapsulaHolografica } from './CapsulaHolografica';
export { default as CataclismoDatos } from './CataclimoData';
export { default as DevoradorRealidad } from './DevoradorRealidad';
export { default as MercurioRevelador } from './MercurioRevelador';

// Phase 2 - Efectos adicionales
export { default as GlitchShatter } from './GlitchShatter';
export { default as SlotMachine } from './SlotMachine';
export { default as HeartbeatPulse } from './HeartbeatPulse';
export { default as MindMapConnect } from './MindMapConnect';
export { default as TextRevealFire } from './TextRevealFire';
export { default as CircleOfTruth } from './CircleOfTruth';
export { default as PixelBurst } from './PixelBurst';
export { default as GoldRush } from './GoldRush';
export { default as LiquidMetal } from './LiquidMetal';
export { default as SpotlightReveal } from './SpotlightReveal';
export { default as ChromaticShift } from './ChromaticShift';
export { default as WaveDistortion } from './WaveDistortion';
export { default as StarbustFlare } from './StarbustFlare';
export { default as VortexTransport } from './VortexTransport';
export { default as AuroraShine } from './AuroraShine';
export { default as NeonRipple } from './NeonRipple';
export { default as BarBrawl } from './BarBrawl';
export { default as FlipCards } from './FlipCards';

// Alias: nombres usados en guiones de producción para los componentes de
// Fase 1 (misma implementación, sin duplicar código).
export { default as NeonArchitecture } from './ArquitecturaNeon';
export { default as MercuryReveal } from './MercurioRevelador';
export { default as HologramCase } from './CapsulaHolografica';

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

export interface GlitchShatterProps {
  text: string;
  glitchColor?: string;
  fragmentCount?: number;
  duration?: number;
}

export interface SlotMachineProps {
  finalNumber: string;
  metalColor?: string;
  duration?: number;
}

export interface HeartbeatPulseProps {
  text: string;
  pulseColor?: string;
  beats?: number;
  duration?: number;
}

export interface MindMapConnectProps {
  items: string[];
  lineColor?: string;
  nodeGlow?: string;
  duration?: number;
}

export interface TextRevealFireProps {
  text: string;
  fireColor?: string;
  textColor?: string;
  duration?: number;
}

export interface CircleOfTruthProps {
  content: string;
  circleColor?: string;
  duration?: number;
}

export interface PixelBurstProps {
  pixelSize?: number;
  burstColor?: string;
  duration?: number;
}

export interface GoldRushProps {
  achievementText: string;
  goldColor?: string;
  coinCount?: number;
  duration?: number;
}

export interface LiquidMetalProps {
  text: string;
  metalColor?: string;
  glowColor?: string;
  duration?: number;
}

export interface SpotlightRevealProps {
  text?: string;
  logoImage?: string;
  accountName?: string;
  spotColor?: string;
  textColor?: string;
  duration?: number;
}

export interface BarBrawlProps {
  labelA: string;
  labelB: string;
  winner: 'A' | 'B';
  colorA?: string;
  colorB?: string;
  duration?: number;
}

export interface FlipCardsProps {
  items: string[];
  cardColor?: string;
  textColor?: string;
  duration?: number;
}

export interface ChromaticShiftProps {
  text: string;
  duration?: number;
}

export interface WaveDistortionProps {
  text: string;
  waveColor?: string;
  duration?: number;
}

export interface StarbustFlareProps {
  text: string;
  starColor?: string;
  duration?: number;
}

export interface VortexTransportProps {
  text: string;
  vortexColor?: string;
  duration?: number;
}

export interface AuroraShineProps {
  text: string;
  auroraColor1?: string;
  auroraColor2?: string;
  duration?: number;
}

export interface NeonRippleProps {
  text: string;
  rippleColor?: string;
  coreColor?: string;
  duration?: number;
}
