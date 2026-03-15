/**
 * Core types for the algorithm visualization platform.
 * Every algorithm step yields data in this shape to drive both
 * the visualization and the code viewer in sync.
 */

export interface CodeRange {
  start: number;
  end: number;
}

export interface AlgorithmStep<TData = unknown> {
  id: string;
  data: TData;
  action: string;
  codeRange: CodeRange;
  description: string;
  variables?: Record<string, string | number | boolean>;
  highlights?: number[];
  duration?: number;
}

export interface AlgorithmMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: { time: string; space: string };
  code: string;
  codeMap: Record<string, CodeRange>;
}

export type AlgorithmGenerator<TData> = Generator<
  AlgorithmStep<TData>,
  void,
  unknown
>;
