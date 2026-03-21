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
    [
      `The array has ${n} elements. We work on a copy called arr.`,
      '',
      `Bubble sort repeats passes over the array. In each pass we walk from the left, comparing neighbors. If the left value is greater than the right value, we swap them. After enough passes, the largest values “bubble” toward the end.`,
      '',
      `When the outer loop finishes, every pair of neighbors is in order, so the whole array is sorted from smallest to largest (ties keep their relative order because we only swap on a strict greater-than).`,
    ].join('\n'),
    { start: 1, end: 5 },
  );

  for (let i = 0; i < n - 1; i++) {
    yield createStep(
      'outer',
      { inputSequence, array: [...arr] },
      [
        `This is outer pass number ${i} (counting from 0). We only compare neighbors in the range from index 0 up to index ${n - 2 - i}. The cells from index ${n - i} through ${n - 1} at the right are already in their final positions, so we leave them alone.`,
        '',
        `By the end of this pass, the largest value that still belonged in the unsorted part will have moved into position ${n - 1 - i}.`,
      ].join('\n'),
      { start: 5, end: 5 },
      { variables: { i, n: n - 1 - i } },
    );

    for (let j = 0; j < n - 1 - i; j++) {
      yield createStep(
        'compare',
        { inputSequence, array: [...arr], highlightIndices: [j, j + 1] },
        [
          `Look at the two neighbors at positions ${j} and ${j + 1}. Right now they hold ${arr[j]} and ${arr[j + 1]}.`,
          '',
          `If the left one is strictly greater than the right one, the code will swap them in the next step. If not, no swap happens.`,
        ].join('\n'),
        { start: 8, end: 8 },
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
          [
            `We swap the two cells. After the swap, position ${j} holds ${arr[j]} and position ${j + 1} holds ${arr[j + 1]} (before the swap they were ${before0} and ${before1}).`,
            '',
            `When two values are equal, this algorithm never swaps them, so equal elements keep their original left-to-right order.`,
          ].join('\n'),
          { start: 9, end: 9 },
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
    [
      `The sort is finished. Reading the array from left to right, each value is less than or equal to the next.`,
      '',
      '✓',
    ].join('\n'),
    { start: 13, end: 13 },
  );
}
