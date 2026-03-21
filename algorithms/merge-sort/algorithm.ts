import type { AlgorithmStep } from '@/app/lib/types';
import type { ArrayWithHighlightsData } from '@/components/visualization/BarArrayViz';
import { DEFAULT_INPUT } from '@/app/lib/default-input';

export type MergeSortData = ArrayWithHighlightsData;

export { DEFAULT_INPUT };

function createStep(
  id: string,
  data: MergeSortData,
  description: string,
  codeRange: { start: number; end: number },
  overrides?: Partial<AlgorithmStep<MergeSortData>>,
): AlgorithmStep<MergeSortData> {
  return { id, data, action: id, codeRange, description, ...overrides };
}

export function* mergeSortGenerator(
  input: number[] = DEFAULT_INPUT,
): Generator<AlgorithmStep<MergeSortData>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  const inputSequence = [...input];

  yield createStep(
    'init',
    { inputSequence, array: [...arr] },
    [
      `n = ${n}; arr is a copy of the input.`,
      '',
      `Bottom-up: size doubles 1, 2, 4, … Each pass merges adjacent sorted runs of length ≤ size (last run may be shorter).`,
      '',
      `Merge of two non-decreasing runs yields a non-decreasing run of length up to 2·size.`,
    ].join('\n'),
    { start: 1, end: 5 },
  );

  for (let size = 1; size < n; size *= 2) {
    yield createStep(
      'pass_start',
      { inputSequence, array: [...arr] },
      [
        `Pass with size = ${size}: merge pairs of sorted runs (right run may be shorter).`,
        '',
        `Left run arr[leftStart..mid], right arr[mid+1..rightEnd]; mid = leftStart+size−1, rightEnd = min(leftStart+2·size−1, n−1).`,
      ].join('\n'),
      { start: 5, end: 5 },
      { variables: { size } },
    );

    for (let leftStart = 0; leftStart < n - size; leftStart += 2 * size) {
      const mid = leftStart + size - 1;
      const rightEnd = Math.min(leftStart + 2 * size - 1, n - 1);

      const leftLen = mid - leftStart + 1;
      const rightLen = rightEnd - mid;
      const left: number[] = [];
      const right: number[] = [];
      for (let i = 0; i < leftLen; i++) left.push(arr[leftStart + i]!);
      for (let j = 0; j < rightLen; j++) right.push(arr[mid + 1 + j]!);

      let i = 0;
      let j = 0;
      let k = leftStart;

      while (i < leftLen && j < rightLen) {
        yield createStep(
          'compare',
          { inputSequence, array: [...arr], highlightIndices: [k] },
          [
            `Compare left[i] = ${left[i]} vs right[j] = ${right[j]}; ties take left (stable). Next k = ${k}.`,
          ].join('\n'),
          { start: 17, end: 17 },
          { variables: { i, j, k, left: left[i], right: right[j] } },
        );

        if (left[i]! <= right[j]!) {
          arr[k] = left[i]!;
          i++;
        } else {
          arr[k] = right[j]!;
          j++;
        }
        k++;
        yield createStep(
          'merge_place',
          { inputSequence, array: [...arr], highlightIndices: [k - 1] },
          [
            `arr[${k - 1}] is the next smallest; arr[leftStart..${k - 1}] is non-decreasing.`,
          ].join('\n'),
          { start: 17, end: 24 },
          { variables: { i, j, k } },
        );
      }

      while (i < leftLen) {
        arr[k] = left[i]!;
        i++;
        k++;
      }
      while (j < rightLen) {
        arr[k] = right[j]!;
        j++;
        k++;
      }

      yield createStep(
        'merge_done',
        { inputSequence, array: [...arr] },
        [
          `arr[${leftStart}..${rightEnd}] is sorted; leftovers (if any) were copied in order.`,
        ].join('\n'),
        { start: 27, end: 28 },
        { variables: { leftStart, rightEnd } },
      );
    }
  }

  yield createStep(
    'done',
    { inputSequence, array: [...arr] },
    [
      `All passes done: arr[0..n−1] is non-decreasing.`,
      '',
      '✓',
    ].join('\n'),
    { start: 31, end: 31 },
  );
}
