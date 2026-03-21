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
      `For i = 1 … n−1: before each iteration, arr[0..i−1] is sorted (trivial for i = 1). Insert arr[i] into that prefix so arr[0..i] stays sorted.`,
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
            `i = ${i}, key = ${key}: no shifts (arr[i−1] ≤ key). Key stays at i; arr[0..i] sorted.`,
          ]
        : [
            `i = ${i}, key = ${key}: shift larger elements right until arr[j] ≤ key or j < 0.`,
            '',
            `Place key at j+1 = ${from}; arr[0..i] is now sorted.`,
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
      `After i = n−1: full array is non-decreasing.`,
      '',
      '✓',
    ].join('\n'),
    { start: 17, end: 17 },
  );
}
