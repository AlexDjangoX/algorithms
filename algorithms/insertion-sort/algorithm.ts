import type { AlgorithmStep } from '@/app/lib/types';
import type { ArrayWithHighlightsData } from '@/components/visualization/BarArrayViz';
import { DEFAULT_INPUT } from '@/app/lib/default-input';

export type InsertionSortData = ArrayWithHighlightsData;

function createStep(
  id: string,
  data: InsertionSortData,
  description: string,
  codeRange: { start: number; end: number },
  overrides?: Partial<AlgorithmStep<InsertionSortData>>,
): AlgorithmStep<InsertionSortData> {
  return { id, data, action: id, codeRange, description, ...overrides };
}

export function* insertionSortGenerator(
  input: number[] = DEFAULT_INPUT,
): Generator<AlgorithmStep<InsertionSortData>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  const inputSequence = [...input];

  yield createStep(
    'init',
    { inputSequence, array: [...arr] },
    [
      `n = ${n}; arr is a copy of the input.`,
      '',
      `The loop runs for i = 1, 2, …, n − 1. At the start of each round, everything to the left of position i is already sorted from smallest to largest (when i is 1, that is only the first cell). This round pulls out the value at position i, slides any larger values one step to the right, and puts that value back where it belongs so the sorted region grows to include position i.`,
    ].join('\n'),
    { start: 1, end: 5 },
    { variables: { n } },
  );

  for (let i = 1; i < n; i++) {
    const key = arr[i]!;
    let j = i - 1;
    while (j >= 0 && arr[j]! > key) {
      arr[j + 1] = arr[j]!;
      j--;
    }
    arr[j + 1] = key;

    const from = j + 1;
    const highlights: number[] = [];
    for (let k = from; k <= i; k++) highlights.push(k);

    const insertLines =
      from === i
        ? [
            `On iteration i = ${i}, the value we pulled out (the key) is ${key}. Nothing moved because the cell to the left is already less than or equal to the key, so the key stays at index ${i}. From the start of the array through index ${i}, values are now in order.`,
          ]
        : [
            `On iteration i = ${i}, the key is ${key}. Every value to the left that was still larger than the key was copied one step to the right, which frees the index where the key belongs.`,
            '',
            `We store the key at index ${from}. From the start of the array through index ${i}, values are now in order.`,
          ];

    yield createStep(
      'insert_pass',
      { inputSequence, array: [...arr], highlightIndices: highlights },
      insertLines.join('\n'),
      { start: 9, end: 15 },
      { variables: { i, key, placedAt: from } },
    );
  }

  yield createStep(
    'done',
    { inputSequence, array: [...arr] },
    [
      `The loop has processed every position. The whole array is now sorted from smallest to largest.`,
      '',
      '✓',
    ].join('\n'),
    { start: 17, end: 17 },
  );
}
