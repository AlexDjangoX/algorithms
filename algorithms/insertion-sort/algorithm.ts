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
      `Starting array (${n} elements): [${arr.join(', ')}]`,
      '',
      'We walk the array from left to right. After each round, the numbers from the start through the current position are in order (smallest to largest). In the next round we take the next number to the right and move it left until it sits in the correct spot among the ones we already sorted.',
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
            `Round ${i}: the value ${key} is already in the correct place among the sorted left part (nothing bigger than ${key} sat to its left).`,
            '',
            `So we leave ${key} at index ${i}.`,
          ]
        : [
            `Round ${i}: we insert ${key}, which started at index ${i}.`,
            '',
            `The cells from index 0 through ${i - 1} are already sorted. While the cell on the left still holds a number larger than ${key}, we copy that number one step to the right — like sliding blocks to open a gap.`,
            '',
            `Then we write ${key} into that gap at index ${from} (see “placedAt”). After this, positions 0 through ${i} are in sorted order.`,
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
    'Insertion sort complete — array is in non-decreasing order ✓',
    { start: 17, end: 17 },
  );
}
