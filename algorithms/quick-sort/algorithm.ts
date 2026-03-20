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
    `Input: [${arr.join(', ')}] — n = ${n}; quickSort(arr, 0, n - 1) with Lomuto partition`,
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
      `pivot = arr[${hi}] = ${pivotVal}; partition(arr, ${lo}, ${hi})`,
      { start: 15, end: 16 },
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
        `arr[${j}] <= pivot?  arr[${j}]=${arr[j]}, pivot=${pivotVal}`,
        { start: 17, end: 18 },
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
            `[arr[${i}], arr[${j}]] = [arr[${j}], arr[${i}]]; i++`,
            { start: 19, end: 20 },
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
        `place pivot: [arr[${i}], arr[${hi}]] = [arr[${hi}], arr[${i}]]; return ${i}`,
        { start: 23, end: 24 },
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
      `partition returns p = ${i}; arr[${i}] is in final position`,
      { start: 24, end: 24 },
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
      `sort(arr, ${lo}, ${hi})`,
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
        `lo >= hi /* ${lo}, ${hi} */ → return`,
        { start: 6, end: 8 },
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
      `sort(arr, ${lo}, ${p - 1}); sort(arr, ${p + 1}, ${hi})`,
      { start: 9, end: 11 },
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
    `done: arr = [${arr.join(', ')}]`,
    { start: 1, end: 2 },
  );
}
