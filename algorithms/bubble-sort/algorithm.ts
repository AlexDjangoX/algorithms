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
      `n = ${n}; arr is a copy of the input.`,
      '',
      `Inner j = 0 … n−2−i: swap adjacent pairs if arr[j] > arr[j+1]. After pass i, arr[n−1−i] is a maximum of the unsorted prefix.`,
      '',
      `After n−1 passes, the array is non-decreasing.`,
    ].join('\n'),
    { start: 1, end: 5 },
  );

  for (let i = 0; i < n - 1; i++) {
    yield createStep(
      'outer',
      { inputSequence, array: [...arr] },
      [
        `Pass i = ${i}: bubble in [0..${n - 2 - i}] vs next neighbor; suffix [${n - i}..${n - 1}] already settled.`,
        '',
        `After this pass, arr[n−1−i] is a max of the prefix.`,
      ].join('\n'),
      { start: 5, end: 5 },
      { variables: { i, n: n - 1 - i } },
    );

    for (let j = 0; j < n - 1 - i; j++) {
      yield createStep(
        'compare',
        { inputSequence, array: [...arr], highlightIndices: [j, j + 1] },
        [
          `Compare arr[${j}] and arr[${j + 1}] (swap if arr[${j}] > arr[${j + 1}]).`,
          '',
          `Values: ${arr[j]}, ${arr[j + 1]}.`,
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
            `Swap: now ${arr[j]}, ${arr[j + 1]} (were ${before0}, ${before1}).`,
            '',
            `Equal keys never swap (strict >) — stable.`,
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
      `Done: arr[0] ≤ … ≤ arr[n−1].`,
      '',
      '✓',
    ].join('\n'),
    { start: 13, end: 13 },
  );
}
