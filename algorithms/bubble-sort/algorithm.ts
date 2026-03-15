import type { AlgorithmStep } from '@/app/lib/types';
import type { ArrayWithHighlightsData } from '@/components/visualization/BarArrayViz';

export type BubbleSortData = ArrayWithHighlightsData;

export const DEFAULT_INPUT = [4, 12, 7, 15, 2, 9, 5, 11, 3, 14, 8, 1, 13, 6, 10];

function createStep(
  id: string,
  data: BubbleSortData,
  description: string,
  codeRange: { start: number; end: number },
  overrides?: Partial<AlgorithmStep<BubbleSortData>>,
): AlgorithmStep<BubbleSortData> {
  return { id, data, action: id, codeRange, description, ...overrides };
}

export function* bubbleSortGenerator(
  input: number[] = DEFAULT_INPUT,
): Generator<AlgorithmStep<BubbleSortData>, void, unknown> {
  const arr = [...input];
  const n = arr.length;

  yield createStep(
    'init',
    { array: [...arr] },
    `Input: [${arr.join(', ')}] — ${n} elements`,
    { start: 1, end: 2 },
  );

  for (let i = 0; i < n - 1; i++) {
    yield createStep(
      'outer',
      { array: [...arr] },
      `Outer loop: i = ${i} (remaining ${n - 1 - i} passes)`,
      { start: 5, end: 5 },
      { variables: { i, n: n - 1 - i } },
    );

    for (let j = 0; j < n - 1 - i; j++) {
      yield createStep(
        'compare',
        { array: [...arr], highlightIndices: [j, j + 1] },
        `Compare arr[${j}] = ${arr[j]} and arr[${j + 1}] = ${arr[j + 1]}`,
        { start: 6, end: 8 },
        { variables: { i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] } },
      );

      if (arr[j]! > arr[j + 1]!) {
        [arr[j], arr[j + 1]] = [arr[j + 1]!, arr[j]!];
        yield createStep(
          'swap',
          { array: [...arr], highlightIndices: [j, j + 1] },
          `Swapped ${arr[j + 1]} and ${arr[j]} — now arr[${j}]=${arr[j]}, arr[${j + 1}]=${arr[j + 1]}`,
          { start: 9, end: 11 },
          { variables: { i, j } },
        );
      }
    }
  }

  yield createStep(
    'done',
    { array: [...arr] },
    'Sort complete! ✓',
    { start: 14, end: 14 },
  );
}
