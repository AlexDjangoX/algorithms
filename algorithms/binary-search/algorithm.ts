import type { AlgorithmStep } from '@/app/lib/types';
import type { ArrayWithHighlightsData } from '@/components/visualization/BarArrayViz';
import { DEFAULT_INPUT } from '@/app/lib/default-input';

export type BinarySearchPhase = 'sort' | 'search';

export type BinarySearchData = ArrayWithHighlightsData & {
  phase: BinarySearchPhase;
  /** Value we search for after sorting (shown during sort as “then find …”). */
  target: number;
  /**
   * Active range for connector lines (lo/mid/hi) — search phase only.
   */
  range?: { lo: number; hi: number; mid?: number } | null;
};

export const BINARY_SEARCH_SLICE_LEN = 18;

/** Unsorted input — phase 1 sorts this with insertion sort. */
export const BINARY_SEARCH_UNSORTED = DEFAULT_INPUT.slice(0, BINARY_SEARCH_SLICE_LEN);

const SORTED_FOR_TARGET = [...BINARY_SEARCH_UNSORTED].sort((a, b) => a - b);

/** Target guaranteed present after sorting. */
export const BINARY_SEARCH_TARGET =
  SORTED_FOR_TARGET[Math.floor(SORTED_FOR_TARGET.length / 2)]!;

/** Sorted reference slice (same keys as unsorted). */
export const BINARY_SEARCH_ARRAY = SORTED_FOR_TARGET;

function createStep(
  id: string,
  data: BinarySearchData,
  description: string,
  codeRange: { start: number; end: number },
  overrides?: Partial<AlgorithmStep<BinarySearchData>>,
): AlgorithmStep<BinarySearchData> {
  return { id, data, action: id, codeRange, description, ...overrides };
}

export function* binarySearchGenerator(
  unsorted: number[] = BINARY_SEARCH_UNSORTED,
  target: number = BINARY_SEARCH_TARGET,
): Generator<AlgorithmStep<BinarySearchData>, void, unknown> {
  const arr = [...unsorted];
  const n = arr.length;
  const inputSequence = [...unsorted];

  yield createStep(
    'sort_init',
    {
      phase: 'sort',
      inputSequence,
      array: [...arr],
      target,
      highlightIndices: [],
      range: null,
    },
    [
      `Phase 1 — insertion sort (${n} elements) until arr is non-decreasing.`,
      '',
      `Phase 2 target (present in this demo): ${target}.`,
    ].join('\n'),
    { start: 1, end: 3 },
    { variables: { n, target } },
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

    yield createStep(
      'sort_step',
      {
        phase: 'sort',
        inputSequence,
        array: [...arr],
        target,
        highlightIndices: highlights,
        range: null,
      },
      (from === i
        ? [
            `Insert i = ${i}: key = ${key} already in place; arr[0..i] sorted.`,
          ]
        : [
            `Insert i = ${i}: key = ${key} placed at ${from}; arr[0..i] sorted.`,
          ]
      ).join('\n'),
      { start: 6, end: 10 },
      { variables: { i, key, placedAt: from } },
    );
  }

  yield createStep(
    'sort_complete',
    {
      phase: 'sort',
      inputSequence,
      array: [...arr],
      target,
      highlightIndices: [],
      range: null,
    },
    [
      `Array is sorted; binary search applies.`,
      '',
      `Search for target = ${target}.`,
    ].join('\n'),
    { start: 12, end: 12 },
    { variables: { target, n } },
  );

  yield createStep(
    'search_intro',
    {
      phase: 'search',
      inputSequence,
      array: [...arr],
      target,
      highlightIndices: [],
      range: { lo: 0, hi: n - 1 },
    },
    [
      `lo = 0, hi = ${n - 1}. If target exists, it lies in arr[lo..hi].`,
    ].join('\n'),
    { start: 14, end: 19 },
    { variables: { target, lo: 0, hi: n - 1 } },
  );

  let lo = 0;
  let hi = n - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midVal = arr[mid]!;

    yield createStep(
      'compare',
      {
        phase: 'search',
        inputSequence,
        array: [...arr],
        target,
        highlightIndices: [lo, mid, hi],
        range: { lo, hi, mid },
      },
      [
        `mid = ⌊(lo + hi)/2⌋ = ${mid}; arr[mid] = ${midVal}.`,
      ].join('\n'),
      { start: 19, end: 21 },
      { variables: { lo, hi, mid, midVal, target } },
    );

    if (midVal === target) {
      yield createStep(
        'done',
        {
          phase: 'search',
          inputSequence,
          array: [...arr],
          target,
          highlightIndices: [mid],
          range: { lo: mid, hi: mid, mid },
        },
        [
          `Found: return index ${mid}.`,
        ].join('\n'),
        { start: 21, end: 21 },
        { variables: { result: mid, target } },
      );
      return;
    }

    if (midVal < target) {
      lo = mid + 1;
      yield createStep(
        'go_right',
        {
          phase: 'search',
          inputSequence,
          array: [...arr],
          target,
          highlightIndices: [lo, hi],
          range: { lo, hi },
        },
        [
          `arr[mid] < target → target is right of mid. lo ← ${lo}.`,
        ].join('\n'),
        { start: 22, end: 22 },
        { variables: { lo, hi, midVal, target } },
      );
    } else {
      hi = mid - 1;
      yield createStep(
        'go_left',
        {
          phase: 'search',
          inputSequence,
          array: [...arr],
          target,
          highlightIndices: [lo, hi],
          range: { lo, hi },
        },
        [
          `arr[mid] > target → target is left of mid. hi ← ${hi}.`,
        ].join('\n'),
        { start: 23, end: 23 },
        { variables: { lo, hi, midVal, target } },
      );
    }
  }

  yield createStep(
    'done',
    {
      phase: 'search',
      inputSequence,
      array: [...arr],
      target,
      highlightIndices: [],
      range: null,
    },
    [
      `lo > hi: target not in arr. Return −1.`,
    ].join('\n'),
    { start: 25, end: 25 },
    { variables: { result: -1, target } },
  );
}
