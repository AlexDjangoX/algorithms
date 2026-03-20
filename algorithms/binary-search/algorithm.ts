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

  yield createStep(
    'sort_init',
    {
      phase: 'sort',
      array: [...arr],
      target,
      highlightIndices: [],
      range: null,
    },
    `Phase 1: sort the array — binary search only works on sorted data`,
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
        array: [...arr],
        target,
        highlightIndices: highlights,
        range: null,
      },
      `Insert ${key}: shift and place at index ${from} (first ${i + 1} positions sorted)`,
      { start: 5, end: 9 },
      { variables: { i, key, placedAt: from } },
    );
  }

  yield createStep(
    'sort_complete',
    {
      phase: 'sort',
      array: [...arr],
      target,
      highlightIndices: [],
      range: null,
    },
    `Phase 1 done — sorted. Phase 2: binary search for target = ${target}`,
    { start: 11, end: 11 },
    { variables: { target, n } },
  );

  yield createStep(
    'search_intro',
    {
      phase: 'search',
      array: [...arr],
      target,
      highlightIndices: [],
      range: { lo: 0, hi: n - 1 },
    },
    `Phase 2: halve the range each step — lo = 0, hi = ${n - 1}`,
    { start: 13, end: 17 },
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
        array: [...arr],
        target,
        highlightIndices: [lo, mid, hi],
        range: { lo, hi, mid },
      },
      `lo = ${lo}, hi = ${hi}, mid = ${mid} → arr[${mid}] = ${midVal}`,
      { start: 17, end: 19 },
      { variables: { lo, hi, mid, midVal, target } },
    );

    if (midVal === target) {
      yield createStep(
        'done',
        {
          phase: 'search',
          array: [...arr],
          target,
          highlightIndices: [mid],
          range: { lo: mid, hi: mid, mid },
        },
        `Found at index ${mid}: arr[${mid}] === ${target} ✓`,
        { start: 19, end: 19 },
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
          array: [...arr],
          target,
          highlightIndices: [lo, hi],
          range: { lo, hi },
        },
        `${midVal} < ${target} → search right: lo = ${lo}`,
        { start: 20, end: 20 },
        { variables: { lo, hi, midVal, target } },
      );
    } else {
      hi = mid - 1;
      yield createStep(
        'go_left',
        {
          phase: 'search',
          array: [...arr],
          target,
          highlightIndices: [lo, hi],
          range: { lo, hi },
        },
        `${midVal} > ${target} → search left: hi = ${hi}`,
        { start: 21, end: 21 },
        { variables: { lo, hi, midVal, target } },
      );
    }
  }

  yield createStep(
    'done',
    {
      phase: 'search',
      array: [...arr],
      target,
      highlightIndices: [],
      range: null,
    },
    `Not found: ${target} is not in the array (return -1) ✗`,
    { start: 23, end: 23 },
    { variables: { result: -1, target } },
  );
}
