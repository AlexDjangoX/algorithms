import type { AlgorithmStep } from '@/app/lib/types';
import { DEFAULT_INPUT } from '@/app/lib/default-input';

export interface LibrarySortData {
  array: (number | null)[];
  input: number[];
  activeIndex?: number;
  insertingValue?: number;
}

export { DEFAULT_INPUT };

function binarySearchPos(
  val: number,
  S: (number | null)[],
  len: number,
): number {
  let lo = 0;
  let hi = len - 1;
  while (lo <= hi) {
    const origMid = Math.floor((lo + hi) / 2);
    let mid = origMid;
    while (mid < len && S[mid] === null) mid++;
    if (mid >= len) {
      hi = origMid - 1;
    } else if (S[mid]! < val) {
      lo = mid + 1;
    } else {
      hi = origMid - 1;
    }
  }
  return lo;
}

function findInsertPosition(
  val: number,
  S: (number | null)[],
  len: number,
): number {
  let pos = binarySearchPos(val, S, len);
  while (pos < len && S[pos] !== null) pos++;
  if (pos < len) return pos;
  pos = binarySearchPos(val, S, len) - 1;
  while (pos >= 0 && S[pos] !== null) pos--;
  return Math.max(0, pos);
}

function createStep(
  id: string,
  data: LibrarySortData,
  description: string,
  codeRange: { start: number; end: number },
  overrides?: Partial<AlgorithmStep<LibrarySortData>>,
): AlgorithmStep<LibrarySortData> {
  return { id, data, action: id, codeRange, description, ...overrides };
}

export function* librarySortGenerator(
  input: number[] = DEFAULT_INPUT,
): Generator<AlgorithmStep<LibrarySortData>, void, unknown> {
  const n = input.length;
  const epsilon = 0.5;
  const sLen = Math.ceil((1 + epsilon) * n);
  const S: (number | null)[] = Array(sLen).fill(null);

  // First step: show input bars (S is empty — all bars rendered at input positions)
  yield createStep(
    'init_input',
    { array: [...S], input: [...input] },
    `Input: [${input.join(', ')}] — ${n} elements to sort`,
    { start: 1, end: 2 },
  );

  let pos = 0;
  let goal = 1;
  let round = 0;

  while (pos < n) {
    round++;

    yield createStep(
      'round_start',
      { array: S.map((x) => x), input: [...input] },
      `Round ${round}: inserting up to ${goal} element(s)`,
      { start: 10, end: 12 },
      { variables: { round, goal, pos } },
    );

    for (let i = 0; i < goal && pos < n; i++) {
      const val = input[pos];
      const len = Math.min(
        sLen,
        (round === 1 ? 1 : Math.pow(2, round - 1)) * 2,
      );

      yield createStep(
        'pick_value',
        { array: S.map((x) => x), input: [...input], insertingValue: val },
        `Pick next element: ${val}`,
        { start: 13, end: 15 },
        { variables: { val, pos, round } },
      );

      const insPos = findInsertPosition(val, S, len);

      yield createStep(
        'binary_search',
        {
          array: S.map((x) => x),
          input: [...input],
          activeIndex: insPos,
          insertingValue: val,
        },
        `Binary search: insert ${val} at position ${insPos}`,
        { start: 17, end: 17 },
        { variables: { val, insPos, pos }, highlights: [insPos] },
      );

      if (S[insPos] !== null) {
        let j = insPos;
        while (j < sLen - 1 && S[j] !== null) {
          [S[j], S[j + 1]] = [S[j + 1], S[j]];
          j++;
          yield createStep(
            'shift',
            {
              array: S.map((x) => x),
              input: [...input],
              activeIndex: j,
              insertingValue: val,
            },
            `Shift right to make room for ${val}`,
            { start: 19, end: 24 },
            { variables: { val, insPos, j }, highlights: [j, j - 1] },
          );
        }
      }

      S[insPos] = val;
      pos++;

      yield createStep(
        'insert',
        {
          array: S.map((x) => x),
          input: [...input],
          activeIndex: insPos,
          insertingValue: val,
        },
        `Inserted ${val} at position ${insPos}`,
        { start: 26, end: 28 },
        { variables: { val, insPos, pos }, highlights: [insPos] },
      );
    }

    if (pos >= n) break;

    const prevLen = Math.min(sLen, goal * 2);
    const newLen = Math.min(sLen, goal * 4);
    let w = newLen - 1;
    const step = Math.floor(newLen / prevLen);

    yield createStep(
      'rebalance_start',
      { array: S.map((x) => x), input: [...input] },
      'Rebalance: spread elements with fresh gaps',
      { start: 32, end: 34 },
      { variables: { prevLen, newLen, goal } },
    );

    for (let j = prevLen - 1; j >= 0; j--) {
      if (w < S.length) S[w] = S[j];
      if (w > 0) S[w - 1] = null;
      w -= step;
      const stepNum = prevLen - 1 - j + 1;
      yield createStep(
        'rebalance',
        { array: S.map((x) => x), input: [...input] },
        `Spreading elements to restore gaps (${stepNum}/${prevLen})`,
        { start: 36, end: 40 },
        { variables: { prevLen, newLen, j, stepNum } },
      );
    }

    for (let k = 0; k < w; k++) {
      if (S[k] === undefined) S[k] = null;
    }

    goal *= 2;
  }

  yield createStep(
    'done',
    { array: S.map((x) => x), input: [...input] },
    'Sort complete! ✓',
    { start: 43, end: 43 },
  );
}
