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
    `Input: [${arr.join(', ')}] — ${n} elements (bottom-up merge sort)`,
    { start: 1, end: 3 },
  );

  for (let size = 1; size < n; size *= 2) {
    yield createStep(
      'pass_start',
      { inputSequence, array: [...arr] },
      `Merge pass: subarrays of size ${size}`,
      { start: 4, end: 5 },
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
          `Compare ${left[i]} and ${right[j]} — take smaller into position ${k}`,
          { start: 13, end: 15 },
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
          `Placed ${arr[k - 1]} at index ${k - 1}`,
          { start: 16, end: 22 },
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
        `Merged run [${leftStart}..${rightEnd}]`,
        { start: 23, end: 25 },
        { variables: { leftStart, rightEnd } },
      );
    }
  }

  yield createStep(
    'done',
    { inputSequence, array: [...arr] },
    'Sort complete! ✓',
    { start: 27, end: 27 },
  );
}
