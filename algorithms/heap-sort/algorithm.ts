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
    [
      `n = ${n}; arr is a copy of the input.`,
      '',
      `Max-heap on [0..heapSize−1]: parent i has children 2i+1, 2i+2; arr[i] ≥ children when in range (ties ok).`,
      '',
      `Build heap, then repeatedly swap root with arr[end] and siftDown(0, end) for end = n−1 … 1.`,
    ].join('\n'),
    { start: 1, end: 4 },
  );

  if (n <= 1) {
    yield createStep(
      'done',
      { inputSequence, array: [...arr] },
      [
        'If n ≤ 1, the array is trivially sorted in non-decreasing order.',
        '',
        '✓',
      ].join('\n'),
      { start: 1, end: 11 },
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
        [
          `siftDown(i = ${i}, heapSize = ${heapSize}); heap indices 0..${heapSize - 1}.`,
          '',
          `arr[${i}] = ${arr[i]!}; ${leftStr}; ${rightStr}.`,
          '',
          `largest = argmax of parent and existing children (strict >). If largest = i, done.`,
        ].join('\n'),
        { start: 23, end: 27 },
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
        [
          `Swap parent with largest child; continue siftDown from that child.`,
        ].join('\n'),
        { start: 29, end: 30 },
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
    [
      'Phase 1 — buildMaxHeap: siftDown(i, n) for i = ⌊n/2⌋−1 … 0.',
    ].join('\n'),
    { start: 13, end: 16 },
  );

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield createStep(
      'heap_build',
      {
        inputSequence,
        array: [...arr],
        highlightIndices: [i],
      },
      [
        `siftDown(${i}, ${n}): fix subtree at ${i} (children already heaps).`,
      ].join('\n'),
      { start: 15, end: 16 },
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
    [
      'Phase 2 — swap arr[0] with arr[end] (end = n−1 … 1); that value is final. Heap is [0..end−1]; siftDown(0, end).',
    ].join('\n'),
    { start: 5, end: 9 },
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
        [
        `Swap root with arr[${end}]; that value is the largest still in [0..${end}], so index ${end} is correct.`,
        '',
        `siftDown(0, ${end}) on [0..${end - 1}].`,
      ].join('\n'),
      { start: 7, end: 7 },
      { variables: { i: 0, j: end, 'arr[i]': arr[0]!, 'arr[j]': arr[end]! } },
    );

    yield* siftDown(0, end);
  }

  yield createStep(
    'done',
    { inputSequence, array: [...arr] },
    [
      'After n−1 extractions, arr[0] is the smallest remaining element; the array is sorted in non-decreasing order.',
      '',
      '✓',
    ].join('\n'),
    { start: 11, end: 11 },
  );
}
