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
      `The array has ${n} elements. We work on a copy called arr.`,
      '',
      `This is quicksort with Lomuto partitioning. We pick the last element of the current range as the pivot. After one partition pass, every value to the left of the pivot is less than or equal to it, and every value to the right is greater than or equal to it. The pivot itself ends up where it belongs for the final sorted order.`,
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
        `We partition the range from index ${lo} through ${hi}. The pivot is the value at the right end, arr[${hi}] = ${pivotVal}.`,
        '',
        `As j walks from ${lo} up to ${hi} - 1, we keep a boundary index i. Everything from ${lo} up to i - 1 is less than or equal to the pivot. Everything from i up to j - 1 is greater than the pivot.`,
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
          `If arr[${j}] is less than or equal to the pivot (${pivotVal}), we extend the “small side” by swapping that element into place and moving the boundary i forward.`,
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
              `We swap positions ${i} and ${j} so the smaller value joins the left group, then we advance i.`,
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
          `We swap the pivot into its final spot at index ${i}. Everything to the left is at most the pivot; everything to the right is at least the pivot.`,
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
        `The partition returns index ${i}. The pivot does not need to move again while we sort only the left part (${lo} through ${i - 1}) and the right part (${i + 1} through ${hi}) separately.`,
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
        `We are about to sort the subarray from index ${lo} through ${hi}.`,
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
          `If the left index has passed the right index, there is nothing to do. If they are equal, a single element is already sorted.`,
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
        `Next we sort the left segment from ${lo} to ${p - 1} and the right segment from ${p + 1} to ${hi}. After partitioning, every value in the left segment is less than or equal to the pivot at ${p}, and every value in the right segment is greater than or equal to the pivot.`,
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
      `Sorting is complete. The array reads from smallest to largest: [${arr.join(', ')}].`,
    ].join('\n'),
    { start: 1, end: 5 },
  );
}
