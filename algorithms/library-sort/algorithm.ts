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
    [
      `n = ${n}, ε = ${epsilon}, sLen = ⌈(1 + ε)n⌉ = ${sLen}. S[0..sLen−1] starts as nulls (gaps). Input: [${input.join(', ')}].`,
      '',
      `Each value is placed via binary search on a prefix of length len, with right-shifts if needed; rounds end with a rebalance that spreads gaps. Narrative matches this code only.`,
    ].join('\n'),
    { start: 1, end: 7 },
  );

  let pos = 0;
  let goal = 1;
  let round = 0;

  while (pos < n) {
    round++;

    yield createStep(
      'round_start',
      { array: S.map((x) => x), input: [...input] },
      [
        `Round ${round}: up to goal = ${goal} inserts while pos < n. len = min(sLen, (round === 1 ? 1 : 2^(round−1))·2) = ${Math.min(sLen, (round === 1 ? 1 : Math.pow(2, round - 1)) * 2)}.`,
      ].join('\n'),
      { start: 13, end: 15 },
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
        [
          `Next key: val = input[${pos}] = ${val}. Search and insert use only indices [0..len−1] of S with len as computed above.`,
        ].join('\n'),
        { start: 17, end: 18 },
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
        [
          `insPos = ${insPos} from findInsertPosition: binary search on non-null keys, skip forward through gaps, then walk right for a free slot (or backtrack left if full).`,
        ].join('\n'),
        { start: 20, end: 20 },
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
            [
              `S[insPos] was occupied; exchange S[${j - 1}] and S[${j}] (j increases from insPos) until some index holds null.`,
            ].join('\n'),
            { start: 24, end: 25 },
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
        [
          `Assign S[${insPos}] ← ${val}; increment pos.`,
        ].join('\n'),
        { start: 30, end: 31 },
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
      [
        `Rebalance: prevLen = ${prevLen}, newLen = ${newLen}, step = ⌊newLen/prevLen⌋ = ${Math.floor(newLen / prevLen)}; w starts at newLen−1. For j = prevLen−1 … 0: move S[j] → S[w], clear S[w−1] if needed, w -= step.`,
      ].join('\n'),
      { start: 34, end: 41 },
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
        [
          `Inner rebalance iteration j = ${prevLen - 1 - stepNum + 1}: one step of the loop above (see variables).`,
        ].join('\n'),
        { start: 42, end: 45 },
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
    [
      'Termination: pos = n. Output is the subsequence of S in index order omitting null (filter in code).',
      '',
      '✓',
    ].join('\n'),
    { start: 51, end: 51 },
  );
}
