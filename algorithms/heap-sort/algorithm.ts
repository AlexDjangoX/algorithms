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
      `The array has ${n} elements. We sort in place on a copy called arr.`,
      '',
      `We treat the array as a binary tree stored in row order: for index i, the left child is at 2i+1 and the right child is at 2i+2 when those indices exist. In a max-heap, every parent is greater than or equal to its children (equal values are allowed).`,
      '',
      `The algorithm has two phases. First we turn the whole array into a max-heap. Then we repeatedly move the largest element (always at index 0) to the end of the unsorted part and fix the heap on what remains.`,
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
          `We are fixing the heap starting at index ${i}. Only indices 0 through ${heapSize - 1} count as part of the heap right now.`,
          '',
          `At this node, arr[${i}] is ${arr[i]!}. ${leftStr}. ${rightStr}.`,
          '',
          `We compare the parent with its left and right children when they exist. The comparisons use strict greater-than, so if there is a tie the parent wins. If the parent already holds the largest of the three, we stop here.`,
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
          `A child holds a larger value than the parent, so we swap the parent down with that child. We then repeat the same check at the child position until the heap rule holds there.`,
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
      'Phase 1 is building the heap. We call sift-down on every node that has children, starting from the last parent and moving toward the root. By the end, the array satisfies the max-heap property.',
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
        `We sift down from index ${i} while the heap size is ${n}. The subtrees below ${i} are already valid heaps; this step restores the rule at ${i}.`,
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
      'Phase 2 is extracting the maximum repeatedly. The largest unsorted value always sits at index 0. We swap it with the last position of the current heap, which fixes that value in sorted order. Then we shrink the heap and sift down from the root.',
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
        `We swap the root with the element at index ${end}. Everything still in the heap from 0 through ${end} was part of the heap before the swap, and the old root was the largest among them, so ${end} is now the correct position for that value in the final sorted array.`,
        '',
        `The heap now only uses indices 0 through ${end - 1}. We sift down from the root to restore the max-heap on that smaller range.`,
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
      'After the last extraction, only one value is left at index 0. The array is now sorted from smallest to largest.',
      '',
      '✓',
    ].join('\n'),
    { start: 11, end: 11 },
  );
}
