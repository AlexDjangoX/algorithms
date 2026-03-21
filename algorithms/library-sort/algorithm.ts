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
      `There are ${n} numbers to sort. This variant keeps them in a longer array S with room for gaps. Here ε is ${epsilon}, so the buffer length is sLen = ${sLen}. Every cell in S starts empty (shown as a gap). The input order is [${input.join(', ')}].`,
      '',
      `For each number we binary-search where it belongs inside a growing active prefix, slide values aside if that slot is full, and occasionally rebalance to spread gaps again. The steps you see follow this file exactly.`,
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
        `Round ${round}. We will insert up to ${goal} values in this round as long as values remain. The active prefix length len for searches is ${Math.min(sLen, (round === 1 ? 1 : Math.pow(2, round - 1)) * 2)} (capped by the buffer size).`,
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
          `The next value to insert is input[${pos}] = ${val}. All searches and shifts stay inside the first len cells of S for this round.`,
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
          `findInsertPosition chose index ${insPos}. Roughly speaking, binary search finds the right rank among nonempty cells, then the code skips forward across occupied cells to land on a gap. If the row is packed, it walks back left until it finds room.`,
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
              `The target cell was not empty, so we bubble the blocking value to the right by swapping neighbors. Each swap moves the gap one step until we free the slot we need.`,
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
          `We store ${val} at index ${insPos} and move on to the next input index.`,
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
        `Rebalancing spreads the occupied cells across a wider prefix. The previous active length was ${prevLen}; we redistribute into length ${newLen} using step size ${Math.floor(newLen / prevLen)}. A write pointer w starts at the far end of the new range. For each old index from right to left we copy the value forward into S[w] and leave a gap behind, then step w backward.`,
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
          `One step of the rebalance loop: copy from the old side toward the new positions and clear the gap that opens up. The variables panel shows the current indices.`,
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
      'All inputs are placed. Reading S from left to right and skipping empty cells gives the sorted output.',
      '',
      '✓',
    ].join('\n'),
    { start: 51, end: 51 },
  );
}
