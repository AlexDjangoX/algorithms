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
    `Input: [${arr.join(', ')}] — n = ${n}; insertion sort inserts arr[i] into sorted arr[0..i-1]`,
    { start: 1, end: 3 },
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

    yield createStep(
      'insert_pass',
      { inputSequence, array: [...arr], highlightIndices: highlights },
      `key = arr[${i}] = ${key}; after shift: arr[${from}] = key; sorted range arr[0..${i}]`,
      { start: 5, end: 9 },
      { variables: { i, key, placedAt: from } },
    );
  }

  yield createStep(
    'done',
    { inputSequence, array: [...arr] },
    'Insertion sort complete — array is in non-decreasing order ✓',
    { start: 11, end: 11 },
  );
}
