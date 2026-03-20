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
  const inputSequence = [...input];

  yield createStep(
    'init',
    { inputSequence, array: [...arr] },
    `Input: [${arr.join(', ')}] — n = ${n}; bubble sort compares arr[j] and arr[j + 1] each pass`,
    { start: 1, end: 2 },
  );

  for (let i = 0; i < n - 1; i++) {
    yield createStep(
      'outer',
      { inputSequence, array: [...arr] },
      `for (let i = ${i}; i < n - 1; i++) — ${n - 1 - i} more outer iterations`,
      { start: 4, end: 4 },
      { variables: { i, n: n - 1 - i } },
    );

    for (let j = 0; j < n - 1 - i; j++) {
      yield createStep(
        'compare',
        { inputSequence, array: [...arr], highlightIndices: [j, j + 1] },
        `Compare arr[${j}] = ${arr[j]} and arr[${j + 1}] = ${arr[j + 1]}`,
        { start: 6, end: 6 },
        { variables: { i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] } },
      );

      if (arr[j]! > arr[j + 1]!) {
        const before0 = arr[j]!;
        const before1 = arr[j + 1]!;
        [arr[j], arr[j + 1]] = [arr[j + 1]!, arr[j]!];
        yield createStep(
          'swap',
          {
            inputSequence,
            array: [...arr],
            highlightIndices: [j, j + 1],
          },
          `if (arr[${j}] > arr[${j + 1}]) swap — was arr[${j}]=${before0}, arr[${j + 1}]=${before1}; now arr[${j}]=${arr[j]}, arr[${j + 1}]=${arr[j + 1]}`,
          { start: 7, end: 7 },
          {
            variables: {
              i,
              j,
              'swapped[j]': before0,
              'swapped[j+1]': before1,
            },
          },
        );
      }
    }
  }

  yield createStep(
    'done',
    { inputSequence, array: [...arr] },
    'Sort complete! ✓',
    { start: 11, end: 11 },
  );
}
