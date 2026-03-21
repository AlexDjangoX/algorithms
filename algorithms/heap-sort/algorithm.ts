import type { AlgorithmStep } from '@/app/lib/types';
import type { ArrayWithHighlightsData } from '@/components/visualization/BarArrayViz';
import { DEFAULT_INPUT } from '@/app/lib/default-input';

export type HeapSortData = ArrayWithHighlightsData;

export { DEFAULT_INPUT };

function createStep(
  id: string,
  data: HeapSortData,
  description: string,
  codeRange: { start: number; end: number },
  overrides?: Partial<AlgorithmStep<HeapSortData>>,
): AlgorithmStep<HeapSortData> {
  return { id, data, action: id, codeRange, description, ...overrides };
}

/**
 * In-place max-heap heap sort. Builds a max heap, then repeatedly swaps the
 * root with the heap tail and sifts down — ascending order in the full array.
 */
export function* heapSortGenerator(
  input: number[] = DEFAULT_INPUT,
): Generator<AlgorithmStep<HeapSortData>, void, undefined> {
  const arr = [...input];
  const n = arr.length;
  const inputSequence = [...input];

  yield createStep(
    'init',
    { inputSequence, array: [...arr] },
    `Input: [${arr.join(', ')}] — n = ${n}; max-heap, then extract max to the end`,
    { start: 1, end: 3 },
  );

  if (n <= 1) {
    yield createStep(
      'done',
      { inputSequence, array: [...arr] },
      'Sort complete! ✓',
      { start: 1, end: 7 },
    );
    return;
  }

  function* siftDown(
    start: number,
    heapSize: number,
  ): Generator<AlgorithmStep<HeapSortData>, void, undefined> {
    let i = start;
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let largest = i;
      if (l < heapSize && arr[l]! > arr[largest]!) largest = l;
      if (r < heapSize && arr[r]! > arr[largest]!) largest = r;

      const highlights = [i, l, r].filter((idx) => idx < heapSize);

      const leftStr =
        l < heapSize ? `arr[${l}]=${arr[l]}` : '(no left child)';
      const rightStr =
        r < heapSize ? `arr[${r}]=${arr[r]}` : '(no right child)';

      yield createStep(
        'heap_compare',
        {
          inputSequence,
          array: [...arr],
          highlightIndices: highlights,
        },
        `siftDown(heapSize=${heapSize}): arr[${i}]=${arr[i]}, ${leftStr}, ${rightStr} → largest = ${largest}`,
        { start: 16, end: 22 },
        {
          variables: {
            i,
            l,
            r,
            heapSize,
            parent: arr[i]!,
            other: arr[largest]!,
            parentIdx: i,
            largestIdx: largest,
          },
        },
      );

      if (largest === i) break;

      [arr[i], arr[largest]] = [arr[largest]!, arr[i]!];
      yield createStep(
        'swap',
        {
          inputSequence,
          array: [...arr],
          highlightIndices: [i, largest],
        },
        `[arr[${i}], arr[${largest}]] = [arr[${largest}], arr[${i}]]; continue sifting from index ${largest}`,
        { start: 23, end: 24 },
        {
          variables: {
            i,
            j: largest,
            'arr[i]': arr[i]!,
            'arr[j]': arr[largest]!,
          },
        },
      );
      i = largest;
    }
  }

  yield createStep(
    'heap_phase',
    {
      inputSequence,
      array: [...arr],
      highlightIndices: [],
    },
    'Phase 1: buildMaxHeap — sift down each non-leaf from bottom to top',
    { start: 10, end: 11 },
  );

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield createStep(
      'heap_build',
      {
        inputSequence,
        array: [...arr],
        highlightIndices: [i],
      },
      `buildMaxHeap: siftDown(arr, ${i}, ${n})`,
      { start: 11, end: 12 },
      { variables: { i, n } },
    );
    yield* siftDown(i, n);
  }

  yield createStep(
    'heap_phase',
    {
      inputSequence,
      array: [...arr],
      highlightIndices: [0],
    },
    'Phase 2: repeatedly swap root with heap tail, then siftDown(arr, 0, end)',
    { start: 4, end: 6 },
  );

  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end]!, arr[0]!];
    yield createStep(
      'swap',
      {
        inputSequence,
        array: [...arr],
        highlightIndices: [0, end],
      },
      `extract max: [arr[0], arr[${end}]] = [arr[${end}], arr[0]] — ${arr[end]} in final position`,
      { start: 5, end: 5 },
      { variables: { i: 0, j: end, 'arr[i]': arr[0]!, 'arr[j]': arr[end]! } },
    );

    yield* siftDown(0, end);
  }

  yield createStep(
    'done',
    { inputSequence, array: [...arr] },
    'Sort complete! ✓',
    { start: 7, end: 7 },
  );
}
