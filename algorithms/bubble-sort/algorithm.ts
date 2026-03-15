import type { AlgorithmStep } from '@/app/lib/types';
import type { ArrayWithHighlightsData } from '@/components/visualization/BarArrayViz';
import { DEFAULT_INPUT } from '@/app/lib/default-input';

export type BubbleSortData = ArrayWithHighlightsData;

export { DEFAULT_INPUT };

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
        const before0 = arr[j]!;
        const before1 = arr[j + 1]!;
        [arr[j], arr[j + 1]] = [arr[j + 1]!, arr[j]!];
        yield createStep(
          'swap',
          { array: [...arr], highlightIndices: [j, j + 1] },
          `Swapped ${before0} ↔ ${before1} — arr[${j}]=${arr[j]}, arr[${j + 1}]=${arr[j + 1]}`,
          { start: 9, end: 11 },
          { variables: { i, j, 'swapped[j]': before0, 'swapped[j+1]': before1 } },
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
