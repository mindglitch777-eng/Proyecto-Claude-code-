export { default as SubtitulosGrandes } from './SubtitulosGrandes';

// Props interfaces

export interface SubtitulosGrandesProps {
  captions: {text: string; startMs: number; endMs: number; timestampMs: number | null; confidence: number | null}[];
  combinarPalabrasDentroDeMs?: number;
  maxPalabrasPorPantalla?: number;
  color?: string;
  colorActivo?: string;
}
