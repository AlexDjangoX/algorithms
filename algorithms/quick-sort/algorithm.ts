import type { AlgorithmStep } from '@/app/lib/types';
import type { ArrayWithHighlightsData } from '@/components/visualization/BarArrayViz';
import { DEFAULT_INPUT } from '@/app/lib/default-input';

export type QuickSortData = ArrayWithHighlightsData;

export { DEFAULT_INPUT };

function createStep(
  id: string,
  data: QuickSortData,
  description: string,
  codeRange: { start: number; end: number },
  overrides?: Partial<AlgorithmStep<QuickSortData>>,
): AlgorithmStep<QuickSortData> {
  return { id, data, action: id, codeRange, description, ...overrides };
}

/**
 * Lomuto partition quicksort — recursive sort with explicit compare / swap steps.
 */
export function* quickSortGenerator(
  input: number[] = DEFAULT_INPUT,
): Generator<AlgorithmStep<QuickSortData>, void, undefined> {
  const arr = [...input];
  const n = arr.length;
  const inputSequence = [...input];

  yield createStep(
    'init',
    { inputSequence, array: [...arr] },
    [
      `n = ${n}; arr is a copy of the input.`,
      '',
      `Lomuto: pivot = arr[hi]. After partition, arr[lo..p−1] ≤ arr[p] ≤ arr[p+1..hi]; pivot stays fixed for this subproblem.`,
    ].join('\n'),
    { start: 1, end: 2 },
  );

  function* partition(
    lo: number,
    hi: number,
  ): Generator<AlgorithmStep<QuickSortData>, number, undefined> {
    const pivotVal = arr[hi]!;
    yield createStep(
      'pivot',
      {
        inputSequence,
        array: [...arr],
        highlightIndices: [hi],
      },
      [
        `Partition [${lo}..${hi}]; pivot = arr[${hi}] = ${pivotVal}.`,
        '',
        `[lo..i−1] ≤ pivot; [i..j−1] > pivot (for j moving lo..hi−1).`,
      ].join('\n'),
      { start: 17, end: 19 },
      { variables: { lo, hi, pivot: pivotVal } },
    );

    let i = lo;
    for (let j = lo; j < hi; j++) {
      yield createStep(
        'compare',
        {
          inputSequence,
          array: [...arr],
          highlightIndices: [j, hi],
        },
        [
          `If arr[${j}] ≤ ${pivotVal}, swap into the ≤ region and grow i.`,
        ].join('\n'),
        { start: 22, end: 22 },
        {
          variables: {
            j,
            i,
            'arr[j]': arr[j]!,
            pivot: pivotVal,
          },
        },
      );

      if (arr[j]! <= pivotVal) {
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j]!, arr[i]!];
          yield createStep(
            'swap',
            {
              inputSequence,
              array: [...arr],
              highlightIndices: [i, j],
            },
            [
              `Swap arr[${i}] and arr[${j}] to extend the ≤ region; then i increases.`,
            ].join('\n'),
            { start: 23, end: 24 },
            { variables: { i, j, 'arr[i]': arr[i]!, 'arr[j]': arr[j]! } },
          );
        }
        i++;
      }
    }

    if (i !== hi) {
      [arr[i], arr[hi]] = [arr[hi]!, arr[i]!];
      yield createStep(
        'swap',
        {
          inputSequence,
          array: [...arr],
          highlightIndices: [i, hi],
        },
        [
          `Swap pivot into place: arr[${i}] = pivot; left ≤ pivot, right ≥ pivot.`,
        ].join('\n'),
        { start: 27, end: 27 },
        { variables: { i, hi, pivotIndex: i } },
      );
    }

    yield createStep(
      'partition_done',
      {
        inputSequence,
        array: [...arr],
        highlightIndices: [i],
      },
      [
        `p = ${i}: pivot is final for [${lo}..${hi}]; recurse left and right only.`,
      ].join('\n'),
      { start: 28, end: 28 },
      { variables: { p: i, lo, hi } },
    );

    return i;
  }

  function* sort(
    lo: number,
    hi: number,
  ): Generator<AlgorithmStep<QuickSortData>, void, undefined> {
    yield createStep(
      'sort_enter',
      {
        inputSequence,
        array: [...arr],
        highlightIndices: lo <= hi ? [lo, hi] : [],
      },
      [
        `Recursive call on subarray indices [${lo}..${hi}].`,
      ].join('\n'),
      { start: 5, end: 6 },
      { variables: { lo, hi } },
    );

    if (lo >= hi) {
      yield createStep(
        'sort_base',
        {
          inputSequence,
          array: [...arr],
          highlightIndices: lo === hi ? [lo] : [],
        },
        [
          `If lo ≥ hi, the subarray has at most one element; it is already sorted.`,
        ].join('\n'),
        { start: 7, end: 8 },
        { variables: { lo, hi } },
      );
      return;
    }

    const p = yield* partition(lo, hi);

    yield createStep(
      'recurse',
      {
        inputSequence,
        array: [...arr],
        highlightIndices: [p],
      },
      [
        `Recursively sort arr[${lo}..${p - 1}] and arr[${p + 1}..${hi}]. By the partition result, every key in arr[${lo}..${p - 1}] is ≤ arr[${p}], and every key in arr[${p + 1}..${hi}] is ≥ arr[${p}].`,
      ].join('\n'),
      { start: 12, end: 13 },
      { variables: { p, lo, hi } },
    );

    yield* sort(lo, p - 1);
    yield* sort(p + 1, hi);
  }

  if (n > 0) {
    yield* sort(0, n - 1);
  }

  yield createStep(
    'done',
    { inputSequence, array: [...arr] },
    [
      `Done: arr is non-decreasing — [${arr.join(', ')}].`,
    ].join('\n'),
    { start: 1, end: 5 },
  );
}
