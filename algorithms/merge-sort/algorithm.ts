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
      `The array has ${n} elements. We sort a working copy called arr.`,
      '',
      `This is bottom-up merge sort. We use a width called size that starts at 1 and doubles each round (1, then 2, then 4, and so on) until it covers the whole array.`,
      '',
      `In each round we merge adjacent blocks. Each block is already sorted on its own. Merging two sorted blocks into one walk produces a longer sorted block.`,
    ].join('\n'),
    { start: 1, end: 5 },
  );

  for (let size = 1; size < n; size *= 2) {
    yield createStep(
      'pass_start',
      { inputSequence, array: [...arr] },
      [
        `This round uses block width ${size}. We step through the array and merge each pair of neighbor blocks that each have at most ${size} elements. The last block on the right may be shorter if the array length is not a multiple of the pair width.`,
        '',
        `For one merge we copy the left block into an array called left and the right block into right. The variable mid marks the last index of the left block, and rightEnd marks the last index of the right block.`,
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
            `We compare the front of the left list (${left[i]}) with the front of the right list (${right[j]}). The smaller one goes next into arr[${k}]. If they tie, we take from the left first so that equal items keep their original order.`,
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
            `We just wrote the next value at index ${k - 1}. Everything from index ${leftStart} up to ${k - 1} is now in order from smallest to largest among what we have merged so far.`,
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
          `This pair of blocks is fully merged. From index ${leftStart} through ${rightEnd}, the values are in sorted order. If one side ran out first, the rest of the other side was copied over unchanged.`,
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
      `Every round is done. The full array is now sorted from smallest to largest.`,
      '',
      '✓',
    ].join('\n'),
    { start: 31, end: 31 },
  );
}
